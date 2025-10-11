import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Enhanced CORS (include allowed methods for stricter browsers)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // Basic request log
  console.log('[delete-account] Incoming request', { method: req.method, url: req.url });

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    // Prefer PUBLISHABLE_KEY but fall back to ANON_KEY if not set
    const anonKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error('[delete-account] Missing config', { hasUrl: !!supabaseUrl, hasAnon: !!anonKey, hasSrv: !!serviceRoleKey });
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('[delete-account] Missing Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Client acting as the user (uses the caller's JWT)
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Admin client for privileged operations
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Identify the current user
    const { data: { user }, error: getUserError } = await supabaseUser.auth.getUser();
    if (getUserError || !user) {
      console.error('[delete-account] getUser failed', getUserError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: invalid or expired token', details: getUserError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.log('[delete-account] Authenticated user', { userId: user.id, email: user.email });

    // 1) Delete all app data via secured RPC (runs under SECURITY DEFINER)
    const { error: rpcError } = await supabaseUser.rpc('delete_user_account');
    if (rpcError) {
      console.error('[delete-account] RPC delete_user_account error', rpcError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete user data', details: rpcError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.log('[delete-account] App data deleted for user', user.id);

    // 2) Delete the auth user (revokes refresh tokens and prevents re-login)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error('[delete-account] Admin deleteUser error', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete auth user', details: deleteError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.log('[delete-account] Auth user deleted', user.id);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[delete-account] Unhandled error', err);
    return new Response(
      JSON.stringify({ error: 'Internal error', details: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
