const formatTextWithOpenAI = require('./formatter');

async function updateProfile(profileData) {
  let formattedBio = profileData.bio;

  if (profileData.useAIFormatter) {
    formattedBio = await formatTextWithOpenAI(profileData.bio);
  }

  // Proceed with updating the profile using the formattedBio
  // Example: console.log(`Updated profile bio: ${formattedBio}`);
  // Replace the above with actual profile update logic
  console.log(`Updated profile bio: ${formattedBio}`);
}

module.exports = updateProfile;
