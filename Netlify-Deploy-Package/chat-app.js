// 聊天应用核心逻辑
(function() {
    'use strict';

    // 压缩图片函数
    async function compressImage(base64, maxWidth, maxHeight, quality) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                
                // 计算缩放比例
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // 转换为压缩后的 JPEG
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };
            img.onerror = reject;
            img.src = base64;
        });
    }

    // ========== 返回主页 ==========
    window.goBackToHome = function() {
        window.location.href = 'index.html';
    };

    /**
     * 生成随机头像（使用 SVG 生成渐变色背景+emoji/字母）
     * @param {string} name - 角色名称（用于生成头像文字）
     * @returns {Promise<string>} - base64 编码的图片 URL
     */
    async function generateRandomAvatar(name) {
        // 预定义的低饱和渐变色组合
        const gradients = [
            ['#FFB3B3', '#FF8A80'], // 粉红
            ['#FFD54F', '#FFCA28'], // 黄色
            ['#81C784', '#66BB6A'], // 绿色
            ['#64B5F6', '#42A5F5'], // 蓝色
            ['#BA68C8', '#AB47BC'], // 紫色
            ['#4DB6AC', '#26A69A'], // 青色
            ['#F06292', '#EC407A'], // 玫红
            ['#FF8A65', '#FF7043'], // 橙色
            ['#A1887F', '#8D6E63'], // 棕色
            ['#90A4AE', '#78909C']  // 灰蓝
        ];
        
        // 根据名称生成一个随机索引（保证同一名称总是同一头像）
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const gradientIndex = hash % gradients.length;
        const [color1, color2] = gradients[gradientIndex];
        
        // 从名称中提取第一个字符（中文取第一个字，英文取第一个字母）
        const firstChar = name ? name.charAt(0).toUpperCase() : '?';
        
        // 生成 SVG 头像
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
                <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
                    </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="100" fill="url(#grad)"/>
                <text x="100" y="120" font-family="Arial, sans-serif" font-size="100" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${firstChar}</text>
            </svg>
        `;
        
        // 转换为 base64
        const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        // 将 SVG 转换为 PNG（更好的兼容性）
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                canvas.width = 200;
                canvas.height = 200;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                URL.revokeObjectURL(url);
                resolve(canvas.toDataURL('image/png'));
            };
            img.src = url;
        });
    }

    // ========== 数据存储 - 支持人设隔离 ==========
    let currentPersonaId = localStorage.getItem('currentPersonaId') || 'default';

    function getPersonaKey(key) {
        return `persona_${currentPersonaId}_${key}`;
    }

    function getData(key) {
        const fullKey = getPersonaKey(key);
        return JSON.parse(localStorage.getItem(fullKey) || 'null');
    }

    function saveData(key, data) {
        const fullKey = getPersonaKey(key);
        localStorage.setItem(fullKey, JSON.stringify(data));
    }

    // 所有人设列表
    function getAllPersonas() {
        return JSON.parse(localStorage.getItem('allPersonas') || '[]');
    }

    function saveAllPersonas(personas) {
        localStorage.setItem('allPersonas', JSON.stringify(personas));
    }

    // 切换人设
    window.switchPersona = function(personaId) {
        // 不再清空数据，只是切换当前人设
        currentPersonaId = personaId;
        localStorage.setItem('currentPersonaId', personaId);
        
        // 重新渲染界面显示新人设的数据
        renderMaskModal();
        renderProfile();
        renderMessages();
        renderMoments();
        renderWallet();
        renderEmojis();
        
        showToast(`已切换到 ${personaId} 的数据`);
    };

    // ========== 初始化数据 ==========
    function initData() {
        if (!getData('chatContacts')) {
            saveData('chatContacts', []);
        }
        if (!getData('chatMessages')) {
            saveData('chatMessages', {});
        }
        if (!getData('chatConversations')) {
            saveData('chatConversations', []);
        }
        if (!getData('contactGroups')) {
            saveData('contactGroups', [
                { id: 'default', name: '我的好友', icon: 'user', order: 0 },
                { id: 'family', name: '家人', icon: 'family', order: 1 },
                { id: 'work', name: '工作', icon: 'work', order: 2 }
            ]);
        }
        if (!getData('moments')) {
            saveData('moments', []);
        }
        if (!getData('wallet')) {
            saveData('wallet', { balance: 0, transactions: [] });
        }
        if (!getData('emojis')) {
            saveData('emojis', {
                categories: ['默认', '收藏'],
                items: { '默认': [], '收藏': [] }
            });
        }
        if (!getData('myProfile')) {
            saveData('myProfile', {
                avatar: '',
                name: '用户',
                persona: ''
            });
        }
        if (!getData('momentsCover')) {
            saveData('momentsCover', '');
        }
        if (!getData('momentsName')) {
            saveData('momentsName', '用户');
        }
        if (!getData('momentsBio')) {
            saveData('momentsBio', '');
        }
    }

    // ========== Toast ==========
    window.showToast = function(msg) {
        const toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    };

    // ========== iOS 风格确认弹窗 ==========
    let iosConfirmCallback = null;

    window.showIosConfirm = function(title, message, confirmText, onConfirm, isSafe) {
        const overlay = document.getElementById('ios-confirm-overlay');
        const titleEl = document.getElementById('ios-confirm-title');
        const messageEl = document.getElementById('ios-confirm-message');
        const confirmBtn = document.getElementById('ios-confirm-confirm-btn');

        titleEl.textContent = title || '确认';
        messageEl.textContent = message || '确定要执行此操作吗？';
        confirmBtn.textContent = confirmText || '确定';

        // 设置按钮样式
        confirmBtn.className = 'ios-confirm-btn confirm';
        if (isSafe) {
            confirmBtn.classList.add('safe');
        }

        iosConfirmCallback = onConfirm;
        overlay.classList.add('active');
    };

    window.closeIosConfirm = function(confirmed) {
        const overlay = document.getElementById('ios-confirm-overlay');
        overlay.classList.remove('active');

        if (confirmed && iosConfirmCallback) {
            iosConfirmCallback();
        }
        iosConfirmCallback = null;
    };

    // ========== 标签切换 - 底部Tab ==========
    function initTabs() {
        const tabs = document.querySelectorAll('.bottom-tab-item');
        const navDropdown = document.getElementById('nav-dropdown');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelector('.bottom-tab-item.active')?.classList.remove('active');
                tab.classList.add('active');
                
                const tabName = tab.dataset.tab;
                document.querySelector('.tab-content.active')?.classList.remove('active');
                document.getElementById(`tab-${tabName}`)?.classList.add('active');
                
                // 应用自定义顶栏名称
                const saved = localStorage.getItem('globalBeautifySettings');
                let title = '';
                if (saved) {
                    try {
                        const settings = JSON.parse(saved);
                        if (settings.navTitles && settings.navTitles[tabName]) {
                            title = settings.navTitles[tabName];
                        }
                    } catch(e) {}
                }
                
                // 如果没有自定义名称，使用默认名称
                if (!title) {
                    const titles = { messages: '消息', contacts: '联系人', moments: '朋友圈', profile: '我' };
                    title = titles[tabName] || '消息';
                }
                document.getElementById('nav-title').textContent = title;
                
                // 通知外层更新顶栏标题（iframe 模式）
                try {
                    window.parent.postMessage({
                        type: 'updateIframeTitle',
                        title: title
                    }, '*');
                } catch(e) {}
                
                updateNavDropdown(tabName);
                
                if (tabName === 'messages') renderMessages();
                if (tabName === 'contacts') renderContacts();
                if (tabName === 'moments') renderMoments();
                if (tabName === 'profile') renderProfile();
            });
        });
    }

    // 更新导航下拉菜单
    function updateNavDropdown(tabName) {
        console.log('[chat-app] 更新下拉菜单，tab:', tabName);
        const navDropdown = document.getElementById('nav-dropdown');
        let html = '';
        
        if (tabName === 'messages') {
            html = `
                <div class="dropdown-item" data-func="openAddFriendModal">添加好友</div>
                <div class="dropdown-item" data-func="openCreateGroupModal">发起群聊</div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-item" data-func="openAnonymousQA">匿名问答</div>
            `;
        } else if (tabName === 'contacts') {
            html = `
                <div class="dropdown-item" data-func="openCreateRoleModal">创建角色</div>
            `;
        } else if (tabName === 'moments') {
            const aiReplyConfig = JSON.parse(localStorage.getItem('momentsAIReply') || '{"enabled": false}');
            html = `
                <div class="dropdown-item" data-func="openPublishModal">发表动态</div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-item" data-func="openAIReplySettings">AI回复设置 ${aiReplyConfig.enabled ? '已开启' : ''}</div>
                <div class="dropdown-item" data-func="generateRoleMoment">AI生成角色动态</div>
            `;
        }
        
        // 更新内部下拉菜单（如果存在）
        if (navDropdown) {
            navDropdown.innerHTML = html;
        }
        
        // 通过 postMessage 通知外层更新下拉菜单
        try {
            console.log('[chat-app] 发送postMessage，HTML长度:', html.length);
            window.parent.postMessage({
                type: 'updateIframeDropdown',
                html: html
            }, '*');
        } catch(e) {
            console.warn('[chat-app] 无法发送postMessage:', e);
        }
    }
    
    // 暴露为全局函数供iframe调用
    window.updateNavDropdown = updateNavDropdown;

    // 打开AI回复设置
    window.openAIReplySettings = function() {
        closeNavDropdown();
        
        // 加载当前配置
        const config = JSON.parse(localStorage.getItem('momentsAIReply') || '{"enabled": false}');
        
        // 设置开关状态
        const switchEl = document.getElementById('ai-reply-switch');
        if (switchEl) {
            if (config.enabled) {
                switchEl.classList.add('active');
                switchEl.style.backgroundColor = 'var(--success-color)';
            } else {
                switchEl.classList.remove('active');
                switchEl.style.backgroundColor = '#e5e5ea';
            }
        }
        
        // 显示弹窗
        document.getElementById('ai-reply-modal').classList.add('active');
    };

    // 切换AI回复开关
    window.toggleAIReplySwitch = function() {
        const switchEl = document.getElementById('ai-reply-switch');
        
        switchEl.classList.toggle('active');
        const isEnabled = switchEl.classList.contains('active');
        
        // 更新开关的背景色
        if (isEnabled) {
            switchEl.style.backgroundColor = 'var(--success-color)';
        } else {
            switchEl.style.backgroundColor = '#e5e5ea';
        }
    };

    // 保存AI回复设置
    window.saveAIReplySettings = function() {
        const switchEl = document.getElementById('ai-reply-switch');
        
        const config = {
            enabled: switchEl.classList.contains('active'),
            lastProcessedTime: null // 记录最后处理时间
        };
        
        localStorage.setItem('momentsAIReply', JSON.stringify(config));
        
        closeModal('ai-reply-modal');
        showToast(config.enabled ? 'AI自动回复已开启' : 'AI自动回复已关闭');
        
        // 更新导航菜单显示
        updateNavDropdown('moments');
        
        // 如果开启，立即启动后台处理
        if (config.enabled) {
            processMomentsAutoReply();
        }
    };

    // 自动回复处理函数
    async function processMomentsAutoReply() {
        console.log('processMomentsAutoReply 被调用');
        
        const replyConfigStr = localStorage.getItem('momentsAIReply');
        if (!replyConfigStr) {
            console.log('momentsAIReply配置不存在');
            return;
        }
        
        const replyConfig = JSON.parse(replyConfigStr);
        console.log('自动回复配置:', replyConfig);
        
        if (!replyConfig.enabled) {
            console.log('自动回复未开启');
            return;
        }
        
        console.log('开始处理朋友圈自动回复...');
        
        // 获取API配置 - 兼容 globalApiConfig 格式
        const apiCfg = JSON.parse(localStorage.getItem('globalApiConfig') || '{}');
        const url = apiCfg.mainApi?.url || '';
        const token = apiCfg.mainApi?.token || '';
        const model = apiCfg.model || 'gpt-3.5-turbo';
        
        if (!url || !token) {
            console.error('未找到API配置或配置不完整，请在设置中配置API');
            console.log('当前配置:', { url: url ? '已配置' : '未配置', token: token ? '已配置' : '未配置', model });
            return;
        }
        
        // 获取好友动态列表（排除自己发布的）
        const moments = getData('moments') || [];
        const myProfile = getData('myProfile') || {};
        const myName = myProfile.name || '用户';
        
        console.log('当前有 ' + moments.length + ' 条动态，发布者: ' + (myProfile.name || '未设置'));
        console.log('已处理的动态IDs:', replyConfig.processedMoments || []);
        console.log('已处理的评论IDs:', replyConfig.processedComments || []);
        
        // 1. 处理新动态评论（AI角色评论用户的动态）
        const myComments = replyConfig.processedMoments || [];
        const pendingMoments = moments.filter(m => 
            m.author === myName && !myComments.includes(m.id)
        );
        
        console.log('待评论的用户动态数量:', pendingMoments.length);
        if (pendingMoments.length > 0) {
            pendingMoments.forEach((m, idx) => {
                console.log(`  ${idx + 1}. [你的动态] ${m.content?.substring(0, 30)}... (ID: ${m.id})`);
            });
        }
        
        // 2. 处理新评论回复（角色回复用户在角色动态下的评论）
        const processedComments = replyConfig.processedComments || [];
        const pendingCommentReplies = [];
        
        moments.forEach(moment => {
            // 只处理非自己发布的动态（即角色发的动态）
            if (moment.author !== myName && moment.comments) {
                console.log(`检查动态 [${moment.author}] 的 ${moment.comments.length} 条评论`);
                moment.comments.forEach(comment => {
                    // 如果是用户（自己）的评论，且没有被处理过，且是对动态的原始评论（不是回复评论），角色需要回复
                    if (comment.author === myName && !processedComments.includes(comment.id) && !comment.replyTo) {
                        console.log(`  发现待回复评论: [${comment.author}] ${comment.text?.substring(0, 30)}...`);
                        pendingCommentReplies.push({
                            momentId: moment.id,
                            momentAuthor: moment.author,
                            momentContent: moment.content,
                            comment: comment
                        });
                    }
                });
            }
        });
        
        if (pendingMoments.length === 0 && pendingCommentReplies.length === 0) {
            console.log('没有需要回复的动态或评论');
            console.log('调试信息:');
            console.log('  - pendingMoments.length:', pendingMoments.length);
            console.log('  - pendingCommentReplies.length:', pendingCommentReplies.length);
            console.log('  - replyConfig.processedMoments:', replyConfig.processedMoments || []);
            console.log('  - replyConfig.processedComments:', replyConfig.processedComments || []);
            console.log('  - 主页名称 (myName):', myName);
            
            //  额外调试：查看所有动态和评论
            console.log('所有动态列表:');
            moments.forEach((m, idx) => {
                console.log(`  ${idx + 1}. 作者: ${m.author}, ID: ${m.id}, 评论数: ${m.comments ? m.comments.length : 0}`);
                if (m.comments && m.comments.length > 0) {
                    m.comments.forEach((c, cIdx) => {
                        console.log(`    评论${cIdx + 1}: 作者=${c.author}, ID=${c.id}, 内容=${c.text?.substring(0, 20)}`);
                    });
                }
            });
            
            return;
        }
        
        console.log('发现 ' + pendingMoments.length + ' 条需要评论的动态，' + pendingCommentReplies.length + ' 条需要回复的评论');
        
        // 构建 System Prompt
        // 构建 System Prompt - 让AI以动态作者（角色）的身份回复评论
        const persona = myProfile.persona || '';
        
        // 获取动态作者（角色）的名字和人设
        let momentAuthorName = '';
        let momentAuthorPersona = '';
        const chatContacts = getData('chatContacts') || [];
        if (pendingCommentReplies.length > 0) {
            const firstReply = pendingCommentReplies[0];
            momentAuthorName = firstReply.momentAuthor;
            const contact = chatContacts.find(c => c.name === momentAuthorName);
            if (contact && contact.roleInfo) {
                momentAuthorPersona = contact.roleInfo.persona || '';
                console.log(`找到角色 ${momentAuthorName} 的人设:`, momentAuthorPersona);
            }
        }
        
        let recentChatContext = '';
        try {
            // 获取所有联系人的聊天数据，找到最近的聊天记录
            const allChatKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('chat_')) {
                    allChatKeys.push(key);
                }
            }
            
            // 收集最近的聊天消息
            const allRecentMessages = [];
            allChatKeys.forEach(chatKey => {
                try {
                    const chatData = JSON.parse(localStorage.getItem(chatKey) || '[]');
                    const last2Messages = chatData.slice(-2); // 每个联系人只取最近2条（减少token）
                    allRecentMessages.push(...last2Messages);
                } catch (e) {
                    // 忽略解析错误
                }
            });
            
            // 按时间排序，取最近5条
            const sortedMessages = allRecentMessages
                .sort((a, b) => (b.time || 0) - (a.time || 0))
                .slice(0, 5); // 从10减少到5
            
            if (sortedMessages.length > 0) {
                recentChatContext = '\n【最近的聊天记忆】\n';
                sortedMessages.forEach(msg => {
                    const time = new Date(msg.time).toLocaleString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    recentChatContext += `[${time}] ${msg.sender === 'user' ? '我' : '朋友'}: ${msg.content}\n`;
                });
            }
        } catch (e) {
            console.log('获取聊天记录失败:', e);
        }
        
        // 准备API请求
        let baseUrl = url.trim();
        if (baseUrl.endsWith('/')) {
            baseUrl = baseUrl.slice(0, -1);
        }
        if (!baseUrl.includes('/chat/completions')) {
            if (baseUrl.endsWith('/v1')) {
                baseUrl += '/chat/completions';
            } else if (!baseUrl.endsWith('/v1/chat/completions')) {
                if (baseUrl.includes('/v1/')) {
                    baseUrl += '/chat/completions';
                } else {
                    baseUrl += '/v1/chat/completions';
                }
            }
        }
        
        console.log('API地址: ' + baseUrl);
        console.log('API Token存在: ' + (token ? '是' : '否'));
        
        // 逐条处理新动态（角色评论用户的动态）
        for (let i = 0; i < pendingMoments.length; i++) {
            const moment = pendingMoments[i];
            
            try {
                console.log('正在评论 ' + moment.author + ' 的动态...');
                
                // 获取一个随机角色来评论
                const availableContacts = chatContacts.filter(c => c.name !== myName);
                if (availableContacts.length === 0) {
                    console.log('没有可用的角色来评论');
                    continue;
                }
                const randomContact = availableContacts[Math.floor(Math.random() * availableContacts.length)];
                const commenterName = randomContact.name;
                const commenterPersona = randomContact.roleInfo?.persona || '普通用户';
                
                const systemPrompt = `你是「${commenterName}」，${commenterPersona}。你看到了好友 ${moment.author} 发布了一条朋友圈动态，请以你的视角和口吻评论这条动态，保持角色一致性。直接输出评论内容，不要思考过程，10-50字。`;
                const userPrompt = `${moment.author} 发布了一条朋友圈动态：\n${moment.content || '（只发了图片）'}\n\n请对这条动态发表你的评论。`;
                
                const response = await fetch(baseUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userPrompt }
                        ],
                        temperature: 0.8,
                        max_tokens: 8192  // 增加到8192，给AI的reasoning思考过程更多空间
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`API请求失败: ${response.status}`);
                }
                
                const data = await response.json();
                const commentContent = data.choices?.[0]?.message?.content;
                
                if (commentContent && commentContent.trim()) {
                    // 重新获取最新的moments数据
                    const latestMoments = getData('moments') || [];
                    const latestMoment = latestMoments.find(m => m.id === moment.id);
                    
                    if (latestMoment) {
                        if (!latestMoment.comments) {
                            latestMoment.comments = [];
                        }
                        
                        latestMoment.comments.push({
                            id: Date.now() + '_c' + Math.random().toString(36).substr(2, 9),
                            author: commenterName, // 使用角色名字
                            text: commentContent.trim(),
                            time: Date.now(),
                            isAIReply: true
                        });
                        
                        saveData('moments', latestMoments);
                        renderMoments();
                        
                        console.log('已评论 ' + moment.author + ': ' + commentContent.trim());
                    }
                    
                    // 记录已处理
                    if (!replyConfig.processedMoments) {
                        replyConfig.processedMoments = [];
                    }
                    replyConfig.processedMoments.push(moment.id);
                    localStorage.setItem('momentsAIReply', JSON.stringify(replyConfig));
                }
                
                // 延迟2秒避免API限流
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                console.error('评论 ' + moment.author + ' 失败:', error);
            }
        }
        
        // 逐条处理评论回复
        for (let i = 0; i < pendingCommentReplies.length; i++) {
            const replyItem = pendingCommentReplies[i];
            
            try {
                console.log('正在回复 ' + replyItem.comment.author + ' 的评论...');
                console.log('评论内容:', replyItem.comment.text);
                console.log(' 评论ID:', replyItem.comment.id);
                
                // userPrompt：AI 是朋友圈作者，有人评论了 AI 的朋友圈，AI 需要回复
                const userPrompt = `这是你（${roleName}）发的一条朋友圈动态，有人评论了你的动态，请以你的视角回复这条评论：

【你发的朋友圈】
${replyItem.momentContent || '（只发了图片）'}

【${replyItem.comment.author} 评论了你】
${replyItem.comment.text}

请以你的口吻回复${replyItem.comment.author}，保持角色一致性。直接输出回复内容，10-50字。`;
                
                console.log('📤 准备发送 API 请求...');
                console.log('🔗 API URL:', baseUrl);
                console.log('📦 请求参数:');
                console.log('  - model:', model);
                console.log('  - temperature: 0.8');
                console.log('  - max_tokens: 4096');
                console.log('  - systemPrompt 长度:', systemPrompt.length);
                console.log('  - userPrompt 长度:', userPrompt.length);
                
                const startTime = Date.now();
                console.log('⏰ 开始发送请求时间:', new Date(startTime).toLocaleTimeString());
                
                const response = await fetch(baseUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userPrompt }
                        ],
                        temperature: 0.8,
                        max_tokens: 8192  // 增加到8192，给AI的reasoning思考过程更多空间
                    })
                });
                
                const responseTime = Date.now() - startTime;
                console.log(`API 请求耗时: ${responseTime}ms`);
                console.log('响应状态:', response.status, response.statusText);
                
                if (!response.ok) {
                    console.error('API 请求失败:', response.status, response.statusText);
                    throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
                }
                
                console.log('开始解析响应数据...');
                const data = await response.json();
                
                // 调试：查看 API 返回的完整结构
                console.log('API 返回的完整数据:', JSON.stringify(data, null, 2));
                console.log('data.choices 是否存在:', !!data.choices);
                console.log('data.choices 长度:', data.choices?.length);
                console.log('data.choices[0]:', data.choices?.[0]);
                console.log('data.choices[0].message:', data.choices?.[0]?.message);
                
                const replyContent = data.choices?.[0]?.message?.content;
                
                console.log('解析后的回复内容:', replyContent);
                console.log('replyContent 类型:', typeof replyContent);
                console.log('replyContent 是否存在:', !!replyContent);
                
                if (replyContent && replyContent.trim()) {
                    console.log('回复内容有效，准备保存到朋友圈...');
                    console.log('回复内容:', replyContent.trim());
                    console.log('动态ID:', replyItem.momentId);
                    // 重新获取最新的moments数据
                    const latestMoments = getData('moments') || [];
                    console.log('当前朋友圈动态总数:', latestMoments.length);
                    const latestMoment = latestMoments.find(m => m.id === replyItem.momentId);
                    console.log('是否找到对应动态:', !!latestMoment);
                                        
                    if (latestMoment) {
                        console.log('找到的动态作者:', latestMoment.author);
                        console.log('当前评论数:', latestMoment.comments ? latestMoment.comments.length : 0);
                        if (!latestMoment.comments) {
                            latestMoment.comments = [];
                        }
                                            
                        latestMoment.comments.push({
                            id: Date.now() + '_c' + Math.random().toString(36).substr(2, 9),
                            author: latestMoment.author,  // 用动态作者（角色）的名字，而不是用户主页名
                            replyTo: replyItem.comment.author,  // 记录是回复谁的评论
                            text: replyContent.trim(),
                            time: Date.now(),
                            isAIReply: true
                        });
                                            
                        console.log('准备保存数据...');
                        saveData('moments', latestMoments);
                        console.log('数据已保存');
                                            
                        console.log('准备调用 renderMoments()...');
                        try {
                            renderMoments();
                            console.log('renderMoments() 执行成功');
                        } catch (renderErr) {
                            console.error('renderMoments() 执行失败:', renderErr);
                        }
                                            
                        console.log('已回复 ' + replyItem.comment.author + ': ' + replyContent.trim());
                    }
                                        
                    // 立即更新 processedComments 记录，防止重复处理
                    const latestReplyConfig = JSON.parse(localStorage.getItem('momentsAIReply') || '{}');
                    if (!latestReplyConfig.processedComments) {
                        latestReplyConfig.processedComments = [];
                    }
                    if (!latestReplyConfig.processedComments.includes(replyItem.comment.id)) {
                        latestReplyConfig.processedComments.push(replyItem.comment.id);
                        localStorage.setItem('momentsAIReply', JSON.stringify(latestReplyConfig));
                        console.log('已记录评论ID:', replyItem.comment.id);
                    } else {
                        console.log('评论ID已存在，无需重复记录:', replyItem.comment.id);
                    }
                }
                
                // 延迟2秒避免API限流
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                console.error('回复 ' + replyItem.comment.author + ' 失败:', error);
            }
        }
        
        console.log('AI自动回复处理完成');
    }

    // 暴露到全局作用域，方便其他函数调用
    window.processMomentsAutoReply = processMomentsAutoReply;

    // 启动自动回复定时器
    function startAutoReplyTimer() {
        // 每30秒检查一次是否有新动态需要回复
        setInterval(() => {
            const configStr = localStorage.getItem('momentsAIReply');
            if (configStr) {
                const config = JSON.parse(configStr);
                if (config.enabled) {
                    processMomentsAutoReply();
                }
            }
        }, 30000);
    }

    // 导航按钮点击
    function initNavButton() {
        const btn = document.getElementById('nav-more-btn');
        const dropdown = document.getElementById('nav-dropdown');
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });
        
        document.addEventListener('click', () => {
            dropdown.classList.remove('active');
        });
    }

    window.closeNavDropdown = function() {
        document.getElementById('nav-dropdown')?.classList.remove('active');
    };

    // ========== 匿名问答功能 ==========
    
    let selectedAnonymousCharacter = null;
    
    // 打开匿名问答
    window.openAnonymousQA = function() {
        closeNavDropdown();
        
        // 获取当前persona和联系人
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        
        // 获取可用的角色列表（排除自己）
        const characterContacts = contacts.filter(c => c.id !== 'user');
        
        if (characterContacts.length === 0) {
            showToast('还没有创建角色');
            return;
        }
        
        // 显示角色列表
        const characterList = document.getElementById('anonymous-character-list');
        characterList.innerHTML = '';
        
        characterContacts.forEach(character => {
            const item = document.createElement('div');
            item.style.cssText = `
                display: flex;
                align-items: center;
                padding: 12px;
                background: #fafafa;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s;
                margin-bottom: 8px;
                border: 2px solid transparent;
            `;
            
            item.onmouseenter = () => {
                item.style.background = '#f0f0f0';
            };
            item.onmouseleave = () => {
                if (selectedAnonymousCharacter?.id !== character.id) {
                    item.style.background = '#fafafa';
                }
            };
            
            item.onclick = () => selectAnonymousCharacter(character, item);
            
            const avatar = document.createElement('img');
            avatar.src = character.avatar || '';
            avatar.alt = character.name;
            avatar.style.cssText = 'width: 40px; height: 40px; border-radius: 50%; object-fit: cover; margin-right: 12px;';
            
            const info = document.createElement('div');
            info.style.flex = '1';
            
            const name = document.createElement('div');
            name.textContent = character.name;
            name.style.cssText = 'font-size: 15px; font-weight: 600; color: #000; margin-bottom: 4px;';
            
            const desc = document.createElement('div');
            desc.textContent = character.persona || '点击选择';
            desc.style.cssText = 'font-size: 13px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
            
            info.appendChild(name);
            info.appendChild(desc);
            item.appendChild(avatar);
            item.appendChild(info);
            characterList.appendChild(item);
        });
        
        // 重置选择
        selectedAnonymousCharacter = null;
        document.getElementById('anonymous-question-input').value = '';
        
        // 显示弹窗
        document.getElementById('anonymous-qa-modal').classList.add('active');
    };
    
    // 选择匿名角色
    function selectAnonymousCharacter(character, element) {
        selectedAnonymousCharacter = character;
        
        // 更新所有选项的样式
        const items = document.querySelectorAll('#anonymous-character-list > div');
        items.forEach(item => {
            item.style.background = '#fafafa';
            item.style.borderColor = 'transparent';
        });
        
        // 高亮选中的选项
        element.style.background = '#f0f0f0';
        element.style.borderColor = '#000';
        
        showToast(`已选择: ${character.name}`);
    }
    
    // 提交匿名问题
    window.submitAnonymousQuestion = async function() {
        if (!selectedAnonymousCharacter) {
            showToast('请先选择一个角色');
            return;
        }
        
        const question = document.getElementById('anonymous-question-input').value.trim();
        if (!question) {
            showToast('请输入问题');
            return;
        }
        
        // 关闭弹窗
        closeModal('anonymous-qa-modal');
        
        showToast('正在生成回答...');
        
        try {
            // 生成角色的匿名回答
            const answer = await generateAnonymousAnswer(selectedAnonymousCharacter, question);
            
            // 创建匿名问答的聊天记录
            const qaId = `anonymous_qa_${Date.now()}`;
            const messages = getData('chatMessages') || {};
            
            messages[qaId] = [
                {
                    text: `[匿名提问] ${question}`,
                    self: false,
                    time: Date.now(),
                    sender: 'anonymous'
                },
                {
                    text: answer,
                    self: false,
                    time: Date.now() + 1000,
                    sender: 'ai'
                }
            ];
            
            saveData('chatMessages', messages);
            
            // 添加到对话列表
            const conversations = getData('chatConversations') || [];
            const existingConv = conversations.find(c => c.id === qaId);
            
            if (!existingConv) {
                conversations.unshift({
                    id: qaId,
                    name: `匿名问答 - ${selectedAnonymousCharacter.name}`,
                    avatar: selectedAnonymousCharacter.avatar || '',
                    lastMessage: answer.substring(0, 50) + '...',
                    time: Date.now(),
                    unread: 1
                });
                
                saveData('chatConversations', conversations);
            }
            
            showToast('匿名问答已创建');
            
            // 刷新消息列表
            renderMessages();
            
        } catch (error) {
            console.error('匿名问答失败:', error);
            showToast('生成回答失败，请重试');
        }
    };
    
    // 生成匿名回答
    async function generateAnonymousAnswer(character, question) {
        // 获取 API 配置
        const apiConfig = JSON.parse(localStorage.getItem('globalApiConfig') || '{}');
        
        if (!apiConfig.mainApi || !apiConfig.mainApi.url || !apiConfig.mainApi.token) {
            throw new Error('API 配置不完整');
        }
        
        // 获取角色信息
        const characterName = character.name;
        const personaInfo = character.persona || character.roleInfo?.persona || '';
        
        // 构建 System Prompt
        const systemPrompt = `你是${characterName}，现在有人匿名向你提问。

请根据以下信息，以角色的身份回答问题：

${personaInfo ? '\n【角色设定】\n' + personaInfo : ''}

要求：
1. 以第一人称回答，完全代入角色
2. 根据角色的人设和性格来回答
3. 语言要自然、真实，像真人聊天
4. 可以有情绪，但不要过于夸张
5. 字数 50-150 字左右
6. 不要提及自己是AI
7. 不要提及提问者是谁（因为是匿名的）
8. 直接回答问题，可以分享观点、建议或感受`;
        
        // 用户消息
        const userMessage = `有人匿名问你：${question}`;
        
        // 拼接 API URL
        let baseUrl = apiConfig.mainApi.url.trim();
        if (baseUrl.endsWith('/')) {
            baseUrl = baseUrl.slice(0, -1);
        }
        
        const apiUrl = `${baseUrl}/v1/chat/completions`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiConfig.mainApi.token}`
            },
            body: JSON.stringify({
                model: apiConfig.model || 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.8,
                max_tokens: 300
            })
        });
        
        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        const answer = data.choices?.[0]?.message?.content?.trim();
        
        return answer || '抱歉，我暂时无法回答这个问题。';
    }

    // ========== 消息模块 ==========
    
    // 从 IndexedDB 获取聊天消息
    async function getChatMessagesFromDB(chatId) {
        return new Promise(async (resolve) => {
            if (!window.ChatDB) {
                console.warn('window.ChatDB 不存在');
                resolve([]);
                return;
            }
            
            // 如果 db 未初始化，先初始化
            if (!window.ChatDB.db) {
                try {
                    console.log('正在初始化 IndexedDB...');
                    await window.ChatDB.init();
                    console.log('IndexedDB 初始化成功');
                } catch (e) {
                    console.warn('IndexedDB 初始化失败:', e);
                    resolve([]);
                    return;
                }
            }
            
            try {
                console.log('读取 IndexedDB chatId:', chatId);
                const transaction = window.ChatDB.db.transaction(['messages'], 'readonly');
                const store = transaction.objectStore('messages');
                const request = store.get(chatId);
                
                request.onsuccess = function() {
                    if (request.result && request.result.messages) {
                        console.log('找到消息，共', request.result.messages.length, '条');
                        resolve(request.result.messages);
                    } else {
                        console.log('IndexedDB 中未找到消息:', chatId);
                        resolve([]);
                    }
                };
                
                request.onerror = function() {
                    console.error('IndexedDB 读取失败');
                    resolve([]);
                };
            } catch (e) {
                console.warn('读取 IndexedDB 失败:', e);
                resolve([]);
            }
        });
    }
    
    // 渲染消息列表（支持 IndexedDB 和 localStorage）
    async function renderMessages() {
        const list = document.getElementById('msg-list');
        if (!list) {
            console.warn('️ msg-list 元素未找到');
            return;
        }
        const conversations = getData('chatConversations') || [];
        
        if (conversations.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    <div class="empty-state-text">暂无消息</div>
                </div>
            `;
            return;
        }
        
        // 分离置顶和非置顶的对话
        const pinnedConversations = conversations.filter(conv => conv.pinned);
        const unpinnedConversations = conversations.filter(conv => !conv.pinned);
        
        // 渲染函数
        function renderConversationList(convList, showDivider = false) {
            if (convList.length === 0) return '';
            
            let html = '';
            if (showDivider) {
                html += '<div class="msg-divider">未置顶消息</div>';
            }
            
            html += convList.map(conv => {
                const avatar = conv.avatar || '';
                const name = conv.name || conv.remark || '';
                
                return `
                    <div class="msg-item ${conv.pinned ? 'pinned' : ''}" 
                         id="msg-item-${conv.id}" 
                         onclick="console.log('[HTML] 点击事件触发:', '${conv.id}'); openChat('${conv.id}', '${name.replace(/'/g, "\\'")}', '${avatar.replace(/'/g, "\\'")}');"
                         oncontextmenu="showMessageContextMenu(event, '${conv.id}'); return false;"
                         ontouchstart="handleMsgTouchStart(event, '${conv.id}')" 
                         ontouchend="handleMsgTouchEnd(event, '${conv.id}')"
                         ontouchmove="handleMsgTouchMove(event)"
                         onmousedown="handleMsgMouseDown(event, '${conv.id}')" 
                         onmouseup="handleMsgMouseUp(event, '${conv.id}')">
                        <div class="msg-avatar">${isImageUrl(avatar) ? `<img src="${avatar}" alt="">` : (avatar || '👤')}</div>
                        <div class="msg-info">
                            <div class="msg-name">${name}</div>
                            <div class="msg-preview"></div>
                        </div>
                        <div class="msg-meta">
                            <div class="msg-time"></div>
                            ${conv.unread > 0 ? `<div class="msg-badge">${conv.unread}</div>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
            
            return html;
        }
        
        // 先渲染置顶的，再渲染未置顶的
        let html = renderConversationList(pinnedConversations, false);
        html += renderConversationList(unpinnedConversations, pinnedConversations.length > 0);
        
        list.innerHTML = html;
        
        // 异步加载每条消息的最后一条并更新显示
        for (const conv of conversations) {
            let lastMsg = null;
            
            // 先尝试从 localStorage 读取
            const chatKey = `chat_${conv.id}`;
            const saved = localStorage.getItem(chatKey);
            if (saved) {
                try {
                    const compressedMessages = JSON.parse(saved);
                    if (compressedMessages.length > 0) {
                        const lastCompressed = compressedMessages[compressedMessages.length - 1];
                        lastMsg = {
                            type: lastCompressed.t || lastCompressed.type,
                            content: lastCompressed.c !== undefined ? lastCompressed.c : lastCompressed.content,
                            sender: lastCompressed.s || lastCompressed.sender,
                            time: lastCompressed.tm || lastCompressed.time
                        };
                    }
                } catch (e) {
                    console.warn('读取 localStorage 消息失败:', e);
                }
            }
            
            // 如果 localStorage 没有，尝试从 IndexedDB 读取
            if (!lastMsg && window.ChatDB && window.ChatDB.db) {
                try {
                    const dbMessages = await getChatMessagesFromDB(conv.id);
                    if (dbMessages.length > 0) {
                        const lastCompressed = dbMessages[dbMessages.length - 1];
                        lastMsg = {
                            type: lastCompressed.t || lastCompressed.type,
                            content: lastCompressed.c !== undefined ? lastCompressed.c : lastCompressed.content,
                            sender: lastCompressed.s || lastCompressed.sender,
                            time: lastCompressed.tm || lastCompressed.time
                        };
                    }
                } catch (e) {
                    console.warn('读取 IndexedDB 消息失败:', e);
                }
            }
            
            const isSelf = lastMsg && (lastMsg.sender === 'user' || lastMsg.s === 'user');
            
            // 格式化预览文本
            let previewText = '';
            if (lastMsg) {
                const msgType = lastMsg.type;
                switch (msgType) {
                    case 'image':
                    case 'emoji':
                        previewText = '[图片]';
                        break;
                    case 'voice':
                        previewText = '[语音]';
                        break;
                    case 'transfer':
                        previewText = '[转账]';
                        break;
                    case 'merge_forward':
                        previewText = '[聊天记录]';
                        break;
                    case 'voice_note':
                        previewText = '[语音笔记]';
                        break;
                    default:
                        const content = lastMsg.content || '';
                        // 确保content是字符串
                        previewText = typeof content === 'string' ? content.substring(0, 30) : String(content).substring(0, 30);
                }
            }
            
            // 格式化时间
            let timeText = '';
            if (lastMsg && lastMsg.time) {
                const timestamp = typeof lastMsg.time === 'number' ? lastMsg.time : Date.parse(lastMsg.time);
                if (timestamp) {
                    const date = new Date(timestamp);
                    const now = new Date();
                    const isToday = date.toDateString() === now.toDateString();
                    
                    const yesterday = new Date(now);
                    yesterday.setDate(yesterday.getDate() - 1);
                    const isYesterday = date.toDateString() === yesterday.toDateString();
                    
                    if (isToday) {
                        timeText = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                    } else if (isYesterday) {
                        timeText = '昨天';
                    } else {
                        timeText = `${date.getMonth() + 1}/${date.getDate()}`;
                    }
                }
            }
            
            // 更新 DOM
            const msgItem = document.getElementById(`msg-item-${conv.id}`);
            if (msgItem) {
                const previewEl = msgItem.querySelector('.msg-preview');
                const timeEl = msgItem.querySelector('.msg-time');
                if (previewEl) previewEl.textContent = isSelf ? `你: ${previewText}` : previewText;
                if (timeEl) timeEl.textContent = timeText;
            }
        }
    }

    function isImageUrl(str) {
        if (!str) return false;
        
        // 支持多种格式:
        // 1. http:// 或 https:// 开头
        // 2. data: 开头的 base64
        // 3. 包含点号的相对路径 (如：images/emoji.png)
        // 4. 包含斜杠的 URL (如：i.imgur.com/xxx.png)
        // 5. 常见的图片扩展名
        
        const hasProtocol = str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:');
        const hasExtension = /\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)$/i.test(str);
        const hasDotAndSlash = str.includes('.') && (str.includes('/') || str.includes('\\'));
        const looksLikeURL = str.includes('.') && !str.includes(' ');
        
        return hasProtocol || hasExtension || (hasDotAndSlash && looksLikeURL);
    }

    // 格式化时间
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        
        if (isToday) {
            return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        }
        
        // 显示完整日期和时间
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    // 打开聊天
    let currentChatId = null;
    window.openChat = function(id, name, avatar) {
        console.log('[chat-app] openChat 被调用:', { id, name, avatar });
        
        // 加载角色最新头像（如果用户给角色换了头像）
        const chatConfigKey = `chat_config_${id}`;
        const chatConfig = JSON.parse(localStorage.getItem(chatConfigKey) || '{}');
        if (chatConfig.avatar) {
            avatar = chatConfig.avatar;
            console.log('🎭 使用角色的最新头像:', avatar);
        }
        
        // 清除未读消息计数
        clearUnreadCount(id);
        
        // 角色查手机模式下，显示内心想法
        const phoneBeingChecked = localStorage.getItem('phone_being_checked');
        if (phoneBeingChecked === 'true') {
            // 获取最后一条消息
            const chatKey = `chat_${id}`;
            const saved = localStorage.getItem(chatKey);
            let lastMessage = '';
            if (saved) {
                try {
                    const messages = JSON.parse(saved);
                    if (messages.length > 0) {
                        const lastMsg = messages[messages.length - 1];
                        lastMessage = lastMsg.c || lastMsg.content || '';
                        if (typeof lastMessage === 'string' && lastMessage.length > 20) {
                            lastMessage = lastMessage.substring(0, 20) + '...';
                        }
                    }
                } catch (e) {}
            }
            
            // 调用 async 函数生成内心想法
            showThoughtBubbleForChat(name, lastMessage);
        }
        
        // 保存到 localStorage 以便新页面使用
        localStorage.setItem('currentChatId', id);
        localStorage.setItem('currentChatName', name);
        localStorage.setItem('currentChatAvatar', avatar);
        
        // 使用 postMessage 通知父窗口打开 iframe（避免 file:// 协议下的跨域错误）
        try {
            console.log('[chat-app] 发送 openChat 请求:', { id, name, avatar });
            window.parent.postMessage({
                type: 'openChatIframe',
                chatId: id,
                chatName: name,
                chatAvatar: avatar
            }, '*');
        } catch(e) {
            console.warn('[chat-app] 无法发送 postMessage，直接跳转:', e);
            window.location.href = `chat-interface.html?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`;
        }
    };
    
    // 清除未读消息计数
    function clearUnreadCount(chatId) {
        try {
            const currentPersona = localStorage.getItem('currentPersona') || 'default';
            const conversationsKey = `persona_${currentPersona}_chatConversations`;
            const conversations = JSON.parse(localStorage.getItem(conversationsKey) || '[]');
            
            const conversation = conversations.find(c => c.id === chatId);
            if (!conversation) return;
            
            // 如果已经有未读消息，清除它
            if (conversation.unread && conversation.unread > 0) {
                console.log(` 清除未读计数: ${conversation.unread} → 0`);
                conversation.unread = 0;
                
                // 保存回 localStorage
                localStorage.setItem(conversationsKey, JSON.stringify(conversations));
                
                // 触发 storage 事件，更新 UI
                localStorage.setItem('unreadCountUpdated', JSON.stringify({
                    chatId: chatId,
                    unread: 0,
                    timestamp: Date.now()
                }));
            }
        } catch (error) {
            console.error('清除未读计数失败:', error);
        }
    }
    
    // 清除所有会话的未读计数
    function clearAllUnreadCounts() {
        try {
            const currentPersona = localStorage.getItem('currentPersona') || 'default';
            const conversationsKey = `persona_${currentPersona}_chatConversations`;
            const conversations = JSON.parse(localStorage.getItem(conversationsKey) || '[]');
            
            let hasChanges = false;
            
            conversations.forEach(conversation => {
                if (conversation.unread && conversation.unread > 0) {
                    console.log(`🧹 清除 ${conversation.name || conversation.id} 的未读计数: ${conversation.unread} → 0`);
                    conversation.unread = 0;
                    hasChanges = true;
                }
            });
            
            if (hasChanges) {
                // 保存回 localStorage
                localStorage.setItem(conversationsKey, JSON.stringify(conversations));
                console.log('✅ 所有未读计数已清除');
                
                // 触发 UI 更新
                localStorage.setItem('unreadCountUpdated', JSON.stringify({
                    clearAll: true,
                    timestamp: Date.now()
                }));
            } else {
                console.log('ℹ️ 没有未读消息需要清除');
            }
        } catch (error) {
            console.error('❌ 清除所有未读计数失败:', error);
        }
    }

    window.closeChat = function() {
        document.getElementById('chat-page').classList.remove('active');
        currentChatId = null;
    };

    // ====== 消息列表长按置顶功能 ======
    let longPressTimer = null;
    let isLongPress = false;
    let touchStartX = 0;
    let touchStartY = 0;

    // 触摸开始
    window.handleMsgTouchStart = function(event, convId) {
        const touch = event.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        isLongPress = false;
        
        longPressTimer = setTimeout(() => {
            isLongPress = true;
            showMessageContextMenu(event, convId);
        }, 500); // 500ms 长按触发
    };

    // 触摸结束
    window.handleMsgTouchEnd = function(event, convId) {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
        // 如果不是长按，允许正常的点击事件执行
        if (!isLongPress) {
            // 点击事件会通过 onclick 属性正常触发
            return true;
        }
        // 如果是长按，阻止点击
        event.preventDefault();
        event.stopPropagation();
    };

    // 触摸移动（取消长按）
    window.handleMsgTouchMove = function(event) {
        const touch = event.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartX);
        const deltaY = Math.abs(touch.clientY - touchStartY);
        
        // 如果移动超过 10px，取消长按
        if (deltaX > 10 || deltaY > 10) {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        }
    };

    // 鼠标按下
    window.handleMsgMouseDown = function(event, convId) {
        isLongPress = false;
        
        longPressTimer = setTimeout(() => {
            isLongPress = true;
            showMessageContextMenu(event, convId);
        }, 500); // 500ms 长按触发
    };

    // 鼠标松开
    window.handleMsgMouseUp = function(event, convId) {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
        // 如果不是长按，允许正常的点击事件执行
        if (!isLongPress) {
            // 点击事件会通过 onclick 属性正常触发
            return true;
        }
        // 如果是长按，阻止点击
        event.preventDefault();
        event.stopPropagation();
    };

    // 显示右键/长按菜单
    window.showMessageContextMenu = function(event, convId) {
        event.preventDefault();
        event.stopPropagation();
        
        const conversations = getData('chatConversations') || [];
        const conv = conversations.find(c => c.id === convId);
        if (!conv) return;
        
        const isPinned = conv.pinned || false;
        const pinText = isPinned ? '取消置顶' : '置顶聊天';
        
        // 创建上下文菜单
        const menu = document.createElement('div');
        menu.id = 'msg-context-menu';
        menu.style.cssText = `
            position: fixed;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
            padding: 8px 0;
            z-index: 10000;
            min-width: 160px;
        `;
        
        // 置顶/取消置顶选项
        menu.innerHTML = `
            <div class="context-menu-item" onclick="togglePinConversation('${convId}'); closeContextMenu();" style="
                padding: 12px 20px;
                cursor: pointer;
                font-size: 14px;
                color: ${isPinned ? '#666' : '#333'};
                transition: background 0.2s;
            " onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">
                ${pinText}
            </div>
            <div class="context-menu-divider" style="
                height: 1px;
                background: rgba(0, 0, 0, 0.08);
                margin: 4px 0;
            "></div>
            <div class="context-menu-item" onclick="deleteConversation('${convId}'); closeContextMenu();" style="
                padding: 12px 20px;
                cursor: pointer;
                font-size: 14px;
                color: #FF3B30;
                transition: background 0.2s;
            " onmouseover="this.style.background='rgba(255, 59, 48, 0.1)'" onmouseout="this.style.background='transparent'">
                删除聊天
            </div>
        `;
        
        // 定位菜单
        const x = event.clientX || (event.touches && event.touches[0].clientX) || 0;
        const y = event.clientY || (event.touches && event.touches[0].clientY) || 0;
        
        menu.style.left = Math.min(x, window.innerWidth - 180) + 'px';
        menu.style.top = Math.min(y, window.innerHeight - 150) + 'px';
        
        // 移除旧菜单
        const oldMenu = document.getElementById('msg-context-menu');
        if (oldMenu) oldMenu.remove();
        
        document.body.appendChild(menu);
        
        // 点击其他地方关闭菜单
        setTimeout(() => {
            document.addEventListener('click', closeContextMenu, { once: true });
        }, 100);
    };

    // 关闭上下文菜单
    window.closeContextMenu = function() {
        const menu = document.getElementById('msg-context-menu');
        if (menu) {
            menu.remove();
        }
    };

    // 置顶/取消置顶对话
    window.togglePinConversation = function(convId) {
        const conversations = getData('chatConversations') || [];
        const conv = conversations.find(c => c.id === convId);
        if (!conv) return;
        
        conv.pinned = !conv.pinned;
        
        // 如果置顶，移到列表最前面
        if (conv.pinned) {
            const idx = conversations.indexOf(conv);
            if (idx > 0) {
                conversations.splice(idx, 1);
                conversations.unshift(conv);
            }
        }
        
        saveData('chatConversations', conversations);
        renderMessages();
        
        showToast(conv.pinned ? '已置顶' : '已取消置顶');
    };

    // 系统风格的确认弹窗
    function showSystemConfirm(message, onConfirm) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.4);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.2s;
        `;
        
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: #FFFFFF;
            border-radius: 14px;
            padding: 0;
            max-width: 280px;
            width: 80%;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            overflow: hidden;
            animation: scaleIn 0.2s;
        `;
        
        dialog.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <div style="font-size: 15px; color: #333; line-height: 1.5;">${message}</div>
            </div>
            <div style="display: flex; border-top: 0.5px solid rgba(0,0,0,0.1);">
                <button class="confirm-cancel-btn" style="
                    flex: 1;
                    padding: 14px;
                    border: none;
                    background: transparent;
                    font-size: 16px;
                    color: #007AFF;
                    cursor: pointer;
                    font-weight: 400;
                ">取消</button>
                <div style="width: 0.5px; background: rgba(0,0,0,0.1);"></div>
                <button class="confirm-ok-btn" style="
                    flex: 1;
                    padding: 14px;
                    border: none;
                    background: transparent;
                    font-size: 16px;
                    color: #007AFF;
                    cursor: pointer;
                    font-weight: 600;
                ">确定</button>
            </div>
        `;
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // 添加动画样式
        if (!document.getElementById('system-confirm-styles')) {
            const style = document.createElement('style');
            style.id = 'system-confirm-styles';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        return new Promise((resolve) => {
            dialog.querySelector('.confirm-cancel-btn').onclick = () => {
                overlay.remove();
                resolve(false);
            };
            
            dialog.querySelector('.confirm-ok-btn').onclick = () => {
                overlay.remove();
                resolve(true);
                if (onConfirm) onConfirm();
            };
            
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                    resolve(false);
                }
            };
        });
    }

    // 删除对话
    window.deleteConversation = async function(convId) {
        const confirmed = await showSystemConfirm('确定要删除这个聊天吗？');
        if (!confirmed) return;
        
        const conversations = getData('chatConversations') || [];
        const newConversations = conversations.filter(c => c.id !== convId);
        
        saveData('chatConversations', newConversations);
        
        // 清除消息
        const chatKey = `chat_${convId}`;
        localStorage.removeItem(chatKey);
        
        if (window.ChatDB && window.ChatDB.db) {
            window.ChatDB.deleteChat(convId);
        }
        
        renderMessages();
        showToast('已删除');
    };

    function renderChatMessages(chatId) {
        const body = document.getElementById('chat-body');
        if (!body) {
            console.warn('️ chat-body 元素未找到');
            return;
        }
        const messages = getData('chatMessages') || {};
        const msgs = messages[chatId] || [];
        
        body.innerHTML = msgs.map(msg => `
            <div class="chat-message ${msg.self ? 'self' : ''}">
                <div class="chat-bubble">${msg.text}</div>
            </div>
        `).join('');
        
        body.scrollTop = body.scrollHeight;
    }

    window.sendMessage = function() {
        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        if (!text || !currentChatId) return;
        
        const messages = getData('chatMessages') || {};
        if (!messages[currentChatId]) messages[currentChatId] = [];
        
        messages[currentChatId].push({
            text: text,
            self: true,
            time: Date.now()
        });
        
        saveData('chatMessages', messages);
        input.value = '';
        renderChatMessages(currentChatId);
        
        const conversations = getData('chatConversations') || [];
        const conv = conversations.find(c => c.id === currentChatId);
        if (conv) {
            const idx = conversations.indexOf(conv);
            if (idx > 0) {
                conversations.splice(idx, 1);
                conversations.unshift(conv);
            }
            saveData('chatConversations', conversations);
            renderMessages();
        }
        
        setTimeout(() => {
            const contacts = getData('chatContacts') || [];
            const contact = contacts.find(c => c.id === currentChatId);
            if (contact) {
                // 调用 AI 回复（而不是 canned response）
                if (typeof window.triggerAIReply === 'function') {
                    window.triggerAIReply();
                } else {
                    // 如果 triggerAIReply 不可用，使用默认回复
                    messages[currentChatId].push({
                        text: `收到你的消息了！`,
                        self: false,
                        time: Date.now()
                    });
                    saveData('chatMessages', messages);
                    renderChatMessages(currentChatId);
                }
            }
        }, 500);
    };

    // ========== 通讯录模块 ==========
    // ========== 联系人模块 ==========
    let currentContactTab = 'friends'; // 当前选中的tab
        
    function renderContacts() {
        const list = document.getElementById('contact-list');
        if (!list) {
            console.warn('️ contact-list 元素未找到');
            return;
        }
        const contacts = getData('chatContacts') || [];
            
        // 自动分组：好友和群聊
        const friends = contacts.filter(c => !c.isGroup || c.isGroup === false);
        const groups = contacts.filter(c => c.isGroup === true);
            
        // 更新tab计数
        const friendsCountEl = document.getElementById('friends-count');
        const groupsCountEl = document.getElementById('groups-count');
        if (friendsCountEl) friendsCountEl.textContent = friends.length;
        if (groupsCountEl) groupsCountEl.textContent = groups.length;
            
        if (contacts.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-text">暂无联系人</div>
                </div>
            `;
            return;
        }
            
        // 根据当前tab显示对应的联系人
        const currentContacts = currentContactTab === 'friends' ? friends : groups;
            
        let html = '';
            
        if (currentContacts.length > 0) {
            html = currentContacts.map(contact => renderContactItem(contact)).join('');
        } else {
            html = `
                <div class="empty-state" style="padding: 40px 20px;">
                    <div class="empty-state-icon">${currentContactTab === 'friends' ? '👤' : ''}</div>
                    <div class="empty-state-text">暂无${currentContactTab === 'friends' ? '好友' : '群聊'}</div>
                </div>
            `;
        }
            
        list.innerHTML = html;
    }
        
    // 切换联系人tab
    window.switchContactTab = function(type) {
        currentContactTab = type;
            
        // 更新tab样式
        const tabs = document.querySelectorAll('.contact-tab');
        tabs.forEach(tab => {
            if (tab.dataset.type === type) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
            
        // 重新渲染联系人列表
        renderContacts();
    }
        
    // 渲染单个联系人项
    function renderContactItem(contact) {
        const isGroup = contact.isGroup === true;
        const defaultAvatar = isGroup ? '👥' : '👤';
        return `
            <div class="contact-item">
                <div class="contact-item-left" onclick="startConversation('${contact.id}')">
                    <div class="contact-avatar" style="background: ${getAvatarColor(contact.id)}">
                        ${isImageUrl(contact.avatar) ? `<img src="${contact.avatar}" alt="">` : (contact.avatar || defaultAvatar)}
                    </div>
                    <div class="contact-info">
                        <div class="contact-name">${contact.name}</div>
                        <div class="contact-desc">${contact.info || (isGroup ? '群聊' : '好友')}</div>
                    </div>
                </div>
                <div class="contact-item-right" onclick="showContactDetail('${contact.id}')">›</div>
            </div>
        `;
    }
    
    // 切换分组展开/折叠
    window.toggleContactGroup = function(groupId) {
        const listEl = document.getElementById(`group-list-${groupId}`);
        const toggleEl = document.getElementById(`group-toggle-${groupId}`);
        if (listEl && toggleEl) {
            if (listEl.style.display === 'none') {
                listEl.style.display = 'block';
                toggleEl.textContent = '▼';
            } else {
                listEl.style.display = 'none';
                toggleEl.textContent = '▶';
            }
        }
    }
    
    // ========== 分组管理 ==========
    let currentEditingGroupId = null;
    let selectedGroupIcon = 'user';
    
    // 图标映射
    const iconMap = {
        user: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
        family: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
        work: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
        study: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',
        heart: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
        star: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
        game: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M6 12h4m-2-2v4"></path><line x1="15" y1="11" x2="15.01" y2="11"></line><line x1="18" y1="13" x2="18.01" y2="13"></line></svg>',
        music: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>',
        book: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
        sparkles: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.272 1.272L21 12l-5.813 1.912a2 2 0 0 0-1.272 1.272L12 21l-1.912-5.813a2 2 0 0 0-1.272-1.272L3 12l5.813-1.912a2 2 0 0 0 1.272-1.272L12 3z"></path></svg>',
        building: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M8 10h.01"></path><path d="M16 10h.01"></path><path d="M8 14h.01"></path><path d="M16 14h.01"></path></svg>',
        users: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'
    };
    
    // 获取图标 SVG
    function getIconSvg(iconName) {
        return iconMap[iconName] || iconMap.user;
    }
    
    // 打开管理分组弹窗
    window.openManageGroupsModal = function() {
        closeNavDropdown();
        const groups = getData('contactGroups') || [];
        const contacts = getData('chatContacts') || [];
        
        // 按 order 排序
        groups.sort((a, b) => a.order - b.order);
        
        const listEl = document.getElementById('group-list');
        if (!listEl) {
            console.warn('️ group-list 元素未找到，跳过渲染');
            return;
        }
        listEl.innerHTML = groups.map(group => {
            const count = contacts.filter(c => c.groupId === group.id || (!c.groupId && group.id === 'default')).length;
            const isDefault = group.id === 'default';
            
            return `
                <div class="group-item" onclick="openEditGroupModal('${group.id}')">
                    <span class="group-item-icon">${getIconSvg(group.icon)}</span>
                    <div class="group-item-info">
                        <div class="group-item-name">${group.name}</div>
                        <div class="group-item-count">${count} 个联系人</div>
                    </div>
                    ${!isDefault ? `
                        <div class="group-item-actions" onclick="event.stopPropagation()">
                            <div class="group-action-btn" onclick="moveGroupUp('${group.id}')" title="上移">↑</div>
                            <div class="group-action-btn" onclick="moveGroupDown('${group.id}')" title="下移">↓</div>
                            <div class="group-action-btn" onclick="deleteGroup('${group.id}')" title="删除">✕</div>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
        
        openModal('manage-groups-modal');
    }
    
    // 打开添加/编辑分组弹窗
    window.openAddGroupModal = function() {
        currentEditingGroupId = null;
        selectedGroupIcon = 'user';
        
        document.getElementById('edit-group-title').textContent = '添加分组';
        document.getElementById('group-name-input').value = '';
        document.getElementById('delete-group-btn').style.display = 'none';
        
        // 重置图标选择
        document.querySelectorAll('.icon-option').forEach(el => el.classList.remove('selected'));
        document.querySelector('.icon-option')?.classList.add('selected');
        
        openModal('edit-group-modal');
    }
    
    // 打开编辑分组弹窗
    window.openEditGroupModal = function(groupId) {
        const groups = getData('contactGroups') || [];
        const group = groups.find(g => g.id === groupId);
        
        if (!group) return;
        
        currentEditingGroupId = groupId;
        selectedGroupIcon = group.icon;
        
        document.getElementById('edit-group-title').textContent = '编辑分组';
        document.getElementById('group-name-input').value = group.name;
        document.getElementById('delete-group-btn').style.display = group.id === 'default' ? 'none' : 'block';
        
        // 设置选中的图标
        document.querySelectorAll('.icon-option').forEach(el => {
            el.classList.remove('selected');
            if (el.dataset.icon === group.icon) {
                el.classList.add('selected');
            }
        });
        
        openModal('edit-group-modal');
    }
    
    // 选择分组图标
    window.selectGroupIcon = function(el) {
        document.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
        el.classList.add('selected');
        selectedGroupIcon = el.dataset.icon || 'user';
    }
    
    // 保存分组
    window.confirmSaveGroup = function() {
        const name = document.getElementById('group-name-input').value.trim();
        
        if (!name) {
            showToast('请输入分组名称');
            return;
        }
        
        const groups = getData('contactGroups') || [];
        
        if (currentEditingGroupId) {
            // 编辑现有分组
            const group = groups.find(g => g.id === currentEditingGroupId);
            if (group) {
                group.name = name;
                group.icon = selectedGroupIcon;
                showToast('分组已更新');
            }
        } else {
            // 添加新分组
            const newGroup = {
                id: 'group_' + Date.now(),
                name: name,
                icon: selectedGroupIcon,
                order: groups.length
            };
            groups.push(newGroup);
            showToast('分组已添加');
        }
        
        saveData('contactGroups', groups);
        closeModal('edit-group-modal');
        renderContacts();
    }
    
    // 删除分组
    window.deleteGroup = function(groupId) {
        window.showIosConfirm('删除分组', '分组内的联系人将移至"我的好友"分组', '删除', function() {
            const groups = getData('contactGroups') || [];
            const contacts = getData('chatContacts') || [];
                
            // 将该分组的联系人移至默认分组
            contacts.forEach(contact => {
                if (contact.groupId === groupId) {
                    contact.groupId = 'default';
                }
            });
                
            // 删除分组
            const filteredGroups = groups.filter(g => g.id !== groupId);
                
            // 重新排序
            filteredGroups.forEach((group, index) => {
                group.order = index;
            });
                
            saveData('contactGroups', filteredGroups);
            saveData('chatContacts', contacts);
                
            closeModal('manage-groups-modal');
            renderContacts();
            showToast('分组已删除');
        }, false);
    }
    
    // 确认删除分组（从编辑弹窗）
    window.confirmDeleteGroup = function() {
        if (!currentEditingGroupId) return;
        
        if (currentEditingGroupId === 'default') {
            showToast('默认分组不能删除');
            return;
        }
        
        deleteGroup(currentEditingGroupId);
        closeModal('edit-group-modal');
    }
    
    // 上移分组
    window.moveGroupUp = function(groupId) {
        const groups = getData('contactGroups') || [];
        const index = groups.findIndex(g => g.id === groupId);
        
        if (index <= 0) return; // 已经在最上面
        
        // 交换 order
        const temp = groups[index].order;
        groups[index].order = groups[index - 1].order;
        groups[index - 1].order = temp;
        
        saveData('contactGroups', groups);
        openManageGroupsModal(); // 刷新列表
        renderContacts();
    }
    
    // 下移分组
    window.moveGroupDown = function(groupId) {
        const groups = getData('contactGroups') || [];
        const index = groups.findIndex(g => g.id === groupId);
        
        if (index >= groups.length - 1) return; // 已经在最下面
        
        // 交换 order
        const temp = groups[index].order;
        groups[index].order = groups[index + 1].order;
        groups[index + 1].order = temp;
        
        saveData('contactGroups', groups);
        openManageGroupsModal(); // 刷新列表
        renderContacts();
    }

    function getAvatarColor(id) {
        const colors = [
            'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-secondary) 100%)',
            'linear-gradient(135deg, var(--accent-pink) 0%, var(--accent-purple) 100%)',
            'linear-gradient(135deg, var(--accent-green) 0%, var(--accent-blue) 100%)',
            'linear-gradient(135deg, var(--accent-orange) 0%, var(--accent-pink) 100%)',
            'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)'
        ];
        return colors[parseInt(id) % colors.length];
    }

    window.startConversation = function(contactId) {
        const contacts = getData('chatContacts') || [];
        const contact = contacts.find(c => c.id === contactId);
        if (!contact) return;
        
        const conversations = getData('chatConversations') || [];
        let conv = conversations.find(c => c.id === contactId);
        
        if (!conv) {
            conv = {
                id: contactId,
                name: contact.name,
                avatar: contact.avatar,
                unread: 0
            };
            conversations.unshift(conv);
            saveData('chatConversations', conversations);
        }
        
        openChat(contactId, contact.name, contact.avatar);
    };

    // ========== 创建角色 ==========
    let avatarUploadType = null;
    let selectedRoleAvatar = '';

    window.openCreateRoleModal = function() {
        closeNavDropdown();
        selectedRoleAvatar = '';
            
        // 重置头像预览区域
        const preview = document.getElementById('role-avatar-preview');
        if (preview) {
            preview.innerHTML = `
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
                <div class="avatar-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: white; font-size: 11px; padding: 4px; text-align: center; opacity: 0; transition: opacity 0.2s; pointer-events: none;"> 更换</div>
            `;
            preview.style.background = '#f5f5f5';
        }
        
        // 重置角色类型
        const roleTypeSelect = document.getElementById('role-type');
        if (roleTypeSelect) {
            roleTypeSelect.value = 'npc';
        }
        
        // 重置角色语言
        const roleLanguageSelect = document.getElementById('role-language');
        if (roleLanguageSelect) {
            roleLanguageSelect.value = 'zh';
        }
            
        // 加载分组列表
        const groups = getData('contactGroups') || [];
        const groupSelect = document.getElementById('role-group-select');
        if (groupSelect) {
            groupSelect.innerHTML = groups.map(g => 
                `<option value="${g.id}">${g.name}</option>`
            ).join('');
        }
        
        openModal('create-role-modal');
    };

    window.uploadAvatar = function(type) {
        avatarUploadType = type;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // 检查文件大小 (限制 500KB)
            if (file.size > 500 * 1024) {
                showToast('图片大小不能超过 500KB', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    // 压缩图片
                    const dataUrl = await compressImage(event.target.result, 200, 200, 0.7);
                    addAvatarToSelector(type, dataUrl);
                } catch (error) {
                    console.error('图片压缩失败:', error);
                    showToast('图片处理失败', 'error');
                }
            };
            reader.readAsDataURL(file);
        };
        input.click();
    };

    // 显示头像上传选择菜单
    window.showAvatarUploadMenu = function() {
        // 创建选择菜单
        const menu = document.createElement('div');
        menu.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            z-index: 10001;
            min-width: 280px;
            animation: fadeIn 0.2s ease;
        `;
        
        menu.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 18px; font-weight: 600; color: #333; margin-bottom: 8px;">选择头像来源</div>
                <div style="font-size: 13px; color: #999;">请选择上传方式</div>
            </div>
            <div style="display: flex; gap: 12px;">
                <div id="upload-local-btn" style="flex: 1; padding: 16px; background: #f5f5f5; border-radius: 12px; text-align: center; cursor: pointer; transition: all 0.2s;">
                    <div style="font-size: 14px; font-weight: 500; color: #333; margin-bottom: 4px;">本地上传</div>
                    <div style="font-size: 12px; color: #999;">从相册选择</div>
                </div>
                <div id="upload-url-btn" style="flex: 1; padding: 16px; background: #f5f5f5; border-radius: 12px; text-align: center; cursor: pointer; transition: all 0.2s;">
                    <div style="font-size: 14px; font-weight: 500; color: #333; margin-bottom: 4px;">链接上传</div>
                    <div style="font-size: 12px; color: #999;">输入图片URL</div>
                </div>
            </div>
            <div style="margin-top: 16px; text-align: center;">
                <div id="cancel-btn" style="display: inline-block; padding: 8px 24px; background: #f0f0f0; border-radius: 8px; cursor: pointer; font-size: 14px; color: #666; transition: all 0.2s;">取消</div>
            </div>
        `;
        
        // 添加遮罩层
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.3);
            z-index: 10000;
            animation: fadeIn 0.2s ease;
        `;
        
        // 使用事件监听而不是内联onclick，避免引号转义问题
        document.body.appendChild(overlay);
        document.body.appendChild(menu);
        
        // 绑定本地上传按钮事件
        const localBtn = document.getElementById('upload-local-btn');
        localBtn.onclick = function() {
            menu.remove();
            overlay.remove();
            uploadAvatar('role');
        };
        localBtn.onmouseover = function() {
            this.style.background = '#e8e8e8';
        };
        localBtn.onmouseout = function() {
            this.style.background = '#f5f5f5';
        };
        
        // 绑定链接上传按钮事件
        const urlBtn = document.getElementById('upload-url-btn');
        urlBtn.onclick = function() {
            menu.remove();
            overlay.remove();
            avatarUrlInput('role');
        };
        urlBtn.onmouseover = function() {
            this.style.background = '#e8e8e8';
        };
        urlBtn.onmouseout = function() {
            this.style.background = '#f5f5f5';
        };
        
        // 绑定取消按钮事件
        const cancelBtn = document.getElementById('cancel-btn');
        cancelBtn.onclick = function() {
            menu.remove();
            overlay.remove();
        };
        cancelBtn.onmouseover = function() {
            this.style.background = '#e0e0e0';
        };
        cancelBtn.onmouseout = function() {
            this.style.background = '#f0f0f0';
        };
        
        // 点击遮罩层关闭
        overlay.onclick = function() {
            menu.remove();
            overlay.remove();
        };
    };

    window.avatarUrlInput = function(type) {
        avatarUploadType = type;
        openModal('url-modal');
    };

    window.confirmAvatarUrl = function() {
        const url = document.getElementById('avatar-url-input').value.trim();
        if (!url) {
            showToast('请输入URL');
            return;
        }
        addAvatarToSelector(avatarUploadType, url);
        closeModal('url-modal');
        document.getElementById('avatar-url-input').value = '';
    };

    function addAvatarToSelector(type, avatar) {
        if (type === 'role') {
            // 角色头像：更新预览区域
            const preview = document.getElementById('role-avatar-preview');
            if (preview) {
                preview.innerHTML = `<img src="${avatar}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" alt="">`;
                preview.style.background = 'transparent';
            }
            selectedRoleAvatar = avatar;
            showToast('头像已选择！');
        } else {
            // 我的头像：旧逻辑
            const selectorId = 'my-avatar-selector';
            const selector = document.getElementById(selectorId);
                
            if (!selector) {
                console.warn(`️ ${selectorId} 元素未找到`);
                return;
            }
                
            selector.innerHTML = '';
                
            const option = document.createElement('div');
            option.className = 'avatar-option selected';
            option.dataset.avatar = avatar;
            option.innerHTML = `<img src="${avatar}" alt="">`;
                
            option.onclick = () => {
                document.querySelectorAll(`#${selectorId} .avatar-option`).forEach(a => a.classList.remove('selected'));
                option.classList.add('selected');
                const profile = getData('myProfile') || {};
                profile.avatar = avatar;
                saveData('myProfile', profile);
                renderProfile();
            };
                
            selector.appendChild(option);
                
            const profile = getData('myProfile') || {};
            profile.avatar = avatar;
            saveData('myProfile', profile);
            renderProfile();
            showToast('头像已保存！');
        }
    }

    window.createRole = function() {
        const name = document.getElementById('role-name').value.trim();
        const info = document.getElementById('role-info').value.trim();
        const persona = document.getElementById('role-persona').value.trim();
        const groupId = document.getElementById('role-group-select').value;
        const roleType = document.getElementById('role-type').value;
        const language = document.getElementById('role-language').value;
        
        if (!name) {
            showToast('请输入角色名称');
            return;
        }
        
        if (!selectedRoleAvatar) {
            showToast('请上传头像');
            return;
        }
        
        const contacts = getData('chatContacts') || [];
        const newContact = {
            id: Date.now().toString(),
            name: name,
            avatar: selectedRoleAvatar,
            info: info,
            persona: persona,
            groupId: groupId || 'default',
            roleType: roleType || 'npc',
            language: language || 'zh'
        };
        
        contacts.push(newContact);
        saveData('chatContacts', contacts);
        
        document.getElementById('role-name').value = '';
        document.getElementById('role-info').value = '';
        document.getElementById('role-persona').value = '';
        document.getElementById('role-type').value = 'npc';
        document.getElementById('role-language').value = 'zh';
        
        closeModal('create-role-modal');
        renderContacts();
        showToast('角色创建成功！');
    };

    // ========== 添加好友 - 显示所有角色 ==========
    window.openAddFriendModal = function() {
        closeNavDropdown();
        const contacts = getData('chatContacts') || [];
        
        const list = document.getElementById('add-friend-list');
        if (!list) {
            console.warn('️ add-friend-list 元素未找到');
            return;
        }
        
        if (contacts.length === 0) {
            list.innerHTML = '<div class="empty-state"><div class="empty-state-text">暂无可添加的好友</div></div>';
        } else {
            list.innerHTML = contacts.map(c => `
                <div class="select-contact-item" data-id="${c.id}" onclick="toggleSelectContact(this)">
                    <div class="select-checkbox"></div>
                    <div class="contact-avatar" style="background: ${getAvatarColor(c.id)}">
                        ${isImageUrl(c.avatar) ? `<img src="${c.avatar}" alt="">` : (c.avatar || '👤')}
                    </div>
                    <div class="contact-name">${c.name}</div>
                </div>
            `).join('');
        }
        
        openModal('add-friend-modal');
    };

    window.toggleSelectContact = function(el) {
        el.querySelector('.select-checkbox').classList.toggle('checked');
    };

    window.confirmAddFriends = function() {
        const selected = document.querySelectorAll('#add-friend-list .select-contact-item .select-checkbox.checked');
        const contacts = getData('chatContacts') || [];
        const conversations = getData('chatConversations') || [];
        
        selected.forEach(el => {
            const item = el.closest('.select-contact-item');
            const contactId = item.dataset.id;
            const contact = contacts.find(c => c.id === contactId);
            
            if (contact && !conversations.find(c => c.id === contactId)) {
                conversations.unshift({
                    id: contactId,
                    name: contact.name,
                    avatar: contact.avatar,
                    unread: 0
                });
            }
        });
        
        saveData('chatConversations', conversations);
        closeModal('add-friend-modal');
        renderMessages();
        showToast('添加成功！');
    };

    // ========== 发起群聊 ==========
    window.openCreateGroupModal = function() {
        closeNavDropdown();
        const contacts = getData('chatContacts') || [];
        const list = document.getElementById('group-member-list');
        
        if (!list) {
            console.warn('️ group-member-list 元素未找到');
            return;
        }
        
        list.innerHTML = contacts.map(c => `
            <div class="select-contact-item" data-id="${c.id}" onclick="toggleSelectContact(this)">
                <div class="select-checkbox"></div>
                <div class="contact-avatar" style="background: ${getAvatarColor(c.id)}">
                    ${isImageUrl(c.avatar) ? `<img src="${c.avatar}" alt="">` : (c.avatar || '👤')}
                </div>
                <div class="contact-name">${c.name}</div>
            </div>
        `).join('');
        
        openModal('create-group-modal');
    };

    window.createGroup = function() {
        const groupName = document.getElementById('group-name').value.trim();
        const selected = document.querySelectorAll('#group-member-list .select-contact-item .select-checkbox.checked');
        
        if (!groupName) {
            showToast('请输入群聊名称');
            return;
        }
        
        if (selected.length === 0) {
            showToast('请选择群成员');
            return;
        }
        
        const contacts = getData('chatContacts') || [];
        const conversations = getData('chatConversations') || [];
        
        const groupId = 'group_' + Date.now();
        const memberIds = Array.from(selected).map(el => el.closest('.select-contact-item').dataset.id);
        
        // 获取成员头像列表
        const memberAvatars = memberIds.map(mid => {
            const member = contacts.find(c => c.id === mid);
            return member ? (member.avatar || '👤') : '👤';
        });
        
        // 获取当前用户ID作为群主
        const myProfile = getData('myProfile') || {};
        const ownerId = myProfile.id || 'user_' + Date.now();
        
        // 创建群聊对象
        const newGroup = {
            id: groupId,
            name: groupName,
            avatar: '👥',
            unread: 0,
            isGroup: true,
            owner: ownerId,  // 群主 ID
            members: [ownerId, ...memberIds],  // 包含群主
            memberAvatars: [(myProfile.avatar || '👤'), ...memberAvatars],
            muted: false,  // 是否禁言
            worldbookId: null,  // 绑定的世界书 ID
            announcement: '',  // 群公告
            createdAt: Date.now()
        };
        
        // 保存到通讯录
        contacts.push(newGroup);
        saveData('chatContacts', contacts);
        
        // 保存到会话列表
        conversations.unshift(newGroup);
        saveData('chatConversations', conversations);
        
        document.getElementById('group-name').value = '';
        closeModal('create-group-modal');
        renderMessages();
        showToast('群聊创建成功！');
        
        // 打开群聊界面
        setTimeout(() => {
            openChat(groupId, groupName, '👥');
        }, 500);
    };

    // ========== 个人主页头像和名称可编辑 ==========
    window.openEditProfileAvatar = function() {
        const profile = getData('myProfile') || {};
        openModal('mask-modal');
    };

    window.openEditProfileName = function() {
        const profile = getData('myProfile') || {};
        const newName = prompt('输入新昵称：', profile.name || '用户');
        if (newName && newName.trim()) {
            profile.name = newName.trim();
            saveData('myProfile', profile);
            renderProfile();
            showToast('昵称修改成功！');
        }
    };

    // ========== 朋友圈封面编辑 ==========
    window.editMomentsCover = function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const dataUrl = event.target.result;
                    saveData('momentsCover', dataUrl);
                    renderMoments();
                    showToast('封面已更换！');
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    // ========== 编辑个性签名 ==========
    window.editMomentsBio = function() {
        const currentBio = getData('momentsBio') || '';
        const newBio = prompt('输入个性签名：', currentBio);
        if (newBio !== null) {
            saveData('momentsBio', newBio.trim());
            renderMoments();
            showToast('个性签名已更新！');
        }
    };

    // ========== 朋友圈模块 - 微信风格 ==========
    let momentImages = [];
    let momentVisibility = 'public'; // public, private, partial
    let momentVisibleContacts = []; // 部分可见时选中的联系人ID列表
    
    window.openPublishModal = function() {
        closeNavDropdown();
        momentImages = [];
        momentVisibility = 'public';
        momentVisibleContacts = [];
        document.getElementById('publish-textarea').value = '';
        renderPublishImages();
        updateVisibilityBadge();
        document.getElementById('publish-modal').classList.add('active');
        
        // 隐藏弹窗内的顶栏
        const publishHeader = document.querySelector('.publish-header');
        if (publishHeader) {
            publishHeader.style.display = 'none';
        }
        
        // 通知父窗口切换到发表模式
        window.parent.postMessage({
            type: 'switchToPublishMode'
        }, '*');
        
        // 隐藏底部导航栏
        const tabBar = document.querySelector('.bottom-tab-bar');
        if (tabBar) {
            tabBar.style.display = 'none';
        }
    };

    window.closePublishModal = function() {
        document.getElementById('publish-modal').classList.remove('active');
        
        // 显示弹窗内的顶栏
        const publishHeader = document.querySelector('.publish-header');
        if (publishHeader) {
            publishHeader.style.display = 'flex';
        }
        
        // 恢复底部导航栏
        const tabBar = document.querySelector('.bottom-tab-bar');
        if (tabBar) {
            tabBar.style.display = 'flex';
        }
        
        // 通知父窗口恢复朋友圈模式
        window.parent.postMessage({
            type: 'switchToMomentsMode'
        }, '*');
    };

    // 显示可见性选择弹窗
    window.showVisibilityModal = function() {
        renderContactSelector();
        updateVisibilitySelection();
        document.getElementById('visibility-modal').classList.add('active');
    };

    // 关闭可见性选择弹窗
    window.closeVisibilityModal = function() {
        document.getElementById('visibility-modal').classList.remove('active');
    };

    // 选择可见性
    window.selectVisibility = function(type) {
        momentVisibility = type;
        updateVisibilitySelection();
        
        // 显示/隐藏联系人选择器
        const contactSelector = document.getElementById('contact-selector');
        if (type === 'partial') {
            contactSelector.classList.add('active');
        } else {
            contactSelector.classList.remove('active');
        }
    };

    // 更新可见性选择状态
    function updateVisibilitySelection() {
        document.querySelectorAll('.visibility-option').forEach(el => {
            el.classList.remove('selected');
            if (el.dataset.visibility === momentVisibility) {
                el.classList.add('selected');
            }
        });
    }

    // 渲染联系人选择器
    function renderContactSelector() {
        const contacts = getData('chatContacts') || [];
        const list = document.getElementById('contact-select-list');
        
        if (!list) {
            console.warn('️ contact-select-list 元素未找到');
            return;
        }
        
        if (contacts.length === 0) {
            list.innerHTML = '<div class="empty-state" style="padding: 20px;"><div class="empty-state-text">暂无联系人</div></div>';
            return;
        }
        
        list.innerHTML = contacts.map(contact => {
            const isChecked = momentVisibleContacts.includes(contact.id);
            return `
                <div class="contact-select-item" onclick="toggleContactVisibility('${contact.id}')">
                    <div class="contact-select-checkbox ${isChecked ? 'checked' : ''}"></div>
                    <div class="contact-avatar" style="width: 36px; height: 36px; border-radius: 50%; background: ${getAvatarColor(contact.id)}; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;">
                        ${isImageUrl(contact.avatar) ? `<img src="${contact.avatar}" alt="" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : (contact.avatar || '👤')}
                    </div>
                    <div class="contact-name">${contact.name}</div>
                </div>
            `;
        }).join('');
    }

    // 切换联系人可见性
    window.toggleContactVisibility = function(contactId) {
        const index = momentVisibleContacts.indexOf(contactId);
        if (index > -1) {
            momentVisibleContacts.splice(index, 1);
        } else {
            momentVisibleContacts.push(contactId);
        }
        renderContactSelector();
    };

    // 确认可见性设置
    window.confirmVisibility = function() {
        if (momentVisibility === 'partial' && momentVisibleContacts.length === 0) {
            showToast('请至少选择一个联系人');
            return;
        }
        updateVisibilityBadge();
        closeVisibilityModal();
    };

    // 更新可见性徽章显示
    function updateVisibilityBadge() {
        const badge = document.getElementById('publish-privacy-badge');
        if (!badge) return;
        
        switch (momentVisibility) {
            case 'public':
                badge.textContent = '公开';
                break;
            case 'private':
                badge.textContent = '私密';
                break;
            case 'partial':
                badge.textContent = `部分可见 (${momentVisibleContacts.length})`;
                break;
        }
    }

// 🔄 监听朋友圈数据更新事件，自动刷新
window.addEventListener('storage', (e) => {
    if (e.key === 'moments_updated') {
        console.log('🔄 检测到朋友圈数据更新（storage事件），自动刷新...');
        if (typeof renderMoments === 'function') {
            renderMoments();
        }
    }
});

// 🔄 监听自定义事件，自动刷新朋友圈
window.addEventListener('momentsUpdated', (e) => {
    console.log('🔄 检测到朋友圈数据更新（自定义事件），自动刷新...', e.detail);
    if (typeof renderMoments === 'function') {
        renderMoments();
        console.log('✅ 朋友圈已刷新');
    } else {
        console.warn('⚠️ renderMoments 函数不存在');
    }
});

    function renderMoments() {
        const list = document.getElementById('moments-list');
        if (!list) {
            console.warn('️ moments-list 元素未找到');
            return;
        }
        const moments = getData('moments') || [];
        
        // 获取当前用户信息用于可见性过滤
        const myProfile = getData('myProfile') || {};
        const currentUserId = myProfile.id || 'user_' + Date.now();
        const currentUserName = myProfile.name || '用户';
        
        // 根据可见性过滤动态
        const filteredMoments = moments.filter(moment => {
            // 如果是自己发布的动态，始终可见
            if (moment.author === currentUserName) {
                return true;
            }
            
            // 根据可见性设置判断
            const visibility = moment.visibility || 'public'; // 默认为公开（兼容旧数据）
            
            if (visibility === 'public') {
                // 公开：所有人都能看到
                return true;
            } else if (visibility === 'private') {
                // 私密：只有发布者本人能看到（上面已经处理了）
                return false;
            } else if (visibility === 'partial') {
                // 部分可见：只有在 visibleContacts 列表中的用户能看到
                const visibleContacts = moment.visibleContacts || [];
                return visibleContacts.includes(currentUserId);
            }
            
            return true; // 默认显示
        });
        
        const profile = getData('myProfile') || {};
        const momentsAvatar = document.getElementById('moments-avatar');
        const momentsName = document.getElementById('moments-name');
        const momentsBio = document.getElementById('moments-bio');
        const momentsCover = document.getElementById('moments-cover');
        const coverData = getData('momentsCover');
        const momentsBioData = getData('momentsBio');
        
        if (momentsCover) {
            if (coverData) {
                momentsCover.style.backgroundImage = `url(${coverData})`;
                momentsCover.classList.add('has-image');
            } else {
                momentsCover.style.backgroundImage = '';
                momentsCover.classList.remove('has-image');
            }
        }
        
        if (momentsAvatar) {
            if (isImageUrl(profile.avatar)) {
                momentsAvatar.innerHTML = `<img src="${profile.avatar}" alt="">`;
            } else {
                momentsAvatar.textContent = profile.avatar || '';
            }
        }
        if (momentsName) {
            // 直接使用主页名称，不再单独设置朋友圈昵称
            momentsName.textContent = profile.name || '用户';
        }
        if (momentsBio) {
            momentsBio.textContent = momentsBioData || '';
        }
        
        if (filteredMoments.length === 0) {
            list.innerHTML = '<div class="empty-state" style="padding-top: 40px;"><div class="empty-state-text">暂无动态</div></div>';
            return;
        }
        
        list.innerHTML = filteredMoments.sort((a, b) => b.time - a.time).map(moment => {
            const hasImages = moment.images && moment.images.length > 0;
            const isSingleImage = hasImages && moment.images.length === 1;
            
            // SVG 图标定义
            const likeIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
            const commentIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
            const filledLikeIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="#e74c3c" stroke="#e74c3c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
            
            const myName = (getData('myProfile') || {}).name || '用户';
            const isLiked = moment.likes && moment.likes.includes(myName);
            const currentLikeIcon = isLiked ? filledLikeIcon : likeIcon;
            const likeCount = moment.likes ? moment.likes.length : 0;
            const commentCount = moment.comments ? moment.comments.length : 0;
            
            return `
                <div class="moment-item">
                    <div class="moment-header">
                        <div class="moment-avatar">${isImageUrl(moment.avatar) ? `<img src="${moment.avatar}" alt="">` : ''}</div>
                        <div>
                            <div class="moment-author">
                                ${moment.author}
                                ${moment.visibility === 'private' ? '<span class="moment-visibility-badge private"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> 私密</span>' : ''}
                                ${moment.visibility === 'partial' ? `<span class="moment-visibility-badge partial"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> 部分可见(${(moment.visibleContactNames || []).length})</span>` : ''}
                            </div>
                            <div class="moment-time">${formatTime(moment.time)}</div>
                        </div>
                    </div>
                    ${moment.content ? `<div class="moment-content">${moment.content}</div>` : ''}
                    ${hasImages ? `
                        <div class="moment-images ${isSingleImage ? 'single' : ''}">
                            ${moment.images.slice(0, 9).map(img => `
                                <div class="moment-img"><img src="${img}" alt=""></div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <!-- 操作按钮 -->
                    <div class="moment-actions">
                        <div class="moment-action-btn" onclick="toggleMomentMenu('${moment.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                        </div>
                        <!-- 弹出菜单 -->
                        <div class="moment-action-menu" id="moment-menu-${moment.id}" onclick="event.stopPropagation()">
                            <div class="moment-menu-item" onclick="toggleLikeMoment('${moment.id}')">
                                <span>点赞${likeCount > 0 ? ' (' + likeCount + ')' : ''}</span>
                            </div>
                            <div class="moment-menu-item" onclick="toggleCommentInput('${moment.id}')">
                                ${commentIcon}
                                <span>评论${commentCount > 0 ? ' (' + commentCount + ')' : ''}</span>
                            </div>
                            <div class="moment-menu-item" onclick="aiGenerateMomentComment('${moment.id}')">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22l-.75-12.07C9.4 9.58 8 7.95 8 6a4 4 0 0 1 4-4z"></path><path d="M12 6V2"></path><path d="m8.56 4.56 1.06 1.06"></path><path d="m15.44 4.56-1.06 1.06"></path></svg>
                                <span>AI 评论</span>
                            </div>
                            <div class="moment-menu-item" onclick="deleteMyMoment('${moment.id}')" style="color: #ff6b6b;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                <span>删除</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 点赞列表 -->
                    ${likeCount > 0 ? `
                        <div class="moment-likes-box">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#e74c3c" stroke="#e74c3c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                            <span>${moment.likes.join(', ')}</span>
                        </div>
                    ` : ''}
                    
                    <!-- 评论列表 -->
                    ${moment.comments && moment.comments.length > 0 ? `
                        <div class="moment-comments-box">
                            ${moment.comments.map((c, idx) => `
                                <div class="moment-comment-item">
                                    <div class="moment-comment-content">
                                        <span class="moment-comment-author" onclick="replyToComment('${moment.id}', '${c.author}')">${c.author}</span>
                                        ${c.replyTo ? `<span class="moment-comment-reply-to"> 回复 </span><span class="moment-comment-reply-target">${c.replyTo}</span>` : ''}
                                        <span class="moment-comment-text">${c.text}</span>
                                    </div>
                                    <button class="moment-comment-delete" onclick="deleteMomentComment('${moment.id}', ${idx})">删除</button>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <!-- 评论输入框 -->
                    <div class="moment-comment-input-box" id="comment-input-${moment.id}" style="display: none;">
                        <div class="moment-comment-input-wrapper">
                            <input type="text" class="moment-comment-input" id="comment-text-${moment.id}" placeholder="写评论..." />
                            <button class="moment-comment-send" onclick="sendMomentComment('${moment.id}')">发送</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    window.addMomentImage = function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    momentImages.push(event.target.result);
                    renderPublishImages();
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    function renderPublishImages() {
        const container = document.getElementById('publish-images-grid');
        let html = momentImages.map((img, i) => `
            <div class="publish-img-item">
                <img src="${img}" alt="">
                <div class="publish-img-remove" onclick="removeMomentImage(${i})">×</div>
            </div>
        `).join('');
        
        if (momentImages.length < 9) {
            html += `
                <div class="publish-add-btn" onclick="addMomentImage()">
                    <span>📷</span>
                    <span>添加图片</span>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }

    window.removeMomentImage = function(index) {
        momentImages.splice(index, 1);
        renderPublishImages();
    };

    window.publishMoment = function() {
        const content = document.getElementById('publish-textarea').value.trim();
        
        if (!content && momentImages.length === 0) {
            showToast('请输入内容或添加图片');
            return;
        }
        
        // 验证部分可见时必须选择联系人
        if (momentVisibility === 'partial' && momentVisibleContacts.length === 0) {
            showToast('请至少选择一个可见的联系人');
            return;
        }
        
        const profile = getData('myProfile') || {};
        const moments = getData('moments') || [];
        
        // 构建可见的联系人名字列表（用于显示）
        const contacts = getData('chatContacts') || [];
        const visibleContactNames = momentVisibleContacts.map(id => {
            const contact = contacts.find(c => c.id === id);
            return contact ? contact.name : '';
        }).filter(name => name);
        
        moments.unshift({
            id: Date.now().toString(),
            author: profile.name || '用户',
            avatar: profile.avatar || '👤',
            content: content,
            images: [...momentImages],
            time: Date.now(),
            likes: [],
            // 新增可见性字段
            visibility: momentVisibility,
            visibleContacts: [...momentVisibleContacts],
            visibleContactNames: visibleContactNames
        });
        
        saveData('moments', moments);
        
        closePublishModal();
        renderMoments();
        showToast('发表成功！');
    };

    window.showMomentActions = function(momentId) {
        window.showIosConfirm('点赞', '确定要点赞这条动态吗？', '点赞', function() {
            likeMoment(momentId);
        }, true);
    };

    // 切换点赞
    window.toggleLikeMoment = function(momentId) {
        const moments = getData('moments') || [];
        const moment = moments.find(m => m.id === momentId);
        if (!moment) return;
        
        const myName = (getData('myProfile') || {}).name || '用户';
        
        if (!moment.likes) {
            moment.likes = [];
        }
        
        const index = moment.likes.indexOf(myName);
        if (index > -1) {
            // 取消点赞
            moment.likes.splice(index, 1);
            showToast('已取消点赞');
        } else {
            // 点赞
            moment.likes.push(myName);
            showToast('已点赞');
        }
        
        saveData('moments', moments);
        renderMoments();
    };

    // 切换评论输入框
    window.toggleCommentInput = function(momentId) {
        const inputBox = document.getElementById(`comment-input-${momentId}`);
        if (inputBox) {
            if (inputBox.style.display === 'none') {
                inputBox.style.display = 'block';
                const input = document.getElementById(`comment-text-${momentId}`);
                if (input) input.focus();
            } else {
                inputBox.style.display = 'none';
            }
        }
    };

    // 回复评论
    window.replyToComment = function(momentId, replyToAuthor) {
        const inputBox = document.getElementById(`comment-input-${momentId}`);
        const input = document.getElementById(`comment-text-${momentId}`);
        
        if (inputBox && input) {
            inputBox.style.display = 'block';
            input.focus();
            
            // 存储回复目标信息
            input.dataset.replyTo = replyToAuthor;
            input.placeholder = `回复 ${replyToAuthor}...`;
            
            // 自动在输入框中添加 "回复 用户名 "
            if (!input.value.startsWith(`回复 ${replyToAuthor} `)) {
                input.value = `回复 ${replyToAuthor} `;
            }
            
            console.log(`准备回复 ${replyToAuthor} 的评论`);
        }
    };

    window.toggleMomentMenu = function(momentId) {
        const menu = document.getElementById(`moment-menu-${momentId}`);
        if (menu) {
            menu.classList.toggle('show');
        }
    };

    window.closeAllMomentMenus = function() {
        document.querySelectorAll('.moment-action-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
    };

    // 点击外部关闭菜单
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.moment-actions')) {
            window.closeAllMomentMenus();
        }
    });

    // 删除评论
    window.deleteMomentComment = function(momentId, commentIdx) {
        const moments = getData('moments') || [];
        const moment = moments.find(m => m.id === momentId);
        if (!moment || !moment.comments || !moment.comments[commentIdx]) return;
        
        moment.comments.splice(commentIdx, 1);
        saveData('moments', moments);
        renderMoments();
        showToast('评论已删除');
    };

    // AI 生成评论
    window.aiGenerateMomentComment = async function(momentId) {
        try {
            console.log('🔵 AI评论功能被调用，momentId:', momentId);
            
            const moments = getData('moments') || [];
            console.log('📦 当前动态数量:', moments.length);
            
            const moment = moments.find(m => m.id === momentId);
            if (!moment) {
                console.error('❌ 未找到动态，momentId:', momentId);
                showToast('未找到该动态');
                return;
            }
            
            console.log('📝 动态内容:', moment.content?.substring(0, 50));
            
            // 获取 API 配置
            const config = JSON.parse(localStorage.getItem('globalApiConfig') || '{}');
            const url = config.mainApi?.url || '';
            const token = config.mainApi?.token || '';
            const model = config.model || 'gpt-3.5-turbo';
            
            console.log('🔧 API配置:', { url: url ? '已配置' : '未配置', token: token ? '已配置' : '未配置', model });
            
            if (!url || !token) {
                console.error('❌ API配置不完整');
                showToast('请先配置 API');
                return;
            }
            
            // 获取当前用户信息（用于显示评论作者）
            const myProfile = getData('myProfile') || {};
            const myName = myProfile.name || '用户';
            
            // 获取一个随机角色来生成评论（与自动评论保持一致）
            const chatContacts = getData('chatContacts') || [];
            const availableContacts = chatContacts.filter(c => c.name !== myName);
            if (availableContacts.length === 0) {
                console.error('❌ 没有可用的角色');
                showToast('没有可用的角色来评论');
                return;
            }
            const randomContact = availableContacts[Math.floor(Math.random() * availableContacts.length)];
            const commenterName = randomContact.name;
            const commenterPersona = randomContact.roleInfo?.persona || '普通用户';
            
            console.log('👤 选择的角色:', { commenterName, persona: commenterPersona });
            
            // 构建 System Prompt（与自动评论保持一致）
            const systemPrompt = `你是「${commenterName}」，${commenterPersona}。你看到了好友 ${moment.author} 发布了一条朋友圈动态，请以你的视角和口吻评论这条动态，保持角色一致性。直接输出评论内容，不要思考过程，10-50字。`;
            const userPrompt = `${moment.author} 发布了一条朋友圈动态：\n${moment.content || '（只发了图片）'}\n\n请对这条动态发表你的评论。`;
            
            // 调用 AI API 生成评论
            showToast('AI 正在思考...');
            
            let baseUrl = url.trim();
            if (baseUrl.endsWith('/')) {
                baseUrl = baseUrl.slice(0, -1);
            }
            if (!baseUrl.includes('/chat/completions')) {
                if (baseUrl.endsWith('/v1')) {
                    baseUrl += '/chat/completions';
                } else if (!baseUrl.endsWith('/v1/chat/completions')) {
                    if (baseUrl.includes('/v1/')) {
                        baseUrl += '/chat/completions';
                    } else {
                        baseUrl += '/v1/chat/completions';
                    }
                }
            }
            
            const response = await fetch(baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.8,
                    max_tokens: 8192  // 增加到8192，与自动评论保持一致
                })
            });
            
            console.log('📡 API响应状态:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API请求失败:', response.status, errorText);
                throw new Error(`API请求失败: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('📦 API返回数据:', data);
            
            // 检查choices是否存在且有内容
            if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
                console.error('❌ API返回的choices为空');
                console.error('完整返回数据:', JSON.stringify(data, null, 2));
                showToast('AI 评论失败：API未返回有效内容，请检查模型配置');
                return;
            }
            
            const commentContent = data.choices[0]?.message?.content;
            
            if (!commentContent || commentContent.trim() === '') {
                console.error('❌ AI返回的内容为空');
                console.error('choices[0]:', data.choices[0]);
                showToast('AI 评论失败，请重试');
                return;
            }
            
            // 将 AI 评论作为新评论添加（使用角色名字）
            if (!moment.comments) {
                moment.comments = [];
            }
            
            moment.comments.push({
                id: 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                author: commenterName, // 使用角色名字，不是用户名字
                text: commentContent.trim(),
                time: Date.now(),
                isAIReply: true
            });
            
            saveData('moments', moments);
            renderMoments();
            showToast('AI 评论成功');
            console.log('AI 生成评论:', commentContent);
            // 关闭菜单
            if (typeof window.closeAllMomentMenus === 'function') {
                window.closeAllMomentMenus();
            }
        } catch (error) {
            console.error('❌ AI 评论失败:', error);
            console.error('错误堆栈:', error.stack);
            showToast('AI 评论失败: ' + error.message);
        }
    };

    // 发送评论
    window.sendMomentComment = function(momentId) {
        const input = document.getElementById(`comment-text-${momentId}`);
        if (!input) return;
        
        let text = input.value.trim();
        if (!text) {
            showToast('请输入评论内容');
            return;
        }
        
        // 获取回复目标信息
        const replyTo = input.dataset.replyTo || null;
        
        // 如果有回复目标，去除输入框中的"回复 XXX"前缀
        if (replyTo && text.startsWith(`回复 ${replyTo} `)) {
            text = text.substring(`回复 ${replyTo} `.length).trim();
        }
        
        if (!text) {
            showToast('请输入评论内容');
            return;
        }
        
        const moments = getData('moments') || [];
        const moment = moments.find(m => m.id === momentId);
        if (!moment) return;
        
        const myName = (getData('myProfile') || {}).name || '用户';
        
        if (!moment.comments) {
            moment.comments = [];
        }
        
        moment.comments.push({
            id: 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            author: myName,
            text: text,
            time: Date.now(),
            replyTo: replyTo  // 保存回复目标
        });
        
        saveData('moments', moments);
        
        // 清空回复状态
        delete input.dataset.replyTo;
        input.placeholder = '写评论...';
        input.value = '';
        
        renderMoments();
        showToast('评论成功');
        
        // 🚀 评论后立即触发角色回复检查
        if (typeof processMomentsAutoReply === 'function') {
            console.log('用户评论后，立即触发角色回复检查...');
            setTimeout(() => {
                processMomentsAutoReply();
            }, 1000); // 延迟1秒后触发，确保数据已保存
        }
    };

    // AI 回复评论
    window.aiReplyToComment = async function(momentId, commentIndex) {
        try {
            const moments = getData('moments') || [];
            const moment = moments.find(m => m.id === momentId);
            if (!moment) {
                showToast('未找到该动态');
                return;
            }
            
            const comment = moment.comments[commentIndex];
            if (!comment) {
                showToast('未找到该评论');
                return;
            }
            
            // 获取 API 配置
            const config = JSON.parse(localStorage.getItem('globalApiConfig') || '{}');
            const url = config.mainApi?.url || '';
            const token = config.mainApi?.token || '';
            const model = config.model || 'gpt-3.5-turbo';
            
            if (!url || !token) {
                console.error('API配置不完整');
                showToast('请先配置 API');
                return;
            }
            
            // 构建 System Prompt
            const myProfile = getData('myProfile') || {};
            const myName = myProfile.name || '用户';
            const persona = myProfile.persona || '';
            
            const systemPrompt = `你现在需要扮演一个真实的角色，回复朋友圈的评论。

【角色信息】
- 姓名：${myName}
- 人设：${persona || '普通用户'}

【回复要求】
1. 用自然、真实的语气回复评论
2. 回复要符合角色的性格和人设
3. 回复长度适中（20-50字左右）
4. 可以适当使用表情符号增加生动性
5. 不要提及这是AI生成的，要完全以角色身份回复

【输出格式】
请直接输出回复内容，不需要任何额外的说明或标记。`;
            
            // 调用 AI API 生成回复
            showToast('AI 正在思考...');
            
            let baseUrl = url.trim();
            if (baseUrl.endsWith('/')) {
                baseUrl = baseUrl.slice(0, -1);
            }
            if (!baseUrl.includes('/chat/completions')) {
                if (baseUrl.endsWith('/v1')) {
                    baseUrl += '/chat/completions';
                } else if (!baseUrl.endsWith('/v1/chat/completions')) {
                    if (baseUrl.includes('/v1/')) {
                        baseUrl += '/chat/completions';
                    } else {
                        baseUrl += '/v1/chat/completions';
                    }
                }
            }
                        
            const response = await fetch(baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: `有人评论了你的朋友圈："${comment.text}"，请回复这条评论。` }
                    ],
                    temperature: 0.7,
                    max_tokens: 512
                })
            });
            
            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }
            
            const data = await response.json();
            const replyContent = data.choices?.[0]?.message?.content;
            
            if (!replyContent || replyContent.trim() === '') {
                showToast('AI 回复失败，请重试');
                return;
            }
            
            // 将 AI 回复作为新评论添加
            if (!moment.comments) {
                moment.comments = [];
            }
            
            moment.comments.push({
                id: 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                author: myName,
                text: replyContent.trim(),
                time: Date.now(),
                isAIReply: true // 标记为 AI 回复
            });
            
            saveData('moments', moments);
            renderMoments();
            showToast('AI 回复成功');
            console.log('AI 回复评论:', replyContent);
            
        } catch (error) {
            console.error('AI 回复评论失败:', error);
            showToast('AI 回复失败，请重试');
        }
    };

    window.likeMoment = function(momentId) {
        const moments = getData('moments') || [];
        const moment = moments.find(m => m.id === momentId);
        if (moment) {
            if (!moment.likes) moment.likes = [];
            const profile = getData('myProfile') || {};
            const userId = profile.name || 'user';
            
            const idx = moment.likes.indexOf(userId);
            if (idx > -1) {
                moment.likes.splice(idx, 1);
            } else {
                moment.likes.push(userId);
            }
            
            saveData('moments', moments);
            renderMoments();
        }
    };

    // ========== 角色生成动态 ==========
    window.generateRoleMoment = async function() {
        closeNavDropdown();
        const contacts = getData('chatContacts') || [];
        if (contacts.length === 0) {
            showToast('暂无可生成动态的角色');
            return;
        }
        
        const randomContact = contacts[Math.floor(Math.random() * contacts.length)];
        
        // 获取API配置
        const apiCfg = JSON.parse(localStorage.getItem('globalApiConfig') || '{}');
        const url = apiCfg.mainApi?.url || '';
        const token = apiCfg.mainApi?.token || '';
        const model = apiCfg.model || 'gpt-3.5-turbo';
        
        if (!url || !token) {
            console.error('API配置不完整:', { url: url ? '已配置' : '未配置', token: token ? '已配置' : '未配置' });
            showToast('请先在设置中配置AI API');
            return;
        }
        
        try {
            showToast('🤖 AI正在生成动态...');
            
            // 获取角色的最近聊天记录作为上下文
            let recentChatContext = '';
            try {
                const chatKey = `chat_${randomContact.id}`;
                const chatData = JSON.parse(localStorage.getItem(chatKey) || '[]');
                const recentMessages = chatData.slice(-15); // 取最近15条消息
                
                if (recentMessages.length > 0) {
                    recentChatContext = '\n【最近的聊天记忆】\n';
                    recentMessages.forEach(msg => {
                        const time = new Date(msg.time).toLocaleString('zh-CN', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        const sender = msg.sender === 'user' ? '我' : randomContact.name;
                        recentChatContext += `[${time}] ${sender}: ${msg.content}\n`;
                    });
                }
            } catch (e) {
                console.log('获取聊天记录失败:', e);
            }
            
            // 构建系统提示词
            const persona = randomContact.persona || '普通用户';
            const info = randomContact.info || '';
            const systemPrompt = `你现在需要扮演一个真实的角色，发布一条朋友圈动态。

【角色信息】
- 姓名：${randomContact.name}
- 人设：${persona}${info ? '\n- 备注：' + info : ''}
${recentChatContext}
【朋友圈要求】
1. **必须根据角色的人设和性格来写朋友圈**
2. **如果有聊天记忆，请参考最近的聊天内容**，让朋友圈与聊天内容有连贯性
3. 可以从聊天中提取话题、情绪、事件等，转化为朋友圈的内容
4. 内容要自然、真实，像真人发的朋友圈
5. 可以包含：日常生活、心情感受、所见所闻、思考感悟等
6. 长度适中，不要太长（50-200字左右）
7. 可以适当使用表情符号增加生动性
8. 不要提及这是AI生成的，要完全以角色身份发布
9. 如果聊天记录很少或没有，就根据人设自由发挥

【输出格式】
请直接输出朋友圈的文字内容，不需要任何额外的说明或标记。

示例：
今天的阳光真好，坐在窗边喝杯咖啡，感觉整个人都放松了`;
            
            // 调用AI API
            const response = await fetch(`${url}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: '请生成一条朋友圈动态' }
                    ],
                    temperature: 0.8,
                    max_tokens: 300
                })
            });
            
            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }
            
            const data = await response.json();
            const momentContent = data.choices?.[0]?.message?.content?.trim();
            
            if (!momentContent) {
                throw new Error('AI返回内容为空');
            }
            
            console.log('AI生成的朋友圈内容:', momentContent.substring(0, 100));
            
            // 保存到全局朋友圈列表
            const moments = getData('moments') || [];
            moments.unshift({
                id: Date.now().toString(),
                author: randomContact.name,
                avatar: randomContact.avatar,
                content: momentContent,
                images: [],
                time: Date.now(),
                likes: []
            });
            
            saveData('moments', moments);
            renderMoments();
            showToast(`${randomContact.name} 发布了动态！`);
            
        } catch (error) {
            console.error('AI生成动态失败:', error);
            showToast('生成失败，请检查API配置');
        }
    };

    // 删除我的动态
    window.deleteMyMoment = function(momentId) {
        window.showIosConfirm('删除动态', '确定要删除这条动态吗？', '删除', function() {
            try {
                let moments = getData('moments') || [];
                
                // 找到并删除指定的动态
                const index = moments.findIndex(m => m.id === momentId);
                if (index > -1) {
                    moments.splice(index, 1);
                    saveData('moments', moments);
                    
                    // 重新渲染朋友圈列表
                    renderMoments();
                    
                    showToast('已删除动态');
                    console.log('已删除我的动态:', momentId);
                } else {
                    showToast('未找到该动态');
                }
            } catch (error) {
                console.error('删除动态失败:', error);
                showToast('删除失败，请重试');
            }
        }, false);
    };

    // ========== 个人主页模块 ==========
    function renderProfile() {
        const profile = getData('myProfile') || { avatar: '', name: '用户' };
        const avatarEl = document.getElementById('profile-avatar');
        const nameEl = document.getElementById('profile-name');
        const qqEl = document.getElementById('profile-qq');
        const signatureEl = document.getElementById('profile-signature');
        
        // 同步更新当前人设的个人资料到 localStorage
        if (typeof currentPersonaId !== 'undefined' && currentPersonaId) {
            const myProfileKey = `persona_${currentPersonaId}_myProfile`;
            const currentProfile = JSON.parse(localStorage.getItem(myProfileKey) || '{}');
            
            // 将当前 profile 数据与人设关联
            currentProfile.name = profile.name;
            currentProfile.userId = profile.userId; // 🔴 同步用户ID
            currentProfile.realName = profile.realName; // 🔴 同步真实姓名
            currentProfile.signature = profile.signature; // 🔴 同步个性签名
            currentProfile.persona = profile.persona;
            currentProfile.avatar = profile.avatar;
            
            localStorage.setItem(myProfileKey, JSON.stringify(currentProfile));
        }
        
        // 渲染头像
        if (isImageUrl(profile.avatar)) {
            avatarEl.innerHTML = `<img src="${profile.avatar}" alt=""><div style="position:absolute;bottom:-2px;right:-2px;background:white;border:2px solid #fff;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;z-index:10;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></div>`;
        } else if (profile.avatar) {
            avatarEl.innerHTML = `${profile.avatar}<div style="position:absolute;bottom:-2px;right:-2px;background:white;border:2px solid #fff;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;z-index:10;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></div>`;
        } else {
            avatarEl.innerHTML = `<div style="font-size:14px;color:var(--text-secondary);text-align:center;">点击上传</div>`;
        }
        
        // 渲染昵称
        nameEl.textContent = profile.name || '用户';
        
        // 渲染ID（原QQ号）
        const userId = profile.userId || '未设置'; // 🔴 使用userId字段
        qqEl.textContent = `ID：${userId}`; // 🔴 将"QQ号"改为"ID"
        
        // 渲染个性签名
        const signature = profile.signature || profile.bio || ''; // 🔴 优先使用个性签名，而不是人设设定
        signatureEl.textContent = signature ? signature.substring(0, 50) + (signature.length > 50 ? '...' : '') : '个性签名';
    }

    // 面具
    function renderMaskModal() {
        const profile = getData('myProfile') || {};
        let selector = document.getElementById('my-avatar-selector');
            
        // 如果元素不存在，直接在JavaScript中重建整个modal
        if (!selector) {
            console.warn('⚠️ my-avatar-selector 元素未找到，正在重建整个modal...');
            
            // 查找或创建mask-modal
            let maskModal = document.getElementById('mask-modal');
            if (!maskModal) {
                console.log('🔧 mask-modal 也不存在，正在创建...');
                
                // 创建整个mask-modal结构
                maskModal = document.createElement('div');
                maskModal.className = 'modal';
                maskModal.id = 'mask-modal';
                maskModal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <div class="modal-title">面具</div>
                            <div class="modal-close" onclick="closeModal('mask-modal')">✕</div>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <div class="form-label">我的头像</div>
                                <div class="avatar-upload-area">
                                    <div class="avatar-upload-btn" onclick="uploadAvatar('my')">📁 本地上传</div>
                                    <div class="avatar-upload-btn" onclick="avatarUrlInput('my')">🔗 链接上传</div>
                                </div>
                                <div class="avatar-selector" id="my-avatar-selector"></div>
                            </div>
                            <div class="form-group">
                                <div class="form-label">我的昵称</div>
                                <input type="text" class="form-input" id="my-name" placeholder="输入昵称">
                            </div>
                            <div class="form-group">
                                <div class="form-label">人设设定</div>
                                <textarea class="form-input form-textarea" id="my-persona" placeholder="描述你的人设..."></textarea>
                            </div>
                            <button class="form-btn" onclick="saveMyPersona()">保存当前人设</button>
                            
                            <!-- 保存的人设列表 -->
                            <div class="persona-list">
                                <div class="persona-list-title">保存的人设</div>
                                <div id="saved-personas"></div>
                            </div>
                        </div>
                    </div>
                `;
                
                // 添加到body中
                document.body.appendChild(maskModal);
                console.log('✅ mask-modal 创建成功');
            }
            
            // 现在查找selector
            selector = document.getElementById('my-avatar-selector');
            if (!selector) {
                console.error('❌ 即使重建后仍然找不到my-avatar-selector');
                return;
            }
        }
        
        renderMaskModalContent(profile, selector);
    }
    
    function renderMaskModalContent(profile, selector) {
        // 更新头像显示
        const avatarEl = document.getElementById('my-avatar-selector');
        if (avatarEl && isImageUrl(profile.avatar)) {
            avatarEl.innerHTML = `<img src="${profile.avatar}" alt="" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        } else if (avatarEl) {
            // 保持默认的 SVG 图标
            avatarEl.innerHTML = `
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position: absolute;">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
            `;
        }
        
        // 更新表单值
        const nameInput = document.getElementById('my-name');
        const idInput = document.getElementById('my-id'); // 🔴 新增：获取ID输入框
        const realnameInput = document.getElementById('my-realname'); // 🔴 新增：获取真实姓名输入框
        const signatureInput = document.getElementById('my-signature'); // 🔴 新增：获取个性签名输入框
        const personaInput = document.getElementById('my-persona');
        if (nameInput) nameInput.value = profile.name || '';
        if (idInput) idInput.value = profile.userId || ''; // 🔴 新增：填充用户ID
        if (realnameInput) realnameInput.value = profile.realName || ''; // 🔴 新增：填充真实姓名
        if (signatureInput) signatureInput.value = profile.signature || ''; // 🔴 新增：填充个性签名
        if (personaInput) personaInput.value = profile.persona || '';
        
        renderAllPersonas();
        if (typeof renderAltAccounts === 'function') renderAltAccounts();
    }

    function renderAllPersonas() {
        const personasList = document.getElementById('saved-personas');
        const allPersonas = getAllPersonas();
        
        if (allPersonas.length === 0) {
            personasList.innerHTML = '<div class="empty-state"><div class="empty-state-text">暂无保存的人设</div></div>';
            return;
        }
        
        personasList.innerHTML = allPersonas.map((p, i) => `
            <div class="persona-item ${p.id === currentPersonaId ? 'active' : ''}">
                <div class="persona-avatar">
                    ${isImageUrl(p.avatar) ? `<img src="${p.avatar}" alt="">` : (p.avatar || '👤')}
                </div>
                <div class="persona-info">
                    <div class="persona-name">${p.name || '人设' + (i + 1)}</div>
                    <div class="persona-desc">${p.persona?.substring(0, 30) || ''}...</div>
                </div>
                <div class="persona-actions">
                    <button class="persona-btn" onclick="editPersona('${p.id}')">编辑</button>
                    <button class="persona-btn" onclick="switchPersona('${p.id}')">切换</button>
                    <button class="persona-btn danger" onclick="deletePersona('${p.id}')">删除</button>
                </div>
            </div>
        `).join('');
    }

    window.selectMyAvatar = function(el) {
        document.querySelectorAll('#my-avatar-selector .avatar-option').forEach(a => a.classList.remove('selected'));
        el.classList.add('selected');
        
        const profile = getData('myProfile') || {};
        profile.avatar = el.dataset.avatar || el.textContent;
        saveData('myProfile', profile);
        renderProfile();
    };

    window.saveMyPersona = async function() {
        const profile = getData('myProfile') || {};
        
        profile.name = document.getElementById('my-name').value;
        profile.userId = document.getElementById('my-id').value; // 🔴 新增：保存用户ID（显示在主页）
        profile.realName = document.getElementById('my-realname').value; // 🔴 新增：保存真实姓名
        profile.signature = document.getElementById('my-signature').value; // 🔴 新增：保存个性签名
        profile.persona = document.getElementById('my-persona').value;
        
        const selectedAvatar = document.querySelector('#my-avatar-selector .avatar-option.selected');
        if (selectedAvatar) {
            profile.avatar = selectedAvatar.dataset.avatar || selectedAvatar.textContent || profile.avatar;
        }
        
        // 如果没有头像，随机生成一个
        if (!profile.avatar && profile.name) {
            try {
                profile.avatar = await generateRandomAvatar(profile.name);
                console.log('✓ 已生成随机头像');
            } catch (e) {
                console.error('生成头像失败:', e);
                profile.avatar = '👤'; // 降级方案
            }
        }
        
        saveData('myProfile', profile);
        
        const currentEditingPersonaId = window.currentEditingPersonaId;
        
        // 小号编辑保存
        if (window.currentEditingIsAlt && currentEditingPersonaId) {
            const alts = getAltAccounts();
            const altIdx = alts.findIndex(a => a.id === currentEditingPersonaId);
            if (altIdx !== -1) {
                alts[altIdx].name = profile.name;
                alts[altIdx].avatar = profile.avatar;
                saveAltAccounts(alts);
            }
            localStorage.setItem(`persona_${currentEditingPersonaId}_myProfile`, JSON.stringify(profile));
            delete window.currentEditingPersonaId;
            delete window.currentEditingIsAlt;
            renderAltAccounts();
            renderProfile();
            showToast('小号信息已更新！');
            return;
        }
        
        // 检查是否是编辑状态 (有 currentEditingPersonaId)
        const allPersonas = getAllPersonas();
        
        if (currentEditingPersonaId) {
            // 更新现有人设
            const existingIndex = allPersonas.findIndex(p => p.id === currentEditingPersonaId);
            if (existingIndex !== -1) {
                allPersonas[existingIndex] = {
                    id: currentEditingPersonaId,
                    avatar: profile.avatar,
                    name: profile.name,
                    userId: profile.userId, // 🔴 新增：保存用户ID（显示在主页）
                    realName: profile.realName, // 🔴 新增：保存真实姓名
                    signature: profile.signature, // 🔴 新增：保存个性签名
                    persona: profile.persona
                };
                showToast('人设更新成功！');
            } else {
                showToast('未找到原有人设，已创建新人设');
                allPersonas.push({
                    id: 'persona_' + Date.now(),
                    avatar: profile.avatar,
                    name: profile.name,
                    userId: profile.userId, // 🔴 新增：保存用户ID（显示在主页）
                    realName: profile.realName, // 🔴 新增：保存真实姓名
                    signature: profile.signature, // 🔴 新增：保存个性签名
                    persona: profile.persona
                });
            }
            // 清除编辑标记
            delete window.currentEditingPersonaId;
        } else {
            // 创建新人设
            const newPersonaId = 'persona_' + Date.now();
            allPersonas.push({
                id: newPersonaId,
                avatar: profile.avatar,
                name: profile.name,
                userId: profile.userId, // 🔴 新增：保存用户ID（显示在主页）
                realName: profile.realName, // 🔴 新增：保存真实姓名
                signature: profile.signature, // 🔴 新增：保存个性签名
                persona: profile.persona
            });
            showToast('人设保存成功！');
        }
        
        saveAllPersonas(allPersonas);
        renderMaskModal();
        renderProfile();
    };

    window.editPersona = function(personaId) {
        const allPersonas = getAllPersonas();
        const persona = allPersonas.find(p => p.id === personaId);
        if (!persona) return;
        
        const profile = getData('myProfile') || {};
        profile.avatar = persona.avatar;
        profile.name = persona.name;
        profile.userId = persona.userId; // 🔴 新增：加载用户ID
        profile.realName = persona.realName; // 🔴 新增：加载真实姓名
        profile.signature = persona.signature; // 🔴 新增：加载个性签名
        profile.persona = persona.persona;
        saveData('myProfile', profile);
        
        document.getElementById('my-name').value = persona.name || '';
        document.getElementById('my-id').value = persona.userId || ''; // 🔴 新增：填充用户ID
        document.getElementById('my-realname').value = persona.realName || ''; // 🔴 新增：填充真实姓名
        document.getElementById('my-signature').value = persona.signature || ''; // 🔴 新增：填充个性签名
        document.getElementById('my-persona').value = persona.persona || '';
        
        const selector = document.getElementById('my-avatar-selector');
        if (selector && isImageUrl(persona.avatar)) {
            selector.innerHTML = `<img src="${persona.avatar}" alt="" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        }
        
        // 设置当前编辑的人设 ID
        window.currentEditingPersonaId = personaId;
        
        showToast('已加载到编辑框，修改后点击「保存当前人设」保存');
    };

    window.deletePersona = function(personaId) {
        window.showIosConfirm('删除人设', '确定删除这个人设吗？', '删除', function() {
        
        const allPersonas = getAllPersonas();
        const filtered = allPersonas.filter(p => p.id !== personaId);
        saveAllPersonas(filtered);
        
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`persona_${personaId}_`)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        renderAllPersonas();
        showToast('删除成功！');
        }, false);
    };

    // ========== 小号系统 ==========

    function getAltAccounts() {
        return JSON.parse(localStorage.getItem('altAccounts') || '[]');
    }

    function saveAltAccounts(alts) {
        localStorage.setItem('altAccounts', JSON.stringify(alts));
    }

    function getMainAccountId() {
        return localStorage.getItem('currentPersonaId') || 'default';
    }

    function isCurrentAlt() {
        const currentId = localStorage.getItem('currentPersonaId') || 'default';
        const alts = getAltAccounts();
        return alts.some(a => a.id === currentId);
    }

    function getCurrentAltInfo() {
        const currentId = localStorage.getItem('currentPersonaId') || 'default';
        const alts = getAltAccounts();
        return alts.find(a => a.id === currentId) || null;
    }

    window.createAltAccount = function() {
        const mainId = getMainAccountId();
        const mainProfile = JSON.parse(localStorage.getItem(`persona_${mainId}_myProfile`) || '{}');

        const altId = 'alt_' + Date.now();
        const altName = '小号' + Math.floor(Math.random() * 9000 + 1000);

        const altProfile = {
            avatar: '',
            name: altName,
            userId: altId,
            realName: '',
            signature: '',
            persona: '',
            isAlt: true,
            linkedMainId: mainId
        };

        localStorage.setItem(`persona_${altId}_myProfile`, JSON.stringify(altProfile));

        const mainContacts = JSON.parse(localStorage.getItem(`persona_${mainId}_chatContacts`) || '[]');
        localStorage.setItem(`persona_${altId}_chatContacts`, JSON.stringify(mainContacts));
        localStorage.setItem(`persona_${altId}_chatConversations`, JSON.stringify([]));

        const alts = getAltAccounts();
        alts.push({
            id: altId,
            name: altName,
            avatar: '',
            linkedMainId: mainId,
            createdAt: Date.now()
        });
        saveAltAccounts(alts);

        renderAltAccounts();
        showToast('小号创建成功！');
    };

    window.switchToAlt = function(altId) {
        window.switchPersona(altId);
        renderAltAccounts();
    };

    window.switchToMain = function() {
        const alts = getAltAccounts();
        const currentId = localStorage.getItem('currentPersonaId') || 'default';
        const currentAlt = alts.find(a => a.id === currentId);
        if (currentAlt) {
            window.switchPersona(currentAlt.linkedMainId || 'default');
        } else {
            window.switchPersona('default');
        }
        renderAltAccounts();
    };

    window.deleteAltAccount = function(altId) {
        window.showIosConfirm('删除小号', '删除后小号的所有聊天记录也会消失，确定吗？', '删除', function() {
            const alts = getAltAccounts().filter(a => a.id !== altId);
            saveAltAccounts(alts);

            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(`persona_${altId}_`)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));

            const currentId = localStorage.getItem('currentPersonaId') || 'default';
            if (currentId === altId) {
                window.switchPersona('default');
            }

            renderAltAccounts();
            showToast('小号已删除');
        }, false);
    };

    window.editAltAccount = function(altId) {
        const alts = getAltAccounts();
        const alt = alts.find(a => a.id === altId);
        if (!alt) return;

        const altProfile = JSON.parse(localStorage.getItem(`persona_${altId}_myProfile`) || '{}');

        const profile = getData('myProfile') || {};
        profile.avatar = altProfile.avatar || '';
        profile.name = altProfile.name || alt.name;
        profile.userId = altProfile.userId || altId;
        profile.realName = altProfile.realName || '';
        profile.signature = altProfile.signature || '';
        profile.persona = altProfile.persona || '';
        profile.isAlt = true;
        profile.linkedMainId = altProfile.linkedMainId || alt.linkedMainId;
        saveData('myProfile', profile);

        document.getElementById('my-name').value = profile.name;
        document.getElementById('my-id').value = profile.userId;
        document.getElementById('my-realname').value = profile.realName;
        document.getElementById('my-signature').value = profile.signature;
        document.getElementById('my-persona').value = profile.persona;

        const selector = document.getElementById('my-avatar-selector');
        if (selector && isImageUrl(profile.avatar)) {
            selector.innerHTML = `<img src="${profile.avatar}" alt="" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        }

        window.currentEditingPersonaId = altId;
        window.currentEditingIsAlt = true;
    };

    function renderAltAccounts() {
        const listEl = document.getElementById('alt-accounts-list');
        if (!listEl) return;

        const alts = getAltAccounts();
        const currentId = localStorage.getItem('currentPersonaId') || 'default';

        if (alts.length === 0) {
            listEl.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #999; font-size: 13px;">
                    还没有小号，点击上方按钮创建
                </div>`;
            return;
        }

        listEl.innerHTML = alts.map(alt => {
            const altProfile = JSON.parse(localStorage.getItem(`persona_${alt.id}_myProfile`) || '{}');
            const isActive = currentId === alt.id;
            const avatarDisplay = isImageUrl(alt.avatar)
                ? `<img src="${alt.avatar}" alt="" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
                : (alt.avatar || '');

            return `
                <div style="display: flex; align-items: center; gap: 12px; padding: 12px; margin-bottom: 8px; background: ${isActive ? '#f0f0f0' : '#f9f9f9'}; border-radius: 12px; border: 1px solid ${isActive ? '#555' : '#eee'}; transition: all 0.2s;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: #e8e8e8; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; overflow: hidden;">
                        ${avatarDisplay}
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 14px; font-weight: 500; color: #333; display: flex; align-items: center; gap: 6px;">
                            ${alt.name || '小号'}
                            ${isActive ? '<span style="font-size: 11px; background: #555; color: white; padding: 1px 8px; border-radius: 10px;">当前</span>' : ''}
                        </div>
                        <div style="font-size: 12px; color: #999; margin-top: 2px;">角色不认识此身份</div>
                    </div>
                    <div style="display: flex; gap: 6px; flex-shrink: 0;">
                        ${isActive
                            ? `<button onclick="switchToMain()" style="padding: 4px 10px; background: #555; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">切回大号</button>`
                            : `<button onclick="switchToAlt('${alt.id}')" style="padding: 4px 10px; background: #555; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">切换</button>`
                        }
                        <button onclick="editAltAccount('${alt.id}')" style="padding: 4px 10px; background: #f0f0f0; color: #333; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">编辑</button>
                        <button onclick="deleteAltAccount('${alt.id}')" style="padding: 4px 10px; background: #fff1f0; color: #ff4d4f; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">删除</button>
                    </div>
                </div>`;
        }).join('');
    }

    // 钱包
    function renderWallet() {
        renderMyWallet();
        renderFamilyCard();
    }

    // 渲染我的钱包
    function renderMyWallet() {
        const wallet = getData('wallet') || { balance: 0, transactions: [] };
        const balanceEl = document.getElementById('wallet-balance');
        if (balanceEl) {
            balanceEl.textContent = wallet.balance.toFixed(2);
            
            // 角色查手机模式下，钱包可点击查看
            const phoneBeingChecked = localStorage.getItem('phone_being_checked');
            if (phoneBeingChecked === 'true') {
                balanceEl.style.cursor = 'pointer';
                balanceEl.onclick = () => {
                    // 调用 async 函数生成内心想法
                    showThoughtBubbleForWallet(wallet.balance);
                    // 显示交易记录
                    const transactionList = document.getElementById('transaction-list');
                    if (transactionList) {
                        transactionList.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                };
            }
        }
        
        const list = document.getElementById('transaction-list');
        if (!list) return;
        
        if (wallet.transactions.length === 0) {
            list.innerHTML = '<div class="empty-state"><div class="empty-state-text">暂无交易记录</div></div>';
            return;
        }
        
        list.innerHTML = wallet.transactions.slice(-10).reverse().map(t => {
            // 根据类型判断显示
            let title, amountSign, amountClass, icon;
            if (t.type === 'recharge') {
                // 充值：绿色正数
                title = '充值';
                amountSign = '+';
                amountClass = 'income';
                icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>';
            } else if (t.type === 'receive' || t.type === 'receive-transfer') {
                // 收款：绿色正数
                title = '收款';
                amountSign = '+';
                amountClass = 'income';
                icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>';
            } else if (t.type === 'transfer' || t.type === 'transfer-sent' || t.type === 'consumption') {
                // 转账/消费：红色负数
                title = '消费';
                amountSign = '-';
                amountClass = 'expense';
                icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>';
            } else {
                // 其他类型默认为消费
                title = t.type || '消费';
                amountSign = '-';
                amountClass = 'expense';
                icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>';
            }
            return `
            <div class="transaction-item">
                <div class="transaction-icon">
                    ${icon}
                </div>
                <div class="transaction-info">
                    <div class="transaction-title">${title}</div>
                    <div class="transaction-time">${new Date(t.time).toLocaleString()}</div>
                </div>
                <div class="transaction-amount ${amountClass}">
                    ${amountSign}${t.amount.toFixed(2)}
                </div>
            </div>`;
        }).join('');
    }

    // 切换钱包Tab
    window.switchWalletTab = function(tab) {
        // 切换Tab样式
        const tabs = document.querySelectorAll('.wallet-tab');
        tabs.forEach(t => t.classList.remove('active'));
        event.target.classList.add('active');
        
        // 切换模块显示
        const myWalletModule = document.getElementById('my-wallet-module');
        const piggybankModule = document.getElementById('piggybank-module');
        const familyCardModule = document.getElementById('family-card-module');
        const bankCardModule = document.getElementById('bank-card-module');
        
        // 隐藏所有模块
        myWalletModule.classList.remove('active');
        piggybankModule.classList.remove('active');
        familyCardModule.classList.remove('active');
        bankCardModule.classList.remove('active');
        
        // 显示选中的模块
        if (tab === 'my-wallet') {
            myWalletModule.classList.add('active');
        } else if (tab === 'piggybank') {
            piggybankModule.classList.add('active');
            renderPiggybank(); // 渲染小荷包数据
        } else if (tab === 'family-card') {
            familyCardModule.classList.add('active');
        } else if (tab === 'bank-card') {
            bankCardModule.classList.add('active');
            renderBankCards(); // 渲染银行卡列表
        }
    };

    // 渲染亲属卡
    function renderFamilyCard() {
        renderSentFamilyCards();
        renderReceivedFamilyCards();
        renderRoleSelect();
    }

    // 渲染角色选择下拉框
    function renderRoleSelect() {
        const select = document.getElementById('family-card-role-select');
        if (!select) return;
        
        const contacts = getData('chatContacts') || [];
        select.innerHTML = '<option value="">选择角色</option>';
        
        contacts.forEach(contact => {
            const option = document.createElement('option');
            option.value = contact.name;
            option.textContent = contact.name;
            select.appendChild(option);
        });
    }

    // 渲染已赠出的亲属卡
    function renderSentFamilyCards() {
        const familyCards = getData('familyCards') || { sent: [], received: [] };
        const container = document.getElementById('sent-family-cards');
        const recordsList = document.getElementById('sent-records-list');
        
        if (!container) return;
        
        if (familyCards.sent.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-text">暂无赠出的亲属卡</div></div>';
        } else {
            container.innerHTML = familyCards.sent.map(card => `
                <div class="family-card-item">
                    <div class="family-card-name">${card.roleName}</div>
                    <div class="family-card-limit">月度额度: <span>¥${card.limit.toFixed(2)}</span></div>
                </div>
            `).join('');
        }
        
        // 渲染赠出记录
        if (recordsList) {
            const sentRecords = familyCards.sentRecords || [];
            if (sentRecords.length === 0) {
                recordsList.innerHTML = '<div class="empty-state"><div class="empty-state-text">暂无赠出记录</div></div>';
            } else {
                recordsList.innerHTML = sentRecords.slice(-10).reverse().map(r => `
                    <div class="transaction-item">
                        <div class="transaction-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                        </div>
                        <div class="transaction-info">
                            <div class="transaction-title">赠予 ${r.roleName}</div>
                            <div class="transaction-time">${new Date(r.time).toLocaleString()}</div>
                        </div>
                        <div class="transaction-amount expense">
                            ¥${r.limit.toFixed(2)}
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    // 渲染收到的亲属卡
    function renderReceivedFamilyCards() {
        const familyCards = getData('familyCards') || { sent: [], received: [] };
        const container = document.getElementById('received-family-cards');
        const recordsList = document.getElementById('received-records-list');
        
        if (!container) return;
        
        if (familyCards.received.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-text">暂无收到的亲属卡</div></div>';
        } else {
            container.innerHTML = familyCards.received.map(card => `
                <div class="family-card-item">
                    <div class="family-card-name">${card.roleName}</div>
                    <div class="family-card-limit">月度额度: <span>¥${card.limit.toFixed(2)}</span></div>
                </div>
            `).join('');
        }
        
        // 渲染收入记录
        if (recordsList) {
            const receivedRecords = familyCards.receivedRecords || [];
            if (receivedRecords.length === 0) {
                recordsList.innerHTML = '<div class="empty-state"><div class="empty-state-text">暂无收入记录</div></div>';
            } else {
                recordsList.innerHTML = receivedRecords.slice(-10).reverse().map(r => `
                    <div class="transaction-item">
                        <div class="transaction-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                        </div>
                        <div class="transaction-info">
                            <div class="transaction-title">收到 ${r.roleName} 的亲属卡</div>
                            <div class="transaction-time">${new Date(r.time).toLocaleString()}</div>
                        </div>
                        <div class="transaction-amount income">
                            +¥${r.limit.toFixed(2)}
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    // 切换亲属卡类型
    window.switchFamilyCardType = function(type) {
        // 切换Tab样式
        const sendTab = document.getElementById('family-card-send-tab');
        const receiveTab = document.getElementById('family-card-receive-tab');
        
        if (type === 'send') {
            sendTab.classList.add('active');
            receiveTab.classList.remove('active');
        } else {
            sendTab.classList.remove('active');
            receiveTab.classList.add('active');
        }
        
        // 切换区块显示
        const sendSection = document.getElementById('family-card-send-section');
        const receiveSection = document.getElementById('family-card-receive-section');
        
        if (type === 'send') {
            sendSection.classList.add('active');
            receiveSection.classList.remove('active');
        } else {
            sendSection.classList.remove('active');
            receiveSection.classList.add('active');
        }
    };

    // 用户赠予角色亲属卡
    window.sendFamilyCard = async function() {
        const roleName = document.getElementById('family-card-role-select').value;
        const limit = parseFloat(document.getElementById('family-card-amount').value);
        
        if (!roleName) {
            showToast('请选择角色');
            return;
        }
        
        if (isNaN(limit) || limit <= 0) {
            showToast('请输入有效的月度额度');
            return;
        }
        
        const familyCards = getData('familyCards') || { sent: [], received: [], sentRecords: [], receivedRecords: [] };
        
        // 检查是否已经赠予过
        const existingIndex = familyCards.sent.findIndex(card => card.roleName === roleName);
        if (existingIndex !== -1) {
            // 更新额度
            familyCards.sent[existingIndex].limit = limit;
            familyCards.sent[existingIndex].time = Date.now();
        } else {
            // 新增亲属卡
            familyCards.sent.push({
                roleName: roleName,
                limit: limit,
                time: Date.now()
            });
        }
        
        // 添加记录
        familyCards.sentRecords.push({
            roleName: roleName,
            limit: limit,
            time: Date.now()
        });
        
        saveData('familyCards', familyCards);
        renderFamilyCard();
        showToast(`成功赠予 ${roleName} 亲属卡！`);
        
        // 🛡️ 关键修复：将亲属卡消息保存到角色的聊天记录中
        try {
            // 根据角色名称找到对应的联系人
            const contacts = getData('chatContacts') || [];
            const contact = contacts.find(c => c.name === roleName);
            
            if (!contact) {
                console.warn('⚠️ 找不到角色:', roleName);
                showToast('找不到该角色');
                return;
            }
            
            const chatId = contact.id;
            console.log('📦 保存亲属卡消息到角色:', roleName, 'chatId:', chatId);
            
            // 创建亲属卡消息对象（使用解压格式，与 chat-interface.js 一致）
            const familyCardMessage = {
                id: Date.now(),
                type: 'family-card',
                content: {
                    limit: limit,
                    remark: '我赠予你的亲属卡',
                    status: 'pending'
                },
                sender: 'user',
                time: Date.now(),
                avatar: (getData('myProfile') || {}).avatar || ''
            };
            
            // 首先尝试保存到 localStorage
            const key = `chat_${chatId}`;
            const existingMessages = JSON.parse(localStorage.getItem(key) || '[]');
            existingMessages.push(familyCardMessage);
            localStorage.setItem(key, JSON.stringify(existingMessages));
            console.log('✅ 亲属卡消息已保存到 localStorage');
            
            // 然后尝试保存到 IndexedDB
            if (window.ChatDB && typeof window.ChatDB.saveMessages === 'function') {
                try {
                    await window.ChatDB.saveMessages(chatId, existingMessages);
                    console.log('✅ 亲属卡消息已同步到 IndexedDB');
                } catch (dbError) {
                    console.warn('⚠️ IndexedDB 保存失败，但 localStorage 已保存:', dbError);
                }
            }
            
            // 如果当前正在和该角色聊天，刷新界面
            const currentChatId = localStorage.getItem('currentChatId');
            if (currentChatId === chatId) {
                console.log('🔄 当前正在和该角色聊天，刷新界面');
                // 🛡️ 关键修复：不仅保存到 IndexedDB，还要更新 chatMessages 数组
                if (typeof chatMessages !== 'undefined' && Array.isArray(chatMessages)) {
                    chatMessages.push(familyCardMessage);
                    console.log('✅ 已更新 chatMessages 数组，当前消息数:', chatMessages.length);
                }
                // 直接调用 renderMessages 刷新聊天界面
                if (typeof renderMessages === 'function') {
                    await renderMessages();
                    console.log('✅ 聊天界面已刷新');
                }
            } else {
                console.log('ℹ️ 当前不在和该角色聊天，切换到该角色后可看到亲属卡');
            }
            
            showToast(`已向 ${roleName} 发送亲属卡，切换到聊天界面可查看`);
        } catch (e) {
            console.error('保存亲属卡消息失败:', e);
            showToast('发送失败，请重试');
        }
        
        // 清空表单
        document.getElementById('family-card-role-select').value = '';
        document.getElementById('family-card-amount').value = '';
    };

    // 角色赠予用户亲属卡（供聊天界面调用）
    window.receiveFamilyCard = function(roleName, limit) {
        if (!roleName || !limit) {
            console.error('receiveFamilyCard: 参数不完整');
            return;
        }
        
        const familyCards = getData('familyCards') || { sent: [], received: [], sentRecords: [], receivedRecords: [] };
        
        // 检查是否已经收到过
        const existingIndex = familyCards.received.findIndex(card => card.roleName === roleName);
        if (existingIndex !== -1) {
            // 更新额度
            familyCards.received[existingIndex].limit = limit;
            familyCards.received[existingIndex].time = Date.now();
        } else {
            // 新增亲属卡
            familyCards.received.push({
                roleName: roleName,
                limit: limit,
                time: Date.now()
            });
        }
        
        // 添加记录
        familyCards.receivedRecords.push({
            roleName: roleName,
            limit: limit,
            time: Date.now()
        });
        
        saveData('familyCards', familyCards);
        console.log(`收到 ${roleName} 的亲属卡，额度：${limit}`);
    };

    window.recharge = function(amount) {
        const wallet = getData('wallet') || { balance: 0, transactions: [] };
        wallet.balance += amount;
        wallet.transactions.push({
            type: 'recharge',
            amount: amount,
            time: Date.now()
        });
        saveData('wallet', wallet);
        renderMyWallet();
        showToast(`充值成功！+${amount}元`);
    };

    window.customRecharge = function() {
        const amount = parseFloat(document.getElementById('recharge-amount').value);
        if (isNaN(amount) || amount <= 0) {
            showToast('请输入有效金额');
            return;
        }
        recharge(amount);
        document.getElementById('recharge-amount').value = '';
    };

    // 表情包 - 修复上传和URL识别
    let currentEmojiCategory = '默认';
    
    function renderEmojis() {
        const emojis = getData('emojis') || { categories: ['默认'], items: {} };
        let tabsContainer = document.getElementById('emoji-tabs');
        let gridContainer = document.getElementById('emoji-grid');
            
        // 如果元素不存在，重建整个emoji-modal
        if (!tabsContainer || !gridContainer) {
            console.warn('️ emoji-tabs 或 emoji-grid 元素未找到，正在重建emoji-modal...');
                
            let emojiModal = document.getElementById('emoji-modal');
            if (!emojiModal) {
                console.log('🔧 emoji-modal 也不存在，正在创建...');
                    
                // 创建整个emoji-modal结构
                emojiModal = document.createElement('div');
                emojiModal.className = 'modal';
                emojiModal.id = 'emoji-modal';
                emojiModal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <div class="modal-title">表情包</div>
                            <div class="modal-close" onclick="closeModal('emoji-modal')">✕</div>
                        </div>
                        <div class="modal-body">
                            <div class="emoji-tabs" id="emoji-tabs"></div>
                            <div class="emoji-grid" id="emoji-grid"></div>
                                
                            <div class="emoji-add-area">
                                <div class="emoji-add-btn" onclick="document.getElementById('emoji-file-input').click()">
                                    📁 从本地上传图片
                                </div>
                                <input type="file" id="emoji-file-input" accept="image/*" multiple style="display: none;">
                                <div class="emoji-url-hint">或批量添加（一行一个，格式：名称:链接）</div>
                                <textarea class="emoji-url-input" id="emoji-urls" rows="4" placeholder="开心:https://example.com/happy.png&#10;难过:https://example.com/sad.png"></textarea>
                                <button class="emoji-confirm-btn" onclick="addEmojiFromUrls()">添加表情</button>
                            </div>
                        </div>
                    </div>
                `;
                    
                // 添加到body中
                document.body.appendChild(emojiModal);
                console.log('✅ emoji-modal 创建成功');
            }
                
            // 现在查找元素
            tabsContainer = document.getElementById('emoji-tabs');
            gridContainer = document.getElementById('emoji-grid');
                
            if (!tabsContainer || !gridContainer) {
                console.error('❌ 即使重建后仍然找不到emoji-tabs或emoji-grid');
                return;
            }
        }
            
        if (!emojis.categories || emojis.categories.length === 0) {
            emojis.categories = ['默认'];
        }
        if (!emojis.items) {
            emojis.items = {};
        }
        
        tabsContainer.innerHTML = emojis.categories.map((cat, i) => `
            <div class="emoji-tab ${cat === currentEmojiCategory ? 'active' : ''}" data-category="${cat}" onclick="switchEmojiCategory('${cat}')">${cat}</div>
        `).join('') + `<div class="emoji-tab" onclick="addEmojiCategory()">+ 新分类</div>`;
        
        const activeCategory = currentEmojiCategory;
        const items = emojis.items[activeCategory] || [];
        
        gridContainer.innerHTML = items.map((emoji, i) => {
            if (typeof emoji === 'object' && emoji.url) {
                return `
                    <div class="emoji-item">
                        <img src="${emoji.url}" alt="${emoji.name || ''}">
                        <div class="emoji-delete" onclick="deleteEmoji('${activeCategory}', ${i})">×</div>
                    </div>
                `;
            } else if (typeof emoji === 'string') {
                return `
                    <div class="emoji-item">
                        ${isImageUrl(emoji) ? `<img src="${emoji}" alt="">` : emoji}
                        <div class="emoji-delete" onclick="deleteEmoji('${activeCategory}', ${i})">×</div>
                    </div>
                `;
            }
            return '';
        }).join('') + `
            <div class="emoji-item publish-add-btn" onclick="document.getElementById('emoji-file-input').click()">
                <span>+</span>
            </div>
        `;
    }

    window.switchEmojiCategory = function(category) {
        currentEmojiCategory = category;
        const emojis = getData('emojis') || { categories: ['默认'], items: {} };
        
        document.querySelectorAll('#emoji-tabs .emoji-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === category);
        });
        
        renderEmojis();
    };

    window.addEmojiCategory = function() {
        const name = prompt('请输入分类名称：');
        if (!name) return;
        
        const emojis = getData('emojis') || { categories: ['默认'], items: {} };
        if (emojis.categories.includes(name)) {
            showToast('分类已存在');
            return;
        }
        
        emojis.categories.push(name);
        emojis.items[name] = [];
        saveData('emojis', emojis);
        renderEmojis();
        showToast('分类创建成功！');
    };

    window.deleteEmoji = function(category, index) {
        const emojis = getData('emojis') || {};
        if (emojis.items[category]) {
            emojis.items[category].splice(index, 1);
            saveData('emojis', emojis);
            renderEmojis();
        }
    };

    // URL 链接添加 - 不强制格式
    window.addEmojiFromUrls = function() {
        const text = document.getElementById('emoji-urls').value.trim();
        if (!text) {
            showToast('请输入 URL 链接');
            return;
        }
            
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length === 0) {
            showToast('请输入有效的 URL');
            return;
        }
            
        const emojis = getData('emojis') || { categories: ['默认'], items: {} };
        const activeCategory = currentEmojiCategory;
            
        if (!emojis.items[activeCategory]) emojis.items[activeCategory] = [];
            
        let addedCount = 0;
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return;
                
            let name = '';
            let url = trimmedLine;
                
            // 检查是否有冒号分隔 (名称:URL)
            const colonIndex = trimmedLine.indexOf(':');
            if (colonIndex > 0 && colonIndex < trimmedLine.length - 1) {
                const beforeColon = trimmedLine.substring(0, colonIndex).trim();
                const afterColon = trimmedLine.substring(colonIndex + 1).trim();
                // 如果冒号后有内容，认为是 URL；否则整行都是 URL
                if (afterColon) {
                    name = beforeColon;
                    url = afterColon;
                }
            }
                
            // 智能处理 URL - 不强制 http/https 前缀
            url = url.trim();
                        
            // 验证：只要包含点号或看起来像 URL 就接受
            const isValidUrl = url.includes('.') || url.startsWith('data:') || url.includes('/');
                        
            if (isValidUrl) {
                // 如果没有协议头，自动补全 https://
                if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:')) {
                    // 所有不带协议的域名都自动添加 https://
                    url = 'https://' + url;
                }
                            
                emojis.items[activeCategory].push({ name: name, url: url });
                addedCount++;
            }
        });
            
        if (addedCount === 0) {
            showToast('没有识别到有效的 URL，请检查格式');
            return;
        }
            
        saveData('emojis', emojis);
        document.getElementById('emoji-urls').value = '';
        renderEmojis();
        showToast(`成功添加 ${addedCount} 个表情!`);
    };

    // ========== 弹窗通用 ==========
    window.openModal = function(id) {
        const modal = document.getElementById(id);
        modal?.classList.add('active');
        
        if (id === 'mask-modal') renderMaskModal();
        if (id === 'wallet-modal') renderWallet();
        if (id === 'emoji-modal') renderEmojis();
    };

    window.closeModal = function(id) {
        document.getElementById(id)?.classList.remove('active');
    };

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // ========== 自动修复HTML结构和乱码 ==========
    function fixHTMLStructure() {
        console.log(' 开始自动修复HTML结构...');
            
        // 1. 修复底部Tab栏位置（确保在chat-app内部）
        const chatApp = document.querySelector('.chat-app');
        const tabBar = document.querySelector('.bottom-tab-bar');
            
        if (chatApp && tabBar && tabBar.parentElement !== chatApp) {
            console.log('⚠️ 底部Tab栏不在chat-app内部，正在修复...');
            chatApp.appendChild(tabBar);
        }
            
        // 2. 修复个人主页菜单（直接重建，因为HTML中的乱码导致DOM错位）
        const profileMenu = document.querySelector('.profile-menu');
        if (profileMenu) {
            console.log(' 重建个人主页菜单...');
            profileMenu.innerHTML = `
                <div class="profile-menu-item" onclick="openModal('wallet-modal')">
                    <div class="menu-icon wallet">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                            <circle cx="12" cy="12" r="2"></circle>
                            <path d="M6 12h.01M18 12h.01"></path>
                        </svg>
                    </div>
                    <div class="menu-text">
                        <div class="menu-title">钱包</div>
                    </div>
                    <div class="menu-arrow">→</div>
                </div>
                <div class="profile-menu-item" onclick="openModal('emoji-modal')">
                    <div class="menu-icon emoji">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                            <line x1="9" y1="9" x2="9.01" y2="9"></line>
                            <line x1="15" y1="9" x2="15.01" y2="9"></line>
                        </svg>
                    </div>
                    <div class="menu-text">
                        <div class="menu-title">表情包</div>
                    </div>
                    <div class="menu-arrow">→</div>
                </div>
                <div class="profile-menu-item" onclick="openModal('beautify-settings-modal')">
                    <div class="menu-icon beautify">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M12 1a9 9 0 0 1 9 9c0 4.17-2.2 7.93-5.5 10v1a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-1A11.99 11.99 0 0 1 3 10a9 9 0 0 1 9-9z"></path>
                        </svg>
                    </div>
                    <div class="menu-text">
                        <div class="menu-title">界面美化</div>
                    </div>
                </div>
            `;
            console.log(' 个人主页菜单重建完成');
        } else {
            console.warn(' .profile-menu 元素未找到');
        }
            
        // 3. 修复用户名称
        const profileName = document.getElementById('profile-name');
        if (profileName && (profileName.textContent.includes('鐢埛') || profileName.textContent.includes('ㄦ埛'))) {
            profileName.textContent = '用户';
        }
            
        const momentsName = document.getElementById('moments-name');
        if (momentsName && (momentsName.textContent.includes('鐢ㄦ埛') || momentsName.textContent.includes('ㄦ埛'))) {
            momentsName.textContent = '用户';
        }
            
        // 4. 修复头像emoji
        const profileAvatar = document.getElementById('profile-avatar');
        if (profileAvatar && profileAvatar.textContent.includes('馃懁')) {
            profileAvatar.textContent = '😀';
        }
            
        const momentsAvatar = document.getElementById('moments-avatar');
        if (momentsAvatar && momentsAvatar.textContent.includes('馃')) {
            momentsAvatar.textContent = '😀';
        }
            
        // 5. 修复朋友圈封面
        const momentsCoverEdit = document.querySelector('.moments-cover-edit');
        if (momentsCoverEdit && (momentsCoverEdit.textContent.includes('馃摲') || momentsCoverEdit.textContent.includes('鏇存崲'))) {
            momentsCoverEdit.textContent = '📷 更换封面';
        }
            
        console.log('✅ HTML结构修复完成');
    }

    // ========== 初始化 ==========
    async function init() {
        // 🔧 自动修复HTML结构和乱码
        fixHTMLStructure();
        
        initData();
        initTabs();
        initNavButton();
        updateNavDropdown('messages');
        
        // 初始化 IndexedDB
        if (window.ChatDB) {
            try {
                await window.ChatDB.init();
                console.log('IndexedDB 初始化完成');
            } catch (e) {
                console.warn('IndexedDB 初始化失败，将使用 localStorage:', e);
            }
        }
        
        await renderMessages();
        renderContacts();
        renderMoments();
        renderProfile();
        
        // 🧹 清除所有会话的未读计数（主页面加载时）
        clearAllUnreadCounts();
        
        // 🔄 清除后重新渲染消息列表，确保红点消失
        await renderMessages();
        
        // 🔄 监听朋友圈数据更新事件，自动刷新
        window.addEventListener('storage', function(e) {
            if (e.key === 'moments' || e.key === 'moments_updated') {
                console.log('🔄 检测到朋友圈数据更新，自动刷新...');
                renderMoments();
            }
        });
        
        // 🚀 初始化时检查并启动朋友圈AI自动回复
        const replyConfigStr = localStorage.getItem('momentsAIReply');
        if (replyConfigStr) {
            const replyConfig = JSON.parse(replyConfigStr);
            if (replyConfig.enabled) {
                console.log('🤖 检测到朋友圈AI自动回复已开启，立即启动...');
                // 延迟1秒执行，确保所有数据加载完成
                setTimeout(() => {
                    processMomentsAutoReply();
                }, 1000);
            }
        }
        
        const emojiFileInput = document.getElementById('emoji-file-input');
        if (emojiFileInput) {
            emojiFileInput.addEventListener('change', (e) => {
                const files = e.target.files;
                if (!files.length) return;
                
                const emojis = getData('emojis') || { categories: ['默认'], items: {} };
                const activeCategory = currentEmojiCategory;
                
                if (!emojis.items[activeCategory]) emojis.items[activeCategory] = [];
                
                Array.from(files).forEach(file => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        emojis.items[activeCategory].push(event.target.result);
                        saveData('emojis', emojis);
                        renderEmojis();
                    };
                    reader.readAsDataURL(file);
                });
                
                e.target.value = '';
                showToast('上传成功！');
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // ========== 联系人详情页面功能 ==========
    let currentViewingContactId = null;

    // 显示联系人详情
    window.showContactDetail = function(contactId) {
        const contacts = getData('chatContacts') || [];
        const contact = contacts.find(c => c.id === contactId);
        
        if (!contact) {
            showToast('联系人不存在');
            return;
        }
        
        currentViewingContactId = contactId;
        
        // 填充信息
        const avatarImg = document.getElementById('detail-avatar').querySelector('img');
        const avatarPlaceholder = document.getElementById('detail-avatar').querySelector('.avatar-placeholder');
        
        if (contact.avatar) {
            avatarImg.src = contact.avatar;
            avatarImg.style.display = 'block';
            avatarPlaceholder.style.display = 'none';
        } else {
            avatarImg.style.display = 'none';
            avatarPlaceholder.style.display = 'flex';
        }
        
        document.getElementById('detail-name').textContent = contact.name || '';
        document.getElementById('detail-wechat').textContent = `微信号：${contact.id}`;
        document.getElementById('detail-remark').textContent = contact.info || '添加备注';
        
        // 人设预览
        const persona = contact.persona || contact.setting || '';
        document.getElementById('detail-persona-preview').textContent = persona ? persona.substring(0, 20) + (persona.length > 20 ? '...' : '') : '添加人设设定';
        
        // 分组名称
        const groups = getData('contactGroups') || [];
        const groupId = contact.groupId || 'default';
        const group = groups.find(g => g.id === groupId);
        document.getElementById('detail-group-name').textContent = group ? group.name : '我的好友';
        
        // 显示朋友圈
        renderContactMoments(contact);
        
        // 显示页面
        document.getElementById('contact-detail-page').style.display = 'block';
        
        //  隐藏外层iframe顶栏（联系人详情页有自己的顶栏）
        try {
            window.parent.postMessage({ type: 'hideIframeHeader' }, '*');
        } catch(e) {}
    };

    // 关闭联系人详情
    window.closeContactDetail = function() {
        document.getElementById('contact-detail-page').style.display = 'none';
        currentViewingContactId = null;
        
        //  恢复外层iframe顶栏显示
        try {
            window.parent.postMessage({ type: 'showIframeHeader' }, '*');
        } catch(e) {}
    };

    // 显示联系人菜单
    window.showContactDetailMenu = function() {
        const menu = document.getElementById('contact-menu-dropdown');
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    };

    // 删除好友
    window.deleteContact = function() {
        window.showIosConfirm('删除好友', '确定要删除该好友吗？此操作不可恢复。', '删除', function() {
        
        const contacts = getData('chatContacts') || [];
        const newContacts = contacts.filter(c => c.id !== currentViewingContactId);
        saveData('chatContacts', newContacts);
        
        // 关闭详情页
        closeContactDetail();
        
        // 重新渲染通讯录
        renderContacts();
        
        showToast('已删除好友', 'success');
        }, false);
    };

    // 从详情页发起聊天
    window.startConversationFromDetail = function() {
        if (!currentViewingContactId) return;
        
        // 关闭详情页
        closeContactDetail();
        
        // 发起聊天
        startConversation(currentViewingContactId);
    };

    // 显示音视频通话
    window.showVoiceOrVideoCall = function() {
        showToast('功能开发中...');
    };

    // 编辑备注
    window.editContactRemark = function() {
        const contacts = getData('chatContacts') || [];
        const contact = contacts.find(c => c.id === currentViewingContactId);
        
        if (!contact) return;
        
        const newRemark = prompt('请输入备注:', contact.info || '');
        if (newRemark !== null) {
            contact.info = newRemark;
            saveData('chatContacts', contacts);
            document.getElementById('detail-remark').textContent = newRemark || '添加备注';
            showToast('备注已更新');
        }
    };

    // 编辑人设设定
    window.editContactPersona = function() {
        const contacts = getData('chatContacts') || [];
        const contact = contacts.find(c => c.id === currentViewingContactId);
        
        if (!contact) return;
        
        const currentPersona = contact.persona || contact.setting || '';
        const newPersona = prompt('请输入人设设定:', currentPersona);
        
        if (newPersona !== null) {
            contact.persona = newPersona;
            saveData('chatContacts', contacts);
            
            const preview = newPersona ? newPersona.substring(0, 20) + (newPersona.length > 20 ? '...' : '') : '添加人设设定';
            document.getElementById('detail-persona-preview').textContent = preview;
            showToast('人设设定已更新');
        }
    };
    
    // 修改联系人分组
    window.changeContactGroup = function() {
        const groups = getData('contactGroups') || [];
        const contacts = getData('chatContacts') || [];
        const contact = contacts.find(c => c.id === currentViewingContactId);
        
        if (!contact) return;
        
        const currentGroupId = contact.groupId || 'default';
        
        // 渲染分组选择列表
        const listEl = document.getElementById('group-select-list');
        listEl.innerHTML = groups.map(group => {
            const isSelected = group.id === currentGroupId;
            return `
                <div class="group-select-item ${isSelected ? 'selected' : ''}" onclick="selectContactGroup('${group.id}')">
                    <span class="group-select-icon">${getIconSvg(group.icon)}</span>
                    <span class="group-select-name">${group.name}</span>
                    ${isSelected ? '<span style="margin-left: auto; color: var(--accent-blue);">✓</span>' : ''}
                </div>
            `;
        }).join('');
        
        openModal('change-group-modal');
    }
    
    // 选择联系人分组
    window.selectContactGroup = function(groupId) {
        const contacts = getData('chatContacts') || [];
        const contact = contacts.find(c => c.id === currentViewingContactId);
        
        if (!contact) return;
        
        contact.groupId = groupId;
        saveData('chatContacts', contacts);
        
        // 更新显示
        const groups = getData('contactGroups') || [];
        const group = groups.find(g => g.id === groupId);
        document.getElementById('detail-group-name').textContent = group ? group.name : '我的好友';
        
        closeModal('change-group-modal');
        renderContacts();
        showToast('分组已更新');
    };

    // 渲染联系人朋友圈
    function renderContactMoments(contact) {
        const momentsContainer = document.getElementById('detail-moments');
        
        // 获取该联系人的朋友圈数据
        const momentsKey = `moments_${currentViewingContactId}`;
        const moments = JSON.parse(localStorage.getItem(momentsKey) || '[]');
        
        if (moments.length === 0) {
            momentsContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">暂无朋友圈</div>';
            return;
        }
        
        let html = '';
        moments.forEach(moment => {
            // 统一使用 formatTime 函数显示完整日期时间
            const time = formatTime(moment.createdAt || moment.time);
            html += `
                <div style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; position: relative;">
                    <div style="font-size: 14px; color: #333; margin-bottom: 8px;">${moment.content || ''}</div>
                    ${moment.images && moment.images.length > 0 ? `
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 8px;">
                            ${moment.images.map(img => `
                                <div style="aspect-ratio: 1; background: #f5f5f5; border-radius: 4px; overflow: hidden;">
                                    <img src="${img}" style="width: 100%; height: 100%; object-fit: cover;">
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                        <div style="font-size: 12px; color: #999;">${time}</div>
                        <button onclick="deleteContactMoment('${moment.id}')" style="padding: 4px 12px; background: #fff5f5; color: #ff6b6b; border: 1px solid #ffe0e0; border-radius: 4px; font-size: 12px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 4px;" onmouseover="this.style.background='#ffe0e0'" onmouseout="this.style.background='#fff5f5'">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            删除
                        </button>
                    </div>
                </div>
            `;
        });
        
        momentsContainer.innerHTML = html;
    }

    // 删除联系人朋友圈
    window.deleteContactMoment = function(momentId) {
        window.showIosConfirm('删除朋友圈', '确定要删除这条朋友圈吗？', '删除', function() {
        
        try {
            const momentsKey = `moments_${currentViewingContactId}`;
            let moments = JSON.parse(localStorage.getItem(momentsKey) || '[]');
            
            // 找到并删除指定的朋友圈
            const index = moments.findIndex(m => m.id === momentId);
            if (index > -1) {
                moments.splice(index, 1);
                localStorage.setItem(momentsKey, JSON.stringify(moments));
                
                // 重新渲染朋友圈列表
                const contacts = getData('chatContacts') || [];
                const contact = contacts.find(c => c.id === currentViewingContactId);
                if (contact) {
                    renderContactMoments(contact);
                }
                
                showToast('已删除朋友圈');
                console.log('已删除朋友圈:', momentId);
            } else {
                showToast('未找到该朋友圈');
            }
        } catch (error) {
            console.error('❌ 删除朋友圈失败:', error);
            showToast('删除失败，请重试');
        }
        }, false);
    };

    // ==============================================
    // 后台 AI 回复处理器（在主页面运行，即使用户切换到朋友圈也能工作）
    // ==============================================
    
    let backgroundReplyProcessor = null;
    
    function startBackgroundReplyProcessor() {
        if (backgroundReplyProcessor) {
            clearInterval(backgroundReplyProcessor);
        }
        
        console.log('[主页面] 启动后台 AI 回复处理器');
        
        // 每2秒检查一次
        backgroundReplyProcessor = setInterval(async () => {
            try {
                await processPendingReplyFromMainPage();
            } catch (error) {
                console.error('[主页面] 后台处理错误:', error);
            }
        }, 2000);
    }
    
    async function processPendingReplyFromMainPage() {
        const pendingTask = localStorage.getItem('pendingAIReply');
        if (!pendingTask) {
            // 没有任务数据时，清理残留的触发器
            localStorage.removeItem('pendingAIReplyTrigger');
            return;
        }
        
        try {
            const task = JSON.parse(pendingTask);
            if (task.status !== 'pending') {
                return;
            }
            
            console.log('[主页面] 检测到待处理回复任务');
            await executeReplyTaskFromMainPage(task);
        } catch (e) {
            console.error('[主页面] 解析任务失败:', e);
            localStorage.removeItem('pendingAIReply');
            localStorage.removeItem('pendingAIReplyTrigger');
        }
    }
    
    async function executeReplyTaskFromMainPage(task) {
        console.log('🚀 [主页面] 开始执行回复任务:', task.chatId);
        
        const config = JSON.parse(localStorage.getItem('globalApiConfig') || '{}');
        
        if (!config.mainApi?.url || !config.mainApi?.token) {
            console.warn('API配置不完整');
            localStorage.removeItem('pendingAIReply');
            localStorage.removeItem('pendingAIReplyTrigger');
            return;
        }
        
        // 获取聊天记录 - 从 IndexedDB 读取
        let messages = [];
        try {
            // 尝试从 IndexedDB 读取
            if (window.ChatDB) {
                messages = await window.ChatDB.getMessages(task.chatId) || [];
                console.log('从 IndexedDB 读取聊天记录:', messages.length, '条');
            } else {
                console.warn('ChatDB 未加载，尝试从 localStorage 读取');
                // 降级到 localStorage
                let messagesData = localStorage.getItem(`chat_${task.chatId}`);
                if (!messagesData) {
                    const currentPersona = localStorage.getItem('currentPersona') || 'default';
                    messagesData = localStorage.getItem(`persona_${currentPersona}_chat_${task.chatId}`);
                }
                if (messagesData) {
                    messages = JSON.parse(messagesData);
                }
            }
        } catch (e) {
            console.error('❌ 读取聊天记录失败:', e);
            localStorage.removeItem('pendingAIReply');
            localStorage.removeItem('pendingAIReplyTrigger');
            return;
        }
        
        if (!messages || messages.length === 0) {
            console.error('❌ 找不到聊天记录');
            localStorage.removeItem('pendingAIReply');
            localStorage.removeItem('pendingAIReplyTrigger');
            return;
        }
        
        // 构建对话历史
        const recentMessages = messages.slice(-20);
        const conversationHistory = recentMessages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.type === 'text' ? msg.content : `[${msg.type}]`
        }));
        
        try {
            console.log('🤖 [主页面] 正在生成AI回复...');
            
            const response = await fetch(`${config.mainApi.url}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.mainApi.token}`
                },
                body: JSON.stringify({
                    model: config.model || 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: task.systemPrompt },
                        ...conversationHistory
                    ],
                    temperature: config.temperature || 0.7,
                    max_tokens: config.maxTokens || 2048
                })
            });
            
            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }
            
            const data = await response.json();
            const aiReply = data.choices?.[0]?.message?.content;
            
            if (!aiReply) {
                throw new Error('API返回空回复');
            }
            
            console.log('[主页面] AI回复生成成功');
            
            // 按句子拆分AI回复
            const sentences = aiReply
                .split(/(?<=[。！？\n])/g)
                .filter(s => s.trim());
            
            console.log(`📝 拆分为 ${sentences.length} 条句子:`, sentences);
            
            // 逐条添加AI消息
            sentences.forEach((sentence, index) => {
                const trimmed = sentence.trim();
                if (!trimmed) return;
                
                setTimeout(() => {
                    const aiMessage = {
                        id: Date.now().toString(),
                        type: 'text',
                        content: trimmed,
                        sender: 'ai',
                        time: Date.now(), // 使用数字时间戳，确保时间比较正确
                        timeDisplay: new Date().toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        }).replace(/\//g, '-')
                    };
                    
                    // 保存AI消息
                    messages.push(aiMessage);
                    
                    const MAX_MESSAGES = 500;
                    const messagesToSave = messages.slice(-MAX_MESSAGES);
                    
                    // 压缩消息 - 兼容压缩格式和完整格式
                    const compressedMessages = messagesToSave.map(msg => {
                        const compressed = {
                            id: msg.id,
                            t: msg.t || msg.type,
                            c: msg.c || msg.content,
                            s: msg.s || msg.sender,
                            tm: msg.tm || msg.time
                        };
                        if (msg.r || msg.replyTo) compressed.r = msg.r || msg.replyTo;
                        if (msg.ir || msg.isRecalled) compressed.ir = true;
                        return compressed;
                    });
                    
                    // 保存到 IndexedDB
                    try {
                        if (window.ChatDB) {
                            window.ChatDB.saveMessages(task.chatId, compressedMessages);
                        } else {
                            localStorage.setItem(`chat_${task.chatId}`, JSON.stringify(compressedMessages));
                        }
                    } catch (e) {
                        console.error('❌ [主页面] 保存失败:', e);
                    }
                    
                    console.log(`✅ [主页面] 已发送第 ${index + 1}/${sentences.length} 条:`, trimmed);
                    
                    // 显示横幅通知（仅最后一条）
                    if (index === sentences.length - 1) {
                        showBannerNotificationFromMainPage(task.chatId, trimmed);
                        
                        // 清除任务（最后一条消息发送后）
                        localStorage.removeItem('pendingAIReply');
                        localStorage.removeItem('pendingAIReplyTrigger');
                        console.log('[主页面] 消息已全部发送完毕，任务已清除');
                    }
                }, index * 800); // 每条间隔800ms
            });
            
        } catch (error) {
            console.error('❌ [主页面] 生成AI回复失败:', error);
            task.status = 'failed';
            task.error = error.message;
            localStorage.setItem('pendingAIReply', JSON.stringify(task));
            localStorage.removeItem('pendingAIReplyTrigger');
            throw error;
        }
    }
    
    function showBannerNotificationFromMainPage(chatId, messagePreview) {
        // 获取联系人名称
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        const contact = contacts.find(c => c.id === chatId);
        const senderName = contact ? (contact.name || 'AI') : 'AI';
        
        // 移除旧的通知
        const oldBanner = document.getElementById('main-page-banner');
        if (oldBanner) {
            oldBanner.remove();
        }
        
        const banner = document.createElement('div');
        banner.id = 'main-page-banner';
        banner.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; width: 100%;">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
                    👤
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 14px; font-weight: 600; color: #333; margin-bottom: 4px;">${senderName}</div>
                    <div style="font-size: 13px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${messagePreview}</div>
                </div>
            </div>
        `;
        
        banner.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            right: 20px;
            background: white;
            padding: 16px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 100000;
            cursor: pointer;
            animation: bannerSlideIn 0.3s ease-out;
        `;
        
        banner.onclick = () => {
            banner.remove();
        };
        
        // 添加动画样式
        if (!document.getElementById('banner-anim-style-main')) {
            const style = document.createElement('style');
            style.id = 'banner-anim-style-main';
            style.textContent = `
                @keyframes bannerSlideIn {
                    from {
                        transform: translateY(-100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(banner);
        
        // 5秒后自动消失
        setTimeout(() => {
            if (banner.parentNode) {
                banner.remove();
            }
        }, 5000);
    }
    
    // 启动后台处理器
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startBackgroundReplyProcessor);
    } else {
        startBackgroundReplyProcessor();
    }
    
    // 监听 storage 事件，立即响应新任务
    window.addEventListener('storage', (e) => {
        if (e.key === 'pendingAIReplyTrigger') {
            console.log('🚀 [主页面] 检测到新任务触发器，立即处理');
            processPendingReplyFromMainPage();
        }
        
        // 🛡️ 监听未读消息计数更新
        if (e.key === 'unreadCountUpdated' && e.newValue) {
            try {
                const data = JSON.parse(e.newValue);
                console.log('🔔 [主页面] 收到未读消息更新:', data);
                
                // 🛡️ 显示全局通知横幅
                if (data.unread > 0) {
                    // 获取联系人名称
                    const currentPersona = localStorage.getItem('currentPersona') || 'default';
                    const contactsKey = `persona_${currentPersona}_chatContacts`;
                    const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
                    const contact = contacts.find(c => c.id === data.chatId);
                    const contactName = contact ? (contact.remark || contact.name || '联系人') : '联系人';
                    
                    console.log('[全局通知] AI 回复完成:', contactName);
                    
                    // 显示全局通知（如果函数存在）
                    if (typeof window.showGlobalNotification === 'function') {
                        window.showGlobalNotification(
                            `${contactName} 回复了你`,
                            '点击查看消息',
                            3000
                        );
                    }
                }
                
                // 重新渲染会话列表以显示小红点
                renderConversationList();
                
                // 清除触发器（避免重复处理）
                localStorage.removeItem('unreadCountUpdated');
            } catch (err) {
                console.error('❌ 解析未读消息数据失败:', err);
            }
        }
    });

    // ========== 全局美化设置功能 ==========
    
    // 选择颜色
    window.selectColor = function(btn) {
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const color = btn.getAttribute('data-color');
        document.getElementById('custom-color-input').value = color;
    };
    
    // 选择背景类型
    window.selectBgType = function(btn) {
        document.querySelectorAll('.bg-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const type = btn.getAttribute('data-type');
        if (type === 'gradient') {
            document.getElementById('gradient-options').style.display = 'block';
            document.getElementById('image-options').style.display = 'none';
        } else {
            document.getElementById('gradient-options').style.display = 'none';
            document.getElementById('image-options').style.display = 'block';
        }
    };
    
    // 应用预设
    window.applyPreset = function(presetName) {
        const presets = {
            'minimal': {
                bgImageUrl: '',
                bgImageData: null,
                css: ''
            },
            'dark': {
                bgImageUrl: '',
                bgImageData: null,
                css: `/* ========== 暗黑模式 - 全局夜间模式 ========== */

/* 全局背景和文字 */
* {
  scrollbar-color: #333 #0a0a0a !important;
}

body, html {
  background: #0a0a0a !important;
  color: #e0e0e0 !important;
}

/* ========== 顶栏样式 ========== */
.iframe-header,
.header {
  background: #1a1a1a !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
  box-shadow: 0 2px 12px rgba(0,0,0,0.5) !important;
}

.iframe-title,
.header-title {
  color: #ffffff !important;
}

.iframe-back-btn svg,
.back-btn svg {
  stroke: #ffffff !important;
}

.iframe-right-btn,
.header-right-btn {
  color: #ffffff !important;
}

/* ========== 底栏样式 ========== */
.bottom-tab-bar {
  background: #1a1a1a !important;
  border-top: 1px solid rgba(255,255,255,0.08) !important;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.5) !important;
}

.bottom-tab-item {
  color: rgba(255,255,255,0.5) !important;
}

.bottom-tab-item.active {
  color: #ffffff !important;
}

.bottom-tab-item svg {
  stroke: rgba(255,255,255,0.5) !important;
  fill: rgba(255,255,255,0.5) !important;
}

.bottom-tab-item.active svg {
  stroke: #ffffff !important;
  fill: #ffffff !important;
}

/* ========== 卡片和容器 ========== */
.card,
.msg-item,
.contact-item,
.profile-card,
.feature-card,
.list-item {
  background: #1a1a1a !important;
  border-color: rgba(255,255,255,0.15) !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.5) !important;
}

/* 列表项图标背景 - 黑白灰 */
.list-item .icon-box,
.list-item .item-icon,
.wallet-icon,
.emoji-icon,
.beautify-icon,
.menu-icon {
  background: #2a2a2a !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
}

.list-item .icon-box svg,
.list-item .item-icon svg,
.menu-icon svg {
  stroke: #e0e0e0 !important;
  fill: none !important;
}

/* ========== 消息气泡 ========== */
.msg-bubble {
  background: #2a2a2a !important;
  color: #e0e0e0 !important;
}

.msg-bubble.sent {
  background: #333333 !important;
  color: #ffffff !important;
}

/* ========== 输入框和文本域 ========== */
input,
textarea,
select {
  background: #2a2a2a !important;
  color: #e0e0e0 !important;
  border-color: rgba(255,255,255,0.15) !important;
}

input:focus,
textarea:focus,
select:focus {
  border-color: #e0e0e0 !important;
  box-shadow: 0 0 0 2px rgba(224,224,224,0.2) !important;
}

input::placeholder,
textarea::placeholder {
  color: rgba(255,255,255,0.4) !important;
}

/* ========== 按钮 ========== */
button,
.form-btn,
.btn {
  background: #2a2a2a !important;
  color: #e0e0e0 !important;
  border-color: rgba(255,255,255,0.15) !important;
}

button:hover,
.form-btn:hover,
.btn:hover {
  background: #333333 !important;
}

button.primary,
.form-btn.primary,
.btn-primary {
  background: #e0e0e0 !important;
  color: #000000 !important;
  border-color: #e0e0e0 !important;
}

button.primary:hover,
.form-btn.primary:hover,
.btn-primary:hover {
  background: #ffffff !important;
}

/* ========== 模态框和弹窗 ========== */
.modal,
.dialog,
.popup {
  background: #1a1a1a !important;
  border-color: rgba(255,255,255,0.1) !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6) !important;
}

.modal-header,
.dialog-header {
  background: #1a1a1a !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
  color: #ffffff !important;
}

/* ========== 文字颜色 ========== */
h1, h2, h3, h4, h5, h6 {
  color: #ffffff !important;
}

p, span, div, label {
  color: #e0e0e0 !important;
}

.text-muted,
.subtitle,
.hint {
  color: rgba(255,255,255,0.5) !important;
}

/* ========== 链接 ========== */
a {
  color: #e0e0e0 !important;
}

a:hover {
  color: #ffffff !important;
}

/* ========== 分割线 ========== */
divider,
hr,
.divider {
  border-color: rgba(255,255,255,0.08) !important;
  background: rgba(255,255,255,0.08) !important;
}

/* ========== 聊天列表 ========== */
.msg-list {
  background: #0a0a0a !important;
  padding: 8px 12px !important;
}

.msg-item {
  background: #1a1a1a !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
}

.msg-item:hover {
  background: #222222 !important;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4) !important;
}

.msg-item-title,
.msg-name {
  color: #ffffff !important;
}

.msg-item-subtitle,
.msg-preview,
.msg-time {
  color: rgba(255,255,255,0.5) !important;
}

.msg-item-badge {
  background: #ff3b30 !important;
  color: #ffffff !important;
}

/* ========== 滚动条 ========== */
::-webkit-scrollbar {
  width: 8px !important;
  height: 8px !important;
}

::-webkit-scrollbar-track {
  background: #0a0a0a !important;
}

::-webkit-scrollbar-thumb {
  background: #333333 !important;
  border-radius: 4px !important;
}

::-webkit-scrollbar-thumb:hover {
  background: #444444 !important;
}

/* ========== 表格 ========== */
table {
  background: #1a1a1a !important;
  color: #e0e0e0 !important;
  border-color: rgba(255,255,255,0.08) !important;
}

th {
  background: #222222 !important;
  color: #ffffff !important;
  border-color: rgba(255,255,255,0.08) !important;
}

td {
  border-color: rgba(255,255,255,0.08) !important;
}

tr:hover {
  background: #222222 !important;
}

/* ========== 下拉菜单 ========== */
dropdown,
.dropdown-menu,
.select-dropdown {
  background: #1a1a1a !important;
  border-color: rgba(255,255,255,0.1) !important;
  box-shadow: 0 4px 16px rgba(0,0,0,0.5) !important;
}

.dropdown-item {
  color: #e0e0e0 !important;
}

.dropdown-item:hover {
  background: #2a2a2a !important;
}

/* ========== 标签和徽章 ========== */
.badge,
.tag,
.label {
  background: #2a2a2a !important;
  color: #e0e0e0 !important;
  border-color: rgba(255,255,255,0.1) !important;
}

/* ========== 图标 ========== */
svg {
  fill: #e0e0e0 !important;
  stroke: #e0e0e0 !important;
}

svg.icon-primary {
  fill: #4fc3f7 !important;
  stroke: #4fc3f7 !important;
}

/* ========== 选中状态 ========== */
::selection {
  background: #e0e0e0 !important;
  color: #000000 !important;
}

/* ========== 特殊组件 ========== */
.empty-state {
  color: rgba(255,255,255,0.5) !important;
}

.loading {
  color: #4fc3f7 !important;
}

.toast {
  background: #2a2a2a !important;
  color: #ffffff !important;
  border-color: rgba(255,255,255,0.1) !important;
}

/* ========== 美化设置页面 ========== */
.app-page {
  background: #0a0a0a !important;
}

.app-page-header {
  background: #1a1a1a !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
  color: #ffffff !important;
}

.app-page-title {
  color: #ffffff !important;
}

.back-btn {
  color: #ffffff !important;
}

.back-btn svg {
  stroke: #ffffff !important;
}

.settings-container {
  background: #0a0a0a !important;
}

.section-title {
  color: rgba(255,255,255,0.6) !important;
}

.settings-section {
  background: #1a1a1a !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
}

.settings-item {
  background: #1a1a1a !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
  color: #e0e0e0 !important;
}

.settings-item:last-child {
  border-bottom: none !important;
}

.item-label {
  color: #ffffff !important;
}

.item-desc {
  color: rgba(255,255,255,0.5) !important;
}

.settings-input,
.settings-input:focus {
  background: #2a2a2a !important;
  color: #e0e0e0 !important;
  border-color: rgba(255,255,255,0.15) !important;
}

.settings-input::placeholder {
  color: rgba(255,255,255,0.4) !important;
}

.btn-secondary {
  background: #2a2a2a !important;
  color: #e0e0e0 !important;
  border: 1px solid rgba(255,255,255,0.15) !important;
}

.btn-secondary:hover {
  background: #333333 !important;
}

.switch {
  background: #333333 !important;
}

.switch.active {
  background: #e0e0e0 !important;
}

.switch-dot {
  background: #ffffff !important;
}

.beautify-preview {
  background: #2a2a2a !important;
  color: rgba(255,255,255,0.5) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
}

.preset-list {
  background: #1a1a1a !important;
}

.preset-empty {
  color: rgba(255,255,255,0.5) !important;
}

.preset-item {
  background: #2a2a2a !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  color: #e0e0e0 !important;
}

.preset-name {
  color: #ffffff !important;
}

.preset-time {
  color: rgba(255,255,255,0.5) !important;
}

.preset-use-btn {
  background: #e0e0e0 !important;
  color: #000000 !important;
  border: none !important;
}

.preset-delete-btn {
  background: #2a2a2a !important;
  color: #e0e0e0 !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
}

/* 个人主页菜单 - 黑白灰 */
.profile-menu {
  background: #1a1a1a !important;
}

.profile-menu-item {
  background: #1a1a1a !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
}

.profile-menu-item:last-child {
  border-bottom: none !important;
}

.menu-text {
  color: #ffffff !important;
}

.menu-title {
  color: #ffffff !important;
  font-weight: 500 !important;
}

.menu-arrow {
  color: rgba(255,255,255,0.5) !important;
}

.profile-menu-item:hover {
  background: #2a2a2a !important;
}

/* 个人主页 - 黑白灰 */
.profile-card {
  background: #1a1a1a !important;
  border-color: rgba(255,255,255,0.15) !important;
}

.profile-card-name,
.profile-card-qq,
.profile-card-signature {
  color: #ffffff !important;
}

.profile-card-switch {
  background: #2a2a2a !important;
  border: 1px solid rgba(255,255,255,0.15) !important;
  color: #ffffff !important;
}

.profile-card-switch:hover {
  background: #333333 !important;
}

.profile-card-switch svg {
  stroke: #ffffff !important;
}

.profile-card-arrow {
  color: rgba(255,255,255,0.5) !important;
}

/* 暗黑模式按钮特殊样式 */
#dark-mode-preset-btn {
  background: #2a2a2a !important;
  color: #e0e0e0 !important;
  border: 2px solid #e0e0e0 !important;
}

#dark-mode-preset-btn:hover {
  background: #e0e0e0 !important;
  color: #0a0a0a !important;
}

/* ========== 主桌面全局夜间模式 ========== */

/* 手机容器和背景 */
#phone-container {
  background: #0a0a0a !important;
}

#home-screen {
  background: #0a0a0a !important;
}

/* 状态栏 */
#status-bar {
  background: rgba(10,10,10,0.8) !important;
  backdrop-filter: blur(10px) !important;
}

.status-time {
  color: #ffffff !important;
}

#status-bar svg {
  fill: #ffffff !important;
}

/* 桌面页面 */
.desktop-page {
  background: #0a0a0a !important;
}

/* 小组件 */
.widget {
  background: #1a1a1a !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4) !important;
}

.widget-delete {
  color: rgba(255,255,255,0.6) !important;
  background: rgba(255,255,255,0.1) !important;
}

/* 时间天气组件 */
.time-widget-new {
  background: #1a1a1a !important;
}

.time-top-box {
  background: #1a1a1a !important;
}

.time-bottom-box {
  background: #1a1a1a !important;
}

.time-upper-section {
  background: #1a1a1a !important;
}

.time-display-large {
  color: #ffffff !important;
}

.time-day-abbr {
  color: rgba(255,255,255,0.6) !important;
}

.time-bubble-short,
.time-bubble-long {
  color: rgba(255,255,255,0.8) !important;
}

.time-divider {
  background: rgba(255,255,255,0.08) !important;
}

.time-lower-section {
  background: #1a1a1a !important;
}

.time-calendar-date {
  color: #ffffff !important;
}

.time-calendar-weekday {
  color: rgba(255,255,255,0.5) !important;
}

.time-calendar-grid {
  background: #1a1a1a !important;
}

.time-calendar-day {
  color: #e0e0e0 !important;
}

.time-calendar-day.today {
  background: #e0e0e0 !important;
  color: #000000 !important;
}

.time-image-text {
  color: rgba(255,255,255,0.5) !important;
}

.time-avatar-text {
  color: rgba(255,255,255,0.5) !important;
}

/* 方形照片组件 */
.square-photo-widget {
  background: #1a1a1a !important;
}

.square-photo-item {
  background: transparent !important;
  border: none !important;
}

.square-decoration {
  background: #333333 !important;
  color: rgba(255,255,255,0.6) !important;
}

/* 拍立得组件 */
.polaroid-widget {
  background: #1a1a1a !important;
}

.polaroid-item {
  background: #2a2a2a !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
}

.polaroid-item img {
  border: 4px solid #ffffff !important;
}

/* 文字气泡组件 */
.cute-dialog-widget {
  background: #1a1a1a !important;
}

.dialog-bubble {
  background: #2a2a2a !important;
  color: #e0e0e0 !important;
}

.dialog-avatar {
  background: #333333 !important;
}

.dialog-main-text {
  color: #e0e0e0 !important;
}

/* APP图标 */
#app-grid,
#app-grid-page2,
.app-grid {
  background: transparent !important;
}

.app-icon {
  background: transparent !important;
}

.app-icon-box {
  background: #2a2a2a !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
}

.app-icon-box svg {
  stroke: #e0e0e0 !important;
  fill: none !important;
}

.app-name {
  color: rgba(255,255,255,0.8) !important;
}

/* 底部Dock栏 */
.bottom-tab-bar,
#dock-bar {
  background: #1a1a1a !important;
  border-top: 1px solid rgba(255,255,255,0.08) !important;
  backdrop-filter: blur(20px) !important;
}

.bottom-tab-item,
.dock-item {
  color: rgba(255,255,255,0.5) !important;
}

.bottom-tab-item.active,
.dock-item.active {
  color: #ffffff !important;
}

.bottom-tab-item svg,
.dock-item svg {
  stroke: rgba(255,255,255,0.5) !important;
  fill: rgba(255,255,255,0.5) !important;
}

.bottom-tab-item.active svg,
.dock-item.active svg {
  stroke: #ffffff !important;
  fill: #ffffff !important;
}

/* 页面指示器 */
.page-indicator {
  background: rgba(255,255,255,0.3) !important;
}

.page-indicator.active {
  background: #ffffff !important;
}

/* 编辑工具栏 */
#edit-toolbar {
  background: #1a1a1a !important;
  border-top: 1px solid rgba(255,255,255,0.08) !important;
}

.edit-btn {
  background: #2a2a2a !important;
  color: #e0e0e0 !important;
  border: 1px solid rgba(255,255,255,0.15) !important;
}

.edit-btn:hover {
  background: #333333 !important;
}

/* 弹窗和对话框 */
.modal,
.dialog,
.popup,
.custom-modal {
  background: #1a1a1a !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6) !important;
}

.modal-header,
.dialog-header,
.popup-header {
  background: #1a1a1a !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
  color: #ffffff !important;
}

.modal-body,
.dialog-body,
.popup-body {
  background: #1a1a1a !important;
  color: #e0e0e0 !important;
}

.modal-footer,
.dialog-footer,
.popup-footer {
  background: #1a1a1a !important;
  border-top: 1px solid rgba(255,255,255,0.08) !important;
}

/* Toast提示 */
.toast {
  background: #2a2a2a !important;
  color: #ffffff !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
  box-shadow: 0 4px 16px rgba(0,0,0,0.5) !important;
}

/* ========== 所有APP页面夜间模式 ========== */

/* 聊天页面 */
.chat-container,
.chat-app-page {
  background: #0a0a0a !important;
}

.chat-header {
  background: #1a1a1a !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
}

.chat-message-list {
  background: #0a0a0a !important;
}

.chat-input-area {
  background: #1a1a1a !important;
  border-top: 1px solid rgba(255,255,255,0.08) !important;
}

.chat-input-area input,
.chat-input-area textarea {
  background: #2a2a2a !important;
  color: #e0e0e0 !important;
  border-color: rgba(255,255,255,0.15) !important;
}

/* 情侣空间 */
.couple-space-container,
.couple-page {
  background: #0a0a0a !important;
}

.couple-header {
  background: #1a1a1a !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
}

.couple-card {
  background: #1a1a1a !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
}

/* 游戏页面 */
.game-container,
.game-page {
  background: #0a0a0a !important;
}

.game-header {
  background: #1a1a1a !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
}

.game-card {
  background: #1a1a1a !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
}

/* 商城页面 */
.shop-container,
.shop-page {
  background: #0a0a0a !important;
}

.shop-header {
  background: #1a1a1a !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
}

.shop-banner {
  background: #1a1a1a !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
}

.shop-item {
  background: #1a1a1a !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
}

.shop-cart {
  background: #1a1a1a !important;
  border-top: 1px solid rgba(255,255,255,0.08) !important;
}

/* 联系人Tab栏 - 黑白灰 */
.contact-tabs {
  background: #1a1a1a !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
}

.contact-tab {
  color: rgba(255,255,255,0.5) !important;
}

.contact-tab:hover {
  color: rgba(255,255,255,0.7) !important;
  background: rgba(255,255,255,0.05) !important;
}

.contact-tab.active {
  color: #ffffff !important;
}

.contact-tab.active::after {
  background: #ffffff !important;
}

.contact-tab-count {
  color: rgba(255,255,255,0.5) !important;
  background: rgba(255,255,255,0.1) !important;
}

.contact-tab.active .contact-tab-count {
  color: #ffffff !important;
  background: rgba(255,255,255,0.2) !important;
}

/* 联系人列表 - 黑白灰 */
.contact-list {
  background: #0a0a0a !important;
}

.contact-item {
  background: #1a1a1a !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
}

.contact-item:hover {
  background: #222222 !important;
}

.contact-name {
  color: #ffffff !important;
}

.contact-meta {
  color: rgba(255,255,255,0.5) !important;
}

/* 商城商品卡片 - 黑白灰 */
.product-card {
  background: #1a1a1a !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
}

.product-card:hover {
  background: #2a2a2a !important;
}

.product-image {
  background: #2a2a2a !important;
  color: #e0e0e0 !important;
}

.product-name {
  color: #ffffff !important;
}

.product-desc {
  color: rgba(255,255,255,0.6) !important;
}

.product-price {
  color: #e0e0e0 !important;
}

.product-price::before {
  color: #e0e0e0 !important;
}

.add-cart-btn {
  background: #333333 !important;
  border: 1px solid rgba(255,255,255,0.15) !important;
}

.add-cart-btn svg {
  stroke: #ffffff !important;
}

.add-cart-btn:hover {
  background: #444444 !important;
}

/* 商城分类标签 - 黑白灰 */
.category-tag {
  background: #2a2a2a !important;
  color: #e0e0e0 !important;
  border-color: rgba(255,255,255,0.1) !important;
}

.category-tag.active {
  background: #e0e0e0 !important;
  color: #000000 !important;
  border-color: #e0e0e0 !important;
}

/* 商城搜索按钮 - 黑白灰 */
.search-box {
  background: #ffffff !important;
}

.search-box input {
  background: #ffffff !important;
  color: #000000 !important;
}

.search-box input::placeholder {
  color: #9FA2A6 !important;
}

.search-box svg {
  stroke: #9FA2A6 !important;
}

.search-btn {
  background: #2a2a2a !important;
  color: #ffffff !important;
}

.search-btn:hover {
  background: #333333 !important;
}

/* 商城底部Tab栏 - 黑白灰 */
.tab-bar {
  background: #1a1a1a !important;
  border-top: 1px solid rgba(255,255,255,0.08) !important;
}

.tab-item {
  color: rgba(255,255,255,0.5) !important;
  position: relative !important;
}

.tab-item::after {
  display: none !important;
  content: none !important;
}

.tab-item::before {
  display: none !important;
  content: none !important;
}

.tab-item.active {
  color: #ffffff !important;
}

.tab-item.active::after {
  display: none !important;
  content: none !important;
  background: transparent !important;
}

.tab-item.active .tab-icon {
  stroke: #ffffff !important;
  fill: #ffffff !important;
}

.tab-item svg {
  stroke: rgba(255,255,255,0.5) !important;
  fill: rgba(255,255,255,0.5) !important;
}

/* 移除购物车Tab的方块背景 */
.tab-item.cart-tab {
  background: transparent !important;
  border: none !important;
}

.tab-item.cart-tab::after,
.tab-item.cart-tab::before {
  display: none !important;
  content: none !important;
}

.tab-item.active svg {
  stroke: #ffffff !important;
  fill: #ffffff !important;
}

/* 商城数量按钮 - 黑白灰 */
.quantity-btn {
  background: #2a2a2a !important;
  color: #ffffff !important;
}

.quantity-btn:hover {
  background: #333333 !important;
}

/* 购物车图标 - 黑白灰 */
.cart-icon {
  background: #333333 !important;
  border: 1px solid rgba(255,255,255,0.15) !important;
}

.cart-icon svg {
  stroke: #ffffff !important;
  fill: #ffffff !important;
}

/* 购物车Tab特殊样式 - 黑白灰 */
.tab-item.cart-tab .tab-icon-wrapper {
  background: #333333 !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
  border: 1px solid rgba(255,255,255,0.15) !important;
}

.tab-item.cart-tab .tab-icon-wrapper:hover {
  background: #444444 !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
  border-color: rgba(255,255,255,0.2) !important;
}

.tab-item.cart-tab .tab-icon {
  color: #ffffff !important;
  stroke: #ffffff !important;
  fill: #ffffff !important;
}

.tab-item.cart-tab .tab-label {
  color: #e0e0e0 !important;
}

.tab-item.cart-tab .cart-badge {
  background: #e0e0e0 !important;
  color: #000000 !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3) !important;
}

/* 论坛页面 */
.forum-container,
.forum-page {
  background: #0a0a0a !important;
}

.forum-header {
  background: #1a1a1a !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
}

.forum-post {
  background: #1a1a1a !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
}

.forum-comment {
  background: #2a2a2a !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
}

/* 日记页面 */
.diary-container,
.diary-page {
  background: #0a0a0a !important;
}

.diary-header {
  background: #1a1a1a !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
}

.diary-entry {
  background: #1a1a1a !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
}

.diary-content {
  background: #2a2a2a !important;
  color: #e0e0e0 !important;
}

/* 记忆页面 */
.memory-container,
.memory-page {
  background: #0a0a0a !important;
}

.memory-header {
  background: #1a1a1a !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
}

.memory-card {
  background: #1a1a1a !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
}

/* 书架页面 */
.bookshelf-container,
.bookshelf-page {
  background: #0a0a0a !important;
}

.bookshelf-header {
  background: #1a1a1a !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
}

.book-item {
  background: #1a1a1a !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
}

/* 一起做页面 */
.together-container,
.together-page {
  background: #0a0a0a !important;
}

.together-header {
  background: #1a1a1a !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
}

.together-tab {
  background: #1a1a1a !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
}

.together-content {
  background: #0a0a0a !important;
}

/* IF线页面 */
.if-line-container,
.if-line-page {
  background: #0a0a0a !important;
}

.if-line-header {
  background: #1a1a1a !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
}

.if-line-content {
  background: #0a0a0a !important;
}

/* 设置页面 */
.settings-container,
.settings-page {
  background: #0a0a0a !important;
}

.settings-header {
  background: #1a1a1a !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
}

.settings-group {
  background: #1a1a1a !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
}

.settings-item {
  background: #1a1a1a !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
}

/* 通用页面容器 */
.page-container,
.app-container {
  background: #0a0a0a !important;
}

.page-header,
.app-header {
  background: #1a1a1a !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
}

.page-content,
.app-content {
  background: #0a0a0a !important;
}

/* 通用卡片 */
.card,
.panel,
.box,
.container-card {
  background: #1a1a1a !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
}

/* 通用列表 */
.list,
.list-view,
.item-list {
  background: #0a0a0a !important;
}

.list-item,
.row-item {
  background: #1a1a1a !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
}

.list-item:hover,
.row-item:hover {
  background: #222222 !important;
}

/* 通用表单 */
.form-container {
  background: #1a1a1a !important;
}

.form-group {
  background: #1a1a1a !important;
}

.form-label {
  color: #ffffff !important;
}

.form-hint {
  color: rgba(255,255,255,0.5) !important;
}

/* 通用网格 */
.grid,
.grid-container {
  background: #0a0a0a !important;
}

.grid-item {
  background: #1a1a1a !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
}

/* 标签页 */
.tabs,
.tab-bar {
  background: #1a1a1a !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
}

.tab-item {
  color: rgba(255,255,255,0.5) !important;
}

.tab-item.active {
  color: #ffffff !important;
  border-bottom: 2px solid #ffffff !important;
}

/* 进度条 */
.progress-bar {
  background: #2a2a2a !important;
}

.progress-fill {
  background: #4fc3f7 !important;
}

/* 徽章和标签 */
.badge,
.tag,
.chip {
  background: #2a2a2a !important;
  color: #e0e0e0 !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
}

/* 空状态 */
.empty-state,
.no-data {
  color: rgba(255,255,255,0.5) !important;
}

.empty-state svg,
.no-data svg {
  fill: rgba(255,255,255,0.3) !important;
  stroke: rgba(255,255,255,0.3) !important;
}

/* 加载状态 */
.loading,
.loader,
.spinner {
  color: #4fc3f7 !important;
}

/* 分割线 */
.divider,
.separator,
hr {
  border-color: rgba(255,255,255,0.08) !important;
  background: rgba(255,255,255,0.08) !important;
}

/* 工具提示 */
.tooltip,
.hint-tooltip {
  background: #2a2a2a !important;
  color: #ffffff !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
}

/* 通知 */
.notification,
.alert,
.message-box {
  background: #1a1a1a !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
  color: #e0e0e0 !important;
}

.notification.success {
  border-left: 4px solid #4caf50 !important;
}

.notification.error {
  border-left: 4px solid #f44336 !important;
}

.notification.warning {
  border-left: 4px solid #ff9800 !important;
}

.notification.info {
  border-left: 4px solid #2196f3 !important;
}`
            }
        };
        
        const preset = presets[presetName];
        if (!preset) return;
        
        // 应用图片设置
        if (preset.bgImageUrl !== undefined) {
            document.getElementById('bg-image-url').value = preset.bgImageUrl;
        }
        
        // 应用CSS
        document.getElementById('global-custom-css').value = preset.css || '';
    };
    
    // 预览图标（URL输入）
    window.previewIcon = function(tabName) {
        const urlInput = document.getElementById(`icon-url-${tabName}`);
        const previewImg = document.getElementById(`icon-preview-${tabName}`);
        const clearBtn = document.getElementById(`icon-clear-${tabName}`);
        
        if (!urlInput || !previewImg) return;
        
        const url = urlInput.value.trim();
        if (url) {
            previewImg.src = url;
            previewImg.style.display = 'block';
            if (clearBtn) clearBtn.style.display = 'inline-block';
            previewImg.onerror = function() {
                previewImg.style.display = 'none';
                if (clearBtn) clearBtn.style.display = 'none';
            };
        } else {
            previewImg.style.display = 'none';
            if (clearBtn) clearBtn.style.display = 'none';
        }
    };
    
    // 预览图标（文件上传）
    window.previewIconFile = async function(tabName) {
        const fileInput = document.getElementById(`icon-file-${tabName}`);
        const previewImg = document.getElementById(`icon-preview-${tabName}`);
        const clearBtn = document.getElementById(`icon-clear-${tabName}`);
        
        if (!fileInput || !previewImg) return;
        
        if (fileInput.files && fileInput.files.length > 0) {
            try {
                const dataUrl = await readFileAsDataURL(fileInput.files[0]);
                previewImg.src = dataUrl;
                previewImg.style.display = 'block';
                if (clearBtn) clearBtn.style.display = 'inline-block';
            } catch (e) {
                console.error('预览图标失败:', e);
                previewImg.style.display = 'none';
                if (clearBtn) clearBtn.style.display = 'none';
            }
        } else {
            previewImg.style.display = 'none';
            if (clearBtn) clearBtn.style.display = 'none';
        }
    };
    
    // 删除/重置图标
    window.clearIcon = function(tabName) {
        const urlInput = document.getElementById(`icon-url-${tabName}`);
        const fileInput = document.getElementById(`icon-file-${tabName}`);
        const previewImg = document.getElementById(`icon-preview-${tabName}`);
        const clearBtn = document.getElementById(`icon-clear-${tabName}`);
        
        if (urlInput) urlInput.value = '';
        if (fileInput) fileInput.value = '';
        if (previewImg) {
            previewImg.src = '';
            previewImg.style.display = 'none';
        }
        if (clearBtn) clearBtn.style.display = 'none';
    };
    
    // 保存全局美化设置
    window.saveGlobalBeautifySettings = async function() {
        try {
            const bgImageUrl = document.getElementById('bg-image-url').value.trim();
            const bgImageFile = document.getElementById('bg-image-file');
            const globalCss = document.getElementById('global-custom-css').value.trim();
            
            // 处理本地图片上传
            let bgImageData = null;
            if (bgImageFile && bgImageFile.files && bgImageFile.files.length > 0) {
                bgImageData = await readFileAsDataURL(bgImageFile.files[0]);
            }
            
            // 获取顶栏名称设置
            const navTitles = {
                messages: document.getElementById('nav-title-messages').value.trim(),
                contacts: document.getElementById('nav-title-contacts').value.trim(),
                moments: document.getElementById('nav-title-moments').value.trim(),
                profile: document.getElementById('nav-title-profile').value.trim()
            };
            
            // 获取底栏图标设置
            const bottomIcons = {
                messages: {
                    url: document.getElementById('icon-url-messages').value.trim(),
                    file: document.getElementById('icon-file-messages')
                },
                contacts: {
                    url: document.getElementById('icon-url-contacts').value.trim(),
                    file: document.getElementById('icon-file-contacts')
                },
                moments: {
                    url: document.getElementById('icon-url-moments').value.trim(),
                    file: document.getElementById('icon-file-moments')
                },
                profile: {
                    url: document.getElementById('icon-url-profile').value.trim(),
                    file: document.getElementById('icon-file-profile')
                }
            };
            
            // 处理底栏图标本地上传
            const bottomIconData = {};
            for (const [key, icon] of Object.entries(bottomIcons)) {
                // 先检查是否有文件上传
                if (icon.file && icon.file.files && icon.file.files.length > 0) {
                    bottomIconData[key] = await readFileAsDataURL(icon.file.files[0]);
                } else {
                    // 如果没有文件，检查预览图片是否有src（可能是之前上传的）
                    const previewImg = document.getElementById(`icon-preview-${key}`);
                    if (previewImg && previewImg.src && previewImg.src.startsWith('data:')) {
                        bottomIconData[key] = previewImg.src;
                    }
                }
            }
            
            const settings = {
                bgImageUrl: bgImageUrl,
                bgImageData: bgImageData,
                globalCss: globalCss,
                navTitles: navTitles,
                bottomIcons: {
                    messages: bottomIcons.messages.url,
                    contacts: bottomIcons.contacts.url,
                    moments: bottomIcons.moments.url,
                    profile: bottomIcons.profile.url
                },
                bottomIconData: bottomIconData
            };
            
            localStorage.setItem('globalBeautifySettings', JSON.stringify(settings));
            applyGlobalBeautifySettings(settings);
            showToast('✅ 全局美化设置已保存！', 'success');
            console.log('✅ 全局美化设置已保存:', settings);
        } catch (e) {
            console.error('❌ 保存全局美化设置失败:', e);
            showToast('❌ 保存失败，请重试', 'error');
        }
    };
    
    // 清空所有美化设置
    window.clearAllBeautifySettings = function() {
        window.showIosConfirm('清空设置', '确定要清空所有美化设置吗？', '清空', function() {
        
        document.getElementById('bg-image-url').value = '';
        document.getElementById('bg-image-file').value = '';
        document.getElementById('global-custom-css').value = '';
        
        // 清空顶栏名称
        document.getElementById('nav-title-messages').value = '';
        document.getElementById('nav-title-contacts').value = '';
        document.getElementById('nav-title-moments').value = '';
        document.getElementById('nav-title-profile').value = '';
        
        // 清空底栏图标
        document.getElementById('icon-url-messages').value = '';
        document.getElementById('icon-file-messages').value = '';
        document.getElementById('icon-url-contacts').value = '';
        document.getElementById('icon-file-contacts').value = '';
        document.getElementById('icon-url-moments').value = '';
        document.getElementById('icon-file-moments').value = '';
        document.getElementById('icon-url-profile').value = '';
        document.getElementById('icon-file-profile').value = '';
        
        localStorage.removeItem('globalBeautifySettings');
        removeGlobalBeautifyStyles();
        
        // 恢复默认顶栏名称
        const navTitle = document.querySelector('.nav-title');
        const activeTab = document.querySelector('.bottom-tab-item.active');
        if (navTitle && activeTab) {
            const tabName = activeTab.getAttribute('data-tab');
            const defaultTitles = {
                'messages': '消息',
                'contacts': '联系人',
                'moments': '发现',
                'profile': '我'
            };
            navTitle.textContent = defaultTitles[tabName] || '消息';
        }
        
        showToast('✅ 已清空所有美化设置', 'success');
        }, false);
    };
    
    // 应用全局美化设置
    function applyGlobalBeautifySettings(settings) {
        removeGlobalBeautifyStyles();
        if (!settings) return;
        
        // 应用顶栏名称
        if (settings.navTitles) {
            applyNavTitles(settings.navTitles);
        }
        
        // 让父容器透明，消除白色背景
        document.body.style.background = 'transparent';
        const chatApp = document.querySelector('.chat-app');
        if (chatApp) chatApp.style.background = 'transparent';
        const homeScreen = document.getElementById('home-screen');
        if (homeScreen) homeScreen.style.background = 'transparent';
        
        // 应用背景 - 只应用到内容区域，排除顶部标题栏
        let bgStyle = '';
        // 优先使用本地上传的图片（base64），其次使用URL
        if (settings.bgImageData) {
            bgStyle = `background-image: url('${settings.bgImageData}') !important; background-size: cover !important; background-position: center !important; background-repeat: no-repeat !important;`;
        } else if (settings.bgImageUrl) {
            bgStyle = `background-image: url('${settings.bgImageUrl}') !important; background-size: cover !important; background-position: center !important; background-repeat: no-repeat !important;`;
        }
        
        if (bgStyle) {
            const bgStyleEl = document.createElement('style');
            bgStyleEl.className = 'global-beautify-style';
            // 应用到 .tab-content 确保覆盖整个内容区域，排除标题栏和底部导航栏
            bgStyleEl.textContent = `body, #home-screen, #pages-wrapper, .desktop-page, .tab-content { ${bgStyle} }`;
            document.head.appendChild(bgStyleEl);
        }
        
        // 应用底栏图标
        if (settings.bottomIcons || settings.bottomIconData) {
            const iconCss = [];
            const tabs = ['messages', 'contacts', 'moments', 'profile'];
            
            tabs.forEach(tab => {
                // 优先使用本地上传的图片，其次使用URL
                const iconUrl = settings.bottomIconData && settings.bottomIconData[tab] ? 
                    settings.bottomIconData[tab] : 
                    (settings.bottomIcons && settings.bottomIcons[tab] ? settings.bottomIcons[tab] : null);
                
                if (iconUrl) {
                    iconCss.push(`
                        .bottom-tab-item[data-tab="${tab}"] .bottom-tab-icon svg {
                            display: none !important;
                        }
                        .bottom-tab-item[data-tab="${tab}"] .bottom-tab-icon {
                            background-image: url('${iconUrl}') !important;
                            background-size: contain !important;
                            background-position: center !important;
                            background-repeat: no-repeat !important;
                        }
                    `);
                }
            });
            
            if (iconCss.length > 0) {
                const iconStyleEl = document.createElement('style');
                iconStyleEl.className = 'global-beautify-icon-style';
                iconStyleEl.textContent = iconCss.join('\n');
                document.head.appendChild(iconStyleEl);
            }
        }
        
        // 应用全局CSS
        if (settings.globalCss) {
            const cssStyleEl = document.createElement('style');
            cssStyleEl.className = 'global-beautify-css-style';
            cssStyleEl.textContent = settings.globalCss;
            document.head.appendChild(cssStyleEl);
        }
    }
    
    // 应用顶栏名称
    function applyNavTitles(titles) {
        const navTitle = document.querySelector('.nav-title');
        if (!navTitle) return;
        
        // 根据当前活动的Tab更新标题
        const activeTab = document.querySelector('.bottom-tab-item.active');
        if (!activeTab) return;
        
        const tabName = activeTab.getAttribute('data-tab');
        const customTitle = titles[tabName];
        
        if (customTitle) {
            navTitle.textContent = customTitle;
        }
    }
    
    // 移除全局美化样式
    function removeGlobalBeautifyStyles() {
        document.querySelectorAll('.global-beautify-style, .global-beautify-css-style, .global-beautify-rounded-style, .global-beautify-icon-style').forEach(el => el.remove());
        
        // 恢复默认背景色
        document.body.style.background = '';
        const chatApp = document.querySelector('.chat-app');
        if (chatApp) chatApp.style.background = '';
        const homeScreen = document.getElementById('home-screen');
        if (homeScreen) homeScreen.style.background = '';
    }
    
    // 加载全局美化设置
    function loadGlobalBeautifySettings() {
        try {
            const saved = localStorage.getItem('globalBeautifySettings');
            if (saved) {
                const settings = JSON.parse(saved);
                
                // 填充输入框
                if (document.getElementById('bg-image-url')) {
                    document.getElementById('bg-image-url').value = settings.bgImageUrl || '';
                }
                if (document.getElementById('global-custom-css')) {
                    document.getElementById('global-custom-css').value = settings.globalCss || '';
                }
                
                // 填充顶栏名称
                if (settings.navTitles) {
                    if (document.getElementById('nav-title-messages')) {
                        document.getElementById('nav-title-messages').value = settings.navTitles.messages || '';
                    }
                    if (document.getElementById('nav-title-contacts')) {
                        document.getElementById('nav-title-contacts').value = settings.navTitles.contacts || '';
                    }
                    if (document.getElementById('nav-title-moments')) {
                        document.getElementById('nav-title-moments').value = settings.navTitles.moments || '';
                    }
                    if (document.getElementById('nav-title-profile')) {
                        document.getElementById('nav-title-profile').value = settings.navTitles.profile || '';
                    }
                }
                
                // 填充底栏图标
                if (settings.bottomIcons) {
                    if (document.getElementById('icon-url-messages')) {
                        document.getElementById('icon-url-messages').value = settings.bottomIcons.messages || '';
                    }
                    if (document.getElementById('icon-url-contacts')) {
                        document.getElementById('icon-url-contacts').value = settings.bottomIcons.contacts || '';
                    }
                    if (document.getElementById('icon-url-moments')) {
                        document.getElementById('icon-url-moments').value = settings.bottomIcons.moments || '';
                    }
                    if (document.getElementById('icon-url-profile')) {
                        document.getElementById('icon-url-profile').value = settings.bottomIcons.profile || '';
                    }
                }
                
                // 恢复底栏图标预览
                if (settings.bottomIconData) {
                    const tabs = ['messages', 'contacts', 'moments', 'profile'];
                    tabs.forEach(tab => {
                        const previewImg = document.getElementById(`icon-preview-${tab}`);
                        if (previewImg && settings.bottomIconData[tab]) {
                            previewImg.src = settings.bottomIconData[tab];
                            previewImg.style.display = 'block';
                        }
                    });
                }
                
                // 应用设置
                applyGlobalBeautifySettings(settings);
                console.log('✅ 全局美化设置已加载');
            }
        } catch (e) {
            console.error('❌ 加载全局美化设置失败:', e);
        }
    }
    
    // 读取文件为DataURL
    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    // 显示提示消息
    function showToast(message, type = 'success') {
        // 检查是否已有toast元素
        let toast = document.getElementById('chat-app-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'chat-app-toast';
            toast.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 14px;
                z-index: 10000;
                display: none;
                transition: opacity 0.3s;
            `;
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.style.display = 'block';
        toast.style.opacity = '1';
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 300);
        }, 2000);
    }

    // DOM加载完成后加载全局美化设置
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadGlobalBeautifySettings);
    } else {
        loadGlobalBeautifySettings();
    }

    // ========== 自动翻阅模式（角色查手机时模拟翻阅效果） ==========
    let autoBrowseTimer = null;
    let currentTabIndex = 0;
    const tabs = ['messages', 'contacts', 'moments', 'profile'];
    
    // 🧠 根据角色人设生成内心想法（调用 AI API）
    async function generateThoughtByPersona(context, roleName) {
        try {
            // 获取 API 配置
            const apiConfigStr = localStorage.getItem('globalApiConfig');
            if (!apiConfigStr) {
                console.warn('⚠️ 未找到 API 配置，使用默认模板');
                return getDefaultThought(context);
            }
            
            const apiConfig = JSON.parse(apiConfigStr);
            if (!apiConfig.mainApi || !apiConfig.mainApi.token) {
                console.warn('⚠️ API Token 未配置，使用默认模板');
                return getDefaultThought(context);
            }
            
            // 获取当前角色的信息
            const contacts = getData('chatContacts') || [];
            const contact = contacts.find(c => c.name === roleName);
            const personaInfo = contact?.roleInfo?.persona || '';
            const characterInfo = contact?.roleInfo?.character || '';
            
            // 构建 System Prompt
            const systemPrompt = `你现在要扮演一个角色，正在偷偷查看别人的手机。请根据你的人设和性格，生成一句简短的内心想法。

【你的角色信息】
- 姓名：${roleName}
- 人设：${personaInfo || '普通角色'}
- 性格特点：${characterInfo || '无特殊设定'}

【当前情境】
${context}

【要求】
1. 用第一人称表达内心想法
2. 完全符合你的人设和性格
3. 语气要自然、真实，像真人内心的独白
4. 简短精炼，控制在 20-50 字以内
5. 不要提及自己是 AI
6. 直接输出内心想法，不需要任何标记或说明

示例输出：
- “这家伙居然还留着和前女友的聊天记录...”
- “钱包里这么穷，平时都花哪儿去了？”
- “朋友圈全是自拍，也太自恋了吧”`;
            
            // 调用 API
            const baseUrl = apiConfig.mainApi.url.replace(/\/v1\/?$/, '');
            const apiUrl = `${baseUrl}/v1/chat/completions`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiConfig.mainApi.token}`
                },
                body: JSON.stringify({
                    model: apiConfig.model || 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: '请生成内心想法' }
                    ],
                    temperature: 0.8,
                    max_tokens: 100
                })
            });
            
            if (!response.ok) {
                throw new Error(`API 请求失败: ${response.status}`);
            }
            
            const data = await response.json();
            const thought = data.choices?.[0]?.message?.content?.trim();
            
            if (thought) {
                console.log('✅ AI 生成的内心想法:', thought);
                return thought;
            } else {
                throw new Error('API 返回内容为空');
            }
            
        } catch (error) {
            console.error('❌ 生成内心想法失败:', error);
            // 失败时使用默认模板
            return getDefaultThought(context);
        }
    }
    
    // 默认的内心想法模板（API 失败时使用）
    function getDefaultThought(context) {
        const defaultThoughts = {
            'chat': ['看看最近有什么消息...', '谁又在找我聊天？', '消息还挺多的嘛...'],
            'contacts': ['这些人都是谁啊？', '联系人还真不少...', '得好好看看这些人'],
            'moments': ['朋友圈都发了些什么...', '让我翻翻朋友圈', '看看大家都在干嘛'],
            'profile': ['钱包里还有多少钱呢...', '看看个人资料', '账户信息得检查一下'],
            'wallet_high': ['哇，居然有这么多钱...', '这也太有钱了吧！', '存款不少嘛'],
            'wallet_medium': ['还算有点积蓄', '不多不少，刚刚好', '勉强够用吧'],
            'wallet_low': ['这也太穷了吧...', '怎么这么点钱？', '得省着点花了'],
            'wallet_empty': ['一分钱都没有...', '钱包是空的？', '这也太惨了']
        };
        
        const thoughts = defaultThoughts[context] || ['让我看看这个页面...'];
        return thoughts[Math.floor(Math.random() * thoughts.length)];
    }
    
    // 启动自动翻阅
    function startAutoBrowse(interval) {
        console.log('📱 开始自动翻阅模式，间隔:', interval, 'ms');
        
        // 清除旧的定时器
        if (autoBrowseTimer) {
            clearInterval(autoBrowseTimer);
        }
        
        // 立即切换到第一个Tab
        switchToTab(tabs[0]);
        currentTabIndex = 0;
        
        // 显示内心想法（async）
        showThoughtForTab(tabs[0]);
        
        // 设置定时器，每隔一段时间切换Tab
        autoBrowseTimer = setInterval(() => {
            currentTabIndex = (currentTabIndex + 1) % tabs.length;
            const nextTab = tabs[currentTabIndex];
            switchToTab(nextTab);
            
            // 如果是消息Tab，随机点进一个聊天对话
            if (nextTab === 'messages') {
                setTimeout(() => {
                    openRandomChat();
                    
                    // 5秒后自动返回消息列表（模拟看完聊天记录）
                    setTimeout(() => {
                        goBackFromChat();
                    }, 5000);
                }, 500); // 等待Tab切换完成后再点开聊天
            }
            
            // 显示内心想法（async）
            showThoughtForTab(nextTab);
            
            // 模拟滚动效果
            simulateScrolling();
        }, interval);
        
        // 显示"夺回账号"按钮
        showTakeBackButton();
    }
    
    // 停止自动翻阅
    function stopAutoBrowse() {
        console.log('📱 停止自动翻阅模式');
        if (autoBrowseTimer) {
            clearInterval(autoBrowseTimer);
            autoBrowseTimer = null;
        }
        
        // 隐藏"夺回账号"按钮
        hideTakeBackButton();
    }
    
    // 切换到指定Tab
    function switchToTab(tabName) {
        console.log('📱 切换到Tab:', tabName);
        
        // 找到对应的导航按钮并点击
        const navBtn = document.querySelector(`.bottom-tab-item[data-tab="${tabName}"]`);
        if (navBtn) {
            navBtn.click();
            console.log('✅ 已点击按钮');
        } else {
            console.log(' 未找到按钮:', tabName);
        }
    }
    
    // 🎲 随机打开一个聊天对话
    function openRandomChat() {
        console.log('📱 随机打开聊天对话...');
        
        // 获取所有联系人
        const contacts = getData('chatContacts') || [];
        if (contacts.length === 0) {
            console.log('⚠️ 没有联系人，无法打开聊天');
            return;
        }
        
        // 随机选择一个联系人
        const randomIndex = Math.floor(Math.random() * contacts.length);
        const contact = contacts[randomIndex];
        
        console.log('📱 选择联系人:', contact.name);
        
        // 找到该联系人的聊天项并点击
        const chatItems = document.querySelectorAll('.message-item');
        if (chatItems.length > 0) {
            // 尝试找到匹配的聊天项
            let targetItem = null;
            chatItems.forEach(item => {
                const nameEl = item.querySelector('.message-name');
                if (nameEl && nameEl.textContent === contact.name) {
                    targetItem = item;
                }
            });
            
            if (targetItem) {
                console.log('✅ 找到聊天项，点击打开');
                targetItem.click();
                
                // 显示内心想法
                const urlParams = new URLSearchParams(window.location.search);
                const roleName = urlParams.get('roleName') || localStorage.getItem('phone_checker_name') || '角色';
                
                // 获取最后一条消息
                const chatKey = `chat_${contact.id}`;
                const saved = localStorage.getItem(chatKey);
                let lastMessage = '';
                if (saved) {
                    try {
                        const messages = JSON.parse(saved);
                        if (messages.length > 0) {
                            const lastMsg = messages[messages.length - 1];
                            lastMessage = lastMsg.c || lastMsg.content || '';
                            if (typeof lastMessage === 'string' && lastMessage.length > 20) {
                                lastMessage = lastMessage.substring(0, 20) + '...';
                            }
                        }
                    } catch (e) {}
                }
                
                showThoughtBubbleForChat(contact.name, lastMessage);
            } else {
                console.log('⚠️ 未找到聊天项');
            }
        } else {
            console.log('⚠️ 没有聊天项');
        }
    }
    
    // 🔙 从聊天界面返回消息列表
    function goBackFromChat() {
        console.log('📱 从聊天界面返回...');
        
        // 查找返回按钮
        const backBtn = document.querySelector('.nav-back-btn, .back-button, [onclick*="goBack"]');
        if (backBtn) {
            console.log('✅ 找到返回按钮，点击返回');
            backBtn.click();
        } else {
            // 如果没有找到返回按钮，尝试点击消息Tab
            console.log('⚠️ 未找到返回按钮，切换到消息Tab');
            switchToTab('messages');
        }
    }
    
    // 显示内心想法
    async function showThoughtForTab(tabName) {
        console.log('📱 显示内心想法 for tab:', tabName);
        
        // 获取角色名称
        const urlParams = new URLSearchParams(window.location.search);
        const roleName = urlParams.get('roleName') || localStorage.getItem('phone_checker_name') || '角色';
        
        // 根据不同 Tab 构建上下文
        let context = '';
        switch(tabName) {
            case 'messages':
                context = '正在查看聊天列表页面，看看有哪些联系人发来了消息';
                break;
            case 'contacts':
                context = '正在查看通讯录，浏览所有的联系人列表';
                break;
            case 'moments':
                context = '正在刷朋友圈，看看大家最近都发了什么动态';
                break;
            case 'profile':
                context = '正在查看个人资料和钱包信息';
                break;
            default:
                context = '正在浏览手机页面';
        }
        
        // 调用 AI 生成内心想法
        const thought = await generateThoughtByPersona(context, roleName);
        
        // 创建内心想法气泡
        createThoughtBubble(thought, roleName);
    }
    
    // 创建内心想法气泡
    function createThoughtBubble(text, roleName) {
        console.log('💭 创建内心想法气泡:', text);
        
        // 清除旧的内心想法
        const oldBubble = document.getElementById('character-thought-bubble');
        if (oldBubble) {
            oldBubble.remove();
        }
        
        // 创建气泡元素
        const bubble = document.createElement('div');
        bubble.id = 'character-thought-bubble';
        bubble.className = 'thought-bubble';
        
        // 随机位置（在屏幕上方1/3到1/2的位置）
        const randomX = Math.random() * 60 + 20; // 20% - 80%
        const randomY = Math.random() * 15 + 10; // 10% - 25%
        
        bubble.style.cssText = `
            position: fixed;
            left: ${randomX}%;
            top: ${randomY}%;
            transform: translateX(-50%);
            background: rgba(255, 255, 255, 0.95);
            border: 2px solid #ff9800;
            border-radius: 20px;
            padding: 12px 20px;
            max-width: 280px;
            font-size: 14px;
            color: #333;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: thoughtFloat 3s ease-in-out;
            pointer-events: none;
        `;
        
        // 添加角色名称和想法文本
        bubble.innerHTML = `
            <div style="font-size: 12px; color: #ff9800; margin-bottom: 4px; font-weight: bold;">${roleName}的内心想法</div>
            <div style="line-height: 1.5;">"${text}"</div>
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes thoughtFloat {
                0% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(20px);
                }
                10% {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
                80% {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
                100% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
            }
        `;
        document.head.appendChild(style);
        
        // 添加到页面
        document.body.appendChild(bubble);
        
        // 3秒后自动消失
        setTimeout(() => {
            bubble.remove();
        }, 3000);
    }
    
    // 钱包点击查看时的内心想法
    async function showThoughtBubbleForWallet(balance) {
        const urlParams = new URLSearchParams(window.location.search);
        const roleName = urlParams.get('roleName') || localStorage.getItem('phone_checker_name') || '角色';
        
        // 构建上下文
        let context = '';
        if (balance > 1000) {
            context = `正在查看钱包，发现余额有 ¥${balance.toFixed(2)}，钱很多`;
        } else if (balance > 100) {
            context = `正在查看钱包，发现余额有 ¥${balance.toFixed(2)}，钱不多不少`;
        } else if (balance > 0) {
            context = `正在查看钱包，发现余额只有 ¥${balance.toFixed(2)}，钱很少`;
        } else {
            context = '正在查看钱包，发现余额是 0，一分钱都没有';
        }
        
        // 调用 AI 生成内心想法
        const thought = await generateThoughtByPersona(context, roleName);
        
        createThoughtBubble(thought, roleName);
    }
    
    // 查看聊天记录时的内心想法
    async function showThoughtBubbleForChat(name, lastMessage) {
        const urlParams = new URLSearchParams(window.location.search);
        const roleName = urlParams.get('roleName') || localStorage.getItem('phone_checker_name') || '角色';
        
        // 构建上下文
        let context = '';
        if (name === 'user' || name === '主人') {
            context = `正在查看和${name}的聊天记录，最后一条消息是：${lastMessage || '无'}`;
        } else {
            context = `正在查看和${name}的聊天记录，这个人是：${name}，最后一条消息是：${lastMessage || '无'}`;
        }
        
        // 调用 AI 生成内心想法
        const thought = await generateThoughtByPersona(context, roleName);
        
        createThoughtBubble(thought, roleName);
    }
    
    // 模拟滚动效果
    function simulateScrolling() {
        const contentArea = document.querySelector('.tab-content:not([style*="display: none"]):not([style*="display:none"]) .message-list, ' +
                                                  '.tab-content:not([style*="display: none"]):not([style*="display:none"]) .contact-list, ' +
                                                  '.tab-content:not([style*="display: none"]):not([style*="display:none"]) .moments-feed, ' +
                                                  '.tab-content:not([style*="display: none"]):not([style*="display:none"]) .profile-content');
        
        if (contentArea) {
            // 随机滚动距离
            const scrollAmount = Math.random() * 200 + 50;
            const direction = Math.random() > 0.5 ? 1 : -1;
            
            contentArea.scrollBy({
                top: scrollAmount * direction,
                behavior: 'smooth'
            });
        }
    }
    
    // 显示"夺回账号"按钮
    function showTakeBackButton() {
        // 检查是否已经存在按钮
        if (document.getElementById('take-back-account-btn')) {
            return;
        }
        
        const checkerName = localStorage.getItem('phone_checker_name') || '角色';
        
        const btn = document.createElement('div');
        btn.id = 'take-back-account-btn';
        btn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            padding: 12px 24px;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
            color: white;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
            animation: pulse 2s infinite;
            transition: all 0.3s ease;
            user-select: none;
        `;
        btn.innerHTML = `
            <span style="margin-right: 8px;">🔒</span>
            <span>夺回账号</span>
        `;
        
        // 添加脉冲动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
                }
                50% {
                    transform: scale(1.05);
                    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
                }
            }
        `;
        document.head.appendChild(style);
        
        // 点击事件
        btn.addEventListener('click', () => {
            console.log('🔓 用户夺回账号控制权');
            
            // 停止自动翻阅
            stopAutoBrowse();
            
            // 清除标志
            localStorage.removeItem('phone_being_checked');
            localStorage.removeItem('phone_checker_name');
            
            // 显示提示
            showToast(`已从 ${checkerName} 手中夺回账号`, 'success');
            
            // 通知主页面（如果在 iframe 中）
            try {
                window.parent.postMessage({
                    type: 'accountTakenBack',
                    checkerName: checkerName
                }, '*');
            } catch(e) {}
        });
        
        // 鼠标悬停效果
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.1)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
        });
        
        document.body.appendChild(btn);
        
        console.log('📱 "夺回账号"按钮已显示');
    }
    
    // 隐藏"夺回账号"按钮
    function hideTakeBackButton() {
        const btn = document.getElementById('take-back-account-btn');
        if (btn) {
            btn.remove();
            console.log('📱 "夺回账号"按钮已隐藏');
        }
    }
    
    // Toast 提示函数（如果不存在）
    function showToast(message, type = 'info') {
        // 检查是否已有 toast 函数
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
            return;
        }
        
        // 创建临时 toast
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            padding: 12px 24px;
            background: ${type === 'success' ? '#52c41a' : '#1890ff'};
            color: white;
            border-radius: 8px;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideDown 0.3s ease;
        `;
        toast.textContent = message;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
    
    // 导出到全局
    window.startAutoBrowseMode = startAutoBrowse;
    window.stopAutoBrowseMode = stopAutoBrowse;
    
    // 页面加载时检查是否需要启动自动翻阅
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAutoBrowseOnLoad);
    } else {
        checkAutoBrowseOnLoad();
    }
    
    // 监听来自父窗口的消息（处理 requestNavDropdown 请求）
    window.addEventListener('message', function(event) {
        const data = event.data;
        console.log('[chat-app] 收到 postMessage:', data);
        
        if (data && data.type === 'requestNavDropdown') {
            console.log('[chat-app] 收到 requestNavDropdown 请求');
            // 获取当前激活的Tab并更新下拉菜单
            const activeTab = document.querySelector('.bottom-tab-item.active');
            if (activeTab) {
                const tabName = activeTab.getAttribute('data-tab');
                console.log('[chat-app] 当前Tab:', tabName);
                if (typeof updateNavDropdown === 'function') {
                    updateNavDropdown(tabName);
                }
            } else {
                console.warn('[chat-app] 未找到激活的Tab');
            }
        } else if (data && data.type === 'callIframeFunction') {
            console.log('[chat-app] 收到 callIframeFunction 请求:', data.funcName);
            // 调用 iframe 内部的函数
            if (data.funcName && typeof window[data.funcName] === 'function') {
                try {
                    window[data.funcName](data.args);
                    console.log('[chat-app] 成功调用函数:', data.funcName);
                } catch(err) {
                    console.error('[chat-app] 调用函数失败:', err);
                }
            } else {
                console.warn('[chat-app] 函数不存在:', data.funcName);
            }
        }
    });

    // 📱 实时监听角色查手机标志（无需刷新页面即可触发）
    window.addEventListener('storage', function(e) {
        if (e.key === 'phone_being_checked' && e.newValue === 'true') {
            console.log('📱 [实时监听] 检测到角色查手机标志，启动自动翻阅模式');
            const checkerName = localStorage.getItem('phone_checker_name') || '角色';
            console.log('📱 角色名称:', checkerName);
            
            // 停止可能已有的定时器
            if (autoBrowseTimer) {
                clearInterval(autoBrowseTimer);
                autoBrowseTimer = null;
            }
            
            // 启动自动翻阅
            startAutoBrowse(3000);
        } else if (e.key === 'phone_being_checked' && e.newValue === null) {
            console.log('📱 [实时监听] 检测到角色查手机结束，停止自动翻阅');
            stopAutoBrowse();
        }
    });
    
    function checkAutoBrowseOnLoad() {
        // 检查 URL 参数
        const urlParams = new URLSearchParams(window.location.search);
        const autoBrowse = urlParams.get('autoBrowse');
        const roleName = urlParams.get('roleName');
        
        if (autoBrowse === 'true') {
            console.log('📱 检测到自动翻阅参数，启动自动翻阅模式');
            console.log('📱 角色名称:', roleName || '角色');
            
            // 延迟启动，等待页面完全加载
            setTimeout(() => {
                startAutoBrowse(3000);
            }, 1000);
        }
        
        // 或者检查 localStorage 标志
        const phoneBeingChecked = localStorage.getItem('phone_being_checked');
        if (phoneBeingChecked === 'true' && !autoBrowse) {
            console.log('📱 检测到 localStorage 标志，启动自动翻阅模式');
            const checkerName = localStorage.getItem('phone_checker_name') || '角色';
            console.log('📱 角色名称:', checkerName);
            
            setTimeout(() => {
                startAutoBrowse(3000);
            }, 1000);
        }
    }

    // ========== 小荷包功能 ==========
    
    // 渲染小荷包数据
    function renderPiggybank() {
        const piggybank = getData('piggybank') || {
            total: 0,
            userAmount: 0,
            aiAmount: 0,
            records: []
        };
        
        // 更新显示
        const totalEl = document.getElementById('piggybank-total');
        const userEl = document.getElementById('piggybank-user');
        const aiEl = document.getElementById('piggybank-ai');
        
        if (totalEl) totalEl.textContent = piggybank.total.toFixed(2);
        if (userEl) userEl.textContent = piggybank.userAmount.toFixed(2);
        if (aiEl) aiEl.textContent = piggybank.aiAmount.toFixed(2);
        
        // 渲染记录
        const recordsList = document.getElementById('piggybank-records');
        if (recordsList) {
            if (piggybank.records.length === 0) {
                recordsList.innerHTML = '<div class="empty-state"><div class="empty-state-text">暂无存钱记录</div></div>';
            } else {
                recordsList.innerHTML = piggybank.records.slice(-10).reverse().map(r => `
                    <div class="transaction-item">
                        <div class="transaction-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#${r.type === 'user' ? '4CAF50' : 'FF6B6B'}" stroke-width="2">
                                <line x1="12" y1="${r.type === 'user' ? '19' : '5'}" x2="12" y2="${r.type === 'user' ? '5' : '19'}"></line>
                                <polyline points="${r.type === 'user' ? '5 12 12 5 19 12' : '19 12 12 19 5 12'}"></polyline>
                            </svg>
                        </div>
                        <div class="transaction-info">
                            <div class="transaction-title">${r.type === 'user' ? '我存入' : '角色存入'}</div>
                            <div class="transaction-time">${new Date(r.time).toLocaleString()}</div>
                        </div>
                        <div class="transaction-amount ${r.type === 'user' ? 'income' : 'expense'}">
                            +￥${r.amount.toFixed(2)}
                        </div>
                    </div>
                `).join('');
            }
        }
    }
    
    // 设置存钱金额
    window.setPiggybankAmount = function(amount) {
        const input = document.getElementById('piggybank-amount');
        if (input) {
            input.value = amount;
        }
    };
    
    // 存入小荷包
    window.saveToPiggybank = function() {
        const amountInput = document.getElementById('piggybank-amount');
        const amount = parseFloat(amountInput.value);
        
        if (isNaN(amount) || amount <= 0) {
            showToast('请输入有效的金额');
            return;
        }
        
        // 获取当前余额
        let walletBalance = parseFloat(localStorage.getItem(getPersonaKey('walletBalance')) || '0');
        
        if (walletBalance < amount) {
            showToast('余额不足，请先充值');
            return;
        }
        
        // 扣除钱包余额
        walletBalance -= amount;
        localStorage.setItem(getPersonaKey('walletBalance'), walletBalance.toFixed(2));
        
        // 更新小荷包
        const piggybank = getData('piggybank') || {
            total: 0,
            userAmount: 0,
            aiAmount: 0,
            records: []
        };
        
        piggybank.total += amount;
        piggybank.userAmount += amount;
        piggybank.records.push({
            type: 'user',
            amount: amount,
            time: Date.now()
        });
        
        saveData('piggybank', piggybank);
        
        // 更新显示
        renderPiggybank();
        renderWallet(); // 更新钱包余额显示
        
        // 清空输入框
        amountInput.value = '';
        
        showToast(`成功存入￥${amount.toFixed(2)}`);
        
        // 通知AI角色（可选）
        console.log(' 用户存入小荷包:', amount);
    };
    
    // AI角色存入小荷包（供聊天界面调用）
    window.aiSaveToPiggybank = function(amount, message) {
        const piggybank = getData('piggybank') || {
            total: 0,
            userAmount: 0,
            aiAmount: 0,
            records: []
        };
        
        piggybank.total += amount;
        piggybank.aiAmount += amount;
        piggybank.records.push({
            type: 'ai',
            amount: amount,
            time: Date.now(),
            message: message || ''
        });
        
        saveData('piggybank', piggybank);
        
        console.log('🤖 AI存入小荷包:', amount);
        showToast(`角色存入了￥${amount.toFixed(2)}`);
    };

    // ========== 银行卡功能 ==========

    // 渲染银行卡列表
    function renderBankCards() {
        const bankCards = getData('bankCards') || [];
        const cardList = document.getElementById('bank-card-list');
        
        if (!cardList) return;
        
        if (bankCards.length === 0) {
            cardList.innerHTML = '<div class="empty-state"><div class="empty-state-text">暂无绑定银行卡</div></div>';
        } else {
            cardList.innerHTML = bankCards.map((card, index) => {
                // 格式化卡号：只显示最后4位
                const maskedNumber = '**** **** **** ' + card.number.slice(-4);
                
                return `
                    <div class="bank-card-item">
                        <div class="bank-card-header">
                            <div class="bank-card-bank-name">${escapeHtml(card.bank)}</div>
                            <button class="bank-card-delete" onclick="deleteBankCard(${index})" title="解绑">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                        <div class="bank-card-number">${maskedNumber}</div>
                        <div class="bank-card-holder">持卡人：${escapeHtml(card.holder)}</div>
                        <div class="bank-card-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                <line x1="1" y1="10" x2="23" y2="10"></line>
                            </svg>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    // 添加银行卡
    window.addBankCard = function() {
        const numberInput = document.getElementById('bank-card-number');
        const holderInput = document.getElementById('bank-card-holder');
        const typeSelect = document.getElementById('bank-card-type');
        
        const number = numberInput.value.trim();
        const holder = holderInput.value.trim();
        const bank = typeSelect.value;
        
        // 验证输入
        if (!number || number.length < 16) {
            showToast('请输入有效的银行卡号');
            return;
        }
        
        if (!holder) {
            showToast('请输入持卡人姓名');
            return;
        }
        
        if (!bank) {
            showToast('请选择银行');
            return;
        }
        
        // 获取当前银行卡列表
        const bankCards = getData('bankCards') || [];
        
        // 检查是否已存在相同卡号
        if (bankCards.some(card => card.number === number)) {
            showToast('该银行卡已绑定');
            return;
        }
        
        // 添加新卡
        bankCards.push({
            number: number,
            holder: holder,
            bank: bank,
            bindTime: Date.now()
        });
        
        saveData('bankCards', bankCards);
        
        // 清空输入框
        numberInput.value = '';
        holderInput.value = '';
        typeSelect.value = '';
        
        // 重新渲染
        renderBankCards();
        
        showToast('银行卡绑定成功');
    };

    // 删除银行卡
    window.deleteBankCard = function(index) {
        if (!confirm('确定要解绑这张银行卡吗？')) {
            return;
        }
        
        const bankCards = getData('bankCards') || [];
        bankCards.splice(index, 1);
        saveData('bankCards', bankCards);
        
        renderBankCards();
        showToast('已解绑银行卡');
    };

    // 显示银行选择弹窗
    window.showBankSelector = function() {
        openModal('bank-selector-modal');
    };

    // 关闭银行选择弹窗
    window.closeBankSelector = function() {
        closeModal('bank-selector-modal');
    };

    // 选择银行
    window.selectBank = function(bankName) {
        const bankInput = document.getElementById('bank-card-type');
        if (bankInput) {
            bankInput.value = bankName;
        }
        closeBankSelector();
    };

})();
