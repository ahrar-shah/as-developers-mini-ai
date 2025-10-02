// pages/api/generate.js
import cohere from 'cohere-ai';
import { parseTokenFromReq, verifyToken } from '../../lib/auth';
import { supabaseAdmin } from '../../lib/supabase';

cohere.init(process.env.COHERE_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = parseTokenFromReq(req);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });

  const userId = payload.userId;
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'message is required' });

  try {
    // Save user message
    await supabaseAdmin.from('messages').insert([{ user_id: userId, role: 'user', content: message }]);

    // Build prompt from user's last N messages (server-side) to provide context
    // fetch last 10 messages
    const { data: history } = await supabaseAdmin
      .from('messages')
      .select('role, content')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(30);

    const system = `You are a helpful assistant. Keep answers fairly short and friendly.`;
    const conversation = (history || []).map(h => {
      const roleLabel = h.role === 'user' ? 'User' : 'Assistant';
      return `${roleLabel}: ${h.content}`;
    }).join('\n');

    const prompt = `${system}\n\nConversation:\n${conversation}\nAssistant:`;

    const response = await cohere.generate({
      model: 'command-xlarge-nightly',
      prompt,
      max_tokens: 250,
      temperature: 0.6,
      k: 0,
      stop_sequences: ['User:', 'Assistant:']
    });

    const text = response.body.generations?.[0]?.text?.trim() || 'Sorry, I could not generate a response.';

    // Save assistant reply
    await supabaseAdmin.from('messages').insert([{ user_id: userId, role: 'assistant', content: text }]);

    return res.status(200).json({ text });
  } catch (err) {
    console.error('generate error', err);
    return res.status(500).json({ error: 'Generation failed' });
  }
}

