// ========== 美化功能模块 ==========
(function() {
    'use strict';

    // 美化配置
    let beautifyConfig = {
        wallpaper: '',
        statusBarVisible: true,
        customIcons: {},
        fontUrl: '',
        fontName: '',
        customCss: '',
        widgetAvatar: ''
    };

    // APP图标列表（与桌面图标保持一致）
    const appIcons = [
        { id: 'chat', name: '聊天', icon: '<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' },
        { id: 'forum', name: '论坛', icon: '<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none"><path d="M17 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M23 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M8 12h8"/></svg>' },
        { id: 'couple', name: '情侣', icon: '<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' },
        { id: 'game', name: '游戏', icon: '<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 22h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8"/><path d="M8 12h4M10 10v4"/><circle cx="16" cy="12" r="2"/></svg>' },
        { id: 'diary', name: '日记', icon: '<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' },
        { id: 'device-check', name: '查岗', icon: '<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/><circle cx="12" cy="10" r="3"/></svg>' },
        { id: 'shop', name: '商城', icon: '<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>' },
        { id: 'settings', name: '设置', icon: '<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>' },
        { id: 'beautify', name: '美化', icon: '<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="3"/><path d="M12 1a9 9 0 0 1 9 9c0 4.17-2.2 7.93-5.5 10v1a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-1A11.99 11.99 0 0 1 3 10a9 9 0 0 1 9-9z"/></svg>' },
        { id: 'worldbook', name: '世界书', icon: '<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 12h8M8 11h8M8 15h4"/></svg>' },
        { id: 'memory', name: '记忆', icon: '<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>' },
        { id: 'together', name: '一起', icon: '<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none"><path d="M17 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M23 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
        { id: 'ifline', name: 'if线', icon: '<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none"><path d="M18 4L6 20"/><path d="M12 4l-2 4"/><path d="M16 14l-2 4"/></svg>' }
    ];

    // 初始化
    function init() {
        loadConfig();
        
        // 检查是否在美化页面
        const isBeautifyPage = document.getElementById('beautify-page');
        
        if (isBeautifyPage) {
            // 在美化页面执行完整初始化
            bindEvents();
            renderIconPreviews();
            populateForm();
        }
        
        // 在所有页面都应用配置（壁纸、图标、字体、CSS）
        applyConfig();
    }

    // 加载配置
    function loadConfig() {
        const saved = localStorage.getItem('beautifyConfig');
        if (saved) {
            beautifyConfig = JSON.parse(saved);
        }
    }

    // 保存配置
    function saveConfig() {
        localStorage.setItem('beautifyConfig', JSON.stringify(beautifyConfig));
    }

    // 应用配置
    function applyConfig() {
        // 应用壁纸
        const container = document.getElementById('phone-container');
        if (container) {
            if (beautifyConfig.wallpaper) {
                container.style.backgroundImage = `url(${beautifyConfig.wallpaper})`;
                container.style.backgroundSize = 'cover';
                container.style.backgroundPosition = 'center';
            } else {
                container.style.backgroundImage = '';
                container.style.backgroundColor = 'var(--bg-primary)';
            }
        }

        // 应用状态栏
        const statusBar = document.getElementById('status-bar');
        if (statusBar) {
            statusBar.style.display = beautifyConfig.statusBarVisible ? 'flex' : 'none';
        }

        // 应用自定义图标
        appIcons.forEach(app => {
            const iconBox = document.querySelector(`[data-app-id="${app.id}"] .app-icon-box`);
            if (iconBox && beautifyConfig.customIcons[app.id]) {
                iconBox.style.backgroundImage = `url(${beautifyConfig.customIcons[app.id]})`;
                iconBox.style.backgroundSize = 'cover';
                iconBox.style.backgroundPosition = 'center';
                iconBox.style.setProperty('border', 'none', 'important');
                iconBox.style.setProperty('box-shadow', 'none', 'important');
                iconBox.innerHTML = '';
            }
        });

        // 应用组件头像
        const avatarImg = document.getElementById('widget-avatar-img');
        if (avatarImg && beautifyConfig.widgetAvatar) {
            avatarImg.src = beautifyConfig.widgetAvatar;
        }

        // 应用虚线头像
        const avatarImg2 = document.getElementById('widget-avatar-img-2');
        if (avatarImg2) {
            const savedAvatar2 = localStorage.getItem('widgetAvatar2');
            if (savedAvatar2) {
                avatarImg2.src = savedAvatar2;
            }
        }

        // 应用副文本
        const subText = document.querySelector('.time-sub-text');
        if (subText) {
            const savedSubText = localStorage.getItem('widgetSubText');
            if (savedSubText) {
                subText.innerText = savedSubText;
            }
        }

        // 应用字体
        if (beautifyConfig.fontUrl) {
            // 直接用最简单的方式：把字体链接转成自定义CSS一样的方式
            let fontStyle = document.getElementById('custom-font-style');
            if (!fontStyle) {
                fontStyle = document.createElement('style');
                fontStyle.id = 'custom-font-style';
                document.head.appendChild(fontStyle);
            }
            
            // 对于 Google Fonts，提取字体名
            let fontFamily = 'Noto Sans SC';
            if (beautifyConfig.fontUrl.match(/family=([^&]+)/)) {
                fontFamily = decodeURIComponent(RegExp.$1).replace(/\+/g, ' ').replace(/:.*$/, '');
            }
            
            // 直接把 @import 和字体样式放在一起，这样最简单！
            fontStyle.textContent = `
                @import url('${beautifyConfig.fontUrl}');
                html, body, div, span, applet, object, iframe,
                h1, h2, h3, h4, h5, h6, p, blockquote, pre,
                a, abbr, acronym, address, big, cite, code,
                del, dfn, em, img, ins, kbd, q, s, samp,
                small, strike, strong, sub, sup, tt, var,
                b, u, i, center,
                dl, dt, dd, ol, ul, li,
                fieldset, form, label, legend,
                table, caption, tbody, tfoot, thead, tr, th, td,
                article, aside, canvas, details, embed,
                figure, figcaption, footer, header, hgroup,
                menu, nav, output, ruby, section, summary,
                time, mark, audio, video, * {
                    font-family: '${fontFamily}', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                }
            `;
            // 移除旧的 link 标签
            const oldLink = document.getElementById('custom-font-link');
            if (oldLink) oldLink.remove();
        } else {
            // 清除字体设置
            const fontLink = document.getElementById('custom-font-link');
            const fontStyle = document.getElementById('custom-font-style');
            if (fontLink) fontLink.remove();
            if (fontStyle) fontStyle.remove();
        }

        // 应用自定义CSS
        if (beautifyConfig.customCss) {
            let styleEl = document.getElementById('custom-css-style');
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = 'custom-css-style';
                document.head.appendChild(styleEl);
            }
            styleEl.textContent = beautifyConfig.customCss;
        }
    }

    // 填充表单
    function populateForm() {
        // 壁纸预览
        const preview = document.getElementById('wallpaper-preview');
        if (preview) {
            if (beautifyConfig.wallpaper) {
                preview.style.backgroundImage = `url(${beautifyConfig.wallpaper})`;
                preview.style.backgroundSize = 'cover';
                preview.textContent = '';
            } else {
                preview.style.backgroundImage = '';
                preview.textContent = '暂无壁纸';
            }
        }

        // 壁纸URL输入框
        const urlInput = document.getElementById('wallpaper-url');
        if (urlInput) urlInput.value = beautifyConfig.wallpaper || '';

        // 状态栏开关 - 确保状态正确
        const statusBarSwitch = document.getElementById('status-bar-switch');
        if (statusBarSwitch) {
            // 先移除所有状态，再添加正确的状态
            statusBarSwitch.classList.remove('active');
            if (beautifyConfig.statusBarVisible) {
                statusBarSwitch.classList.add('active');
            }
        }

        // 字体URL
        const fontUrl = document.getElementById('font-url');
        if (fontUrl) fontUrl.value = beautifyConfig.fontUrl || '';
        
        // 字体名称
        const fontName = document.getElementById('font-name');
        if (fontName) fontName.value = beautifyConfig.fontName || '';

        // 自定义CSS
        const customCss = document.getElementById('custom-css');
        if (customCss) customCss.value = beautifyConfig.customCss || '';

        // 加载方案列表
        loadPresets();
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
        
        // 创建选择对话框
        const dialog = document.createElement('div');
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
                max-width: 400px;
                width: 90%;
                box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            ">
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #333;">
                    自定义 ${appInfo.name} 图标
                </div>
                
                <!-- 选项1：上传本地图片 -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 14px; color: #666; margin-bottom: 8px;">
                         上传本地图片
                    </label>
                    <input type="file" id="icon-file-input" accept="image/*" style="
                        width: 100%;
                        padding: 12px;
                        border: 2px dashed #ddd;
                        border-radius: 8px;
                        cursor: pointer;
                        background: #f5f5f7;
                    ">
                </div>
                
                <!-- 选项2：输入URL -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 14px; color: #666; margin-bottom: 8px;">
                         使用图片链接
                    </label>
                    <input type="text" id="icon-url-input" placeholder="https://example.com/icon.png" style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        font-size: 14px;
                        box-sizing: border-box;
                    ">
                </div>
                
                <!-- 按钮 -->
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button id="cancel-icon-btn" style="
                        padding: 10px 20px;
                        border: none;
                        border-radius: 8px;
                        background: #f5f5f7;
                        color: #666;
                        font-size: 14px;
                        cursor: pointer;
                    ">取消</button>
                    <button id="confirm-icon-btn" style="
                        padding: 10px 20px;
                        border: none;
                        border-radius: 8px;
                        background: #007AFF;
                        color: white;
                        font-size: 14px;
                        cursor: pointer;
                    ">确定</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 取消按钮
        document.getElementById('cancel-icon-btn').addEventListener('click', function() {
            dialog.remove();
        });
        
        // 点击背景关闭
        dialog.addEventListener('click', function(e) {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
        
        // 确定按钮
        document.getElementById('confirm-icon-btn').addEventListener('click', function() {
            const fileInput = document.getElementById('icon-file-input');
            const urlInput = document.getElementById('icon-url-input');
            
            // 优先处理文件上传
            if (fileInput.files && fileInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    beautifyConfig.customIcons[appId] = event.target.result;
                    saveConfig();
                    applyConfig();
                    renderIconPreviews();
                    dialog.remove();
                    showToast('图标已保存');
                };
                reader.readAsDataURL(fileInput.files[0]);
            }
            // 其次处理URL
            else if (urlInput.value && urlInput.value.trim()) {
                const url = urlInput.value.trim();
                // 验证URL格式
                if (url.match(/^https?:\/\//)) {
                    beautifyConfig.customIcons[appId] = url;
                    saveConfig();
                    applyConfig();
                    renderIconPreviews();
                    dialog.remove();
                    showToast('图标已保存');
                } else {
                    showToast('请输入有效的图片URL（以http://或https://开头）', 'error');
                }
            } else {
                showToast('请选择文件或输入URL', 'error');
            }
        });
    }

    // 绑定事件
    function bindEvents() {
        // 壁纸文件上传
        const wallpaperFile = document.getElementById('wallpaper-file');
        if (wallpaperFile) {
            wallpaperFile.addEventListener('change', function(e) {
                if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        beautifyConfig.wallpaper = event.target.result;
                        const preview = document.getElementById('wallpaper-preview');
                        if (preview) {
                            preview.style.backgroundImage = `url(${event.target.result})`;
                            preview.style.backgroundSize = 'cover';
                            preview.textContent = '';
                        }
                        const urlInput = document.getElementById('wallpaper-url');
                        if (urlInput) urlInput.value = '';
                        showToast('壁纸已选择，点击保存生效');
                    };
                    reader.readAsDataURL(e.target.files[0]);
                }
            });
        }

        // 应用壁纸URL按钮
        const applyWallpaperBtn = document.getElementById('apply-wallpaper-btn');
        if (applyWallpaperBtn) {
            applyWallpaperBtn.addEventListener('click', function() {
                const urlInput = document.getElementById('wallpaper-url');
                if (urlInput && urlInput.value.trim()) {
                    beautifyConfig.wallpaper = urlInput.value.trim();
                    const preview = document.getElementById('wallpaper-preview');
                    if (preview) {
                        preview.style.backgroundImage = `url(${beautifyConfig.wallpaper})`;
                        preview.style.backgroundSize = 'cover';
                        preview.textContent = '';
                    }
                    showToast('壁纸已选择，点击保存生效');
                } else {
                    showToast('请输入壁纸URL', 'error');
                }
            });
        }

        // 删除壁纸按钮
        const deleteWallpaperBtn = document.getElementById('delete-wallpaper-btn');
        if (deleteWallpaperBtn) {
            deleteWallpaperBtn.addEventListener('click', function() {
                beautifyConfig.wallpaper = '';
                const preview = document.getElementById('wallpaper-preview');
                if (preview) {
                    preview.style.backgroundImage = '';
                    preview.textContent = '暂无壁纸';
                }
                const urlInput = document.getElementById('wallpaper-url');
                if (urlInput) urlInput.value = '';
                showToast('壁纸已删除，点击保存生效');
            });
        }

        // 保存壁纸按钮
        const saveWallpaperBtn = document.getElementById('save-wallpaper-btn');
        if (saveWallpaperBtn) {
            saveWallpaperBtn.addEventListener('click', function() {
                saveConfig();
                applyConfig();
                showToast('壁纸设置已保存！');
            });
        }

        // 状态栏开关 - 滑动立即生效
        const statusBarSwitch = document.getElementById('status-bar-switch');
        if (statusBarSwitch) {
            statusBarSwitch.addEventListener('click', function(e) {
                e.stopPropagation();
                this.classList.toggle('active');
                beautifyConfig.statusBarVisible = this.classList.contains('active');
                // 立即保存并生效
                saveConfig();
                applyConfig();
                showToast(beautifyConfig.statusBarVisible ? '状态栏已显示' : '状态栏已隐藏');
            });
        }

        // 保存字体按钮
        const saveFontBtn = document.getElementById('save-font-btn');
        if (saveFontBtn) {
            saveFontBtn.addEventListener('click', function() {
                const fontUrl = document.getElementById('font-url');
                const fontName = document.getElementById('font-name');
                if (fontUrl) {
                    beautifyConfig.fontUrl = fontUrl.value.trim();
                }
                if (fontName) {
                    beautifyConfig.fontName = fontName.value.trim();
                }
                saveConfig();
                applyConfig();
                showToast('字体设置已保存！如果没看到变化，刷新页面试试！');
            });
        }

        // CSS文件导入
        const cssFile = document.getElementById('css-file');
        if (cssFile) {
            cssFile.addEventListener('change', function(e) {
                if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const cssInput = document.getElementById('custom-css');
                        if (cssInput) {
                            cssInput.value = event.target.result;
                        }
                        showToast('CSS文件已导入，点击保存生效');
                    };
                    reader.readAsText(e.target.files[0]);
                }
            });
        }

        // 清空CSS按钮
        const clearCssBtn = document.getElementById('clear-css-btn');
        if (clearCssBtn) {
            clearCssBtn.addEventListener('click', function() {
                const cssInput = document.getElementById('custom-css');
                if (cssInput) cssInput.value = '';
                showToast('CSS已清空');
            });
        }

        // 保存CSS按钮
        const saveCssBtn = document.getElementById('save-css-btn');
        if (saveCssBtn) {
            saveCssBtn.addEventListener('click', function() {
                const customCss = document.getElementById('custom-css');
                if (customCss) {
                    beautifyConfig.customCss = customCss.value;
                }
                saveConfig();
                applyConfig();
                showToast('CSS设置已保存！');
            });
        }

        // 保存方案按钮
        const savePresetBtn = document.getElementById('save-beautify-preset-btn');
        if (savePresetBtn) {
            savePresetBtn.addEventListener('click', savePreset);
        }

        // 恢复默认美化按钮
        const resetBtn = document.getElementById('reset-beautify-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', window.resetBeautify);
        }
    }

    // 方案管理
    function loadPresets() {
        const listEl = document.getElementById('beautify-preset-list');
        if (!listEl) return;

        const saved = localStorage.getItem('beautifyPresets');
        const presets = saved ? JSON.parse(saved) : [];

        if (presets.length === 0) {
            listEl.innerHTML = '<div class="preset-empty">暂无保存的方案</div>';
            return;
        }

        let html = '';
        presets.forEach((preset, index) => {
            html += `
                <div class="preset-item">
                    <div class="preset-name">${preset.name}</div>
                    <div class="preset-btns">
                        <button class="preset-use-btn" onclick="window.applyBeautifyPreset(${index})">应用</button>
                        <button class="preset-del-btn" onclick="window.deleteBeautifyPreset(${index})">删除</button>
                    </div>
                </div>
            `;
        });
        listEl.innerHTML = html;
    }

    function savePreset() {
        const name = prompt('请输入方案名称：');
        if (!name) return;

        // 收集当前所有设置
        const fontUrl = document.getElementById('font-url');
        const customCss = document.getElementById('custom-css');
        if (fontUrl) beautifyConfig.fontUrl = fontUrl.value.trim();
        if (customCss) beautifyConfig.customCss = customCss.value;
        
        saveConfig();

        const saved = localStorage.getItem('beautifyPresets');
        const presets = saved ? JSON.parse(saved) : [];
        presets.push({
            name: name,
            config: JSON.parse(JSON.stringify(beautifyConfig))
        });
        localStorage.setItem('beautifyPresets', JSON.stringify(presets));

        loadPresets();
        showToast('方案已保存！');
    }

    // 全局方法
    window.refreshBeautifyForm = function() {
        loadConfig();
        populateForm();
    };
    
    window.applyBeautifyPreset = function(index) {
        const saved = localStorage.getItem('beautifyPresets');
        const presets = saved ? JSON.parse(saved) : [];
        if (presets[index]) {
            beautifyConfig = JSON.parse(JSON.stringify(presets[index].config));
            saveConfig();
            applyConfig();
            populateForm();
            renderIconPreviews();
            showToast('方案已应用！');
        }
    };

    window.deleteBeautifyPreset = function(index) {
        if (!confirm('确定要删除这个方案吗？')) return;

        const saved = localStorage.getItem('beautifyPresets');
        const presets = saved ? JSON.parse(saved) : [];
        presets.splice(index, 1);
        localStorage.setItem('beautifyPresets', JSON.stringify(presets));

        loadPresets();
        showToast('方案已删除');
    };

    // 显示提示
    function showToast(message, type = 'success') {
        const toast = document.getElementById('beautify-toast');
        if (!toast) {
            alert(message);
            return;
        }

        toast.textContent = message;
        toast.className = `toast ${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    // 设置组件头像
    window.setWidgetAvatar = function() {
        const dialog = document.createElement('div');
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
                <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #333; text-align: center;">
                    选择图片来源
                </div>
                
                <button id="avatar-local-btn" style="
                    width: 100%;
                    padding: 12px;
                    margin-bottom: 12px;
                    border: none;
                    border-radius: 12px;
                    background: #f5f5f7;
                    color: #333;
                    font-size: 14px;
                    cursor: pointer;
                ">本地相册</button>
                
                <button id="avatar-url-btn" style="
                    width: 100%;
                    padding: 12px;
                    margin-bottom: 16px;
                    border: none;
                    border-radius: 12px;
                    background: #f5f5f7;
                    color: #333;
                    font-size: 14px;
                    cursor: pointer;
                ">图片链接</button>
                
                <button id="avatar-cancel-btn" style="
                    width: 100%;
                    padding: 10px;
                    border: none;
                    background: transparent;
                    color: #666;
                    font-size: 14px;
                    cursor: pointer;
                ">取消</button>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 取消按钮
        document.getElementById('avatar-cancel-btn').addEventListener('click', function() {
            dialog.remove();
        });
        
        // 点击背景关闭
        dialog.addEventListener('click', function(e) {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
        
        // 本地相册
        document.getElementById('avatar-local-btn').addEventListener('click', function() {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        beautifyConfig.widgetAvatar = event.target.result;
                        saveConfig();
                        applyConfig();
                        dialog.remove();
                        showToast('头像已保存');
                    };
                    reader.readAsDataURL(file);
                }
            });
            fileInput.click();
        });
        
        // 图片链接
        document.getElementById('avatar-url-btn').addEventListener('click', function() {
            const urlDialog = document.createElement('div');
            urlDialog.style.cssText = `
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
            
            urlDialog.innerHTML = `
                <div style="
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    max-width: 360px;
                    width: 90%;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                ">
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #333;">
                        输入图片链接
                    </div>
                    
                    <input type="text" id="avatar-url-input" placeholder="https://example.com/avatar.jpg" style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        font-size: 14px;
                        box-sizing: border-box;
                        margin-bottom: 16px;
                    ">
                    
                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button id="url-cancel-btn" style="
                            padding: 10px 20px;
                            border: none;
                            border-radius: 8px;
                            background: #f5f5f7;
                            color: #666;
                            font-size: 14px;
                            cursor: pointer;
                        ">取消</button>
                        <button id="url-confirm-btn" style="
                            padding: 10px 20px;
                            border: none;
                            border-radius: 8px;
                            background: #007AFF;
                            color: white;
                            font-size: 14px;
                            cursor: pointer;
                        ">确定</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(urlDialog);
            
            document.getElementById('url-cancel-btn').addEventListener('click', function() {
                urlDialog.remove();
            });
            
            urlDialog.addEventListener('click', function(e) {
                if (e.target === urlDialog) {
                    urlDialog.remove();
                }
            });
            
            document.getElementById('url-confirm-btn').addEventListener('click', function() {
                const url = document.getElementById('avatar-url-input').value.trim();
                if (url && url.match(/^https?:\/\//)) {
                    beautifyConfig.widgetAvatar = url;
                    saveConfig();
                    applyConfig();
                    urlDialog.remove();
                    dialog.remove();
                    showToast('头像已保存');
                } else {
                    alert('请输入有效的图片 URL');
                }
            });
        });
    };

    // 设置虚线头像
    window.setWidgetAvatar2 = function() {
        const dialog = document.createElement('div');
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
                <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #333; text-align: center;">
                    选择图片来源
                </div>
                
                <button id="avatar2-local-btn" style="
                    width: 100%;
                    padding: 12px;
                    margin-bottom: 12px;
                    border: none;
                    border-radius: 12px;
                    background: #f5f5f7;
                    color: #333;
                    font-size: 14px;
                    cursor: pointer;
                ">本地相册</button>
                
                <button id="avatar2-url-btn" style="
                    width: 100%;
                    padding: 12px;
                    margin-bottom: 16px;
                    border: none;
                    border-radius: 12px;
                    background: #f5f5f7;
                    color: #333;
                    font-size: 14px;
                    cursor: pointer;
                ">图片链接</button>
                
                <button id="avatar2-cancel-btn" style="
                    width: 100%;
                    padding: 10px;
                    border: none;
                    background: transparent;
                    color: #666;
                    font-size: 14px;
                    cursor: pointer;
                ">取消</button>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 取消按钮
        document.getElementById('avatar2-cancel-btn').addEventListener('click', function() {
            dialog.remove();
        });
        
        // 点击背景关闭
        dialog.addEventListener('click', function(e) {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
        
        // 本地相册
        document.getElementById('avatar2-local-btn').addEventListener('click', function() {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const avatarImg = document.getElementById('widget-avatar-img-2');
                        if (avatarImg) {
                            avatarImg.src = event.target.result;
                            localStorage.setItem('widgetAvatar2', event.target.result);
                        }
                        dialog.remove();
                        showToast('头像已保存');
                    };
                    reader.readAsDataURL(file);
                }
            });
            fileInput.click();
        });
        
        // 图片链接
        document.getElementById('avatar2-url-btn').addEventListener('click', function() {
            const urlDialog = document.createElement('div');
            urlDialog.style.cssText = `
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
            
            urlDialog.innerHTML = `
                <div style="
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    max-width: 360px;
                    width: 90%;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                ">
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #333;">
                        输入图片链接
                    </div>
                    
                    <input type="text" id="avatar2-url-input" placeholder="https://example.com/avatar.jpg" style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        font-size: 14px;
                        box-sizing: border-box;
                        margin-bottom: 16px;
                    ">
                    
                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button id="url2-cancel-btn" style="
                            padding: 10px 20px;
                            border: none;
                            border-radius: 8px;
                            background: #f5f5f7;
                            color: #666;
                            font-size: 14px;
                            cursor: pointer;
                        ">取消</button>
                        <button id="url2-confirm-btn" style="
                            padding: 10px 20px;
                            border: none;
                            border-radius: 8px;
                            background: #007AFF;
                            color: white;
                            font-size: 14px;
                            cursor: pointer;
                        ">确定</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(urlDialog);
            
            document.getElementById('url2-cancel-btn').addEventListener('click', function() {
                urlDialog.remove();
            });
            
            urlDialog.addEventListener('click', function(e) {
                if (e.target === urlDialog) {
                    urlDialog.remove();
                }
            });
            
            document.getElementById('url2-confirm-btn').addEventListener('click', function() {
                const url = document.getElementById('avatar2-url-input').value.trim();
                if (url && url.match(/^https?:\/\//)) {
                    const avatarImg = document.getElementById('widget-avatar-img-2');
                    if (avatarImg) {
                        avatarImg.src = url;
                        localStorage.setItem('widgetAvatar2', url);
                    }
                    urlDialog.remove();
                    dialog.remove();
                    showToast('头像已保存');
                } else {
                    alert('请输入有效的图片 URL');
                }
            });
        });
    };

    // 编辑副文本
    window.editSubText = function() {
        // 副文本已经设置 contenteditable="true"，可以直接编辑
        // 添加失焦保存功能
        const subText = document.querySelector('.time-sub-text');
        if (subText) {
            subText.addEventListener('blur', function() {
                localStorage.setItem('widgetSubText', this.innerText);
            }, { once: true });
        }
    };

    // 恢复默认美化
    window.resetBeautify = function() {
        if (!confirm('确定要恢复默认美化吗？这将清空所有自定义设置！')) return;

        // 恢复默认美化（移除模块CSS）
        beautifyConfig = {
            wallpaper: '',
            statusBarVisible: true,
            customIcons: {},
            fontUrl: '',
            customCss: '',
            widgetAvatar: ''
        };

        saveConfig();
        showToast('已恢复默认美化');

        // 延迟刷新页面以确保配置已保存
        setTimeout(() => {
            location.reload();
        }, 500);
    };

    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 暴露初始化方法
    window.initBeautify = init;

    // 编辑拍立得图片
    window.editDialogImage = function(element, index) {
        const dialog = document.createElement('div');
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
                <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #333; text-align: center;">
                    选择图片来源
                </div>
                
                <button id="polaroid-local-btn" style="
                    width: 100%;
                    padding: 12px;
                    margin-bottom: 12px;
                    border: none;
                    border-radius: 12px;
                    background: #f5f5f7;
                    color: #333;
                    font-size: 14px;
                    cursor: pointer;
                ">本地相册</button>
                
                <button id="polaroid-url-btn" style="
                    width: 100%;
                    padding: 12px;
                    margin-bottom: 16px;
                    border: none;
                    border-radius: 12px;
                    background: #f5f5f7;
                    color: #333;
                    font-size: 14px;
                    cursor: pointer;
                ">图片链接</button>
                
                <button id="polaroid-cancel-btn" style="
                    width: 100%;
                    padding: 10px;
                    border: none;
                    background: transparent;
                    color: #666;
                    font-size: 14px;
                    cursor: pointer;
                ">取消</button>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 取消按钮
        document.getElementById('polaroid-cancel-btn').addEventListener('click', function() {
            dialog.remove();
        });
        
        // 点击背景关闭
        dialog.addEventListener('click', function(e) {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
        
        // 本地相册
        document.getElementById('polaroid-local-btn').addEventListener('click', function() {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const img = element.querySelector('img');
                        if (img) {
                            img.src = event.target.result;
                        }
                        dialog.remove();
                    };
                    reader.readAsDataURL(file);
                }
            });
            fileInput.click();
        });
        
        // 图片链接
        document.getElementById('polaroid-url-btn').addEventListener('click', function() {
            const urlDialog = document.createElement('div');
            urlDialog.style.cssText = `
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
            
            urlDialog.innerHTML = `
                <div style="
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    max-width: 360px;
                    width: 90%;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                ">
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #333;">
                        输入图片链接
                    </div>
                    
                    <input type="text" id="polaroid-url-input" placeholder="https://example.com/photo.jpg" style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        font-size: 14px;
                        box-sizing: border-box;
                        margin-bottom: 16px;
                    ">
                    
                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button id="polaroid-url-cancel-btn" style="
                            padding: 10px 20px;
                            border: none;
                            border-radius: 8px;
                            background: #f5f5f7;
                            color: #666;
                            font-size: 14px;
                            cursor: pointer;
                        ">取消</button>
                        <button id="polaroid-url-confirm-btn" style="
                            padding: 10px 20px;
                            border: none;
                            border-radius: 8px;
                            background: #007AFF;
                            color: white;
                            font-size: 14px;
                            cursor: pointer;
                        ">确定</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(urlDialog);
            
            document.getElementById('polaroid-url-cancel-btn').addEventListener('click', function() {
                urlDialog.remove();
            });
            
            urlDialog.addEventListener('click', function(e) {
                if (e.target === urlDialog) {
                    urlDialog.remove();
                }
            });
            
            document.getElementById('polaroid-url-confirm-btn').addEventListener('click', function() {
                const url = document.getElementById('polaroid-url-input').value.trim();
                if (url && url.match(/^https?:\/\//)) {
                    const img = element.querySelector('img');
                    if (img) {
                        img.src = url;
                    }
                    urlDialog.remove();
                    dialog.remove();
                } else {
                    alert('请输入有效的图片 URL');
                }
            });
        });
    };

    // 编辑对话头像
    window.editDialogAvatar = function(element) {
        const dialog = document.createElement('div');
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
                <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #333; text-align: center;">
                    选择图片来源
                </div>
                
                <button id="avatar-local-btn" style="
                    width: 100%;
                    padding: 12px;
                    margin-bottom: 12px;
                    border: none;
                    border-radius: 12px;
                    background: #f5f5f7;
                    color: #333;
                    font-size: 14px;
                    cursor: pointer;
                ">本地相册</button>
                
                <button id="avatar-url-btn" style="
                    width: 100%;
                    padding: 12px;
                    margin-bottom: 16px;
                    border: none;
                    border-radius: 12px;
                    background: #f5f5f7;
                    color: #333;
                    font-size: 14px;
                    cursor: pointer;
                ">图片链接</button>
                
                <button id="avatar-cancel-btn" style="
                    width: 100%;
                    padding: 10px;
                    border: none;
                    background: transparent;
                    color: #666;
                    font-size: 14px;
                    cursor: pointer;
                ">取消</button>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 取消按钮
        document.getElementById('avatar-cancel-btn').addEventListener('click', function() {
            dialog.remove();
        });
        
        // 点击背景关闭
        dialog.addEventListener('click', function(e) {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
        
        // 本地相册
        document.getElementById('avatar-local-btn').addEventListener('click', function() {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const img = element.querySelector('img');
                        if (img) {
                            img.src = event.target.result;
                        }
                        dialog.remove();
                    };
                    reader.readAsDataURL(file);
                }
            });
            fileInput.click();
        });
        
        // 图片链接
        document.getElementById('avatar-url-btn').addEventListener('click', function() {
            const urlDialog = document.createElement('div');
            urlDialog.style.cssText = `
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
            
            urlDialog.innerHTML = `
                <div style="
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    max-width: 360px;
                    width: 90%;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                ">
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #333;">
                        输入图片链接
                    </div>
                    
                    <input type="text" id="avatar-url-input" placeholder="https://example.com/avatar.jpg" style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        font-size: 14px;
                        box-sizing: border-box;
                        margin-bottom: 16px;
                    ">
                    
                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button id="url-cancel-btn" style="
                            padding: 10px 20px;
                            border: none;
                            border-radius: 8px;
                            background: #f5f5f7;
                            color: #666;
                            font-size: 14px;
                            cursor: pointer;
                        ">取消</button>
                        <button id="url-confirm-btn" style="
                            padding: 10px 20px;
                            border: none;
                            border-radius: 8px;
                            background: #007AFF;
                            color: white;
                            font-size: 14px;
                            cursor: pointer;
                        ">确定</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(urlDialog);
            
            document.getElementById('url-cancel-btn').addEventListener('click', function() {
                urlDialog.remove();
            });
            
            urlDialog.addEventListener('click', function(e) {
                if (e.target === urlDialog) {
                    urlDialog.remove();
                }
            });
            
            document.getElementById('url-confirm-btn').addEventListener('click', function() {
                const url = document.getElementById('avatar-url-input').value.trim();
                if (url && url.match(/^https?:\/\//)) {
                    const img = element.querySelector('img');
                    if (img) {
                        img.src = url;
                    }
                    urlDialog.remove();
                    dialog.remove();
                } else {
                    alert('请输入有效的图片 URL');
                }
            });
        });
    };

})();
