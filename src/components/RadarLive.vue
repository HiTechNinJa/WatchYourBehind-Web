<template>
  <div class="p-0 h-full flex flex-col relative bg-slate-50/50">
    <!-- 头部浮动 -->
    <div class="absolute top-4 left-4 z-10 flex items-center gap-3">
      <h2 class="text-lg font-bold text-slate-800 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-slate-200/50">
        雷达全息视图 
        <span v-if="currentDevice" class="text-xs font-mono font-normal text-slate-500 ml-2 border-l border-slate-300 pl-2">
          {{ currentDevice }}
        </span>
      </h2>
      <div class="flex items-center space-x-2 bg-white/90 backdrop-blur px-3 py-2 rounded-full shadow-sm border border-slate-200/50">
        <span 
          class="block w-2.5 h-2.5 rounded-full ring-2 ring-offset-1 ring-offset-white"
          :class="wsConnected ? 'bg-emerald-500 ring-emerald-100' : 'bg-rose-500 ring-rose-100'"
        ></span>
        <span class="text-xs font-medium" :class="wsConnected ? 'text-emerald-700' : 'text-rose-700'">
          {{ wsConnected ? 'LIVE' : 'OFFLINE' }}
        </span>
      </div>
    </div>

    <div v-if="!currentDevice" class="flex-1 flex flex-col items-center justify-center text-slate-300">
      <div class="text-6xl mb-4 font-thin opacity-50">📡</div>
      <p class="text-lg font-light tracking-wide">请选择设备接入信号</p>
    </div>

    <div v-show="currentDevice" class="flex-1 relative w-full h-full">
      <div ref="chartContainer" class="w-full h-full"></div>
      
      <!-- 悬浮数据面板 -->
      <div class="absolute bottom-6 right-6 w-56 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 text-xs overflow-hidden transition-all hover:bg-white/95">
        <div class="px-4 py-3 border-b border-slate-100 bg-slate-50/50 font-bold text-slate-700 flex justify-between items-center">
          <span>Target Data</span>
          <span class="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[10px]">{{ currentTargets.length }} OBJ</span>
        </div>
        <div v-if="currentTargets.length > 0" class="p-2 max-h-40 overflow-y-auto">
          <div v-for="(target, idx) in currentTargets" :key="idx" class="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors group">
             <span class="font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded w-8 text-center">{{ idx + 1 }}</span>
             <div class="text-right">
                <div class="text-slate-700 font-mono">X:{{ target.x }} Y:{{ target.y }}</div>
                <div class="text-[10px] text-slate-400">Speed: {{ target.speed }} cm/s</div>
             </div>
          </div>
        </div>
        <div v-else class="p-8 text-center text-slate-400 italic font-light">
          No Targets Detected
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import socket from '@/utils/websocket'

const props = defineProps({
  deviceMac: {
    type: String,
    default: ''
  }
})

const chartContainer = ref(null)
let myChart = null
const currentDevice = ref('')
const wsConnected = ref(false)
const currentTargets = ref([])

// 监听 props 变化
watch(() => props.deviceMac, (newMac) => {
  if (newMac && newMac !== currentDevice.value) {
    switchDevice(newMac)
  }
})

// 监听 WebSocket 状态
watch(() => socket.state.connected, (isConnected) => {
  wsConnected.value = isConnected
})

const initChart = () => {
  if (!chartContainer.value) return
  
  myChart = echarts.init(chartContainer.value)
  
  const option = {
    title: {
      text: '雷达目标轨迹 (Top View)',
      left: 'center',
      textStyle: { fontSize: 14, color: '#666' }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const d = params.data
        return `目标 ${params.dataIndex + 1}<br/>X: ${d[0]} mm<br/>Y: ${d[1]} mm<br/>速度: ${d[2]} cm/s`
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: 'X (mm)',
      min: -4000,
      max: 4000,
      splitLine: { show: true }
    },
    yAxis: {
      type: 'value',
      name: 'Y (mm)',
      min: 0,
      max: 8000,
      splitLine: { show: true }
    },
    series: [
      {
        name: '当前目标',
        type: 'scatter',
        symbolSize: 20,
        data: [],
        itemStyle: {
          color: '#ef4444',
          shadowBlur: 10,
          shadowColor: 'rgba(239, 68, 68, 0.5)'
        },
        markArea: {
          silent: true,
          itemStyle: {
            color: 'rgba(243, 244, 246, 0.5)'
          },
          data: [
            [
              { xAxis: -4000, yAxis: 0 },
              { xAxis: 4000, yAxis: 8000 }
            ]
          ]
        }
      }
    ],
    animationDurationUpdate: 200 // 平滑动画
  }
  
  myChart.setOption(option)
  
  // 响应式调整
  window.addEventListener('resize', resizeChart)
}

const resizeChart = () => {
  myChart && myChart.resize()
}

const switchDevice = (mac) => {
  currentDevice.value = mac
  currentTargets.value = []
  
  // 连接 WebSocket
  // 假设后端地址是 localhost:5000，实际应从配置读取
  const wsUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
  socket.connect(wsUrl, mac)
  
  // 如果图表未初始化，初始化之
  nextTick(() => {
    if (!myChart) initChart()
  })
}

const handleRadarData = (data) => {
  // 确保数据属于当前设备
  if (data.device_mac !== currentDevice.value) return
  
  const targets = data.targets || []
  currentTargets.value = targets
  
  // 转换数据格式给 ECharts: [x, y, speed, resolution]
  const chartData = targets.map(t => [t.x, t.y, t.speed, t.resolution])
  
  if (myChart) {
    myChart.setOption({
      series: [{
        data: chartData
      }]
    })
  }
}

onMounted(() => {
  // 注册 WebSocket 消息回调
  socket.onMessage(handleRadarData)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  socket.disconnect()
  if (myChart) myChart.dispose()
})
</script>
