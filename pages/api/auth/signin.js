// pages/api/auth/signin.js
import { supabaseAdmin } from '../../../lib/supabase';
import bcrypt from 'bcryptjs';
import { signToken, setTokenCookie } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1)
      .single();

    if (error || !data) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, data.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken({ userId: data.id, email: data.email }, { expiresIn: '30d' });
    setTokenCookie(res, token);

    return res.status(200).json({ user: { id: data.id, email: data.email, name: data.name } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Signin failed' });
  }
}
