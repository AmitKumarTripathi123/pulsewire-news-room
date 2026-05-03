const http = require("node:http");
const fs = require("node:fs/promises");
const fsSync = require("node:fs");
const path = require("node:path");

let ROOT_DIR = path.join(__dirname, "public");
// If there's no public/ folder, serve files from the script directory so
// simple setups (index.html alongside server.js) just work.
if (!fsSync.existsSync(ROOT_DIR)) {
  ROOT_DIR = __dirname;
}
const DEFAULT_PORT = Number(process.env.PORT) || 4173;
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
  // Indian news sources
  "www.thehindu.com",
  "timesofindia.indiatimes.com",
  "feeds.feedburner.com",
  "www.hindustantimes.com",
  "indianexpress.com",
  "www.indianexpress.com",
  "ndtvnews.feedburner.com"
]);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

// Default Gemini API keys (supplied). For production it's safer to set
// them in the environment instead of keeping keys in source.
const DEFAULT_GEMINI_SUMMARY_KEY = "AIzaSyDNCpoeEN_yja2L1eFLtjMJPZ6vIRqAbdA";
const DEFAULT_GEMINI_CONTEXT_KEY = "AIzaSyDNCpoeEN_yja2L1eFLtjMJPZ6vIRqAbdA";

// Fact Checker — Google Fact Check API key (optional)
const GOOGLE_FACT_API_KEY = process.env.GOOGLE_FACT_API_KEY || "";

function send(res, status, body, headers = {}, headOnly = false) {
  res.writeHead(status, {
    "X-Content-Type-Options": "nosniff",
    ...headers
  });
  res.end(headOnly ? undefined : body);
}

function sendJson(res, status, payload, headOnly = false) {
  send(res, status, JSON.stringify(payload), {
    "Content-Type": "application/json; charset=utf-8"
  }, headOnly);
}

function readRequestBody(req, limit = 32000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on("data", (chunk) => {
      size += chunk.length;

      if (size > limit) {
        reject(new Error("Request body is too large."));
        req.destroy();
        return;
      }

      chunks.push(chunk);
    });

    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function validateFeedUrl(rawUrl) {
  if (!rawUrl) {
    throw new Error("Missing feed URL.");
  }

  let feedUrl;
  try {
    feedUrl = new URL(rawUrl);
  } catch {
    throw new Error("Invalid feed URL.");
  }

  if (!["http:", "https:"].includes(feedUrl.protocol)) {
    throw new Error("Only HTTP and HTTPS feeds are supported.");
  }

  if (!ALLOWED_FEED_HOSTS.has(feedUrl.hostname)) {
    throw new Error("This feed host is not on the allowlist.");
  }

  return feedUrl;
}

async function fetchFeed(feedUrl) {
  const cacheKey = feedUrl.href;
  const cached = cache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.body;
  }

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

    if (!response.ok) {
      throw new Error(`Feed responded with ${response.status}.`);
    }

    const body = await response.text();
    cache.set(cacheKey, {
      body,
      expiresAt: Date.now() + CACHE_MS
    });

    return body;
  } finally {
    clearTimeout(timeout);
  }
}

async function handleFeedProxy(req, res, requestUrl) {
  const headOnly = req.method === "HEAD";

  try {
    const feedUrl = validateFeedUrl(requestUrl.searchParams.get("url"));
    const body = await fetchFeed(feedUrl);

    send(res, 200, body, {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300"
    }, headOnly);
  } catch (error) {
    sendJson(res, 400, {
      error: error.message || "Unable to fetch feed."
    }, headOnly);
  }
}

// ─── Fact Checker (Gemini 2.5 Flash) ─────────────────────────────────────────

async function handleFactCheckRequest(req, res) {
  try {
    const body = await readRequestBody(req, 64 * 1024);
    const { query } = JSON.parse(body);
    if (!query || typeof query !== "string") {
      sendJson(res, 400, { error: "Missing query field." });
      return;
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
      sendJson(res, 500, { error: geminiData?.error?.message || "Gemini API request failed." });
      return;
    }

    const raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleaned = raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Gemini JSON parse error. Raw:", raw);
      sendJson(res, 200, {
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
      return;
    }

    let keyFactsHtml = "";
    if (parsed.key_facts && parsed.key_facts.length > 0) {
      keyFactsHtml = " Key facts: " + parsed.key_facts.join("; ") + ".";
    }

    sendJson(res, 200, {
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
    sendJson(res, 500, { error: err.message || "Something went wrong." });
  }
}


function normalizeArticle(rawArticle = {}) {
  const article = {
    title: String(rawArticle.title || "").trim().slice(0, 280),
    description: String(rawArticle.description || "").trim().slice(0, 1200),
    source: String(rawArticle.source || "Unknown source").trim().slice(0, 80),
    topicLabel: String(rawArticle.topicLabel || "News").trim().slice(0, 60),
    publishedAt: String(rawArticle.publishedAt || "").trim().slice(0, 60),
    link: String(rawArticle.link || "").trim().slice(0, 500)
  };

  if (!article.title) {
    throw new Error("Article title is required.");
  }

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
  // Select API key based on mode. Allow overriding via environment variables.
  const defaultKey = mode === "summary" ? DEFAULT_GEMINI_SUMMARY_KEY : DEFAULT_GEMINI_CONTEXT_KEY;
  const envKey = mode === "summary" ? process.env.GEMINI_SUMMARY_KEY : process.env.GEMINI_CONTEXT_KEY;
  const apiKey = envKey || process.env.GEMINI_API_KEY || defaultKey;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  // Allow overriding model via GEMINI_MODEL; default to a flash model known
  // to support generateContent.
  const model = process.env.GEMINI_MODEL || "models/gemini-2.5-flash-lite";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{
          text: mode === "context"
            ? "You are a precise news context analyst. Write structured briefs covering past background, present developments, and future outlook. Always stay within the word limit. Use neutral, factual language and do not invent details not supported by the supplied metadata."
            : "You are a careful news assistant. Be concise, neutral, and do not add unsupported facts."
        }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: insightPrompt(mode, article) }]
        }
      ],
      generationConfig: {
        // Newer Gemini models use internal thinking tokens that count towards
        // the maxOutputTokens limit. We use 1000 to avoid arbitrary truncation.
        maxOutputTokens: 1000,
        temperature: 0.25
      }
    })
  });

  if (!response.ok) {
    let detail = "";

    try {
      const errorPayload = await response.json();
      detail = errorPayload?.error?.message ? ` ${errorPayload.error.message}` : "";
    } catch {
      detail = "";
    }

    throw new Error(`AI service responded with ${response.status}.${detail}`);
  }

  return extractGeminiText(await response.json());
}

function fitWordWindow(text, minWords, maxWords) {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const fillers = {
    1: "More.",
    2: "More soon.",
    3: "More details follow.",
    4: "More verified details follow.",
    5: "More verified updates may follow.",
    6: "More verified updates may clarify impact.",
    7: "More verified updates may clarify the impact.",
    8: "More verified updates may clarify the wider impact.",
    9: "More verified updates may clarify the wider public impact.",
    10: "More verified updates may clarify the wider public impact soon."
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
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  return words.slice(0, maxWords).join(" ");
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
      50,
      70
    );
  }

  // Produce a concise ~100-word context when Gemini is not available.
  const ctx = `Present development: ${article.title}. ${description} Past background: the feed does not include a full history, so place this item within the wider ${article.topicLabel.toLowerCase()} cycle and mention likely relevant institutions, policy, or market forces. Why it matters now: explain the immediate stakes in a sentence. What to watch next: official responses, further reporting, and data that would clarify the impact.`;

  return fitWordWindow(ctx, 100, 100);
}

async function generateInsight(mode, article) {
  const cacheKey = `${mode}:${article.source}:${article.title}`;
  const cached = insightCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.payload;
  }

  let payload = {
    text: localInsight(mode, article),
    provider: "local"
  };

  try {
    const geminiText = await askGemini(mode, article);
    if (geminiText) {
      payload = {
        text: geminiText,
        provider: "gemini"
      };
    }
  } catch (error) {
    console.warn(`AI fallback used: ${error.message}`);
    payload = {
      text: mode === "context"
        ? `Context could not be generated right now. ${error.message}`
        : localInsight(mode, article),
      provider: "gemini-error"
    };
  }

  insightCache.set(cacheKey, {
    payload,
    expiresAt: Date.now() + CACHE_MS
  });

  return payload;
}

async function handleInsight(req, res) {
  try {
    const body = await readRequestBody(req);
    const payload = JSON.parse(body || "{}");
    const mode = payload.mode === "context" ? "context" : "summary";
    const article = normalizeArticle(payload.article);
    const insight = await generateInsight(mode, article);

    sendJson(res, 200, {
      mode,
      ...insight
    });
  } catch (error) {
    sendJson(res, 400, {
      error: error.message || "Unable to create insight."
    });
  }
}

async function serveStatic(req, res, pathname) {
  const headOnly = req.method === "HEAD";
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const decodedPath = decodeURIComponent(safePath);
  const filePath = path.normalize(path.join(ROOT_DIR, decodedPath));

  if (filePath !== ROOT_DIR && !filePath.startsWith(`${ROOT_DIR}${path.sep}`)) {
    send(res, 403, "Forbidden", { "Content-Type": "text/plain; charset=utf-8" }, headOnly);
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath);

    send(res, 200, data, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Cache-Control": "no-cache"
    }, headOnly);
  } catch {
    send(res, 404, "Not found", { "Content-Type": "text/plain; charset=utf-8" }, headOnly);
  }
}

// ─── AI Assistant ────────────────────────────────────────────────────────────

async function handleAssistantRequest(req, res) {
  try {
    const body = await readRequestBody(req, 2 * 1024 * 1024); // 2MB limit
    const { query, articles } = JSON.parse(body || "{}");
    if (!query || !Array.isArray(articles)) {
      sendJson(res, 400, { success: false, error: "Missing query or articles." });
      return;
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
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
    const cleanText = rawText.replace(/^```json\n?/, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleanText);

    sendJson(res, 200, { success: true, ...parsed });
  } catch (error) {
    console.error("Assistant Error:", error.message);
    sendJson(res, 500, { success: false, error: error.message });
  }
}

function createServer() {
  return http.createServer(async (req, res) => {
    const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    if (req.method === "OPTIONS") {
      send(res, 204, "", {
        "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      });
      return;
    }

    if (!["GET", "HEAD", "POST"].includes(req.method)) {
      send(res, 405, "Method not allowed", {
        "Content-Type": "text/plain; charset=utf-8",
        "Allow": "GET, HEAD, POST, OPTIONS"
      });
      return;
    }

    if (requestUrl.pathname === "/api/assistant") {
      if (req.method !== "POST") {
        send(res, 405, "Method not allowed", {
          "Content-Type": "text/plain; charset=utf-8",
          "Allow": "POST, OPTIONS"
        });
        return;
      }
      await handleAssistantRequest(req, res);
      return;
    }

    if (requestUrl.pathname === "/api/insight") {
      if (req.method !== "POST") {
        send(res, 405, "Method not allowed", {
          "Content-Type": "text/plain; charset=utf-8",
          "Allow": "POST, OPTIONS"
        });
        return;
      }

      await handleInsight(req, res);
      return;
    }

    if (requestUrl.pathname === "/api/fact-check") {
      if (req.method !== "POST") {
        send(res, 405, "Method not allowed", {
          "Content-Type": "text/plain; charset=utf-8",
          "Allow": "POST, OPTIONS"
        });
        return;
      }

      await handleFactCheckRequest(req, res);
      return;
    }

    if (requestUrl.pathname === "/api/feed") {
      await handleFeedProxy(req, res, requestUrl);
      return;
    }

    await serveStatic(req, res, requestUrl.pathname);
  });
}

function start(port) {
  const server = createServer();

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && port < DEFAULT_PORT + 20) {
      start(port + 1);
      return;
    }

    console.error(error);
    process.exitCode = 1;
  });

  server.listen(port, "127.0.0.1", () => {
    console.log(`Pulsewire is running at http://127.0.0.1:${port}`);
  });
}

start(DEFAULT_PORT);