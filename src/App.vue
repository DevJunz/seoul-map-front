<template>
  <div id="app">
    <header class="app-header">
      <div class="header-inner container">
        <div class="logo">
          <span><span class="logo-mark">📍</span> 우리동네</span>
          <small>공공데이터 기반 지역 커뮤니티</small>
        </div>
        <nav class="nav-tabs">
          <router-link class="tab" to="/" exact-active-class="active">💬 커뮤니티</router-link>
          <router-link class="tab" to="/map" active-class="active">🗺️ 동네 지도</router-link>
          <router-link class="tab" to="/calendar" active-class="active">🎉 축제 캘린더</router-link>
        </nav>
      </div>
    </header>
    <main>
      <router-view />
    </main>
    <Chatbot />
  </div>
</template>

<script>
import Chatbot from './components/Chatbot.vue'
export default {
  components: { Chatbot }
}
</script>
