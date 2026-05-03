const { execSync } = require('child_process');
const fs = require('fs');

const serverFile = fs.readFileSync('server.js', 'utf8');
const codeToEval = serverFile.split('function start(port)')[0] + `
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
    console.log("SUMMARY:", summary);
    const context = await generateInsight("context", article);
    console.log("CONTEXT:", context);
  } catch (e) {
    console.error(e);
  }
}
test();
`;
fs.writeFileSync('test_gemini.js', codeToEval);
