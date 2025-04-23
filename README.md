

## 🚀 项目目录结构

```
chatgpt-web-service/
├── client/                # 前端页面
│   └── index.html
├── server/                # Node.js 后端
│   ├── app.js
│   ├── routes/chat.js
│   ├── controllers/chatController.js
│   ├── services/openaiService.js
│   ├── db/
│   │   ├── chat.db
│   │   └── init.js
├── .env
├── package.json
└── README.md
```

---

## 🚀 第一步：初始化项目和安装依赖

```bash
mkdir chatgpt-web-service && cd chatgpt-web-service
npm init -y
npm install express openai dotenv sqlite3 cors uuid
```

---

##  `.env`

```env
OPENAI_API_KEY=sk-xxx-your-openai-key
PORT=3000
```

---

## 🚀 SQLite 初始化脚本 `server/db/init.js`

```js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/db/chat.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    role TEXT,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

db.close();
```

运行一次：

```bash
node server/db/init.js
```

---

## 🚀 OpenAI 封装 `server/services/openaiService.js`

```js
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function getChatResponse(messages) {
  const res = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages,
  });
  return res.data.choices[0].message.content;
}

module.exports = { getChatResponse };
```

---

## 🚀 Controller 逻辑 `server/controllers/chatController.js`

```js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/db/chat.db');
const { getChatResponse } = require('../services/openaiService');

const chatWithGPT = async (req, res) => {
  const { message, session_id } = req.body;

  if (!message || !session_id) {
    return res.status(400).json({ error: 'message and session_id are required' });
  }

  // 获取最近的上下文记录
  db.all(
    `SELECT role, content FROM messages WHERE session_id = ? ORDER BY timestamp DESC LIMIT 6`,
    [session_id],
    async (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const context = rows.reverse(); // 旧的在前
      context.push({ role: 'user', content: message });

      try {
        const reply = await getChatResponse(context);

        // 存入数据库
        const stmt = db.prepare(`INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)`);
        stmt.run(session_id, 'user', message);
        stmt.run(session_id, 'assistant', reply);
        stmt.finalize();

        res.json({ reply });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  );
};

module.exports = { chatWithGPT };
```

---

## 🚀 路由文件 `server/routes/chat.js`

```js
const express = require('express');
const router = express.Router();
const { chatWithGPT } = require('../controllers/chatController');

router.post('/', chatWithGPT);

module.exports = router;
```

---

## 🚀 启动服务器 `server/app.js`

```js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client'))); // 静态前端页面

const chatRoutes = require('./routes/chat');
app.use('/api/chat', chatRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
```

---

## 🚀 前端页面 `client/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>ChatGPT 多轮对话</title>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    #chat { border: 1px solid #ccc; padding: 10px; max-width: 600px; height: 400px; overflow-y: auto; }
    .msg { margin: 8px 0; }
    .user { color: blue; }
    .ai { color: green; }
  </style>
</head>
<body>
  <h2>ChatGPT 多轮对话演示</h2>
  <div id="chat"></div>
  <input id="input" type="text" placeholder="输入问题..." style="width: 400px;" />
  <button onclick="send()">发送</button>

  <script>
    const session_id = localStorage.getItem('session_id') || (crypto.randomUUID());
    localStorage.setItem('session_id', session_id);

    async function send() {
      const input = document.getElementById('input');
      const message = input.value.trim();
      if (!message) return;

      appendMessage('user', message);
      input.value = '';

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, session_id })
      });

      const data = await res.json();
      appendMessage('ai', data.reply);
    }

    function appendMessage(role, content) {
      const chat = document.getElementById('chat');
      const div = document.createElement('div');
      div.className = 'msg ' + role;
      div.textContent = `${role === 'user' ? '你' : 'AI'}：${content}`;
      chat.appendChild(div);
      chat.scrollTop = chat.scrollHeight;
    }
  </script>
</body>
</html>
```

---

## 🚀 启动项目

1. 运行 SQLite 初始化（只需一次）：
   ```bash
   node server/db/init.js
   ```

2. 启动服务：
   ```bash
   node server/app.js
   ```

3. 打开浏览器访问：
   ```
   http://localhost:3000
   ```

---

