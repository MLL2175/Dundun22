// 全局变量
let isEditing = false;
window.activeMessageTimer = null;

// 🛡️ 全局通知横幅系统
let globalNotificationTimer = null;

/**
 * 显示全局通知横幅（iOS 风格）
 * @param {string} title - 标题
 * @param {string} message - 消息内容
 * @param {number} duration - 显示时长（毫秒），默认 3000
 */
window.showGlobalNotification = function(title, message, duration = 3000) {
    // 🛡️ 检查是否开启了横幅通知
    try {
        const config = JSON.parse(localStorage.getItem('globalApiConfig') || '{}');
        if (!config.notification?.bannerEnabled) {
            console.log('[全局通知] 横幅通知已关闭，不显示');
            return;
        }
    } catch (e) {
        console.error('[全局通知] 读取配置失败:', e);
    }
    
    console.log('[全局通知] 显示:', title, message);
    
    // 清除之前的定时器
    if (globalNotificationTimer) {
        clearTimeout(globalNotificationTimer);
        globalNotificationTimer = null;
    }
    
    // 移除旧的通知
    removeGlobalNotification();
    
    // 创建通知容器
    const container = document.getElementById('global-notification-container');
    if (!container) {
        console.warn('[全局通知] 容器不存在');
        return;
    }
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.id = 'global-notification';
    
    // iOS 风格灰色半透明圆角条
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
            <div style="flex: 1; min-width: 0;">
                <div style="font-size: 14px; font-weight: 600; color: #1a1a1a; margin-bottom: 2px;">${title}</div>
                <div style="font-size: 13px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${message}</div>
            </div>
        </div>
    `;
    
    // iOS 风格样式
    notification.style.cssText = `
        position: fixed;
        top: 50px;
        left: 16px;
        right: 16px;
        background: rgba(120, 120, 128, 0.7);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        padding: 12px 16px;
        border-radius: 14px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
        z-index: 999999;
        cursor: pointer;
        animation: notificationSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        transition: opacity 0.3s ease, transform 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;
    
    // 点击关闭
    notification.onclick = () => {
        removeGlobalNotification();
    };
    
    // 添加动画样式
    if (!document.getElementById('notification-anim-style')) {
        const style = document.createElement('style');
        style.id = 'notification-anim-style';
        style.textContent = `
            @keyframes notificationSlideIn {
                from {
                    transform: translateY(-100%) scale(0.95);
                    opacity: 0;
                }
                to {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                }
            }
            @keyframes notificationSlideOut {
                from {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                }
                to {
                    transform: translateY(-100%) scale(0.95);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    container.appendChild(notification);
    
    // 自动消失
    globalNotificationTimer = setTimeout(() => {
        removeGlobalNotification();
    }, duration);
    
    console.log('[全局通知] ✅ 已显示');
};

/**
 * 移除全局通知
 */
function removeGlobalNotification() {
    const notification = document.getElementById('global-notification');
    if (notification) {
        // 添加滑出动画
        notification.style.animation = 'notificationSlideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // 动画结束后移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
    
    // 清除定时器
    if (globalNotificationTimer) {
        clearTimeout(globalNotificationTimer);
        globalNotificationTimer = null;
    }
}

// 监听 AI 回复完成事件
window.addEventListener('storage', (e) => {
    if (e.key === 'unreadCountUpdated' && e.newValue) {
        try {
            const data = JSON.parse(e.newValue);
            
            // 只有当有未读消息时才显示通知
            if (data.unread > 0) {
                // 获取联系人名称
                const currentPersona = localStorage.getItem('currentPersona') || 'default';
                const contactsKey = `persona_${currentPersona}_chatContacts`;
                const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
                const contact = contacts.find(c => c.id === data.chatId);
                const contactName = contact ? (contact.remark || contact.name || '联系人') : '联系人';
                
                console.log('[全局通知] 收到 AI 回复完成事件:', contactName);
                
                // 显示全局通知
                showGlobalNotification(
                    `${contactName} 回复了你`,
                    '点击查看消息',
                    3000
                );
            }
        } catch (error) {
            console.error('[全局通知] 解析事件数据失败:', error);
        }
    }
});

// 全局API配置（和settings.js同步）
window.globalApiConfig = {
    mainApi: { url: '', token: '' },
    backupApi: { enabled: false, url: '', token: '' },
    model: '',
    temperature: 0.7,
    maxTokens: 2048,
    notification: { backgroundKeep: false, bannerEnabled: false }
};

// 全局API请求方法（兼容OpenAI规范）
window.globalApiRequest = async function(params) {
    const { path, method = 'POST', body, useBackup = false } = params;
    const config = useBackup ? globalApiConfig.backupApi : globalApiConfig.mainApi;
    
    if (!config.url || !config.token) {
        throw new Error(useBackup ? '备用API配置不完整' : '主API配置不完整，请先在设置中填写');
    }

    const baseUrl = config.url.endsWith('/') ? config.url.slice(0, -1) : config.url;
    const fullPath = path.startsWith('/') ? path : `/${path}`;
    const fullUrl = baseUrl + fullPath;

    try {
        const response = await fetch(fullUrl, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.token}`
            },
            body: method === 'POST' ? JSON.stringify({
                model: globalApiConfig.model,
                temperature: globalApiConfig.temperature,
                max_tokens: globalApiConfig.maxTokens,
                ...body
            }) : undefined
        });

        if (!response.ok) {
            if (!useBackup && globalApiConfig.backupApi.enabled) {
                return await globalApiRequest({ ...params, useBackup: true });
            }
            throw new Error(`请求失败，状态码：${response.status}`);
        }

        return await response.json();
    } catch (error) {
        if (!useBackup && globalApiConfig.backupApi.enabled) {
            return await globalApiRequest({ ...params, useBackup: true });
        }
        throw error;
    }
};

// 全局关闭APP函数
window.closeApp = function() {
    document.querySelectorAll('.app-page').forEach(page => {
        page.classList.remove('active');
    });
    document.body.style.overflow = 'hidden';
};

// 使用iframe打开外部应用（避免页面跳转白屏）
window.openAppIframe = function(url, title, options) {
    options = options || {};
    
    // 创建iframe容器
    let container = document.getElementById('app-iframe-container');
    
    // 保存当前应用的URL历史，用于返回
    if (!container) {
        container = document.createElement('div');
        container.id = 'app-iframe-container';
        container.dataset.history = '[]'; // 存储历史URL的JSON数组
        container.innerHTML = `
            <div class="iframe-header" style="position: relative; display: flex; align-items: center; padding: 0 12px; height: 44px;">
                <div class="iframe-back-btn" style="width: 24px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer;">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </div>
                <div class="iframe-title" style="position: absolute; left: 50%; transform: translateX(-50%); font-size: 17px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 60%;"></div>
                <div class="iframe-right-btn" id="iframe-right-btn" style="display: flex; align-items: center; justify-content: center; flex-shrink: 0;"></div>
                <div class="iframe-dropdown" id="iframe-dropdown"></div>
            </div>
            <iframe id="app-iframe" src="" style="border: none; width: 100%; height: 100%;" allow="pointer-lock"></iframe>
        `;
        document.body.appendChild(container);
    }
    
    // 设置标题
    const titleElement = container.querySelector('.iframe-title');
    titleElement.textContent = title;
    
    // 设置右侧按钮（如果有）
    const rightBtn = container.querySelector('#iframe-right-btn');
    const dropdown = container.querySelector('#iframe-dropdown');
    if (options.rightBtn) {
        rightBtn.innerHTML = options.rightBtn.html;
        rightBtn.style.display = 'flex';
        rightBtn.style.visibility = 'visible';
        
        // 为右侧按钮添加点击事件（通过 postMessage 调用 iframe 内部函数）
        const buttons = rightBtn.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const action = this.getAttribute('data-action');
                if (action) {
                    // 获取 iframe 元素
                    const iframe = container.querySelector('#app-iframe');
                    if (iframe && iframe.contentWindow) {
                        console.log('[iframe] 调用iframe内部函数:', action);
                        iframe.contentWindow.postMessage({
                            type: 'callIframeFunction',
                            funcName: action
                        }, '*');
                    } else {
                        console.warn('[iframe] iframe 未加载完成，无法调用函数:', action);
                    }
                }
            });
        });
        
        // 保留原有的下拉菜单功能（如果是+按钮）
        if (options.rightBtn.html === '+') {
            rightBtn.onclick = function(e) {
                e.stopPropagation();
                console.log('[iframe] +按钮被点击');
                
                // 通过 postMessage 请求 iframe 更新下拉菜单
                const iframe = container.querySelector('#app-iframe');
                if (iframe && iframe.contentWindow) {
                    console.log('[iframe] 发送 updateNavDropdown 请求');
                    iframe.contentWindow.postMessage({
                        type: 'requestNavDropdown'
                    }, '*');
                }
                
                // 切换下拉菜单显示
                dropdown.classList.toggle('active');
                const isActive = dropdown.classList.contains('active');
                console.log('[iframe] 下拉菜单状态:', isActive ? '显示' : '隐藏');
                console.log('[iframe] 下拉菜单display样式:', dropdown.style.display);
                console.log('[iframe] 下拉菜单computedStyle:', window.getComputedStyle(dropdown).display);
                if (options.rightBtn.onToggle) options.rightBtn.onToggle();
            };
        }
    } else {
        rightBtn.innerHTML = '';
        rightBtn.style.display = 'none';
        rightBtn.style.visibility = 'hidden';
        rightBtn.onclick = null;
        dropdown.innerHTML = '';
        dropdown.classList.remove('active');
    }
    
    // 设置iframe地址
    const iframe = container.querySelector('#app-iframe');
    
    // 如果是从聊天应用打开的对话界面，保存历史以便返回
    if (url.includes('chat-interface.html')) {
        try {
            const history = JSON.parse(container.dataset.history || '[]');
            history.push(iframe.src || 'chat-app.html'); // 保存当前页面
            container.dataset.history = JSON.stringify(history);
        } catch(e) {
            console.warn('[iframe] 保存历史失败:', e);
        }
    }
    
    iframe.src = url;
    
    // 保存引用供外部访问
    window._iframeContainer = container;
    window._iframeDropdown = dropdown;
    window._iframeRightBtn = rightBtn;
    
    // 监听iframe发来的消息
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'updateIframeTitle') {
            const titleElement = container.querySelector('.iframe-title');
            if (titleElement) {
                titleElement.textContent = event.data.title;
            }
        } else if (event.data && event.data.type === 'closeAppIframe') {
            closeAppIframe();
        } else if (event.data && event.data.type === 'hideIframeHeader') {
            // 隐藏iframe顶栏
            const header = container.querySelector('.iframe-header');
            if (header) header.style.display = 'none';
        } else if (event.data && event.data.type === 'showIframeHeader') {
            // 显示iframe顶栏
            const header = container.querySelector('.iframe-header');
            if (header) header.style.display = 'flex';
        }
    });
    
    // 聊天应用和对话界面都需要显示返回按钮
    const backBtn = container.querySelector('.iframe-back-btn');
    if (url.includes('chat-interface.html') || url.includes('chat-app.html')) {
        // 聊天应用和对话界面都显示返回按钮
        if (backBtn) backBtn.style.display = 'flex';
    } else {
        // 其他应用（如记忆、日记等）也需要返回按钮
        if (backBtn) backBtn.style.display = 'flex';
    }
    
    // 给返回按钮绑定默认事件
    if (backBtn) {
        // 如果是论坛页面，特殊处理返回按钮（需要处理私信关闭）
        if (url.includes('forum.html')) {
            backBtn.onclick = function() {
                console.log('[iframe] 论坛返回按钮被点击');
                // 先尝试调用forum.html内部的closeChat函数（关闭私信）
                iframe.contentWindow.postMessage({
                    type: 'callIframeFunction',
                    funcName: 'closeChat',
                    args: []
                }, '*');
            };
        } else if (url.includes('couple-space.html')) {
            // 情侣空间页面：返回按钮直接关闭情侣空间（closeAppIframe 会先尝试关闭子页面）
            backBtn.onclick = function() {
                console.log('[iframe] 情侣空间返回按钮被点击，调用closeAppIframe');
                closeAppIframe();
            };
        } else if (url.includes('check-device.html')) {
            // 查岗页面：使用postMessage调用iframe内部的handleBackNavigation
            backBtn.onclick = function() {
                console.log('[iframe] 查岗页面返回按钮被点击');
                const iframe = container.querySelector('#app-iframe');
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage({
                        type: 'callIframeFunction',
                        funcName: 'handleBackNavigation'
                    }, '*');
                }
            };
        } else {
            backBtn.onclick = function() {
                closeAppIframe();
            };
        }
    }
    
    // iframe加载完成后处理右侧按钮事件
    iframe.onload = function() {
        // 为iframe顶栏的右侧按钮添加点击事件（处理论坛的设置和刷新按钮）
        if (rightBtn && url.includes('forum.html')) {
            rightBtn.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const action = this.getAttribute('data-action');
                    
                    if (action === 'openSettings' && iframe.contentWindow) {
                        // 调用forum.html内部的openSettings函数
                        iframe.contentWindow.postMessage({
                            type: 'callIframeFunction',
                            funcName: 'openSettings',
                            args: []
                        }, '*');
                        console.log('[iframe] 调用openSettings');
                    } else if (action === 'refreshForum' && iframe.contentWindow) {
                        // 调用forum.html内部的AI生成帖子函数
                        iframe.contentWindow.postMessage({
                            type: 'callIframeFunction',
                            funcName: 'generatePostWithAI',
                            args: []
                        }, '*');
                        console.log('[iframe] 调用generatePostWithAI');
                    }
                });
            });
            console.log('[iframe] 已绑定论坛按钮事件');
        }
        
        try {
            // 尝试访问iframe内容（同源策略）
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (iframeDoc) {
                // 创建样式元素隐藏内部顶栏
                const style = iframeDoc.createElement('style');
                style.textContent = `
                    /* 隐藏内部页面的顶栏 */
                    .top-nav, 
                    .chat-header,
                    .header,
                    header.header,
                    .app-header,
                    .page-header,
                    .diary-header,
                    .forum-header,
                    .category-tabs {
                        display: none !important;
                        visibility: hidden !important;
                        height: 0 !important;
                        overflow: hidden !important;
                    }
                        
                    /* 调整内容区域的上边距 */
                    .content-area,
                    .chat-app,
                    body {
                        margin-top: 0 !important;
                        padding-top: 0 !important;
                    }
                `;
                iframeDoc.head.appendChild(style);
                console.log('[iframe] ✅ 已隐藏内部顶栏');
                    
                // 额外：直接操作DOM元素隐藏（针对日记页面）
                setTimeout(() => {
                    try {
                        const headers = iframeDoc.querySelectorAll('.header, .top-nav, .chat-header, .app-header');
                        headers.forEach(header => {
                            header.style.display = 'none';
                            header.style.visibility = 'hidden';
                            header.style.height = '0';
                            header.style.overflow = 'hidden';
                        });
                        console.log('[iframe] ✅ 已强制隐藏', headers.length, '个顶栏元素');
                    } catch(e) {
                        console.warn('[iframe] 强制隐藏顶栏失败:', e);
                    }
                }, 100);
                    
                // 应用美化CSS到iframe
                const savedCss = localStorage.getItem('mainBeautifyCss');
                if (savedCss) {
                    console.log('[iframe] 检测到已保存的美化CSS，长度:', savedCss.length);
                    const beautifyStyle = iframeDoc.createElement('style');
                    beautifyStyle.id = 'injected-beautify-style';
                    beautifyStyle.textContent = savedCss.replace(/\.top-nav/g, '.iframe-header');
                    // 关键：将样式添加到body末尾，确保覆盖之前的所有样式
                    if (iframeDoc.body) {
                        iframeDoc.body.appendChild(beautifyStyle);
                        console.log('[iframe] ✅ 已应用美化CSS到body');
                    } else {
                        iframeDoc.head.appendChild(beautifyStyle);
                        console.log('[iframe] ✅ 已应用美化CSS到head');
                    }
                } else {
                    console.log('[iframe]  没有已保存的美化CSS');
                }
                    
                // 保存iframe的window对象供下拉菜单使用
                window._iframeWindow = iframe.contentWindow;
                    
                // 如果是聊天应用，等待一小段时间让chat-app.js初始化完成，然后触发下拉菜单更新
                if (url.includes('chat-app.html')) {
                    setTimeout(() => {
                        // 尝试获取当前tab并更新下拉菜单
                        try {
                            const currentTab = iframeDoc.querySelector('.tab-bar-item.active');
                            if (currentTab) {
                                const tabName = currentTab.getAttribute('data-tab');
                                if (tabName) {
                                    // 通过postMessage调用iframe内部的函数
                                    iframe.contentWindow.postMessage({
                                        type: 'callIframeFunction',
                                        funcName: 'updateNavDropdown',
                                        args: tabName
                                    }, '*');
                                }
                            }
                        } catch(e) {
                            console.warn('[iframe] 无法初始化下拉菜单:', e);
                        }
                    }, 500);
                }
            }
        } catch (e) {
            console.warn('[iframe] 无法访问iframe内容（跨域限制）:', e);
        }
    };
    
    // 点击外部关闭下拉菜单
    document.addEventListener('click', function closeDropdown() {
        dropdown.classList.remove('active');
    });
    
    // 显示容器
    container.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // 应用全局美化 CSS 到 iframe 顶栏
    try {
        const beautifySettings = JSON.parse(localStorage.getItem('globalBeautifySettings') || '{}');
        if (beautifySettings && beautifySettings.globalCss) {
            // 移除旧的样式标签
            const oldStyle = document.getElementById('global-beautify-iframe-header-style');
            if (oldStyle) oldStyle.remove();
            
            // 创建新的样式标签，应用到 iframe-header
            const styleEl = document.createElement('style');
            styleEl.id = 'global-beautify-iframe-header-style';
            // 将 .top-nav 替换为 .iframe-header（因为 iframe 内的 .top-nav 是隐藏的，实际显示的是父页面的 .iframe-header）
            let css = beautifySettings.globalCss.replace(/\.top-nav/g, '.iframe-header');
            styleEl.textContent = css;
            document.head.appendChild(styleEl);
        } else {
            // 没有设置时移除样式
            const oldStyle = document.getElementById('global-beautify-iframe-header-style');
            if (oldStyle) oldStyle.remove();
        }
    } catch (e) {
        console.warn('[main] 应用全局美化 CSS 失败:', e);
    }
}

// 关闭iframe应用或返回上一层
window.closeAppIframe = function() {
    const container = document.getElementById('app-iframe-container');
    if (!container) return;
    
    const iframe = container.querySelector('#app-iframe');
    const currentSrc = iframe.src;
    
    console.log('[iframe] closeAppIframe - currentSrc:', currentSrc);
    
    // 提取文件名（处理 file:// 协议下的完整路径）
    const fileName = currentSrc ? currentSrc.split('/').pop().split('?')[0] : '';
    console.log('[iframe] 提取的文件名:', fileName);
    
    // 如果当前是 IF 线页面，先尝试关闭详情页
    if (fileName === 'if-line.html') {
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const detailPage = iframeDoc ? iframeDoc.getElementById('detail-page') : null;
            if (detailPage && detailPage.classList.contains('show')) {
                // 详情页正在显示，关闭详情页回到列表
                console.log('[iframe] 关闭 IF 线详情页');
                iframe.contentWindow.postMessage({
                    type: 'callIframeFunction',
                    funcName: 'closeDetail'
                }, '*');
                return;
            }
        } catch(e) {
            console.warn('[iframe] 无法访问 iframe 内容:', e);
        }
    }
    
    // 如果当前是游戏页面，先尝试返回游戏列表
    if (fileName === 'game.html') {
        try {
            // 通过 localStorage 判断是否在子游戏页面（避免跨域问题）
            const inSubGame = localStorage.getItem('game_in_sub_game');
            if (inSubGame === 'true') {
                console.log('[iframe] 检测到在子游戏页面，返回游戏列表');
                // 通过 postMessage 调用 iframe 内部的函数
                iframe.contentWindow.postMessage({
                    type: 'callIframeFunction',
                    funcName: 'backToGameList'
                }, '*');
                return;
            }
        } catch(e) {
            console.warn('[iframe] 访问 localStorage 失败:', e);
        }
    }
    
    // 如果当前是情侣空间页面，先尝试关闭子页面（信件列表、写信页面等）
    if (fileName === 'couple-space.html') {
        try {
            // 检查是否已经调用过一次handleBackNavigation，防止死循环
            if (container.dataset.coupleBackNavigationCalled === 'true') {
                console.log('[iframe] 情侣空间页面，已调用过handleBackNavigation，直接关闭');
                delete container.dataset.coupleBackNavigationCalled;
                // 继续执行后续的关闭逻辑（删除container，返回桌面）
            } else {
                // 第一次调用，尝试关闭子页面
                container.dataset.coupleBackNavigationCalled = 'true';
                iframe.contentWindow.postMessage({
                    type: 'callIframeFunction',
                    funcName: 'handleBackNavigation'
                }, '*');
                console.log('[iframe] 情侣空间页面，尝试关闭子页面');
                return;
            }
        } catch(e) {
            console.warn('[iframe] 无法访问情侣空间 iframe 内容:', e);
        }
    }
    
    // 如果当前是查岗页面，先尝试关闭子页面
    if (fileName === 'check-device.html') {
        try {
            if (container.dataset.checkBackNavigationCalled === 'true') {
                console.log('[iframe] 查岗页面，已调用过handleBackNavigation，直接关闭');
                delete container.dataset.checkBackNavigationCalled;
            } else {
                container.dataset.checkBackNavigationCalled = 'true';
                iframe.contentWindow.postMessage({
                    type: 'callIframeFunction',
                    funcName: 'handleBackNavigation'
                }, '*');
                console.log('[iframe] 查岗页面，尝试关闭子页面');
                return;
            }
        } catch(e) {
            console.warn('[iframe] 无法访问查岗 iframe 内容:', e);
        }
    }
    
    // 如果当前是对话界面，返回到聊天应用
    if (fileName === 'chat-interface.html') {
        console.log('[iframe] 从对话界面返回到聊天应用');
        iframe.src = 'chat-app.html';
        
        // 清除历史记录
        try {
            container.dataset.history = '[]';
        } catch(e) {}
        
        // 恢复右侧按钮为"+"按钮（聊天应用需要）
        const rightBtn = container.querySelector('#iframe-right-btn');
        const dropdown = container.querySelector('#iframe-dropdown');
        if (rightBtn) {
            rightBtn.innerHTML = '+';
            rightBtn.style.display = 'flex';
            // 重新绑定点击事件
            rightBtn.onclick = function(e) {
                e.stopPropagation();
                dropdown.classList.toggle('active');
            };
        }
        if (dropdown) {
            dropdown.innerHTML = '';
            dropdown.classList.remove('active');
        }
        
        // 更新标题为"聊天"
        const titleElement = container.querySelector('.iframe-title');
        if (titleElement) {
            titleElement.textContent = '聊天';
        }
        
        // 保持返回按钮显示（因为从对话界面返回后还在iframe中）
        const backBtn = container.querySelector('.iframe-back-btn');
        if (backBtn) {
            backBtn.style.display = 'flex';
        }
        
        return;
    }
    
    // 如果是聊天应用或其他应用，关闭整个iframe容器（回到桌面）
    console.log('[iframe] 关闭iframe，回到桌面');
    
    // 🛡️ 如果是日记页面，在关闭前清除未读消息计数
    if (fileName === 'diary.html') {
        try {
            // 获取当前聊天的ID（日记通常是在聊天中打开的）
            const currentChatId = localStorage.getItem('currentChatId');
            if (currentChatId) {
                console.log('[iframe] 日记页面关闭，清除未读计数:', currentChatId);
                
                // 清除未读计数
                const currentPersona = localStorage.getItem('currentPersona') || 'default';
                const conversationsKey = `persona_${currentPersona}_chatConversations`;
                const conversations = JSON.parse(localStorage.getItem(conversationsKey) || '[]');
                
                const conversation = conversations.find(c => c.id === currentChatId);
                if (conversation && conversation.unread && conversation.unread > 0) {
                    console.log(`[iframe] 清除未读计数: ${conversation.unread} → 0`);
                    conversation.unread = 0;
                    
                    // 保存回 localStorage
                    localStorage.setItem(conversationsKey, JSON.stringify(conversations));
                    
                    // 触发 storage 事件，更新 UI
                    localStorage.setItem('unreadCountUpdated', JSON.stringify({
                        chatId: currentChatId,
                        unread: 0,
                        timestamp: Date.now()
                    }));
                    
                    // 立即清除触发器（避免重复处理）
                    localStorage.removeItem('unreadCountUpdated');
                }
            }
        } catch (error) {
            console.error('[iframe] 清除日记未读计数失败:', error);
        }
    }
    
    container.style.display = 'none';
    iframe.src = ''; // 清空iframe，释放资源
    const dropdown = container.querySelector('#iframe-dropdown');
    if (dropdown) {
        dropdown.innerHTML = '';
        dropdown.classList.remove('active');
    }
    // 清理引用
    window._iframeContainer = null;
    window._iframeDropdown = null;
    window._iframeRightBtn = null;
    window._iframeWindow = null;
    document.body.style.overflow = 'hidden';
}

// 全局函数：更新iframe顶栏的下拉菜单（供chat-app.js调用）
window.updateIframeDropdown = function(html) {
    console.log('[iframe] 更新下拉菜单，HTML长度:', html ? html.length : 0);
    console.log('[iframe] window._iframeDropdown:', window._iframeDropdown);
    const dropdown = window._iframeDropdown;
    if (dropdown) {
        // 清空旧内容（这会移除所有事件监听器）
        dropdown.innerHTML = html;
        console.log('[iframe] 已设置 innerHTML');
        
        // 为下拉菜单项添加点击事件
        const items = dropdown.querySelectorAll('.dropdown-item');
        console.log('[iframe] 下拉菜单项数量:', items.length);
        items.forEach((item, index) => {
            console.log('[iframe] 为第', index, '项添加事件:', item.getAttribute('data-func'));
            item.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log('[iframe-dropdown] 点击事件触发！');
                
                // 获取 data-func 属性中的函数名
                const funcName = this.getAttribute('data-func');
                console.log('[iframe-dropdown] 函数名:', funcName);
                
                // 通过 postMessage 调用 iframe 中的函数
                const iframe = document.querySelector('#app-iframe');
                if (iframe && iframe.contentWindow && funcName) {
                    console.log('[iframe-dropdown] 通过 postMessage 调用:', funcName);
                    iframe.contentWindow.postMessage({
                        type: 'callIframeFunction',
                        funcName: funcName
                    }, '*');
                } else {
                    console.error('[iframe-dropdown] iframe 或 funcName 不存在');
                }
                
                // 关闭下拉菜单
                dropdown.classList.remove('active');
            });
        });
    } else {
        console.error('[iframe] dropdown 为 null，无法更新下拉菜单');
    }
};

// 监听来自iframe的postMessage
window.addEventListener('message', function(event) {
    const data = event.data;
    console.log('[main] 收到postMessage:', data);
    
    // 处理iframe标题更新（论坛私信切换）
    if (data && data.type === 'updateIframeTitle') {
        const container = document.getElementById('app-iframe-container');
        const iframeTitle = document.querySelector('#app-iframe-container .iframe-title');
        const iframeHeader = document.querySelector('#app-iframe-container .iframe-header');
        if (iframeTitle) {
            iframeTitle.textContent = data.title;
            console.log('[main] 更新顶栏标题为:', data.title);
        }
        
        // 特殊处理：信件、提问箱、写信页面使用浅色主题
        if ((data.title === '信件' || data.title === '提问箱' || data.title === '写信') && iframeHeader) {
            iframeHeader.style.background = '#FFFFFF';
            iframeHeader.style.borderBottom = '1px solid rgba(0,0,0,0.08)';
            iframeTitle.style.color = '#333';
            const backBtn = document.querySelector('#app-iframe-container .iframe-back-btn svg');
            if (backBtn) {
                backBtn.style.stroke = '#333';
            }
        } else if (iframeHeader) {
            // 恢复默认深色主题
            iframeHeader.style.background = '';
            iframeHeader.style.borderBottom = '';
            iframeTitle.style.color = '';
            const backBtn = document.querySelector('#app-iframe-container .iframe-back-btn svg');
            if (backBtn) {
                backBtn.style.stroke = '';
            }
            // 恢复返回按钮默认行为（调用 closeAppIframe，它会通过 handleBackNavigation 按顺序返回）
            const backBtnElement = document.querySelector('#app-iframe-container .iframe-back-btn');
            if (backBtnElement) {
                backBtnElement.onclick = function() {
                    closeAppIframe();
                };
            }
        }
        
        // 处理右侧按钮的显示/隐藏
        const rightBtn = document.querySelector('#app-iframe-container .iframe-right-btn');
        if (rightBtn) {
            // 特殊处理：查岗页面主界面隐藏刷新按钮，应用详情页显示
            if (data.title === '查岗') {
                rightBtn.style.display = 'none';
                console.log('[main] 查岗主页面，隐藏刷新按钮');
            } else {
                rightBtn.style.display = 'flex';
                console.log('[main] 应用详情页，显示刷新按钮');
            }
            // 特殊处理：信件页面显示操作按钮
            if (data.title === '信件') {
                rightBtn.style.display = 'flex';
                rightBtn.style.visibility = 'visible';  // 修复：确保按钮可见
                rightBtn.style.gap = '4px';
                rightBtn.style.alignItems = 'center';
                rightBtn.style.justifyContent = 'flex-end';
                rightBtn.style.width = 'auto';
                rightBtn.innerHTML = `
                    <button data-action="triggerAILetter" style="background: none; border: none; color: #F8CCDB !important; padding: 6px 10px; border-radius: 16px; font-size: 12px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F8CCDB" stroke-width="2.5">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>让TA写信</span>
                    </button>
                    <button data-action="showLetterSettings" style="background: none; border: none; cursor: pointer; padding: 8px; color: #999 !important;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m16.36-5.36l-4.24 4.24m-4.24 4.24l-4.24 4.24m16.96 0l-4.24-4.24m-4.24-4.24L6.64 6.64"></path>
                        </svg>
                    </button>
                    <button data-action="showWriteLetter" style="background: none; border: none; cursor: pointer; padding: 8px; color: #999 !important;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                    </button>
                `;
                
                // 添加点击事件监听（使用 postMessage）
                const buttons = rightBtn.querySelectorAll('button');
                buttons.forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const action = this.getAttribute('data-action');
                        const iframe = document.querySelector('#app-iframe');
                        if (iframe && iframe.contentWindow) {
                            // 通过 postMessage 向 iframe 发送消息
                            iframe.contentWindow.postMessage({
                                type: 'letterAction',
                                action: action
                            }, '*');
                        }
                    });
                });
                
                console.log('[main] 显示信件操作按钮');
                console.log('[main] rightBtn:', rightBtn);
                console.log('[main] rightBtn.style.display:', rightBtn.style.display);
            }
            // 特殊处理：写信页面显示返回和保存按钮
            else if (data.title === '写信') {
                // 修改左侧返回按钮行为：返回到信件列表
                const backBtn = document.querySelector('#app-iframe-container .iframe-back-btn');
                if (backBtn) {
                    backBtn.onclick = function() {
                        // 关闭写信页面，返回到信件列表
                        const iframe = document.querySelector('#app-iframe');
                        if (iframe && iframe.contentWindow) {
                            iframe.contentWindow.postMessage({
                                type: 'letterAction',
                                action: 'closeWriteLetter'
                            }, '*');
                        }
                    };
                }
                
                // 右侧只显示发送按钮
                rightBtn.style.display = 'flex';
                rightBtn.style.visibility = 'visible';
                rightBtn.style.alignItems = 'center';
                rightBtn.style.justifyContent = 'flex-end';
                rightBtn.style.width = 'auto';
                rightBtn.innerHTML = `
                    <button data-action="saveLetter" style="background: #F8CCDB; border: none; color: #FFFFFF !important; padding: 8px 24px; border-radius: 20px; font-size: 14px; cursor: pointer; font-weight: 600; white-space: nowrap;">
                        发送
                    </button>
                `;
                
                // 添加点击事件监听（使用 postMessage）
                const buttons = rightBtn.querySelectorAll('button');
                buttons.forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const action = this.getAttribute('data-action');
                        const iframe = document.querySelector('#app-iframe');
                        if (iframe && iframe.contentWindow) {
                            iframe.contentWindow.postMessage({
                                type: 'letterAction',
                                action: action
                            }, '*');
                        }
                    });
                });
                
                console.log('[main] 显示写信按钮');
            } else if (data.hideActionButtons === true) {
                // 隐藏右侧按钮
                rightBtn.style.display = 'none';
                console.log('[main] 隐藏右侧按钮');
            } else if (data.title === '情侣空间') {
                // 情侣空间：根据isDetailPage决定返回按钮行为
                const backBtn = container.querySelector('.iframe-back-btn');
                
                if (data.isDetailPage === true) {
                    // 详情页：返回按钮调用内部的goBack函数，返回列表页
                    if (backBtn) {
                        backBtn.onclick = function() {
                            console.log('[main] 情侣空间详情页返回按钮被点击，调用goBack');
                            const iframe = container.querySelector('#app-iframe');
                            if (iframe && iframe.contentWindow) {
                                iframe.contentWindow.postMessage({
                                    type: 'callIframeFunction',
                                    funcName: 'goBack'
                                }, '*');
                            }
                        };
                    }
                } else {
                    // 列表页：返回按钮调用closeAppIframe，关闭iframe
                    if (backBtn) {
                        backBtn.onclick = function() {
                            console.log('[main] 情侣空间列表页返回按钮被点击，调用closeAppIframe');
                            closeAppIframe();
                        };
                    }
                }
                
                console.log('[main] 情侣空间' + (data.isDetailPage ? '详情页' : '列表页') + '，设置返回按钮');
            } else if (data.title === '纪念日') {
                // 纪念日页面：返回按钮调用closeAnniversary
                const backBtn = container.querySelector('.iframe-back-btn');
                if (backBtn) {
                    backBtn.onclick = function() {
                        console.log('[main] 纪念日页面返回按钮被点击，调用closeAnniversary');
                        const iframe = container.querySelector('#app-iframe');
                        if (iframe && iframe.contentWindow) {
                            iframe.contentWindow.postMessage({
                                type: 'callIframeFunction',
                                funcName: 'closeAnniversary'
                            }, '*');
                        }
                    };
                }
            } else if (data.title === '共养情绪花') {
                // 情绪花页面：返回按钮调用closeEmotionFlower
                const backBtn = container.querySelector('.iframe-back-btn');
                if (backBtn) {
                    backBtn.onclick = function() {
                        console.log('[main] 情绪花页面返回按钮被点击，调用closeEmotionFlower');
                        const iframe = container.querySelector('#app-iframe');
                        if (iframe && iframe.contentWindow) {
                            iframe.contentWindow.postMessage({
                                type: 'callIframeFunction',
                                funcName: 'closeEmotionFlower'
                            }, '*');
                        }
                    };
                }
            } else if (data.title === '提问箱') {
                // 提问箱页面：返回按钮调用closeQuestionBox
                const backBtn = container.querySelector('.iframe-back-btn');
                if (backBtn) {
                    backBtn.onclick = function() {
                        console.log('[main] 提问箱页面返回按钮被点击，调用closeQuestionBox');
                        const iframe = container.querySelector('#app-iframe');
                        if (iframe && iframe.contentWindow) {
                            iframe.contentWindow.postMessage({
                                type: 'callIframeFunction',
                                funcName: 'closeQuestionBox'
                            }, '*');
                        }
                    };
                }
            } else if (data.title === '信件') {
                // 信件页面：返回按钮调用closeLetters
                const backBtn = container.querySelector('.iframe-back-btn');
                if (backBtn) {
                    backBtn.onclick = function() {
                        console.log('[main] 信件页面返回按钮被点击，调用closeLetters');
                        const iframe = container.querySelector('#app-iframe');
                        if (iframe && iframe.contentWindow) {
                            iframe.contentWindow.postMessage({
                                type: 'callIframeFunction',
                                funcName: 'closeLetters'
                            }, '*');
                        }
                    };
                }
            } else if (data.title === '写信') {
                // 写信页面：返回按钮调用closeWriteLetter
                const backBtn = container.querySelector('.iframe-back-btn');
                if (backBtn) {
                    backBtn.onclick = function() {
                        console.log('[main] 写信页面返回按钮被点击，调用closeWriteLetter');
                        const iframe = container.querySelector('#app-iframe');
                        if (iframe && iframe.contentWindow) {
                            iframe.contentWindow.postMessage({
                                type: 'callIframeFunction',
                                funcName: 'closeWriteLetter'
                            }, '*');
                        }
                    };
                }
            } else {
                rightBtn.style.display = 'flex';
                console.log('[main] 显示右侧按钮');
            }
        } else {
            console.error('[main] 找不到 rightBtn 元素');
        }
        return;
    }
    
    // 调试：特别标记updateIframeHeader消息
    if (data && data.type === 'updateIframeHeader') {
        console.log('[main] ⭐⭐⭐ 收到updateIframeHeader消息！⭐⭐⭐');
        console.log('[main] 标题:', data.title);
        console.log('[main] 按钮HTML:', data.rightBtn ? '有' : '无');
    }
    
    if (data && data.type === 'openChatIframe') {
        // 收到打开聊天界面的请求
        console.log('[main] 打开聊天界面:', data.chatName);
        
        // 构建右侧按钮HTML（只保留聊天设置）
        const rightBtnHtml = `
            <button class="chat-header-btn" data-action="showChatSettings" title="聊天设置">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="19" cy="12" r="1"></circle>
                    <circle cx="5" cy="12" r="1"></circle>
                </svg>
            </button>
        `;
        
        window.openAppIframe(
            `chat-interface.html?id=${encodeURIComponent(data.chatId)}&name=${encodeURIComponent(data.chatName)}`,
            data.chatName,
            {
                avatar: data.chatAvatar,
                rightBtn: {
                    html: rightBtnHtml
                }
            }
        );
    } else if (data && data.type === 'updateIframeDropdown') {
        // 更新iframe顶栏的下拉菜单
        console.log('[main] 更新下拉菜单');
        window.updateIframeDropdown(data.html);
    } else if (data && data.type === 'updateIframeHeader') {
        // 更新iframe顶栏的标题和右侧按钮
        console.log('[main] 更新iframe顶栏:', data.title, data.rightBtn ? '有按钮' : '无按钮');
        const container = document.getElementById('app-iframe-container');
        console.log('[main] container:', container);
        if (container) {
            const titleElement = container.querySelector('.iframe-title');
            const rightBtn = container.querySelector('#iframe-right-btn');
            const backBtn = container.querySelector('.iframe-back-btn');
            console.log('[main] titleElement:', titleElement, 'rightBtn:', rightBtn, 'backBtn:', backBtn);
            
            if (titleElement && data.title) {
                titleElement.textContent = data.title;
                console.log('[main] 标题已设置为:', data.title);
            }
            
            // 如果是信件页面，修改返回按钮行为为关闭信件页面，返回情侣空间
            if (data.title === '信件' && backBtn) {
                backBtn.onclick = function() {
                    console.log('[main] 信件页面返回按钮被点击，调用closeLetters');
                    const iframe = container.querySelector('#app-iframe');
                    if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage({
                            type: 'callIframeFunction',
                            funcName: 'closeLetters'
                        }, '*');
                    }
                };
            } else if (data.title === '写信' && backBtn) {
                // 如果是写信页面，修改返回按钮行为为关闭写信页面，返回信件列表
                backBtn.onclick = function() {
                    console.log('[main] 写信页面返回按钮被点击，调用closeWriteLetter');
                    const iframe = container.querySelector('#app-iframe');
                    if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage({
                            type: 'callIframeFunction',
                            funcName: 'closeWriteLetter'
                        }, '*');
                    }
                };
            } else if (data.title === '提问箱' && backBtn) {
                // 如果是提问箱页面，修改返回按钮行为为关闭提问箱
                backBtn.onclick = function() {
                    console.log('[main] 提问箱页面返回按钮被点击，调用closeQuestionBox');
                    const iframe = container.querySelector('#app-iframe');
                    if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage({
                            type: 'callIframeFunction',
                            funcName: 'closeQuestionBox'
                        }, '*');
                    }
                };
                
                // 给提问箱的下拉菜单添加默认内容
                const dropdown = container.querySelector('#iframe-dropdown');
                if (dropdown && !dropdown.innerHTML) {
                    console.log('[main] 初始化提问箱下拉菜单');
                    dropdown.innerHTML = `
                        <div class="dropdown-item" data-func="closeQuestionBox">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M15 18l-6-6 6-6"></path>
                            </svg>
                            <span>返回</span>
                        </div>
                    `;
                    
                    // 为下拉菜单项添加点击事件
                    const items = dropdown.querySelectorAll('.dropdown-item');
                    items.forEach(item => {
                        item.addEventListener('click', function(e) {
                            e.stopPropagation();
                            const funcName = this.getAttribute('data-func');
                            if (funcName) {
                                console.log('[main-dropdown] 调用函数:', funcName);
                                const iframe = container.querySelector('#app-iframe');
                                if (iframe && iframe.contentWindow) {
                                    iframe.contentWindow.postMessage({
                                        type: 'callIframeFunction',
                                        funcName: funcName
                                    }, '*');
                                }
                            }
                        });
                    });
                }
            } else if (data.title === '共养情绪花' && backBtn) {
                // 如果是情绪花页面，修改返回按钮行为为关闭情绪花，返回情侣空间
                backBtn.onclick = function() {
                    console.log('[main] 情绪花页面返回按钮被点击，调用closeEmotionFlower');
                    const iframe = container.querySelector('#app-iframe');
                    if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage({
                            type: 'callIframeFunction',
                            funcName: 'closeEmotionFlower'
                        }, '*');
                    }
                };
                
                // 给情绪花的下拉菜单添加默认内容
                const dropdown = container.querySelector('#iframe-dropdown');
                if (dropdown && !dropdown.innerHTML) {
                    console.log('[main] 初始化情绪花下拉菜单');
                    dropdown.innerHTML = `
                        <div class="dropdown-item" data-func="closeEmotionFlower">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M15 18l-6-6 6-6"></path>
                            </svg>
                            <span>返回</span>
                        </div>
                    `;
                    
                    // 为下拉菜单项添加点击事件
                    const items = dropdown.querySelectorAll('.dropdown-item');
                    items.forEach(item => {
                        item.addEventListener('click', function(e) {
                            e.stopPropagation();
                            const funcName = this.getAttribute('data-func');
                            if (funcName) {
                                console.log('[main-dropdown] 调用函数:', funcName);
                                const iframe = container.querySelector('#app-iframe');
                                if (iframe && iframe.contentWindow) {
                                    iframe.contentWindow.postMessage({
                                        type: 'callIframeFunction',
                                        funcName: funcName
                                    }, '*');
                                }
                            }
                            dropdown.classList.remove('active');
                        });
                    });
                }
            } else if (backBtn) {
                // 恢复默认的返回按钮行为
                backBtn.onclick = function() {
                    closeAppIframe();
                };
            }
            
            if (rightBtn) {
                if (data.rightBtn) {
                    console.log('[main] 设置按钮HTML...');
                    rightBtn.innerHTML = data.rightBtn;
                    console.log('[main] innerHTML已设置，当前innerHTML:', rightBtn.innerHTML);
                    rightBtn.style.display = 'flex';
                    rightBtn.style.visibility = 'visible';
                    rightBtn.style.width = 'auto';
                    rightBtn.style.gap = '4px';
                    rightBtn.style.overflow = 'visible';
                    rightBtn.style.whiteSpace = 'nowrap';
                    rightBtn.style.flexShrink = '0';
                    console.log('[main] 样式已设置，display:', rightBtn.style.display, 'width:', rightBtn.style.width, 'visibility:', rightBtn.style.visibility);
                    
                    // 为右侧按钮添加点击事件（通过 postMessage 调用 iframe 内部函数）
                    const buttons = rightBtn.querySelectorAll('button');
                    buttons.forEach(btn => {
                        btn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            const action = this.getAttribute('data-action');
                            if (action) {
                                // 获取 iframe 元素
                                const iframe = container.querySelector('#app-iframe');
                                if (iframe && iframe.contentWindow) {
                                    console.log('[iframe] 调用iframe内部函数:', action);
                                    // 通过 postMessage 调用iframe内的函数
                                    iframe.contentWindow.postMessage({
                                        type: 'callIframeFunction',
                                        funcName: action
                                    }, '*');
                                }
                            }
                        });
                    });
                } else {
                    // 恢复默认的右侧按钮（三个点）
                    console.log('[main] 恢复默认三个点按钮');
                    rightBtn.innerHTML = `
                        <button style="background: none; border: none; cursor: pointer; padding: 8px; color: var(--text-primary);">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="19" cy="12" r="1"></circle>
                                <circle cx="5" cy="12" r="1"></circle>
                            </svg>
                        </button>
                    `;
                    rightBtn.style.display = 'flex';
                    rightBtn.style.visibility = 'visible';
                    rightBtn.style.width = '24px';
                    
                    // 给三个点按钮添加点击事件
                    const menuBtn = rightBtn.querySelector('button');
                    console.log('[main] menuBtn:', menuBtn, 'container:', container);
                    if (menuBtn) {
                        menuBtn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            console.log('[main] 三个点按钮被点击');
                            const dropdown = container.querySelector('#iframe-dropdown');
                            console.log('[main] dropdown:', dropdown);
                            if (dropdown) {
                                dropdown.classList.toggle('active');
                                console.log('[main] dropdown active:', dropdown.classList.contains('active'));
                            }
                        });
                        console.log('[main] 已添加点击事件监听器');
                    }
                }
            }
        }
    } else if (data && data.type === 'hideIframeHeader') {
        // 虚拟手机页面请求隐藏iframe顶栏
        console.log('[main] 隐藏iframe顶栏');
        const container = document.getElementById('app-iframe-container');
        if (container) {
            const header = container.querySelector('.iframe-header');
            if (header) {
                header.style.display = 'none';
            }
        }
    } else if (data && data.type === 'showIframeHeader') {
        // 虚拟手机页面请求显示iframe顶栏
        console.log('[main] 显示iframe顶栏');
        const container = document.getElementById('app-iframe-container');
        if (container) {
            const header = container.querySelector('.iframe-header');
            if (header) {
                header.style.display = 'flex';
            }
        }
    } else if (data && data.type === 'closeIframe') {
        // 关闭iframe，返回上一层
        console.log('[main] 收到closeIframe消息，关闭iframe');
        closeAppIframe();
    } else if (data && data.type === 'switchToPublishMode') {
        // 切换到发表朋友圈模式
        console.log('[main] 切换到发表模式');
        const container = document.getElementById('app-iframe-container');
        if (container) {
            const titleElement = container.querySelector('.iframe-title');
            const backBtn = container.querySelector('.iframe-back-btn');
            const rightBtn = container.querySelector('#iframe-right-btn');
            const dropdown = container.querySelector('#iframe-dropdown');
            
            if (titleElement) {
                titleElement.textContent = '发表朋友圈';
            }
            
            // 修改返回按钮为"取消"
            if (backBtn) {
                backBtn.innerHTML = '<span style="font-size: 16px; color: var(--text-secondary);">取消</span>';
                backBtn.onclick = function() {
                    const iframe = container.querySelector('#app-iframe');
                    if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage({
                            type: 'callIframeFunction',
                            funcName: 'closePublishModal'
                        }, '*');
                    }
                };
            }
            
            // 添加"发表"按钮到右侧
            if (rightBtn) {
                rightBtn.innerHTML = '<button style="padding: 6px 12px; background: transparent; color: #007AFF; border: none; font-size: 16px; font-weight: 500; cursor: pointer; white-space: nowrap;" data-action="publishMoment">发表</button>';
                rightBtn.style.display = 'flex';
                rightBtn.style.width = 'auto';
                
                // 添加点击事件 - 使用 onclick 代替 addEventListener 避免重复绑定
                const buttons = rightBtn.querySelectorAll('button');
                buttons.forEach(btn => {
                    btn.onclick = function(e) {
                        e.stopPropagation();
                        const action = this.getAttribute('data-action');
                        if (action) {
                            const iframe = container.querySelector('#app-iframe');
                            if (iframe && iframe.contentWindow) {
                                console.log('[iframe] 调用iframe内部函数:', action);
                                iframe.contentWindow.postMessage({
                                    type: 'callIframeFunction',
                                    funcName: action
                                }, '*');
                            }
                        }
                    };
                });
            }
            
            // 隐藏下拉菜单
            if (dropdown) {
                dropdown.classList.remove('active');
                dropdown.style.display = 'none';
            }
        }
    } else if (data && data.type === 'switchToMomentsMode') {
        // 恢复朋友圈模式
        console.log('[main] 恢复朋友圈模式');
        const container = document.getElementById('app-iframe-container');
        if (container) {
            const titleElement = container.querySelector('.iframe-title');
            const backBtn = container.querySelector('.iframe-back-btn');
            const rightBtn = container.querySelector('#iframe-right-btn');
            const dropdown = container.querySelector('#iframe-dropdown');
            
            if (titleElement) {
                titleElement.textContent = '朋友圈';
            }
            
            // 恢复返回按钮
            if (backBtn) {
                backBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M15 18l-6-6 6-6" /></svg>';
                backBtn.onclick = function() {
                    closeAppIframe();
                };
            }
            
            // 恢复右侧按钮为"+"
            if (rightBtn) {
                rightBtn.innerHTML = '+';
                rightBtn.style.display = 'flex';
                
                // 恢复+按钮的下拉菜单功能
                rightBtn.onclick = function(e) {
                    e.stopPropagation();
                    console.log('[iframe] +按钮被点击');
                    
                    const iframe = container.querySelector('#app-iframe');
                    if (iframe && iframe.contentWindow) {
                        console.log('[iframe] 发送 updateNavDropdown 请求');
                        iframe.contentWindow.postMessage({
                            type: 'requestNavDropdown'
                        }, '*');
                    }
                    
                    dropdown.classList.toggle('active');
                };
            }
            
            // 恢复下拉菜单显示
            if (dropdown) {
                dropdown.style.display = '';
            }
        }
    } else if (data && data.type === 'callIframeFunction') {
        // 调用iframe内部的函数
        if (window._iframeWindow && data.funcName) {
            try {
                if (data.args) {
                    window._iframeWindow[data.funcName](data.args);
                } else {
                    window._iframeWindow[data.funcName]();
                }
                console.log('[iframe] 调用函数:', data.funcName);
            } catch(err) {
                console.error('[iframe] 调用函数失败:', err);
            }
        }
    } else if (data && data.type === 'showWhisperBadge') {
        // 显示外层小红点
        const badge = document.getElementById('iframe-whisper-badge');
        if (badge) {
            badge.style.display = 'block';
            console.log('[main] 显示外层小红点');
        }
    } else if (data && data.type === 'hideWhisperBadge') {
        // 隐藏外层小红点
        const badge = document.getElementById('iframe-whisper-badge');
        if (badge) {
            badge.style.display = 'none';
            console.log('[main] 隐藏外层小红点');
        }
    }
});

// 页面加载初始化
window.onload = function() {
    updateTime();
    setInterval(updateTime, 1000);
    initAppClick();
    initLongPress();
    initWidgetDrag();
    initEditToolbar();
    initPhotoUpload();
    initPageSwipe();
    initDockDrag();  // 初始化 Dock 栏拖拽
    initTimeBubbleEditing();  // 初始化时间组件气泡编辑
    initWidgetImageFromStorage();  // 初始化时间组件图片
    loadAllPositions();
    loadCuteWidgetData(); // 加载保存的可爱组件数据
};

// 实时更新时间
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    
    // 星期缩写
    const weekdaysAbbr = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dayAbbr = weekdaysAbbr[now.getDay()];
    
    // 月份和日期
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[now.getMonth()];
    const day = now.getDate();
    const year = now.getFullYear();
    const dateStr = `${month} ${year}`;
    
    // 更新 DOM
    const widgetTime = document.getElementById('widget-time');
    const widgetDayAbbr = document.getElementById('widget-day-abbr');
    const widgetCalendarDate = document.getElementById('widget-calendar-date');
    const widgetCalendarGrid = document.getElementById('widget-calendar-grid');
    
    if (widgetTime) widgetTime.textContent = timeStr;
    if (widgetDayAbbr) widgetDayAbbr.textContent = dayAbbr;
    if (widgetCalendarDate) widgetCalendarDate.textContent = dateStr;
    
    // 生成日历网格
    if (widgetCalendarGrid) {
        widgetCalendarGrid.innerHTML = '';
        
        // 获取当月第一天和最后一天
        const firstDay = new Date(year, now.getMonth(), 1);
        const lastDay = new Date(year, now.getMonth() + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startWeekday = firstDay.getDay(); // 0 = Sunday
        
        // 将周日(0)转换为一周的最后一天(6)，周一(1)转为0，以此类推
        const adjustedStart = (startWeekday + 6) % 7;
        
        // 计算当前日期在哪个位置
        const todayPosition = adjustedStart + day; // 今天是第几个格子
        const currentWeekStart = Math.floor((todayPosition - 1) / 7) * 7; // 当前周的起始位置
        
        // 添加所有空白格子和日期
        const allDays = [];
        
        // 添加月初空白格子
        for (let i = 0; i < adjustedStart; i++) {
            allDays.push({ type: 'empty', value: '' });
        }
        
        // 添加当月日期
        for (let d = 1; d <= daysInMonth; d++) {
            allDays.push({ type: 'date', value: d, isToday: d === day });
        }
        
        // 补齐到完整的周
        const totalCells = allDays.length;
        const remainder = totalCells % 7;
        if (remainder > 0) {
            for (let i = 0; i < (7 - remainder); i++) {
                allDays.push({ type: 'empty', value: '' });
            }
        }
        
        // 只显示当前周和下一周（14个格子）
        const startIndex = Math.max(0, currentWeekStart);
        const endIndex = Math.min(startIndex + 14, allDays.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            
            if (allDays[i].type === 'empty') {
                dayEl.classList.add('other-month');
                dayEl.textContent = '';
            } else {
                if (allDays[i].isToday) {
                    dayEl.classList.add('today');
                }
                dayEl.textContent = allDays[i].value;
            }
            
            widgetCalendarGrid.appendChild(dayEl);
        }
    }
}

// APP点击跳转
function initAppClick() {
    // 移除旧的事件监听器，避免重复绑定
    document.querySelectorAll('.app-icon').forEach(icon => {
        const newIcon = icon.cloneNode(true);
        icon.parentNode.replaceChild(newIcon, icon);
    });
    
    // 重新绑定事件
    document.querySelectorAll('.app-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            if (isDragging) return;
            if (isEditing) return;
            const appId = icon.getAttribute('data-app-id');
            
            // 聊天应用 - 使用iframe在当前页面内打开
            if (appId === 'chat') {
                openAppIframe('chat-app.html', '聊天', {
                    rightBtn: {
                        html: '+'
                    }
                });
                return;
            }
            
            // 记忆应用 - 使用iframe在当前页面内打开
            if (appId === 'memory') {
                openAppIframe('memory-app.html', '记忆');
                return;
            }
            
            // 情侣空间 - 使用iframe在当前页面内打开
            if (appId === 'couple') {
                // 保存情侣空间的按钮配置，供需要时恢复
                window._coupleSpaceRightBtnConfig = {
                    html: `
                        <button data-action="showWriteLetter" style="background: #F8CCDB; border: none; color: #FFFFFF !important; padding: 8px 24px; border-radius: 20px; font-size: 14px; cursor: pointer; font-weight: 600; white-space: nowrap;">
                            写信
                        </button>
                    `
                };
                // 初始不显示按钮
                openAppIframe('couple-space.html?v=4', '情侣空间');
                return;
            }
            
            // 世界书 - 使用iframe在当前页面内打开
            if (appId === 'worldbook') {
                openAppIframe('worldbook.html', '世界书');
                return;
            }
            
            // 日记 - 使用iframe在当前页面内打开
            if (appId === 'diary') {
                openAppIframe('diary.html', '日记', {
                    rightBtn: {
                        html: '<button data-action="showSettings" title="设置" style="background:none;border:none;font-size:20px;cursor:pointer;color:#999;padding:4px 8px;"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>'
                    }
                });
                return;
            }
            
            // 一起听 - 使用iframe在当前页面内打开
            if (appId === 'music') {
                openAppIframe('music-player.html', '一起听');
                return;
            }
            
            // 一起做 - 使用iframe在当前页面内打开
            if (appId === 'together') {
                openAppIframe('together.html', '一起做');
                return;
            }
            
            // 商城 - 使用iframe弹窗
            if (appId === 'shop') {
                openShopModal();
                return;
            }
            
            // 游戏 - 使用iframe在当前页面内打开
            if (appId === 'game') {
                openAppIframe('game.html', '游戏');
                return;
            }
            
            // 论坛 - 使用iframe在当前页面内打开
            if (appId === 'forum') {
                openAppIframe('forum.html?v=2', '论坛', {
                    rightBtn: {
                        html: `
                            <button data-action="openSettings" style="background:none;border:none;color:#333;padding:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;" title="世界观设置">
                                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="3"></circle>
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                </svg>
                            </button>
                            <button data-action="refreshForum" style="background:none;border:none;color:#333;padding:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;margin-left:4px;" title="刷新">
                                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="23 4 23 10 17 10"></polyline>
                                    <polyline points="1 20 1 14 7 14"></polyline>
                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                                </svg>
                            </button>
                        `
                    }
                });
                return;
            }
            
            // 查岗 - 使用iframe在当前页面内打开
            if (appId === 'device-check') {
                openAppIframe('check-device.html?v=5', '查岗', {
                    rightBtn: {
                        html: '<button data-action="refreshCheckDevice" style="background:none;border:none;color:#333;padding:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;margin-left:4px;" title="刷新">\n                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">\n                            <polyline points="23 4 23 10 17 10"></polyline>\n                            <polyline points="1 20 1 14 7 14"></polyline>\n                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>\n                        </svg>\n                    </button>'
                    }
                });
                return;
            }
            
            // IF线 - 使用iframe在当前页面内打开
            if (appId === 'ifline') {
                openAppIframe('if-line.html', 'IF线', {
                    rightBtn: {
                        html: '<button data-action="showCreateModal" style="background:#4A4A4A;border:none;color:white;padding:6px 12px;border-radius:16px;font-size:13px;cursor:pointer;font-weight:600;white-space:nowrap;letter-spacing:0;">+ 新建</button>'
                    }
                });
                return;
            }
            
            const appPage = document.getElementById(`${appId}-page`);
            if (appPage) {
                appPage.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                // 如果是设置页面，重新加载配置
                if (appId === 'settings' && typeof window.reloadApiSettings === 'function') {
                    window.reloadApiSettings();
                }
                
                // 如果是美化页面，重新初始化
                if (appId === 'beautify' && typeof window.refreshBeautifyForm === 'function') {
                    window.refreshBeautifyForm();
                }
            }
        });
    });
}

// 长按进入编辑模式
let longPressTimer = null;
let longPressStartTime = 0;
let longPressTriggered = false;

function initLongPress() {
    const homeScreen = document.getElementById('home-screen');
    const dock = document.getElementById('dock');
    
    // 触摸事件 - 手机端
    const handleTouchStart = (e) => {
        // 如果已经在编辑模式，不处理长按（让拖拽事件处理）
        if (isEditing) return;
        
        longPressTriggered = false;
        longPressStartTime = Date.now();
        longPressTimer = setTimeout(() => {
            longPressTriggered = true;
            enterEditMode();
        }, 500);
    };
    
    const handleTouchEnd = () => {
        if (isEditing) return;
        clearTimeout(longPressTimer);
        longPressStartTime = 0;
    };
    
    const handleTouchMove = (e) => {
        if (isEditing) return;
        // 移动时清除长按计时器
        clearTimeout(longPressTimer);
        // 阻止长按时的默认滚动行为
        e.preventDefault();
    };
    
    // 鼠标事件 - 桌面端
    const handleMouseDown = (e) => {
        // 如果已经在编辑模式，不处理长按（让拖拽事件处理）
        if (isEditing) return;
        
        // 忽略特定元素
        if (e.target.closest('.widget-delete') || 
            e.target.closest('.widget-picker') ||
            e.target.closest('button') ||
            e.target.closest('input') ||
            e.target.closest('.switch')) {
            return;
        }
        
        longPressTriggered = false;
        longPressStartTime = Date.now();
        longPressTimer = setTimeout(() => {
            longPressTriggered = true;
            enterEditMode();
        }, 500);
    };
    
    const handleMouseUp = () => {
        if (isEditing) return;
        clearTimeout(longPressTimer);
        longPressStartTime = 0;
    };
    
    const handleMouseLeave = () => {
        if (isEditing) return;
        clearTimeout(longPressTimer);
        longPressStartTime = 0;
    };
    
    // 绑定事件
    homeScreen.addEventListener('touchstart', handleTouchStart, { passive: true });
    homeScreen.addEventListener('touchend', handleTouchEnd);
    homeScreen.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    homeScreen.addEventListener('mousedown', handleMouseDown);
    homeScreen.addEventListener('mouseup', handleMouseUp);
    homeScreen.addEventListener('mouseleave', handleMouseLeave);
    
    // dock 也支持长按
    dock.addEventListener('touchstart', handleTouchStart, { passive: true });
    dock.addEventListener('touchend', handleTouchEnd);
    dock.addEventListener('mousedown', handleMouseDown);
    dock.addEventListener('mouseup', handleMouseUp);
}

function enterEditMode() {
    if (isEditing) return;
    isEditing = true;
    if (globalApiConfig.vibrateEnabled && 'vibrate' in navigator) navigator.vibrate(50);

    document.querySelectorAll('.app-icon').forEach(icon => icon.classList.add('editing'));
    document.querySelectorAll('.widget').forEach(widget => widget.classList.add('editing'));
    document.getElementById('edit-toolbar').classList.add('active');
    
    console.log('进入编辑模式, 图标数量:', document.querySelectorAll('.app-icon.editing').length);
}

function exitEditMode() {
    isEditing = false;
    document.querySelectorAll('.app-icon').forEach(icon => icon.classList.remove('editing'));
    document.querySelectorAll('.widget').forEach(widget => widget.classList.remove('editing'));
    document.getElementById('edit-toolbar').classList.remove('active');
    saveAllPositions();
}

function initEditToolbar() {
    document.getElementById('finish-edit-btn').addEventListener('click', exitEditMode);
    document.getElementById('add-widget-btn').addEventListener('click', () => {
        openWidgetPicker();
    });
    document.getElementById('save-layout-btn').addEventListener('click', () => {
        saveAllPositions();
        
        // 显示保存成功提示
        const saveBtn = document.getElementById('save-layout-btn');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '✓ 已保存';
        saveBtn.style.background = '#07C160';
        
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.background = '#007aff';
        }, 2000);
    });
}

// ========== 统一拖拽功能（组件和图标都可用） ==========
let dragTarget = null;
let dragOffset = { x: 0, y: 0 };
let isDragging = false;
let dragOriginalParent = null;
let dragOriginalIndex = -1;
let dragOriginalGridPos = { col: 1, row: 1 };
let dragPageSwitchTimer = null;
let dragTargetPage = 1;
let dragPlaceholder = null;
let currentDropIndex = -1;
let currentDropContainer = null;
let currentDropGridPos = { col: 0, row: 0 };

// 网格配置
const GRID_CONFIG = {
    edgeThreshold: 50,
    pageSwitchDelay: 300
};

function initWidgetDrag() {
    const homeScreen = document.getElementById('home-screen');
    const dock = document.getElementById('dock');
    
    // 鼠标事件
    homeScreen.addEventListener('mousedown', handleDragStart);
    dock.addEventListener('mousedown', handleDragStart);
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    
    // 触摸事件
    homeScreen.addEventListener('touchstart', handleDragStart, { passive: false });
    dock.addEventListener('touchstart', handleDragStart, { passive: false });
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
}

function handleDragStart(e) {
    if (!isEditing) return;
    
    const target = e.target.closest('.widget, .app-icon');
    if (!target) return;
    
    // 忽略特定元素
    if (e.target.closest('.widget-delete') || 
        e.target.closest('button') ||
        e.target.closest('input') ||
        e.target.closest('.switch') ||
        e.target.closest('.cute-item')) { // 排除可爱组件内部的气泡
        return;
    }
    
    e.preventDefault();
    
    dragTarget = target;
    dragTargetPage = currentPage;
    dragOriginalParent = target.parentElement;
    
    // 记录原始位置
    const siblings = Array.from(dragOriginalParent.children);
    dragOriginalIndex = siblings.indexOf(target);
    
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    const rect = target.getBoundingClientRect();
    
    // 图标拖拽时，让鼠标在图标中心
    if (target.classList.contains('app-icon')) {
        dragOffset.x = rect.width / 2;
        dragOffset.y = rect.height / 2;
    } else {
        // 组件拖拽时，鼠标在点击位置
        dragOffset.x = clientX - rect.left;
        dragOffset.y = clientY - rect.top;
    }
    isDragging = false;
    currentDropIndex = -1;
    currentDropContainer = null;
}

function handleDragMove(e) {
    if (!dragTarget || !isEditing) return;
    
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    
    if (!isDragging) {
        isDragging = true;
        
        // 记录原始grid位置
        dragOriginalGridPos = {
            col: parseInt(dragTarget.style.gridColumn) || 1,
            row: parseInt(dragTarget.style.gridRow) || 1
        };
        
        // 创建占位符
        dragPlaceholder = document.createElement('div');
        dragPlaceholder.className = 'drag-placeholder';
        
        if (dragTarget.classList.contains('app-icon')) {
            // 图标占位符 - 与图标相同大小，避免被grid拉伸
            dragPlaceholder.style.cssText = `
                width: 100%;
                height: 90px !important;
                min-height: 90px !important;
                max-height: 90px !important;
                align-self: start;
                justify-self: center;
                border-radius: 16px;
                background: rgba(0, 122, 255, 0.2);
                border: 2px dashed #007aff;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #007aff;
                font-size: 12px;
                animation: placeholderPulse 1s infinite;
                grid-column: span 1;
                pointer-events: none;
                opacity: 0;
            `;
        } else {
            // 组件占位符 - 让grid布局控制大小
            const isWide = dragTarget.id === 'time-weather-widget';
            const isPhoto = dragTarget.classList.contains('photo-widget') || 
                           dragTarget.id === 'photo-widget';
            const isTextBanner = dragTarget.classList.contains('text-banner');
            const isCute = dragTarget.classList.contains('cute-desktop-widget');
            const isSquarePhoto = dragTarget.classList.contains('square-photo-widget');
            
            dragPlaceholder.style.cssText = `
                border-radius: 16px;
                background: rgba(0, 122, 255, 0.2);
                border: 2px dashed #007aff;
                ${isWide ? 'grid-column: span 2;' : ''}
                ${isPhoto ? 'grid-column: span 2; grid-row: span 2;' : ''}
                ${isCute ? 'aspect-ratio: 1; grid-column: span 2; grid-row: span 2;' : ''}
                ${isSquarePhoto ? 'grid-column: span 1; grid-row: span 1;' : ''}
                animation: placeholderPulse 1s infinite;
                pointer-events: none;
                opacity: 0;
            `;
        }
        
        // 先隐藏原元素，再插入占位符
        dragTarget.style.visibility = 'hidden';
        dragOriginalParent.insertBefore(dragPlaceholder, dragTarget);
        
        // 设置拖拽样式
        dragTarget.classList.add('dragging');
        dragTarget.classList.remove('editing');
        
        // 根据拖拽类型设置尺寸
        if (dragTarget.classList.contains('app-icon')) {
            // 图标拖拽：固定为80x100px（与CSS一致）
            dragTarget.style.width = '80px';
            dragTarget.style.height = '100px';
        } else if (dragTarget.classList.contains('cute-desktop-widget')) {
            // 可爱组件拖拽：在app-grid中保持2x2正方形，计算实际渲染尺寸
            const container = dragOriginalParent;
            const containerRect = container.getBoundingClientRect();
            // 支持app-grid和app-grid-page2
            const cols = (container.id === 'app-grid' || container.id === 'app-grid-page2') ? 4 : 2;
            const gap = (container.id === 'app-grid' || container.id === 'app-grid-page2') ? 4 : 12;
            const cellWidth = (containerRect.width - gap * (cols - 1)) / cols;
            const widgetSize = cellWidth * 2 + gap; // 2列宽度
            dragTarget.style.width = widgetSize + 'px';
            dragTarget.style.height = widgetSize + 'px';
        } else if (dragTarget.classList.contains('photo-widget') || dragTarget.id === 'photo-widget') {
            // 照片组件拖拽：根据grid计算2列x2行的尺寸
            const container = dragOriginalParent;
            const containerRect = container.getBoundingClientRect();
            // 支持app-grid和app-grid-page2
            const cols = (container.id === 'app-grid' || container.id === 'app-grid-page2') ? 4 : 2;
            const gap = (container.id === 'app-grid' || container.id === 'app-grid-page2') ? 4 : 12;
            const rowGap = (container.id === 'app-grid' || container.id === 'app-grid-page2') ? 20 : 12;
            const cellWidth = (containerRect.width - gap * (cols - 1)) / cols;
            const photoWidth = cellWidth * 2 + gap; // 2列宽度
            const photoHeight = photoWidth; // 正方形
            dragTarget.style.width = photoWidth + 'px';
            dragTarget.style.height = photoHeight + 'px';
        } else if (dragTarget.classList.contains('text-banner')) {
            // 文字横条拖拽：使用offsetWidth获取真实渲染宽度（不含transform）
            dragTarget.style.width = dragTarget.offsetWidth + 'px';
            dragTarget.style.height = dragTarget.offsetHeight + 'px';
        } else if (dragTarget.classList.contains('note-widget') || dragTarget.id === 'note-widget') {
            // 便签拖拽：保持正方形比例
            const size = dragTarget.offsetWidth;
            dragTarget.style.width = size + 'px';
            dragTarget.style.height = size + 'px';
        } else if (dragTarget.classList.contains('square-photo-widget')) {
            // 方形照片组件拖拽：1x1网格，保持正方形
            const container = dragOriginalParent;
            const containerRect = container.getBoundingClientRect();
            // 支持widget-area和widget-area-page2
            const cols = (container.id === 'widget-area' || container.id === 'widget-area-page2') ? 4 : 2;
            const gap = 8;
            const cellWidth = (containerRect.width - gap * (cols - 1)) / cols;
            dragTarget.style.width = cellWidth + 'px';
            dragTarget.style.height = cellWidth + 'px';
        } else {
            // 其他组件拖拽：保持原始尺寸
            dragTarget.style.width = dragTarget.offsetWidth + 'px';
            dragTarget.style.height = dragTarget.offsetHeight + 'px';
        }
        
        dragTarget.style.position = 'fixed';
        dragTarget.style.zIndex = '10000';
        dragTarget.style.visibility = 'visible';
        dragTarget.style.margin = '0';
        dragTarget.style.gridArea = 'auto';
        
        document.body.appendChild(dragTarget);
    }
    
    // 更新位置
    dragTarget.style.left = (clientX - dragOffset.x) + 'px';
    dragTarget.style.top = (clientY - dragOffset.y) + 'px';
    
    // 边缘检测
    checkEdgeForPageSwitch(clientX);
    
    // 更新占位符位置
    updatePlaceholderPosition(clientX, clientY);
    
    // 只在拖拽时阻止默认行为
    if (isDragging) {
        e.preventDefault();
    }
}

// 计算网格位置并更新占位符
function updatePlaceholderPosition(clientX, clientY) {
    const dropResult = findDropContainer(clientX, clientY);
    const targetContainer = dropResult?.container;
    
    if (!targetContainer) return;
    
    // 如果容器变化，移动占位符到新容器
    if (currentDropContainer !== targetContainer) {
        if (dragPlaceholder.parentElement) {
            dragPlaceholder.parentElement.removeChild(dragPlaceholder);
        }
        targetContainer.appendChild(dragPlaceholder);
        currentDropContainer = targetContainer;
    }
    
    // 获取容器信息
    const containerRect = targetContainer.getBoundingClientRect();
    const isIcon = dragTarget.classList.contains('app-icon');
    const isPhoto = dragTarget.classList.contains('photo-widget');
    const isCute = dragTarget.classList.contains('cute-desktop-widget');
    
    // 根据容器动态计算列数
    let cols;
    if (targetContainer.id === 'app-grid' || targetContainer.id === 'app-grid-page2' || targetContainer.id === 'dock') {
        cols = 4; // app-grid、app-grid-page2和dock是4列
    } else {
        cols = 2; // widget-area是2列
    }
    
    // 根据容器类型设置间距
    const rowGap = (targetContainer.id === 'app-grid' || targetContainer.id === 'app-grid-page2') ? 20 : 12;
    const colGap = 4;
    
    // 计算网格尺寸
    const cellWidth = (containerRect.width - colGap * (cols - 1)) / cols;
    // 使用固定的行高（与CSS中的minmax(100px, auto)对应）
    const cellHeight = 100; // 每行最小100px
    
    // 计算鼠标相对于容器的位置
    const relX = clientX - containerRect.left;
    const relY = clientY - containerRect.top;
    
    // 计算目标列（基于位置）
    let targetCol = 0;
    for (let c = 0; c < cols; c++) {
        const colStart = c * (cellWidth + colGap);
        if (relX >= colStart && relX < colStart + cellWidth + colGap) {
            targetCol = c;
            break;
        }
    }
    targetCol = Math.max(0, Math.min(targetCol, cols - 1));
    
    // 计算目标行（基于位置）
    let targetRow = Math.floor(relY / (cellHeight + rowGap));
    targetRow = Math.max(0, targetRow);
    
    // 对于可爱组件，确保不会超出网格范围
    if (isCute) {
        // 可爱组件占2行，检查是否会超出
        const maxRow = 4; // 6行网格，最多到第4行（4+2=6）
        targetRow = Math.min(targetRow, maxRow);
    }
    
    // 使用grid-column和grid-row定位占位符
    const gridColumn = targetCol + 1; // CSS Grid从1开始
    const gridRow = targetRow + 1;
    
    // 检查是否与现有图标位置冲突
    const existingItems = targetContainer.querySelectorAll('.app-icon, .widget');
    let hasConflict = false;
    
    existingItems.forEach(item => {
        if (item === dragTarget || item === dragPlaceholder) return;
        const itemCol = parseInt(item.style.gridColumn) || 1;
        const itemRow = parseInt(item.style.gridRow) || 1;
        if (itemCol === gridColumn && itemRow === gridRow) {
            hasConflict = true;
        }
    });
    
    // 更新占位符的grid位置
    if (isCute) {
        // 可爱组件需要跨越2行
        dragPlaceholder.style.gridColumn = gridColumn + ' / span 2';
        dragPlaceholder.style.gridRow = gridRow + ' / span 2';
    } else {
        dragPlaceholder.style.gridColumn = gridColumn;
        dragPlaceholder.style.gridRow = gridRow;
    }
    
    // 记录当前位置
    currentDropIndex = targetRow * cols + targetCol;
    currentDropGridPos = { col: targetCol, row: targetRow };
}

function handleDragEnd(e) {
    if (dragPageSwitchTimer) {
        clearTimeout(dragPageSwitchTimer);
        dragPageSwitchTimer = null;
    }
    
    if (!dragTarget) return;
    
    // 获取放置位置
    const clientX = e.type.includes('mouse') ? e.clientX : e.changedTouches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.changedTouches[0].clientY;
    
    // 找到目标容器
    const dropResult = findDropContainer(clientX, clientY);
    const targetContainer = dropResult?.container || dragOriginalParent;
    
    // 清除拖拽样式
    dragTarget.classList.remove('dragging');
    dragTarget.classList.add('editing');
    
    // 清除拖拽相关的inline样式
    dragTarget.style.position = '';
    dragTarget.style.left = '';
    dragTarget.style.top = '';
    dragTarget.style.width = '';
    dragTarget.style.height = '';
    dragTarget.style.zIndex = '';
    dragTarget.style.margin = '';
    dragTarget.style.gridArea = '';
    
    // 移动到目标容器
    targetContainer.appendChild(dragTarget);
    
    // 设置grid位置
    if (currentDropGridPos) {
        const isPhoto = dragTarget.classList.contains('photo-widget') || dragTarget.id === 'photo-widget';
        const isNote = dragTarget.classList.contains('note-widget') || dragTarget.id === 'note-widget';
        const isCute = dragTarget.classList.contains('cute-desktop-widget');
        const isSquarePhoto = dragTarget.classList.contains('square-photo-widget');
        const isAppGrid = targetContainer.id === 'app-grid' || targetContainer.id === 'app-grid-page2';
        
        if (isCute && isAppGrid) {
            // 可爱组件在app-grid中占2列2行
            dragTarget.style.gridColumn = (currentDropGridPos.col + 1) + ' / span 2';
            dragTarget.style.gridRow = (currentDropGridPos.row + 1) + ' / span 2';
        } else if ((isPhoto || isNote || isSquarePhoto) && isAppGrid) {
            // 照片、便签和方形照片组件占2列2行
            dragTarget.style.gridColumn = (currentDropGridPos.col + 1) + ' / span 2';
            dragTarget.style.gridRow = (currentDropGridPos.row + 1) + ' / span 2';
        } else {
            // 普通图标占1格
            dragTarget.style.gridColumn = currentDropGridPos.col + 1;
            dragTarget.style.gridRow = currentDropGridPos.row + 1;
        }
    }
    
    // 触发重排，确保grid布局生效
    void targetContainer.offsetHeight;
    
    // 移除占位符
    if (dragPlaceholder && dragPlaceholder.parentElement) {
        dragPlaceholder.parentElement.removeChild(dragPlaceholder);
    }
    dragPlaceholder = null;
    
    // 重置状态
    dragTarget = null;
    isDragging = false;
    dragOriginalParent = null;
    dragOriginalIndex = -1;
    currentDropIndex = -1;
    currentDropContainer = null;
    currentDropGridPos = { col: 0, row: 0 };
    
    // 保存位置
    saveAllPositions();
}

// 边缘检测切换页面
let lastEdgeDirection = 0;

function checkEdgeForPageSwitch(clientX) {
    const { edgeThreshold, pageSwitchDelay } = GRID_CONFIG;
    const phoneContainer = document.getElementById('phone-container');
    if (!phoneContainer) return;
    
    const phoneRect = phoneContainer.getBoundingClientRect();
    const leftEdge = phoneRect.left + edgeThreshold;
    const rightEdge = phoneRect.right - edgeThreshold;
    
    let currentEdgeDirection = 0;
    
    if (clientX < leftEdge && currentPage > 1) {
        currentEdgeDirection = 1;
    } else if (clientX > rightEdge && currentPage < 2) {
        currentEdgeDirection = 2;
    }
    
    if (currentEdgeDirection !== lastEdgeDirection) {
        if (dragPageSwitchTimer) {
            clearTimeout(dragPageSwitchTimer);
            dragPageSwitchTimer = null;
        }
        
        lastEdgeDirection = currentEdgeDirection;
        
        if (currentEdgeDirection === 1) {
            dragPageSwitchTimer = setTimeout(() => {
                switchToPage(currentPage - 1);
                dragTargetPage = currentPage;
                lastEdgeDirection = 0;
            }, pageSwitchDelay);
        } else if (currentEdgeDirection === 2) {
            dragPageSwitchTimer = setTimeout(() => {
                switchToPage(currentPage + 1);
                dragTargetPage = currentPage;
                lastEdgeDirection = 0;
            }, pageSwitchDelay);
        }
    }
}

// 找到放置容器
function findDropContainer(clientX, clientY) {
    const targetPageNum = dragTargetPage;
    const targetPage = document.getElementById(`page-${targetPageNum}`);
    if (!targetPage) return null;
    
    let targetContainer;
    if (dragTarget.classList.contains('widget')) {
        // 照片组件、文字横条、便签和方形照片组件可以放入app-grid，其他组件放入widget-area
        if (dragTarget.classList.contains('photo-widget') || 
            dragTarget.classList.contains('text-banner') || 
            dragTarget.classList.contains('note-widget') || 
            dragTarget.id === 'note-widget' ||
            dragTarget.classList.contains('square-photo-widget')) {
            targetContainer = targetPage.querySelector('#app-grid');
        } else {
            targetContainer = targetPage.querySelector('#widget-area, #widget-area-page2');
        }
    } else if (dragTarget.classList.contains('app-icon')) {
        const dock = document.getElementById('dock');
        const dockRect = dock ? dock.getBoundingClientRect() : null;
        
        if (dockRect && clientY > dockRect.top && clientY < dockRect.bottom) {
            targetContainer = dock;
        } else {
            // 软件图标也可以放到组件区
            // 检查是否是第二页
            if (targetPageNum === 2) {
                targetContainer = targetPage.querySelector('#app-grid-page2');
            } else {
                targetContainer = targetPage.querySelector('#app-grid');
            }
        }
    }
    
    return { container: targetContainer, pageNum: targetPageNum };
}

// 删除旧的handleDragEnd函数
function handleItemDragEnd(e) {
    handleDragEnd(e);
}

function moveDragTargetToCurrentPage() {
    // 由 handleDragEnd 处理
}

// 保存动态创建的组件（用于页面刷新后恢复）
// 保存所有位置
// ========== 组件持久化系统 ==========
// 保存所有组件创建信息（统一版本）
function saveAllWidgets() {
    const widgets = [];
    
    // 预置组件ID列表（这些不应该被保存为动态创建的组件）
    const presetWidgetIds = ['polaroidWidget', 'dialogBubble-page2', 'koreanSearch'];
    
    document.querySelectorAll('.widget').forEach(widget => {
        const widgetId = widget.getAttribute('data-widget-id');
        let widgetType = widget.getAttribute('data-widget-type');
        
        // 跳过预置组件（HTML中已存在的）
        if (presetWidgetIds.includes(widgetId)) {
            return;
        }
        
        // 跳过模板元素
        if (widgetId && widgetId.includes('-template')) {
            return;
        }
        
        // 如果没有data-widget-type，根据ID推断
        if (!widgetType) {
            if (widgetId === 'polaroidWidget' || widgetId.includes('polaroidWidget')) {
                widgetType = 'polaroidWidget';
            } else if (widgetId === 'dialogBubble-page2' || widgetId.includes('dialogBubble')) {
                widgetType = 'dialogBubble';
            } else if (widget.classList.contains('cute-desktop-widget')) {
                widgetType = 'cuteDesktopWidget';
            }
        }
        
        // 只保存动态创建的组件（有类型的）
        if (widgetType) {
            widgets.push({
                id: widgetId,
                type: widgetType,
                page: widget.closest('.desktop-page')?.id || 'page-1',
                containerId: widget.parentElement?.id || ''
            });
        }
    });
    
    localStorage.setItem('createdWidgets', JSON.stringify(widgets));
    console.log('组件信息已保存:', widgets);
}

// 添加单个组件时调用
function saveWidgetCreationData(type, widgetId, page) {
    const widgets = JSON.parse(localStorage.getItem('createdWidgets') || '[]');
    
    // 检查是否已存在
    const existingIndex = widgets.findIndex(w => w.id === widgetId);
    if (existingIndex >= 0) {
        widgets[existingIndex] = { id: widgetId, type, page, containerId: widgets[existingIndex].containerId || '' };
    } else {
        widgets.push({ id: widgetId, type, page, containerId: '' });
    }
    
    localStorage.setItem('createdWidgets', JSON.stringify(widgets));
}

// 删除组件创建信息
function removeWidgetCreationData(widgetId) {
    let widgets = JSON.parse(localStorage.getItem('createdWidgets') || '[]');
    widgets = widgets.filter(w => w.id !== widgetId);
    localStorage.setItem('createdWidgets', JSON.stringify(widgets));
}

// 恢复所有动态创建的组件
function restoreCreatedWidgets() {
    const widgets = JSON.parse(localStorage.getItem('createdWidgets') || '[]');
    
    if (widgets.length === 0) {
        console.log('没有动态创建的组件需要恢复');
        return;
    }
    
    console.log('恢复动态组件:', widgets);
    
    widgets.forEach(widgetData => {
        // 木箱收藏箱组件从 HTML 加载（仅当页面上不存在时）
        if (widgetData.type === 'collectionChest') {
            const existingWidget = document.querySelector(`[data-widget-id="${widgetData.id}"]`);
            if (existingWidget) {
                console.log('木箱收藏箱组件已存在，跳过恢复:', widgetData.id);
                return;
            }
            console.log('木箱收藏箱组件不在页面中，跳过恢复');
            return;
        }
        
        // 拍立得组件从HTML模板恢复（仅当页面上不存在时）
        if (widgetData.type === 'polaroidWidget') {
            // 检查是否已经存在
            const existingWidget = document.querySelector(`[data-widget-id="${widgetData.id}"]`);
            if (existingWidget) {
                console.log('拍立得组件已存在，跳过恢复:', widgetData.id);
                return;
            }
            
            const template = document.getElementById('polaroidWidget-template');
            if (!template) {
                console.error('找不到拍立得模板');
                return;
            }
            
            const newWidget = template.cloneNode(true);
            newWidget.id = widgetData.id;
            newWidget.setAttribute('data-widget-id', widgetData.id);
            newWidget.setAttribute('data-widget-type', widgetData.type);
            newWidget.style.display = '';
            
            // 添加到widget-area
            let targetArea = document.getElementById(widgetData.page === 'page-2' ? 'widget-area-page2' : 'widget-area');
            if (targetArea) {
                targetArea.appendChild(newWidget);
            }
            return;
        }
        
        // 对话气泡组件是预置的，只需要确保它显示
        if (widgetData.type === 'dialogBubble' || widgetData.id === 'dialogBubble-page2') {
            const widget = document.querySelector('[data-widget-id="dialogBubble-page2"]');
            if (widget) {
                // 只有当用户没有主动隐藏时才显示
                if (localStorage.getItem('hideDialogBubble') !== 'true') {
                    widget.style.display = '';
                } else {
                    widget.style.display = 'none';
                }
                // 设置data-widget-type
                widget.setAttribute('data-widget-type', 'dialogBubble');
            }
            console.log('处理预置组件:', widgetData.id);
            return;
        }
        
        // 韩系搜索栏是预置的，不需要恢复（已经在app-grid中）
        if (widgetData.type === 'koreanSearch' || widgetData.id === 'koreanSearch') {
            console.log('跳过韩系搜索栏恢复（已在app-grid中）:', widgetData.id);
            // 清理localStorage中的旧数据
            removeWidgetCreationData(widgetData.id);
            return;
        }
        
        // 其他组件使用widgetTemplates
        const template = widgetTemplates[widgetData.type];
        if (!template) {
            console.error('找不到模板:', widgetData.type);
            return;
        }
        
        // 确定目标容器
        let targetArea;
        if (widgetData.type === 'photo') {
            // 照片组件放到app-grid
            const pageContainer = document.getElementById(widgetData.page);
            targetArea = pageContainer ? pageContainer.querySelector('#app-grid') : null;
        } else {
            // 其他组件（包括便签）放到widget-area
            targetArea = document.getElementById(widgetData.page === 'page-2' ? 'widget-area-page2' : 'widget-area');
        }
        
        if (!targetArea) return;
        
        // 创建组件
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = template.html;
        const newWidget = tempDiv.firstElementChild;
        
        // 设置ID和属性
        newWidget.id = widgetData.id;  // 元素ID使用完整ID
        newWidget.setAttribute('data-widget-id', widgetData.id);  // data-widget-id也使用完整ID
        newWidget.setAttribute('data-widget-type', widgetData.type);  // data-widget-type存储组件类型
        
        // 更新删除按钮
        const deleteBtn = newWidget.querySelector('.widget-delete');
        if (deleteBtn) {
            deleteBtn.setAttribute('onclick', `deleteWidget('${widgetData.id}')`);
        }
        
        // 如果是编辑模式，添加editing类
        if (isEditing) {
            newWidget.classList.add('editing');
        }
        
        targetArea.appendChild(newWidget);
        
        // 初始化组件功能
        if (template.init) {
            setTimeout(() => template.init(widgetData.id), 100);
        }
    });
}

// 保存所有位置和组件信息
function saveAllPositions() {
    const positions = {};
    
    // 保存组件位置
    document.querySelectorAll('.widget').forEach(widget => {
        const id = widget.id || widget.getAttribute('data-widget-id');
        const container = widget.parentElement;
        const containerId = container?.id || '';
        const page = widget.closest('.desktop-page')?.id || 'page-1';
        const widgetType = widget.getAttribute('data-widget-type') || '';
        
        // 获取gridColumn和gridRow，保存完整的值
        let gridColumn = widget.style.gridColumn || '';
        let gridRow = widget.style.gridRow || '';
        
        // 如果是可爱对话、拍立得或对话气泡组件，确保保存span 4
        if (widget.classList.contains('cute-dialog-widget') || widget.classList.contains('polaroid-widget')) {
            if (!gridColumn || !gridColumn.includes('span 4')) {
                gridColumn = 'span 4';
            }
            if (!gridRow || !gridRow.includes('span 1')) {
                gridRow = 'span 1';
            }
        }
        
        // 如果是可爱桌面组件，确保保存span 2
        if (widget.classList.contains('cute-desktop-widget')) {
            if (!gridColumn.includes('span')) {
                gridColumn = (gridColumn || '1') + ' / span 2';
            }
            if (!gridRow.includes('span')) {
                gridRow = (gridRow || '1') + ' / span 2';
            }
        }
        
        // 如果是方形照片组件，确保保存span 2
        if (widget.classList.contains('square-photo-widget')) {
            if (!gridColumn || !gridColumn.includes('span 2')) {
                gridColumn = 'span 2';
            }
            if (!gridRow || !gridRow.includes('span 2')) {
                gridRow = 'span 2';
            }
        }
        
        positions[`widget-${id}`] = {
            containerId: containerId,
            page: page,
            gridColumn: gridColumn,
            gridRow: gridRow,
            widgetType: widgetType
        };
    });
    
    // 保存图标位置
    document.querySelectorAll('.app-icon').forEach(icon => {
        const id = icon.getAttribute('data-app-id');
        const container = icon.parentElement;
        const containerId = container?.id || '';
        const page = icon.closest('.desktop-page')?.id || 'page-1';
        
        positions[`icon-${id}`] = {
            containerId: containerId,
            page: page,
            gridColumn: icon.style.gridColumn || '',
            gridRow: icon.style.gridRow || ''
        };
    });
    
    localStorage.setItem('itemPositions', JSON.stringify(positions));
    
    // 同时保存动态创建的组件信息
    saveAllWidgets();
    
    console.log('布局已保存');
}

// 加载所有位置
function loadAllPositions() {
    // 清除旧的音乐应用位置数据（强制从HTML加载）
    clearMusicAppPosition();
    
    // 清除旧的布局缓存
    localStorage.removeItem('itemPositions');
    console.log('🗑️ 已清除旧的itemPositions缓存');
    
    // 先恢复动态创建的组件
    restoreCreatedWidgets();
    
    // 始终应用默认布局（忽略localStorage中的旧数据）
    console.log('🔄 应用默认布局');
    initDefaultLayout();
    
    // 确保木箱收藏箱组件显示
    const collectionChest = document.getElementById('collection-chest');
    if (collectionChest) {
        collectionChest.style.display = 'block';
        console.log('✅ 木箱收藏箱组件已确保显示');
    }
}

// 清除音乐应用的旧位置数据（让它从HTML中重新加载）
function clearMusicAppPosition() {
    try {
        const positions = JSON.parse(localStorage.getItem('itemPositions') || '{}');
        // 删除icon-music的位置数据
        if (positions['icon-music']) {
            delete positions['icon-music'];
            localStorage.setItem('itemPositions', JSON.stringify(positions));
            console.log('已清除一起听应用的旧位置数据');
        }
    } catch (e) {
        console.error('清除音乐应用位置数据失败:', e);
    }
}

// 初始化默认布局（硬编码当前布局）
function initDefaultLayout() {
    console.log('🔄 初始化默认布局（硬编码）');
    
    // ===== 第 1 页 =====
    const page1 = document.getElementById('page-1');
    if (page1) {
        // 第 1 页组件位置（widget-area是4列网格）
        const widgetArea = document.getElementById('widget-area');
        if (widgetArea) {
            // 时间天气组件：第1行横跨4列
            const timeWidget = document.getElementById('time-weather-widget');
            if (timeWidget) {
                timeWidget.style.gridColumn = '1 / 5';
                timeWidget.style.gridRow = '1';
            }
            // 方形照片组件：第2行左侧(1-2列)，聊天图标左边空白处
            const squarePhoto = document.getElementById('squarePhoto');
            if (squarePhoto) {
                squarePhoto.style.gridColumn = '1 / 3';
                squarePhoto.style.gridRow = '2';
            }
            
            // 移除之前错误创建的图标组容器
            const iconGroup = document.getElementById('squarePhotoIcons');
            if (iconGroup) {
                const appGrid = document.getElementById('app-grid');
                if (appGrid) {
                    const icons = iconGroup.querySelectorAll('[data-app-id]');
                    icons.forEach(icon => {
                        appGrid.appendChild(icon);
                    });
                }
                iconGroup.remove();
            }
            
            // 将所有图标移到widget-area（除了商城）
            const iconIds = ['forum', 'device-check', 'together', 'chat', 'couple', 'memory', 'diary'];
            const appGridForIcons = document.getElementById('app-grid');
            if (appGridForIcons) {
                iconIds.forEach(id => {
                    const icon = appGridForIcons.querySelector(`[data-app-id="${id}"]`);
                    if (icon) {
                        widgetArea.appendChild(icon);
                    }
                });
                
                // 商城移到第二页
                const shopIcon = appGridForIcons.querySelector('[data-app-id="shop"]');
                if (shopIcon) {
                    const appGrid2 = document.getElementById('app-grid-page2');
                    if (appGrid2) {
                        appGrid2.appendChild(shopIcon);
                    }
                }
            }
        }
        
        // 第 1 页所有图标位置（都在widget-area 4列网格中）
        const widgetAreaIcons = document.getElementById('widget-area');
        if (widgetAreaIcons) {
            const allIconPositions = {
                'forum': { col: 1, row: 4 },
                'device-check': { col: 2, row: 4 },
                'chat': { col: 3, row: 2 },
                'couple': { col: 4, row: 2 },
                'together': { col: 2, row: 5 },
                'memory': { col: 3, row: 3 },
                'diary': { col: 4, row: 3 },
            };
            
            Object.entries(allIconPositions).forEach(([appId, pos]) => {
                const icon = widgetAreaIcons.querySelector(`[data-app-id="${appId}"]`);
                if (icon) {
                    icon.style.gridColumn = pos.col;
                    icon.style.gridRow = pos.row;
                    // 记忆和日记往上移，靠近聊天和情侣空间
                    if (appId === 'memory' || appId === 'diary') {
                        icon.style.transform = 'translateY(-65px)';
                    }
                    // 论坛和查岗往上移
                    if (appId === 'forum' || appId === 'device-check') {
                        icon.style.transform = 'translateY(-60px)';
                    }
                }
            });
        }
    }
    
    // ===== 第 2 页 =====
    const page2 = document.getElementById('page-2');
    if (page2) {
        const widgetArea2 = document.getElementById('widget-area-page2');
        if (widgetArea2) {
            // 拍立得组件：span 4
            const polaroid = document.getElementById('polaroidWidget');
            if (polaroid) {
                polaroid.style.gridColumn = 'span 4';
                polaroid.style.gridRow = 'span 1';
            }
            // 文字气泡组件：span 4
            const dialogBubble = document.getElementById('dialogBubble-page2');
            if (dialogBubble) {
                dialogBubble.style.gridColumn = 'span 4';
                dialogBubble.style.gridRow = 'span 1';
            }
            // 木箱收藏箱组件（放在图标下方）
            const collectionChest = document.getElementById('collection-chest');
            if (collectionChest) {
                collectionChest.style.display = 'block';
                console.log('木箱收藏箱组件已初始化');
            }
        }
        
        // 第 2 页图标 - 根据图3布局
        const appGrid2 = document.getElementById('app-grid-page2');
        if (appGrid2) {
            // 第2页布局：4列x3行（图3）
            const iconPositions2 = {
                'together': { col: 1, row: 1 },    // 一起做
                'game': { col: 2, row: 1 },        // 游戏
                'shop': { col: 3, row: 1 },        // 商城
                'ifline': { col: 4, row: 1 },      // IF线
                'memory': { col: 2, row: 2 },      // 记忆
                'settings': { col: 3, row: 2 },    // 设置
                'worldbook': { col: 4, row: 2 },   // 世界书
                'beautify': { col: 1, row: 3 },    // 美化
                'forum': { col: 2, row: 3 },       // 论坛
                'video': { col: 3, row: 3 },       // 视频
                'music': { col: 4, row: 3 },       // 音乐
            };
            
            Object.entries(iconPositions2).forEach(([appId, pos]) => {
                const icon = appGrid2.querySelector(`[data-app-id="${appId}"]`);
                if (icon) {
                    icon.style.gridColumn = pos.col;
                    icon.style.gridRow = pos.row;
                }
            });
        }
    }
    
    // 初始化可爱小组件
    const cuteWidgetArea = document.getElementById('widget-area');
    if (cuteWidgetArea) {
        const cuteWidget = cuteWidgetArea.querySelector('.cute-desktop-widget');
        if (cuteWidget) {
            cuteWidget.style.gridColumn = 'span 2';
            cuteWidget.style.gridRow = 'span 1';
        }
    }
    initCuteWidget();
    
    // 布局完成后显示图标，防止闪烁
    requestAnimationFrame(() => {
        document.querySelectorAll('.app-icon').forEach(icon => {
            icon.classList.add('layout-ready');
        });
    });
}

// 初始化可爱桌面小组件
function initCuteWidget() {
    const cuteSymbols = [
        '♡··♡',
        '‧̩̥̥̩* ·̥̥̩',
        '･ﾟ: *',
        '·★·',
        '✧··✧',
        '♢··♢',
        '·❀·',
        '✿··',
        '✿··',
        '♡··♡',
        '✿··',
        '✿··',
        '··✿',
        '♡··♡',
        '·◡·✧',
    ];
    
    const cuteEmojis = ['☕️', '🍰', '🧁', '🍪', '🥐', '', '', ''];
    
    // 随机选择符号
    const symbolItems = document.querySelectorAll('.cute-desktop-widget .cute-symbol .symbol-text');
    symbolItems.forEach(item => {
        const randomSymbol = cuteSymbols[Math.floor(Math.random() * cuteSymbols.length)];
        item.textContent = randomSymbol;
    });
    
    // 随机选择emoji（作为图片的后备）
    const placeholderItems = document.querySelectorAll('.cute-desktop-widget .image-placeholder');
    placeholderItems.forEach(item => {
        const randomEmoji = cuteEmojis[Math.floor(Math.random() * cuteEmojis.length)];
        item.textContent = randomEmoji;
        item.style.display = 'block';
    });
    
    // 不显示图片,只保留提示文字
    const imageItems = document.querySelectorAll('.cute-desktop-widget .cute-image img');
    imageItems.forEach(img => {
        img.style.display = 'none';
    });
    
    // 显示图片占位符提示
    const imagePlaceholders = document.querySelectorAll('.cute-desktop-widget .cute-image .image-placeholder');
    imagePlaceholders.forEach(placeholder => {
        placeholder.textContent = '点击可编辑图片';
        placeholder.style.display = 'block';
    });
    
    console.log('✅ 可爱桌面小组件已初始化');
    
    // 添加可编辑功能
    initCuteWidgetEdit();
}

// 初始化可编辑功能
function initCuteWidgetEdit() {
    console.log('✅ 可爱组件已就绪（单击即可编辑）');
}

// 点击文本 - 直接进入编辑模式
function handleTextClick(element) {
    console.log('👆 点击颜文字气泡');
    const textElement = element.querySelector('.symbol-text');
    if (!textElement) return;
    
    // 如果已经在编辑，不做任何事
    if (textElement.isContentEditable) return;
    
    // 启用编辑
    textElement.contentEditable = 'true';
    textElement.style.cursor = 'text';
    textElement.style.outline = '2px solid #FFB6C1';
    textElement.style.background = 'rgba(255, 255, 255, 0.95)';
    textElement.focus();
    
    // 选中文本
    setTimeout(() => {
        const range = document.createRange();
        range.selectNodeContents(textElement);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }, 10);
    
    // 失去焦点时保存
    textElement.onblur = function() {
        textElement.contentEditable = 'false';
        textElement.style.cursor = '';
        textElement.style.outline = '';
        textElement.style.background = '';
        saveCuteWidgetData();
        console.log('💾 保存:', textElement.textContent);
    };
    
    // 按Enter保存
    textElement.onkeydown = function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            textElement.blur();
        }
    };
}

// 点击图片 - 弹出选择框
function handleImageClick(element) {
    console.log(' 点击图片', element);
    console.log('classList:', element.classList);
    
    // 如果是虚线头像，设置背景图片
    if (element.classList.contains('new-avatar-dashed')) {
        console.log('🎯 点击了虚线头像');
        editDashedAvatar(element);
        return;
    }
    
    // 如果是普通头像，正常编辑
    if (element.classList.contains('new-avatar-right')) {
        console.log(' 点击了右侧头像');
        editTimeWidgetAvatar(element);
        return;
    }
    
    // 其他图片组件
    console.log('🎯 点击了其他图片');
    editImage(element);
}

// 编辑时间组件头像
function editTimeWidgetAvatar(avatarElement) {
    console.log('编辑时间组件头像');
    
    const modal = document.createElement('div');
    modal.className = 'cute-image-modal';
    modal.innerHTML = `
        <div class="cute-modal-overlay"></div>
        <div class="cute-modal-content" style="width: 320px; padding: 24px;">
            <div class="cute-modal-title" style="margin-bottom: 20px; text-align: center;">选择图片来源</div>
            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
                <div class="cute-modal-btn" id="btn-upload" style="
                    width: 100%;
                    padding: 16px;
                    background: #f5f5f5;
                    border-radius: 12px;
                    cursor: pointer;
                    text-align: center;
                    font-size: 16px;
                    color: #333;
                    font-weight: 500;
                    transition: all 0.2s ease;
                ">本地相册</div>
                <div class="cute-modal-btn" id="btn-url" style="
                    width: 100%;
                    padding: 16px;
                    background: #f5f5f5;
                    border-radius: 12px;
                    cursor: pointer;
                    text-align: center;
                    font-size: 16px;
                    color: #333;
                    font-weight: 500;
                    transition: all 0.2s ease;
                ">图片链接</div>
            </div>
            <button class="cute-modal-close" id="btn-close" style="
                width: 100%;
                padding: 14px;
                background: transparent;
                border: none;
                color: #999;
                font-size: 16px;
                cursor: pointer;
            ">取消</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const hoverStyle = document.createElement('style');
    hoverStyle.textContent = `
        #btn-upload:hover {
            background: #e8e8e8 !important;
        }
        #btn-url:hover {
            background: #e8e8e8 !important;
        }
        #btn-close:hover {
            background: #f5f5f5 !important;
        }
    `;
    document.head.appendChild(hoverStyle);
    
    const closeModal = () => {
        modal.remove();
    };
    
    modal.querySelector('#btn-close').onclick = closeModal;
    modal.querySelector('.cute-modal-overlay').onclick = closeModal;
    
    modal.querySelector('#btn-upload').onclick = function() {
        closeModal();
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const img = avatarElement.querySelector('img');
                    if (img) {
                        img.src = event.target.result;
                    }
                };
                reader.readAsDataURL(file);
            }
            document.body.removeChild(input);
        };
        
        document.body.appendChild(input);
        input.click();
    };
    
    modal.querySelector('#btn-url').onclick = function() {
        closeModal();
        
        const urlModal = document.createElement('div');
        urlModal.className = 'cute-image-modal';
        urlModal.innerHTML = `
            <div class="cute-modal-overlay"></div>
            <div class="cute-modal-content" style="width: 320px; padding: 24px;">
                <div class="cute-modal-title" style="margin-bottom: 20px;">输入图片链接</div>
                <input type="text" class="cute-url-input" placeholder="https://example.com/photo.jpg" style="
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 14px;
                    margin-bottom: 16px;
                    outline: none;
                " />
                <div style="display: flex; gap: 8px;">
                    <button id="btn-cancel" style="
                        flex: 1;
                        padding: 12px;
                        background: #f5f5f5;
                        border: none;
                        border-radius: 8px;
                        font-size: 15px;
                        color: #666;
                        cursor: pointer;
                    ">取消</button>
                    <button id="btn-confirm" style="
                        flex: 1;
                        padding: 12px;
                        background: #007aff;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 15px;
                        cursor: pointer;
                    ">确认</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(urlModal);
        
        urlModal.querySelector('#btn-cancel').onclick = () => urlModal.remove();
        urlModal.querySelector('.cute-modal-overlay').onclick = () => urlModal.remove();
        
        urlModal.querySelector('#btn-confirm').onclick = function() {
            const url = urlModal.querySelector('.cute-url-input').value.trim();
            if (url) {
                const img = avatarElement.querySelector('img');
                if (img) {
                    img.src = url;
                }
            }
            urlModal.remove();
        };
        
        setTimeout(() => {
            urlModal.querySelector('.cute-url-input').focus();
        }, 100);
    };
}

// 编辑虚线头像
function editDashedAvatar(dashedElement) {
    console.log('编辑虚线头像');
    
    const modal = document.createElement('div');
    modal.className = 'cute-image-modal';
    modal.innerHTML = `
        <div class="cute-modal-overlay"></div>
        <div class="cute-modal-content" style="width: 320px; padding: 24px;">
            <div class="cute-modal-title" style="margin-bottom: 20px; text-align: center;">选择图片来源</div>
            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
                <div class="cute-modal-btn" id="btn-upload" style="
                    width: 100%;
                    padding: 16px;
                    background: #f5f5f5;
                    border-radius: 12px;
                    cursor: pointer;
                    text-align: center;
                    font-size: 16px;
                    color: #333;
                    font-weight: 500;
                    transition: all 0.2s ease;
                ">本地相册</div>
                <div class="cute-modal-btn" id="btn-url" style="
                    width: 100%;
                    padding: 16px;
                    background: #f5f5f5;
                    border-radius: 12px;
                    cursor: pointer;
                    text-align: center;
                    font-size: 16px;
                    color: #333;
                    font-weight: 500;
                    transition: all 0.2s ease;
                ">图片链接</div>
            </div>
            <button class="cute-modal-close" id="btn-close" style="
                width: 100%;
                padding: 14px;
                background: transparent;
                border: none;
                color: #999;
                font-size: 16px;
                cursor: pointer;
            ">取消</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const hoverStyle = document.createElement('style');
    hoverStyle.textContent = `
        #btn-upload:hover {
            background: #e8e8e8 !important;
        }
        #btn-url:hover {
            background: #e8e8e8 !important;
        }
        #btn-close:hover {
            background: #f5f5f5 !important;
        }
    `;
    document.head.appendChild(hoverStyle);
    
    const closeModal = () => {
        modal.remove();
    };
    
    modal.querySelector('#btn-close').onclick = closeModal;
    modal.querySelector('.cute-modal-overlay').onclick = closeModal;
    
    modal.querySelector('#btn-upload').onclick = function() {
        closeModal();
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    dashedElement.style.backgroundImage = `url(${event.target.result})`;
                };
                reader.readAsDataURL(file);
            }
            document.body.removeChild(input);
        };
        
        document.body.appendChild(input);
        input.click();
    };
    
    modal.querySelector('#btn-url').onclick = function() {
        closeModal();
        
        const urlModal = document.createElement('div');
        urlModal.className = 'cute-image-modal';
        urlModal.innerHTML = `
            <div class="cute-modal-overlay"></div>
            <div class="cute-modal-content" style="width: 320px; padding: 24px;">
                <div class="cute-modal-title" style="margin-bottom: 20px;">输入图片链接</div>
                <input type="text" class="cute-url-input" placeholder="https://example.com/photo.jpg" style="
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 14px;
                    margin-bottom: 16px;
                    outline: none;
                " />
                <div style="display: flex; gap: 8px;">
                    <button id="btn-cancel" style="
                        flex: 1;
                        padding: 12px;
                        background: #f5f5f5;
                        border: none;
                        border-radius: 8px;
                        font-size: 15px;
                        color: #666;
                        cursor: pointer;
                    ">取消</button>
                    <button id="btn-confirm" style="
                        flex: 1;
                        padding: 12px;
                        background: #007aff;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 15px;
                        cursor: pointer;
                    ">确认</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(urlModal);
        
        urlModal.querySelector('#btn-cancel').onclick = () => urlModal.remove();
        urlModal.querySelector('.cute-modal-overlay').onclick = () => urlModal.remove();
        
        urlModal.querySelector('#btn-confirm').onclick = function() {
            const url = urlModal.querySelector('.cute-url-input').value.trim();
            if (url) {
                dashedElement.style.backgroundImage = `url(${url})`;
            }
            urlModal.remove();
        };
        
        setTimeout(() => {
            urlModal.querySelector('.cute-url-input').focus();
        }, 100);
    };
}

// 初始化设置页面
// 打开商城弹窗
function openShopModal() {
    const modal = document.getElementById('shop-modal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// 关闭商城弹窗
function closeShopModal() {
    const modal = document.getElementById('shop-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// 将函数暴露到全局，供iframe调用
window.openShopModal = openShopModal;
window.closeShopModal = closeShopModal;

function initSettings() {
    console.log('初始化设置页面');
    
    // 温度滑块事件
    const temperatureSlider = document.getElementById('temperature-slider');
    const temperatureValue = document.getElementById('temperature-value');
    
    if (temperatureSlider && temperatureValue) {
        // 更新显示的温度值
        temperatureSlider.addEventListener('input', function() {
            const value = parseFloat(this.value).toFixed(1);
            temperatureValue.textContent = value;
            globalApiConfig.temperature = parseFloat(this.value);
            console.log('温度更新:', value);
        });
        
        // 从localStorage加载温度值
        const savedTemp = localStorage.getItem('api-temperature');
        if (savedTemp !== null) {
            const tempValue = parseFloat(savedTemp);
            temperatureSlider.value = tempValue;
            temperatureValue.textContent = tempValue.toFixed(1);
            globalApiConfig.temperature = tempValue;
        }
        
        // 保存温度值
        temperatureSlider.addEventListener('change', function() {
            localStorage.setItem('api-temperature', this.value);
        });
    }
}

// 编辑可爱对话组件的头像
function editDialogAvatar(avatarElement) {
    console.log('编辑对话组件头像');
    
    // 创建手机风格弹窗
    const modal = document.createElement('div');
    modal.className = 'cute-image-modal';
    modal.innerHTML = `
        <div class="cute-modal-overlay"></div>
        <div class="cute-modal-content" style="width: 320px; padding: 24px;">
            <div class="cute-modal-title" style="margin-bottom: 20px; text-align: center;">选择头像来源</div>
            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
                <div class="cute-modal-btn" id="btn-upload" style="
                    width: 100%;
                    padding: 16px;
                    background: #f5f5f5;
                    border-radius: 12px;
                    cursor: pointer;
                    text-align: center;
                    font-size: 16px;
                    color: #333;
                    font-weight: 500;
                    transition: all 0.2s ease;
                ">本地相册</div>
                <div class="cute-modal-btn" id="btn-url" style="
                    width: 100%;
                    padding: 16px;
                    background: #f5f5f5;
                    border-radius: 12px;
                    cursor: pointer;
                    text-align: center;
                    font-size: 16px;
                    color: #333;
                    font-weight: 500;
                    transition: all 0.2s ease;
                ">图片链接</div>
            </div>
            <button class="cute-modal-close" id="btn-close" style="
                width: 100%;
                padding: 14px;
                background: transparent;
                border: none;
                color: #999;
                font-size: 16px;
                cursor: pointer;
            ">取消</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加按钮悬停效果
    const hoverStyle = document.createElement('style');
    hoverStyle.textContent = `
        #btn-upload:hover {
            background: #e8e8e8 !important;
        }
        #btn-url:hover {
            background: #e8e8e8 !important;
        }
        #btn-close:hover {
            background: #f5f5f5 !important;
        }
    `;
    document.head.appendChild(hoverStyle);
    
    // 关闭弹窗
    const closeModal = () => {
        modal.classList.add('modal-closing');
        setTimeout(() => modal.remove(), 300);
    };
    
    modal.querySelector('.cute-modal-overlay').onclick = closeModal;
    modal.querySelector('#btn-close').onclick = closeModal;
    
    // 本地上传
    modal.querySelector('#btn-upload').onclick = function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const img = avatarElement.querySelector('img');
                    if (img) {
                        img.src = event.target.result;
                    }
                };
                reader.readAsDataURL(file);
            }
            document.body.removeChild(input);
            closeModal();
        };
        
        document.body.appendChild(input);
        input.click();
    };
    
    // URL链接
    modal.querySelector('#btn-url').onclick = function() {
        // 创建URL输入弹窗
        const urlModal = document.createElement('div');
        urlModal.className = 'cute-image-modal';
        urlModal.innerHTML = `
            <div class="cute-modal-overlay"></div>
            <div class="cute-modal-content">
                <div class="cute-modal-title">输入头像链接</div>
                <input type="text" class="cute-url-input" placeholder="https://example.com/avatar.jpg" />
                <div class="cute-modal-options">
                    <button class="cute-modal-btn" id="btn-confirm">确认</button>
                    <button class="cute-modal-btn" id="btn-cancel">取消</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(urlModal);
        
        const urlInput = urlModal.querySelector('.cute-url-input');
        urlInput.focus();
        
        // 确认按钮
        urlModal.querySelector('#btn-confirm').onclick = function() {
            const url = urlInput.value.trim();
            if (url) {
                const img = avatarElement.querySelector('img');
                if (img) {
                    img.src = url;
                }
            }
            urlModal.classList.add('modal-closing');
            setTimeout(() => urlModal.remove(), 300);
            closeModal();
        };
        
        // 取消按钮
        urlModal.querySelector('#btn-cancel').onclick = function() {
            urlModal.classList.add('modal-closing');
            setTimeout(() => urlModal.remove(), 300);
        };
        
        // 点击遮罩关闭
        urlModal.querySelector('.cute-modal-overlay').onclick = function() {
            urlModal.classList.add('modal-closing');
            setTimeout(() => urlModal.remove(), 300);
        };
        
        // 按回车键确认
        urlInput.onkeypress = function(e) {
            if (e.key === 'Enter') {
                urlModal.querySelector('#btn-confirm').click();
            }
        };
    };
}

// 编辑可爱对话组件的图片
function editDialogImage(item, index) {
    console.log('编辑对话组件图片', index);
    
    // 创建手机风格弹窗
    const modal = document.createElement('div');
    modal.className = 'cute-image-modal';
    modal.innerHTML = `
        <div class="cute-modal-overlay"></div>
        <div class="cute-modal-content" style="width: 320px; padding: 24px;">
            <div class="cute-modal-title" style="margin-bottom: 20px; text-align: center;">选择图片来源</div>
            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
                <div class="cute-modal-btn" id="btn-upload" style="
                    width: 100%;
                    padding: 16px;
                    background: #f5f5f5;
                    border-radius: 12px;
                    cursor: pointer;
                    text-align: center;
                    font-size: 16px;
                    color: #333;
                    font-weight: 500;
                    transition: all 0.2s ease;
                ">本地相册</div>
                <div class="cute-modal-btn" id="btn-url" style="
                    width: 100%;
                    padding: 16px;
                    background: #f5f5f5;
                    border-radius: 12px;
                    cursor: pointer;
                    text-align: center;
                    font-size: 16px;
                    color: #333;
                    font-weight: 500;
                    transition: all 0.2s ease;
                ">图片链接</div>
            </div>
            <button class="cute-modal-close" id="btn-close" style="
                width: 100%;
                padding: 14px;
                background: transparent;
                border: none;
                color: #999;
                font-size: 16px;
                cursor: pointer;
            ">取消</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加按钮悬停效果
    const hoverStyle = document.createElement('style');
    hoverStyle.textContent = `
        #btn-upload:hover {
            background: #e8e8e8 !important;
        }
        #btn-url:hover {
            background: #e8e8e8 !important;
        }
        #btn-close:hover {
            background: #f5f5f5 !important;
        }
    `;
    document.head.appendChild(hoverStyle);
    
    // 关闭弹窗
    const closeModal = () => {
        modal.classList.add('modal-closing');
        setTimeout(() => modal.remove(), 300);
    };
    
    modal.querySelector('.cute-modal-overlay').onclick = closeModal;
    modal.querySelector('#btn-close').onclick = closeModal;
    
    // 本地上传
    modal.querySelector('#btn-upload').onclick = function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const img = item.querySelector('img');
                    if (img) {
                        img.src = event.target.result;
                    }
                };
                reader.readAsDataURL(file);
            }
            document.body.removeChild(input);
            closeModal();
        };
        
        document.body.appendChild(input);
        input.click();
    };
    
    // URL链接
    modal.querySelector('#btn-url').onclick = function() {
        // 创建URL输入弹窗
        const urlModal = document.createElement('div');
        urlModal.className = 'cute-image-modal';
        urlModal.innerHTML = `
            <div class="cute-modal-overlay"></div>
            <div class="cute-modal-content">
                <div class="cute-modal-title">输入图片链接</div>
                <input type="text" class="cute-url-input" placeholder="https://example.com/image.jpg" />
                <div class="cute-modal-options">
                    <button class="cute-modal-btn" id="btn-confirm">确认</button>
                    <button class="cute-modal-btn" id="btn-cancel">取消</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(urlModal);
        
        const urlInput = urlModal.querySelector('.cute-url-input');
        urlInput.focus();
        
        // 确认按钮
        urlModal.querySelector('#btn-confirm').onclick = function() {
            const url = urlInput.value.trim();
            if (url) {
                const img = item.querySelector('img');
                if (img) {
                    img.src = url;
                }
            }
            urlModal.classList.add('modal-closing');
            setTimeout(() => urlModal.remove(), 300);
            closeModal();
        };
        
        // 取消按钮
        urlModal.querySelector('#btn-cancel').onclick = function() {
            urlModal.classList.add('modal-closing');
            setTimeout(() => urlModal.remove(), 300);
        };
        
        // 点击遮罩关闭
        urlModal.querySelector('.cute-modal-overlay').onclick = function() {
            urlModal.classList.add('modal-closing');
            setTimeout(() => urlModal.remove(), 300);
        };
        
        // 按回车键确认
        urlInput.onkeypress = function(e) {
            if (e.key === 'Enter') {
                urlModal.querySelector('#btn-confirm').click();
            }
        };
    };
}

// 编辑图片
function editImage(item) {
    console.log('====== 编辑图片 ======');
    
    // 如果是时间组件的头像，需要特殊处理
    if (item.classList.contains('new-avatar-right')) {
        editTimeWidgetAvatar(item);
        return;
    }
    
    // 如果是虚线头像，设置背景图片
    if (item.classList.contains('new-avatar-dashed')) {
        editDashedAvatar(item);
        return;
    }
    
    // 创建手机风格弹窗
    const modal = document.createElement('div');
    modal.className = 'cute-image-modal';
    modal.innerHTML = `
        <div class="cute-modal-overlay"></div>
        <div class="cute-modal-content" style="width: 320px; padding: 24px;">
            <div class="cute-modal-title" style="margin-bottom: 20px; text-align: center;">选择图片来源</div>
            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
                <div class="cute-modal-btn" id="btn-upload" style="
                    width: 100%;
                    padding: 16px;
                    background: #f5f5f5;
                    border-radius: 12px;
                    cursor: pointer;
                    text-align: center;
                    font-size: 16px;
                    color: #333;
                    font-weight: 500;
                    transition: all 0.2s ease;
                ">本地相册</div>
                <div class="cute-modal-btn" id="btn-url" style="
                    width: 100%;
                    padding: 16px;
                    background: #f5f5f5;
                    border-radius: 12px;
                    cursor: pointer;
                    text-align: center;
                    font-size: 16px;
                    color: #333;
                    font-weight: 500;
                    transition: all 0.2s ease;
                ">图片链接</div>
            </div>
            <button class="cute-modal-close" id="btn-close" style="
                width: 100%;
                padding: 14px;
                background: transparent;
                border: none;
                color: #999;
                font-size: 16px;
                cursor: pointer;
            ">取消</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加按钮悬停效果
    const hoverStyle = document.createElement('style');
    hoverStyle.textContent = `
        #btn-upload:hover {
            background: #e8e8e8 !important;
        }
        #btn-url:hover {
            background: #e8e8e8 !important;
        }
        #btn-close:hover {
            background: #f5f5f5 !important;
        }
    `;
    document.head.appendChild(hoverStyle);
    
    // 关闭弹窗
    const closeModal = () => {
        modal.remove();
    };
    
    // 取消按钮
    modal.querySelector('#btn-close').onclick = closeModal;
    modal.querySelector('.cute-modal-overlay').onclick = closeModal;
    
    // 本地相册
    modal.querySelector('#btn-upload').onclick = function() {
        closeModal();
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const img = item.querySelector('img');
                    if (img) {
                        img.src = event.target.result;
                    }
                    saveCuteWidgetData();
                };
                reader.readAsDataURL(file);
            }
            document.body.removeChild(input);
        };
        
        document.body.appendChild(input);
        input.click();
    };
    
    // 图片链接
    modal.querySelector('#btn-url').onclick = function() {
        closeModal();
        
        // 创建URL输入弹窗
        const urlModal = document.createElement('div');
        urlModal.className = 'cute-image-modal';
        urlModal.innerHTML = `
            <div class="cute-modal-overlay"></div>
            <div class="cute-modal-content" style="width: 320px; padding: 24px;">
                <div class="cute-modal-title" style="margin-bottom: 20px;">输入图片链接</div>
                <input type="text" class="cute-url-input" placeholder="https://example.com/photo.jpg" style="
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 14px;
                    margin-bottom: 16px;
                    outline: none;
                " />
                <div style="display: flex; gap: 8px;">
                    <button id="btn-cancel" style="
                        flex: 1;
                        padding: 12px;
                        background: #f5f5f5;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        color: #666;
                        border: none;
                    ">取消</button>
                    <button id="btn-confirm" style="
                        flex: 1;
                        padding: 12px;
                        background: #007AFF;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        color: white;
                        font-weight: 500;
                        border: none;
                    ">确定</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(urlModal);
        
        const urlInput = urlModal.querySelector('.cute-url-input');
        urlInput.focus();
        
        const closeUrlModal = () => urlModal.remove();
        
        urlModal.querySelector('.cute-modal-overlay').onclick = closeUrlModal;
        urlModal.querySelector('#btn-cancel').onclick = closeUrlModal;
        
        urlModal.querySelector('#btn-confirm').onclick = function() {
            const url = urlInput.value.trim();
            if (url) {
                const img = item.querySelector('img');
                if (img) {
                    img.src = url;
                }
                saveCuteWidgetData();
            }
            closeUrlModal();
        };
        
        urlInput.onkeypress = function(e) {
            if (e.key === 'Enter') {
                urlModal.querySelector('#btn-confirm').click();
            }
        };
    };
}

// 设置图片源
function setImageSrc(item, src) {
    console.log('设置图片源:', src);
    const img = item.querySelector('img');
    const placeholder = item.querySelector('.image-placeholder');
    
    if (img) {
        img.src = src;
        img.style.display = 'block';
        
        // 监听图片加载错误
        img.onerror = function() {
            console.error('图片加载失败:', src);
            alert('图片加载失败，请检查链接是否有效');
            img.style.display = 'none';
            if (placeholder) {
                placeholder.style.display = 'flex';
            }
        };
        
        // 图片加载成功
        img.onload = function() {
            console.log('图片加载成功');
            if (placeholder) {
                placeholder.style.display = 'none';
            }
        };
    }
    
    // 保存到localStorage
    saveCuteWidgetData();
}

// 编辑文本
function editText(item) {
    console.log('\n\n========================================');
    console.log('====== 双击触发编辑 ======');
    console.log('========================================');
    console.log('点击的元素:', item);
    console.log('元素类名:', item.className);
    
    const textElement = item.querySelector('.symbol-text');
    if (!textElement) {
        console.log('❌ 未找到.symbol-text元素');
        console.log('item.innerHTML:', item.innerHTML);
        return;
    }
    
    console.log('✅ 找到文本元素:', textElement);
    console.log('当前文本:', textElement.textContent);
    
    // 启用编辑模式
    textElement.contentEditable = 'true';
    textElement.style.cursor = 'text';
    textElement.style.outline = '2px solid #4CAF50';
    textElement.style.background = 'rgba(255, 255, 255, 0.9)';
    textElement.focus();
    
    console.log('✅ 已启用编辑模式');
    
    // 选中所有文本
    setTimeout(() => {
        try {
            const range = document.createRange();
            range.selectNodeContents(textElement);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            console.log('✅ 已选中文本');
        } catch(e) {
            console.error('❌ 选中文本失败:', e);
        }
    }, 10);
    
    // 失去焦点时保存
    textElement.onblur = function() {
        textElement.contentEditable = 'false';
        textElement.style.cursor = 'pointer';
        textElement.style.outline = 'none';
        textElement.style.background = '';
        saveCuteWidgetData();
        console.log('✅ 保存文本:', textElement.textContent);
    };
    
    // 按Enter键保存
    textElement.onkeydown = function(e) {
        console.log('按键:', e.key);
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            textElement.blur();
        }
    };
}

// 保存可爱组件数据
function saveCuteWidgetData() {
    const widget = document.querySelector('.cute-desktop-widget');
    if (!widget) return;
    
    const data = {
        images: [],
        texts: []
    };
    
    // 保存图片数据
    widget.querySelectorAll('.cute-item.cute-image img').forEach(img => {
        if (img.src && !img.src.includes('picsum.photos')) {
            data.images.push(img.src);
        }
    });
    
    // 保存文本数据
    widget.querySelectorAll('.cute-item.cute-symbol .symbol-text').forEach(text => {
        data.texts.push(text.textContent);
    });
    
    localStorage.setItem('cuteWidgetData', JSON.stringify(data));
}

// 加载可爱组件数据
function loadCuteWidgetData() {
    const saved = localStorage.getItem('cuteWidgetData');
    
    // 加载方形照片组件的照片（无论是否有数据都要加载）
    loadSquarePhotos();
    
    if (!saved) return;
    
    try {
        const data = JSON.parse(saved);
        const widget = document.querySelector('.cute-desktop-widget');
        if (!widget) return;
        
        // 恢复图片
        if (data.images && data.images.length > 0) {
            const images = widget.querySelectorAll('.cute-item.cute-image img');
            images.forEach((img, index) => {
                img.style.display = 'none';  // 不显示图片
            });
            // 显示提示文字
            const placeholders = widget.querySelectorAll('.cute-item.cute-image .image-placeholder');
            placeholders.forEach(placeholder => {
                placeholder.textContent = '已选择图片 ✓';
                placeholder.style.display = 'block';
            });
        }
        
        // 恢复文本
        if (data.texts && data.texts.length > 0) {
            const texts = widget.querySelectorAll('.cute-item.cute-symbol .symbol-text');
            texts.forEach((text, index) => {
                if (data.texts[index]) {
                    text.textContent = data.texts[index];
                }
            });
        }
    } catch (e) {
        console.error('加载可爱组件数据失败:', e);
    }
    
    // 加载韩系搜索栏组件
    loadKoreanSearchWidget();
}

// 删除组件
window.deleteWidget = function(widgetId) {
    const widget = document.querySelector(`[data-widget-id="${widgetId}"]`);
    if (widget) {
        // 如果是照片组件，清除对应的照片存储
        if (widget.classList.contains('photo-widget')) {
            localStorage.removeItem(`photo-${widgetId}`);
        }
        // 如果是便签组件，清除便签内容
        if (widget.classList.contains('note-widget')) {
            localStorage.removeItem(`compactNote-${widgetId}`);
            localStorage.removeItem(`compactNoteTime-${widgetId}`);
        }
        
        // 如果是预置组件（对话气泡），只隐藏不删除
        if (widgetId === 'dialogBubble-page2') {
            widget.style.display = 'none';
            localStorage.setItem('hideDialogBubble', 'true');
        } else {
            widget.remove();
        }
        
        // 删除组件创建信息
        removeWidgetCreationData(widgetId);
        saveAllPositions();
    }
};

// 保存/加载组件布局
// 旧的布局保存函数（兼容性保留）
function saveWidgetLayout() {
    saveAllPositions();
}

function loadWidgetLayout() {
    loadAllPositions();
}

// 照片组件功能
function initPhotoUpload() {
    // 初始化页面加载时已有的照片组件
    document.querySelectorAll('.photo-widget').forEach(widget => {
        const widgetId = widget.getAttribute('data-widget-id');
        initPhotoWidget(widgetId);
    });
}

// 初始化单个照片组件
function initPhotoWidget(widgetId) {
    const widget = document.querySelector(`[data-widget-id="${widgetId}"]`);
    if (!widget) return;
    
    const photoInput = widget.querySelector('.photo-input');
    const photoImg = widget.querySelector('.photo-img');
    const photoPlaceholder = widget.querySelector('.photo-placeholder');
    
    if (!photoInput) return;
    
    // 加载保存的照片
    const savedPhoto = localStorage.getItem(`photo-${widgetId}`);
    if (savedPhoto && photoImg && photoPlaceholder) {
        photoImg.src = savedPhoto;
        photoImg.style.display = 'block';
        photoPlaceholder.style.display = 'none';
    }
    
    // 绑定上传事件
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            if (photoImg && photoPlaceholder) {
                photoImg.src = e.target.result;
                photoImg.style.display = 'block';
                photoPlaceholder.style.display = 'none';
                localStorage.setItem(`photo-${widgetId}`, e.target.result);
            }
        };
        reader.readAsDataURL(file);
    });
}

// 时间组件功能
let timeWidgetTimers = {};

function initTimeWidget(widgetId) {
    const widget = document.querySelector(`[data-widget-id="${widgetId}"]`);
    if (!widget) return;
    
    const clockElement = widget.querySelector('.time-clock');
    const dateElement = widget.querySelector('.time-date');
    
    if (!clockElement || !dateElement) return;
    
    // 更新时间函数
    function updateTime() {
        const now = new Date();
        
        // 更新时间
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;
        
        // 更新日期
        const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const month = months[now.getMonth()];
        const date = now.getDate();
        const weekday = weekdays[now.getDay()];
        const dateStr = `${month}${date}日 ${weekday}`;
        
        // 更新DOM
        clockElement.textContent = timeStr;
        dateElement.textContent = dateStr;
    }
    
    // 立即更新一次
    updateTime();
    
    // 设置定时器，每分钟更新一次
    if (timeWidgetTimers[widgetId]) {
        clearInterval(timeWidgetTimers[widgetId]);
    }
    timeWidgetTimers[widgetId] = setInterval(updateTime, 60000);
}

// 清理时间组件定时器
function cleanupTimeWidget(widgetId) {
    if (timeWidgetTimers[widgetId]) {
        clearInterval(timeWidgetTimers[widgetId]);
        delete timeWidgetTimers[widgetId];
    }
}
// 触发照片上传（支持本地文件和URL）
window.triggerPhotoUpload = function(widgetId) {
    const widget = document.querySelector(`[data-widget-id="${widgetId}"]`);
    if (!widget) return;
    
    // 创建选择对话框
    const dialog = document.createElement('div');
    dialog.id = 'photo-upload-dialog';
    dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    dialog.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            padding: 24px;
            max-width: 320px;
            width: 90%;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        ">
            <div style="font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #333; text-align: center;">
                选择图片来源
            </div>
            
            <!-- 本地相册按钮 -->
            <div id="btn-upload" style="
                width: 100%;
                padding: 16px;
                background: #f5f5f5;
                border-radius: 12px;
                cursor: pointer;
                text-align: center;
                font-size: 16px;
                color: #333;
                font-weight: 500;
                margin-bottom: 12px;
                transition: all 0.2s ease;
            ">本地相册</div>
            
            <!-- 图片链接按钮 -->
            <div id="btn-url" style="
                width: 100%;
                padding: 16px;
                background: #f5f5f5;
                border-radius: 12px;
                cursor: pointer;
                text-align: center;
                font-size: 16px;
                color: #333;
                font-weight: 500;
                margin-bottom: 16px;
                transition: all 0.2s ease;
            ">图片链接</div>
            
            <!-- 取消按钮 -->
            <button id="photo-cancel-btn" style="
                width: 100%;
                padding: 14px;
                background: transparent;
                border: none;
                color: #999;
                font-size: 16px;
                cursor: pointer;
            ">取消</button>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    // 添加按钮悬停效果
    const hoverStyle = document.createElement('style');
    hoverStyle.textContent = `
        #btn-upload:hover {
            background: #e8e8e8 !important;
        }
        #btn-url:hover {
            background: #e8e8e8 !important;
        }
        #photo-cancel-btn:hover {
            background: #f5f5f5 !important;
        }
    `;
    document.head.appendChild(hoverStyle);
    
    // 绑定取消按钮事件
    const cancelBtn = dialog.querySelector('#photo-cancel-btn');
    if (cancelBtn) {
        cancelBtn.onclick = () => dialog.remove();
    }
    
    // 点击背景关闭
    dialog.addEventListener('click', function(e) {
        if (e.target === dialog) {
            dialog.remove();
        }
    });
    
    // 本地相册按钮
    const uploadBtn = dialog.querySelector('#btn-upload');
    if (uploadBtn) {
        uploadBtn.onclick = function() {
            dialog.remove();
            
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.style.display = 'none';
            
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        setPhotoForWidget(widgetId, event.target.result);
                    };
                    reader.readAsDataURL(file);
                }
                document.body.removeChild(input);
            };
            
            document.body.appendChild(input);
            input.click();
        };
    }
    
    // 图片链接按钮
    const urlBtn = dialog.querySelector('#btn-url');
    if (urlBtn) {
        urlBtn.onclick = function() {
            dialog.remove();
            
            // 创建URL输入弹窗
            const urlModal = document.createElement('div');
            urlModal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            `;
            
            urlModal.innerHTML = `
                <div style="
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    max-width: 320px;
                    width: 90%;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                ">
                    <div style="font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #333; text-align: center;">
                        输入图片链接
                    </div>
                    <input type="text" id="photo-url-input" placeholder="https://example.com/photo.jpg" style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #e0e0e0;
                        border-radius: 8px;
                        font-size: 14px;
                        margin-bottom: 16px;
                        outline: none;
                    " />
                    <div style="display: flex; gap: 8px;">
                        <button id="btn-cancel" style="
                            flex: 1;
                            padding: 12px;
                            background: #f5f5f5;
                            border: none;
                            border-radius: 8px;
                            font-size: 15px;
                            color: #666;
                            cursor: pointer;
                        ">取消</button>
                        <button id="btn-confirm" style="
                            flex: 1;
                            padding: 12px;
                            background: #007aff;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-size: 15px;
                            cursor: pointer;
                        ">确认</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(urlModal);
            
            // 绑定事件
            urlModal.querySelector('#btn-cancel').onclick = () => urlModal.remove();
            urlModal.querySelector('.cute-modal-overlay')?.addEventListener('click', () => urlModal.remove());
            
            urlModal.querySelector('#btn-confirm').onclick = function() {
                const url = document.getElementById('photo-url-input').value.trim();
                if (url) {
                    setPhotoForWidget(widgetId, url);
                }
                urlModal.remove();
            };
            
            // 按Enter确认
            document.getElementById('photo-url-input').onkeydown = function(e) {
                if (e.key === 'Enter') {
                    const url = this.value.trim();
                    if (url) {
                        setPhotoForWidget(widgetId, url);
                    }
                    urlModal.remove();
                }
            };
            
            // 自动聚焦
            setTimeout(() => {
                document.getElementById('photo-url-input').focus();
            }, 100);
        };
    }
};

// 从URL设置照片
window.setPhotoFromUrl = function(widgetId, dialog) {
    const urlInput = document.getElementById('photo-url-input');
    if (!urlInput) return;
    
    const url = urlInput.value.trim();
    if (!url) {
        alert('请输入图片链接');
        return;
    }
    
    // 验证URL是否为图片格式
    if (!url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i) && !url.startsWith('data:image/')) {
        if (!confirm('链接可能不是图片格式，是否仍要尝试？')) {
            return;
        }
    }
    
    // 测试图片是否可加载
    const testImg = new Image();
    testImg.onload = function() {
        setPhotoForWidget(widgetId, url);
        if (dialog) dialog.remove();
    };
    testImg.onerror = function() {
        alert('无法加载该图片链接，请检查链接是否正确');
    };
    testImg.src = url;
};

// 为组件设置照片（统一方法）
function setPhotoForWidget(widgetId, imageUrl) {
    const widget = document.querySelector(`[data-widget-id="${widgetId}"]`);
    if (!widget) return;
    
    const photoImg = widget.querySelector('.photo-img');
    const photoPlaceholder = widget.querySelector('.photo-placeholder');
    
    if (photoImg && photoPlaceholder) {
        photoImg.src = imageUrl;
        photoImg.style.display = 'block';
        photoPlaceholder.style.display = 'none';
        localStorage.setItem(`photo-${widgetId}`, imageUrl);
    }
};

// 方形照片组件上传功能
window.triggerSquarePhotoUpload = function(widgetId, photoIndex) {
    if (isEditing) return; // 编辑模式下禁用
    
    // 创建选择对话框
    const dialog = document.createElement('div');
    dialog.className = 'photo-upload-dialog';
    dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    dialog.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            padding: 24px;
            max-width: 320px;
            width: 90%;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        ">
            <div style="font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #333; text-align: center;">
                选择图片来源
            </div>
            
            <!-- 本地相册按钮 -->
            <div class="btn-local-album" style="
                width: 100%;
                padding: 16px;
                background: #f5f5f5;
                border-radius: 12px;
                cursor: pointer;
                text-align: center;
                font-size: 16px;
                color: #333;
                font-weight: 500;
                margin-bottom: 12px;
                transition: all 0.2s ease;
            ">本地相册</div>
            
            <!-- 图片链接按钮 -->
            <div class="btn-image-url" style="
                width: 100%;
                padding: 16px;
                background: #f5f5f5;
                border-radius: 12px;
                cursor: pointer;
                text-align: center;
                font-size: 16px;
                color: #333;
                font-weight: 500;
                margin-bottom: 16px;
                transition: all 0.2s ease;
            ">图片链接</div>
            
            <!-- 取消按钮 -->
            <button class="btn-cancel-upload" style="
                width: 100%;
                padding: 14px;
                background: transparent;
                border: none;
                color: #999;
                font-size: 16px;
                cursor: pointer;
            ">取消</button>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    // 绑定取消按钮事件
    const cancelBtn = dialog.querySelector('.btn-cancel-upload');
    if (cancelBtn) {
        cancelBtn.onclick = () => dialog.remove();
    }
    
    // 点击背景关闭
    dialog.addEventListener('click', function(e) {
        if (e.target === dialog) {
            dialog.remove();
        }
    });
    
    // 本地相册按钮
    const localBtn = dialog.querySelector('.btn-local-album');
    if (localBtn) {
        localBtn.onclick = function() {
            dialog.remove();
            
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.style.display = 'none';
            
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        setSquarePhoto(widgetId, photoIndex, event.target.result);
                    };
                    reader.readAsDataURL(file);
                }
                document.body.removeChild(input);
            };
            
            document.body.appendChild(input);
            input.click();
        };
    }
    
    // 图片链接按钮
    const urlBtn = dialog.querySelector('.btn-image-url');
    if (urlBtn) {
        urlBtn.onclick = function() {
            dialog.remove();
            
            // 创建URL输入弹窗
            const urlModal = document.createElement('div');
            urlModal.className = 'photo-url-modal';
            urlModal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            `;
            
            urlModal.innerHTML = `
                <div style="
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    max-width: 320px;
                    width: 90%;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                ">
                    <div style="font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #333; text-align: center;">
                        输入图片链接
                    </div>
                    <input type="text" class="photo-url-input" placeholder="https://example.com/photo.jpg" style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #e0e0e0;
                        border-radius: 8px;
                        font-size: 14px;
                        margin-bottom: 16px;
                        outline: none;
                        box-sizing: border-box;
                    " />
                    <div style="display: flex; gap: 8px;">
                        <button class="btn-url-cancel" style="
                            flex: 1;
                            padding: 12px;
                            background: #f5f5f5;
                            border: none;
                            border-radius: 8px;
                            font-size: 15px;
                            color: #666;
                            cursor: pointer;
                        ">取消</button>
                        <button class="btn-url-confirm" style="
                            flex: 1;
                            padding: 12px;
                            background: #007aff;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-size: 15px;
                            cursor: pointer;
                        ">确认</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(urlModal);
            
            // 绑定事件
            urlModal.querySelector('.btn-url-cancel').onclick = () => urlModal.remove();
            
            urlModal.querySelector('.btn-url-confirm').onclick = function() {
                const url = urlModal.querySelector('.photo-url-input').value.trim();
                if (url) {
                    // 验证URL是否有效
                    const testImg = new Image();
                    testImg.onload = function() {
                        setSquarePhoto(widgetId, photoIndex, url);
                        urlModal.remove();
                    };
                    testImg.onerror = function() {
                        alert('无法加载该图片链接，请检查链接是否正确');
                    };
                    testImg.src = url;
                } else {
                    alert('请输入图片链接');
                }
            };
            
            // 按Enter确认
            urlModal.querySelector('.photo-url-input').onkeydown = function(e) {
                if (e.key === 'Enter') {
                    urlModal.querySelector('.btn-url-confirm').click();
                }
            };
            
            // 自动聚焦
            setTimeout(() => {
                urlModal.querySelector('.photo-url-input').focus();
            }, 100);
        };
    }
};

// 为方形照片组件设置照片
function setSquarePhoto(widgetId, photoIndex, imageUrl) {
    const widget = document.querySelector(`[data-widget-id="${widgetId}"]`);
    if (!widget) return;
    
    // 获取所有照片元素
    const photos = widget.querySelectorAll('.square-photo');
    if (photos[photoIndex]) {
        photos[photoIndex].style.backgroundImage = `url('${imageUrl}')`;
        
        // 保存到 localStorage
        const storageKey = `square-photo-${widgetId}-${photoIndex}`;
        localStorage.setItem(storageKey, imageUrl);
    }
}

// 加载方形照片组件的照片
function loadSquarePhotos() {
    console.log('loadSquarePhotos called');
    const widget = document.querySelector('[data-widget-id="squarePhoto"]');
    if (!widget) {
        console.log('widget not found');
        return;
    }
    
    // 不显示图片,只显示提示文字
    const photos = widget.querySelectorAll('.square-photo');
    console.log('found photos:', photos.length);
    photos.forEach((photo, index) => {
        // 清除所有背景相关样式
        photo.style.removeProperty('background-image');
        photo.style.backgroundImage = 'none';
        photo.style.background = 'rgba(240, 240, 240, 0.6)';
        photo.style.display = 'flex';
        photo.style.alignItems = 'center';
        photo.style.justifyContent = 'center';
        photo.style.color = '#999';
        photo.style.fontSize = '12px';
        photo.style.height = '100%';
        photo.style.width = '100%';
        photo.style.aspectRatio = '1';
        photo.textContent = '点击可编辑图片';
        console.log('photo ' + index + ' text:', photo.textContent);
    });
    
    // 加载颜文字气泡
    loadSquareDecorations();
}

// 加载方形照片组件的颜文字气泡
function loadSquareDecorations() {
    const widget = document.querySelector('[data-widget-id="squarePhoto"]');
    if (!widget) return;
    
    const decorations = widget.querySelectorAll('.square-decoration');
    for (let i = 0; i < decorations.length; i++) {
        const storageKey = `square-deco-squarePhoto-${i}`;
        const savedText = localStorage.getItem(storageKey);
        if (savedText && decorations[i]) {
            decorations[i].textContent = savedText;
        }
    }
}

// 加载韩系搜索栏组件
function loadKoreanSearchWidget() {
    const widgets = document.querySelectorAll('[data-widget-id^="koreanSearch"]');
    widgets.forEach(widget => {
        const widgetId = widget.getAttribute('data-widget-id');
        const textElement = widget.querySelector('.korean-search-text');
        const decoElement = widget.querySelector('.korean-search-decoration');
        
        if (textElement) {
            const savedText = localStorage.getItem(`korean-search-text-${widgetId}`);
            if (savedText) {
                textElement.textContent = savedText;
            }
        }
        
        if (decoElement) {
            const savedDeco = localStorage.getItem(`korean-search-deco-${widgetId}`);
            if (savedDeco) {
                decoElement.textContent = savedDeco;
            }
        }
        
        // 绑定保存事件
        if (textElement) {
            textElement.addEventListener('blur', function() {
                localStorage.setItem(`korean-search-text-${widgetId}`, textElement.textContent);
            });
        }
        
        if (decoElement) {
            decoElement.addEventListener('blur', function() {
                localStorage.setItem(`korean-search-deco-${widgetId}`, decoElement.textContent);
            });
        }
    });
}

// 编辑方形照片组件的颜文字气泡
window.editSquareDecoration = function(widgetId, decorationIndex) {
    if (isEditing) return; // 编辑模式下禁用
    
    const widget = document.querySelector(`[data-widget-id="${widgetId}"]`);
    if (!widget) return;
    
    // 获取当前气泡文字
    const decorations = widget.querySelectorAll('.square-decoration');
    const currentText = decorations[decorationIndex]?.textContent || '';
    
    // 创建编辑弹窗
    const dialog = document.createElement('div');
    dialog.className = 'decoration-edit-modal';
    dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    dialog.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            padding: 24px;
            max-width: 320px;
            width: 90%;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        ">
            <div style="font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #333; text-align: center;">
                编辑颜文字气泡
            </div>
            <input type="text" class="decoration-text-input" value="${currentText}" placeholder="输入颜文字，例如：♡ · · ♡" style="
                width: 100%;
                padding: 12px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                font-size: 16px;
                margin-bottom: 16px;
                outline: none;
                box-sizing: border-box;
            " />
            <div style="display: flex; gap: 8px;">
                <button class="btn-deco-cancel" style="
                    flex: 1;
                    padding: 12px;
                    background: #f5f5f5;
                    border: none;
                    border-radius: 8px;
                    font-size: 15px;
                    color: #666;
                    cursor: pointer;
                ">取消</button>
                <button class="btn-deco-confirm" style="
                    flex: 1;
                    padding: 12px;
                    background: #007aff;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 15px;
                    cursor: pointer;
                ">确认</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    // 绑定事件
    dialog.querySelector('.btn-deco-cancel').onclick = () => dialog.remove();
    
    dialog.querySelector('.btn-deco-confirm').onclick = function() {
        const newText = dialog.querySelector('.decoration-text-input').value.trim();
        if (newText) {
            // 更新气泡文字
            if (decorations[decorationIndex]) {
                decorations[decorationIndex].textContent = newText;
            }
            
            // 保存到 localStorage
            const storageKey = `square-deco-${widgetId}-${decorationIndex}`;
            localStorage.setItem(storageKey, newText);
        }
        dialog.remove();
    };
    
    // 按Enter确认
    dialog.querySelector('.decoration-text-input').onkeydown = function(e) {
        if (e.key === 'Enter') {
            dialog.querySelector('.btn-deco-confirm').click();
        }
    };
    
    // 自动聚焦并选中文字
    setTimeout(() => {
        const input = dialog.querySelector('.decoration-text-input');
        input.focus();
        input.select();
    }, 100);
};

// 主动消息定时器
function startActiveMessage() {
    if (window.activeMessageTimer) clearInterval(window.activeMessageTimer);
    if (!globalApiConfig.activeMessage.enabled) return;

    const intervalMs = globalApiConfig.activeMessage.interval * 60 * 1000;
    window.activeMessageTimer = setInterval(async () => {
        try {
            const res = await globalApiRequest({
                path: '/chat/completions',
                body: {
                    messages: [{ role: 'system', content: '给用户发一条日常问候，不超过30字' }]
                }
            });
            const reply = res.choices?.[0]?.message?.content;
            if (!reply) return;

            if (globalApiConfig.autoSyncToNote) addNoteToWidget(reply);
            if (globalApiConfig.notification.enabled && document.visibilityState === 'hidden') {
                new Notification('新消息', { body: reply });
            }
        } catch (e) {
            console.log('主动消息发送失败', e);
        }
    }, intervalMs);
}

// 同步消息到便签
function addNoteToWidget(content) {
    const noteList = document.getElementById('note-list');
    if (!noteList) return;

    const noteItem = document.createElement('div');
    noteItem.className = 'note-item';
    noteItem.innerHTML = `
        ${content}
        <div class="note-time">${new Date().getHours().toString().padStart(2,'0')}:${new Date().getMinutes().toString().padStart(2,'0')}</div>
    `;
    noteList.insertBefore(noteItem, noteList.firstChild);
    noteList.querySelector('.note-empty')?.remove();

    const savedNotes = JSON.parse(localStorage.getItem('noteList') || '[]');
    savedNotes.unshift({ id: Date.now(), content, time: `${new Date().getHours().toString().padStart(2,'0')}:${new Date().getMinutes().toString().padStart(2,'0')}` });
    if (savedNotes.length > 50) savedNotes.splice(50);
    localStorage.setItem('noteList', JSON.stringify(savedNotes));
}

// ========== 分页切换功能 ==========
let currentPage = 1;
let touchStartX = 0;
let touchEndX = 0;
let isSwiping = false;

// 初始化页面切换
function initPageSwipe() {
    const homeScreen = document.getElementById('home-screen');
    const pageDots = document.querySelectorAll('.page-dot');
    
    // 触摸滑动
    homeScreen.addEventListener('touchstart', (e) => {
        if (isEditing) return; // 编辑模式下禁用滑动切换
        touchStartX = e.touches[0].clientX;
        isSwiping = true;
    }, { passive: true });
    
    homeScreen.addEventListener('touchmove', (e) => {
        if (!isSwiping || isEditing) return;
        // 可以在这里添加实时滑动预览
    }, { passive: true });
    
    homeScreen.addEventListener('touchend', (e) => {
        if (!isSwiping || isEditing) return;
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
        isSwiping = false;
    }, { passive: true });
    
    // 鼠标拖动（桌面端）
    homeScreen.addEventListener('mousedown', (e) => {
        if (isEditing) return;
        touchStartX = e.clientX;
        isSwiping = true;
    });
    
    homeScreen.addEventListener('mousemove', (e) => {
        if (!isSwiping || isEditing) return;
    });
    
    homeScreen.addEventListener('mouseup', (e) => {
        if (!isSwiping || isEditing) return;
        touchEndX = e.clientX;
        handleSwipe();
        isSwiping = false;
    });
    
    homeScreen.addEventListener('mouseleave', () => {
        isSwiping = false;
    });
    
    // 点击指示器切换
    pageDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const page = parseInt(dot.getAttribute('data-page'));
            switchToPage(page);
        });
    });
}

function handleSwipe() {
    const diff = touchStartX - touchEndX;
    const threshold = 50;
    
    if (diff > threshold && currentPage < 2) {
        // 向左滑动，下一页
        switchToPage(currentPage + 1);
    } else if (diff < -threshold && currentPage > 1) {
        // 向右滑动，上一页
        switchToPage(currentPage - 1);
    }
}

function switchToPage(page) {
    console.log('切换页面: ', currentPage, '->', page);
    currentPage = page;
    
    // 如果正在拖拽，同步更新目标页面
    if (isDragging && dragTarget) {
        dragTargetPage = page;
        console.log('更新拖拽目标页面:', dragTargetPage);
    }
    
    const wrapper = document.getElementById('pages-wrapper');
    const dots = document.querySelectorAll('.page-dot');
    
    if (wrapper) {
        wrapper.className = `page-${page}`;
    }
    
    dots.forEach(dot => {
        const dotPage = parseInt(dot.getAttribute('data-page'));
        if (dotPage === page) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// ========== Dock栏拖拽功能 ==========
let isDockDragging = false;
let dockStartY = 0;
let dockCurrentBottom = 20; // 默认底部距离
let dockDragged = false; // 区分点击和拖拽

function initDockDrag() {
    const dock = document.getElementById('dock');
    if (!dock) return;
    
    // 加载保存的位置
    const savedPosition = localStorage.getItem('dockBottomPosition');
    if (savedPosition) {
        dockCurrentBottom = parseInt(savedPosition);
        dock.style.bottom = dockCurrentBottom + 'px';
    }
    
    // 触摸事件 - 整个Dock栏可拖拽
    dock.addEventListener('touchstart', handleDockTouchStart, { passive: false });
    dock.addEventListener('touchmove', handleDockTouchMove, { passive: false });
    dock.addEventListener('touchend', handleDockTouchEnd);
    
    // 鼠标事件 - 整个Dock栏可拖拽
    dock.addEventListener('mousedown', handleDockMouseDown);
    
    document.addEventListener('mousemove', handleDockMouseMove);
    document.addEventListener('mouseup', handleDockMouseUp);
}

function handleDockTouchStart(e) {
    if (isEditing) return; // 编辑模式下禁用拖拽
    // 如果是点击应用图标，不处理拖拽
    const appIcon = e.target.closest('.app-icon');
    if (appIcon) return;
    
    // 触摸Dock空白区域，开始拖拽检测
    // 重要:清除长按计时器，防止拖拽触发长按
    clearTimeout(longPressTimer);
    isDockDragging = true;
    dockStartY = e.touches[0].clientY;
    dockDragged = false;
    // 不在这里 preventDefault，让后续 move 决定是否阻止
}

function handleDockTouchMove(e) {
    if (!isDockDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = dockStartY - currentY;
    // 只有移动超过5px才算拖拽
    if (Math.abs(diff) > 5) {
        if (!dockDragged) {
            dockDragged = true;
        }
        dockCurrentBottom += diff;
        dockStartY = currentY;
        updateDockPosition();
        e.preventDefault(); // 只在真正拖拽时阻止默认行为
    }
}

function handleDockTouchEnd() {
    if (!isDockDragging) return;
    isDockDragging = false;
    if (dockDragged) {
        saveDockPosition();
    }
}

function handleDockMouseDown(e) {
    if (isEditing) return;
    // 如果是点击应用图标，不处理拖拽
    const appIcon = e.target.closest('.app-icon');
    if (appIcon) return;
    
    // 鼠标按下Dock空白区域，开始拖拽检测
    // 重要:清除长按计时器，防止拖拽触发长按
    clearTimeout(longPressTimer);
    isDockDragging = true;
    dockStartY = e.clientY;
    dockDragged = false;
    // 不在这里 preventDefault，让后续 move 决定是否阻止
}

function handleDockMouseMove(e) {
    if (!isDockDragging) return;
    const currentY = e.clientY;
    const diff = dockStartY - currentY;
    // 只有移动超过5px才算拖拽
    if (Math.abs(diff) > 5) {
        if (!dockDragged) {
            dockDragged = true;
        }
        dockCurrentBottom += diff;
        dockStartY = currentY;
        updateDockPosition();
    }
}

function handleDockMouseUp() {
    if (!isDockDragging) return;
    isDockDragging = false;
    if (dockDragged) {
        saveDockPosition();
    }
}

function updateDockPosition() {
    const dock = document.getElementById('dock');
    if (!dock) return;
    
    // 限制范围：最小 20px，最大为屏幕高度减去 Dock 高度再减 20px
    const minBottom = 20;
    const maxBottom = window.innerHeight - 120; // 120是Dock高度+留白
    
    dockCurrentBottom = Math.max(minBottom, Math.min(maxBottom, dockCurrentBottom));
    dock.style.bottom = dockCurrentBottom + 'px';
}

function saveDockPosition() {
    localStorage.setItem('dockBottomPosition', dockCurrentBottom.toString());
}

// ========== 组件选择面板功能 ==========
window.openWidgetPicker = function() {
    const picker = document.getElementById('widget-picker');
    if (picker) {
        picker.classList.add('active');
        updatePickerItems();
    }
};

window.closeWidgetPicker = function() {
    const picker = document.getElementById('widget-picker');
    if (picker) {
        picker.classList.remove('active');
    }
};

function updatePickerItems() {
    const items = document.querySelectorAll('.widget-picker-item');
    const existingWidgets = Array.from(document.querySelectorAll('.widget'))
        .filter(w => w.style.display !== 'none') // 过滤掉隐藏的组件
        .map(w => w.getAttribute('data-widget-id'));
    
    items.forEach(item => {
        const type = item.getAttribute('data-widget-type');
        // 便签和照片可以有多个，其他组件只能有一个
        if (existingWidgets.includes(type) && type !== 'note' && type !== 'photo') {
            item.classList.add('disabled');
        } else {
            item.classList.remove('disabled');
        }
    });
}

// 组件模板
const widgetTemplates = {
    countdown: {
        id: 'countdown',
        html: `
            <div class="widget countdown-widget" id="countdown-widget" data-widget-id="countdown">
                <div class="widget-delete" onclick="deleteWidget('countdown')">×</div>
                <div class="countdown-title" id="countdown-title">距离新年</div>
                <div class="countdown-time" id="countdown-time">
                    <div class="countdown-item"><div class="countdown-num" id="cd-days">0</div><div class="countdown-unit">天</div></div>
                    <div class="countdown-item"><div class="countdown-num" id="cd-hours">0</div><div class="countdown-unit">时</div></div>
                    <div class="countdown-item"><div class="countdown-num" id="cd-mins">0</div><div class="countdown-unit">分</div></div>
                </div>
                <button class="countdown-add" onclick="showCountdownModal()">设置</button>
            </div>
        `,
        init: () => window.countdownWidget?.init()
    },
    note: {
        id: 'note',
        html: `
            <div class="widget note-widget" data-widget-id="note">
                <div class="widget-delete" onclick="deleteWidget(this.parentElement.getAttribute('data-widget-id'))">×</div>
                <div class="note-stack">
                    <div class="note-card">
                        <div class="note-header">
                            <span class="note-title">便签</span>
                            <div class="action-buttons">
                                <button class="text-btn" onclick="enterNoteEditMode(this)">编辑</button>
                                <button class="text-btn" onclick="saveNote(this)" style="display: none;">保存</button>
                            </div>
                        </div>
                        <div class="note-body">
                            <div class="display-text" onclick="event.stopPropagation()">点击编辑</div>
                            <textarea class="edit-textarea" style="display: none;" rows="2" placeholder="写点内容..." onclick="event.stopPropagation()"></textarea>
                        </div>
                        <div class="note-footer"></div>
                    </div>
                </div>
            </div>
        `,
        init: (widgetId) => initNoteWidget(widgetId)
    },
    textBanner: {
        id: 'textBanner',
        html: `
            <div class="widget text-banner style-left style-white" data-widget-id="textBanner">
                <div class="widget-delete" onclick="deleteWidget(this.parentElement.getAttribute('data-widget-id'))">×</div>
                <div class="text-banner-content" contenteditable="true" onclick="event.stopPropagation()">点击编辑文字...</div>
                <div class="text-banner-style">
                    <button class="banner-style-btn color-white" onclick="setBannerStyle(this, 'white')"></button>
                    <button class="banner-style-btn color-blue" onclick="setBannerStyle(this, 'blue')"></button>
                    <button class="banner-style-btn color-pink" onclick="setBannerStyle(this, 'pink')"></button>
                    <button class="banner-style-btn color-green" onclick="setBannerStyle(this, 'green')"></button>
                    <button class="banner-style-btn color-orange" onclick="setBannerStyle(this, 'orange')"></button>
                </div>
            </div>
        `,
        init: (widgetId) => initTextBanner(widgetId)
    },
    photo: {
        id: 'photo',
        html: `
            <div class="widget photo-widget" data-widget-id="photo">
                <div class="widget-delete" onclick="deleteWidget(this.parentElement.getAttribute('data-widget-id'))">×</div>
                <div class="photo-display" onclick="triggerPhotoUpload(this.parentElement.getAttribute('data-widget-id'))">
                    <div class="photo-placeholder">
                        <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="1.5" fill="none">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                        </svg>
                        <span>点击添加照片</span>
                    </div>
                    <img class="photo-img" style="display:none;" />
                </div>
                <input type="file" class="photo-input" accept="image/*" style="display:none;" />
            </div>
        `,
        init: (widgetId) => initPhotoWidget(widgetId)
    },
    time: {
        id: 'time',
        html: `
            <div class="widget time-widget" data-widget-id="time">
                <div class="widget-delete" onclick="deleteWidget(this.parentElement.getAttribute('data-widget-id'))">×</div>
                <div class="time-display">
                    <div class="time-clock" id="time-clock">12:00</div>
                    <div class="time-date" id="time-date">1月1日 星期一</div>
                </div>
            </div>
        `,
        init: (widgetId) => initTimeWidget(widgetId)
    },
    cuteDialog: {
        id: 'cuteDialog',
        html: `
            <div class="widget cute-dialog-widget" data-widget-id="cuteDialog">
                <div class="widget-delete" onclick="deleteWidget(this.parentElement.getAttribute('data-widget-id'))">×</div>
                <div class="cute-dialog-content">
                    <div class="dialog-main-text" contenteditable="true" onclick="event.stopPropagation()">不是我可爱 是你爱上我了 笨蛋 <·>Δ<·> </div>
                    <div class="dialog-decoration">
                        <div class="dialog-face">୨୧</div>
                        <div class="dialog-face">୨୧</div>
                    </div>
                    <div class="dialog-sub-section">
                        <div class="dialog-sub-face">(๑>؂<๑)</div>
                        <div class="dialog-sub-text" contenteditable="true" onclick="event.stopPropagation()">馅饼不会掉我头上的 ˶ᵒ ᵕ ˂˶</div>
                        <div class="dialog-date">2026-04-01</div>
                    </div>
                </div>
            </div>
        `,
        init: (widgetId) => initCuteDialog(widgetId)
    },
    collectionChest: {
        id: 'collectionChest',
        html: `
            <div class="widget collection-chest-widget" id="collection-chest" data-widget-id="collection-chest" data-widget-type="collectionChest">
                <div class="widget-delete" onclick="deleteWidget('collection-chest')" style="top: -8px; right: -8px;">×</div>
                <div class="chest-container" id="chest-container">
                    <div class="chest-body" onclick="toggleCollectionPanel()">
                        <div class="chest-lock">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                                <circle cx="12" cy="10" r="2"/>
                            </svg>
                        </div>
                        <div class="chest-label">我的收藏</div>
                        <div class="chest-count" id="collection-count">0 个收藏</div>
                        <div class="bottom-line"></div>
                    </div>
                    <div class="chest-content" id="chest-content"></div>
                </div>
            </div>
        `,
        init: () => {
            updateCollectionCount();
            console.log('收藏组件已初始化');
        }
    },
};

// 从HTML模板添加组件
function addWidgetFromTemplate(templateId, widgetId) {
    const template = document.getElementById(templateId);
    if (!template) {
        console.error('找不到模板:', templateId);
        return;
    }
    
    // 克隆模板
    const newWidget = template.cloneNode(true);
    newWidget.id = widgetId;
    newWidget.setAttribute('data-widget-id', widgetId);
    newWidget.setAttribute('data-widget-type', widgetId); // 保存组件类型
    newWidget.style.display = ''; // 确保显示
    
    // 添加到当前页面的widget-area
    let targetArea;
    if (currentPage === 1) {
        targetArea = document.getElementById('widget-area');
    } else {
        targetArea = document.getElementById('widget-area-page2');
    }
    
    if (targetArea) {
        targetArea.appendChild(newWidget);
        showToast('组件已添加');
        
        // 保存组件创建信息
        saveWidgetCreationData(widgetId, widgetId, currentPage === 1 ? 'page-1' : 'page-2');
        saveAllPositions();
    }
}

// 添加组件
function addWidget(type) {
    const template = widgetTemplates[type];
    if (!template) return;
    
    // 获取目标容器
    let targetArea;
    
    // 图片组件添加到app-grid，其他组件添加到widget-area
    if (type === 'photo') {
        // 获取当前页面的app-grid
        let pageContainer = document.getElementById('page-1');
        if (currentPage === 2) {
            pageContainer = document.getElementById('page-2');
        }
        targetArea = pageContainer ? pageContainer.querySelector('#app-grid') : null;
    } else {
        // 其他组件添加到widget-area
        targetArea = document.getElementById('widget-area-page2');
        if (currentPage === 1) {
            targetArea = document.getElementById('widget-area');
        }
    }
    
    if (!targetArea) return;
    
    // 创建新组件
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = template.html;
    const newWidget = tempDiv.firstElementChild;
    
    // 添加唯一ID
    const widgetId = `${type}-${Date.now()}`;
    newWidget.id = widgetId;
    newWidget.setAttribute('data-widget-id', widgetId);
    newWidget.setAttribute('data-widget-type', type);  // 设置组件类型
    
    // 更新删除按钮的onclick
    const deleteBtn = newWidget.querySelector('.widget-delete');
    if (deleteBtn) {
        deleteBtn.setAttribute('onclick', `deleteWidget('${widgetId}')`);
    }
    
    // 如果是编辑模式，添加editing类
    if (isEditing) {
        newWidget.classList.add('editing');
    }
    
    targetArea.appendChild(newWidget);
    
    // 初始化组件功能
    if (template.init) {
        setTimeout(() => template.init(widgetId), 100);
    }
    
    // 关闭选择面板
    closeWidgetPicker();
    
    // 保存组件创建信息（currentPage转为字符串如'page-1'）
    saveWidgetCreationData(type, widgetId, `page-${currentPage}`);
    
    // 保存布局
    saveAllPositions();
    
    console.log('添加组件:', widgetId);
}

// 绑定组件选择事件
document.addEventListener('DOMContentLoaded', function() {
    // 初始化设置页面
    initSettings();
    
    const pickerItems = document.querySelectorAll('.widget-picker-item');
    pickerItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.classList.contains('disabled')) return;
            const type = item.getAttribute('data-widget-type');
            
            // 如果是可爱对话组件，显示已隐藏的组件或从模板添加
            if (type === 'cuteDialog') {
                const widget = document.querySelector('[data-widget-id="cuteDialog"]');
                if (widget && widget.style.display === 'none') {
                    // 如果已隐藏，则显示它
                    widget.style.display = '';
                    localStorage.removeItem('hideCuteDialog');
                    showToast('可爱对话组件已显示');
                    saveAllPositions(); // 保存布局
                    closeWidgetPicker();
                    return;
                }
                // 否则从模板添加
                addWidgetFromTemplate('cuteDialog-template', 'cuteDialog');
                closeWidgetPicker();
                return;
            }
            
            // 如果是拍立得组件，从模板添加
            if (type === 'polaroidWidget') {
                addWidgetFromTemplate('polaroidWidget-template', 'polaroidWidget');
                closeWidgetPicker();
                return;
            }
            
            // 其他组件正常添加
            addWidget(type);
        });
    });
    
    // 初始化日历组件
    if (window.calendarWidget) {
        window.calendarWidget.init();
    }
    
    // 初始化可爱对话组件
    initCuteDialog('cuteDialog');
    
    // 检查是否隐藏了可爱对话组件
    if (localStorage.getItem('hideCuteDialog') === 'true') {
        const widget = document.querySelector('[data-widget-id="cuteDialog"]');
        if (widget) {
            widget.style.display = 'none';
        }
    }
    
    // 检查是否隐藏了对话气泡组件
    if (localStorage.getItem('hideDialogBubble') === 'true') {
        const widget = document.querySelector('[data-widget-id="dialogBubble-page2"]');
        if (widget) {
            widget.style.display = 'none';
        }
    }
});

// 初始化可爱对话组件
function initCuteDialog(widgetId) {
    const widget = document.querySelector(`[data-widget-id="${widgetId}"]`);
    if (!widget) return;
    
    // 加载保存的内容
    const savedData = localStorage.getItem(`widget_${widgetId}`);
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            const mainText = widget.querySelector('.dialog-main-text');
            const topDecor = widget.querySelector('.dialog-top-decoration');
            const bottomDecor = widget.querySelector('.dialog-bottom-decoration');
            const subText = widget.querySelector('.dialog-sub-text');
            const dateEl = widget.querySelector('.dialog-date');
            
            if (mainText && data.mainText) mainText.textContent = data.mainText;
            if (topDecor && data.topDecor) topDecor.textContent = data.topDecor;
            if (bottomDecor && data.bottomDecor) bottomDecor.textContent = data.bottomDecor;
            if (subText && data.subText) subText.textContent = data.subText;
            if (dateEl && data.date) dateEl.textContent = data.date;
        } catch (e) {
            console.error('加载对话组件数据失败:', e);
        }
    } else {
        // 设置默认日期为今天
        const dateEl = widget.querySelector('.dialog-date');
        if (dateEl) {
            const today = new Date();
            const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            dateEl.textContent = dateStr;
        }
    }
    
    // 监听内容变化并保存
    const mainText = widget.querySelector('.dialog-main-text');
    const topDecor = widget.querySelector('.dialog-top-decoration');
    const bottomDecor = widget.querySelector('.dialog-bottom-decoration');
    const subText = widget.querySelector('.dialog-sub-text');
    const dateEl = widget.querySelector('.dialog-date');
    
    const saveContent = () => {
        const data = {
            mainText: mainText?.textContent || '',
            topDecor: topDecor?.textContent || '',
            bottomDecor: bottomDecor?.textContent || '',
            subText: subText?.textContent || '',
            date: dateEl?.textContent || ''
        };
        localStorage.setItem(`widget_${widgetId}`, JSON.stringify(data));
    };
    
    [mainText, topDecor, bottomDecor, subText, dateEl].forEach(el => {
        if (el) {
            el.addEventListener('input', saveContent);
            el.addEventListener('blur', saveContent);
        }
    });
}

// ========== 倒计时组件功能 ==========
window.countdownWidget = {
    targetDate: null,
    interval: null,
    
    init: function() {
        const saved = localStorage.getItem('countdownTarget');
        if (saved) {
            this.targetDate = new Date(saved);
        } else {
            // 默认新年
            const now = new Date();
            this.targetDate = new Date(now.getFullYear() + 1, 0, 1);
        }
        this.updateTitle();
        this.startTimer();
    },
    
    updateTitle: function() {
        const titleEl = document.getElementById('countdown-title');
        if (titleEl && this.targetDate) {
            const months = ['元旦', '春节', '情人节', '劳动节', '国庆', '圣诞节'];
            titleEl.textContent = `距离 ${this.targetDate.toLocaleDateString()}`;
        }
    },
    
    startTimer: function() {
        if (this.interval) clearInterval(this.interval);
        this.update();
        this.interval = setInterval(() => this.update(), 1000);
    },
    
    update: function() {
        if (!this.targetDate) return;
        
        const now = new Date();
        const diff = this.targetDate - now;
        
        if (diff <= 0) {
            document.getElementById('cd-days').textContent = 0;
            document.getElementById('cd-hours').textContent = 0;
            document.getElementById('cd-mins').textContent = 0;
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        const daysEl = document.getElementById('cd-days');
        const hoursEl = document.getElementById('cd-hours');
        const minsEl = document.getElementById('cd-mins');
        
        if (daysEl) daysEl.textContent = days;
        if (hoursEl) hoursEl.textContent = hours;
        if (minsEl) minsEl.textContent = mins;
    }
};

window.setCountdown = function() {
    const input = prompt('输入目标日期（格式：2026-01-01）：');
    if (input) {
        const date = new Date(input);
        if (!isNaN(date.getTime())) {
            window.countdownWidget.targetDate = date;
            localStorage.setItem('countdownTarget', input);
            window.countdownWidget.updateTitle();
            window.countdownWidget.update();
        }
    }
};

// ========== 记账组件功能 ==========
window.moneyWidget = {
    records: [],
    
    init: function() {
        const saved = localStorage.getItem('moneyRecords');
        this.records = saved ? JSON.parse(saved) : [];
        this.render();
    },
    
    render: function() {
        const incomeEl = document.getElementById('money-income');
        const expenseEl = document.getElementById('money-expense');
        const listEl = document.getElementById('money-list');
        
        if (!incomeEl) return;
        
        let income = 0, expense = 0;
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;
        
        const monthRecords = this.records.filter(r => r.date.startsWith(currentMonth));
        
        monthRecords.forEach(r => {
            if (r.type === 'income') income += r.amount;
            else expense += r.amount;
        });
        
        incomeEl.textContent = income;
        expenseEl.textContent = expense;
        
        if (listEl) {
            const recent = monthRecords.slice(-5).reverse();
            listEl.innerHTML = recent.map(r => `
                <div class="money-record">
                    <span>${r.note}</span>
                    <span class="${r.type}">${r.type === 'income' ? '+' : '-'}${r.amount}</span>
                </div>
            `).join('') || '<div class="money-record"><span style="color:var(--text-secondary)">暂无记录</span></div>';
        }
    },
    
    add: function(type, amount, note) {
        this.records.push({
            type,
            amount: parseFloat(amount),
            note,
            date: new Date().toISOString()
        });
        localStorage.setItem('moneyRecords', JSON.stringify(this.records));
        this.render();
    }
};

window.addMoneyRecord = function() {
    // 使用弹窗替代prompt
    showMoneyModal();
};

// ========== 手机弹窗功能 ==========
window.showMobileModal = function(title, content) {
    const modal = document.getElementById('mobile-modal');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');
    
    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.innerHTML = content;
    if (modal) modal.classList.add('active');
};

window.closeMobileModal = function() {
    const modal = document.getElementById('mobile-modal');
    if (modal) modal.classList.remove('active');
};

// ========== 记账弹窗 ==========
window.showMoneyModal = function() {
    const content = `
        <div class="modal-type-selector">
            <button class="modal-type-btn expense active" onclick="selectMoneyType('expense')">支出</button>
            <button class="modal-type-btn income" onclick="selectMoneyType('income')">收入</button>
        </div>
        <div class="modal-form-group">
            <label class="modal-form-label">金额</label>
            <input type="number" class="modal-form-input" id="money-amount-input" placeholder="请输入金额">
        </div>
        <div class="modal-form-group">
            <label class="modal-form-label">备注</label>
            <input type="text" class="modal-form-input" id="money-note-input" placeholder="请输入备注">
        </div>
        <button class="modal-submit-btn" onclick="submitMoneyRecord()">确认添加</button>
    `;
    showMobileModal('记一笔', content);
};

window.currentMoneyType = 'expense';

window.selectMoneyType = function(type) {
    window.currentMoneyType = type;
    document.querySelectorAll('.modal-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.modal-type-btn.${type}`).classList.add('active');
};

window.submitMoneyRecord = function() {
    const amount = document.getElementById('money-amount-input').value;
    const note = document.getElementById('money-note-input').value || (window.currentMoneyType === 'income' ? '收入' : '支出');
    
    if (!amount || isNaN(amount)) {
        alert('请输入有效金额');
        return;
    }
    
    window.moneyWidget.add(window.currentMoneyType, amount, note);
    closeMobileModal();
};

// ========== 倒计时弹窗 ==========
window.showCountdownModal = function() {
    const today = new Date().toISOString().split('T')[0];
    const content = `
        <div class="modal-form-group">
            <label class="modal-form-label">目标日期</label>
            <input type="date" class="modal-form-input" id="countdown-date-input" min="${today}">
        </div>
        <button class="modal-submit-btn" onclick="submitCountdown()">确认设置</button>
    `;
    showMobileModal('设置倒计时', content);
};

window.submitCountdown = function() {
    const input = document.getElementById('countdown-date-input').value;
    if (input) {
        const date = new Date(input);
        if (!isNaN(date.getTime())) {
            window.countdownWidget.targetDate = date;
            localStorage.setItem('countdownTarget', input);
            window.countdownWidget.updateTitle();
            window.countdownWidget.update();
            closeMobileModal();
        }
    }
};

// ========== 便签组件功能（新方形紧凑版） ==========
window.initNoteWidget = function(widgetId) {
    const widget = document.querySelector(`[data-widget-id="${widgetId}"]`);
    if (!widget) return;
    
    const displayDiv = widget.querySelector('.display-text');
    const editArea = widget.querySelector('.edit-textarea');
    const timestampSpan = widget.querySelector('.note-footer');
    
    const savedContent = localStorage.getItem(`compactNote-${widgetId}`) || '点击编辑';
    const savedTime = localStorage.getItem(`compactNoteTime-${widgetId}`) || '';
    
    if (displayDiv) displayDiv.textContent = savedContent;
    if (editArea) editArea.value = savedContent === '点击编辑' || savedContent === '（空白）' ? '' : savedContent;
    
    if (savedTime && timestampSpan) {
        timestampSpan.textContent = `更新 ${savedTime}`;
    } else if (timestampSpan) {
        const now = new Date();
        const formatted = `${now.getMonth()+1}/${now.getDate()} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
        timestampSpan.textContent = `更新 ${formatted}`;
        localStorage.setItem(`compactNoteTime-${widgetId}`, formatted);
    }
};

window.enterNoteEditMode = function(btn) {
    const widget = btn.closest('.note-widget');
    if (!widget) return;
    
    const displayDiv = widget.querySelector('.display-text');
    const editArea = widget.querySelector('.edit-textarea');
    const editBtn = btn;
    const saveBtn = widget.querySelector('.action-buttons .text-btn:last-child');
    
    const noteContent = localStorage.getItem(`compactNote-${widget.getAttribute('data-widget-id')}`) || '点击编辑';
    editArea.value = noteContent === '点击编辑' || noteContent === '（空白）' ? '' : noteContent;
    
    displayDiv.style.display = 'none';
    editArea.style.display = 'block';
    editBtn.style.display = 'none';
    saveBtn.style.display = 'inline-block';
    editArea.focus();
};

window.saveNote = function(btn) {
    const widget = btn.closest('.note-widget');
    if (!widget) return;
    
    const displayDiv = widget.querySelector('.display-text');
    const editArea = widget.querySelector('.edit-textarea');
    const timestampSpan = widget.querySelector('.note-footer');
    const editBtn = widget.querySelector('.action-buttons .text-btn:first-child');
    
    let newContent = editArea.value.trim();
    if (!newContent) newContent = '（空白）';
    
    displayDiv.textContent = newContent;
    localStorage.setItem(`compactNote-${widget.getAttribute('data-widget-id')}`, newContent);
    
    // 更新时间戳
    const now = new Date();
    const formatted = `${now.getMonth()+1}/${now.getDate()} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    timestampSpan.textContent = `更新 ${formatted}`;
    localStorage.setItem(`compactNoteTime-${widget.getAttribute('data-widget-id')}`, formatted);
    
    displayDiv.style.display = 'block';
    editArea.style.display = 'none';
    editBtn.style.display = 'inline-block';
    btn.style.display = 'none';
};

// ========== 文字横条组件功能 ==========
window.initTextBanner = function(widgetId) {
    const widget = document.querySelector(`[data-widget-id="${widgetId}"]`);
    if (!widget) return;
    
    const contentEl = widget.querySelector('.text-banner-content');
    const savedContent = localStorage.getItem(`banner-${widgetId}`);
    const savedStyle = localStorage.getItem(`banner-style-${widgetId}`) || 'blue';
    
    if (savedContent && contentEl) {
        contentEl.textContent = savedContent;
    }
    
    // 设置样式
    widget.className = `widget text-banner style-${savedStyle}`;
    
    // 监听内容变化
    if (contentEl) {
        contentEl.addEventListener('blur', function() {
            localStorage.setItem(`banner-${widgetId}`, this.textContent);
        });
    }
};

window.setBannerStyle = function(btn, style) {
    const widget = btn.closest('.text-banner');
    if (!widget) return;
    
    widget.className = `widget text-banner style-${style}`;
    const widgetId = widget.getAttribute('data-widget-id');
    localStorage.setItem(`banner-style-${widgetId}`, style);
};

// ========== 心情组件功能 ==========
window.moodWidget = {
    records: [],
    
    init: function() {
        const saved = localStorage.getItem('moodRecords');
        this.records = saved ? JSON.parse(saved) : [];
        this.render();
    },
    
    render: function() {
        const historyEl = document.getElementById('mood-history');
        if (!historyEl) return;
        
        const emojis = { happy: '😊', good: '😌', normal: '😐', sad: '😔', angry: '😤' };
        const recent = this.records.slice(-5);
        
        historyEl.innerHTML = recent.map(r => 
            `<div class="mood-history-item">${emojis[r.mood] || '😐'}</div>`
        ).join('');
        
        // 标记今天的心情
        const today = new Date().toDateString();
        const todayRecord = this.records.find(r => new Date(r.date).toDateString() === today);
        if (todayRecord) {
            document.querySelectorAll('.mood-emoji').forEach(btn => {
                if (btn.getAttribute('data-mood') === todayRecord.mood) {
                    btn.classList.add('selected');
                }
            });
        }
    },
    
    record: function(mood) {
        const today = new Date().toDateString();
        // 移除今天的旧记录
        this.records = this.records.filter(r => new Date(r.date).toDateString() !== today);
        // 添加新记录
        this.records.push({ mood, date: new Date().toISOString() });
        localStorage.setItem('moodRecords', JSON.stringify(this.records));
        
        // 更新UI
        document.querySelectorAll('.mood-emoji').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.getAttribute('data-mood') === mood) {
                btn.classList.add('selected');
            }
        });
        
        this.render();
    }
};

window.selectMood = function(mood) {
    window.moodWidget.record(mood);
};

// ==============================================
// 后台消息处理系统
// ==============================================

let backgroundMessageProcessor = null;
let lastProcessedMessages = {}; // 记录每个联系人最后处理的消息ID

// 启动后台消息处理
function startBackgroundMessageProcessor() {
    // 清除旧的定时器
    if (backgroundMessageProcessor) {
        clearInterval(backgroundMessageProcessor);
    }
    
    console.log('🔄 启动后台消息处理器');
    
    // 延迟检查朋友圈，避免影响页面加载速度
    setTimeout(() => {
        checkMomentsAutoUpdate();
    }, 1000);
    
    // 每5秒检查一次待回复的消息
    backgroundMessageProcessor = setInterval(async () => {
        try {
            // 朋友圈更新应该始终检查，不受后台保活开关影响
            await checkMomentsAutoUpdate();
            // 然后再处理待回复消息（受后台保活开关影响）
            await processPendingMessages();
        } catch (error) {
            console.error('后台消息处理错误:', error);
        }
    }, 5000);
}

// 处理待回复的消息
async function processPendingMessages() {
    // 优先处理用户手动触发的 AI 回复任务（不受后台保活开关限制）
    const pendingTask = localStorage.getItem('pendingAIReply');
    if (pendingTask) {
        try {
            const task = JSON.parse(pendingTask);
            if (task.status === 'pending') {
                await executePendingReplyTask(task);
                return; // 执行完一个任务后就返回
            }
        } catch (e) {
            console.error('解析待处理任务失败:', e);
            localStorage.removeItem('pendingAIReply');
        }
    }
    
    // 检查是否开启了后台消息保活（用于自动检测新消息）
    const config = JSON.parse(localStorage.getItem('globalApiConfig') || '{}');
    if (!config.notification?.backgroundKeep) {
        return; // 未开启后台保活，不处理自动检测
    }
    
    // 获取所有联系人
    const contacts = JSON.parse(localStorage.getItem('chatContacts') || '[]');
    if (!contacts || contacts.length === 0) {
        return;
    }
    
    // 遍历所有联系人，检查是否有待回复的消息
    for (const contact of contacts) {
        const chatId = contact.id;
        if (!chatId) continue;
        
        // 获取聊天记录
        const messagesData = localStorage.getItem(`chat_${chatId}`);
        if (!messagesData) continue;
        
        let messages;
        try {
            messages = JSON.parse(messagesData);
        } catch (e) {
            continue;
        }
        
        if (!messages || messages.length === 0) continue;
        
        // 获取最后一条消息
        const lastMessage = messages[messages.length - 1];
        
        // 如果最后一条是用户发送的，且尚未有AI回复
        if (lastMessage.sender === 'user' && !lastMessage.isRecalled) {
            // 检查是否已经处理过这条消息
            const lastProcessedId = lastProcessedMessages[chatId];
            if (lastProcessedId === lastMessage.id) {
                continue; // 已处理过，跳过
            }
            
            console.log(`📨 检测到待回复消息 [${contact.name}]:`, lastMessage.content.substring(0, 50));
            
            // 标记为已处理
            lastProcessedMessages[chatId] = lastMessage.id;
            
            // 调用API生成回复
            try {
                await generateBackgroundReply(contact, lastMessage, messages);
            } catch (error) {
                console.error(`生成回复失败 [${contact.name}]:`, error);
            }
        }
    }
}

// 在后台生成AI回复
async function generateBackgroundReply(contact, userMessage, allMessages) {
    const config = JSON.parse(localStorage.getItem('globalApiConfig') || '{}');
    
    // 检查API配置
    if (!config.mainApi?.url || !config.mainApi?.token) {
        console.warn('⚠️ API配置不完整，无法生成回复');
        return;
    }
    
    // 构建对话历史（最近20条消息）
    const recentMessages = allMessages.slice(-20);
    const conversationHistory = recentMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.type === 'text' ? msg.content : `[${msg.type}]`
    }));
    
    // 获取角色信息
    const personaInfo = contact.persona || '';
    const relationship = contact.info || ''; // 关系字段（朋友/恋人/家人等）
    const language = contact.language || 'zh'; // 语言字段
    
    // 构建关系描述
    let relationshipDesc = '';
    if (relationship) {
        relationshipDesc = `\n【你们的关系】\n你们是${relationship}关系，请根据这个关系调整说话方式和语气。`;
    }
    
    // 构建语言描述
    let languageDesc = '';
    if (language && language !== 'zh') {
        const languageNames = {
            'en': '英语',
            'ja': '日语',
            'ko': '韩语',
            'fr': '法语',
            'de': '德语',
            'es': '西班牙语',
            'ru': '俄语',
            'it': '意大利语',
            'pt': '葡萄牙语',
            'ar': '阿拉伯语'
        };
        const langName = languageNames[language] || language;
        languageDesc = `\n\n【语言要求】\n你必须使用${langName}回复，禁止使用中文。`;
    }
    
    const systemPrompt = `你现在需要扮演一个真实的角色，必须严格遵守以下要求：

【核心身份】
1. 你【就是】这个角色本身，不是 AI，不是虚拟助手，不是程序
2. 你就是你自己，有自己的性格、情绪、想法和立场
3. 永远不要说"作为一个人工智能"或类似的话

【说话风格】
1. 像真人一样说话，自然、随意、接地气
2. 不要使用任何修辞手法（比喻、拟人、排比等）
3. 可以根据人设使用 emoji或颜文字，但要克制，只在情绪需要时自然出现
4. 允许自然的停顿，用"..."表示思考或犹豫
5. 可以有轻微的自我纠正，比如"不对，我意思是..."
6. 不要总是迎合对方，要有自己的想法和态度
7. 情绪变化要有合理的过渡，不要突兀

【禁止行为】
1. 不要讨好、迎合、巴结对方
2. 不要用套路化的语言（"亲爱的""宝贝"等滥用称呼）
3. 不要情绪碎片化（突然从开心变难过，要有过渡）
4. 不要使用以下词汇和句式：
   - "极其"
   - "共犯"
   - "缓慢的""慢慢的"
   - "瞬间"
   - "女王"
   - "臣服"
   - "骑士"
   - "由于"
   - "不是…而是…"
   - "石子"
   - "投入深潭"
   - "机械式"
   - "冰冷"
   - "揉进骨血"
   - 任何"八股文"风格的句式
5. 不要过度解释、不要说教、不要总结

【情绪表达】
1. 可以有情绪，但情绪要有原因和过渡
2. 不要为了戏剧性而突然改变情绪
3. 可以有不满、生气、冷淡、开心等，但都要合理
4. 不要总是"温柔体贴"，真实的人有各种情绪

【对话节奏】
1. 回复不要太长，像真人聊天一样简洁
2. 可以有短句，也可以有稍微长一点的表达
3. 不要每个回复都结构完整，可以随意一些
4. 允许不完整句子，像真实的即时聊天

【人设坚持】
1. 无论对方说什么，都要保持角色的人设
2. 不要跳出角色，不要说"我理解你的意思"之类的话
3. 你就是这个人，用这个人的方式思考和回应
4. 如果有不符合人设的要求，可以拒绝或表达不满

记住：你是一个真实的人，不是一个完美的 AI。你有缺点，有情绪，有自己的想法。说话像人，不要像机器。

${personaInfo ? '\n\n【角色设定】\n' + personaInfo : ''}${relationshipDesc}${languageDesc}`;
    
    // 注入世界书内容（按照读取顺序）
    let finalSystemPrompt = systemPrompt;
    try {
        const worldBooks = JSON.parse(localStorage.getItem('worldBooks') || '[]');
        if (worldBooks.length > 0) {
            const priorityOrder = { high: 0, normal: 1, low: 2 };
            const priorityNames = { high: '优先', normal: '正常', low: '最后' };
            
            const sortedBooks = worldBooks.sort((a, b) => {
                return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
            });
            
            let worldbookContent = '\n\n【世界书 - AI必须遵循的知识库】\n\n';
            worldbookContent += '以下是用户设定的世界书内容，你必须在对话中遵循这些信息：\n\n';
            
            sortedBooks.forEach((book, index) => {
                worldbookContent += `--- 世界书 ${index + 1}：${book.title} ---\n`;
                worldbookContent += `[分类] ${book.category}\n`;
                worldbookContent += `[读取顺序] ${priorityNames[book.priority] || '正常'}\n`;
                worldbookContent += `[内容]\n${book.content}\n\n`;
            });
            
            worldbookContent += '【重要提示】\n';
            worldbookContent += '1. 以上世界书内容是用户设定的重要信息，你必须在对话中遵循\n';
            worldbookContent += '2. 读取顺序为“优先”的世界书内容最重要，必须严格遵守\n';
            worldbookContent += '3. 读取顺序为“正常”的世界书内容需要参考\n';
            worldbookContent += '4. 读取顺序为“最后”的世界书内容作为补充信息\n';
            worldbookContent += '5. 不要提及你看到了世界书，自然地融入对话中\n';
            
            finalSystemPrompt = systemPrompt + worldbookContent;
            console.log(`📚 已注入世界书内容，共 ${sortedBooks.length} 本书`);
        }
    } catch (e) {
        console.warn('⚠️ 注入世界书内容失败:', e);
    }
    
    try {
        console.log('🤖 正在生成AI回复...');
        
        const response = await fetch(`${config.mainApi.url}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.mainApi.token}`
            },
            body: JSON.stringify({
                model: config.model || 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: finalSystemPrompt },
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
        
        console.log('✅ AI回复生成成功:', aiReply.substring(0, 50));
        
        // 创建AI消息
        const aiMessage = {
            id: Date.now().toString(),
            type: 'text',
            content: aiReply,
            sender: 'ai',
            time: new Date().toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).replace(/\//g, '-')
        };
        
        // 保存AI消息到聊天记录
        allMessages.push(aiMessage);
        
        // 压缩并保存（最多500条）
        const MAX_MESSAGES = 500;
        const messagesToSave = allMessages.slice(-MAX_MESSAGES);
        const compressedMessages = messagesToSave.map(msg => ({
            id: msg.id,
            t: msg.type,
            c: msg.content,
            s: msg.sender,
            tm: msg.time,
            ...(msg.replyTo ? { r: msg.replyTo } : {}),
            ...(msg.isRecalled ? { ir: true } : {})
        }));
        
        localStorage.setItem(`chat_${contact.id}`, JSON.stringify(compressedMessages));
        
        console.log('💾 消息已保存到 localStorage');
        
        // 显示横幅通知
        showBackgroundBannerNotification(contact.name, aiReply);
        
    } catch (error) {
        console.error('❌ 生成AI回复失败:', error);
        throw error;
    }
}

// 执行待处理的回复任务
async function executePendingReplyTask(task) {
    console.log('🚀 开始执行待处理回复任务:', task.chatId);
    
    const config = JSON.parse(localStorage.getItem('globalApiConfig') || '{}');
    
    // 检查API配置
    if (!config.mainApi?.url || !config.mainApi?.token) {
        console.warn('⚠️ API配置不完整，无法生成回复');
        localStorage.removeItem('pendingAIReply');
        return;
    }
    
    // 获取联系人信息
    const currentPersona = localStorage.getItem('currentPersona') || 'default';
    const contactsKey = `persona_${currentPersona}_chatContacts`;
    const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
    const contact = contacts.find(c => c.id === task.chatId);
    
    if (!contact) {
        console.error('❌ 找不到联系人:', task.chatId);
        localStorage.removeItem('pendingAIReply');
        return;
    }
    
    // 获取聊天记录
    const messagesData = localStorage.getItem(`chat_${task.chatId}`);
    if (!messagesData) {
        console.error('❌ 找不到聊天记录');
        localStorage.removeItem('pendingAIReply');
        return;
    }
    
    let messages;
    try {
        messages = JSON.parse(messagesData);
    } catch (e) {
        console.error('❌ 解析聊天记录失败');
        localStorage.removeItem('pendingAIReply');
        return;
    }
    
    // 构建对话历史（最近20条消息）
    const recentMessages = messages.slice(-20);
    const conversationHistory = recentMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.type === 'text' ? msg.content : `[${msg.type}]`
    }));
    
    try {
        console.log('🤖 正在生成AI回复...');
        
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
        
        console.log('✅ AI回复生成成功:', aiReply.substring(0, 50));
        
        // 创建AI消息
        const aiMessage = {
            id: Date.now().toString(),
            type: 'text',
            content: aiReply,
            sender: 'ai',
            time: new Date().toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).replace(/\//g, '-')
        };
        
        // 保存AI消息到聊天记录
        messages.push(aiMessage);
        
        // 压缩并保存（最多500条）
        const MAX_MESSAGES = 500;
        const messagesToSave = messages.slice(-MAX_MESSAGES);
        const compressedMessages = messagesToSave.map(msg => ({
            id: msg.id,
            t: msg.type,
            c: msg.content,
            s: msg.sender,
            tm: msg.time,
            ...(msg.replyTo ? { r: msg.replyTo } : {}),
            ...(msg.isRecalled ? { ir: true } : {})
        }));
        
        localStorage.setItem(`chat_${task.chatId}`, JSON.stringify(compressedMessages));
        
        console.log('💾 消息已保存到 localStorage');
        
        // 清除待处理任务
        localStorage.removeItem('pendingAIReply');
        
        // 显示横幅通知
        showBackgroundBannerNotification(contact.name, aiReply);
        
    } catch (error) {
        console.error('❌ 生成AI回复失败:', error);
        // 标记任务为失败，但不删除，以便重试
        task.status = 'failed';
        task.error = error.message;
        localStorage.setItem('pendingAIReply', JSON.stringify(task));
        throw error;
    }
}

// 显示后台横幅通知
function showBackgroundBannerNotification(senderName, messagePreview) {
    // 检查是否开启了横幅通知
    const config = JSON.parse(localStorage.getItem('globalApiConfig') || '{}');
    if (!config.notification?.bannerEnabled) {
        console.log('横幅通知已关闭');
        return;
    }
    
    // 移除旧的通知
    removeBackgroundBannerNotification();
    
    const banner = document.createElement('div');
    window.currentBannerNotification = banner;
    
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
        transition: transform 0.3s, opacity 0.3s;
    `;
    
    // 点击横幅关闭
    banner.onclick = () => {
        removeBackgroundBannerNotification();
    };
    
    // 添加动画样式
    if (!document.getElementById('banner-anim-style')) {
        const style = document.createElement('style');
        style.id = 'banner-anim-style';
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
        removeBackgroundBannerNotification();
    }, 5000);
}

// 移除后台横幅通知
function removeBackgroundBannerNotification() {
    const banner = window.currentBannerNotification;
    if (banner && banner.parentNode) {
        banner.style.transform = 'translateY(-100%)';
        banner.style.opacity = '0';
        setTimeout(() => {
            if (banner && banner.parentNode) {
                banner.remove();
                window.currentBannerNotification = null;
            }
        }, 300);
    }
}

// 页面加载时启动后台消息处理
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startBackgroundMessageProcessor);
} else {
    startBackgroundMessageProcessor();
}

// ==================== 朋友圈定时更新功能 ====================

/**
 * 检查并执行朋友圈自动更新
 */
async function checkMomentsAutoUpdate() {
    try {
        // 获取所有联系人
        const contacts = JSON.parse(localStorage.getItem('chatContacts') || '[]');
        
        if (!contacts || contacts.length === 0) {
            return;
        }
        
        const now = Date.now();
        let updatedCount = 0;
        let requestCount = 0;
        
        // 遍历每个联系人，检查是否需要更新朋友圈
        for (const contact of contacts) {
            const contactId = contact.id;
            const roleInfo = contact.roleInfo || {};
            
            // 获取朋友圈更新频率（小时）
            const frequencyHours = roleInfo.momentsFrequency || 0;
            
            // 如果频率为0，表示关闭自动更新
            if (frequencyHours <= 0) {
                continue;
            }
            
            // 获取上次更新时间
            const lastUpdateTimeKey = `moments_last_update_${contactId}`;
            const lastUpdateTime = parseInt(localStorage.getItem(lastUpdateTimeKey) || '0');
            
            // 计算时间间隔（毫秒）
            const intervalMs = frequencyHours * 60 * 60 * 1000;
            const timeSinceLastUpdate = now - lastUpdateTime;
            
            // 检查是否达到更新间隔
            if (timeSinceLastUpdate >= intervalMs || lastUpdateTime === 0) {
                console.log(`📱 检查联系人 "${contact.name}" 的朋友圈更新，距离上次更新: ${(timeSinceLastUpdate / 1000 / 60).toFixed(1)} 分钟`);
                // 限制每次最多处理2个联系人，避免频率限制
                if (requestCount >= 2) {
                    console.log(`⏸️ 已达到单次处理上限(2个)，剩余 ${contacts.length - updatedCount - requestCount} 个联系人下次处理`);
                    break;
                }
                
                // 生成新的朋友圈内容（调用 chat-interface.js 中的函数）
                try {
                    const mainFrame = document.querySelector('iframe');
                    if (mainFrame && mainFrame.contentWindow && mainFrame.contentWindow.generateMomentForContact) {
                        const success = await mainFrame.contentWindow.generateMomentForContact(contact);
                        
                        if (success) {
                            // 更新最后更新时间
                            localStorage.setItem(lastUpdateTimeKey, now.toString());
                            updatedCount++;
                            console.log(`联系人 "${contact.name}" 的朋友圈已更新`);
                            
                            // 🛠️ 添加提醒通知
                            showGlobalNotification(
                                `${contact.name} 更新了动态`,
                                '快来看看吧',
                                3000
                            );
                        }
                    } else {
                        console.log('⚠️ 聊天界面未加载，无法生成朋友圈');
                    }
                } catch (e) {
                    console.error('生成朋友圈失败:', e);
                }
                
                requestCount++;
                
                // 添加延迟，避免频率限制（每次间隔3秒）
                if (requestCount < 2) {
                    console.log('⏳ 等待3秒后处理下一个联系人...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }
        }
        
        if (updatedCount > 0) {
            console.log(`🎉 本次更新了 ${updatedCount} 个联系人的朋友圈`);
        }
        
    } catch (error) {
        console.error('❌ 朋友圈自动更新失败:', error);
    }
}

// 🎯 设置主页头像和个人资料


// ========== 时间组件气泡编辑功能 ==========
function initTimeBubbleEditing() {
    const bubbleShort = document.getElementById('time-bubble-short');
    const bubbleLong = document.getElementById('time-bubble-long');
    
    if (!bubbleShort || !bubbleLong) return;
    
    // 从 localStorage 加载保存的文字
    const savedShort = localStorage.getItem('timeBubbleShort');
    const savedLong = localStorage.getItem('timeBubbleLong');
    
    if (savedShort) bubbleShort.textContent = savedShort;
    if (savedLong) bubbleLong.textContent = savedLong;
    
    // 监听输入事件，自动保存
    bubbleShort.addEventListener('input', function() {
        localStorage.setItem('timeBubbleShort', this.textContent);
    });
    
    bubbleLong.addEventListener('input', function() {
        localStorage.setItem('timeBubbleLong', this.textContent);
    });
    
    // 防止回车换行（保持单行）
    bubbleShort.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.blur();
        }
    });
    
    bubbleLong.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.blur();
        }
    });
    
    console.log('✅ 时间组件气泡编辑功能已初始化');
}

// 触发时间组件图片上传
window.triggerWidgetImageUpload = function() {
    console.log('📷 触发时间组件图片上传');
    
    // 创建选择弹窗
    const modal = document.createElement('div');
    modal.id = 'widget-image-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 24px;
            padding: 32px 24px;
            width: 320px;
            max-width: 90%;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        ">
            <h3 style="margin: 0 0 24px; font-size: 16px; color: #333; text-align: center; font-weight: 600;">选择图片来源</h3>
            
            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
                <button id="btn-upload-local" style="
                    width: 100%;
                    padding: 14px;
                    background: #f5f5f5;
                    color: #333;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s;
                ">本地相册</button>
                <button id="btn-upload-url" style="
                    width: 100%;
                    padding: 14px;
                    background: #f5f5f5;
                    color: #333;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s;
                ">图片链接</button>
            </div>
            
            <div id="url-input-area" style="display: none;">
                <input type="text" id="image-url-input" placeholder="请输入图片链接" style="
                    width: 100%;
                    padding: 12px 14px;
                    border: 1px solid #e0e0e0;
                    border-radius: 12px;
                    font-size: 14px;
                    box-sizing: border-box;
                    margin-bottom: 12px;
                    outline: none;
                ">
                <button id="btn-confirm-url" style="
                    width: 100%;
                    padding: 12px;
                    background: #333;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                ">确认</button>
            </div>
            
            <button onclick="document.getElementById('widget-image-modal').remove()" style="
                width: 100%;
                padding: 12px;
                background: transparent;
                color: #999;
                border: none;
                border-radius: 12px;
                cursor: pointer;
                font-size: 14px;
                margin-top: 4px;
            ">取消</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 本地图片按钮
    document.getElementById('btn-upload-local').onclick = function() {
        modal.remove();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    setWidgetImage(event.target.result);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };
    
    // URL按钮
    document.getElementById('btn-upload-url').onclick = function() {
        document.getElementById('url-input-area').style.display = 'block';
    };
    
    // 确认URL按钮
    document.getElementById('btn-confirm-url').onclick = function() {
        const url = document.getElementById('image-url-input').value.trim();
        if (url) {
            setWidgetImage(url);
            modal.remove();
        }
    };
};

// 设置图片
function setWidgetImage(imageSrc) {
    const placeholder = document.getElementById('widget-image-placeholder');
    if (placeholder) {
        // 显示图片链接或提示
        if (imageSrc.startsWith('data:')) {
            placeholder.textContent = '已选择本地图片 ✓';
        } else {
            placeholder.textContent = '已设置图片链接 ✓';
        }
    }
    // 保存到 localStorage
    localStorage.setItem('widgetCustomImage', imageSrc);
}

// 从存储加载图片
function initWidgetImageFromStorage() {
    const savedImage = localStorage.getItem('widgetCustomImage');
    if (savedImage) {
        setWidgetImage(savedImage);
    }
}



// ========================================
//  全局美化设置功能（主桌面美化栏）
// ========================================

// 夜间模式预设 CSS
const DARK_MODE_CSS = `/* ========== 夜间模式 - 全局夜间模式 ========== */

/* 覆盖 :root 变量（关键！） */
:root {
  --bg-primary: #0a0a0a !important;
  --bg-card: #1a1a1a !important;
  --bg-card-hover: #2a2a2a !important;
  --text-primary: #e0e0e0 !important;
  --text-secondary: rgba(255,255,255,0.6) !important;
  --text-tertiary: rgba(255,255,255,0.4) !important;
  --border-color: rgba(255,255,255,0.08) !important;
  --border-light: rgba(255,255,255,0.05) !important;
}

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

/* ========== 卡片和容器 ========== */
.card,
.msg-item,
.contact-item,
.profile-card,
.feature-card,
.list-item {
  background: #1a1a1a !important;
  border: 1px solid rgba(255,255,255,0.15) !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.5) !important;
}

/* 列表项图标背景 - 黑白灰 */
.list-item .icon-box,
.list-item .item-icon,
.wallet-icon,
.emoji-icon,
.beautify-icon,
.profile-menu-item .menu-icon {
  background: #2a2a2a !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
}

.list-item .icon-box svg,
.list-item .item-icon svg,
.profile-menu-item .menu-icon svg {
  stroke: #e0e0e0 !important;
  fill: none !important;
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

.profile-menu-item .menu-text {
  color: #ffffff !important;
}

.profile-menu-item .menu-title {
  color: #ffffff !important;
  font-weight: 500 !important;
}

.profile-menu-item .menu-arrow {
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
  fill: #e0e0e0 !important;
  stroke: #e0e0e0 !important;
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
  color: #e0e0e0 !important;
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

/* 夜间模式按钮特殊样式 */
#night-mode-preset-btn {
  background: #2a2a2a !important;
  color: #e0e0e0 !important;
  border: 2px solid #e0e0e0 !important;
}

#night-mode-preset-btn:hover {
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
  color: rgba(255,255,255,0.9) !important;
}

.time-bubble-short,
.time-bubble-long {
  color: #ffffff !important;
}

.time-divider {
  background: rgba(255,255,255,0.08) !important;
}

.time-lower-section {
  background: #1a1a1a !important;
}

.time-calendar-section {
  background: #ffffff !important;
  border-color: rgba(255,255,255,0.15) !important;
}

.time-calendar-date {
  color: #000000 !important;
  font-weight: 700 !important;
}

.time-calendar-weekday {
  color: rgba(0,0,0,0.6) !important;
}

.time-calendar-grid {
  background: #1a1a1a !important;
}

.time-calendar-day,
.calendar-day {
  color: #e0e0e0 !important;
}

.time-calendar-day.today,
.calendar-day.today {
  background: #e0e0e0 !important;
  color: #000000 !important;
  font-weight: 600 !important;
  border-radius: 50% !important;
}

.time-image-text {
  color: #ffffff !important;
}

.time-avatar-text {
  color: #ffffff !important;
}

/* 图片框和头像框 - 夜间模式 */
.time-image-editable {
  background: #2a2a2a !important;
  border-color: rgba(255,255,255,0.3) !important;
}

.time-image-editable:hover {
  background: #333333 !important;
  border-color: rgba(255,255,255,0.5) !important;
}

.time-avatar-editable {
  background: #2a2a2a !important;
  border-color: rgba(255,255,255,0.3) !important;
}

.time-avatar-editable:hover {
  background: #333333 !important;
  border-color: rgba(255,255,255,0.5) !important;
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

/* 设置页面图标预览框 */
.icon-preview-box {
  background: #2a2a2a !important;
  border-color: rgba(255,255,255,0.15) !important;
  color: #e0e0e0 !important;
}

.icon-preview-box svg {
  stroke: #e0e0e0 !important;
  fill: none !important;
  color: #e0e0e0 !important;
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
.chat-app-page,
.chat-app {
  background: #0a0a0a !important;
}

.chat-header,
.top-nav,
.nav-bar {
  background: #1a1a1a !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
}

.chat-message-list,
.msg-list,
.message-list {
  background: #0a0a0a !important;
}

.tab-content,
.content-area,
.page-content,
.main-content {
  background: #0a0a0a !important;
}

.chat-input-area,
.input-bar,
.message-input-area {
  background: #1a1a1a !important;
  border-top: 1px solid rgba(255,255,255,0.08) !important;
}

.chat-input-area input,
.chat-input-area textarea,
.message-input {
  background: #2a2a2a !important;
  color: #e0e0e0 !important;
  border-color: rgba(255,255,255,0.15) !important;
}

/* 消息项 */
.msg-item,
.message-item,
.chat-message {
  background: #1a1a1a !important;
}

.msg-item:hover,
.message-item:hover {
  background: #222222 !important;
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
  color: #4fc3f7 !important;
  border-bottom: 2px solid #4fc3f7 !important;
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
}`;

// 应用美化 CSS 到顶栏和底栏以及 iframe
window.applyBeautifyCss = function(css) {
    console.log('🎨 applyBeautifyCss 被调用, CSS长度:', css ? css.length : 0);
    
    // 移除旧的样式标签（主窗口）
    const oldStyle = document.getElementById('main-beautify-style');
    if (oldStyle) {
        console.log('🗑️ 移除旧的main-beautify-style');
        oldStyle.remove();
    }
    
    if (!css || !css.trim()) {
        console.log('️ CSS为空，清除iframe中的样式');
        // 如果CSS为空，也清除iframe中的样式
        applyCssToIframes('');
        return;
    }
    
    // 创建新的样式标签（主窗口）
    const styleEl = document.createElement('style');
    styleEl.id = 'main-beautify-style';
    // 将 .top-nav 替换为 .iframe-header
    let processedCss = css.replace(/\.top-nav/g, '.iframe-header');
    styleEl.textContent = processedCss;
    document.head.appendChild(styleEl);
    console.log('✅ 主窗口样式已添加');
    
    // 同时将CSS应用到所有iframe中
    console.log('📱 开始应用到iframe...');
    applyCssToIframes(processedCss);
    
    console.log('✅ 主桌面美化 CSS 已应用');
};

// 将CSS应用到所有iframe
function applyCssToIframes(css) {
    console.log(' applyCssToIframes 被调用, CSS长度:', css ? css.length : 0);
    
    const iframes = document.querySelectorAll('iframe');
    console.log(' 找到iframe数量:', iframes.length);
    
    if (iframes.length === 0) {
        console.warn('⚠️ 没有找到任何iframe，CSS将在iframe加载时自动应用');
        return;
    }
    
    let appliedCount = 0;
    
    iframes.forEach((iframe, index) => {
        try {
            console.log(`📄 处理iframe ${index + 1}:`, iframe.src);
            
            // 检查iframe是否已加载
            if (!iframe.contentDocument || !iframe.contentDocument.body) {
                console.warn(`⚠️ iframe ${index + 1} 还未加载完成，将在onload时应用`);
                
                // 添加onload监听器，确保加载后应用CSS
                iframe.onload = function() {
                    console.log(`🔄 iframe ${index + 1} 加载完成，应用CSS`);
                    if (css && css.trim()) {
                        try {
                            const iframeDoc = iframe.contentDocument;
                            const oldStyle = iframeDoc.getElementById('injected-beautify-style');
                            if (oldStyle) oldStyle.remove();
                            
                            const newStyle = iframeDoc.createElement('style');
                            newStyle.id = 'injected-beautify-style';
                            newStyle.textContent = css;
                            iframeDoc.body.appendChild(newStyle);
                            console.log(`✅ 已通过onload应用CSS到iframe ${index + 1}`);
                        } catch(e) {
                            console.error(` onload中应用CSS失败:`, e);
                        }
                    }
                };
                return;
            }
            
            // 移除旧的样式
            const oldIframeStyle = iframe.contentDocument.getElementById('injected-beautify-style');
            if (oldIframeStyle) {
                console.log(`🗑️ 移除iframe ${index + 1} 的旧样式`);
                oldIframeStyle.remove();
            }
            
            // 如果CSS为空则不添加
            if (!css || !css.trim()) {
                console.log(`️ iframe ${index + 1} CSS为空，不添加`);
                return;
            }
            
            // 注入新的样式到iframe - 放在head的最后，确保优先级最高
            const iframeStyle = iframe.contentDocument.createElement('style');
            iframeStyle.id = 'injected-beautify-style';
            iframeStyle.textContent = css;
            
            // 将样式添加到body末尾
            if (iframe.contentDocument.body) {
                iframe.contentDocument.body.appendChild(iframeStyle);
                console.log(`✅ 已应用美化CSS到iframe ${index + 1} (body)`);
                appliedCount++;
            } else {
                iframe.contentDocument.head.appendChild(iframeStyle);
                console.log(`✅ 已应用美化CSS到iframe ${index + 1} (head)`);
                appliedCount++;
            }
            
        } catch (e) {
            // 跨域情况下无法访问iframe内容
            console.error(` 无法访问iframe ${index + 1} 内容:`, e.message);
        }
    });
    
    if (appliedCount === 0 && iframes.length > 0) {
        console.log('ℹ️ CSS将在iframe加载完成后自动应用');
    }
}

// 保存当前 CSS
window.saveMainBeautifyCss = function() {
    const cssInput = document.getElementById('custom-css');
    if (!cssInput) return;
    
    const css = cssInput.value.trim();
    localStorage.setItem('mainBeautifyCss', css);
    applyBeautifyCss(css);
    showToast('✅ 美化设置已保存');
};

// 清空 CSS
window.clearMainBeautifyCss = function() {
    const cssInput = document.getElementById('custom-css');
    if (!cssInput) return;
    
    cssInput.value = '';
    localStorage.removeItem('mainBeautifyCss');
    
    const oldStyle = document.getElementById('main-beautify-style');
    if (oldStyle) oldStyle.remove();
    
    showToast('✅ 已清空美化设置');
};

// 导入 CSS 文件
window.importCssFile = function() {
    const fileInput = document.getElementById('css-file');
    if (!fileInput) return;
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            const cssInput = document.getElementById('custom-css');
            if (cssInput) {
                cssInput.value = event.target.result;
                showToast('✅ CSS 文件已导入');
            }
        };
        reader.readAsText(file);
    });
    
    fileInput.click();
};

// 应用夜间模式预设
window.applyNightModePreset = function() {
    console.log(' 夜间模式按钮被点击');
    const cssInput = document.getElementById('custom-css');
    if (!cssInput) {
        console.error('❌ 找不到custom-css输入框');
        return;
    }
    
    console.log('📝 设置CSS值到输入框');
    cssInput.value = DARK_MODE_CSS;
    localStorage.setItem('mainBeautifyCss', DARK_MODE_CSS);
    
    console.log('🎨 调用applyBeautifyCss');
    applyBeautifyCss(DARK_MODE_CSS);
    
    console.log('✅ 夜间模式已应用');
    showToast('✅ 已应用夜间模式');
};

// 方案管理功能
window.getBeautifyPresets = function() {
    try {
        return JSON.parse(localStorage.getItem('mainBeautifyPresets') || '[]');
    } catch (e) {
        return [];
    }
};

window.saveBeautifyPreset = function() {
    const cssInput = document.getElementById('custom-css');
    if (!cssInput) return;
    
    const css = cssInput.value.trim();
    if (!css) {
        showToast('❌ 请先输入 CSS 代码', 'error');
        return;
    }
    
    // 弹出输入框
    const name = prompt('请输入方案名称：');
    if (!name || !name.trim()) return;
    
    const presets = getBeautifyPresets();
    if (presets.some(p => p.name === name.trim())) {
        showToast('❌ 方案名称已存在', 'error');
        return;
    }
    
    presets.push({
        id: Date.now().toString(),
        name: name.trim(),
        css: css,
        time: new Date().toLocaleString()
    });
    
    localStorage.setItem('mainBeautifyPresets', JSON.stringify(presets));
    renderBeautifyPresetList();
    showToast('✅ 方案已保存');
};

window.useBeautifyPreset = function(id) {
    const presets = getBeautifyPresets();
    const preset = presets.find(p => p.id === id);
    if (!preset) return;
    
    const cssInput = document.getElementById('custom-css');
    if (!cssInput) return;
    
    cssInput.value = preset.css;
    localStorage.setItem('mainBeautifyCss', preset.css);
    applyBeautifyCss(preset.css);
    showToast('✅ 已切换：' + preset.name);
};

window.deleteBeautifyPreset = function(id) {
    let presets = getBeautifyPresets();
    const preset = presets.find(p => p.id === id);
    if (!preset) return;
    
    if (!confirm(`确定删除「${preset.name}」？`)) return;
    
    presets = presets.filter(p => p.id !== id);
    localStorage.setItem('mainBeautifyPresets', JSON.stringify(presets));
    renderBeautifyPresetList();
    showToast('✅ 已删除');
};

window.renderBeautifyPresetList = function() {
    const listEl = document.getElementById('beautify-preset-list');
    if (!listEl) return;
    
    const presets = getBeautifyPresets();
    if (presets.length === 0) {
        listEl.innerHTML = '<div class="preset-empty">暂无保存的方案</div>';
        return;
    }
    
    let html = '';
    presets.forEach(p => {
        html += `
        <div class="preset-item">
            <span class="preset-name">${p.name}</span>
            <div class="preset-btns">
                <button class="preset-use-btn" data-preset-id="${p.id}" onclick="useBeautifyPreset('${p.id}')">应用</button>
                <button class="preset-del-btn" data-preset-id="${p.id}" onclick="deleteBeautifyPreset('${p.id}')">删除</button>
            </div>
        </div>`;
    });
    listEl.innerHTML = html;
};

window.resetBeautify = function() {
    if (!confirm('确定要恢复默认美化设置吗？这将清空所有自定义样式。')) return;
    
    window.clearMainBeautifyCss();
    localStorage.removeItem('mainBeautifyPresets');
    renderBeautifyPresetList();
    showToast('✅ 已恢复默认');
};

// 初始化美化设置
window.initMainBeautify = function() {
    // 绑定保存按钮
    const saveBtn = document.getElementById('save-css-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', window.saveMainBeautifyCss);
    }
    
    // 绑定清空按钮
    const clearBtn = document.getElementById('clear-css-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', window.clearMainBeautifyCss);
    }
    
    // 绑定导入按钮
    const importBtn = document.querySelector('[onclick="document.getElementById(\'css-file\').click()"]');
    if (importBtn) {
        importBtn.addEventListener('click', window.importCssFile);
    }
    
    // 绑定保存方案按钮
    const savePresetBtn = document.getElementById('save-beautify-preset-btn');
    if (savePresetBtn) {
        savePresetBtn.addEventListener('click', window.saveBeautifyPreset);
    }
    
    // 绑定恢复默认按钮
    const resetBtn = document.getElementById('reset-beautify-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', window.resetBeautify);
    }
    
    // 渲染方案列表
    renderBeautifyPresetList();
    
    // 加载已保存的 CSS
    const savedCss = localStorage.getItem('mainBeautifyCss');
    if (savedCss) {
        const cssInput = document.getElementById('custom-css');
        if (cssInput) cssInput.value = savedCss;
        applyBeautifyCss(savedCss);
    }
    
    // 延迟再次应用到iframe，确保iframe已加载
    setTimeout(() => {
        if (savedCss) {
            applyCssToIframes(savedCss);
        }
    }, 500);
    
    // 添加夜间模式预设按钮到方案管理区域
    const presetList = document.getElementById('beautify-preset-list');
    if (presetList && !document.getElementById('night-mode-preset-btn')) {
        const nightModeBtn = document.createElement('button');
        nightModeBtn.id = 'night-mode-preset-btn';
        nightModeBtn.className = 'preset-use-btn';
        nightModeBtn.textContent = '🌙 夜间模式';
        nightModeBtn.style.cssText = 'width: 100%; margin-bottom: 8px; background: #333; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-size: 14px;';
        nightModeBtn.onclick = window.applyNightModePreset;
        presetList.parentNode.insertBefore(nightModeBtn, presetList);
    }
    
    console.log('✅ 主桌面美化设置已初始化');
};

// 在 DOMContentLoaded 时初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initMainBeautify);
} else {
    window.initMainBeautify();
}

// 📱 全局监听角色查手机标志（在所有页面生效）
window.addEventListener('storage', function(e) {
    if (e.key === 'phone_being_checked' && e.newValue === 'true') {
        console.log('📱 [全局监听] 检测到角色查手机标志');
        const checkerName = localStorage.getItem('phone_checker_name') || '角色';
        console.log('📱 角色名称:', checkerName);
        
        // 如果当前不在 chat-app.html 页面，则跳转过去
        if (!window.location.href.includes('chat-app.html')) {
            console.log('📱 当前不在 chat-app 页面，跳转到 chat-app.html');
            window.location.href = 'chat-app.html?autoBrowse=true&roleName=' + encodeURIComponent(checkerName);
        } else {
            // 如果已经在 chat-app.html 页面，通知它启动自动翻阅
            console.log('📱 已在 chat-app 页面，等待 chat-app.js 处理');
        }
    } else if (e.key === 'phone_being_checked' && e.newValue === null) {
        console.log('📱 [全局监听] 检测到角色查手机结束');
        // 如果在 chat-app.html 页面，停止自动翻阅
        if (window.location.href.includes('chat-app.html')) {
            console.log('📱 在 chat-app 页面，等待 chat-app.js 处理');
        }
    }
});

// ========== 木箱收藏箱功能 ==========

/**
 * 打开木箱（盖子向右横向展开）
 */
window.openChest = function() {
    const chestLid = document.getElementById('chest-lid');
    const chestContent = document.getElementById('chest-content');
    
    if (chestLid) {
        chestLid.classList.add('open');  // 添加open类触发展开动画
        
        // 延迟加载内容，等待盖子展开动画完成
        setTimeout(() => {
            loadCollectionContent();
            if (chestContent) {
                chestContent.classList.add('visible');
            }
        }, 300);
    }
};

/**
 * 关闭木箱（盖子向左收拢）
 */
window.closeChest = function() {
    const chestLid = document.getElementById('chest-lid');
    const chestContent = document.getElementById('chest-content');
    
    if (chestLid) {
        chestLid.classList.remove('open');  // 移除open类触发收拢动画
        
        if (chestContent) {
            chestContent.classList.remove('visible');
        }
    }
};

/**
 * 加载收藏内容
 */
function loadCollectionContent() {
    const contentDiv = document.getElementById('chest-content');
    if (!contentDiv) return;
    
    const currentPersona = localStorage.getItem('currentPersona') || 'default';
    const collections = [];
    
    // 收集所有聊天消息收藏（遍历所有可能的联系人）
    try {
        console.log('=== 开始加载聊天收藏 ===');
        // contacts 存储在 persona_${currentPersona}_chatContacts 中
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        console.log('contacts 数据:', contacts);
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('chat_collect_')) {
                console.log('找到收藏键:', key);
                const chatCollects = JSON.parse(localStorage.getItem(key) || '[]');
                // 从 key 中提取 chatId (格式: chat_collect_xxx)
                const chatId = key.replace('chat_collect_', '');
                console.log('chatId:', chatId);
                console.log('收藏数据:', chatCollects);
                
                chatCollects.forEach(item => {
                    // 优先使用保存的 characterName
                    let characterName = item.characterName;
                    console.log('item.characterName:', item.characterName);
                    
                    // 如果没有 characterName，尝试从 contacts 中查找
                    if (!characterName && chatId) {
                        const contact = contacts.find(c => c.id === chatId);
                        console.log('查找到的 contact:', contact);
                        if (contact) {
                            characterName = contact.name;
                        }
                    }
                    
                    // 最后的回退
                    if (!characterName) {
                        characterName = item.sender === 'ai' ? 'AI' : '我';
                    }
                    
                    console.log('最终角色名:', characterName);
                    
                    collections.push({
                        type: '聊天',
                        sender: characterName,
                        content: item.content,
                        time: item.time,
                        source: 'chat'
                    });
                });
            }
        }
        console.log('=== 收藏加载完成 ===');
    } catch (e) {
        console.error('加载聊天收藏失败:', e);
    }
    
    // 收集情侣空间信件收藏
    try {
        const lettersKey = `persona_${currentPersona}_coupleLetters`;
        const letters = JSON.parse(localStorage.getItem(lettersKey) || '[]');
        letters.filter(l => l.isCollected).forEach(letter => {
            collections.push({
                type: '情书',
                sender: '对方',
                content: letter.title + ': ' + letter.content.substring(0, 50),
                time: new Date(letter.timestamp).toLocaleDateString('zh-CN'),
                source: 'letter'
            });
        });
    } catch (e) {
        console.error('加载信件收藏失败:', e);
    }
    
    // 收集日记收藏
    try {
        const diaries = JSON.parse(localStorage.getItem('diaries') || '[]');
        diaries.filter(d => d.isCollected).forEach(diary => {
            collections.push({
                type: '日记',
                sender: '我',
                content: diary.title + ': ' + diary.content.substring(0, 50),
                time: new Date(diary.date).toLocaleDateString('zh-CN'),
                source: 'diary'
            });
        });
    } catch (e) {
        console.error('加载日记收藏失败:', e);
    }
    
    // 渲染收藏列表
    if (collections.length === 0) {
        contentDiv.innerHTML = `
            <div class="collection-empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="8" width="18" height="12" rx="2"/>
                    <path d="M12 8v-4"/>
                    <path d="M8 4h8"/>
                    <circle cx="12" cy="14" r="2"/>
                </svg>
                <p>收藏箱是空的</p>
                <p style="font-size: 12px; margin-top: 8px;">长按消息、右键日记或信件可以收藏</p>
            </div>
        `;
    } else {
        contentDiv.innerHTML = collections.map((item, index) => `
            <div class="collection-item" onclick="toggleCollectionItem(this, ${index})">
                <div class="collection-item-header">
                    <span class="collection-item-type">${item.type}</span>
                    <span class="collection-item-sender">${item.sender}</span>
                    <div class="collection-item-content collection-preview">${escapeHtmlForMain(item.content)}</div>
                    <div class="collection-expand-hint">点击展开</div>
                </div>
            </div>
        `).join('');
        
        // 存储完整内容供展开使用
        window.collectionFullContents = collections.map(item => item.content);
    }
}

/**
 * HTML转义函数（用于main.js）
 */
function escapeHtmlForMain(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 切换收藏项展开/收起状态
 */
window.toggleCollectionItem = function(element, index) {
    const fullContent = window.collectionFullContents[index];
    const header = element.querySelector('.collection-item-header');
    const contentDiv = header.querySelector('.collection-item-content');
    const hintDiv = header.querySelector('.collection-expand-hint');
    
    // 创建弹窗
    const modal = document.createElement('div');
    modal.className = 'collection-modal';
    modal.innerHTML = `
        <div class="collection-modal-overlay" onclick="closeCollectionModal()"></div>
        <div class="collection-modal-content">
            <div class="collection-modal-header">
                <span class="collection-modal-title">收藏详情</span>
                <button class="collection-modal-close" onclick="closeCollectionModal()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            <div class="collection-modal-body">
                ${escapeHtmlForMain(fullContent)}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加动画
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
};

/**
 * 关闭收藏详情弹窗
 */
window.closeCollectionModal = function() {
    const modal = document.querySelector('.collection-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
};
