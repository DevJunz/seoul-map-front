import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './design-kit/fonts.css'
import './design-kit/theme.css'
import './design-kit/base.css'
import './design-kit/components.css'
import './styles.css'

createApp(App).use(router).mount('#app')
