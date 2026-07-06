<script setup>
import { ref } from 'vue'
import { useTestStore } from '../stores/test'

const store = useTestStore()
const showPreamble = ref(false)

const startTest = () => {
  store.startTest()
}

const showStory = () => {
  showPreamble.value = true
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-8" style="font-size: 11px;">
    <div class="w-[755px] max-w-[95%]">
      <!-- 主界面 -->
      <div v-show="!showPreamble" class="text-center">
        <!-- 标题 -->
        <div class="mb-10 animate-fade-in">
          <h1 class="text-5xl sm:text-6xl font-bold mb-4 gradient-text">
            🐲 奶龙人格测试
          </h1>
          <p class="text-2xl sm:text-3xl text-gray-400">
            你是谁？你将变成谁？
          </p>
        </div>

        <!-- 介绍卡片 -->
        <div class="glass-card glass-card-hover p-8 sm:p-12 mb-10 max-w-3xl mx-auto animate-fade-in" style="animation-delay: 0.2s;">
          <div class="text-7xl sm:text-8xl mb-8 animate-float">🐉</div>
          <h2 class="text-3xl sm:text-4xl font-semibold text-white mb-5">
            角色人格测试
          </h2>
          <p class="text-gray-400 mb-6 text-lg sm:text-xl">
            通过一系列情境选择，测出你的人格特征，找到与你最匹配的角色。
          </p>

          <div class="flex flex-wrap justify-center gap-4 mb-8">
            <div class="glass-card px-5 py-2.5 flex items-center gap-2">
              <span class="text-cyan-400">⏱️</span>
              <span class="text-gray-300 text-base">预计用时：12-15分钟</span>
            </div>
            <div class="glass-card px-5 py-2.5 flex items-center gap-2">
              <span class="text-purple-400">📝</span>
              <span class="text-gray-300 text-base">共45道题目</span>
            </div>
            <div class="glass-card px-5 py-2.5 flex items-center gap-2">
              <span class="text-red-400">❤️</span>
              <span class="text-gray-300 text-base">血量消失后会死亡，请谨慎选择</span>
            </div>
          </div>

          <button
            @click="showStory"
            class="btn-primary w-full py-4 px-10 text-xl sm:text-2xl font-bold animate-fade-in"
            style="animation-delay: 0.4s;"
          >
            <span class="flex items-center justify-center gap-3">
              <span>开始测试</span>
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>

        <p class="text-gray-500 text-base animate-fade-in" style="animation-delay: 0.6s;">
          <span class="inline-flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
            部分题目有隐藏彩蛋，仔细观察哦~
          </span>
        </p>
      </div>

      <!-- 前情提要 -->
      <div v-show="showPreamble" class="animate-fade-in">
        <div class="glass-card p-8 sm:p-12 max-w-4xl mx-auto">
          <h2 class="text-3xl sm:text-4xl font-bold text-white mb-8 text-center gradient-text">
            前情提要
          </h2>

          <div class="text-gray-300 leading-relaxed space-y-5 mb-10 text-lg sm:text-xl">
            <p class="glass-card p-4 border-l-4 border-purple-500">
              <span class="text-purple-400 font-semibold">你是奶龙</span>，你本可以和你的青梅竹马小猫一起过上没羞没臊的生活。
            </p>
            <p class="glass-card p-4 border-l-4 border-red-500">
              但<span class="text-red-400 font-semibold">天意的大手发力了</span>。公元2038年，御疯科技无限公司董事长<span class="text-cyan-400 font-semibold">李风秋</span>（原名李子丹）大力推进具身智能社会化，妄图通过具身智能统治世界。
            </p>
            <p class="glass-card p-4 border-l-4 border-amber-500">
              你和小猫发现了他的阴谋，你本想带着小猫远走高飞，却最终因为天意卷进了浩大的漩涡之中。
            </p>
            <p class="glass-card p-4 border-l-4 border-green-500 text-white font-medium">
              <span class="gradient-text font-bold">你的每一个选择，可能决定着另一个世界无辜生命的命运和生死。</span><br>
              请带着200%的认真和共情，打开音量，找一个不被打扰的地方开启下面的测试哦！              <span class="font-bold gradient-text">人生无法重来，即使手滑选错了也无法回退哦！</span>
            </p>
          </div>

          <button
            @click="startTest"
            class="btn-primary w-full py-4 px-10 text-xl sm:text-2xl font-bold"
          >
            <span class="flex items-center justify-center gap-3">
              <span>🐲 开始测试</span>
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>

          <p class="text-gray-600 text-sm text-center mt-8">
            本作品设计初衷为了圈米，无法代替专业心理测试，作者：李风秋
          </p>
        </div>
      </div>
    </div>
  </div>
</template>