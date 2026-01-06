<template>
  <div class="p-5 h-full flex flex-col">
    <h2 class="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
      <span class="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
      远程控制
    </h2>
    
    <div v-if="!deviceMac" class="flex-1 flex items-center justify-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm">
      请选择设备与云端交互
    </div>

    <div v-else class="space-y-5">
      <div class="flex items-center justify-between bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
        <span class="text-xs font-bold text-indigo-800 uppercase tracking-wide">Device</span>
        <span class="font-mono text-xs text-indigo-900 bg-white/50 px-2 py-0.5 rounded">{{ deviceMac }}</span>
      </div>

      <!-- 重启指令 -->
      <div>
        <h3 class="text-xs font-semibold text-slate-400 uppercase mb-2 ml-1 tracking-wider">System</h3>
        <button 
          @click="handleReboot" 
          class="w-full group bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 font-medium py-2.5 px-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
          :disabled="loading"
        >
          <span v-if="loading" class="animate-spin">⏳</span>
          <span v-else class="group-hover:rotate-180 transition-transform duration-500">🔄</span>
          <span class="text-sm">重启设备 (Reboot)</span>
        </button>
      </div>

      <!-- 模式切换 -->
      <div>
        <h3 class="text-xs font-semibold text-slate-400 uppercase mb-2 ml-1 tracking-wider">Mode</h3>
        <div class="grid grid-cols-2 gap-3">
          <button 
            @click="setMode(1)"
            class="py-2.5 px-3 rounded-xl text-sm font-medium border transition-all active:scale-95"
            :class="currentMode === 1 
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200 shadow-sm' 
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
          >
            普通模式
          </button>
          <button 
            @click="setMode(2)"
            class="py-2.5 px-3 rounded-xl text-sm font-medium border transition-all cursor-not-allowed opacity-60 bg-slate-50 text-slate-400 border-slate-200"
            disabled
            title="功能开发中"
          >
            守卫模式 (开发中)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { sendCommand } from '@/api/device'

const props = defineProps({
  deviceMac: {
    type: String,
    default: ''
  }
})

const loading = ref(false)
const currentMode = ref(1) // 默认普通模式，实际应从设备状态获取

const handleReboot = async () => {
  if (!confirm('确定要重启该设备吗？设备将暂时离线。')) return
  
  await sendCmd('REBOOT', {})
}

const setMode = async (mode) => {
  currentMode.value = mode
  await sendCmd('SET_MODE', { mode })
}

const sendCmd = async (type, payload) => {
  loading.value = true
  try {
    const res = await sendCommand({
      device_mac: props.deviceMac,
      command_type: type,
      payload: payload
    })
    
    if (res.code === 200) {
      alert(`指令 ${type} 已下发，等待设备响应`)
    } else {
      alert(`指令发送失败: ${res.message}`)
    }
  } catch (e) {
    console.error(e)
    alert('网络请求错误')
  } finally {
    loading.value = false
  }
}
</script>
