// pages/api/auth/signup.js
import { supabaseAdmin } from '../../../lib/supabase';
import bcrypt from 'bcryptjs';
import { signToken, setTokenCookie } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    // check existing
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (existing?.length) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{ email, password_hash, name }])
      .select('*')
      .single();

    if (error) throw error;

    const token = signToken({ userId: data.id, email: data.email }, { expiresIn: '30d' });
    setTokenCookie(res, token);

    return res.status(201).json({ user: { id: data.id, email: data.email, name: data.name } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Signup failed' });
  }
}




// Error Checking

const { data, error } = await supabaseAdmin
  .from('users')
  .insert([{ email, password_hash: hash, name }])
  .select();

if (error) {
  console.error("Signup error:", error);
  return res.status(400).json({ error: error.message });
}

