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

export default {
  setup(){
    const open = ref(false)
    const input = ref('')
    const waiting = ref(false)
    const bodyEl = ref(null)
    const messages = ref([
      { from:'bot', text:'안녕하세요! 우리동네 도우미 동네봇이에요 🙌\n동네 소식이나 축제가 궁금하면 물어보세요.' }
    ])

    async function scrollToBottom(){
      await nextTick()
      if(bodyEl.value) bodyEl.value.scrollTop = bodyEl.value.scrollHeight
    }

    // 응답을 기다리는 동안에도 다른 화면 기능을 계속 쓸 수 있도록 비동기로 처리
    function send(){
      const text = input.value && input.value.trim()
      if(!text || waiting.value) return
      messages.value.push({ from:'user', text })
      input.value = ''
      waiting.value = true
      scrollToBottom()
      // mock: 챗봇 API 연동 시 이 부분을 실제 요청으로 교체
      setTimeout(()=>{
        messages.value.push({ from:'bot', text: `"${text}"에 대한 답변을 준비 중이에요. 챗봇 API가 연결되면 실제 답변을 드릴게요! 😊` })
        waiting.value = false
        scrollToBottom()
      }, 900)
    }

    return { open, input, messages, waiting, bodyEl, send }
  }
}
</script>
