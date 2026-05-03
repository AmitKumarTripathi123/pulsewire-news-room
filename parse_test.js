const fs = require('fs');
const { DOMParser } = require('xmldom');

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
  const atomLink = entry.getElementsByTagName("link")[0];
  if (atomLink && atomLink.getAttribute("href")) {
    return atomLink.getAttribute("href");
  }
  return getText(entry, ["link"]);
}

function parseFeed(xml) {
  const documentXml = new DOMParser().parseFromString(xml, "text/xml");
  const entries = Array.from(documentXml.getElementsByTagName("item"));
  console.log("Found entries:", entries.length);
  entries.slice(0, 2).forEach(entry => {
    const title = getText(entry, ["title"]);
    const link = getLink(entry);
    console.log({title, link});
  });
}

(async () => {
  const res = await fetch("http://127.0.0.1:4173/api/feed?url=https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms");
  const xml = await res.text();
  parseFeed(xml);
})();
