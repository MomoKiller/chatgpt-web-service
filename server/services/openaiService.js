
const { OpenAI } = require('openai');

console.log(process.env.OPENAI_API_KEY);

// 使用 OpenAI 构造函数直接初始化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getChatResponse(messages) {

  const res = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages, // 数组格式：[{ role: 'user', content: 'Hello!' }]
  });

  return res.choices[0].message.content;
}

module.exports = { getChatResponse };

