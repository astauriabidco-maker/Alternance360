const { createClient } = require('@supabase/supabase-js');

async function verifyRNCPImport() {
    console.log('🔄 Starting RNCP Import Verification...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error('❌ Missing Env Vars');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    // 1. Setup Tenant
    const { data: tenant } = await supabase.from('tenants').insert({ name: 'RNCP Test Tenant' }).select().single();
    console.log(`✅ Test Tenant: ${tenant.id}`);

    // 2. Mock RNCP Data
    const mockRNCP = {
        code_rncp: `TEST-${Date.now()}`,
        title: "Titre Test Développeur",
        blocs: [
            {
                title: "Bloc 1 - Backend",
                competences: [
                    { description: "Créer une API", code: "C1.1", indicateurs: [{ label: "Code propre" }, { label: "Tests unitaires" }] },
                    { description: "Gérer la BDD", code: "C1.2", indicateurs: [] }
                ]
            }
        ]
    };

    console.log('📤 Simulating Import...');

    // NOTE: We are intentionally duplicating the Logic of the Server Action here 
    // because we cannot easily invoke a Server Action from a pure Node script without a running Next.js context.
    // In a real CI/CD, we would use Jest/Playwright against the running app.
    // Here we verify the *Schema* capability and *Relationships*.

    const { data: ref } = await supabase.from('referentiels').insert({
        tenant_id: tenant.id,
        code_rncp: mockRNCP.code_rncp,
        title: mockRNCP.title
    }).select().single();

    const { data: bloc } = await supabase.from('blocs_competences').insert({
        tenant_id: tenant.id,
        referentiel_id: ref.id,
        title: mockRNCP.blocs[0].title
    }).select().single();

    for (const comp of mockRNCP.blocs[0].competences) {
        const { data: c } = await supabase.from('competences').insert({
            tenant_id: tenant.id,
            bloc_id: bloc.id,
            description: comp.description,
            code: comp.code
        }).select().single();

        if (comp.indicateurs.length) {
            await supabase.from('indicateurs').insert(
                comp.indicateurs.map(i => ({ tenant_id: tenant.id, competence_id: c.id, label: i.label }))
            );
        }
    }

    // 3. Verification Assertions
    console.log('🕵️‍♀️ Verifying Data Integrity...');

    const { count: refCount } = await supabase.from('referentiels').select('*', { count: 'exact' }).eq('id', ref.id);
    const { count: blocCount } = await supabase.from('blocs_competences').select('*', { count: 'exact' }).eq('referentiel_id', ref.id);
    const { count: compCount } = await supabase.from('competences').select('*', { count: 'exact' }).eq('bloc_id', bloc.id);
    // Get all Competence IDs to check indicators
    const { data: comps } = await supabase.from('competences').select('id').eq('bloc_id', bloc.id);
    const { count: indCount } = await supabase.from('indicateurs').select('*', { count: 'exact' }).in('competence_id', comps.map(c => c.id));

    console.log(`   Referentiels: ${refCount} (Expected: 1)`);
    console.log(`   Blocs:        ${blocCount} (Expected: 1)`);
    console.log(`   Competences:  ${compCount} (Expected: 2)`);
    console.log(`   Indicateurs:  ${indCount} (Expected: 2)`);

    if (refCount === 1 && blocCount === 1 && compCount === 2 && indCount === 2) {
        console.log('✅ SUCCESS: Data Structure is Integrity Verified.');
    } else {
        console.error('❌ FAILURE: Counts do not match expectations.');
        process.exit(1);
    }

    // Cleanup
    console.log('🧹 Cleanup Test Data...');
    await supabase.from('tenants').delete().eq('id', tenant.id);

}

verifyRNCPImport().catch(console.error);
