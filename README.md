# WatchYourBehind-Web 📡

WatchYourBehind 系统的可视化前端，基于 Vue 3 + ECharts + Tailwind CSS 构建。通过 WebSocket 实时接收雷达传感器数据，实现室内目标点的精准轨迹追踪与历史回溯功能。

## 🚀 功能特性

- **实时全息监控**: 通过 WebSocket 获取雷达感知的 X/Y 坐标数据，并在 ECharts 画布中实时渲染目标轨迹。
- **历史数据回溯**: 支持按时间段查询历史探测记录，并提供类似视频播放器的进度条回放功能。
- **设备交互控制**: 支持多设备切换，并能向雷达下发参数配置指令（如灵敏度调整、检测范围设定等）。
- **现代化 UI**: 采用 Tailwind CSS 设计，具有流畅的交互反馈和响应式布局。

## 🛠️ 技术栈

- **框架**: [Vue.js 3](https://vuejs.org/) (Composition API)
- **构建**: [Vite](https://vitejs.dev/)
- **图表**: [ECharts](https://echarts.apache.org/)
- **通信**: [Axios](https://axios-http.com/) (HTTP) + [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)

## 📂 项目结构

```text
WatchYourBehind-Web/
├── src/
│   ├── api/            # RESTful API 接口封装
│   ├── components/     # UI 组件 (雷达图、设备列表、控制面板等)
│   ├── utils/          # 工具类 (WebSocket 封装、请求拦截器)
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── public/             # 静态资源
└── index.html          # HTML 模板
```

## 📦 快速开始

### 1. 环境准备
确保您的机器已安装 [Node.js](https://nodejs.org/) (建议 v16+)。

### 2. 安装依赖
```bash
npm install
```

### 3. 本地开发
```bash
npm run dev
```
访问 `http://localhost:5173` 即可查看。

### 4. 项目构建
```bash
npm run build
```

## 🔗 相关项目

- [WatchYourBehind-Server](https://github.com/HiTechNinJa/WatchYourBehind-Server): 后端逻辑及数据库处理。
- [WatchYourBehind (Embedded)](https://github.com/HiTechNinJa/WatchYourBehind): ESP32 固件及硬件驱动代码。

---
Created by WatchYourBehind Team.
