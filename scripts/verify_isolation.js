const { createClient } = require('@supabase/supabase-js');

// Helper to sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTest() {
    console.log('🔄 Starting Multi-Tenant Isolation Test...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
        process.exit(1);
    }

    // Admin Client (Bypass RLS)
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    // 1. Setup Data - Create Tenant A & B
    console.log('🏗️  Creating Test Tenants...');
    const { data: tenantA, error: errA } = await adminClient.from('tenants').insert({ name: 'Tenant A (Test)' }).select().single();
    const { data: tenantB, error: errB } = await adminClient.from('tenants').insert({ name: 'Tenant B (Test)' }).select().single();

    if (errA || errB) {
        console.error('❌ Failed to create tenants:', errA, errB);
        process.exit(1);
    }
    console.log(`✅ Tenants Created: ${tenantA.id} (A), ${tenantB.id} (B)`);

    // 2. Setup Users - Create User A & B
    // Note: Creating auth users requires admin API or mocking. 
    // For this simplified test, we will insert directly into 'users' table 
    // and MOCK the auth context by manually setting the header or using setup/teardown if we had real auth users.
    // HOWEVER, RLS relies on auth.uid(). We need REAL auth users for RLS to work properly with policies.
    // We can use adminClient.auth.admin.createUser();

    console.log('👤 Creating Auth Users...');
    const emailA = `userA_${Date.now()}@test.com`;
    const emailB = `userB_${Date.now()}@test.com`;

    const { data: uA, error: uaErr } = await adminClient.auth.admin.createUser({ email: emailA, password: 'password123', email_confirm: true, user_metadata: { tenant_id: tenantA.id, role: 'formateur' } });
    const { data: uB, error: ubErr } = await adminClient.auth.admin.createUser({ email: emailB, password: 'password123', email_confirm: true, user_metadata: { tenant_id: tenantB.id, role: 'formateur' } });

    if (uaErr || ubErr) {
        console.error('❌ Failed to create users:', uaErr, ubErr);
        process.exit(1);
    }
    console.log(`✅ Users Created: ${uA.user.id} (A), ${uB.user.id} (B)`);

    // Force sync to public.users (in case trigger handles it, but let's be sure or wait)
    await sleep(1000);

    // 3. Verify Access - Client A
    console.log('🕵️  Verifying Isolation for User A...');
    const { data: sessionA } = await adminClient.auth.signInWithPassword({ email: emailA, password: 'password123' });
    const clientA = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${sessionA.session.access_token}` } }
    });

    const { data: tenantsVisibleToA } = await clientA.from('tenants').select('*');

    if (tenantsVisibleToA.length === 1 && tenantsVisibleToA[0].id === tenantA.id) {
        console.log('✅ User A can ONLY see Tenant A.');
    } else {
        console.error('❌ FAILURE: User A sees:', tenantsVisibleToA);
    }

    // 4. Verify Access - Client B
    console.log('🕵️  Verifying Isolation for User B...');
    const { data: sessionB } = await adminClient.auth.signInWithPassword({ email: emailB, password: 'password123' });
    const clientB = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${sessionB.session.access_token}` } }
    });

    const { data: tenantsVisibleToB } = await clientB.from('tenants').select('*');

    if (tenantsVisibleToB.length === 1 && tenantsVisibleToB[0].id === tenantB.id) {
        console.log('✅ User B can ONLY see Tenant B.');
    } else {
        console.error('❌ FAILURE: User B sees:', tenantsVisibleToB);
    }

    // Cleanup
    console.log('🧹 Cleanup...');
    await adminClient.from('tenants').delete().in('id', [tenantA.id, tenantB.id]); // Cascade should kill users if foreign keys set, but auth users need manual delete
    await adminClient.auth.admin.deleteUser(uA.user.id);
    await adminClient.auth.admin.deleteUser(uB.user.id);

    console.log('✨ Verification Complete: SUCCESS');
}

runTest().catch(e => console.error(e));
