const axios = require('axios');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const googleSheetUrl = 'https://docs.google.com/spreadsheets/d/e/1_dTIx3WxJIu2FV_xtpKQt-xzhl2XuMx_jyf4zYwG5lo/pub?output=csv';

async function fetchData() {
    const response = await axios.get(googleSheetUrl);
    const data = [];
    
    return new Promise((resolve, reject) => {
      require('streamifier')
        .createReadStream(response.data)
        .pipe(csv())
        .on('data', (row) => {
          data.push(row);
        })
        .on('end', () => {
          resolve(data);
        })
        .on('error', reject);
    });
  }
  
  async function updateReadme(data) {
    const readmePath = path.join(__dirname, 'README.md');
    let readmeContent = `# My GitHub Profile\n\n## Latest Data from Google Sheets\n\n`;
    data.forEach(item => {
      readmeContent += `### ${item.title}\n\n${item.description}\n\n`;
    });
    fs.writeFileSync(readmePath, readmeContent, 'utf-8');
  }
  
  async function main() {
    const data = await fetchData();
    await updateReadme(data);
  }
  
  main().catch(console.error);