<div align="center">

# ProAthlete AI Coach

面向职业运动员的 AI 训练计划生成器与追踪器。基于 Google Gemini API，这是一个基于 React + Vite 的纯前端项目，数据存储在本地，保护隐私。

## 目录

- [快速开始](#快速开始)
- [环境准备](#1-环境准备)
- [安装与运行](#2-安装与运行)
- [配置 API Key](#3-配置-api-key)
- [使用流程](#4-使用流程)
- [常见问题](#5-常见问题)

---

## 快速开始

### 1. 环境准备

确保你的电脑上安装了 Node.js。
- 推荐版本：v18 或更高
- 检查命令：`node -v`

### 2. 安装与运行

在终端中进入项目目录（`proathlete-ai-coach`），依次运行以下命令：

1.  **安装依赖**
    ```bash
    npm install
    # 或者使用 pnpm / yarn
    # pnpm install
    # yarn
    ```

2.  **启动项目**
    ```bash
    npm run dev
    ```

终端会显示访问地址，通常是 `http://localhost:5173`。在浏览器中打开该地址即可。

### 3. 配置 API Key

本项目需要 Google Gemini API Key 才能工作。

**方式一：界面配置（推荐）**
1.  启动项目后，界面会提示你输入 Key。
2.  Key 会保存在你浏览器的本地存储（LocalStorage）中，不会上传到任何服务器。

**方式二：环境变量**
如果你希望自动加载 Key，可以在项目根目录创建一个 `.env.local` 文件：

```bash
touch .env.local
```

在文件中添加：

```env
VITE_GEMINI_API_KEY=你的_API_KEY_粘贴在这里
```

> **如何获取 Key？**
> 访问 [Google AI Studio](https://aistudio.google.com/app/apikey) 免费获取。

### 4. 使用流程

1.  **初始设置**：输入 API Key（如果未配置环境变量）。
2.  **创建档案**：填写你的运动项目（足球/篮球等）、身体数据、伤病史和目标。
3.  **生成计划**：AI 会根据你的数据生成第一周的训练计划。
4.  **每日打卡**：完成训练后，点击当天的卡片填写反馈（RPE、疲劳度、疼痛等）。
5.  **迭代更新**：一周结束后，点击“Generate Next Week”生成下一阶段的计划，AI 会根据你的反馈自动调整负荷。

### 5. 常见问题

- **生成失败？**
  - 检查 API Key 是否有效。
  - 检查网络是否能访问 Google API（部分地区可能需要代理）。
  - 如果遇到 CORS 错误，尝试在 Chrome 中安装 Allow CORS 插件作为临时方案，或者使用支持跨域的代理地址（本项目默认为纯前端直连）。

- **Typescript 报错？**
  - 确保已运行 `npm install`。
  - 这是一个纯前端项目，不包含后端服务。
