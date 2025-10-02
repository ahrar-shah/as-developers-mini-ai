import cohere from 'cohere-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.COHERE_API_KEY) {
    return res.status(500).json({ error: 'Missing Cohere API Key. Please set COHERE_API_KEY in environment.' });
  }

  try {
    cohere.init(process.env.COHERE_API_KEY);

    const { messages } = req.body;
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
      prompt,
      max_tokens: 200,
      temperature: 0.6,
      k: 0,
      stop_sequences: ['User:', 'Assistant:']
    });

    const output = response.body.generations?.[0]?.text?.trim();
    if (!output) {
      return res.status(500).json({ error: 'Cohere did not return any text' });
    }

    return res.status(200).json({ text: output });
  } catch (err) {
    console.error('Cohere API Error:', err);
    return res.status(500).json({ error: 'Server error while generating response' });
  }
}
