# Umi - AI 聊天桌面应用

一个功能丰富的 AI 聊天桌面应用，支持多种聊天主题、情侣空间、查岗、论坛等功能。

## 功能特性

- ✅ AI 智能对话
- ✅ 多角色切换（面具）
- ✅ 表情包支持
- ✅ 图片/视频消息
- ✅ 语音消息
- ✅ 情侣空间
- ✅ 查岗功能
- ✅ 论坛社区
- ✅ 日记/记忆功能
- ✅ 钱包系统
- ✅ 多主题美化
- ✅ PWA 支持
- ✅ 响应式设计

## 快速开始

### 方式 1: 使用 Node.js 服务器 (推荐)

```bash
# 安装依赖（可选，主要用于开发工具）
npm install

# 启动服务器
npm start
```

然后在浏览器访问：`http://localhost:8080`

### 方式 2: 使用 VSCode Live Server

1. 在 VSCode 中安装 "Live Server" 扩展
2. 右键 [index.html](file:///workspace/Netlify-Deploy-Package/index.html) → "Open with Live Server"

### 方式 3: 使用 Python 服务器

```bash
python -m http.server 8000
```

然后在浏览器访问：`http://localhost:8000`

## 项目结构

```
Netlify-Deploy-Package/
├── index.html              # 主页面
├── chat-app.html          # 聊天应用
├── chat-interface.html    # 聊天界面
├── couple-space.html      # 情侣空间
├── forum.html             # 论坛
├── diary.html             # 日记
├── memory-app.html        # 记忆应用
├── game.html              # 游戏
├── shop.html              # 商城
├── worldbook.html         # 世界书
├── house.html             # 小屋
├── together.html          # 一起做
├── if-line.html           # IF 线
├── check-device.html      # 查岗
├── start.html             # 启动页面
├── main.js                # 主脚本
├── chat-app.js            # 聊天应用脚本
├── chat-interface.js      # 聊天界面脚本
├── settings.js            # 设置脚本
├── beautify.js            # 美化脚本
├── server.js              # Node.js 服务器
├── style.css              # 主样式
├── cute-style.css         # 可爱主题
├── minimal-style.css      # 简约主题
├── qq-style.css           # QQ 主题
├── wechat-style.css       # 微信主题
├── imessage-style.css     # iMessage 主题
├── package.json           # 项目配置
├── manifest.json          # PWA 配置
└── sw.js                  # Service Worker
```

## 开发指南

### 代码规范

项目使用 ESLint 和 Prettier 进行代码规范检查：

```bash
# 检查代码规范
npm run lint

# 自动修复代码规范问题
npm run lint:fix

# 格式化代码
npm run format
```

### 配置说明

- API 配置在设置页面中完成
- 支持 OpenAI 兼容的 API 接口
- 支持语音合成（TTS）
- 支持 AI 图片生成

## 部署

### 部署到 GitHub Pages

1. 创建 GitHub 仓库
2. 上传所有项目文件
3. 进入 Settings → Pages
4. Branch 选择 main 分支 → Save
5. 等待 2 分钟，即可访问：`https://你的用户名.github.io/仓库名/`

### 部署到 Netlify

1. 访问 [netlify.com](https://www.netlify.com)
2. 拖放项目文件夹
3. 自动部署完成

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## License

MIT
