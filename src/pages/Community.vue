<template>
  <div>
    <h2 class="page-title">💬 동네 이야기</h2>
    <p class="page-desc">이웃과 자유롭게 소식을 나눠보세요. 로그인 없이 누구나 쓸 수 있어요.</p>
    <PostForm />
    <PostList />
  </div>
</template>

<script>
import PostForm from '../components/PostForm.vue'
import PostList from '../components/PostList.vue'

export default {
  components:{ PostForm, PostList }
}
</script>
