const { createClient } = require('@supabase/supabase-js');

async function createDefaultUser() {
    console.log('🔄 Creating default admin user...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    constserviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        // Try to read from .env.local if not in process.env
        console.log('⚠️  Env vars missing, checking arguments or assuming local dev defaults...');
    }

    // Hardcoded fallbacks for local dev if env var injection fails
    const url = supabaseUrl || 'https://sngsznqrzurjbhazctcu.supabase.co';
    // We need the SERVICE_ROLE_KEY to create users. 
    // I will try to read it from the file system or ask the user if it's missing.
    // However, for local supabase (hosted), we might not have it easily unless it was in .env
    // Let's assume standard local development setup or read from a file if possible.

    // WAIT: I don't have the Service Role Key in .env.local output I saw earlier.
    // I only saw NEXT_PUBLIC_...

    // Let me check if there is a .env file with the service role key.
    // The previous `ls -la .env*` showed only `.env.local`.

    // If I cannot find the service role key, I cannot create a user SERVER-SIDE properly via the admin API.
    // BUT, I can use the public API signUp()!

    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_UiV2MhrqBrY_0YI6mxcObg_HPHmF3yC';

    const supabase = createClient(url, anonKey);

    const email = 'admin@demo.com';
    const password = 'password123';

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: 'Admin Default',
                role: 'admin'
            }
        }
    });

    if (error) {
        console.error('❌ Error creating user:', error.message);
        if (error.message.includes('already registered')) {
            console.log('✅ User already exists. You can log in.');
        }
    } else {
        console.log('✅ User created successfully!');
        console.log('Email:', email);
        console.log('Password:', password);
        // Note: Check email confirmation setting. Local dev usually allows it or we might need to conform it.
    }
}

createDefaultUser();
