
const Database = require('better-sqlite3');
const db = new Database('./server/db/chat.db');
// const { getChatResponse } = require('../services/openaiService');
const { getChatResponse } = require('../services/deepseekaiService');

const getHisTory = async (req, res) => {
  const { message, session_id } = req.body;

 /*  if (!message || !session_id) {
    return res.status(400).json({ error: 'message and session_id are required' });
  } */

  try {
    // 获取最近的上下文记录
    const rows = db.prepare(
      `SELECT role, content FROM messages WHERE session_id = ? ORDER BY timestamp DESC LIMIT 6`
    ).all(session_id); // 使用同步的 `.all()` 获取结果

    const context = rows.reverse(); // 旧的在前
    // context.push({ role: 'user', content: message });

 

    res.json({ reply: context });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getHisTory };
