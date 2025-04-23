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
