import Groq from "groq-sdk";

let groqClient: Groq | null = null;

function getClient(): Groq {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

export async function generateWithGroq(prompt: string): Promise<string> {
  const client = getClient();

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 600,
    temperature: 0.9,
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("Groq returned empty response");
  return text;
}
