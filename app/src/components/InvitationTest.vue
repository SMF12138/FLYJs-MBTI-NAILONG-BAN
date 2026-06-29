<script setup>
import { ref, onUnmounted } from 'vue'
import { useTestStore } from '../stores/test'

const store = useTestStore()
const clickTime = ref(Date.now())
const termsTimer = ref(null)

const handleView = () => {
  const isQuick = Date.now() - clickTime.value < 2000
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

onUnmounted(() => {
  if (termsTimer.value) clearTimeout(termsTimer.value)
})
</script>

<template>
  <div class="test-container animate-fade-in px-6 py-6">
    <!-- 第一层：邀请函 -->
    <div v-if="store.invitationLayer === 1" class="bg-white rounded-2xl shadow-xl p-8">
      <h2 class="font-bold text-gray-800 mb-6 text-center text-2xl">📬 你收到了一封邀请函</h2>
      <p class="text-gray-600 mb-8 text-center text-lg">没等你做出决定，突然间，你收到了一封邀请函，你打算：</p>

      <div class="space-y-4">
        <button
          @click="handleView"
          class="w-full py-4 px-8 bg-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all text-xl"
        >
          打开邀请函
        </button>
        <button
          @click="handleIgnore"
          class="w-full py-4 px-8 border-2 border-gray-200 text-gray-600 font-bold rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all text-xl"
        >
          把它扔掉
        </button>
      </div>
    </div>

    <!-- 第二层：邀请函内容 -->
    <div v-else-if="store.showInvitationContent && !store.showHiddenTerms" class="bg-white rounded-2xl shadow-xl p-8">
      <div class="border-2 border-primary/20 rounded-2xl p-6 mb-8">
        <p class="text-gray-700 mb-3 text-lg">尊敬的奶龙，</p>
        <p class="text-gray-700 mb-3 text-lg">我们公司邀请你成为我们的荣誉CEO</p>
        <p class="text-gray-500 mb-5 text-sm">署名：御风科技、上林科技、景楼科技、散叶科技</p>
        <p class="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors text-xs" @click="handleTermsClick">
          *隐藏条款
        </p>
      </div>

      <button
        @click="handleClose"
        class="w-full py-4 px-8 border-2 border-gray-200 text-gray-600 font-bold rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all text-xl"
      >
        关闭
      </button>
    </div>

    <!-- 隐藏条款内容 -->
    <div v-else-if="store.showHiddenTerms" class="bg-white rounded-2xl shadow-xl p-8 relative">
      <div class="border-2 border-red-200 bg-red-50 rounded-2xl p-6 mb-8">
        <p class="text-gray-700 mb-3 font-medium text-xl">隐藏条款</p>
        <p class="text-gray-600 text-lg">您若成为我们的CEO，您将会获得时空穿越技术，但前提是，您必须将您的记忆备份提交给公司</p>
      </div>
      <p class="text-center text-gray-400 text-sm">10秒后自动关闭...</p>
      <!-- 隐藏关闭按钮 -->
      <button
        @click="handleHiddenTermsClose"
        class="absolute bottom-2 right-2 text-gray-200 hover:text-gray-400 text-sm transition-colors"
        style="background: transparent; border: none; cursor: pointer;"
      >
        ✕
      </button>
    </div>
  </div>
</template>
