<script setup>
import { useTestStore } from '../stores/test'
import { ref } from 'vue'

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
  <div class="min-h-screen flex items-center justify-center px-8" style="font-size: 22px;">
    <div class="w-[1510px] max-w-[95%]">
      <!-- 主界面 -->
      <div v-if="!showPreamble" class="text-center">
        <!-- 标题 -->
        <div class="mb-10">
          <h1 class="text-5xl sm:text-6xl font-bold text-white mb-4">
            🐲 奶龙人格测试
          </h1>
          <p class="text-2xl sm:text-3xl text-white/80">
            你是谁？你将变成谁？
          </p>
        </div>

        <!-- 介绍卡片 -->
        <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12 mb-10">
          <div class="text-7xl sm:text-8xl mb-8">🐉</div>
          <h2 class="text-3xl sm:text-4xl font-semibold text-gray-800 mb-5">
            角色人格测试
          </h2>
          <p class="text-gray-600 mb-6 text-lg sm:text-xl">
            通过一系列情境选择，测出你的人格特征，找到与你最匹配的角色。
          </p>
          <div class="text-lg text-gray-500 mb-8 space-y-2">
            <p>⏱️ 预计用时：12-15分钟</p>
            <p>📝 共30道题目</p>
            <p>❤️ 你有3滴血，某些选择会扣血</p>
          </div>
          <button
            @click="showStory"
            class="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-10 text-xl sm:text-2xl rounded-2xl hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            开始测试
          </button>
        </div>

        <!-- 底部提示 -->
        <p class="text-white/60 text-base">
          部分题目有隐藏彩蛋，仔细观察哦~
        </p>
      </div>

      <!-- 前情提要 -->
      <div v-else class="animate-fade-in">
        <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12">
          <!-- 标题 -->
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 text-center">
            前情提要
          </h2>

          <!-- 故事内容 -->
          <div class="text-gray-700 leading-relaxed space-y-5 mb-10 text-lg sm:text-xl">
            <p>
              <span class="text-primary font-semibold">你是奶龙</span>，你本可以和你的青梅竹马小猫一起过上没羞没臊的生活。
            </p>
            <p>
              但<span class="text-red-500 font-semibold">天意的大手发力了</span>。公元2038年，御疯科技无限公司董事长<span class="text-primary font-semibold">李风秋</span>（原名李子丹）大力推进具身智能社会化，妄图通过具身智能统治世界。
            </p>
            <p>
              你和小猫发现了他的阴谋，你本想带着小猫远走高飞，却最终因为天意卷进了浩大的漩涡之中。
            </p>
            <p class="text-gray-800 font-medium">
              你的每一个选择，可能决定着另一个世界无辜生命的命运和生死。<br>
              请带着200%的认真和共情，开启下面的测试。
            </p>
          </div>

          <!-- 开始按钮 -->
          <button
            @click="startTest"
            class="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-10 text-xl sm:text-2xl rounded-2xl hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            🐲 开始测试
          </button>

          <!-- 底部小字 -->
          <p class="text-gray-400 text-sm text-center mt-8">
            本作品设计初衷为了圈米，无法代替专业心理测试，作者：李风秋
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
