const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateEmail(description) {

  const prompt = `
  Write a professional marketing email.
  Description: ${description}
  `;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini", // Updated to a valid model name
    response_format: { type: "json_object" },
    messages: [
      { 
        role: "system", 
        content: "You are an expert marketing email copywriter. You must output the result in structured JSON format with two keys: 'subject' and 'body'. Do not include markdown blocks or any conversational text."
      },
      { 
        role: "user", 
        content: prompt 
      }
    ]
  });

  return JSON.parse(response.choices[0].message.content);
}

module.exports = generateEmail;