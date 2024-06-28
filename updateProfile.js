const axios = require('axios');
const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');

const googleSheetUrl = 'https://docs.google.com/spreadsheets/d/1_dTIx3WxJIu2FV_xtpKQt-xzhl2XuMx_jyf4zYwG5lo/gviz/tq?tqx=out:json&gid=0';

async function fetchData() {
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
    // Abort any existing rebase
    await git.rebase(['--abort']).catch(() => {});

    // Stash any local changes
    await git.stash();

    // Pull the latest changes with rebase
    await git.pull('origin', 'main', { '--rebase': 'true' });

    // Apply the stash
    await git.stash(['pop']);

    // Stage and commit the README.md file
    await git.add('./README.md');
    await git.commit('Update README with latest data from Google Sheets');

    // Push the changes to the remote repository
    await git.push('origin', 'main');
    console.log('Changes committed and pushed to GitHub');
  } catch (err) {
    console.error('Error committing and pushing changes:', err);
    if (err.message.includes('CONFLICT')) {
      console.error('Merge conflict detected. Attempting to resolve...');
      try {
        // Automatically resolve conflicts by keeping the latest README.md
        await git.checkout(['--ours', 'README.md']);
        await git.add('README.md');
        await git.rebase(['--continue']);
        await git.push('origin', 'main');
        console.log('Conflicts resolved and changes pushed to GitHub');
      } catch (resolveErr) {
        console.error('Error resolving conflicts and pushing changes:', resolveErr);
        console.log('Attempting to reset and pull latest changes');
        await git.reset(['--hard', 'origin/main']);
        await git.pull('origin', 'main', { '--rebase': 'true' });
        await git.stash(['pop']);
        await git.add('./README.md');
        await git.commit('Update README with latest data from Google Sheets');
        await git.push('origin', 'main');
      }
    }
  }
}

async function main() {
  const data = await fetchData();
  await updateReadme(data);
  await commitAndPushChanges();
}

main().catch(console.error);
