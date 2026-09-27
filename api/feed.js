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

module.exports = async (req, res) => {
  try {
    const rawUrl = req.query?.url || new URL(req.url, `http://${req.headers.host || "localhost"}`).searchParams.get("url");
    if (!rawUrl) return res.status(400).json({ error: "Missing feed URL." });

    const feedUrl = new URL(rawUrl);
    if (!["http:", "https:"].includes(feedUrl.protocol)) {
      return res.status(400).json({ error: "Only HTTP and HTTPS feeds are supported." });
    }
    if (!ALLOWED_FEED_HOSTS.has(feedUrl.hostname)) {
      return res.status(400).json({ error: "This feed host is not on the allowlist." });
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
      if (!response.ok) throw new Error(`Feed responded with ${response.status}.`);
      const body = await response.text();
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=300");
      return res.status(200).send(body);
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    return res.status(400).json({ error: error.message || "Unable to fetch feed." });
  }
};
