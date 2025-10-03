import { cohere } from "@/lib/cohere";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await cohere.generate({
      model: "command-r",   // ✅ try "command-r" or "command-r-plus"
      prompt: message,
      max_tokens: 300,
    });

    const text = response.generations?.[0]?.text?.trim() || null;

    if (!text) {
      return res.status(500).json({ error: "Empty response from Cohere" });
    }

    return res.status(200).json({ text });
  } catch (err) {
    console.error("Chat API error:", err);
    return res.status(500).json({ error: "Chat failed" });
  }
}
