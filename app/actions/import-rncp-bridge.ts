'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchRNCPBasicInfo } from "@/lib/rncp-api";
import db from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// 1. Step 1: Fetch API
export async function fetchRNCPAction(rncpCode: string) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Non connecté" };

    return await fetchRNCPBasicInfo(rncpCode);
}

// 2. Step 2: Enrich with AI (The Bridge Script)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function enrichRNCPAction(apiData: any) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Non connecté" };

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
    En tant qu'expert en ingénierie pédagogique pour l'apprentissage, transforme ces données brutes de France Compétences en un référentiel de compétences structuré.

    DONNÉES BRUTES :
    Titre : ${apiData.title}
    Code : ${apiData.id_national}
    Blocs bruts : ${JSON.stringify(apiData.raw_blocks).slice(0, 25000)} 

    CONSIGNES :
    1. Identifie chaque "Bloc de compétences".
    2. Pour chaque bloc, liste les "Compétences" associées.
    3. POUR CHAQUE COMPÉTENCE : Génère exactement 3 "Indicateurs Observables". 
       Un indicateur doit être une action concrète que le tuteur en entreprise peut observer (ex: "L'apprenti utilise le logiciel X pour...", "Le document produit respecte la norme Y...").
    
    FORMAT DE RÉPONSE ATTENDU (JSON STRICT) :
    {
      "blocks": [
        {
          "title": "Nom du Bloc",
          "code": "Uxx",
          "competencies": [
            {
              "description": "Libellé de la compétence",
              "indicators": [
                "Indicateur 1",
                "Indicateur 2",
                "Indicateur 3"
              ]
            }
          ]
        }
      ]
    }
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Nettoyage de la réponse
        const cleanJson = text.replace(/```json|```/g, "").trim();
        const structuredData = JSON.parse(cleanJson);

        return { success: true, data: structuredData };

    } catch (error) {
        console.error("Erreur Bridge AI:", error);
        return { success: false, error: "Échec de la structuration pédagogique par l'IA." };
    }
}

// 3. Step 3: Save to DB
export async function saveRNCPAction(rncpCode: string, title: string, structuredData: any) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Non connecté" };

    const currentUser = await db.user.findUnique({ where: { id: session.user.id } });
    if (!currentUser) return { success: false, error: "Utilisateur inconnu" };

    let targetTenantId: string | undefined;
    let isGlobal = false;

    if (currentUser.role === 'super_admin') {
        isGlobal = true; // Default to global for Super Admin in this workflow, or we could ask. Assuming Global for "Bridge" usually.
        // Or make it tenant specific if they have one? Let's stick to the previous pattern: 
        // If super admin has a tenantId set, use it? Or just make it global?
        // Let's assume Global for Super Admin to populate Marketplace.
    } else if (currentUser.role === 'admin') {
        if (!currentUser.tenantId) return { success: false, error: "Admin sans tenant" };
        targetTenantId = currentUser.tenantId;
    } else {
        return { success: false, error: "Permission refusée" };
    }

    try {
        await db.$transaction(async (tx) => {
            // Upsert Referentiel
            const referentiel = await tx.referentiel.upsert({
                where: {
                    id: (await tx.referentiel.findFirst({
                        where: { tenantId: targetTenantId, codeRncp: rncpCode }
                    }))?.id || 'new-id'
                },
                update: { title: title },
                create: {
                    tenantId: targetTenantId,
                    isGlobal: isGlobal,
                    codeRncp: rncpCode,
                    title: title
                }
            });

            // Process Blocs
            for (const bloc of structuredData.blocks) {
                const blocDb = await tx.blocCompetence.upsert({
                    where: {
                        id: (await tx.blocCompetence.findFirst({
                            where: { referentielId: referentiel.id, title: bloc.title }
                        }))?.id || 'new-id'
                    },
                    update: {},
                    create: {
                        tenantId: targetTenantId,
                        referentielId: referentiel.id,
                        title: bloc.title,
                        // orderIndex could be added if available in AI output
                    }
                });

                // Process Competencies
                for (const comp of bloc.competencies) {
                    const compDb = await tx.competence.upsert({
                        where: {
                            id: (await tx.competence.findFirst({
                                where: { blocId: blocDb.id, description: comp.description }
                            }))?.id || 'new-id'
                        },
                        update: { description: comp.description },
                        create: {
                            tenantId: targetTenantId,
                            blocId: blocDb.id,
                            description: comp.description
                        }
                    });

                    // Process Indicators
                    if (comp.indicators && comp.indicators.length > 0) {
                        for (const indLabel of comp.indicators) {
                            const existingInd = await tx.indicateur.findFirst({
                                where: { competenceId: compDb.id, description: indLabel }
                            });

                            if (!existingInd) {
                                await tx.indicateur.create({
                                    data: {
                                        competenceId: compDb.id,
                                        description: indLabel
                                    }
                                });
                            }
                        }
                    }
                }
            }
        });

        revalidatePath('/admin/import');
        return { success: true, message: `Référentiel ${rncpCode} importé avec succès` };

    } catch (e: any) {
        console.error("Save Error:", e);
        return { success: false, error: "Erreur lors de la sauvegarde en base de données" };
    }
}
