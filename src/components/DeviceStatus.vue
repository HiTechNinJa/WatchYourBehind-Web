<template>
  <div class="h-full flex flex-col">
    <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
      <h2 class="text-base font-bold text-slate-800">设备状态</h2>
      <button 
        @click="refreshDevices" 
        class="text-xs px-2.5 py-1.5 rounded-full bg-slate-50 text-indigo-600 hover:bg-slate-100 font-medium transition-all active:scale-95 flex items-center gap-1"
        :disabled="loading"
      >
        <span v-if="loading" class="animate-spin text-xs">⟳</span>
        <span>{{ loading ? '刷新中' : '刷新' }}</span>
      </button>
    </div>

    <div v-if="error" class="p-4 text-rose-500 text-xs text-center bg-rose-50 mx-4 mt-4 rounded-lg">{{ error }}</div>

    <div v-if="devices.length === 0 && !loading" class="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
      <div class="text-4xl mb-2">📡</div>
      <p class="text-sm">暂无设备连接</p>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
      <div 
        v-for="device in devices" 
        :key="device.device_mac"
        class="group relative overflow-hidden transition-all duration-200 rounded-xl border p-4 cursor-pointer hover:shadow-md"
        :class="selectedMac === device.device_mac 
          ? 'bg-indigo-50/50 border-indigo-200 shadow-indigo-100 ring-1 ring-indigo-200' 
          : 'bg-white border-slate-100 hover:border-indigo-100'"
        @click="selectDevice(device)"
      >
        <div class="flex justify-between items-start mb-2">
          <div class="font-mono text-sm font-bold" :class="selectedMac === device.device_mac ? 'text-indigo-900' : 'text-slate-700'">
            {{ device.device_mac }}
          </div>
          <div class="flex items-center gap-1.5">
            <span class="relative flex h-2 w-2">
              <span v-if="device.online_status" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2" :class="device.online_status ? 'bg-emerald-500' : 'bg-slate-300'"></span>
            </span>
            <span class="text-xs font-medium" :class="device.online_status ? 'text-emerald-600' : 'text-slate-400'">
              {{ device.online_status ? '在线' : '离线' }}
            </span>
          </div>
        </div>
        
        <div class="grid grid-cols-1 gap-1 text-xs" :class="selectedMac === device.device_mac ? 'text-indigo-600/80' : 'text-slate-400'">
          <div class="flex justify-between">
            <span>固件: {{ device.firmware_ver }}</span>
            <span v-if="device.active_viewers > 0" class="flex items-center gap-1 text-sky-600 font-medium">
              <span>👥</span> {{ device.active_viewers }}
            </span>
          </div>
          <div class="text-[10px] opacity-70 mt-1">
             {{ formatTime(device.last_heartbeat) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue'
import { getDeviceList } from '@/api/device'

const emit = defineEmits(['select-device'])

const devices = ref([])
const loading = ref(false)
const error = ref(null)
const selectedMac = ref('')

const formatTime = (isoString) => {
  if (!isoString) return 'N/A'
  return new Date(isoString).toLocaleString()
}

const refreshDevices = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await getDeviceList()
    if (res.code === 200) {
      devices.value = res.data
      // 如果当前选中的设备不在列表中，或者没有选中设备且列表不为空，默认选中第一个
      if (devices.value.length > 0) {
        if (!selectedMac.value || !devices.value.find(d => d.device_mac === selectedMac.value)) {
          selectDevice(devices.value[0])
        }
      }
    } else {
      error.value = res.message || '获取设备列表失败'
    }
  } catch (err) {
    error.value = '网络请求失败，请检查后端服务'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const selectDevice = (device) => {
  selectedMac.value = device.device_mac
  emit('select-device', device)
}

onMounted(() => {
  refreshDevices()
  // 每30秒自动刷新一次
  setInterval(refreshDevices, 30000)
})
</script>
