const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateEmail(description) {

  const prompt = `
  Write a professional marketing email.

  Description: ${description}

  Return:
  Subject:
  Body:
  `;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini", // Updated to a valid model name, gpt-4.1-mini isn't a standard model!
    messages: [
      { role: "user", content: prompt }
    ]
  });

  return response.choices[0].message.content;
}

module.exports = generateEmail;