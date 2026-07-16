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
    <footer class="app-footer">
      <div class="footer-inner">
        <div class="footer-license">
          <a
            class="kogl-badge"
            href="https://www.kogl.or.kr/info/licenseType3.do"
            target="_blank"
            rel="noopener noreferrer"
          >공공누리 제3유형</a>
          <span class="kogl-terms">출처표시 · 변경금지</span>
        </div>
        <p class="footer-text">
          본 서비스는 한국관광공사에서 공공누리 제3유형으로 개방한
          국문 관광정보(TourAPI)를 이용하고 있으며, 해당 저작물은
          <a href="https://api.visitkorea.or.kr" target="_blank" rel="noopener noreferrer">한국관광공사 TourAPI</a>에서
          무료로 받으실 수 있습니다. 원저작물을 변경하지 않고 제공하며,
          출처를 표시합니다.
        </p>
        <p class="footer-copy">© 2026 우리동네 · 공공데이터 기반 지역 커뮤니티</p>
      </div>
    </footer>
    <Chatbot />
  </div>
</template>

<script>
import Chatbot from './components/Chatbot.vue'
export default {
  components: { Chatbot }
}
</script>
