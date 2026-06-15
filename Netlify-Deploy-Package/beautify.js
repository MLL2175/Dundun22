// 美化设置页面脚本
(function() {
    // 默认配置
    const defaultConfig = {
        customFont: '',
        customFontUrl: '',
        customWallpaper: '',
        customIcons: {}
    };

    let beautifyConfig = {...defaultConfig};

    // APP图标列表（与桌面图标保持一致）
    const appIcons = [
        { id: 'chat', name: '聊天', icon: '<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' },
        { id: 'forum', name: '论坛', icon: '<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none"><path d="M17 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M23 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M8 12h8"/></svg>' },
        { id: 'couple', name: '情侣', icon: '<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' },
        { id: 'game', name: '游戏', icon: '<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 22h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8"/><path d="M8 12h4M10 10v4"/><circle cx="16" cy="12" r="2"/></svg>' },
        { id: 'diary', name: '日记', icon: '<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' },
        { id: 'device-check', name: '查岗', icon: '<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/><circle cx="12" cy="10" r="3"/></svg>' },
        { id: 'shop', name: '商城', icon: '<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>' },
        { id: 'settings', name: '设置', icon: '<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>' },
        { id: 'beautify', name: '美化', icon: '<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="3"/><path d="M12 1a9 9 0 0 1 9 9c0 4.17-2.2 7.93-5.5 10v1a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-1A11.99 11.99 0 0 1 3 10a9 9 0 0 1 9-9z"/></svg>' },
        { id: 'worldbook', name: '世界书', icon: '<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 12h8M8 11h8M8 15h4"/></svg>' },
        { id: 'memory', name: '记忆', icon: '<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>' },
        { id: 'together', name: '一起', icon: '<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none"><path d="M17 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M23 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
        { id: 'ifline', name: 'if线', icon: '<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none"><path d="M18 4L6 20"/><path d="M12 4l-2 4"/><path d="M16 14l-2 4"/></svg>' }
    ];

    // 初始化
    function init() {
        loadConfig();
        renderIconPreviews();
        bindEvents();
        applyConfig();
    }

    // 加载配置
    function loadConfig() {
        const saved = localStorage.getItem('beautifyConfig');
        if (saved) {
            beautifyConfig = {...defaultConfig, ...JSON.parse(saved)};
        }
    }

    // 保存配置
    function saveConfig() {
        localStorage.setItem('beautifyConfig', JSON.stringify(beautifyConfig));
    }

    // 渲染图标预览
    function renderIconPreviews() {
        const container = document.getElementById('icon-preview-container');
        if (!container) return;

        let html = '<div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;">';
        
        appIcons.forEach(app => {
            const hasCustom = beautifyConfig.customIcons[app.id];
            html += `
                <div style="text-align: center;">
                    <div class="icon-preview-box" data-app-id="${app.id}" style="width: 50px; height: 50px; border-radius: 12px; background: var(--bg-card); display: flex; align-items: center; justify-content: center; font-size: 22px; cursor: pointer; margin: 0 auto; ${hasCustom ? `background-image: url(${beautifyConfig.customIcons[app.id]}); background-size: cover;` : ''} border: 2px solid var(--border-color);">
                        ${hasCustom ? '' : app.icon}
                    </div>
                    <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">${app.name}</div>
                    ${hasCustom ? `<button class="reset-icon-btn" data-app-id="${app.id}" style="background: #ff3b30; color: white; border: none; border-radius: 4px; padding: 2px 6px; font-size: 10px; cursor: pointer; margin-top: 2px;">重置</button>` : ''}
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;

        // 绑定图标点击事件
        container.querySelectorAll('.icon-preview-box').forEach(el => {
            el.addEventListener('click', function() {
                const appId = this.getAttribute('data-app-id');
                selectIconImage(appId);
            });
        });

        // 绑定重置按钮
        container.querySelectorAll('.reset-icon-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const appId = this.getAttribute('data-app-id');
                delete beautifyConfig.customIcons[appId];
                saveConfig();
                applyConfig();
                renderIconPreviews();
                showToast('图标已重置并保存');
            });
        });
    }

    // 选择图标图片（支持本地上传和URL）
    function selectIconImage(appId) {
        const appInfo = appIcons.find(a => a.id === appId);
        if (!appInfo) return;

        const choice = confirm('选择方式：\n\n- 点击"确定"选择本地图片\n- 点击"取消"输入图片URL');
        
        if (choice) {
            // 本地上传
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        beautifyConfig.customIcons[appId] = e.target.result;
                        saveConfig();
                        applyConfig();
                        renderIconPreviews();
                        showToast('图标已设置并保存');
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        } else {
            // URL输入
            const url = prompt('请输入图片URL：', 'https://');
            if (url && url !== 'https://') {
                beautifyConfig.customIcons[appId] = url;
                saveConfig();
                applyConfig();
                renderIconPreviews();
                showToast('图标已设置并保存');
            }
        }
    }

    // 绑定事件
    function bindEvents() {
        // 字体设置
        document.getElementById('font-input')?.addEventListener('change', function() {
            const fontUrl = this.value.trim();
            beautifyConfig.customFontUrl = fontUrl;
            saveConfig();
            applyConfig();
            showToast('字体链接已保存，刷新页面生效');
        });

        document.getElementById('reset-font-btn')?.addEventListener('click', function() {
            beautifyConfig.customFontUrl = '';
            document.getElementById('font-input').value = '';
            saveConfig();
            applyConfig();
            showToast('字体已重置');
        });

        // 1. URL 输入框：仅预览，不立即保存
        document.getElementById('wallpaper-url')?.addEventListener('input', function() {
            const wallpaperUrl = this.value.trim();
            const preview = document.getElementById('wallpaper-preview');
            if (preview && wallpaperUrl) {
                preview.style.backgroundImage = `url(${wallpaperUrl})`;
                preview.style.backgroundSize = 'cover';
                preview.style.backgroundPosition = 'center';
                preview.textContent = '';
            } else if (preview) {
                preview.style.backgroundImage = '';
                preview.textContent = '暂无壁纸';
            }
        });

        // 2. 本地上传文件：选择图片后更新输入框和预览
        document.getElementById('wallpaper-file')?.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const dataUrl = e.target.result;
                    const urlInput = document.getElementById('wallpaper-url');
                    if (urlInput) urlInput.value = dataUrl;
                    const preview = document.getElementById('wallpaper-preview');
                    if (preview) {
                        preview.style.backgroundImage = `url(${dataUrl})`;
                        preview.style.backgroundSize = 'cover';
                        preview.style.backgroundPosition = 'center';
                        preview.textContent = '';
                    }
                };
                reader.readAsDataURL(file);
            }
        });

        // 3. 应用壁纸按钮：立即把输入框的内容设置为桌面壁纸（不持久化）
        document.getElementById('apply-wallpaper-btn')?.addEventListener('click', function() {
            const urlInput = document.getElementById('wallpaper-url');
            const wallpaperUrl = urlInput ? urlInput.value.trim() : '';
            if (!wallpaperUrl) {
                showToast('请先输入或选择壁纸图片');
                return;
            }
            const homeScreen = document.getElementById('home-screen');
            if (homeScreen) {
                homeScreen.style.backgroundImage = `url(${wallpaperUrl})`;
                homeScreen.style.backgroundSize = 'cover';
                homeScreen.style.backgroundPosition = 'center';
                homeScreen.style.backgroundRepeat = 'no-repeat';
            }
            showToast('已应用壁纸');
        });

        // 4. 保存按钮：把当前输入框的壁纸保存到配置，下次打开仍然生效
        document.getElementById('save-wallpaper-btn')?.addEventListener('click', function() {
            const urlInput = document.getElementById('wallpaper-url');
            const wallpaperUrl = urlInput ? urlInput.value.trim() : '';
            if (!wallpaperUrl) {
                showToast('请先输入或选择壁纸图片');
                return;
            }
            beautifyConfig.customWallpaper = wallpaperUrl;
            saveConfig();
            applyConfig();
            showToast('壁纸已保存');
        });

        // 5. 删除壁纸按钮：清空配置和预览
        document.getElementById('delete-wallpaper-btn')?.addEventListener('click', function() {
            beautifyConfig.customWallpaper = '';
            const urlInput = document.getElementById('wallpaper-url');
            if (urlInput) urlInput.value = '';
            const preview = document.getElementById('wallpaper-preview');
            if (preview) {
                preview.style.backgroundImage = '';
                preview.textContent = '暂无壁纸';
            }
            saveConfig();
            applyConfig();
            showToast('壁纸已删除');
        });
    }

    // 应用配置
    function applyConfig() {
        // 应用自定义字体
        let fontStyle = document.getElementById('custom-font-style');
        if (!fontStyle) {
            fontStyle = document.createElement('style');
            fontStyle.id = 'custom-font-style';
            document.head.appendChild(fontStyle);
        }

        if (beautifyConfig.customFontUrl) {
            fontStyle.textContent = `
                @import url('${beautifyConfig.customFontUrl}');
                * {
                    font-family: inherit !important;
                }
            `;
        } else {
            fontStyle.textContent = '';
        }

        // 应用自定义壁纸
        if (beautifyConfig.customWallpaper) {
            const homeScreen = document.getElementById('home-screen');
            if (homeScreen) {
                homeScreen.style.backgroundImage = `url(${beautifyConfig.customWallpaper})`;
                homeScreen.style.backgroundSize = 'cover';
                homeScreen.style.backgroundPosition = 'center';
                homeScreen.style.backgroundRepeat = 'no-repeat';
            }
        } else {
            const homeScreen = document.getElementById('home-screen');
            if (homeScreen) {
                homeScreen.style.backgroundImage = '';
            }
        }

        // 应用自定义图标
        Object.entries(beautifyConfig.customIcons).forEach(([appId, iconUrl]) => {
            const desktopIcons = document.querySelectorAll(`.app-icon[data-app-id="${appId}"] .app-icon-box`);
            desktopIcons.forEach(iconBox => {
                iconBox.innerHTML = '';
                iconBox.style.backgroundImage = `url(${iconUrl})`;
                iconBox.style.backgroundSize = 'cover';
                iconBox.style.backgroundPosition = 'center';
            });
        });

        // 恢复默认图标
        appIcons.forEach(app => {
            if (!beautifyConfig.customIcons[app.id]) {
                const desktopIcons = document.querySelectorAll(`.app-icon[data-app-id="${app.id}"] .app-icon-box`);
                desktopIcons.forEach(iconBox => {
                    iconBox.innerHTML = app.icon;
                    iconBox.style.backgroundImage = '';
                    iconBox.style.backgroundSize = '';
                    iconBox.style.backgroundPosition = '';
                });
            }
        });

        // 填充表单
        document.getElementById('font-input').value = beautifyConfig.customFontUrl || '';
        const urlInput = document.getElementById('wallpaper-url');
        if (urlInput) urlInput.value = beautifyConfig.customWallpaper || '';
        const preview = document.getElementById('wallpaper-preview');
        if (preview) {
            if (beautifyConfig.customWallpaper) {
                preview.style.backgroundImage = `url(${beautifyConfig.customWallpaper})`;
                preview.style.backgroundSize = 'cover';
                preview.style.backgroundPosition = 'center';
                preview.textContent = '';
            } else {
                preview.style.backgroundImage = '';
                preview.textContent = '暂无壁纸';
            }
        }
    }

    // 显示提示
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            padding: 10px 24px;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            z-index: 999999;
            opacity: 0;
            transition: all 0.3s ease;
            background-color: #333333 !important;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '1';
        }, 10);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 暴露到全局
    window.beautify = {
        config: beautifyConfig,
        applyConfig
    };
})();
