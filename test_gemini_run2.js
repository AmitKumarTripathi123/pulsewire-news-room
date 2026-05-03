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
`;

fs.writeFileSync('test_final.js', codeToEval);
