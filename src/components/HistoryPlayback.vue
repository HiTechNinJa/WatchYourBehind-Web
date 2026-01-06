<template>
  <div class="bg-white h-full flex flex-col rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
    
    <!-- 顶部控制栏 -->
    <div class="p-4 border-b border-slate-100 bg-white z-10">
      <div class="flex flex-wrap items-end gap-4">
        
        <!-- 设备选择 -->
        <div class="flex-1 min-w-[200px] max-w-xs">
          <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Target Device</label>
          <div class="relative">
            <select 
              v-model="selectedDevice" 
              class="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            >
              <option value="" disabled>选择回溯设备</option>
              <option v-for="d in devices" :key="d.device_mac" :value="d.device_mac">
                {{ d.device_mac }}
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <!-- 时间选择 -->
        <div class="flex items-center gap-2">
           <div>
              <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">From</label>
              <input type="datetime-local" v-model="startTime" class="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono">
           </div>
           <div class="text-slate-300 pb-3">→</div>
           <div>
              <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">To</label>
              <input type="datetime-local" v-model="endTime" class="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono">
           </div>
        </div>

        <!-- 查询按钮 -->
        <button 
          @click="fetchHistory" 
          class="mb-[1px] px-6 py-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-95 font-medium flex items-center gap-2"
          :disabled="loading || !selectedDevice"
        >
          <span v-if="loading" class="animate-spin">⟳</span>
          <span>查询回放</span>
        </button>
      </div>
    </div>

    <!-- 播放与时间轴 -->
    <div v-if="historyData.length > 0" class="absolute bottom-6 left-6 right-6 z-20 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-4 transition-all hover:bg-white">
      <div class="flex items-center gap-4">
        <button 
          @click="togglePlay" 
          class="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-all active:scale-90 shadow-indigo-200 shadow-md"
        >
          <span v-if="isPlaying">❚❚</span>
          <span v-else class="ml-1">▶</span>
        </button>

        <div class="flex-1 flex flex-col justify-center">
           <input 
            type="range" 
            min="0" 
            :max="historyData.length - 1" 
            v-model.number="currentIndex" 
            class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all"
            @input="pause"
          >
          <div class="flex justify-between mt-1 px-1">
             <span class="text-[10px] text-slate-400 font-mono">00:00</span>
             <span class="text-[10px] text-slate-400 font-mono">End</span>
          </div>
        </div>

        <div class="flex-shrink-0 bg-slate-100 rounded-lg px-3 py-1.5 border border-slate-200">
           <div class="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Current Time</div>
           <div class="text-sm font-mono text-indigo-600 font-bold min-w-[140px] text-center">
             {{ currentFrameTime || '--:--:--' }}
           </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="flex-1 relative bg-slate-50/50">
      <div v-if="historyData.length === 0 && !loading" class="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
        <div class="text-6xl mb-4 font-thin opacity-50">📽️</div>
        <p class="text-lg font-light tracking-wide">请选择时间段进行回放</p>
      </div>
      <div ref="chartContainer" class="w-full h-full"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import * as echarts from 'echarts'
import { getDeviceList, getRadarHistory } from '@/api/device'

const devices = ref([])
const selectedDevice = ref('')
const startTime = ref('')
const endTime = ref('')
const loading = ref(false)
const historyData = ref([]) // 格式: [{ timestamp, targets: [] }, ...]
const currentIndex = ref(0)
const isPlaying = ref(false)
const chartContainer = ref(null)
let myChart = null
let playTimer = null

// 初始化默认时间范围
const initTimeRange = () => {
    // 设置为用户指定的默认时间段
  startTime.value = "2026-01-02T13:25:00"
  endTime.value = "2026-01-02T13:27:00"
}

// 获取设备列表
const loadDevices = async () => {
  try {
    const res = await getDeviceList()
    if (res.code === 200) {
      devices.value = res.data
      if (devices.value.length > 0) {
        selectedDevice.value = devices.value[0].device_mac
      }
    }
  } catch (e) {
    console.error(e)
  }
}

// 查询历史数据
const fetchHistory = async () => {
  if (!selectedDevice.value) return
  
  loading.value = true
  pause()
  historyData.value = []
  currentIndex.value = 0
  
  try {
    // 将 datetime-local 转为 ISO 字符串或后端接受的格式
    // 假设后端接受 ISO 格式
    const startIso = new Date(startTime.value).toISOString()
    const endIso = new Date(endTime.value).toISOString()
    
    const res = await getRadarHistory({
      device_mac: selectedDevice.value,
      start_time: startIso,
      end_time: endIso
    })
    
    if (res.code === 200) {
      // 后端返回的数据可能是扁平的 log 列表，需要按 batch_id 或 timestamp 分组
      // 假设后端返回: [{ batch_id, created_at, pos_x, pos_y, ... }, ...]
      const rawList = res.data
      
      // 分组逻辑
      const groups = {}
      rawList.forEach(item => {
        const key = item.batch_id || item.created_at
        if (!groups[key]) {
          groups[key] = {
            timestamp: item.created_at,
            targets: []
          }
        }
        groups[key].targets.push({
          x: item.pos_x,
          y: item.pos_y,
          speed: item.speed
        })
      })
      
      // 转为数组并按时间排序
      historyData.value = Object.values(groups).sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      )
      
      if (historyData.value.length > 0) {
        renderFrame(0)
      } else {
        alert('该时间段内无数据')
      }
    }
  } catch (e) {
    console.error(e)
    alert('查询失败')
  } finally {
    loading.value = false
  }
}

// 图表初始化
const initChart = () => {
  if (!chartContainer.value) return
  myChart = echarts.init(chartContainer.value)
  const option = {
    // title: { text: '历史轨迹回放', left: 'center', textStyle: { fontSize: 14, color: '#666' } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '4%', containLabel: true },
    xAxis: { 
      type: 'value', 
      min: -4000, 
      max: 4000,
      splitLine: { lineStyle: { color: '#e2e8f0' } }, // border-slate-200
      axisLine: { lineStyle: { color: '#94a3b8' } },
      axisLabel: { color: '#64748b' }
    },
    yAxis: { 
      type: 'value', 
      min: 0, 
      max: 8000,
      splitLine: { lineStyle: { color: '#e2e8f0' } },
      axisLine: { lineStyle: { color: '#94a3b8' } },
      axisLabel: { color: '#64748b' }
    },
    series: [{
      type: 'scatter',
      symbolSize: 12,
      data: [],
      itemStyle: { 
        color: '#4f46e5', // indigo-600
        shadowBlur: 10,
        shadowColor: 'rgba(79, 70, 229, 0.5)'
      } 
    }]
  }
  myChart.setOption(option)
}

// 渲染某一帧
const renderFrame = (index) => {
  if (!myChart || !historyData.value[index]) return
  const frame = historyData.value[index]
  const data = frame.targets.map(t => [t.x, t.y])
  
  myChart.setOption({
    // title: { subtext: `时间: ${new Date(frame.timestamp).toLocaleString()}` },
    series: [{ data }]
  })
}

// 播放控制
const togglePlay = () => {
  if (isPlaying.value) {
    pause()
  } else {
    play()
  }
}

const play = () => {
  if (currentIndex.value >= historyData.value.length - 1) {
    currentIndex.value = 0
  }
  isPlaying.value = true
  playTimer = setInterval(() => {
    if (currentIndex.value < historyData.value.length - 1) {
      currentIndex.value++
    } else {
      pause()
    }
  }, 200) // 200ms 一帧
}

const pause = () => {
  isPlaying.value = false
  if (playTimer) {
    clearInterval(playTimer)
    playTimer = null
  }
}

// 监听进度变化
watch(currentIndex, (newVal) => {
  renderFrame(newVal)
})

const currentFrameTime = computed(() => {
  if (!historyData.value[currentIndex.value]) return ''
  return new Date(historyData.value[currentIndex.value].timestamp).toLocaleTimeString()
})

let resizeObserver = null

onMounted(() => {
  initTimeRange()
  loadDevices()
  initChart()
  
  // 使用 ResizeObserver 自动监听容器大小变化
  if (chartContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      myChart && myChart.resize()
    })
    resizeObserver.observe(chartContainer.value)
  }
})

onUnmounted(() => {
  pause()
  if (resizeObserver) resizeObserver.disconnect()
  if (myChart) myChart.dispose()
})
</script>
