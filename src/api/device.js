import request from '@/utils/request'

export function getDeviceList() {
  return request({
    url: '/api/v1/devices',
    method: 'get'
  })
}

export function getDeviceStatus(deviceMac) {
  return request({
    url: '/api/v1/device/status',
    method: 'get',
    params: { device_mac: deviceMac }
  })
}

export function getRadarHistory(params) {
  return request({
    url: '/api/v1/radar/history',
    method: 'get',
    params
  })
}

export function sendCommand(data) {
  return request({
    url: '/api/v1/device/command',
    method: 'post',
    data
  })
}
