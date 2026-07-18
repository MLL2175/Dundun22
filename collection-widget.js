// ========== 收藏组件功能（简约卡片式）==========

/**
 * 格式化收藏时间
 */
function formatCollectionTime(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // 小于1分钟
    if (diff < 60 * 1000) {
        return '刚刚';
    }
    
    // 小于1小时
    if (diff < 60 * 60 * 1000) {
        const minutes = Math.floor(diff / (60 * 1000));
        return `${minutes}分钟前`;
    }
    
    // 小于24小时
    if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        return `${hours}小时前`;
    }
    
    // 小于7天
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        return `${days}天前`;
    }
    
    // 超过7天，显示日期
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
}

/**
 * 切换收藏面板（弹窗方式）
 */
window.toggleCollectionPanel = function() {
    const panel = document.querySelector('.collection-panel');
    if (panel) {
        panel.remove();
        return;
    }
    
    // 创建收藏弹窗
    const overlay = document.createElement('div');
    overlay.className = 'collection-panel';
    overlay.innerHTML = `
        <div class="collection-panel-overlay" onclick="toggleCollectionPanel()"></div>
        <div class="collection-panel-content">
            <div class="collection-panel-header">
                <span class="collection-panel-title">我的收藏</span>
                <button class="collection-panel-close" onclick="toggleCollectionPanel()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            <div class="collection-panel-body" id="collection-panel-body"></div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // 加载收藏内容
    setTimeout(() => {
        overlay.classList.add('active');
        loadCollectionPanelContent();
    }, 10);
};

/**
 * 加载收藏弹窗内容
 */
function loadCollectionPanelContent() {
    const contentDiv = document.getElementById('collection-panel-body');
    if (!contentDiv) return;
    
    const currentPersona = localStorage.getItem('dundun22_currentPersona') || 'default';
    const collections = [];
    
    // 收集所有聊天消息收藏
    try {
        const contactsKey = `dundun22_persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('chat_collect_')) {
                const chatCollects = JSON.parse(localStorage.getItem(key) || '[]');
                const chatId = key.replace('chat_collect_', '');
                
                chatCollects.forEach(item => {
                    let characterName = item.characterName;
                    
                    if (!characterName && chatId) {
                        const contact = contacts.find(c => c.id === chatId);
                        if (contact) {
                            characterName = contact.name;
                        }
                    }
                    
                    if (!characterName) {
                        characterName = item.sender === 'ai' ? 'AI' : '我';
                    }
                    
                    collections.push({
                        type: '聊天',
                        sender: characterName,
                        content: item.content,
                        time: formatCollectionTime(item.time),
                        source: 'chat'
                    });
                });
            }
        }
    } catch (e) {
        console.error('加载聊天收藏失败:', e);
    }
    
    // 收集情侣空间信件收藏
    try {
        const lettersKey = `dundun22_persona_${currentPersona}_coupleLetters`;
        const letters = JSON.parse(localStorage.getItem(lettersKey) || '[]');
        letters.filter(l => l.isCollected).forEach(letter => {
            collections.push({
                type: '情书',
                sender: '对方',
                content: letter.title + ': ' + letter.content.substring(0, 100),
                time: new Date(letter.timestamp).toLocaleDateString('zh-CN'),
                source: 'letter'
            });
        });
    } catch (e) {
        console.error('加载信件收藏失败:', e);
    }
    
    // 收集日记收藏
    try {
        const diaries = JSON.parse(localStorage.getItem('dundun22_diaries') || '[]');
        diaries.filter(d => d.isCollected).forEach(diary => {
            collections.push({
                type: '日记',
                sender: '我',
                content: diary.title + ': ' + diary.content.substring(0, 100),
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
                <p>还没有收藏内容</p>
                <p style="font-size: 12px; margin-top: 8px;">长按消息、右键日记或信件可以收藏</p>
            </div>
        `;
    } else {
        contentDiv.innerHTML = collections.map((item, index) => `
            <div class="collection-item-panel" onclick="showCollectionDetail(${index})">
                <div class="collection-item-header-panel">
                    <span class="collection-item-type">${item.type}</span>
                    <span class="collection-item-sender">${item.sender}</span>
                    <span class="collection-item-time">${item.time}</span>
                </div>
                <div class="collection-item-content-panel">${escapeHtmlForMain(item.content)}</div>
            </div>
        `).join('');
        
        // 存储完整内容供展开使用
        window.collectionFullContents = collections.map(item => item.content);
    }
    
    // 更新收藏数量
    updateCollectionCount();
}

/**
 * 更新收藏数量显示
 */
window.updateCollectionCount = function() {
    const countDiv = document.getElementById('collection-count');
    if (!countDiv) return;
    
    let totalCount = 0;
    const currentPersona = localStorage.getItem('dundun22_currentPersona') || 'default';
    
    // 统计消息收藏
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('chat_collect_')) {
                const chatCollects = JSON.parse(localStorage.getItem(key) || '[]');
                totalCount += chatCollects.length;
            }
        }
    } catch (e) {}
    
    // 统计信件收藏
    try {
        const lettersKey = `dundun22_persona_${currentPersona}_coupleLetters`;
        const letters = JSON.parse(localStorage.getItem(lettersKey) || '[]');
        totalCount += letters.filter(l => l.isCollected).length;
    } catch (e) {}
    
    // 统计日记收藏
    try {
        const diaries = JSON.parse(localStorage.getItem('dundun22_diaries') || '[]');
        totalCount += diaries.filter(d => d.isCollected).length;
    } catch (e) {}
    
    countDiv.textContent = `${totalCount} items`;
}

/**
 * 显示收藏详情
 */
window.showCollectionDetail = function(index) {
    const fullContent = window.collectionFullContents[index];
    
    const modal = document.createElement('div');
    modal.className = 'collection-detail-modal';
    modal.innerHTML = `
        <div class="collection-detail-overlay" onclick="this.parentElement.remove()"></div>
        <div class="collection-detail-content">
            <div class="collection-detail-header">
                <span class="collection-detail-title">收藏详情</span>
                <button class="collection-detail-close" onclick="this.closest('.collection-detail-modal').remove()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            <div class="collection-detail-body">
                ${escapeHtmlForMain(fullContent)}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
};

// 页面加载时自动更新收藏数量
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[收藏组件] 页面加载完成，更新收藏数量');
        window.updateCollectionCount();
    });
} else {
    // DOM已经加载完成
    console.log('[收藏组件] DOM已加载，立即更新收藏数量');
    window.updateCollectionCount();
}
