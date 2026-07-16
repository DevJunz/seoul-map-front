<template>
  <div>
    <button class="chatbot-toggle" @click="open = !open" :aria-label="open ? '챗봇 닫기' : '챗봇 열기'">
      {{ open ? '✕' : '💬' }}
    </button>

    <div v-if="open" class="chatbot-window">
      <div class="chatbot-header">
        <div class="bot-avatar">🤖</div>
        <div>
          <div class="bot-name">동네봇</div>
          <div class="bot-status">우리동네 도우미 · 온라인</div>
        </div>
      </div>

      <div class="chatbot-body" ref="bodyEl">
        <div v-for="(m, i) in messages" :key="i" :class="['chat-msg', m.from]">
          <div class="chat-bubble">{{ m.text }}</div>
        </div>
        <div v-if="waiting" class="chat-msg bot">
          <div class="chat-bubble">
            <span class="typing"><span></span><span></span><span></span></span>
          </div>
        </div>
      </div>

      <div class="chatbot-input">
        <input v-model="input" @keyup.enter="send" placeholder="메시지를 입력하세요…" />
        <button @click="send" :disabled="!input.trim()">전송</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, nextTick } from 'vue'
import api from '../api'

const GREETING = '안녕하세요! 우리동네 도우미 동네봇이에요 🙌\n동네 소식이나 축제가 궁금하면 물어보세요.'

export default {
  setup(){
    const open = ref(false)
    const input = ref('')
    const waiting = ref(false)
    const bodyEl = ref(null)
    const messages = ref([
      { from:'bot', text: GREETING }
    ])

    async function scrollToBottom(){
      await nextTick()
      if(bodyEl.value) bodyEl.value.scrollTop = bodyEl.value.scrollHeight
    }

    // 최근 대화만 history로 전달 (인사말·에러 안내는 제외)
    function buildHistory(){
      return messages.value
        .filter(m => !m.error && m.text !== GREETING)
        .slice(-10)
        .map(m => ({ role: m.from === 'user' ? 'user' : 'assistant', content: m.text }))
    }

    // 응답을 기다리는 동안에도 다른 화면 기능을 계속 쓸 수 있도록 비동기로 처리
    async function send(){
      const text = input.value && input.value.trim()
      if(!text || waiting.value) return
      const history = buildHistory()
      messages.value.push({ from:'user', text })
      input.value = ''
      waiting.value = true
      scrollToBottom()
      try{
        const data = await api.sendChat(text, history)
        messages.value.push({ from:'bot', text: data.answer })
      }catch(err){
        messages.value.push({ from:'bot', text:'죄송해요, 답변을 가져오지 못했어요. 잠시 후 다시 시도해 주세요. 🙏', error:true })
      }finally{
        waiting.value = false
        scrollToBottom()
      }
    }

    return { open, input, messages, waiting, bodyEl, send }
  }
}
</script>
