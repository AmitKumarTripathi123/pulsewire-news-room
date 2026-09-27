const express = require("express");
const path = require("path");
const fsSync = require("fs");

const app = express();

const CACHE_MS = 5 * 60 * 1000;
const cache = new Map();
const insightCache = new Map();

const ALLOWED_FEED_HOSTS = new Set([
  "feeds.bbci.co.uk",
  "rss.nytimes.com",
  "feeds.npr.org",
  "www.espn.com",
  "www.theverge.com",
  "techcrunch.com",
  "www.aljazeera.com",
  "www.sciencedaily.com",
  "www.thehindu.com",
  "timesofindia.indiatimes.com",
  "feeds.feedburner.com",
  "www.hindustantimes.com",
  "indianexpress.com",
  "www.indianexpress.com",
  "ndtvnews.feedburner.com"
]);

const DEFAULT_GEMINI_SUMMARY_KEY = "AIzaSyDNCpoeEN_yja2L1eFLtjMJPZ6vIRqAbdA";
const DEFAULT_GEMINI_CONTEXT_KEY = "AIzaSyDNCpoeEN_yja2L1eFLtjMJPZ6vIRqAbdA";

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname));

function validateFeedUrl(rawUrl) {
  if (!rawUrl) throw new Error("Missing feed URL.");
  let feedUrl;
  try { feedUrl = new URL(rawUrl); } catch { throw new Error("Invalid feed URL."); }
  if (!["http:", "https:"].includes(feedUrl.protocol)) throw new Error("Only HTTP and HTTPS feeds are supported.");
  if (!ALLOWED_FEED_HOSTS.has(feedUrl.hostname)) throw new Error("This feed host is not on the allowlist.");
  return feedUrl;
}

async function fetchFeed(feedUrl) {
  const cacheKey = feedUrl.href;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.body;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8500);
  try {
    const response = await fetch(feedUrl, {
      signal: controller.signal,
      headers: {
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
        "User-Agent": "PulsewireNewsRoom/1.0"
      }
    });
    if (!response.ok) throw new Error(`Feed responded with ${response.status}.`);
    const body = await response.text();
    cache.set(cacheKey, { body, expiresAt: Date.now() + CACHE_MS });
    return body;
  } finally {
    clearTimeout(timeout);
  }
}

app.get("/api/feed", async (req, res) => {
  try {
    const rawUrl = req.query.url;
    const feedUrl = validateFeedUrl(rawUrl);
    const body = await fetchFeed(feedUrl);
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300");
    res.status(200).send(body);
  } catch (error) {
    res.status(400).json({ error: error.message || "Unable to fetch feed." });
  }
});

app.post("/api/fact-check", async (req, res) => {
  try {
    const { query } = req.body || {};
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

    res.status(200).json({
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
    res.status(500).json({ error: err.message || "Something went wrong." });
  }
});

function normalizeArticle(rawArticle = {}) {
  const article = {
    title: String(rawArticle.title || "").trim().slice(0, 280),
    description: String(rawArticle.description || "").trim().slice(0, 1200),
    source: String(rawArticle.source || "Unknown source").trim().slice(0, 80),
    topicLabel: String(rawArticle.topicLabel || "News").trim().slice(0, 60),
    publishedAt: String(rawArticle.publishedAt || "").trim().slice(0, 60),
    link: String(rawArticle.link || "").trim().slice(0, 500)
  };

  if (!article.title) throw new Error("Article title is required.");
  return article;
}

function insightPrompt(mode, article) {
  const sourceText = [
    `Headline: ${article.title}`,
    `Description: ${article.description || "No short description provided."}`,
    `Source: ${article.source}`,
    `Topic: ${article.topicLabel}`,
    `Published: ${article.publishedAt || "Unknown"}`,
    `Article URL: ${article.link || "Not provided"}`
  ].join("\n");

  if (mode === "summary") {
    return [
      "Write a clear news summary in 50 to 70 words.",
      "Use only the supplied headline and description. Do not invent names, dates, numbers, or claims.",
      "Keep it useful for a general reader.",
      "",
      sourceText
    ].join("\n");
  }

  return [
    "Write a news context brief of exactly 100 to 150 words using your background knowledge and the article metadata below.",
    "Structure the brief in three clearly labelled sections:",
    "",
    "Past: Summarise the key historical events, policies, conflicts, or market forces that led to this story. Include relevant institutions, people, or prior decisions.",
    "Present: Describe what is happening right now — the core development, who is involved, and what triggered this news moment.",
    "Future: Outline what is likely to happen next — expected responses, decisions, legislation, negotiations, or trends to watch. Where outcomes are uncertain say so clearly.",
    "",
    "Rules:",
    "- Total word count must be between 100 and 150 words (count strictly).",
    "- Do not invent precise dates, quotes, statistics, or allegations not supported by the metadata.",
    "- Write in plain, neutral language suitable for a general reader.",
    "- Do not use bullet points; write in full prose sentences under each section label.",
    "",
    sourceText
  ].join("\n");
}

function extractGeminiText(payload) {
  return payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}

async function askGemini(mode, article) {
  const defaultKey = mode === "summary" ? DEFAULT_GEMINI_SUMMARY_KEY : DEFAULT_GEMINI_CONTEXT_KEY;
  const envKey = mode === "summary" ? process.env.GEMINI_SUMMARY_KEY : process.env.GEMINI_CONTEXT_KEY;
  const apiKey = envKey || process.env.GEMINI_API_KEY || defaultKey;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");

  const model = process.env.GEMINI_MODEL || "models/gemini-2.5-flash-lite";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{
          text: mode === "context"
            ? "You are a precise news context analyst. Write structured briefs covering past background, present developments, and future outlook. Always stay within the word limit. Use neutral, factual language and do not invent details not supported by the supplied metadata."
            : "You are a careful news assistant. Be concise, neutral, and do not add unsupported facts."
        }]
      },
      contents: [{ role: "user", parts: [{ text: insightPrompt(mode, article) }] }],
      generationConfig: { maxOutputTokens: 1000, temperature: 0.25 }
    })
  });

  if (!response.ok) {
    let detail = "";
    try {
      const errorPayload = await response.json();
      detail = errorPayload?.error?.message ? ` ${errorPayload.error.message}` : "";
    } catch { detail = ""; }
    throw new Error(`AI service responded with ${response.status}.${detail}`);
  }

  return extractGeminiText(await response.json());
}

function fitWordWindow(text, minWords, maxWords) {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const fillers = {
    1: "More.", 2: "More soon.", 3: "More details follow.", 4: "More verified details follow.",
    5: "More verified updates may follow.", 6: "More verified updates may clarify impact.",
    7: "More verified updates may clarify the impact.", 8: "More verified updates may clarify the wider impact.",
    9: "More verified updates may clarify the wider public impact.", 10: "More verified updates may clarify the wider public impact soon."
  };
  while (words.length < minWords) {
    const gap = Math.min(10, minWords - words.length);
    words.push(...fillers[gap].split(" "));
  }
  let finalWords = words;
  if (finalWords.length > maxWords) {
    const clipped = finalWords.slice(0, maxWords);
    const sentenceEnd = clipped.findLastIndex((word, index) => index >= minWords - 1 && /[.!?]$/.test(word));
    finalWords = sentenceEnd >= minWords - 1 ? clipped.slice(0, sentenceEnd + 1) : clipped;
  }
  const sentence = finalWords.join(" ").replace(/[,:;]$/, "");
  return /[.!?]$/.test(sentence) ? sentence : `${sentence}.`;
}

function compactWords(text, maxWords) {
  return text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean).slice(0, maxWords).join(" ");
}

function withoutTerminalPunctuation(text) {
  return text.replace(/[.!?]+$/, "");
}

function localInsight(mode, article) {
  const description = article.description || "The available feed gives a headline but only limited supporting detail.";
  if (mode === "summary") {
    const headline = withoutTerminalPunctuation(compactWords(article.title, 18));
    const detail = withoutTerminalPunctuation(compactWords(description, 24));
    return fitWordWindow(
      `This ${article.topicLabel.toLowerCase()} story from ${article.source} reports ${headline}. ${detail}. It highlights the latest development, why it matters now, and what readers should watch as verified updates clarify the impact.`,
      50, 70
    );
  }
  const ctx = `Present development: ${article.title}. ${description} Past background: the feed does not include a full history, so place this item within the wider ${article.topicLabel.toLowerCase()} cycle and mention likely relevant institutions, policy, or market forces. Why it matters now: explain the immediate stakes in a sentence. What to watch next: official responses, further reporting, and data that would clarify the impact.`;
  return fitWordWindow(ctx, 100, 100);
}

async function generateInsight(mode, article) {
  const cacheKey = `${mode}:${article.source}:${article.title}`;
  const cached = insightCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.payload;

  let payload = { text: localInsight(mode, article), provider: "local" };
  try {
    const geminiText = await askGemini(mode, article);
    if (geminiText) payload = { text: geminiText, provider: "gemini" };
  } catch (error) {
    console.warn(`AI fallback used: ${error.message}`);
    payload = {
      text: mode === "context" ? `Context could not be generated right now. ${error.message}` : localInsight(mode, article),
      provider: "gemini-error"
    };
  }
  insightCache.set(cacheKey, { payload, expiresAt: Date.now() + CACHE_MS });
  return payload;
}

app.post("/api/insight", async (req, res) => {
  try {
    const payload = req.body || {};
    const mode = payload.mode === "context" ? "context" : "summary";
    const article = normalizeArticle(payload.article);
    const insight = await generateInsight(mode, article);
    res.status(200).json({ mode, ...insight });
  } catch (error) {
    res.status(400).json({ error: error.message || "Unable to create insight." });
  }
});

app.post("/api/assistant", async (req, res) => {
  try {
    const { query, articles } = req.body || {};
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

    res.status(200).json({ success: true, ...parsed });
  } catch (error) {
    console.error("Assistant Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use((req, res) => {
  const publicIndex = path.join(__dirname, "public", "index.html");
  if (fsSync.existsSync(publicIndex)) {
    return res.sendFile(publicIndex);
  }
  res.sendFile(path.join(__dirname, "index.html"));
});

if (require.main === module && !process.env.VERCEL) {
  const PORT = Number(process.env.PORT) || 4173;
  app.listen(PORT, () => {
    console.log(`Pulsewire is running at http://localhost:${PORT}`);
  });
}

module.exports = app;