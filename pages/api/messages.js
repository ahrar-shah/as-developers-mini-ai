// pages/api/messages.js
import { parseTokenFromReq, verifyToken } from '../../lib/auth';
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  const token = parseTokenFromReq(req);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });

  const userId = payload.userId;

  if (req.method === 'GET') {
    const limit = parseInt(req.query.limit || '200', 10);
    try {
      const { data, error } = await supabaseAdmin
        .from('messages')
        .select('id, role, content, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return res.status(200).json({ messages: data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  if (req.method === 'POST') {
    const { role, content } = req.body;
    if (!role || !content) return res.status(400).json({ error: 'role and content required' });

    try {
      const { data, error } = await supabaseAdmin
        .from('messages')
        .insert([{ user_id: userId, role, content }])
        .select('*')
        .single();

      if (error) throw error;
      return res.status(201).json({ message: data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to save message' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
