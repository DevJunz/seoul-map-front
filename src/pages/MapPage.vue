<template>
  <div>
    <h2 class="page-title">🗺️ 동네 지도</h2>
    <p class="page-desc">서울의 관광지·문화시설·축제 장소를 카테고리별로 살펴보세요.</p>

    <div class="map-controls">
      <button :class="['type-btn', { active: activeType==='all' }]" @click="selectType('all')">전체</button>
      <button
        v-for="t in typeMap" :key="t.id"
        :class="['type-btn', { active: activeType===t.id }]"
        @click="selectType(t.id)"
      >
        <span class="dot" :style="{ background: t.color }"></span>{{ t.name }}
      </button>
    </div>

    <div class="map-meta">
      <span>선택: <strong>{{ selectedTypeName }}</strong></span>
      <span>표시된 장소 <strong>{{ shownCount }}</strong>곳</span>
    </div>

    <div id="map" class="map-container"></div>
  </div>
</template>

<script>
import { onMounted, ref, computed } from 'vue'
import api from '../api'

export default {
  setup(){
    const map = ref(null)
    const places = ref([])
    const activeType = ref('all')
    const shownCount = ref(0)

    const typeMap = [
      { id: 12, name: '관광지', color: '#5B7553' },
      { id: 14, name: '문화시설', color: '#4A6FA5' },
      { id: 15, name: '축제·공연·행사', color: '#D4552A' },
      { id: 25, name: '여행코스', color: '#8E6FB0' },
      { id: 28, name: '레포츠', color: '#3C9A8F' },
      { id: 32, name: '숙박', color: '#C99B3F' },
      { id: 38, name: '쇼핑', color: '#D06A8C' }
    ]

    function typeOf(id){ return typeMap.find(t=> Number(t.id) === Number(id)) }

    const selectedTypeName = computed(()=>{
      if(activeType.value==='all') return '전체'
      const t = typeOf(activeType.value)
      return t ? t.name : String(activeType.value)
    })

    function selectType(id){
      activeType.value = id
      renderMarkers()
    }

    let markers = []
    function renderMarkers(){
      markers.forEach(m=>m.remove())
      markers = []
      const list = places.value.filter(p=>{
        if(activeType.value==='all') return true
        return Number(p.contentTypeId) === Number(activeType.value)
      })
      list.forEach(p=>{
        if(p.mapY == null || p.mapX == null) return
        const t = typeOf(p.contentTypeId)
        const color = t?.color || '#8B857A'
        const m = L.circleMarker([p.mapY, p.mapX], {
          radius: 7, color: '#fff', weight: 1.5,
          fillColor: color, fillOpacity: 0.92
        }).addTo(map.value)

        const img = p.firstImageUrl ? `<img src="${p.firstImageUrl}" alt="" loading="lazy" onerror="this.remove()">` : ''
        m.bindPopup(`
          <div class="place-popup">
            <div class="pp-cat" style="background:${color}22;color:${color}">${t?.name || '기타'}</div>
            <div class="pp-title">${escapeHtml(p.title)}</div>
            <div class="pp-addr">${escapeHtml(p.address || '')}</div>
            ${img}
          </div>
        `, { maxWidth: 260 })
        markers.push(m)
      })
      shownCount.value = markers.length
    }

    function escapeHtml(s){
      return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
    }

    onMounted(async ()=>{
      // 장소가 수천 개라 SVG 대신 캔버스 렌더링으로 성능 확보
      map.value = L.map('map', { preferCanvas: true }).setView([37.5665, 126.9780], 11)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19
      }).addTo(map.value)

      try{
        const cacheKey = 'places_cache_v2'
        let items = null
        const cached = localStorage.getItem(cacheKey)
        if(cached){
          try{ items = JSON.parse(cached) }catch(e){ items = null }
        }
        if(!items){
          const data = await api.getPlaces()
          items = data.items || []
          try{ localStorage.setItem(cacheKey, JSON.stringify(items)) }catch(e){ console.warn('Unable to cache places', e) }
        }
        places.value = items.map(p=>({
          id: p.id,
          title: p.title,
          contentTypeId: p.contentTypeId,
          mapX: p.mapX,
          mapY: p.mapY,
          address: p.address,
          firstImageUrl: p.firstImageUrl
        }))
        renderMarkers()
      }catch(err){ console.error(err); places.value=[] }
    })

    return { activeType, typeMap, selectType, selectedTypeName, shownCount }
  }
}
</script>
