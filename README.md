# MeetMind · 会议助手

> 一款面向个人与小团队的 AI 驱动会议全流程管理工具

[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages-blue?logo=github)](https://orchidlemon.github.io/CoferenceAssistant/)

**在线体验：** [https://orchidlemon.github.io/CoferenceAssistant/](https://orchidlemon.github.io/CoferenceAssistant/)

---

## 项目简介

MeetMind 是一款纯前端的会议助手应用，无需后端服务器，所有数据本地存储，AI 调用直连各大模型 API。覆盖**会前准备 → 会中执行 → 会后跟进**完整闭环：

- 会前：AI 自动生成结构化议程，结合历史遗留 Actions 做上下文预热
- 会后：上传录制文件 / 粘贴文字稿，AI 生成摘要、提取决策与 Action Items
- 追踪：统一管理所有待办事项，可视化完成率与逾期情况

> **本项目为美团 AI Coding 课题作业**，用于演示 AI 辅助软件工程的完整开发流程。

---

## 功能特性

### 核心功能

| 模块 | 功能 |
|------|------|
| 今日概览 | 实时展示今日会议、待处理 Actions、完成率、本周数据 |
| 全部会议 | 创建/管理会议，支持多平台（Zoom / 腾讯 / 飞书），参与者管理 |
| 会前准备 | ✨ AI 生成结构化议程（含遗留事项跟进） |
| 会后纪要 | ✨ AI 解析文字稿，生成摘要 + 关键决策 + Action Items |
| Action 追踪 | 看板式管理，支持优先级 / 责任人 / 截止日 / 多维筛选 |
| 人员管理 | 联系人档案，历史互动统计 |
| AI 洞察 | ✨ 分析会议频率、Action 完成率，给出效能建议 |
| Prompt 模板 | 用户可自定义三类 AI Prompt，支持还原默认 |

### 技术亮点

- **纯浏览器直调 AI**：支持 DeepSeek / 豆包 / 通义千问 / GPT / Gemini / Claude，无需中间服务器
- **发言人映射**：文字稿中的匿名代号（A、B、C）可手动映射为真实姓名，生成前/后均可替换
- **多用户隔离**：基于 `localStorage` 的 per-user 数据隔离，多账号互不干扰
- **零依赖 UI**：纯 CSS 变量主题，无任何 UI 组件库

---

## 技术栈

```
Vue 3          Composition API + <script setup>
Vite 5         构建工具
Vanilla CSS    CSS 变量主题系统，无 UI 框架
localStorage   数据持久化（per-user 隔离）
Fetch API      直连 AI 服务（OpenAI-compat / Anthropic 双格式）
```

---

## 快速开始

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/orchidlemon/CoferenceAssistant.git
cd CoferenceAssistant

# 安装依赖
npm install

# 启动开发服务器
npm run dev
# → http://localhost:3000
```

### 演示账号

应用内置演示数据，直接注册/登录即可体验全部功能（数据存储在本地浏览器）。

---

## AI 配置

首次使用需在「AI 设置」页面配置 API Key。支持以下提供商：

| 提供商 | 推荐模型 | 获取 Key |
|--------|----------|----------|
| DeepSeek | deepseek-chat | [platform.deepseek.com](https://platform.deepseek.com/api_keys) |
| 豆包（火山引擎） | 自填 Endpoint ID | [console.volcengine.com](https://console.volcengine.com/ark) |
| 通义千问 | qwen-plus | [bailian.console.aliyun.com](https://bailian.console.aliyun.com) |
| GPT | gpt-4o-mini | [platform.openai.com](https://platform.openai.com/api-keys) |
| Gemini | gemini-2.0-flash | [aistudio.google.com](https://aistudio.google.com/apikey) |
| Claude | claude-3-5-haiku | [console.anthropic.com](https://console.anthropic.com/settings/keys) |

> API Key 仅存储在本地 localStorage，不经过任何中间服务器。

---

## 项目结构

```
src/
├── main.js               # 应用入口
├── App.vue               # 主布局（侧边栏 + 路由视图）
├── store.js              # 响应式全局状态 + localStorage 持久化
├── ai.js                 # AI 服务层（多 Provider + Prompt 模板）
└── views/
    ├── LoginView.vue     # 登录 / 注册
    ├── DashboardView.vue # 今日概览
    ├── MeetingsView.vue  # 会议列表
    ├── PrepView.vue      # 会前准备（AI 议程）
    ├── SummaryView.vue   # 会后纪要（AI 摘要）
    ├── ActionsView.vue   # Action 追踪器
    ├── PeopleView.vue    # 人员管理
    ├── SettingsView.vue  # AI 设置
    └── PromptsView.vue   # Prompt 模板编辑
```

---

## 部署

### GitHub Pages（自动）

推送到 `main` 分支后，GitHub Actions 自动构建并部署到 GitHub Pages。

```bash
git push origin main
# → 约 1 分钟后访问 https://orchidlemon.github.io/CoferenceAssistant/
```

### 手动构建

```bash
npm run build
# 产物在 dist/ 目录，可部署至任意静态托管服务
```

---

## License

MIT © 2025
