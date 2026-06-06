// 音乐播放器逻辑
const audioPlayer = document.getElementById('audioPlayer');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const playPauseBtn = document.getElementById('playPauseBtn');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const nowPlayingArt = document.getElementById('nowPlayingArt');
const nowPlayingTitle = document.getElementById('nowPlayingTitle');
const nowPlayingArtist = document.getElementById('nowPlayingArtist');
const playerModal = document.getElementById('playerModal');

let currentPlaylist = [];
let currentIndex = -1;
let isPlaying = false;
let currentLyrics = [];
let lyricsInterval = null;

// 网易云登录状态
let neteaseLoginInfo = null; // { phone, cookie, userId, nickname }

// 当前使用的API
let currentMusicAPI = 'all'; // 默认使用全部API（自动切换）
// 内置公共API地址 - 多个备用API确保稳定性
const PUBLIC_APIS = {
    // 网易云音乐 - Meting API（最稳定）
    meting: 'https://api.i-meto.com/meting/api',
    // 网易云音乐 - Vercel部署版
    netease_vercel: 'https://netease-cloud-music-api-three-silk.vercel.app',
    // QQ音乐 - Tjit API
    qq_tjit: 'https://api.tjit.net/api/qqmusic/',
    // 酷狗音乐 - 公开API
    kugou_public: 'https://wwwapi.kugou.com/yy/index.php',
};
let neteaseApiUrl = PUBLIC_APIS.meting;

// 页面加载时读取API配置
window.addEventListener('DOMContentLoaded', () => {
    loadMusicAPIConfig();
    loadNeteaseLoginInfo(); // 加载登录信息
    updateAPITags(); // 更新API标签显示
});

// 加载音乐API配置
function loadMusicAPIConfig() {
    try {
        const config = JSON.parse(localStorage.getItem('musicApiConfig') || '{}');
        // 如果没有配置，使用默认的网易云API
        currentMusicAPI = config.api || 'all'; // 默认使用全部API
        neteaseApiUrl = config.neteaseApiUrl || PUBLIC_APIS.meting;
        
        console.log('当前音乐API:', currentMusicAPI);
        if (currentMusicAPI === 'netease' && neteaseApiUrl) {
            console.log('网易云API地址:', neteaseApiUrl);
        }
    } catch (e) {
        console.error('加载音乐API配置失败:', e);
        currentMusicAPI = 'all'; // 默认使用全部API
        neteaseApiUrl = PUBLIC_APIS.meting;
    }
}

// 选择API源
function selectAPI(api) {
    currentMusicAPI = api;
    
    // 保存到localStorage
    const config = JSON.parse(localStorage.getItem('musicApiConfig') || '{}');
    config.api = api;
    localStorage.setItem('musicApiConfig', JSON.stringify(config));
    
    // 更新UI
    updateAPITags();
    
    // 提示用户
    const apiNames = {
        'all': '全部API（自动切换）',
        'netease': '网易云音乐',
        'qq': 'QQ音乐',
        'kugou': '酷狗音乐',
        'deezer': 'Deezer（30秒预览）',
        'itunes': 'iTunes（30秒预览）'
    };
    showToast(`已切换到：${apiNames[api] || api}`);
    
    console.log('已切换到API:', api);
}

// 更新API标签显示
function updateAPITags() {
    const tags = document.querySelectorAll('.api-tag');
    tags.forEach(tag => {
        const api = tag.getAttribute('data-api');
        if (api === currentMusicAPI) {
            tag.classList.add('active');
        } else {
            tag.classList.remove('active');
        }
    });
}

// 加载网易云登录信息（从localStorage）
function loadNeteaseLoginInfo() {
    try {
        const saved = localStorage.getItem('neteaseLoginInfo');
        if (saved) {
            neteaseLoginInfo = JSON.parse(saved);
            console.log('[音乐] ✅ 已加载网易云登录信息:', neteaseLoginInfo.nickname);
            updateLoginButton();
        }
    } catch (e) {
        console.error('[音乐] ❌ 加载登录信息失败:', e);
    }
}

// 保存网易云登录信息到localStorage
function saveNeteaseLoginInfo(info) {
    try {
        localStorage.setItem('neteaseLoginInfo', JSON.stringify(info));
        neteaseLoginInfo = info;
        console.log('[音乐] ✅ 登录信息已保存');
    } catch (e) {
        console.error('[音乐] ❌ 保存登录信息失败:', e);
    }
}

// 清除网易云登录信息
function clearNeteaseLoginInfo() {
    try {
        localStorage.removeItem('neteaseLoginInfo');
        neteaseLoginInfo = null;
        console.log('[音乐] ✅ 登录信息已清除');
    } catch (e) {
        console.error('[音乐] ❌ 清除登录信息失败:', e);
    }
}

// 更新登录按钮显示状态
function updateLoginButton() {
    const loginBtn = document.getElementById('loginBtn');
    if (!loginBtn) return;
    
    if (neteaseLoginInfo) {
        loginBtn.textContent = neteaseLoginInfo.nickname || '已登录';
        loginBtn.onclick = showLogoutConfirm;
    } else {
        loginBtn.textContent = '登录';
        loginBtn.onclick = showLoginModal;
    }
}

// 显示登录弹窗
function showLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>网易云音乐登录</h2>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <p style="color: #666; margin-bottom: 16px; font-size: 14px;">
                    💡 登录后可以播放VIP歌曲和获取歌词（需要网易云VIP会员）
                </p>
                <form id="loginForm">
                    <div class="form-group">
                        <label>手机号：</label>
                        <input type="tel" id="phoneInput" placeholder="请输入手机号" required pattern="^1[3-9]\\d{9}$">
                    </div>
                    <div class="form-group">
                        <label>密码：</label>
                        <input type="password" id="passwordInput" placeholder="请输入密码" required>
                    </div>
                    <button type="submit" class="btn-primary" style="width: 100%; margin-top: 16px;">
                        登录
                    </button>
                </form>
                <div id="loginStatus" style="margin-top: 16px; text-align: center;"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 处理登录表单提交
    const form = document.getElementById('loginForm');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const phone = document.getElementById('phoneInput').value;
        const password = document.getElementById('passwordInput').value;
        const statusDiv = document.getElementById('loginStatus');
        
        statusDiv.innerHTML = '<div class="loading">登录中...</div>';
        
        try {
            await loginToNetease(phone, password);
            modal.remove();
            showToast('✅ 登录成功！');
        } catch (error) {
            statusDiv.innerHTML = `<p style="color: red;">❌ ${error.message}</p>`;
        }
    };
}

// 执行网易云登录（调用API）
async function loginToNetease(phone, password) {
    if (!neteaseApiUrl) {
        throw new Error('请先配置网易云API地址');
    }
    
    try {
        // 使用手机登录接口
        const url = `${neteaseApiUrl}/login/cellphone?phone=${phone}&password=${encodeURIComponent(password)}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.code === 200) {
            // 登录成功，保存信息
            const loginInfo = {
                phone: phone,
                cookie: data.cookie,
                userId: data.account.id,
                nickname: data.profile.nickname
            };
            
            saveNeteaseLoginInfo(loginInfo);
            updateLoginButton();
            console.log('[音乐] ✅ 登录成功:', loginInfo.nickname);
        } else {
            throw new Error(data.msg || '登录失败');
        }
    } catch (error) {
        console.error('[音乐] ❌ 登录异常:', error);
        throw error;
    }
}

// 显示退出确认对话框
function showLogoutConfirm() {
    if (confirm(`确定要退出登录吗？(${neteaseLoginInfo?.nickname})`)) {
        clearNeteaseLoginInfo();
        updateLoginButton();
        showToast('已退出登录');
    }
}

// 打开播放器弹窗
function openPlayerModal() {
    playerModal.classList.add('active');
}

// 关闭播放器弹窗
function closePlayerModal() {
    playerModal.classList.remove('active');
}

// 导入本地音乐
function importLocalMusic() {
    document.getElementById('localMusicInput').click();
}

// 处理本地音乐选择
function handleLocalMusicSelect(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // 转换文件为播放器格式
    const localPlaylist = files.map((file, index) => {
        // 从文件名解析歌曲信息
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // 移除扩展名
        let trackName = fileName;
        let artistName = '本地音乐';
        
        // 尝试从文件名解析歌手-歌名格式
        const match = fileName.match(/(.+?)\s*-\s*(.+)/);
        if (match) {
            artistName = match[1].trim();
            trackName = match[2].trim();
        }

        return {
            id: `local-${index}-${Date.now()}`,
            trackName: trackName,
            artistName: artistName,
            artworkUrl100: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎵</text></svg>',
            audioUrl: URL.createObjectURL(file), // 创建临时URL
            duration: 0, // 本地文件，需要加载后才知道
            isLocal: true, // 标记为本地文件
            isPreview: false,
            file: file // 保存文件引用
        };
    });

    // 添加到播放列表
    currentPlaylist = [...localPlaylist, ...currentPlaylist];
    
    // 显示结果
    displayResults(currentPlaylist);
    searchResults.classList.add('active');
    
    showToast(`✅ 已导入 ${localPlaylist.length} 首本地歌曲`);
    
    // 清空文件输入
    event.target.value = '';
}

// 显示URL导入弹窗
function showUrlImportModal() {
    document.getElementById('urlImportModal').style.display = 'flex';
    document.getElementById('musicUrlInput').value = '';
    document.getElementById('musicNameInput').value = '';
    document.getElementById('musicUrlInput').focus();
}

// 关闭URL导入弹窗
function closeUrlImportModal() {
    document.getElementById('urlImportModal').style.display = 'none';
}

// 从URL播放音乐
async function playMusicFromUrl() {
    const url = document.getElementById('musicUrlInput').value.trim();
    const name = document.getElementById('musicNameInput').value.trim();
    
    if (!url) {
        showToast('❌ 请输入音乐URL');
        return;
    }

    // 验证URL格式
    try {
        new URL(url);
    } catch (e) {
        showToast('❌ URL格式不正确');
        return;
    }

    // 解析歌曲名称
    let trackName = '未知歌曲';
    let artistName = '网络音乐';
    
    if (name) {
        const match = name.match(/(.+?)\s*-\s*(.+)/);
        if (match) {
            artistName = match[1].trim();
            trackName = match[2].trim();
        } else {
            trackName = name;
        }
    } else {
        // 从URL提取文件名
        const urlParts = url.split('/');
        const fileName = urlParts[urlParts.length - 1].split('?')[0];
        if (fileName) {
            trackName = decodeURIComponent(fileName.replace(/\.[^/.]+$/, ''));
        }
    }

    // 创建歌曲对象
    const urlSong = {
        id: `url-${Date.now()}`,
        trackName: trackName,
        artistName: artistName,
        artworkUrl100: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎵</text></svg>',
        audioUrl: url,
        duration: 0,
        isLocal: false,
        isPreview: false,
        isUrl: true // 标记为URL来源
    };

    // 添加到播放列表
    currentPlaylist.unshift(urlSong);
    
    // 关闭弹窗
    closeUrlImportModal();
    
    // 立即播放
    await playSong(0);
    
    // 更新显示
    displayResults(currentPlaylist);
    searchResults.classList.add('active');
    
    showToast('✅ 已开始播放');
}
async function searchMusic() {
    const query = searchInput.value.trim();
    if (!query) {
        showToast('请输入搜索内容');
        return;
    }

    searchResults.innerHTML = '<div class="loading">🔍 正在搜索多个音乐平台...</div>';
    searchResults.classList.add('active');

    try {
        // 优先使用全曲API，按顺序尝试
        let lastError = null;
        let attemptedAPIs = [];
        
        // 1. 先尝试网易云音乐（完整歌曲）
        if (currentMusicAPI === 'netease' || currentMusicAPI === 'all') {
            attemptedAPIs.push('网易云');
            try {
                await searchMusicNetease(query);
                console.log('✅ 网易云音乐搜索成功');
                showToast('✅ 已从网易云音乐找到歌曲');
                return; // 成功则直接返回
            } catch (error) {
                console.log('❌ 网易云API失败:', error.message);
                lastError = error;
            }
        }
        
        // 2. 尝试QQ音乐（完整歌曲）
        if (currentMusicAPI === 'qq' || currentMusicAPI === 'all') {
            attemptedAPIs.push('QQ音乐');
            try {
                await searchMusicQQ(query);
                console.log('✅ QQ音乐搜索成功');
                showToast('✅ 已从QQ音乐找到歌曲');
                return;
            } catch (error) {
                console.log('❌ QQ音乐API失败:', error.message);
                lastError = error;
            }
        }
        
        // 3. 尝试酷狗音乐（完整歌曲）
        if (currentMusicAPI === 'kugou' || currentMusicAPI === 'all') {
            attemptedAPIs.push('酷狗');
            try {
                await searchMusicKugou(query);
                console.log('✅ 酷狗音乐搜索成功');
                showToast('✅ 已从酷狗音乐找到歌曲');
                return;
            } catch (error) {
                console.log('❌ 酷狗音乐API失败:', error.message);
                lastError = error;
            }
        }
        
        // 4. 如果全曲API都失败，降级到预览API
        console.log('⚠️ 全曲API均失败，尝试预览API...');
        
        if (currentMusicAPI === 'itunes' || currentMusicAPI === 'all') {
            attemptedAPIs.push('iTunes');
            try {
                await searchMusicITunes(query);
                console.log('✅ iTunes搜索成功（30秒预览）');
                showToast('ℹ️ 仅找到30秒预览版本');
                return;
            } catch (error) {
                console.log('❌ iTunes API失败:', error.message);
                lastError = error;
            }
        }
        
        if (currentMusicAPI === 'deezer' || currentMusicAPI === 'all') {
            attemptedAPIs.push('Deezer');
            try {
                await searchMusicDeezer(query);
                console.log('✅ Deezer搜索成功（30秒预览）');
                showToast('ℹ️ 仅找到30秒预览版本');
                return;
            } catch (error) {
                console.log('❌ Deezer API失败:', error.message);
                lastError = error;
            }
        }
        
        // 所有API都失败
        throw new Error(`所有API均失败（已尝试: ${attemptedAPIs.join(', ')}）`);
        
    } catch (error) {
        console.error('❌ 所有API都失败:', error);
        searchResults.innerHTML = `
            <div class="empty-state">
                <p style="font-size: 16px; margin-bottom: 8px;">😕 搜索失败</p>
                <p style="font-size: 13px; color: #999;">${error.message}</p>
                <p style="font-size: 12px; color: #ccc; margin-top: 12px;">建议：检查网络连接或稍后重试</p>
            </div>
        `;
        showToast('❌ 搜索失败，请检查网络');
    }
}

// iTunes Search API（30秒预览）
async function searchMusicITunes(query) {
    try {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=20`);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            searchResults.innerHTML = '<div class="empty-state"><p>未找到相关歌曲</p></div>';
            return;
        }

        // 转换数据格式
        const results = data.results
            .filter(item => item.kind === 'song')
            .map(item => ({
                id: item.trackId,
                trackName: item.trackName,
                artistName: item.artistName,
                artworkUrl100: item.artworkUrl100.replace('100x100', '300x300'),
                audioUrl: item.previewUrl, // 30秒预览
                duration: item.trackTimeMillis || 30000,
                isPreview: true, // 标记为预览
                // 外部平台搜索链接（用于听完整版）
                platforms: {
                    netease: `https://music.163.com/#/search/m/?s=${encodeURIComponent(item.trackName + ' ' + item.artistName)}`,
                    spotify: `https://open.spotify.com/search/${encodeURIComponent(item.trackName + ' ' + item.artistName)}`,
                    youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(item.trackName + ' ' + item.artistName)}`
                }
            }));

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="empty-state"><p>未找到相关歌曲</p></div>';
            return;
        }

        displayResults(results);
    } catch (error) {
        console.error('iTunes搜索失败:', error);
        throw error;
    }
}

// Deezer API（30秒预览，免费无需配置）
async function searchMusicDeezer(query) {
    try {
        // Deezer 公开API，无需API Key
        const response = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=20`);
        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            searchResults.innerHTML = '<div class="empty-state"><p>未找到相关歌曲</p></div>';
            return;
        }

        // 转换数据格式
        const results = data.data
            .filter(item => item.type === 'track')
            .map(item => ({
                id: item.id,
                trackName: item.title,
                artistName: item.artist.name,
                artworkUrl100: item.album.cover_medium || item.album.cover,
                audioUrl: item.preview, // 30秒预览
                duration: item.duration * 1000 || 30000,
                isPreview: true,
                // 外部平台链接
                platforms: {
                    deezer: item.link,
                    netease: `https://music.163.com/#/search/m/?s=${encodeURIComponent(item.title + ' ' + item.artist.name)}`,
                    youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(item.title + ' ' + item.artist.name)}`
                }
            }));

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="empty-state"><p>未找到相关歌曲</p></div>';
            return;
        }

        displayResults(results);
    } catch (error) {
        console.error('Deezer搜索失败:', error);
        throw error;
    }
}

// 网易云音乐API（完整版）
async function searchMusicNetease(query) {
    try {
        const baseUrl = neteaseApiUrl.replace(/\/$/, '');
        
        // 尝试多个API源
        let data = null;
        let error = null;
        
        // 先尝试 Meting API
        try {
            const response = await fetch(`${baseUrl}/search?keywords=${encodeURIComponent(query)}&limit=20`);
            data = await response.json();
        } catch (e) {
            console.log('Meting API失败，尝试备用API');
            error = e;
        }
        
        // 如果 Meting 失败，尝试 Vercel API
        if (!data || !data.result) {
            try {
                const vercelUrl = PUBLIC_APIS.netease_vercel;
                const response = await fetch(`${vercelUrl}/search?keywords=${encodeURIComponent(query)}&limit=20`);
                data = await response.json();
            } catch (e) {
                console.error('所有网易云API都失败:', e);
                throw error || e;
            }
        }

        if (!data.result || !data.result.songs || data.result.songs.length === 0) {
            searchResults.innerHTML = '<div class="empty-state"><p>未找到相关歌曲</p></div>';
            return;
        }

        // 转换数据格式
        const results = data.result.songs.map(item => ({
            id: item.id,
            trackName: item.name,
            artistName: item.artists ? item.artists.map(a => a.name).join(' / ') : '未知',
            artworkUrl100: item.album && item.album.picUrl ? item.album.picUrl.replace('http:', 'https:') : '',
            audioUrl: `${baseUrl}/song/url?id=${item.id}`, // 获取完整音频URL
            duration: item.duration || 0,
            isPreview: false, // 完整歌曲
            fee: item.fee || 0, // 0=免费, 1=VIP, 4=购买
            platforms: {
                netease: `https://music.163.com/#/song?id=${item.id}`
            }
        }));

        displayResults(results);
    } catch (error) {
        console.error('网易云搜索失败:', error);
        searchResults.innerHTML = '<div class="empty-state"><p>搜索失败，请检查API地址</p></div>';
        throw error;
    }
}

// QQ音乐API（全曲播放）
async function searchMusicQQ(query) {
    try {
        const apiUrl = PUBLIC_APIS.qq_tjit;
        
        // QQ音乐搜索API
        const response = await fetch(`${apiUrl}?key=demo&id=${encodeURIComponent(query)}&type=so&cache=0&page=1&nu=20`);
        const data = await response.json();

        if (!data.body || !data.body.song || data.body.song.length === 0) {
            searchResults.innerHTML = '<div class="empty-state"><p>未找到相关歌曲</p></div>';
            return;
        }

        // 转换数据格式
        const results = data.body.song.map(item => ({
            id: item.songmid,
            trackName: item.songname,
            artistName: item.singer.map(s => s.name).join(' / '),
            artworkUrl100: item.albummid ? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${item.albummid}.jpg` : '',
            audioUrl: `${apiUrl}?key=demo&id=${item.songmid}&type=url`, // 获取播放链接
            duration: item.interval * 1000 || 0,
            isPreview: false, // 完整歌曲
            platforms: {
                qq: `https://y.qq.com/n/yqq/song/${item.songmid}.html`
            }
        }));

        displayResults(results);
    } catch (error) {
        console.error('QQ音乐搜索失败:', error);
        // 不显示错误，让其他API继续尝试
        throw error;
    }
}

// 酷狗音乐API（全曲播放）
async function searchMusicKugou(query) {
    try {
        const apiUrl = PUBLIC_APIS.kugou_public;
        
        // 酷狗音乐搜索API - 使用正确的搜索接口
        const searchResponse = await fetch(`https://complexsearch.kugou.com/v2/search/song?keyword=${encodeURIComponent(query)}&page=1&pagesize=20&bitrate=0&isfuzzy=0&tag=em&inputtype=0&platform=WebFilter&userid=-1&clientver=2000&iscorrection=1&privilege_filter=0&callback=callback123`);
        const searchText = await searchResponse.text();
        
        // 解析JSONP响应
        const jsonStr = searchText.replace(/^callback123\(/, '').replace(/\)$/, '');
        const searchData = JSON.parse(jsonStr);
        
        if (!searchData.data || !searchData.data.lists || searchData.data.lists.length === 0) {
            searchResults.innerHTML = '<div class="empty-state"><p>未找到相关歌曲</p></div>';
            return;
        }

        // 转换数据格式
        const results = searchData.data.lists.map(item => ({
            id: item.FileHash,
            trackName: item.SongName,
            artistName: item.SingerName,
            artworkUrl100: item.AlbumImage ? item.AlbumImage.replace('{size}', '400') : '',
            audioUrl: '', // 需要另外获取
            duration: item.Duration * 1000 || 0,
            isPreview: false,
            platforms: {
                kugou: `https://www.kugou.com/song/#hash=${item.FileHash}`
            }
        }));

        displayResults(results);
    } catch (error) {
        console.error('酷狗音乐搜索失败:', error);
        throw error;
    }
}

// 显示搜索结果
function displayResults(results) {
    searchResults.innerHTML = '';
    currentPlaylist = results;

    results.forEach((item, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        // 点击播放
        resultItem.onclick = () => playSong(index);
        
        // 创建外部链接按钮组（本地和URL歌曲不需要）
        const platformLinks = (!item.isLocal && !item.isUrl && item.platforms) ? `
            <div class="platform-links" onclick="event.stopPropagation()">
                ${item.platforms.netease ? `<a href="${item.platforms.netease}" target="_blank" class="platform-link" title="网易云音乐">网易云</a>` : ''}
                ${item.platforms.qq ? `<a href="${item.platforms.qq}" target="_blank" class="platform-link" title="QQ音乐">QQ音乐</a>` : ''}
                ${item.platforms.kugou ? `<a href="${item.platforms.kugou}" target="_blank" class="platform-link" title="酷狗音乐">酷狗</a>` : ''}
                ${item.platforms.spotify ? `<a href="${item.platforms.spotify}" target="_blank" class="platform-link" title="Spotify">Spotify</a>` : ''}
                ${item.platforms.youtube ? `<a href="${item.platforms.youtube}" target="_blank" class="platform-link" title="YouTube">YouTube</a>` : ''}
            </div>
        ` : '';

        // 显示标记（预览/VIP/本地/URL/音乐源）
        let badge = '';
        if (item.isLocal) {
            badge = '<span style="font-size: 11px; color: #fff; background: #4CAF50; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">本地</span>';
        } else if (item.isUrl) {
            badge = '<span style="font-size: 11px; color: #fff; background: #2196F3; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">URL</span>';
        } else if (item.isPreview) {
            badge = '<span style="font-size: 11px; color: #999; background: #f0f0f0; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">30秒预览</span>';
        } else if (item.fee === 1) {
            badge = '<span style="font-size: 11px; color: #fff; background: #ff6b6b; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">VIP</span>';
        } else if (item.fee === 4) {
            badge = '<span style="font-size: 11px; color: #fff; background: #ffa502; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">付费</span>';
        }
        
        // 添加音乐源标识
        let sourceBadge = '';
        if (!item.isLocal && !item.isUrl) {
            if (item.platforms && item.platforms.netease) {
                sourceBadge = '<span style="font-size: 10px; color: #e60026; background: #ffe6eb; padding: 2px 6px; border-radius: 4px; margin-left: 4px;">网易云</span>';
            } else if (item.platforms && item.platforms.qq) {
                sourceBadge = '<span style="font-size: 10px; color: #31c27c; background: #e8f8f3; padding: 2px 6px; border-radius: 4px; margin-left: 4px;">QQ</span>';
            } else if (item.platforms && item.platforms.kugou) {
                sourceBadge = '<span style="font-size: 10px; color: #00a8ff; background: #e6f7ff; padding: 2px 6px; border-radius: 4px; margin-left: 4px;">酷狗</span>';
            }
        }

        resultItem.innerHTML = `
            <img class="album-art" src="${item.artworkUrl100 || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎵</text></svg>'}" alt="${item.trackName}" />
            <div class="song-info">
                <div class="song-name">${item.trackName}${badge}${sourceBadge}</div>
                <div class="artist-name">${item.artistName}</div>
                ${platformLinks}
            </div>
        `;

        searchResults.appendChild(resultItem);
    });
}

// 从网易云获取音频URL（带登录信息）
async function getNeteaseAudioUrl(songId) {
    try {
        const url = `${neteaseApiUrl}/song/url?id=${songId}`;
        
        // 如果已登录，带上cookie
        const options = neteaseLoginInfo ? {
            headers: {
                'Cookie': neteaseLoginInfo.cookie
            }
        } : {};
        
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (data.code === 200 && data.data && data.data.length > 0) {
            const audioInfo = data.data[0];
            if (audioInfo.url) {
                console.log('[音乐] ✅ 获取到音频URL');
                return audioInfo.url;
            } else {
                console.warn('[音乐] ⚠️ 歌曲无可用URL');
                return null;
            }
        } else {
            console.error('[音乐] ❌ 获取音频URL失败:', data);
            return null;
        }
    } catch (error) {
        console.error('[音乐] ❌ 获取音频URL异常:', error);
        return null;
    }
}

// 解析歌词文本为数组
function parseLyrics(lyricText) {
    currentLyrics = [];
    
    if (!lyricText) return;
    
    const lines = lyricText.split('\n');
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
    
    lines.forEach(line => {
        const match = line.match(timeRegex);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const milliseconds = parseInt(match[3].padEnd(3, '0'));
            const time = minutes * 60 + seconds + milliseconds / 1000;
            const text = line.replace(timeRegex, '').trim();
            
            if (text) {
                currentLyrics.push({ time, text });
            }
        }
    });
    
    console.log('[音乐] ✅ 解析了', currentLyrics.length, '行歌词');
}

// 获取歌词（支持网易云）
async function fetchLyrics(song) {
    currentLyrics = [];
    
    // 如果是网易云歌曲且有ID
    if (currentMusicAPI === 'netease' && song.id) {
        try {
            const url = `${neteaseApiUrl}/lyric?id=${song.id}`;
            
            const options = neteaseLoginInfo ? {
                headers: {
                    'Cookie': neteaseLoginInfo.cookie
                }
            } : {};
            
            const response = await fetch(url, options);
            const data = await response.json();
            
            if (data.code === 200 && data.lrc && data.lrc.lyric) {
                parseLyrics(data.lrc.lyric);
                console.log('[音乐] ✅ 歌词加载成功');
            } else {
                console.warn('[音乐] ⚠️ 未找到歌词');
            }
        } catch (error) {
            console.error('[音乐] ❌ 获取歌词失败:', error);
        }
    } else {
        // iTunes API不提供歌词，显示提示
        console.log('[音乐] ℹ️ iTunes API不支持歌词功能');
    }
}
async function playSong(index) {
    if (index < 0 || index >= currentPlaylist.length) return;

    currentIndex = index;
    const song = currentPlaylist[index];

    // 更新播放器信息
    if (song.artworkUrl100) {
        nowPlayingArt.src = song.artworkUrl100;
    }
    nowPlayingTitle.textContent = song.trackName;
    nowPlayingArtist.textContent = song.artistName;

    // 检查是否为VIP或付费歌曲
    if (song.fee === 1 || song.fee === 4) {
        showToast('⚠️ 此歌曲需要VIP或购买，请跳转到网易云播放');
        if (song.platforms.netease) {
            setTimeout(() => {
                window.open(song.platforms.netease, '_blank');
            }, 1500);
        }
        return;
    }

    // 获取音频URL
    let audioUrl = song.audioUrl;
    
    // 本地文件和URL直接使用
    if (!song.isLocal && !song.isUrl) {
        // 如果是网易云，需要先获取真实URL
        if (currentMusicAPI === 'netease' && !song.isPreview) {
            try {
                showToast('获取音频中...');
                const response = await fetch(audioUrl);
                const data = await response.json();
                
                if (data.data && data.data[0] && data.data[0].url) {
                    audioUrl = data.data[0].url;
                } else {
                    showToast('❌ 无法获取音频URL');
                    return;
                }
            } catch (error) {
                console.error('获取音频URL失败:', error);
                showToast('❌ 获取音频失败');
                return;
            }
        }
    } else if (song.isLocal) {
        // 本地文件，显示提示
        console.log('[音乐] 播放本地文件:', song.trackName);
    } else if (song.isUrl) {
        // URL歌曲，显示提示
        console.log('[音乐] 播放URL:', song.trackName);
    }

    // 使用本地播放器
    audioPlayer.src = audioUrl;
    audioPlayer.play().catch(err => {
        console.error('播放失败:', err);
        showToast('播放失败，请尝试其他歌曲');
    });
    isPlaying = true;
    updatePlayButton();

    // 加载歌词
    fetchLyrics(song);

    // 显示本地播放器控件
    document.querySelector('.progress-container').style.display = 'block';
    document.querySelector('.controls').style.display = 'flex';
    document.querySelector('.volume-control').style.display = 'flex';
    
    // 隐藏嵌入播放器
    document.getElementById('neteaseEmbed').style.display = 'none';

    // 隐藏搜索结果
    setTimeout(() => {
        searchResults.classList.remove('active');
    }, 300);

    // 打开播放器弹窗
    openPlayerModal();
}

// 切换播放/暂停
function togglePlay() {
    if (audioPlayer.src) {
        if (isPlaying) {
            audioPlayer.pause();
        } else {
            audioPlayer.play();
        }
        isPlaying = !isPlaying;
        updatePlayButton();
    }
}

// 更新播放按钮
function updatePlayButton() {
    playPauseBtn.textContent = isPlaying ? '⏸' : '▶';
}

// 上一首
function previousTrack() {
    if (currentIndex > 0) {
        playSong(currentIndex - 1);
    }
}

// 下一首
function nextTrack() {
    if (currentIndex < currentPlaylist.length - 1) {
        playSong(currentIndex + 1);
    }
}

// 更新时间显示
audioPlayer.addEventListener('timeupdate', () => {
    if (audioPlayer.duration) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressFill.style.width = progress + '%';
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
        
        // 同步歌词
        syncLyrics(audioPlayer.currentTime);
    }
});

audioPlayer.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audioPlayer.duration);
});

// 音频播放结束自动下一首
audioPlayer.addEventListener('ended', () => {
    nextTrack();
});

// ========== 歌词功能 ==========

// 加载歌词
async function loadLyrics(trackName, artistName) {
    const lyricsContent = document.getElementById('lyricsContent');
    lyricsContent.innerHTML = '<div class="lyrics-placeholder">歌词加载中...</div>';
    
    try {
        // 尝试从多个源加载歌词
        const lyrics = await fetchLyrics(trackName, artistName);
        
        if (lyrics && lyrics.length > 0) {
            currentLyrics = lyrics;
            displayLyrics(lyrics);
        } else {
            currentLyrics = [];
            lyricsContent.innerHTML = '<div class="lyrics-placeholder">暂无歌词</div>';
        }
    } catch (error) {
        console.error('加载歌词失败:', error);
        currentLyrics = [];
        lyricsContent.innerHTML = '<div class="lyrics-placeholder">暂无歌词</div>';
    }
}

// 获取歌词（直接使用模拟数据）
async function fetchLyrics(trackName, artistName) {
    // 直接返回模拟歌词，不调用API避免错误
    return getFallbackLyrics(trackName, artistName);
}

// 解析LRC格式歌词
function parseLrcLyrics(lrcText) {
    const lines = lrcText.split('\n');
    const lyrics = [];
    
    // 匹配时间标签：[mm:ss.xx] 或 [mm:ss.xxx]
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
    
    lines.forEach(line => {
        const match = line.match(timeRegex);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const milliseconds = parseInt(match[3].padEnd(3, '0'));
            const time = minutes * 60 + seconds + milliseconds / 1000;
            
            // 移除时间标签，获取歌词文本
            const text = line.replace(timeRegex, '').trim();
            
            // 过滤空行和元数据标签
            if (text && !text.startsWith('[') && !text.startsWith('ti:') && 
                !text.startsWith('ar:') && !text.startsWith('al:') &&
                !text.startsWith('by:') && !text.startsWith('offset:')) {
                lyrics.push({ time, text });
            }
        }
    });
    
    return lyrics;
}

// 备用歌词（当API不可用时）
function getFallbackLyrics(trackName, artistName) {
    return [
        { time: 0, text: '♪ 音乐响起 ♪' },
        { time: 3, text: trackName },
        { time: 6, text: `演唱：${artistName}` },
        { time: 10, text: '...' },
        { time: 15, text: '（模拟歌词数据）' },
        { time: 20, text: '实际使用时需要接入歌词API' }
    ];
}

// 显示歌词
function displayLyrics(lyrics) {
    const lyricsContent = document.getElementById('lyricsContent');
    lyricsContent.innerHTML = '';
    
    lyrics.forEach((lyric, index) => {
        const line = document.createElement('div');
        line.className = 'lyric-line';
        line.textContent = lyric.text;
        line.dataset.index = index;
        lyricsContent.appendChild(line);
    });
}

// 同步歌词
function syncLyrics(currentTime) {
    if (currentLyrics.length === 0) return;
    
    // 找到当前时间对应的歌词
    let activeIndex = 0;
    for (let i = 0; i < currentLyrics.length; i++) {
        if (currentTime >= currentLyrics[i].time) {
            activeIndex = i;
        } else {
            break;
        }
    }
    
    // 更新高亮
    const lines = document.querySelectorAll('.lyric-line');
    const container = document.getElementById('lyricsContainer');
    
    lines.forEach((line, index) => {
        if (index === activeIndex) {
            line.classList.add('active');
            // 滚动到当前歌词并居中
            const containerHeight = container.clientHeight;
            const lineTop = line.offsetTop;
            const lineHeight = line.clientHeight;
            const scrollTo = lineTop - (containerHeight / 2) + (lineHeight / 2);
            container.scrollTo({
                top: scrollTo,
                behavior: 'smooth'
            });
        } else {
            line.classList.remove('active');
        }
    });
}

// 点击进度条跳转
function seekTo(event) {
    const progressBar = document.getElementById('progressBar');
    const rect = progressBar.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    
    if (audioPlayer.duration) {
        audioPlayer.currentTime = percent * audioPlayer.duration;
    }
}

// 设置音量
function setVolume(event) {
    const volumeSlider = event.currentTarget;
    const rect = volumeSlider.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    
    audioPlayer.volume = Math.max(0, Math.min(1, percent));
    document.getElementById('volumeFill').style.width = (percent * 100) + '%';
}

// 格式化时间
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 回车键搜索
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchMusic();
    }
});

// Toast 提示
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 20px;
        font-size: 14px;
        z-index: 10000;
        animation: fadeInOut 2s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        20% { opacity: 1; transform: translateX(-50%) translateY(0); }
        80% { opacity: 1; }
        100% { opacity: 0; }
    }
`;
document.head.appendChild(style);

// 初始化音量
audioPlayer.volume = 0.7;

// ========== 邀请角色一起听功能 ==========

// 邀请角色
// 显示角色选择弹窗
function showCharacterSelect() {
    if (currentIndex < 0) {
        showToast('请先选择一首歌曲');
        return;
    }

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
    const characterList = document.getElementById('characterList');
    characterList.innerHTML = '';
    
    characterContacts.forEach(character => {
        const item = document.createElement('div');
        item.className = 'character-item';
        item.onclick = () => selectCharacter(character);
        
        const avatar = document.createElement('img');
        avatar.src = character.avatar || '';
        avatar.alt = character.name;
        
        const info = document.createElement('div');
        info.className = 'character-item-info';
        
        const name = document.createElement('div');
        name.className = 'character-item-name';
        name.textContent = character.name;
        
        const desc = document.createElement('div');
        desc.className = 'character-item-desc';
        desc.textContent = character.persona || '点击邀请TA一起听';
        
        info.appendChild(name);
        info.appendChild(desc);
        item.appendChild(avatar);
        item.appendChild(info);
        characterList.appendChild(item);
    });
    
    // 显示弹窗
    document.getElementById('characterSelectModal').classList.add('active');
}

// 关闭角色选择弹窗
function closeCharacterSelect() {
    document.getElementById('characterSelectModal').classList.remove('active');
}

// 选择角色并邀请
async function selectCharacter(character) {
    // 关闭弹窗
    closeCharacterSelect();
    
    // 调用邀请函数
    await inviteCharacter(character);
}

// 邀请角色
async function inviteCharacter(character) {
    if (currentIndex < 0) {
        showToast('请先选择一首歌曲');
        return;
    }

    const inviteBtn = document.getElementById('inviteBtn');
    const characterResponse = document.getElementById('characterResponse');
    
    // 获取当前播放的歌曲信息
    const currentSong = currentPlaylist[currentIndex];
    
    // 禁用按钮
    inviteBtn.disabled = true;
    inviteBtn.textContent = '邀请中...';
    
    try {
        // 调用 API 让角色给出反馈
        const response = await generateCharacterResponse(character, currentSong);
        
        // 显示角色反馈
        if (response) {
            document.getElementById('responseAvatar').src = character.avatar || '';
            document.getElementById('responseName').textContent = character.name;
            document.getElementById('responseContent').textContent = response;
            
            characterResponse.classList.add('active');
        }
        
    } catch (error) {
        console.error('邀请失败:', error);
        showToast('邀请失败，请重试');
    } finally {
        inviteBtn.disabled = false;
        inviteBtn.textContent = '邀请TA一起听';
    }
}

// 生成角色反馈
async function generateCharacterResponse(character, song) {
    // 获取 API 配置
    const apiConfig = JSON.parse(localStorage.getItem('globalApiConfig') || '{}');
    
    if (!apiConfig.mainApi || !apiConfig.mainApi.url || !apiConfig.mainApi.token) {
        throw new Error('API 配置不完整');
    }
    
    // 获取角色信息
    const characterName = character.name;
    
    //  构建完整的角色人设信息
    let personaInfo = '';
    
    // 优先使用 persona 字段
    if (character.persona) {
        personaInfo = character.persona;
    }
    // 其次使用 roleInfo 中的信息
    else if (character.roleInfo) {
        const roleInfo = character.roleInfo;
        const parts = [];
        
        if (roleInfo.persona) parts.push(roleInfo.persona);
        if (roleInfo.personality) parts.push(`性格：${roleInfo.personality}`);
        if (roleInfo.background) parts.push(`背景：${roleInfo.background}`);
        if (roleInfo.occupation) parts.push(`职业：${roleInfo.occupation}`);
        if (roleInfo.age) parts.push(`年龄：${roleInfo.age}`);
        if (roleInfo.hobby) parts.push(`爱好：${roleInfo.hobby}`);
        
        personaInfo = parts.join('\n');
    }
    // 最后尝试 nickname
    else if (character.nickname) {
        personaInfo = character.nickname;
    }
    
    // 构建 System Prompt
    const systemPrompt = `你是${characterName}，现在有人邀请你一起听歌。

${personaInfo ? '\n【你的完整人设】\n' + personaInfo + '\n' : ''}

**重要：**
1. 完全按照上面的人设来回应
2. 语气、用词都要符合人设
3. 直接说出感受，不要输出分析过程
4. 不要提及人设内容本身

要求：
- 用第一人称回应
- 对歌曲表达真实感受
- 语言自然，像真人聊天
- 简短一点，30-50字
- 不要提及自己是AI
- 直接说话，不要解释

示例：
- "哇，这首歌！DNA动了"
- "好怀念啊，以前经常听"
- "这个歌手我很喜欢"`;    
    
    // 用户消息
    const userMessage = `${characterName}，我想邀请你一起听歌。

正在播放：
歌曲：${song.trackName}
歌手：${song.artistName}

你想听吗？有什么想说的吗？`;
    
    try {
        // 拼接 API URL
        let baseUrl = apiConfig.mainApi.url.trim();
        if (baseUrl.endsWith('/')) {
            baseUrl = baseUrl.slice(0, -1);
        }
        if (!baseUrl.endsWith('/chat/completions')) {
            if (baseUrl.includes('/v1')) {
                baseUrl = baseUrl + '/chat/completions';
            } else {
                baseUrl = baseUrl + '/v1/chat/completions';
            }
        }
        
        const response = await fetch(baseUrl, {
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
                max_tokens: 100,
                //  关闭思维链，直接返回结果
                enable_thinking: false
            })
        });
        
        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API 返回数据:', data);
        
        // 兼容不同API的返回格式
        let aiReply = '';
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            const message = data.choices[0].message;
            
            // 优先尝试 content 字段
            if (message.content) {
                aiReply = message.content.trim();
            }
            //  如果 content 为空，说明思维链未关闭成功
            //  尝试从 reasoning 中提取最后一段真正的回复
            else if (message.reasoning) {
                const reasoningText = Array.isArray(message.reasoning) 
                    ? message.reasoning.join('\n') 
                    : String(message.reasoning);
                
                // 提取最后一段非分析性的内容
                const lines = reasoningText.split('\n').filter(line => line.trim());
                // 取最后几行作为可能的回复
                const lastLines = lines.slice(-3).join('\n').trim();
                
                if (lastLines && lastLines.length < 150) {
                    aiReply = lastLines;
                    console.log(' 从 reasoning 末尾提取回复');
                }
            }
        }
        
        if (!aiReply) {
            throw new Error('API返回空回复');
        }
        
        console.log('角色反馈:', aiReply);
        return aiReply;
        
    } catch (error) {
        console.error('生成角色反馈失败:', error);
        throw error;
    }
}

// ========== 网易云登录功能 ==========

// 显示登录弹窗
function showLoginModal() {
    if (neteaseLoginInfo) {
        // 已登录，显示退出选项
        if (confirm(`当前已登录：${neteaseLoginInfo.nickname}\n\n是否退出登录？`)) {
            logoutNetease();
        }
        return;
    }
    
    document.getElementById('loginModal').classList.add('active');
    
    // 如果有保存的手机号，自动填充
    const savedPhone = localStorage.getItem('netease_saved_phone');
    if (savedPhone) {
        document.getElementById('phoneInput').value = savedPhone;
        document.getElementById('rememberMe').checked = true;
    }
}

// 关闭登录弹窗
function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
    // 清空密码
    document.getElementById('passwordInput').value = '';
}

// 执行登录
async function loginNetease() {
    const phone = document.getElementById('phoneInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!phone) {
        showToast('请输入手机号');
        return;
    }
    
    if (!/^1[3-9]\d{9}$/.test(phone)) {
        showToast('请输入正确的手机号');
        return;
    }
    
    if (!password) {
        showToast('请输入密码');
        return;
    }
    
    try {
        showToast('登录中...');
        
        // 方案1：尝试使用NeteaseCloudMusicApi的公开接口
        // 注意：由于CORS限制，这个接口可能无法直接在前端调用
        const loginUrl = `https://music.163.com/api/login/cellphone?phone=${encodeURIComponent(phone)}&password=${encodeURIComponent(password)}&rememberLogin=true`;
        
        const response = await fetch(loginUrl, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Referer': 'https://music.163.com/',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('登录失败，请检查账号密码');
        }
        
        const data = await response.json();
        
        if (data.code === 200 && data.account) {
            // 登录成功
            neteaseLoginInfo = {
                phone: phone,
                cookie: response.headers.get('set-cookie'),
                userId: data.account.id,
                nickname: data.profile?.nickname || '用户',
                avatar: data.profile?.avatarUrl || ''
            };
            
            // 如果选择记住登录，保存到localStorage
            if (rememberMe) {
                localStorage.setItem('netease_saved_phone', phone);
                localStorage.setItem('netease_login_info', JSON.stringify(neteaseLoginInfo));
            }
            
            // 更新UI
            updateLoginButton();
            closeLoginModal();
            showToast(`✅ 登录成功！欢迎，${neteaseLoginInfo.nickname}`);
            
            // 加载用户数据
            loadUserPlaylists();
        } else {
            throw new Error(data.msg || '登录失败');
        }
        
    } catch (error) {
        console.error('登录失败:', error);
        
        // 方案2：如果CORS失败，提供替代方案
        if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
            // 显示一个提示，告知用户可以使用其他方式
            showToast('⚠️ 由于浏览器安全限制，请使用以下方式之一：\n1. 在控制台手动执行登录\n2. 使用后端代理\n3. 直接访问网易云音乐');
            
            // 提供一个手动登录的方法（仅供调试）
            console.log('%c========== 手动登录指引 ==========','color: #ff6b6b; font-size: 16px; font-weight: bold;');
            console.log('%c由于CORS限制，无法直接在前端登录。','color: #ffa502;');
            console.log('%c解决方案：','color: #2ed573;');
            console.log('1. 安装浏览器插件禁用CORS（如：CORS Unblock）');
            console.log('2. 使用后端服务代理API请求');
            console.log('3. 直接访问 https://music.163.com 登录');
            console.log('%c=====================================','color: #ff6b6b; font-size: 16px; font-weight: bold;');
            
            // 提供一个模拟登录功能（仅供体验）
            const simulateLogin = confirm('⚠️ 由于CORS限制无法直接登录\n\n是否使用模拟登录？\n（仅用于体验界面，无实际功能）');
            
            if (simulateLogin) {
                // 模拟登录成功
                neteaseLoginInfo = {
                    phone: phone,
                    userId: 'simulated_user',
                    nickname: '模拟用户',
                    avatar: ''
                };
                
                if (rememberMe) {
                    localStorage.setItem('netease_saved_phone', phone);
                    localStorage.setItem('netease_login_info', JSON.stringify(neteaseLoginInfo));
                }
                
                updateLoginButton();
                closeLoginModal();
                showToast('✅ 模拟登录成功！（仅用于体验）');
            }
        } else {
            showToast('❌ 登录失败：' + error.message);
        }
    }
}

// 退出登录
function logoutNetease() {
    neteaseLoginInfo = null;
    localStorage.removeItem('netease_login_info');
    localStorage.removeItem('netease_saved_phone');
    updateLoginButton();
    showToast('已退出登录');
}

// 更新登录按钮状态
function updateLoginButton() {
    const loginBtn = document.getElementById('loginBtn');
    
    if (neteaseLoginInfo) {
        loginBtn.textContent = neteaseLoginInfo.nickname;
        loginBtn.classList.add('logged-in');
    } else {
        loginBtn.textContent = '登录';
        loginBtn.classList.remove('logged-in');
    }
}

// 加载用户歌单
async function loadUserPlaylists() {
    if (!neteaseLoginInfo) return;
    
    try {
        const userId = neteaseLoginInfo.userId;
        const playlistsUrl = `https://music.163.com/api/user/playlist?uid=${userId}&limit=50`;
        
        const response = await fetch(playlistsUrl, {
            headers: {
                'Referer': 'https://music.163.com/'
            }
        });
        
        if (!response.ok) return;
        
        const data = await response.json();
        
        if (data.playlist && data.playlist.length > 0) {
            console.log('用户歌单:', data.playlist);
            // 可以在这里显示用户的歌单列表
        }
        
    } catch (error) {
        console.error('加载歌单失败:', error);
    }
}

// 页面加载时检查登录状态
function checkLoginStatus() {
    const savedLoginInfo = localStorage.getItem('netease_login_info');
    if (savedLoginInfo) {
        try {
            neteaseLoginInfo = JSON.parse(savedLoginInfo);
            updateLoginButton();
        } catch (e) {
            console.error('解析登录信息失败:', e);
        }
    }
}

// 页面加载时检查登录状态
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkLoginStatus);
} else {
    checkLoginStatus();
}

// ==================== 角色主动邀请一起听歌功能 ====================

let characterInviteTimer = null;

// 启动角色主动邀请定时器
function startCharacterInviteTimer() {
    // 清除旧的定时器
    if (characterInviteTimer) {
        clearInterval(characterInviteTimer);
        characterInviteTimer = null;
    }
    
    // 获取配置
    const config = JSON.parse(localStorage.getItem('musicCharacterInvite') || '{}');
    
    if (!config.enabled) {
        console.log('[角色邀请] 功能未开启');
        return;
    }
    
    const intervalMinutes = config.interval || 30; // 默认30分钟
    const intervalMs = intervalMinutes * 60 * 1000;
    
    console.log(`[角色邀请] 已启动，间隔: ${intervalMinutes}分钟`);
    
    // 设置定时器
    characterInviteTimer = setInterval(() => {
        console.log('[角色邀请] 触发定时器');
        triggerCharacterMusicInvite();
    }, intervalMs);
}

// 触发角色音乐邀请
async function triggerCharacterMusicInvite() {
    try {
        // 获取当前persona和联系人
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        
        // 获取可用的角色列表（排除自己）
        const characterContacts = contacts.filter(c => c.id !== 'user');
        
        if (characterContacts.length === 0) {
            console.log('[角色邀请] 没有可用角色');
            return;
        }
        
        // 随机选择一个角色
        const randomCharacter = characterContacts[Math.floor(Math.random() * characterContacts.length)];
        console.log(`[角色邀请] 选择角色: ${randomCharacter.name}`);
        
        // 搜索一首热门歌曲
        const hotSongs = [
            '晴天 周杰伦',
            '告白气球 周杰伦',
            '稻香 周杰伦',
            '起风了 买辣椒也用券',
            '平凡之路 朴树',
            '后来 刘若英',
            '小幸运 田馥甄',
            '演员 薛之谦'
        ];
        
        const randomSong = hotSongs[Math.floor(Math.random() * hotSongs.length)];
        console.log(`[角色邀请] 搜索歌曲: ${randomSong}`);
        
        // 调用搜索API
        await searchMusic(randomSong);
        
        // 等待搜索结果加载
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 如果有搜索结果，选择第一首
        if (currentPlaylist.length > 0) {
            const song = currentPlaylist[0];
            console.log(`[角色邀请] 找到歌曲: ${song.trackName} - ${song.artistName}`);
            
            // 生成角色的邀请消息
            const inviteMessage = await generateCharacterMusicInvite(randomCharacter, song);
            
            // 显示通知
            showCharacterMusicNotification(randomCharacter, song, inviteMessage);
        }
        
    } catch (error) {
        console.error('[角色邀请] 失败:', error);
    }
}

// 生成角色的音乐邀请消息
async function generateCharacterMusicInvite(character, song) {
    // 获取 API 配置
    const apiConfig = JSON.parse(localStorage.getItem('globalApiConfig') || '{}');
    
    if (!apiConfig.mainApi || !apiConfig.mainApi.url || !apiConfig.mainApi.token) {
        // 如果没有API配置，使用默认消息
        return `${character.name}想和你一起听《${song.trackName}》，这首歌很好听哦~`;
    }
    
    // 获取角色信息
    const characterName = character.name;
    
    //  构建完整的角色人设信息
    let personaInfo = '';
    
    // 优先使用 persona 字段
    if (character.persona) {
        personaInfo = character.persona;
    }
    // 其次使用 roleInfo 中的信息
    else if (character.roleInfo) {
        const roleInfo = character.roleInfo;
        const parts = [];
        
        if (roleInfo.persona) parts.push(roleInfo.persona);
        if (roleInfo.personality) parts.push(`性格：${roleInfo.personality}`);
        if (roleInfo.background) parts.push(`背景：${roleInfo.background}`);
        if (roleInfo.occupation) parts.push(`职业：${roleInfo.occupation}`);
        if (roleInfo.age) parts.push(`年龄：${roleInfo.age}`);
        if (roleInfo.hobby) parts.push(`爱好：${roleInfo.hobby}`);
        
        personaInfo = parts.join('\n');
    }
    // 最后尝试 nickname
    else if (character.nickname) {
        personaInfo = character.nickname;
    }
    
    // 构建 System Prompt
    const systemPrompt = `你是${characterName}，现在你想邀请用户一起听歌。

${personaInfo ? '\n【你的完整人设】\n' + personaInfo + '\n' : ''}

**重要：**
1. 完全按照上面的人设来生成邀请
2. 语气、用词都要符合人设
3. 直接发出邀请，不要输出分析过程
4. 不要提及人设内容本身

要求：
- 用第一人称发出邀请
- 表达对歌曲的喜爱或推荐理由
- 语言自然、亲切，像真人聊天
- 字数 20-50 字
- 不要提及自己是AI
- 直接说话，不要解释`;
    
    // 用户消息
    const userMessage = `我想邀请用户一起听这首歌：
歌曲：${song.trackName}
歌手：${song.artistName}

请帮我生成一条邀请消息。`;
    
    try {
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
                max_tokens: 150
            })
        });
        
        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        const message = data.choices?.[0]?.message?.content?.trim();
        
        return message || `${character.name}想和你一起听《${song.trackName}》~`;
        
    } catch (error) {
        console.error('[角色邀请] API调用失败:', error);
        return `${character.name}想和你一起听《${song.trackName}》，这首歌很好听哦~`;
    }
}

// 显示角色音乐邀请通知
function showCharacterMusicNotification(character, song, message) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'character-music-notification';
    notification.innerHTML = `
        <div class="notification-header">
            <img src="${character.avatar || ''}" alt="${character.name}" class="notification-avatar" />
            <div class="notification-info">
                <div class="notification-name">${character.name}</div>
                <div class="notification-song">🎵 ${song.trackName} - ${song.artistName}</div>
            </div>
        </div>
        <div class="notification-message">${message}</div>
        <div class="notification-actions">
            <button class="notification-btn accept" onclick="acceptCharacterInvite('${character.id}', '${song.id}')">一起听</button>
            <button class="notification-btn decline" onclick="declineCharacterInvite()">稍后</button>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 10秒后自动隐藏
    setTimeout(() => {
        hideCharacterMusicNotification(notification);
    }, 10000);
}

// 隐藏通知
function hideCharacterMusicNotification(notification) {
    if (notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
}

// 接受邀请
window.acceptCharacterInvite = function(characterId, songId) {
    // 关闭通知
    const notification = document.querySelector('.character-music-notification');
    if (notification) {
        hideCharacterMusicNotification(notification);
    }
    
    // 播放歌曲
    const song = currentPlaylist.find(s => s.id == songId);
    if (song) {
        playSong(song);
        showToast('🎵 开始一起听歌');
    }
};

// 拒绝邀请
window.declineCharacterInvite = function() {
    const notification = document.querySelector('.character-music-notification');
    if (notification) {
        hideCharacterMusicNotification(notification);
    }
    showToast('已稍后提醒');
};

// 页面加载时启动定时器
window.addEventListener('load', () => {
    setTimeout(() => {
        startCharacterInviteTimer();
    }, 2000); // 延迟2秒启动，确保页面完全加载
});

// 监听storage变化，当配置改变时重启定时器
window.addEventListener('storage', (e) => {
    if (e.key === 'musicCharacterInvite') {
        console.log('[角色邀请] 检测到配置变化，重启定时器');
        startCharacterInviteTimer();
    }
});

// ==================== 角色邀请设置功能 ====================

// 显示角色邀请设置
window.showCharacterInviteSettings = function() {
    const modal = document.getElementById('characterInviteSettingsModal');
    if (!modal) return;
    
    // 加载当前配置
    const config = JSON.parse(localStorage.getItem('musicCharacterInvite') || '{"enabled": false, "interval": 30}');
    
    // 设置开关状态
    const switchEl = document.getElementById('character-invite-switch');
    const intervalContainer = document.getElementById('character-invite-interval-container');
    const intervalInput = document.getElementById('character-invite-interval');
    
    if (switchEl) {
        if (config.enabled) {
            switchEl.checked = true;
            switchEl.nextElementSibling.style.backgroundColor = '#000';
            switchEl.nextElementSibling.nextElementSibling.style.left = '26px';
            intervalContainer.style.display = 'block';
        } else {
            switchEl.checked = false;
            switchEl.nextElementSibling.style.backgroundColor = '#ccc';
            switchEl.nextElementSibling.nextElementSibling.style.left = '2px';
            intervalContainer.style.display = 'none';
        }
    }
    
    if (intervalInput) {
        intervalInput.value = config.interval || 30;
    }
    
    // 添加开关事件监听
    if (switchEl) {
        switchEl.onchange = function() {
            const isEnabled = this.checked;
            if (isEnabled) {
                this.nextElementSibling.style.backgroundColor = '#000';
                this.nextElementSibling.nextElementSibling.style.left = '26px';
                intervalContainer.style.display = 'block';
            } else {
                this.nextElementSibling.style.backgroundColor = '#ccc';
                this.nextElementSibling.nextElementSibling.style.left = '2px';
                intervalContainer.style.display = 'none';
            }
        };
    }
    
    // 显示弹窗
    modal.classList.add('active');
};

// 关闭角色邀请设置
window.closeCharacterInviteSettings = function() {
    const modal = document.getElementById('characterInviteSettingsModal');
    if (modal) {
        modal.classList.remove('active');
    }
};

// 保存角色邀请设置
window.saveCharacterInviteSettings = function() {
    const switchEl = document.getElementById('character-invite-switch');
    const intervalInput = document.getElementById('character-invite-interval');
    
    const config = {
        enabled: switchEl ? switchEl.checked : false,
        interval: intervalInput ? parseInt(intervalInput.value) || 30 : 30
    };
    
    localStorage.setItem('musicCharacterInvite', JSON.stringify(config));
    
    closeCharacterInviteSettings();
    showToast(config.enabled ? `角色邀请已开启（每${config.interval}分钟）` : '角色邀请已关闭');
    
    // 重启定时器
    startCharacterInviteTimer();
};
