# 角色表情包分类绑定 - 代码修改说明

## 修改位置

需要在 `chat-interface.js` 文件中修改两处代码（第4516行和第16555行）

## 修改内容

### 第4516行（triggerAIReply函数中）

**旧代码（约第4516-4541行）：**
```javascript
// 📸 读取角色绑定的表情包
    try {
        const roleKey = `persona_${localStorage.getItem('currentPersona') || 'default'}_roles`;
        const roles = JSON.parse(localStorage.getItem(roleKey) || '[]');
        const currentRole = roles.find(r => r.id === currentChatId);
        
        if (currentRole) {
            const roleEmojisKey = `role_${currentChatId}_emojis`;
            const roleEmojis = JSON.parse(localStorage.getItem(roleEmojisKey) || '[]');
            
            if (roleEmojis.length > 0) {
                // 构建表情包列表（最多显示10个）
                const emojiList = roleEmojis.slice(0, 10);
                let emojiContext = '\n\n【你可以发送的表情包】：\n';
                emojiContext += '你可以从以下表情包中选择发送，回复时直接使用图片URL：\n';
                emojiList.forEach((emojiUrl, index) => {
                    emojiContext += `${index + 1}. ${emojiUrl}\n`;
                });
                emojiContext += '\n注意：发送表情包时，直接返回图片URL即可，不要添加额外说明。\n';
                systemPrompt = systemPrompt + emojiContext;
                console.log(`📸 已加载 ${roleEmojis.length} 个角色表情包`);
            }
        }
    } catch (e) {
        console.error('读取角色表情包失败:', e);
    }
```

**新代码：**
```javascript
// 📸 读取角色绑定的表情包分类
    try {
        const roleKey = `persona_${localStorage.getItem('currentPersona') || 'default'}_roles`;
        const roles = JSON.parse(localStorage.getItem(roleKey) || '[]');
        const currentRole = roles.find(r => r.id === currentChatId);
        
        if (currentRole) {
            // 读取角色绑定的表情包分类
            const emojiCategory = localStorage.getItem(`role_${currentChatId}_emoji_category`) || '';
            
            if (emojiCategory) {
                // 从全局表情包库中获取该分类下的所有表情
                const emojis = JSON.parse(localStorage.getItem('emojis') || '{"categories":["默认"],"items":{}}');
                const categoryEmojis = emojis.items[emojiCategory] || [];
                
                if (categoryEmojis.length > 0) {
                    // 构建表情包列表（最多显示15个）
                    const emojiList = categoryEmojis.slice(0, 15);
                    let emojiContext = '\n\n【你可以发送的表情包 - ' + emojiCategory + '分类】：\n';
                    emojiContext += '你可以从以下表情包中选择发送，回复时直接使用图片URL：\n';
                    emojiList.forEach((emoji, index) => {
                        const emojiUrl = typeof emoji === 'object' ? emoji.url : emoji;
                        emojiContext += `${index + 1}. ${emojiUrl}\n`;
                    });
                    emojiContext += '\n注意：发送表情包时，直接返回图片URL即可，不要添加额外说明。你可以根据对话内容智能选择是否发送表情包。\n';
                    systemPrompt = systemPrompt + emojiContext;
                    console.log(`📸 已加载"${emojiCategory}"分类的 ${categoryEmojis.length} 个表情包`);
                }
            }
        }
    } catch (e) {
        console.error('读取角色表情包失败:', e);
    }
```

### 第16555行（executeReplyTask函数中）

修改方式相同，只是将 `currentChatId` 替换为 `task.chatId`，日志前缀添加"后台任务："

## 修改步骤

1. 打开 `chat-interface.js` 文件
2. 搜索 "// 📸 读取角色绑定的表情包"（会找到两处）
3. 分别替换这两处代码
4. 保存文件
5. 刷新浏览器（Ctrl + F5）

## 功能说明

- **旧版**：角色绑定单个表情包列表（role_{id}_emojis）
- **新版**：角色绑定表情包分类（role_{id}_emoji_category）

### 使用方式

1. 在角色编辑页面，选择"角色表情包分类"下拉框
2. 选择一个表情包分类（如"开心"、"难过"等）
3. 角色在对话中就可以使用该分类下的所有表情包
4. AI会根据上下文智能选择发送哪个表情

## 前端界面已更新

- ✅ chat-app.html - 角色编辑弹窗已添加分类选择器
- ✅ chat-app.html - 角色表情包管理弹窗已简化为分类选择
- ✅ role-emoji-manager.js - 分类选择逻辑已实现
- ✅ chat-interface.html - 版本号已更新到 v=196

## 还需要手动修改

- ❌ chat-interface.js - 需要按上述说明手动修改两处代码
