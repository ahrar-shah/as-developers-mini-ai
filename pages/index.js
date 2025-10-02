import { useState, useRef } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Salaam! Main aapki AI assistant hoon. Kuch poochna hai?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const send = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const resp = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.slice(-10) }) // last 10 msgs
      });

      const data = await resp.json();
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Maaf — kuch galat ho gaya.' }]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'Inter, sans-serif' }}>
      <header>
        <h1 style={{ textAlign: 'center' }}>{process.env.NEXT_PUBLIC_APP_NAME || 'Cohere Chat'}</h1>
      </header>

      <main style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, minHeight: 400 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
              <div style={{
                background: m.role === 'user' ? '#111827' : '#f3f4f6',
                color: m.role === 'user' ? 'white' : 'black',
                padding: '10px 14px',
                borderRadius: 8
              }}>
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </main>

      <footer style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <textarea
          rows={2}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={loading ? 'Generating...' : 'Type your message and press Enter'}
          style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
          disabled={loading}
        />
        <button onClick={send} disabled={loading} style={{ padding: '8px 14px', borderRadius: 6 }}>
          {loading ? '...' : 'Send'}
        </button>
      </footer>

      <p style={{ marginTop: 12, fontSize: 12, color: '#6b7280' }}>
        Tip: Press Enter to send. This is minimal — customize UX, add auth, rate limits, etc.
      </p>
    </div>
  );
}
