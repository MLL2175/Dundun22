// Service Worker for PWA Chat - 后台消息处理
const CACHE_NAME = 'chat-pwa-v5';  // 版本号升级：强制清除旧缓存，拉取最新文件
const BACKGROUND_SYNC_TAG = 'ai-reply-sync';
const HEARTBEAT_INTERVAL = 30000; // 30秒心跳

// 需要预缓存的文件列表
const PRECACHE_URLS = [
    './',
    './chat-app.html',
    './chat-interface.html',
    './index.html',
    './main.js',
    './chat-app.js',
    './chat-interface.js',
    './chat-storage.js',
    './style.css',
    './cute-style.css',
    './minimal-style.css',
    './beautify.js',
    './settings.js',
    './music-player.js',
    './worldbook.js'
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Service Worker 安装中...');
    
    // 预缓存关键文件
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] 预缓存文件...');
            return cache.addAll(PRECACHE_URLS);
        })
    );
    
    self.skipWaiting(); // 立即激活
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Service Worker 已激活');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] 删除旧缓存:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim(); // 立即接管所有页面
});

// 拦截 fetch 请求
self.addEventListener('fetch', (event) => {
    // 不拦截 API 请求，让浏览器正常处理
    if (event.request.url.includes('/api/') || 
        event.request.url.includes('/v1/')) {
        return;
    }
    
    // 网络优先：先尝试请求最新文件，成功就更新缓存；
    // 只有在断网/请求失败时才退回到缓存里的旧版本。
    // （原来是"缓存优先"，导致更新代码后手机上一直跑旧版本，改的东西怎么都不生效）
    event.respondWith(
        fetch(event.request).then((networkResponse) => {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
            });
            return networkResponse;
        }).catch(() => {
            return caches.match(event.request);
        })
    );
});

// 监听 Background Sync 事件
self.addEventListener('sync', (event) => {
    console.log('[SW] 收到同步事件:', event.tag);
    
    if (event.tag === BACKGROUND_SYNC_TAG) {
        event.waitUntil(processAIReplyInBackground());
    }
});

// 监听推送消息（用于跨标签页通信）
self.addEventListener('message', (event) => {
    console.log('[SW] 收到消息:', event.data);
    
    if (event.data && event.data.type === 'PROCESS_AI_REPLY') {
        // 立即处理 AI 回复任务
        event.waitUntil(processAIReplyInBackground());
    }
    
    // 🛡️ 处理心跳请求
    if (event.data && event.data.type === 'HEARTBEAT') {
        console.log('[SW] 💓 收到心跳信号');
        event.source.postMessage({ type: 'HEARTBEAT_ACK', timestamp: Date.now() });
    }
});

// 🛡️ 监听 Web Push 推送事件
self.addEventListener('push', (event) => {
    console.log('[SW] 📨 收到推送消息');
    
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch (e) {
        console.error('[SW] 解析推送数据失败:', e);
        data = { title: '新消息', body: event.data ? event.data.text() : '' };
    }
    
    const title = data.title || '新消息';
    const options = {
        body: data.body || '',
        icon: data.icon || '/icon.png',
        badge: data.badge || '/badge.png',
        tag: data.tag || `push-${Date.now()}`,
        requireInteraction: false,
        silent: false,
        data: data // 保存完整数据供点击时使用
    };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// 🛡️ 处理推送通知点击
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] 👆 用户点击了通知');
    
    event.notification.close();
    
    // 打开聊天界面
    const chatId = event.notification.data?.chatId || '';
    const url = chatId ? `/chat-interface.html?chatId=${chatId}` : '/chat-app.html';
    
    event.waitUntil(
        self.clients.matchAll({ type: 'window' }).then((clientList) => {
            // 如果已有窗口，聚焦它
            for (const client of clientList) {
                if (client.url.includes('chat') && 'focus' in client) {
                    return client.focus();
                }
            }
            // 否则打开新窗口
            if (self.clients.openWindow) {
                return self.clients.openWindow(url);
            }
        })
    );
});

// 在后台处理 AI 回复
async function processAIReplyInBackground() {
    console.log('[SW] 🚀 开始后台处理 AI 回复任务');
    
    try {
        // 从 IndexedDB 或 localStorage 读取待处理任务
        const task = await getPendingTask();
        
        if (!task || task.status !== 'pending') {
            console.log('[SW] ℹ️ 没有待处理的任务');
            return;
        }
        
        console.log('[SW] 📋 找到待处理任务:', {
            chatId: task.chatId,
            messagePreview: task.userMessage?.substring(0, 30)
        });
        
        // 标记为处理中
        task.status = 'processing';
        await saveTask(task);
        
        // 调用 AI API
        const aiReply = await callAIAPI(task);
        
        if (!aiReply) {
            throw new Error('AI 返回空回复');
        }
        
        console.log('[SW] ✅ AI 回复生成成功，长度:', aiReply.length);
        
        // 解析并保存消息
        const messages = parseAndSaveMessages(task.chatId, aiReply);
        
        // 更新未读计数
        await updateUnreadCount(task.chatId, messages.length);
        
        // 清除任务
        await clearTask();
        
        // 🛡️ 发送浏览器系统通知
        await sendSystemNotification(task, aiReply);
        
        // 通知所有打开的客户端
        notifyClients({
            type: 'AI_REPLY_COMPLETED',
            chatId: task.chatId,
            messageCount: messages.length,
            timestamp: Date.now()
        });
        
        console.log('[SW] 💾 任务完成，已通知所有客户端');
        
    } catch (error) {
        console.error('[SW] ❌ 后台处理失败:', error);
        
        // 标记任务为失败
        try {
            const task = await getPendingTask();
            if (task) {
                task.status = 'failed';
                task.error = error.message;
                await saveTask(task);
            }
        } catch (e) {
            console.error('[SW] 保存失败状态出错:', e);
        }
        
        // 通知客户端失败
        notifyClients({
            type: 'AI_REPLY_FAILED',
            error: error.message,
            timestamp: Date.now()
        });
    }
}

// 从 localStorage 读取待处理任务（通过 clients 访问）
async function getPendingTask() {
    return new Promise((resolve) => {
        self.clients.matchAll().then((clients) => {
            if (clients.length > 0) {
                // 向第一个客户端请求任务数据
                clients[0].postMessage({ type: 'GET_PENDING_TASK' });
                
                // 监听响应
                const messageHandler = (event) => {
                    if (event.data && event.data.type === 'PENDING_TASK_RESPONSE') {
                        self.removeEventListener('message', messageHandler);
                        resolve(event.data.task);
                    }
                };
                
                self.addEventListener('message', messageHandler);
                
                // 超时处理
                setTimeout(() => {
                    self.removeEventListener('message', messageHandler);
                    resolve(null);
                }, 5000);
            } else {
                resolve(null);
            }
        });
    });
}

// 保存任务状态
async function saveTask(task) {
    return new Promise((resolve) => {
        self.clients.matchAll().then((clients) => {
            if (clients.length > 0) {
                clients[0].postMessage({
                    type: 'SAVE_TASK',
                    task: task
                });
                resolve();
            } else {
                resolve();
            }
        });
    });
}

// 清除任务
async function clearTask() {
    return new Promise((resolve) => {
        self.clients.matchAll().then((clients) => {
            if (clients.length > 0) {
                clients[0].postMessage({ type: 'CLEAR_TASK' });
                resolve();
            } else {
                resolve();
            }
        });
    });
}

// 调用 AI API
async function callAIAPI(task) {
    const config = await getAPIConfig();
    
    if (!config || !config.mainApi || !config.mainApi.url || !config.mainApi.token) {
        throw new Error('API 配置不完整');
    }
    
    const apiUrl = config.mainApi.url.endsWith('/chat/completions') 
        ? config.mainApi.url 
        : `${config.mainApi.url}/chat/completions`;
    
    console.log('[SW] 🤖 调用 AI API:', apiUrl);
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.mainApi.token}`
        },
        body: JSON.stringify({
            model: config.model || 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: task.systemPrompt },
                ...task.conversationHistory
            ],
            temperature: config.temperature || 0.7,
            max_tokens: config.maxTokens || 2048
        })
    });
    
    if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content;
}

// 获取 API 配置
async function getAPIConfig() {
    return new Promise((resolve) => {
        self.clients.matchAll().then((clients) => {
            if (clients.length > 0) {
                clients[0].postMessage({ type: 'GET_API_CONFIG' });
                
                const messageHandler = (event) => {
                    if (event.data && event.data.type === 'API_CONFIG_RESPONSE') {
                        self.removeEventListener('message', messageHandler);
                        resolve(event.data.config);
                    }
                };
                
                self.addEventListener('message', messageHandler);
                
                setTimeout(() => {
                    self.removeEventListener('message', messageHandler);
                    resolve(null);
                }, 5000);
            } else {
                resolve(null);
            }
        });
    });
}

// 解析并保存消息
function parseAndSaveMessages(chatId, aiReply) {
    // 这里简化处理，实际应该与主线程的逻辑一致
    console.log('[SW] 📝 解析 AI 回复并保存');
    
    // 返回消息数量（实际应该在客户端解析和保存）
    return [{ id: Date.now(), content: aiReply }];
}

// 更新未读计数
async function updateUnreadCount(chatId, messageCount) {
    return new Promise((resolve) => {
        self.clients.matchAll().then((clients) => {
            if (clients.length > 0) {
                clients[0].postMessage({
                    type: 'UPDATE_UNREAD_COUNT',
                    chatId: chatId,
                    messageCount: messageCount
                });
                resolve();
            } else {
                resolve();
            }
        });
    });
}

// 发送系统通知
async function sendSystemNotification(task, aiReply) {
    try {
        // 获取角色名称
        let senderName = 'AI';
        try {
            // 从客户端获取角色信息
            const clients = await self.clients.matchAll();
            if (clients.length > 0) {
                // 向客户端请求角色名称
                clients[0].postMessage({ type: 'GET_SENDER_NAME', chatId: task.chatId });
                
                // 等待响应
                const response = await Promise.race([
                    new Promise((resolve) => {
                        const handler = (event) => {
                            if (event.data && event.data.type === 'SENDER_NAME_RESPONSE') {
                                self.removeEventListener('message', handler);
                                resolve(event.data.name);
                            }
                        };
                        self.addEventListener('message', handler);
                        setTimeout(() => {
                            self.removeEventListener('message', handler);
                            resolve('AI');
                        }, 3000);
                    })
                ]);
                senderName = response || senderName;
            }
        } catch (e) {
            console.error('[SW] 获取角色名称失败:', e);
        }
        
        // 截取消息预览
        const messagePreview = aiReply.substring(0, 100) + (aiReply.length > 100 ? '...' : '');
        
        // 发送浏览器通知
        if (self.Notification && self.Notification.permission === 'granted') {
            const notification = new self.Notification(senderName, {
                body: messagePreview,
                icon: '/icon.png', // 可以自定义图标
                badge: '/badge.png', // 可以自定义徽章
                tag: `ai-reply-${task.chatId}-${Date.now()}`,
                requireInteraction: false, // 自动关闭
                silent: false // 播放提示音
            });
            
            // 点击通知时打开聊天界面
            notification.onclick = function() {
                self.clients.openWindow('/chat-interface.html?chatId=' + task.chatId);
                notification.close();
            };
            
            console.log('[SW] 🛡️ 系统通知已发送:', senderName);
        } else {
            console.log('[SW] ️ 通知权限未授予，跳过系统通知');
        }
    } catch (error) {
        console.error('[SW]  发送系统通知失败:', error);
    }
}

// 通知所有客户端
function notifyClients(data) {
    self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
            client.postMessage(data);
        });
    });
}

console.log('[SW] ✅ Service Worker 加载完成');
