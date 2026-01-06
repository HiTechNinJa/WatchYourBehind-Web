<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-600">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 bg-indigo-600 rounded-xl shadow-indigo-200 shadow-md flex items-center justify-center text-white font-bold text-lg">
            W
          </div>
          <h1 class="text-xl font-bold text-slate-800 tracking-tight">WatchYourBehind</h1>
        </div>
        <div class="flex items-center space-x-2 bg-slate-100/50 p-1 rounded-lg border border-slate-200/50">
          <button 
            @click="currentView = 'live'"
            class="px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ease-out"
            :class="currentView === 'live' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'"
          >
            实时监控
          </button>
          <button 
            @click="currentView = 'history'"
            class="px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ease-out"
            :class="currentView === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'"
          >
            历史回溯
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- 实时监控视图 -->
      <div v-show="currentView === 'live'" class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
        <!-- 左侧：设备列表 + 指令控制 (占3列) -->
        <div class="lg:col-span-3 flex flex-col gap-6 h-full overflow-hidden">
          <div class="flex-1 min-h-0 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <DeviceStatus @select-device="handleDeviceSelect" />
          </div>
          <div class="flex-shrink-0 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <CommandControl :device-mac="selectedDeviceMac" />
          </div>
        </div>

        <!-- 右侧：实时监控 (占9列) -->
        <div class="lg:col-span-9 h-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
          <RadarLive :device-mac="selectedDeviceMac" />
        </div>
      </div>

      <!-- 历史回溯视图 -->
      <div v-show="currentView === 'history'" class="h-[calc(100vh-8rem)]">
        <HistoryPlayback />
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DeviceStatus from './components/DeviceStatus.vue'
import RadarLive from './components/RadarLive.vue'
import CommandControl from './components/CommandControl.vue'
import HistoryPlayback from './components/HistoryPlayback.vue'

const selectedDeviceMac = ref('')
const currentView = ref('live') // 'live' or 'history'

const handleDeviceSelect = (device) => {
  console.log('Selected Device:', device.device_mac)
  selectedDeviceMac.value = device.device_mac
}
</script>

<style>
/* 全局样式调整 */
html, body {
  height: 100%;
  margin: 0;
}
</style>
