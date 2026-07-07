<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useTestStore } from '../stores/test'

const store = useTestStore()

const cardNumber = ref('')
const clickTime = ref(null)
const inputError = ref('')
const showPrank = ref(false)
let prankTimeout = null

const isValidCard = (num) => /^\d{10,19}$/.test(num)

onUnmounted(() => {
  if (prankTimeout) clearTimeout(prankTimeout)
})

const handleConfirm = () => {
  const elapsed = clickTime.value ? Date.now() - clickTime.value : 0
  store.handle1YuanConfirm(elapsed)
}

const handleCancel = () => {
  if (prankTimeout) { clearTimeout(prankTimeout); prankTimeout = null }
  const elapsed = clickTime.value ? Date.now() - clickTime.value : 0
  store.handle1YuanCancel(elapsed)
}

const handleInput = () => {
  if (!cardNumber.value.trim()) {
    inputError.value = '请输入银行卡号'
    return
  }
  if (isValidCard(cardNumber.value.trim())) {
    inputError.value = ''
    showPrank.value = true
    prankTimeout = setTimeout(() => {
      store.handle1YuanInput(true)
    }, 2500)
  } else {
    inputError.value = '请输入10-19位纯数字银行卡号'
  }
}

clickTime.value = Date.now()
</script>

<template>
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-40 p-4 backdrop-blur-sm">
    <!-- 恶搞提示 -->
    <div v-if="showPrank" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
      <div class="glass-card max-w-md w-full p-8 text-center mx-4 glow-border">
        <div class="text-5xl mb-4 animate-bounce">😜</div>
        <p class="text-white text-lg font-medium leading-relaxed">
          嘻嘻，骗你的，作者是个穷B给不起米，这其实也是测试的一部分
        </p>
      </div>
    </div>

    <div class="glass-card max-w-md w-full overflow-hidden animate-fade-in glow-border">
      <!-- 标题 -->
      <div class="bg-gradient-to-r from-purple-600 to-cyan-600 p-5 text-white text-center relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 animate-pulse"></div>
        <h2 class="text-lg font-bold mb-1 relative z-10">感谢参与！</h2>
        <p class="text-white/80 text-sm relative z-10">本游戏正处于测试版</p>
      </div>
      
      <!-- 内容 -->
      <div class="p-6">
        <p class="text-gray-300 mb-5 text-center text-sm">
          输入您的支付宝/银行卡号，点击确定即可获得
          <span class="text-cyan-400 font-bold">1元</span>
          奖励
        </p>
        
        <!-- 输入框 -->
        <div v-if="store.yuanTestStage === 'input'" class="mb-5">
          <input
            v-model="cardNumber"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="19"
            placeholder="请输入银行卡号（10-19位数字）"
            class="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none text-sm text-white placeholder-gray-500 transition-colors"
          />
          <p v-if="inputError" class="text-red-400 text-xs mt-2">{{ inputError }}</p>
        </div>
        
        <!-- 按钮 -->
        <div class="flex gap-3">
          <button 
            @click="handleCancel"
            class="flex-1 py-2.5 px-5 border-2 border-gray-700 rounded-xl text-gray-400 text-sm hover:border-gray-500 hover:text-gray-200 transition-colors"
          >
            取消
          </button>
          
          <button 
            v-if="store.yuanTestStage === 'confirm'"
            @click="handleConfirm"
            class="flex-1 py-2.5 px-5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl hover:opacity-90 transition-opacity text-sm"
          >
            确定
          </button>
          
          <button 
            v-else
            @click="handleInput"
            class="flex-1 py-2.5 px-5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl hover:opacity-90 transition-opacity text-sm"
          >
            提交
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
