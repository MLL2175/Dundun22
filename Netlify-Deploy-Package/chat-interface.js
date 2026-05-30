


// ========== 角色黑名单功能 ==========

// 添加黑名单关键词
function addBlacklistKeyword() {
    const input = document.getElementById('settings-blacklist-keyword');
    if (!input) return;
    
    const keyword = input.value.trim();
    if (!keyword) {
        alert('请输入关键词');
        return;
    }
    
    // 获取当前联系人的黑名单
    const chatId = currentChatId;
    const blacklistKey = `role_${chatId}_blacklist`;
    let blacklist = JSON.parse(localStorage.getItem(blacklistKey) || '{"keywords":[],"enabled":true}');
    
    // 检查是否已存在
    if (blacklist.keywords.includes(keyword)) {
        alert('该关键词已存在');
        return;
    }
    
    // 添加关键词
    blacklist.keywords.push(keyword);
    localStorage.setItem(blacklistKey, JSON.stringify(blacklist));
    
    // 清空输入框并更新显示
    input.value = '';
    renderBlacklistKeywords();
    
    console.log('✅ 已添加黑名单关键词:', keyword);
}

// 删除黑名单关键词
function deleteBlacklistKeyword(keyword) {
    const chatId = currentChatId;
    const blacklistKey = `role_${chatId}_blacklist`;
    let blacklist = JSON.parse(localStorage.getItem(blacklistKey) || '{"keywords":[],"enabled":true}');
    
    // 移除关键词
    blacklist.keywords = blacklist.keywords.filter(k => k !== keyword);
    localStorage.setItem(blacklistKey, JSON.stringify(blacklist));
    
    // 更新显示
    renderBlacklistKeywords();
    
    console.log('✅ 已删除黑名单关键词:', keyword);
}

// 渲染黑名单关键词列表
function renderBlacklistKeywords() {
    const container = document.getElementById('settings-blacklist-container');
    if (!container) return;
    
    const chatId = currentChatId;
    const blacklistKey = `role_${chatId}_blacklist`;
    const blacklist = JSON.parse(localStorage.getItem(blacklistKey) || '{"keywords":[],"enabled":true}');
    
    if (blacklist.keywords.length === 0) {
        container.innerHTML = '<div style="font-size: 12px; color: #999; width: 100%; text-align: center; padding: 8px;">暂无黑名单关键词</div>';
        return;
    }
    
    container.innerHTML = blacklist.keywords.map(keyword => `
        <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; background: #ff4d4f; color: white; border-radius: 16px; font-size: 13px;">
            ${keyword}
            <button onclick="deleteBlacklistKeyword('${keyword}')" style="background: none; border: none; color: white; cursor: pointer; padding: 0; margin-left: 4px; font-size: 16px; line-height: 1; opacity: 0.8;">×</button>
        </span>
    `).join('');
}

// 保存黑名单开关状态
function saveBlacklistEnabled() {
    const checkbox = document.getElementById('settings-blacklist-enabled');
    if (!checkbox) return;
    
    const chatId = currentChatId;
    const blacklistKey = `role_${chatId}_blacklist`;
    let blacklist = JSON.parse(localStorage.getItem(blacklistKey) || '{"keywords":[],"enabled":true}');
    
    blacklist.enabled = checkbox.checked;
    localStorage.setItem(blacklistKey, JSON.stringify(blacklist));
    
    // 更新开关样式
    const slider = checkbox.previousElementSibling;
    if (slider) {
        slider.style.backgroundColor = checkbox.checked ? '#4CAF50' : '#ccc';
    }
    
    console.log('✅ 黑名单开关状态已保存:', checkbox.checked);
}

// 加载黑名单设置
function loadBlacklistSettings() {
    const chatId = currentChatId;
    const blacklistKey = `role_${chatId}_blacklist`;
    const blacklist = JSON.parse(localStorage.getItem(blacklistKey) || '{"keywords":[],"enabled":true}');
    
    // 更新开关状态
    const checkbox = document.getElementById('settings-blacklist-enabled');
    if (checkbox) {
        checkbox.checked = blacklist.enabled;
        const slider = checkbox.previousElementSibling;
        if (slider) {
            slider.style.backgroundColor = blacklist.enabled ? '#4CAF50' : '#ccc';
        }
    }
    
    // 渲染关键词列表
    renderBlacklistKeywords();
}

// 检查消息是否包含黑名单关键词
function checkBlacklist(message) {
    const chatId = currentChatId;
    const blacklistKey = `role_${chatId}_blacklist`;
    const blacklist = JSON.parse(localStorage.getItem(blacklistKey) || '{"keywords":[],"enabled":true}');
    
    // 如果未启用，直接返回
    if (!blacklist.enabled) {
        return { blocked: false };
    }
    
    // 检查是否包含黑名单关键词
    const foundKeywords = blacklist.keywords.filter(keyword => 
        message.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (foundKeywords.length > 0) {
        return {
            blocked: true,
            keywords: foundKeywords
        };
    }
    
    return { blocked: false };
}

// 显示黑名单拦截提示
function showBlacklistBlockedMessage(foundKeywords) {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    
    // 创建提示消息
    const blockedMsg = document.createElement('div');
    blockedMsg.className = 'message-bubble system-message';
    blockedMsg.style.cssText = 'display: flex; justify-content: center; margin: 16px 0;';
    blockedMsg.innerHTML = `
        <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 12px 16px; max-width: 80%; text-align: center;">
            <div style="font-size: 20px; margin-bottom: 8px;">🚫</div>
            <div style="font-size: 14px; color: #856404; font-weight: 500; margin-bottom: 4px;">
                消息已被拦截
            </div>
            <div style="font-size: 12px; color: #856404;">
                角色不想回复包含「${foundKeywords.join('」「')}」的消息
            </div>
        </div>
    `;
    
    container.appendChild(blockedMsg);
    
    // 滚动到底部
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
    
    console.log('🚫 消息被黑名单拦截，关键词:', foundKeywords);
}

// 拦截发送按钮点击事件
function initBlacklistInterceptor() {
    // 等待 DOM 加载完成
    setTimeout(() => {
        const sendBtn = document.getElementById('send-btn');
        if (!sendBtn) {
            console.log('⚠️ 未找到发送按钮，尝试重新初始化...');
            initBlacklistInterceptor();
            return;
        }
        
        // 保存原始的点击处理函数
        const originalOnclick = sendBtn.getAttribute('onclick');
        
        // 替换为新的处理函数
        sendBtn.setAttribute('onclick', 'handleSendWithBlacklist()');
        
        console.log('✅ 黑名单拦截器初始化完成');
    }, 1000);
}

// 黑名单检查的发送处理函数
window.handleSendWithBlacklist = function() {
    // 获取输入框内容
    const inputElement = document.querySelector('.chat-input textarea') || 
                          document.querySelector('.input-area textarea') ||
                          document.querySelector('#message-input') ||
                          document.querySelector('textarea');
    
    if (!inputElement) {
        console.log('⚠️ 未找到输入框，尝试直接发送...');
        if (typeof handleSendOrReply === 'function') {
            handleSendOrReply();
        }
        return;
    }
    
    const message = inputElement.value.trim();
    
    // 如果消息为空，尝试直接发送
    if (!message) {
        if (typeof handleSendOrReply === 'function') {
            handleSendOrReply();
        }
        return;
    }
    
    // 检查黑名单
    const blacklistCheck = checkBlacklist(message);
    
    if (blacklistCheck.blocked) {
        // 显示拦截提示
        showBlacklistBlockedMessage(blacklistCheck.keywords);
        return;
    }
    
    // 如果通过检查，执行原始的发送函数
    if (typeof handleSendOrReply === 'function') {
        handleSendOrReply();
    }
};

// 导出全局函数
window.addBlacklistKeyword = addBlacklistKeyword;
window.deleteBlacklistKeyword = deleteBlacklistKeyword;
window.renderBlacklistKeywords = renderBlacklistKeywords;
window.saveBlacklistEnabled = saveBlacklistEnabled;
window.loadBlacklistSettings = loadBlacklistSettings;
window.checkBlacklist = checkBlacklist;
window.showBlacklistBlockedMessage = showBlacklistBlockedMessage;
window.initBlacklistInterceptor = initBlacklistInterceptor;

// 页面加载完成后初始化拦截器
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlacklistInterceptor);
} else {
    initBlacklistInterceptor();
}
