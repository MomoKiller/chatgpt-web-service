<template>
  <section class="main-wrap">
    <div id="chat_container" ref="chatContainerRef">
      <div 
        class="wrapper" 
        v-for="item in containInfo" 
        :key="item.uniqueId"
        :class="{
          ai: item.isAi,
          use: !item.isAi
        }"
      >
          <div class="chat">
              <div class="profile">
                  <img 
                    :src="item.isAi ? bot : user"
                    :alt="item.isAi ? 'bot' : 'user'" 
                  />
              </div>
              <div class="message" :key="item.unique">{{ item.value }}</div>
          </div>
      </div>
    </div>
    <form ref="formRef">
      <input v-model="prompt" placeholder="Input" />
      <button type="submit">
        <img src="../assets/send.svg" alt="send" />
      </button>
    </form>
  </section>

</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
/* import bot from '../assets/bot.svg'
import user from '../assets/user.svg' */
import bot from '../assets/robot.jpg';
import user from '../assets/avator.jpg';

const formRef = ref();
const chatContainerRef = ref();
const containInfo = ref([]);
const prompt = ref();
const currentItem = ref({
  isAi: false,
  value: '',
  uniqueId: 0,
});

const loadInterval = ref();

const session_id = localStorage.getItem('session_id') || (crypto.randomUUID());
localStorage.setItem('session_id', session_id);


const loader = (uniqueId) => {
    
    const item = containInfo.value?.find((x) => x.uniqueId === uniqueId);

    item.value = ''

    loadInterval.value = setInterval(() => {
        // Update the text content of the loading indicator
        item.value += '.';

        // If the loading indicator has reached three dots, reset it
        if (item.value === '....') {
          item.value = '';
        }
    }, 300);
}

const typeText = (uniqueId, text = '') => {
    let index = 0
    const item = containInfo.value?.find((x) => x.uniqueId === uniqueId);
    let interval = setInterval(() => {
        if (index < text.length) {
            item.value += text?.charAt(index)
            index++
        } else {
            clearInterval(interval)
            interval = null;
        }
    }, 20)
}

const generateUniqueId = () => {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

const chatStripe = (isAi, value, uniqueId) => {

    containInfo.value.push({
      isAi,
      value,
      uniqueId,
    });
}

const handleSubmit = async (e) => {
    e.preventDefault()

    const uniqueId1 = generateUniqueId()
    chatStripe(false, prompt.value, uniqueId1);

    // to clear the textarea input 
    formRef.value.reset()

    // bot's chatstripe
    const uniqueId = generateUniqueId()
    chatStripe(true, '', uniqueId);

    // to focus scroll to the bottom 
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight;

    const currItem = containInfo.value?.find((x) => x.uniqueId === uniqueId);
    currItem.value = '...';
    loader(uniqueId);

    const params = JSON.stringify({ message: prompt.value, session_id });

    prompt.value = '';

    const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: params
    })
    clearInterval(loadInterval.value)
    loadInterval.value = null;
    currItem.value = ' ';

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.reply; // trims any trailing spaces/'\n' 

        const resStr = mdToChatText(parsedData);
        typeText(uniqueId, resStr );
    } else {
        const err = await response.text()

        currItem.value = "Something went wrong"
        alert(err)
    }
}

// ai 消息转文本
const mdToChatText = (md) => {
  return md
    .replace(/```[\s\S]*?```/g, '')           // 删除多行代码块
    .replace(/`([^`]*)`/g, '$1')               // 保留单行代码
    .replace(/^#{1,6}\s*(.*)/gm, '$1')          // 标题（#、##、###）
    .replace(/!\[.*?\]\(.*?\)/g, '')            // 删除图片
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')         // 保留链接文字
    .replace(/^>\s?(.*)/gm, '$1')               // 引用（> 引用内容）
    .replace(/^-{3,}$/gm, '')                   // 删除水平线（---）
    .replace(/^\s*[-*+]\s+/gm, '')              // 列表项（- 列表）
    .replace(/^\d+\.\s+/gm, '')                 // 有序列表（1. 列表）
    .replace(/\*\*(.*?)\*\*/g, '$1')             // 加粗
    .replace(/\*(.*?)\*/g, '$1')                 // 斜体
    .replace(/~~(.*?)~~/g, '$1')                 // 删除删除线
    .replace(/\r?\n{2,}/g, '\n\n')               // 多个换行合并
    .trim();
}

const initHis = async () => {

  const response = await fetch('http://localhost:3000/api/his', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: ''
  });
  debugger;
  if (response.ok) {
        const data = await response.json();
        const parsedData = data.reply; // trims any trailing spaces/'\n' 

        const resStr = mdToChatText(parsedData);
        typeText(uniqueId, resStr );
    } else {
        const err = await response.text()

        currItem.value = "Something went wrong"
        alert(err)
    }
};

onMounted(() => {

  // initHis();

  formRef.value.addEventListener('submit', handleSubmit)
  /* formRef.value.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
  }) */
});

onBeforeUnmount(() => {
});
</script>

<style scoped>
.main-wrap {
  width: 100vw;
  height: 100vh;
  background: #EDEDED;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}
#chat_container {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow-y: scroll;

  display: flex;
  flex-direction: column;
  gap: 10px;

  -ms-overflow-style: none;
  scrollbar-width: none;

  padding-bottom: 20px;
  scroll-behavior: smooth;
}

/* hides scrollbar */
#chat_container::-webkit-scrollbar {
  display: none;
}

.wrapper {
  width: 100%;
  padding: 15px;
}

.ai {
  /* background: #40414F; */
}

.chat {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
}

.profile {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  overflow: hidden;
  background: #EDEDED;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.ai .profile {
  background: #EDEDED;
}

.profile img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.message {
  background-color: #fff;
  border-radius: 4px;
  padding: 8px 16px;
  /* flex: 1; */
  color: #000000;
  font-size: 20px;
  max-width: 100%;
  /* overflow: hidden; */
  white-space: pre-wrap; 
  -ms-overflow-style: none;
  scrollbar-width: none;
  min-height: 40px;
  position: relative;
}

.use .message {
  background-color: #95EC69;
}

.use .message::before {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  right: -10px;
  top: 5px;
  border: 5px solid transparent;
  border-left: 5px solid #95EC69;
}

.ai .message::before {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  left: -10px;
  top: 5px;
  border: 5px solid transparent;
  border-right: 5px solid #fff;
}

/* 左右翻转 */
.use .chat {
  flex-direction: row-reverse
}

/* hides scrollbar */
.message::-webkit-scrollbar {
  display: none;
}

form {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 10px;
  background: #FFFFFF;

  display: flex;
  flex-direction: row;
  gap: 10px;
}

input {
  width: 100%;

  color: #000000;
  font-size: 18px;

  padding: 10px;
  background: transparent;
  border-radius: 5px;
  border: none;
  outline: none;
}

button {
  outline: 0;
  border: 0;
  cursor: pointer;
  background: transparent;
}

form img {
  width: 30px;
  height: 30px;
}

</style>
