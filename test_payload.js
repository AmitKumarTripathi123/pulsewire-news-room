const fs = require('fs');

const serverFile = fs.readFileSync('server.js', 'utf8');
const newCode = serverFile.replace('function extractGeminiText(payload) {\\n  return payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";\\n}', 'function extractGeminiText(payload) {\\n  console.log("FULL PAYLOAD:", JSON.stringify(payload, null, 2));\\n  return payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";\\n}');

const fullCode = newCode.split('function start(port)')[0] + `
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
    const summary = await generateInsight("summary", article);
    console.log("FINAL SUMMARY:", summary.text);
  } catch (e) {
    console.error(e);
  }
}
test();
`;
fs.writeFileSync('test_payload_run.js', fullCode);
