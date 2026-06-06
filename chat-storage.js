/**
 * IndexedDB 聊天消息存储模块
 * 存储空间：50MB+ (比 localStorage 的 5MB 大 10 倍)
 */

const ChatDB = {
    dbName: 'ChatStorageDB',
    dbVersion: 1,
    storeName: 'messages',
    db: null,

    // 初始化数据库
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error('IndexedDB 打开失败:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('✓ IndexedDB 初始化成功');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 创建消息存储
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'chatId' });
                    store.createIndex('updatedAt', 'updatedAt', { unique: false });
                    console.log('✓ 创建消息存储表');
                }

                // 创建配置存储
                if (!db.objectStoreNames.contains('configs')) {
                    db.createObjectStore('configs', { keyPath: 'key' });
                    console.log('✓ 创建配置存储表');
                }
            };
        });
    },

    // 保存聊天消息
    async saveMessages(chatId, messages) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            const data = {
                chatId: chatId,
                messages: messages,
                count: messages.length,
                updatedAt: Date.now()
            };

            const request = store.put(data);

            request.onsuccess = () => {
                console.log(`✓ 消息已保存 (IndexedDB): ${chatId}, ${messages.length} 条`);
                resolve();
            };

            request.onerror = (event) => {
                console.error('保存消息失败:', event.target.error);
                reject(event.target.error);
            };
        });
    },

    // 加载聊天消息
    async loadMessages(chatId) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(chatId);

            request.onsuccess = (event) => {
                const result = event.target.result;
                if (result) {
                    console.log(`✓ 消息已加载 (IndexedDB): ${chatId}, ${result.count} 条`);
                    resolve(result.messages || []);
                } else {
                    console.log(`ℹ️ 未找到聊天数据: ${chatId}`);
                    resolve([]);
                }
            };

            request.onerror = (event) => {
                console.error('加载消息失败:', event.target.error);
                reject(event.target.error);
            };
        });
    },

    // 删除聊天消息
    async deleteMessages(chatId) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(chatId);

            request.onsuccess = () => {
                console.log(`✓ 消息已删除: ${chatId}`);
                resolve();
            };

            request.onerror = (event) => {
                console.error('删除消息失败:', event.target.error);
                reject(event.target.error);
            };
        });
    },

    // 保存配置 (使用 configs 存储)
    async saveConfig(key, value) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['configs'], 'readwrite');
            const store = transaction.objectStore('configs');

            const data = {
                key: key,
                value: value,
                updatedAt: Date.now()
            };

            const request = store.put(data);

            request.onsuccess = () => {
                console.log(`✓ 配置已保存 (IndexedDB): ${key}`);
                resolve();
            };

            request.onerror = (event) => {
                console.error('保存配置失败:', event.target.error);
                reject(event.target.error);
            };
        });
    },

    // 加载配置
    async loadConfig(key) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['configs'], 'readonly');
            const store = transaction.objectStore('configs');
            const request = store.get(key);

            request.onsuccess = (event) => {
                const result = event.target.result;
                if (result) {
                    console.log(`✓ 配置已加载 (IndexedDB): ${key}`);
                    resolve(result.value);
                } else {
                    resolve(null);
                }
            };

            request.onerror = (event) => {
                console.error('加载配置失败:', event.target.error);
                reject(event.target.error);
            };
        });
    },

    // 获取所有聊天记录列表
    async getAllChatIds() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAllKeys();

            request.onsuccess = (event) => {
                resolve(event.target.result || []);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    },

    // 清空所有数据
    async clearAll() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName, 'configs'], 'readwrite');
            
            transaction.objectStore(this.storeName).clear();
            transaction.objectStore('configs').clear();

            transaction.oncomplete = () => {
                console.log('✓ 所有数据已清空');
                resolve();
            };

            transaction.onerror = (event) => {
                reject(event.target.error);
            };
        });
    },

    // 获取存储使用情况
    async getStorageInfo() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = (event) => {
                const allData = event.target.result || [];
                const totalMessages = allData.reduce((sum, chat) => sum + (chat.count || 0), 0);
                const totalChats = allData.length;
                
                // 估算大小 (粗略计算)
                const jsonStr = JSON.stringify(allData);
                const sizeBytes = new Blob([jsonStr]).size;
                const sizeKB = (sizeBytes / 1024).toFixed(2);
                const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);

                resolve({
                    totalChats: totalChats,
                    totalMessages: totalMessages,
                    sizeKB: sizeKB,
                    sizeMB: sizeMB
                });
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
};

// 导出供使用
window.ChatDB = ChatDB;

