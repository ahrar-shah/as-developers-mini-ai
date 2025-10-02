// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client (for browser-safe calls)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server helper (for server-side requests needing service role)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);
