const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const CONFIG_FILE = path.join(DATA_DIR, 'keepalive-config.json');
const STATE_FILE = path.join(DATA_DIR, 'keepalive-state.json');

function loadJSON(filepath, fallback) {
    try {
        if (fs.existsSync(filepath)) return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    } catch (e) {}
    return fallback;
}

function saveJSON(filepath, data) {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

let config = loadJSON(CONFIG_FILE, {
    apiConfig: null,
    contacts: [],
    checkInterval: 60,
    enabled: false
});

let state = loadJSON(STATE_FILE, {
    running: false,
    lastCheck: null,
    stats: { totalReplies: 0, totalAutoMessages: 0, errors: 0 },
    messageQueue: []
});

function log(msg) {
    const ts = new Date().toLocaleString('zh-CN', { hour12: false });
    console.log(`[${ts}] [KeepAlive] ${msg}`);
    const logFile = path.join(DATA_DIR, 'keepalive.log');
    const line = `[${ts}] ${msg}\n`;
    try {
        fs.appendFileSync(logFile, line);
        const stat = fs.statSync(logFile);
        if (stat.size > 5 * 1024 * 1024) {
            const content = fs.readFileSync(logFile, 'utf-8');
            const lines = content.split('\n');
            fs.writeFileSync(logFile, lines.slice(-5000).join('\n'), 'utf-8');
        }
    } catch (e) {}
}

async function callAI(apiConfig, systemPrompt, userMessage) {
    const cfg = apiConfig.mainApi;
    let baseUrl = cfg.url.trim().replace(/\/+$/, '');
    if (!baseUrl.includes('/chat/completions')) {
        if (baseUrl.endsWith('/v1')) baseUrl += '/chat/completions';
        else if (!baseUrl.endsWith('/v1/chat/completions')) {
            if (baseUrl.includes('/v1/')) baseUrl += '/chat/completions';
            else baseUrl += '/v1/chat/completions';
        }
    }

    let model = apiConfig.model || 'gpt-3.5-turbo';
    if (!model || model.trim() === '') model = 'gpt-3.5-turbo';

    const body = JSON.stringify({
        model: model,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ]
    });

    const parsedUrl = new URL(baseUrl);
    const isHttps = parsedUrl.protocol === 'https:';
    const httpModule = isHttps ? https : http;

    const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cfg.token}`,
            'Content-Length': Buffer.byteLength(body)
        }
    };

    return new Promise((resolve, reject) => {
        const req = httpModule.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const content = json.choices?.[0]?.message?.content;
                    if (content) resolve(content);
                    else reject(new Error('AI返回空内容: ' + data.slice(0, 200)));
                } catch (e) {
                    reject(new Error('解析AI响应失败: ' + data.slice(0, 200)));
                }
            });
        });
        req.on('error', reject);
        req.setTimeout(30000, () => { req.destroy(); reject(new Error('AI请求超时')); });
        req.write(body);
        req.end();
    });
}

function getContactDataDir(chatId) {
    const dir = path.join(DATA_DIR, 'chats', chatId);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
}

function loadChatMessages(chatId) {
    const file = path.join(getContactDataDir(chatId), 'messages.json');
    return loadJSON(file, []);
}

function saveChatMessages(chatId, messages) {
    const file = path.join(getContactDataDir(chatId), 'messages.json');
    saveJSON(file, messages);
}

function buildSystemPrompt(contact) {
    let prompt = '';
    if (contact.name) prompt += `你的名字是${contact.name}。`;
    if (contact.persona) prompt += `\n\n${contact.persona}`;
    
    const autorejectKey = `role_${contact.id}_autoreject`;
    const autorejectFile = path.join(DATA_DIR, 'settings', `${autorejectKey}.json`);
    const autorejectSettings = loadJSON(autorejectFile, null);
    
    if (autorejectSettings && autorejectSettings.enabled) {
        const moodDesc = autorejectSettings.mood >= 80 ? '心情很好' : 
                         autorejectSettings.mood >= 60 ? '心情一般' : 
                         autorejectSettings.mood >= 40 ? '心情不太好' : 
                         autorejectSettings.mood >= 20 ? '心情很差' : '心情极差';
        prompt += `\n\n【自主拉黑 - 角色自主意识】\n当前心情：${moodDesc}（${autorejectSettings.mood}/100）\n只有严重冒犯或触碰底线时才拒绝，拒绝时用 [REJECT]理由[/REJECT] 格式。10次对话最多拒绝1-2次。`;
    }
    
    if (!prompt) prompt = '你是一个友好的聊天伙伴。';
    return prompt;
}

async function processAutoReply(contact) {
    const chatId = contact.id;
    const messages = loadChatMessages(chatId);
    
    if (messages.length === 0) {
        log(`${contact.name || chatId}: 没有消息，跳过`);
        return;
    }

    const lastMsg = messages[messages.length - 1];
    if (lastMsg.s === 'assistant') {
        return;
    }

    if (lastMsg.s === 'assistant' && Date.now() - lastMsg.ts < 60000) {
        return;
    }

    const recentMessages = messages.slice(-20);
    const conversationContext = recentMessages.map(m => {
        const role = m.s === 'user' ? '用户' : (m.s === 'assistant' ? contact.name || '角色' : '系统');
        return `${role}: ${m.c}`;
    }).join('\n');

    const systemPrompt = buildSystemPrompt(contact);
    const userPrompt = `以下是最近的对话记录：\n${conversationContext}\n\n请根据对话上下文和你的角色设定，继续对话或回复用户。`;

    try {
        log(`🤖 正在为 ${contact.name || chatId} 生成回复...`);
        const reply = await callAI(config.apiConfig, systemPrompt, userPrompt);
        
        const rejectMatch = reply.match(/\[REJECT\]([\s\S]*?)\[\/REJECT\]/);
        if (rejectMatch) {
            log(`🚫 ${contact.name || chatId} 自主拒绝回复: ${rejectMatch[1].trim()}`);
            const autorejectFile = path.join(DATA_DIR, 'settings', `role_${chatId}_autoreject.json`);
            const autorejectSettings = loadJSON(autorejectFile, { mood: 70 });
            autorejectSettings.mood = Math.max(0, autorejectSettings.mood - 5);
            saveJSON(autorejectFile, autorejectSettings);
            return;
        }

        const newMessage = {
            s: 'assistant',
            c: reply.trim(),
            t: 'text',
            ts: Date.now(),
            autoReply: true
        };
        messages.push(newMessage);
        saveChatMessages(chatId, messages);
        state.stats.totalReplies++;
        saveJSON(STATE_FILE, state);
        log(`✅ ${contact.name || chatId} 已回复: ${reply.trim().slice(0, 50)}...`);

        const autorejectFile = path.join(DATA_DIR, 'settings', `role_${chatId}_autoreject.json`);
        const autorejectSettings = loadJSON(autorejectFile, { mood: 70 });
        if (autorejectSettings.enabled) {
            autorejectSettings.mood = Math.min(100, autorejectSettings.mood + 2);
            saveJSON(autorejectFile, autorejectSettings);
        }

    } catch (e) {
        state.stats.errors++;
        saveJSON(STATE_FILE, state);
        log(`❌ ${contact.name || chatId} 回复失败: ${e.message}`);
    }
}

async function processAutoMessage(contact) {
    const chatId = contact.id;
    const messages = loadChatMessages(chatId);
    
    const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
    if (lastMsg && lastMsg.s === 'assistant' && Date.now() - lastMsg.ts < 300000) {
        return;
    }

    const systemPrompt = buildSystemPrompt(contact);
    const prompt = lastMsg 
        ? `你之前和用户聊过天，最后一条消息是：\n${lastMsg.s === 'user' ? '用户' : '你'}: ${lastMsg.c}\n\n现在你想主动找用户聊天，发一条自然的消息。可以是分享心情、问候、或者聊点有趣的事。消息要简短自然，像真人发微信一样。`
        : `你想主动找用户打个招呼，发一条简短自然的消息。`;

    try {
        log(`📤 正在为 ${contact.name || chatId} 生成主动消息...`);
        const reply = await callAI(config.apiConfig, systemPrompt, prompt);
        
        const newMessage = {
            s: 'assistant',
            c: reply.trim(),
            t: 'text',
            ts: Date.now(),
            autoMessage: true
        };
        messages.push(newMessage);
        saveChatMessages(chatId, messages);
        state.stats.totalAutoMessages++;
        saveJSON(STATE_FILE, state);
        log(`✅ ${contact.name || chatId} 主动消息: ${reply.trim().slice(0, 50)}...`);

    } catch (e) {
        state.stats.errors++;
        saveJSON(STATE_FILE, state);
        log(`❌ ${contact.name || chatId} 主动消息失败: ${e.message}`);
    }
}

let checkTimer = null;

async function runCheck() {
    if (!config.enabled || !config.apiConfig) {
        log('保活服务未启用或未配置API');
        return;
    }

    state.running = true;
    state.lastCheck = Date.now();
    saveJSON(STATE_FILE, state);

    log('🔄 开始检查...');
    
    for (const contact of config.contacts) {
        try {
            await processAutoReply(contact);
        } catch (e) {
            log(`处理 ${contact.name} 自动回复失败: ${e.message}`);
        }
    }

    if (Math.random() < 0.15) {
        const idx = Math.floor(Math.random() * config.contacts.length);
        const contact = config.contacts[idx];
        if (contact) {
            try {
                await processAutoMessage(contact);
            } catch (e) {
                log(`处理 ${contact.name} 主动消息失败: ${e.message}`);
            }
        }
    }

    state.running = false;
    saveJSON(STATE_FILE, state);
    log('✅ 检查完成');
}

function startKeepAlive() {
    if (checkTimer) clearInterval(checkTimer);
    if (!config.enabled) {
        log('保活服务未启用');
        return;
    }
    const intervalMs = Math.max(30, config.checkInterval) * 1000;
    log(`🚀 保活服务已启动，检查间隔: ${config.checkInterval}秒`);
    runCheck();
    checkTimer = setInterval(runCheck, intervalMs);
}

function stopKeepAlive() {
    if (checkTimer) {
        clearInterval(checkTimer);
        checkTimer = null;
    }
    state.running = false;
    saveJSON(STATE_FILE, state);
    log('⏹️ 保活服务已停止');
}

const apiServer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    const sendJSON = (data, status = 200) => {
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    };

    const readBody = () => new Promise((resolve) => {
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', () => { resolve(body); });
    });

    (async () => {
        try {
            if (pathname === '/api/keepalive/status' && req.method === 'GET') {
                sendJSON({
                    enabled: config.enabled,
                    running: state.running,
                    lastCheck: state.lastCheck,
                    checkInterval: config.checkInterval,
                    contactCount: config.contacts.length,
                    stats: state.stats,
                    apiConfigured: !!config.apiConfig
                });
            }
            else if (pathname === '/api/keepalive/config' && req.method === 'POST') {
                const body = await readBody();
                const newConfig = JSON.parse(body);
                if (newConfig.apiConfig !== undefined) config.apiConfig = newConfig.apiConfig;
                if (newConfig.contacts !== undefined) config.contacts = newConfig.contacts;
                if (newConfig.checkInterval !== undefined) config.checkInterval = Math.max(30, newConfig.checkInterval);
                if (newConfig.enabled !== undefined) config.enabled = newConfig.enabled;
                saveJSON(CONFIG_FILE, config);
                if (config.enabled) startKeepAlive();
                else stopKeepAlive();
                sendJSON({ success: true, config: { enabled: config.enabled, checkInterval: config.checkInterval, contactCount: config.contacts.length } });
            }
            else if (pathname === '/api/keepalive/start' && req.method === 'POST') {
                config.enabled = true;
                saveJSON(CONFIG_FILE, config);
                startKeepAlive();
                sendJSON({ success: true, message: '保活服务已启动' });
            }
            else if (pathname === '/api/keepalive/stop' && req.method === 'POST') {
                config.enabled = false;
                saveJSON(CONFIG_FILE, config);
                stopKeepAlive();
                sendJSON({ success: true, message: '保活服务已停止' });
            }
            else if (pathname === '/api/keepalive/trigger' && req.method === 'POST') {
                await runCheck();
                sendJSON({ success: true, message: '已触发一次检查' });
            }
            else if (pathname === '/api/keepalive/sync' && req.method === 'POST') {
                const body = await readBody();
                const syncData = JSON.parse(body);
                
                if (syncData.chatId && syncData.messages) {
                    saveChatMessages(syncData.chatId, syncData.messages);
                    log(`📥 同步消息: ${syncData.chatId}, ${syncData.messages.length}条`);
                }
                if (syncData.settings) {
                    const settingsDir = path.join(DATA_DIR, 'settings');
                    if (!fs.existsSync(settingsDir)) fs.mkdirSync(settingsDir, { recursive: true });
                    for (const [key, value] of Object.entries(syncData.settings)) {
                        saveJSON(path.join(settingsDir, `${key}.json`), value);
                    }
                    log(`📥 同步设置: ${Object.keys(syncData.settings).length}项`);
                }
                sendJSON({ success: true });
            }
            else if (pathname === '/api/keepalive/messages' && req.method === 'GET') {
                const chatId = url.searchParams.get('chatId');
                if (!chatId) { sendJSON({ error: '缺少chatId' }, 400); return; }
                const messages = loadChatMessages(chatId);
                sendJSON({ chatId, messages, count: messages.length });
            }
            else if (pathname === '/api/keepalive/messages' && req.method === 'POST') {
                const body = await readBody();
                const { chatId, message } = JSON.parse(body);
                if (!chatId || !message) { sendJSON({ error: '缺少参数' }, 400); return; }
                const messages = loadChatMessages(chatId);
                messages.push({ ...message, ts: message.ts || Date.now() });
                saveChatMessages(chatId, messages);
                log(`📥 收到用户消息: ${chatId}`);
                sendJSON({ success: true });
            }
            else if (pathname === '/api/keepalive/logs' && req.method === 'GET') {
                const logFile = path.join(DATA_DIR, 'keepalive.log');
                try {
                    const content = fs.readFileSync(logFile, 'utf-8');
                    const lines = content.trim().split('\n').slice(-100);
                    sendJSON({ logs: lines });
                } catch (e) {
                    sendJSON({ logs: [] });
                }
            }
            else {
                sendJSON({ error: '未知接口', path: pathname }, 404);
            }
        } catch (e) {
            log(`API错误: ${e.message}`);
            sendJSON({ error: e.message }, 500);
        }
    })();
});

const PORT = 8081;
apiServer.listen(PORT, () => {
    log('========================================');
    log('  后台保活服务已启动！');
    log('========================================');
    log(`  API地址: http://localhost:${PORT}`);
    log(`  检查间隔: ${config.checkInterval}秒`);
    log(`  状态: ${config.enabled ? '已启用' : '未启用'}`);
    log('========================================');

    if (config.enabled && config.apiConfig) {
        startKeepAlive();
    }
});

process.on('SIGINT', () => {
    log('收到退出信号，正在关闭...');
    stopKeepAlive();
    process.exit(0);
});

process.on('uncaughtException', (e) => {
    log(`未捕获异常: ${e.message}`);
});

process.on('unhandledRejection', (e) => {
    log(`未处理的Promise拒绝: ${e}`);
});
