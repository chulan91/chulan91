const axios = require('axios');
const { processGrammarCheck } = require('./aiProcessor');
const { updateReadme, commitAndPushChanges } = require('./utils');

const googleSheetUrl = 'https://docs.google.com/spreadsheets/d/1_dTIx3WxJIu2FV_xtpKQt-xzhl2XuMx_jyf4zYwG5lo/gviz/tq?tqx=out:json&gid=0';

async function fetchData() {
  try {
    const response = await axios.get(googleSheetUrl);
    const jsonData = JSON.parse(response.data.substring(47).slice(0, -2)); // Adjust the JSON data to be valid
    const rows = jsonData.table.rows;
    const data = rows.map(row => row.c ? row.c.map(cell => cell ? cell.v : '').join(' | ') : '');
    return data;
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    throw error;
  }
}

async function fetchAndProcessData() {
  const data = await fetchData();
  const formattedData = await processGrammarCheck(data);
  return formattedData;
}

async function updateGithubWithFormattedData() {
  const formattedData = await fetchAndProcessData();
  await updateReadme(formattedData);
  await commitAndPushChanges();
}

module.exports = {
  fetchData,
  fetchAndProcessData,
  updateGithubWithFormattedData,
};
