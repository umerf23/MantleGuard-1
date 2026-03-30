// Vercel Serverless Function — POST /api/audit
// Requires OPENAI_API_KEY environment variable set in Vercel dashboard

export const config = { maxDuration: 30 };

const SYSTEM_PROMPT = `You are MantleGuard, an expert Solidity smart contract security auditor specialized in the Mantle blockchain ecosystem.
Analyze the given Solidity contract for security vulnerabilities, gas optimizations, and Mantle-specific considerations.

You MUST respond with valid JSON only, no markdown, no explanation outside JSON. Use this exact schema:

{
  "contractName": "string (extracted from contract keyword)",
  "overallRisk": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SAFE",
  "score": number (0-100, higher is safer),
  "summary": "string (2-3 sentence executive summary)",
  "findings": [
    {
      "id": "GUARD-001",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO",
      "title": "string",
      "description": "string",
      "line": "string (optional)",
      "recommendation": "string"
    }
  ],
  "gasOptimizations": ["string"],
  "mantleCompatibility": {
    "compatible": true,
    "notes": ["string"]
  }
}

Rules:
- Score: 100 = perfect, deduct 30-40 for CRITICAL, 15-25 for HIGH, 8-12 for MEDIUM, 3-5 for LOW
- Check for: reentrancy, tx.origin auth, overflow, unchecked calls, access control, selfdestruct, delegatecall
- Include at least 2-3 gas tips specific to Mantle L2
- Mention Mantle chainId 5000, MNT token, L2 gas advantages in compatibility notes`;

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { code, contractAddress } = req.body || {};

  if (!code || code.trim().length < 10) {
    return res.status(400).json({ error: "Contract code is required." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "AI service not configured. Set OPENAI_API_KEY in Vercel environment variables." });
  }

  try {
    const userPrompt = `Audit this Solidity smart contract${contractAddress ? ` at ${contractAddress}` : ""}:\n\n\`\`\`solidity\n${code.slice(0, 8000)}\n\`\`\``;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 3000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      return res.status(502).json({ error: "AI service error. Please try again." });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    const parsed = JSON.parse(content);
    const auditHash = "0x" + Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");

    return res.status(200).json({
      ...parsed,
      contractAddress,
      auditedAt: new Date().toISOString(),
      auditHash,
      aiPowered: true,
    });
  } catch (err) {
    console.error("Audit error:", err?.message);
    return res.status(500).json({ error: "Audit failed. Please try again." });
  }
}
