import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './design-kit/fonts.css'
import './design-kit/theme.css'
import './design-kit/base.css'
import './design-kit/components.css'
import './styles.css'

// ensure a clientId cookie exists for backend like endpoints
function ensureClientIdCookie(){
	const name = 'clientId='
	if(document.cookie.split(';').some(c=>c.trim().startsWith(name))) return
	const id = localStorage.getItem('client_id') || (Math.random().toString(36).slice(2)+Date.now().toString(36))
	localStorage.setItem('client_id', id)
	// set cookie for 10 years
	const expires = new Date(Date.now() + 1000*60*60*24*365*10).toUTCString()
	document.cookie = `clientId=${id}; path=/; expires=${expires}; SameSite=Lax`;
}

ensureClientIdCookie()

createApp(App).use(router).mount('#app')
