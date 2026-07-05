import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())

// 全局错误边界：防止白屏
app.config.errorHandler = (err, vm, info) => {
  console.error('[全局错误]', err, info)
}

app.mount('#app')
