<template>
  <div class="card write-form">
    <h2 class="section-title">✏️ 익명 글쓰기</h2>
    <p class="section-desc">제목·내용·비밀번호만으로 작성하는 익명 게시판입니다. 비밀번호는 수정 시 필요해요.</p>
    <input v-model="title" placeholder="제목을 입력하세요" class="input" maxlength="100" @keyup.enter="create" />
    <textarea v-model="content" placeholder="우리 동네 이야기를 들려주세요" class="input textarea"></textarea>
    <div class="form-row">
      <input v-model="password" type="password" placeholder="비밀번호 (수정용)" class="input" @keyup.enter="create" />
      <button class="btn btn-accent" :disabled="submitting" @click="create">
        {{ submitting ? '게시 중…' : '게시하기' }}
      </button>
    </div>
    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<script>
import { ref } from 'vue'
import api from '../api'

export default {
  emits: ['created'],
  setup(_, { emit }){
    const title = ref('')
    const content = ref('')
    const password = ref('')
    const submitting = ref(false)
    const toast = ref('')

    function showToast(msg){
      toast.value = msg
      setTimeout(()=>{ toast.value = '' }, 2200)
    }

    async function create(){
      if(!title.value.trim() || !content.value.trim() || !password.value){
        return showToast('제목, 내용, 비밀번호를 모두 입력해 주세요')
      }
      submitting.value = true
      try{
        await api.createPost({ title: title.value.trim(), content: content.value.trim(), pwd: password.value })
        title.value=''; content.value=''; password.value=''
        emit('created')
        try{ window.dispatchEvent(new Event('post-created')) }catch(e){}
        showToast('게시글이 등록되었습니다 🎉')
      }catch(err){
        console.error(err)
        showToast(err.message || '게시글 작성에 실패했습니다')
      }finally{
        submitting.value = false
      }
    }

    return { title, content, password, submitting, toast, create }
  }
}
</script>
