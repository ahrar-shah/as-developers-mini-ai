import { cohere } from "@/lib/cohere";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Call Cohere
    const response = await cohere.generate({
      model: "command-xlarge-nightly",
      prompt: message,
      max_tokens: 200,
    });

    const text = response.generations?.[0]?.text || null;

    if (!text) {
      return res.status(500).json({ error: "Empty response from Cohere" });
    }

    return res.status(200).json({ text });
  } catch (err) {
    console.error("Cohere API error:", err);
    return res.status(500).json({ error: "Failed to generate response" });
  }
}


