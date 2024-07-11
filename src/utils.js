const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');
const { DateTime } = require('luxon');

async function updateReadme(data) {
  const readmePath = path.join(__dirname, '../README.md');
  let readmeContent = `\n\n`;

  data.forEach(line => {
    readmeContent += `${line}\n\n`;
  });

  const utcTime = DateTime.now().setZone('UTC').toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
  const nlTime = DateTime.now().setZone('Europe/Amsterdam').toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
  readmeContent += `\n\n*Last updated: ${utcTime} UTC / ${nlTime} NL*`;

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

module.exports = {
  updateReadme,
  commitAndPushChanges,
};
