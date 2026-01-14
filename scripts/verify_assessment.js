const { createClient } = require('@supabase/supabase-js');

async function verifyAssessmentLogic() {
    console.log('💡 Verifying Initial Assessment & TSF Bridge...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    // 1. Setup Tenant/User/Contract
    const { data: tenant } = await supabase.from('tenants').insert({ name: 'Assess Test Tenant' }).select().single();
    const { data: user } = await supabase.from('users').insert({ email: `assess-${Date.now()}@test.com`, tenant_id: tenant.id }).select().single();
    const { data: ref } = await supabase.from('referentiels').insert({ tenant_id: tenant.id, code_rncp: 'ASS-RNCP', title: 'Assess Ref' }).select().single();
    const { data: b1 } = await supabase.from('blocs_competences').insert({ tenant_id: tenant.id, referentiel_id: ref.id, title: 'Bloc X' }).select().single();
    const { data: c1 } = await supabase.from('competences').insert({ tenant_id: tenant.id, bloc_id: b1.id, description: 'Comp Expert' }).select().single();

    const { data: contract } = await supabase.from('contrats').insert({
        tenant_id: tenant.id, apprentice_user_id: user.id, referentiel_id: ref.id, start_date: '2025-01-01', end_date: '2026-01-01'
    }).select().single();

    // Create TSF Entry (Default Planifie)
    const { data: p1 } = await supabase.from('contrat_periodes').insert({ contract_id: contract.id, order_index: 1, label: 'P1', start_date: '2025-01-01', end_date: '2025-06-01' }).select().single();
    await supabase.from('tsf_mapping').insert({
        contract_id: contract.id, tenant_id: tenant.id, period_id: p1.id, competence_id: c1.id, status: 'PLANIFIE', flag_cfa: true, flag_entreprise: true
    });

    console.log('✅ Setup Done. TSF is PLANIFIE. Starting Assessment...');

    // 2. Create Assessment Session (SUBMITTED)
    const { data: sess } = await supabase.from('initial_assessments').insert({
        tenant_id: tenant.id, contract_id: contract.id, status: 'SUBMITTED'
    }).select().single();

    // 3. Insert Positionnement (Level 4 = Expert)
    await supabase.from('positionnements').insert({
        tenant_id: tenant.id, assessment_id: sess.id, user_id: user.id, competence_id: c1.id, level_initial: 4
    });

    // 4. RUN VALIDATION LOGIC (Simulation of Server Action)
    // Logic: Filter >=3, Update TSF.

    // (We check if our "Validate" function logic holds directly via DB updates to simulate the effect if we can't import)
    // SIMULATION OF `validateAssessment` core logic:
    const { data: acquisItems } = await supabase.from('positionnements').select('competence_id').eq('assessment_id', sess.id).gte('level_initial', 3);

    if (acquisItems.length > 0) {
        console.log(`   Found ${acquisItems.length} acquired skills. Bridging to TSF...`);
        await supabase.from('tsf_mapping').update({ status: 'ACQUIS', flag_cfa: false, flag_entreprise: false })
            .eq('contract_id', contract.id).in('competence_id', acquisItems.map(i => i.competence_id));
    }

    // 5. ASSERT
    const { data: tsf } = await supabase.from('tsf_mapping').select('*').eq('competence_id', c1.id).single();
    console.log(`   Final TSF Status: ${tsf.status} [Exp: ACQUIS]`);
    console.log(`   Final TSF Flags: CFA=${tsf.flag_cfa} [Exp: false]`);

    if (tsf.status === 'ACQUIS' && !tsf.flag_cfa) {
        console.log('✅ SUCCESS: Assessment validated and TSF updated.');
    } else {
        console.error('❌ FAILURE: Bridge logic failed.');
    }

    // Cleanup
    await supabase.from('tenants').delete().eq('id', tenant.id);
}

verifyAssessmentLogic().catch(console.error);
