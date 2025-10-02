import cohere from 'cohere-ai';

cohere.init(process.env.COHERE_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages } = req.body; // messages: [{role: 'user'|'assistant', content: '...'}]

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages (array) is required' });
    }

    const system = `You are a helpful AI assistant. Keep answers concise and friendly.`;

    const conversation = messages.map(m => {
      const role = m.role === 'user' ? 'User' : 'Assistant';
      return `${role}: ${m.content}`;
    }).join('\n');

    const prompt = `${system}\n\nConversation:\n${conversation}\nAssistant:`;

    const response = await cohere.generate({
      model: 'command-xlarge-nightly',
      prompt: prompt,
      max_tokens: 200,
      temperature: 0.6,
      k: 0,
      stop_sequences: ['User:', 'Assistant:']
    });

    const text = response.body.generations[0].text.trim();

    return res.status(200).json({ text });
  } catch (err) {
    console.error('Cohere error', err);
    return res.status(500).json({ error: 'Generation failed' });
  }
}
