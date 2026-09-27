const DEFAULT_GEMINI_SUMMARY_KEY = "AIzaSyDNCpoeEN_yja2L1eFLtjMJPZ6vIRqAbdA";

module.exports = async (req, res) => {
  try {
    const body = typeof req.body === "object" ? req.body : JSON.parse(req.body || "{}");
    const { query } = body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Missing query field." });
    }

    const claim = query.trim();
    const apiKey = process.env.GEMINI_API_KEY || DEFAULT_GEMINI_SUMMARY_KEY;
    const model = "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const prompt = `You are a rigorous, world-class fact-checker. Carefully analyze the following claim using your knowledge. Provide a structured JSON response.

Claim: "${claim}"

Respond ONLY with valid JSON in this exact format (no markdown, no code fences, no extra text):
{
  "verdict": "True" or "False" or "Partially True" or "Unverifiable",
  "confidence": "High" or "Medium" or "Low",
  "explanation": "A detailed 2-3 sentence explanation of why this verdict was reached, citing reasoning and known facts.",
  "key_facts": ["fact 1", "fact 2", "fact 3"]
}`;

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1024 }
      })
    });

    const geminiData = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error("Gemini API error:", JSON.stringify(geminiData));
      return res.status(500).json({ error: geminiData?.error?.message || "Gemini API request failed." });
    }

    const raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleaned = raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      return res.status(200).json({
        success: true,
        results: [{
          claim,
          verdict: "Analysis complete",
          explanation: cleaned || "The AI returned a non-structured response.",
          source: "Gemini 2.5 Flash",
          confidence: "Medium",
          type: "ai_verified"
        }]
      });
    }

    let keyFactsHtml = "";
    if (parsed.key_facts && parsed.key_facts.length > 0) {
      keyFactsHtml = " Key facts: " + parsed.key_facts.join("; ") + ".";
    }

    return res.status(200).json({
      success: true,
      results: [{
        claim,
        verdict: parsed.verdict || "Analysis complete",
        explanation: (parsed.explanation || "") + keyFactsHtml,
        source: "Gemini 2.5 Flash",
        url: "",
        confidence: parsed.confidence || "Medium",
        type: "ai_verified"
      }]
    });
  } catch (err) {
    console.error("Fact-check error:", err.message);
    return res.status(500).json({ error: err.message || "Something went wrong." });
  }
};
