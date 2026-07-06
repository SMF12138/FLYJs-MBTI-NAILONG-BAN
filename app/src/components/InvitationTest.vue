<script setup>
import { ref } from 'vue'
import { useTestStore } from '../stores/test'

const store = useTestStore()
const clickTime = ref(Date.now())

const handleView = () => {
  const isQuick = Date.now() - clickTime.value < 5000
  store.handleInvitationView(isQuick)
}

const handleIgnore = () => {
  store.handleInvitationIgnore()
}

const handleTermsClick = () => {
  store.handleHiddenTermsClicked()
}

const handleClose = () => {
  store.closeInvitationWithoutClick()
}

const handleHiddenTermsClose = () => {
  store.handleHiddenTermsCloseButton()
}
</script>

<template>
  <div class="test-container animate-fade-in px-6 py-6">
    <!-- 第一层：邀请函 -->
    <div v-if="store.invitationLayer === 1" class="glass-card p-8 glow-border">
      <div class="text-center mb-6">
        <div class="text-5xl mb-4 animate-float">📬</div>
        <h2 class="font-bold text-white text-center text-2xl gradient-text">你收到了一封邀请函</h2>
      </div>
      <p class="text-gray-400 mb-8 text-center text-lg">没等你做出决定，突然间，你收到了一封邀请函，你打算：</p>

      <div class="space-y-4">
        <button
          @click="handleView"
          class="w-full py-4 px-8 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold rounded-2xl hover:opacity-90 transition-all text-xl btn-primary"
        >
          <span class="flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            打开邀请函
          </span>
        </button>
        <button
          @click="handleIgnore"
          class="w-full py-4 px-8 border-2 border-gray-700 text-gray-400 font-bold rounded-2xl hover:border-gray-500 hover:text-gray-200 transition-all text-xl"
        >
          把它扔掉
        </button>
      </div>
    </div>

    <!-- 第二层：邀请函内容 -->
    <div v-else-if="store.showInvitationContent && !store.showHiddenTerms" class="glass-card p-8 glow-border">
      <div class="border-2 border-purple-500/30 rounded-2xl p-6 mb-8 bg-purple-500/5">
        <p class="text-gray-300 mb-3 text-lg">尊敬的奶龙，</p>
        <p class="text-gray-300 mb-3 text-lg">我们公司邀请你成为我们的荣誉CEO</p>
        <p class="text-gray-500 mb-5 text-sm">署名：御风科技、上林科技、景楼科技、散叶科技</p>
        <p class="text-gray-600 cursor-pointer hover:text-gray-400 transition-colors text-xs" @click="handleTermsClick">
          *隐藏条款
        </p>
      </div>

      <button
        @click="handleClose"
        class="w-full py-4 px-8 border-2 border-gray-700 text-gray-400 font-bold rounded-2xl hover:border-gray-500 hover:text-gray-200 transition-all text-xl"
      >
        关闭
      </button>
    </div>

    <!-- 隐藏条款内容 -->
    <div v-else-if="store.showHiddenTerms" class="glass-card p-8 relative glow-border">
      <div class="border-2 border-red-500/30 bg-red-500/5 rounded-2xl p-6 mb-8">
        <p class="text-red-400 mb-3 font-medium text-xl">隐藏条款</p>
        <p class="text-gray-300 text-lg">您若成为我们的CEO，您将会获得时空穿越技术，但前提是，您必须将您的记忆备份提交给公司</p>
      </div>
      <p class="text-center text-gray-500 text-sm">10秒后自动关闭...</p>
      <!-- 隐藏关闭按钮 -->
      <button
        @click="handleHiddenTermsClose"
        class="absolute bottom-2 right-2 text-gray-700 hover:text-gray-400 text-sm transition-colors"
        style="background: transparent; border: none; cursor: pointer;"
      >
        ✕
      </button>
    </div>
  </div>
</template>
