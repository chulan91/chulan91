require('dotenv').config(); // Load environment variables from .env file
const { fetchData } = require('./src/googleSheetFetcher');
const { processGrammarCheck } = require('./src/aiProcessor');
const { updateReadme, commitAndPushChanges } = require('./src/utils');

async function main() {
  try {
    const data = await fetchData();
    const formattedData = await processGrammarCheck(data);
    await updateReadme(formattedData);
    await commitAndPushChanges();
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

main().catch(console.error);
