// ========== 设置页面 全灰白主题最终版 ==========

// 预设提示音（Base64 编码的简短音频）
const PRESET_SOUNDS = {
    default: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAAAAA==', // 占位符，实际使用时替换为真实音频
    crisp: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAAAAA==', // 占位符
    soft: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAAAAA=='  // 占位符
};

document.addEventListener('DOMContentLoaded', function() {
    const forceClickable = () => {
        document.querySelectorAll('.switch, .btn-secondary, .save-btn, .preset-use-btn, .preset-del-btn').forEach(el => {
            el.style.cssText = "pointer-events: auto !important; position: relative; z-index: 99999 !important; cursor: pointer !important;";
        });
    };
    forceClickable();
    setInterval(forceClickable, 500);
    renderPresetList();
});

document.addEventListener('click', function(e) {
    const target = e.target;

    // API 悬浮球开关处理
    const apiFabSwitch = target.closest('#api-fab-switch');
    if (apiFabSwitch) {
        e.preventDefault();
        e.stopPropagation();
        apiFabSwitch.classList.toggle('active');
        
        // 实时更新全局配置并通知父窗口
        setTimeout(() => {
            const isEnabled = apiFabSwitch.classList.contains('active');
            const globalConfig = JSON.parse(localStorage.getItem('globalApiConfig') || '{}');
            
            if (!globalConfig.notification) {
                globalConfig.notification = {};
            }
            globalConfig.notification.apiFabEnabled = isEnabled;
            
            localStorage.setItem('globalApiConfig', JSON.stringify(globalConfig));
            
            // 如果是在 iframe 中，通知父窗口
            if (window.parent && window.parent !== window && window.parent.updateGlobalApiFab) {
                window.parent.updateGlobalApiFab(isEnabled);
            }
        }, 50);
        return;
    }

    const switchEl = target.closest('.switch');
    if (switchEl) {
        e.preventDefault();
        e.stopPropagation();
        switchEl.classList.toggle('active');
        if (switchEl.id === 'backup-api-switch') {
            const isActive = switchEl.classList.contains('active');
            document.getElementById('backup-api-url').disabled = !isActive;
            document.getElementById('backup-api-token').disabled = !isActive;
        }
        // 处理提示音开关
        if (switchEl.id === 'sound-enabled-switch') {
            const isActive = switchEl.classList.contains('active');
            const soundSection = document.getElementById('sound-settings-section');
            if (soundSection) {
                soundSection.style.display = isActive ? 'block' : 'none';
            }
        }
        // 处理通话铃声开关
        if (switchEl.id === 'call-ringtone-switch') {
            const isActive = switchEl.classList.contains('active');
            const callRingtoneSection = document.getElementById('call-ringtone-settings-section');
            if (callRingtoneSection) {
                callRingtoneSection.style.display = isActive ? 'block' : 'none';
            }
        }
        if (switchEl.id === 'background-keep-switch') {
            const isActive = switchEl.classList.contains('active');
            const keepaliveSection = document.getElementById('keepalive-detail-section');
            if (keepaliveSection) {
                keepaliveSection.style.display = isActive ? 'block' : 'none';
            }
            localStorage.setItem('keepalive-enabled', isActive ? 'true' : 'false');
            if (isActive && typeof toggleKeepAlive === 'function') {
                toggleKeepAlive();
            }
        }
        if (switchEl.id === 'banner-notification-switch') {
            const isActive = switchEl.classList.contains('active');
            const bannerSection = document.getElementById('banner-detail-section');
            if (bannerSection) {
                bannerSection.style.display = isActive ? 'block' : 'none';
            }
            localStorage.setItem('banner-notification-enabled', isActive ? 'true' : 'false');
            if (isActive && typeof toggleBannerNotification === 'function') {
                toggleBannerNotification();
            }
        }
        return;
    }

    const slider = target.closest('#temperature-slider');
    if (slider) {
        document.getElementById('temperature-value').textContent = slider.value;
        return;
    }

    const ttsSlider = target.closest('#tts-speed-slider');
    if (ttsSlider) {
        document.getElementById('tts-speed-value').textContent = ttsSlider.value;
        return;
    }

    const savePresetBtn = target.closest('#save-preset-btn');
    if (savePresetBtn) {
        e.preventDefault();
        e.stopPropagation();
        saveCurrentPreset();
        return;
    }

    const usePresetBtn = target.closest('.preset-use-btn');
    if (usePresetBtn) {
        e.preventDefault();
        e.stopPropagation();
        const presetId = usePresetBtn.getAttribute('data-preset-id');
        usePreset(presetId);
        return;
    }

    const delPresetBtn = target.closest('.preset-del-btn');
    if (delPresetBtn) {
        e.preventDefault();
        e.stopPropagation();
        const presetId = delPresetBtn.getAttribute('data-preset-id');
        deletePreset(presetId);
        return;
    }

    const fetchBtn = target.closest('#fetch-model-btn');
    if (fetchBtn) {
        e.preventDefault();
        e.stopPropagation();
        fetchModelList();
        return;
    }

    const testNotifyBtn = target.closest('#test-notification-btn');
    if (testNotifyBtn) {
        e.preventDefault();
        e.stopPropagation();
        testNotification();
        return;
    }

    const imageGenSaveBtn = target.closest('#image-gen-save-btn');
    if (imageGenSaveBtn) {
        e.preventDefault();
        e.stopPropagation();
        saveImageGenSettings();
        return;
    }

    const saveBtn = target.closest('#save-all-settings-btn');
    if (saveBtn) {
        e.preventDefault();
        e.stopPropagation();
        saveAllSettings();
        return;
    }
});

function showToast(msg, type = 'success') {
    console.log('准备显示 Toast:', msg);
    
    // 移除旧的 toast
    const oldToast = document.getElementById('toast');
    if (oldToast) oldToast.remove();
    
    // 创建新的 toast
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.textContent = msg;
    
    // 灰色横条样式 - 使用绝对定位确保可见
    toast.style.cssText = `
        position: fixed !important;
        top: 100px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        background: linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%) !important;
        color: white !important;
        padding: 14px 28px !important;
        border-radius: 10px !important;
        font-size: 15px !important;
        font-weight: 500 !important;
        z-index: 999999 !important;
        max-width: 85% !important;
        text-align: center !important;
        box-shadow: 0 6px 16px rgba(0,0,0,0.3) !important;
        backdrop-filter: blur(10px) !important;
        animation: toastSlideIn 0.3s ease-out !important;
    `;
    
    // 添加动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes toastSlideIn {
            0% {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
            100% {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(toast);
    console.log('Toast 已添加到页面');
    
    // 2.5 秒后移除
    setTimeout(() => {
        toast.style.transition = 'opacity 0.3s';
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
            console.log('Toast 已移除');
        }, 300);
    }, 2500);
}

// ==============================================
// 预设管理
// ==============================================
function getAllPresets() {
    try {
        return JSON.parse(localStorage.getItem('apiPresets') || '[]');
    } catch (e) {
        return [];
    }
}

function renderPresetList() {
    const list = document.getElementById('preset-list');
    const presets = getAllPresets();
    if (presets.length === 0) {
        list.innerHTML = '<div class="preset-empty">暂无保存的预设</div>';
        return;
    }
    let html = '';
    presets.forEach(p => {
        html += `
        <div class="preset-item">
            <span class="preset-name">${p.name}</span>
            <div class="preset-btns">
                <button class="preset-use-btn" data-preset-id="${p.id}">切换</button>
                <button class="preset-del-btn" data-preset-id="${p.id}">删除</button>
            </div>
        </div>`;
    });
    list.innerHTML = html;
}

// 保存预设（纯灰白弹窗）
function saveCurrentPreset() {
    const cfg = {
        mainApi: {
            url: document.getElementById('main-api-url').value.trim(),
            token: document.getElementById('main-api-token').value.trim()
        },
        backupApi: {
            enabled: document.getElementById('backup-api-switch').classList.contains('active'),
            url: document.getElementById('backup-api-url').value.trim(),
            token: document.getElementById('backup-api-token').value.trim()
        },
        model: document.getElementById('model-select').value, // 保存当前模型
        temperature: parseFloat(document.getElementById('temperature-slider').value) || 0.7,
        maxTokens: parseInt(document.getElementById('max-tokens').value) || 2048,
        minimaxGroupId: document.getElementById('minimax-group-id')?.value.trim() || '',
        minimaxApiKey: document.getElementById('minimax-api-key')?.value.trim() || '',
        minimaxTtsUrl: 'https://api.minimax.chat/v1/t2a_v2', // 固定 API 地址
        minimaxTtsSpeed: parseFloat(document.getElementById('tts-speed-slider')?.value) || 1.0,
        imageGen: {
            url: document.getElementById('image-gen-url')?.value.trim() || '',
            token: document.getElementById('image-gen-token')?.value.trim() || '',
            model: document.getElementById('image-gen-model')?.value || 'dall-e-3',
            size: document.getElementById('image-gen-size')?.value || '1024x1024',
            quality: document.getElementById('image-gen-quality')?.value || 'standard',
            forumImageEnabled: document.getElementById('forum-image-switch')?.classList.contains('active') || false
        },
        notification: {
            soundEnabled: document.getElementById('sound-enabled-switch').classList.contains('active'),
            soundType: document.getElementById('sound-type-select')?.value || 'default',
            customSoundData: window.customSoundData || ''
        }
    };

    if (!cfg.mainApi.url || !cfg.mainApi.token) {
        showToast('❌ 请先填写API地址和密钥', 'error');
        return;
    }

    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 20px;
        z-index: 999999;
    `;

    const box = document.createElement('div');
    box.style.cssText = `
        background: #f5f5f7;
        border-radius: 20px;
        max-width: 320px;
        width: 100%;
        padding: 24px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    `;

    const title = document.createElement('div');
    title.style.cssText = `
        font-size: 17px;
        font-weight: 600;
        text-align: center;
        margin-bottom: 16px;
        color: #333;
    `;
    title.textContent = '保存 API 预设';
    
    const label = document.createElement('label');
    label.htmlFor = 'preset-name-input';
    label.style.cssText = `
        display: block;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 8px;
        color: #666;
    `;
    label.textContent = '预设名称:';
    
    const input = document.createElement('input');
    input.style.cssText = `
        width: 100%;
        padding: 12px 16px;
        border-radius: 12px;
        border: 1px solid #e5e5ea;
        background: #ffffff;
        font-size: 16px;
        outline: none;
        margin-bottom: 20px;
        color: #333;
    `;
    input.placeholder = '输入预设名称';
    input.maxLength = 20;
    input.id = 'preset-name-input';
    input.name = 'presetName';
    input.type = 'text';
    input.autocomplete = 'off';

    const btnWrap = document.createElement('div');
    btnWrap.style.cssText = `
        display: flex;
        gap: 12px;
    `;

    const btnCancel = document.createElement('button');
    btnCancel.className = 'preset-modal-btn preset-modal-cancel';
    btnCancel.textContent = '取消';

    const btnOk = document.createElement('button');
    btnOk.className = 'preset-modal-btn preset-modal-confirm';
    btnOk.textContent = '保存';

    btnWrap.append(btnCancel, btnOk);
    box.append(title, label, input, btnWrap);
    overlay.append(box);
    document.body.append(overlay);

    input.focus();

    function close() {
        document.body.removeChild(overlay);
    }

    btnCancel.onclick = close;
    overlay.onclick = e => e.target === overlay && close();

    btnOk.onclick = () => {
        const name = input.value.trim();
        if (!name) {
            showToast('❌ 名称不能为空', 'error');
            return;
        }
        const list = getAllPresets();
        if (list.some(x => x.name === name)) {
            showToast('❌ 名称已存在', 'error');
            return;
        }
        list.push({
            id: Date.now() + '',
            name: name,
            config: cfg,
            time: new Date().toLocaleString()
        });
        localStorage.setItem('apiPresets', JSON.stringify(list));
        renderPresetList();
        showToast('✅ 预设保存成功', 'success');
        close();
    };
}

function usePreset(id) {
    const list = getAllPresets();
    const p = list.find(x => x.id === id);
    if (!p) return;
    const c = p.config;

    document.getElementById('main-api-url').value = c.mainApi?.url || '';
    document.getElementById('main-api-token').value = c.mainApi?.token || '';

    const backupSwitch = document.getElementById('backup-api-switch');
    if (c.backupApi?.enabled) {
        backupSwitch.classList.add('active');
        document.getElementById('backup-api-url').disabled = false;
        document.getElementById('backup-api-token').disabled = false;
    } else {
        backupSwitch.classList.remove('active');
        document.getElementById('backup-api-url').disabled = true;
        document.getElementById('backup-api-token').disabled = true;
    }
    document.getElementById('backup-api-url').value = c.backupApi?.url || '';
    document.getElementById('backup-api-token').value = c.backupApi?.token || '';

    document.getElementById('temperature-slider').value = c.temperature || 0.7;
    document.getElementById('temperature-value').textContent = c.temperature || 0.7;
    document.getElementById('max-tokens').value = c.maxTokens || 2048;

    // 加载生图配置
    const imageGenUrlEl = document.getElementById('image-gen-url');
    const imageGenTokenEl = document.getElementById('image-gen-token');
    const imageGenModelEl = document.getElementById('image-gen-model');
    const imageGenSizeEl = document.getElementById('image-gen-size');
    const imageGenQualityEl = document.getElementById('image-gen-quality');
    const forumImageSwitch = document.getElementById('forum-image-switch');
    
    if (c.imageGen) {
        if (imageGenUrlEl) imageGenUrlEl.value = c.imageGen.url || '';
        if (imageGenTokenEl) imageGenTokenEl.value = c.imageGen.token || '';
        if (imageGenModelEl) imageGenModelEl.value = c.imageGen.model || 'dall-e-3';
        if (imageGenSizeEl) imageGenSizeEl.value = c.imageGen.size || '1024x1024';
        if (imageGenQualityEl) imageGenQualityEl.value = c.imageGen.quality || 'standard';
        if (forumImageSwitch) {
            if (c.imageGen.forumImageEnabled) {
                forumImageSwitch.classList.add('active');
            } else {
                forumImageSwitch.classList.remove('active');
            }
        }
    }

    // 加载提示音配置
    const soundEnabled = c.notification?.soundEnabled || false;
    const soundSwitch = document.getElementById('sound-enabled-switch');
    if (soundSwitch) {
        if (soundEnabled) {
            soundSwitch.classList.add('active');
        } else {
            soundSwitch.classList.remove('active');
        }
    }
    
    const soundSection = document.getElementById('sound-settings-section');
    if (soundSection) {
        soundSection.style.display = soundEnabled ? 'block' : 'none';
    }
    
    const soundTypeSelect = document.getElementById('sound-type-select');
    if (soundTypeSelect) {
        soundTypeSelect.value = c.notification?.soundType || 'default';
    }
    
    if (c.notification?.customSoundData) {
        window.customSoundData = c.notification.customSoundData;
        if (window.updateCustomSoundStatus) {
            window.updateCustomSoundStatus();
        }
    }

    showToast(`✅ 已切换：${p.name}`, 'success');
}

function deletePreset(id) {
    let list = getAllPresets();
    const p = list.find(x => x.id === id);
    if (!p) return;
    if (!confirm(`确定删除「${p.name}」？`)) return;
    list = list.filter(x => x.id !== id);
    localStorage.setItem('apiPresets', JSON.stringify(list));
    renderPresetList();
    showToast('✅ 已删除', 'success');
}

// ==============================================
// 拉取模型
// ==============================================
async function fetchModelList() {
    const btn = document.getElementById('fetch-model-btn');
    const sel = document.getElementById('model-select');
    const url = document.getElementById('main-api-url').value.trim();
    const token = document.getElementById('main-api-token').value.trim();

    if (!url || !token) {
        showToast('❌ 请填写地址和密钥', 'error');
        return;
    }

    btn.disabled = true;
    btn.textContent = '拉取中...';

    try {
        const base = url.endsWith('/') ? url.slice(0, -1) : url;
        const res = await fetch(`${base}/models`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('请求失败');
        const data = await res.json();
        const models = data.data || [];
        sel.innerHTML = '';
        models.forEach(m => {
            const o = document.createElement('option');
            o.value = m.id;
            o.textContent = m.id;
            sel.appendChild(o);
        });
        showToast('✅ 拉取成功', 'success');
    } catch (e) {
        showToast('❌ 拉取失败：' + e.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '拉取';
    }
}

// ==============================================
// 测试通知
// ==============================================
async function testNotification() {
    if (!('Notification' in window)) {
        showToast('❌ 不支持通知', 'error');
        return;
    }
    if (!document.getElementById('notification-switch').classList.contains('active')) {
        showToast('❌ 请先开启通知开关', 'error');
        return;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
        new Notification('测试', { body: '通知正常' });
        showToast('✅ 通知已发送', 'success');
    } else {
        showToast('❌ 请允许通知权限', 'error');
    }
}

// ==============================================
// 测试横幅通知
// ==============================================
window.testBannerNotification = function() {
    try {
        console.log('开始测试横幅通知');
        
        // 直接在当前页面显示一个测试横幅
        const testBanner = document.createElement('div');
        testBanner.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 10000;
            min-width: 300px;
            max-width: 400px;
            animation: slideDown 0.3s ease-out;
        `;
        
        // 添加动画样式
        if (!document.getElementById('banner-animation-style')) {
            const style = document.createElement('style');
            style.id = 'banner-animation-style';
            style.textContent = `
                @keyframes slideDown {
                    from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
                @keyframes slideUp {
                    from { opacity: 1; transform: translateX(-50%) translateY(0); }
                    to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        testBanner.innerHTML = `
            <div style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 18px;
                font-weight: bold;
                flex-shrink: 0;
            ">小明</div>
            <div style="flex: 1; min-width: 0;">
                <div style="font-size: 14px; font-weight: 600; color: #333; margin-bottom: 2px;">小明</div>
                <div style="font-size: 13px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">今天天气真好，一起出去散步吧！☀️</div>
            </div>
        `;
        
        document.body.appendChild(testBanner);
        
        showToast('✅ 横幅通知已显示在顶部，3秒后自动消失', 'success');
        
        // 3秒后自动消失
        setTimeout(() => {
            testBanner.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => {
                testBanner.remove();
            }, 300);
        }, 3000);
        
        console.log('✅ 横幅通知测试完成');
        
    } catch (e) {
        console.error('横幅通知测试失败:', e);
        showToast('❌ 测试失败: ' + e.message, 'error');
    }
};

// ==============================================
// 保存全部设置
// ==============================================
function saveAllSettings() {
    try {
        const config = {
            mainApi: {
                url: document.getElementById('main-api-url').value.trim(),
                token: document.getElementById('main-api-token').value.trim()
            },
            backupApi: {
                enabled: document.getElementById('backup-api-switch').classList.contains('active'),
                url: document.getElementById('backup-api-url').value.trim(),
                token: document.getElementById('backup-api-token').value.trim()
            },
            model: document.getElementById('model-select').value,
            temperature: parseFloat(document.getElementById('temperature-slider').value) || 0.7,
            maxTokens: parseInt(document.getElementById('max-tokens').value) || 2048,
            minimaxGroupId: document.getElementById('minimax-group-id')?.value.trim() || '',
            minimaxApiKey: document.getElementById('minimax-api-key')?.value.trim() || '',
            minimaxTtsUrl: 'https://api.minimax.chat/v1/t2a_v2', // 固定 API 地址
            minimaxTtsSpeed: parseFloat(document.getElementById('tts-speed-slider')?.value) || 1.0,
            imageGen: {
                url: document.getElementById('image-gen-url')?.value.trim() || '',
                token: document.getElementById('image-gen-token')?.value.trim() || '',
                model: document.getElementById('image-gen-model')?.value || 'dall-e-3',
                size: document.getElementById('image-gen-size')?.value || '1024x1024',
                quality: document.getElementById('image-gen-quality')?.value || 'standard',
                forumImageEnabled: document.getElementById('forum-image-switch')?.classList.contains('active') || false
            },
            notification: {
                backgroundKeep: document.getElementById('background-keep-switch').classList.contains('active'),
                bannerEnabled: document.getElementById('banner-notification-switch').classList.contains('active'),
                apiFabEnabled: document.getElementById('api-fab-switch').classList.contains('active'),
                soundEnabled: document.getElementById('sound-enabled-switch').classList.contains('active'),
                soundType: document.getElementById('sound-type-select')?.value || 'default',
                customSoundData: window.customSoundData || '',
                callRingtoneEnabled: document.getElementById('call-ringtone-switch').classList.contains('active')
            }
        };

        window.globalApiConfig = config;
        localStorage.setItem('globalApiConfig', JSON.stringify(config));
        
        // 通知父窗口更新悬浮球状态
        if (window.parent && window.parent !== window && window.parent.updateGlobalApiFab) {
            window.parent.updateGlobalApiFab(config.notification?.apiFabEnabled || false);
        }
        
        showToast('✅ 保存成功', 'success');
    } catch (e) {
        console.error('保存设置失败:', e);
        showToast('❌ 保存失败', 'error');
    }
}

// ==============================================
// 保存生图配置
// ==============================================
function saveImageGenSettings() {
    try {
        const url = document.getElementById('image-gen-url').value.trim();
        const token = document.getElementById('image-gen-token').value.trim();
        const model = document.getElementById('image-gen-model').value;
        const size = document.getElementById('image-gen-size').value;
        const quality = document.getElementById('image-gen-quality').value;
        const forumImageEnabled = document.getElementById('forum-image-switch').classList.contains('active');
        
        console.log('准备保存生图配置:', { url, token: token ? '***' : 'empty', model, size, quality, forumImageEnabled });
        
        if (!url || !token) {
            showToast('❌ 请填写生图API地址和密钥', 'error');
            return;
        }
        
        // 确保 globalApiConfig 存在
        if (!window.globalApiConfig) {
            window.globalApiConfig = {
                mainApi: { url: '', token: '' },
                backupApi: { enabled: false, url: '', token: '' },
                model: '',
                temperature: 0.7,
                maxTokens: 2048,
                notification: { backgroundKeep: false, bannerEnabled: false }
            };
        }
        
        // 更新全局配置
        if (!window.globalApiConfig.imageGen) {
            window.globalApiConfig.imageGen = {};
        }
        
        window.globalApiConfig.imageGen.url = url;
        window.globalApiConfig.imageGen.token = token;
        window.globalApiConfig.imageGen.model = model;
        window.globalApiConfig.imageGen.size = size;
        window.globalApiConfig.imageGen.quality = quality;
        window.globalApiConfig.imageGen.forumImageEnabled = forumImageEnabled;
        
        // 保存到 localStorage
        const configStr = JSON.stringify(window.globalApiConfig);
        console.log('保存的生图配置:', configStr);
        localStorage.setItem('globalApiConfig', configStr);
        
        // 显示成功提示
        console.log('显示成功提示');
        showToast('✅ 生图配置已保存', 'success');
    } catch (e) {
        console.error('保存生图配置失败:', e);
        showToast('❌ 保存失败: ' + e.message, 'error');
    }
}

// ==============================================
// 加载配置（每次显示设置页面时都会调用）
// ==============================================
window.reloadApiSettings = function() {
    const saved = localStorage.getItem('globalApiConfig');
    if (!saved) {
        console.log('⚠️ 没有找到保存的 API 配置');
        return;
    }
    
    try {
        const c = JSON.parse(saved);
        window.globalApiConfig = c;

        // 确保 DOM 元素存在
        const urlEl = document.getElementById('main-api-url');
        const tokenEl = document.getElementById('main-api-token');
        if (!urlEl || !tokenEl) {
            console.log('⚠️ 设置页面 DOM 元素未加载');
            return;
        }

        urlEl.value = c.mainApi?.url || '';
        tokenEl.value = c.mainApi?.token || '';
        
        // 加载 MiniMax Group ID
        const groupIdEl = document.getElementById('minimax-group-id');
        if (groupIdEl) {
            groupIdEl.value = c.minimaxGroupId || '';
        }
        
        // 加载 MiniMax API Key
        const apiKeyEl = document.getElementById('minimax-api-key');
        if (apiKeyEl) {
            apiKeyEl.value = c.minimaxApiKey || '';
        }
        
        // 加载 TTS 语速
        const ttsSpeedSlider = document.getElementById('tts-speed-slider');
        const ttsSpeedValue = document.getElementById('tts-speed-value');
        if (ttsSpeedSlider) ttsSpeedSlider.value = c.minimaxTtsSpeed || 1.0;
        if (ttsSpeedValue) ttsSpeedValue.textContent = c.minimaxTtsSpeed || 1.0;
        
        // 加载生图配置
        const imageGenUrlEl = document.getElementById('image-gen-url');
        const imageGenTokenEl = document.getElementById('image-gen-token');
        const imageGenModelEl = document.getElementById('image-gen-model');
        const imageGenSizeEl = document.getElementById('image-gen-size');
        const imageGenQualityEl = document.getElementById('image-gen-quality');
        const forumImageSwitch = document.getElementById('forum-image-switch');
        
        if (c.imageGen) {
            if (imageGenUrlEl) imageGenUrlEl.value = c.imageGen.url || '';
            if (imageGenTokenEl) imageGenTokenEl.value = c.imageGen.token || '';
            if (imageGenModelEl) imageGenModelEl.value = c.imageGen.model || 'dall-e-3';
            if (imageGenSizeEl) imageGenSizeEl.value = c.imageGen.size || '1024x1024';
            if (imageGenQualityEl) imageGenQualityEl.value = c.imageGen.quality || 'standard';
            if (forumImageSwitch) {
                if (c.imageGen.forumImageEnabled) {
                    forumImageSwitch.classList.add('active');
                } else {
                    forumImageSwitch.classList.remove('active');
                }
            }
            console.log('✅ 已加载生图配置:', c.imageGen);
        }
        
        const backupUrlEl = document.getElementById('backup-api-url');
        const backupTokenEl = document.getElementById('backup-api-token');
        if (backupUrlEl) backupUrlEl.value = c.backupApi?.url || '';
        if (backupTokenEl) backupTokenEl.value = c.backupApi?.token || '';
        
        const maxTokensEl = document.getElementById('max-tokens');
        if (maxTokensEl) maxTokensEl.value = c.maxTokens || 2048;
        
        const tempSlider = document.getElementById('temperature-slider');
        const tempValue = document.getElementById('temperature-value');
        if (tempSlider) tempSlider.value = c.temperature || 0.7;
        if (tempValue) tempValue.textContent = c.temperature || 0.7;
        
        const intervalEl = document.getElementById('message-interval');
        if (intervalEl) intervalEl.value = c.activeMessage?.interval || 60;
        
        // 加载模型 - 确保每次都正确显示
        const modelSelect = document.getElementById('model-select');
        if (modelSelect && c.model) {
            // 先检查选项中是否已有该模型
            let hasModel = false;
            for (let option of modelSelect.options) {
                if (option.value === c.model) {
                    hasModel = true;
                    break;
                }
            }
            // 如果没有，添加为第一个选项
            if (!hasModel && c.model !== 'gpt-3.5-turbo') {
                const newOption = document.createElement('option');
                newOption.value = c.model;
                newOption.textContent = c.model + ' (当前使用)';
                modelSelect.insertBefore(newOption, modelSelect.firstChild);
            }
            modelSelect.value = c.model;
            console.log('✅ 已加载模型:', c.model);
        }

        function setSwitch(id, v) {
            const el = document.getElementById(id);
            if (el) v ? el.classList.add('active') : el.classList.remove('active');
        }

        setSwitch('backup-api-switch', c.backupApi?.enabled);
        setSwitch('background-keep-switch', c.notification?.backgroundKeep);
        setSwitch('banner-notification-switch', c.notification?.bannerEnabled);
        setSwitch('api-fab-switch', c.notification?.apiFabEnabled);
        
        const keepaliveSection = document.getElementById('keepalive-detail-section');
        if (keepaliveSection) {
            keepaliveSection.style.display = c.notification?.backgroundKeep ? 'block' : 'none';
        }
        
        const bannerSection = document.getElementById('banner-detail-section');
        if (bannerSection) {
            bannerSection.style.display = c.notification?.bannerEnabled ? 'block' : 'none';
        }
        
        // 加载提示音配置
        const soundEnabled = c.notification?.soundEnabled || false;
        setSwitch('sound-enabled-switch', soundEnabled);
        
        const soundSection = document.getElementById('sound-settings-section');
        if (soundSection) {
            soundSection.style.display = soundEnabled ? 'block' : 'none';
        }
        
        const soundTypeSelect = document.getElementById('sound-type-select');
        if (soundTypeSelect) {
            soundTypeSelect.value = c.notification?.soundType || 'default';
        }
        
        // 加载自定义音频数据
        if (c.notification?.customSoundData) {
            window.customSoundData = c.notification.customSoundData;
            updateCustomSoundStatus();
        }

        const backupUrlDisabled = document.getElementById('backup-api-url');
        const backupTokenDisabled = document.getElementById('backup-api-token');
        if (backupUrlDisabled) backupUrlDisabled.disabled = !c.backupApi?.enabled;
        if (backupTokenDisabled) backupTokenDisabled.disabled = !c.backupApi?.enabled;
        
        console.log('✅ API 设置已加载');
    } catch (e) {
        console.error('❌ 加载 API 配置失败:', e);
    }
};

// DOMContentLoaded 时也加载一次
document.addEventListener('DOMContentLoaded', function() {
    window.reloadApiSettings();
    
    // 绑定 API 保存按钮事件
    const apiSaveBtn = document.getElementById('api-save-btn');
    if (apiSaveBtn) {
        apiSaveBtn.addEventListener('click', function() {
            const url = document.getElementById('main-api-url').value.trim();
            const token = document.getElementById('main-api-token').value.trim();
            const model = document.getElementById('model-select').value;
            
            console.log('准备保存:', { url, token: token ? '***' : 'empty', model });
            
            if (!url || !token) {
                showToast('❌ 请填写 API 地址和密钥', 'error');
                return;
            }
            
            // 确保 globalApiConfig 存在
            if (!window.globalApiConfig) {
                window.globalApiConfig = {
                    mainApi: { url: '', token: '' },
                    backupApi: { enabled: false, url: '', token: '' },
                    model: '',
                    temperature: 0.7,
                    maxTokens: 2048,
                    notification: { backgroundKeep: false, bannerEnabled: false }
                };
            }
            
            // 更新全局配置
            window.globalApiConfig.mainApi.url = url;
            window.globalApiConfig.mainApi.token = token;
            if (model) {
                window.globalApiConfig.model = model;
            }
            
            // 保存到 localStorage
            const configStr = JSON.stringify(window.globalApiConfig);
            console.log('保存的配置:', configStr);
            localStorage.setItem('globalApiConfig', configStr);
            
            // 显示成功提示
            console.log('显示成功提示');
            showToast('✅ API 配置已保存', 'success');
        });
    }
    
        // 绑定 TTS 保存按钮事件
    const ttsSaveBtn = document.getElementById('tts-save-btn');
    if (ttsSaveBtn) {
        ttsSaveBtn.addEventListener('click', function() {
            const groupId = document.getElementById('minimax-group-id').value.trim() || '';
            const apiKey = document.getElementById('minimax-api-key').value.trim() || '';
            const ttsSpeed = parseFloat(document.getElementById('tts-speed-slider').value) || 1.0;
            
            console.log('准备保存 TTS 配置:', { groupId, apiKey, ttsSpeed });
            
            // 确保 globalApiConfig 存在
            if (!window.globalApiConfig) {
                window.globalApiConfig = {
                    mainApi: { url: '', token: '' },
                    backupApi: { enabled: false, url: '', token: '' },
                    model: '',
                    temperature: 0.7,
                    maxTokens: 2048,
                    notification: { backgroundKeep: false, bannerEnabled: false }
                };
            }
            
            // 更新全局配置
            window.globalApiConfig.minimaxGroupId = groupId;
            window.globalApiConfig.minimaxApiKey = apiKey;
            window.globalApiConfig.minimaxTtsSpeed = ttsSpeed;
            
            // 保存到 localStorage
            const configStr = JSON.stringify(window.globalApiConfig);
            console.log('保存的配置:', configStr);
            localStorage.setItem('globalApiConfig', configStr);
            
            // 显示成功提示
            console.log('显示成功提示');
            showToast('✅ 语音配置已保存', 'success');
        });
    }
    
    // 绑定生图保存按钮事件
    const imageGenSaveBtn = document.getElementById('image-gen-save-btn');
    if (imageGenSaveBtn) {
        imageGenSaveBtn.addEventListener('click', function() {
            const url = document.getElementById('image-gen-url').value.trim();
            const token = document.getElementById('image-gen-token').value.trim();
            const model = document.getElementById('image-gen-model').value;
            const size = document.getElementById('image-gen-size').value;
            const quality = document.getElementById('image-gen-quality').value;
            const forumImageEnabled = document.getElementById('forum-image-switch').classList.contains('active');
            
            console.log('准备保存生图配置:', { url, token: token ? '***' : 'empty', model, size, quality, forumImageEnabled });
            
            if (!url || !token) {
                showToast('❌ 请填写生图API地址和密钥', 'error');
                return;
            }
            
            // 确保 globalApiConfig 存在
            if (!window.globalApiConfig) {
                window.globalApiConfig = {
                    mainApi: { url: '', token: '' },
                    backupApi: { enabled: false, url: '', token: '' },
                    model: '',
                    temperature: 0.7,
                    maxTokens: 2048,
                    notification: { backgroundKeep: false, bannerEnabled: false }
                };
            }
            
            // 更新全局配置
            if (!window.globalApiConfig.imageGen) {
                window.globalApiConfig.imageGen = {};
            }
            
            window.globalApiConfig.imageGen.url = url;
            window.globalApiConfig.imageGen.token = token;
            window.globalApiConfig.imageGen.model = model;
            window.globalApiConfig.imageGen.size = size;
            window.globalApiConfig.imageGen.quality = quality;
            window.globalApiConfig.imageGen.forumImageEnabled = forumImageEnabled;
            
            // 保存到 localStorage
            const configStr = JSON.stringify(window.globalApiConfig);
            console.log('保存的生图配置:', configStr);
            localStorage.setItem('globalApiConfig', configStr);
            
            // 显示成功提示
            console.log('显示成功提示');
            showToast('✅ 生图配置已保存', 'success');
        });
    }
    
    // 绑定导出数据按钮
    const exportDataBtn = document.getElementById('export-data-btn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', function() {
            try {
                // 收集所有聊天相关的数据
                const exportData = {
                    version: '1.0',
                    exportTime: new Date().toISOString(),
                    chatContacts: JSON.parse(localStorage.getItem('chatContacts') || '[]'),
                    chatConversations: JSON.parse(localStorage.getItem('chatConversations') || '[]'),
                    myProfile: JSON.parse(localStorage.getItem('myProfile') || '{}'),
                    worldbooks: JSON.parse(localStorage.getItem('worldbooks') || '[]'),
                    allPersonas: JSON.parse(localStorage.getItem('allPersonas') || '[]'),
                    currentPersonaId: localStorage.getItem('currentPersonaId') || 'default'
                };
                
                // 收集所有人设的聊天记录
                const allPersonas = exportData.allPersonas;
                allPersonas.forEach(persona => {
                    const personaId = persona.id;
                    exportData[`persona_${personaId}_chatContacts`] = JSON.parse(localStorage.getItem(`persona_${personaId}_chatContacts`) || '[]');
                    exportData[`persona_${personaId}_chatConversations`] = JSON.parse(localStorage.getItem(`persona_${personaId}_chatConversations`) || '[]');
                    
                    // 收集该人设的所有聊天记录
                    const chatKeys = Object.keys(localStorage).filter(k => k.startsWith(`chat_`) && !k.includes('persona_'));
                    chatKeys.forEach(key => {
                        exportData[key] = JSON.parse(localStorage.getItem(key) || '[]');
                    });
                });
                
                // 创建 Blob 并下载
                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `chat_backup_${new Date().getTime()}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                console.log('✓ 数据导出成功');
                showToast('✅ 数据导出成功', 'success');
            } catch (e) {
                console.error('导出失败:', e);
                showToast('导出失败: ' + e.message, 'error');
            }
        });
    }
    
    // 绑定导入数据按钮
    const importDataBtn = document.getElementById('import-data-btn');
    if (importDataBtn) {
        importDataBtn.addEventListener('click', function() {
            // 创建文件选择器
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                if (!confirm('导入数据将覆盖现有数据，确定要继续吗？')) {
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(event) {
                    try {
                        const importData = JSON.parse(event.target.result);
                        
                        // 验证数据格式
                        if (!importData.version) {
                            throw new Error('无效的数据文件');
                        }
                        
                        // 导入数据
                        if (importData.chatContacts) localStorage.setItem('chatContacts', JSON.stringify(importData.chatContacts));
                        if (importData.chatConversations) localStorage.setItem('chatConversations', JSON.stringify(importData.chatConversations));
                        if (importData.myProfile) localStorage.setItem('myProfile', JSON.stringify(importData.myProfile));
                        if (importData.worldbooks) localStorage.setItem('worldbooks', JSON.stringify(importData.worldbooks));
                        if (importData.allPersonas) localStorage.setItem('allPersonas', JSON.stringify(importData.allPersonas));
                        if (importData.currentPersonaId) localStorage.setItem('currentPersonaId', importData.currentPersonaId);
                        
                        // 导入人设相关数据
                        Object.keys(importData).forEach(key => {
                            if (key.startsWith('persona_') || key.startsWith('chat_')) {
                                localStorage.setItem(key, JSON.stringify(importData[key]));
                            }
                        });
                        
                        console.log('✓ 数据导入成功');
                        showToast('✅ 数据导入成功，请刷新页面', 'success');
                        
                        // 3秒后自动刷新
                        setTimeout(() => {
                            location.reload();
                        }, 3000);
                    } catch (e) {
                        console.error('导入失败:', e);
                        showToast('导入失败: ' + e.message, 'error');
                    }
                };
                reader.readAsText(file);
            };
            
            input.click();
        });
    }
    
    // 绑定清除数据按钮
    const clearChatCacheBtn = document.getElementById('clear-chat-cache-btn');
    if (clearChatCacheBtn) {
        clearChatCacheBtn.addEventListener('click', function() {
            if (confirm('⚠️ 确定要清除所有数据吗？\n\n此操作将删除：\n- 所有聊天记录\n- 所有联系人\n- 所有世界书\n- 所有人设数据\n\n此操作不可恢复！')) {
                try {
                    // 清除所有聊天相关数据
                    const keysToRemove = Object.keys(localStorage).filter(k => 
                        k.startsWith('chat_') || 
                        k.startsWith('persona_') ||
                        k === 'chatContacts' ||
                        k === 'chatConversations' ||
                        k === 'worldbooks' ||
                        k === 'allPersonas'
                    );
                    
                    keysToRemove.forEach(key => localStorage.removeItem(key));
                    
                    console.log('✓ 已清除数据:', keysToRemove.length, '项');
                    showToast('✅ 数据已清除，请刷新页面', 'success');
                    
                    // 3秒后自动刷新
                    setTimeout(() => {
                        location.reload();
                    }, 3000);
                } catch (e) {
                    console.error('清除数据失败:', e);
                    showToast('清除失败: ' + e.message, 'error');
                }
            }
        });
    }
    
    // ========== 提示音功能 ==========
    
    // 更新自定义音频状态显示
    window.updateCustomSoundStatus = function() {
        const statusEl = document.getElementById('custom-sound-status');
        if (!statusEl) return;
        
        if (window.customSoundData) {
            statusEl.textContent = '✅ 已上传自定义提示音';
            statusEl.style.display = 'block';
            statusEl.style.color = '#07C160';
        } else {
            statusEl.style.display = 'none';
        }
    };
    
    // 试听提示音
    const testSoundBtn = document.getElementById('test-sound-btn');
    if (testSoundBtn) {
        testSoundBtn.addEventListener('click', function() {
            const soundType = document.getElementById('sound-type-select')?.value || 'default';
            playTestSound(soundType);
        });
    }
    
    // 播放测试音频
    function playTestSound(soundType) {
        // 如果是自定义音频，播放自定义音频
        if (soundType === 'custom' && window.customSoundData) {
            const audio = new Audio(window.customSoundData);
            audio.volume = 0.5;
            audio.play().catch(e => {
                console.error('播放失败:', e);
                showToast('❌ 播放失败', 'error');
            });
            showToast('🔊 正在播放...', 'success');
            return;
        }
        
        // 内置音效直接使用 Web Audio API 生成
        playGeneratedSound(soundType);
    }
    
    // 使用 Web Audio API 生成简单音效（当没有预设音频时）
    function playGeneratedSound(type) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // 根据类型设置不同的频率和波形
            switch(type) {
                case 'crisp':
                    oscillator.frequency.value = 800;
                    oscillator.type = 'sine';
                    break;
                case 'soft':
                    oscillator.frequency.value = 400;
                    oscillator.type = 'sine';
                    break;
                default:
                    oscillator.frequency.value = 600;
                    oscillator.type = 'triangle';
            }
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            
            showToast('🔊 正在播放...', 'success');
        } catch (e) {
            console.error('音频生成失败:', e);
            showToast('❌ 播放失败', 'error');
        }
    }
    
    // 试听通话铃声
    const testCallRingtoneBtn = document.getElementById('test-call-ringtone-btn');
    if (testCallRingtoneBtn) {
        testCallRingtoneBtn.addEventListener('click', function() {
            playTestCallRingtone();
        });
    }
    
    // 播放测试通话铃声（使用 Web Audio API 生成逼真电话振铃）
    function playTestCallRingtone() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const frequency1 = 440;
            const frequency2 = 480;
            const volume = 0.4;
            const ringDuration = 2.0;
            
            const osc1 = audioContext.createOscillator();
            const osc2 = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            osc1.type = 'sine';
            osc1.frequency.value = frequency1;
            
            osc2.type = 'sine';
            osc2.frequency.value = frequency2;
            
            osc1.connect(gainNode);
            osc2.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.05);
            gainNode.gain.setValueAtTime(volume, audioContext.currentTime + ringDuration - 0.05);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + ringDuration);
            
            osc1.start(audioContext.currentTime);
            osc2.start(audioContext.currentTime);
            osc1.stop(audioContext.currentTime + ringDuration);
            osc2.stop(audioContext.currentTime + ringDuration);
            
            showToast('🔔 正在播放通话铃声...', 'success');
        } catch (e) {
            console.error('播放通话铃声失败:', e);
            showToast('❌ 播放失败', 'error');
        }
    }
    
    // 上传自定义提示音
    const customSoundFile = document.getElementById('custom-sound-file');
    if (customSoundFile) {
        customSoundFile.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            // 验证文件类型
            if (!file.type.match(/audio\/(mp3|wav|mpeg|x-m4a)/)) {
                showToast('❌ 仅支持 MP3/WAV 格式', 'error');
                return;
            }
            
            // 验证文件大小（限制为 1MB）
            if (file.size > 1024 * 1024) {
                showToast('❌ 文件大小不能超过 1MB', 'error');
                return;
            }
            
            // 读取文件并转换为 Base64
            const reader = new FileReader();
            reader.onload = function(event) {
                window.customSoundData = event.target.result;
                updateCustomSoundStatus();
                showToast('✅ 自定义提示音已上传', 'success');
            };
            reader.onerror = function() {
                showToast('❌ 读取文件失败', 'error');
            };
            reader.readAsDataURL(file);
            
            // 清空 input，允许重复上传同一文件
            e.target.value = '';
        });
    }

    // ========================================
    // 🔔 消息推送通知功能
    // ========================================

    // 检查通知权限状态
    function checkNotificationStatus() {
        const statusEl = document.getElementById('desktop-notification-status');
        const enableBtn = document.getElementById('enable-notification-btn');
        const testBtn = document.getElementById('test-notification-btn');
        
        if (!statusEl || !enableBtn || !testBtn) return;
        
        if (!('Notification' in window)) {
            statusEl.textContent = '不支持';
            statusEl.style.color = '#ff3b30';
            enableBtn.textContent = '不支持';
            enableBtn.disabled = true;
            enableBtn.style.background = '#e0e0e0';
            enableBtn.style.color = '#999';
            testBtn.disabled = true;
            return;
        }
        
        const permission = Notification.permission;
        
        switch (permission) {
            case 'granted':
                statusEl.textContent = '已授权 ✓';
                statusEl.style.color = '#07C160';
                enableBtn.textContent = '已开启';
                enableBtn.disabled = true;
                enableBtn.style.background = '#e0e0e0';
                enableBtn.style.color = '#999';
                testBtn.disabled = false;
                break;
                
            case 'denied':
                statusEl.textContent = '已拒绝';
                statusEl.style.color = '#ff3b30';
                enableBtn.textContent = '前往设置';
                enableBtn.disabled = false;
                enableBtn.style.background = '#007AFF';
                enableBtn.style.color = 'white';
                enableBtn.onclick = () => {
                    alert('请在浏览器设置中允许此网站的通知权限\n\nChrome/Edge: 设置 > 隐私和安全 > 网站设置 > 通知\nSafari: 偏好设置 > 网站 > 通知');
                };
                testBtn.disabled = true;
                break;
                
            case 'default':
            default:
                statusEl.textContent = '未开启';
                statusEl.style.color = '#86868b';
                enableBtn.textContent = '开启通知';
                enableBtn.disabled = false;
                enableBtn.style.background = '#007AFF';
                enableBtn.style.color = 'white';
                testBtn.disabled = true;
                break;
        }
    }

    // 请求通知权限
    async function requestNotificationPermission() {
        if (!('Notification' in window)) {
            showToast('您的浏览器不支持通知功能');
            return;
        }
        
        try {
            const result = await Notification.requestPermission();
            console.log('[通知设置] 权限请求结果:', result);
            
            if (result === 'granted') {
                showToast('✅ 通知权限已开启！');
                checkNotificationStatus();
            } else {
                showToast('⚠️ 通知权限被拒绝');
                checkNotificationStatus();
            }
        } catch (error) {
            console.error('[通知设置] 请求权限失败:', error);
            showToast('❌ 请求权限失败');
        }
    }

    // 发送测试通知
    function sendTestNotification() {
        if (!('Notification' in window)) {
            showToast('您的浏览器不支持通知功能');
            return;
        }
        
        if (Notification.permission !== 'granted') {
            showToast('请先开启通知权限');
            return;
        }
        
        const notification = new Notification('🔔 测试通知', {
            body: '如果您看到这条通知，说明推送功能正常工作！',
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔔</text></svg>',
            tag: 'test-notification-' + Date.now()
        });
        
        notification.onclick = function() {
            window.focus();
            notification.close();
        };
        
        console.log('[通知设置] 测试通知已发送');
        showToast('✅ 测试通知已发送');
    }

    // 初始化通知设置
    function initNotificationSettings() {
        const enableBtn = document.getElementById('enable-notification-btn');
        const testBtn = document.getElementById('test-notification-btn');
        
        if (enableBtn) {
            enableBtn.addEventListener('click', requestNotificationPermission);
        }
        
        if (testBtn) {
            testBtn.addEventListener('click', sendTestNotification);
        }
        
        // 检查初始状态
        checkNotificationStatus();
    }

    // 页面加载时初始化通知设置
    if (document.getElementById('settings-page')) {
        initNotificationSettings();
    }
});

// ========== 后台保活与横幅通知 ==========

const SETTINGS_KEEPALIVE_API = 'http://localhost:8081/api/keepalive';

async function settingsKeepAliveRequest(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (body) options.body = JSON.stringify(body);
        const res = await fetch(`${SETTINGS_KEEPALIVE_API}${endpoint}`, options);
        return await res.json();
    } catch (e) {
        console.error('[KeepAlive] 请求失败:', e);
        return null;
    }
}

window.syncToKeepAlive = async function() {
    const status = await settingsKeepAliveRequest('/status');
    if (!status) {
        if (window.showToast) showToast('无法连接保活服务', 'error');
        return;
    }

    const currentPersona = localStorage.getItem('currentPersona') || localStorage.getItem('currentPersonaId') || 'default';
    const contactsKey = `persona_${currentPersona}_chatContacts`;
    const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');

    const apiConfig = JSON.parse(localStorage.getItem('globalApiConfig') || 'null');

    await settingsKeepAliveRequest('/config', 'POST', {
        apiConfig,
        contacts: contacts.map(c => ({
            id: c.id,
            name: c.name || c.contactName,
            persona: c.persona || c.systemPrompt || ''
        }))
    });

    let syncCount = 0;
    for (const contact of contacts) {
        try {
            const storageKey = `persona_${currentPersona}_chat_${contact.id}`;
            let messages = [];
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                try { messages = JSON.parse(stored); } catch (e) {}
            }

            const settings = {};
            const autorejectKey = `role_${contact.id}_autoreject`;
            const autorejectStr = localStorage.getItem(autorejectKey);
            if (autorejectStr) {
                try { settings[autorejectKey] = JSON.parse(autorejectStr); } catch (e) {}
            }

            await settingsKeepAliveRequest('/sync', 'POST', {
                chatId: contact.id,
                messages,
                settings
            });
            syncCount++;
        } catch (e) {
            console.error(`[KeepAlive] 同步 ${contact.name} 失败:`, e);
        }
    }

    if (window.showToast) showToast(`已同步 ${syncCount} 个角色的数据`, 'success');
    await window.checkKeepAliveStatus();
};

window.checkKeepAliveStatus = async function() {
    const status = await settingsKeepAliveRequest('/status');
    const statusText = document.getElementById('keepalive-status-text');
    const statusDot = document.getElementById('keepalive-status-dot');
    const statsEl = document.getElementById('keepalive-stats');
    const statReplies = document.getElementById('keepalive-stat-replies');
    const statAuto = document.getElementById('keepalive-stat-auto');

    if (!status) {
        if (statusText) {
            statusText.textContent = '未连接';
            statusText.style.color = '#ff4d4f';
        }
        if (statusDot) statusDot.style.background = '#ff4d4f';
        if (statsEl) statsEl.style.display = 'none';
        if (window.showToast) showToast('保活服务未运行，请先执行: node keepalive-worker.js', 'error');
        return;
    }

    if (statusText) {
        if (status.enabled && status.running) {
            statusText.textContent = '运行中';
            statusText.style.color = '#52c41a';
        } else if (status.enabled) {
            statusText.textContent = '已启用（空闲）';
            statusText.style.color = '#faad14';
        } else {
            statusText.textContent = '已停止';
            statusText.style.color = '#999';
        }
    }
    if (statusDot) {
        statusDot.style.background = (status.enabled && status.running) ? '#52c41a' : (status.enabled ? '#faad14' : '#ccc');
    }

    if (statsEl && status.stats) {
        statsEl.style.display = 'block';
        if (statReplies) statReplies.textContent = status.stats.totalReplies || 0;
        if (statAuto) statAuto.textContent = status.stats.totalAutoMessages || 0;
    }

    const intervalEl = document.getElementById('settings-keepalive-interval');
    if (intervalEl && status.checkInterval) intervalEl.value = status.checkInterval;
};

window.toggleKeepAlive = async function() {
    const keepSwitch = document.getElementById('background-keep-switch');
    const enabled = keepSwitch && keepSwitch.classList.contains('active');

    if (enabled) {
        const status = await settingsKeepAliveRequest('/status');
        if (!status) {
            if (window.showToast) showToast('无法连接保活服务，请先运行 node keepalive-worker.js', 'error');
            if (keepSwitch) keepSwitch.classList.remove('active');
            const keepaliveSection = document.getElementById('keepalive-detail-section');
            if (keepaliveSection) keepaliveSection.style.display = 'none';
            return;
        }

        const intervalEl = document.getElementById('settings-keepalive-interval');
        const checkInterval = intervalEl ? Math.max(30, parseInt(intervalEl.value) || 60) : 60;

        const apiConfig = JSON.parse(localStorage.getItem('globalApiConfig') || 'null');
        if (!apiConfig || !apiConfig.mainApi || !apiConfig.mainApi.url || !apiConfig.mainApi.token) {
            if (window.showToast) showToast('请先配置 API 信息', 'error');
            if (keepSwitch) keepSwitch.classList.remove('active');
            const keepaliveSection = document.getElementById('keepalive-detail-section');
            if (keepaliveSection) keepaliveSection.style.display = 'none';
            return;
        }

        const currentPersona = localStorage.getItem('currentPersona') || localStorage.getItem('currentPersonaId') || 'default';
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');

        const result = await settingsKeepAliveRequest('/config', 'POST', {
            enabled: true,
            checkInterval,
            apiConfig,
            contacts: contacts.map(c => ({
                id: c.id,
                name: c.name || c.contactName,
                persona: c.persona || c.systemPrompt || ''
            }))
        });

        if (result && result.success) {
            if (window.showToast) showToast('后台保活已启动', 'success');
            await window.syncToKeepAlive();
        } else {
            if (window.showToast) showToast('启动保活服务失败', 'error');
            if (keepSwitch) keepSwitch.classList.remove('active');
            const keepaliveSection = document.getElementById('keepalive-detail-section');
            if (keepaliveSection) keepaliveSection.style.display = 'none';
        }
    } else {
        const result = await settingsKeepAliveRequest('/stop', 'POST');
        if (result && result.success) {
            if (window.showToast) showToast('后台保活已停止', 'success');
        }
    }
};

window.toggleBannerNotification = async function() {
    const bannerSwitch = document.getElementById('banner-notification-switch');
    const enabled = bannerSwitch && bannerSwitch.classList.contains('active');

    if (enabled) {
        if (!('Notification' in window)) {
            if (window.showToast) showToast('你的浏览器不支持通知功能', 'error');
            if (bannerSwitch) bannerSwitch.classList.remove('active');
            const bannerSection = document.getElementById('banner-detail-section');
            if (bannerSection) bannerSection.style.display = 'none';
            return;
        }

        if (Notification.permission === 'default') {
            const result = await Notification.requestPermission();
            if (result !== 'granted') {
                if (window.showToast) showToast('需要允许通知权限才能弹窗提醒', 'error');
                if (bannerSwitch) bannerSwitch.classList.remove('active');
                const bannerSection = document.getElementById('banner-detail-section');
                if (bannerSection) bannerSection.style.display = 'none';
                return;
            }
        } else if (Notification.permission === 'denied') {
            if (window.showToast) showToast('通知权限被拒绝，请在浏览器设置中开启', 'error');
            if (bannerSwitch) bannerSwitch.classList.remove('active');
            const bannerSection = document.getElementById('banner-detail-section');
            if (bannerSection) bannerSection.style.display = 'none';
            return;
        }

        localStorage.setItem('keepalive_notification_enabled', 'true');
        if (window.showToast) showToast('横幅通知已开启，离开页面时会弹窗提醒', 'success');
    } else {
        localStorage.setItem('keepalive_notification_enabled', 'false');
        if (window.showToast) showToast('横幅通知已关闭', 'success');
    }
};