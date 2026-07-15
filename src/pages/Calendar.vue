<template>
  <div>
    <h2 class="page-title">🎉 축제 캘린더</h2>
    <p class="page-desc">공공데이터 기반으로 이번 달 서울의 축제·행사 일정을 확인하세요.</p>

    <div class="card">
      <div class="cal-header">
        <button class="cal-nav" @click="moveMonth(-1)" aria-label="이전 달">‹</button>
        <h3>{{ title }}</h3>
        <button class="cal-nav" @click="moveMonth(1)" aria-label="다음 달">›</button>
      </div>

      <div class="cal-grid">
        <div class="cal-dow" v-for="(d,i) in dows" :key="'dow'+i" :class="{sun: i===0}">{{ d }}</div>
        <div v-for="(cell, idx) in cells" :key="idx" :class="['cal-cell', { other: !cell.inMonth, today: cell.isToday }]">
          <div class="cal-date" :class="{ 'sun-date': cell.isSun }">{{ cell.display }}</div>
          <template v-for="(fest, fi) in cell.fests.slice(0, 3)" :key="fi">
            <span class="fest-chip" :title="fest.title">{{ fest.title }}</span>
          </template>
          <span v-if="cell.fests.length > 3" class="fest-more">+{{ cell.fests.length - 3 }}개 더</span>
        </div>
      </div>
    </div>

    <div class="fest-list">
      <h2 class="section-title">📅 {{ monthLabel }}월 축제 일정 <span class="badge">{{ monthFests.length }}건</span></h2>
      <p class="section-desc">진행 중이거나 예정된 행사 목록이에요.</p>

      <template v-if="loading">
        <div class="skeleton" v-for="i in 3" :key="i" style="height:100px"></div>
      </template>
      <div v-else-if="monthFests.length===0" class="card"><div class="empty">이번 달 예정된 축제가 없습니다 🍃</div></div>
      <template v-else>
        <div class="fest-item" v-for="f in monthFests" :key="f.id">
          <div class="fest-date-box">
            {{ shortDate(f.start) }}<span v-if="shortDate(f.start)!==shortDate(f.end)"><br>~ {{ shortDate(f.end) }}</span>
          </div>
          <img v-if="f.imageUrl" :src="f.imageUrl" class="fest-thumb" :alt="f.title" loading="lazy" @error="e => e.target.style.display='none'" />
          <div class="fest-info">
            <h4>{{ f.title }}</h4>
            <div class="fest-loc" v-if="f.address">📍 {{ f.address }}</div>
            <p v-if="f.description">{{ f.description }}</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import * as api from '../api'
import { ref, computed, onMounted } from 'vue'

export default {
  setup(){
    const today = new Date()
    const year = ref(today.getFullYear())
    const month = ref(today.getMonth()) // 0-based
    const loading = ref(true)

    const dows = ['일','월','화','수','목','금','토']

    function dateKey(y,m,d){ return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}` }

    const eventsList = ref([])
    function festivalsOn(key){ return (eventsList.value || []).filter(f=> f.start <= key && key <= f.end) }

    const title = computed(()=> `${year.value}년 ${month.value+1}월`)
    const monthLabel = computed(()=> month.value+1)

    const firstDow = computed(()=> new Date(year.value, month.value, 1).getDay())
    const lastDate = computed(()=> new Date(year.value, month.value+1, 0).getDate())

    const cells = computed(()=>{
      const totalCells = Math.ceil((firstDow.value + lastDate.value)/7)*7
      const prevLast = new Date(year.value, month.value, 0).getDate()
      const arr = []
      for(let i=0;i<totalCells;i++){
        const dayNum = i - firstDow.value +1
        let inMonth = true
        let display = dayNum
        let y=year.value, m=month.value
        if(dayNum<1){ inMonth=false; display = prevLast + dayNum; y= (month.value===0? year.value-1: year.value); m = (month.value===0?11:month.value-1) }
        else if(dayNum>lastDate.value){ inMonth=false; display = dayNum - lastDate.value; y = (month.value===11? year.value+1: year.value); m = (month.value===11?0:month.value+1) }
        const key = dateKey(y,m,display)
        const fests = inMonth ? festivalsOn(key) : []
        const isToday = key === dateKey(today.getFullYear(), today.getMonth(), today.getDate())
        const isSun = i%7===0
        arr.push({ display, inMonth, key, fests, isToday, isSun })
      }
      return arr
    })

    function moveMonth(delta){
      month.value += delta
      if(month.value<0){ month.value=11; year.value-- }
      if(month.value>11){ month.value=0; year.value++ }
      load()
    }

    const monthFests = computed(()=>{
      const monthStart = dateKey(year.value, month.value, 1)
      const monthEnd = dateKey(year.value, month.value, new Date(year.value, month.value+1,0).getDate())
      return (eventsList.value || [])
        .filter(f=> f.start <= monthEnd && f.end >= monthStart)
        .sort((a,b)=> a.start.localeCompare(b.start))
    })

    async function load(){
      loading.value = true
      try{
        const data = await api.getCalendars(year.value, month.value+1)
        // API 응답 필드(startDate/endDate/title/description/address)를 내부 형식으로 정규화
        eventsList.value = (data.items || []).map(it=>({
          id: it.id,
          title: it.title,
          start: it.startDate,
          end: it.endDate,
          imageUrl: it.imageUrl,
          description: it.description,
          address: it.address || it.place?.address || it.place?.title || ''
        }))
      }catch(err){
        console.error(err)
        eventsList.value = []
      }finally{
        loading.value = false
      }
    }

    onMounted(load)

    function shortDate(s){ return s ? s.slice(5).replace('-','.') : '' }

    return { title, dows, cells, moveMonth, monthFests, shortDate, monthLabel, loading }
  }
}
</script>
