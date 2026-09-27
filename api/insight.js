const DEFAULT_GEMINI_SUMMARY_KEY = "AIzaSyDNCpoeEN_yja2L1eFLtjMJPZ6vIRqAbdA";
const DEFAULT_GEMINI_CONTEXT_KEY = "AIzaSyDNCpoeEN_yja2L1eFLtjMJPZ6vIRqAbdA";
const CACHE_MS = 5 * 60 * 1000;
const insightCache = new Map();

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

module.exports = async (req, res) => {
  try {
    const body = typeof req.body === "object" ? req.body : JSON.parse(req.body || "{}");
    const mode = body.mode === "context" ? "context" : "summary";
    const article = normalizeArticle(body.article);
    const insight = await generateInsight(mode, article);
    return res.status(200).json({ mode, ...insight });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Unable to create insight." });
  }
};
