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
    Niveau : ${apiData.level}
    Blocs bruts : ${JSON.stringify(apiData.raw_blocks).slice(0, 25000)} 

    CONSIGNES :
    1. Identifie chaque "Bloc de compétences".
    2. Pour chaque bloc, liste les "Compétences" associées.
    3. POUR CHAQUE COMPÉTENCE : Génére exactement 3 "Indicateurs Observables". 
       Un indicateur doit être une action concrète que le tuteur en entreprise peut observer (ex: "L'apprenti utilise le logiciel X pour...", "Le document produit respecte la norme Y...").
    
    FORMAT DE RÉPONSE ATTENDU (JSON STRICT) :
    {
      "code_rncp": "${apiData.id_national}",
      "title": "${apiData.title}",
      "certificationLevel": "${apiData.level}",
      "blocs": [
        {
          "title": "Nom du Bloc",
          "competences": [
            {
              "description": "Libellé de la compétence",
              "indicateurs": [
                { "label": "Indicateur 1" },
                { "label": "Indicateur 2" },
                { "label": "Indicateur 3" }
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
import { saveReferentielToDb, RNCPSchema } from "./rncp-utils";

export async function saveRNCPAction(rncpCode: string, title: string, structuredData: any) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Non connecté" };

    const currentUser = await db.user.findUnique({ where: { id: session.user.id } });
    if (!currentUser) return { success: false, error: "Utilisateur inconnu" };

    let targetTenantId: string | undefined;
    let isGlobal = false;

    if (currentUser.role === 'super_admin') {
        isGlobal = true;
    } else if (currentUser.role === 'admin') {
        if (!currentUser.tenantId) return { success: false, error: "Admin sans tenant" };
        targetTenantId = currentUser.tenantId;
    } else {
        return { success: false, error: "Permission refusée" };
    }

    try {
        // Validate with schema first
        const validatedData = RNCPSchema.parse(structuredData);

        await saveReferentielToDb(validatedData, targetTenantId, isGlobal);

        revalidatePath('/admin/import');
        return { success: true, message: `Référentiel ${rncpCode} importé avec succès` };

    } catch (e: any) {
        console.error("Save Error:", e);
        return { success: false, error: "Erreur lors de la sauvegarde en base de données : " + e.message };
    }
}

