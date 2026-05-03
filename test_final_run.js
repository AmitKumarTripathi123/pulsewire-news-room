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
  "www.sciencedaily.com"
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

// Default Gemini API key (supplied). For production it's safer to set
// GEMINI_API_KEY in the environment instead of keeping a key in source.
const DEFAULT_GEMINI_KEY = "AIzaSyCCet1acGJpSpNzEkqpVN-o0McQjx-C_II";

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
    "Create a context brief for a news reader using Gemini's background knowledge and the supplied article metadata.",
    "The brief must help the reader understand how this story reached the current moment.",
    "Use this exact structure:",
    "Present development: explain what is happening now.",
    "Past background: explain the relevant earlier events, policy history, conflict history, market history, people, institutions, or previous developments that led to this news.",
    "Why it matters now: explain the stakes.",
    "What to watch next: explain what future updates would clarify the story.",
    "Do not invent precise dates, quotes, numbers, or allegations. If background is uncertain from the metadata, say what is uncertain and keep the wording careful.",
    "Keep the full brief in 100 words.",
    "",
    sourceText
  ].join("\n");
}

function extractGeminiText(payload) {
  return payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}

async function askGemini(mode, article) {
  // Prefer an explicit environment variable, otherwise fall back to the
  // bundled key supplied above.
  const apiKey = process.env.GEMINI_API_KEY || DEFAULT_GEMINI_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  // Allow overriding model via GEMINI_MODEL; default to a flash model known
  // to support generateContent.
  const model = process.env.GEMINI_MODEL || "models/gemini-2.5-flash";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{
          text: mode === "context"
            ? "You are a careful news context analyst. Use background knowledge responsibly, separate current development from past background, and avoid unsupported precision."
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
        // Keep the existing summary token budget unchanged. For context,
        // reduce tokens so the model output stays around ~100 words.
        maxOutputTokens: mode === "summary" ? 180 : 240,
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

function geminiRequiredMessage() {
  return [
    "Gemini context is not enabled yet.",
    "",
    "Set GEMINI_API_KEY before starting the server, then click Context again. This button is intentionally Gemini-backed so it can explain the past background and earlier developments behind the news instead of using the local fallback."
  ].join("\n");
}

async function generateInsight(mode, article) {
  const cacheKey = `${mode}:${article.source}:${article.title}`;
  const cached = insightCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.payload;
  }

  let payload = mode === "context"
    ? {
        text: geminiRequiredMessage(),
        provider: "missing-gemini-key"
      }
    : {
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
    if (mode === "context" && process.env.GEMINI_API_KEY) {
      payload = {
        text: `Gemini could not create context right now. ${error.message}`,
        provider: "gemini-error"
      };
    }
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

    if (requestUrl.pathname === "/api/feed") {
      await handleFeedProxy(req, res, requestUrl);
      return;
    }

    await serveStatic(req, res, requestUrl.pathname);
  });
}


async function test() {
  const article = {
    title: "NASA successfully launches new Mars rover",
    description: "The new rover will explore the Jezero crater for signs of ancient life.",
    source: "SpaceNews",
    topicLabel: "Science",
    publishedAt: "2023-10-15T10:00:00Z",
    link: "https://spacenews.com/nasa-mars-rover"
  };
  try {
    console.log("Fetching summary...");
    const summary = await generateInsight("summary", article);
    console.log("SUMMARY TEXT:", summary.text);
    console.log("SUMMARY WORDS:", summary.text.split(' ').length);

    console.log("Fetching context...");
    const context = await generateInsight("context", article);
    console.log("CONTEXT TEXT:", context.text);
    console.log("CONTEXT WORDS:", context.text.split(' ').length);
  } catch (e) {
    console.error(e);
  }
}
test();
