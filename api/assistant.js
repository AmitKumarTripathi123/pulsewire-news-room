const DEFAULT_GEMINI_SUMMARY_KEY = "AIzaSyDNCpoeEN_yja2L1eFLtjMJPZ6vIRqAbdA";

module.exports = async (req, res) => {
  try {
    const body = typeof req.body === "object" ? req.body : JSON.parse(req.body || "{}");
    const { query, articles } = body;
    if (!query || !Array.isArray(articles)) {
      return res.status(400).json({ success: false, error: "Missing query or articles." });
    }

    const apiKey = process.env.GEMINI_API_KEY || DEFAULT_GEMINI_SUMMARY_KEY;
    const model = process.env.GEMINI_MODEL || "models/gemini-3.1-flash-lite-preview";

    const prompt = `You are a helpful AI news assistant. The user is asking for specific news: "${query}". 
Here is a JSON list of recent news articles:
${JSON.stringify(articles)}

Your task is to:
1. Identify the 'id' of the articles that are highly relevant to the user's query.
2. Generate a short multiple-choice quiz of exactly 5 questions based ONLY on the facts present in the matching articles to test the user's understanding.
   - For each question, provide 4 options, and the exact string of the correct option as 'answer'.

Return ONLY a valid JSON object matching this schema (do not include markdown formatting or extra text):
{
  "articleIds": ["id1", "id2"],
  "quiz": [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "answer": "A"
    }
  ]
}
If no articles match, return {"articleIds": [], "quiz": []}.
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
    const cleanText = rawText.replace(/^```json\n?/, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleanText);

    return res.status(200).json({ success: true, ...parsed });
  } catch (error) {
    console.error("Assistant Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};
