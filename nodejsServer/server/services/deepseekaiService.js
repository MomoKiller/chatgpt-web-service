


const { OpenAI } = require('openai');


const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

async function getChatResponse(messages) {

  const res = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages, // 数组格式：[{ role: 'user', content: 'Hello!' }]
  });

  return res.choices[0].message.content;
}

module.exports = { getChatResponse };