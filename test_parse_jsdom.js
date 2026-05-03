const { JSDOM } = require("jsdom");

function cleanText(value) { return value.replace(/\s+/g, " ").trim(); }
function stripHtml(value) { return value.replace(/<[^>]*>?/gm, ''); }
function getText(entry, names) {
  for (const name of names) {
    const found = entry.getElementsByTagName(name)[0];
    if (found && found.textContent) { return found.textContent.trim(); }
  }
  return "";
}
function getLink(entry) {
  const atomLink = entry.querySelector("link[href]");
  if (atomLink) return atomLink.getAttribute("href") || "";
  return getText(entry, ["link"]);
}

async function test() {
  const urls = [
    "https://indianexpress.com/feed/",
    "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms",
    "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml",
    "https://feeds.feedburner.com/ndtvnews-top-stories",
    "https://www.thehindu.com/news/national/feeder/default.rss"
  ];
  
  for (const url of urls) {
    try {
      const res = await fetch(`http://127.0.0.1:4173/api/feed?url=${encodeURIComponent(url)}`);
      const xml = await res.text();
      const dom = new JSDOM(xml, { contentType: "text/xml" });
      const documentXml = dom.window.document;
      const entries = Array.from(documentXml.querySelectorAll("item, entry")).slice(0, 2);
      
      const parsed = entries.map((entry) => {
        const title = cleanText(getText(entry, ["title"]));
        const link = getLink(entry);
        return { title, link: !!link };
      });
      console.log(`URL: ${url}`);
      console.log(parsed);
    } catch(e) {
      console.log(`Fetch error for ${url}: ${e}`);
    }
  }
}
test();
