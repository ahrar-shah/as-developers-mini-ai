import { createClient } from "@supabase/supabase-js";

// Service Role client (full access) – use ONLY in server-side code (API routes)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
