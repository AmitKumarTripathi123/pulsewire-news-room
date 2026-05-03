const FALLBACK_IMAGES = {
  trending: "https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?auto=format&fit=crop&w=1400&q=80",
  global: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
  politics: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1400&q=80",
  sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1400&q=80",
  business: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1400&q=80",
  technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80",
  health: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1400&q=80",
  science: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1400&q=80",
  culture: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80"
};

const TOPICS = [
  {
    id: "trending",
    label: "Trending 🔥",
    accent: "#ff4757",
    feeds: [
      { source: "NYT Top Stories", url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml" },
      { source: "BBC Top Stories", url: "https://feeds.bbci.co.uk/news/rss.xml" },
      { source: "Times of India", url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms" },
      { source: "NPR Top Stories", url: "https://feeds.npr.org/1001/rss.xml" }
    ]
  },
  {
    id: "global",
    label: "Global",
    accent: "#0b7f8f",
    feeds: [
      { source: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
      { source: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
      { source: "NYT World", url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml" }
    ]
  },
  {
    id: "politics",
    label: "Political",
    accent: "#d93535",
    feeds: [
      { source: "NPR Politics", url: "https://feeds.npr.org/1014/rss.xml" },
      { source: "NYT Politics", url: "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml" }
    ]
  },
  {
    id: "sports",
    label: "Sports",
    accent: "#188a53",
    feeds: [
      { source: "ESPN", url: "https://www.espn.com/espn/rss/news" },
      { source: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/rss.xml" }
    ]
  },
  {
    id: "business",
    label: "Business",
    accent: "#a06410",
    feeds: [
      { source: "NYT Business", url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml" },
      { source: "NPR Business", url: "https://feeds.npr.org/1006/rss.xml" }
    ]
  },
  {
    id: "technology",
    label: "Tech",
    accent: "#246bce",
    feeds: [
      { source: "The Verge", url: "https://www.theverge.com/rss/index.xml" },
      { source: "TechCrunch", url: "https://techcrunch.com/feed/" },
      { source: "NYT Technology", url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml" }
    ]
  },
  {
    id: "health",
    label: "Health",
    accent: "#12805c",
    feeds: [
      { source: "NPR Health", url: "https://feeds.npr.org/1128/rss.xml" },
      { source: "NYT Health", url: "https://rss.nytimes.com/services/xml/rss/nyt/Health.xml" }
    ]
  },
  {
    id: "science",
    label: "Science",
    accent: "#7b61ff",
    feeds: [
      { source: "BBC Science", url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml" },
      { source: "ScienceDaily", url: "https://www.sciencedaily.com/rss/top/science.xml" },
      { source: "NYT Science", url: "https://rss.nytimes.com/services/xml/rss/nyt/Science.xml" }
    ]
  },
  {
    id: "culture",
    label: "Culture",
    accent: "#c04488",
    feeds: [
      { source: "NYT Arts", url: "https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml" },
      { source: "NPR Arts", url: "https://feeds.npr.org/1008/rss.xml" }
    ]
  },
  {
    id: "india",
    label: "India 🇮🇳",
    accent: "#ff9933",
    feeds: [
      { source: "The Hindu", url: "https://www.thehindu.com/news/national/feeder/default.rss" },
      { source: "NDTV", url: "https://feeds.feedburner.com/ndtvnews-top-stories" },
      { source: "Times of India", url: "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms" },
      { source: "Hindustan Times", url: "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml" },
      { source: "Indian Express", url: "https://indianexpress.com/feed/" }
    ]
  },
  {
    id: "assistant",
    label: "Assistant 🤖",
    accent: "#20c997",
    isTool: true
  },
  {
    id: "factchecker",
    label: "Fact Checker 🔍",
    accent: "#6b46c1",
    isTool: true
  },
  {
    id: "insights",
    label: "Insights 📊",
    accent: "#ffb020",
    isTool: true
  }
];

const FALLBACK_STORIES = {
  trending: [
    ["Major breakthroughs announced at global tech summit", "Industry leaders unveil next-generation AI models that promise to reshape software development."],
    ["Stock markets rally as inflation cools faster than expected", "Investors react positively to new data suggesting the central bank may lower interest rates soon."],
    ["Historic peace treaty signed after months of negotiations", "Representatives from both nations gathered to finalize the agreement, marking a new era of cooperation."],
    ["Scientists discover new exoplanet with water vapor", "The finding brings astronomers one step closer to finding habitable worlds outside our solar system."]
  ],
  global: [
    ["World leaders open new round of climate finance talks", "Negotiators are trying to align funding, resilience planning, and clean-energy commitments before the next summit."],
    ["Aid routes reopen after tense cross-border talks", "Humanitarian teams say renewed access could speed deliveries to several hard-hit communities."],
    ["Cities test heat-response plans ahead of record summer", "Transit, hospitals, and neighborhood groups are coordinating cooling centers and early alerts."],
    ["Trade ministers seek common rules for critical minerals", "The proposal focuses on transparent supply chains and faster environmental reviews."]
  ],
  politics: [
    ["Campaigns sharpen economic message for undecided voters", "New polling has pushed both parties to focus on wages, housing, and tax policy."],
    ["Lawmakers move toward vote on election security package", "The bill includes funding for audits, paper backups, and state-level cyber support."],
    ["Governor signs public-records transparency measure", "The law shortens response windows and expands online access to agency filings."],
    ["Mayors press national leaders for housing flexibility", "Local officials are asking for faster permitting tools and infrastructure support."]
  ],
  sports: [
    ["Late goal turns championship race into final-week drama", "The result reshaped the table and set up a high-pressure finish for the top contenders."],
    ["Rookie guard powers comeback with fourth-quarter run", "A burst of scoring and aggressive defense helped seal the win after a slow start."],
    ["Cricket board confirms expanded international calendar", "The new window adds more fixtures while preserving recovery gaps for players."],
    ["Marathon favorites adjust pace plans after weather shift", "Coaches expect a tactical race with humidity likely to matter after mile eighteen."]
  ],
  business: [
    ["Markets climb as earnings calm inflation worries", "Analysts say stronger margins and cautious guidance helped steady investor sentiment."],
    ["Startups race to build tools for smaller manufacturers", "The sector is seeing demand for simpler inventory, quality, and hiring software."],
    ["Central bank officials signal patient rate stance", "Policy makers are watching wage growth, credit conditions, and service prices."],
    ["Retailers redesign stores around faster pickup traffic", "Companies are shrinking storage bottlenecks and adding more app-linked counters."]
  ],
  technology: [
    ["Chip makers unveil faster processors for on-device AI", "The new silicon targets laptops, phones, and industrial machines that need local inference."],
    ["Privacy teams rethink consent flows for connected apps", "Designers are testing clearer controls and shorter explanations for data sharing."],
    ["Satellite internet firms expand rural coverage trials", "Pilot programs are pairing low-orbit links with community broadband networks."],
    ["Developers adopt smaller models for customer-support agents", "Teams are tuning compact systems for speed, cost, and domain-specific accuracy."]
  ],
  health: [
    ["Hospitals expand remote monitoring for chronic care", "Clinicians say earlier alerts can reduce emergency visits for high-risk patients."],
    ["Researchers report progress on longer-lasting vaccines", "The study points to immune markers that may help guide next-generation boosters."],
    ["Nutrition labels get fresh focus in school meal programs", "Districts are testing procurement changes and clearer family dashboards."],
    ["Mental health hotlines add multilingual support", "Operators are training more counselors to handle crisis calls in regional languages."]
  ],
  science: [
    ["Astronomers map new details in a nearby star nursery", "Fresh observations reveal how dust, gas, and magnetic fields shape young stars."],
    ["Ocean sensors capture rapid change in coastal currents", "The data may improve storm forecasts and fisheries planning in vulnerable regions."],
    ["Battery researchers test safer solid-state materials", "The prototype aims to improve energy density while reducing heat-related failure risks."],
    ["New fossil find refines timeline for early mammals", "Paleontologists say the specimen fills a gap in the record of jaw and ear evolution."]
  ],
  culture: [
    ["Film festival opens with focus on independent debuts", "Programmers are highlighting first-time directors and cross-border productions."],
    ["Museum restores landmark modernist installation", "Conservators used archival notes and new materials testing to revive the work."],
    ["Streaming platforms invest in regional-language originals", "Executives see international growth in stories built for local audiences first."],
    ["Designers bring handcrafted textiles to the runway", "The collections pair traditional weaving with sharply tailored contemporary silhouettes."]
  ],
  india: [
    ["Parliament session opens amid debate on economic reform bills", "Lawmakers are expected to take up pending legislation on taxation, infrastructure, and digital regulation."],
    ["India's space agency confirms next lunar mission timeline", "Officials outlined key milestones and international collaboration plans for the upcoming mission."],
    ["Monsoon forecast points to above-normal rainfall this season", "Meteorologists say favorable conditions could benefit agriculture across several key states."],
    ["Indian railways expands high-speed corridor planning", "New routes are being evaluated to connect major metros with faster and more frequent services."]
  ]
};

const state = {
  activeTopicId: "trending",
  articles: [],
  currentIndex: 0,
  query: "",
  speakingId: null,
  insights: {},
  queue: [],
  liveCount: 0,
  failedCount: 0,
  rotationTimer: null
};

const trackerState = JSON.parse(localStorage.getItem('pulsewire_tracker')) || {
  topics: {},
  actions: { summary: 0, context: 0 }
};

setInterval(() => {
  if (!document.hidden) {
    if (!elements.insightOverlay.hidden) {
      const modeText = elements.insightMode.textContent.toLowerCase();
      const mode = modeText.includes("context") ? "context" : "summary";
      trackerState.actions[mode] = (trackerState.actions[mode] || 0) + 1;
    } else {
      if (state.activeTopicId && state.activeTopicId !== "insights" && state.activeTopicId !== "factchecker" && state.activeTopicId !== "assistant") {
        trackerState.topics[state.activeTopicId] = (trackerState.topics[state.activeTopicId] || 0) + 1;
      }
    }
    localStorage.setItem('pulsewire_tracker', JSON.stringify(trackerState));
    if (state.activeTopicId === "insights" && window.updateInsightsUI) {
      window.updateInsightsUI();
    }
  }
}, 1000);

const elements = {
  topicTabs: document.querySelector("#topicTabs"),
  tickerTrack: document.querySelector("#tickerTrack"),
  featurePanel: document.querySelector("#featurePanel"),
  articleGrid: document.querySelector("#articleGrid"),
  flashList: document.querySelector("#flashList"),
  sourceList: document.querySelector("#sourceList"),
  boardStats: document.querySelector("#boardStats"),
  feedStatus: document.querySelector("#feedStatus"),
  readerCard: document.querySelector("#readerCard"),
  searchInput: document.querySelector("#searchInput"),
  refreshButton: document.querySelector("#refreshButton"),
  readAllButton: document.querySelector("#readAllButton"),
  stopButton: document.querySelector("#stopButton"),
  insightOverlay: document.querySelector("#insightOverlay"),
  insightClose: document.querySelector("#insightClose"),
  insightMode: document.querySelector("#insightMode"),
  insightTitle: document.querySelector("#insightTitle"),
  insightMeta: document.querySelector("#insightMeta"),
  insightContent: document.querySelector("#insightContent")
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  renderTopicTabs();
  bindEvents();
  loadTopic(state.activeTopicId);
  startRotation();
}

function bindEvents() {
  elements.topicTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-topic]");
    if (!button) return;
    loadTopic(button.dataset.topic);
  });

  elements.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    state.currentIndex = 0;
    render();
  });

  elements.refreshButton.addEventListener("click", () => loadTopic(state.activeTopicId, true));
  elements.readAllButton.addEventListener("click", readTopStories);
  elements.stopButton.addEventListener("click", stopSpeaking);
  elements.insightClose.addEventListener("click", closeInsight);
  elements.insightOverlay.addEventListener("click", (event) => {
    if (event.target === elements.insightOverlay) {
      closeInsight();
    }
  });

  document.body.addEventListener("click", (event) => {
    const speakButton = event.target.closest("[data-speak]");
    const insightButton = event.target.closest("[data-insight-mode]");
    const flashButton = event.target.closest("[data-flash-index]");
    const featureButton = event.target.closest("[data-feature-nav]");
    const tickerButton = event.target.closest("[data-ticker-id]");
    const openableStory = event.target.closest("[data-open-url]");

    if (speakButton) {
      const article = findArticle(speakButton.dataset.speak);
      if (article) speakArticle(article);
      return;
    }

    if (insightButton) {
      const article = findArticle(insightButton.dataset.articleId);
      if (article) showInsight(article, insightButton.dataset.insightMode);
      return;
    }

    if (flashButton) {
      state.currentIndex = Number(flashButton.dataset.flashIndex);
      renderFeature();
      renderFlashes(getFilteredArticles());
      return;
    }

    if (featureButton) {
      moveFeature(featureButton.dataset.featureNav === "next" ? 1 : -1);
      return;
    }

    if (tickerButton) {
      const index = getFilteredArticles().findIndex((article) => article.id === tickerButton.dataset.tickerId);
      if (index >= 0) {
        state.currentIndex = index;
        renderFeature();
        renderFlashes(getFilteredArticles());
        elements.featurePanel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    if (openableStory) {
      openArticleUrl(openableStory.dataset.openUrl);
    }
  });

  document.body.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.insightOverlay.hidden) {
      closeInsight();
      return;
    }

    if (!["Enter", " "].includes(event.key)) {
      return;
    }

    const openableStory = event.target.closest("[data-open-url]");
    if (openableStory && event.target === openableStory) {
      event.preventDefault();
      openArticleUrl(openableStory.dataset.openUrl);
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopRotation();
    } else {
      startRotation();
    }
  });
}

function renderTopicTabs() {
  elements.topicTabs.innerHTML = TOPICS.map((topic) => `
    <button class="topic-tab${topic.id === state.activeTopicId ? " is-active" : ""}" type="button" data-topic="${escapeAttr(topic.id)}">
      <span class="topic-dot" style="--topic-color:${escapeAttr(topic.accent)}" aria-hidden="true"></span>
      ${escapeHtml(topic.label)}
    </button>
  `).join("");
}

async function loadTopic(topicId, force = false) {
  const topic = getTopic(topicId) || TOPICS[0];
  state.activeTopicId = topic.id;
  state.currentIndex = 0;
  state.liveCount = 0;
  state.failedCount = 0;
  state.articles = [];

  stopSpeaking();
  renderTopicTabs();

  if (topic.isTool) {
    renderTool(topic);
    return;
  }

  renderLoading();
  setFeedStatus("Loading", "");

  const results = await Promise.allSettled(topic.feeds.map((feed) => fetchFeed(feed, topic, force)));
  const articles = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      articles.push(...result.value);
    } else {
      state.failedCount += 1;
    }
  }

  const liveArticles = dedupeArticles(articles).sort(sortByDate);
  state.liveCount = liveArticles.length;

  const fallback = buildFallbackArticles(topic);
  state.articles = dedupeArticles([...liveArticles, ...fallback])
    .sort(sortByDate)
    .slice(0, 60);

  render();
}

async function fetchFeed(feed, topic, force) {
  const cacheBust = force ? `&t=${Date.now()}` : "";
  const response = await fetch(`/api/feed?url=${encodeURIComponent(feed.url)}${cacheBust}`);

  if (!response.ok) {
    throw new Error(`Could not load ${feed.source}`);
  }

  const xml = await response.text();
  return parseFeed(xml, feed, topic);
}

function parseFeed(xml, feed, topic) {
  const documentXml = new DOMParser().parseFromString(xml, "text/xml");
  const hasParserError = documentXml.querySelector("parsererror");

  if (hasParserError) {
    throw new Error(`Could not parse ${feed.source}`);
  }

  const entries = Array.from(documentXml.querySelectorAll("item, entry")).slice(0, 24);

  return entries.map((entry, index) => {
    const title = cleanText(getText(entry, ["title"]));
    const link = getLink(entry);
    const description = cleanText(stripHtml(getText(entry, ["description", "summary", "content", "content:encoded"])));
    const publishedAt = parseDate(getText(entry, ["pubDate", "published", "updated", "dc:date"]));
    const image = extractImage(entry) || fallbackImage(topic.id, index);

    return {
      id: hash(`${title}-${link}-${feed.source}`),
      title,
      link,
      description,
      image,
      source: feed.source,
      topic: topic.id,
      topicLabel: topic.label,
      accent: topic.accent,
      publishedAt,
      isLive: true
    };
  }).filter((article) => article.title && article.link);
}

function getText(entry, names) {
  for (const name of names) {
    const found = entry.getElementsByTagName(name)[0];
    if (found && found.textContent) {
      return found.textContent.trim();
    }
  }
  return "";
}

function getLink(entry) {
  const atomLink = entry.querySelector("link[href]");
  if (atomLink) {
    return atomLink.getAttribute("href") || "";
  }

  return getText(entry, ["link"]);
}

function extractImage(entry) {
  const mediaContent = entry.getElementsByTagName("media:content")[0] ||
    entry.getElementsByTagName("media:thumbnail")[0];
  if (mediaContent?.getAttribute("url")) {
    return mediaContent.getAttribute("url");
  }

  const enclosure = Array.from(entry.getElementsByTagName("enclosure"))
    .find((node) => (node.getAttribute("type") || "").startsWith("image"));
  if (enclosure?.getAttribute("url")) {
    return enclosure.getAttribute("url");
  }

  const html = getText(entry, ["content:encoded", "description", "summary"]);
  const imageMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return imageMatch?.[1] || "";
}

function buildFallbackArticles(topic) {
  const stories = FALLBACK_STORIES[topic.id] || FALLBACK_STORIES.global;
  const now = Date.now();

  return stories.map(([title, description], index) => ({
    id: hash(`${topic.id}-${title}`),
    title,
    description,
    link: "#",
    image: fallbackImage(topic.id, index),
    source: "Demo Wire",
    topic: topic.id,
    topicLabel: topic.label,
    accent: topic.accent,
    publishedAt: new Date(now - index * 48 * 60 * 1000).toISOString(),
    isLive: false
  }));
}

function renderLoading() {
  elements.featurePanel.innerHTML = `<div class="skeleton">Loading headlines</div>`;
  elements.articleGrid.innerHTML = Array.from({ length: 6 }, () => `<div class="skeleton">Loading</div>`).join("");
  elements.flashList.innerHTML = Array.from({ length: 4 }, () => `<div class="skeleton">Loading</div>`).join("");
  elements.sourceList.innerHTML = `<div class="skeleton">Loading</div>`;
  elements.tickerTrack.innerHTML = "";
  elements.boardStats.innerHTML = "";
}

function renderTool(topic) {
  if (topic.id === "insights") {
    elements.featurePanel.innerHTML = `
      <div class="fact-checker-panel">
        <div class="fc-header">
          <h2>Insights 📊</h2>
          <p>Your reading habits and screen time at a glance.</p>
        </div>
        <div id="insightsDashboard" style="display:flex; flex-direction:column; gap:20px; margin-top:20px;">
          <!-- Content will be rendered by updateInsightsUI -->
        </div>
        <button id="predictBtn" class="fc-submit feature-action" style="margin-top:20px; background:#6b46c1;">Predict My Personality 🎭</button>
        <div id="personalityResult" style="display:none; margin-top:20px; background:var(--surface-color); padding:20px; border-radius:12px; border:1px solid var(--border-color); animation: fadeIn 0.4s ease;"></div>
        <button id="resetInsightsBtn" class="fc-submit feature-action" style="margin-top:10px; background:#ff4757;">Reset Statistics</button>
      </div>
    `;
    elements.articleGrid.innerHTML = "";
    elements.flashList.innerHTML = `<div class="empty-state" style="padding: 14px">Tool mode active</div>`;
    elements.sourceList.innerHTML = `<div class="source-item" style="padding: 14px; font-weight: bold;">Local Storage Analytics</div>`;
    elements.tickerTrack.innerHTML = "";
    elements.boardStats.innerHTML = "";
    setFeedStatus("Ready", "");

    window.updateInsightsUI = function () {
      const db = document.getElementById("insightsDashboard");
      if (!db) return;

      const formatTime = (seconds) => {
        if (!seconds) return "0s";
        if (seconds < 60) return `${seconds}s`;
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        if (m < 60) return `${m}m ${s}s`;
        const h = Math.floor(m / 60);
        return `${h}h ${m % 60}m`;
      };

      let totalTopicTime = 0;
      Object.values(trackerState.topics).forEach(t => totalTopicTime += t);

      let totalActionTime = (trackerState.actions.summary || 0) + (trackerState.actions.context || 0);

      let totalTime = totalTopicTime + totalActionTime;

      let svgHtml = "";
      if (totalTopicTime > 0) {
        let cumulativePercent = 0;
        let slices = [];
        const validTopics = TOPICS.filter(t => !t.isTool);
        validTopics.forEach(t => {
          const tTime = trackerState.topics[t.id] || 0;
          if (tTime > 0) {
            const percent = (tTime / totalTopicTime);
            slices.push({
              topic: t,
              percent: percent,
              offset: cumulativePercent,
              time: tTime
            });
            cumulativePercent += percent;
          }
        });

        // Build SVG Donut
        const radius = 15.91549430918954;
        let circles = slices.map(s => {
          const dasharray = `${s.percent * 100} ${100 - (s.percent * 100)}`;
          const dashoffset = 25 - (s.offset * 100);
          return `<circle cx="21" cy="21" r="${radius}" fill="transparent" stroke="${s.topic.accent}" stroke-width="6" stroke-dasharray="${dasharray}" stroke-dashoffset="${dashoffset}" filter="url(#watery3d)"></circle>`;
        }).join("");

        let legend = slices.map(s => `
          <div style="display:flex; align-items:center; gap:8px; font-size:14px; margin-bottom:8px;">
            <div style="width:12px; height:12px; border-radius:50%; background:${s.topic.accent}"></div>
            <span style="flex:1;">${s.topic.label}</span>
            <span style="color:var(--text-secondary)">${formatTime(s.time)}</span>
          </div>
        `).join("");

        svgHtml = `
          <div style="display:flex; gap:30px; align-items:center; background:var(--surface-color); padding:20px; border-radius:12px; border:1px solid var(--border-color)">
            <div style="width:240px; height:240px; position:relative; flex-shrink:0;">
              <svg width="100%" height="100%" viewBox="0 0 42 42" style="transform: rotate(0deg); overflow:visible;">
                <defs>
                  <filter id="watery3d" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="0.8" result="blur"/>
                    <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="20" lighting-color="#ffffff" result="specOut">
                      <fePointLight x="-10" y="-10" z="20"/>
                    </feSpecularLighting>
                    <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"/>
                    <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
                    <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-opacity="0.6"/>
                  </filter>
                </defs>
                <circle cx="21" cy="21" r="${radius}" fill="transparent" stroke="var(--border-color)" stroke-width="6"></circle>
                ${circles}
              </svg>
              <div style="position:absolute; top:0; left:0; right:0; bottom:0; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                <span style="font-size:10px; color:var(--text-secondary); text-transform:uppercase;">Feeds</span>
                <span style="font-size:16px; font-weight:bold;">${formatTime(totalTopicTime)}</span>
              </div>
            </div>
            <div style="flex:1;">
              <h3 style="margin-bottom:12px; font-size:16px; border-bottom:1px solid var(--border-color); padding-bottom:8px;">Time by Topic</h3>
              ${legend}
            </div>
          </div>
        `;
      } else {
        svgHtml = `<div style="padding:20px; text-align:center; color:var(--text-secondary); background:var(--surface-color); border-radius:12px; border:1px solid var(--border-color)">No topic data yet. Start reading!</div>`;
      }

      const sTime = trackerState.actions.summary || 0;
      const cTime = trackerState.actions.context || 0;
      const aTotal = sTime + cTime;

      let actionHtml = "";
      if (aTotal > 0) {
        const sPct = (sTime / aTotal) * 100;
        const cPct = (cTime / aTotal) * 100;
        actionHtml = `
          <div style="background:var(--surface-color); padding:20px; border-radius:12px; border:1px solid var(--border-color)">
            <h3 style="margin-bottom:12px; font-size:16px; border-bottom:1px solid var(--border-color); padding-bottom:8px;">AI Reading Time</h3>
            <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:14px;">
              <span style="display:flex; align-items:center; gap:6px;"><div style="width:10px; height:10px; border-radius:2px; background:#20c997"></div> Summaries <span style="color:var(--text-secondary); font-size:12px;">${formatTime(sTime)}</span></span>
              <span style="display:flex; align-items:center; gap:6px;"><div style="width:10px; height:10px; border-radius:2px; background:#6b46c1"></div> Context <span style="color:var(--text-secondary); font-size:12px;">${formatTime(cTime)}</span></span>
            </div>
            <div style="width:100%; height:12px; background:var(--border-color); border-radius:6px; overflow:hidden; display:flex;">
              <div style="width:${sPct}%; background:#20c997; height:100%; transition: width 0.5s ease;"></div>
              <div style="width:${cPct}%; background:#6b46c1; height:100%; transition: width 0.5s ease;"></div>
            </div>
          </div>
        `;
      }

      db.innerHTML = `
        <div style="text-align:center; padding:10px 0 20px;">
           <span style="color:var(--text-secondary); font-size:12px; text-transform:uppercase; letter-spacing:1px;">Total Screen Time</span>
           <div style="font-size:42px; font-weight:900; margin-top:4px;">${formatTime(totalTime)}</div>
        </div>
        ${svgHtml}
        ${actionHtml}
      `;
    };

    window.updateInsightsUI();

    document.getElementById("predictBtn").addEventListener("click", () => {
      let maxTime = 0;
      let topTopic = null;
      Object.entries(trackerState.topics).forEach(([topicId, time]) => {
        if (time > maxTime) { maxTime = time; topTopic = topicId; }
      });

      const resultDiv = document.getElementById("personalityResult");
      resultDiv.style.display = "block";

      if (!topTopic || maxTime < 1) {
        resultDiv.innerHTML = `<h3 style="margin-bottom:8px">Hmm... 🧐</h3><p style="color:var(--text-secondary)">You haven't read enough news yet for me to read your mind! Explore some topics for a few seconds and try again.</p>`;
        return;
      }

      const personalities = {
        global: { title: "The Global Diplomat", celeb: "George Clooney", desc: "You have a broad, international perspective and care deeply about the world at large. You believe that understanding diverse cultures and global events is the key to solving complex issues. Your reading habits reflect a deep curiosity about geopolitics and interconnectedness." },
        politics: { title: "The Strategic Thinker", celeb: "Barack Obama", desc: "You are analytical, observant, and always thinking two steps ahead. You dive deep into policy, debate, and the mechanics of power. Your mind works like a chess grandmaster, constantly anticipating the long-term consequences of today's legislative decisions." },
        business: { title: "The Ambitious Tycoon", celeb: "Warren Buffett", desc: "You are practical, wealth-conscious, and understand how the world's gears turn. You look for the fundamental value in news, focusing on trends, markets, and economic shifts. Your reading shows a pragmatic desire to understand growth, strategy, and financial resilience." },
        technology: { title: "The Visionary Innovator", celeb: "Steve Jobs", desc: "You are forward-looking, embrace change, and love pushing the boundaries. You are fascinated by the rapid pace of digital transformation and how it reshapes human experience. You read to catch a glimpse of the future before it arrives." },
        health: { title: "The Mindful Healer", celeb: "Deepak Chopra", desc: "You are empathetic, balanced, and prioritize well-being above the noise. You focus on human longevity, mental health, and medical breakthroughs. Your habits reveal a compassionate nature and a desire to improve the quality of life for yourself and others." },
        science: { title: "The Curious Explorer", celeb: "Neil deGrasse Tyson", desc: "You are inquisitive, rational, and constantly seeking to understand the universe. You find wonder in the natural world, from microscopic biology to vast astronomical phenomena. You value empirical evidence and the relentless human pursuit of knowledge." },
        culture: { title: "The Creative Soul", celeb: "Zendaya", desc: "You are expressive, artistic, and deeply connected to human stories and expression. You thrive on the vibrancy of art, entertainment, and social trends. Your reading patterns reflect a deep appreciation for the aesthetic and emotional dimensions of life." },
        sports: { title: "The Energetic Competitor", celeb: "Serena Williams", desc: "You are passionate, driven, and thrive on momentum and excellence. You love the thrill of the game, the triumph of the human spirit, and the drama of competition. You are drawn to stories of resilience, teamwork, and breaking records." },
        india: { title: "The Rooted Observer", celeb: "Shah Rukh Khan", desc: "You are deeply connected to your roots while keeping a keen eye on national growth. You follow the pulse of the nation, from grassroots movements to blockbuster cinema and economic reform. Your reading shows a profound love for the rich, complex tapestry of your homeland." },
        trending: { title: "The Trendsetter", celeb: "Lady Gaga", desc: "You are always in the loop, adaptable, and ride the wave of the moment. You have a finger on the cultural pulse and know what people will be talking about tomorrow. You are a chameleon who thrives on the fast-paced, ever-changing nature of the current zeitgeist." }
      };

      const match = personalities[topTopic] || personalities.trending;

      resultDiv.innerHTML = `
         <h3 style="font-size:20px; margin-bottom:12px; color:var(--text-color);">Your Reading Personality: <br><span style="color:#20c997; font-weight:800; font-size:24px; display:inline-block; margin-top:8px;">${match.title}</span></h3>
         <p style="margin-bottom:16px; font-size:15px; color:var(--text-secondary); line-height:1.5;">${match.desc}</p>
         <div style="background: rgba(255,255,255,0.05); padding:12px 16px; border-radius:8px; display:inline-block; border-left:4px solid #6b46c1;">
            <p style="font-size:14px; margin-bottom:0; display:flex; align-items:center; gap:8px;">
              <span style="font-size:20px">✨</span>
              <span><strong>Celebrity Match:</strong> ${match.celeb}</span>
            </p>
         </div>
      `;
    });

    document.getElementById("resetInsightsBtn").addEventListener("click", () => {
      if (confirm("Reset all time tracking statistics?")) {
        trackerState.topics = {};
        trackerState.actions = { summary: 0, context: 0 };
        localStorage.setItem('pulsewire_tracker', JSON.stringify(trackerState));
        window.updateInsightsUI();
        document.getElementById("personalityResult").style.display = "none";
      }
    });

    return;
  }

  if (topic.id === "assistant") {
    elements.featurePanel.innerHTML = `
      <div class="fact-checker-panel">
        <div class="fc-header">
          <h2>AI Assistant 🤖</h2>
          <p>Describe what you want to read, and I'll fetch and filter the news from all sources, followed by a short quiz!</p>
        </div>
        <form id="assistantForm" class="fc-search-wrap">
          <input id="assistantInput" type="text" autocomplete="off" placeholder="E.g., Show me the latest space missions..." required>
          <button type="submit" class="fc-submit feature-action" style="background: var(--topic-accent, #20c997)">Search</button>
        </form>
        <div id="assistantResults" class="fc-results"></div>
      </div>
    `;
    elements.articleGrid.innerHTML = "";
    elements.flashList.innerHTML = `<div class="empty-state" style="padding: 14px">Tool mode active</div>`;
    elements.sourceList.innerHTML = `<div class="source-item" style="padding: 14px; font-weight: bold;">Gemini AI API</div>`;
    elements.tickerTrack.innerHTML = "";
    elements.boardStats.innerHTML = "";
    setFeedStatus("Ready", "");

    document.getElementById("assistantForm").addEventListener("submit", handleAssistantSearch);
    return;
  }

  if (topic.id === "factchecker") {
    elements.featurePanel.innerHTML = `
      <div class="fact-checker-panel">
        <div class="fc-header">
          <h2>Fact Checker 🔍</h2>
          <p>Verify claims instantly using authoritative databases and Wikipedia.</p>
        </div>
        <form id="fcForm" class="fc-search-wrap">
          <input id="fcInput" type="text" autocomplete="off" placeholder="Enter a claim or question to verify..." required>
          <button type="submit" class="fc-submit feature-action">Verify</button>
        </form>
        <div id="fcResults" class="fc-results"></div>
      </div>
    `;
    elements.articleGrid.innerHTML = "";
    elements.flashList.innerHTML = `<div class="empty-state" style="padding: 14px">Tool mode active</div>`;
    elements.sourceList.innerHTML = `<div class="source-item" style="padding: 14px; font-weight: bold;">API Verification</div>`;
    elements.tickerTrack.innerHTML = "";
    elements.boardStats.innerHTML = "";
    setFeedStatus("Ready", "");

    document.getElementById("fcForm").addEventListener("submit", handleFactCheck);
  }
}

async function fetchAllArticles() {
  const allFeedsPromises = [];
  TOPICS.filter(t => !t.isTool).forEach(topic => {
    topic.feeds.forEach(feed => {
      allFeedsPromises.push(fetchFeed(feed, topic, false).catch(() => []));
    });
  });
  const results = await Promise.all(allFeedsPromises);
  return results.flat();
}

async function handleAssistantSearch(e) {
  e.preventDefault();
  const input = document.getElementById("assistantInput");
  const query = input.value.trim();
  if (!query) return;

  const resultsContainer = document.getElementById("assistantResults");
  elements.articleGrid.innerHTML = Array.from({ length: 6 }, () => `<div class="skeleton">Loading</div>`).join("");

  resultsContainer.innerHTML = `
    <div class="fc-timeline">
      <div class="fc-step fc-active">Fetching news from all global feeds...</div>
      <div class="fc-step" style="animation-delay: 0.6s">Filtering news using Gemini AI...</div>
      <div class="fc-step" style="animation-delay: 1.3s">Generating comprehension quiz...</div>
    </div>
  `;

  try {
    const allArticles = await fetchAllArticles();

    // Minimize payload to avoid size limits
    const payloadArticles = allArticles.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description ? a.description.substring(0, 150) : "",
      source: a.source
    }));

    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, articles: payloadArticles })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Assistant request failed.");
    }

    const matchedArticles = allArticles.filter(a => data.articleIds.includes(a.id));

    if (matchedArticles.length === 0) {
      elements.articleGrid.innerHTML = `<div class="empty-state">No news found matching your request.</div>`;
      resultsContainer.innerHTML = "";
    } else {
      renderArticles(matchedArticles);
      resultsContainer.innerHTML = "";

      if (data.quiz && data.quiz.length > 0) {
        let quizHtml = `<div class="quiz-container" style="margin-top:20px; background:var(--surface-color); border:1px solid var(--border-color); border-radius:12px; padding:20px; grid-column: 1 / -1;">
          <h3>Knowledge Check 🧠</h3>
          <form id="quizForm">`;
        data.quiz.forEach((q, i) => {
          quizHtml += `
            <div class="quiz-question" style="margin-top:16px; padding-left:10px;">
              <p style="margin-bottom:8px;"><strong>Q${i + 1}:</strong> ${escapeHtml(q.question)}</p>
              <div class="quiz-options" style="display:flex; flex-direction:column; gap:6px;">
                ${q.options.map((opt, j) => `
                  <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
                    <input type="radio" name="q${i}" value="${escapeAttr(opt)}" data-correct="${escapeAttr(q.answer)}">
                    ${escapeHtml(opt)}
                  </label>
                `).join("")}
              </div>
            </div>`;
        });
        quizHtml += `<div style="margin-top:20px;"><button type="button" class="fc-submit feature-action" onclick="window.checkQuiz()">Submit Answers</button></div>
                     <div id="quizResult" style="margin-top:10px; font-weight:bold;"></div>
          </form>
        </div>`;

        elements.articleGrid.insertAdjacentHTML("beforeend", quizHtml);

        window.checkQuiz = function () {
          const form = document.getElementById("quizForm");
          let score = 0;
          data.quiz.forEach((q, i) => {
            const selected = form.querySelector(`input[name="q${i}"]:checked`);
            const qDiv = form.querySelectorAll('.quiz-question')[i];
            // Reset previous styles
            qDiv.style.borderLeft = "";
            const oldCorrect = qDiv.querySelector('.correct-answer');
            if (oldCorrect) oldCorrect.remove();

            if (selected && selected.value === q.answer) {
              score++;
              qDiv.style.borderLeft = "4px solid #20c997";
            } else {
              qDiv.style.borderLeft = "4px solid #ff4757";
              const correctLabel = document.createElement("p");
              correctLabel.className = "correct-answer";
              correctLabel.style.color = "#20c997";
              correctLabel.style.marginTop = "6px";
              correctLabel.innerText = "Correct: " + q.answer;
              qDiv.appendChild(correctLabel);
            }
          });
          document.getElementById("quizResult").innerHTML = `You scored ${score} out of ${data.quiz.length}!`;
          document.getElementById("quizResult").style.color = score === data.quiz.length ? "#20c997" : "inherit";
        };
      }
    }
  } catch (err) {
    elements.articleGrid.innerHTML = "";
    resultsContainer.innerHTML = `<div class="fc-answer-box error"><p>Error: ${escapeHtml(err.message || "Unknown error")}</p></div>`;
  }
}

async function handleFactCheck(e) {
  e.preventDefault();
  const input = document.getElementById("fcInput");
  const query = input.value.trim();
  if (!query) return;

  const resultsContainer = document.getElementById("fcResults");

  // Show timeline animation
  resultsContainer.innerHTML = `
    <div class="fc-timeline">
      <div class="fc-step fc-active">Extracting factual claims...</div>
      <div class="fc-step" style="animation-delay: 0.6s">Checking against verified sources...</div>
      <div class="fc-step" style="animation-delay: 1.3s">Running AI analysis on remaining claims...</div>
    </div>
  `;

  try {
    const response = await fetch("/api/fact-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Fact-check failed.");
    }

    // Keep timeline visible for a moment
    await new Promise(r => setTimeout(r, 1500));

    const resultHtml = data.results.map(r => {
      const isHighConfidence = /high/i.test(r.confidence);
      const isFalse = /false|no|mislead|incorrect|wrong/i.test(r.verdict);

      // High confidence always gets positive green styling unless explicitly false
      const verdictClass = isHighConfidence && !isFalse ? "fc-verdict-true"
        : isFalse ? "fc-verdict-false"
          : /true|yes|confirmed/i.test(r.verdict) ? "fc-verdict-true"
            : "fc-verdict-partial";

      const cardClass = isHighConfidence && !isFalse ? "fc-result-card fc-card-positive" : "fc-result-card";
      const confidenceIcon = isHighConfidence && !isFalse ? "✅" : /low/i.test(r.confidence) ? "⚠️" : "🔍";

      const badge = r.type === "verified"
        ? `<span class="fc-badge fc-badge-verified">✔ Google Verified</span>`
        : r.type === "web_verified"
          ? `<span class="fc-badge fc-badge-web">📖 Wikipedia</span>`
          : `<span class="fc-badge fc-badge-ai">🤖 AI Estimated</span>`;
      const sourceHtml = r.url
        ? `<a href="${escapeAttr(r.url)}" target="_blank" rel="noopener" class="fc-source-link">${escapeHtml(r.source)}</a>`
        : r.source ? `<span class="fc-source-link">${escapeHtml(r.source)}</span>` : "";
      const detail = r.explanation || "";
      return `
        <div class="${cardClass}">
          <div class="fc-result-meta">${badge} ${sourceHtml} <span class="fc-confidence">${confidenceIcon} Confidence: ${escapeHtml(r.confidence)}</span></div>
          <p class="fc-claim">${escapeHtml(r.claim)}</p>
          <div class="fc-verdict ${verdictClass}">${escapeHtml(r.verdict)}</div>
          ${detail ? `<p class="fc-explanation">${escapeHtml(detail)}</p>` : ""}
        </div>
      `;
    }).join("");

    resultsContainer.innerHTML = `<div class="fc-results-list">${resultHtml}</div>`;
  } catch (err) {
    resultsContainer.innerHTML = `<div class="fc-answer-box error"><p>Error: ${escapeHtml(err.message || "Unknown error")}</p></div>`;
  }
}

function render() {
  const articles = getFilteredArticles();
  renderFeature();
  renderTicker(articles);
  renderFlashes(articles);
  renderArticles(articles);
  renderSources(articles);
  renderStats(articles);
  renderStatus();
}

function renderFeature() {
  const articles = getFilteredArticles();
  const article = articles[state.currentIndex] || articles[0];

  if (!article) {
    elements.featurePanel.innerHTML = `<div class="empty-state">No headlines found</div>`;
    return;
  }

  elements.featurePanel.innerHTML = `
    <article class="feature-card${canOpenArticle(article) ? " is-openable" : ""}" ${openAttrs(article)} style="--feature-image:url('${escapeAttr(article.image)}')">
      <div class="feature-content">
        <div class="story-meta">
          <span class="meta-chip">${escapeHtml(article.topicLabel)}</span>
          <span class="meta-chip">${escapeHtml(article.source)}</span>
          <span class="meta-chip">${escapeHtml(storyTime(article))}</span>
        </div>
        <h2>${escapeHtml(article.title)}</h2>
        <p>${escapeHtml(article.description || "Tap into the latest update from this developing story.")}</p>
        <div class="feature-actions">
          ${renderSpeakerButton(article, "feature")}
          <button class="feature-action" type="button" data-insight-mode="summary" data-article-id="${escapeAttr(article.id)}">Summary</button>
          <button class="feature-action secondary" type="button" data-insight-mode="context" data-article-id="${escapeAttr(article.id)}">Context</button>
        </div>
      </div>
      <div class="feature-nav" aria-label="Featured story navigation">
        <button type="button" data-feature-nav="prev" aria-label="Previous headline">Prev</button>
        <button type="button" data-feature-nav="next" aria-label="Next headline">Next</button>
      </div>
    </article>
  `;
}

function renderTicker(articles) {
  const visible = articles.slice(0, 14);

  if (!visible.length) {
    elements.tickerTrack.innerHTML = "";
    return;
  }

  const repeated = [...visible, ...visible];
  elements.tickerTrack.innerHTML = repeated.map((article) => `
    <button class="ticker-item" type="button" data-ticker-id="${escapeAttr(article.id)}">
      <strong>${escapeHtml(article.source)}</strong>
      <span>${escapeHtml(article.title)}</span>
    </button>
  `).join("");
}

function renderFlashes(articles) {
  const visible = articles.slice(0, 6);

  if (!visible.length) {
    elements.flashList.innerHTML = `<div class="empty-state">No flashes</div>`;
    return;
  }

  elements.flashList.innerHTML = visible.map((article, index) => `
    <button class="flash-card${index === state.currentIndex ? " is-active" : ""}" type="button" data-flash-index="${index}">
      <span>${escapeHtml(article.source)} / ${escapeHtml(storyTime(article))}</span>
      <strong>${escapeHtml(article.title)}</strong>
    </button>
  `).join("");
}

function renderArticles(articles) {
  const cards = articles.slice(1, 22);

  if (!cards.length) {
    elements.articleGrid.innerHTML = `<div class="empty-state">No headlines found</div>`;
    return;
  }

  elements.articleGrid.innerHTML = cards.map((article) => `
    <article class="article-card${canOpenArticle(article) ? " is-openable" : ""}" ${openAttrs(article)}>
      <div class="article-image">
        <img src="${escapeAttr(article.image)}" alt="" loading="lazy" referrerpolicy="no-referrer">
      </div>
      <div class="article-body">
        <div class="article-meta">
          <span>${escapeHtml(article.source)}</span>
          <span>${escapeHtml(storyTime(article))}</span>
        </div>
        <h3>${escapeHtml(article.title)}</h3>
        <p>${escapeHtml(article.description || "A developing update is available from this source.")}</p>
        <div class="article-actions">
          ${renderSpeakerButton(article, "article")}
          <button class="article-action" type="button" data-insight-mode="summary" data-article-id="${escapeAttr(article.id)}">Summary</button>
          <button class="article-action secondary" type="button" data-insight-mode="context" data-article-id="${escapeAttr(article.id)}">Context</button>
        </div>
      </div>
    </article>
  `).join("");
}

function renderSpeakerButton(article, variant) {
  const isSpeaking = state.speakingId === article.id;
  const icon = isSpeaking
    ? `<span class="stop-glyph" aria-hidden="true"></span>`
    : `<span class="speaker-glyph" aria-hidden="true"><span class="speaker-base"></span><span class="speaker-cone"></span><span class="speaker-wave"></span></span>`;

  return `
    <button class="speaker-button ${variant}" type="button" data-speak="${escapeAttr(article.id)}" aria-label="${isSpeaking ? "Stop reading" : "Listen to headline"}">
      ${icon}
      <span class="speaker-text">${isSpeaking ? "Stop" : "Listen"}</span>
    </button>
  `;
}

function renderSources(articles) {
  const counts = articles.reduce((map, article) => {
    map.set(article.source, (map.get(article.source) || 0) + 1);
    return map;
  }, new Map());

  const rows = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  if (!rows.length) {
    elements.sourceList.innerHTML = `<div class="empty-state">No sources</div>`;
    return;
  }

  elements.sourceList.innerHTML = rows.map(([source, count]) => `
    <div class="source-row">
      <p class="source-name">${escapeHtml(source)}</p>
      <span class="source-count">${count}</span>
    </div>
  `).join("");
}

function renderStats(articles) {
  const sourceCount = new Set(articles.map((article) => article.source)).size;
  const liveLabel = state.liveCount > 0 ? `${state.liveCount} live` : "demo";

  elements.boardStats.innerHTML = `
    <span class="stat-pill">${articles.length} stories</span>
    <span class="stat-pill">${sourceCount} sources</span>
    <span class="stat-pill">${liveLabel}</span>
  `;
}

function renderStatus() {
  if (state.liveCount > 0) {
    setFeedStatus("Live", "is-live");
    return;
  }

  setFeedStatus("Demo", "is-demo");
}

function setFeedStatus(label, modifier) {
  elements.feedStatus.textContent = label;
  elements.feedStatus.className = `status-pill ${modifier || ""}`.trim();
}

function getFilteredArticles() {
  const articles = state.articles;
  if (!state.query) return articles;

  return articles.filter((article) => {
    const haystack = `${article.title} ${article.description} ${article.source} ${article.topicLabel}`.toLowerCase();
    return haystack.includes(state.query);
  });
}

function moveFeature(direction) {
  const articles = getFilteredArticles();
  if (!articles.length) return;

  state.currentIndex = (state.currentIndex + direction + articles.length) % articles.length;
  renderFeature();
  renderFlashes(articles);
}

function startRotation() {
  stopRotation();
  state.rotationTimer = window.setInterval(() => {
    if (!state.speakingId) {
      moveFeature(1);
    }
  }, 8500);
}

function stopRotation() {
  if (state.rotationTimer) {
    window.clearInterval(state.rotationTimer);
    state.rotationTimer = null;
  }
}

function readTopStories() {
  const stories = getFilteredArticles().slice(0, 8);
  if (!stories.length) return;

  state.queue = stories.slice(1);
  speakArticle(stories[0], true);
}

function speakArticle(article, continueQueue = false) {
  if (!("speechSynthesis" in window)) {
    renderReader(article, "Speech not available");
    return;
  }

  if (state.speakingId === article.id) {
    stopSpeaking();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(buildSpeechText(article));
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find((voice) => voice.lang?.startsWith("en"));

  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  utterance.rate = 0.98;
  utterance.pitch = 1;
  utterance.onstart = () => {
    state.speakingId = article.id;
    renderReader(article, "Reading");
    render();
  };
  utterance.onend = () => {
    state.speakingId = null;
    renderReader(article, "Finished");
    render();

    if (continueQueue && state.queue.length) {
      const next = state.queue.shift();
      window.setTimeout(() => speakArticle(next, true), 350);
    }
  };
  utterance.onerror = () => {
    state.speakingId = null;
    renderReader(article, "Stopped");
    render();
  };

  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  state.speakingId = null;
  state.queue = [];
  renderReader(null, "Idle");
  renderFeature();
  renderArticles(getFilteredArticles());
}

async function showInsight(article, mode = "summary") {
  const normalizedMode = mode === "context" ? "context" : "summary";
  const cacheKey = `${article.id}:${normalizedMode}`;

  openInsight(
    article,
    normalizedMode,
    normalizedMode === "context" ? "Asking OpenAI for past background..." : "Creating AI summary..."
  );

  if (state.insights[cacheKey]) {
    renderInsight(article, normalizedMode, state.insights[cacheKey]);
    return;
  }

  try {
    const response = await fetch("/api/insight", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mode: normalizedMode,
        article: {
          title: article.title,
          description: article.description,
          source: article.source,
          topicLabel: article.topicLabel,
          publishedAt: article.publishedAt,
          link: article.link
        }
      })
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Insight failed.");
    }

    state.insights[cacheKey] = payload;
    renderInsight(article, normalizedMode, payload);
  } catch (error) {
    renderInsight(article, normalizedMode, {
      text: `Unable to create this insight right now. ${error.message}`,
      provider: "error"
    });
  }
}

function openInsight(article, mode, message) {
  elements.insightOverlay.hidden = false;
  elements.insightMode.textContent = mode === "context" ? "AI Context" : "AI Summary";
  elements.insightTitle.textContent = article.title;
  elements.insightMeta.textContent = `${article.source} / ${article.topicLabel} / ${storyTime(article)}`;
  elements.insightContent.innerHTML = `<div class="insight-loading">${escapeHtml(message)}</div>`;
}

function renderInsight(article, mode, payload) {
  const providerLabels = {
    openai: "OpenAI generated",
    local: "local summary",
    "missing-openai-key": "OpenAI key needed",
    "openai-error": "OpenAI unavailable",
    error: "error"
  };

  elements.insightMode.textContent = mode === "context" ? "AI Context" : "AI Summary";
  elements.insightTitle.textContent = article.title;
  elements.insightMeta.textContent = `${article.source} / ${providerLabels[payload.provider] || "AI insight"}`;
  elements.insightContent.textContent = payload.text;
}

function closeInsight() {
  elements.insightOverlay.hidden = true;
}

function renderReader(article, status) {
  const speaking = Boolean(article && state.speakingId === article.id);

  elements.readerCard.classList.toggle("is-speaking", speaking);
  elements.readerCard.innerHTML = `
    <p class="reader-source">${escapeHtml(status)}${article ? ` / ${escapeHtml(article.source)}` : ""}</p>
    <h3>${escapeHtml(article?.title || "Select a headline")}</h3>
    <div class="voice-bars" aria-hidden="true">
      <span></span><span></span><span></span><span></span><span></span>
    </div>
  `;
}

function buildSpeechText(article) {
  const description = article.description ? ` ${article.description}` : "";
  return `${article.topicLabel} news from ${article.source}. ${article.title}.${description}`;
}

function findArticle(id) {
  return state.articles.find((article) => article.id === id);
}

function canOpenArticle(article) {
  return Boolean(article?.link && article.link !== "#");
}

function openAttrs(article) {
  if (!canOpenArticle(article)) {
    return "";
  }

  return `data-open-url="${escapeAttr(article.link)}" role="link" tabindex="0" aria-label="Open ${escapeAttr(article.title)}"`;
}

function openArticleUrl(url) {
  if (!url || url === "#") {
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

function getTopic(id) {
  return TOPICS.find((topic) => topic.id === id);
}

function dedupeArticles(articles) {
  const seen = new Set();
  const deduped = [];

  for (const article of articles) {
    const key = article.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 90);
    if (!key || seen.has(key)) continue;

    seen.add(key);
    deduped.push(article);
  }

  return deduped;
}

function sortByDate(a, b) {
  if (a.isLive !== b.isLive) {
    return a.isLive ? -1 : 1;
  }

  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

function parseDate(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function timeAgo(value) {
  const date = new Date(value);
  const seconds = Math.max(1, Math.round((Date.now() - date.getTime()) / 1000));
  const units = [
    ["day", 86400],
    ["hour", 3600],
    ["min", 60]
  ];

  for (const [label, amount] of units) {
    const count = Math.floor(seconds / amount);
    if (count >= 1) {
      return `${count}${label[0]} ago`;
    }
  }

  return "now";
}

function storyTime(article) {
  return article.isLive ? timeAgo(article.publishedAt) : "sample";
}

function fallbackImage(topicId, index) {
  const base = FALLBACK_IMAGES[topicId] || FALLBACK_IMAGES.global;
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}sig=${encodeURIComponent(`${topicId}-${index}`)}`;
}

function cleanText(value) {
  return decodeHtml(value)
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(value) {
  const template = document.createElement("template");
  template.innerHTML = value || "";
  return template.content.textContent || template.innerText || "";
}

function decodeHtml(value) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value || "";
  return textarea.value;
}

function hash(value) {
  let output = 0;
  for (let index = 0; index < value.length; index += 1) {
    output = ((output << 5) - output) + value.charCodeAt(index);
    output |= 0;
  }
  return `a${Math.abs(output)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}