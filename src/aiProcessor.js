const OpenAI = require("openai");
const dotenv = require("dotenv");
const NodeCache = require("node-cache");

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;
const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

async function processText(text, mode = 'grammar') {
  if (!openai) {
    console.warn("No OpenAI API key set, returning original text.");
    return text;
  }

  const cacheKey = `${mode}:${text}`;
  const cachedResult = cache.get(cacheKey);
  if (cachedResult) return cachedResult;

  let systemPrompt;
  switch (mode) {
    case 'grammar':
      systemPrompt = "You are an assistant specializing in grammar and language correction. Please correct any grammatical errors in the user's text and respond only with the corrected version.";
      break;
    case 'summary':
      systemPrompt = "Analyze and summarize the provided text, condensing the information into clear, concise, and understandable segments. When possible, organize the summarized information using bullet points or numbered lists to enhance readability.";
      break;
    case 'formatter':
      systemPrompt = "You are an expert at formatting text for GitHub README files. Format the following text with a title, subheadings, bullet points, and hyperlinks as appropriate to create a professional profile.";
      break;
    default:
      throw new Error('Invalid mode');
  }

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: text }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });
    const result = response.choices[0].message.content;
    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return text; // Optionally return the original text if the API call fails
  }
}

async function processGrammarCheck(data) {
 
  const formattedData = await processText(data, 'grammar'); // Change 'grammar' to another mode if needed
  return formattedData;
}

async function generateAiFormattedData(data){
 
  const formattedData = await processText(data, 'formatter'); // Change 'grammar' to another mode if needed
  return formattedData;
}


module.exports = {
  processText,
  processGrammarCheck,
  generateAiFormattedData
};
