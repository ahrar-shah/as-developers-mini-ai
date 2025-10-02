// pages/api/user.js
import { parseTokenFromReq, verifyToken } from '../../lib/auth';
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  const token = parseTokenFromReq(req);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });

  try {
    const { data } = await supabaseAdmin
      .from('users')
      .select('id, email, name, created_at')
      .eq('id', payload.userId)
      .limit(1)
      .single();

    return res.status(200).json({ user: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
}
