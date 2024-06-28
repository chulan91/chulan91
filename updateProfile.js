const axios = require('axios');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const googleSheetUrl = 'https://docs.google.com/spreadsheets/d/e/1_dTIx3WxJIu2FV_xtpKQt-xzhl2XuMx_jyf4zYwG5lo/pub?output=csv';

async function fetchData() {
<<<<<<< Updated upstream
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
=======
  const response = await axios.get(googleSheetUrl);
  const jsonData = JSON.parse(response.data.substring(47).slice(0, -2)); // Adjust the JSON data to be valid
  const rows = jsonData.table.rows;
  const data = rows.map(row => row.c[0] ? row.c[0].v : '');
  return data;
}

async function updateReadme(data) {
  const readmePath = path.join(__dirname, 'README.md');
  let readmeContent = `# My GitHub Profile\n\n`;
  data.forEach(line => {
    readmeContent += `${line}\n\n`;
  });
  
  const lastUpdateTime = new Date().toLocaleString('en-US', { timeZone: 'UTC' });
  readmeContent += `\n\n*Last updated: ${lastUpdateTime} UTC*`;
  
  fs.writeFileSync(readmePath, readmeContent, 'utf-8');
}

async function commitAndPushChanges() {
  const git = simpleGit();

  try {
    // Stash any local changes
    await git.stash();

    // Pull the latest changes
    await git.pull('origin', 'main');

    // Apply the stash
    await git.stash(['pop']);

    // Stage and commit the README.md file
>>>>>>> Stashed changes
    await git.add('./README.md');
    await git.commit('Update README with latest data from Google Sheets');

    // Push the changes to the remote repository
    await git.push('origin', 'main');
    console.log('Changes committed and pushed to GitHub');
  } catch (err) {
    if (err.message.includes('CONFLICT')) {
      console.error('Merge conflict detected. Aborting rebase...');
      await git.rebase(['--abort']);
      console.log('Rebase aborted.');
    } else {
      console.error('Error committing and pushing changes:', err);
    }
>>>>>>> Stashed changes
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