<template>
  <div>
    <!-- loading skeleton -->
    <template v-if="loading">
      <div class="skeleton" v-for="i in 3" :key="i"></div>
    </template>

    <div v-else-if="!posts.length" class="card">
      <div class="empty">아직 게시글이 없어요.<br>첫 번째 동네 이야기를 남겨보세요! ✏️</div>
    </div>

    <div v-else>
      <div v-for="p in posts" :key="p.id" class="card post">
        <div class="post-head">
          <div>
            <div class="post-title">{{ p.title }}</div>
            <div class="post-meta">
              <span>👤 익명</span>
              <span>{{ formatDate(p.createdAt) }}</span>
              <span>👁 {{ p.viewCount }}</span>
            </div>
          </div>
        </div>
        <div class="post-body">{{ p.content }}</div>
        <div class="post-actions">
          <button :class="['like-btn', p.liked ? 'liked' : '']" @click="toggleLike(p)">
            <span>{{ p.liked ? '❤️' : '🤍' }}</span> 좋아요 <b>{{ p.likeCount }}</b>
          </button>
          <div class="spacer"></div>
          <button class="btn btn-ghost btn-sm" @click="openEdit(p)">수정</button>
          <button class="btn btn-danger btn-sm" @click="openDelete(p)">삭제</button>
        </div>

        <!-- inline edit panel -->
        <div v-if="editingId === p.id" class="post-edit-panel">
          <input v-model="editForm.title" class="input" placeholder="제목" />
          <textarea v-model="editForm.content" class="input textarea" placeholder="내용"></textarea>
          <input v-model="editForm.pwd" type="password" class="input" placeholder="비밀번호" @keyup.enter="submitEdit(p)" />
          <div class="modal-actions">
            <button class="btn btn-ghost btn-sm" @click="editingId = null">취소</button>
            <button class="btn btn-primary btn-sm" :disabled="busy" @click="submitEdit(p)">저장</button>
          </div>
        </div>
      </div>

      <!-- pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="page <= 1" @click="goPage(page - 1)">‹</button>
        <button
          v-for="n in totalPages" :key="n"
          :class="['page-btn', { current: n === page }]"
          @click="goPage(n)"
        >{{ n }}</button>
        <button class="page-btn" :disabled="page >= totalPages" @click="goPage(page + 1)">›</button>
      </div>
    </div>

    <!-- delete confirm modal -->
    <div v-if="deleting" class="modal-backdrop" @click.self="deleting = null">
      <div class="modal">
        <h3>게시글 삭제</h3>
        <p class="modal-desc">「{{ deleting.title }}」 글을 삭제하려면 비밀번호를 입력하세요.</p>
        <input v-model="deletePwd" type="password" class="input" placeholder="비밀번호" @keyup.enter="submitDelete" />
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="deleting = null">취소</button>
          <button class="btn btn-danger" :disabled="busy" @click="submitDelete">삭제</button>
        </div>
      </div>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<script>
import * as api from '../api'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const LIKED_KEY = 'liked_posts_v1'

function loadLikedSet(){
  try{ return new Set(JSON.parse(localStorage.getItem(LIKED_KEY) || '[]')) }catch(e){ return new Set() }
}
function saveLikedSet(set){
  try{ localStorage.setItem(LIKED_KEY, JSON.stringify([...set])) }catch(e){}
}

export default {
  emits:['reload'],
  setup(_, { emit }){
    const posts = ref([])
    const page = ref(1)
    const totalPages = ref(1)
    const loading = ref(true)
    const busy = ref(false)
    const toast = ref('')

    const editingId = ref(null)
    const editForm = ref({ title:'', content:'', pwd:'' })
    const deleting = ref(null)
    const deletePwd = ref('')

    const likedSet = loadLikedSet()

    function showToast(msg){
      toast.value = msg
      setTimeout(()=>{ toast.value = '' }, 2200)
    }

    async function load(){
      loading.value = true
      try{
        const data = await api.getPosts(page.value, 10)
        totalPages.value = data.meta?.totalPages || 1
        posts.value = (data.items || []).map(it=>({
          id: it.id,
          title: it.title,
          content: it.content,
          likeCount: it.likeCount || 0,
          viewCount: it.viewCount || 0,
          createdAt: it.time ? new Date(it.time).getTime() : Date.now(),
          liked: likedSet.has(it.id)
        }))
      }catch(err){
        console.error(err)
        posts.value = []
        showToast('게시글을 불러오지 못했습니다')
      }finally{
        loading.value = false
      }
    }

    function goPage(n){
      if(n < 1 || n > totalPages.value) return
      page.value = n
      load()
    }

    async function toggleLike(p){
      try{
        const res = p.liked ? await api.deleteLike(p.id) : await api.postLike(p.id)
        p.liked = !!res.liked
        p.likeCount = res.likeCount ?? p.likeCount
        if(p.liked) likedSet.add(p.id); else likedSet.delete(p.id)
        saveLikedSet(likedSet)
      }catch(err){
        console.error(err)
        showToast(err.message || '좋아요 처리에 실패했습니다')
      }
    }

    function openEdit(p){
      deleting.value = null
      editingId.value = p.id
      editForm.value = { title: p.title, content: p.content, pwd: '' }
    }

    async function submitEdit(p){
      const { title, content, pwd } = editForm.value
      if(!title.trim() || !content.trim() || !pwd) return showToast('제목, 내용, 비밀번호를 입력해 주세요')
      busy.value = true
      try{
        await api.patchPost(p.id, { title: title.trim(), content: content.trim(), pwd })
        editingId.value = null
        await load()
        emit('reload')
        showToast('게시글이 수정되었습니다')
      }catch(err){
        console.error(err)
        showToast(err.status === 401 || err.status === 403 ? '비밀번호가 일치하지 않습니다' : (err.message || '수정에 실패했습니다'))
      }finally{
        busy.value = false
      }
    }

    function openDelete(p){
      editingId.value = null
      deleting.value = p
      deletePwd.value = ''
    }

    async function submitDelete(){
      if(!deletePwd.value) return showToast('비밀번호를 입력해 주세요')
      busy.value = true
      try{
        await api.deletePost(deleting.value.id, deletePwd.value)
        deleting.value = null
        await load()
        emit('reload')
        showToast('게시글이 삭제되었습니다')
      }catch(err){
        console.error(err)
        if(err.status === 405) showToast('서버가 아직 삭제 기능을 지원하지 않습니다')
        else if(err.status === 401 || err.status === 403) showToast('비밀번호가 일치하지 않습니다')
        else showToast(err.message || '삭제에 실패했습니다')
      }finally{
        busy.value = false
      }
    }

    function formatDate(ts){
      if(!ts) return ''
      const d = new Date(ts)
      const diff = Date.now() - ts
      if(diff < 3600000) return Math.max(1, Math.floor(diff/60000)) + '분 전'
      if(diff < 86400000) return Math.floor(diff/3600000) + '시간 전'
      return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
    }

    function onPostCreated(){ page.value = 1; load() }

    onMounted(()=>{
      load()
      window.addEventListener('post-created', onPostCreated)
    })
    onBeforeUnmount(()=> window.removeEventListener('post-created', onPostCreated))

    return {
      posts, page, totalPages, loading, busy, toast,
      editingId, editForm, deleting, deletePwd,
      goPage, toggleLike, openEdit, submitEdit, openDelete, submitDelete, formatDate
    }
  }
}
</script>
