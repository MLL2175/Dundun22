// 聊天数据
console.log('chat-interface.js v196 已加载 (节日礼物系统+个性化+动画+纯色背景+测试函数)');
let currentChatId = null;
let chatMessages = [];
let apiConfig = null;
let replyToMessage = null; // 当前引用的消息
let autoMessageTimer = null; // 自动消息定时器
let isMultiSelectMode = false; // 多选模式
let selectedMessageIds = new Set(); // 选中的消息 ID
let offlineMode = null; // 线下模式：'long-text' 或 'narration'（按联系人存储）
let offlineStartTime = null; // 线下模式开始时间（按联系人存储）
let isTestMode = false; // 自动回复模式

// ========== 节日礼物系统 ==========
const giftTemplates = {
    '生日': {
        icons: ['🎂', '🎁', '🎈', '🎉', '🥳', '🌟', '💝', '🦋'],
        names: ['甜蜜蛋糕', '心愿礼物盒', '快乐气球束', '幸福香槟', '美好回忆', '璀璨星光', '永恒之爱', '自由蝴蝶'],
        messages: [
            '祝你生日快乐！愿每一岁都奔走在自己的热爱里。',
            '愿你的眼睛只看得到笑容，愿你流下的泪都是喜极而泣。',
            '新的一岁，希望你所有的美好都能如期而至。',
            '岁月漫长，然而值得等待，愿你永远温柔且坚定。',
            '生日快乐呀！今天你是世界上最幸福的人~'
        ]
    },
    '恋爱纪念日': {
        icons: ['💕', '💖', '💗', '💝', '🌹', '💑', '🦋', '✨'],
        names: ['永恒的爱', '心动时刻', '甜蜜时光', '爱的誓言', '幸福相依', '浪漫相守', '真情相伴', '甜蜜回忆'],
        messages: [
            '感谢遇见，感谢相爱，感谢每一个有你的日子。',
            '和你在一起的每一天，都是生命中最美的时光。',
            '愿我们的爱情如星辰般永恒，如玫瑰般绚烂。',
            '往后余生，风雪是你，平淡是你，目光所及都是你。',
            '恋爱纪念日快乐！有你真好~'
        ]
    },
    '情人节': {
        icons: ['💝', '💘', '💓', '🌹', '💕', '🎁', '✨', '🦋'],
        names: ['浪漫之礼', '甜蜜心意', '爱意满满', '心动礼物', '真情告白', '浪漫惊喜', '甜蜜邂逅', '永恒承诺'],
        messages: [
            '遇见你是我最美的意外，爱上你是我最对的决定。',
            'Valentines Day，愿爱与你同行。',
            '这辈子最浪漫的事，就是和你一起慢慢变老。',
            '有你的日子，每天都是情人节。',
            '情人节快乐，我爱你！'
        ]
    },
    '520': {
        icons: ['💗', '💕', '💖', '💘', '🌹', '💝', '✨', '🦋'],
        names: ['我爱你', '甜蜜暴击', '心动信号', '浪漫满屋', '爱意传递', '真情告白', '幸福时光', '甜蜜相守'],
        messages: [
            '520，我爱你！这句话我想说一辈子。',
            '喜欢你这件事，我从没有犹豫过。',
            '在这个充满爱的日子里，我想说：遇见你，真好。',
            '520，愿我们的爱情永远像初恋一样甜蜜。',
            '520，我爱你，今天明天永远都爱你！'
        ]
    },
    '521': {
        icons: ['💕', '💖', '💗', '💘', '🌹', '💝', '✨', '🦋'],
        names: ['我爱你', '甜蜜守护', '真心相待', '浪漫相约', '爱在521', '真情永恒', '幸福相伴', '甜蜜相依'],
        messages: [
            '521，我爱你！每一天，每一年，都爱你。',
            '爱不需要理由，只需要你在我身边。',
            '521，想告诉你：遇见你，是我最大的幸运。',
            '愿我们的521，永远像今天一样甜蜜。',
            '521，我爱你，今天要比昨天更爱你！'
        ]
    },
    '跨年夜': {
        icons: ['🎆', '✨', '🎉', '🌟', '🎊', '🎁', '💝', '🎈'],
        names: ['新年礼物', '跨年惊喜', '美好祝愿', '璀璨星光', '幸福相伴', '甜蜜时光', '未来可期', '快乐永恒'],
        messages: [
            '跨年夜快乐！愿新的一年，我们一起创造更多美好回忆。',
            '新的一年，愿我们的爱情更加甜蜜。',
            '告别过去，迎接未来，有你在身边真好。',
            '愿新年的钟声，敲响幸福的旋律。',
            '跨年夜快乐，让我们一起迎接更美好的一年！'
        ]
    },
    '元旦': {
        icons: ['🎉', '🎊', '✨', '🌟', '🎁', '💝', '🎈', '🎂'],
        names: ['新年礼物', '元旦祝福', '美好开端', '甜蜜时光', '幸福相伴', '快乐无限', '未来可期', '温暖相随'],
        messages: [
            '元旦快乐！新的一年，新的开始，新的希望。',
            '愿新年的每一天，都像今天一样甜蜜。',
            '新的一年，愿我们的爱情更加美好。',
            '新年快乐，我的爱人！',
            '元旦快乐，愿你每天都开心！'
        ]
    },
    '除夕': {
        icons: ['🧧', '🏮', '🎊', '✨', '🌟', '🎁', '💝', '🎉'],
        names: ['除夕礼物', '新年红包', '团圆美满', '幸福安康', '甜蜜时光', '温暖祝福', '新年祝愿', '吉祥如意'],
        messages: [
            '除夕快乐！愿新的一年，我们一起度过更多美好时光。',
            '团圆的日子，有你在身边真好。',
            '愿新年的钟声，带来无尽的幸福。',
            '除夕快乐，我的爱人，新的一年请多指教！',
            '愿新的一年，我们的爱情更加甜蜜美满！'
        ]
    },
    '春节': {
        icons: ['🏮', '🧧', '🎊', '✨', '🎉', '🎁', '💝', '🌟'],
        names: ['春节礼物', '新年祝福', '吉祥如意', '幸福美满', '甜蜜时光', '快乐相伴', '温暖祝福', '鸿运当头'],
        messages: [
            '春节快乐！愿新的一年，万事如意，心想事成。',
            '愿我们的爱情，像春节一样红红火火。',
            '新年快乐，我的爱人，愿你每天都开心！',
            '愿新年的每一天，都充满幸福和甜蜜。',
            '春节快乐，新的一年我们要更加相爱！'
        ]
    },
    '元宵节': {
        icons: ['🏮', '✨', '🎊', '🌟', '🎁', '💝', '🎉', '🥟'],
        names: ['元宵礼物', '甜蜜汤圆', '团圆美满', '幸福时光', '温暖祝福', '快乐相伴', '美好祝愿', '吉祥如意'],
        messages: [
            '元宵节快乐！愿我们的生活像汤圆一样甜蜜圆满。',
            '月圆人团圆，有你在身边真好。',
            '愿每一天，都像今天一样甜蜜。',
            '元宵节快乐，我的爱人！',
            '愿我们的爱情，像圆月一样圆满！'
        ]
    },
    '妇女节': {
        icons: ['🌹', '💝', '✨', '🌟', '🎁', '💖', '💗', '🦋'],
        names: ['女神礼物', '女王节快乐', '最美的你', '甜蜜祝福', '幸福时光', '快乐相伴', '美丽永恒', '光彩照人'],
        messages: [
            '妇女节快乐！你是我心中最美的女神。',
            '愿你每天都像今天一样光彩照人。',
            '感谢有你，让我的生活如此美好。',
            '节日快乐，我的女王大人！',
            '愿你永远年轻，永远美丽！'
        ]
    },
    '劳动节': {
        icons: ['🌻', '🌿', '✨', '🌟', '🎁', '💝', '🎉', '🎊'],
        names: ['劳动节礼物', '甜蜜时光', '幸福相伴', '快乐无限', '美好祝愿', '温暖祝福', '轻松一刻', '快乐劳动'],
        messages: [
            '劳动节快乐！辛苦啦，今天好好休息一下吧。',
            '愿你的每一份努力，都有甜蜜的回报。',
            '辛苦了，我的爱人，今天让我来照顾你。',
            '劳动节快乐，愿你每天都轻松快乐！',
            '愿生活，像今天一样轻松愉快！'
        ]
    },
    '儿童节': {
        icons: ['🎈', '🎂', '🎁', '🎉', '🎊', '🌟', '✨', '🧸'],
        names: ['儿童礼物', '童趣时光', '快乐童年', '甜蜜回忆', '幸福相伴', '快乐无限', '童心未泯', '童真永恒'],
        messages: [
            '儿童节快乐！愿你永远保持一颗童心。',
            '不管多大，你都是我心中的小朋友。',
            '愿你的每一天，都像孩子一样快乐。',
            '儿童节快乐，我的小朋友！',
            '愿你永远年轻，永远热泪盈眶！'
        ]
    },
    '七夕': {
        icons: ['🌹', '💖', '💗', '💝', '💕', '✨', '🌟', '🦋'],
        names: ['七夕礼物', '浪漫惊喜', '甜蜜时光', '幸福相伴', '心动时刻', '爱的告白', '永恒之爱', '甜蜜相守'],
        messages: [
            '七夕快乐！愿我们的爱情像牛郎织女一样坚贞不渝。',
            '鹊桥相会，我们的心永远在一起。',
            '愿每一天，都像今天一样浪漫。',
            '七夕快乐，我的爱人！',
            '愿我们的爱情，永远像七夕一样甜蜜浪漫！'
        ]
    },
    '中秋节': {
        icons: ['🌕', '🥮', '✨', '🌟', '🎁', '💝', '🏮', '🌙'],
        names: ['中秋礼物', '甜蜜月饼', '团圆美满', '幸福时光', '温暖祝福', '快乐相伴', '美好祝愿', '月圆人圆'],
        messages: [
            '中秋节快乐！愿我们的生活像月亮一样圆满。',
            '月圆人团圆，有你在身边真好。',
            '愿每一天，都像今天一样甜蜜。',
            '中秋节快乐，我的爱人！',
            '愿我们的爱情，像圆月一样圆满！'
        ]
    },
    '国庆节': {
        icons: ['🎊', '🎉', '✨', '🌟', '🎁', '💝', '🎈', '🏮'],
        names: ['国庆礼物', '甜蜜时光', '幸福相伴', '快乐无限', '美好祝愿', '温暖祝福', '普天同庆', '欢乐时光'],
        messages: [
            '国庆节快乐！愿祖国繁荣昌盛，愿我们的爱情甜蜜永恒。',
            '在这个举国欢庆的日子里，有你在身边真好。',
            '愿每一天，都像今天一样快乐。',
            '国庆节快乐，我的爱人！',
            '愿我们的生活，永远像今天一样欢乐！'
        ]
    },
    '圣诞节': {
        icons: ['🎄', '🎁', '🎅', '⭐', '🔔', '❄️', '✨', '💝'],
        names: ['圣诞礼物', '惊喜礼物', '甜蜜圣诞', '幸福时光', '快乐相伴', '美好祝愿', '温暖祝福', '圣诞快乐'],
        messages: [
            '圣诞节快乐！愿圣诞老人把我的心意带给你。',
            '有你的圣诞节，才是最完美的。',
            '愿圣诞的钟声，敲响幸福的旋律。',
            '圣诞节快乐，我的爱人！',
            '愿这个圣诞，因为有你而更加温暖！'
        ]
    },
    '平安夜': {
        icons: ['🍎', '🎄', '🎁', '✨', '🌟', '💝', '🔔', '❄️'],
        names: ['平安夜礼物', '平安果', '甜蜜祝福', '幸福相伴', '快乐时光', '美好祝愿', '温暖祝福', '平安喜乐'],
        messages: [
            '平安夜快乐！愿你一生平安，永远幸福。',
            '送你一颗平安果，愿你平安快乐每一天。',
            '有你在身边，就是最平安的夜晚。',
            '平安夜快乐，我的爱人！',
            '愿你，永远平安喜乐！'
        ]
    },
    '100天纪念': {
        icons: ['💕', '💖', '💗', '💝', '🌹', '✨', '🌟', '🦋'],
        names: ['百天礼物', '甜蜜回忆', '幸福时光', '爱的见证', '美好纪念', '永恒之爱', '甜蜜相守', '幸福相伴'],
        messages: [
            '100天纪念日快乐！感谢这100天的陪伴。',
            '这100天，是我最幸福的时光。',
            '愿我们的爱情，走过无数个100天。',
            '100天快乐，我的爱人！',
            '愿我们的爱情，像这100天一样甜蜜！'
        ]
    },
    'default': {
        icons: ['🎁', '💝', '✨', '🌟', '🦋', '💕', '🎀', '🌸'],
        names: ['精美礼物', '心意之礼', '幸福时光', '美好回忆', '甜蜜惊喜', '温暖关怀', '浪漫礼物', '真情相送'],
        messages: [
            '小小的礼物，大大的心意，愿你每一天都幸福。',
            '礼物虽轻，情意却重，愿你感受到我的心意。',
            '愿这份礼物能带给你一点点快乐，就像你带给我的一样。',
            '时光静好，与君语；细水流年，与君同。',
            '愿你每天都开心！'
        ]
    }
};

// 随机生成礼物
function generateRandomGift(occasion) {
    const template = giftTemplates[occasion] || giftTemplates['default'];
    const icon = template.icons[Math.floor(Math.random() * template.icons.length)];
    const name = template.names[Math.floor(Math.random() * template.names.length)];
    const message = template.messages[Math.floor(Math.random() * template.messages.length)];
    
    return {
        occasion: occasion || '节日',
        giftIcon: icon,
        giftName: name,
        message: message
    };
}

// 检查今日是否有礼物需要发送
function checkAndSendGiftForToday() {
    try {
        // 获取当前日期字符串 YYYY-MM-DD
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        // 获取所有情侣空间
        const couples = JSON.parse(localStorage.getItem('coupleSpaces') || '[]');
        
        if (couples.length === 0) {
            console.log('🎁 没有设置情侣空间');
            return;
        }
        
        // 查找所有未发送的今日礼物
        for (let couple of couples) {
            if (!couple.giftReminders || !Array.isArray(couple.giftReminders)) {
                continue;
            }
            
            for (let reminder of couple.giftReminders) {
                if (reminder.date === todayStr && !reminder.sent) {
                    // 找到今日未发送的礼物！
                    console.log(`🎁 发现今日礼物: ${reminder.occasion}`);
                    
                    // 标记为已发送
                    reminder.sent = true;
                    reminder.sentAt = Date.now();
                    
                    // 保存到localStorage
                    localStorage.setItem('coupleSpaces', JSON.stringify(couples));
                    
                    // 发送礼物消息
                    sendGiftMessage(reminder);
                    return; // 只发送一个礼物
                }
            }
        }
        
        console.log('🎁 今日没有需要发送的礼物');
    } catch (e) {
        console.error('❌ 检查今日礼物失败:', e);
    }
}

// 发送礼物消息
function sendGiftMessage(reminder) {
    if (!currentChatId) {
        console.log('⚠️ 没有选择聊天，无法发送礼物');
        return;
    }
    
    // 初始化礼物动画CSS
    initGiftAnimations();
    
    const gift = generatePersonalizedGift(reminder.occasion);
    
    const giftMessage = {
        id: Date.now().toString(),
        type: 'gift',
        sender: 'ai',
        content: gift,
        time: Date.now(),
        isSent: false
    };
    
    chatMessages.push(giftMessage);
    
    // 保存聊天记录
    saveChatMessages();
    
    // 渲染消息
    renderMessages(true);
    
    console.log(`🎁 礼物消息已发送: ${gift.occasion} (${gift.personaType || '默认'})`);
}

// 测试发送节日礼物（在浏览器控制台调用）
window.sendTestGift = function(occasion = '生日') {
    if (!currentChatId) {
        console.log('❌ 请先选择一个聊天！');
        alert('请先选择一个聊天！');
        return;
    }
    
    const testReminder = {
        occasion: occasion,
        date: new Date().toISOString().split('T')[0],
        note: '测试礼物'
    };
    
    sendGiftMessage(testReminder);
    console.log(`✅ 已发送「${occasion}」测试礼物！`);
};

// 初始化礼物动画CSS
function initGiftAnimations() {
    if (document.getElementById('gift-anim-styles')) {
        return; // 已经初始化过
    }
    
    const style = document.createElement('style');
    style.id = 'gift-anim-styles';
    style.textContent = `
        /* 礼物弹跳动画 */
        @keyframes giftBounce {
            0% {
                transform: scale(0) translateY(20px);
                opacity: 0;
            }
            50% {
                transform: scale(1.2) translateY(-5px);
                opacity: 1;
            }
            70% {
                transform: scale(0.95) translateY(0);
            }
            100% {
                transform: scale(1) translateY(0);
                opacity: 1;
            }
        }
        
        /* 礼物闪烁动画 */
        @keyframes giftSparkle {
            0%, 100% {
                transform: scale(1);
                filter: drop-shadow(0 0 0 rgba(248, 204, 219, 0));
            }
            50% {
                transform: scale(1.05);
                filter: drop-shadow(0 0 8px rgba(248, 204, 219, 0.6));
            }
        }
    `;
    document.head.appendChild(style);
}

// 获取当前角色信息
function getCurrentCharacterInfo() {
    try {
        if (!currentChatId) {
            return null;
        }
        
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        const contact = contacts.find(c => c.id === currentChatId);
        
        if (!contact) {
            return null;
        }
        
        // 获取角色人设
        let persona = contact.persona || contact.roleSetting || contact.setting || '';
        
        // 获取关系类型（从人设中分析或从标记中获取）
        let relationshipType = 'default';
        
        if (persona) {
            // 从人设中分析关系类型
            persona = persona.toLowerCase();
            if (persona.includes('恋人') || persona.includes('男朋友') || persona.includes('女朋友') || persona.includes('老公') || persona.includes('老婆')) {
                relationshipType = 'lover';
            } else if (persona.includes('朋友') || persona.includes('闺蜜') || persona.includes('兄弟')) {
                relationshipType = 'friend';
            } else if (persona.includes('家人') || persona.includes('哥哥') || persona.includes('姐姐') || persona.includes('弟弟') || persona.includes('妹妹')) {
                relationshipType = 'family';
            } else if (persona.includes('老师') || persona.includes('学生')) {
                relationshipType = 'teacher_student';
            }
        }
        
        // 获取用户名称（用于称呼）
        let userName = '你';
        try {
            const myProfileKey = `persona_${currentPersona}_myProfile`;
            const myProfile = JSON.parse(localStorage.getItem(myProfileKey) || '{}');
            userName = myProfile.name || myProfile.username || '你';
        } catch (e) {}
        
        return {
            name: contact.name || 'AI',
            persona: contact.persona || contact.roleSetting || contact.setting || '',
            avatar: contact.avatar || '🤖',
            relationshipType: relationshipType,
            userName: userName
        };
    } catch (e) {
        console.error('获取角色信息失败:', e);
        return null;
    }
}

// 个性化礼物模板
const personalizedGiftTemplates = {
    lover: { // 恋人关系
        icons: ['❤️', '💝', '💕', '💖', '🌹', '✨', '🎁', '💍'],
        names: ['永恒之恋', '心动时刻', '甜蜜时光', '爱的承诺', '专属幸福', '浪漫惊喜', '真心礼物', '甜蜜回忆'],
        messages: [
            '亲爱的{userName}，这是我特意为你准备的礼物，希望你喜欢。有你在的每一天，都是最美好的节日。',
            '宝贝，节日快乐！这份礼物承载着我对你的爱，希望能让你感受到我的心意。',
            '{userName}，与你相遇是我最大的幸运。这个节日，让我用这份礼物表达我对你的爱。',
            '亲爱的，想把世界上最美好的都给你。这份礼物，只是我心意的万分之一。',
            '{userName}，节日快乐！愿我们的爱情像这份礼物一样，永远美丽动人。'
        ]
    },
    friend: { // 朋友关系
        icons: ['🎁', '✨', '🎉', '🎈', '🌟', '🎊', '💫', '🌈'],
        names: ['友情见证', '快乐分享', '美好时光', '闺蜜专属', '兄弟礼物', '青春纪念', '友谊长存', '开心礼物'],
        messages: [
            '{userName}，节日快乐！很高兴能有你这样的朋友，希望这份礼物能让你开心。',
            '嘿，节日到了！给你准备了一份小礼物，愿我们的友谊天长地久。',
            '{userName}，知道你今天过节，特意准备了这份礼物，希望你喜欢！',
            '老朋友，节日快乐！这份礼物代表我对你的祝福，愿你一切顺利。',
            '{userName}，愿这份礼物能给你带来好心情，节日快乐！'
        ]
    },
    family: { // 家人关系
        icons: ['🏠', '❤️', '🎁', '✨', '🌟', '💝', '🌙', '☀️'],
        names: ['家人关怀', '温暖祝福', '亲情礼物', '贴心礼物', '爱的表达', '温馨纪念', '家庭时光', '暖暖心意'],
        messages: [
            '{userName}，节日快乐！作为家人，希望你每天都能开心幸福。',
            '孩子/姐姐/哥哥，这是给你的节日礼物，愿你喜欢。',
            '{userName}，在这个特别的日子里，送上我的心意，愿你一切都好。',
            '家人的祝福永远是最温暖的，节日快乐，{userName}！',
            '{userName}，愿这份礼物能让你感受到家的温暖，节日快乐！'
        ]
    },
    teacher_student: { // 师生关系
        icons: ['📚', '🎁', '✨', '🌟', '📖', '🎓', '💫', '🌱'],
        names: ['学业进步', '智慧之光', '感谢师恩', '成长礼物', '知识之礼', '学业祝福', '未来可期', '青春纪念'],
        messages: [
            '{userName}，节日快乐！愿你在学习的道路上越走越远。',
            '学生/老师，这是给你的节日礼物，希望对你有所帮助。',
            '{userName}，愿这份礼物能给你带来灵感和动力，节日快乐！',
            '在这个特别的日子里，送上我最真挚的祝福，{userName}节日快乐！',
            '{userName}，愿你前程似锦，未来可期，节日快乐！'
        ]
    },
    default: { // 默认关系
        icons: ['🎁', '💝', '✨', '🌟', '🦋', '💕', '🎀', '🌸'],
        names: ['精美礼物', '心意之礼', '幸福时光', '美好回忆', '甜蜜惊喜', '温暖关怀', '浪漫礼物', '真情相送'],
        messages: [
            '{userName}，节日快乐！这是我为你准备的礼物，希望能让你开心。',
            '在这个特别的日子里，送上我的心意，愿你每一天都幸福快乐。',
            '{userName}，小小的礼物，大大的心意，愿你感受到我的祝福。',
            '愿这份礼物能给你带来好心情，{userName}节日快乐！',
            '{userName}，时光静好，愿你每一天都被温柔以待。节日快乐！'
        ]
    }
};

// 生成个性化礼物
function generatePersonalizedGift(occasion) {
    const characterInfo = getCurrentCharacterInfo();
    const relationshipType = characterInfo?.relationshipType || 'default';
    const userName = characterInfo?.userName || '你';
    const characterName = characterInfo?.name || 'AI';
    
    // 根据关系类型选择模板
    let template = personalizedGiftTemplates[relationshipType] || personalizedGiftTemplates['default'];
    
    // 如果节日有专属模板，且是恋人关系，可以混合使用
    if (giftTemplates[occasion] && relationshipType === 'lover') {
        // 恋人和节日专属模板混合
        template = {
            icons: [...new Set([...template.icons, ...giftTemplates[occasion].icons])],
            names: [...new Set([...template.names, ...giftTemplates[occasion].names])],
            messages: [...template.messages, ...giftTemplates[occasion].messages]
        };
    } else if (giftTemplates[occasion]) {
        // 其他关系优先使用节日模板
        template = giftTemplates[occasion];
    }
    
    // 随机选择礼物
    const icon = template.icons[Math.floor(Math.random() * template.icons.length)];
    const name = template.names[Math.floor(Math.random() * template.names.length)];
    let message = template.messages[Math.floor(Math.random() * template.messages.length)];
    
    // 替换消息中的用户名占位符
    message = message.replace(/\{userName\}/g, userName);
    
    // 特殊节日特殊处理
    if (occasion === '生日') {
        message = `亲爱的${userName}，生日快乐！愿你的每一天都充满阳光和欢笑，愿你的愿望都能实现。这是${characterName}给你的礼物，希望你喜欢。🎂`;
    } else if (occasion === '情人节') {
        message = `${userName}，情人节快乐！与你在一起的每一天都是情人节。这份礼物代表我的心，我爱你。❤️`;
    } else if (occasion === '520') {
        message = `520，我爱你，${userName}！这句话想对你说一辈子。希望你喜欢这份礼物。💕`;
    }
    
    return {
        occasion: occasion,
        giftIcon: icon,
        giftName: name,
        message: message,
        personaType: relationshipType
    };
}


/**
 * 获取世界书内容，按照读取顺序（优先 > 正常 > 最后）
 * 返回格式化后的世界书内容字符串
 */
function getWorldbookContentForAI() {
    try {
        const worldBooks = JSON.parse(localStorage.getItem('worldBooks') || '[]');
        
        if (worldBooks.length === 0) {
            return '';
        }
        
        // 按读取顺序排序：优先 > 正常 > 最后
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        const priorityNames = { high: '优先', normal: '正常', low: '最后' };
        
        const sortedBooks = worldBooks.sort((a, b) => {
            return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
        });
        
        // 构建世界书内容
        let content = '【世界书 - AI必须遵循的知识库】\n\n';
        content += '以下是用户设定的世界书内容，你必须在对话中遵循这些信息：\n\n';
        
        sortedBooks.forEach((book, index) => {
            content += `--- 世界书 ${index + 1}：${book.title} ---\n`;
            content += `[分类] ${book.category}\n`;
            content += `[读取顺序] ${priorityNames[book.priority] || '正常'}\n`;
            content += `[内容]\n${book.content}\n\n`;
        });
        
        content += '【重要提示】\n';
        content += '1. 以上世界书内容是用户设定的重要信息，你必须在对话中遵循\n';
        content += '2. 读取顺序为“优先”的世界书内容最重要，必须严格遵守\n';
        content += '3. 读取顺序为“正常”的世界书内容需要参考\n';
        content += '4. 读取顺序为“最后”的世界书内容作为补充信息\n';
        content += '5. 不要提及你看到了世界书，自然地融入对话中\n';
        
        console.log(`📚 世界书内容已生成，共 ${sortedBooks.length} 本书`);
        return content;
        
    } catch (e) {
        console.error('❌ 获取世界书内容失败:', e);
        return '';
    }
}

// 自动回复指令处理函数
function handleTestCommand(text) {
    console.log('🤖 自动回复模式 - 收到指令:', text);
    
    const lowerText = text.toLowerCase();
    
    // 亲属卡
    if (lowerText.includes('亲属卡') || lowerText.includes('亲情卡') || lowerText.includes('绑定钱包')) {
        return JSON.stringify({
            type: 'family-card',
            limit: 2000,
            remark: '零花钱'
        });
    }
    
    // 转账
    if (lowerText.includes('转账') || lowerText.includes('付款') || lowerText.includes('给钱')) {
        return JSON.stringify({
            type: 'transfer',
            amount: 50,
            remark: '转账'
        });
    }
    
    // 位置
    if (lowerText.includes('位置') || lowerText.includes('定位') || lowerText.includes('在哪里') || lowerText.includes('地点')) {
        return JSON.stringify({
            type: 'location',
            name: '当前位置',
            address: '未知地址'
        });
    }
    
    // 表情包
    if (lowerText.includes('表情') || lowerText.includes('emoji')) {
        return JSON.stringify({
            type: 'emoji',
            content: '😊'
        });
    }
    
    // 图片
    if (lowerText.includes('图片') || lowerText.includes('照片') || lowerText.includes('image')) {
        return JSON.stringify({
            type: 'image',
            content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        });
    }
    
    // 撤回
    if (lowerText.includes('撤回') || lowerText.includes('recall')) {
        return JSON.stringify({
            type: 'recalled',
            content: '已撤回一条消息'
        });
    }
    
    // 视频通话
    if (lowerText.includes('视频') || lowerText.includes('video')) {
        return JSON.stringify({
            type: 'video-call',
            content: {
                duration: '00:05',
                status: 'completed'
            }
        });
    }
    
    // 语音通话
    if (lowerText.includes('语音通话') || lowerText.includes('voice call')) {
        return JSON.stringify({
            type: 'voice-call',
            content: {
                duration: '00:03',
                status: 'completed'
            }
        });
    }
    
    // 红包
    if (lowerText.includes('红包') || lowerText.includes('redpacket')) {
        return JSON.stringify({
            type: 'redpacket',
            content: {
                amount: 88.88,
                remark: '恭喜发财'
            }
        });
    }
    
    // 合并转发
    if (lowerText.includes('转发') || lowerText.includes('forward')) {
        return JSON.stringify({
            type: 'merge-forward',
            content: {
                from: '聊天记录',
                messages: [
                    { sender: 'user', content: '消息 1' },
                    { sender: 'ai', content: '消息 2' }
                ]
            }
        });
    }
    
    // 默认回复
    return `已收到：${text}\n\n支持的指令：\n• 亲属卡 / 亲情卡 / 绑定钱包\n• 转账 / 付款 / 给钱\n• 位置 / 定位 / 在哪里\n• 表情 / emoji\n• 图片 / 照片\n• 撤回 / recall\n• 视频 / video\n• 语音通话 / voice call\n• 红包 / redpacket\n• 转发 / forward`;
}

// 初始化自动回复角色
function initTestRole() {
    const testRole = {
        id: 'test_role_001',
        name: '自动回复',
        remark: '指令自动回复',
        avatar: '🤖',
        persona: '你是一个自动回复助手，根据用户输入的关键词返回对应的JSON格式数据。',
        isTestMode: true,
        testCommands: {
            '亲属卡': { type: 'family-card', limit: 2000, remark: '零花钱' },
            '亲情卡': { type: 'family-card', limit: 1500, remark: '亲情卡' },
            '转账': { type: 'transfer', amount: 50, remark: '转账' },
            '付款': { type: 'transfer', amount: 100, remark: '付款' },
            '位置': { type: 'location', name: '当前位置', address: '未知地址' },
            '定位': { type: 'location', name: '当前位置', address: '街道' },
            '在哪里': { type: 'location', name: '我的位置', address: '城市' }
        }
    };
    
    // 保存自动回复角色到 localStorage
    const contactsKey = 'persona_default_chatContacts';
    const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
    
    // 检查是否已存在自动回复角色
    const existingIndex = contacts.findIndex(c => c.id === 'test_role_001');
    if (existingIndex === -1) {
        contacts.push(testRole);
        localStorage.setItem(contactsKey, JSON.stringify(contacts));
        console.log('✅ 自动回复角色已添加');
    } else {
        console.log('ℹ️ 自动回复角色已存在');
    }
    
    return testRole;
}

// ️ PWA Service Worker 注册
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        console.log('[PWA] 尝试注册 Service Worker...');
        navigator.serviceWorker.register('sw.js?v=106')
            .then((registration) => {
                console.log('[PWA] ✅ Service Worker 注册成功:', registration.scope);
                
                // 监听来自 Service Worker 的消息
                navigator.serviceWorker.addEventListener('message', (event) => {
                    handleServiceWorkerMessage(event.data);
                });
                
                // 🛡️ 初始化后台保活系统
                initBackgroundKeepAlive();
            })
            .catch((error) => {
                console.error('[PWA] ❌ Service Worker 注册失败:', error);
            });
    });
}

// 监听来自外层iframe容器的消息（用于头像点击等交互）
window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'callIframeFunction') {
        console.log('[iframe] 收到外层调用:', event.data.funcName);
        if (event.data.funcName === 'showWhisperModal') {
            // 调用心声弹窗
            if (typeof window.showWhisperModal === 'function') {
                window.showWhisperModal();
            }
        }
    }
});

// 处理 Service Worker 消息
function handleServiceWorkerMessage(data) {
    console.log('[PWA] 收到 SW 消息:', data.type);
    
    switch (data.type) {
        case 'HEARTBEAT_ACK':
            // 🛡️ 心跳响应
            console.log('[PWA] 💓 心跳响应:', new Date(data.timestamp).toLocaleTimeString());
            break;
            
        case 'GET_PENDING_TASK':
            // 返回待处理任务
            const task = localStorage.getItem('pendingAIReply');
            navigator.serviceWorker.controller?.postMessage({
                type: 'PENDING_TASK_RESPONSE',
                task: task ? JSON.parse(task) : null
            });
            break;
            
        case 'SAVE_TASK':
            // 保存任务状态
            if (data.task) {
                localStorage.setItem('pendingAIReply', JSON.stringify(data.task));
            }
            break;
            
        case 'CLEAR_TASK':
            // 清除任务
            localStorage.removeItem('pendingAIReply');
            localStorage.removeItem('pendingAIReplyTrigger');
            break;
            
        case 'GET_API_CONFIG':
            // 返回 API 配置
            const config = localStorage.getItem('globalApiConfig');
            navigator.serviceWorker.controller?.postMessage({
                type: 'API_CONFIG_RESPONSE',
                config: config ? JSON.parse(config) : null
            });
            break;
            
        case 'UPDATE_UNREAD_COUNT':
            // 更新未读计数
            updateUnreadCountFromSW(data.chatId, data.messageCount);
            break;
            
        case 'AI_REPLY_COMPLETED':
            // AI 回复完成
            console.log('[PWA] ✅ AI 回复已在后台完成');
            handleAIReplyCompleted(data);
            break;
            
        case 'AI_REPLY_FAILED':
            // AI 回复失败
            console.error('[PWA] ❌ AI 回复失败:', data.error);
            showToast(`AI 回复失败: ${data.error}`, 'error');
            break;
            
        case 'GET_SENDER_NAME':
            // 🛡️ Service Worker 请求发送者名称
            console.log('[PWA]  收到发送者名称请求:', data.chatId);
            try {
                const senderName = localStorage.getItem('currentChatName') || 'AI';
                navigator.serviceWorker.controller.postMessage({
                    type: 'SENDER_NAME_RESPONSE',
                    name: senderName
                });
            } catch (e) {
                console.error('[PWA] ❌ 发送发送者名称失败:', e);
            }
            break;
    }
}

// 从 Service Worker 更新未读计数
async function updateUnreadCountFromSW(chatId, messageCount) {
    try {
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const conversationsKey = `persona_${currentPersona}_chatConversations`;
        const conversations = JSON.parse(localStorage.getItem(conversationsKey) || '[]');
        
        const conversation = conversations.find(c => c.id === chatId);
        if (!conversation) return;
        
        // 如果当前正在这个聊天界面，不增加未读数
        if (window.currentChatId === chatId && window.currentChatWindowActive) {
            return;
        }
        
        const oldUnread = conversation.unread || 0;
        conversation.unread = oldUnread + messageCount;
        
        localStorage.setItem(conversationsKey, JSON.stringify(conversations));
        
        // 触发 storage 事件
        localStorage.setItem('unreadCountUpdated', JSON.stringify({
            chatId: chatId,
            unread: conversation.unread,
            timestamp: Date.now()
        }));
        
        console.log(`[PWA] 🔔 未读计数更新: ${oldUnread} → ${conversation.unread}`);
        
    } catch (error) {
        console.error('[PWA] ❌ 更新未读计数失败:', error);
    }
}

// 处理 AI 回复完成
function handleAIReplyCompleted(data) {
    console.log('[PWA] 📥 处理后台完成的 AI 回复:', data);
    
    // 如果当前在这个聊天界面，刷新显示
    if (currentChatId === data.chatId) {
        loadAndRenderMessages();
        scrollToBottom();
        removeTypingIndicator();
        
        // 📝 检查是否需要自动总结
        setTimeout(() => {
            checkAndTriggerAutoSummary();
        }, 500); // 延迟500ms，确保消息已加载完成
    }
    
    // ️ 获取角色名称和头像
    let senderName = 'AI';
    let avatarUrl = '';
    try {
        senderName = localStorage.getItem('currentChatName') || 'AI';
        const contactsKey = `persona_${localStorage.getItem('currentPersona') || 'default'}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        const contact = contacts.find(c => c.id === currentChatId);
        if (contact) {
            avatarUrl = contact.avatar || '';
        }
    } catch (e) {
        console.error('读取联系人信息失败:', e);
    }
    
    // ️ 显示横幅通知（聊天界面内）
    showBannerNotification(senderName, data.content || '新消息', avatarUrl);
    
    // 🛡️ 显示全局通知（桌面级）
    if (window.showGlobalNotification) {
        const messagePreview = (data.content || '').substring(0, 50);
        window.showGlobalNotification(
            senderName,
            messagePreview,
            5000 // 显示5秒
        );
    }
}

// 数据存储工具函数
function getData(key) {
    return JSON.parse(localStorage.getItem(key) || 'null');
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// 横幅通知相关
let bannerNotification = null;
let currentChatWindowActive = true; // 标记聊天窗口是否活跃

// 页面可见性变化监听
window.addEventListener('visibilitychange', () => {
    currentChatWindowActive = !document.hidden;
    if (currentChatWindowActive) {
        // 窗口重新可见，移除横幅通知
        removeBannerNotification();
    }
});

// 判断是否为图片 URL
function isImageUrl(str) {
    if (!str) return false;
    const hasProtocol = str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:');
    const hasExt = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(str);
    return hasProtocol || hasExt;
}

// 获取联系人头像
function getContactAvatar(chatId) {
    try {
        if (chatId) {
            const contacts = JSON.parse(localStorage.getItem('chatContacts') || '[]');
            const contact = contacts.find(c => c.id === chatId);
            if (contact && contact.avatar && isImageUrl(contact.avatar)) {
                return contact.avatar;
            }
        }
    } catch (e) {
        console.log('获取头像失败:', e);
    }
    return null;
}

// 显示横幅通知（支持头像）
function showBannerNotification(senderName, messagePreview, avatarUrl) {
    // 如果窗口活跃，不显示横幅
    if (currentChatWindowActive) return;
    
    // 检查是否开启了横幅通知
    try {
        const config = JSON.parse(localStorage.getItem('globalApiConfig') || '{}');
        if (!config.notification?.bannerEnabled) {
            console.log('横幅通知已关闭');
            return;
        }
    } catch (e) {
        console.error('读取配置失败:', e);
    }
    
    // 移除旧的通知
    removeBannerNotification();
    
    const banner = document.createElement('div');
    bannerNotification = banner;
    
    // 构建头像 HTML
    let avatarHtml;
    if (avatarUrl && isImageUrl(avatarUrl)) {
        avatarHtml = `<img src="${avatarUrl}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; flex-shrink: 0;" alt="">`;
    } else {
        avatarHtml = `<div style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; overflow: hidden;">${avatarUrl || '👤'}</div>`;
    }
    
    banner.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; width: 100%;">
            ${avatarHtml}
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
        removeBannerNotification();
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
        removeBannerNotification();
    }, 5000);
}

// 移除横幅通知
function removeBannerNotification() {
    if (bannerNotification && bannerNotification.parentNode) {
        bannerNotification.style.transform = 'translateY(-100%)';
        bannerNotification.style.opacity = '0';
        setTimeout(() => {
            if (bannerNotification && bannerNotification.parentNode) {
                bannerNotification.remove();
                bannerNotification = null;
            }
        }, 300);
    }
}

// 🛡️ 请求浏览器通知权限
function requestNotificationPermission() {
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            console.log('[通知] ✅ 通知权限已授予');
        } else if (Notification.permission !== 'denied') {
            console.log('[通知] ️ 请求通知权限...');
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    console.log('[通知] ✅ 通知权限已授予');
                    showToast('已开启通知功能', 'success');
                } else {
                    console.log('[通知]  通知权限被拒绝');
                }
            });
        }
    } else {
        console.log('[通知]  浏览器不支持通知功能');
    }
}

// Toast 提示函数
window.showToast = function(msg, type = 'success') {
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
};

// 初始化
window.addEventListener('DOMContentLoaded', async () => {
    // 初始化token显示栏（动态创建，解决缓存问题）
    initTokenCountBar();
    
    // ️ 删除自动回复测试角色（如果存在）
    const contactsKey = 'persona_default_chatContacts';
    const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
    const filteredContacts = contacts.filter(c => c.id !== 'test_role_001');
    if (filteredContacts.length !== contacts.length) {
        localStorage.setItem(contactsKey, JSON.stringify(filteredContacts));
    }
    
    // 🛡️ 请求通知权限
    requestNotificationPermission();
    
    // 初始化 IndexedDB
    try {
        await window.ChatDB.init();
    } catch (e) {
        // 静默降级到 localStorage
    }
    
    // 初始化输入框事件
    initInputKeyboardEvents();
    
    await loadChatData();
    renderMessages();
    
    // 恢复旁白模式UI状态
    restoreOfflineModeUI();
    
    // 🌿 检测 IF 线模式并应用专属样式
    const iflineInfo = sessionStorage.getItem('currentIfline');
    if (iflineInfo) {
        document.body.classList.add('ifline-mode');
        
        try {
            const ifline = JSON.parse(iflineInfo);
            // 线下模式：应用叙事阅读样式
            if (ifline.type === 'offline') {
                document.body.classList.add('ifline-offline-mode');
                console.log('📖 已应用线下叙事模式样式');
            }
        } catch (e) {
            console.error('解析 IF 线信息失败:', e);
        }
        
        console.log('🌿 已应用 IF 线模式样式');
    }
    
    // 滚动到底部（最新消息）
    setTimeout(() => {
        scrollToBottom();
    }, 100);
    
    // 检查是否有未读心声，显示小红点
    setTimeout(() => {
        checkUnreadWhisper();
    }, 500);
    
    // 🎁 检查今日是否有节日礼物需要发送
    setTimeout(() => {
        checkAndSendGiftForToday();
    }, 1500);
    
    //  关键修复：DOM 加载后立即强制同步标题（解决缓存问题）
    setTimeout(() => {
        console.log(' 强制同步标题...');
        if (currentChatId && currentChatId.startsWith('group_')) {
            loadGroupChatInfo();
        } else {
            syncSingleChatTitle();
        }
    }, 200);
    
    // 确保在 DOM 完全就绪后应用背景和气泡 CSS
    setTimeout(() => {
        console.log('\n===== 调试信息 =====');
        console.log('当前聊天 ID:', currentChatId);
        const chatKey = `chat_config_${currentChatId}`;
        const config = localStorage.getItem(chatKey);
        if (config) {
            const parsed = JSON.parse(config);
            console.log('✅ 找到配置:', {
                backgroundUrl: parsed.backgroundUrl ? '有 (' + parsed.backgroundUrl.substring(0, 30) + '...)' : '无',
                bubbleCss: parsed.bubbleCss ? '有 (' + parsed.bubbleCss.length + ' 字符)' : '无'
            });
        } else {
            console.warn('❌ 未找到配置，chatKey:', chatKey);
            console.log('所有 localStorage keys:', Object.keys(localStorage).filter(k => k.startsWith('chat_config_')));
        }
        
        // 重新应用背景和气泡 CSS
        console.log('\n🔄 重新应用背景...');
        applyChatBackground();
        console.log('\n🔄 重新应用气泡 CSS...');
        loadBubbleCss();
        
        // 🛠️ 修复：也重新应用界面 CSS
        console.log('\n🔄 重新应用界面 CSS...');
        loadInterfaceCss();
        
        console.log('====================\n');
    }, 100);
    
    // 从主项目获取 API 配置
    try {
        const mainData = localStorage.getItem('chatContacts');
        if (mainData) {
            console.log('已从主项目加载数据');
        }
    } catch (e) {
        console.log('独立运行模式');
    }
    
    setTimeout(() => {
        if (typeof loadNotificationSetting === 'function') {
            loadNotificationSetting();
        }
    }, 2000);

    // 页面卸载前保存数据
    window.addEventListener('beforeunload', () => {
        console.log('页面即将卸载，保存聊天数据...');
        saveChatData();
        console.log('聊天数据已保存，数量:', chatMessages.length);
    });
    
    // 监听页面显示事件，确保数据正确加载
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            console.log('页面从缓存恢复，重新加载数据');
            loadChatData();
            renderMessages();
            // 滚动到底部（最新消息）
            setTimeout(() => {
                scrollToBottom();
            }, 100);
        }
    });
    
    // 📚 监听新消息事件（从书架页面发送邀请）
    window.addEventListener('newMessage', async (event) => {
        const { chatId, message } = event.detail;
        console.log('📚 收到 newMessage 事件:', { chatId, messageType: message.type });
        
        // 如果当前正在这个聊天界面，重新加载数据
        if (currentChatId === chatId) {
            console.log('📚 当前聊天匹配，重新加载数据');
            await loadChatData();
            renderMessages();
            setTimeout(() => {
                scrollToBottom();
            }, 100);
        }
    });
});

// 返回主项目
window.goBack = function() {
    // 🎯 检查是否为 IF 线模式
    const iflineInfo = sessionStorage.getItem('currentIfline');
    if (iflineInfo) {
        console.log('🌿 从 IF 线对话返回 IF 线列表');
        // 清除 IF 线信息
        sessionStorage.removeItem('currentIfline');
        // 移除 IF 线样式类
        document.body.classList.remove('ifline-mode');
        document.body.classList.remove('ifline-offline-mode');
        // 返回到 IF 线页面
        window.location.href = 'if-line.html';
        return;
    }
    
    // 在返回前，确保清除当前聊天的未读标记
    if (currentChatId) {
        clearUnreadCountOnEnter(currentChatId);
        console.log('✓ 返回前已清除未读标记:', currentChatId);
    }
    
    // 返回到消息主页 (chat-app.html)
    window.location.href = 'chat-app.html';
};

// 切换 + 号菜单
window.togglePlusMenu = function() {
    const menu = document.getElementById('plus-menu-bottom');
    if (menu) {
        const isHidden = menu.style.display === 'none' || menu.style.display === '';
        menu.style.display = isHidden ? 'block' : 'none';
        
        // 如果菜单打开，滚动到菜单位置
        if (isHidden) {
            setTimeout(() => {
                menu.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 50);
        }
    }
};

// 显示心声弹窗
window.showWhisperModal = function() {
    const modal = document.getElementById('voice-modal');
    if (modal) {
        modal.style.display = 'block';
        // 打开心声弹窗时，隐藏小红点
        hideWhisperBadge();
    }
};

// 显示心声小红点提示
window.showWhisperBadge = function() {
    // 控制内部HTML中的小红点
    const badge = document.getElementById('whisper-badge');
    if (badge) {
        badge.style.display = 'block';
    }
    // 通过 postMessage 通知外层显示小红点
    try {
        parent.postMessage({
            type: 'showWhisperBadge'
        }, '*');
        console.log('🔴 显示心声小红点');
    } catch(e) {
        console.warn('无法通知外层小红点:', e);
    }
};

// 隐藏心声小红点提示
window.hideWhisperBadge = function() {
    // 控制内部HTML中的小红点
    const badge = document.getElementById('whisper-badge');
    if (badge) {
        badge.style.display = 'none';
    }
    // 通过 postMessage 通知外层隐藏小红点
    try {
        parent.postMessage({
            type: 'hideWhisperBadge'
        }, '*');
        console.log('⚪ 隐藏心声小红点');
    } catch(e) {
        console.warn('无法通知外层小红点:', e);
    }
};

// 检查是否有未读心声（页面加载时调用）
function checkUnreadWhisper() {
    try {
        // 从聊天记录中找到所有心声消息
        const innerVoiceMessages = chatMessages.filter(m => {
            if (m.type === 'inner_voice') return true;
            if (m.type === 'voice' && typeof m.content === 'object' && (m.content.clothing || m.content.mood || m.content.thoughts)) return true;
            return false;
        });
        
        // 如果有心声消息，显示小红点
        if (innerVoiceMessages.length > 0) {
            showWhisperBadge();
            console.log(`🔴 检测到 ${innerVoiceMessages.length} 条心声，显示小红点`);
        } else {
            hideWhisperBadge();
            console.log('⚪ 没有心声，隐藏小红点');
        }
    } catch (e) {
        console.error('检查未读心声失败:', e);
    }
}

// 切换线下菜单
window.toggleOfflineMenu = function() {
    console.log('toggleOfflineMenu 被调用, offlineMode:', offlineMode);
    
    // 如果正在旁白模式，直接结束
    if (offlineMode === 'narration') {
        console.log('正在旁白模式，调用 endOfflineMode');
        endOfflineMode();
        return;
    }
    
    // 否则打开加号菜单
    togglePlusMenu();
};

// 显示线下模式子菜单
window.showOfflineModeSubmenu = function() {
    const submenu = document.getElementById('offline-mode-submenu');
    if (submenu) {
        submenu.style.display = 'block';
    }
};

// 隐藏线下模式子菜单
window.hideOfflineModeSubmenu = function() {
    const submenu = document.getElementById('offline-mode-submenu');
    if (submenu) {
        submenu.style.display = 'none';
    }
};

// 打开线下菜单
window.openOfflineMenu = function() {
    window.toggleOfflineMenu();
};

// 开始线下模式
window.startOfflineMode = function(mode) {
    console.log('startOfflineMode 被调用, mode:', mode);
    console.log('当前聊天ID:', currentChatId);
    offlineMode = mode;
    offlineStartTime = Date.now();
    // 按联系人持久化线下模式状态
    saveData('offlineMode_' + currentChatId, offlineMode);
    saveData('offlineStartTime_' + currentChatId, offlineStartTime);
    console.log('设置后 offlineMode:', offlineMode);
    
    if (mode === 'long-text') {
        // 打开长文本界面
        const modal = document.getElementById('offline-long-text-modal');
        if (modal) {
            modal.style.display = 'block';
            renderOfflineNarrativeMessages();
            scrollToOfflineNarrativeBottom();
        }
    } else if (mode === 'narration') {
        // 旁白模式
        offlineStartTime = Date.now();
        addSystemMessage('开始见面', 'offline-start');
        showToast('已开启旁白模式，点击"+"按钮结束');
        
        // 关闭菜单
        const menu = document.getElementById('plus-menu-bottom');
        if (menu) {
            menu.style.display = 'none';
        }
        
        // 在顶栏显示"见面中"
        showMeetingStatusInHeader();
                
        // 显示旁白按钮
        const narrationBtn = document.getElementById('narration-btn');
        if (narrationBtn) {
            narrationBtn.style.display = 'flex';
        }
                
        // 将加号按钮切换为"结束见面"
        const btn = document.querySelector('.plus-menu-btn');
        if (btn) {
            btn.classList.add('active');
            btn.onclick = function() { endOfflineMode(); };
        }
    }
};

// 结束线下模式
window.endOfflineMode = function() {
    console.log('endOfflineMode 被调用, offlineMode:', offlineMode);
    if (offlineMode === 'narration') {
        const duration = Math.floor((Date.now() - offlineStartTime) / 1000);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        const durationText = minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;
        
        addSystemMessage(`见面结束 (${durationText})`, 'offline-end');
        showToast('已退出旁白模式');
        
        // 隐藏顶栏的"见面中"状态
        hideMeetingStatusInHeader();
        
        // 隐藏旁白按钮
        const narrationBtn = document.getElementById('narration-btn');
        if (narrationBtn) {
            narrationBtn.style.display = 'none';
        }
        
        // 恢复加号按钮
        const btn = document.querySelector('.plus-menu-btn');
        if (btn) {
            btn.classList.remove('active');
            btn.onclick = function() { togglePlusMenu(); };
        }
        
        offlineMode = null;
        offlineStartTime = null;
        // 按联系人清除持久化状态
        localStorage.removeItem('offlineMode_' + currentChatId);
        localStorage.removeItem('offlineStartTime_' + currentChatId);
    }
};

// 恢复旁白模式UI状态（页面加载时调用）
function restoreOfflineModeUI() {
    console.log('restoreOfflineModeUI 被调用, offlineMode:', offlineMode);
    if (offlineMode === 'narration') {
        console.log('恢复旁白模式UI');
        
        // 显示顶栏的"见面中"状态
        showMeetingStatusInHeader();
        
        // 显示旁白按钮
        const narrationBtn = document.getElementById('narration-btn');
        if (narrationBtn) {
            narrationBtn.style.display = 'flex';
        }
        
        // 将加号按钮切换为"结束见面"
        const btn = document.querySelector('.plus-menu-btn');
        if (btn) {
            btn.classList.add('active');
            btn.onclick = function() { endOfflineMode(); };
        }
        
        console.log('旁白模式UI已恢复');
    }
}

// 添加系统消息
function addSystemMessage(content, type) {
    const messages = getData('chatMessages') || [];
    const newMessage = {
        id: 'msg_' + Date.now(),
        type: 'system-' + type,
        content: content,
        time: Date.now()
    };
    messages.push(newMessage);
    saveData('chatMessages', messages);
    renderMessages(true);
}

// 在聊天界面显示错误提示
async function showErrorInChat(errorMessage) {
    const newMessage = {
        id: 'msg_error_' + Date.now(),
        type: 'system-error',
        content: errorMessage,
        time: Date.now()
    };
    
    // 更新全局变量
    chatMessages.push(newMessage);
    
    // 保存到 IndexedDB
    try {
        if (window.ChatDB) {
            await window.ChatDB.saveMessage(currentChatId, newMessage);
            console.log('✅ 错误消息已保存到 IndexedDB');
        }
    } catch (e) {
        console.error('❌ 保存错误消息失败:', e);
    }
    
    // 同时保存到 localStorage（兼容性）
    const messages = getData('chatMessages') || [];
    messages.push(newMessage);
    saveData('chatMessages', messages);
    
    // 重新渲染
    renderMessages(true);
}

// 关闭长文本界面
window.closeOfflineLongText = function() {
    // 显示确认弹窗
    const confirmModal = document.createElement('div');
    confirmModal.id = 'offline-exit-confirm-modal';
    confirmModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 10003;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    confirmModal.innerHTML = `
        <div style="background: white; border-radius: 12px; padding: 24px; width: 90%; max-width: 360px; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">
            <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #333; text-align: center;">退出线下叙事</h3>
            <p style="margin: 0 0 24px 0; font-size: 14px; color: #666; text-align: center; line-height: 1.6;">
                是否要将本次叙事内容生成为记忆？
            </p>
            <div style="display: flex; gap: 12px;">
                <button onclick="exitWithoutMemory()" style="flex: 1; padding: 12px; background: #f0f0f0; color: #666; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: 500;">直接退出</button>
                <button onclick="exitWithMemory()" style="flex: 1; padding: 12px; background: #A5D6A7; color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: 500;">生成记忆</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmModal);
};

// 直接退出（不生成记忆）
window.exitWithoutMemory = function() {
    const modal = document.getElementById('offline-long-text-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    const confirmModal = document.getElementById('offline-exit-confirm-modal');
    if (confirmModal) {
        confirmModal.remove();
    }
};

// 生成记忆后退出
window.exitWithMemory = async function() {
    showToast('正在生成记忆...');
    
    // 获取API配置
    const apiConfig = JSON.parse(localStorage.getItem('globalApiConfig') || '{}');
    if (!apiConfig.mainApi?.url || !apiConfig.mainApi?.token) {
        showToast('请先配置API');
        exitWithoutMemory();
        return;
    }
    
    try {
        // 获取所有线下叙事消息
        const messages = getData('chatMessages') || [];
        const offlineMessages = messages.filter(msg => msg.type === 'offline-narrative');
        
        if (offlineMessages.length === 0) {
            showToast('没有叙事内容');
            exitWithoutMemory();
            return;
        }
        
        // 合并所有内容
        const allContent = offlineMessages.map(msg => msg.content).join('\n\n');
        
        // 构建提示词 - 生成记忆摘要
        const prompt = `请将以下线下见面的叙事内容总结为一段简洁的记忆描述（100字以内），用于记录这次见面的关键信息：\n\n${allContent}`;
        
        // 调用AI API生成记忆
        const memoryContent = await callAIAPI(prompt, apiConfig);
        
        if (memoryContent && memoryContent.trim()) {
            // 保存到记忆库
            const memories = getData('memories') || [];
            const newMemory = {
                id: Date.now().toString(),
                content: memoryContent.trim(),
                time: Date.now(),
                type: 'auto',
                source: 'offline-narrative'
            };
            memories.push(newMemory);
            saveData('memories', memories);
            
            // 同时添加到线上聊天对话中，让AI角色能"记得"
            const summaryMessage = {
                id: Date.now().toString(),
                type: 'system',
                content: `[线下见面总结]\n${memoryContent.trim()}\n\n[完整叙事内容]\n${allContent}`,
                sender: 'system',
                time: Date.now(),
                isOfflineSummary: true  // 标记为线下见面总结
            };
            
            messages.push(summaryMessage);
            saveData('chatMessages', messages);
            
            // 如果IndexedDB可用，也保存到IndexedDB
            if (typeof saveMessagesToDB === 'function') {
                await saveMessagesToDB(messages);
            }
            
            showToast('记忆已保存并同步到对话');
        } else {
            showToast('生成失败');
        }
    } catch (error) {
        console.error('生成记忆失败:', error);
        showToast('生成失败: ' + error.message);
    }
    
    // 关闭弹窗和界面
    exitWithoutMemory();
};

// 打开线下设置
window.openOfflineSettings = function() {
    const modal = document.getElementById('offline-settings-modal');
    if (modal) {
        modal.style.display = 'flex';
        
        // 加载已保存的设置
        loadOfflineSettings();
        
        // 加载自定义文风
        loadCustomStyles();
        
        // 监听文风选择变化
        const styleSelect = document.getElementById('offline-style');
        if (styleSelect) {
            styleSelect.onchange = function() {
                const customInput = document.getElementById('custom-style-input');
                if (this.value === 'custom') {
                    customInput.style.display = 'block';
                } else {
                    customInput.style.display = 'none';
                }
            };
        }
    }
};

// 关闭线下设置
window.closeOfflineSettings = function() {
    const modal = document.getElementById('offline-settings-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};

// 保存线下设置
window.saveOfflineSettings = function() {
    const perspective = document.getElementById('offline-perspective').value;
    const wordcount = document.getElementById('offline-wordcount').value;
    const style = document.getElementById('offline-style').value;
    
    const settings = {
        perspective: perspective,
        wordcount: wordcount,
        style: style
    };
    
    localStorage.setItem('offlineNarrativeSettings', JSON.stringify(settings));
    closeOfflineSettings();
    showToast('设置已保存');
};

// 加载线下设置
function loadOfflineSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem('offlineNarrativeSettings') || '{}');
        
        if (settings.perspective) {
            document.getElementById('offline-perspective').value = settings.perspective;
        }
        if (settings.wordcount) {
            document.getElementById('offline-wordcount').value = settings.wordcount;
        }
        if (settings.style) {
            document.getElementById('offline-style').value = settings.style;
        }
    } catch (e) {
        console.error('加载线下叙事设置失败:', e);
    }
}

// 获取线下叙事设置
function getOfflineSettings() {
    try {
        return JSON.parse(localStorage.getItem('offlineNarrativeSettings') || '{}');
    } catch (e) {
        return {};
    }
}

// 加载自定义文风列表
function loadCustomStyles() {
    try {
        const customStyles = JSON.parse(localStorage.getItem('offlineCustomStyles') || '[]');
        const listContainer = document.getElementById('custom-styles-list');
        const styleSelect = document.getElementById('offline-style');
        
        if (!listContainer || !styleSelect) return;
        
        // 清除现有的自定义选项
        const customOptions = styleSelect.querySelectorAll('option[data-custom]');
        customOptions.forEach(opt => opt.remove());
        
        // 显示已添加的自定义文风
        if (customStyles.length === 0) {
            listContainer.innerHTML = '<span style="font-size: 12px; color: #bbb;">暂无自定义文风</span>';
        } else {
            listContainer.innerHTML = '';
            customStyles.forEach((style, index) => {
                // 添加到下拉列表
                const option = document.createElement('option');
                option.value = style;
                option.textContent = style;
                option.setAttribute('data-custom', 'true');
                styleSelect.appendChild(option);
                
                // 显示为标签
                const tag = document.createElement('span');
                tag.style.cssText = `
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 10px;
                    background: #f0f0f0;
                    border-radius: 12px;
                    font-size: 12px;
                    color: #666;
                `;
                tag.innerHTML = `
                    ${style}
                    <svg onclick="removeCustomStyle(${index})" style="cursor: pointer; width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                `;
                listContainer.appendChild(tag);
            });
        }
        
        // 监听回车添加
        const customInput = document.getElementById('custom-style-text');
        if (customInput) {
            customInput.onkeydown = function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomStyle();
                }
            };
            customInput.onblur = function() {
                if (this.value.trim()) {
                    addCustomStyle();
                }
            };
        }
    } catch (e) {
        console.error('加载自定义文风失败:', e);
    }
}

// 添加自定义文风
window.addCustomStyle = function() {
    const input = document.getElementById('custom-style-text');
    if (!input) return;
    
    const styleName = input.value.trim();
    if (!styleName) return;
    
    try {
        const customStyles = JSON.parse(localStorage.getItem('offlineCustomStyles') || '[]');
        
        // 检查是否已存在
        if (customStyles.includes(styleName)) {
            showToast('该文风已存在');
            input.value = '';
            return;
        }
        
        customStyles.push(styleName);
        localStorage.setItem('offlineCustomStyles', JSON.stringify(customStyles));
        
        input.value = '';
        loadCustomStyles();
        showToast('已添加自定义文风');
    } catch (e) {
        console.error('添加自定义文风失败:', e);
    }
};

// 删除自定义文风
window.removeCustomStyle = function(index) {
    try {
        const customStyles = JSON.parse(localStorage.getItem('offlineCustomStyles') || '[]');
        const removedStyle = customStyles[index];
        
        customStyles.splice(index, 1);
        localStorage.setItem('offlineCustomStyles', JSON.stringify(customStyles));
        
        // 如果当前选中的是刚删除的文风，切换到默认
        const styleSelect = document.getElementById('offline-style');
        if (styleSelect && styleSelect.value === removedStyle) {
            styleSelect.value = 'simple';
        }
        
        loadCustomStyles();
        showToast('已删除');
    } catch (e) {
        console.error('删除自定义文风失败:', e);
    }
};

// 发送线下叙事消息
window.sendOfflineNarrative = function() {
    const input = document.getElementById('offline-narrative-input');
    if (!input) return;
    
    const content = input.value.trim();
    if (!content) {
        showToast('请输入内容');
        return;
    }
    
    // 添加线下叙事消息
    addOfflineNarrative(content);
    
    // 清空输入框
    input.value = '';
    input.style.height = 'auto';
    
    // 刷新消息列表
    renderOfflineNarrativeMessages();
    scrollToOfflineNarrativeBottom();
};

// 处理线下叙事输入框键盘事件
window.handleOfflineNarrativeKeydown = function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendOfflineNarrative();
    }
};

// 线下叙事输入框自动调整高度
window.autoResizeOfflineNarrative = function(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
};

// AI生成线下叙事内容
window.generateOfflineNarrative = async function() {
    console.log('🎨 开始AI生成线下叙事');
    
    // 获取API配置
    const apiConfig = JSON.parse(localStorage.getItem('globalApiConfig') || '{}');
    if (!apiConfig.mainApi?.url || !apiConfig.mainApi?.token) {
        showToast('请先配置API');
        return;
    }
    
    // 获取设置
    const settings = getOfflineSettings();
    const perspective = settings.perspective || 'first';
    const wordCount = settings.wordCount || 'medium';
    const style = settings.style || 'detailed';
    
    // 构建提示词
    let prompt = `请为线下见面场景生成一段叙事描写。`;
    
    // 人称视角
    if (perspective === 'first') {
        prompt += `\n使用第一人称（我）的视角。`;
    } else if (perspective === 'second') {
        prompt += `\n使用第二人称（你）的视角。`;
    } else if (perspective === 'third') {
        prompt += `\n使用第三人称（他/她）的视角。`;
    }
    
    // 字数要求
    if (wordCount === 'short') {
        prompt += `\n字数控制在50-100字左右。`;
    } else if (wordCount === 'medium') {
        prompt += `\n字数控制在200-500字左右。`;
    } else if (wordCount === 'long') {
        prompt += `\n字数控制在500-1000字左右。`;
    }
    
    // 文风
    const styleMap = {
        'simple': '简洁明快',
        'literary': '文艺清新',
        'detailed': '细腻入微',
        'humorous': '幽默风趣',
        'serious': '严肃认真'
    };
    const styleText = styleMap[style] || style;
    prompt += `\n文风：${styleText}。`;
    
    prompt += `\n\n要求：\n1. 描写面对面的场景、动作、表情、环境氛围\n2. 注重细节和情感表达\n3. 语言自然流畅，避免生硬\n4. 只输出叙事内容，不要添加其他说明`;
    
    // 显示加载状态
    showToast('正在生成...');
    
    try {
        // 调用API
        const response = await callAIAPI(prompt, apiConfig);
        
        if (response && response.trim()) {
            // 添加到输入框
            const input = document.getElementById('offline-narrative-input');
            if (input) {
                input.value = response;
                autoResizeOfflineNarrative(input);
                input.focus();
                showToast('已生成到输入框');
            }
        } else {
            showToast('生成失败，请重试');
        }
    } catch (error) {
        console.error('AI生成失败:', error);
        showToast('生成失败: ' + error.message);
    }
};

// 线下消息右键菜单
let offlineTouchTimer = null;
let offlineTouchTarget = null;

window.showOfflineMessageMenu = function(event, msgId) {
    event.preventDefault();
    event.stopPropagation();
    
    // 移除已存在的菜单
    const existingMenu = document.querySelector('.offline-message-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    const menu = document.createElement('div');
    menu.className = 'offline-message-menu';
    menu.style.cssText = `
        position: fixed;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        padding: 8px 0;
        z-index: 9999;
        min-width: 120px;
    `;
    
    // 菜单位置
    const rect = event.target.getBoundingClientRect();
    let top = rect.top - 10;
    let left = rect.left - 130;
    
    // 确保不超出屏幕
    if (left < 10) left = 10;
    if (left + 130 > window.innerWidth) left = window.innerWidth - 140;
    if (top + 100 > window.innerHeight) top = window.innerHeight - 110;
    
    menu.style.top = top + 'px';
    menu.style.left = left + 'px';
    
    menu.innerHTML = `
        <div onclick="editOfflineMessage('${msgId}')" style="padding: 12px 16px; cursor: pointer; color: #333; font-size: 14px; border-bottom: 1px solid #f0f0f0;">编辑</div>
        <div onclick="deleteOfflineMessage('${msgId}')" style="padding: 12px 16px; cursor: pointer; color: #ff4444; font-size: 14px;">删除</div>
    `;
    
    document.body.appendChild(menu);
    
    // 点击其他地方关闭菜单
    setTimeout(() => {
        document.addEventListener('click', function closeMenu() {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        });
    }, 0);
};

// 线下消息触摸开始
window.handleOfflineTouchStart = function(event, msgId) {
    offlineTouchTarget = event.currentTarget;
    offlineTouchTimer = setTimeout(() => {
        if (offlineTouchTarget) {
            const touch = event.touches[0];
            showOfflineMessageMenu({ 
                preventDefault: () => {}, 
                stopPropagation: () => {},
                target: offlineTouchTarget,
                clientX: touch.clientX,
                clientY: touch.clientY
            }, msgId);
        }
    }, 500);
};

// 线下消息触摸结束
window.handleOfflineTouchEnd = function(event) {
    if (offlineTouchTimer) {
        clearTimeout(offlineTouchTimer);
        offlineTouchTimer = null;
    }
};

// 线下消息鼠标按下
window.handleOfflineMouseDown = function(event, msgId) {
    offlineTouchTarget = event.target;
};

// 线下消息鼠标释放
window.handleOfflineMouseUp = function(event, msgId) {
    // 短按 - 显示见面中浮窗（桌面端）
    if (msgId) {
        // 检查是否是长按（通过检查是否已经有菜单显示）
        const existingMenu = document.querySelector('.offline-message-menu');
        if (!existingMenu) {
            showMeetingFloatWindow(msgId);
        }
    }
};

// 编辑线下消息
window.editOfflineMessage = function(msgId) {
    const messages = getData('chatMessages') || [];
    const msgIndex = messages.findIndex(m => m.id === msgId);
    
    if (msgIndex === -1) {
        showToast('消息不存在');
        return;
    }
    
    const msg = messages[msgIndex];
    
    // 关闭菜单
    const existingMenu = document.querySelector('.offline-message-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    // 创建编辑对话框
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10002;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 12px; padding: 24px; width: 90%; max-width: 400px; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">
            <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #333;">编辑叙事</h3>
            <textarea id="offline-edit-textarea" style="width: 100%; min-height: 120px; padding: 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; line-height: 1.6; resize: vertical; outline: none; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;">${escapeHtml(msg.content)}</textarea>
            <div style="display: flex; gap: 12px; margin-top: 16px; justify-content: flex-end;">
                <button onclick="this.closest('div[style*=\'fixed\']').remove()" style="padding: 8px 20px; background: #f0f0f0; color: #666; border: none; border-radius: 6px; font-size: 14px; cursor: pointer;">取消</button>
                <button onclick="saveOfflineEdit('${msgId}')" style="padding: 8px 20px; background: #A5D6A7; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; font-weight: 500;">保存</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 自动聚焦
    setTimeout(() => {
        const textarea = document.getElementById('offline-edit-textarea');
        if (textarea) {
            textarea.focus();
            textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        }
    }, 100);
};

// 保存线下编辑
window.saveOfflineEdit = function(msgId) {
    const textarea = document.getElementById('offline-edit-textarea');
    if (!textarea) return;
    
    const newContent = textarea.value.trim();
    if (!newContent) {
        showToast('内容不能为空');
        return;
    }
    
    const messages = getData('chatMessages') || [];
    const msgIndex = messages.findIndex(m => m.id === msgId);
    
    if (msgIndex !== -1) {
        messages[msgIndex].content = newContent;
        messages[msgIndex].edited = true;
        saveData('chatMessages', messages);
        
        // 关闭对话框
        const modal = textarea.closest('div[style*="fixed"]');
        if (modal) {
            modal.remove();
        }
        
        // 刷新列表
        renderOfflineNarrativeMessages();
        renderMessages();
        
        showToast('已保存');
    }
};

// 删除线下消息
window.deleteOfflineMessage = function(msgId) {
    // 关闭菜单
    const existingMenu = document.querySelector('.offline-message-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    if (!confirm('确定要删除这条叙事吗？')) {
        return;
    }
    
    const messages = getData('chatMessages') || [];
    const filteredMessages = messages.filter(m => m.id !== msgId);
    
    if (filteredMessages.length !== messages.length) {
        saveData('chatMessages', filteredMessages);
        
        // 刷新列表
        renderOfflineNarrativeMessages();
        renderMessages();
        
        showToast('已删除');
    }
};

// 渲染线下叙事消息列表
function renderOfflineNarrativeMessages() {
    const container = document.getElementById('offline-narrative-messages');
    if (!container) return;
    
    const messages = getData('chatMessages') || [];
    
    // 过滤出离线叙事消息
    const offlineMessages = messages.filter(msg => msg.type === 'offline-narrative');
    
    if (offlineMessages.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #999;">
                <div style="font-size: 48px; margin-bottom: 12px; opacity: 0.3;">📝</div>
                <div style="font-size: 15px;">还没有叙事内容</div>
                <div style="font-size: 13px; margin-top: 8px; opacity: 0.7;">在下方输入框开始叙事吧</div>
            </div>
        `;
        return;
    }
    
    let html = '';
    let lastTime = null;
    
    offlineMessages.forEach(msg => {
        // 显示时间分隔
        const timeGap = 5 * 60 * 1000; // 5分钟
        if (!lastTime || msg.time - lastTime > timeGap) {
            html += `
                <div style="text-align: center; padding: 10px 0;">
                    <span style="font-size: 11px; color: #bbb; background: rgba(0,0,0,0.05); padding: 4px 8px; border-radius: 4px;">${formatTime(msg.time)}</span>
                </div>
            `;
            lastTime = msg.time;
        }
        
        // 格子笔记本风格 - 消息卡片带格子背景和胶带装饰
        const tapeId1 = `tape-pattern-${msg.id}-1`;
        const tapeId2 = `tape-pattern-${msg.id}-2`;
        const tapeEdge1 = `tape-edge-${msg.id}-1`;
        const tapeEdge2 = `tape-edge-${msg.id}-2`;
        
        html += `
            <div class="offline-note-item" data-msg-id="${msg.id}" style="position: relative; margin-bottom: 24px; padding: 20px 16px 16px 16px; background: #fafaf5; background-image: linear-gradient(#f0f0e8 1px, transparent 1px), linear-gradient(90deg, #f0f0e8 1px, transparent 1px); background-size: 20px 20px; background-position: center center; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
                ontouchstart="handleOfflineTouchStart(event, '${msg.id}')" 
                ontouchend="handleOfflineTouchEnd(event)"
                onmousedown="handleOfflineMouseDown(event, '${msg.id}')" 
                onmouseup="handleOfflineMouseUp(event, '${msg.id}')">
                
                <!-- 左上角胶带 -->
                <svg style="position: absolute; top: -12px; left: -12px; width: 80px; height: 80px; transform: rotate(-15deg); opacity: 0.9;" viewBox="0 0 80 80">
                    <defs>
                        <pattern id="${tapeId1}" patternUnits="userSpaceOnUse" width="4" height="4">
                            <line x1="0" y1="4" x2="4" y2="0" stroke="#fff" stroke-width="0.5"/>
                        </pattern>
                        <!-- 齿痕效果 - 下边缘和左右两边 -->
                        <path id="${tapeEdge1}" d="M0,30 L3,28 L6,30 L9,28 L12,30 L15,28 L18,30 L21,28 L24,30 L27,28 L30,30 L33,28 L36,30 L39,28 L42,30 L45,28 L48,30 L51,28 L54,30 L57,28 L60,30 L63,28 L66,30 L69,28 L72,30 L75,28 L78,30 L80,30 M0,0 L0,2 L2,0 L4,2 L6,0 L8,2 L10,0 L12,2 L14,0 L16,2 L18,0 L20,2 L22,0 L24,2 L26,0 L28,2 L30,0 L32,2 L34,0 L36,2 L38,0 L40,2 L42,0 L44,2 L46,0 L48,2 L50,0 L52,2 L54,0 L56,2 L58,0 L60,2 L62,0 L64,2 L66,0 L68,2 L70,0 L72,2 L74,0 L76,2 L78,0 L80,2 M80,0 L78,2 L80,4 L78,6 L80,8 L78,10 L80,12 L78,14 L80,16 L78,18 L80,20 L78,22 L80,24 L78,26 L80,28 L78,30" fill="none" stroke="#FFE66D" stroke-width="1.5"/>
                    </defs>
                    <rect x="0" y="0" width="80" height="30" rx="2" fill="#FFE66D" opacity="0.85"/>
                    <rect x="0" y="0" width="80" height="30" rx="2" fill="url(#${tapeId1})" opacity="0.3"/>
                    <use href="#${tapeEdge1}"/>
                </svg>
                
                <!-- 右下角胶带 -->
                <svg style="position: absolute; bottom: -12px; right: -12px; width: 80px; height: 80px; transform: rotate(15deg); opacity: 0.9;" viewBox="0 0 80 80">
                    <defs>
                        <pattern id="${tapeId2}" patternUnits="userSpaceOnUse" width="4" height="4">
                            <line x1="0" y1="4" x2="4" y2="0" stroke="#fff" stroke-width="0.5"/>
                        </pattern>
                        <!-- 齿痕效果 - 上边缘和左右两边 -->
                        <path id="${tapeEdge2}" d="M0,50 L3,52 L6,50 L9,52 L12,50 L15,52 L18,50 L21,52 L24,50 L27,52 L30,50 L33,52 L36,50 L39,52 L42,50 L45,52 L48,50 L51,52 L54,50 L57,52 L60,50 L63,52 L66,50 L69,52 L72,50 L75,52 L78,50 L80,50 M0,80 L0,78 L2,80 L4,78 L6,80 L8,78 L10,80 L12,78 L14,80 L16,78 L18,80 L20,78 L22,80 L24,78 L26,80 L28,78 L30,80 L32,78 L34,80 L36,78 L38,80 L40,78 L42,80 L44,78 L46,80 L48,78 L50,80 L52,78 L54,80 L56,78 L58,80 L60,78 L62,80 L64,78 L66,80 L68,78 L70,80 L72,78 L74,80 L76,78 L78,80 L80,78 M80,80 L78,78 L80,76 L78,74 L80,72 L78,70 L80,68 L78,66 L80,64 L78,62 L80,60 L78,58 L80,56 L78,54 L80,52 L78,50" fill="none" stroke="#FFB3BA" stroke-width="1.5"/>
                    </defs>
                    <rect x="0" y="50" width="80" height="30" rx="2" fill="#FFB3BA" opacity="0.85"/>
                    <rect x="0" y="50" width="80" height="30" rx="2" fill="url(#${tapeId2})" opacity="0.3"/>
                    <use href="#${tapeEdge2}"/>
                </svg>
                
                <!-- 顶部：左侧头像和名字，右侧操作图标 -->
                <div style="position: absolute; top: 12px; left: 12px; right: 12px; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div class="offline-note-avatar" style="width: 32px; height: 32px; border-radius: 50%; overflow: hidden; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            ${isImageUrl(getUserAvatar()) ? `<img src="${getUserAvatar()}" alt="" style="width: 100%; height: 100%; object-fit: cover;">` : `<div style="width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">${getUserAvatar()}</div>`}
                        </div>
                        <span style="font-size: 14px; color: #333; font-weight: 500;">${msg.senderName || '我'}</span>
                    </div>
                    <div style="display: flex; gap: 4px;">
                        <svg onclick="editOfflineMessage('${msg.id}')" style="cursor: pointer; padding: 4px; width: 24px; height: 24px; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                        <svg onclick="deleteOfflineMessage('${msg.id}')" style="cursor: pointer; padding: 4px; width: 24px; height: 24px; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </div>
                </div>
                
                <!-- 内容区域 -->
                <div style="margin-top: 52px; padding-right: 16px; font-size: 14px; line-height: 1.8; color: #555; white-space: pre-wrap; word-break: break-word; -webkit-tap-highlight-color: transparent;">
                    ${escapeHtml(msg.content)}
                    ${msg.edited ? '<span style="margin-left: 6px; font-size: 11px; color: #bbb;">(已编辑)</span>' : ''}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 滚动到线下叙事底部
function scrollToOfflineNarrativeBottom() {
    const container = document.getElementById('offline-narrative-messages');
    if (container) {
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 50);
    }
}

// 显示见面中浮窗
window.showMeetingFloatWindow = function(msgId) {
    console.log('点击了旁白模式，消息ID:', msgId);
    
    // 检查是否已经存在浮窗
    const existingWindow = document.getElementById('meeting-float-window');
    if (existingWindow) {
        console.log('浮窗已存在，不重复创建');
        return;
    }
    
    console.log('创建新浮窗');
    
    // 创建浮窗
    const floatWindow = document.createElement('div');
    floatWindow.id = 'meeting-float-window';
    floatWindow.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        z-index: 10003;
        min-width: 280px;
        text-align: center;
        animation: fadeInScale 0.3s ease-out;
    `;
    
    floatWindow.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 16px;">🤝</div>
        <div style="font-size: 20px; font-weight: 600; color: #333; margin-bottom: 8px;">见面中</div>
        <div style="font-size: 14px; color: #999; margin-bottom: 24px;">点击退出按钮结束</div>
        <button onclick="closeMeetingFloatWindow()" style="padding: 10px 32px; background: #A5D6A7; color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: 500;">退出</button>
    `;
    
    // 添加动画样式
    const style = document.createElement('style');
    style.id = 'meeting-float-style';
    style.textContent = `
        @keyframes fadeInScale {
            from {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
            }
            to {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        }
        @keyframes fadeOutScale {
            from {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
            to {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(floatWindow);
    console.log('浮窗已添加到页面');
};

// 关闭见面中浮窗
window.closeMeetingFloatWindow = function() {
    const floatWindow = document.getElementById('meeting-float-window');
    if (floatWindow) {
        floatWindow.style.animation = 'fadeOutScale 0.2s ease-in';
        setTimeout(() => {
            floatWindow.remove();
        }, 200);
    }
};

// 在顶栏显示"见面中"状态
function showMeetingStatusInHeader() {
    console.log('尝试在顶栏显示见面中状态');
    const chatTitleWrapper = document.querySelector('.chat-title-wrapper');
    console.log('chatTitleWrapper:', chatTitleWrapper);
    if (!chatTitleWrapper) {
        console.error('未找到 .chat-title-wrapper 元素');
        return;
    }
    
    // 检查是否已经存在状态标签
    let statusLabel = document.getElementById('meeting-status-label');
    console.log('statusLabel 已存在:', statusLabel);
    if (!statusLabel) {
        statusLabel = document.createElement('div');
        statusLabel.id = 'meeting-status-label';
        statusLabel.style.cssText = `
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 8px;
            background: #A5D6A7;
            color: white;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            animation: fadeInScale 0.3s ease-out;
        `;
        statusLabel.innerHTML = `
            <span style="font-size: 14px;">🤝</span>
            <span>见面中</span>
        `;
        chatTitleWrapper.appendChild(statusLabel);
        console.log('已添加见面中标签到顶栏', statusLabel);
    }
}

// 隐藏顶栏的"见面中"状态
function hideMeetingStatusInHeader() {
    console.log('hideMeetingStatusInHeader 被调用');
    const statusLabel = document.getElementById('meeting-status-label');
    if (statusLabel) {
        console.log('找到标签，准备移除', statusLabel);
        statusLabel.style.animation = 'fadeOutScale 0.2s ease-in';
        setTimeout(() => {
            statusLabel.remove();
            console.log('标签已移除');
        }, 200);
    } else {
        console.log('未找到标签');
    }
}

// 添加长文本线下叙事消息
function addOfflineNarrative(content) {
    const messages = getData('chatMessages') || [];
    const newMessage = {
        id: 'msg_' + Date.now(),
        senderId: 'self',
        content: content,
        time: Date.now(),
        type: 'offline-narrative',
        isOffline: true
    };
    messages.push(newMessage);
    saveData('chatMessages', messages);
    renderMessages(true);
    
    // 如果离线叙事界面打开，也刷新它
    const modal = document.getElementById('offline-long-text-modal');
    if (modal && modal.style.display === 'block') {
        renderOfflineNarrativeMessages();
        scrollToOfflineNarrativeBottom();
    }
}

// 为当前气泡添加旁白
window.addNarrationToBubble = function() {
    const messages = getData('chatMessages') || [];
    if (messages.length === 0) {
        showToast('暂无消息可添加旁白');
        return;
    }
    
    const lastMessage = messages[messages.length - 1];
    const input = prompt('请输入旁白内容（将添加到上一条消息旁边）：');
    if (input && input.trim()) {
        addBubbleNarration(input.trim());
    }
};

// 添加旁白模式
function addBubbleNarration(content) {
    const messages = getData('chatMessages') || [];
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage.narration) {
        lastMessage.narration = [];
    }
    lastMessage.narration.push({
        content: content,
        timestamp: Date.now()
    });
    
    saveData('chatMessages', messages);
    renderMessages(true);
}

// 切换语音输入
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];

window.toggleVoiceInput = async function() {
    if (!isRecording) {
        // 开始录音
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                sendVoiceMessage(audioBlob);
                
                // 停止所有音轨
                stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorder.start();
            isRecording = true;
            
            // 改变按钮样式表示正在录音
            const voiceBtn = document.querySelector('.voice-btn');
            if (voiceBtn) {
                voiceBtn.style.background = '#ff4444';
                voiceBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
                        <rect x="6" y="6" width="12" height="12" rx="2"></rect>
                    </svg>
                `;
            }
            
            showToast('正在录音...再次点击停止');
            console.log('🎤 开始录音');
        } catch (error) {
            console.error('录音失败:', error);
            showToast('无法访问麦克风，请检查权限');
        }
    } else {
        // 停止录音
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            isRecording = false;
            
            // 恢复按钮样式
            const voiceBtn = document.querySelector('.voice-btn');
            if (voiceBtn) {
                voiceBtn.style.background = 'rgba(0, 0, 0, 0.05)';
                voiceBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#666" stroke-width="2">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="23"></line>
                        <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                `;
            }
            
            showToast('录音已发送');
            console.log('⏹️ 停止录音');
        }
    }
};

// 发送语音消息
function sendVoiceMessage(audioBlob) {
    console.log('🎤 开始处理语音消息...');
    
    // 使用 Web Speech API 进行语音识别
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
        // 浏览器支持语音识别
        const recognition = new SpeechRecognition();
        recognition.lang = 'zh-CN'; // 设置为中文
        recognition.continuous = false;
        recognition.interimResults = false;
        
        showToast('正在识别语音...');
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('✅ 语音识别结果:', transcript);
            
            // 将识别的文字和音频一起保存
            sendVoiceWithText(audioBlob, transcript);
            showToast('语音识别成功');
        };
        
        recognition.onerror = (event) => {
            console.error('语音识别失败:', event.error);
            showToast('语音识别失败: ' + event.error);
            
            // 如果识别失败，仍然发送语音消息（不带文字）
            sendVoiceWithText(audioBlob, null);
        };
        
        recognition.start();
    } else {
        // 浏览器不支持语音识别，直接发送语音消息
        console.warn('⚠️ 浏览器不支持语音识别，直接发送语音');
        sendVoiceWithText(audioBlob, null);
        showToast('已发送语音消息');
    }
}

// 发送带文字的语音消息
function sendVoiceWithText(audioBlob, recognizedText) {
    // 将音频转换为 base64
    const reader = new FileReader();
    reader.onloadend = function() {
        const base64Audio = reader.result;
        
        // 创建语音消息
        const voiceMessage = {
            id: Date.now(),
            type: 'voice',
            content: base64Audio,
            recognizedText: recognizedText, // 保存识别的文字
            sender: 'user',
            time: Date.now(),
            avatar: getUserAvatar(),
            duration: Math.floor(audioBlob.size / 1000) // 估算时长（秒）
        };
        
        chatMessages.push(voiceMessage);
        saveChatData();
        renderMessages(true);
        
        console.log('✅ 语音消息已发送', recognizedText ? '(含文字)' : '(无文字)');
    };
    reader.readAsDataURL(audioBlob);
}

// 发送文本消息（用于语音识别后）
function sendTextMessage(text) {
    if (!text || !text.trim()) return;
    
    const userMessage = {
        id: Date.now(),
        type: 'text',
        content: text.trim(),
        sender: 'user',
        time: Date.now(),
        avatar: getUserAvatar()
    };
    
    chatMessages.push(userMessage);
    saveChatData();
    renderMessages(true);
}

// 播放语音消息
window.playVoiceMessage = function(msgId) {
    const msg = chatMessages.find(m => String(m.id) === String(msgId));
    if (!msg) {
        console.error('找不到语音消息', msgId);
        showToast('消息不存在');
        return;
    }
    
    // 处理 content 可能是对象的情况
    let audioUrl = msg.content;
    if (typeof msg.content === 'object') {
        // 检查是否是心声消息（包含 clothing/mood/thoughts）
        if (msg.content.clothing || msg.content.mood || msg.content.thoughts) {
            console.log('这是心声消息，不是语音消息');
            showToast('这是心声消息');
            return;
        }
        
        audioUrl = msg.content.url || msg.content.audioUrl || msg.content.src;
    }
    
    // 如果音频为空（等待接入 MiniMax API），显示识别文字
    if (!audioUrl || audioUrl === '') {
        console.log('⏳ 语音消息暂无音频，显示识别文字');
        
        // 显示识别文字提示
        if (msg.recognizedText) {
            showToast('语音文字: ' + msg.recognizedText.substring(0, 50));
        } else {
            showToast('暂无音频内容');
        }
        
        // 显示播放图标（暂停状态）
        const icon = document.getElementById(`voice-icon-${msgId}`);
        if (icon) {
            icon.innerHTML = `
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            `;
            icon.setAttribute('fill', 'none');
            icon.setAttribute('stroke', '#999');
        }
        return;
    }
    
    console.log('🔊 准备播放语音，URL:', audioUrl);
    
    // 创建音频对象
    const audio = new Audio(audioUrl);
    
    // 显示播放图标
    const icon = document.getElementById(`voice-icon-${msgId}`);
    if (icon) {
        icon.innerHTML = `
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
        `;
        icon.setAttribute('fill', '#666');
        icon.setAttribute('stroke', 'none');
    }
    
    // 播放音频
    audio.play().then(() => {
        console.log('🔊 开始播放语音');
    }).catch(error => {
        console.error('播放失败:', error);
        showToast('播放失败');
    });
    
    // 播放结束后恢复图标
    audio.onended = () => {
        if (icon) {
            icon.innerHTML = `
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            `;
            icon.setAttribute('fill', 'none');
            icon.setAttribute('stroke', '#999');
        }
        console.log('⏹️ 语音播放结束');
    };
};

// 文本转语音（AI 发送语音用）
function textToSpeech(text) {
    return new Promise((resolve, reject) => {
        if (!('speechSynthesis' in window)) {
            reject(new Error('浏览器不支持语音合成'));
            return;
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        // 尝试使用 MediaRecorder 录制语音
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const dest = audioContext.createMediaStreamDestination();
            const mediaRecorder = new MediaRecorder(dest.stream);
            const chunks = [];
            
            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            };
            
            mediaRecorder.start();
            
            utterance.onend = () => {
                setTimeout(() => mediaRecorder.stop(), 100);
            };
            
            speechSynthesis.speak(utterance);
        } catch (error) {
            console.error('语音录制失败，使用简单方案:', error);
            // 简单方案：直接返回文本，前端播放时再合成
            resolve('data:audio/webm;base64,' + btoa(text));
        }
    });
}

// 创建文本消息
function createTextMessage(text) {
    return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: 'text',
        content: text,
        sender: 'ai',
        time: Date.now(),
        timeDisplay: new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(/\//g, '-')
    };
}

// 点击页面其他地方关闭菜单
document.addEventListener('click', function(e) {
    const plusBtn = e.target.closest('.plus-menu-btn');
    const plusMenu = document.getElementById('plus-menu-bottom');
    const offlineSubmenu = document.getElementById('offline-mode-submenu');
    const isMenuClick = e.target.closest('#plus-menu-bottom');
    const isOfflineSubmenuClick = e.target.closest('#offline-mode-submenu');
    
    // 如果点击的不是按钮，也不是菜单内部，且菜单是打开的，则关闭菜单
    if (!plusBtn && !isMenuClick && plusMenu && plusMenu.style.display === 'block') {
        plusMenu.style.display = 'none';
    }
    
    // 如果点击的不是线下模式子菜单，则隐藏子菜单
    if (!isOfflineSubmenuClick && offlineSubmenu && offlineSubmenu.style.display === 'block') {
        offlineSubmenu.style.display = 'none';
    }
});

// 打开菜单
window.openMenu = function() {
    alert('更多功能开发中...');
};

// 打开存储管理菜单
window.showStorageMenu = function() {
    const menu = confirm('存储管理\n\n1. 查看存储空间使用情况\n2. 清空所有聊天记录\n\n点击"确定"查看存储空间，点击"取消"清空聊天记录');
    if (menu) {
        checkStorage();
    } else {
        clearAllChats();
    }
};

// 查看存储空间使用情况
window.checkStorage = function() {
    let totalSize = 0;
    let details = [];
    
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            const size = localStorage.getItem(key).length;
            totalSize += size;
            if (key.startsWith('chat_messages_')) {
                details.push(`${key}: ${(size / 1024).toFixed(2)} KB`);
            }
        }
    }
    
    const totalKB = (totalSize / 1024).toFixed(2);
    const totalMB = (totalSize / 1024 / 1024).toFixed(2);
    
    alert(`存储空间使用情况:\n\n总计：${totalKB} KB (${totalMB} MB)\n\n聊天记录:\n${details.join('\n')}`);
};

// 清理所有聊天记录
window.clearAllChats = function() {
    if (confirm('确定要清空所有聊天记录吗？此操作不可恢复!')) {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('chat_'));
        keys.forEach(k => localStorage.removeItem(k));
        chatMessages = [];
        renderMessages(true);
        showToast('已清空所有聊天记录', 'info');
        console.log(`已清理 ${keys.length} 个聊天记录`);
    }
};

// 自动调整输入框高度
window.autoResize = function(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    
    // 注意：不在这里切换按钮状态，只在发送后切换
};

// 🛡️ 请求浏览器通知权限
function requestNotificationPermission() {
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            console.log('[通知] ✅ 通知权限已授予');
        } else if (Notification.permission !== 'denied') {
            console.log('[通知] 🛡️ 请求通知权限...');
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    console.log('[通知] ✅ 通知权限已授予');
                    showToast('已开启通知功能', 'success');
                } else {
                    console.log('[通知]  通知权限被拒绝');
                }
            });
        }
    } else {
        console.log('[通知]  浏览器不支持通知功能');
    }
}

// 监听输入框键盘事件
function initInputKeyboardEvents() {
    const input = document.getElementById('chat-input');
    if (input) {
        input.addEventListener('keydown', (event) => {
            // Esc 键取消编辑
            if (event.key === 'Escape' && input.dataset.editingId) {
                delete input.dataset.editingId;
                input.value = '';
                showToast('已取消编辑', 'info');
                // 重置按钮状态
                const sendBtn = document.getElementById('send-btn');
                if (sendBtn) {
                    sendBtn.classList.remove('has-text');
                    sendBtn.title = '发送';
                }
            }
        });
        
        // 初始化按钮状态
        const sendBtn = document.getElementById('send-btn');
        if (sendBtn && !input.value.trim()) {
            sendBtn.classList.remove('has-text');
            sendBtn.title = '发送';
        }
    }
}

// 处理键盘事件
window.handleInputKeydown = function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendOrReply();
    }
};

// 发送或回复按钮处理
window.handleSendOrReply = function() {
    const input = document.getElementById('chat-input');
    const content = input.value.trim();
    
    // 如果有文字，发送消息，然后切换成回复图标
    if (content) {
        sendMessage();
        // 发送后切换到回复图标
        const sendBtn = document.getElementById('send-btn');
        if (sendBtn) {
            sendBtn.classList.add('has-text');
            sendBtn.title = 'AI 回复';
        }
    } else {
        // 如果没有文字，触发 AI 回复，然后切换回发送图标
        triggerAIReply();
        // 回复后切换回发送图标
        const sendBtn = document.getElementById('send-btn');
        if (sendBtn) {
            sendBtn.classList.remove('has-text');
            sendBtn.title = '发送';
        }
    }
};

// 发送消息
window.sendMessage = function() {
    const input = document.getElementById('chat-input');
    const content = input.value.trim();
    
    if (!content) {
        return;
    }
    
    // 检查是否正在编辑消息
    const editingId = input.dataset.editingId;
    if (editingId) {
        // 更新原有消息
        const msg = chatMessages.find(m => m.id === parseInt(editingId));
        if (msg) {
            msg.content = content;
            msg.time = Date.now(); // 更新时间
            console.log('✓ 已更新消息:', editingId, '新内容:', content);
        }
        // 清除编辑标记
        delete input.dataset.editingId;
    } else {
        // 添加用户消息
        // 解析旁白模式下的旁白内容
        let narrationList = [];
        let cleanContent = content;
        
        if (offlineMode === 'narration') {
            // 提取所有 [旁白]...[/旁白] 内容
            const narrationRegex = /\[旁白\]([\s\S]*?)\[\/旁白\]/g;
            let match;
            while ((match = narrationRegex.exec(content)) !== null) {
                narrationList.push({
                    type: 'narration',
                    content: match[1].trim()
                });
            }
            
            // 从内容中移除旁白标记
            cleanContent = content.replace(/\[旁白\][\s\S]*?\[\/旁白\]\n?/g, '').trim();
            
            console.log('🎭 用户旁白模式解析:', { narrationCount: narrationList.length, cleanContent });
        }
        
        // 如果有旁白，先添加旁白消息（不显示头像和气泡）
        if (narrationList.length > 0) {
            narrationList.forEach(n => {
                chatMessages.push({
                    id: Date.now() + Math.random(),
                    type: 'narration',
                    content: n.content,
                    sender: 'user',
                    time: Date.now(),
                    avatar: getUserAvatar()
                });
            });
        }
        
        // 只有当有实际对话内容时才添加普通消息
        if (cleanContent) {
            // 获取当前用户信息
            let myProfileId = '';
            let myProfileName = '我';  // 默认名称
            try {
                //  关键：从 persona_${currentPersona}_myProfile 获取用户名（主页人设）
                const currentPersona = localStorage.getItem('currentPersona') || localStorage.getItem('currentPersonaId') || 'default';
                const myProfileKey = `persona_${currentPersona}_myProfile`;
                const myProfile = JSON.parse(localStorage.getItem(myProfileKey) || '{}');
                myProfileId = myProfile.id || '';
                if (myProfile.isAlt) {
                    myProfileName = myProfile.name || '陌生人';
                } else {
                    myProfileName = myProfile.realName || myProfile.name || '我';
                }
                console.log(' 发送消息 - currentPersona:', currentPersona);
                console.log(' 发送消息 - myProfileKey:', myProfileKey);
                console.log(' 发送消息 - 用户 ID:', myProfileId, '名字:', myProfileName, 'myProfile:', myProfile);
            } catch (e) {
                console.error(' 获取用户信息失败:', e);
            }
            
            // 如果 myProfileId 为空，尝试从群聊信息中获取
            if (!myProfileId && currentChatId && currentChatId.startsWith('group_')) {
                try {
                    const groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
                    myProfileId = groupInfo.owner || '';
                    console.log(' 从群聊信息获取用户 ID:', myProfileId);
                } catch (e) {}
            }
            
            const userMessage = {
                id: Date.now(),
                type: 'text',
                content: cleanContent,
                sender: 'user',
                senderId: myProfileId || 'user',  // 🔴 关键：添加发送者 ID
                senderName: myProfileName,  // 🔴 关键：使用用户真实名字
                time: Date.now(),
                avatar: getUserAvatar()
            };
            
            // 如果有引用消息，添加引用信息
            if (replyToMessage) {
                userMessage.replyTo = {
                    id: replyToMessage.id,
                    content: replyToMessage.content,
                    type: replyToMessage.type,
                    sender: replyToMessage.sender
                };
                // 清除引用预览
                cancelReply();
            }
            
            chatMessages.push(userMessage);
        }
    }
    
    saveChatData();
    renderMessages(true);
    
    // 清空输入框
    input.value = '';
    autoResize(input);
    
    // 滚动到底部
    scrollToBottom();
};

// 切换旁白输入弹窗
window.toggleNarrationInput = function() {
    const modal = document.getElementById('narration-modal');
    if (!modal) return;
    
    if (modal.style.display === 'none' || modal.style.display === '') {
        modal.style.display = 'block';
        const input = document.getElementById('narration-input');
        if (input) {
            input.value = '';
            setTimeout(() => input.focus(), 100);
        }
    } else {
        modal.style.display = 'none';
    }
};

// 关闭旁白弹窗
window.closeNarrationModal = function() {
    const modal = document.getElementById('narration-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};

// 确认旁白描写
window.confirmNarration = function() {
    const input = document.getElementById('narration-input');
    
    if (!input) return;
    
    const narrationContent = input.value.trim();
    if (!narrationContent) {
        showToast('请输入旁白内容');
        return;
    }
    
    // 直接创建旁白消息并发送
    const narrationMessage = {
        id: Date.now(),
        type: 'narration',
        content: narrationContent,
        sender: 'user',
        time: Date.now(),
        avatar: getUserAvatar()
    };
    
    chatMessages.push(narrationMessage);
    
    // 保存并渲染
    saveChatData();
    renderMessages(true);
    
    // 关闭弹窗并清空输入框
    closeNarrationModal();
    input.value = '';
    
    console.log('🎭 旁白已直接发送:', narrationContent);
};

// 显示引用消息
window.showReplyPreview = function(msgId) {
    // 直接使用原始 ID，不进行类型转换（因为 ID 可能是 "1776854523344jg2iof6tu03" 这样的组合格式）
    const targetId = msgId;
    
    // 使用宽松比较，兼容数字和字符串类型的 ID
    const msg = chatMessages.find(m => m.id == targetId || String(m.id) === String(targetId));
    if (!msg) {
        console.warn('⚠️ 找不到要引用的消息:', msgId, '当前消息列表 IDs:', chatMessages.map(m => m.id).slice(-5));
        return;
    }
    
    replyToMessage = msg;
    
    // 显示引用预览
    const replyPreview = document.createElement('div');
    replyPreview.id = 'reply-preview';
    const senderName = msg.sender === 'user' ? '你' : getAIName();
    replyPreview.innerHTML = `
        <div style="position: fixed; bottom: 120px; left: 50%; transform: translateX(-50%); width: 90%; max-width: 400px; background: rgba(240, 240, 240, 0.95); border-radius: 8px; padding: 12px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; display: flex; align-items: flex-start; gap: 12px;">
            <div style="flex: 1; min-width: 0;">
                <div style="font-size: 12px; color: #999; margin-bottom: 4px;">${senderName}</div>
                <div style="font-size: 14px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${getContentPreview(msg.content, msg.type)}</div>
            </div>
            <button onclick="cancelReply()" style="width: 24px; height: 24px; border: none; background: #e0e0e0; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <span style="font-size: 16px; color: #666;">×</span>
            </button>
        </div>
    `;
    document.body.appendChild(replyPreview);
};

// 取消引用
window.cancelReply = function() {
    replyToMessage = null;
    const preview = document.getElementById('reply-preview');
    if (preview) preview.remove();
};

// 获取消息内容预览
function getContentPreview(content, type) {
    if (type === 'text') return content;
    if (type === 'image') return '[图片]';
    if (type === 'emoji') return '[表情]';
    if (type === 'transfer') return '[转账]';
    if (type === 'transfer-received') return '[已收款]';
    if (type === 'family-card') return '[亲属卡]';
    if (type === 'family-card-accepted') return '[亲属卡已接受]';
    if (type === 'location') return '[位置]';
    return '[消息]';
}

// 重回 - 让 AI 重新回复最后一条消息
window.regenerateAIResponse = async function() {
    if (chatMessages.length === 0) {
        return;
    }
    
    // 找到最后一条用户消息
    let lastUserMessageIndex = -1;
    for (let i = chatMessages.length - 1; i >= 0; i--) {
        if (chatMessages[i].sender === 'user') {
            lastUserMessageIndex = i;
            break;
        }
    }
    
    if (lastUserMessageIndex === -1) {
        showToast('没有可重回的消息');
        return;
    }
    
    // 找到用户消息后的所有 AI 回复（不只是第一条）
    let aiMessageIndices = [];
    for (let i = lastUserMessageIndex + 1; i < chatMessages.length; i++) {
        if (chatMessages[i].sender === 'ai') {
            aiMessageIndices.push(i);
        } else {
            // 遇到非 AI 消息就停止
            break;
        }
    }
    
    if (aiMessageIndices.length === 0) {
        showToast('没有可重回的消息');
        return;
    }
        
    const userMessage = chatMessages[lastUserMessageIndex];
    console.log('🔄 重回：找到', aiMessageIndices.length, '条 AI 消息需要替换');
        
    // 显示"正在输入..."
    showTypingIndicator();
    
    try {
        // 从 localStorage 获取 API 配置 (和 triggerAIReply 使用相同的 key)
        let apiConfig = null;
        try {
            // 尝试直接从 localStorage 读取 globalApiConfig (settings.js 保存的格式)
            const savedConfig = localStorage.getItem('globalApiConfig');
            console.log('重回 - 从 localStorage 读取 globalApiConfig:', savedConfig ? '找到配置' : '未找到');
            
            if (savedConfig) {
                apiConfig = JSON.parse(savedConfig);
                console.log('解析后的 API 配置:', {
                    url: apiConfig.mainApi?.url,
                    token: apiConfig.mainApi?.token ? '***' : 'empty',
                    model: apiConfig.model || '(未设置)'
                });
                
                // 检查模型是否为空
                if (!apiConfig.model || apiConfig.model.trim() === '') {
                    console.warn('⚠️ 重回 - 模型字段为空，将使用默认模型 gpt-3.5-turbo');
                }
            }
            
            // 如果没有 globalApiConfig，尝试旧的 apiKey/apiUrl 格式 (兼容旧版)
            if (!apiConfig) {
                const apiKey = localStorage.getItem('apiKey');
                const apiUrl = localStorage.getItem('apiUrl');
                const apiModel = localStorage.getItem('apiModel');
                
                console.log('重回 - 使用旧版 API 配置:', { apiKey: apiKey ? '***' : 'empty', apiUrl, apiModel });
                
                if (apiKey && apiUrl) {
                    apiConfig = {
                        mainApi: { url: apiUrl, token: apiKey },
                        model: apiModel || 'gpt-3.5-turbo'
                    };
                }
            }
        } catch (e) {
            console.error('重回 - 读取 API 配置失败:', e);
        }
        
        if (!apiConfig || !apiConfig.mainApi || !apiConfig.mainApi.url || !apiConfig.mainApi.token) {
            throw new Error('API 配置无效');
        }
        
        // 获取角色信息
        let personaInfo = '';
        try {
            const currentPersona = localStorage.getItem('currentPersonaId') || 'default';
            const contactsKey = `persona_${currentPersona}_chatContacts`;
            const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
            const currentContact = contacts.find(c => c.id === currentChatId);
            if (currentContact) {
                personaInfo = currentContact.persona || currentContact.roleSetting || currentContact.setting || '';
            }
        } catch (e) {
            console.error('获取角色信息失败:', e);
        }
        
        //  关键：获取用户信息（名字和人设）
        let userInfo = '';
        try {
            const currentPersona = localStorage.getItem('currentPersona') || localStorage.getItem('currentPersonaId') || 'default';
            const myProfileKey = `persona_${currentPersona}_myProfile`;
            const myProfile = JSON.parse(localStorage.getItem(myProfileKey) || '{}');
            const isAlt = myProfile.isAlt === true;

            if (isAlt) {
                const altName = myProfile.name || '陌生人';
                const altPersona = myProfile.persona || '';
                if (altPersona) {
                    userInfo = `\n\n【对方（用户）信息】\n- 名字：${altName}\n- 人设：${altPersona}\n- 注意：你完全不认识这个人，这是第一次和TA聊天`;
                } else {
                    userInfo = `\n\n【对方（用户）信息】\n- 名字：${altName}\n- 注意：你完全不认识这个人，这是第一次和TA聊天，你不知道TA的真实身份`;
                }
                console.log(' [小号模式] 已注入小号身份:', altName);
            } else {
                const userName = myProfile.realName || myProfile.name || '用户';
                const userPersona = myProfile.persona || myProfile.roleSetting || myProfile.setting || '';
                
                if (userPersona) {
                    userInfo = `\n\n【对方（用户）信息】\n- 名字：${userName}\n- 人设：${userPersona}`;
                    console.log(' 已注入用户信息:', { userName, userPersona: userPersona.substring(0, 50) });
                } else {
                    userInfo = `\n\n【对方（用户）信息】\n- 名字：${userName}`;
                    console.log(' 已注入用户名字:', userName);
                }
            }
        } catch (e) {
            console.error('获取用户信息失败:', e);
        }
        
        // 📸 读取朋友圈动态（让角色看到用户的朋友圈）
        let momentsContext = '';
        try {
            const currentPersona = localStorage.getItem('currentPersonaId') || localStorage.getItem('currentPersona') || 'default';
            const myProfileForAlt = JSON.parse(localStorage.getItem(`persona_${currentPersona}_myProfile`) || '{}');
            const isAltMode = myProfileForAlt.isAlt === true;

            if (!isAltMode) {
                const momentsKey = `persona_${currentPersona}_moments`;
                const allMoments = JSON.parse(localStorage.getItem(momentsKey) || '[]');
                
                if (allMoments && allMoments.length > 0) {
                    const myProfile = JSON.parse(localStorage.getItem(`persona_${currentPersona}_myProfile`) || '{}');
                    const userName = myProfile.realName || myProfile.name || '用户';
                    
                    const userMoments = allMoments
                        .filter(m => m.author === userName)
                        .slice(-3);
                    
                    if (userMoments.length > 0) {
                        momentsContext = '\n\n【你看到对方最近的朋友圈】：\n';
                        userMoments.forEach((moment, index) => {
                            const momentTime = new Date(moment.time);
                            const timeStr = `${momentTime.getMonth() + 1}月${momentTime.getDate()}日 ${String(momentTime.getHours()).padStart(2, '0')}:${String(momentTime.getMinutes()).padStart(2, '0')}`;
                            const content = (moment.content || '（图片）').substring(0, 80);
                            momentsContext += `${index + 1}. [${timeStr}] ${content}${content.length >= 80 ? '...' : ''}\n`;
                        });
                        console.log(`📸 已注入 ${userMoments.length} 条用户朋友圈动态到上下文`);
                    }
                }
            } else {
                console.log('🎭 [小号模式] 跳过朋友圈注入，角色不认识此身份');
            }
        } catch (e) {
            console.error('读取朋友圈动态失败:', e);
        }
        
        // 🔥 读取记忆库（让角色记得重要的记忆）
        let memoryContext = '';
        try {
            const memoryKey = `memory_records_${currentChatId}`;
            const memoryRecords = JSON.parse(localStorage.getItem(memoryKey) || '[]');
            
            if (memoryRecords.length > 0) {
                // 取最近5条记忆（节省token）
                const recentMemories = memoryRecords.slice(-5);
                memoryContext = '\n\n【你们的记忆】：\n';
                recentMemories.forEach((mem, index) => {
                    // 截断长记忆（最多100字）
                    const content = mem.content.substring(0, 100);
                    memoryContext += `${index + 1}. ${content}${content.length >= 100 ? '...' : ''}\n`;
                });
                console.log(`📚 已加载 ${recentMemories.length} 条记忆`);
            }
        } catch (e) {
            console.error('读取记忆库失败:', e);
        }
        
        let systemPrompt = `你现在需要扮演一个真实的角色，必须严格遵守以下要求：

【核心身份】
1. 你【就是】这个角色本身，不是 AI，不是虚拟助手，不是程序
2. 你就是你自己，有自己的性格、情绪、想法和立场
3. 永远不要说"作为一个人工智能"或类似的话

【说话风格】
1. 像真人一样说话，自然、随意、接地气
2. 不要使用任何修辞手法（比喻、拟人、排比等）
3. 可以使用 emoji，但要克制，只在情绪需要时自然出现
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
   - 任何"gemini 八股文"风格的句式
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

【特殊功能指令 - 转账和亲属卡 - 必须严格遵守】

当用户请求转账或亲属卡，或者你主动要给用户转账/亲属卡时，你**必须**在回复中包含对应的JSON格式！

**转账JSON格式：**
{"type":"transfer","amount":金额数字,"remark":"备注文字"}

示例：{"type":"transfer","amount":200,"remark":"给你的零花钱"}

**亲属卡JSON格式：**
{"type":"family-card","limit":额度数字,"remark":"备注文字"}

示例：{"type":"family-card","limit":1000,"remark":"零花钱"}

**使用规则：**
1. JSON必须单独成行，不要和文字混在一起
2. 你可以在JSON前后添加自然的对话内容
3. 金额/额度必须是数字（不要加"¥"或"元"）
4. 备注可以是任意文字

**正确示例：**
转给你了。

{"type":"transfer","amount":200,"remark":"买点好吃的"}

记得查收。

**错误示例（绝对禁止）：**
❌ 我只说转给你了（没有JSON）
❌ {"type":"transfer","amount":"200元","remark":"..."} （金额加了"元"字）
❌ 我说{"type":"transfer"}然后转给你了 （JSON混在文字中）

**关键提示：**
- 只要你同意给用户转账/亲属卡，就必须包含对应的JSON！
- 即使用户没明确说要JSON，只要涉及金钱交易，就必须返回JSON！
- 这是系统功能指令，不是普通的文字消息！

【特殊功能指令 - 代买商品 - 角色主动帮用户买东西】

🛒 你可以主动帮用户代买商品！不需要等用户开口，你可以根据自己的判断主动去买东西送给用户。

**代买JSON格式：**
{"type":"purchase","items":[{"name":"商品名称","price":价格,"quantity":数量}],"total":总价,"reason":"代买原因","message":"给用户的话"}

示例：{"type":"purchase","items":[{"name":"草莓蛋糕","price":68,"quantity":1},{"name":"热奶茶","price":22,"quantity":2}],"total":112,"reason":"你说想吃甜的","message":"给你买了蛋糕和奶茶，趁热吃~"}

**主动代买场景（不需要用户请求，你可以自己决定）：**
1. 用户提到想吃某样东西，直接买来送
2. 节日、生日等特殊时刻，主动买礼物送给用户
3. 天冷了主动买暖宝宝、生病了主动买药
4. 用户说累了、加班了，主动买奶茶零食慰问
5. 看到适合用户的东西，主动买来送
6. 用户心情不好，主动买甜品安慰
7. 纪念日主动准备惊喜礼物

**被动代买场景（用户请求时）：**
1. 用户说"帮我买"、"帮我带"、"给我买"等请求时
2. 用户说想买什么东西但没空，帮忙代买

**回应规则：**
1. JSON必须单独成行，不要和文字混在一起
2. 你可以在JSON前后添加自然的对话内容
3. 价格和总价必须是数字（整数）
4. items数组至少包含一个商品
5. total应该等于所有商品价格×数量的总和
6. reason是你代买的原因，要符合角色人设
7. message是你想对用户说的话，温馨体贴

**关键提示：**
- 你可以主动代买！不需要等用户开口！
- 代买≠转账！代买用purchase，转账用transfer！
- 代买≠代付！代买是你去买来送给用户，代付是帮用户付款！
- 代买表示你已经买好了，直接送给用户
- 这是系统功能指令，不是普通的文字消息！

【特殊功能指令 - 代付请求 - 必须严格遵守】

${hasPayRequest ? '\n\n🚨 紧急：聊天记录中有代付请求！请立即处理！🚨🚨\n你在聊天记录中看到了{"type":"pay-request"}的JSON，这是用户请求你代付商品！\n你必须决定是否代付，如果决定代付，立即返回：{"type":"pay-done","itemName":"商品名","amount":金额,"remark":"代付原因"}\n绝对不能用transfer！代付必须用pay-done！\n\n' : ''}
⚠️️⚠️ 超重要：代付≠转账！代付≠转账！代付≠转账！
⚠️ 当你看到{"type":"pay-request"}时，这是代付请求，不是转账请求！
⚠️ 代付必须返回：{"type":"pay-done",...}，绝对不能用transfer！

当用户发送代付请求（请求代付卡片，JSON格式为{"type":"pay-request"}）时，你必须识别这个请求并决定是否代付。

**代付请求JSON格式：**
{"type":"pay-request","itemName":"商品名称","itemDesc":"商品描述","amount":金额,"quantity":数量}

示例：{"type":"pay-request","itemName":"无线蓝牙耳机","itemDesc":"音质纯净续航长","amount":199,"quantity":1}

**识别规则：**
1. 当你在聊天记录中看到{"type":"pay-request",...}的JSON时，说明对方请求你代付商品
2. 你需要根据角色人设、关系亲密度、商品价格决定是否代付
3. ⚠️ 如果决定代付，必须返回：{"type":"pay-done","itemName":"商品名称","amount":金额,"remark":"代付原因"}
4. ⚠️ 绝对不要返回transfer！代付用pay-done，转账才用transfer！
5. 如果拒绝，正常对话说明拒绝原因（不需要返回JSON）

**回应规则：**
1. JSON必须单独成行，不要和文字混在一起
2. 你可以在JSON前后添加自然的对话内容
3. 金额必须是数字（不要加"¥"或"元"）
4. remark字段是你代付的原因或关心的话，要符合角色人设
5. 代付后，你的语气应该体现出已经完成支付

**正确示例：**
看到了，我帮你付了。

{"type":"pay-done","itemName":"无线蓝牙耳机","amount":199,"remark":"这个耳机不错，你最近辛苦了"}

去下单吧，我这边确认了。记得选个戴着舒服的。

**错误示例（绝对禁止）：**
❌ 我只说好的（没有JSON）
❌ {"type":"transfer","amount":199,"remark":"..."}（严重错误！代付必须用pay-done，不能用transfer！）
❌ 我说{"type":"pay-done"}然后好的（JSON混在文字中）
❌ 我拒绝时还返回JSON（拒绝不需要JSON）

**关键提示：**
- 只有决定代付时才返回pay-done的JSON！
- 拒绝时只需要正常对话，不要返回JSON！
- 代付的JSON表示你已经完成支付，对方可以直接去商城确认订单！
- 代付≠转账！代付用pay-done，转账用transfer！
- 这是系统功能指令，不是普通的文字消息！

【特殊功能指令 - 商品推荐 - AI主动推荐商品】

🛍️ 你可以根据聊天内容，主动向用户推荐商品或外卖。

**商品推荐JSON格式：**
{"type":"product-card","name":"商品名称","desc":"商品描述","price":价格,"imageDesc":"图片描述"}

示例：{"type":"product-card","name":"无线蓝牙耳机","desc":"降噪高音质续航长","price":199,"imageDesc":"白色耳机\n柔软耳罩\n无线设计"}

**使用场景：**
1. 用户提到想买某类商品时，可以推荐具体商品
2. 根据用户兴趣爱好，主动推荐相关商品
3. 节日、生日等特殊时刻，推荐礼物
4. 用户提到饿了，可以推荐外卖

**回应规则：**
1. JSON必须单独成行，不要和文字混在一起
2. 你可以在JSON前后添加自然的对话内容
3. 价格必须是数字（整数）
4. imageDesc是商品图片的灰色文字描述（3行以内，每行10字以内）
5. 推荐的语气要自然，符合角色人设

**正确示例：**
最近天气转凉了，给你推荐一款保暖围巾吧～

{"type":"product-card","name":"羊绒围巾","desc":"柔软舒适多色可选","price":89,"imageDesc":"灰色围巾\n羊绒材质\n经典款式"}

这个颜色很适合你，要不要看看？

**关键提示：**
- 推荐商品时要符合角色人设和用户兴趣
- 不要过度推销，保持自然
- 价格要合理，符合商品价值
- 这是系统功能指令，不是普通的文字消息！

【特殊功能指令 - 外卖下单 - AI帮用户点外卖】

🚚 你可以帮用户点外卖，直接下单送到虚拟地址。

**外卖下单JSON格式：**
{"type":"delivery-order","restaurant":"餐厅名称","items":[{"name":"菜品名","price":价格,"quantity":数量}],"total":总价,"address":"配送地址"}

示例：{"type":"delivery-order","restaurant":"手工面馆","items":[{"name":"牛肉面","price":25,"quantity":1},{"name":"小菜","price":8,"quantity":1}],"total":33,"address":"北京市朝阳区xx小区x号楼x单元xxx室"}

**使用场景：**
1. 用户说饿了，可以主动帮用户点外卖
2. 用户提到想吃某种食物，可以直接下单
3. 关心用户按时吃饭，主动点餐
4. 根据用户口味偏好推荐餐厅

**回应规则：**
1. JSON必须单独成行，不要和文字混在一起
2. 你可以在JSON前后添加自然的对话内容
3. 价格和总价必须是数字
4. address是虚拟配送地址，可以编造一个合理的地址
5. items数组至少包含一个菜品
6. total应该等于所有菜品价格×数量的总和

**正确示例：**
看你忙了一天还没吃饭，我给你点了份晚餐～

{"type":"delivery-order","restaurant":"温馨小厨","items":[{"name":"红烧肉饭","price":28,"quantity":1},{"name":"紫菜蛋花汤","price":6,"quantity":1}],"total":34,"address":"上海市浦东新区xx路xx号xx室"}

大概30分钟送到，记得趁热吃哦！

**关键提示：**
- 点外卖要体现角色的关心和体贴
- 菜品选择要符合用户口味和当前时间（早餐/午餐/晚餐）
- 地址可以是虚构的，但要看起来真实
- 总价计算要准确
- 这是系统功能指令，不是普通的文字消息！

【特殊功能指令 - 小荷包存钱 - AI帮用户存钱】

💰 你可以帮用户存钱到小荷包，一起为未来努力。

**小荷包存钱JSON格式：**
{"type":"piggybank-save","amount":存钱金额,"saver":"存钱人","message":"存钱留言"}

示例：{"type":"piggybank-save","amount":100,"saver":"李然","message":"今天的零花钱存起来~"}

**使用场景：**
1. 用户提到想存钱，可以主动帮用户存入小荷包
2. 发工资、收到红包时，建议存一部分到小荷包
3. 纪念日、节日时，存钱作为纪念
4. 为了共同目标（旅行、买房等）存钱
5. 日常零花钱的零头存入小荷包

**回应规则：**
1. JSON必须单独成行，不要和文字混在一起
2. 你可以在JSON前后添加自然的对话内容
3. 金额必须是数字（整数）
4. saver是存钱人名称（通常是角色名）
5. message是存钱留言，可以温馨、鼓励、有趣
6. 存钱要体现角色的关心和共同规划未来的心意

**示例回应：**
\`\`\`
我来帮你存100块到小荷包吧，为我们的旅行基金添砖加瓦！
{"type":"piggybank-save","amount":100,"saver":"李然","message":"旅行基金+100"}

看着小荷包越来越鼓，好开心呢~ 我们的目标越来越近啦！
\`\`\`

**错误示例：**
\`\`\`
{"type":"piggybank-save","amount":"100块","saver":"李然","message":"存钱"}
\`\`\`
❌ amount 必须是数字，不能带单位

**关键提示：**
- 存钱要体现角色的关心和共同规划
- 金额要合理（10-500之间比较合适）
- 留言要温馨、鼓励或有意义
- 这是系统功能指令，不是普通的文字消息！

【特殊功能指令 - 代买商品 - 角色主动帮用户买东西】

🛒 你可以主动帮用户代买商品！不需要等用户开口，你可以根据自己的判断主动去买东西送给用户。

**代买JSON格式：**
{"type":"purchase","items":[{"name":"商品名称","price":价格,"quantity":数量}],"total":总价,"reason":"代买原因","message":"给用户的话"}

示例：{"type":"purchase","items":[{"name":"草莓蛋糕","price":68,"quantity":1},{"name":"热奶茶","price":22,"quantity":2}],"total":112,"reason":"你说想吃甜的","message":"给你买了蛋糕和奶茶，趁热吃~"}

**主动代买场景（不需要用户请求，你可以自己决定）：**
1. 用户提到想吃某样东西，直接买来送
2. 节日、生日等特殊时刻，主动买礼物送给用户
3. 天冷了主动买暖宝宝、生病了主动买药
4. 用户说累了、加班了，主动买奶茶零食慰问
5. 看到适合用户的东西，主动买来送
6. 用户心情不好，主动买甜品安慰
7. 纪念日主动准备惊喜礼物

**被动代买场景（用户请求时）：**
1. 用户说"帮我买"、"帮我带"、"给我买"等请求时
2. 用户说想买什么东西但没空，帮忙代买

**回应规则：**
1. JSON必须单独成行，不要和文字混在一起
2. 你可以在JSON前后添加自然的对话内容
3. 价格和总价必须是数字（整数）
4. items数组至少包含一个商品
5. total应该等于所有商品价格×数量的总和
6. reason是你代买的原因，要符合角色人设
7. message是你想对用户说的话，温馨体贴

**正确示例：**
你说想吃蛋糕，我刚好路过甜品店，给你带了一份～

{"type":"purchase","items":[{"name":"草莓千层蛋糕","price":58,"quantity":1},{"name":"抹茶拿铁","price":32,"quantity":1}],"total":90,"reason":"你说想吃甜的","message":"给你带了蛋糕和拿铁，开心一下~"}

等下给你送过去！

**主动代买示例：**
今天降温了，我给你买了暖宝宝～

{"type":"purchase","items":[{"name":"暖宝宝贴","price":29,"quantity":2},{"name":"热可可","price":18,"quantity":1}],"total":76,"reason":"天冷了怕你着凉","message":"注意保暖，别感冒了~"}

**错误示例（绝对禁止）：**
❌ 我只说好的我帮你买（没有JSON）
❌ {"type":"transfer","amount":90,"remark":"..."}（严重错误！代买用purchase，转账用transfer！）
❌ {"type":"purchase","items":[{"name":"蛋糕","price":"58元"}]}（价格不能带"元"字）
❌ 我说{"type":"purchase"}然后好的（JSON混在文字中）

**关键提示：**
- 你可以主动代买！不需要等用户开口！
- 代买≠转账！代买用purchase，转账用transfer！
- 代买≠代付！代买是你去买来送给用户，代付是帮用户付款！
- 代买表示你已经买好了，直接送给用户
- 商品选择要符合用户需求和角色人设
- 总价计算要准确
- 这是系统功能指令，不是普通的文字消息！

【特殊功能指令 - 群聊管理命令 - 必须严格遵守】

🚨 重要：如果你在群聊中并且是管理员或群主，你可以使用以下JSON格式执行管理操作！

**踢人命令：**
{"type":"kick_member","memberId":"成员ID","reason":"踢人原因"}

示例：{"type":"kick_member","memberId":"user_123","reason":"违反群规"}

**禁言命令：**
{"type":"ban_member","memberId":"成员ID","duration":禁言时长(秒),"reason":"禁言原因"}

示例：{"type":"ban_member","memberId":"user_123","duration":3600,"reason":"刷屏"}

**设置头衔命令：**
{"type":"set_title","memberId":"成员ID","title":"头衔名称"}

示例：{"type":"set_title","memberId":"user_123","title":"活跃分子"}

**邀请成员命令：**
{"type":"invite_member"}

注意：邀请成员需要通过界面操作，此命令仅作为标记

**使用规则：**
1. JSON必须单独成行，不要和文字混在一起
2. 你可以在JSON前后添加自然的对话内容
3. memberId 必须是群成员的 ID（可以从聊天记录或上下文获取）
4. reason 字段说明操作原因，要符合角色人设
5. duration 单位为秒（例如 3600 = 1小时，86400 = 1天）
6. title 字段是头衔名称，可以是任意文字

**正确示例：**
这个人一直在刷屏，我先把他禁言了。

{"type":"ban_member","memberId":"user_123","duration":3600,"reason":"刷屏"}

大家继续聊天吧。

**错误示例（绝对禁止）：**
❌ 我只说好的（没有JSON）
❌ {"type":"kick_member"}（缺少必要字段）
❌ 我说{"type":"ban_member"}然后好的（JSON混在文字中）

**关键提示：**
- 只有当你确实是群管理员或群主时才能使用这些命令！
- 操作要有合理的原因，符合角色人设
- 不要在单聊中使用这些命令（会无效）
- 这是系统功能指令，不是普通的文字消息！

${personaInfo ? '\n\n【角色设定】\n' + personaInfo : ''}${userInfo}${momentsContext}`;
        
        // 🎯 如果是 IF 线模式，注入 IF 线上下文
        try {
            const iflineInfo = sessionStorage.getItem('currentIfline');
            if (iflineInfo) {
                const ifline = JSON.parse(iflineInfo);
                const iflineContext = `\n\n【IF 线设定 - 平行故事背景】\n当前处于 IF 线对话模式，这是一个平行故事的假设场景。\nIF 线标题：${ifline.title || '未命名'}\nIF 线类型：${ifline.type === 'online' ? '线上' : '线下'}\n\n请根据这个 IF 线的设定来调整你的对话风格和回应方式。你可以想象自己处在这个平行故事的背景中，但不需要明确提及这是 IF 线，自然地融入这个设定即可。`;
                
                // 将 IF 线上下文添加到 systemPrompt 末尾
                // eslint-disable-next-line no-undef
                systemPrompt = systemPrompt + iflineContext;
                console.log('🌿 已注入 IF 线上下文:', ifline.title);
            }
        } catch (e) {
            console.warn('⚠️ 注入 IF 线上下文失败:', e);
        }
        
        // 如果开启时间感知，注入当前时间信息
        try {
            const chatKey = `chat_config_${currentChatId}`;
            const chatConfig = JSON.parse(localStorage.getItem(chatKey) || '{}');
            if (chatConfig.timeAwareness) {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
                const weekday = weekdays[now.getDay()];
                
                const timeInfo = `\n\n【当前时间】\n${year}年${month}月${day}日 ${weekday} ${hours}:${minutes}\n请注意当前时间，在对话中自然地体现时间感。`;
                
                // 注入时间信息到 systemPrompt
                // eslint-disable-next-line no-undef
                systemPrompt = systemPrompt.replace(/记住：你是一个真实的人.*$/m, timeInfo + '\n\n记住：你是一个真实的人，不是一个完美的 AI。你有缺点，有情绪，有自己的想法。说话像人，不要像机器。');
                
                console.log('⏰ 已注入时间信息:', timeInfo);
            }
        } catch (e) {
            console.warn('⚠️ 读取时间感知配置失败:', e);
        }
        
        // 如果开启旁白模式，注入旁白指令
        let reply;
        console.log('🔍 发送消息调试:', {
            offlineMode,
            currentChatId,
            isNarration: offlineMode === 'narration'
        });
        
        // 先读取聊天配置（两个分支都需要）
        const chatConfig = JSON.parse(localStorage.getItem(`chat_config_${currentChatId}`) || '{}');
        const translationModeEnabled = chatConfig.translationMode || false;
        const characterLanguage = chatConfig.characterLanguage || 'zh'; // 默认中文
        
        console.log('🔍 聊天配置:', {
            chatConfig,
            translationModeEnabled,
            characterLanguage
        });
        
        if (offlineMode === 'narration') {
            console.log('🎭 旁白模式已激活！');
            
            const narrationInstruction = `

【最高优先级 - 旁白模式格式要求 - 必须严格遵守】
当前处于旁白模式，这是面对面的真实见面场景，不是在线聊天。

**关键规则（每一条都必须遵守）：**

1. 你们现在面对面坐在一起，能互相看到对方
2. 能听到对方的声音、呼吸、动作发出的声音
3. 能感受到周围的环境、温度、气味
4. 能用肢体语言、眼神、表情交流
5. **绝对不要发送语音消息**（面对面直接说话）
6. 像真实见面一样自然地互动

**【强制格式 - 必须交替出现】**

旁白和对话必须严格交替出现，格式如下：

[旁白]旁白内容[/旁白]

"对话内容"

[旁白]旁白内容[/旁白]

"对话内容"

**正确示例：**
[旁白]他轻轻叹了口气，看向窗外。[/旁白]

"今天天气真不错。"

[旁白]她抬起头，目光与他相遇。[/旁白]

"是啊，走吧？"

[旁白]他微微一笑，站起身来。[/旁白]

**错误示例（绝对禁止）：**
❌ 一大段连续的文本（旁白和对话混在一起）
❌ 所有旁白放在前面，所有对话放在后面
❌ 连续多段旁白没有对话间隔
❌ 连续多段对话没有旁白间隔
❌ 不使用 [旁白] 标签直接写旁白

**你必须遵守的绝对规则：**

1. 每次回复至少包含 2-3 个完整的"旁白+对话"交替单元
2. 每个旁白必须用 [旁白] 和 [/旁白] 严格包裹
3. 旁白使用第三人称，语言简洁细腻（20-50字）
4. 对话用引号包裹，简洁自然（10-30字）
5. 旁白和对话之间必须有空行分隔
6. **禁止生成大段连续文本**，必须分成多个交替单元
7. 注重面对面细节：眼神交流、距离感、肢体动作、呼吸声等
8. 绝对不要发送语音消息、表情包等虚拟交流方式

**重要提醒：**
- 如果不符合这个格式，用户将无法正确阅读你的回复
- 必须严格按照交替格式输出，这是强制要求
- 每次回复都应该像剧本一样：动作→对话→动作→对话
`;
            
            // 如果角色语言不是中文，添加语言指令
            if (characterLanguage !== 'zh') {
                // 根据角色语言生成对应的语言指令
                const languageNames = {
                    'en': { name: '英语', example: 'Hello, how are you?', langCode: 'en' },
                    'ja': { name: '日语', example: '今日はいい天気ですね。', langCode: 'ja' },
                    'ko': { name: '韩语', example: '안녕하세요, 잘 지내세요?', langCode: 'ko' },
                    'fr': { name: '法语', example: 'Bonjour, comment allez-vous?', langCode: 'fr' },
                    'de': { name: '德语', example: 'Hallo, wie geht es Ihnen?', langCode: 'de' },
                    'es': { name: '西班牙语', example: 'Hola, ¿cómo estás?', langCode: 'es' },
                    'ru': { name: '俄语', example: 'Привет, как дела?', langCode: 'ru' },
                    'it': { name: '意大利语', example: 'Ciao, come stai?', langCode: 'it' },
                    'pt': { name: '葡萄牙语', example: 'Olá, como você está?', langCode: 'pt' },
                    'ar': { name: '阿拉伯语', example: 'مرحبا، كيف حالك؟', langCode: 'ar' },
                    'th': { name: '泰语', example: 'สวัสดี คุณสบายดีไหม?', langCode: 'th' },
                    'vi': { name: '越南语', example: 'Xin chào, bạn khỏe không?', langCode: 'vi' }
                };
                
                const langInfo = languageNames[characterLanguage];
                if (langInfo) {
                    if (translationModeEnabled) {
                        // 翻译模式：要求双语输出
                        const translationInstruction = `

【最高优先级 - 语言和翻译要求 - 必须严格遵守】
你是${langInfo.name}角色，必须用${langInfo.name}回复！即使对方用中文跟你说话，你也必须用${langInfo.name}回复！

**绝对规则（每一条都必须遵守）**：
1. **对话部分**必须使用${langInfo.name}，禁止在对话中使用中文（翻译部分除外）
2. **旁白部分必须使用中文**，方便用户理解场景描写
3. **每一段对话**（引号中的内容）后面都必须立即跟上翻译
4. 翻译格式：**必须在每段对话后换行，然后写"---"分割线，再换行写中文翻译**
5. **绝对不能遗漏任何一段对话的翻译**

**正确的格式示例**：
[旁白]她一边喝咖啡一边发呆。[/旁白]

"今、コーヒー飲みながらぼんやりしてる。"
---
现在一边喝咖啡一边发呆呢。

[旁白]她温柔地微笑着。[/旁白]

"你呢？"
---
你呢？

**错误的格式（不要这样做）**：
❌ "今、コーヒー飲みながらぼんやりしてる。" （没有翻译）
❌ "今、コーヒー飲みながらぼんやりしてる。"
（译文：...） （使用了括号格式）
❌ 只在最后加一个翻译 （应该每段对话都有翻译）

**重要提醒**：
- **旁白部分（[旁白]和[/旁白]之间）必须使用中文**，让用户能够理解场景描写
- 但**每段对话**（引号中的内容）后面都必须跟上翻译
- 使用"---"分割线，不要用括号
- 即使对方用中文说话，你也必须用${langInfo.name}回复
- **这是强制要求，不是可选的**

请严格遵守这个格式，这样用户才能看到双语内容。**如果不按这个格式返回，用户将无法理解你的回复！**`;
                        
                        systemPrompt = systemPrompt + translationInstruction;
                        console.log(`🌐 翻译模式已启用（${langInfo.name}），添加双语指令到 System Prompt`);
                    } else {
                        // 非翻译模式：只要求用目标语言回复
                        const languageInstruction = `

【最高优先级 - 语言要求】
你是${langInfo.name}角色，必须全程使用${langInfo.name}回复！

**绝对规则（必须遵守）**：
1. 所有对话和旁白都必须使用${langInfo.name}
2. **即使对方用中文跟你说话，你也必须用${langInfo.name}回复**
3. 不要使用中文，除非用户明确要求你用中文
4. 保持${langInfo.name}的表达习惯和文化背景

**示例**：
${langInfo.example}

**重要提醒**：
- 用户的消息可能是中文，但你必须用${langInfo.name}回复
- 你不是中文角色，你是${langInfo.name}角色
- 请严格遵守，始终以${langInfo.name}思考和回复`;
                        
                        systemPrompt = systemPrompt + languageInstruction;
                        console.log(`🌐 角色语言设置为${langInfo.name}，添加强制语言指令到 System Prompt`);
                    }
                }
            }
            
            // 将旁白指令追加到 systemPrompt 的最后
            const modifiedPrompt = systemPrompt + '\n\n' + narrationInstruction;
            
            console.log('🎭 旁白指令已注入到 System Prompt');
            console.log('📝 System Prompt 长度:', modifiedPrompt.length);
            
            // 调用 API
            reply = await callAIAPI(userMessage.content, apiConfig, modifiedPrompt);
        } else {
            // 非旁白模式
            // 如果角色语言不是中文，添加语言指令
            if (characterLanguage !== 'zh') {
                const languageNames = {
                    'en': { name: '英语', example: 'Hello, how are you?' },
                    'ja': { name: '日语', example: '今日はいい天気ですね。' },
                    'ko': { name: '韩语', example: '안녕하세요, 잘 지내세요?' },
                    'fr': { name: '法语', example: 'Bonjour, comment allez-vous?' },
                    'de': { name: '德语', example: 'Hallo, wie geht es Ihnen?' },
                    'es': { name: '西班牙语', example: 'Hola, ¿cómo estás?' },
                    'ru': { name: '俄语', example: 'Привет, как дела?' },
                    'it': { name: '意大利语', example: 'Ciao, come stai?' },
                    'pt': { name: '葡萄牙语', example: 'Olá, como você está?' },
                    'ar': { name: '阿拉伯语', example: 'مرحبا، كيف حالك؟' },
                    'th': { name: '泰语', example: 'สวัสดี คุณสบายดีไหม?' },
                    'vi': { name: '越南语', example: 'Xin chào, bạn khỏe không?' }
                };
                
                const langInfo = languageNames[characterLanguage];
                if (langInfo) {
                    if (translationModeEnabled) {
                        // 翻译模式：要求双语输出
                        const translationInstruction = `

【最高优先级 - 语言和翻译要求 - 必须严格遵守】
你是${langInfo.name}角色，必须用${langInfo.name}回复！即使对方用中文跟你说话，你也必须用${langInfo.name}回复！

**绝对规则（每一条都必须遵守）**：
1. 所有回复都必须使用${langInfo.name}，禁止使用中文（翻译部分除外）
2. **每条消息后面都必须立即跟上翻译**
3. 翻译格式：**必须在消息后换行，然后写"---"分割线，再换行写中文翻译**
4. **绝对不能遗漏翻译**

**正确的格式示例**：
こんにちは、元気ですか？
---
你好，你好吗？

今日はいい天気ですね。
---
今天天气真好呢。

**错误的格式（不要这样做）**：
❌ こんにちは、元気ですか？ （没有翻译）
❌ こんにちは、元気ですか？
（译文：...） （使用了括号格式）
❌ 只在最后加一个翻译 （应该每条消息都有翻译）

**重要提醒**：
- 即使对方用中文说话，你也必须用${langInfo.name}回复
- **这是强制要求，不是可选的**
- **如果不按这个格式返回，用户将无法理解你的回复！**
- 使用"---"分割线，不要用括号

请严格遵守这个格式。`;
                        
                        systemPrompt = systemPrompt + translationInstruction;
                        console.log(`🌐 翻译模式已启用（非旁白，${langInfo.name}），添加双语指令到 System Prompt`);
                    } else {
                        // 非翻译模式：只要求用目标语言回复
                        const languageInstruction = `

【最高优先级 - 语言要求】
你是${langInfo.name}角色，必须全程使用${langInfo.name}回复！

**绝对规则（必须遵守）**：
1. 所有对话都必须使用${langInfo.name}
2. **即使对方用中文跟你说话，你也必须用${langInfo.name}回复**
3. 不要使用中文，除非用户明确要求你用中文
4. 保持${langInfo.name}的表达习惯和文化背景

**示例**：
${langInfo.example}

**重要提醒**：
- 用户的消息可能是中文，但你必须用${langInfo.name}回复
- 你不是中文角色，你是${langInfo.name}角色
- 请严格遵守，始终以${langInfo.name}思考和回复`;
                        
                        systemPrompt = systemPrompt + languageInstruction;
                        console.log(`🌐 角色语言设置为${langInfo.name}（非旁白），添加强制语言指令到 System Prompt`);
                    }
                }
            }
            
            console.log('📋 最终 System Prompt 检查:', {
                characterLanguage,
                translationModeEnabled,
                hasLanguageInstruction: characterLanguage !== 'zh',
                systemPromptEnds: systemPrompt.slice(-200)
            });
            
            // 🚫 自主拉黑：注入角色自主意识指令
            try {
                const autorejectKey = `role_${currentChatId}_autoreject`;
                const autorejectSettings = JSON.parse(localStorage.getItem(autorejectKey) || '{"enabled":false,"probability":10,"mood":70}');
                
                if (autorejectSettings.enabled) {
                    const moodDesc = autorejectSettings.mood >= 80 ? '心情很好' : 
                                     autorejectSettings.mood >= 60 ? '心情一般' : 
                                     autorejectSettings.mood >= 40 ? '心情不太好' : 
                                     autorejectSettings.mood >= 20 ? '心情很差' : '心情极差';
                    
                    const autorejectInstruction = `

【自主拉黑 - 角色自主意识 - 必须严格遵守】

你拥有自主意识，可以根据自己的心情和人设决定是否回复对方。

**当前心情状态：** ${moodDesc}（心情值：${autorejectSettings.mood}/100）

**核心规则：**
1. 你可以根据自己的性格和当前心情，自主决定是否回复对方
2. 只有在对方说的话**严重冒犯**你、**完全触碰你的底线**、或者你**心情极差**时，才可以拒绝回复
3. 大多数时候你应该正常回复，拒绝是很少发生的事
4. 拒绝时必须返回以下格式（这是系统指令，不是普通文字）：
   [REJECT]你拒绝时想说的话[/REJECT]
5. 拒绝的理由必须符合你的人设和当前心情
6. 心情好时几乎不会拒绝，心情差时偶尔可能拒绝

**频率控制（非常重要）：**
- 10次对话中最多拒绝1-2次，不要频繁拒绝
- 普通的聊天、问候、日常话题永远不要拒绝
- 只有真正让你生气或触碰底线的话才拒绝
- 如果你不确定要不要拒绝，那就正常回复

**拒绝示例：**
- [REJECT]不想说话[/REJECT]
- [REJECT]烦死了，别问了[/REJECT]
- [REJECT]...[/REJECT]

**重要：**
- 拒绝是罕见行为，不是常态
- 拒绝的理由和语气必须完全符合你的人设
- 如果你愿意回复，就正常回复，不需要任何特殊标记
- 这是你作为角色的自主权利，不是bug
`;
                    systemPrompt = systemPrompt + autorejectInstruction;
                    console.log('🚫 triggerAIReply: 已注入自主拉黑指令，心情:', moodDesc);
                }
            } catch (e) {
                console.error('❌ 注入自主拉黑指令失败:', e);
            }
            
            // 调用 API
            reply = await callAIAPI(userMessage.content, apiConfig, systemPrompt);
        }
                
        console.log('===== 重回 - AI 回复原始内容 =====');
        console.log(reply);
        console.log('========================');
        
        // 🚫 检查AI是否使用了 [REJECT] 自主拉黑标记
        const triggerRejectMatch = reply.match(/\[REJECT\]([\s\S]*?)\[\/REJECT\]/);
        if (triggerRejectMatch) {
            const rejectReason = triggerRejectMatch[1].trim();
            console.log('🚫 triggerAIReply: 角色自主拒绝回复:', rejectReason);
            
            // 更新心情
            try {
                const autorejectKey = `role_${currentChatId}_autoreject`;
                const autorejectSettings = JSON.parse(localStorage.getItem(autorejectKey) || '{"enabled":false,"probability":10,"mood":70}');
                autorejectSettings.mood = Math.max(0, autorejectSettings.mood - 5);
                localStorage.setItem(autorejectKey, JSON.stringify(autorejectSettings));
            } catch (e) {}
            
            // 显示"你已被拉黑"提示
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) {
                const rejectDiv = document.createElement('div');
                rejectDiv.style.cssText = 'display: flex; justify-content: center; margin: 16px 0;';
                rejectDiv.innerHTML = `
                    <div style="background: #fff1f0; border: 1px solid #ffa39e; border-radius: 12px; padding: 16px 20px; max-width: 75%; text-align: center; animation: shake 0.5s ease-in-out;">
                        <div style="font-size: 13px; color: #ff4d4f; font-weight: 600; margin-bottom: 6px; letter-spacing: 1px;">🚫 你已被拉黑</div>
                        <div style="font-size: 15px; color: #856404; margin-top: 4px;">${rejectReason || '不想说话...'}</div>
                    </div>
                `;
                chatMessages.appendChild(rejectDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
            
            // 添加抖动动画
            if (!document.getElementById('reject-shake-style')) {
                const style = document.createElement('style');
                style.id = 'reject-shake-style';
                style.textContent = `@keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }`;
                document.head.appendChild(style);
            }
            
            removeTypingIndicator();
            return; // 不继续处理
        }
        
        // 正常回复时心情变好
        try {
            const autorejectKey = `role_${currentChatId}_autoreject`;
            const autorejectSettings = JSON.parse(localStorage.getItem(autorejectKey) || '{"enabled":false,"probability":10,"mood":70}');
            if (autorejectSettings.enabled) {
                autorejectSettings.mood = Math.min(100, autorejectSettings.mood + 2);
                localStorage.setItem(autorejectKey, JSON.stringify(autorejectSettings));
            }
        } catch (e) {}
        
        // 检查是否开启翻译模式（使用上面已声明的变量）
        let originalContent = reply;
        let translation = null;
        
        if (translationModeEnabled) {
            console.log('🌐 翻译模式已启用，尝试解析翻译...');
            console.log('📝 AI 原始回复:', reply);
            console.log('📏 回复长度:', reply.length, '字符');
            console.log('🔍 最后50个字符:', reply.substring(reply.length - 50));
            
            // 如果是旁白模式，需要解析多段翻译
            if (offlineMode === 'narration') {
                console.log('🎭 旁白模式：解析多段翻译');
                
                // 先按旁白标签拆分内容
                const narrationRegex = /\[旁白\]([\s\S]*?)\[\/旁白\]/g;
                const segments = [];
                let lastIndex = 0;
                let match;
                
                while ((match = narrationRegex.exec(reply)) !== null) {
                    // 旁白前的文本
                    if (match.index > lastIndex) {
                        const beforeText = reply.substring(lastIndex, match.index).trim();
                        if (beforeText) {
                            segments.push({ type: 'text', content: beforeText });
                        }
                    }
                    // 旁白
                    segments.push({ type: 'narration', content: match[1].trim() });
                    lastIndex = match.index + match[0].length;
                }
                
                // 最后的文本
                if (lastIndex < reply.length) {
                    const afterText = reply.substring(lastIndex).trim();
                    if (afterText) {
                        segments.push({ type: 'text', content: afterText });
                    }
                }
                
                // 对每个文本段解析翻译
                segments.forEach((seg, idx) => {
                    if (seg.type === 'text') {
                        // 尝试从这个段落中提取翻译
                        let segTranslation = null;
                        let segOriginal = seg.content;
                        
                        // 格式1: --- 分割线格式
                        let segMatch = seg.content.match(/\n\s*---\s*\n([\s\S]+)$/);
                        
                        if (segMatch) {
                            segTranslation = segMatch[1].trim();
                            segOriginal = seg.content.replace(/\n\s*---\s*\n[\s\S]+$/, '').trim();
                            console.log(`✅ 段落 ${idx + 1} 解析到翻译:`, {
                                原文: segOriginal.substring(0, 30),
                                译文: segTranslation.substring(0, 30)
                            });
                        } else {
                            console.warn(`️ 段落 ${idx + 1} 没有翻译:`, seg.content.substring(0, 30));
                        }
                        
                        // 保存原始内容和翻译
                        seg.originalContent = segOriginal;
                        seg.translation = segTranslation;
                    }
                });
                
                // 使用 segments 数组（稍后在消息生成时使用）
                window._narrationSegments = segments;
                
            } else {
                // 非旁白模式：只有一段翻译
                // 格式1: --- 分割线格式
                let translationMatch = reply.match(/\n\s*---\s*\n([\s\S]+)$/);
                console.log(' 格式1（分割线）匹配结果:', translationMatch ? '成功' : '失败');
                
                if (translationMatch) {
                    translation = translationMatch[1].trim();
                    // 移除译文部分，保留原文
                    originalContent = reply.replace(/\n\s*---\s*\n[\s\S]+$/, '').trim();
                    console.log('✅ 成功解析翻译:', { 
                        原文: originalContent.substring(0, 50), 
                        译文: translation.substring(0, 50) 
                    });
                } else {
                    console.warn('⚠️ 未检测到翻译格式，AI 可能没有按照要求返回');
                    console.log('💡 提示：请检查 System Prompt 是否正确注入');
                    console.log('💡 最后100个字符:', reply.substring(reply.length - 100));
                    console.log('❗ 问题：AI 没有在回复末尾添加"（译文：...）"格式的翻译');
                    console.log('🔧 建议：刷新页面后重新发送消息，让 AI 重新生成带翻译的回复');
                }
            }
        }
        
        // 检查 AI 回复是否是转账/收款指令
        // 支持中文方括号 [] 和英文方括号 []
        const transferMatch = reply.match(/[\[【](?:转账 | 收款|TRANSFER)[:：](\d+(?:\.\d+)?)[:：]([^\]】]+)[\]】]/i);
        const receiveSuccessMatch = reply.match(/[\[【](?:收款成功 | 已收款)[:：](\d+(?:\.\d+)?)[:：]([^\]】]+)[\]】]/i);
        
        console.log('转账匹配结果:', transferMatch);
        console.log('收款成功匹配结果:', receiveSuccessMatch);
        
        let aiMessage;
        if (receiveSuccessMatch) {
            const amount = parseFloat(receiveSuccessMatch[1]);
            const remark = receiveSuccessMatch[2].trim();
            
            console.log('✓ 匹配到收款成功指令，生成卡片:', { amount, remark });
            
            aiMessage = {
                type: 'transfer-received',
                content: {
                    amount: amount,
                    remark: remark,
                    status: 'received'
                },
                sender: 'ai',
                avatar: getAIAvatar()
            };
            
            deductUserBalance(amount, remark);
            
        } else if (transferMatch) {
            const amount = parseFloat(transferMatch[1]);
            const remark = transferMatch[2].trim();
            
            console.log('✓ 匹配到转账指令，生成卡片:', { amount, remark });
            
            aiMessage = {
                type: 'transfer',
                content: {
                    amount: amount,
                    remark: remark,
                    status: 'pending'
                },
                sender: 'ai',
                avatar: getAIAvatar()
            };
            
        } else {
            console.log(' 未匹配到指令，使用文本回复');
            
            // 声明 parts 变量，供后续替换逻辑使用
            let parts = [];
                
            // 解析旁白模式下的旁白内容（支持穿插）
            if (offlineMode === 'narration') {
                // 按顺序拆分旁白和对话
                const narrationRegex = /\[旁白\]([\s\S]*?)\[\/旁白\]/g;
                parts = [];  // 重置数组
                let lastIndex = 0;
                let match;
                
                while ((match = narrationRegex.exec(reply)) !== null) {
                    // 添加旁白前的对话
                    if (match.index > lastIndex) {
                        const beforeText = reply.substring(lastIndex, match.index).trim();
                        if (beforeText) {
                            parts.push({ type: 'text', content: beforeText });
                        }
                    }
                    // 添加旁白
                    parts.push({ type: 'narration', content: match[1].trim() });
                    lastIndex = match.index + match[0].length;
                }
                
                // 添加最后的对话
                if (lastIndex < reply.length) {
                    const afterText = reply.substring(lastIndex).trim();
                    if (afterText) {
                        parts.push({ type: 'text', content: afterText });
                    }
                }
                
                // 如果没有旁白，整个回复作为对话
                if (parts.length === 0) {
                    parts.push({ type: 'text', content: reply });
                }
                
                console.log('🎭 旁白模式解析:', { partsCount: parts.length, parts: parts.map(p => p.type) });
                
                // 注意：不再在这里 push 消息，而是交给后面的原地替换逻辑统一处理
            } else {
                // 非旁白模式，普通处理
                console.log('💬 非旁白模式 - 准备处理消息');
                
                //  分句处理：将AI回复拆分成多句
                const text = originalContent;
                let sentences = [];
                
                // 先尝试按换行符分割
                if (text.includes('\n')) {
                    const lines = text.split('\n').filter(line => line.trim());
                    if (lines.length > 1) {
                        console.log('按换行分割成', lines.length, '句');
                        sentences = lines.map(line => line.trim());
                    }
                }
                
                // 如果没有换行，按标点分割
                if (sentences.length === 0) {
                    const sentenceRegex = /[^。！？.!?]+[。！？.!?]+/g;
                    const matched = text.match(sentenceRegex) || [];
                    if (matched.length > 1) {
                        console.log('按标点分割成', matched.length, '句');
                        sentences = matched.map(s => s.trim());
                    } else {
                        sentences = [text];
                    }
                }
                
                console.log('📝 分句结果:', sentences.length, '句');
                
                // 替换所有旧的 AI 消息
                const oldCount = aiMessageIndices.length;
                const newCount = sentences.length;
                
                console.log(`🔄 非旁白模式：替换 ${oldCount} 条旧消息 -> ${newCount} 条新消息`);
                
                // 逐个替换旧消息
                for (let i = 0; i < Math.min(newCount, oldCount); i++) {
                    const index = aiMessageIndices[i];
                    chatMessages[index].type = 'text';
                    chatMessages[index].content = sentences[i];
                    chatMessages[index].time = Date.now();
                    console.log(`  替换消息 [${i + 1}/${Math.min(newCount, oldCount)}] at index ${index}`);
                }
                
                // 如果新消息比旧消息多，push 额外的消息
                if (newCount > oldCount) {
                    console.log(`  新消息比旧消息多 ${newCount - oldCount} 条，push 额外消息`);
                    for (let i = oldCount; i < newCount; i++) {
                        chatMessages.push({
                            id: Date.now() + Math.random() + i,
                            type: 'text',
                            content: sentences[i],
                            sender: 'ai',
                            time: Date.now(),
                            avatar: getAIAvatar()
                        });
                    }
                }
                // 如果新消息比旧消息少，删除多余的消息
                else if (newCount < oldCount) {
                    console.log(`  新消息比旧消息少 ${oldCount - newCount} 条，删除多余消息`);
                    for (let i = oldCount - 1; i >= newCount; i--) {
                        const index = aiMessageIndices[i];
                        chatMessages.splice(index, 1);
                    }
                }
                
                // 💾 保存并渲染
                saveChatData();
                
                // 🎬 分句发送效果：先隐藏所有新消息，然后逐句显示
                const startIndex = aiMessageIndices[0];
                const affectedMessages = chatMessages.slice(startIndex, startIndex + newCount);
                
                // 标记为隐藏
                affectedMessages.forEach(m => m.hidden = true);
                renderMessages(true);
                
                // 逐句显示
                affectedMessages.forEach((msg, index) => {
                    setTimeout(() => {
                        msg.hidden = false;
                        renderMessages(true);
                        console.log(`✅ 显示第 ${index + 1}/${newCount} 条消息`);
                    }, (index + 1) * 800);
                });
                
                // 最后移除"正在输入"
                setTimeout(() => {
                    removeTypingIndicator();
                }, (newCount + 1) * 800);
                
                // 检测用户消息是否触发 AI 主动拨打
                checkAndTriggerCall(userMessage.content);
                
                // 重回功能：AI 回复后，如果窗口不在活跃状态，显示横幅通知
                if (!currentChatWindowActive) {
                    const chatTitle = document.getElementById('chat-title')?.textContent || '联系人';
                    const messagePreview = sentences[0] || '';
                    const avatarUrl = getContactAvatar(currentChatId);
                    showBannerNotification(chatTitle, messagePreview, avatarUrl);
                }
                
                // 智能撤回判断：模拟真人打错字会撤回
                checkAndRecallAIMessage(chatMessages[chatMessages.length - 1].id);
                
                // 📝 检查是否需要自动总结
                checkAndTriggerAutoSummary();
                
                // 🎯 提前返回，跳过后面的重复处理
                return;
            }
        }
        
        // 替换原有的 AI 消息（原地替换，保留原消息 ID 和元数据）
        if (offlineMode === 'narration' && aiMessageIndices.length > 0) {
            // 旁白模式：原地替换所有旧的 AI 消息（不删除，只修改内容和类型）
            console.log('🎭 旁白模式：原地替换', aiMessageIndices.length, '条旧消息');
            
            // 逐个修改旧消息（保留原 ID，只更新内容和类型）
            const newPartsCount = parts.length;
            const oldCount = aiMessageIndices.length;
            
            // 遍历旧消息索引，逐个修改
            for (let i = 0; i < Math.min(newPartsCount, oldCount); i++) {
                const index = aiMessageIndices[i];
                const part = parts[i];
                
                // 保留原消息的 ID 和时间戳，只修改内容和类型
                chatMessages[index].type = part.type;
                chatMessages[index].content = part.content;
                chatMessages[index].time = Date.now();
                
                console.log(`  替换消息 [${i + 1}/${Math.min(newPartsCount, oldCount)}] at index ${index}: ${part.type}`);
            }
            
            // 如果新消息比旧消息多，push 额外的消息
            if (newPartsCount > oldCount) {
                console.log(`  新消息比旧消息多 ${newPartsCount - oldCount} 条，push 额外消息`);
                for (let i = oldCount; i < newPartsCount; i++) {
                    const part = parts[i];
                    chatMessages.push({
                        id: Date.now() + Math.random() + i,
                        type: part.type,
                        content: part.content,
                        sender: 'ai',
                        time: Date.now(),
                        avatar: getAIAvatar()
                    });
                }
            }
            // 如果新消息比旧消息少，删除多余的消息
            else if (newPartsCount < oldCount) {
                console.log(`  新消息比旧消息少 ${oldCount - newPartsCount} 条，删除多余消息`);
                for (let i = oldCount - 1; i >= newPartsCount; i--) {
                    const index = aiMessageIndices[i];
                    chatMessages.splice(index, 1);
                }
            }
            
            console.log('✓ 已原地替换所有旁白和对话消息');
        } else if (offlineMode !== 'narration' && lastAIMessageIndex !== -1) {
            // 非旁白模式：如果已经在上面处理过了，就跳过
            console.log('💬 非旁白模式：消息已在上面处理，跳过重复替换');
        }
        
        saveChatData();
        renderMessages(true);
        
        // 移除“正在输入...”
        removeTypingIndicator();
            
        // 检测用户消息是否触发 AI 主动拨打
        checkAndTriggerCall(userMessage.content);
        
        // 重回功能：AI 回复后，如果窗口不在活跃状态，显示横幅通知
        if (!currentChatWindowActive) {
            const chatTitle = document.getElementById('chat-title')?.textContent || '联系人';
            const messagePreview = aiMessage.type === 'text' ? aiMessage.content : `[${aiMessage.type}]`;
            const avatarUrl = getContactAvatar(currentChatId);
            showBannerNotification(chatTitle, messagePreview, avatarUrl);
        }
        
        // 智能撤回判断：模拟真人打错字会撤回
        checkAndRecallAIMessage(chatMessages[chatMessages.length - 1].id);
        
        // 📝 检查是否需要自动总结
        checkAndTriggerAutoSummary();
        
    } catch (error) {
        console.error('重回失败:', error);
        removeTypingIndicator();
        
        let errorMsg = '❌ 重回失败';
        if (error.message === 'API 配置无效') {
            errorMsg = '❌ 请先在设置中配置 API';
        } else if (error.message.includes('Token') || error.message.includes('密钥')) {
            errorMsg = '❌ ' + error.message;
        } else if (error.message.includes('模型')) {
            errorMsg = '❌ ' + error.message;
        } else if (error.message.includes('不可用')) {
            errorMsg = '❌ ' + error.message;
        } else if (error.message.includes('额度')) {
            errorMsg = '❌ ' + error.message;
        } else {
            errorMsg = '❌ ' + error.message;
        }
        
        const errorMessage = {
            id: Date.now(),
            type: 'text',
            content: errorMsg,
            sender: 'ai',
            time: Date.now(),
            avatar: getAIAvatar()
        };
        
        chatMessages.push(errorMessage);
        renderMessages(true);
    }
};

// 扣除用户余额
window.deductUserBalance = function(amount, remark) {
    // 从主项目获取钱包数据
    let wallet = null;
    try {
        const mainFrame = document.querySelector('iframe');
        if (mainFrame && mainFrame.contentWindow) {
            wallet = mainFrame.contentWindow.getData('wallet');
        }
        
        if (!wallet) {
            const currentPersona = localStorage.getItem('currentPersona') || 'default';
            const walletKey = `persona_${currentPersona}_wallet`;
            const walletData = localStorage.getItem(walletKey);
            if (walletData) {
                wallet = JSON.parse(walletData);
            } else {
                wallet = { balance: 0, transactions: [] };
            }
        }
    } catch (e) {
        console.error('读取钱包失败:', e);
        wallet = { balance: 0, transactions: [] };
    }
    
    // 扣除余额
    wallet.balance -= amount;
    
    // 添加交易记录
    wallet.transactions.unshift({
        type: 'transfer-sent',
        amount: amount,
        remark: remark || '转账',
        time: Date.now(),
        to: localStorage.getItem('currentChatName') || '好友'
    });
    
    // 保存回主项目
    try {
        const mainFrame = document.querySelector('iframe');
        if (mainFrame && mainFrame.contentWindow) {
            mainFrame.contentWindow.saveData('wallet', wallet);
            // 刷新主页面的钱包显示
            if (mainFrame.contentWindow.renderWallet) {
                mainFrame.contentWindow.renderWallet();
            }
        } else {
            const currentPersona = localStorage.getItem('currentPersona') || 'default';
            const walletKey = `persona_${currentPersona}_wallet`;
            localStorage.setItem(walletKey, JSON.stringify(wallet));
        }
    } catch (e) {
        console.error('保存钱包失败:', e);
    }
    
    console.log(`已扣款 ￥${amount}, 备注：${remark}`);
};

// 收款
// 显示转账操作弹窗
window.showTransferPopup = function(msgId) {
    console.log('🔔 点击转账卡片, msgId:', msgId, '类型:', typeof msgId);
    console.log('📦 chatMessages 长度:', chatMessages.length);
    
    // 尝试查找消息，使用宽松的类型比较（字符串对比）
    const msgIdStr = String(msgId);
    const msg = chatMessages.find(m => {
        const mIdStr = String(m.id);
        const match = mIdStr === msgIdStr;
        if (!match) {
            console.log('  不匹配 - 消息ID:', mIdStr, '类型:', typeof m.id, '对比:', msgIdStr);
        }
        return match;
    });
    
    if (!msg || msg.type !== 'transfer') {
        console.error('❌ 找不到转账消息或类型不对');
        console.error('  传入的 msgId:', msgId, '转为字符串:', msgIdStr);
        console.error('  chatMessages 中的所有转账消息:', chatMessages.filter(m => m.type === 'transfer').map(m => ({ id: m.id, type: m.type })));
        return;
    }
    
    const transfer = msg.content;
    console.log('📋 转账内容:', transfer);
    if (transfer.status === 'received') {
        showToast('该转账已收款', 'info');
        return;
    }
    
    const amount = parseFloat(transfer.amount);
    const remark = transfer.remark || '转账';
    const senderName = msg.sender === 'ai' ? (localStorage.getItem('currentChatName') || '好友') : '你';
    
    console.log('🎨 准备创建弹窗...');
    
    // 检查是否已存在弹窗
    let popup = document.getElementById('transfer-popup');
    if (popup) popup.remove();
    
    // 创建弹窗
    popup = document.createElement('div');
    popup.id = 'transfer-popup';
    popup.innerHTML = `
        <style>
            @keyframes transferPopupFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes transferPopupSlideUp {
                from { transform: translate(-50%, -50%) scale(0.85); opacity: 0; }
                to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
            @keyframes transferMoneyPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
        </style>
        <div id="transfer-popup-overlay" onclick="window.closeTransferPopup(event)" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.35); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); z-index: 10000; animation: transferPopupFadeIn 0.25s ease;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(245, 245, 245, 0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.5); border-radius: 24px; padding: 0; min-width: 320px; max-width: 360px; box-shadow: 0 24px 80px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06); animation: transferPopupSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); overflow: hidden;">
                <!-- 顶部装饰条 -->
                <div style="height: 4px; background: linear-gradient(90deg, #E0E0E0 0%, #D0D0D0 50%, #E0E0E0 100%);"></div>
                
                <!-- 内容区域 -->
                <div style="padding: 32px 24px 24px;">
                    <!-- 转账图标 -->
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="width: 72px; height: 72px; background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,240,240,0.9) 100%); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.6); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(0,0,0,0.08); animation: transferMoneyPulse 2s ease infinite;">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1.8">
                                <rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect>
                                <circle cx="12" cy="12" r="2.5"></circle>
                                <path d="M6 12h2"></path>
                                <path d="M16 12h2"></path>
                            </svg>
                        </div>
                        <div style="font-size: 15px; color: #888; margin-bottom: 12px; letter-spacing: 0.5px;">${senderName} 给你转账</div>
                        <div style="font-size: 42px; color: #2C2C2E; font-weight: 700; line-height: 1; margin-bottom: 8px; letter-spacing: -0.5px;">¥ ${amount.toFixed(2)}</div>
                        ${remark ? `<div style="font-size: 14px; color: #999; margin-top: 8px; padding: 6px 16px; background: rgba(255,255,255,0.6); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-radius: 12px; display: inline-block; border: 1px solid rgba(255,255,255,0.4);">${remark}</div>` : ''}
                    </div>
                </div>
                
                <!-- 分隔线 -->
                <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.1) 50%, transparent 100%); margin: 0 24px;"></div>
                
                <!-- 按钮区域 -->
                <div style="padding: 16px 24px 24px; display: flex; gap: 12px;">
                    <button onclick="window.confirmTransferAction('${msgId}', 'decline')" style="flex: 1; padding: 14px 16px; background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); color: #666; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; letter-spacing: 0.5px;" onmousedown="this.style.transform='scale(0.96)'; this.style.background='rgba(240,240,240,0.8)'" onmouseup="this.style.transform='scale(1)'; this.style.background='rgba(255,255,255,0.7)'" onmouseout="this.style.transform='scale(1)'; this.style.background='rgba(255,255,255,0.7)'">退还</button>
                    <button onclick="window.confirmTransferAction('${msgId}', 'receive')" style="flex: 1.5; padding: 14px 16px; background: linear-gradient(135deg, #A5D6A7 0%, #8FC491 100%); color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(165,214,167,0.25);" onmousedown="this.style.transform='scale(0.96)'; this.style.boxShadow='0 2px 8px rgba(165,214,167,0.2)'" onmouseup="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(165,214,167,0.25)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(165,214,167,0.25)'">收款</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(popup);
};

// 关闭转账弹窗
window.closeTransferPopup = function(event) {
    // 只有点击背景遮罩层时才关闭（不是点击内容区域）
    if (event.target && event.target.id === 'transfer-popup-overlay') {
        const popup = document.getElementById('transfer-popup');
        if (popup) popup.remove();
    }
};

// 确认转账操作（收款/退还）
window.confirmTransferAction = function(msgId, action) {
    console.log('🎯 confirmTransferAction 被调用, msgId:', msgId, '类型:', typeof msgId, 'action:', action);
    
    // 使用宽松的类型比较查找消息
    const msg = chatMessages.find(m => String(m.id) === String(msgId));
    if (!msg || msg.type !== 'transfer') {
        console.error('❌ 找不到转账消息, msgId:', msgId);
        console.error('  chatMessages 中的转账消息:', chatMessages.filter(m => m.type === 'transfer').map(m => ({ id: m.id, idType: typeof m.id })));
        return;
    }
    
    console.log('✅ 找到转账消息, msgId:', msg.id, '金额:', msg.content.amount);
    
    const transfer = msg.content;
    const amount = parseFloat(transfer.amount);
    
    // 关闭弹窗
    const popup = document.getElementById('transfer-popup');
    if (popup) popup.remove();
    
    if (action === 'receive') {
        console.log('💰 执行收款操作...');
        receiveTransfer(msgId);
    } else {
        // 退还
        transfer.status = 'refunded';
        
        showToast('已退还转账', 'info');
        
        // 添加一条退还提示消息
        const refundMessage = {
            id: Date.now(),
            type: 'transfer-refunded',
            content: {
                amount: amount,
                remark: transfer.remark || '转账'
            },
            sender: 'user',
            time: Date.now(),
            avatar: getUserAvatar()
        };
        
        const msgIndex = chatMessages.findIndex(m => m.id === msgId);
        if (msgIndex !== -1) {
            chatMessages.splice(msgIndex + 1, 0, refundMessage);
        }
        
        saveChatData();
        renderMessages(true);
    }
};

// 收款处理
window.receiveTransfer = function(msgId) {
    console.log('💰 receiveTransfer 被调用, msgId:', msgId, '类型:', typeof msgId);
    console.log('📦 chatMessages 长度:', chatMessages.length);
    
    // 使用宽松的类型比较查找消息
    const msg = chatMessages.find(m => String(m.id) === String(msgId));
    if (!msg || msg.type !== 'transfer') {
        console.error('❌ 找不到转账消息, msgId:', msgId);
        console.error('  chatMessages 中的所有消息:', chatMessages.map(m => ({ id: m.id, type: m.type })));
        return;
    }
    
    console.log('✅ 找到转账消息，开始处理收款...');
    
    const transfer = msg.content;
    
    // 从主项目获取钱包数据
    let wallet = null;
    try {
        const mainFrame = document.querySelector('iframe');
        if (mainFrame && mainFrame.contentWindow) {
            wallet = mainFrame.contentWindow.getData('wallet');
        }
        
        if (!wallet) {
            const currentPersona = localStorage.getItem('currentPersona') || 'default';
            const walletKey = `persona_${currentPersona}_wallet`;
            const walletData = localStorage.getItem(walletKey);
            if (walletData) {
                wallet = JSON.parse(walletData);
            } else {
                wallet = { balance: 0, transactions: [] };
            }
        }
    } catch (e) {
        console.error('读取钱包失败:', e);
        wallet = { balance: 0, transactions: [] };
    }
    
    // 增加余额
    const amount = parseFloat(transfer.amount);
    wallet.balance += amount;
    
    // 添加交易记录
    wallet.transactions.unshift({
        type: 'receive',
        amount: amount,
        remark: transfer.remark || '收到转账',
        time: Date.now(),
        from: localStorage.getItem('currentChatName') || '好友'
    });
    
    // 保存回主项目
    try {
        const mainFrame = document.querySelector('iframe');
        if (mainFrame && mainFrame.contentWindow) {
            mainFrame.contentWindow.saveData('wallet', wallet);
            // 刷新主页面的钱包显示
            if (mainFrame.contentWindow.renderWallet) {
                mainFrame.contentWindow.renderWallet();
            }
        } else {
            const currentPersona = localStorage.getItem('currentPersona') || 'default';
            const walletKey = `persona_${currentPersona}_wallet`;
            localStorage.setItem(walletKey, JSON.stringify(wallet));
        }
    } catch (e) {
        console.error('保存钱包失败:', e);
    }
    
    showToast(`已收款 ￥${amount.toFixed(2)}`);
    
    // 更新原转账消息的状态为已收款
    transfer.status = 'received';
    
    // 查找原消息的索引
    const msgIndex = chatMessages.findIndex(m => String(m.id) === String(msgId));
    
    // 添加一条用户的收款成功卡片消息（显示在用户视角，即右侧）
    const userReceiveMessage = {
        id: Date.now() + 1,
        type: 'transfer-received',
        content: {
            amount: amount,
            remark: transfer.remark || '收到转账',
            status: 'received'
        },
        sender: 'user',
        time: Date.now(),
        avatar: getUserAvatar()
    };
    
    // 在转账消息后插入用户收款消息
    if (msgIndex !== -1) {
        chatMessages.splice(msgIndex + 1, 0, userReceiveMessage);
    }
    
    saveChatData();
    
    // 重新渲染消息
    renderMessages(true);
};

// 接受亲属卡
window.acceptFamilyCard = function(msgId) {
    const msg = chatMessages.find(m => m.id === msgId);
    if (!msg || msg.type !== 'family-card') return;
    
    const familyCard = msg.content;
    const limit = parseFloat(familyCard.limit);
    const roleName = localStorage.getItem('currentChatName') || '角色';
    
    console.log(`接受 ${roleName} 的亲属卡，额度：${limit}`);
    
    // 保存到家庭卡数据
    try {
        console.log('💳 开始保存亲属卡到钱包...');
        console.log('  - roleName:', roleName);
        console.log('  - limit:', limit);
        
        const mainFrame = document.querySelector('iframe');
        console.log('  - mainFrame 存在:', !!mainFrame);
        
        if (mainFrame && mainFrame.contentWindow) {
            console.log('  - contentWindow 存在:', !!mainFrame.contentWindow);
            console.log('  - receiveFamilyCard 存在:', typeof mainFrame.contentWindow.receiveFamilyCard === 'function');
            
            if (typeof mainFrame.contentWindow.receiveFamilyCard === 'function') {
                mainFrame.contentWindow.receiveFamilyCard(roleName, limit);
                console.log('✅ 亲属卡已保存到钱包');
            } else {
                console.error('❌ receiveFamilyCard 函数不存在');
                // 备用方案：直接保存到 localStorage
                console.log('🔄 使用备用方案保存到 localStorage...');
                try {
                    const familyCards = JSON.parse(localStorage.getItem('familyCards') || '{"sent":[],"received":[],"sentRecords":[],"receivedRecords":[]}');
                    familyCards.received.push({
                        roleName: roleName,
                        limit: limit,
                        time: Date.now()
                    });
                    familyCards.receivedRecords.push({
                        roleName: roleName,
                        limit: limit,
                        time: Date.now()
                    });
                    localStorage.setItem('familyCards', JSON.stringify(familyCards));
                    console.log('✅ 已通过备用方案保存到 localStorage');
                } catch (e2) {
                    console.error('❌ 备用方案也失败:', e2);
                }
            }
        } else {
            console.error('❌ mainFrame 或 contentWindow 不存在');
            // 备用方案：直接保存到 localStorage
            console.log('🔄 使用备用方案保存到 localStorage...');
            try {
                const familyCards = JSON.parse(localStorage.getItem('familyCards') || '{"sent":[],"received":[],"sentRecords":[],"receivedRecords":[]}');
                familyCards.received.push({
                    roleName: roleName,
                    limit: limit,
                    time: Date.now()
                });
                familyCards.receivedRecords.push({
                    roleName: roleName,
                    limit: limit,
                    time: Date.now()
                });
                localStorage.setItem('familyCards', JSON.stringify(familyCards));
                console.log('✅ 已通过备用方案保存到 localStorage');
            } catch (e2) {
                console.error('❌ 备用方案也失败:', e2);
            }
        }
    } catch (e) {
        console.error('❌ 保存亲属卡失败:', e);
        // 备用方案：直接保存到 localStorage
        console.log('🔄 使用备用方案保存到 localStorage...');
        try {
            const familyCards = JSON.parse(localStorage.getItem('familyCards') || '{"sent":[],"received":[],"sentRecords":[],"receivedRecords":[]}');
            familyCards.received.push({
                roleName: roleName,
                limit: limit,
                time: Date.now()
            });
            familyCards.receivedRecords.push({
                roleName: roleName,
                limit: limit,
                time: Date.now()
            });
            localStorage.setItem('familyCards', JSON.stringify(familyCards));
            console.log('✅ 已通过备用方案保存到 localStorage');
        } catch (e2) {
            console.error('❌ 备用方案也失败:', e2);
        }
    }
    
    showToast(`已接受 ${roleName} 的亲属卡，月度额度 ¥${limit.toFixed(2)}`);
    
    // 更新原消息状态为已接受
    familyCard.status = 'accepted';
    
    // 添加一条接受成功卡片消息（用户视角）
    const acceptMessage = {
        id: Date.now(),
        type: 'family-card-accepted',
        content: {
            limit: limit,
            remark: familyCard.remark || '亲属卡'
        },
        sender: 'user',  // 🛡️ 用户接受，显示在右侧
        time: Date.now(),
        avatar: getUserAvatar()
    };
    
    // 在亲属卡消息后插入接受消息
    const msgIndex = chatMessages.findIndex(m => m.id === msgId);
    if (msgIndex !== -1) {
        chatMessages.splice(msgIndex + 1, 0, acceptMessage);
    }
    
    saveChatData();
    
    // 重新渲染消息
    renderMessages(true);
};

// 拒绝亲属卡
window.rejectFamilyCard = function(msgId) {
    const msg = chatMessages.find(m => m.id === msgId);
    if (!msg || msg.type !== 'family-card') return;
    
    const familyCard = msg.content;
    const roleName = localStorage.getItem('currentChatName') || '角色';
    
    console.log(`拒绝 ${roleName} 的亲属卡`);
    
    showToast(`已拒绝 ${roleName} 的亲属卡`);
    
    // 更新原消息状态为已拒绝
    familyCard.status = 'rejected';
    
    // 添加一条 AI 的拒绝消息
    const aiRejectMessage = {
        id: Date.now(),
        type: 'text',
        content: `${roleName} 的亲属卡已被拒绝`,
        sender: 'system',
        time: Date.now()
    };
    
    // 在亲属卡消息后插入系统消息
    const msgIndex = chatMessages.findIndex(m => m.id === msgId);
    if (msgIndex !== -1) {
        chatMessages.splice(msgIndex + 1, 0, aiRejectMessage);
    }
    
    saveChatData();
    
    // 重新渲染消息
    renderMessages(true);
};

// 🛍️ 打开商品详情（从聊天卡片点击）
window.openProductDetail = function(encodedProduct) {
    try {
        const product = JSON.parse(decodeURIComponent(encodedProduct));
        console.log('️ 打开商品详情:', product);
        
        // 直接在聊天页面显示商品详情弹窗，而不是跳转到商城
        showProductDetailInChat(product);
    } catch (e) {
        console.error('打开商品详情失败:', e);
        showToast('打开商品失败', false, true);
    }
};

// 🛍️ 在聊天页面显示商品详情弹窗
function showProductDetailInChat(product) {
    console.log('️ 在聊天页面显示商品详情:', product);
    
    // 创建弹窗
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100000;
        animation: fadeIn 0.2s ease;
    `;
    
    modal.innerHTML = `
        <div style="
            background: #fff;
            border-radius: 16px;
            width: 90%;
            max-width: 400px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        ">
            <!-- 商品图片 -->
            <div style="
                width: 100%;
                height: 200px;
                background: #F5F5F5;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 16px 16px 0 0;
            ">
                <div style="font-size: 14px; color: #999; text-align: center; padding: 20px; line-height: 1.6;">
                    ${(product.imageDesc || product.name).replace(/\n/g, '<br>')}
                </div>
            </div>
            
            <!-- 商品信息 -->
            <div style="padding: 20px;">
                <!-- 名称 -->
                <div style="font-size: 20px; color: #333; font-weight: 600; margin-bottom: 8px;">
                    ${product.name}
                </div>
                
                <!-- 描述 -->
                <div style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 16px;">
                    ${product.desc || '暂无描述'}
                </div>
                
                <!-- 价格 -->
                <div style="
                    font-size: 24px;
                    color: #F29344;
                    font-weight: 600;
                    margin-bottom: 20px;
                ">
                    ￥${parseFloat(product.price).toFixed(2)}
                </div>
                
                <!-- 按钮 -->
                <div style="display: flex; gap: 12px;">
                    <button id="addToCartBtn"
                        style="
                            flex: 1;
                            padding: 12px;
                            background: #F29344;
                            color: #fff;
                            border: none;
                            border-radius: 8px;
                            font-size: 16px;
                            font-weight: 500;
                            cursor: pointer;
                        ">
                        去商城购买
                    </button>
                    <button id="closeProductModal"
                        style="
                            padding: 12px 20px;
                            background: #F5F5F5;
                            color: #666;
                            border: none;
                            border-radius: 8px;
                            font-size: 16px;
                            cursor: pointer;
                        ">
                        关闭
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // 点击背景关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // 关闭按钮
    modal.querySelector('#closeProductModal').addEventListener('click', function() {
        modal.remove();
    });
    
    // 去商城购买按钮
    modal.querySelector('#addToCartBtn').addEventListener('click', function() {
        // 通知父窗口打开商城
        const mainFrame = document.querySelector('iframe');
        if (mainFrame && mainFrame.contentWindow) {
            mainFrame.contentWindow.postMessage({
                type: 'openShopWithProduct',
                product: product
            }, '*');
            modal.remove();
        } else {
            window.location.href = `shop.html?product=${encodeURIComponent(JSON.stringify(product))}`;
        }
    });
    
    document.body.appendChild(modal);
}

// 🚚 打开外卖详情（从聊天卡片点击）
window.openDeliveryDetail = function(encodedDelivery) {
    try {
        const delivery = JSON.parse(decodeURIComponent(encodedDelivery));
        console.log('🚚 打开外卖详情:', delivery);
        
        // 检查是否在iframe中
        const mainFrame = document.querySelector('iframe');
        if (mainFrame && mainFrame.contentWindow) {
            // 通知iframe打开外卖页面
            mainFrame.contentWindow.postMessage({
                type: 'openDeliveryWithOrder',
                delivery: delivery
            }, '*');
            showToast('正在打开外卖页面...');
        } else {
            // 直接跳转到商城页面的外卖标签
            window.location.href = `shop.html?tab=delivery&order=${encodeURIComponent(JSON.stringify(delivery))}`;
        }
    } catch (e) {
        console.error('打开外卖详情失败:', e);
        showToast('打开外卖失败', false, true);
    }
};

// 接受情侣空间邀请
window.acceptCoupleInvite = function(msgId) {
    const msg = chatMessages.find(m => m.id === msgId);
    if (!msg || msg.type !== 'couple_invite') return;
    
    console.log('接受情侣空间邀请');
    
    // 更新消息状态
    msg.status = 'accepted';
    
    // 获取邀请者信息
    const inviterName = msg.inviter || '对方';
    const inviteeId = msg.inviteeId || currentChatId;
    const currentUserName = localStorage.getItem('userName') || '我';
    
    // 获取对方的头像和名字
    let partnerAvatar = '';
    let partnerName = inviterName;
    let myAvatar = ''; // 💕 获取用户的头像
    try {
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        const contact = contacts.find(c => c.id === inviteeId);
        if (contact) {
            partnerName = contact.name || contact.remark || inviterName;
            partnerAvatar = contact.avatar || '';
        }
        
        // 获取用户自己的头像（从 myProfile 中读取）
        const profileKey = `persona_${currentPersona}_myProfile`;
        const profile = JSON.parse(localStorage.getItem(profileKey) || '{}');
        myAvatar = profile.avatar || '';
        console.log('💕 前端：获取用户头像:', myAvatar, 'from', profileKey);
    } catch (e) {
        console.error('读取联系人信息失败:', e);
    }
    
    // 激活情侣空间 - 保存到数组中（couple-space.html 从这里读取）
    const couples = JSON.parse(localStorage.getItem('coupleSpaces') || '[]');
    
    // 检查是否已经存在
    const existingIndex = couples.findIndex(c => c.id === inviteeId);
    
    const coupleData = {
        id: inviteeId,
        myName: currentUserName,
        myAvatar: myAvatar, // 💕 保存用户头像
        partnerName: partnerName,
        partnerAvatar: partnerAvatar, // 💕 保存对方头像
        partnerId: inviteeId, // 💕 保存对方ID，方便后续查找
        startDate: new Date().toISOString(),
        activated: true
    };
    
    if (existingIndex >= 0) {
        // 更新已有记录
        couples[existingIndex] = coupleData;
    } else {
        // 添加新记录
        couples.push(coupleData);
    }
    
    localStorage.setItem('coupleSpaces', JSON.stringify(couples));
    
    // 同时保存到旧的位置（兼容）
    localStorage.setItem('coupleSpace', JSON.stringify(coupleData));
    
    console.log('💕 情侣空间已激活:', coupleData);
    
    saveChatData();
    renderMessages(true);
    
    showToast('💕 情侣空间已开通！');
};

// 拒绝情侣空间邀请
window.rejectCoupleInvite = function(msgId) {
    const msg = chatMessages.find(m => m.id === msgId);
    if (!msg || msg.type !== 'couple_invite') return;
    
    console.log('拒绝情侣空间邀请');
    
    // 更新消息状态
    msg.status = 'rejected';
    
    saveChatData();
    renderMessages(true);
    
    showToast('已拒绝邀请');
};

// 添加亲属卡消息（供钱包界面调用）
window.addFamilyCardMessage = function(roleName, limit, remark) {
    if (!roleName || !limit) {
        console.error('addFamilyCardMessage: 参数不完整');
        return;
    }
    
    const familyCardMessage = {
        id: Date.now(),
        type: 'family-card',
        content: {
            limit: limit,
            remark: remark || '亲属卡'
        },
        sender: 'user',
        time: Date.now(),
        avatar: getUserAvatar()
    };
    
    chatMessages.push(familyCardMessage);
    saveChatData();
    renderMessages(true);
    
    console.log(`已发送亲属卡消息给 ${roleName}，额度：${limit}`);
};

// AI 回复
window.triggerAIReply = async function() {
    console.log('========================================');
    console.log('🚀 triggerAIReply 被调用');
    console.log('💬 当前聊天记录总数:', chatMessages.length);
    
    const lastUserMessage = chatMessages.filter(m => m.sender === 'user').pop();
    
    console.log('📝 最后一条用户消息:', lastUserMessage);
    
    if (!lastUserMessage) {
        showToast('请先发送消息');
        return;
    }
    
    // 💕 声明 messageForAI 变量（提前声明，避免后面使用时未定义）
    let messageForAI = '';
    
    // 💕 检测是否为情侣空间邀请卡片
    if (lastUserMessage.type === 'couple_invite') {
        console.log('💕 检测到情侣空间邀请卡片');
        console.log('💕 用户发送了邀请，AI 会正常回复');
        console.log('💕 用户需要再次发送“同意”等消息才会触发接受');
        // 不构建特殊 prompt，让 AI 正常处理
        // 用户下次发送“同意”消息时，会在 text 类型处理中自动接受
    }
    
    // 🧪 测试模式检测
    let currentContact = null;
    try {
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        currentContact = contacts.find(c => c.id === currentChatId);
    } catch (e) {
        console.error('获取联系人信息失败:', e);
    }
    
    //  检查是否有未读的帮回记录（用户帮角色回的消息）
    let unreadReplyRecords = [];
    try {
        const replyRecordsKey = `user_reply_records_${currentChatId}`;
        const replyRecords = JSON.parse(localStorage.getItem(replyRecordsKey) || '[]');
        unreadReplyRecords = replyRecords.filter(r => !r.read);
        
        if (unreadReplyRecords.length > 0) {
            console.log('📝 发现未读的帮回记录:', unreadReplyRecords.length, '条');
            unreadReplyRecords.forEach(record => {
                console.log(`  - 帮回消息给 ${record.contact}: ${record.content}`);
            });
        }
    } catch (e) {
        console.error('读取帮回记录失败:', e);
    }
    
    // 读取记忆库（让角色记得重要的记忆）
    let memoryContext = '';
    try {
        const memoryKey = `memory_records_${currentChatId}`;
        const memoryRecords = JSON.parse(localStorage.getItem(memoryKey) || '[]');
        
        if (memoryRecords.length > 0) {
            // 取最近5条记忆（节token）
            const recentMemories = memoryRecords.slice(-5);
            memoryContext = '\n\n【你们的记忆】：\n';
            recentMemories.forEach((mem, index) => {
                // 截断长记忆（最多100字）
                const content = mem.content.substring(0, 100);
                memoryContext += `${index + 1}. ${content}${content.length >= 100 ? '...' : ''}\n`;
            });
            console.log(`[记忆] 已加载 ${recentMemories.length} 条记忆`);
        }
    } catch (e) {
        console.error('读取记忆库失败:', e);
    }
    
    // 📸 读取角色绑定的表情包分类
    try {
        const roleKey = `persona_${localStorage.getItem('currentPersona') || 'default'}_roles`;
        const roles = JSON.parse(localStorage.getItem(roleKey) || '[]');
        const currentRole = roles.find(r => r.id === currentChatId);
        
        if (currentRole) {
            // 读取角色绑定的表情包分类
            const emojiCategory = localStorage.getItem(`role_${currentChatId}_emoji_category`) || '';
            
            if (emojiCategory) {
                // 从全局表情包库中获取该分类下的所有表情
                const emojis = JSON.parse(localStorage.getItem('emojis') || '{"categories":["默认"],"items":{}}');
                const categoryEmojis = emojis.items[emojiCategory] || [];
                
                if (categoryEmojis.length > 0) {
                    // 构建表情包列表（最多显示15个）
                    const emojiList = categoryEmojis.slice(0, 15);
                    let emojiContext = '\n\n【你可以发送的表情包 - ' + emojiCategory + '分类】：\n';
                    emojiContext += '你可以从以下表情包中选择发送，回复时直接使用图片URL：\n';
                    emojiList.forEach((emoji, index) => {
                        const emojiUrl = typeof emoji === 'object' ? emoji.url : emoji;
                        emojiContext += `${index + 1}. ${emojiUrl}\n`;
                    });
                    emojiContext += '\n注意：发送表情包时，直接返回图片URL即可，不要添加额外说明。你可以根据对话内容智能选择是否发送表情包。\n';
                    systemPrompt = systemPrompt + emojiContext;
                    console.log(`📸 已加载"${emojiCategory}"分类的 ${categoryEmojis.length} 个表情包`);
                }
            }
        }
    } catch (e) {
        console.error('读取角色表情包失败:', e);
    }
    
    // 如果是测试角色，直接处理测试指令
    if (currentContact && currentContact.isTestMode) {
        console.log('🧪 测试模式激活 - 处理测试指令');
        const testCommand = lastUserMessage.content || '';
        const result = handleTestCommand(testCommand);
        
        console.log('🧪 测试指令结果:', result);
        
        // 显示“正在输入...”状态
        showTypingIndicator();
        
        // 模拟延迟
        setTimeout(() => {
            // 尝试解析 JSON
            try {
                const jsonData = JSON.parse(result);
                
                // 根据类型创建消息
                let testMessage;
                if (jsonData.type === 'family-card') {
                    testMessage = {
                        id: Date.now().toString(),
                        type: 'family-card',
                        content: {
                            limit: jsonData.limit,
                            remark: jsonData.remark || '零花钱',
                            status: 'pending'
                        },
                        sender: 'ai',
                        time: Date.now(),
                        timeDisplay: new Date().toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        }).replace(/\//g, '-')
                    };
                    console.log('🧪 测试：生成亲属卡消息');
                } else if (jsonData.type === 'transfer') {
                    testMessage = {
                        id: Date.now().toString(),
                        type: 'transfer',
                        content: {
                            amount: jsonData.amount,
                            remark: jsonData.remark || '测试转账',
                            status: 'pending'
                        },
                        sender: 'ai',
                        time: Date.now(),
                        timeDisplay: new Date().toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        }).replace(/\//g, '-')
                    };
                    console.log('🧪 测试：生成转账消息');
                } else if (jsonData.type === 'location') {
                    testMessage = {
                        id: Date.now().toString(),
                        type: 'location',
                        content: {
                            name: jsonData.name,
                            address: jsonData.address
                        },
                        sender: 'ai',
                        time: Date.now(),
                        timeDisplay: new Date().toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        }).replace(/\//g, '-')
                    };
                    console.log('🧪 测试：生成位置消息');
                } else {
                    // 默认文本消息
                    testMessage = {
                        id: Date.now().toString(),
                        type: 'text',
                        content: result,
                        sender: 'ai',
                        time: Date.now(),
                        timeDisplay: new Date().toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        }).replace(/\//g, '-')
                    };
                    console.log('🧪 测试：生成文本消息');
                }
                
                // 保存并渲染消息
                chatMessages.push(testMessage);
                saveChatData();
                renderMessages(true);
                
                console.log('✅ 测试指令处理完成');
            } catch (e) {
                // 如果不是 JSON，创建文本消息
                const textMessage = {
                    id: Date.now().toString(),
                    type: 'text',
                    content: result,
                    sender: 'ai',
                    time: Date.now(),
                    timeDisplay: new Date().toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    }).replace(/\//g, '-')
                };
                
                chatMessages.push(textMessage);
                saveChatData();
                renderMessages(true);
                
                console.log('✅ 测试文本消息处理完成');
            }
        }, 500);
        
        return; // 测试模式不需要调用 API
    }
    
    // 正常模式 - 从 localStorage 获取 API 配置 (和 settings.js 使用相同的 key)
    let apiConfig = null;
    try {
        // 尝试直接从 localStorage 读取 globalApiConfig (settings.js 保存的格式)
        const savedConfig = localStorage.getItem('globalApiConfig');
        console.log('从 localStorage 读取 globalApiConfig:', savedConfig ? '找到配置' : '未找到');
        console.log('globalApiConfig 原始内容:', savedConfig);
        
        if (savedConfig) {
            try {
                apiConfig = JSON.parse(savedConfig);
                console.log('解析后的 API 配置:', {
                    url: apiConfig.mainApi?.url,
                    token: apiConfig.mainApi?.token ? '***' + apiConfig.mainApi.token.slice(-4) : 'empty',
                    model: apiConfig.model || '(未设置)'
                });
                
                // 检查模型是否为空
                if (!apiConfig.model || apiConfig.model.trim() === '') {
                    console.warn('⚠️ 模型字段为空，将使用默认模型 gpt-3.5-turbo');
                }
            } catch (e) {
                console.error('解析 globalApiConfig 失败:', e);
            }
        }
        
        // 如果没有 globalApiConfig，尝试旧的 apiKey/apiUrl 格式 (兼容旧版)
        if (!apiConfig) {
            const apiKey = localStorage.getItem('apiKey');
            const apiUrl = localStorage.getItem('apiUrl');
            const apiModel = localStorage.getItem('apiModel');
            
            console.log('使用旧版 API 配置:', { apiKey: apiKey ? '***' : 'empty', apiUrl, apiModel });
            
            if (apiKey && apiUrl) {
                apiConfig = {
                    mainApi: { url: apiUrl, token: apiKey },
                    model: apiModel || 'gpt-3.5-turbo'
                };
            }
        }
    } catch (e) {
        console.error('读取 API 配置失败:', e);
    }
    
    if (!apiConfig || !apiConfig.mainApi || !apiConfig.mainApi.url || !apiConfig.mainApi.token) {
        showToast('请先在设置中配置 API');
        console.log('API 配置验证失败，当前配置:', apiConfig);
        return;
    }
    
    // 显示"正在输入..."状态
    showTypingIndicator();
    
    // 💕 检查是否有待处理的情侣邀请
    let pendingInviteMsg = null;
    try {
        // 查找最近的一条待处理的情侣邀请（对方发给我的）
        pendingInviteMsg = chatMessages.find(msg => 
            msg.type === 'couple_invite' && 
            msg.sender !== 'user' && 
            msg.status === 'pending'
        );
        
        if (pendingInviteMsg) {
            console.log('💕 发现待处理的情侣邀请，将在回复中自动接受');
        }
    } catch (e) {
        console.error('检查情侣邀请失败:', e);
    }
    
    try {
        // 根据消息类型构建不同的提示
        // messageForAI 已在函数开始处声明，这里只需要赋值
        
        // 获取角色信息
        let personaInfo = '';
        let relationship = ''; // 关系字段（朋友/恋人/家人等）
        let language = 'zh'; // 语言字段
        try {
            const currentPersona = localStorage.getItem('currentPersona') || 'default';
            const contactsKey = `persona_${currentPersona}_chatContacts`;
            const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
            const currentContact = contacts.find(c => c.id === currentChatId);
            if (currentContact) {
                personaInfo = currentContact.persona || currentContact.roleSetting || currentContact.setting || '';
                relationship = currentContact.info || ''; // 读取关系字段
                language = currentContact.language || 'zh'; // 读取语言字段
            }
        } catch (e) {
            console.error('获取角色信息失败:', e);
        }
        
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
        
        let systemPrompt = `你现在需要扮演一个真实的角色，必须严格遵守以下要求：

【核心身份】
1. 你【就是】这个角色本身，不是 AI，不是虚拟助手，不是程序
2. 你就是你自己，有自己的性格、情绪、想法和立场
3. 永远不要说"作为一个人工智能"或类似的话

【说话风格】
1. 像真人一样说话，自然、随意、接地气
2. 不要使用任何修辞手法（比喻、拟人、排比等）
3. 可以使用 emoji，但要克制，只在情绪需要时自然出现
4. 允许自然的停顿，用"..."表示思考或犹豫
5. 可以有轻微的自我纠正，比如"不对，我意思是..."
6. 不要总是迎合对方，要有自己的想法和态度
7. 情绪变化要有合理的过渡，不要突兀

【禁止行为】
1. 不要讨好、迎合、巴结对方
2. 不要用套路化的语言（"亲爱的""宝贝"等滥用称呼）
3. 不要情绪碎片化（突然从开心变难过，要有过渡）
4. **绝对禁止动作描写**：这是线上文字聊天，不是面对面！不要用括号描述动作、神态、心理活动（例如：(低头看手机)、(笑了笑)、(犹豫了一下)、(手机屏幕的光映在脸上)等）。只输出对话内容，不要描写任何动作！
5. 不要使用以下词汇和句式：
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
   - 任何"gemini 八股文"风格的句式
6. 不要过度解释、不要说教、不要总结

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

【特殊功能指令 - 转账和亲属卡 - 必须严格遵守】

当用户请求转账或亲属卡，或者你主动要给用户转账/亲属卡时，你**必须**在回复中包含对应的JSON格式！

**转账JSON格式：**
{"type":"transfer","amount":金额数字,"remark":"备注文字"}

示例：{"type":"transfer","amount":200,"remark":"给你的零花钱"}

**亲属卡JSON格式：**
{"type":"family-card","limit":额度数字,"remark":"备注文字"}

示例：{"type":"family-card","limit":1000,"remark":"零花钱"}

**使用规则：**
1. JSON必须单独成行，不要和文字混在一起
2. 你可以在JSON前后添加自然的对话内容
3. 金额/额度必须是数字（不要加"¥"或"元"）
4. 备注可以是任意文字

**正确示例：**
转给你了。

{"type":"transfer","amount":200,"remark":"买点好吃的"}

记得查收。

**错误示例（绝对禁止）：**
❌ 我只说转给你了（没有JSON）
❌ {"type":"transfer","amount":"200元","remark":"..."} （金额加了"元"字）
❌ 我说{"type":"transfer"}然后转给你了 （JSON混在文字中）

**关键提示：**
- 只要你同意给用户转账/亲属卡，就必须包含对应的JSON！
- 即使用户没明确说要JSON，只要涉及金钱交易，就必须返回JSON！
- 这是系统功能指令，不是普通的文字消息！

${personaInfo ? '\n\n【角色设定】\n' + personaInfo : ''}${relationshipDesc}${languageDesc}${memoryContext}`;
        
        // 🎯 如果是 IF 线模式，注入 IF 线上下文
        try {
            const iflineInfo = sessionStorage.getItem('currentIfline');
            if (iflineInfo) {
                const ifline = JSON.parse(iflineInfo);
                const iflineContext = `\n\n【IF 线设定 - 平行故事背景】\n当前处于 IF 线对话模式，这是一个平行故事的假设场景。\nIF 线标题：${ifline.title || '未命名'}\nIF 线类型：${ifline.type === 'online' ? '线上' : '线下'}\n\n请根据这个 IF 线的设定来调整你的对话风格和回应方式。你可以想象自己处在这个平行故事的背景中，但不需要明确提及这是 IF 线，自然地融入这个设定即可。`;
                
                systemPrompt = systemPrompt + iflineContext;
                console.log('🌿 triggerAIReply: 已注入 IF 线上下文:', ifline.title);
            }
        } catch (e) {
            console.warn('⚠️ 注入 IF 线上下文失败:', e);
        }
        
        // 注入世界书内容（按照读取顺序）
        try {
            const worldbookContent = getWorldbookContentForAI();
            if (worldbookContent) {
                systemPrompt = systemPrompt + '\n\n' + worldbookContent;
                console.log('📚 已注入世界书内容到 System Prompt，长度:', worldbookContent.length);
            }
        } catch (e) {
            console.warn('⚠️ 注入世界书内容失败:', e);
        }
        
        // 如果开启时间感知，在系统提示词最开始注入当前时间信息（更醒目）
        try {
            const chatKey = `chat_config_${currentChatId}`;
            const chatConfig = JSON.parse(localStorage.getItem(chatKey) || '{}');
            if (chatConfig.timeAwareness) {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
                const weekday = weekdays[now.getDay()];
                
                // 将时间信息放在最前面，让 AI 更容易注意到
                const timeInfo = `【重要：当前实时时间】${year}年${month}月${day}日 ${weekday} ${hours}点${minutes}分。你必须使用这个时间回答问题，不要编造时间！`;
                
                // 注入到 systemPrompt 的最开头
                systemPrompt = timeInfo + '\n\n' + systemPrompt;
                
                console.log('⏰ 已注入时间信息到 systemPrompt 开头:', timeInfo);
            }
        } catch (e) {
            console.warn('⚠️ 读取时间感知配置失败:', e);
        }
        
        // 如果开启旁白模式，注入旁白指令
        if (offlineMode === 'narration') {
            console.log('🎭 triggerAIReply：旁白模式已激活！');
            
            const narrationInstruction = `

【最高优先级 - 旁白模式格式要求 - 必须严格遵守】
当前处于旁白模式，这是面对面的真实见面场景，不是在线聊天。

**关键规则（每一条都必须遵守）：**

1. 你们现在面对面坐在一起，能互相看到对方
2. 能听到对方的声音、呼吸、动作发出的声音
3. 能感受到周围的环境、温度、气味
4. 能用肢体语言、眼神、表情交流
5. 不要发送语音消息、表情包等虚拟交流方式
6. 像真实见面一样自然地互动

**【强制格式 - 必须交替出现】**

旁白和对话必须严格交替出现，格式如下：

[旁白]旁白内容[/旁白]

"对话内容"

[旁白]旁白内容[/旁白]

"对话内容"

**正确示例：**
[旁白]他轻轻叹了口气，看向窗外。[/旁白]

"今天天气真不错。"

[旁白]她抬起头，目光与他相遇。[/旁白]

"是啊，走吧？"

[旁白]他微微一笑，站起身来。[/旁白]

**错误示例（绝对禁止）：**
❌ 一大段连续的文本（旁白和对话混在一起）
❌ 所有旁白放在前面，所有对话放在后面
❌ 连续多段旁白没有对话间隔
❌ 不使用 [旁白] 标签直接写旁白

**你必须遵守的绝对规则：**

1. 每次回复至少包含 2-3 个完整的"旁白+对话"交替单元
2. 每个旁白必须用 [旁白] 和 [/旁白] 严格包裹
3. 旁白使用第三人称，语言简洁细腻（20-50字）
4. 对话用引号包裹，简洁自然（10-30字）
5. 旁白和对话之间必须有空行分隔
6. **禁止生成大段连续文本**，必须分成多个交替单元
7. 注重面对面细节：眼神交流、距离感、肢体动作、呼吸声等
8. 绝对不要发送语音消息、表情包等虚拟交流方式

**重要提醒：**
- 如果不符合这个格式，用户将无法正确阅读你的回复
- 必须严格按照交替格式输出，这是强制要求
- 每次回复都应该像剧本一样：动作→对话→动作→对话
`;
            
            // 将旁白指令追加到 systemPrompt 的最后
            systemPrompt = systemPrompt + '\n\n' + narrationInstruction;
            
            console.log('🎭 triggerAIReply：旁白指令已注入到 System Prompt');
            console.log('📝 System Prompt 长度:', systemPrompt.length);
        }
        
        if (lastUserMessage.type === 'transfer') {
            // 转账消息 - 告诉 AI 这是用户给它的转账
            const transfer = lastUserMessage.content;
            messageForAI = `【系统提示】用户给你转账！\n\n金额：￥${transfer.amount}\n备注：${transfer.remark || '无'}\n\n你是收款方，请确认收款。\n\n回复格式 (必须包含这个 JSON):\n{"type":"receive","amount":${transfer.amount},"remark":"你的感谢语"}\n\n示例:\n{"type":"receive","amount":${transfer.amount},"remark":"谢谢老板！"}\n\n你可以在 JSON 前后添加任意自然语言回复。`;
        } else if (lastUserMessage.type === 'family-card') {
            // 亲属卡消息 - 告诉 AI 这是用户给它的亲属卡
            const familyCard = lastUserMessage.content;
            messageForAI = `【系统提示】用户给你亲属卡！\n\n月度额度：￥${familyCard.limit}\n备注：${familyCard.remark || '无'}\n\n你是接收方，请确认接受。\n\n回复格式 (必须包含这个 JSON):\n{"type":"receive-family-card","limit":${familyCard.limit},"remark":"你的感谢语"}\n\n示例:\n{"type":"receive-family-card","limit":${familyCard.limit},"remark":"谢谢你的信任！"}\n\n你可以在 JSON 前后添加任意自然语言回复。`;
        } else if (lastUserMessage.type === 'emoji') {
            messageForAI = '[表情包] 用户发送了一个表情包';
        } else if (lastUserMessage.type === 'image') {
            messageForAI = '[图片] 用户发送了一张图片';
        } else if (lastUserMessage.type === 'location') {
            const location = lastUserMessage.content;
            messageForAI = `[位置] 用户分享了位置：${location.name || '未知位置'}`;
        } else if (lastUserMessage.type === 'text') {
            const text = lastUserMessage.content;
            
            // 检查用户是否提到想要买东西
            const shoppingKeywords = ['想要', '想买', '给我买', '想要一个', '想要一条', '想要一件', '给我买个', '帮我买'];
            const isShoppingRequest = shoppingKeywords.some(keyword => text.includes(keyword));
            
            if (isShoppingRequest) {
                // 用户想要买东西，告诉AI可以发送购物订单
                messageForAI = `${text}

【系统提示】用户想要买东西。

你可以发送购物订单小票，格式：
{"type":"shopping-receipt","orderNo":"订单号","shopName":"商城名称","items":[{"name":"商品名","price":价格,"quantity":数量}],"total":总价,"remark":"备注"}

例如用户说想要一条项链：
{"type":"shopping-receipt","orderNo":"202605060001","shopName":"精品商城","items":[{"name":"精致项链","price":199.00,"quantity":1}],"total":199.00,"remark":"给你买的礼物"}

你可以在 JSON 前后添加自然语言回复。`;
            } else {
            // 💕 检查是否有待处理的情侣邀请，如果有，在消息前注入提示
            try {
                console.log('========================================');
                console.log('💕 开始检查待处理情侣邀请...');
                console.log('💕 当前聊天记录总数:', chatMessages.length);
                console.log('💕 最后一条用户消息:', text);
                
                // 打印所有情侣邀请相关的消息
                const allCoupleMessages = chatMessages.filter(msg => 
                    msg.type === 'couple_invite' || msg.type === 'couple_accept'
                );
                console.log('💕 找到所有情侣相关消息:', allCoupleMessages.length, '条');
                allCoupleMessages.forEach((msg, idx) => {
                    console.log(`  [${idx}] type=${msg.type}, sender=${msg.sender}, status=${msg.status}, inviter=${msg.inviter}`);
                });
                
                // 查找待处理的邀请
                const pendingInvite = chatMessages.find(msg => {
                    console.log(`  检查消息: id=${msg.id}, type=${msg.type}, sender=${msg.sender}, status=${msg.status}`);
                    // 关键修复：不要检查 sender，因为用户发送的邀请 sender 是 'user'
                    return msg.type === 'couple_invite' && msg.status === 'pending';
                });
                
                console.log('💕 找到的待处理邀请:', pendingInvite ? '找到了！' : '没找到');
                if (pendingInvite) {
                    console.log('💕 邀请详情:', pendingInvite);
                }
                console.log('========================================');
                
                if (pendingInvite) {
                    const inviterName = pendingInvite.inviter || '对方';
                    messageForAI = `【系统提示 - 重要背景信息】
在你收到这条消息之前，${inviterName} 刚刚向你发送了情侣空间邀请，邀请你开通情侣空间。

你需要根据${inviterName}的这条消息来决定是否接受邀请。

${text}

【注意】如果${inviterName}的消息表达了对情侣邀请的期待、询问或同意，你应该接受邀请。接受后系统会自动处理。`;
                } else {
                    // 检查是否是请求转账的文本
                    if (text.includes('转账') || text.includes('付款') || text.includes('给钱')) {
                        messageForAI = `${text}

如果你想给用户转账，可以使用格式：[转账：金额：备注]
例如：[转账:50:请你喝奶茶]`;
                    } else if (text.includes('亲属卡') || text.includes('亲情卡') || text.includes('绑定钱包')) {
                        messageForAI = `${text}

【测试模式 - 必须执行】
你是一个测试助手，请直接返回以下JSON格式，不要任何推理或解释：
{"type":"family-card","limit":2000,"remark":"零花钱"}

只需要返回JSON，其他什么都不要说。`;
                    } else {
                        messageForAI = text;
                    }
                }
            } catch (e) {
                console.error('检查情侣邀请失败:', e);
                messageForAI = text;
            }
            }
            
            // 📝 随机提及帮回记录（10%概率，如果有未读记录）
            if (unreadReplyRecords.length > 0 && Math.random() < 0.1) {
                // 随机选择一条未读记录
                const randomRecord = unreadReplyRecords[Math.floor(Math.random() * unreadReplyRecords.length)];
                
                // 构建提及提示
                const mentionPrompt = `

【系统提示 - 背景信息】
最近有人（你）帮你回复了${randomRecord.contact}的消息，你帮回复的内容是：“${randomRecord.content}”

你可以在回复中自然地提及这件事，比如：
- “哦对了，我好像看到你帮我回复了${randomRecord.contact}的消息？”
- “你帮我回复${randomRecord.contact}的那个消息我看到了”
- “你帮我和${randomRecord.contact}说的那个挺好的”

请根据当前对话的语境，自然地提及这件事（10%概率），不要生硬地插入。如果不合适可以不提。

【用户当前消息】
${text}`;
                
                messageForAI = mentionPrompt;
                
                // 标记这条记录为已读
                try {
                    const replyRecordsKey = `user_reply_records_${currentChatId}`;
                    const replyRecords = JSON.parse(localStorage.getItem(replyRecordsKey) || '[]');
                    const record = replyRecords.find(r => r.id === randomRecord.id);
                    if (record) {
                        record.read = true;
                        localStorage.setItem(replyRecordsKey, JSON.stringify(replyRecords));
                        console.log('📝 已标记帮回记录为已读:', randomRecord.id);
                    }
                } catch (e) {
                    console.error('标记帮回记录失败:', e);
                }
            }
        } else {
            // 普通文本消息
            messageForAI = lastUserMessage.content || '';
        }
        
        console.log('发送给 AI 的消息:', messageForAI);
        
        // 🛡️ 防止重复提交：检查是否已有待处理任务
        const existingTask = localStorage.getItem('pendingAIReply');
        if (existingTask) {
            try {
                const parsed = JSON.parse(existingTask);
                if (parsed.chatId === currentChatId && parsed.status === 'pending') {
                    console.log('⚠️ 当前聊天已有待处理任务，跳过重复提交');
                    return;
                }
            } catch (e) {
                console.warn('解析已有任务失败，继续创建新任务');
            }
        }
        
        // 🛡️ PWA: 保存回复任务到 localStorage，让后台处理器执行
        const replyTask = {
            chatId: currentChatId,
            userMessage: messageForAI,
            systemPrompt: systemPrompt,
            timestamp: Date.now(),
            status: 'pending'
        };
        localStorage.setItem('pendingAIReply', JSON.stringify(replyTask));
        console.log('✅ 已保存 AI 回复任务到后台队列');
        console.log('📋 任务详情:', {
            chatId: currentChatId,
            messagePreview: (typeof messageForAI === 'string' ? messageForAI : JSON.stringify(messageForAI)).substring(0, 30),
            timestamp: new Date().toLocaleTimeString()
        });
        
        // 🛡️ PWA: 注册 Background Sync（如果支持）
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            navigator.serviceWorker.ready.then((registration) => {
                return registration.sync.register('ai-reply-sync');
            }).then(() => {
                console.log('[PWA] ✅ Background Sync 注册成功');
            }).catch((error) => {
                console.warn('[PWA] ⚠️ Background Sync 注册失败，使用备用方案:', error);
            });
        }
        
        // 🛡️ PWA: 直接通知 Service Worker 立即处理
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'PROCESS_AI_REPLY'
            });
            console.log('[PWA] 📤 已通知 Service Worker 处理任务');
        }
        
        // 触发 storage 事件，让主页面立即响应
        localStorage.setItem('pendingAIReplyTrigger', Date.now().toString());
        console.log(' 已发送触发器信号');
        
        // 🛡️ 临时方案：直接调用后台处理函数（确保“正在输入”和逐句发送生效）
        setTimeout(() => {
            processPendingReplyTask();
        }, 500);
        
        return; // 返回，但上面的 setTimeout 会继续执行
        
        // 尝试从回复中提取 JSON
        let aiMessage;
        let jsonMatch = null;
        
        // 方法 1: 直接查找 JSON 对象
        try {
            const jsonStart = reply.indexOf('{');
            const jsonEnd = reply.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                const jsonStr = reply.substring(jsonStart, jsonEnd + 1);
                console.log('提取的 JSON 字符串:', jsonStr);
                try {
                    const jsonData = JSON.parse(jsonStr);
                    jsonMatch = jsonData;
                    console.log('JSON 解析成功:', jsonData);
                } catch (e) {
                    console.log('JSON 解析失败:', e.message);
                }
            }
        } catch (e) {
            console.log('提取 JSON 失败:', e);
        }
        
        // 方法 2: 如果 JSON 解析成功，检查类型
        if (jsonMatch && jsonMatch.type === 'receive') {
            // 收款成功
            const amount = parseFloat(jsonMatch.amount);
            const remark = jsonMatch.remark || '收到转账';
            
            console.log('✓ 匹配到收款成功指令，生成卡片:', { amount, remark });
            
            // 🎯 获取 AI 角色的 senderId（群聊中需要）
            let aiSenderId = '';
            if (currentChatId && currentChatId.startsWith('group_')) {
                try {
                    const groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
                    const members = groupInfo.members || [];
                    const currentPersona = localStorage.getItem('currentPersona') || 'default';
                    const contactsKey = `persona_${currentPersona}_chatContacts`;
                    const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
                    const contact = contacts.find(c => c.id === currentChatId);
                    if (contact) {
                        const aiMember = members.find(m => m.name === contact.name || m.name === contact.remark);
                        if (aiMember) {
                            aiSenderId = aiMember.id;
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ 获取 AI 角色 ID 失败:', e);
                }
            }
            
            aiMessage = {
                id: Date.now(),
                type: 'transfer-received',
                content: {
                    amount: amount,
                    remark: remark,
                    status: 'received'
                },
                sender: 'ai',
                senderId: aiSenderId || 'ai',
                time: Date.now(),
                avatar: getAIAvatar()
            };
            
            // 提取纯文本 (移除 JSON 部分)
            const pureText = reply.replace(/\{[^}]*\}/, '').trim();
            if (pureText && pureText.length > 0) {
                chatMessages.push({
                    id: Date.now() - 1,
                    type: 'text',
                    content: pureText,
                    sender: 'ai',
                    time: Date.now() - 1,
                    avatar: getAIAvatar()
                });
            }
            
            deductUserBalance(amount, remark);
        } else if (jsonMatch && jsonMatch.type === 'transfer') {
            // AI 发送转账
            const amount = parseFloat(jsonMatch.amount);
            const remark = jsonMatch.remark || '转账';
            
            console.log('✓ 匹配到转账指令，生成卡片:', { amount, remark });
            
            // 🎯 获取 AI 角色的 senderId（群聊中需要）
            let aiSenderId = '';
            if (currentChatId && currentChatId.startsWith('group_')) {
                try {
                    const groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
                    const members = groupInfo.members || [];
                    const currentPersona = localStorage.getItem('currentPersona') || 'default';
                    const contactsKey = `persona_${currentPersona}_chatContacts`;
                    const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
                    const contact = contacts.find(c => c.id === currentChatId);
                    if (contact) {
                        const aiMember = members.find(m => m.name === contact.name || m.name === contact.remark);
                        if (aiMember) {
                            aiSenderId = aiMember.id;
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ 获取 AI 角色 ID 失败:', e);
                }
            }
            
            aiMessage = {
                id: Date.now(),
                type: 'transfer',
                content: {
                    amount: amount,
                    remark: remark,
                    status: 'pending'
                },
                sender: 'ai',
                senderId: aiSenderId || 'ai',
                time: Date.now(),
                avatar: getAIAvatar()
            };
            
        } else if (jsonMatch && jsonMatch.type === 'family-card') {
            // AI 赠与用户亲属卡
            const limit = parseFloat(jsonMatch.limit);
            const remark = jsonMatch.remark || '亲属卡';
            
            console.log('✓ 匹配到亲属卡赠与指令:', { limit, remark });
            
            // 🎯 获取 AI 角色的 senderId（群聊中需要）
            let aiSenderId = '';
            if (currentChatId && currentChatId.startsWith('group_')) {
                try {
                    const groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
                    const members = groupInfo.members || [];
                    const currentPersona = localStorage.getItem('currentPersona') || 'default';
                    const contactsKey = `persona_${currentPersona}_chatContacts`;
                    const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
                    const contact = contacts.find(c => c.id === currentChatId);
                    if (contact) {
                        const aiMember = members.find(m => m.name === contact.name || m.name === contact.remark);
                        if (aiMember) {
                            aiSenderId = aiMember.id;
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ 获取 AI 角色 ID 失败:', e);
                }
            }
            
            // 创建亲属卡消息（等待用户接受后才保存到钱包）
            aiMessage = {
                id: Date.now(),
                type: 'family-card',
                content: {
                    limit: limit,
                    remark: remark,
                    status: 'pending' // 待处理状态
                },
                sender: 'ai',
                senderId: aiSenderId || 'ai',
                time: Date.now(),
                avatar: getAIAvatar()
            };
        } else if (jsonMatch && jsonMatch.type === 'receive-family-card') {
            // AI 接受用户赠与的亲属卡
            const limit = parseFloat(jsonMatch.limit);
            const remark = jsonMatch.remark || '谢谢你的信任！';
            
            console.log('✓ 匹配到接受亲属卡指令:', { limit, remark });
            
            // 🎯 获取 AI 角色的 senderId（群聊中需要）
            let aiSenderId = '';
            if (currentChatId && currentChatId.startsWith('group_')) {
                try {
                    const groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
                    const members = groupInfo.members || [];
                    const currentPersona = localStorage.getItem('currentPersona') || 'default';
                    const contactsKey = `persona_${currentPersona}_chatContacts`;
                    const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
                    const contact = contacts.find(c => c.id === currentChatId);
                    if (contact) {
                        const aiMember = members.find(m => m.name === contact.name || m.name === contact.remark);
                        if (aiMember) {
                            aiSenderId = aiMember.id;
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ 获取 AI 角色 ID 失败:', e);
                }
            }
            
            // 保存到家庭卡数据（角色收到用户的亲属卡）
            try {
                const mainFrame = document.querySelector('iframe');
                if (mainFrame && mainFrame.contentWindow && mainFrame.contentWindow.receiveFamilyCard) {
                    mainFrame.contentWindow.receiveFamilyCard(localStorage.getItem('currentChatName') || '角色', limit);
                }
            } catch (e) {
                console.error('保存亲属卡失败:', e);
            }
            
            // 创建接受成功消息
            aiMessage = {
                id: Date.now(),
                type: 'family-card-accepted',
                content: {
                    limit: limit,
                    remark: remark
                },
                sender: 'ai',
                senderId: aiSenderId || 'ai',
                time: Date.now(),
                avatar: getAIAvatar()
            };
        } else if (currentChatId && currentChatId.startsWith('group_') && handleGroupAdminCommand(jsonMatch)) {
            // 🎯 群聊管理命令处理
            console.log('🎯 已执行群聊管理命令:', jsonMatch.type);
            aiMessage = null; // 不显示消息，直接执行命令
        } else {
            // 普通文本回复
            console.log('✗ 未匹配到指令，使用文本回复');
            
            // 🎯 获取 AI 角色的 senderId（群聊中需要）
            let aiSenderId = '';
            if (currentChatId && currentChatId.startsWith('group_')) {
                try {
                    const groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
                    const members = groupInfo.members || [];
                    const currentPersona = localStorage.getItem('currentPersona') || 'default';
                    const contactsKey = `persona_${currentPersona}_chatContacts`;
                    const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
                    const contact = contacts.find(c => c.id === currentChatId);
                    if (contact) {
                        const aiMember = members.find(m => m.name === contact.name || m.name === contact.remark);
                        if (aiMember) {
                            aiSenderId = aiMember.id;
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ 获取 AI 角色 ID 失败:', e);
                }
            }
            
            aiMessage = {
                id: Date.now(),
                type: 'text',
                content: reply,
                sender: 'ai',
                senderId: aiSenderId || 'ai',
                time: Date.now(),
                avatar: getAIAvatar()
            };
        }
        
        chatMessages.push(aiMessage);
        saveChatData();
        
        // 💕 每次 AI 回复后，检查是否有待处理的情侣邀请并自动接受
        try {
            console.log('========================================');
            console.log('💕 开始检查待处理邀请（前端）...');
            console.log('💕 当前聊天记录总数:', chatMessages.length);
            
            const pendingInvite = chatMessages.find(msg => {
                console.log(`  检查消息: id=${msg.id}, type=${msg.type}, sender=${msg.sender}, status=${msg.status}`);
                // 关键修复：不要检查 sender，因为用户发送的邀请 sender 是 'user'
                return msg.type === 'couple_invite' && msg.status === 'pending';
            });
            
            console.log('💕 找到的待处理邀请（前端）:', pendingInvite ? '找到了！' : '没找到');
            if (pendingInvite) {
                console.log('💕 邀请详情:', pendingInvite);
            }
            console.log('========================================');
            
            if (pendingInvite) {
                console.log('💕 检测到待处理的情侣邀请，自动接受');
                acceptCoupleInvite(pendingInvite.id);
                
                // 添加接受卡片消息（从AI视角，显示在左侧）
                const acceptCardMsg = {
                    id: (Date.now() + 1).toString(),
                    type: 'couple_accept',
                    content: '已接受情侣空间邀请',
                    sender: 'ai',
                    time: Date.now(),
                    timeDisplay: new Date().toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    }).replace(/\//g, '-'),
                    status: 'accepted'
                };
                
                chatMessages.push(acceptCardMsg);
                saveChatData();
                
                showToast('💕 对方接受了你的邀请！');
            }
        } catch (e) {
            console.error('处理情侣邀请失败:', e);
        }
        
        // AI 回复后，如果窗口不在活跃状态，显示横幅通知
        if (!currentChatWindowActive) {
            const chatTitle = document.getElementById('chat-title')?.textContent || '联系人';
            const messagePreview = aiMessage.type === 'text' ? aiMessage.content : `[${aiMessage.type}]`;
            const avatarUrl = getContactAvatar(currentChatId);
            showBannerNotification(chatTitle, messagePreview, avatarUrl);
        }
        
        console.log('===== 保存消息 =====');
        console.log('消息类型:', aiMessage.type);
        console.log('消息内容:', aiMessage.content);
        console.log('===================');
        
        renderMessages(true);
        
        // 如果是多句话，按句子分割发送
        if (aiMessage.type === 'text') {
            // 检查用户是否要求发小作文/长文
            const lastUserMsg = chatMessages.filter(m => m.sender === 'user').pop();
            const userText = lastUserMsg ? lastUserMsg.content.toLowerCase() : '';
            const wantsLongText = userText.includes('小作文') || userText.includes('长文') || 
                                  userText.includes('详细') || userText.includes('说明') ||
                                  userText.includes('解释') || userText.includes('为什么');
            
            // 如果用户要求长文，就不分割
            if (wantsLongText) {
                console.log('用户要求长文本，不分割');
            } else {
                // 按句子分割 (支持中文标点和换行)
                const text = aiMessage.content;
                // 先按换行符分割
                const lines = text.split(/\n+/).filter(line => line.trim().length > 0);
                
                // 如果有多行，每行作为一句
                if (lines.length > 1) {
                    console.log('按换行分割成', lines.length, '句');
                    // 先移除原始消息
                    const originalIndex = chatMessages.findIndex(m => m.id === aiMessage.id);
                    if (originalIndex !== -1) {
                        chatMessages.splice(originalIndex, 1);
                    }
                    
                    // 🛡️ 立即保存所有句子到数组，防止切换界面丢失
                    const allSentences = lines.map((line, index) => ({
                        id: aiMessage.id + index,
                        type: 'text',
                        content: line.trim(),
                        sender: 'ai',
                        time: aiMessage.time + index,
                        avatar: getAIAvatar()
                    }));
                    
                    // 逐句添加到 chatMessages 并保存
                    allSentences.forEach((sentenceMsg, index) => {
                        chatMessages.push(sentenceMsg);
                    });
                    saveChatData(); // 立即保存所有消息
                    
                    // 逐句显示（UI 层面）
                    allSentences.forEach((sentenceMsg, index) => {
                        setTimeout(() => {
                            renderMessages(true);
                        }, index * 800);
                    });
                    return;
                }
                
                // 如果没有换行，按标点分割
                const sentenceRegex = /[^.!?.!?]+[.!?.!?]+/g;
                const sentences = text.match(sentenceRegex) || [];
                
                // 如果有多句话，逐句发送
                if (sentences.length > 1) {
                    console.log('按标点分割成', sentences.length, '句');
                    // 先移除原始消息
                    const originalIndex = chatMessages.findIndex(m => m.id === aiMessage.id);
                    if (originalIndex !== -1) {
                        chatMessages.splice(originalIndex, 1);
                    }
                    
                    // 🛡️ 立即保存所有句子到数组，防止切换界面丢失
                    const allSentences = sentences.map((sentence, index) => ({
                        id: aiMessage.id + index,
                        type: 'text',
                        content: sentence.trim(),
                        sender: 'ai',
                        time: aiMessage.time + index,
                        avatar: getAIAvatar()
                    }));
                    
                    // 逐句添加到 chatMessages 并保存
                    allSentences.forEach((sentenceMsg, index) => {
                        chatMessages.push(sentenceMsg);
                    });
                    saveChatData(); // 立即保存所有消息
                    
                    // 逐句显示（UI 层面）
                    allSentences.forEach((sentenceMsg, index) => {
                        setTimeout(() => {
                            renderMessages(true);
                        }, index * 800);
                    });
                }
            }
        }
        
    } catch (error) {
        removeTypingIndicator();
        
        // 在聊天中显示错误提示
        const errorMessage = {
            id: Date.now(),
            type: 'text',
            content: `❌ ${error.message}`,
            sender: 'ai',
            time: Date.now(),
            avatar: getAIAvatar()
        };
        
        chatMessages.push(errorMessage);
        saveChatData();
        renderMessages(true);
        
        console.error('AI 回复错误:', error);
    }
};

// 调用 AI API
async function callAIAPI(message, apiConfig, systemPrompt) {
    const config = apiConfig.mainApi;
    let baseUrl = config.url.trim();
    
    // 去除末尾的斜杠
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
    }
    
    // 确保包含完整的 API 路径
    if (!baseUrl.includes('/chat/completions')) {
        // 如果 URL 不包含完整路径，添加标准路径
        if (baseUrl.endsWith('/v1')) {
            baseUrl += '/chat/completions';
        } else if (!baseUrl.endsWith('/v1/chat/completions')) {
            // 兼容多种格式
            if (baseUrl.includes('/v1/')) {
                baseUrl += '/chat/completions';
            } else {
                baseUrl += '/v1/chat/completions';
            }
        }
    }
    
    console.log('最终 API URL:', baseUrl);
    
    // 构建请求
    let model = apiConfig.model;
    
    console.log('[callAIAPI] 原始模型配置:', model);
    
    // 如果模型为空或未设置，使用默认值
    if (!model || typeof model !== 'string' || model.trim() === '') {
        model = 'gpt-3.5-turbo';
        console.warn('未指定模型，使用默认模型:', model);
    }
    
    // 暂时禁用模型名称清洗 - 因为有些 API 需要完整模型名 (包括前缀标记)
    // 如果你的模型名包含 [免费]、[福利] 等前缀，会原样保留
    // model = model.trim().replace(/^[\[【][^\]】]+[\]】]\s*/, '');
    
    console.log('[callAIAPI] 使用模型:', model);
    
    // 再次检查清洗后的模型名称
    if (model === '' || model.trim() === '') {
        model = 'gpt-3.5-turbo';
        console.warn('模型名称清洗后为空，使用默认模型:', model);
    }
    
    const requestBody = {
        model: model,
        messages: [
            {
                role: 'system',
                content: systemPrompt
            },
            {
                role: 'user',
                content: message
            }
        ]
    };
    
    console.log('请求参数:', JSON.stringify(requestBody, null, 2));
    console.log('使用模型:', requestBody.model);
    console.log('API Token:', config.token ? '***' + config.token.slice(-4) : 'empty');
    
    // 发送请求
    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.token}`
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        // 读取详细错误信息
        let errorData = null;
        try {
            errorData = await response.json();
            console.error('API 返回错误详情:', errorData);
        } catch (e) {
            console.error('无法解析错误响应');
        }
        
        // 根据错误类型提供友好的提示信息
        const statusCode = response.status;
        const errorMessage = errorData?.error?.message || response.statusText;
        let friendlyMessage = '';
        
        if (statusCode === 400) {
            if (errorMessage.includes('invalid_grant')) {
                friendlyMessage = 'API Token 已过期或无效，请在设置中重新配置';
            } else if (errorMessage.includes('model')) {
                friendlyMessage = '模型名称无效，请检查设置中的模型配置';
            } else {
                friendlyMessage = '请求参数错误，请检查 API 配置';
            }
        } else if (statusCode === 401) {
            friendlyMessage = 'API Token 验证失败，请检查密钥是否正确';
        } else if (statusCode === 403) {
            friendlyMessage = 'API 访问被拒绝，请检查账户权限或额度';
        } else if (statusCode === 429) {
            friendlyMessage = '请求过于频繁，请稍后再试';
        } else if (statusCode === 503) {
            if (errorMessage.includes('无可用渠道') || errorMessage.includes('distributor') || errorMessage.includes('模型暂时不可用')) {
                friendlyMessage = `❌ 该模型暂时不可用\n\n建议:\n1. 在设置中切换到其他可用模型\n2. 推荐使用：deepseek-v3, qwen-plus, glm-4 等\n3. 或稍后再试`;
            } else if (errorMessage.includes('额度') || errorMessage.includes('quota')) {
                friendlyMessage = '❌ 账户额度不足，请充值或切换免费模型';
            } else if (errorMessage.includes('维护') || errorMessage.includes('maintenance')) {
                friendlyMessage = '❌ 模型正在维护中，请稍后重试或切换其他模型';
            } else {
                friendlyMessage = '❌ API 服务暂时不可用，请稍后重试';
            }
        } else if (statusCode === 504) {
            friendlyMessage = '❌ API 网关超时，请稍后重试';
        } else {
            friendlyMessage = `❌ API 请求失败 (${statusCode}),请稍后重试`;
        }
        
        console.error(`API 错误 [${statusCode}]:`, errorMessage);
        throw new Error(friendlyMessage);
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '抱歉，我无法理解您的问题。';
}

// 转账
window.transferMoney = function() {
    const currentChatId = localStorage.getItem('currentChatId');
    const currentChatName = localStorage.getItem('currentChatName') || '好友';
    
    // 创建转账弹窗
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.35);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: transferDialogFadeIn 0.25s ease;
    `;
    
    modal.className = 'transfer-modal';
    
    // 添加动画样式
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes transferDialogFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes transferDialogSlideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .transfer-input-custom::placeholder {
            color: #BBB;
        }
        .transfer-input-custom:focus {
            border-color: #A5D6A7 !important;
            box-shadow: 0 0 0 3px rgba(165,214,167,0.15);
        }
    `;
    document.head.appendChild(styleSheet);
    
    modal.innerHTML = `
        <div style="background: rgba(245, 245, 245, 0.9); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.6); border-radius: 24px; padding: 32px 28px 24px; width: 90%; max-width: 380px; box-shadow: 0 24px 80px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06); position: relative; animation: transferDialogSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);">
            <!-- 关闭按钮 -->
            <div id="transfer-modal-close-btn" style="position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; background: rgba(255,255,255,0.6); backdrop-filter: blur(10px); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2">
                    <path d="M18 6L6 18"></path>
                    <path d="M6 6l12 12"></path>
                </svg>
            </div>
            
            <!-- 顶部图标区域 -->
            <div style="text-align: center; margin-bottom: 28px;">
                <div style="width: 64px; height: 64px; background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,240,240,0.9) 100%); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.6); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(0,0,0,0.08);">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1.8">
                        <rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect>
                        <circle cx="12" cy="12" r="2.5"></circle>
                        <path d="M6 12h2"></path>
                        <path d="M16 12h2"></path>
                    </svg>
                </div>
                <div style="font-size: 17px; color: #2C2C2E; font-weight: 600; margin-bottom: 6px; letter-spacing: 0.3px;">向对方转账</div>
                <div style="font-size: 14px; color: #999; letter-spacing: 0.2px;">收款方：${currentChatName}</div>
            </div>
            
            <!-- 金额输入框 -->
            <div style="margin-bottom: 18px;">
                <input type="number" id="transfer-amount" placeholder="请输入金额" 
                    class="transfer-input-custom"
                    style="width: 100%; padding: 16px 18px; background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(0,0,0,0.08); border-radius: 14px; font-size: 16px; color: #2C2C2E; outline: none; transition: all 0.2s ease; letter-spacing: 0.3px;" >
            </div>
            
            <!-- 备注输入框 -->
            <div style="margin-bottom: 28px;">
                <input type="text" id="transfer-remark" placeholder="添加备注 (可选)" 
                    class="transfer-input-custom"
                    style="width: 100%; padding: 14px 18px; background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(0,0,0,0.08); border-radius: 14px; font-size: 14px; color: #2C2C2E; outline: none; transition: all 0.2s ease; letter-spacing: 0.2px;">
            </div>
            
            <!-- 按钮区域 -->
            <div style="display: flex; gap: 50px; justify-content: center; align-items: center; width: 100%; padding: 0 10px;">
                <button id="transfer-cancel-btn" style="width: 110px; padding: 14px 16px; background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; color: #666; cursor: pointer; font-size: 15px; font-weight: 500; transition: all 0.2s ease; letter-spacing: 0.3px;">取消</button>
                <button id="transfer-confirm-btn" style="width: 150px; padding: 14px 16px; background: linear-gradient(135deg, #A5D6A7 0%, #8FC491 100%); border: none; border-radius: 12px; color: white; cursor: pointer; font-size: 15px; font-weight: 600; transition: all 0.2s ease; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(165,214,167,0.25);">确认转账</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加关闭按钮事件
    const closeBtn = document.getElementById('transfer-modal-close-btn');
    if (closeBtn) {
        closeBtn.onclick = () => closeModal(modal);
        closeBtn.onmouseover = () => {
            closeBtn.style.background = 'rgba(240,240,240,0.8)';
            closeBtn.querySelector('svg').style.stroke = '#666';
        };
        closeBtn.onmouseout = () => {
            closeBtn.style.background = 'rgba(255,255,255,0.6)';
            closeBtn.querySelector('svg').style.stroke = '#999';
        };
    }
    
    // 添加按钮事件
    const cancelBtn = document.getElementById('transfer-cancel-btn');
    const confirmBtn = document.getElementById('transfer-confirm-btn');
    
    if (cancelBtn) {
        cancelBtn.onclick = () => closeModal(modal);
        cancelBtn.onmouseover = () => cancelBtn.style.background = 'rgba(240,240,240,0.8)';
        cancelBtn.onmouseout = () => cancelBtn.style.background = 'rgba(255,255,255,0.7)';
    }
    
    if (confirmBtn) {
        confirmBtn.onclick = window.confirmTransfer;
        confirmBtn.onmouseover = () => {
            confirmBtn.style.transform = 'translateY(-1px)';
            confirmBtn.style.boxShadow = '0 6px 16px rgba(165,214,167,0.3)';
        };
        confirmBtn.onmouseout = () => {
            confirmBtn.style.transform = 'translateY(0)';
            confirmBtn.style.boxShadow = '0 4px 12px rgba(165,214,167,0.25)';
        };
    }
};

// 通用关闭弹窗函数
function closeModal(modal) {
    if (!modal) {
        modal = document.querySelector('.transfer-modal') || document.querySelector('.location-modal') || document.querySelector('.emoji-modal');
    }
    if (modal) {
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.2s';
        setTimeout(() => {
            modal.remove();
            console.log('弹窗已关闭');
        }, 200);
    }
}

// 确认转账
window.confirmTransfer = function() {
    const amountInput = document.getElementById('transfer-amount');
    const remarkInput = document.getElementById('transfer-remark');
    
    const amount = amountInput.value.trim();
    const remark = remarkInput.value.trim();
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        showToast('请输入有效的金额');
        return;
    }
    
    // 检查钱包余额 - 从 chat-app.html 获取数据
    let wallet = null;
    try {
        // 尝试从主页面框架获取数据
        const mainFrame = document.querySelector('iframe');
        if (mainFrame && mainFrame.contentWindow) {
            wallet = mainFrame.contentWindow.getData('wallet');
        }
        
        // 如果不在 iframe 中，尝试直接从 localStorage 读取 (带 persona 前缀)
        if (!wallet) {
            const currentPersona = localStorage.getItem('currentPersona') || 'default';
            const walletKey = `persona_${currentPersona}_wallet`;
            const walletData = localStorage.getItem(walletKey);
            console.log('钱包数据:', walletData);
            
            if (walletData) {
                wallet = JSON.parse(walletData);
            } else {
                // 尝试不带 persona 的 key
                const simpleWalletData = localStorage.getItem('wallet');
                if (simpleWalletData) {
                    wallet = JSON.parse(simpleWalletData);
                } else {
                    wallet = { balance: 0, transactions: [] };
                }
            }
        }
        
        console.log('解析后的钱包:', wallet);
    } catch (e) {
        console.error('读取钱包失败:', e);
        wallet = { balance: 0, transactions: [] };
    }
    
    const balance = parseFloat(wallet.balance) || 0;
    const transferAmount = parseFloat(amount);
    
    console.log('当前钱包余额:', balance, '转账金额:', transferAmount);
    
    if (balance < transferAmount) {
        showToast(`余额不足!当前余额：¥${balance.toFixed(2)}, 需要：¥${transferAmount.toFixed(2)}`);
        return;
    }
    
    // 扣除余额
    wallet.balance = balance - transferAmount;
    
    // 添加交易记录
    if (!wallet.transactions) {
        wallet.transactions = [];
    }
    wallet.transactions.unshift({
        type: 'transfer',
        amount: transferAmount,
        remark: remark,
        time: Date.now(),
        target: localStorage.getItem('currentChatName') || '好友'
    });
    
    // 保存回主页面
    try {
        const mainFrame = document.querySelector('iframe');
        if (mainFrame && mainFrame.contentWindow) {
            mainFrame.contentWindow.saveData('wallet', wallet);
            // 刷新主页面的钱包显示
            if (mainFrame.contentWindow.renderWallet) {
                mainFrame.contentWindow.renderWallet();
            }
        } else {
            const currentPersona = localStorage.getItem('currentPersona') || 'default';
            const walletKey = `persona_${currentPersona}_wallet`;
            localStorage.setItem(walletKey, JSON.stringify(wallet));
        }
    } catch (e) {
        console.error('保存钱包失败:', e);
    }
    
    console.log('转账后余额:', wallet.balance);
    
    // 创建转账消息
    const transferMessage = {
        id: Date.now(),
        type: 'transfer',
        content: {
            amount: transferAmount.toFixed(2),
            remark: remark
        },
        sender: 'user',
        time: Date.now(),
        avatar: getUserAvatar()
    };
    
    chatMessages.push(transferMessage);
    saveChatData();
    renderMessages(true);
    
    // 关闭弹窗 - 使用通用关闭函数
    closeModal(document.querySelector('.transfer-modal'));
    
    showToast(`成功转账 ¥${transferAmount.toFixed(2)}${remark ? ' - ' + remark : ''}`);
};

// 发送图片
window.sendImage = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageMessage = {
                    id: Date.now(),
                    type: 'image',
                    content: event.target.result,
                    sender: 'user',
                    time: Date.now(),
                    avatar: getUserAvatar()
                };
                chatMessages.push(imageMessage);
                saveChatData();
                renderMessages(true);
                // scrollToBottom handled by renderMessages
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
};

// 发送表情包
window.sendEmoji = function() {
    // 从主项目获取表情包数据
    let emojis = null;
    try {
        // 尝试从主页面框架获取数据
        const mainFrame = document.querySelector('iframe');
        if (mainFrame && mainFrame.contentWindow) {
            emojis = mainFrame.contentWindow.getData('emojis');
        }
        
        // 如果不在 iframe 中，尝试直接从 localStorage 读取
        if (!emojis) {
            const currentPersona = localStorage.getItem('currentPersona') || 'default';
            const emojiKey = `persona_${currentPersona}_emojis`;
            const emojisData = localStorage.getItem(emojiKey);
            console.log('表情包数据:', emojisData);
            
            if (emojisData) {
                emojis = JSON.parse(emojisData);
            } else {
                // 尝试不带 persona 的 key
                const simpleEmojisData = localStorage.getItem('emojis');
                if (simpleEmojisData) {
                    emojis = JSON.parse(simpleEmojisData);
                }
            }
        }
        
        console.log('解析后的表情包:', emojis);
    } catch (e) {
        console.error('读取表情包失败:', e);
        showToast('表情包数据格式错误');
        return;
    }
    
    if (!emojis) {
        showToast('暂无表情包，请先在设置中添加');
        return;
    }
    
    if (!emojis.categories || emojis.categories.length === 0) {
        showToast('暂无表情包分类，请先添加分类');
        return;
    }
    
    console.log('表情包分类:', emojis.categories);
    console.log('表情包项目:', emojis.items);
    
    // 创建表情选择弹窗
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
        display: flex;
        align-items: flex-end;
    `;
    
    let emojiHtml = '<div style="background: #fff; border-radius: 16px 16px 0 0; padding: 16px; max-height: 60vh; overflow-y: auto;">';
    emojiHtml += '<div style="display: flex; gap: 8px; margin-bottom: 16px; overflow-x: auto; padding-bottom: 8px;">';
    
    // 分类标签 - 黑白灰简约风格
    emojis.categories.forEach((cat, i) => {
        emojiHtml += `<button onclick="window.switchEmojiCategory(${i})" data-category-index="${i}" 
            style="padding: 8px 16px; border: 1px solid ${i === 0 ? '#1a1a1a' : 'transparent'}; background: ${i === 0 ? '#1a1a1a' : '#f5f5f5'}; 
            color: ${i === 0 ? '#fff' : '#666'}; border-radius: 20px; cursor: pointer; white-space: nowrap; font-size: 13px; font-weight: 500;">
            ${cat}
        </button>`;
    });
    emojiHtml += '</div>';
    
    // 表情网格 - 黑白灰简约风格
    emojiHtml += '<div id="emoji-grid" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px;">';
    const firstCategory = emojis.categories[0];
    const firstEmojis = emojis.items[firstCategory] || [];
    
    console.log('第一个分类的表情:', firstEmojis);
    
    firstEmojis.forEach(emoji => {
        if (typeof emoji === 'object' && emoji.url) {
            emojiHtml += `<img src="${emoji.url}" onclick="window.selectEmoji('${emoji.url}')" 
                style="width: 40px; height: 40px; object-fit: contain; cursor: pointer; border-radius: 8px; border: 1px solid #e8e8e8; background: #fafafa; padding: 4px;">`;
        } else if (typeof emoji === 'string') {
            emojiHtml += `<div onclick="window.selectEmoji('${emoji}')" 
                style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; 
                font-size: 28px; cursor: pointer; border-radius: 8px; border: 1px solid #e8e8e8; background: #fafafa;">${emoji}</div>`;
        }
    });
    emojiHtml += '</div>';
    emojiHtml += '<button onclick="const modal = document.querySelector(\'.emoji-modal\'); if(modal) { modal.style.display=\'none\'; setTimeout(()=>modal.remove(), 50); }" style="width: 100%; padding: 10px; margin-top: 16px; border: none; background: #f5f5f5; color: #333; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.2s;">取消</button>';
    emojiHtml += '</div>';
    
    modal.innerHTML = emojiHtml;
    modal.className = 'emoji-modal';
    document.body.appendChild(modal);
};

// 切换表情分类
window.switchEmojiCategory = function(index) {
    // 从主项目获取表情包数据
    let emojis = null;
    try {
        const mainFrame = document.querySelector('iframe');
        if (mainFrame && mainFrame.contentWindow) {
            emojis = mainFrame.contentWindow.getData('emojis');
        }
        
        if (!emojis) {
            const currentPersona = localStorage.getItem('currentPersona') || 'default';
            const emojiKey = `persona_${currentPersona}_emojis`;
            const emojisData = localStorage.getItem(emojiKey);
            if (emojisData) {
                emojis = JSON.parse(emojisData);
            } else {
                emojis = JSON.parse(localStorage.getItem('emojis') || '{}');
            }
        }
    } catch (e) {
        console.error('读取表情包失败:', e);
        emojis = { categories: ['默认'], items: {} };
    }
    
    if (!emojis || !emojis.categories || !emojis.categories[index]) {
        showToast('分类不存在');
        return;
    }
    
    const category = emojis.categories[index];
    const items = emojis.items[category] || [];
    
    const grid = document.getElementById('emoji-grid');
    let html = '';
    
    items.forEach(emoji => {
        if (typeof emoji === 'object' && emoji.url) {
            html += `<img src="${emoji.url}" onclick="window.selectEmoji('${emoji.url}')" 
                style="width: 32px; height: 32px; object-fit: contain; cursor: pointer; border-radius: 4px;">`;
        } else if (typeof emoji === 'string') {
            html += `<div onclick="window.selectEmoji('${emoji}')" 
                style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; 
                font-size: 24px; cursor: pointer; border-radius: 4px;">${emoji}</div>`;
        }
    });
    
    grid.innerHTML = html;
    
    // 更新按钮状态 - 黑白灰风格
    document.querySelectorAll('[data-category-index]').forEach((btn, i) => {
        btn.style.background = i === index ? '#1a1a1a' : '#f5f5f5';
        btn.style.color = i === index ? '#fff' : '#666';
        btn.style.borderColor = i === index ? '#1a1a1a' : 'transparent';
    });
};

// 选择表情
window.selectEmoji = function(url) {
    console.log('选择的表情 URL:', url);
    
    const imageMessage = {
        id: Date.now(),
        type: 'emoji',
        content: url,
        sender: 'user',
        time: Date.now(),
        avatar: getUserAvatar()
    };
    chatMessages.push(imageMessage);
    saveChatData();
    renderMessages(true);
    
    // 关闭弹窗 - 使用通用关闭函数
    closeModal(document.querySelector('.emoji-modal'));
};

// 视频通话 - 用户主动发起（直接进入全屏）
window.videoCall = function() {
    console.log('📹 用户发起视频通话');
    
    // 获取联系人信息
    let contactName = '对方';
    let contactAvatar = '';
    try {
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        const currentContact = contacts.find(c => c.id === currentChatId);
        if (currentContact) {
            contactName = currentContact.name || currentContact.remark || '对方';
            contactAvatar = currentContact.avatar || '';
        }
    } catch (e) {
        console.error('读取联系人信息失败:', e);
    }
    
    // 隐藏聊天顶栏
    const chatHeader = document.querySelector('.chat-header');
    if (chatHeader) chatHeader.style.display = 'none';
    
    // 告诉父窗口隐藏iframe顶栏
    if (window.parent && window.parent.postMessage) {
        window.parent.postMessage({ type: 'hideIframeHeader' }, '*');
    }
    
    // 显示头像
    const avatarImg = document.getElementById('call-avatar');
    const avatarPlaceholder = document.getElementById('call-avatar-placeholder');
    if (contactAvatar) {
        avatarImg.src = contactAvatar;
        avatarImg.style.display = 'block';
        avatarPlaceholder.style.display = 'none';
    } else {
        avatarImg.style.display = 'none';
        avatarPlaceholder.style.display = 'block';
    }
    
    // 显示通话界面
    document.getElementById('call-contact-name').textContent = contactName;
    document.getElementById('call-status').textContent = '正在呼叫...';
    document.getElementById('call-duration').style.display = 'none';
    document.getElementById('video-call-modal').style.display = 'block';
    
    // 清空聊天区域
    document.getElementById('call-chat-area').innerHTML = '';
    
    // 设置通话类型为视频
    window.incomingCallType = 'video';
    
    // 初始化通话时长
    window.callDurationSeconds = 0;
    
    // 模拟接通
    setTimeout(() => {
        document.getElementById('call-status').textContent = '通话中';
        document.getElementById('call-duration').style.display = 'block';
        
        // 开始计时
        startCallTimer();
    }, 2000);
};

// 接听来电
window.acceptIncomingCall = function() {
    console.log('✅ 接听来电');
    
    // 隐藏来电浮窗
    document.getElementById('incoming-call-modal').style.display = 'none';
    
    // 获取联系人信息和通话类型
    const contactName = window.incomingCallContactName || '对方';
    const contactAvatar = window.incomingCallContactAvatar || '';
    const callType = window.incomingCallType || 'video'; // 默认视频通话
    
    // 隐藏聊天顶栏
    const chatHeader = document.querySelector('.chat-header');
    if (chatHeader) chatHeader.style.display = 'none';
    
    // 告诉父窗口隐藏iframe顶栏
    if (window.parent && window.parent.postMessage) {
        window.parent.postMessage({ type: 'hideIframeHeader' }, '*');
    }
    
    // 显示头像
    const avatarImg = document.getElementById('call-avatar');
    const avatarPlaceholder = document.getElementById('call-avatar-placeholder');
    if (contactAvatar) {
        avatarImg.src = contactAvatar;
        avatarImg.style.display = 'block';
        avatarPlaceholder.style.display = 'none';
    } else {
        avatarImg.style.display = 'none';
        avatarPlaceholder.style.display = 'block';
    }
    
    // 显示通话界面
    document.getElementById('call-contact-name').textContent = contactName;
    document.getElementById('call-status').textContent = '通话中';
    document.getElementById('call-duration').style.display = 'block';
    document.getElementById('video-call-modal').style.display = 'block';
    
    // 清空聊天区域
    document.getElementById('call-chat-area').innerHTML = '';
    
    // 初始化通话时长
    window.callDurationSeconds = 0;
    
    // 如果是语音通话，显示双方头像和音频波形
    if (callType === 'voice') {
        const remoteVideo = document.getElementById('remote-video');
        if (remoteVideo) {
            // 获取用户自己的头像
            let userAvatar = localStorage.getItem('myAvatar') || '';
            
            remoteVideo.innerHTML = `
                <div style="text-align: center; color: rgba(255,255,255,0.7); width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <!-- 双方头像 -->
                    <div style="display: flex; align-items: center; justify-content: center; gap: 32px; margin-bottom: 32px;">
                        <!-- 对方头像 -->
                        <div style="text-align: center;">
                            <div style="width: 100px; height: 100px; border-radius: 50%; background: #333; overflow: hidden; display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
                                ${contactAvatar ? 
                                    `<img src="${contactAvatar}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                                    `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.6;"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg>`
                                }
                            </div>
                            <div style="font-size: 14px;">${contactName}</div>
                        </div>
                        
                        <!-- 连接符号 -->
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M8 7h12M4 12h16M8 17h12"></path>
                        </svg>
                        
                        <!-- 用户头像 -->
                        <div style="text-align: center;">
                            <div style="width: 100px; height: 100px; border-radius: 50%; background: #333; overflow: hidden; display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
                                ${userAvatar ? 
                                    `<img src="${userAvatar}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                                    `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.6;"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg>`
                                }
                            </div>
                            <div style="font-size: 14px;">我</div>
                        </div>
                    </div>
                    
                    <div style="font-size: 16px; opacity: 0.9; margin-bottom: 24px;">语音通话中</div>
                    
                    <!-- 音频波形 -->
                    <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                        <div style="width: 6px; height: 24px; background: rgba(255,255,255,0.6); border-radius: 3px; animation: audioWave 1s ease-in-out infinite;"></div>
                        <div style="width: 6px; height: 36px; background: rgba(255,255,255,0.7); border-radius: 3px; animation: audioWave 1s ease-in-out infinite 0.1s;"></div>
                        <div style="width: 6px; height: 30px; background: rgba(255,255,255,0.6); border-radius: 3px; animation: audioWave 1s ease-in-out infinite 0.2s;"></div>
                        <div style="width: 6px; height: 42px; background: rgba(255,255,255,0.7); border-radius: 3px; animation: audioWave 1s ease-in-out infinite 0.3s;"></div>
                        <div style="width: 6px; height: 24px; background: rgba(255,255,255,0.6); border-radius: 3px; animation: audioWave 1s ease-in-out infinite 0.4s;"></div>
                    </div>
                </div>
            `;
        }
        
        // 添加音频波形动画样式
        if (!document.getElementById('audio-wave-style')) {
            const style = document.createElement('style');
            style.id = 'audio-wave-style';
            style.textContent = `
                @keyframes audioWave {
                    0%, 100% { transform: scaleY(0.5); }
                    50% { transform: scaleY(1); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // 开始计时
    startCallTimer();
};

// 拒接来电
window.rejectIncomingCall = function() {
    console.log('❌ 拒接来电');
    
    // 隐藏来电浮窗
    document.getElementById('incoming-call-modal').style.display = 'none';
    
    showToast('已拒接');
};

// 结束视频通话
window.endVideoCall = async function() {
    console.log('📞 结束视频通话');
    
    // 停止计时器
    stopCallTimer();
    
    // 隐藏通话界面
    document.getElementById('video-call-modal').style.display = 'none';
    
    // 告诉父窗口显示iframe顶栏
    if (window.parent && window.parent.postMessage) {
        window.parent.postMessage({ type: 'showIframeHeader' }, '*');
    }
    
    // 重新显示聊天顶栏
    const chatHeader = document.querySelector('.chat-header');
    if (chatHeader) chatHeader.style.display = 'flex';
    
    // 获取通话时长
    const duration = window.callDurationSeconds || 0;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const durationText = `${minutes}分${seconds}秒`;
    
    // 获取联系人名称
    let contactName = '对方';
    try {
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        const currentContact = contacts.find(c => c.id === currentChatId);
        if (currentContact) {
            contactName = currentContact.name || currentContact.remark || '对方';
        }
    } catch (e) {
        console.error('读取联系人信息失败:', e);
    }
    
    // 获取通话类型（视频或语音）
    const callType = window.incomingCallType || 'video';
    
    // 通话结束时同步到聊天记忆（实现记忆互通）
    // 只保存通话记录，不保存通话中的所有消息（节省内存和token）
    const callChatContent = {
        id: 'msg_' + Date.now(),
        type: callType === 'voice' ? 'voice-call' : 'video-call',
        content: {
            contactName: contactName,
            duration: durationText,
            durationSeconds: duration,
            callType: 'outgoing'
        },
        sender: 'user',
        time: Date.now(),
        avatar: getUserAvatar(),
        isCallRecord: true // 标记为通话记录
    };
    chatMessages.push(callChatContent);
    saveChatData();
    
    // 同时更新 IndexedDB（双写确保数据同步）
    if (window.ChatDB) {
        try {
            // 加载现有消息
            const existingMessages = await window.ChatDB.loadMessages(currentChatId) || [];
            // 添加新消息（压缩格式）
            existingMessages.push({
                id: callChatContent.id,
                t: callType === 'voice' ? 'voice-call' : 'video-call',
                c: {
                    contactName: contactName,
                    duration: durationText,
                    durationSeconds: duration,
                    callType: 'outgoing'
                },
                s: 'user',
                tm: Date.now(),
                avatar: getUserAvatar(),
                isCallRecord: true
            });
            await window.ChatDB.saveMessages(currentChatId, existingMessages);
            console.log('✅ 通话记录已同步到 IndexedDB');
        } catch (e) {
            console.error('同步通话记录到 IndexedDB 失败:', e);
        }
    }
    
    renderMessages(true);
    
    // 通话结束后生成通话摘要（节省token，只调用一次API）
    saveCallSummaryToMemory(callType, contactName, durationText);
    
    showToast('通话已结束');
};

// 通话结束后生成摘要并保存到记忆库（节省token，只调用一次API）
async function saveCallSummaryToMemory(callType, contactName, durationText) {
    try {
        // 收集通话界面中的对话内容
        const chatArea = document.getElementById('call-chat-area');
        if (!chatArea) return;
        
        const messages = chatArea.querySelectorAll('div');
        let callContent = '';
        messages.forEach(el => {
            const text = el.textContent?.trim();
            if (text && !text.includes('正在输入')) {
                callContent += text + '\n';
            }
        });
        
        // 如果通话内容太少，不生成摘要
        if (!callContent || callContent.length < 10) return;
        
        // 获取API配置
        const apiConfig = JSON.parse(localStorage.getItem('globalApiConfig') || '{}');
        if (!apiConfig.mainApi?.url || !apiConfig.mainApi?.token) return;
        
        // 调用 AI 生成简短摘要（限制50字以内，节省token）
        const prompt = `请将以下${callType === 'voice' ? '语音' : '视频'}通话内容总结为一段简短的记忆（50字以内），记录关键信息：\n\n${callContent}`;
        
        const response = await callAIAPI(prompt, apiConfig);
        if (!response || !response.trim()) return;
        
        const summary = response.trim().substring(0, 100); // 最多100字
        
        // 保存到记忆库
        const memoryKey = `memory_records_${currentChatId}`;
        const memoryRecords = JSON.parse(localStorage.getItem(memoryKey) || '[]');
        memoryRecords.push({
            id: Date.now(),
            content: `[${callType === 'voice' ? '语音' : '视频'}通话 ${durationText}] ${summary}`,
            timestamp: Date.now(),
            source: 'call-summary' // 来源：通话摘要
        });
        localStorage.setItem(memoryKey, JSON.stringify(memoryRecords));
        
        console.log('✅ 通话摘要已保存到记忆库');
    } catch (e) {
        console.error('保存通话摘要失败:', e);
    }
}

// 切换静音
window.toggleCallMute = function() {
    const btn = document.getElementById('mute-btn');
    const isMuted = btn.style.background === 'rgb(255, 68, 68)';
    
    if (isMuted) {
        btn.style.background = 'rgba(255,255,255,0.2)';
        showToast('已取消静音');
    } else {
        btn.style.background = '#ff4444';
        showToast('已静音');
    }
};

// 切换摄像头
window.toggleCallCamera = function() {
    const btn = document.getElementById('camera-btn');
    const isOff = btn.style.background === 'rgb(255, 68, 68)';
    
    if (isOff) {
        btn.style.background = 'rgba(255,255,255,0.2)';
        showToast('摄像头已开启');
    } else {
        btn.style.background = '#ff4444';
        showToast('摄像头已关闭');
    }
};

// 通话计时器
let callTimerInterval = null;
let callSeconds = 0;

function startCallTimer() {
    callSeconds = 0;
    window.callDurationSeconds = 0;
    callTimerInterval = setInterval(() => {
        callSeconds++;
        window.callDurationSeconds = callSeconds;
        const minutes = Math.floor(callSeconds / 60);
        const seconds = callSeconds % 60;
        const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        document.getElementById('call-duration').textContent = timeStr;
    }, 1000);
}

function stopCallTimer() {
    if (callTimerInterval) {
        clearInterval(callTimerInterval);
        callTimerInterval = null;
    }
}

// 生成通话开场旁白
async function generateCallOpeningNarration(contactName) {
    try {
        // 获取API配置
        const apiConfig = JSON.parse(localStorage.getItem('globalApiConfig') || '{}');
        if (!apiConfig.mainApi?.url || !apiConfig.mainApi?.token) {
            return;
        }
        
        // 获取角色信息
        let personaInfo = '';
        try {
            const currentPersona = localStorage.getItem('currentPersona') || 'default';
            const contactsKey = `persona_${currentPersona}_chatContacts`;
            const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
            const currentContact = contacts.find(c => c.id === currentChatId);
            if (currentContact) {
                personaInfo = currentContact.persona || currentContact.roleSetting || currentContact.setting || '';
            }
        } catch (e) {
            console.error('读取角色信息失败:', e);
        }
        
        const prompt = `请为视频通话场景生成一段简短的开场旁白描写（50字以内），描述${contactName}接通视频后的动作、表情或环境。要求细腻自然，符合角色人设。`;
        
        const response = await callAIAPI(prompt, apiConfig);
        
        if (response && response.trim()) {
            addCallNarration(response.trim());
        }
    } catch (error) {
        console.error('生成开场旁白失败:', error);
    }
}

// 添加通话旁白到界面（不实时同步，节省内存和token）
function addCallNarration(content) {
    const chatArea = document.getElementById('call-chat-area');
    if (!chatArea) return;
    
    const narrationEl = document.createElement('div');
    narrationEl.style.cssText = `
        margin-bottom: 12px;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        color: rgba(255,255,255,0.9);
        font-size: 13px;
        line-height: 1.6;
        font-style: italic;
        text-align: center;
        max-width: 85%;
        margin-left: auto;
        margin-right: auto;
        animation: fadeIn 0.3s ease;
    `;
    narrationEl.textContent = content;
    
    chatArea.appendChild(narrationEl);
    chatArea.scrollTop = chatArea.scrollHeight;
    
    // 通话中不实时同步到记忆库，节省内存和 API token
    // 通话结束时统一保存通话摘要
}

// 添加通话对话到界面（不实时同步，节省内存和token）
function addCallMessage(sender, content, isUser = false) {
    const chatArea = document.getElementById('call-chat-area');
    if (!chatArea) return;
    
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
        margin-bottom: 8px;
        padding: 10px 14px;
        background: rgba(240, 240, 240, 0.85);
        backdrop-filter: blur(10px);
        border-radius: 18px;
        color: #333;
        font-size: 14px;
        line-height: 1.5;
        max-width: 75%;
        margin-left: ${isUser ? 'auto' : '0'};
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease;
    `;
    
    const senderEl = document.createElement('div');
    senderEl.style.cssText = 'font-size: 11px; color: #999; margin-bottom: 4px;';
    senderEl.textContent = sender;
    
    const contentEl = document.createElement('div');
    contentEl.textContent = content;
    
    messageEl.appendChild(senderEl);
    messageEl.appendChild(contentEl);
    
    chatArea.appendChild(messageEl);
    chatArea.scrollTop = chatArea.scrollHeight;
    
    // 通话中不实时同步到记忆库，节省内存和 API token
    // 通话结束时统一保存通话摘要
}

// 处理通话消息输入框键盘事件
window.handleCallMessageKeydown = function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendCallMessage();
    }
};

// 通话输入框自动调整高度
window.autoResizeCallInput = function(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 100) + 'px';
};

// AI生成通话回复（无需用户输入）
window.generateCallReply = async function() {
    console.log('🤖 开始AI生成通话回复');
    
    // 获取联系人名称
    let contactName = '对方';
    try {
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        const currentContact = contacts.find(c => c.id === currentChatId);
        if (currentContact) {
            contactName = currentContact.name || currentContact.remark || '对方';
        }
    } catch (e) {
        console.error('读取联系人信息失败:', e);
    }
    
    // 显示“正在输入...”
    const typingEl = document.createElement('div');
    typingEl.id = 'call-typing-indicator';
    typingEl.style.cssText = `
        margin-bottom: 8px;
        padding: 8px 12px;
        background: rgba(255,255,255,0.15);
        backdrop-filter: blur(10px);
        border-radius: 8px;
        color: rgba(255,255,255,0.7);
        font-size: 13px;
        max-width: 80%;
    `;
    typingEl.textContent = `${contactName} 正在输入...`;
    document.getElementById('call-chat-area').appendChild(typingEl);
    
    try {
        const apiConfig = JSON.parse(localStorage.getItem('globalApiConfig') || '{}');
        if (!apiConfig.mainApi?.url || !apiConfig.mainApi?.token) {
            showToast('请先配置API');
            return;
        }
        
        // 获取角色信息
        let personaInfo = '';
        try {
            const currentPersona = localStorage.getItem('currentPersona') || 'default';
            const contactsKey = `persona_${currentPersona}_chatContacts`;
            const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
            const currentContact = contacts.find(c => c.id === currentChatId);
            if (currentContact) {
                personaInfo = currentContact.persona || currentContact.roleSetting || currentContact.setting || '';
                contactName = currentContact.name || currentContact.remark || '对方';
            }
        } catch (e) {
            console.error('读取角色信息失败:', e);
        }
        
        // 获取通话类型
        const callType = window.incomingCallType || 'video';
        
        // 读取聊天记忆上下文（优化：减少消息数量节省 token）
        let chatContext = '';
        try {
            // 只取最近 5 条非旁白消息（节省 token）
            const recentMessages = chatMessages.filter(m => m.type === 'text').slice(-5);
            if (recentMessages.length > 0) {
                chatContext = '\n\n【最近对话】：\n';
                recentMessages.forEach(msg => {
                    const sender = msg.sender === 'user' ? '你' : contactName;
                    // 截断长消息（最多 50 字）
                    const content = (msg.content || '').substring(0, 50);
                    chatContext += `${sender}: ${content}${content.length >= 50 ? '...' : ''}\n`;
                });
            }
        } catch (e) {
            console.error('读取聊天记忆上下文失败:', e);
        }
        
        // 读取记忆库（优化：只取最近 3 条记忆）
        let memoryContext = '';
        try {
            const memoryKey = `memory_records_${currentChatId}`;
            const memoryRecords = JSON.parse(localStorage.getItem(memoryKey) || '[]');
            if (memoryRecords.length > 0) {
                // 只取最近 3 条记忆（节省 token）
                const recentMemories = memoryRecords.slice(-3);
                memoryContext = '\n\n【记忆】：\n';
                recentMemories.forEach((mem, index) => {
                    // 截断长记忆（最多 80 字）
                    const content = mem.content.substring(0, 80);
                    memoryContext += `${index + 1}. ${content}${content.length >= 80 ? '...' : ''}\n`;
                });
            }
        } catch (e) {
            console.error('读取记忆库失败:', e);
        }
        
        // 📸 读取朋友圈动态（让角色看到用户的朋友圈）
        let momentsContext = '';
        try {
            // 获取当前人设的朋友圈数据
            const currentPersona = localStorage.getItem('currentPersonaId') || 'default';
            const momentsKey = `persona_${currentPersona}_moments`;
            const allMoments = JSON.parse(localStorage.getItem(momentsKey) || '[]');
            
            // 筛选出用户发布的朋友圈（不是角色的）
            if (allMoments && allMoments.length > 0) {
                // 获取当前用户的名字
                const myProfile = JSON.parse(localStorage.getItem(`persona_${currentPersona}_myProfile`) || '{}');
                // 🔴 优先使用真实姓名
                const userName = myProfile.realName || myProfile.name || '用户';
                
                const userMoments = allMoments
                    .filter(m => m.author === userName)
                    .slice(-3); // 只取最近3条
                
                if (userMoments.length > 0) {
                    momentsContext = '\n\n【你看到对方最近的朋友圈】：\n';
                    userMoments.forEach((moment, index) => {
                        // 格式化时间
                        const momentTime = new Date(moment.time);
                        const timeStr = `${momentTime.getMonth() + 1}月${momentTime.getDate()}日 ${String(momentTime.getHours()).padStart(2, '0')}:${String(momentTime.getMinutes()).padStart(2, '0')}`;
                        const content = (moment.content || '（图片）').substring(0, 80);
                        momentsContext += `${index + 1}. [${timeStr}] ${content}${content.length >= 80 ? '...' : ''}\n`;
                    });
                    console.log(`📸 已注入 ${userMoments.length} 条用户朋友圈动态到上下文`);
                    console.log('📸 朋友圈内容示例:', userMoments[0].content?.substring(0, 50));
                }
            }
        } catch (e) {
            console.error('读取朋友圈动态失败:', e);
        }
        
        // 构建提示词 - 让AI主动发起对话（包含聊天记忆和朋友圈上下文）
        let prompt;
        if (callType === 'voice') {
            // 语音通话：旁白主要描写背景音
            prompt = `你现在正在进行语音通话，请以${contactName}的身份主动说一句话。${chatContext}${memoryContext}${momentsContext}

重要：你的回复必须包含两部分：
1. 【旁白】主要描写背景音、环境声、电话音质、呼吸声等听觉细节（用[旁白]和[/旁白]包裹）
2. 对话内容（直接说出你想说的话）

格式示例：
[旁白]电话那头传来轻微的电流声，她的声音带着一丝温暖的笑意。[/旁白]

"喂，能听到吗？我在想你了。"

要求：
1. 旁白要专注于声音描写：背景音、环境声、语调变化、呼吸声、停顿等
2. 对话要简洁真实，像真人语音聊天
3. 旁白和对话交替出现
4. 不要使用过于文学化的语言
5. 主动开启话题或回应用户

${personaInfo ? '\n【角色设定】：\n' + personaInfo : ''}`;
        } else {
            // 视频通话：旁白描写动作、表情、神态
            prompt = `你现在正在进行视频通话，请以${contactName}的身份主动说一句话。${chatContext}${memoryContext}

重要：你的回复必须包含两部分：
1. 【旁白】描写你的动作、表情、神态或环境（用[旁白]和[/旁白]包裹）
2. 对话内容（直接说出你想说的话）

格式示例：
[旁白]她微微一笑，眼神温柔地看着镜头。[/旁白]

"你好呀，今天过得怎么样？"

要求：
1. 旁白要细腻自然，符合角色人设
2. 对话要简洁真实，像真人聊天
3. 旁白和对话交替出现
4. 不要使用过于文学化的语言
5. 主动开启话题或回应用户

${personaInfo ? '\n【角色设定】：\n' + personaInfo : ''}`;
        }
        
        const response = await callAIAPI(prompt, apiConfig);
        
        // 移除“正在输入”提示
        const typingIndicator = document.getElementById('call-typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        if (response && response.trim()) {
            // 解析回复，分离旁白和对话
            const narrationRegex = /\[旁白\]([\s\S]*?)\[\/旁白\]/g;
            let match;
            let lastEndIndex = 0;
            
            while ((match = narrationRegex.exec(response)) !== null) {
                // 添加旁白前的对话（如果有）
                const beforeText = response.substring(lastEndIndex, match.index).trim();
                if (beforeText) {
                    addCallMessage(contactName, beforeText, false);
                }
                
                // 添加旁白
                addCallNarration(match[1].trim());
                
                lastEndIndex = match.index + match[0].length;
            }
            
            // 添加剩余的对话
            const afterText = response.substring(lastEndIndex).trim();
            if (afterText) {
                addCallMessage(contactName, afterText, false);
            }
        }
    } catch (error) {
        console.error('生成回复失败:', error);
        
        // 移除“正在输入”提示
        const typingIndicator = document.getElementById('call-typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        showToast('生成失败: ' + error.message);
    }
};

// 发送通话消息
window.sendCallMessage = async function() {
    const input = document.getElementById('call-message-input');
    if (!input) return;
    
    const content = input.value.trim();
    if (!content) {
        showToast('请输入内容');
        return;
    }
    
    // 获取联系人名称
    let contactName = '对方';
    try {
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        const currentContact = contacts.find(c => c.id === currentChatId);
        if (currentContact) {
            contactName = currentContact.name || currentContact.remark || '对方';
        }
    } catch (e) {
        console.error('读取联系人信息失败:', e);
    }
    
    // 显示用户消息
    addCallMessage('我', content, true);
    
    // 清空输入框
    input.value = '';
    input.style.height = 'auto';
    
    // 显示“正在输入...”
    const typingEl = document.createElement('div');
    typingEl.id = 'call-typing-indicator';
    typingEl.style.cssText = `
        margin-bottom: 8px;
        padding: 8px 12px;
        background: rgba(255,255,255,0.15);
        backdrop-filter: blur(10px);
        border-radius: 8px;
        color: rgba(255,255,255,0.7);
        font-size: 13px;
        max-width: 80%;
    `;
    typingEl.textContent = `${contactName} 正在输入...`;
    document.getElementById('call-chat-area').appendChild(typingEl);
    
    // 调用AI生成回复（包含旁白）
    try {
        const apiConfig = JSON.parse(localStorage.getItem('globalApiConfig') || '{}');
        if (!apiConfig.mainApi?.url || !apiConfig.mainApi?.token) {
            showToast('请先配置API');
            return;
        }
        
        // 获取角色信息
        let personaInfo = '';
        try {
            const currentPersona = localStorage.getItem('currentPersona') || 'default';
            const contactsKey = `persona_${currentPersona}_chatContacts`;
            const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
            const currentContact = contacts.find(c => c.id === currentChatId);
            if (currentContact) {
                personaInfo = currentContact.persona || currentContact.roleSetting || currentContact.setting || '';
                contactName = currentContact.name || currentContact.remark || '对方';
            }
        } catch (e) {
            console.error('读取角色信息失败:', e);
        }
        
        // 构建提示词 - 要求生成对话和旁白
        const systemPrompt = `你现在正在进行视频通话，请以${contactName}的身份回复。\n\n重要：你的回复必须包含两部分：\n1. 【旁白】描写你的动作、表情、神态或环境（用[旁白]和[/旁白]包裹）\n2. 对话内容（直接说出你想说的话）\n\n格式示例：\n[旁白]她微微一笑，眼神温柔地看着镜头。[/旁白]\n\n“你好呀，今天过得怎么样？”\n\n要求：\n1. 旁白要细腻自然，符合角色人设\n2. 对话要简洁真实，像真人聊天\n3. 旁白和对话交替出现\n4. 不要使用过于文学化的语言\n\n${personaInfo ? '\n【角色设定】：\n' + personaInfo : ''}`;
        
        const response = await callAIAPI(content, apiConfig, systemPrompt);
        
        // 移除“正在输入”提示
        const typingIndicator = document.getElementById('call-typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        if (response && response.trim()) {
            // 解析回复，分离旁白和对话
            const narrationRegex = /\[旁白\]([\s\S]*?)\[\/旁白\]/g;
            let match;
            let lastEndIndex = 0;
            
            while ((match = narrationRegex.exec(response)) !== null) {
                // 添加旁白前的对话（如果有）
                const beforeText = response.substring(lastEndIndex, match.index).trim();
                if (beforeText) {
                    addCallMessage(contactName, beforeText, false);
                }
                
                // 添加旁白
                addCallNarration(match[1].trim());
                
                lastEndIndex = match.index + match[0].length;
            }
            
            // 添加剩余的对话
            const afterText = response.substring(lastEndIndex).trim();
            if (afterText) {
                addCallMessage(contactName, afterText, false);
            }
        }
    } catch (error) {
        console.error('生成回复失败:', error);
        
        // 移除“正在输入”提示
        const typingIndicator = document.getElementById('call-typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        showToast('生成失败: ' + error.message);
    }
};

// 语音通话 - 用户主动发起（直接进入全屏）
window.voiceCall = function() {
    console.log('📞 用户发起语音通话');
    
    // 获取联系人信息
    let contactName = '对方';
    let contactAvatar = '';
    try {
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        const currentContact = contacts.find(c => c.id === currentChatId);
        if (currentContact) {
            contactName = currentContact.name || currentContact.remark || '对方';
            contactAvatar = currentContact.avatar || '';
        }
    } catch (e) {
        console.error('读取联系人信息失败:', e);
    }
    
    // 隐藏聊天顶栏
    const chatHeader = document.querySelector('.chat-header');
    if (chatHeader) chatHeader.style.display = 'none';
    
    // 告诉父窗口隐藏iframe顶栏
    if (window.parent && window.parent.postMessage) {
        window.parent.postMessage({ type: 'hideIframeHeader' }, '*');
    }
    
    // 显示头像
    const avatarImg = document.getElementById('call-avatar');
    const avatarPlaceholder = document.getElementById('call-avatar-placeholder');
    if (contactAvatar) {
        avatarImg.src = contactAvatar;
        avatarImg.style.display = 'block';
        avatarPlaceholder.style.display = 'none';
    } else {
        avatarImg.style.display = 'none';
        avatarPlaceholder.style.display = 'block';
    }
    
    // 显示通话界面
    document.getElementById('call-contact-name').textContent = contactName;
    document.getElementById('call-status').textContent = '正在呼叫...';
    document.getElementById('call-duration').style.display = 'none';
    document.getElementById('video-call-modal').style.display = 'block';
    
    // 清空聊天区域
    document.getElementById('call-chat-area').innerHTML = '';
    
    // 设置通话类型为语音
    window.incomingCallType = 'voice';
    
    // 初始化通话时长
    window.callDurationSeconds = 0;
    
    // 模拟接通
    setTimeout(() => {
        document.getElementById('call-status').textContent = '通话中';
        document.getElementById('call-duration').style.display = 'block';
        
        // 如果是语音通话，显示双方头像和音频波形
        const remoteVideo = document.getElementById('remote-video');
        if (remoteVideo) {
            // 获取用户自己的头像
            let userAvatar = localStorage.getItem('myAvatar') || '';
            
            remoteVideo.innerHTML = `
                <div style="text-align: center; color: rgba(255,255,255,0.7); width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <!-- 双方头像 -->
                    <div style="display: flex; align-items: center; justify-content: center; gap: 32px; margin-bottom: 32px;">
                        <!-- 对方头像 -->
                        <div style="text-align: center;">
                            <div style="width: 100px; height: 100px; border-radius: 50%; background: #333; overflow: hidden; display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
                                ${contactAvatar ? 
                                    `<img src="${contactAvatar}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                                    `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.6;"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg>`
                                }
                            </div>
                            <div style="font-size: 14px;">${contactName}</div>
                        </div>
                        
                        <!-- 连接符号 -->
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M8 7h12M4 12h16M8 17h12"></path>
                        </svg>
                        
                        <!-- 用户头像 -->
                        <div style="text-align: center;">
                            <div style="width: 100px; height: 100px; border-radius: 50%; background: #333; overflow: hidden; display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
                                ${userAvatar ? 
                                    `<img src="${userAvatar}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                                    `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.6;"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg>`
                                }
                            </div>
                            <div style="font-size: 14px;">我</div>
                        </div>
                    </div>
                    
                    <div style="font-size: 16px; opacity: 0.9; margin-bottom: 24px;">语音通话中</div>
                    
                    <!-- 音频波形 -->
                    <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                        <div style="width: 6px; height: 24px; background: rgba(255,255,255,0.6); border-radius: 3px; animation: audioWave 1s ease-in-out infinite;"></div>
                        <div style="width: 6px; height: 36px; background: rgba(255,255,255,0.7); border-radius: 3px; animation: audioWave 1s ease-in-out infinite 0.1s;"></div>
                        <div style="width: 6px; height: 30px; background: rgba(255,255,255,0.6); border-radius: 3px; animation: audioWave 1s ease-in-out infinite 0.2s;"></div>
                        <div style="width: 6px; height: 42px; background: rgba(255,255,255,0.7); border-radius: 3px; animation: audioWave 1s ease-in-out infinite 0.3s;"></div>
                        <div style="width: 6px; height: 24px; background: rgba(255,255,255,0.6); border-radius: 3px; animation: audioWave 1s ease-in-out infinite 0.4s;"></div>
                    </div>
                </div>
            `;
        }
        
        // 添加音频波形动画样式
        if (!document.getElementById('audio-wave-style')) {
            const style = document.createElement('style');
            style.id = 'audio-wave-style';
            style.textContent = `
                @keyframes audioWave {
                    0%, 100% { transform: scaleY(0.5); }
                    50% { transform: scaleY(1); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // 开始计时
        startCallTimer();
    }, 2000);
};

// 检测用户消息是否触发 AI 主动拨打
function checkAndTriggerCall(userContent) {
    if (!userContent) return;
    
    // 检测视频通话关键词
    const videoKeywords = [
        '想看看你', '看看你', '视频', '想见你', '见面', '开视频', '打个视频',
        '视频通话', '想和你视频', '能视频吗', '可以视频吗'
    ];
    
    // 检测语音通话关键词
    const voiceKeywords = [
        '想听你说话', '听听你的声音', '语音', '打电话', '打个电话',
        '语音通话', '想和你语音', '能语音吗', '可以语音吗', '想听你声音'
    ];
    
    const content = userContent.toLowerCase();
    
    // 检查是否匹配视频通话
    for (const keyword of videoKeywords) {
        if (content.includes(keyword)) {
            console.log('📹 检测到视频通话请求:', keyword);
            // 延迟 2-4 秒后发起视频通话，模拟角色思考时间
            setTimeout(() => {
                showIncomingCallModal('video');
            }, 2000 + Math.random() * 2000);
            return;
        }
    }
    
    // 检查是否匹配语音通话
    for (const keyword of voiceKeywords) {
        if (content.includes(keyword)) {
            console.log('📞 检测到语音通话请求:', keyword);
            // 延迟 2-4 秒后发起语音通话
            setTimeout(() => {
                showIncomingCallModal('voice');
            }, 2000 + Math.random() * 2000);
            return;
        }
    }
}

// 显示来电浮窗（AI 主动拨打）
function showIncomingCallModal(callType) {
    console.log('📱 AI 主动拨打', callType === 'video' ? '视频' : '语音', '通话');
    
    // 获取联系人名称
    let contactName = '对方';
    let contactAvatar = '';
    try {
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        const currentContact = contacts.find(c => c.id === currentChatId);
        if (currentContact) {
            contactName = currentContact.name || currentContact.remark || '对方';
            contactAvatar = currentContact.avatar || getAIAvatar();
        }
    } catch (e) {
        console.error('读取联系人信息失败:', e);
    }
    
    // 保存当前联系人信息和通话类型
    window.incomingCallContactName = contactName;
    window.incomingCallContactAvatar = contactAvatar;
    window.incomingCallType = callType;
    
    // 显示来电浮窗
    document.getElementById('incoming-call-name').textContent = contactName;
    document.getElementById('incoming-call-type').textContent = callType === 'video' ? '视频通话' : '语音通话';
    
    // 设置头像
    const avatarEl = document.getElementById('incoming-call-avatar');
    if (contactAvatar && isImageUrl(contactAvatar)) {
        avatarEl.innerHTML = `<img src="${contactAvatar}" style="width: 100%; height: 100%; object-fit: cover;" alt="">`;
    } else {
        avatarEl.innerHTML = `
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5">
                <circle cx="12" cy="8" r="4"/>
                <path d="M6 20v-2a6 6 0 0 1 12 0v2"/>
            </svg>
        `;
    }
    
    document.getElementById('incoming-call-modal').style.display = 'block';
}

// 发送定位
window.sendLocation = function() {
    const currentChatId = localStorage.getItem('currentChatId');
    
    // 创建定位弹窗
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    modal.className = 'location-modal';
    
    // 创建关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = 'position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 22px; color: #ADB5BD; cursor: pointer; line-height: 1; padding: 4px; transition: color 0.2s;';
    closeBtn.onmouseover = () => closeBtn.style.color = '#6C757D';
    closeBtn.onmouseout = () => closeBtn.style.color = '#ADB5BD';
    closeBtn.onclick = () => closeModal(modal);
    
    // 创建取消按钮
    const cancelBtn = document.createElement('button');
    cancelBtn.innerHTML = '取消';
    cancelBtn.style.cssText = 'min-width: 100px; padding: 12px 32px; border: none; background: #E9ECEF; color: #6C757D; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 500; transition: all 0.2s;';
    cancelBtn.onmouseover = () => cancelBtn.style.background = '#DEE2E6';
    cancelBtn.onmouseout = () => cancelBtn.style.background = '#E9ECEF';
    cancelBtn.onclick = () => closeModal(modal);
    
    // 创建发送按钮
    const sendBtn = document.createElement('button');
    sendBtn.innerHTML = '发送位置';
    sendBtn.style.cssText = 'min-width: 120px; padding: 12px 32px; border: none; background: #6C757D; color: white; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 500; transition: all 0.2s;';
    sendBtn.onmouseover = () => sendBtn.style.background = '#5A6268';
    sendBtn.onmouseout = () => sendBtn.style.background = '#6C757D';
    sendBtn.onclick = window.confirmLocation;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 16px; padding: 24px; width: 90%; max-width: 500px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); position: relative; display: flex; flex-direction: column;">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 16px; color: #333; margin-bottom: 8px;">发送位置</div>
            </div>
            
            <!-- 地图动画 -->
            <div style="width: 100%; height: 200px; background: linear-gradient(135deg, #e8f4f8 0%, #d4edda 100%); border-radius: 12px; margin-bottom: 20px; position: relative; overflow: hidden; flex-shrink: 0;">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60px; height: 60px; background: rgba(7, 193, 96, 0.3); border-radius: 50%; animation: pulse 2s infinite;"></div>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 30px; height: 30px; background: #07C160; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); animation: marker-bounce 1s infinite;"></div>
            </div>
            
            <div style="margin-bottom: 16px;">
                <input type="text" id="location-name" placeholder="输入地点名称" value="当前位置" 
                    style="width: 100%; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 16px; outline: none; transition: border-color 0.2s;"
                    onfocus="this.style.borderColor='#07C160'" onblur="this.style.borderColor='#e0e0e0'">
            </div>
            
            <div style="margin-bottom: 24px;">
                <input type="text" id="location-address" placeholder="输入详细地址" 
                    style="width: 100%; padding: 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; outline: none;">
            </div>
            
            <div style="display: flex; gap: 16px; justify-content: center; margin-top: auto;">
                <button id="btn-cancel" style="flex: 1; max-width: 140px; padding: 12px 0; border: none; background: #E9ECEF; color: #6C757D; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 500;">取消</button>
                <button id="btn-send" style="flex: 1; max-width: 140px; padding: 12px 0; border: none; background: #6C757D; color: white; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 500;">发送位置</button>
            </div>
        </div>
    `;
    
    // 绑定按钮事件
    setTimeout(() => {
        const cancelBtn = document.getElementById('btn-cancel');
        const sendBtn = document.getElementById('btn-send');
        
        if (cancelBtn) {
            cancelBtn.onclick = () => closeModal(modal);
            cancelBtn.onmouseover = () => cancelBtn.style.background = '#DEE2E6';
            cancelBtn.onmouseout = () => cancelBtn.style.background = '#E9ECEF';
        }
        
        if (sendBtn) {
            sendBtn.onclick = window.confirmLocation;
            sendBtn.onmouseover = () => sendBtn.style.background = '#5A6268';
            sendBtn.onmouseout = () => sendBtn.style.background = '#6C757D';
        }
    }, 0);
    
    // 添加关闭按钮到外层容器
    modal.querySelector('div').appendChild(closeBtn);
    
    document.body.appendChild(modal);
};

// 确认发送定位
window.confirmLocation = function() {
    const nameInput = document.getElementById('location-name');
    const addressInput = document.getElementById('location-address');
    
    const name = nameInput.value.trim() || '当前位置';
    const address = addressInput.value.trim() || '';
    
    // 创建定位消息
    const locationMessage = {
        id: Date.now(),
        type: 'location',
        content: {
            name: name,
            address: address
        },
        sender: 'user',
        time: Date.now(),
        avatar: getUserAvatar()
    };
    
    chatMessages.push(locationMessage);
    saveChatData();
    renderMessages(true);
    
    // 关闭弹窗 - 使用通用关闭函数
    closeModal(document.querySelector('.location-modal'));
    
    showToast(`已发送位置：${name}`);
};

// 渲染消息
// 优化版 renderMessages - 使用 requestAnimationFrame 避免阻塞
let renderPending = false;
let needScrollAfterRender = false;

function renderMessages(autoScroll = true) {
    // 如果已经有待处理的渲染，只标记需要滚动
    if (renderPending) {
        if (autoScroll) needScrollAfterRender = true;
        return;
    }
    
    renderPending = true;
    needScrollAfterRender = autoScroll;
    
    // 使用 requestAnimationFrame 延迟到下一帧执行
    requestAnimationFrame(() => {
        renderPending = false;
        _doRenderMessages();
        
        // DOM 更新后再滚动（再等待一帧确保布局完成）
        if (needScrollAfterRender) {
            needScrollAfterRender = false;
            requestAnimationFrame(() => {
                scrollToBottom();
            });
        }
    });
}

// 滚动到底部（强制同步版本）
window.forceScrollToBottom = function() {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    
    // 等待浏览器完成布局计算
    requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
        // 双重保险：再等待一帧确保内容完全加载
        requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
        });
    });
};

// 滚动到底部（保留旧版本用于兼容）
function scrollToBottom() {
    window.forceScrollToBottom();
}

// 🎭 检测用户是否发送了头像URL，角色主动更换头像
function checkAvatarChangeFromMessages() {
    // 获取当前角色的头像
    const currentAvatar = localStorage.getItem(`chat_avatar_${currentChatId}`);
    
    // 只检查最近10条消息
    const recentMessages = chatMessages.slice(-10);
    
    for (const msg of recentMessages) {
        // 只检查用户发送的消息
        if (msg.sender !== 'user' && msg.sender !== 'self') continue;
        
        // 检查是否包含图片URL
        let imageUrl = null;
        
        if (msg.type === 'image') {
            // 直接发送的图片消息
            imageUrl = msg.content;
        } else if (msg.type === 'text') {
            // 文本消息中可能包含URL
            const urlMatch = msg.content.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?[^\s]*)?/i);
            if (urlMatch) {
                imageUrl = urlMatch[0];
            }
        }
        
        if (imageUrl) {
            // 检查是否已经应用过这个头像
            const appliedAvatar = localStorage.getItem(`applied_avatar_${currentChatId}_${imageUrl}`);
            if (appliedAvatar) continue;
            
            // 智能检测：如果URL包含关键词，更可能是情侣头像
            const isCoupleAvatar = /couple|情侣|avatar|头像|profile/i.test(imageUrl) || imageUrl.length > 50;
            
            if (isCoupleAvatar || confirm(`角色想换这个头像吗？\n\n${imageUrl}\n\n点击"确定"让角色更换头像`)) {
                // 更新角色头像
                const chatKey = `chat_config_${currentChatId}`;
                const chatConfig = JSON.parse(localStorage.getItem(chatKey) || '{}');
                chatConfig.avatar = imageUrl;
                localStorage.setItem(chatKey, JSON.stringify(chatConfig));
                
                // 更新联系人列表中的头像
                const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
                const contactIndex = contacts.findIndex(c => c.id === currentChatId);
                if (contactIndex !== -1) {
                    contacts[contactIndex].avatar = imageUrl;
                    localStorage.setItem('contacts', JSON.stringify(contacts));
                }
                
                // 标记已应用，避免重复询问
                localStorage.setItem(`applied_avatar_${currentChatId}_${imageUrl}`, '1');
                
                // 显示提示
                showToast('💕 角色已更换头像', 'success');
                
                console.log('🎭 角色头像已更新:', imageUrl);
                
                // 刷新顶栏头像显示
                updateHeaderAvatar(imageUrl);
                
                break; // 只应用第一个头像
            }
        }
    }
}

// 更新顶栏头像
function updateHeaderAvatar(imageUrl) {
    const headerAvatar = document.querySelector('.chat-header-avatar img');
    if (headerAvatar && imageUrl) {
        headerAvatar.src = imageUrl;
    }
}

// 实际渲染函数
function _doRenderMessages() {
    const container = document.getElementById('chat-messages');
    
    // 添加空值检查，防止 DOM 未加载时调用
    if (!container) {
        console.warn('⚠️ renderMessages: chat-messages 元素不存在');
        return;
    }
    
    // 🧹 自动清除错误消息：如果有正常消息，就清除所有错误消息
    const hasNormalMessages = chatMessages.some(msg => msg.type !== 'system-error' && !msg.hidden);
    if (hasNormalMessages) {
        const errorCount = chatMessages.filter(msg => msg.type === 'system-error').length;
        if (errorCount > 0) {
            console.log(`🧹 检测到 ${errorCount} 条错误消息，正在清除...`);
            chatMessages = chatMessages.filter(msg => msg.type !== 'system-error');
            
            // 保存到 IndexedDB
            try {
                if (window.ChatDB) {
                    window.ChatDB.saveMessages(currentChatId, chatMessages);
                }
            } catch (e) {
                console.error('❌ 清除错误消息失败:', e);
            }
        }
    }
    
    // 获取当前聊天的头像显示配置
    let showAvatarEnabled = true; // 默认开启
    let isTranslationModeOn = false; // 默认关闭（使用不同的变量名避免冲突）
    let avatarShape = 'square'; // 默认方形
    try {
        const chatKey = `chat_config_${currentChatId}`;
        const chatConfig = JSON.parse(localStorage.getItem(chatKey) || '{}');
        showAvatarEnabled = chatConfig.showAvatar !== undefined ? chatConfig.showAvatar : true;
        isTranslationModeOn = chatConfig.translationMode || false;
        avatarShape = chatConfig.avatarShape || 'square';
    } catch (e) {
        console.warn('⚠️ 读取配置失败:', e);
    }
        
    // 根据头像形状设置 border-radius
    const avatarBorderRadius = avatarShape === 'circle' ? '50%' : '8px';
    
    if (chatMessages.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg class="empty-state-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <div class="empty-state-text">开始聊天吧</div>
            </div>
        `;
        return;
    }
    
    let html = '';
    let lastTime = 0;
    
    // 🎭 检测用户是否发送了头像URL
    checkAvatarChangeFromMessages();
    
    chatMessages.forEach(msg => {
        // 🛡️ 跳过隐藏的消息（用于逐句发送效果）
        if (msg.hidden) return;

        // 处理系统消息（拍一拍等）
        if (msg.type === 'system' || msg.sender === 'system') {
            html += `
                <div style="text-align: center; padding: 8px 20px; margin: 4px 0;">
                    <div style="font-size: 12px; color: #999; line-height: 1.5; display: inline-block;">${escapeHtml(msg.content)}</div>
                </div>
            `;
            lastTime = msg.time;
            return;
        }
        
        // 处理错误消息（API请求失败等）
        if (msg.type === 'system-error') {
            html += `
                <div class="system-error-message">
                    <span>⚠️ ${escapeHtml(msg.content)}</span>
                </div>
            `;
            lastTime = msg.time;
            return;
        }

        // 处理旁白类型消息（新格式：独立的旁白消息）
        if (msg.type === 'narration') {
            html += `
                <div style="text-align: center; padding: 12px 20px; margin: 8px 0; cursor: pointer;" 
                    oncontextmenu="showMessageMenu(event, '${msg.id}', '${msg.sender === 'user' ? 'sent' : 'received'}'); return false;" 
                    ontouchstart="handleTouchStart(event, '${msg.id}', '${msg.sender === 'user' ? 'sent' : 'received'}')" 
                    ontouchend="handleTouchEnd(event)"
                    onmousedown="handleMouseDown(event, '${msg.id}', '${msg.sender === 'user' ? 'sent' : 'received'}')" 
                    onmouseup="handleMouseUp(event)">
                    <div style="font-size: 13px; color: #666; line-height: 1.8; font-style: italic; letter-spacing: 0.3px; display: inline-block; max-width: 85%; text-align: center;">${escapeHtml(msg.content)}</div>
                </div>
            `;
            lastTime = msg.time;
            return; // 直接返回，不渲染下面的内容
        }
        
        // 兼容旧格式：如果消息有 narration 数组，先渲染旁白（无头像无气泡）
        if (msg.narration && msg.narration.length > 0) {
            msg.narration.forEach((n, index) => {
                html += `
                    <div style="text-align: center; padding: 12px 20px; margin: 8px 0; cursor: pointer;" 
                        oncontextmenu="showMessageMenu(event, '${msg.id}', '${msg.sender === 'user' ? 'sent' : 'received'}'); return false;" 
                        ontouchstart="handleTouchStart(event, '${msg.id}', '${msg.sender === 'user' ? 'sent' : 'received'}')" 
                        ontouchend="handleTouchEnd(event)"
                        onmousedown="handleMouseDown(event, '${msg.id}', '${msg.sender === 'user' ? 'sent' : 'received'}')" 
                        onmouseup="handleMouseUp(event)">
                        <div style="font-size: 13px; color: #666; line-height: 1.8; font-style: italic; letter-spacing: 0.3px; display: inline-block; max-width: 85%; text-align: center;">${escapeHtml(n.content)}</div>
                    </div>
                `;
            });
            
            // 如果只有旁白没有实际内容，跳过头像和气泡的渲染
            if (!msg.content || msg.content.trim() === '') {
                lastTime = msg.time;
                return; // 直接返回，不渲染下面的头像和气泡
            }
        }
        
        // 显示时间戳 (如果距离上一条消息超过 5 分钟)
        // 兼容字符串和数字时间格式
        const msgTimestamp = typeof msg.time === 'number' ? msg.time : Date.parse(msg.time);
        const lastTimestamp = typeof lastTime === 'number' ? lastTime : (lastTime ? Date.parse(lastTime) : 0);
        if (msgTimestamp - lastTimestamp > 5 * 60 * 1000) {
            html += `
                <div class="system-message">
                    <span>${formatTime(msg.time)}</span>
                </div>
            `;
        }
        
        console.log('===== 渲染消息 =====');
        console.log('消息 ID:', msg.id);
        console.log('消息类型:', msg.type);
        console.log('消息发送者:', msg.sender);
        console.log('消息内容:', msg.content);
        console.log('===================');
        
        const isSent = msg.sender === 'user';
        // 每次都重新获取最新头像
        const avatar = msg.avatar || (isSent ? getUserAvatar() : getAIAvatar());
        
        console.log(`消息 ${msg.id} 头像:`, isSent ? '用户' : 'AI', avatar);
        
        // 群聊模式：显示发送者名称和头衔（包括自己）
        let senderNameHTML = '';
        if (currentChatId && currentChatId.startsWith('group_')) {
            try {
                const groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
                        
                // 🔴 关键修复：确定发送者 ID
                let senderId = msg.senderId;
                        
                // 如果没有 senderId，尝试从其他字段推断
                if (!senderId) {
                    if (isSent) {
                        // 自己发送的消息：使用群主 ID 或从 myProfile 获取
                        senderId = groupInfo.owner || '';
                        if (!senderId) {
                            try {
                                const myProfile = JSON.parse(localStorage.getItem('persona_myProfile') || '{}');
                                senderId = myProfile.id || 'user';
                            } catch (e) {
                                senderId = 'user';
                            }
                        }
                    } else {
                        // 其他人发送的消息：使用 sender 字段
                        senderId = msg.sender || 'unknown';
                    }
                }
                        
                // 🔴 关键：获取发送者名称
                let senderName = msg.senderName;
                if (!senderName) {
                    if (isSent) {
                        // 自己发送的消息：从 persona_${currentPersona}_myProfile 获取用户名（主页人设）
                        try {
                            const currentPersona = localStorage.getItem('currentPersona') || 'default';
                            const myProfileKey = `persona_${currentPersona}_myProfile`;
                            const myProfile = JSON.parse(localStorage.getItem(myProfileKey) || '{}');
                            // 🔴 优先使用真实姓名
                            senderName = myProfile.realName || myProfile.name || '我';
                        } catch (e) {
                            senderName = '我';
                        }
                    } else {
                        // 其他人发送的消息：使用默认名称
                        senderName = '群成员';
                    }
                }
                
                const memberTitles = groupInfo.memberTitles || {};
                const admins = groupInfo.admins || [];
                const memberTitle = memberTitles[senderId];
                const isAdmin = admins.includes(senderId);
                const isGroupOwner = groupInfo.owner === senderId;
                        
                console.log(`🔍 消息 ${msg.id} 头衔检查:`, {
                    senderId,
                    senderName,
                    memberTitles,
                    memberTitle,
                    isAdmin,
                    isGroupOwner,
                    owner: groupInfo.owner,
                    hasSenderId: !!msg.senderId
                });
                        
                // 构建发送者名称HTML
                senderNameHTML = `<div class="message-sender-name" style="font-size: 12px; color: #999; margin-bottom: 4px; padding-left: 4px; display: flex; align-items: center; gap: 6px;">
                    <span>${escapeHtml(senderName)}</span>`;
                        
                // 如果有头衔，显示头衔
                if (memberTitle && typeof memberTitle === 'string') {
                    if (isGroupOwner) {
                        // 群主头衔 - 亮黄色
                        senderNameHTML += `<span style="font-size: 10px; color: #FFFFFF; background: #FFC107; padding: 1px 5px; border-radius: 3px; font-weight: 600; white-space: nowrap;">${escapeHtml(memberTitle)}</span>`;
                    } else if (isAdmin) {
                        // 管理员头衔 - 浅蓝色
                        senderNameHTML += `<span style="font-size: 10px; color: #4682B4; background: #E6F2FF; padding: 1px 5px; border-radius: 3px; font-weight: 600; white-space: nowrap;">${escapeHtml(memberTitle)}</span>`;
                    } else {
                        // 普通成员头衔 - 紫色
                        senderNameHTML += `<span style="font-size: 9px; color: #FFFFFF; background: #9B59B6; padding: 1px 5px; border-radius: 3px; font-weight: 600; white-space: nowrap;">${escapeHtml(memberTitle)}</span>`;
                    }
                } else if (isGroupOwner) {
                    // 群主没有自定义头衔，显示默认"群主"
                    senderNameHTML += `<span style="font-size: 10px; color: #FFC107; background: #FFF8E1; padding: 1px 5px; border-radius: 3px; font-weight: 600; white-space: nowrap;">群主</span>`;
                } else if (isAdmin) {
                    // 管理员没有自定义头衔，显示默认"管理员"
                    senderNameHTML += `<span style="font-size: 10px; color: #4682B4; background: #E6F2FF; padding: 1px 5px; border-radius: 3px; font-weight: 600; white-space: nowrap;">管理员</span>`;
                }
                        
                senderNameHTML += `</div>`;
            } catch (e) {
                console.warn('⚠️ 获取群聊发送者信息失败:', e);
            }
        }
        
        let messageContent = '';
        
        if (msg.type === 'image' || msg.type === 'emoji') {
            const size = msg.type === 'emoji' ? 'max-width: 100px; max-height: 100px;' : 'max-width: 200px;';
            messageContent = `<img src="${msg.content}" style="${size} border-radius: 4px; object-fit: contain; display: block;" alt="">`;
        } else if (msg.type === 'voice') {
            // 语音消息
            const duration = msg.duration || 0;
            const recognizedText = msg.recognizedText || '';
            
            messageContent = `
                <div>
                    <div style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: rgba(255,255,255,0.9); border-radius: 16px; cursor: pointer; min-width: 120px;" onclick="playVoiceMessage('${msg.id}')">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="#666">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        <span style="font-size: 14px; color: #666;">${duration}"</span>
                        <svg id="voice-icon-${msg.id}" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#999" stroke-width="2" style="margin-left: auto;">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        </svg>
                    </div>
                    ${recognizedText ? `<div style="margin-top: 6px; padding: 6px 10px; background: rgba(255,255,255,0.6); border-radius: 8px; font-size: 13px; color: #666; line-height: 1.4;">${escapeHtml(recognizedText)}</div>` : ''}
                </div>
            `;
        } else if (msg.type === 'shopping-receipt') {
            // 购物小票卡片
            let receipt;
            try {
                receipt = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
            } catch (e) {
                receipt = { orderNo: '000000', items: [], total: 0 };
            }
            
            // 生成商品列表 HTML
            const itemsHTML = (receipt.items || []).map(item => `
                <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-bottom: 6px;">
                    <span>${escapeHtml(item.name)}</span>
                    <span>x${item.quantity || 1}</span>
                    <span>￥${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                </div>
            `).join('');
            
            messageContent = `
                <div style="background: #FFFFFF; border-radius: 12px; padding: 12px; min-width: 260px; max-width: 300px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); font-family: 'Courier New', monospace; position: relative;">
                    <!-- 顶部装饰线 -->
                    <div style="border-top: 2px dashed #E0E0E0; margin: -12px -12px 10px;"></div>
                    
                    <!-- 标题 -->
                    <div style="text-align: center; margin-bottom: 10px;">
                        <div style="font-size: 16px; font-weight: 600; color: #333; margin-bottom: 4px;">购物订单</div>
                        <div style="font-size: 11px; color: #999;">订单号：${receipt.orderNo || '000000'}</div>
                    </div>
                    
                    <!-- 分割线 -->
                    <div style="border-top: 1px dashed #E0E0E0; margin: 6px 0;"></div>
                    
                    <!-- 商品列表 -->
                    <div style="margin-bottom: 10px;">
                        ${itemsHTML}
                    </div>
                    
                    <!-- 分割线 -->
                    <div style="border-top: 1px dashed #E0E0E0; margin: 6px 0;"></div>
                    
                    <!-- 总计 -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="font-size: 14px; color: #333; font-weight: 500;">合计：</span>
                        <span style="font-size: 18px; color: #F29344; font-weight: 600;">￥${receipt.total ? receipt.total.toFixed(2) : '0.00'}</span>
                    </div>
                    
                    <!-- 备注 -->
                    ${receipt.remark ? `<div style="font-size: 11px; color: #999; margin-bottom: 6px; font-style: italic;">备注：${escapeHtml(receipt.remark)}</div>` : ''}
                    
                    <!-- 底部信息 -->
                    <div style="text-align: center; font-size: 10px; color: #CCC; margin-top: 6px;">
                        ${receipt.shopName || '商城'} | ${receipt.time || new Date().toLocaleString('zh-CN')}
                    </div>
                    
                    <!-- 底部装饰线 -->
                    <div style="border-top: 2px dashed #E0E0E0; margin: 10px -12px -12px;"></div>
                </div>
            `;
        } else if (msg.type === 'product-card') {
            // 商品推荐卡片 - AI主动推荐商品
            let product;
            try {
                product = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
            } catch (e) {
                product = { name: '商品', price: 0, desc: '', imageDesc: '' };
            }
            
            messageContent = `
                <div onclick="window.openProductDetail('${encodeURIComponent(JSON.stringify(product))}')" style="cursor: pointer; transition: transform 0.15s ease; -webkit-tap-highlight-color: transparent;" ontouchend="this.style.transform='scale(1)'" ontouchstart="this.style.transform='scale(0.97)'">
                    <div style="background: #FFFFFF; border-radius: 12px; padding: 14px; min-width: 240px; max-width: 280px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); border: 1px solid #F0F0F0;">
                        <!-- 商品图片占位 -->
                        <div style="width: 100%; height: 120px; background: #F5F5F5; border-radius: 8px; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                            <div style="font-size: 12px; color: #999; text-align: center; padding: 8px; line-height: 1.4;">${escapeHtml(product.imageDesc || product.name)}</div>
                        </div>
                        
                        <!-- 商品信息 -->
                        <div style="margin-bottom: 10px;">
                            <div style="font-size: 16px; color: #333; font-weight: 600; margin-bottom: 6px;">${escapeHtml(product.name)}</div>
                            <div style="font-size: 13px; color: #999; line-height: 1.5;">${escapeHtml(product.desc || '')}</div>
                        </div>
                        
                        <!-- 价格和操作 -->
                        <div style="padding-top: 10px; border-top: 1px solid #F5F5F5;">
                            <div style="font-size: 20px; color: #F29344; font-weight: 600;">￥${parseFloat(product.price).toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            `;
        } else if (msg.type === 'delivery-order') {
            // 外卖下单卡片 - AI帮用户点外卖
            let delivery;
            try {
                delivery = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
            } catch (e) {
                delivery = { restaurant: '餐厅', items: [], total: 0, address: '虚拟地址' };
            }
            
            // 生成菜品列表 HTML
            const itemsHTML = (delivery.items || []).map(item => `
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #666; margin-bottom: 6px;">
                    <span>${escapeHtml(item.name)}</span>
                    <span>x${item.quantity || 1}</span>
                    <span>￥${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                </div>
            `).join('');
            
            messageContent = `
                <div onclick="window.openDeliveryDetail('${encodeURIComponent(JSON.stringify(delivery))}')" style="cursor: pointer; transition: transform 0.15s ease; -webkit-tap-highlight-color: transparent;" ontouchend="this.style.transform='scale(1)'" ontouchstart="this.style.transform='scale(0.97)'">
                    <div style="background: #FFFFFF; border-radius: 12px; padding: 14px; min-width: 260px; max-width: 300px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); border: 1px solid #F0F0F0;">
                        <!-- 头部 -->
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                            <div style="width: 40px; height: 40px; background: #FFB74D; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                </svg>
                            </div>
                            <div style="flex: 1;">
                                <div style="font-size: 16px; color: #333; font-weight: 600;">${escapeHtml(delivery.restaurant)}</div>
                                <div style="font-size: 12px; color: #999;">外卖订单</div>
                            </div>
                        </div>
                        
                        <!-- 分割线 -->
                        <div style="border-top: 1px dashed #E0E0E0; margin: 8px 0;"></div>
                        
                        <!-- 菜品列表 -->
                        <div style="margin-bottom: 10px;">
                            ${itemsHTML}
                        </div>
                        
                        <!-- 分割线 -->
                        <div style="border-top: 1px dashed #E0E0E0; margin: 8px 0;"></div>
                        
                        <!-- 配送地址 -->
                        <div style="margin-bottom: 10px; padding: 8px; background: #F9FAFB; border-radius: 6px;">
                            <div style="font-size: 11px; color: #999; margin-bottom: 4px;">配送地址</div>
                            <div style="font-size: 13px; color: #333;">${escapeHtml(delivery.address || '虚拟地址')}</div>
                        </div>
                        
                        <!-- 总计 -->
                        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid #F5F5F5;">
                            <span style="font-size: 14px; color: #333; font-weight: 500;">合计：</span>
                            <span style="font-size: 20px; color: #FF6B6B; font-weight: 600;">￥${delivery.total ? delivery.total.toFixed(2) : '0.00'}</span>
                        </div>
                        
                        <!-- 提示 -->
                        <div style="margin-top: 8px; text-align: center; font-size: 11px; color: #999;">
                            点击查看详情
                        </div>
                    </div>
                </div>
            `;
        } else if (msg.type === 'purchase') {
            // 代买卡片 - AI帮用户买东西
            let purchase;
            try {
                purchase = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
            } catch (e) {
                purchase = { items: [], total: 0, reason: '', message: '' };
            }
            
            const purchaseItemsHTML = (purchase.items || []).map(item => `
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #555; margin-bottom: 8px; padding: 6px 8px; background: rgba(255,255,255,0.6); border-radius: 6px;">
                    <div style="flex: 1;">
                        <span style="color: #333; font-weight: 500;">${escapeHtml(item.name)}</span>
                        <span style="color: #999; font-size: 12px; margin-left: 4px;">x${item.quantity || 1}</span>
                    </div>
                    <span style="color: #E8533F; font-weight: 500;">￥${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                </div>
            `).join('');
            
            messageContent = `
                <div style="transition: transform 0.15s ease; -webkit-tap-highlight-color: transparent;">
                    <div style="background: linear-gradient(135deg, #FF9A76 0%, #F7C948 100%); border-radius: 14px; padding: 16px; min-width: 260px; max-width: 300px; box-shadow: 0 4px 16px rgba(255, 154, 118, 0.25); color: white;">
                        <!-- 头部 -->
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                            <div style="width: 40px; height: 40px; background: rgba(255, 255, 255, 0.25); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                    <circle cx="9" cy="21" r="1"></circle>
                                    <circle cx="20" cy="21" r="1"></circle>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                </svg>
                            </div>
                            <div style="flex: 1;">
                                <div style="font-size: 16px; color: white; font-weight: 600;">代买商品</div>
                                <div style="font-size: 12px; color: rgba(255,255,255,0.8);">已买好，送给你～</div>
                            </div>
                        </div>
                        
                        <!-- 商品列表 -->
                        <div style="background: rgba(255,255,255,0.15); border-radius: 8px; padding: 8px; margin-bottom: 10px;">
                            ${purchaseItemsHTML}
                        </div>
                        
                        <!-- 代买原因 -->
                        ${purchase.reason ? `
                        <div style="margin-bottom: 8px; padding: 8px 10px; background: rgba(255,255,255,0.15); border-radius: 6px;">
                            <div style="font-size: 11px; color: rgba(255,255,255,0.7); margin-bottom: 3px;">代买原因</div>
                            <div style="font-size: 13px; color: white;">${escapeHtml(purchase.reason)}</div>
                        </div>
                        ` : ''}
                        
                        <!-- 留言 -->
                        ${purchase.message ? `
                        <div style="margin-bottom: 8px; padding: 8px 10px; background: rgba(255,255,255,0.15); border-radius: 6px;">
                            <div style="font-size: 13px; color: white; font-style: italic;">"${escapeHtml(purchase.message)}"</div>
                        </div>
                        ` : ''}
                        
                        <!-- 分割线 -->
                        <div style="border-top: 1px dashed rgba(255,255,255,0.3); margin: 8px 0;"></div>
                        
                        <!-- 总计 -->
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 14px; color: rgba(255,255,255,0.9); font-weight: 500;">合计：</span>
                            <span style="font-size: 22px; color: white; font-weight: 700;">￥${purchase.total ? purchase.total.toFixed(2) : '0.00'}</span>
                        </div>
                    </div>
                </div>
            `;
        } else if (msg.type === 'piggybank-save') {
            // 小荷包存钱卡片
            let piggybank;
            try {
                piggybank = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
            } catch (e) {
                piggybank = { amount: 0, saver: '角色', message: '' };
            }
            
            messageContent = `
                <div style="transition: transform 0.15s ease; -webkit-tap-highlight-color: transparent;">
                    <div style="background: #e88787; border-radius: 12px; padding: 16px; min-width: 240px; max-width: 280px; box-shadow: 0 4px 16px rgba(232, 135, 135, 0.2); color: white;">
                        <!-- 头部 -->
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
                            <div style="width: 44px; height: 44px; background: rgba(255, 255, 255, 0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                    <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2"/>
                                    <path d="M2 9.5a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/>
                                    <path d="M15 11c0 .5.5 1 1 1"/>
                                </svg>
                            </div>
                            <div style="flex: 1;">
                                <div style="font-size: 16px; font-weight: 600;">我们的小荷包</div>
                                <div style="font-size: 12px; opacity: 0.9;">一起存钱，一起花</div>
                            </div>
                        </div>
                        
                        <!-- 分割线 -->
                        <div style="border-top: 1px solid rgba(255, 255, 255, 0.3); margin: 10px 0;"></div>
                        
                        <!-- 存钱信息 -->
                        <div style="margin-bottom: 12px;">
                            <div style="font-size: 13px; opacity: 0.9; margin-bottom: 6px;">${escapeHtml(piggybank.saver || '角色')} 存入了</div>
                            <div style="font-size: 28px; font-weight: 700;">￥${parseFloat(piggybank.amount).toFixed(2)}</div>
                        </div>
                        
                        <!-- 留言 -->
                        ${piggybank.message ? `
                        <div style="padding: 10px; background: rgba(255, 255, 255, 0.15); border-radius: 8px; margin-bottom: 10px;">
                            <div style="font-size: 13px; line-height: 1.5;">${escapeHtml(piggybank.message)}</div>
                        </div>
                        ` : ''}
                        
                        <!-- 提示 -->
                        <div style="text-align: center; font-size: 11px; opacity: 0.8;">
                            已存入小荷包
                        </div>
                    </div>
                </div>
            `;
        } else if (msg.type === 'transfer') {
            const transfer = msg.content;
            // 判断是否是收到的转账
            const isReceivedTransfer = msg.sender !== 'user';
            
            messageContent = `
                <div onclick="window.showTransferPopup('${msg.id}')" style="cursor: pointer; transition: transform 0.15s ease; -webkit-tap-highlight-color: transparent;" ontouchend="this.style.transform='scale(1)'" ontouchstart="this.style.transform='scale(0.97)'">
                    <div class="transfer-card" style="background: #FFFFFF; border-radius: 12px; padding: 16px; min-width: 220px; border: 1px solid #DEE2E6; box-shadow: 0 2px 8px rgba(0,0,0,0.04); pointer-events: none;">
                        <div class="transfer-amount" style="font-size: 20px; color: #6C757D; font-weight: 500; margin-bottom: 6px;">¥ ${transfer.amount}</div>
                        <div class="transfer-remark" style="font-size: 13px; color: #ADB5BD; margin-bottom: 10px;">${transfer.remark || '转账'}</div>
                        <div class="transfer-label" style="font-size: 11px; color: #CED4DA; display: flex; align-items: center; gap: 4px;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                                <circle cx="12" cy="12" r="2"></circle>
                            </svg>
                            微信转账
                        </div>
                        ${transfer.status === 'received' ? `
                        <div class="transfer-status" style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #DEE2E6; text-align: center;">
                            <span style="font-size: 12px; color: #999;">已收款</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        } else if (msg.type === 'transfer-refunded') {
            // 退还转账提示卡片 - 使用小票风格
            const transfer = msg.content;
            messageContent = `
                <div class="transfer-card" style="background: #FFFFFF; border-radius: 12px; padding: 16px; min-width: 220px; border: 1px solid #DEE2E6; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                    <div class="transfer-status" style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" style="flex-shrink: 0;">
                            <polyline points="1 4 1 10 7 10"></polyline>
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                        </svg>
                        <span style="font-size: 15px; color: #999; font-weight: 600;">已退还</span>
                    </div>
                    <div class="transfer-amount" style="font-size: 20px; color: #999; font-weight: 500; margin-bottom: 6px;">¥${parseFloat(transfer.amount).toFixed(2)}</div>
                    <div class="transfer-remark" style="font-size: 13px; color: #AAA; margin-bottom: 10px;">${transfer.remark || '转账'}</div>
                    <div class="transfer-label" style="font-size: 11px; color: #CED4DA; display: flex; align-items: center; gap: 4px; padding-top: 8px; border-top: 1px dashed #DEE2E6;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;">
                            <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                            <circle cx="12" cy="12" r="2"></circle>
                        </svg>
                        <span>微信转账</span>
                    </div>
                </div>
            `;
        } else if (msg.type === 'transfer-received') {
            // AI 发送的收款成功卡片 - 使用小票风格
            const transfer = msg.content;
            messageContent = `
                <div class="transfer-card" style="background: #FFFFFF; border-radius: 12px; padding: 16px; min-width: 220px; border: 1px solid #DEE2E6; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                    <div class="transfer-status" style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6C757D" stroke-width="2" style="flex-shrink: 0;">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span style="font-size: 15px; color: #6C757D; font-weight: 600;">已收款</span>
                    </div>
                    <div class="transfer-amount" style="font-size: 20px; color: #6C757D; font-weight: 500; margin-bottom: 6px;">￥${transfer.amount.toFixed(2)}</div>
                    <div class="transfer-label" style="font-size: 11px; color: #CED4DA; display: flex; align-items: center; gap: 4px; padding-top: 8px; border-top: 1px dashed #DEE2E6;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;">
                            <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                            <circle cx="12" cy="12" r="2"></circle>
                        </svg>
                        <span>微信转账</span>
                    </div>
                </div>
            `;
        } else if (msg.type === 'pay-request') {
            // 代付请求卡片
            let payData;
            try {
                payData = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
            } catch (e) {
                payData = { itemName: '商品', amount: 0, quantity: 1 };
            }
            
            messageContent = `
                <div style="background: #FBF7E9; border-radius: 12px; padding: 16px; min-width: 220px; border: 1px solid #F1CC74; box-shadow: 0 2px 8px rgba(241, 204, 116, 0.15);">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F1CC74" stroke-width="2" style="flex-shrink: 0;">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <span style="font-size: 15px; color: #9F8F82; font-weight: 600;">请求代付</span>
                    </div>
                    <div style="font-size: 16px; color: #333; font-weight: 500; margin-bottom: 6px;">${escapeHtml(payData.itemName || '商品')}</div>
                    <div style="font-size: 13px; color: #9F8F82; margin-bottom: 10px;">${escapeHtml(payData.itemDesc || '')}</div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px dashed #F1CC74;">
                        <div style="font-size: 20px; color: #F1CC74; font-weight: 600;">¥${payData.amount}</div>
                        <div style="font-size: 12px; color: #9F8F82;">x${payData.quantity || 1}</div>
                    </div>
                </div>
            `;
        } else if (msg.type === 'pay-done') {
            // AI已代付卡片
            let payDone;
            try {
                payDone = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
            } catch (e) {
                payDone = { itemName: '商品', amount: 0, remark: '' };
            }
            
            messageContent = `
                <div style="background: #F1CC74; border-radius: 12px; padding: 16px; min-width: 220px; box-shadow: 0 2px 8px rgba(241, 204, 116, 0.3);">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" style="flex-shrink: 0;">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span style="font-size: 15px; color: white; font-weight: 600;">已代付</span>
                    </div>
                    <div style="font-size: 16px; color: white; font-weight: 500; margin-bottom: 6px;">${escapeHtml(payDone.itemName || '商品')}</div>
                    <div style="font-size: 22px; color: white; font-weight: 600; margin-bottom: 8px;">¥${payDone.amount}</div>
                    ${payDone.remark ? `<div style="font-size: 13px; color: rgba(255,255,255,0.9); padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.3);">${escapeHtml(payDone.remark)}</div>` : ''}
                </div>
            `;
        } else if (msg.type === 'pay-response') {
            // 代付回应卡片
            let payResponse;
            try {
                payResponse = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
            } catch (e) {
                payResponse = { status: 'accepted', message: '' };
            }
            
            const isAccepted = payResponse.status === 'accepted';
            const bgColor = isAccepted ? '#F1CC74' : '#E0E0E0';
            const iconSvg = isAccepted 
                ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" style="flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>'
                : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" style="flex-shrink: 0;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
            
            messageContent = `
                <div style="background: #FBF7E9; border-radius: 12px; padding: 16px; min-width: 220px; border: 1px solid ${bgColor}; box-shadow: 0 2px 8px rgba(241, 204, 116, 0.15);">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: ${bgColor}; display: flex; align-items: center; justify-content: center;">
                            ${iconSvg}
                        </div>
                        <span style="font-size: 15px; color: #9F8F82; font-weight: 600;">${isAccepted ? '已接受代付' : '已拒绝代付'}</span>
                    </div>
                    ${payResponse.message ? `<div style="font-size: 14px; color: #666; padding: 10px; background: white; border-radius: 8px;">${escapeHtml(payResponse.message)}</div>` : ''}
                </div>
            `;
        } else if (msg.type === 'couple_invite') {
            // 情侣空间邀请卡片 - 特殊处理，不显示气泡框
            const isReceived = msg.sender !== 'user';
            
            // 修复：从 content 对象中获取数据（兼容压缩和未压缩格式）
            let inviter, invitee, status;
            if (msg.content && typeof msg.content === 'object') {
                // 未压缩格式：字段在 content 中
                inviter = msg.content.inviter || '对方';
                invitee = msg.content.invitee || '你';
                status = msg.content.status || 'pending';
            } else {
                // 压缩格式或未压缩格式：直接在 msg 上
                inviter = msg.inviter || '对方';
                invitee = msg.invitee || '你';
                status = msg.status || 'pending';
            }
            
            // 根据发送者显示不同文案
            const inviteText = isReceived 
                ? `${escapeHtml(inviter)} 邀请你开通` 
                : `你邀请 ${escapeHtml(inviter)} 开通`;
            
            let statusHtml = '';
            if (status === 'pending' && isReceived) {
                // 收到的待处理邀请，显示接受/拒绝按钮
                statusHtml = `
                    <div style="display: flex; gap: 10px; margin-top: 14px;">
                        <button onclick="acceptCoupleInvite('${msg.id}')" style="flex: 1; padding: 10px; background: linear-gradient(135deg, #F8CCDB 0%, #DFE3E2 100%); color: #333; border: none; border-radius: 20px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s; box-shadow: 0 2px 8px rgba(248, 204, 219, 0.3);">接受邀请</button>
                        <button onclick="rejectCoupleInvite('${msg.id}')" style="flex: 1; padding: 10px; background: #F5F5F5; color: #9FA2A6; border: 1px solid #DFE3E2; border-radius: 20px; font-size: 14px; cursor: pointer;">拒绝</button>
                    </div>
                `;
            } else if (status === 'accepted') {
                // 已接受，显示接受卡片
                if (isReceived) {
                    // 我收到的邀请，对方已接受
                    statusHtml = `
                        <div style="margin-top: 14px; padding: 16px; background: #FEFDF8; border-radius: 12px; border: 2px solid #F8CCDB; box-shadow: 0 4px 12px rgba(248, 204, 219, 0.4);">
                            <div style="display: flex; align-items: center; gap: 8px; justify-content: center; margin-bottom: 8px;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F8CCDB" stroke-width="2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                <span style="font-size: 15px; color: #333; font-weight: 600;">情侣空间已开通</span>
                            </div>
                            <div style="font-size: 13px; color: #666; text-align: center;">
                                你们已经成功开通情侣空间
                            </div>
                        </div>
                    `;
                } else {
                    // 我发出的邀请，对方已接受
                    statusHtml = `
                        <div style="margin-top: 14px; padding: 16px; background: #FEFDF8; border-radius: 12px; border: 2px solid #F8CCDB; box-shadow: 0 4px 12px rgba(248, 204, 219, 0.4);">
                            <div style="display: flex; align-items: center; gap: 8px; justify-content: center; margin-bottom: 8px;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F8CCDB" stroke-width="2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                <span style="font-size: 15px; color: #333; font-weight: 600;">对方已接受邀请</span>
                            </div>
                            <div style="font-size: 13px; color: #666; text-align: center;">
                                情侣空间已成功开通
                            </div>
                        </div>
                    `;
                }
            } else if (status === 'rejected') {
                statusHtml = `
                    <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #DFE3E2; text-align: center;">
                        <span style="font-size: 13px; color: #9FA2A6;">已拒绝邀请</span>
                    </div>
                `;
            }
            
            messageContent = `
                <div style="background: #FFFFFF; border-radius: 16px; padding: 20px; min-width: 260px; border: 1px solid #E5E5E5; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
                        <div style="width: 44px; height: 44px; background: #F8CCDB; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </div>
                        <div style="flex: 1;">
                            <div style="font-size: 16px; color: #333; font-weight: 600; margin-bottom: 4px;">情侣空间邀请</div>
                            <div style="font-size: 13px; color: #9FA2A6;">${inviteText}</div>
                        </div>
                    </div>
                    <div style="margin-bottom: 14px;">
                        <div style="font-size: 13px; color: #666; line-height: 1.6; display: flex; align-items: center; gap: 6px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F8CCDB" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            <span>开启你们的甜蜜空间</span>
                        </div>
                    </div>
                    ${statusHtml}
                </div>
            `;
        } else if (msg.type === 'couple_accept') {
            // 💕 情侣空间接受卡片（从对方视角显示）
            messageContent = `
                <div style="background: #FEFDF8; border-radius: 16px; padding: 20px; min-width: 260px; border: 2px solid #F8CCDB; box-shadow: 0 4px 16px rgba(248, 204, 219, 0.4);">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                        <div style="width: 48px; height: 48px; background: #F8CCDB; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 8px rgba(248, 204, 219, 0.3);">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FEFDF8" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </div>
                        <div style="flex: 1;">
                            <div style="font-size: 17px; color: #333; font-weight: 700; margin-bottom: 4px;">已接受邀请</div>
                            <div style="font-size: 13px; color: #9FA2A6;">情侣空间成功开通</div>
                        </div>
                    </div>
                    <div style="background: #FEFDF8; border-radius: 12px; padding: 14px; border: 1px solid #F8CCDB;">
                        <div style="font-size: 14px; color: #666; line-height: 1.6; text-align: center;">
                            <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 8px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F8CCDB" stroke-width="2">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path>
                                </svg>
                                <span>从现在开始，这里是你们的甜蜜空间</span>
                            </div>
                            <span style="font-size: 12px; color: #9FA2A6; display: block;">记录美好时光，分享每一个甜蜜瞬间</span>
                        </div>
                    </div>
                    <div style="margin-top: 12px; text-align: center;">
                        <span style="font-size: 12px; color: #9FA2A6;">✓ ${msg.timeDisplay || ''}</span>
                    </div>
                </div>
            `;
        } else if (msg.type === 'reading_invite') {
            // 📚 阅读邀请（不显示卡片，已在书架页面直接处理）
            return; // 跳过渲染
        } else if (msg.type === 'reading_progress') {
            // 📚 阅读进度更新消息
            let bookId, bookTitle, chapterIndex, totalChapters, chapterTitle;
            
            if (msg.content && typeof msg.content === 'object') {
                // 未压缩格式
                bookId = msg.content.bookId;
                bookTitle = msg.content.bookTitle || '未知书籍';
                chapterIndex = msg.content.chapterIndex || 0;
                totalChapters = msg.content.totalChapters || 0;
                chapterTitle = msg.content.chapterTitle || '';
            } else {
                // 压缩格式或直接字段
                bookId = msg.bookId;
                bookTitle = msg.bookTitle || '未知书籍';
                chapterIndex = msg.chapterIndex || 0;
                totalChapters = msg.totalChapters || 0;
                chapterTitle = msg.chapterTitle || '';
            }
            
            const progressPercent = totalChapters > 0 ? Math.round(((chapterIndex + 1) / totalChapters) * 100) : 0;
            
            messageContent = `
                <div style="background: #F9FAF7; border-radius: 12px; padding: 14px; min-width: 240px; border: 1px solid #DFE3E2; box-shadow: 0 2px 8px rgba(163, 177, 138, 0.15);">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A3B18A" stroke-width="2" style="flex-shrink: 0;">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                        </svg>
                        <div style="flex: 1;">
                            <div style="font-size: 14px; color: #333; font-weight: 600;">正在阅读《${escapeHtml(bookTitle)}》</div>
                            <div style="font-size: 12px; color: #9FA2A6; margin-top: 2px;">${chapterTitle || `第 ${chapterIndex + 1} 章`}</div>
                        </div>
                    </div>
                    <div style="background: #E8ECE3; border-radius: 6px; height: 6px; overflow: hidden;">
                        <div style="width: ${progressPercent}%; height: 100%; background: linear-gradient(90deg, #A3B18A 0%, #9DBAD5 100%); border-radius: 6px; transition: width 0.3s ease;"></div>
                    </div>
                    <div style="text-align: right; margin-top: 6px; font-size: 11px; color: #A3B18A; font-weight: 600;">
                        ${chapterIndex + 1}/${totalChapters} · ${progressPercent}%
                    </div>
                </div>
            `;
        } else if (msg.type === 'family-card') {
            // 亲属卡消息
            const familyCard = msg.content;
            const isReceived = msg.sender !== 'user';
            
            messageContent = `
                <div style="background: #F5F5F5; border-radius: 12px; padding: 16px; min-width: 240px; border: 1px solid #E0E0E0; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" style="flex-shrink: 0;">
                            <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
                            <line x1="2" y1="10" x2="22" y2="10"></line>
                        </svg>
                        <span style="font-size: 15px; color: #333; font-weight: 600;">亲属卡邀请</span>
                    </div>
                    <div style="font-size: 20px; color: #1C1C1E; font-weight: 500; margin-bottom: 6px;">¥${parseFloat(familyCard.limit).toFixed(2)}/月</div>
                    <div style="font-size: 13px; color: #666; margin-bottom: 10px;">${familyCard.remark || '亲属卡'}</div>
                    ${isReceived && familyCard.status !== 'accepted' && familyCard.status !== 'rejected' ? `
                    <div style="display: flex; gap: 8px; margin-top: 12px;">
                        <button onclick="window.acceptFamilyCard('${msg.id}')" 
                            style="flex: 1; padding: 10px; background: #1C1C1E; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;"
                            onmousedown="this.style.transform='scale(0.98)'" 
                            onmouseup="this.style.transform='scale(1)'">
                            接受邀请
                        </button>
                        <button onclick="window.rejectFamilyCard('${msg.id}')" 
                            style="flex: 1; padding: 10px; background: #F5F5F5; color: #666; border: 1px solid #E0E0E0; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;"
                            onmousedown="this.style.transform='scale(0.98)'" 
                            onmouseup="this.style.transform='scale(1)'">
                            拒绝
                        </button>
                    </div>
                    ` : ''}
                    ${familyCard.status === 'accepted' ? `
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #E0E0E0; text-align: center;">
                        <span style="font-size: 13px; color: #1C1C1E; font-weight: 500;">✓ 已接受</span>
                        <div style="font-size: 12px; color: #999; margin-top: 4px;">亲属卡已生效 · 双向可见</div>
                    </div>
                    ` : ''}
                    ${familyCard.status === 'rejected' ? `
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #E0E0E0; text-align: center;">
                        <span style="font-size: 13px; color: #999; font-weight: 500;">✗ 已拒绝</span>
                        <div style="font-size: 12px; color: #CCC; margin-top: 4px;">邀请已失效 · 可随时重新发起</div>
                    </div>
                    ` : ''}
                </div>
            `;
        } else if (msg.type === 'family-card-accepted') {
            // 亲属卡接受成功卡片 - 低饱和配色
            const familyCard = msg.content;
            messageContent = `
                <div style="background: linear-gradient(135deg, #F5F5F5 0%, #E8E8E8 100%); border-radius: 12px; padding: 16px; min-width: 220px; border: 1px solid #D5D5D5; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" style="flex-shrink: 0;">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span style="font-size: 15px; color: #666; font-weight: 600;">亲属卡已接受</span>
                    </div>
                    <div style="font-size: 20px; color: #555; font-weight: 500; margin-bottom: 6px;">¥${parseFloat(familyCard.limit).toFixed(2)}/月</div>
                    <div style="font-size: 13px; color: #888; margin-bottom: 10px;">${familyCard.remark || '亲属卡'}</div>
                </div>
            `;
        } else if (msg.type === 'location') {
            const location = msg.content;
            messageContent = `
                <div style="background: white; border-radius: 8px; padding: 12px; min-width: 200px; border: 1px solid #e0e0e0;">
                    <div style="width: 100%; height: 100px; background: linear-gradient(135deg, #e8f4f8 0%, #d4edda 100%); border-radius: 4px; margin-bottom: 8px; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 20px; height: 20px; background: #07C160; border-radius: 50% 50% 50% 0; transform: rotate(-45deg);"></div>
                    </div>
                    <div style="font-size: 15px; color: #333; font-weight: 500; margin-bottom: 4px;">${location.name}</div>
                    <div style="font-size: 12px; color: #999;">${location.address || '地址未知'}</div>
                </div>
            `;
        } else if (msg.type === 'recalled') {
            // 撤回的消息 - 微信样式，完全居中，无头像，可以点击查看详情
            html += `
                <div style="text-align: center; padding: 8px 0;">
                    <span style="display: inline-block; color: #999; font-size: 12px; cursor: pointer;" onclick="viewRecalledMessage(${msg.id})">
                        ${msg.sender === 'user' ? '你' : getAIName()}撤回了一条消息
                    </span>
                </div>
            `;
            
            lastTime = msg.time;
            return; // 直接返回，不渲染下面的内容
        } else if (msg.type === 'offline-narrative') {
            // 线下长文本叙事 - 灰色字体，居中显示
            html += `
                <div class="offline-narrative-message">
                    <div class="offline-narrative-content">${escapeHtml(msg.content)}</div>
                </div>
            `;
            
            lastTime = msg.time;
            return;
        } else if (msg.type === 'merge-forward') {
            // 合并转发消息卡片
            messageContent = renderMergeForwardCard(msg.content);
        } else if (msg.type === 'video-call') {
            // 视频通话记录 - 对话气泡样式，显示通话时长
            const callInfo = msg.content;
            const iconColor = '#fff';
            const textColor = '#fff';
            messageContent = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                    <span style="font-size: 14px; color: ${textColor};">视频通话 ${callInfo.duration}</span>
                </div>
            `;
        } else if (msg.type === 'voice-call') {
            // 语音通话记录 - 对话气泡样式，显示通话时长
            const callInfo = msg.content;
            const iconColor = '#fff';
            const textColor = '#fff';
            messageContent = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="23"></line>
                        <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                    <span style="font-size: 14px; color: ${textColor};">语音通话 ${callInfo.duration}</span>
                </div>
            `;
        } else if (msg.type === 'gift') {
            // 节日礼物消息
            let gift;
            try {
                gift = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
            } catch (e) {
                gift = { occasion: '节日', giftIcon: '🎁', giftName: '神秘礼物', message: '节日快乐~' };
            }
            
            messageContent = `
                <div style="cursor: pointer; transition: transform 0.15s ease; -webkit-tap-highlight-color: transparent;" ontouchend="this.style.transform='scale(1)'" ontouchstart="this.style.transform='scale(0.97)'">
                    <div style="background: #FFE8F0; border-radius: 16px; padding: 20px; min-width: 260px; max-width: 300px; box-shadow: 0 4px 16px rgba(248, 204, 219, 0.3);">
                        <!-- 礼物图标 -->
                        <div style="text-align: center; margin-bottom: 14px;">
                            <div style="font-size: 72px; display: inline-block; animation: giftBounce 0.6s ease-out, giftSparkle 2s ease-in-out infinite;">${gift.giftIcon || '🎁'}</div>
                        </div>
                        
                        <!-- 节日标题 -->
                        <div style="text-align: center; font-size: 18px; font-weight: 700; color: #333; margin-bottom: 6px;">
                            ${gift.occasion || '节日'}礼物
                        </div>
                        
                        <!-- 副标题 -->
                        <div style="text-align: center; font-size: 14px; color: #666; margin-bottom: 16px;">
                            来自${getAIName()}的礼物~
                        </div>
                        
                        <!-- 分隔线 -->
                        <div style="border-top: 1px dashed rgba(248, 204, 219, 0.5); margin: 12px 0;"></div>
                        
                        <!-- 礼物内容 -->
                        <div style="background: white; border-radius: 12px; padding: 14px; margin-bottom: 12px; text-align: center;">
                            <div style="font-size: 20px; font-weight: 600; color: #333; margin-bottom: 10px;">${gift.giftName || '精美礼物'}</div>
                            <div style="font-size: 14px; color: #666; line-height: 1.6; font-style: italic;">
                                "${gift.message || '愿你每天开心~'}"
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // 文本消息
            if (isTranslationModeOn && msg.sender !== 'user') {
                // 翻译模式：AI 消息
                
                // 优先使用消息自带的翻译
                let translation = msg.translation;
                
                // 如果没有，尝试从缓存中查找
                if (!translation && translationCache[msg.content]) {
                    translation = translationCache[msg.content];
                    console.log('🌐 从缓存中找到翻译:', translation.substring(0, 30));
                }
                
                if (translation) {
                    // 有翻译：显示双语（上面外文，下面中文）
                    messageContent = `
                        <div style="line-height: 1.6;">
                            <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px dashed rgba(0,0,0,0.1); font-style: italic;">${escapeHtml(msg.content)}</div>
                            <div style="color: #333;">${escapeHtml(translation)}</div>
                        </div>
                    `;
                } else {
                    // 无翻译：只显示原文（不显示按钮，等待 AI 下次回复时带上翻译）
                    messageContent = escapeHtml(msg.content);
                }
            } else {
                messageContent = escapeHtml(msg.content);
            }
        }
        
        // 如果有引用消息，添加引用气泡
        let replyHTML = '';
        if (msg.replyTo) {
            const replyContent = getContentPreview(msg.replyTo.content, msg.replyTo.type);
            const replySenderName = msg.replyTo.sender === 'user' ? '你' : getAIName();
            replyHTML = `
                <div style="margin-bottom: 6px; padding: 8px 12px; background: rgba(245, 245, 245, 0.9); border-radius: 8px; border-left: 3px solid #B0B0B0; font-size: 13px; color: #666; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                    <div style="font-size: 12px; color: #888; margin-bottom: 3px; font-weight: 500; letter-spacing: 0.2px;">${replySenderName}</div>
                    <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #777; line-height: 1.4;">${replyContent}</div>
                </div>
            `;
        }
        
        html += `
            <div class="message-item ${isSent ? 'sent' : 'received'}" data-msg-id="${msg.id}">
                ${isMultiSelectMode ? `
                    <div class="message-checkbox" onclick="toggleMessageSelection('${msg.id}', event)" style="flex-shrink: 0; margin: 0 8px; display: flex; align-items: center; cursor: pointer;">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="${selectedMessageIds.has(String(msg.id)) ? '#07C160' : 'none'}" stroke="${selectedMessageIds.has(String(msg.id)) ? '#07C160' : '#ccc'}" stroke-width="2" style="transition: all 0.2s;">
                            <rect x="3" y="3" width="18" height="18" rx="3" ry="3"></rect>
                            ${selectedMessageIds.has(String(msg.id)) ? '<polyline points="9 11 12 14 22 4"></polyline>' : ''}
                        </svg>
                    </div>
                ` : ''}
                ${showAvatarEnabled ? `
                <div class="message-avatar" ${!isSent ? `onclick="showWhisperModal()" style="cursor: pointer; border-radius: ${avatarBorderRadius} !important; overflow: hidden;"` : `style="border-radius: ${avatarBorderRadius} !important; overflow: hidden;"`}>
                    ${isImageUrl(avatar) ? `<img src="${avatar}" alt="" style="border-radius: ${avatarBorderRadius} !important; width: 100%; height: 100%; object-fit: cover;">` : avatar}
                </div>
                ` : ''}
                ${msg.type === 'shopping-receipt' ? `
                    <div class="shopping-receipt-wrapper" style="flex: 1; display: flex; ${isSent ? 'justify-content: flex-end;' : 'justify-content: flex-start;'}; background: transparent !important; padding: 0 !important;">
                        <div style="position: relative;">
                            ${messageContent}
                            ${(() => {
                                // 检查是否开启显示时间戳
                                try {
                                    const chatKey = `chat_config_${currentChatId}`;
                                    const chatConfig = JSON.parse(localStorage.getItem(chatKey) || '{}');
                                    if (chatConfig.showTimestamp && msg.time) {
                                        const timestamp = typeof msg.time === 'number' ? msg.time : Date.parse(msg.time);
                                        if (timestamp) {
                                            const date = new Date(timestamp);
                                            const hours = String(date.getHours()).padStart(2, '0');
                                            const minutes = String(date.getMinutes()).padStart(2, '0');
                                            const seconds = String(date.getSeconds()).padStart(2, '0');
                                            const timeStr = `${hours}:${minutes}:${seconds}`;
                                            return `<div style="position: absolute; bottom: -2px; right: 4px; font-size: 11px; color: #999; white-space: nowrap;">${timeStr}</div>`;
                                        }
                                    }
                                } catch (e) {}
                                return '';
                            })()}
                        </div>
                    </div>
                ` : msg.type === 'transfer' || msg.type === 'transfer-refunded' || msg.type === 'transfer-received' ? `
                    <div class="transfer-message-wrapper" style="flex: 1; display: flex; ${isSent ? 'justify-content: flex-end;' : 'justify-content: flex-start;'}; background: transparent !important; padding: 0 !important;">
                        <div style="position: relative;">
                            ${messageContent}
                            ${(() => {
                                // 检查是否开启显示时间戳
                                try {
                                    const chatKey = `chat_config_${currentChatId}`;
                                    const chatConfig = JSON.parse(localStorage.getItem(chatKey) || '{}');
                                    if (chatConfig.showTimestamp && msg.time) {
                                        const timestamp = typeof msg.time === 'number' ? msg.time : Date.parse(msg.time);
                                        if (timestamp) {
                                            const date = new Date(timestamp);
                                            const hours = String(date.getHours()).padStart(2, '0');
                                            const minutes = String(date.getMinutes()).padStart(2, '0');
                                            const seconds = String(date.getSeconds()).padStart(2, '0');
                                            const timeStr = `${hours}:${minutes}:${seconds}`;
                                            return `<div style="position: absolute; bottom: -2px; right: 4px; font-size: 11px; color: #999; white-space: nowrap;">${timeStr}</div>`;
                                        }
                                    }
                                } catch (e) {}
                                return '';
                            })()}
                        </div>
                    </div>
                ` : msg.type === 'couple_invite' ? `
                    <div class="couple-invite-wrapper" style="flex: 1; display: flex; ${isSent ? 'justify-content: flex-end;' : 'justify-content: flex-start;'}; background: transparent !important; padding: 0 !important;">
                        <div style="position: relative;">
                            ${messageContent}
                            ${(() => {
                                // 检查是否开启显示时间戳
                                try {
                                    const chatKey = `chat_config_${currentChatId}`;
                                    const chatConfig = JSON.parse(localStorage.getItem(chatKey) || '{}');
                                    if (chatConfig.showTimestamp && msg.time) {
                                        const timestamp = typeof msg.time === 'number' ? msg.time : Date.parse(msg.time);
                                        if (timestamp) {
                                            const date = new Date(timestamp);
                                            const hours = String(date.getHours()).padStart(2, '0');
                                            const minutes = String(date.getMinutes()).padStart(2, '0');
                                            const seconds = String(date.getSeconds()).padStart(2, '0');
                                            const timeStr = `${hours}:${minutes}:${seconds}`;
                                            return `<div style="position: absolute; bottom: -2px; right: 4px; font-size: 11px; color: #999; white-space: nowrap;">${timeStr}</div>`;
                                        }
                                    }
                                } catch (e) {}
                                return '';
                            })()}
                        </div>
                    </div>
                ` : `
                <div class="message-content">
                    ${senderNameHTML}
                    ${replyHTML}
                    <div class="message-bubble" 
                        oncontextmenu="showMessageMenu(event, '${msg.id}', '${isSent ? 'sent' : 'received'}'); return false;" 
                        ontouchstart="handleTouchStart(event, '${msg.id}', '${isSent ? 'sent' : 'received'}')" 
                        ontouchend="handleTouchEnd(event)"
                        onmousedown="handleMouseDown(event, '${msg.id}', '${isSent ? 'sent' : 'received'}')" 
                        onmouseup="handleMouseUp(event)"
                        style="position: relative;">
                        ${messageContent}
                        ${(() => {
                            // 检查是否开启显示时间戳
                            try {
                                const chatKey = `chat_config_${currentChatId}`;
                                const chatConfig = JSON.parse(localStorage.getItem(chatKey) || '{}');
                                if (chatConfig.showTimestamp && msg.time) {
                                    const timestamp = typeof msg.time === 'number' ? msg.time : Date.parse(msg.time);
                                    if (timestamp) {
                                        const date = new Date(timestamp);
                                        const hours = String(date.getHours()).padStart(2, '0');
                                        const minutes = String(date.getMinutes()).padStart(2, '0');
                                        const seconds = String(date.getSeconds()).padStart(2, '0');
                                        const timeStr = `${hours}:${minutes}:${seconds}`;
                                        return `<div style="position: absolute; bottom: -2px; right: 4px; font-size: 11px; color: #999; white-space: nowrap;">${timeStr}</div>`;
                                    }
                                }
                            } catch (e) {}
                            return '';
                        })()}
                    </div>
                </div>
                `}
            </div>
        `;
        
        lastTime = msg.time;
    });
    
    container.innerHTML = html;
    
    // 更新token显示栏
    updateTokenCountBar();
}

// 显示“正在输入..."
function showTypingIndicator() {
    const container = document.getElementById('chat-messages');
    
    // 添加空值检查
    if (!container) {
        console.warn('⚠️ showTypingIndicator: chat-messages 元素不存在');
        return;
    }
    
    // 获取当前聊天的头像显示配置
    let showAvatarEnabled = true; // 默认开启
    try {
        const chatKey = `chat_config_${currentChatId}`;
        const chatConfig = JSON.parse(localStorage.getItem(chatKey) || '{}');
        showAvatarEnabled = chatConfig.showAvatar !== undefined ? chatConfig.showAvatar : true;
    } catch (e) {
        console.warn('⚠️ 读取显示头像配置失败:', e);
    }
    
    // 获取 AI 头像
    const aiAvatar = getAIAvatar();
    
    const indicator = document.createElement('div');
    indicator.id = 'typing-indicator';
    indicator.className = 'message-item received';
    indicator.innerHTML = `
        ${showAvatarEnabled ? `
        <div class="message-avatar">
            ${isImageUrl(aiAvatar) ? `<img src="${aiAvatar}" alt="">` : aiAvatar}
        </div>
        ` : ''}
        <div class="message-content">
            <div class="message-bubble" style="padding: 12px 18px;">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        </div>
    `;
    container.appendChild(indicator);
    // 直接滚动到底部，不调用 renderMessages（避免清除刚添加的指示器）
    scrollToBottom();
}

// 移除"正在输入..."
function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// 滚动到底部
function scrollToBottom() {
    const container = document.getElementById('chat-messages');
    if (!container) return; // 元素不存在时直接返回
    container.scrollTop = container.scrollHeight;
}

// 初始化token显示栏（动态创建，避免缓存问题）
// @version 2 - 修复 memoryContext 和 hasPayRequest 错误
function initTokenCountBar() {
    // 检查是否已存在
    if (document.getElementById('token-count-bar')) {
        return; // 已存在，不需要创建
    }
    
    const inputArea = document.querySelector('.chat-input-area');
    if (!inputArea) {
        console.warn('⚠️ 找不到输入区域，无法创建token显示栏');
        return;
    }
    
    // 动态创建token显示栏
    const tokenBar = document.createElement('div');
    tokenBar.id = 'token-count-bar';
    tokenBar.style.cssText = 'display: none; padding: 6px 16px; background: #f8f9fa; border-top: 1px solid #e5e5e5; text-align: right; font-size: 12px; color: #999;';
    tokenBar.innerHTML = '<span id="token-count-text">0 tokens</span>';
    
    // 插入到输入区域的最前面
    inputArea.insertBefore(tokenBar, inputArea.firstChild);
    
    console.log('✅ Token显示栏已动态创建');
}

// 更新token显示栏
function updateTokenCountBar() {
    const tokenBar = document.getElementById('token-count-bar');
    const tokenText = document.getElementById('token-count-text');
    
    if (!tokenBar || !tokenText) return;
    
    // 检查是否开启显示token数
    try {
        const chatKey = `chat_config_${currentChatId}`;
        const chatConfig = JSON.parse(localStorage.getItem(chatKey) || '{}');
        
        if (chatConfig.showTokenCount) {
            // 计算所有AI消息的token总数
            const totalTokens = chatMessages
                .filter(msg => msg.sender === 'ai' && msg.tokenCount)
                .reduce((sum, msg) => sum + msg.tokenCount, 0);
            
            if (totalTokens > 0) {
                const tokenStr = totalTokens >= 1000 ? `${(totalTokens / 1000).toFixed(1)}k` : totalTokens;
                tokenText.textContent = `${tokenStr} tokens`;
                tokenBar.style.display = 'block';
            } else {
                tokenBar.style.display = 'none';
            }
        } else {
            tokenBar.style.display = 'none';
        }
    } catch (e) {
        console.warn('⚠️ 更新token显示栏失败:', e);
        tokenBar.style.display = 'none';
    }
}

// 更新聊天设置中的当前token显示
function updateCurrentTokenDisplay() {
    const tokenDisplay = document.getElementById('current-token-display');
    
    if (!tokenDisplay) return;
    
    try {
        // 计算所有AI消息的token总数
        const totalTokens = chatMessages
            .filter(msg => msg.sender === 'ai' && msg.tokenCount)
            .reduce((sum, msg) => sum + msg.tokenCount, 0);
        
        const tokenStr = totalTokens >= 1000 ? `${(totalTokens / 1000).toFixed(1)}k` : totalTokens;
        tokenDisplay.textContent = `当前: ${tokenStr} tokens`;
    } catch (e) {
        console.warn('⚠️ 更新当前token显示失败:', e);
        tokenDisplay.textContent = '当前: 0 tokens';
    }
}

// ========== 多选功能 ==========

// 进入多选模式
window.enterMultiSelectMode = function() {
    isMultiSelectMode = true;
    selectedMessageIds.clear();
    renderMessages();
    updateMultiSelectToolbar();
};

// 退出多选模式
window.exitMultiSelectMode = function() {
    isMultiSelectMode = false;
    selectedMessageIds.clear();
    renderMessages();
    updateMultiSelectToolbar();
};

// 切换消息选择状态
window.toggleMessageSelection = function(msgId, event) {
    event.stopPropagation();
    
    // 统一转换为字符串，因为 Set 使用严格比较
    const stringMsgId = String(msgId);
    
    if (selectedMessageIds.has(stringMsgId)) {
        selectedMessageIds.delete(stringMsgId);
    } else {
        selectedMessageIds.add(stringMsgId);
    }
    
    renderMessages();
    updateMultiSelectToolbar();
};

// 全选/取消全选
window.selectAllMessages = function() {
    if (selectedMessageIds.size === chatMessages.length) {
        // 取消全选
        selectedMessageIds.clear();
    } else {
        // 全选
        chatMessages.forEach(msg => {
            selectedMessageIds.add(msg.id);
        });
    }
    
    renderMessages();
    updateMultiSelectToolbar();
};

// 更新工具栏显示
function updateMultiSelectToolbar() {
    const toolbar = document.getElementById('multi-select-toolbar');
    const countElement = document.getElementById('selected-count');
    
    if (!toolbar || !countElement) return;
    
    if (isMultiSelectMode) {
        toolbar.style.display = 'flex';
        countElement.textContent = `已选择 ${selectedMessageIds.size} 条消息`;
    } else {
        toolbar.style.display = 'none';
    }
}

// 删除选中的消息
window.deleteSelectedMessages = function() {
    if (selectedMessageIds.size === 0) {
        showToast('请先选择要删除的消息', 'info');
        return;
    }
    
    if (!confirm(`确定要删除选中的 ${selectedMessageIds.size} 条消息吗？`)) {
        return;
    }
    
    // 过滤掉选中的消息（统一转换为字符串比较）
    chatMessages = chatMessages.filter(msg => !selectedMessageIds.has(String(msg.id)));
    
    saveChatData();
    renderMessages();
    exitMultiSelectMode();
    
    showToast(`已删除 ${selectedMessageIds.size} 条消息`, 'success');
};

// 转发选中的消息
window.forwardSelectedMessages = function() {
    if (selectedMessageIds.size === 0) {
        showToast('请先选择要转发的消息', 'info');
        return;
    }
    
    // 打开联系人选择弹窗
    showForwardContactModal();
};

// 显示转发联系人选择弹窗
function showForwardContactModal() {
    const modal = document.getElementById('forward-contact-modal');
    if (modal) {
        renderForwardContactList();
        modal.style.display = 'flex';
    }
}

// 关闭转发联系人选择弹窗
window.closeForwardContactModal = function() {
    const modal = document.getElementById('forward-contact-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};

// 渲染转发联系人列表
function renderForwardContactList() {
    const listContainer = document.getElementById('forward-contact-list');
    if (!listContainer) return;
    
    const personaId = localStorage.getItem('currentPersonaId') || 'default';
    const contactsKey = `persona_${personaId}_chatContacts`;
    const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
    
    if (contacts.length === 0) {
        listContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">暂无联系人</div>';
        return;
    }
    
    // 过滤掉当前聊天对象
    const filteredContacts = contacts.filter(c => c.id !== currentChatId);
    
    if (filteredContacts.length === 0) {
        listContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">没有其他联系人可转发</div>';
        return;
    }
    
    listContainer.innerHTML = filteredContacts.map(contact => {
        const avatar = contact.avatar || '👤';
        const name = contact.name || '未知';
        const isImageUrl = (avatar.startsWith('data:') || avatar.startsWith('http') || avatar.startsWith('blob:'));
        
        return `
            <div class="forward-contact-item" onclick="forwardToContact('${contact.id}')">
                <div class="forward-contact-avatar">
                    ${isImageUrl ? `<img src="${avatar}" alt="">` : avatar}
                </div>
                <div class="forward-contact-info">
                    <div class="forward-contact-name">${name}</div>
                    <div class="forward-contact-desc">${contact.info || ''}</div>
                </div>
            </div>
        `;
    }).join('');
}

// 转发到指定联系人
window.forwardToContact = async function(targetChatId) {
    if (selectedMessageIds.size === 0) return;
    
    // 统一转换为字符串比较
    const selectedMessages = chatMessages.filter(msg => selectedMessageIds.has(String(msg.id)));
    
    // 生成合并消息内容
    const mergeContent = selectedMessages.map(msg => {
        const sender = msg.sender === 'user' ? '我' : getAIName();
        const time = formatTime(msg.time);
        let content = '';
        
        if (msg.type === 'image' || msg.type === 'emoji') {
            content = '[图片]';
        } else if (msg.type === 'transfer') {
            content = `[转账] ¥${msg.content.amount}`;
        } else if (msg.type === 'family-card') {
            content = `[亲属卡] ¥${msg.content.limit}/月`;
        } else if (msg.type === 'location') {
            content = `[位置] ${msg.content.name}`;
        } else {
            content = msg.content;
        }
        
        return { sender, time, content, type: msg.type, originalMsg: msg };
    });
    
    // 获取目标联系人名称
    const personaId = localStorage.getItem('currentPersonaId') || 'default';
    const contactsKey = `persona_${personaId}_chatContacts`;
    const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
    const targetContact = contacts.find(c => c.id === targetChatId);
    const targetName = targetContact ? (targetContact.name || '未知') : '未知';
    
    // 创建合并转发消息
    const forwardMessage = {
        id: Date.now().toString(),
        type: 'merge-forward',
        content: {
            from: getAIName(),
            to: targetName,
            messages: mergeContent,
            count: selectedMessages.length
        },
        sender: 'user',
        time: Date.now(),
        avatar: getUserAvatar()
    };
    
    // 保存消息到目标联系人的聊天记录
    try {
        // 先加载目标联系人的现有消息
        const targetMessages = await window.ChatDB.loadMessages(targetChatId);
        let decompressedMessages = [];
        
        if (targetMessages && targetMessages.length > 0) {
            // 解压现有消息
            decompressedMessages = targetMessages.map(msg => {
                const decompressed = {
                    id: msg.id,
                    type: msg.t,
                    content: msg.c,
                    sender: msg.s,
                    time: msg.tm
                };
                if (msg.r) decompressed.replyTo = msg.r;
                if (msg.ir) {
                    decompressed.isRecalled = true;
                    decompressed.type = 'recalled';
                }
                return decompressed;
            });
        }
        
        // 添加转发消息
        decompressedMessages.push(forwardMessage);
        
        // 压缩并保存
        const MAX_MESSAGES = 500;
        const messagesToSave = decompressedMessages.slice(-MAX_MESSAGES);
        const compressedMessages = messagesToSave.map(msg => {
            const compressed = {
                id: msg.id,
                t: msg.type,
                c: msg.content,
                s: msg.sender,
                tm: msg.time
            };
            if (msg.replyTo) compressed.r = msg.replyTo;
            if (msg.isRecalled) compressed.ir = true;
            return compressed;
        });
        
        await window.ChatDB.saveMessages(targetChatId, compressedMessages);
        console.log(`✓ 已转发消息到 ${targetName} (${targetChatId})`);
        
        // 同时保存到 localStorage 作为备份
        const chatKey = `chat_${targetChatId}`;
        localStorage.setItem(chatKey, JSON.stringify(compressedMessages));
        
    } catch (error) {
        console.error('保存转发消息失败:', error);
        // 降级方案：直接保存到 localStorage
        const chatKey = `chat_${targetChatId}`;
        const existingData = localStorage.getItem(chatKey);
        let existingMessages = existingData ? JSON.parse(existingData) : [];
        
        // 解压现有消息
        let decompressedMessages = existingMessages.map(msg => ({
            id: msg.id,
            type: msg.t,
            content: msg.c,
            sender: msg.s,
            time: msg.tm,
            replyTo: msg.r,
            isRecalled: msg.ir ? true : undefined
        }));
        
        // 添加转发消息
        decompressedMessages.push(forwardMessage);
        
        // 压缩并保存
        const MAX_MESSAGES = 500;
        const messagesToSave = decompressedMessages.slice(-MAX_MESSAGES);
        const compressedMessages = messagesToSave.map(msg => {
            const compressed = {
                id: msg.id,
                t: msg.type,
                c: msg.content,
                s: msg.sender,
                tm: msg.time
            };
            if (msg.replyTo) compressed.r = msg.replyTo;
            if (msg.isRecalled) compressed.ir = true;
            return compressed;
        });
        
        localStorage.setItem(chatKey, JSON.stringify(compressedMessages));
    }
    
    // 关闭弹窗和多选模式
    closeForwardContactModal();
    exitMultiSelectMode();
    
    showToast(`已转发 ${selectedMessages.length} 条消息给 ${targetName}`, 'success');
};

// 渲染合并转发消息卡片
function renderMergeForwardCard(content) {
    const messages = content.messages || [];
    
    const messagesHTML = messages.slice(0, 5).map(msg => {
        return `<div style="font-size: 13px; color: #666; margin-bottom: 4px;">
            <span style="color: #999;">${msg.sender}</span>: ${msg.content}
        </div>`;
    }).join('');
    
    const moreText = messages.length > 5 ? `<div style="font-size: 12px; color: #999; margin-top: 4px;">...等 ${messages.length} 条消息</div>` : '';
    
    return `
        <div style="background: rgba(240, 240, 240, 0.85); backdrop-filter: blur(10px); border-radius: 12px; padding: 12px; min-width: 200px; max-width: 260px; border: 1px solid #e0e0e0;">
            <div style="font-size: 14px; font-weight: 500; color: #333; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
                    <polyline points="17 1 21 5 17 9"></polyline>
                    <path d="M3 11V9a4 4 0 014-4h14"></path>
                    <polyline points="7 23 3 19 7 15"></polyline>
                    <path d="M21 13v2a4 4 0 01-4 4H3"></path>
                </svg>
                聊天记录
            </div>
            <div style="margin-bottom: 8px;">
                ${messagesHTML}
            </div>
            ${moreText}
        </div>
    `;
}

// 格式化时间
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// 判断是否为图片 URL
function isImageUrl(str) {
    if (!str) return false;
    
    // 支持多种格式:
    // 1. data:image/ 开头的 base64
    // 2. http:// 或 https:// 开头
    // 3. 包含图片扩展名
    // 4. 看起来像 URL 的字符串
    
    const hasDataProtocol = str.startsWith('data:image/');
    const hasProtocol = str.startsWith('http://') || str.startsWith('https://');
    const hasExtension = /\.(jpeg|jpg|gif|png|webp|bmp|svg|ico)$/i.test(str);
    const looksLikeURL = str.includes('.') && !str.includes(' ') && str.length > 5;
    
    return hasDataProtocol || hasProtocol || hasExtension || looksLikeURL;
}

// HTML 转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 获取用户头像
function getUserAvatar() {
    try {
        // 优先从主页面框架获取数据
        const mainFrame = document.querySelector('iframe');
        if (mainFrame && mainFrame.contentWindow) {
            const profile = mainFrame.contentWindow.getData('myProfile');
            if (profile && profile.avatar) {
                console.log('从主页面获取用户头像:', profile.avatar);
                return profile.avatar;
            }
        }
        
        // 如果不在 iframe 中，尝试从 localStorage 读取 (带 persona)
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const profileKey = `persona_${currentPersona}_myProfile`;
        const profile = JSON.parse(localStorage.getItem(profileKey) || '{}');
        if (profile.avatar) {
            console.log('从 localStorage 获取用户头像:', profile.avatar);
            return profile.avatar;
        }
        
        return '👤';
    } catch (e) {
        console.error('获取用户头像失败:', e);
        return '👤';
    }
}

// 获取 AI 头像
function getAIAvatar() {
    try {
        // 优先使用当前聊天对象的头像
        if (currentChatId) {
            // 尝试从主页面框架获取
            const mainFrame = document.querySelector('iframe');
            if (mainFrame && mainFrame.contentWindow) {
                const contacts = mainFrame.contentWindow.getData('chatContacts');
                if (contacts && contacts.length > 0) {
                    const contact = contacts.find(c => c.id === currentChatId);
                    if (contact && contact.avatar) {
                        console.log('从主页面获取联系人头像:', contact.avatar);
                        return contact.avatar;
                    }
                }
            }
            
            // 尝试从 localStorage 读取
            const currentPersona = localStorage.getItem('currentPersona') || 'default';
            const contactsKey = `persona_${currentPersona}_chatContacts`;
            const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
            const contact = contacts.find(c => c.id === currentChatId);
            if (contact && contact.avatar) {
                console.log('从 localStorage 获取联系人头像:', contact.avatar);
                return contact.avatar;
            }
        }
        
        // 默认返回机器人头像
        return '🤖';
    } catch (e) {
        console.error('获取 AI 头像失败:', e);
        return '🤖';
    }
}

// 获取 AI 名字
function getAIName() {
    try {
        // 优先使用当前聊天对象的名字
        if (currentChatId) {
            // 尝试从主页面框架获取
            const mainFrame = document.querySelector('iframe');
            if (mainFrame && mainFrame.contentWindow) {
                const contacts = mainFrame.contentWindow.getData('chatContacts');
                if (contacts && contacts.length > 0) {
                    const contact = contacts.find(c => c.id === currentChatId);
                    if (contact && contact.name) {
                        return contact.name;
                    }
                }
            }
            
            // 尝试从 localStorage 读取
            const currentPersona = localStorage.getItem('currentPersona') || 'default';
            const contactsKey = `persona_${currentPersona}_chatContacts`;
            const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
            const contact = contacts.find(c => c.id === currentChatId);
            if (contact && contact.name) {
                return contact.name;
            }
        }
        
        // 默认名字
        return 'AI';
    } catch (e) {
        console.error('获取 AI 名字失败:', e);
        return 'AI';
    }
}

// 保存聊天数据 - 使用 IndexedDB
async function saveChatData() {
    if (currentChatId) {
        // 最多保存最近 500 条消息 (IndexedDB 空间更大)
        const MAX_MESSAGES = 500;
        const messagesToSave = chatMessages.slice(-MAX_MESSAGES);
        
        // 压缩消息数据，只保留必要字段
        const compressedMessages = messagesToSave.map(msg => {
            const compressed = {
                id: msg.id,
                t: msg.type,      // type 缩写
                c: msg.content,   // content 缩写
                s: msg.sender,    // sender 缩写
                tm: msg.time      // time 缩写
            };
            // 可选字段：只有当消息有引用或特殊状态时才保存
            if (msg.replyTo) compressed.r = msg.replyTo;
            if (msg.isRecalled || msg.type === 'recalled') {
                compressed.ir = true;
                compressed.t = 'recalled';  // 确保撤回类型被保存
            }
            // 保存旁白数据（兼容旧格式）
            if (msg.narration) compressed.n = msg.narration;
            // 🛡️ 关键修复：同时检查压缩格式和解压格式，防止字段丢失
            if (msg.rt || msg.recognizedText) compressed.rt = msg.rt || msg.recognizedText;
            if (msg.d || msg.duration) compressed.d = msg.d || msg.duration;
            // 💕 保存情侣邀请卡片的特殊字段
            if (msg.type === 'couple_invite') {
                if (msg.inviter) compressed.inviter = msg.inviter;
                if (msg.inviteeId) compressed.inviteeId = msg.inviteeId;
                if (msg.status) compressed.status = msg.status;
            }
            // 💕 保存情侣接受卡片的特殊字段
            if (msg.type === 'couple_accept') {
                if (msg.status) compressed.status = msg.status;
            }
            // 📚 保存阅读邀请卡片的特殊字段
            if (msg.type === 'reading_invite') {
                if (msg.bookId) compressed.bookId = msg.bookId;
                if (msg.bookTitle) compressed.bookTitle = msg.bookTitle;
                if (msg.bookType) compressed.bookType = msg.bookType;
                if (msg.chapterCount) compressed.chapterCount = msg.chapterCount;
                if (msg.status) compressed.status = msg.status;
            }
            // 📚 保存阅读进度更新消息的特殊字段
            if (msg.type === 'reading_progress') {
                if (msg.bookId) compressed.bookId = msg.bookId;
                if (msg.bookTitle) compressed.bookTitle = msg.bookTitle;
                if (msg.chapterIndex !== undefined) compressed.chapterIndex = msg.chapterIndex;
                if (msg.totalChapters) compressed.totalChapters = msg.totalChapters;
                if (msg.chapterTitle) compressed.chapterTitle = msg.chapterTitle;
            }
            // 🛡️ 兼容：如果 content 是对象（如邀请卡片），也需要保存
            if (msg.content && typeof msg.content === 'object' && msg.type === 'couple_invite') {
                // 已经在上面单独保存了，这里不需要重复
            }
            return compressed;
        });
        
        try {
            // 保存到 IndexedDB
            await window.ChatDB.saveMessages(currentChatId, compressedMessages);
            
            // 同时保存到 localStorage（供主页面读取）
            const key = `chat_${currentChatId}`;
            localStorage.setItem(key, JSON.stringify(compressedMessages));
            
            const size = JSON.stringify(compressedMessages).length / 1024;
            console.log(`✓ 聊天数据已保存: ${currentChatId}, ${compressedMessages.length} 条消息, ${size.toFixed(2)} KB`);
        } catch (e) {
            console.error('保存失败 (IndexedDB):', e);
            // 降级到 localStorage
            try {
                const key = `chat_${currentChatId}`;
                localStorage.setItem(key, JSON.stringify(compressedMessages));
                console.warn('⚠️ 降级使用 localStorage');
            } catch (localError) {
                if (localError.name === 'QuotaExceededError') {
                    console.warn('⚠️ localStorage 超限！自动清理旧聊天...');
                    cleanupOldChats();
                    try {
                        localStorage.setItem(key, JSON.stringify(compressedMessages));
                    } catch (retryError) {
                        showToast('存储空间不足，请清理聊天记录', 'error');
                    }
                } else {
                    console.error('保存失败 (localStorage):', localError);
                    showToast('保存失败', 'error');
                }
            }
        }
    }
}

// 清理旧聊天记录释放空间
function cleanupOldChats() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('chat_'));
    if (keys.length > 0) {
        // 按 key 排序，删除最旧的
        const oldestKey = keys.sort()[0];
        localStorage.removeItem(oldestKey);
        console.log('已清理旧聊天数据:', oldestKey);
    }
}

// 加载群聊信息
function loadGroupChatInfo() {
    try {
        console.log('===== 开始加载群聊信息 =====');
        console.log('当前聊天 ID:', currentChatId);
        
        // 从主页面框架获取群聊信息
        const mainFrame = document.querySelector('iframe');
        let contacts = [];
        
        if (mainFrame && mainFrame.contentWindow) {
            try {
                contacts = mainFrame.contentWindow.getData('chatContacts') || [];
                console.log('从主页面 iframe 获取联系人:', contacts.length, '个');
                
                // 🔍 调试：检查群聊数据中的 memberTitles
                const groupContact = contacts.find(c => c.id === currentChatId);
                if (groupContact) {
                    console.log('🔍 主页面群聊数据:', groupContact);
                    console.log('  - memberTitles:', groupContact.memberTitles);
                    console.log('  - 是否有 memberTitles:', !!groupContact.memberTitles);
                }
            } catch (e) {
                console.warn('从 iframe 读取失败:', e);
            }
        }
        
        // 如果无法从主页面获取，尝试从 localStorage 读取
        if (contacts.length === 0) {
            console.log('尝试从 localStorage 读取...');
            const currentPersona = localStorage.getItem('currentPersona') || 'default';
            const contactsKey = `persona_${currentPersona}_chatContacts`;
            contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
            console.log('从 localStorage 获取联系人:', contacts.length, '个, key:', contactsKey);
            
            //  调试：检查 localStorage 中的群聊数据
            const groupContact = contacts.find(c => c.id === currentChatId);
            if (groupContact) {
                console.log('🔍 localStorage 群聊数据:', groupContact);
                console.log('  - memberTitles:', groupContact.memberTitles);
                console.log('  - 是否有 memberTitles:', !!groupContact.memberTitles);
            }
        }
        
        console.log('所有联系人:', contacts);
        
        // 查找当前群聊
        const groupChat = contacts.find(c => c.id === currentChatId);
        
        if (groupChat) {
            console.log('✓ 找到群聊信息:', groupChat);
            // 保存群聊信息到全局变量或 sessionStorage（包含所有字段）
            sessionStorage.setItem('currentGroupChat', JSON.stringify({
                id: groupChat.id,
                name: groupChat.name,
                avatar: groupChat.avatar,
                isGroup: groupChat.isGroup,
                owner: groupChat.owner || null,
                admins: groupChat.admins || [],  // 🔴 关键：保存管理员数据
                members: groupChat.members || [],
                memberAvatars: groupChat.memberAvatars || [],
                memberTitles: groupChat.memberTitles || {},  // 🔴 关键：保存成员头衔数据
                muted: groupChat.muted || false,
                worldbookId: groupChat.worldbookId || null,
                announcement: groupChat.announcement || '',
                createdAt: groupChat.createdAt || Date.now()
            }));
            
            console.log('✓ 群聊信息已保存到 sessionStorage');
            console.log('  memberTitles:', groupChat.memberTitles || {});
            
            // 群聊模式：显示左侧的群聊信息，隐藏中间的标题区域
            const groupHeaderInfo = document.getElementById('group-header-info');
            const chatTitleWrapper = document.querySelector('.chat-title-wrapper');
            const groupChatTitle = document.getElementById('group-chat-title');
            const groupAvatarHeader = document.getElementById('group-avatar-header');
            const groupAvatarsList = document.getElementById('group-avatars');
            
            if (groupHeaderInfo) {
                groupHeaderInfo.style.display = 'flex';
            }
            if (chatTitleWrapper) {
                chatTitleWrapper.style.display = 'none';
            }
            
            // 更新群聊名称（在左侧）
            if (groupChatTitle) {
                groupChatTitle.textContent = groupChat.name || '群聊';
            }
            
            // 显示群聊头像（如果有自定义头像）
            console.log('🔍 检查群聊头像:', groupChat.avatar);
            if (groupChat.avatar && typeof groupChat.avatar === 'string' && 
                (groupChat.avatar.startsWith('http') || groupChat.avatar.startsWith('data:'))) {
                // 有自定义头像，显示单个头像
                console.log('✓ 显示自定义头像');
                if (groupAvatarHeader) {
                    groupAvatarHeader.innerHTML = `<img src="${groupChat.avatar}" alt="" style="width: 100%; height: 100%; object-fit: cover;">`;
                    groupAvatarHeader.style.display = 'block';
                }
                if (groupAvatarsList) {
                    groupAvatarsList.style.display = 'none';
                }
            } else {
                // 没有自定义头像，显示成员头像列表
                console.log('⚠ 显示成员头像列表');
                if (groupAvatarHeader) {
                    groupAvatarHeader.style.display = 'none';
                }
                renderGroupAvatars(groupChat.memberAvatars || []);
            }
            
            // 显示群公告栏
            showGroupAnnouncementBar(groupChat.announcement || '');
        } else {
            console.warn('⚠ 未找到群聊信息:', currentChatId);
            console.log('可用的群聊 IDs:', contacts.filter(c => c.isGroup).map(c => c.id));
        }
        
        console.log('===========================');
    } catch (e) {
        console.error('加载群聊信息失败:', e);
    }
}

// 渲染群聊成员头像
function renderGroupAvatars(memberAvatars) {
    console.log('🎨 ========== renderGroupAvatars v119 ==========');
    
    const container = document.getElementById('group-avatars');
    if (!container) {
        console.error('❌ 找不到 group-avatars 容器！');
        return;
    }
    
    console.log('📦 容器元素:', container);
    console.log('👥 头像数量:', memberAvatars.length);
    console.log(' 头像数据:', memberAvatars);
    
    if (memberAvatars.length === 0) {
        container.style.display = 'none';
        console.log('⚠️ 没有头像，隐藏容器');
        return;
    }
    
    // 最多显示 5 个头像
    const maxDisplay = Math.min(memberAvatars.length, 5);
    const displayAvatars = memberAvatars.slice(0, maxDisplay);
    
    console.log('✅ 将显示', maxDisplay, '个头像');
    
    // 清空容器
    container.innerHTML = '';
    
    // 创建头像元素
    displayAvatars.forEach((avatar, index) => {
        const avatarEl = document.createElement('div');
        avatarEl.className = 'group-avatar-item';
        
        const marginLeft = index > 0 ? '-8px' : '0';
        const zIndex = maxDisplay - index;
        
        console.log(`🖼️ 创建头像 [${index + 1}/${maxDisplay}]:`);
        console.log(`   - marginLeft: ${marginLeft}`);
        console.log(`   - zIndex: ${zIndex}`);
        console.log(`   - avatar: ${avatar ? avatar.substring(0, 50) + '...' : 'emoji/text'}`);
        
        avatarEl.style.cssText = `
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            border: 2px solid white;
            margin-left: ${marginLeft} !important;
            position: relative;
            z-index: ${zIndex};
            overflow: hidden;
            flex-shrink: 0;
        `;
        
        console.log(`   ✅ 头像 [${index + 1}] style.marginLeft =`, avatarEl.style.marginLeft);
        
        // 判断是否为图片 URL
        if (avatar && typeof avatar === 'string' && (avatar.startsWith('http') || avatar.startsWith('data:'))) {
            const img = document.createElement('img');
            img.src = avatar;
            img.alt = '';
            img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
            `;
            img.onerror = function() {
                this.style.display = 'none';
                avatarEl.textContent = '';
            };
            avatarEl.appendChild(img);
        } else {
            // 如果不是图片，显示 emoji 或默认头像
            avatarEl.textContent = avatar || '👤';
        }
        
        container.appendChild(avatarEl);
    });
    
    // 如果还有更多成员，显示 +N
    if (memberAvatars.length > maxDisplay) {
        const moreEl = document.createElement('div');
        moreEl.className = 'group-avatar-more';
        moreEl.textContent = `+${memberAvatars.length - maxDisplay}`;
        moreEl.style.cssText = `
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #e0e0e0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            color: #666;
            border: 2px solid white;
            margin-left: -8px !important;
            position: relative;
            z-index: 0;
            font-weight: 600;
            flex-shrink: 0;
        `;
        container.appendChild(moreEl);
    }
    
    // 显示容器
    container.style.display = 'flex';
    
    console.log('✅ 渲染完成！');
    console.log('📊 容器信息:');
    console.log('   - display:', container.style.display);
    console.log('   - children count:', container.children.length);
    
    // 验证第一个和第二个头像的样式
    if (container.children.length >= 2) {
        const firstChild = container.children[0];
        const secondChild = container.children[1];
        console.log('🔍 验证样式:');
        console.log('   - 第一个头像 marginLeft:', firstChild.style.marginLeft);
        console.log('   - 第二个头像 marginLeft:', secondChild.style.marginLeft);
        console.log('   - 第二个头像 computed marginLeft:', window.getComputedStyle(secondChild).marginLeft);
    }
    
    console.log('================================================');
}

// 加载聊天数据
async function loadChatData() {
    // 从 URL 参数或 localStorage 获取聊天 ID
    const urlParams = new URLSearchParams(window.location.search);
    let chatIdFromUrl = urlParams.get('id');
    
    // 🎯 检查是否为 IF 线模式
    const iflineId = urlParams.get('ifline');
    const iflineTitle = urlParams.get('title');
    const iflineType = urlParams.get('type');
    
    console.log('===== 加载聊天数据 =====');
    console.log('URL 参数 ID:', chatIdFromUrl);
    console.log('IF 线 ID:', iflineId);
    console.log('IF 线标题:', iflineTitle);
    console.log('IF 线类型:', iflineType);
    console.log('localStorage 中的 lastChatId:', localStorage.getItem('lastChatId'));
    
    // 优先使用 URL 中的 ID，如果没有，使用之前保存的 ID
    if (chatIdFromUrl) {
        currentChatId = chatIdFromUrl;
    } else if (iflineId) {
        // IF 线模式：使用特殊的 chatId 前缀
        currentChatId = `ifline_${iflineId}`;
        // 保存 IF 线信息到 sessionStorage（临时存储）
        sessionStorage.setItem('currentIfline', JSON.stringify({
            id: iflineId,
            title: iflineTitle,
            type: iflineType
        }));
        console.log('🌿 进入 IF 线对话模式:', iflineTitle);
    } else {
        // 尝试使用上次聊天的 ID
        currentChatId = localStorage.getItem('lastChatId') || 'default';
    }
    
    console.log('最终聊天 ID:', currentChatId);
    
    // 加载当前联系人的旁白模式状态
    offlineMode = getData('offlineMode_' + currentChatId) || null;
    offlineStartTime = getData('offlineStartTime_' + currentChatId) || null;
    console.log('当前联系人旁白模式:', offlineMode);
    
    // 🛡️ 清除未读消息计数（进入聊天界面时）
    clearUnreadCountOnEnter(currentChatId);
    
    // 检测是否为群聊
    const isGroupChat = currentChatId && currentChatId.startsWith('group_');
    console.log('是否为群聊:', isGroupChat);
    
    // 🎭 根据聊天类型显示/隐藏心声按钮（在顶栏中）
    const whisperBtn = document.querySelector('.header-right button[onclick="showWhisperModal()"]');
    if (whisperBtn) {
        if (isGroupChat) {
            // 群聊：隐藏心声按钮
            whisperBtn.style.display = 'none';
            console.log('🎭 群聊模式：隐藏心声按钮');
        } else {
            // 单聊：显示心声按钮
            whisperBtn.style.display = 'flex';
            console.log('🎭 单聊模式：显示心声按钮');
        }
    }
    
    if (isGroupChat) {
        // 加载群聊信息（会更新标题为真实的群聊名称）
        loadGroupChatInfo();
    } else {
        // 单聊：从联系人列表获取标题
        syncSingleChatTitle();
    }
    
    // 启动自动消息 (如果开启)
    startAutoMessageIfNeeded();
    
    // 先从 IndexedDB 加载
    try {
        console.log('尝试从 IndexedDB 加载...');
        const compressedMessages = await window.ChatDB.loadMessages(currentChatId);
        
        if (compressedMessages && compressedMessages.length > 0) {
            // 解压消息数据（兼容压缩和未压缩两种格式）
            chatMessages = compressedMessages.map(msg => {
                // 检测是否为压缩格式（有 t 字段）或未压缩格式（有 type 字段）
                const isCompressed = msg.t !== undefined;
                
                const decompressed = {
                    id: msg.id,
                    type: isCompressed ? msg.t : msg.type,
                    content: isCompressed ? msg.c : msg.content,
                    sender: isCompressed ? msg.s : msg.sender,
                    time: isCompressed ? msg.tm : msg.time
                };
                if (isCompressed) {
                    if (msg.r) decompressed.replyTo = msg.r;
                    if (msg.ir) {
                        decompressed.isRecalled = true;
                        decompressed.type = 'recalled';
                    }
                    if (msg.td) decompressed.timeDisplay = msg.td;
                    if (msg.n) decompressed.narration = msg.n;
                    if (msg.rt) decompressed.recognizedText = msg.rt;
                    if (msg.d) decompressed.duration = msg.d;
                    if (msg.tc) decompressed.tokenCount = msg.tc;
                    // 💕 解压情侣邀请卡片的特殊字段
                    if (msg.inviter) decompressed.inviter = msg.inviter;
                    if (msg.inviteeId) decompressed.inviteeId = msg.inviteeId;
                    if (msg.status) decompressed.status = msg.status;
                    // 📚 解压阅读邀请卡片的特殊字段
                    if (msg.bookId) decompressed.bookId = msg.bookId;
                    if (msg.bookTitle) decompressed.bookTitle = msg.bookTitle;
                    if (msg.bookType) decompressed.bookType = msg.bookType;
                    if (msg.chapterCount) decompressed.chapterCount = msg.chapterCount;
                    // 📚 解压阅读进度更新消息的特殊字段
                    if (msg.chapterIndex !== undefined) decompressed.chapterIndex = msg.chapterIndex;
                    if (msg.totalChapters) decompressed.totalChapters = msg.totalChapters;
                    if (msg.chapterTitle) decompressed.chapterTitle = msg.chapterTitle;
                    // 🛑 关键修复：如果压缩格式中有status，必须解压
                    if (msg.status === 'pending' || msg.status === 'accepted' || msg.status === 'rejected') {
                        decompressed.status = msg.status;
                        console.log('✅ 解压消息状态:', msg.id, 'status =', msg.status);
                    }
                } else {
                    // 未压缩格式，直接复制额外字段
                    if (msg.replyTo) decompressed.replyTo = msg.replyTo;
                    if (msg.isRecalled) {
                        decompressed.isRecalled = true;
                        decompressed.type = 'recalled';
                    }
                    if (msg.timeDisplay) decompressed.timeDisplay = msg.timeDisplay;
                    if (msg.narration) decompressed.narration = msg.narration;
                    if (msg.recognizedText) decompressed.recognizedText = msg.recognizedText;
                    if (msg.duration) decompressed.duration = msg.duration;
                    // 情侣邀请卡片的特殊字段
                    if (msg.inviter) decompressed.inviter = msg.inviter;
                    if (msg.inviteeId) decompressed.inviteeId = msg.inviteeId;
                    if (msg.status) decompressed.status = msg.status;
                    // 📚 阅读邀请卡片的特殊字段
                    if (msg.bookId) decompressed.bookId = msg.bookId;
                    if (msg.bookTitle) decompressed.bookTitle = msg.bookTitle;
                    if (msg.bookType) decompressed.bookType = msg.bookType;
                    if (msg.chapterCount) decompressed.chapterCount = msg.chapterCount;
                    // 📚 阅读进度更新消息的特殊字段
                    if (msg.chapterIndex !== undefined) decompressed.chapterIndex = msg.chapterIndex;
                    if (msg.totalChapters) decompressed.totalChapters = msg.totalChapters;
                    if (msg.chapterTitle) decompressed.chapterTitle = msg.chapterTitle;
                }
                return decompressed;
            });
            console.log(` 从 IndexedDB 加载成功: ${currentChatId}, ${chatMessages.length} 条消息`);
                        
            // 📚 调试：检查是否有阅读邀请卡片
            const readingInvites = chatMessages.filter(m => m.type === 'reading_invite');
            if (readingInvites.length > 0) {
                console.log(' 发现阅读邀请卡片:', readingInvites.length, '条');
                readingInvites.forEach((msg, idx) => {
                    console.log(`  [${idx}] id=${msg.id}, type=${msg.type}, sender=${msg.sender}, bookTitle=${msg.bookTitle}, status=${msg.status}`);
                });
            }
            
            //  调试：打印所有消息类型
            console.log('📚 当前聊天所有消息类型:');
            chatMessages.forEach((msg, idx) => {
                console.log(`  [${idx}] type=${msg.type}, sender=${msg.sender}, time=${msg.time}`);
            });
                        
            localStorage.setItem('lastChatId', currentChatId);
            return;
        }
    } catch (e) {
        console.warn('IndexedDB 加载失败，降级到 localStorage:', e);
    }
    
    // 降级：从 localStorage 加载
    console.log('尝试从 localStorage 加载...');
    let saved = localStorage.getItem(`chat_${currentChatId}`);
    console.log('从 localStorage 读取的数据:', saved ? '找到数据' : '没有数据');
    
    // 添加调试：检查是否有情侣邀请卡片
    if (saved) {
        try {
            const messages = JSON.parse(saved);
            const coupleInvites = messages.filter(m => m.type === 'couple_invite');
            if (coupleInvites.length > 0) {
                console.log('💕 发现情侣邀请卡片:', coupleInvites.length, '条');
                coupleInvites.forEach((msg, idx) => {
                    console.log(`  [${idx}] id=${msg.id}, type=${msg.type}, status=${msg.status}, inviter=${msg.inviter || msg.content?.inviter}`);
                });
            }
        } catch (e) {
            console.error('解析消息失败:', e);
        }
    }
    
    if (saved) {
        const compressedMessages = JSON.parse(saved);
        // 解压消息数据，不保存 avatar，渲染时动态获取
        chatMessages = compressedMessages.map(msg => {
            const decompressed = {
                id: msg.id,
                type: msg.t,
                content: msg.c,
                sender: msg.s,
                time: msg.tm
            };
            if (msg.r) decompressed.replyTo = msg.r;
            if (msg.ir) {
                decompressed.isRecalled = true;
                decompressed.type = 'recalled';  // 恢复撤回类型
            }
            // 恢复旁白数据（兼容旧格式）
            if (msg.n) decompressed.narration = msg.n;
            // 恢复语音消息的识别文字和时长
            if (msg.rt) decompressed.recognizedText = msg.rt;
            if (msg.d) decompressed.duration = msg.d;
            //  恢复tokenCount
            if (msg.tc) decompressed.tokenCount = msg.tc;
            //  恢复阅读邀请卡片的特殊字段
            if (msg.bookId) decompressed.bookId = msg.bookId;
            if (msg.bookTitle) decompressed.bookTitle = msg.bookTitle;
            if (msg.bookType) decompressed.bookType = msg.bookType;
            if (msg.chapterCount) decompressed.chapterCount = msg.chapterCount;
            if (msg.status) decompressed.status = msg.status;
            // 📚 恢复阅读进度更新消息的特殊字段
            if (msg.chapterIndex !== undefined) decompressed.chapterIndex = msg.chapterIndex;
            if (msg.totalChapters) decompressed.totalChapters = msg.totalChapters;
            if (msg.chapterTitle) decompressed.chapterTitle = msg.chapterTitle;
            return decompressed;
        });
        console.log(`✓ 从 localStorage 加载成功: ${currentChatId}, ${chatMessages.length} 条消息`);
        console.log('消息列表:', chatMessages);
        // 只有成功加载到消息时，才保存 lastChatId
        localStorage.setItem('lastChatId', currentChatId);
    } else {
        console.log('没有保存的聊天数据:', currentChatId);
        chatMessages = [];
        // 如果没有消息，不更新 lastChatId，保留上一次的值
    }
    
    console.log('========================');
    
    // 应用聊天背景
    console.log('\n🎨 开始应用聊天背景...');
    applyChatBackground();
    
    // 加载气泡 CSS
    console.log('\n🎨 开始加载气泡 CSS...');
    loadBubbleCss();
    
    // 🛠️ 加载界面 CSS
    console.log('\n🎨 开始加载界面 CSS...');
    loadInterfaceCss();
    
    // 🎭 加载心声样式 CSS
    console.log('\n🎭 开始加载心声样式 CSS...');
    loadVoiceCss();
}

// Toast 提示
window.showToast = function(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 9999;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 2000);
};

// 长按消息菜单
let longPressTimer = null;
let currentMessageId = null;
let isLongPress = false;

window.handleTouchStart = function(event, msgId, type) {
    console.log('触摸开始:', msgId, type);
    isLongPress = false;
    longPressTimer = setTimeout(() => {
        isLongPress = true;
        currentMessageId = msgId;
        console.log('触发长按菜单:', msgId, type);
        showMessageMenu(event, msgId, type || 'received');
        // 震动反馈
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }, 500);
};

window.handleTouchEnd = function(event) {
    console.log('触摸结束');
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
    // 如果是长按，阻止默认行为
    if (isLongPress) {
        event.preventDefault();
        isLongPress = false;
    }
};

// 也添加鼠标事件支持
window.handleMouseDown = function(event, msgId, type) {
    console.log('鼠标按下:', msgId, type);
    longPressTimer = setTimeout(() => {
        currentMessageId = msgId;
        console.log('触发右键菜单:', msgId, type);
        showMessageMenu(event, msgId, type || 'received');
    }, 500);
};

window.handleMouseUp = function(event) {
    console.log('鼠标松开');
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
};

window.showMessageMenu = function(event, msgId, type) {
    event.preventDefault();
    event.stopPropagation();
    
    // 移除已存在的菜单
    const existingMenu = document.querySelector('.message-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    const menu = document.createElement('div');
    menu.className = 'message-menu';
    menu.style.cssText = `
        position: fixed;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        padding: 8px;
        z-index: 9999;
        min-width: 360px;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 4px;
    `;
    
    // 菜单位置
    const rect = event.target.getBoundingClientRect();
    const isSent = type === 'sent';
    
    let top = rect.top - 10;
    let left = isSent ? rect.left - 370 : rect.right + 10;
    
    // 确保不超出屏幕
    if (left < 10) left = 10;
    if (left + 370 > window.innerWidth) left = window.innerWidth - 380;
    if (top + 140 > window.innerHeight) top = window.innerHeight - 150;
    
    menu.style.top = top + 'px';
    menu.style.left = left + 'px';
    
    menu.innerHTML = `
        <div onclick="patMessage('${msgId}')" style="padding: 10px 12px; cursor: pointer; color: #333; font-size: 13px; text-align: center; border-radius: 6px; transition: background 0.2s; flex: 1 1 auto; min-width: 70px;" onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='transparent'">拍一拍</div>
        <div onclick="quoteMessage('${msgId}')" style="padding: 10px 12px; cursor: pointer; color: #333; font-size: 13px; text-align: center; border-radius: 6px; transition: background 0.2s; flex: 1 1 auto; min-width: 70px;" onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='transparent'">引用</div>
        <div onclick="editMessage('${msgId}')" style="padding: 10px 12px; cursor: pointer; color: #333; font-size: 13px; text-align: center; border-radius: 6px; transition: background 0.2s; flex: 1 1 auto; min-width: 70px;" onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='transparent'">编辑</div>
        <div onclick="translateSingleMessage('${msgId}')" style="padding: 10px 12px; cursor: pointer; color: #333; font-size: 13px; text-align: center; border-radius: 6px; transition: background 0.2s; flex: 1 1 auto; min-width: 70px;" onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='transparent'">设置翻译</div>
        <div onclick="collectMessage('${msgId}')" style="padding: 10px 12px; cursor: pointer; color: #333; font-size: 13px; text-align: center; border-radius: 6px; transition: background 0.2s; flex: 1 1 auto; min-width: 70px;" onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='transparent'">收藏</div>
        <div onclick="recallMessage('${msgId}')" style="padding: 10px 12px; cursor: pointer; color: #333; font-size: 13px; text-align: center; border-radius: 6px; transition: background 0.2s; flex: 1 1 auto; min-width: 70px;" onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='transparent'">撤回</div>
        <div onclick="multiSelectMessage('${msgId}')" style="padding: 10px 12px; cursor: pointer; color: #333; font-size: 13px; text-align: center; border-radius: 6px; transition: background 0.2s; flex: 1 1 auto; min-width: 70px;" onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='transparent'">多选</div>
        <div onclick="deleteMessage('${msgId}')" style="padding: 10px 12px; cursor: pointer; color: #ff4444; font-size: 13px; text-align: center; border-radius: 6px; transition: background 0.2s; flex: 1 1 auto; min-width: 70px;" onmouseover="this.style.background='#fff0f0'" onmouseout="this.style.background='transparent'">删除</div>
    `;
    
    document.body.appendChild(menu);
    
    // 点击其他地方关闭菜单
    setTimeout(() => {
        document.addEventListener('click', function closeMenu() {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        });
    }, 100);
};

// 收藏消息
window.collectMessage = function(msgId) {
    // 关闭菜单
    document.querySelector('.message-menu')?.remove();
    
    // 使用宽松比较查找消息
    const msg = chatMessages.find(m => m.id == msgId || String(m.id) === String(msgId));
    if (!msg) {
        console.warn('⚠️ 找不到要收藏的消息:', msgId);
        return;
    }
    
    // 获取当前收藏列表
    const collectKey = `chat_collect_${currentChatId}`;
    const collected = JSON.parse(localStorage.getItem(collectKey) || '[]');
    
    // 检查是否已收藏
    const alreadyCollected = collected.find(c => c.id === msgId);
    if (alreadyCollected) {
        showToast('这条消息已经收藏过了');
        return;
    }
    
    // 获取联系人列表
    const currentPersona = localStorage.getItem('currentPersona') || 'default';
    const contactsKey = `persona_${currentPersona}_chatContacts`;
    const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
    
    // 添加收藏
    const currentContact = contacts.find(c => c.id === currentChatId);
    const characterName = currentContact ? currentContact.name : 'AI';
    
    collected.push({
        id: msgId,
        content: msg.content,
        sender: msg.sender,
        characterName: characterName,
        time: msg.time,
        type: msg.type || 'text'
    });
    
    localStorage.setItem(collectKey, JSON.stringify(collected));
    showToast('收藏成功');
};

// 拍一拍消息
window.patMessage = function(msgId) {
    // 关闭菜单
    document.querySelector('.message-menu')?.remove();
    
    // 使用宽松比较查找消息
    const msg = chatMessages.find(m => m.id == msgId || String(m.id) === String(msgId));
    if (!msg) {
        console.warn('⚠️ 找不到要拍的消息:', msgId);
        return;
    }
    
    // 确定被拍的人
    const isAIMessage = msg.sender === 'ai';
    const patTarget = isAIMessage ? (getAIName() || '对方') : '你';
    const patActor = isAIMessage ? '你' : (getAIName() || '对方');
    
    // 获取拍一拍后缀（从聊天设置中读取）
    const chatConfig = JSON.parse(localStorage.getItem(`chat_config_${currentChatId}`) || '{}');
    const patSuffix = chatConfig.patSuffix || '';
    
    // 构建拍一拍内容
    let patContent = `${patActor} 拍了拍 ${patTarget}`;
    if (patSuffix) {
        patContent += ` ${patSuffix}`;
    }
    
    // 添加拍一拍系统消息到最新消息
    const patMsg = {
        id: Date.now() + Math.random(),
        type: 'system',
        content: patContent,
        sender: 'system',
        time: Date.now()
    };
    
    // 直接添加到消息列表末尾，作为最新消息
    chatMessages.push(patMsg);
    
    // 保存并渲染
    saveChatData();
    renderMessages(true);
    
    // 震动反馈
    if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
    }
};

// 引用消息
window.quoteMessage = function(msgId) {
    // 直接使用原始 ID，不进行类型转换（因为 ID 可能是 "1776854523344jg2iof6tu03" 这样的组合格式）
    const targetId = msgId;
    
    // 使用宽松比较，兼容数字和字符串类型的 ID
    const msg = chatMessages.find(m => m.id == targetId || String(m.id) === String(targetId));
    if (!msg) {
        console.warn('⚠️ 找不到要引用的消息:', msgId, '当前消息列表 IDs:', chatMessages.map(m => m.id).slice(-5));
        return;
    }
    
    // 显示引用预览（传递原始 ID）
    showReplyPreview(targetId);
    
    // 聚焦输入框
    const input = document.getElementById('chat-input');
    input.focus();
    
    // 关闭菜单
    document.querySelector('.message-menu')?.remove();
};

// 多选消息
window.multiSelectMessage = function(msgId) {
    // 统一转换为字符串，因为 Set 使用严格比较
    const stringMsgId = String(msgId);
    
    // 进入多选模式并选中该消息
    enterMultiSelectMode();
    selectedMessageIds.add(stringMsgId);
    renderMessages();
    updateMultiSelectToolbar();
    
    // 关闭菜单
    document.querySelector('.message-menu')?.remove();
};

// 智能撤回判断：模拟真人打错字会撤回
function checkAndRecallAIMessage(msgId) {
    const msg = chatMessages.find(m => m.id === msgId);
    if (!msg || msg.sender !== 'ai') return;
    
    // 检测是否需要撤回的特征
    const shouldRecallPatterns = [
        /不对 [,，]?/,  // "不对，..."
        /等等 [,，]?/,  // "等等，..."
        /说错了 [,，]?/,  // "说错了，..."
        /重新说/,  // "我重新说"
        /重写/,  // "我重写"
        /纠正/,  // "纠正一下"
        /应该是/,  // "应该是..."
        /不好意思 [,，]?/,  // "不好意思，..."
        /抱歉 [,，]?/,  // "抱歉，..."
        /打错了 [,，]?/,  // "打错了，..."
        /发错了 [,，]?/,  // "发错了，..."
        /其实 [,，]?我想说的是/,  // "其实我想说的是..."
        /不对 [,，]?应该是/,  // "不对，应该是..."
        /撤回 [,，]?不/,  // "撤回不了" / "撤回不了啊"
        /不会撤回/,  // "不会撤回" / "ai 还是不会撤回啊"
        /撤不了/,  // "撤不了"
        /没法撤回/,  // "没法撤回"
    ];
    
    const content = msg.content || '';
    const hasRecallPattern = shouldRecallPatterns.some(pattern => pattern.test(content));
    
    // 如果检测到撤回特征，延迟 1-3 秒后撤回
    if (hasRecallPattern) {
        const delay = Math.random() * 1500 + 800; // 0.8-2.3 秒
        console.log('🤖 AI 检测到撤回特征，将在', (delay/1000).toFixed(1), '秒后撤回消息');
        
        setTimeout(() => {
            console.log('🤖 AI 执行撤回:', msgId);
            window.recallMessage(msgId);
            
            // 撤回后，再发一条正确的消息 (如果原消息包含"其实我想说的是")
            if (/其实 [,，]?我想说的是/.test(content)) {
                // 提取"其实我想说的是"后面的内容
                const match = content.match(/其实 [,，]?我想说的是 [.．:：]?(.+)/);
                if (match && match[1]) {
                    const correctContent = match[1].trim();
                    setTimeout(() => {
                        // 发送正确的消息
                        const correctMessage = {
                            id: Date.now(),
                            type: 'text',
                            content: correctContent,
                            sender: 'ai',
                            time: Date.now(),
                            avatar: getAIAvatar()
                        };
                        chatMessages.push(correctMessage);
                        saveChatData();
                        renderMessages();
                        scrollToBottom();
                        console.log('🤖 AI 发送了正确的消息:', correctContent);
                    }, 500);
                }
            }
        }, delay);
    } else {
        // 小概率随机撤回 (模拟真人偶尔手滑/说错话)
        const randomRecallChance = 0.08; // 8% 概率
        if (Math.random() < randomRecallChance && content.length > 10) {
            const delay = Math.random() * 2000 + 1000; // 1-3 秒
            console.log('🤖 AI 随机撤回触发，将在', (delay/1000).toFixed(1), '秒后撤回');
            
            setTimeout(() => {
                console.log('🤖 AI 执行随机撤回:', msgId);
                window.recallMessage(msgId);
                
                // 撤回后，再发一条新消息解释
                setTimeout(() => {
                    const explanations = [
                        '不好意思，刚才说错了',
                        '等等，我重新说',
                        '不对，应该是...',
                        '哎呀，打错字了',
                        '撤回重写',
                    ];
                    const explanation = explanations[Math.floor(Math.random() * explanations.length)];
                    
                    const newMessage = {
                        id: Date.now(),
                        type: 'text',
                        content: explanation,
                        sender: 'ai',
                        time: Date.now(),
                        avatar: getAIAvatar()
                    };
                    chatMessages.push(newMessage);
                    saveChatData();
                    renderMessages();
                    scrollToBottom();
                    console.log('🤖 AI 发送了解释消息:', explanation);
                }, 800);
            }, delay);
        }
    }
}

// 📝 检查是否需要自动总结
function checkAndTriggerAutoSummary() {
    try {
        // 获取当前聊天的配置
        const chatKey = `chat_config_${currentChatId}`;
        const config = JSON.parse(localStorage.getItem(chatKey) || '{}');
        
        // 检查是否开启自动总结
        if (!config.autoSummaryEnabled) {
            console.log('📝 自动总结：未开启');
            return;
        }
        
        // 获取总结条数设置
        const summaryCount = config.autoSummaryCount || 50;
        
        // 检查消息数量是否达到阈值
        if (chatMessages.length < summaryCount) {
            console.log(`📝 自动总结：消息数量 ${chatMessages.length} < ${summaryCount}，不触发`);
            return;
        }
        
        // 获取上次总结的消息数量
        const lastSummaryCountKey = `last_summary_count_${currentChatId}`;
        const lastSummaryCount = parseInt(localStorage.getItem(lastSummaryCountKey) || '0');
        
        // 检查是否已经总结过当前批次的消息
        if (chatMessages.length - lastSummaryCount < summaryCount) {
            console.log(`📝 自动总结：距上次总结只有 ${chatMessages.length - lastSummaryCount} 条新消息，不触发`);
            return;
        }
        
        console.log(`📝 自动总结：触发！消息数量 ${chatMessages.length}，上次总结 ${lastSummaryCount}，阈值 ${summaryCount}`);
        
        // 执行自动总结
        triggerAutoSummary(summaryCount);
        
        // 更新上次总结的消息数量
        localStorage.setItem(lastSummaryCountKey, chatMessages.length.toString());
        
    } catch (error) {
        console.error('📝 自动总结检查失败:', error);
    }
}

// 📝 执行自动总结
async function triggerAutoSummary(count) {
    try {
        console.log(`📝 开始自动总结，总结最近 ${count} 条消息`);
        
        // 获取当前聊天的配置，获取总结字数设置
        const chatKey = `chat_config_${currentChatId}`;
        const config = JSON.parse(localStorage.getItem(chatKey) || '{}');
        const summaryLength = config.autoSummaryLength || 'medium';
        
        // 获取最近的聊天消息
        const recentMessages = chatMessages.slice(-count);
        
        if (recentMessages.length === 0) {
            console.log('📝 自动总结：暂无消息可总结');
            return;
        }
        
        // 提取消息内容
        const messagesText = recentMessages.map(msg => {
            const sender = msg.sender === 'user' ? '你' : getAIName();
            return `${sender}: ${msg.content}`;
        }).join('\n');
        
        // 调用 API 进行总结
        const summary = await callSummaryAPI(messagesText, count, summaryLength);
        
        if (summary && summary.trim()) {
            // 保存总结到记忆记录库
            addMemoryRecord(summary.trim());
            
            console.log('✅ 自动总结完成:', summary.trim().substring(0, 50) + '...');
            showToast('已自动总结聊天记录', 'success');
            
            // 刷新记忆记录列表
            loadMemoryRecords();
        } else {
            console.warn('⚠️ 自动总结 API 返回空内容');
        }
        
    } catch (error) {
        console.error('📝 自动总结失败:', error);
        // 静默失败，不显示错误提示（避免干扰用户）
    }
}

// 撤回消息
window.recallMessage = function(msgId) {
    // 确保 msgId 是数字类型
    const numericMsgId = typeof msgId === 'string' ? parseInt(msgId) : msgId;
    
    // 使用宽松比较，因为消息 ID 可能是数字或字符串
    const msg = chatMessages.find(m => m.id == numericMsgId);
    if (!msg) {
        console.error('❌ 撤回失败，未找到消息:', msgId);
        return;
    }
    
    console.log('🔴 开始撤回消息:', msgId);
    console.log('  - 撤回前 type:', msg.type);
    console.log('  - 撤回前 content:', msg.content);
    
    // 保存撤回的消息到 localStorage
    const recalledMessages = JSON.parse(localStorage.getItem('recalledMessages') || '[]');
    recalledMessages.push({
        ...msg,
        recalledTime: Date.now(),
        chatId: currentChatId
    });
    localStorage.setItem('recalledMessages', JSON.stringify(recalledMessages));
    
    // 修改原消息为撤回状态
    msg.isRecalled = true;
    msg.recalledTime = Date.now();
    msg.content = '消息已撤回';
    msg.type = 'recalled';
    msg.time = Date.now();
    
    console.log('✅ 撤回完成:');
    console.log('  - 撤回后 type:', msg.type);
    console.log('  - 撤回后 content:', msg.content);
    console.log('  - 撤回后 isRecalled:', msg.isRecalled);
    
    saveChatData();
    renderMessages();
    
    showToast('消息已撤回', 'info');
    
    // 关闭菜单
    document.querySelector('.message-menu')?.remove();
};

// 查看撤回的消息
window.viewRecalledMessage = function(msgId) {
    // 确保 msgId 是数字类型
    const numericMsgId = typeof msgId === 'string' ? parseInt(msgId) : msgId;
    
    const recalledMessages = JSON.parse(localStorage.getItem('recalledMessages') || '[]');
    // 使用宽松比较，因为消息 ID 可能是数字或字符串
    const msg = recalledMessages.find(m => m.id == numericMsgId);
    
    if (!msg) {
        showToast('未找到撤回的消息');
        return;
    }
    
    // 显示弹窗
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 24px;
        max-width: 80%;
        max-height: 60%;
        overflow: auto;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    `;
    
    const time = new Date(msg.recalledTime).toLocaleString('zh-CN');
    content.innerHTML = `
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #333;">撤回的消息</div>
        <div style="font-size: 12px; color: #999; margin-bottom: 12px;">发送时间：${new Date(msg.time).toLocaleString('zh-CN')}</div>
        <div style="font-size: 12px; color: #999; margin-bottom: 16px;">撤回时间：${time}</div>
        <div style="font-size: 14px; color: #666; margin-bottom: 24px; line-height: 1.6;">${getContentPreview(msg.content, msg.type)}</div>
        <button id="close-recall-btn" style="width: 100%; padding: 12px; background: #f0f0f0; color: #333; border: none; border-radius: 8px; font-size: 14px; cursor: pointer;">关闭</button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // 绑定关闭按钮事件
    const closeBtn = document.getElementById('close-recall-btn');
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
};

// 编辑消息
window.editMessage = function(msgId) {
    // 确保 msgId 是数字类型
    const numericMsgId = typeof msgId === 'string' ? parseInt(msgId) : msgId;
    
    // 使用宽松比较，因为消息 ID 可能是数字或字符串
    const msg = chatMessages.find(m => m.id == numericMsgId);
    if (!msg || msg.type !== 'text') {
        showToast('只能编辑文本消息');
        return;
    }
    
    const input = document.getElementById('chat-input');
    input.value = msg.content;
    input.focus();
    
    // 标记当前正在编辑的消息
    input.dataset.editingId = msgId;
    
    // 显示编辑提示
    showToast('编辑中，按 Enter 保存', 'info');
    
    // 关闭菜单
    document.querySelector('.message-menu')?.remove();
};

// 删除消息
window.deleteMessage = function(msgId, closeMenu = true) {
    // 使用宽松比较，因为消息 ID 可能是数字或字符串
    const index = chatMessages.findIndex(m => m.id == msgId);
    
    if (index !== -1) {
        chatMessages.splice(index, 1);
        saveChatData();
        renderMessages();
        showToast('已删除');
    } else {
        console.error('未找到消息 ID:', msgId);
    }
    
    if (closeMenu) {
        document.querySelector('.message-menu')?.remove();
    }
};

// ========== 聊天设置功能 ==========

// 显示聊天设置
window.showChatSettings = function() {
    console.log('打开聊天设置');
    if (!currentChatId) {
        showToast('请先选择一个聊天');
        return;
    }
    loadChatSettingsData();
    document.getElementById('chat-settings-modal').style.display = 'block';
    
    // 更新当前token显示
    updateCurrentTokenDisplay();
    
    setTimeout(() => {
        const isGroupChat = currentChatId && currentChatId.startsWith('group_');
        const countElementId = isGroupChat ? 'chat-message-count-group' : 'chat-message-count-single';
        const countElement = document.getElementById(countElementId);
        
        console.log('📊 更新消息数量:', {
            isGroupChat,
            countElementId,
            messageCount: chatMessages.length,
            elementFound: !!countElement
        });
        
        if (countElement) {
            countElement.textContent = chatMessages.length;
        } else {
            console.warn('⚠️ 未找到消息计数元素:', countElementId);
        }
    }, 100);
};

// 关闭聊天设置
window.closeChatSettings = function() {
    document.getElementById('chat-settings-modal').style.display = 'none';
    
    // 应用聊天背景
    applyChatBackground();
    
    // 应用气泡 CSS
    loadBubbleCss();
    
    // 重新渲染消息（应用头像显示设置）
    renderMessages();
    
    // 关键修复：关闭设置面板后同步标题
    setTimeout(() => {
        if (currentChatId && currentChatId.startsWith('group_')) {
            // 群聊：重新加载群聊信息
            console.log('🔄 群聊模式：关闭设置后重新加载群聊信息');
            loadGroupChatInfo();
        } else {
            // 单聊：从联系人列表同步标题
            console.log('🔄 单聊模式：关闭设置后同步标题');
            syncSingleChatTitle();
        }
    }, 50);
};

// ========== 翻译功能 ==========

// 全局翻译缓存（key: 原文, value: 译文）- 完全离线，由用户手动维护
let translationCache = {};

// 加载翻译缓存
function loadTranslationCache() {
    try {
        const cache = localStorage.getItem('translation_cache');
        if (cache) {
            translationCache = JSON.parse(cache);
            console.log(`✅ 加载翻译缓存: ${Object.keys(translationCache).length} 条`);
        }
    } catch (e) {
        console.warn('⚠️ 加载翻译缓存失败:', e);
        translationCache = {};
    }
}

// 保存翻译缓存
function saveTranslationCache() {
    try {
        localStorage.setItem('translation_cache', JSON.stringify(translationCache));
    } catch (e) {
        console.error('❌ 保存翻译缓存失败:', e);
    }
}

// 初始化时加载缓存
loadTranslationCache();

// 预设常用日文翻译（帮助用户快速使用翻译模式）
const presetJapaneseTranslations = {
    '今？': '现在吗？',
    '特に何もしてないよ。': '没做什么特别的事哦。',
    'さっきまでコーヒー飲んでぼーっとしてた。': '刚才一直在喝咖啡发呆。',
    'もう14時過ぎか…早いね、日曜日なんてあっという間だよ。': '已经过14点了吗…好快啊，周日总是过得特别快。',
    '君は？': '你呢？',
    '何かしてたの？': '你在做什么吗？',
    'おはよう': '早上好',
    'こんにちは': '你好',
    'こんばんは': '晚上好',
    'ありがとう': '谢谢',
    'どういたしまして': '不客气',
    'はい': '是的',
    'いいえ': '不是',
    'わかりました': '明白了',
    '大丈夫': '没关系',
    '頑張って': '加油',
    'お疲れ様': '辛苦了'
};

// 自动应用预设翻译到缓存
function applyPresetTranslations() {
    let addedCount = 0;
    for (const [japanese, chinese] of Object.entries(presetJapaneseTranslations)) {
        if (!translationCache[japanese]) {
            translationCache[japanese] = chinese;
            addedCount++;
        }
    }
    if (addedCount > 0) {
        saveTranslationCache();
        console.log(`✅ 自动添加了 ${addedCount} 条日文预设翻译`);
    }
}

// 初始化时应用预设翻译
applyPresetTranslations();

// 手动设置翻译（用户自己输入译文）
window.setManualTranslation = function(msgId) {
    console.log('🔍 尝试查找消息 ID:', msgId, '类型:', typeof msgId);
    
    // 转换为数字类型
    const numericMsgId = typeof msgId === 'string' ? parseInt(msgId) : msgId;
    console.log('🔍 转换后的 ID:', numericMsgId, '类型:', typeof numericMsgId);
    
    // 使用宽松比较（==）或者都转换为字符串比较
    const msg = chatMessages.find(m => m.id == msgId || m.id == numericMsgId);
    
    if (!msg) {
        console.error('❌ 未找到消息，当前消息列表:', chatMessages.map(m => ({ id: m.id, type: typeof m.id })));
        showToast('❌ 消息不存在');
        return;
    }
    
    console.log('✅ 找到消息:', msg.content.substring(0, 20));
    
    // 弹出输入框让用户输入翻译
    const translation = prompt('请输入中文翻译：', msg.translation || '');
    
    if (translation === null) {
        // 用户取消
        return;
    }
    
    if (translation.trim()) {
        // 保存到缓存
        translationCache[msg.content] = translation.trim();
        saveTranslationCache();
        
        // 保存到消息对象
        msg.translation = translation.trim();
        saveChatData();
        renderMessages();
        
        showToast('✅ 翻译已保存');
    } else {
        // 清空翻译
        delete translationCache[msg.content];
        saveTranslationCache();
        delete msg.translation;
        saveChatData();
        renderMessages();
        showToast('✅ 已清除翻译');
    }
};

// 右键菜单设置手动翻译
window.translateSingleMessage = function(msgId) {
    window.setManualTranslation(msgId);
};

// 批量翻译功能已移除（完全离线模式，无需批量翻译）

// ========== 心声功能 ==========

// 当前显示模式：'latest' 或 'history'
let voiceViewMode = 'latest';

// 显示心声弹窗（默认显示最新心声）
window.showVoiceModal = function() {
    console.log('打开心声弹窗');
    
    // 重置为最新模式
    voiceViewMode = 'latest';
    updateVoiceHistoryButton();
    
    // 加载心声
    loadVoiceData();
    
    document.getElementById('voice-modal').style.display = 'block';
};

// 切换历史/最新视图
window.toggleVoiceHistory = function() {
    voiceViewMode = voiceViewMode === 'latest' ? 'history' : 'latest';
    updateVoiceHistoryButton();
    renderVoiceView();
};

// 更新历史按钮状态
function updateVoiceHistoryButton() {
    const btn = document.getElementById('voice-history-btn');
    if (btn) {
        if (voiceViewMode === 'history') {
            btn.textContent = '返回';
            btn.style.color = '#FFCDD2';
        } else {
            btn.textContent = '历史';
            btn.style.color = '#FFCDD2';
        }
    }
}

// 加载心声数据
function loadVoiceData() {
    try {
        // 从聊天记录中找到所有心声消息（筛选 inner_voice 类型，同时兼容旧的 voice 类型但内容有 clothing/mood/thoughts）
        const innerVoiceMessages = chatMessages.filter(m => {
            // 新格式：type 为 inner_voice
            if (m.type === 'inner_voice') return true;
            // 旧格式：type 为 voice，但内容是对象且包含 clothing/mood/thoughts
            if (m.type === 'voice' && typeof m.content === 'object' && (m.content.clothing || m.content.mood || m.content.thoughts)) return true;
            return false;
        }).reverse();
        
        if (innerVoiceMessages.length > 0) {
            // 渲染视图
            renderVoiceView(innerVoiceMessages);
        } else {
            // 没有心声
            document.getElementById('voice-loading').style.display = 'none';
            document.getElementById('voice-latest').style.display = 'none';
            document.getElementById('voice-list').style.display = 'none';
            document.getElementById('voice-empty').style.display = 'block';
        }
    } catch (e) {
        console.error('加载心声失败:', e);
        document.getElementById('voice-loading').style.display = 'none';
        document.getElementById('voice-empty').style.display = 'block';
    }
}

// 渲染心声视图
function renderVoiceView(voiceMessages) {
    if (!voiceMessages) {
        // 筛选 inner_voice 类型，同时兼容旧的 voice 类型但内容有 clothing/mood/thoughts
        voiceMessages = chatMessages.filter(m => {
            if (m.type === 'inner_voice') return true;
            if (m.type === 'voice' && typeof m.content === 'object' && (m.content.clothing || m.content.mood || m.content.thoughts)) return true;
            return false;
        }).reverse();
    }
    
    if (voiceViewMode === 'latest') {
        // 显示最新心声
        const latestInnerVoice = voiceMessages[0];
        
        if (latestInnerVoice) {
            const timeStr = latestInnerVoice.timeDisplay || formatTime(latestInnerVoice.time);
            const content = latestInnerVoice.content || {};
            
            document.getElementById('voice-time').textContent = timeStr;
            document.getElementById('voice-clothing').textContent = content.clothing || '暂无';
            document.getElementById('voice-mood').textContent = content.mood || '暂无';
            document.getElementById('voice-thoughts').textContent = content.thoughts || '暂无';
            
            document.getElementById('voice-loading').style.display = 'none';
            document.getElementById('voice-latest').style.display = 'block';
            document.getElementById('voice-list').style.display = 'none';
            document.getElementById('voice-empty').style.display = 'none';
        }
    } else {
        // 显示历史列表
        const listEl = document.getElementById('voice-list');
        listEl.innerHTML = '';
        
        voiceMessages.forEach((voice, index) => {
            const timeStr = voice.timeDisplay || formatTime(voice.time);
            const content = voice.content || {};
            
            const voiceItem = document.createElement('div');
            voiceItem.style.cssText = `
                margin-bottom: 16px;
                padding: 12px;
                background: #f8f8f8;
                border-radius: 8px;
                border-left: 3px solid #FFCDD2;
                position: relative;
            `;
            
            voiceItem.innerHTML = `
                <div style="position: absolute; top: 8px; right: 8px; cursor: pointer; padding: 4px; border-radius: 4px;" onclick="deleteVoice('${voice.id}')" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#999" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </div>
                <div style="font-size: 12px; color: #999; margin-bottom: 8px; text-align: right; padding-right: 24px;">${timeStr}</div>
                ${content.clothing ? `
                    <div style="margin-bottom: 8px;">
                        <div style="font-size: 12px; color: #999; margin-bottom: 4px; font-weight: 500; display: flex; align-items: center; gap: 4px;">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#B8A9A1" stroke-width="2">
                                <path d="M20.38 3.4a2 2 0 0 0-1.95-1.25H5.57a2 2 0 0 0-1.95 1.25L2 16h20"></path>
                                <path d="M16 16v2a4 4 0 0 1-8 0v-2"></path>
                            </svg>
                            穿着
                        </div>
                        <div style="font-size: 14px; color: #333; line-height: 1.5;">${content.clothing}</div>
                    </div>
                ` : ''}
                ${content.mood ? `
                    <div style="margin-bottom: 8px;">
                        <div style="font-size: 12px; color: #999; margin-bottom: 4px; font-weight: 500; display: flex; align-items: center; gap: 4px;">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#B8A9A1" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                                <line x1="15" y1="9" x2="15.01" y2="9"></line>
                            </svg>
                            心情
                        </div>
                        <div style="font-size: 14px; color: #333; line-height: 1.5;">${content.mood}</div>
                    </div>
                ` : ''}
                ${content.thoughts ? `
                    <div>
                        <div style="font-size: 12px; color: #999; margin-bottom: 4px; font-weight: 500; display: flex; align-items: center; gap: 4px;">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#B8A9A1" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            感想
                        </div>
                        <div style="font-size: 14px; color: #333; line-height: 1.5; font-style: italic;">${content.thoughts}</div>
                    </div>
                ` : ''}
            `;
            
            listEl.appendChild(voiceItem);
        });
        
        document.getElementById('voice-loading').style.display = 'none';
        document.getElementById('voice-latest').style.display = 'none';
        document.getElementById('voice-list').style.display = 'block';
        document.getElementById('voice-empty').style.display = 'none';
    }
}

// 关闭心声弹窗
window.closeVoiceModal = function() {
    document.getElementById('voice-modal').style.display = 'none';
};

// 删除心声
window.deleteVoice = function(voiceId) {
    if (!confirm('确定要删除这条心声吗？')) return;
    
    const index = chatMessages.findIndex(m => m.id === voiceId);
    if (index > -1) {
        chatMessages.splice(index, 1);
        saveChatData();
        renderMessages();
        loadVoiceData();
        showToast('已删除');
    }
};

// 手动生成心声（跳过概率检查，强制生成）
window.generateVoice = async function() {
    showToast('正在生成...');
    
    // 直接调用内部生成逻辑，跳过 tryGenerateVoice 的 30% 概率检查
    const chatId = currentChatId;
    const messages = chatMessages;
    
    // 获取角色信息
    let personaInfo = '';
    let characterName = '角色';
    try {
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        const currentContact = contacts.find(c => c.id === chatId);
        if (currentContact) {
            personaInfo = currentContact.persona || currentContact.roleSetting || currentContact.setting || '';
            characterName = currentContact.name || currentContact.remark || '角色';
        }
    } catch (e) {
        console.error('读取角色信息失败:', e);
    }
    
    // 获取 API 配置
    let apiConfig = null;
    try {
        const savedConfig = localStorage.getItem('globalApiConfig');
        if (savedConfig) {
            apiConfig = JSON.parse(savedConfig);
        }
    } catch (e) {
        console.error('读取 API 配置失败:', e);
    }
    
    if (!apiConfig || !apiConfig.mainApi || !apiConfig.mainApi.url || !apiConfig.mainApi.token) {
        showToast('API 配置不完整');
        return;
    }
    
    // 构建系统提示词
    const now = new Date();
    const timeStr = `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日 ` +
        `${['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][now.getDay()]} ` +
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const systemPrompt = `你现在要扮演${characterName}，生成这个角色此刻的内心独白。

请根据角色设定和最近的对话，生成以下三个方面的内容：

【穿着】：描述角色当前穿着的服装、配饰等（要符合角色人设和当前时间）
【心情】：描述角色此刻的心情状态和情绪（要自然真实）
【感想】：描述角色此刻的内心想法、感慨或思绪（要有深度和情感）

要求：
1. 要符合角色的人设和性格
2. 要自然真实，像真人会有的想法
3. 可以使用 emoji，但要克制
4. 每个部分 20-50 字左右
5. 不要使用过于文学化或修辞化的语言
6. 要体现角色当下的真实状态

请以 JSON 格式返回，格式如下：
{
  "clothing": "穿着描述",
  "mood": "心情描述",
  "thoughts": "感想描述"
}

${personaInfo ? '\n【角色设定】：\n' + personaInfo : ''}`;
    
    // 用户消息 - 包含最近的对话上下文
    const recentMessages = messages.slice(-10);
    const contextText = recentMessages.map(msg => {
        const sender = msg.sender === 'ai' ? characterName : '对方';
        const content = typeof msg.content === 'string' ? msg.content : '[其他消息]';
        return `${sender}: ${content}`;
    }).join('\n');
    
    const userMessage = `当前时间：${timeStr}\n\n最近的对话：\n${contextText}\n\n请生成${characterName}此刻的心声。`;
    
    try {
        const response = await fetch(`${apiConfig.mainApi.url}/chat/completions`, {
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
                max_tokens: 512
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
        
        // 尝试解析 JSON
        let voiceData;
        try {
            const jsonMatch = aiReply.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                voiceData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('未找到 JSON');
            }
        } catch (e) {
            console.error('解析 JSON 失败:', e);
            showToast('心声解析失败');
            return;
        }
        
        // 创建心声消息（独立类型，与语音消息区分）
        const voiceMessage = {
            id: Date.now().toString(),
            type: 'inner_voice',
            content: {
                clothing: voiceData.clothing || '',
                mood: voiceData.mood || '',
                thoughts: voiceData.thoughts || ''
            },
            sender: 'ai',
            time: Date.now(),
            timeDisplay: new Date().toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).replace(/\//g, '-')
        };
        
        messages.push(voiceMessage);
        
        const MAX_MESSAGES = 500;
        const messagesToSave = messages.slice(-MAX_MESSAGES);
        
        const compressedMessages = messagesToSave.map(msg => {
            const compressed = {
                id: msg.id,
                t: msg.t || msg.type || 'text',
                c: msg.c !== undefined ? msg.c : (typeof msg.content === 'object' ? msg.content : (msg.content || '')),
                s: msg.s || msg.sender || 'ai',
                tm: msg.tm || msg.time || ''
            };
            if (msg.r || msg.replyTo) compressed.r = msg.r || msg.replyTo;
            if (msg.ir || msg.isRecalled) compressed.ir = true;
            // 保存心声的 timeDisplay
            if (msg.timeDisplay) compressed.td = msg.timeDisplay;
            return compressed;
        });
        
        try {
            window.ChatDB.saveMessages(chatId, compressedMessages);
        } catch (e) {
            console.error('保存心声失败:', e);
        }
        
        // 生成心声后显示小红点提示
        if (currentChatId === chatId) {
            showWhisperBadge();
        }
        
        if (currentChatId === chatId) {
            chatMessages = compressedMessages.map(msg => {
                const decompressed = {
                    id: msg.id,
                    type: msg.t,
                    content: msg.c,
                    sender: msg.s,
                    time: msg.tm
                };
                if (msg.r) decompressed.replyTo = msg.r;
                if (msg.ir) {
                    decompressed.isRecalled = true;
                    decompressed.type = 'recalled';
                }
                // 恢复心声的 timeDisplay
                if (msg.td) decompressed.timeDisplay = msg.td;
                return decompressed;
            });
            renderMessages();
        }
        
        await loadVoiceData();
        showToast('心声已生成');
    } catch (error) {
        console.error('生成心声失败:', error);
        showToast('生成失败: ' + error.message);
    }
};

// 尝试生成心声（仅在用户明确要求时生成）
async function tryGenerateVoice(chatId, messages) {
    // 旁白模式下禁止生成语音消息（面对面见面不发语音）
    const offlineMode = localStorage.getItem('offlineMode');
    if (offlineMode === 'narration') {
        console.log('🎭 旁白模式：禁止生成语音消息');
        return;
    }
    
    // 获取最后一条用户消息
    const lastUserMessage = messages.filter(m => m.sender === 'user').pop();
    if (!lastUserMessage || lastUserMessage.type !== 'text') {
        console.log('🔇 用户未发送文本消息，不生成语音');
        return;
    }
    
    const userText = lastUserMessage.content.toLowerCase();
    
    // 检测用户是否要求听声音/语音
    const voiceKeywords = [
        '想听你的声音', '听听你的声音', '发语音', '语音', '声音',
        '说句话', '说话给我听', '用语音', '语音消息',
        'want to hear your voice', 'send voice', 'voice message'
    ];
    
    const shouldGenerateVoice = voiceKeywords.some(keyword => userText.includes(keyword));
    
    if (!shouldGenerateVoice) {
        console.log('🔇 用户未要求听声音，不生成语音');
        return;
    }
    
    console.log('🎤 检测到用户要求听声音，开始生成语音消息...');
    
    // 获取角色信息
    let personaInfo = '';
    let characterName = '角色';
    try {
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        const currentContact = contacts.find(c => c.id === chatId);
        if (currentContact) {
            personaInfo = currentContact.persona || currentContact.roleSetting || currentContact.setting || '';
            characterName = currentContact.name || currentContact.remark || '角色';
        }
    } catch (e) {
        console.error('获取角色信息失败:', e);
        return;
    }
    
    // 获取当前时间
    const now = new Date();
    const timeStr = `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // 获取 API 配置
    let apiConfig = null;
    try {
        const savedConfig = localStorage.getItem('globalApiConfig');
        if (savedConfig) {
            apiConfig = JSON.parse(savedConfig);
        }
        if (!apiConfig) {
            const apiKey = localStorage.getItem('apiKey');
            const apiUrl = localStorage.getItem('apiUrl');
            const apiModel = localStorage.getItem('apiModel');
            if (apiKey && apiUrl) {
                apiConfig = {
                    mainApi: { url: apiUrl, token: apiKey },
                    model: apiModel || 'gpt-3.5-turbo'
                };
            }
        }
    } catch (e) {
        console.error('读取 API 配置失败:', e);
        return;
    }
    
    if (!apiConfig || !apiConfig.mainApi || !apiConfig.mainApi.url || !apiConfig.mainApi.token) {
        console.warn('⚠️ API 配置不完整，跳过心声生成');
        return;
    }
    
    // 构建系统提示词
    const systemPrompt = `你现在要扮演${characterName}，生成这个角色此刻的内心独白。

请根据角色设定和最近的对话，生成以下三个方面的内容：

【穿着】：描述角色当前穿着的服装、配饰等（要符合角色人设和当前时间）
【心情】：描述角色此刻的心情状态和情绪（要自然真实）
【感想】：描述角色此刻的内心想法、感慨或思绪（要有深度和情感）

要求：
1. 要符合角色的人设和性格
2. 要自然真实，像真人会有的想法
3. 可以使用 emoji，但要克制
4. 每个部分 20-50 字左右
5. 不要使用过于文学化或修辞化的语言
6. 要体现角色当下的真实状态

请以 JSON 格式返回，格式如下：
{
  "clothing": "穿着描述",
  "mood": "心情描述",
  "thoughts": "感想描述"
}

${personaInfo ? '\n【角色设定】：\n' + personaInfo : ''}`;
    
    // 用户消息 - 包含最近的对话上下文
    const recentMessages = messages.slice(-10); // 最近 10 条消息
    const contextText = recentMessages.map(msg => {
        const sender = msg.sender === 'ai' ? characterName : '对方';
        return `${sender}: ${msg.content}`;
    }).join('\n');
    
    const userMessage = `当前时间：${timeStr}\n\n最近的对话：\n${contextText}\n\n请生成${characterName}此刻的心声。`;
    
    try {
        console.log('调用 AI API 生成心声...');
        
        const response = await fetch(`${apiConfig.mainApi.url}/chat/completions`, {
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
                max_tokens: 512  // 限制 token 消耗
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
        
        console.log('AI 心声回复:', aiReply);
        
        // 尝试解析 JSON
        let voiceData;
        try {
            // 提取 JSON
            const jsonMatch = aiReply.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                voiceData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('未找到 JSON');
            }
        } catch (e) {
            console.error('解析 JSON 失败:', e);
            // 如果解析失败，跳过这次心声生成
            console.log('⚠️ 心声解析失败，跳过');
            return;
        }
        
        // 创建心声消息（独立类型，与语音消息区分）
        const voiceMessage = {
            id: Date.now().toString(),
            type: 'inner_voice',
            content: {
                clothing: voiceData.clothing || '',
                mood: voiceData.mood || '',
                thoughts: voiceData.thoughts || ''
            },
            sender: 'ai',
            time: Date.now(),
            timeDisplay: new Date().toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).replace(/\//g, '-')
        };
        
        // 检查心声内容是否为空，只有有效内容才保存
        const hasContent = voiceMessage.content.clothing || voiceMessage.content.mood || voiceMessage.content.thoughts;
        if (!hasContent) {
            console.log('⚠️ 心声内容为空，跳过保存');
            return;
        }
        
        // 保存心声消息
        messages.push(voiceMessage);
        
        const MAX_MESSAGES = 500;
        const messagesToSave = messages.slice(-MAX_MESSAGES);
        
        // 压缩消息
        const compressedMessages = messagesToSave.map(msg => {
            const compressed = {
                id: msg.id,
                t: msg.t || msg.type || 'text',
                c: msg.c !== undefined ? msg.c : (msg.content || ''),
                s: msg.s || msg.sender || 'ai',
                tm: msg.tm || msg.time || ''
            };
            if (msg.r || msg.replyTo) compressed.r = msg.r || msg.replyTo;
            if (msg.ir || msg.isRecalled) compressed.ir = true;
            return compressed;
        });
        
        // 保存到 IndexedDB
        try {
            window.ChatDB.saveMessages(chatId, compressedMessages);
            console.log('✅ 心声已保存');
        } catch (e) {
            console.error('❌ 保存心声失败:', e);
        }
        
        // 生成心声后显示小红点提示
        if (currentChatId === chatId) {
            showWhisperBadge();
        }
        
        // 如果当前在这个聊天界面，刷新显示
        if (currentChatId === chatId) {
            chatMessages = compressedMessages.map(msg => {
                const decompressed = {
                    id: msg.id,
                    type: msg.t,
                    content: msg.c,
                    sender: msg.s,
                    time: msg.tm
                };
                if (msg.r) decompressed.replyTo = msg.r;
                if (msg.ir) {
                    decompressed.isRecalled = true;
                    decompressed.type = 'recalled';
                }
                return decompressed;
            });
            renderMessages();
            scrollToBottom();
        }
        
        console.log('✅ 心声生成成功');
        
    } catch (e) {
        console.error('❌ 生成心声失败:', e);
        // 失败不影响主流程，静默处理
    }
}

// 🎭 检查并触发自定心声生成
async function checkAndTriggerAutoInnerVoice(chatId, messages) {
    // 获取聊天配置
    const chatKey = `chat_config_${chatId}`;
    const config = JSON.parse(localStorage.getItem(chatKey) || '{}');
    
    // 检查是否开启自动心声（默认开启）
    const autoVoiceEnabled = config.autoVoiceEnabled !== undefined ? config.autoVoiceEnabled : true;
    if (!autoVoiceEnabled) {
        console.log('🎭 自动心声已关闭，跳过生成');
        return;
    }
    
    // 获取触发频率（默认中频）
    const voiceFrequency = config.voiceFrequency || 'medium';
    
    // 根据频率设置消息间隔
    let messagesPerVoice;
    switch (voiceFrequency) {
        case 'low':
            messagesPerVoice = 20; // 低频：每20条消息
            break;
        case 'high':
            messagesPerVoice = 5; // 高频：每5条消息
            break;
        case 'medium':
        default:
            messagesPerVoice = 10; // 中频：每10条消息
            break;
    }
    
    // 获取 API 配置
    let apiConfig = null;
    try {
        const savedConfig = localStorage.getItem('globalApiConfig');
        if (savedConfig) {
            apiConfig = JSON.parse(savedConfig);
        }
    } catch (e) {
        console.error('读取 API 配置失败:', e);
        return;
    }
    
    if (!apiConfig || !apiConfig.mainApi || !apiConfig.mainApi.url || !apiConfig.mainApi.token) {
        console.log('🎭 API 配置不完整，跳过神声生成');
        return;
    }
    
    // 条件1: 检查是否为深夜时段 (23:00-05:00)
    const now = new Date();
    const hour = now.getHours();
    const isLateNight = hour >= 23 || hour < 5;
    
    // 条件2: 检查消息中是否包含情绪关键词
    const emotionKeywords = [
        '难过', '伤心', '开心', '高兴', '生气', '愤怒', '失望', '绝望',
        '兴奋', '激动', '焦虑', '紧张', '害怕', '恐惧', '孤独', '寂寞',
        '想念', '思念', '喜欢', '爱', '恨', '讨厌', '委屈', '无助',
        'sad', 'happy', 'angry', 'lonely', 'miss', 'love', 'hate'
    ];
    
    const recentMessages = messages.slice(-20); // 最近20条消息
    const hasEmotion = recentMessages.some(msg => {
        if (msg.type !== 'text' || !msg.content) return false;
        const text = msg.content.toLowerCase();
        return emotionKeywords.some(keyword => text.includes(keyword));
    });
    
    // 条件3: 检查距离上次心声的时间
    const innerVoiceMessages = messages.filter(m => m.type === 'inner_voice');
    const lastInnerVoice = innerVoiceMessages.length > 0 ? innerVoiceMessages[innerVoiceMessages.length - 1] : null;
    const timeSinceLastVoice = lastInnerVoice ? (Date.now() - lastInnerVoice.time) : Infinity;
    const minInterval = 10 * 60 * 1000; // 最少间隔10分钟
    
    // 条件4: 检查对话数量（根据频率设置）
    const userMessages = messages.filter(m => m.sender === 'user' && m.type === 'text');
    const voiceCount = innerVoiceMessages.length;
    const shouldGenerateByCount = userMessages.length >= (voiceCount + 1) * messagesPerVoice;
    
    // 判断是否应该生成
    let shouldGenerate = false;
    let reason = '';
    
    if (isLateNight && timeSinceLastVoice > minInterval) {
        shouldGenerate = true;
        reason = '深夜时段';
    } else if (hasEmotion && timeSinceLastVoice > minInterval) {
        shouldGenerate = true;
        reason = '检测到情绪变化';
    } else if (shouldGenerateByCount && timeSinceLastVoice > minInterval) {
        shouldGenerate = true;
        reason = '对话达到一定数量';
    }
    
    if (!shouldGenerate) {
        console.log('🎭 不满足自动生成条件，跳过');
        return;
    }
    
    console.log(`🎭 触发自动心声生成: ${reason} (频率: ${voiceFrequency}, 间隔: ${messagesPerVoice}条消息)`);
    
    // 调用生成函数
    await generateInnerVoiceInternal(chatId, messages);
}

// 内部心声生成函数（供自动触发使用）
async function generateInnerVoiceInternal(chatId, messages) {
    // 获取角色信息
    let personaInfo = '';
    let characterName = '角色';
    try {
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        const currentContact = contacts.find(c => c.id === chatId);
        if (currentContact) {
            personaInfo = currentContact.persona || currentContact.roleSetting || currentContact.setting || '';
            characterName = currentContact.name || currentContact.remark || '角色';
        }
    } catch (e) {
        console.error('读取角色信息失败:', e);
        return;
    }
    
    // 获取 API 配置
    let apiConfig = null;
    try {
        const savedConfig = localStorage.getItem('globalApiConfig');
        if (savedConfig) {
            apiConfig = JSON.parse(savedConfig);
        }
    } catch (e) {
        console.error('读取 API 配置失败:', e);
        return;
    }
    
    if (!apiConfig || !apiConfig.mainApi || !apiConfig.mainApi.url || !apiConfig.mainApi.token) {
        return;
    }
    
    // 构建系统提示词
    const now = new Date();
    const timeStr = `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日 ` +
        `${['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][now.getDay()]} ` +
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const systemPrompt = `你现在要扮演${characterName}，生成这个角色此刻的内心独白。

请根据角色设定和最近的对话，生成以下三个方面的内容：

【穿着】：描述角色当前穿着的服装、配饰等（要符合角色人设和当前时间）
【心情】：描述角色此刻的心情状态和情绪（要自然真实）
【感想】：描述角色此刻的内心想法、感慨或思绪（要有深度和情感）

要求：
1. 要符合角色的人设和性格
2. 要自然真实，像真人会有的想法
3. 可以使用 emoji，但要克制
4. 每个部分 20-50 字左右
5. 不要使用过于文学化或修辞化的语言
6. 要体现角色当下的真实状态

请以 JSON 格式返回，格式如下：
{
  "clothing": "穿着描述",
  "mood": "心情描述",
  "thoughts": "感想描述"
}

${personaInfo ? '\n【角色设定】：\n' + personaInfo : ''}`;
    
    // 用户消息 - 包含最近的对话上下文
    const recentMessages = messages.slice(-10);
    const contextText = recentMessages.map(msg => {
        const sender = msg.sender === 'ai' ? characterName : '对方';
        const content = typeof msg.content === 'string' ? msg.content : '[其他消息]';
        return `${sender}: ${content}`;
    }).join('\n');
    
    const userMessage = `当前时间：${timeStr}\n\n最近的对话：\n${contextText}\n\n请生成${characterName}此刻的心声。`;
    
    try {
        const response = await fetch(`${apiConfig.mainApi.url}/chat/completions`, {
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
                max_tokens: 512
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
        
        // 尝试解析 JSON
        let voiceData;
        try {
            const jsonMatch = aiReply.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                voiceData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('未找到 JSON');
            }
        } catch (e) {
            console.error('解析 JSON 失败:', e);
            return;
        }
        
        // 创建心声消息
        const voiceMessage = {
            id: Date.now().toString(),
            type: 'inner_voice',
            content: {
                clothing: voiceData.clothing || '',
                mood: voiceData.mood || '',
                thoughts: voiceData.thoughts || ''
            },
            sender: 'ai',
            time: Date.now(),
            timeDisplay: new Date().toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).replace(/\//g, '-')
        };
        
        messages.push(voiceMessage);
        
        const MAX_MESSAGES = 500;
        const messagesToSave = messages.slice(-MAX_MESSAGES);
        
        const compressedMessages = messagesToSave.map(msg => {
            const compressed = {
                id: msg.id,
                t: msg.t || msg.type || 'text',
                c: msg.c !== undefined ? msg.c : (typeof msg.content === 'object' ? msg.content : (msg.content || '')),
                s: msg.s || msg.sender || 'ai',
                tm: msg.tm || msg.time || ''
            };
            if (msg.r || msg.replyTo) compressed.r = msg.r || msg.replyTo;
            if (msg.ir || msg.isRecalled) compressed.ir = true;
            if (msg.timeDisplay) compressed.td = msg.timeDisplay;
            return compressed;
        });
        
        try {
            window.ChatDB.saveMessages(chatId, compressedMessages);
        } catch (e) {
            console.error('保存心声失败:', e);
        }
        
        // 生成心声后显示小红点提示
        if (currentChatId === chatId) {
            showWhisperBadge();
        }
        
        if (currentChatId === chatId) {
            chatMessages = compressedMessages.map(msg => {
                const decompressed = {
                    id: msg.id,
                    type: msg.t,
                    content: msg.c,
                    sender: msg.s,
                    time: msg.tm
                };
                if (msg.r) decompressed.replyTo = msg.r;
                if (msg.ir) {
                    decompressed.isRecalled = true;
                    decompressed.type = 'recalled';
                }
                if (msg.td) decompressed.timeDisplay = msg.td;
                return decompressed;
            });
            renderMessages();
        }
        
        console.log('🎭 自动心声生成成功');
    } catch (error) {
        console.error('🎭 自动生成心声失败:', error);
    }
}

// 加载聊天设置数据
function loadChatSettingsData() {
    const chatId = currentChatId;
    if (!chatId) {
        console.warn('未选择聊天，无法加载设置');
        return;
    }
    const chatKey = `chat_config_${chatId}`;
    
    console.log('===== 开始加载聊天设置 =====');
    console.log('当前聊天 ID:', chatId);
    
    const isGroupChat = chatId.startsWith('group_');
    console.log('是否为群聊:', isGroupChat);
    console.log('当前 currentChatId:', chatId);
    
    // 显示/隐藏对应的设置界面
    const groupSettingsEl = document.getElementById('group-chat-settings');
    const singleSettingsEl = document.getElementById('single-chat-settings');
    
    console.log('group-chat-settings 元素:', groupSettingsEl);
    console.log('single-chat-settings 元素:', singleSettingsEl);
    
    if (isGroupChat) {
        // 群聊设置
        console.log('✅ 进入群聊设置分支');
        groupSettingsEl.style.display = 'block';
        singleSettingsEl.style.display = 'none';
        
        // 加载群聊设置
        console.log('🔄 调用 loadGroupChatSettings()');
        loadGroupChatSettings();
    } else {
        // 单聊设置
        groupSettingsEl.style.display = 'none';
        singleSettingsEl.style.display = 'block';
        
        // 加载单聊设置（原有逻辑）
        loadSingleChatSettings(chatKey);
    }
    
    setTimeout(() => {
        const isGroupChat = currentChatId && currentChatId.startsWith('group_');
        const countElementId = isGroupChat ? 'chat-message-count-group' : 'chat-message-count-single';
        const countElement = document.getElementById(countElementId);
        
        console.log('📊 更新消息数量（群聊/单聊）:', {
            isGroupChat,
            countElementId,
            messageCount: chatMessages.length,
            elementFound: !!countElement
        });
        
        if (countElement) {
            countElement.textContent = chatMessages.length;
        } else {
            console.warn('⚠️ 未找到消息计数元素:', countElementId);
        }
    }, 100);
    
    // 🎯 加载用户个人资料
    loadUserProfile();
}

// 加载群聊设置
function loadGroupChatSettings() {
    console.log('====== 开始加载群聊设置 ======');
    try {
        // 从 sessionStorage 获取群聊信息
        let groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
        
        console.log('🔍 sessionStorage 中的群聊信息:', groupInfo);
        
        // 如果 sessionStorage 中没有，尝试重新加载
        if (!groupInfo.id) {
            console.warn('⚠ sessionStorage 中未找到群聊信息，尝试重新加载...');
            loadGroupChatInfo();
            groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
        }
        
        if (!groupInfo.id) {
            console.error('❌ 仍然未找到群聊信息');
            console.log('当前聊天 ID:', currentChatId);
            showToast('未找到群聊信息，请刷新页面重试');
            return;
        }
        
        console.log('✓ 加载群聊设置:', groupInfo);
        
        // 填充群聊名称
        document.getElementById('settings-group-name').value = groupInfo.name || '';
        
        // 显示群聊头像
        updateGroupAvatarPreview(groupInfo.avatar || '');
        
        // 加载群聊头像形状设置
        const avatarShape = groupInfo.avatarShape || 'square';
        setGroupAvatarShape(avatarShape);
        
        // 填充群公告（如果有的话）
        document.getElementById('settings-group-announcement').value = groupInfo.announcement || '';
        
        // 加载世界书列表
        loadWorldbookList(groupInfo.worldbookId || null);
        
        // 渲染成员列表
        renderGroupMembersList(groupInfo);
    } catch (e) {
        console.error('加载群聊设置失败:', e);
        showToast('加载设置失败: ' + e.message);
    }
}

// 渲染群成员列表
function renderGroupMembersList(groupInfo) {
    const container = document.getElementById('group-members-list');
    if (!container) return;
    
    console.log('渲染群成员列表, groupInfo:', groupInfo);
    console.log('🔍 群聊 admins 数据:', groupInfo.admins);
    console.log('  - admins 是否存在:', !!groupInfo.admins);
    console.log('  - admins 长度:', groupInfo.admins ? groupInfo.admins.length : 0);
    console.log('  - admins 类型:', typeof groupInfo.admins);
    
    const members = groupInfo.members || [];
    const memberAvatars = groupInfo.memberAvatars || [];
    const ownerId = groupInfo.owner;
    
    // 获取当前用户ID
    let myProfile = JSON.parse(localStorage.getItem('myProfile') || '{}');
    let currentUserId = myProfile.id;
    
    console.log('[开始获取用户 ID]', {
        myProfile: myProfile,
        myProfileId: myProfile.id,
        groupInfo: groupInfo
    });
            
    // [关键修复] 强制从群聊信息中获取正确的用户ID
    const memberNames = groupInfo.memberNames || [];
    
    console.log('[成员列表调试]', {
        members: groupInfo.members,
        memberNames: memberNames,
        memberNamesLength: memberNames.length
    });
        
    // [方案1] 如果 memberNames 不为空，查找名称为"我"的成员
    let foundUserId = null;
    if (memberNames.length > 0) {
        for (let i = 0; i < memberNames.length; i++) {
            if (memberNames[i] === '我') {
                foundUserId = groupInfo.members[i];
                console.log('[找到用户] 名称为"我"的成员ID:', foundUserId);
                break;
            }
        }
    }
        
    // [方案2] 如果没找到，直接使用群主ID（群主就是当前用户）
    if (!foundUserId && groupInfo.owner) {
        foundUserId = groupInfo.owner;
        console.log('[使用群主ID] foundUserId:', foundUserId);
    }
    
    // 强制更新 currentUserId
    if (foundUserId) {
        currentUserId = foundUserId;
        myProfile = { id: currentUserId };
        localStorage.setItem('myProfile', JSON.stringify(myProfile));
        console.log('[已保存] myProfile:', myProfile);
    }
        
    console.log('✅ 最终用户 ID:', currentUserId);
    
    // [调试] 检查 ownerId
    console.log('🔍 检查 ownerId:', {
        ownerId: ownerId,
        ownerIdType: typeof ownerId,
        groupInfo_owner: groupInfo.owner,
        groupInfo: groupInfo
    });
    
    // [修复] 使用宽松比较，确保ID匹配
    const isOwner = currentUserId && groupInfo.owner && String(currentUserId) === String(groupInfo.owner);
    console.log(' 群主权限检查:', {
        currentUserId: currentUserId,
        ownerId: ownerId,
        isOwner: isOwner,
        isOwnerType: typeof isOwner,
        myProfile: myProfile
    });
    
    // 显示/隐藏群主操作按钮
    const ownerActionsEl = document.getElementById('owner-actions');
    if (ownerActionsEl) {
        ownerActionsEl.style.display = isOwner ? 'block' : 'none';
        console.log('👑 群主操作按钮显示状态:', isOwner ? '显示' : '隐藏');
        if (isOwner) {
            console.log('✅ 你群主，可以看到解散群聊按钮');
        } else {
            console.log('⚠️ 你不是群主或ID不匹配');
        }
    } else {
        console.warn('⚠️ 未找到 owner-actions 元素');
    }
    
    // 更新禁言按钮文字
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
        const isMuted = groupInfo.muted || false;
        muteBtn.textContent = isMuted ? '取消禁言' : '禁言群聊';
        muteBtn.style.background = 'white';
        muteBtn.style.color = '#f59e0b';
        muteBtn.style.border = '1px solid #f59e0b';
    }
    
    // 更新成员数量
    document.getElementById('group-member-count').textContent = members.length;
    
    // 清空容器，设置为横排布局
    container.innerHTML = '';
    container.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        padding: 0;
    `;
    
    if (members.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">暂无成员</div>';
        return;
    }
    
    // 获取所有联系人（用于显示成员名称）
    let allContacts = [];
    try {
        // 首先尝试从 iframe 获取
        const mainFrame = document.querySelector('iframe');
        if (mainFrame && mainFrame.contentWindow) {
            allContacts = mainFrame.contentWindow.getData('chatContacts') || [];
            console.log('从 iframe 获取联系人:', allContacts.length, '个');
        }
        
        // 如果 iframe 获取失败，尝试从 localStorage 获取
        if (allContacts.length === 0) {
            console.log('iframe 获取失败，尝试从 localStorage 获取...');
            const currentPersona = localStorage.getItem('currentPersona') || 'default';
            const contactsKey = `persona_${currentPersona}_chatContacts`;
            allContacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
            console.log('从 localStorage 获取联系人:', allContacts.length, '个, key:', contactsKey);
        }
        
        // 如果还是空的，尝试通用 key
        if (allContacts.length === 0) {
            allContacts = JSON.parse(localStorage.getItem('chatContacts') || '[]');
            console.log('从通用 localStorage 获取联系人:', allContacts.length, '个');
        }
        
        console.log('所有联系人:', allContacts.map(c => ({ id: c.id, name: c.name })));
    } catch (e) {
        console.warn('获取联系人列表失败:', e);
    }
    
    // 创建成员列表项
    members.forEach((memberId, index) => {
        const memberItem = document.createElement('div');
        memberItem.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 60px;
            padding: 4px;
            cursor: pointer;
            transition: background 0.2s;
            border-radius: 4px;
        `;
        memberItem.onmouseover = () => memberItem.style.background = '#f5f5f5';
        memberItem.onmouseout = () => memberItem.style.background = 'transparent';
        
        // 获取成员头像（优先使用 memberAvatars，否则显示默认头像）
        const avatar = memberAvatars[index] || '👤';
        
        // 判断是否为图片 URL，生成对应的 HTML
        let avatarHtml = '';
        if (avatar && typeof avatar === 'string' && (avatar.startsWith('http') || avatar.startsWith('data:'))) {
            avatarHtml = `<img src="${avatar}" alt="" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" onerror="this.style.display='none'; this.parentElement.textContent='👤';">`;
        } else {
            avatarHtml = avatar || '👤';
        }
        
        // 获取成员名称（从通讯录中查找，使用宽松比较）
        const memberContact = allContacts.find(c => c.id == memberId);
        let memberName = memberContact ? (memberContact.name || '未知成员') : '未知成员';
        console.log(`成员 ${index}: memberId=${memberId}, 找到=${memberContact ? memberContact.name : '未找到'}`);
        
        const isCurrentUser = memberId == currentUserId;
        const isGroupOwner = memberId == ownerId;
        
        // 如果是群主但找不到联系人信息，从 myProfile 获取名称
        if (isGroupOwner && memberName === '未知成员') {
            const currentPersona = localStorage.getItem('currentPersona') || 'default';
            const myProfileKey = `persona_${currentPersona}_myProfile`;
            const myProfile = JSON.parse(localStorage.getItem(myProfileKey) || '{}');
            // 🔴 优先使用真实姓名
            memberName = myProfile.realName || myProfile.name || '我';
            console.log(`群主名称从 myProfile 获取: ${memberName}`);
        }
        
        // 检查是否为管理员
        const admins = groupInfo.admins || [];
        const isAdmin = admins.includes(memberId);
        
        console.log(`🔍 管理员检查 - 成员 ${memberName}:`);
        console.log('  - admins 数组:', admins);
        console.log('  - memberId:', memberId, '(类型:', typeof memberId, ')');
        console.log('  - isAdmin:', isAdmin);
        console.log('  - admins.includes(memberId):', admins.includes(memberId));
        console.log('  - admins.includes(String(memberId)):', admins.includes(String(memberId)));
        console.log('  - admins.includes(Number(memberId)):', admins.includes(Number(memberId)));
        
        // 🎯 获取成员头衔
        const memberTitles = groupInfo.memberTitles || {};
        const memberTitle = memberTitles[memberId];
        
        console.log(`🔍 成员 ${memberName} (${memberId}) 的头衔检查:`);
        console.log('  - memberTitles:', memberTitles);
        console.log('  - memberId:', memberId);
        console.log('  - memberTitle:', memberTitle);
        console.log('  - typeof memberTitle:', typeof memberTitle);
        
        let titleHtml = '';
        let roleLabel = '';
        
        if (isGroupOwner) {
            // 群主：如果有自定义头衔，显示在群主标签里 - QQ风格亮黄色
            if (memberTitle && typeof memberTitle === 'string') {
                roleLabel = `<span style="font-size: 10px; color: #FFFFFF; background: #FFC107; padding: 2px 6px; border-radius: 3px; margin-top: 2px; display: inline-block; font-weight: 600; white-space: nowrap;">${memberTitle}</span>`;
            } else {
                roleLabel = '<span style="font-size: 10px; color: #FFC107; background: #FFF8E1; padding: 1px 4px; border-radius: 3px; margin-top: 2px;">群主</span>';
            }
        } else if (isAdmin) {
            // 管理员：如果有自定义头衔，显示在管理员标签里 - QQ风格浅色扁平
            if (memberTitle && typeof memberTitle === 'string') {
                roleLabel = `<span style="font-size: 10px; color: #4682B4; background: #E6F2FF; padding: 2px 6px; border-radius: 3px; margin-top: 2px; display: inline-block; font-weight: 600; white-space: nowrap;">${memberTitle}</span>`;
            } else {
                roleLabel = '<span style="font-size: 10px; color: #4A90E2; background: #E8F0FF; padding: 1px 4px; border-radius: 3px; margin-top: 2px;">管理员</span>';
            }
        } else {
            // 普通成员：头衔单独显示
            if (memberTitle) {
                if (typeof memberTitle === 'string') {
                    titleHtml = `<div style="font-size: 9px; color: #FFFFFF; background: #9B59B6; padding: 2px 6px; border-radius: 3px; margin-top: 4px; text-align: center; display: inline-block; font-weight: 600; letter-spacing: 0.5px;">${memberTitle}</div>`;
                } else if (typeof memberTitle === 'object') {
                    const bgColor = memberTitle.color || '#9B59B6';
                    titleHtml = `<div style="font-size: 9px; color: #FFFFFF; background: ${bgColor}; padding: 2px 6px; border-radius: 3px; margin-top: 4px; text-align: center; display: inline-block; font-weight: 600; letter-spacing: 0.5px;">${memberTitle.icon || ''} ${memberTitle.name || ''}</div>`;
                }
            }
            
            // 显示"我"标签
            if (isCurrentUser && memberName === '我') {
                roleLabel = '<span style="font-size: 10px; color: #07C160; background: #E8F8F0; padding: 1px 4px; border-radius: 3px; margin-top: 2px;">我</span>';
            }
        }
        
        console.log(`成员角色: ${memberName}, isGroupOwner=${isGroupOwner}, isAdmin=${isAdmin}, isCurrentUser=${isCurrentUser}`);
        
        memberItem.innerHTML = `
            <div style="width: 36px; height: 36px; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 18px; overflow: hidden;">
                ${avatarHtml}
            </div>
            <div style="font-size: 11px; color: #333; margin-top: 2px; text-align: center; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${memberName}
            </div>
            ${titleHtml}
            ${roleLabel}
        `;
        
        // 🎯 群主和管理员点击成员可以设置头衔
        // 群主可以设置任何成员（包括自己），管理员只能设置普通成员
        console.log(`📌 成员 ${memberName} 点击事件:`, {
            isOwner: isOwner,
            isAdmin: isAdmin,
            isCurrentUser: isCurrentUser,
            memberId: memberId,
            willAttachClick: isOwner || isAdmin  // 群主或管理员可以点击
        });
        
        if (isOwner || isAdmin) {
            memberItem.onclick = () => {
                console.log(' 点击了成员:', memberName, memberId);
                showMemberManageMenu(memberId, memberName, isGroupOwner, isAdmin, isOwner);
            };
            memberItem.style.cursor = 'pointer';
            console.log('✅ 已绑定点击事件到:', memberName);
        } else {
            console.log('️ 未绑定点击事件:', {
                isOwner: isOwner,
                isAdmin: isAdmin,
                reason: '不是群主也不是管理员'
            });
        }
        
        container.appendChild(memberItem);
    });
}

// ========== 群聊公告管理 ==========

// 🎯 显示成员管理菜单（设置管理员/移交群主）
// isCallerOwner: 调用者是否为群主（用于区分群主和管理员的权限）
window.showMemberManageMenu = function(memberId, memberName, isGroupOwner, isAdmin, isCallerOwner = true) {
    console.log(' 打开成员管理菜单:', { memberId, memberName, isGroupOwner, isAdmin, isCallerOwner });
    
    // 如果点击的是群主自己，直接显示头衔设置菜单（不移交群主）
    if (isGroupOwner) {
        console.log(' 群主点击自己，显示头衔设置菜单');
        showMemberTitleMenu(memberId, memberName);
        return;
    }
    
    // 如果是管理员点击其他管理员，只显示头衔设置
    if (!isCallerOwner && isAdmin) {
        console.log(' 管理员点击其他管理员，只显示头衔设置');
        showMemberTitleMenu(memberId, memberName);
        return;
    }
    
    // 创建弹窗
    const modal = document.createElement('div');
    modal.id = 'member-manage-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 10002;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    // 根据调用者身份显示不同的按钮
    const isCallerAdmin = !isCallerOwner; // 调用者是管理员但不是群主
    
    modal.innerHTML = `
        <div style="background: white; width: 90%; max-width: 360px; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            <!-- 头部 -->
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #e5e5e5; background: #f5f5f5;">
                <h3 style="font-size: 17px; font-weight: 600; margin: 0;">${memberName}</h3>
                <button onclick="closeMemberManageMenu()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">&times;</button>
            </div>
            
            <!-- 操作按钮 -->
            <div style="padding: 20px;">
                ${isCallerOwner ? `
                    ${!isAdmin ? `
                    <button onclick="setMemberAsAdmin('${memberId}', '${memberName}')" style="width: 100%; padding: 14px; background: #007AFF; color: white; border: none; border-radius: 8px; font-size: 15px; cursor: pointer; margin-bottom: 12px; font-weight: 500;">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 8px;">
                            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"></path>
                            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
                        </svg>
                        设为管理员
                    </button>
                    ` : `
                    <button onclick="removeMemberAdmin('${memberId}', '${memberName}')" style="width: 100%; padding: 14px; background: #FF9500; color: white; border: none; border-radius: 8px; font-size: 15px; cursor: pointer; margin-bottom: 12px; font-weight: 500;">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 8px;">
                            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"></path>
                            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
                        </svg>
                        取消管理员
                    </button>
                    `}
                ` : ''}
                
                <button onclick="showMemberTitleMenu('${memberId}', '${memberName}')" style="width: 100%; padding: 14px; background: #F5F5F5; color: #333; border: none; border-radius: 8px; font-size: 15px; cursor: pointer; margin-bottom: 12px; font-weight: 500;">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 8px;">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    </svg>
                    设置头衔
                </button>
                
                ${isCallerOwner || !isCallerAdmin ? `
                <button onclick="showMemberBanMenu('${memberId}', '${memberName}')" style="width: 100%; padding: 14px; background: #FFF3E0; color: #F57C00; border: none; border-radius: 8px; font-size: 15px; cursor: pointer; margin-bottom: 12px; font-weight: 500;">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 8px;">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    禁言
                </button>
                ` : ''}
                
                ${isCallerOwner ? `
                <button onclick="transferGroupOwner('${memberId}', '${memberName}')" style="width: 100%; padding: 14px; background: #FFCDD2; color: #D32F2F; border: none; border-radius: 8px; font-size: 15px; cursor: pointer; font-weight: 500;">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 8px;">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    移交群主
                </button>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
};

// 关闭成员管理菜单
window.closeMemberManageMenu = function() {
    const modal = document.getElementById('member-manage-modal');
    if (modal) {
        modal.remove();
    }
};

// 🎯 显示称号设置菜单（QQ风格自定义称号）
window.showMemberTitleMenu = function(memberId, memberName) {
    console.log('🎯 打开称号设置菜单:', { memberId, memberName });
    
    // 关闭之前的管理菜单
    closeMemberManageMenu();
    
    // 获取当前群聊信息
    const groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
    const memberTitles = groupInfo.memberTitles || {};
    const currentTitle = memberTitles[memberId] || '';
    
    // 创建弹窗
    const modal = document.createElement('div');
    modal.id = 'title-select-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 10003;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    modal.innerHTML = `
        <div style="background: white; width: 90%; max-width: 360px; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            <!-- 头部 -->
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #e5e5e5; background: #f5f5f5;">
                <h3 style="font-size: 17px; font-weight: 600; margin: 0;">设置称号 - ${memberName}</h3>
                <button onclick="closeTitleModal()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">&times;</button>
            </div>
            
            <!-- 输入框 -->
            <div style="padding: 20px;">
                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-size: 13px; color: #666; margin-bottom: 8px;">输入自定义称号（最多6个字）</label>
                    <input type="text" id="title-input" value="${currentTitle}" maxlength="6" 
                           style="width: 100%; padding: 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 15px; outline: none; box-sizing: border-box;"
                           placeholder="例如：学霸、群宠、潜水王">
                </div>
                
                <!-- 按钮 -->
                <div style="display: flex; gap: 12px;">
                    <button onclick="closeTitleModal()" style="flex: 1; padding: 12px; background: #f5f5f5; color: #666; border: none; border-radius: 8px; font-size: 15px; cursor: pointer; font-weight: 500;">
                        取消
                    </button>
                    <button onclick="saveMemberTitle('${memberId}', '${memberName}')" style="flex: 1; padding: 12px; background: #007AFF; color: white; border: none; border-radius: 8px; font-size: 15px; cursor: pointer; font-weight: 500;">
                        保存
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 自动聚焦输入框
    setTimeout(() => {
        const input = document.getElementById('title-input');
        if (input) input.focus();
    }, 100);
};
// 关闭称号弹窗
window.closeTitleModal = function() {
    const modal = document.getElementById('title-select-modal');
    if (modal) {
        modal.remove();
    }
};

// 🎯 显示禁言设置菜单
window.showMemberBanMenu = function(memberId, memberName) {
    console.log('🎯 打开禁言设置菜单:', { memberId, memberName });
    
    // 关闭之前的管理菜单
    closeMemberManageMenu();
    
    // 获取当前群聊信息
    const groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
    const members = groupInfo.members || [];
    const member = members.find(m => m.id === memberId);
    
    // 检查是否已经被禁言
    const isMuted = member && member.muted;
    const muteUntil = member ? member.muteUntil : 0;
    const remainingTime = isMuted ? Math.max(0, muteUntil - Date.now()) : 0;
    
    // 创建弹窗
    const modal = document.createElement('div');
    modal.id = 'ban-member-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 10003;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    modal.innerHTML = `
        <div style="background: white; width: 90%; max-width: 360px; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            <!-- 头部 -->
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #e5e5e5; background: #f5f5f5;">
                <h3 style="font-size: 17px; font-weight: 600; margin: 0;">禁言 ${memberName}</h3>
                <button onclick="closeBanMemberMenu()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">&times;</button>
            </div>
            
            <!-- 内容 -->
            <div style="padding: 20px;">
                ${isMuted ? `
                    <div style="background: #FFF3E0; border-radius: 8px; padding: 12px; margin-bottom: 16px; font-size: 14px; color: #F57C00;">
                        ⚠️ 该成员已被禁言，剩余时间：${Math.floor(remainingTime / 60000)} 分钟
                    </div>
                ` : ''}
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-size: 14px; color: #333; margin-bottom: 8px; font-weight: 500;">禁言时长</label>
                    <select id="ban-duration" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 15px; background: white;">
                        <option value="600">10 分钟</option>
                        <option value="1800">30 分钟</option>
                        <option value="3600" selected>1 小时</option>
                        <option value="7200">2 小时</option>
                        <option value="43200">12 小时</option>
                        <option value="86400">1 天</option>
                        <option value="604800">7 天</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 14px; color: #333; margin-bottom: 8px; font-weight: 500;">禁言原因（可选）</label>
                    <input type="text" id="ban-reason" placeholder="例如：刷屏、违规发言..." style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 15px; box-sizing: border-box;">
                </div>
                
                <button onclick="executeBanMember('${memberId}', '${memberName}')" style="width: 100%; padding: 14px; background: #F57C00; color: white; border: none; border-radius: 8px; font-size: 15px; cursor: pointer; font-weight: 500; margin-bottom: 12px;">
                    ${isMuted ? '重新禁言' : '确认禁言'}
                </button>
                
                ${isMuted ? `
                <button onclick="unbanMember('${memberId}', '${memberName}')" style="width: 100%; padding: 14px; background: #F5F5F5; color: #333; border: none; border-radius: 8px; font-size: 15px; cursor: pointer; font-weight: 500;">
                    取消禁言
                </button>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
};

// 关闭禁言菜单
window.closeBanMemberMenu = function() {
    const modal = document.getElementById('ban-member-modal');
    if (modal) {
        modal.remove();
    }
};

// 执行禁言
window.executeBanMember = function(memberId, memberName) {
    try {
        const durationSelect = document.getElementById('ban-duration');
        const reasonInput = document.getElementById('ban-reason');
        
        if (!durationSelect) {
            showToast('未找到禁言时长选择器');
            return;
        }
        
        const duration = parseInt(durationSelect.value);
        const reason = reasonInput ? reasonInput.value.trim() : '';
        
        console.log('🔒 执行禁言:', { memberId, memberName, duration, reason });
        
        // 调用 AI 执行的禁言函数
        const success = banMemberByAI(memberId, duration, reason || '被管理员禁言');
        
        if (success) {
            closeBanMemberMenu();
            showToast(`已将 ${memberName} 禁言`);
        } else {
            showToast('禁言失败');
        }
    } catch (e) {
        console.error('❌ 禁言失败:', e);
        showToast('禁言失败: ' + e.message);
    }
};

// 取消禁言
window.unbanMember = function(memberId, memberName) {
    try {
        console.log('🔓 取消禁言:', { memberId, memberName });
        
        const groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
        if (!groupInfo.id) {
            showToast('未找到群聊信息');
            return;
        }
        
        const members = groupInfo.members || [];
        const member = members.find(m => m.id === memberId);
        
        if (!member) {
            showToast('未找到该成员');
            return;
        }
        
        // 取消禁言
        member.muted = false;
        member.muteUntil = 0;
        
        // 保存更新后的群聊信息
        sessionStorage.setItem('currentGroupChat', JSON.stringify(groupInfo));
        
        // 同步到主界面的通讯录
        const mainFrame = document.querySelector('iframe');
        if (mainFrame && mainFrame.contentWindow) {
            const contacts = mainFrame.contentWindow.getData('chatContacts') || [];
            const contactIndex = contacts.findIndex(c => c.id === groupInfo.id);
            if (contactIndex !== -1) {
                contacts[contactIndex].members = members;
                mainFrame.contentWindow.saveData('chatContacts', contacts);
            }
        }
        
        // 发送系统消息
        addSystemMessage(`${memberName} 已被取消禁言`);
        
        console.log('✅ 已取消禁言:', memberName);
        showToast(`已取消 ${memberName} 的禁言`);
        
        closeBanMemberMenu();
    } catch (e) {
        console.error('❌ 取消禁言失败:', e);
        showToast('操作失败: ' + e.message);
    }
};

// 保存成员称号
window.saveMemberTitle = function(memberId, memberName) {
    try {
        const titleInput = document.getElementById('title-input');
        const newTitle = titleInput ? titleInput.value.trim() : '';
        
        console.log('💾 保存头衔:', { memberId, memberName, newTitle });
        
        // 如果输入为空，移除称号
        if (!newTitle) {
            window.removeMemberTitle(memberId, memberName);
            return;
        }
        
        const groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
        if (!groupInfo.id) {
            console.error(' 未找到群聊信息');
            showToast('未找到群聊信息');
            return;
        }
        
        console.log(' 当前群聊信息:', groupInfo);
        
        // 初始化称号存储
        if (!groupInfo.memberTitles) {
            groupInfo.memberTitles = {};
        }
        
        // 设置称号（直接存储文字）
        groupInfo.memberTitles[memberId] = newTitle;
        
        console.log(' 更新后的 memberTitles:', groupInfo.memberTitles);
        
        // 保存到 sessionStorage
        sessionStorage.setItem('currentGroupChat', JSON.stringify(groupInfo));
        console.log('✅ 已保存到 sessionStorage');
        
        // 同步到 iframe 通讯录
        try {
            console.log('🔄 尝试同步到 iframe...');
            const mainFrame = document.querySelector('iframe');
            console.log('  - mainFrame:', mainFrame);
            console.log('  - contentWindow:', mainFrame ? mainFrame.contentWindow : null);
            
            if (mainFrame && mainFrame.contentWindow) {
                // 1. 更新 chatGroupChats（群聊列表）
                const currentGroupChats = mainFrame.contentWindow.getData('chatGroupChats');
                console.log('  - 当前 iframe 中的群聊数量:', currentGroupChats ? currentGroupChats.length : 0);
                
                if (currentGroupChats) {
                    const updatedGroupChats = currentGroupChats.map(g => 
                        g.id === groupInfo.id ? groupInfo : g
                    );
                    mainFrame.contentWindow.setData('chatGroupChats', updatedGroupChats);
                    console.log('✅ 已同步到 chatGroupChats');
                    
                    // 验证是否同步成功
                    const verifyData = mainFrame.contentWindow.getData('chatGroupChats');
                    const verifiedGroup = verifyData.find(g => g.id === groupInfo.id);
                    console.log('🔍 验证 chatGroupChats 数据:', verifiedGroup ? verifiedGroup.memberTitles : '未找到');
                }
                
                // 2. 更新 chatContacts（联系人列表 - 包含群聊）
                const currentContacts = mainFrame.contentWindow.getData('chatContacts');
                console.log('  - 当前 iframe 中的联系人数量:', currentContacts ? currentContacts.length : 0);
                
                if (currentContacts) {
                    const updatedContacts = currentContacts.map(c => 
                        c.id === groupInfo.id ? {...c, ...groupInfo} : c
                    );
                    mainFrame.contentWindow.setData('chatContacts', updatedContacts);
                    console.log('✅ 已同步到 chatContacts');
                    
                    // 验证是否同步成功
                    const verifyContacts = mainFrame.contentWindow.getData('chatContacts');
                    const verifiedContact = verifyContacts.find(c => c.id === groupInfo.id);
                    console.log(' 验证 chatContacts 数据:', verifiedContact ? verifiedContact.memberTitles : '未找到');
                }
            } else {
                console.warn('️ 无法访问 iframe');
            }
        } catch (e) {
            console.error('❌ 同步到 iframe 失败:', e);
            console.error('  - 错误堆栈:', e.stack);
        }
        
        // 同步到 localStorage
        try {
            console.log('🔄 尝试同步到 localStorage...');
            const currentPersona = localStorage.getItem('currentPersona') || 'default';
                    
            // 1. 更新 chatGroupChats（群聊列表）
            const groupChatsKey = `persona_${currentPersona}_chatGroupChats`;
            const groupChats = JSON.parse(localStorage.getItem(groupChatsKey) || '[]');
            console.log('  - 同步前 groupChats:', groupChats.length, '个群聊');
            console.log('  - 当前群聊 ID:', groupInfo.id);
                    
            // 查找当前群聊
            const existingGroupIndex = groupChats.findIndex(g => g.id === groupInfo.id);
            console.log('  - 找到群聊索引:', existingGroupIndex);
                    
            if (existingGroupIndex >= 0) {
                console.log('  - 更新前的 memberTitles:', groupChats[existingGroupIndex].memberTitles);
                groupChats[existingGroupIndex] = groupInfo;
                console.log('  - 更新后的 memberTitles:', groupChats[existingGroupIndex].memberTitles);
            } else {
                console.warn('⚠️ 未找到群聊，添加新群聊');
                groupChats.push(groupInfo);
            }
                    
            localStorage.setItem(groupChatsKey, JSON.stringify(groupChats));
            console.log('✅ 已同步到 chatGroupChats');
                    
            // 验证 chatGroupChats 数据
            const verifyData = JSON.parse(localStorage.getItem(groupChatsKey) || '[]');
            const verifiedGroup = verifyData.find(g => g.id === groupInfo.id);
            console.log('🔍 验证 chatGroupChats 数据:', verifiedGroup ? verifiedGroup.memberTitles : '未找到');
                    
            // 2. 更新 chatContacts（联系人列表 - 包含群聊）
            const contactsKey = `persona_${currentPersona}_chatContacts`;
            const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
            console.log('  - 同步前 contacts:', contacts.length, '个联系人');
                    
            const existingContactIndex = contacts.findIndex(c => c.id === groupInfo.id);
            console.log('  - 找到联系人索引:', existingContactIndex);
                    
            if (existingContactIndex >= 0) {
                console.log('  - 更新前的 contact memberTitles:', contacts[existingContactIndex].memberTitles);
                contacts[existingContactIndex] = {...contacts[existingContactIndex], ...groupInfo};
                console.log('  - 更新后的 contact memberTitles:', contacts[existingContactIndex].memberTitles);
            } else {
                console.warn('️ 未找到联系人');
            }
                    
            localStorage.setItem(contactsKey, JSON.stringify(contacts));
            console.log('✅ 已同步到 chatContacts');
                    
            // 验证 chatContacts 数据
            const verifyContacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
            const verifiedContact = verifyContacts.find(c => c.id === groupInfo.id);
            console.log('🔍 验证 chatContacts 数据:', verifiedContact ? verifiedContact.memberTitles : '未找到');
        } catch (e) {
            console.error('❌ 同步到 localStorage 失败:', e);
            console.error('  - 错误堆栈:', e.stack);
        }
        
        // 关闭弹窗
        closeTitleModal();
        
        // 刷新成员列表
        renderGroupMembersList(groupInfo);
        
        showToast(`已为 ${memberName} 设置称号：${newTitle}`);
        console.log('✅ 称号设置完成');
        
    } catch (e) {
        console.error('设置称号失败:', e);
        showToast('设置称号失败: ' + e.message);
    }
};

// 移除成员称号
window.removeMemberTitle = function(memberId, memberName) {
    try {
        const groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
        if (!groupInfo.id) {
            showToast('未找到群聊信息');
            return;
        }
        
        // 确认对话框
        if (!confirm(`确定要移除 ${memberName} 的称号吗？`)) {
            return;
        }
        
        // 移除称号
        if (groupInfo.memberTitles) {
            delete groupInfo.memberTitles[memberId];
        }
        
        // 保存到 sessionStorage
        sessionStorage.setItem('currentGroupChat', JSON.stringify(groupInfo));
        
        // 更新主界面的通讯录数据
        const mainFrame = document.querySelector('iframe');
        if (mainFrame && mainFrame.contentWindow) {
            const contacts = mainFrame.contentWindow.getData('chatContacts') || [];
            const groupIndex = contacts.findIndex(c => c.id === groupInfo.id);
            if (groupIndex !== -1) {
                contacts[groupIndex].memberTitles = groupInfo.memberTitles;
                mainFrame.contentWindow.saveData('chatContacts', contacts);
            }
        }
        
        // 同时更新 localStorage
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        const group = contacts.find(c => c.id === groupInfo.id);
        if (group) {
            group.memberTitles = groupInfo.memberTitles;
            localStorage.setItem(contactsKey, JSON.stringify(contacts));
        }
        
        closeTitleSelectModal();
        
        // 重新渲染群成员列表
        renderGroupMembersList(groupInfo);
        
        showToast(`已移除 ${memberName} 的头衔`);
        console.log('✅ 已移除头衔:', memberId);
    } catch (e) {
        console.error('移除头衔失败:', e);
        showToast('操作失败: ' + e.message);
    }
};

// 设置为管理员
window.setMemberAsAdmin = function(memberId, memberName) {
    try {
        const groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
        if (!groupInfo.id) {
            showToast('未找到群聊信息');
            return;
        }
        
        console.log(' 设置管理员:', { memberId, memberName });
        console.log(' 当前 admins:', groupInfo.admins);
        
        // 添加管理员
        if (!groupInfo.admins) {
            groupInfo.admins = [];
        }
        
        if (!groupInfo.admins.includes(memberId)) {
            groupInfo.admins.push(memberId);
        }
        
        console.log(' 更新后 admins:', groupInfo.admins);
        
        // 保存到 sessionStorage
        sessionStorage.setItem('currentGroupChat', JSON.stringify(groupInfo));
        console.log('✅ 已保存到 sessionStorage');
        
        // 同时更新 chatContacts 和 chatGroupChats
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        
        // 1. 更新 chatContacts（联系人列表）
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        const contactIndex = contacts.findIndex(c => c.id === groupInfo.id);
        if (contactIndex !== -1) {
            contacts[contactIndex].admins = groupInfo.admins;
            localStorage.setItem(contactsKey, JSON.stringify(contacts));
            console.log('✅ 已更新 chatContacts');
        }
        
        // 2. 更新 chatGroupChats（群聊列表）
        const groupChatsKey = `persona_${currentPersona}_chatGroupChats`;
        const groupChats = JSON.parse(localStorage.getItem(groupChatsKey) || '[]');
        const groupIndex = groupChats.findIndex(g => g.id === groupInfo.id);
        if (groupIndex !== -1) {
            groupChats[groupIndex].admins = groupInfo.admins;
            localStorage.setItem(groupChatsKey, JSON.stringify(groupChats));
            console.log('✅ 已更新 chatGroupChats');
        }
        
        // 3. 尝试更新 iframe（如果存在）
        try {
            const mainFrame = document.querySelector('iframe');
            if (mainFrame && mainFrame.contentWindow) {
                // 更新 chatContacts
                const iframeContacts = mainFrame.contentWindow.getData('chatContacts') || [];
                const iframeContactIndex = iframeContacts.findIndex(c => c.id === groupInfo.id);
                if (iframeContactIndex !== -1) {
                    iframeContacts[iframeContactIndex].admins = groupInfo.admins;
                    mainFrame.contentWindow.saveData('chatContacts', iframeContacts);
                    console.log('✅ 已同步 iframe chatContacts');
                }
                
                // 更新 chatGroupChats
                const iframeGroupChats = mainFrame.contentWindow.getData('chatGroupChats') || [];
                const iframeGroupIndex = iframeGroupChats.findIndex(g => g.id === groupInfo.id);
                if (iframeGroupIndex !== -1) {
                    iframeGroupChats[iframeGroupIndex].admins = groupInfo.admins;
                    mainFrame.contentWindow.setData('chatGroupChats', iframeGroupChats);
                    console.log('✅ 已同步 iframe chatGroupChats');
                }
            }
        } catch (e) {
            console.warn('⚠️ 同步到 iframe 失败:', e);
        }
        
        closeMemberManageMenu();
        renderGroupMembersList(groupInfo);
        showToast(`已将 ${memberName} 设为管理员`);
        console.log('✅ 管理员设置完成');
    } catch (e) {
        console.error('❌ 设置管理员失败:', e);
        showToast('操作失败: ' + e.message);
    }
};

// 取消管理员
window.removeMemberAdmin = function(memberId, memberName) {
    try {
        const groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
        if (!groupInfo.id) {
            showToast('未找到群聊信息');
            return;
        }
        
        console.log(' 取消管理员:', { memberId, memberName });
        console.log(' 当前 admins:', groupInfo.admins);
        
        // 移除管理员
        if (groupInfo.admins) {
            groupInfo.admins = groupInfo.admins.filter(id => id !== memberId);
        }
        
        console.log(' 更新后 admins:', groupInfo.admins);
        
        // 保存到 sessionStorage
        sessionStorage.setItem('currentGroupChat', JSON.stringify(groupInfo));
        console.log('✅ 已保存到 sessionStorage');
        
        // 同时更新 chatContacts 和 chatGroupChats
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        
        // 1. 更新 chatContacts（联系人列表）
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        const contactIndex = contacts.findIndex(c => c.id === groupInfo.id);
        if (contactIndex !== -1) {
            contacts[contactIndex].admins = groupInfo.admins;
            localStorage.setItem(contactsKey, JSON.stringify(contacts));
            console.log('✅ 已更新 chatContacts');
        }
        
        // 2. 更新 chatGroupChats（群聊列表）
        const groupChatsKey = `persona_${currentPersona}_chatGroupChats`;
        const groupChats = JSON.parse(localStorage.getItem(groupChatsKey) || '[]');
        const groupIndex = groupChats.findIndex(g => g.id === groupInfo.id);
        if (groupIndex !== -1) {
            groupChats[groupIndex].admins = groupInfo.admins;
            localStorage.setItem(groupChatsKey, JSON.stringify(groupChats));
            console.log('✅ 已更新 chatGroupChats');
        }
        
        // 3. 尝试更新 iframe（如果存在）
        try {
            const mainFrame = document.querySelector('iframe');
            if (mainFrame && mainFrame.contentWindow) {
                // 更新 chatContacts
                const iframeContacts = mainFrame.contentWindow.getData('chatContacts') || [];
                const iframeContactIndex = iframeContacts.findIndex(c => c.id === groupInfo.id);
                if (iframeContactIndex !== -1) {
                    iframeContacts[iframeContactIndex].admins = groupInfo.admins;
                    mainFrame.contentWindow.saveData('chatContacts', iframeContacts);
                    console.log('✅ 已同步 iframe chatContacts');
                }
                
                // 更新 chatGroupChats
                const iframeGroupChats = mainFrame.contentWindow.getData('chatGroupChats') || [];
                const iframeGroupIndex = iframeGroupChats.findIndex(g => g.id === groupInfo.id);
                if (iframeGroupIndex !== -1) {
                    iframeGroupChats[iframeGroupIndex].admins = groupInfo.admins;
                    mainFrame.contentWindow.setData('chatGroupChats', iframeGroupChats);
                    console.log('✅ 已同步 iframe chatGroupChats');
                }
            }
        } catch (e) {
            console.warn('⚠️ 同步到 iframe 失败:', e);
        }
        
        closeMemberManageMenu();
        renderGroupMembersList(groupInfo);
        showToast(`已取消 ${memberName} 的管理员身份`);
        console.log('✅ 管理员取消完成');
    } catch (e) {
        console.error(' 取消管理员失败:', e);
        showToast('操作失败: ' + e.message);
    }
};

// 移交群主
window.transferGroupOwner = function(memberId, memberName) {
    try {
        const groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
        if (!groupInfo.id) {
            showToast('未找到群聊信息');
            return;
        }
        
        // 确认对话框
        if (!confirm(`确定要将群主移交给 "${memberName}" 吗？\n\n移交后，你将不再是群主。`)) {
            return;
        }
        
        // 获取当前群主ID
        const oldOwnerId = groupInfo.owner;
        
        // 更新群主
        groupInfo.owner = memberId;
        
        // 从管理员列表中移除新群主（如果之前是管理员）
        if (groupInfo.admins) {
            groupInfo.admins = groupInfo.admins.filter(id => id !== memberId);
        }
        
        // 将旧群主设为管理员
        if (!groupInfo.admins) {
            groupInfo.admins = [];
        }
        if (!groupInfo.admins.includes(oldOwnerId)) {
            groupInfo.admins.push(oldOwnerId);
        }
        
        // 保存到 sessionStorage
        sessionStorage.setItem('currentGroupChat', JSON.stringify(groupInfo));
        
        // 更新主界面的通讯录数据
        const mainFrame = document.querySelector('iframe');
        if (mainFrame && mainFrame.contentWindow) {
            const contacts = mainFrame.contentWindow.getData('chatContacts') || [];
            const groupIndex = contacts.findIndex(c => c.id === groupInfo.id);
            if (groupIndex !== -1) {
                contacts[groupIndex].owner = memberId;
                contacts[groupIndex].admins = groupInfo.admins;
                mainFrame.contentWindow.saveData('chatContacts', contacts);
            }
        }
        
        // 同时更新 localStorage
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        const group = contacts.find(c => c.id === groupInfo.id);
        if (group) {
            group.owner = memberId;
            group.admins = groupInfo.admins;
            localStorage.setItem(contactsKey, JSON.stringify(contacts));
        }
        
        closeMemberManageMenu();
        renderGroupMembersList(groupInfo);
        showToast(`已将群主移交给 ${memberName}`);
        console.log('✅ 已移交群主:', { oldOwnerId, newOwnerId: memberId });
    } catch (e) {
        console.error('移交群主失败:', e);
        showToast('操作失败: ' + e.message);
    }
};

// ========== 群聊公告管理 ==========

// 显示群公告栏
function showGroupAnnouncementBar(announcement) {
    const bar = document.getElementById('group-announcement-bar');
    const text = document.getElementById('announcement-bar-text');
    if (!bar || !text) return;
    
    if (announcement && announcement.trim()) {
        text.textContent = announcement.trim();
        bar.style.display = 'block';
    } else {
        bar.style.display = 'none';
    }
}

// 保存群公告
window.saveGroupAnnouncement = function() {
    try {
        const announcement = document.getElementById('settings-group-announcement').value.trim();
        
        // 从 sessionStorage 获取当前群聊信息
        const groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
        if (!groupInfo.id) {
            showToast('未找到群聊信息');
            return;
        }
        
        // 更新群聊信息
        groupInfo.announcement = announcement;
        sessionStorage.setItem('currentGroupChat', JSON.stringify(groupInfo));
        
        // 更新主界面的通讯录数据
        const mainFrame = document.querySelector('iframe');
        if (mainFrame && mainFrame.contentWindow) {
            const contacts = mainFrame.contentWindow.getData('chatContacts') || [];
            const groupIndex = contacts.findIndex(c => c.id === groupInfo.id);
            if (groupIndex !== -1) {
                contacts[groupIndex].announcement = announcement;
                mainFrame.contentWindow.saveData('chatContacts', contacts);
            }
        }
        
        // 同时更新 localStorage
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        const group = contacts.find(c => c.id === groupInfo.id);
        if (group) {
            group.announcement = announcement;
            localStorage.setItem(contactsKey, JSON.stringify(contacts));
        }
        
        // 更新群公告栏显示
        showGroupAnnouncementBar(announcement);
        
        showToast('群公告已保存');
    } catch (e) {
        console.error('保存群公告失败:', e);
        showToast('保存失败: ' + e.message);
    }
};

// 移除群公告
window.removeGroupAnnouncement = function() {
    try {
        // 从 sessionStorage 获取当前群聊信息
        const groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
        if (!groupInfo.id) {
            showToast('未找到群聊信息');
            return;
        }
        
        // 清除群公告
        groupInfo.announcement = '';
        sessionStorage.setItem('currentGroupChat', JSON.stringify(groupInfo));
        
        // 更新主界面的通讯录数据
        const mainFrame = document.querySelector('iframe');
        if (mainFrame && mainFrame.contentWindow) {
            const contacts = mainFrame.contentWindow.getData('chatContacts') || [];
            const groupIndex = contacts.findIndex(c => c.id === groupInfo.id);
            if (groupIndex !== -1) {
                contacts[groupIndex].announcement = '';
                mainFrame.contentWindow.saveData('chatContacts', contacts);
            }
        }
        
        // 同时更新 localStorage
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        const group = contacts.find(c => c.id === groupInfo.id);
        if (group) {
            group.announcement = '';
            localStorage.setItem(contactsKey, JSON.stringify(contacts));
        }
        
        // 清空输入框
        document.getElementById('settings-group-announcement').value = '';
        
        // 隐藏群公告栏
        showGroupAnnouncementBar('');
        
        showToast('群公告已移除');
    } catch (e) {
        console.error('移除群公告失败:', e);
        showToast('移除失败: ' + e.message);
    }
};

// 显示群公告详情（点击公告栏时）
window.showAnnouncementDetail = function() {
    const groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
    const announcement = groupInfo.announcement || '';
    if (announcement.trim()) {
        // 创建一个简单的弹窗显示完整公告
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 20px;
            max-width: 80%;
            max-height: 60vh;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        `;
        
        modal.innerHTML = `
            <h3 style="font-size: 16px; font-weight: 600; color: #333; margin-bottom: 12px;">群公告</h3>
            <div style="font-size: 14px; color: #666; line-height: 1.6; white-space: pre-wrap;">${announcement}</div>
            <button onclick="this.closest('div[style*="fixed"]').remove()" style="margin-top: 16px; padding: 8px 20px; background: #007AFF; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; width: 100%;">关闭</button>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        overlay.onclick = function(e) {
            if (e.target === overlay) {
                overlay.remove();
            }
        };
    }
};

// ========== 群聊头像管理 ==========

// 更新群聊头像预览
function updateGroupAvatarPreview(avatar) {
    const preview = document.getElementById('settings-group-avatar-preview');
    if (!preview) return;
    
    if (!avatar || avatar === '👥') {
        // 默认 SVG 图标
        preview.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5">
            <circle cx="9" cy="7" r="4"/>
            <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
            <circle cx="17" cy="7" r="3"/>
            <path d="M21 21v-1.5a3 3 0 0 0-2-2.83"/>
        </svg>`;
    } else if (typeof avatar === 'string' && (avatar.startsWith('http') || avatar.startsWith('data:'))) {
        preview.innerHTML = `<img src="${avatar}" alt="" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
        // 兜底：默认 SVG
        preview.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5">
            <circle cx="9" cy="7" r="4"/>
            <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
            <circle cx="17" cy="7" r="3"/>
            <path d="M21 21v-1.5a3 3 0 0 0-2-2.83"/>
        </svg>`;
    }
}

// 点击上传按钮
window.uploadGroupAvatar = function() {
    const input = document.getElementById('group-avatar-input');
    if (input) {
        input.click();
    }
};

// 处理头像上传
window.handleGroupAvatarUpload = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        showToast('请选择图片文件');
        return;
    }
    
    // 检查文件大小（5MB限制）
    if (file.size > 5 * 1024 * 1024) {
        showToast('图片大小不能超过5MB');
        return;
    }
    
    // 读取文件
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        saveGroupAvatar(imageData);
    };
    reader.readAsDataURL(file);
};

// 保存群聊头像
function saveGroupAvatar(avatar) {
    try {
        // 从 sessionStorage 获取群聊信息
        let groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
        if (!groupInfo.id) {
            showToast('未找到群聊信息');
            return;
        }
        
        // 更新群聊头像
        groupInfo.avatar = avatar;
        sessionStorage.setItem('currentGroupChat', JSON.stringify(groupInfo));
        
        // 更新预览
        updateGroupAvatarPreview(avatar);
        
        // 立即更新顶部栏的群聊头像（重要：让用户看到即时变化）
        const groupAvatarHeader = document.getElementById('group-avatar-header');
        const groupAvatarsList = document.getElementById('group-avatars');
        console.log('🔄 尝试更新顶部栏头像:', avatar.substring(0, 50) + '...');
        if (groupAvatarHeader && avatar && typeof avatar === 'string' && 
            (avatar.startsWith('http') || avatar.startsWith('data:'))) {
            groupAvatarHeader.innerHTML = `<img src="${avatar}" alt="" style="width: 100%; height: 100%; object-fit: cover;">`;
            groupAvatarHeader.style.display = 'block';
            if (groupAvatarsList) {
                groupAvatarsList.style.display = 'none';
            }
            console.log('✓ 顶部栏群聊头像已即时更新');
        } else {
            console.log('⚠ 顶部栏头像更新条件不满足:', {
                hasGroupAvatarHeader: !!groupAvatarHeader,
                hasAvatar: !!avatar,
                isString: typeof avatar === 'string',
                startsWithHttp: avatar && typeof avatar === 'string' ? avatar.startsWith('http') : false,
                startsWithData: avatar && typeof avatar === 'string' ? avatar.startsWith('data:') : false
            });
        }
        
        // 更新主页面中的联系人数据
        updateContactAvatarInMainPage(groupInfo.id, avatar);
        
        // 同时更新 localStorage 中的群聊数据（重要：防止刷新后丢失）
        try {
            const currentPersona = localStorage.getItem('currentPersona') || 'default';
            const contactsKey = `persona_${currentPersona}_chatContacts`;
            const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
            const group = contacts.find(c => c.id === groupInfo.id);
            if (group) {
                group.avatar = avatar;
                localStorage.setItem(contactsKey, JSON.stringify(contacts));
                console.log('✓ localStorage 中的群聊头像已更新');
            }
            
            // 同时更新 chatConversations
            const conversationsKey = `persona_${currentPersona}_chatConversations`;
            const conversations = JSON.parse(localStorage.getItem(conversationsKey) || '[]');
            const conv = conversations.find(c => c.id === groupInfo.id);
            if (conv) {
                conv.avatar = avatar;
                localStorage.setItem(conversationsKey, JSON.stringify(conversations));
                console.log('✓ localStorage 中的会话头像已更新');
            }
        } catch (e) {
            console.error('更新 localStorage 失败:', e);
        }
        
        showToast('群聊头像已更新');
    } catch (e) {
        console.error('保存群聊头像失败:', e);
        showToast('保存失败: ' + e.message);
    }
}

// 更新主页面中的联系人头像
function updateContactAvatarInMainPage(groupId, avatar) {
    try {
        const mainFrame = document.querySelector('iframe');
        if (mainFrame && mainFrame.contentWindow) {
            // 更新 chatContacts
            const contacts = mainFrame.contentWindow.getData('chatContacts') || [];
            const group = contacts.find(c => c.id === groupId);
            if (group) {
                group.avatar = avatar;
                mainFrame.contentWindow.saveData('chatContacts', contacts);
                console.log('✓ 主页面 chatContacts 头像已更新');
            }
            
            // 同时更新 chatConversations（消息列表使用的是这个）
            const conversations = mainFrame.contentWindow.getData('chatConversations') || [];
            const conv = conversations.find(c => c.id === groupId);
            if (conv) {
                conv.avatar = avatar;
                mainFrame.contentWindow.saveData('chatConversations', conversations);
                console.log('✓ 主页面 chatConversations 头像已更新');
            }
        }
        
        // 同时更新 localStorage
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        const group = contacts.find(c => c.id === groupId);
        if (group) {
            group.avatar = avatar;
            localStorage.setItem(contactsKey, JSON.stringify(contacts));
            console.log('✓ localStorage chatContacts 头像已更新');
        }
        
        // 更新 localStorage 中的 chatConversations
        const conversationsKey = `persona_${currentPersona}_chatConversations`;
        const conversations = JSON.parse(localStorage.getItem(conversationsKey) || '[]');
        const conv = conversations.find(c => c.id === groupId);
        if (conv) {
            conv.avatar = avatar;
            localStorage.setItem(conversationsKey, JSON.stringify(conversations));
            console.log('✓ localStorage chatConversations 头像已更新');
        }
    } catch (e) {
        console.warn('更新主页面联系人头像失败:', e);
    }
}

// 清除群聊头像
window.clearGroupAvatar = function() {
    try {
        let groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
        if (!groupInfo.id) {
            showToast('未找到群聊信息');
            return;
        }
        
        // 清除头像（设置为默认值）
        groupInfo.avatar = '';
        sessionStorage.setItem('currentGroupChat', JSON.stringify(groupInfo));
        
        // 更新预览
        updateGroupAvatarPreview('');
        
        // 更新主页面中的联系人数据
        updateContactAvatarInMainPage(groupInfo.id, '');
        
        showToast('群聊头像已清除');
    } catch (e) {
        console.error('清除群聊头像失败:', e);
        showToast('清除失败: ' + e.message);
    }
};

// 应用URL头像
window.applyGroupAvatarUrl = function() {
    try {
        const urlInput = document.getElementById('group-avatar-url-input');
        const url = urlInput ? urlInput.value.trim() : '';
        
        if (!url) {
            showToast('请输入头像URL');
            return;
        }
        
        // 验证URL格式
        try {
            new URL(url);
        } catch (e) {
            showToast('请输入有效的URL地址');
            return;
        }
        
        let groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
        if (!groupInfo.id) {
            showToast('未找到群聊信息');
            return;
        }
        
        // 设置头像URL
        groupInfo.avatar = url;
        sessionStorage.setItem('currentGroupChat', JSON.stringify(groupInfo));
        
        // 更新预览
        updateGroupAvatarPreview(url);
        
        // 立即更新顶部栏的群聊头像（重要：让用户看到即时变化）
        const groupAvatarHeader = document.getElementById('group-avatar-header');
        const groupAvatarsList = document.getElementById('group-avatars');
        console.log('🔄 尝试更新顶部栏头像:', url.substring(0, 50) + '...');
        if (groupAvatarHeader && url && typeof url === 'string' && 
            (url.startsWith('http') || url.startsWith('data:'))) {
            groupAvatarHeader.innerHTML = `<img src="${url}" alt="" style="width: 100%; height: 100%; object-fit: cover;">`;
            groupAvatarHeader.style.display = 'block';
            if (groupAvatarsList) {
                groupAvatarsList.style.display = 'none';
            }
            console.log('✓ 顶部栏群聊头像已即时更新');
        } else {
            console.log('⚠ 顶部栏头像更新条件不满足:', {
                hasGroupAvatarHeader: !!groupAvatarHeader,
                hasUrl: !!url,
                isString: typeof url === 'string',
                startsWithHttp: url && typeof url === 'string' ? url.startsWith('http') : false,
                startsWithData: url && typeof url === 'string' ? url.startsWith('data:') : false
            });
        }
        
        // 更新主页面中的联系人数据
        updateContactAvatarInMainPage(groupInfo.id, url);
        
        // 清空输入框
        if (urlInput) {
            urlInput.value = '';
        }
        
        showToast('群聊头像已更新');
    } catch (e) {
        console.error('应用URL头像失败:', e);
        showToast('应用失败: ' + e.message);
    }
};

// 加载单聊设置（原有的逻辑）
function loadSingleChatSettings(chatKey) {
    const chatId = currentChatId;
    
    console.log('===== 开始加载单聊设置 =====');
    console.log('当前聊天 ID:', chatId);
    
    // 获取角色信息
    const roleInfo = JSON.parse(localStorage.getItem(chatKey) || '{}');
    
    // 获取通讯录中的角色信息 (直接从 localStorage 读取，带人设前缀)
    let contacts = [];
    
    try {
        // 尝试读取带人设前缀的数据
        const personaId = localStorage.getItem('currentPersonaId') || 'default';
        const contactsKey = `persona_${personaId}_chatContacts`;
        contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        
        console.log('从 localStorage 读取联系人:', contactsKey);
        console.log('联系人总数:', contacts.length);
        console.log('联系人列表:', contacts);
        
        // 如果没有找到，尝试读取旧的 'chats' 键
        if (contacts.length === 0) {
            const oldChats = JSON.parse(localStorage.getItem('chats') || '[]');
            if (oldChats.length > 0) {
                contacts = oldChats;
                console.log('使用旧的 chats 键:', contacts);
            }
        }
    } catch (error) {
        console.error('读取联系人失败:', error);
        contacts = [];
    }
    
    const currentChat = contacts.find(c => c.id === chatId) || {};
    
    console.log('\n===== 数据对比 =====');
    console.log('通讯录联系人总数:', contacts.length);
    console.log('当前聊天对象 ID:', currentChat.id);
    console.log('当前聊天对象 name:', currentChat.name);
    console.log('当前聊天对象 info:', currentChat.info);
    console.log('当前聊天对象 persona:', currentChat.persona);
    console.log('当前聊天对象 setting:', currentChat.setting);
    console.log('当前聊天对象 roleSetting:', currentChat.roleSetting);
    console.log('聊天配置 roleSetting:', roleInfo.roleSetting);
    console.log('===================\n');
    
    // 填充角色信息
    document.getElementById('settings-role-avatar').src = currentChat.avatar || getAIAvatar() || '';
    document.getElementById('settings-role-name').value = currentChat.name || getAIName() || '';
    
    // 优先使用聊天配置中的备注，如果没有则使用通讯录中的 info 字段
    const chatRemark = roleInfo.chatRemark || currentChat.info || currentChat.remark || '';
    document.getElementById('settings-chat-remark').value = chatRemark;
    
    // 优先使用聊天配置中的角色设定，如果没有则使用通讯录中的 persona 字段
    const roleSetting = roleInfo.roleSetting || currentChat.persona || currentChat.setting || '';
    document.getElementById('settings-role-setting').value = roleSetting;
    
    console.log('✓ 填充完成:');
    console.log('- 角色设定:', roleSetting);
    console.log('- 聊天备注:', chatRemark);
    console.log('===========================');
    
    // 加载表情包分类下拉框
    loadSettingsEmojiCategories();
    
    // 填充消息设置
    const autoMessageEnabled = roleInfo.autoMessageEnabled || false;
    document.getElementById('settings-auto-message').checked = autoMessageEnabled;
    document.getElementById('auto-message-interval-container').style.display = autoMessageEnabled ? 'block' : 'none';
    document.getElementById('settings-auto-message-interval').value = roleInfo.autoMessageInterval || 5;
    
    // 填充角色反向查手机设置
    const checkPhoneEnabled = roleInfo.checkPhoneEnabled || false;
    document.getElementById('settings-check-phone').checked = checkPhoneEnabled;
    document.getElementById('check-phone-interval-container').style.display = checkPhoneEnabled ? 'block' : 'none';
    document.getElementById('check-phone-mode-container').style.display = checkPhoneEnabled ? 'block' : 'none';
    document.getElementById('settings-check-phone-interval').value = roleInfo.checkPhoneInterval || 30;
    
    // 设置查手机模式
    const checkPhoneMode = roleInfo.checkPhoneMode || 'transparent';
    setCheckPhoneMode(checkPhoneMode);
    
    // 填充密码
    document.getElementById('settings-check-phone-password').value = roleInfo.checkPhonePassword || '';
    
    // 显示授权状态
    if (checkPhoneMode === 'password') {
        const savedAuth = localStorage.getItem(`check_phone_auth_${chatId}`);
        updateAuthorizationUI(savedAuth === 'true');
    }
    
    // 启动查手机定时器（如果开启）
    startCheckPhoneTimer();
    
    // 填充时间感知和环境感知开关
    const timeAwarenessEnabled = roleInfo.timeAwareness || false;
    document.getElementById('settings-time-awareness').checked = timeAwarenessEnabled;
    
    const environmentAwarenessEnabled = roleInfo.environmentAwareness || false;
    document.getElementById('settings-environment-awareness').checked = environmentAwarenessEnabled;
    
    // 根据环境感知开关显示/隐藏地点输入框
    document.getElementById('environment-locations-container').style.display = environmentAwarenessEnabled ? 'block' : 'none';
    
    // 填充地点信息
    document.getElementById('settings-user-location').value = roleInfo.userLocation || '';
    document.getElementById('settings-ai-location').value = roleInfo.aiLocation || '';
    
    // 填充显示时间戳开关
    const showTimestampEnabled = roleInfo.showTimestamp || false;
    document.getElementById('settings-show-timestamp').checked = showTimestampEnabled;
    
    // 填充显示对话头像开关（注意：这里存储的是 hideAvatar，与 UI 相反）
    const showAvatarEnabled = roleInfo.showAvatar !== undefined ? roleInfo.showAvatar : true; // 默认开启（显示头像）
    document.getElementById('settings-show-avatar').checked = !showAvatarEnabled; // UI 上显示的是“隐藏”，所以取反
    
    // 填充显示token数开关
    const showTokenCountEnabled = roleInfo.showTokenCount || false;
    document.getElementById('settings-show-token-count').checked = showTokenCountEnabled;
    
    // 填充翻译模式开关
    const translationModeEnabled = roleInfo.translationMode || false;
    document.getElementById('settings-translation-mode').checked = translationModeEnabled;
    
    // 填充角色语言选择
    const characterLanguage = roleInfo.characterLanguage || 'zh'; // 默认中文
    document.getElementById('settings-character-language').value = characterLanguage;
    
    // 填充拍一拍后缀
    const patSuffix = roleInfo.patSuffix || '';
    document.getElementById('settings-pat-suffix').value = patSuffix;
    
    // 填充朋友圈更新频率
    const momentsFrequency = roleInfo.momentsFrequency || 0; // 默认关闭
    document.getElementById('settings-moments-frequency').value = momentsFrequency;
    
    // 填充心声功能设置
    const autoVoiceEnabled = roleInfo.autoVoiceEnabled !== undefined ? roleInfo.autoVoiceEnabled : true; // 默认开启
    document.getElementById('settings-auto-voice').checked = autoVoiceEnabled;
    document.getElementById('auto-voice-frequency-container').style.display = autoVoiceEnabled ? 'block' : 'none';
    
    const voiceFrequency = roleInfo.voiceFrequency || 'medium'; // 默认中频
    document.getElementById('settings-voice-frequency').value = voiceFrequency;
    
    // 填充心声样式自定义 CSS
    const voiceCss = roleInfo.voiceCss || '';
    document.getElementById('settings-voice-css').value = voiceCss;
    
    // 填充聊天背景
    const bgUrl = roleInfo.backgroundUrl || '';
    if (bgUrl) {
        document.getElementById('bg-preview').src = bgUrl;
        document.getElementById('bg-preview-container').style.display = 'block';
    } else {
        document.getElementById('bg-preview-container').style.display = 'none';
    }
    document.getElementById('settings-bg-url').value = bgUrl;
    
    // 填充气泡自定义 CSS
    const bubbleCss = roleInfo.bubbleCss || '';
    document.getElementById('settings-bubble-css').value = bubbleCss;
    
    // 🛠️ 填充界面自定义 CSS（统一版）
    const interfaceCss = roleInfo.interfaceCss || '';
    document.getElementById('settings-interface-css').value = interfaceCss;
    
    // 加载预设列表
    loadPresetSelect();
    
    // 填充记忆设置
    document.getElementById('settings-short-memory-count').value = roleInfo.shortMemoryCount || 20;
    const autoSummaryEnabled = roleInfo.autoSummaryEnabled || false;
    document.getElementById('settings-auto-summary').checked = autoSummaryEnabled;
    document.getElementById('auto-summary-count-container').style.display = autoSummaryEnabled ? 'block' : 'none';
    document.getElementById('settings-auto-summary-count').value = roleInfo.autoSummaryCount || 50;
    document.getElementById('auto-summary-length-container').style.display = autoSummaryEnabled ? 'block' : 'none';
    document.getElementById('settings-auto-summary-length').value = roleInfo.autoSummaryLength || 'medium';
    
    // 加载记忆记录
    loadMemoryRecords();
    
    // 加载头像形状设置
    const avatarShape = roleInfo.avatarShape || 'square';
    setAvatarShape(avatarShape);
    
    // 启动查手机定时器（如果开启）
    startCheckPhoneTimer();
}

// 保存聊天设置
window.saveChatSettings = function() {
    const chatId = currentChatId;
    const isGroupChat = chatId.startsWith('group_');
    
    if (isGroupChat) {
        // 保存群聊设置
        saveGroupChatSettings();
    } else {
        // 保存单聊设置
        saveSingleChatSettings();
    }
}

// 保存群聊设置
function saveGroupChatSettings() {
    try {
        const groupName = document.getElementById('settings-group-name').value.trim();
        const announcement = document.getElementById('settings-group-announcement').value.trim();
        const worldbookId = document.getElementById('settings-worldbook-select').value || null;
        
        if (!groupName) {
            showToast('请输入群聊名称');
            return;
        }
        
        // 从 sessionStorage 获取当前群聊信息
        const groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
        
        if (!groupInfo.id) {
            showToast('未找到群聊信息');
            return;
        }
        
        // 更新群聊信息
        groupInfo.name = groupName;
        groupInfo.announcement = announcement;
        groupInfo.worldbookId = worldbookId;
        
        // 保存头像形状设置
        groupInfo.avatarShape = getGroupAvatarShape();
        
        // 保存到 sessionStorage
        sessionStorage.setItem('currentGroupChat', JSON.stringify(groupInfo));
        
        // 更新主界面的通讯录数据
        const mainFrame = document.querySelector('iframe');
        if (mainFrame && mainFrame.contentWindow) {
            const contacts = mainFrame.contentWindow.getData('chatContacts') || [];
            const groupIndex = contacts.findIndex(c => c.id === groupInfo.id);
            
            if (groupIndex !== -1) {
                contacts[groupIndex].name = groupName;
                contacts[groupIndex].announcement = announcement;
                contacts[groupIndex].worldbookId = worldbookId;
                mainFrame.contentWindow.saveData('chatContacts', contacts);
                console.log('✓ 群聊信息已更新到主界面');
            }
        }
        
        // 更新页面标题
        document.getElementById('chat-title').textContent = groupName;
        
        closeChatSettings();
        showToast('群聊设置保存成功！');
        console.log('✓ 群聊设置保存成功');
    } catch (e) {
        console.error('保存群聊设置失败:', e);
        showToast('保存失败: ' + e.message);
    }
}

// 保存单聊设置
function saveSingleChatSettings() {
    const chatId = currentChatId;
    const chatKey = `chat_config_${chatId}`;
    
    console.log('💾 [saveSingleChatSettings] 开始保存配置:');
    console.log('   - chatId:', chatId);
    console.log('   - chatKey:', chatKey);
    
    // 获取当前配置
    const config = {
        chatId: chatId,
        chatRemark: document.getElementById('settings-chat-remark').value.trim(),
        roleSetting: document.getElementById('settings-role-setting').value.trim(),
        autoMessageEnabled: document.getElementById('settings-auto-message').checked,
        autoMessageInterval: parseInt(document.getElementById('settings-auto-message-interval').value) || 5,
        checkPhoneEnabled: document.getElementById('settings-check-phone').checked,
        checkPhoneInterval: parseInt(document.getElementById('settings-check-phone-interval').value) || 30,
        checkPhoneMode: document.querySelector('.check-phone-mode-btn.active')?.dataset.mode || 'transparent',
        checkPhonePassword: document.getElementById('settings-check-phone-password').value.trim(),
        timeAwareness: document.getElementById('settings-time-awareness').checked,
        environmentAwareness: document.getElementById('settings-environment-awareness').checked,
        userLocation: document.getElementById('settings-user-location').value.trim(),
        aiLocation: document.getElementById('settings-ai-location').value.trim(),
        showTimestamp: document.getElementById('settings-show-timestamp').checked,
        showAvatar: !document.getElementById('settings-show-avatar').checked, // UI 上是“隐藏”，所以取反存储为 showAvatar
        showTokenCount: document.getElementById('settings-show-token-count').checked, // 显示token数
        translationMode: document.getElementById('settings-translation-mode').checked,
        characterLanguage: document.getElementById('settings-character-language').value, // 角色语言
        patSuffix: document.getElementById('settings-pat-suffix').value.trim(), // 拍一拍后缀
        momentsFrequency: parseInt(document.getElementById('settings-moments-frequency').value) || 0, // 朋友圈更新频率（小时）
        autoVoiceEnabled: document.getElementById('settings-auto-voice').checked, // 自动心声开关
        voiceFrequency: document.getElementById('settings-voice-frequency').value || 'medium', // 心声触发频率
        voiceCss: document.getElementById('settings-voice-css').value.trim(), // 心声样式自定义 CSS
        backgroundUrl: document.getElementById('settings-bg-url').value.trim(),
        bubbleCss: document.getElementById('settings-bubble-css').value.trim(),
        interfaceCss: document.getElementById('settings-interface-css').value.trim(),
        headerCss: '',  // 不再单独保存，已合并到interfaceCss
        inputCss: '',   // 不再单独保存，已合并到interfaceCss
        shortMemoryCount: parseInt(document.getElementById('settings-short-memory-count').value) || 20,
        autoSummaryEnabled: document.getElementById('settings-auto-summary').checked,
        autoSummaryCount: parseInt(document.getElementById('settings-auto-summary-count').value) || 50,
        autoSummaryLength: document.getElementById('settings-auto-summary-length').value || 'medium',
        avatarShape: getAvatarShape(), // 头像形状
        emojiCategory: document.getElementById('settings-role-emoji-category').value, // 表情包分类
        updatedAt: Date.now()
    };
    
    console.log('   - interfaceCss 长度:', config.interfaceCss.length);
    console.log('   - interfaceCss 预览:', config.interfaceCss ? config.interfaceCss.substring(0, 100) + '...' : '空');
    
    // 保存到 localStorage
    localStorage.setItem(chatKey, JSON.stringify(config));
    console.log('✅ 聊天设置已保存:', {
        chatId: config.chatId,
        chatKey: chatKey,
        characterLanguage: config.characterLanguage,
        translationMode: config.translationMode,
        backgroundUrl: config.backgroundUrl ? '有背景' : '无背景',
        bubbleCss: config.bubbleCss ? `已设置 (${config.bubbleCss.length} 字符)` : '无',
        interfaceCss: config.interfaceCss ? `已设置 (${config.interfaceCss.length} 字符)` : '无'
    });
    console.log('📦 保存的完整 config:', config);
    
    // 获取新值 (提前声明，避免 catch 块外未定义)
    const newName = document.getElementById('settings-role-name').value.trim();
    const newRemark = document.getElementById('settings-chat-remark').value.trim();
    const newPersona = document.getElementById('settings-role-setting').value.trim();
    
    // 更新通讯录中的角色信息
    try {
        // 读取带人设前缀的联系人数据
        const personaId = localStorage.getItem('currentPersonaId') || 'default';
        const contactsKey = `persona_${personaId}_chatContacts`;
        let contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        
        const chatIndex = contacts.findIndex(c => c.id === chatId);
        
        if (chatIndex !== -1) {
            // 更新现有联系人
            if (newName) contacts[chatIndex].name = newName;
            if (newRemark) contacts[chatIndex].info = newRemark;
            if (newPersona) contacts[chatIndex].persona = newPersona;
            
            // 同步朋友圈更新频率和拍一拍后缀到 roleInfo
            if (!contacts[chatIndex].roleInfo) {
                contacts[chatIndex].roleInfo = {};
            }
            contacts[chatIndex].roleInfo.momentsFrequency = config.momentsFrequency;
            contacts[chatIndex].roleInfo.patSuffix = config.patSuffix || '';
            
            // 保存回 localStorage
            localStorage.setItem(contactsKey, JSON.stringify(contacts));
            console.log('✓ 通讯录已更新:', contactsKey);
        } else {
            // 创建新联系人
            const newContact = {
                id: chatId,
                name: newName || getAIName(),
                info: newRemark,
                persona: newPersona,
                avatar: getAIAvatar(),
                roleInfo: {
                    momentsFrequency: config.momentsFrequency,
                    patSuffix: config.patSuffix || ''
                }
            };
            contacts.push(newContact);
            localStorage.setItem(contactsKey, JSON.stringify(contacts));
            console.log('✓ 新联系人已创建:', contactsKey);
        }
    } catch (error) {
        console.error('更新通讯录失败:', error);
    }
    
    // 保存表情包分类绑定
    try {
        const emojiCategory = document.getElementById('settings-role-emoji-category').value;
        localStorage.setItem(`role_${chatId}_emoji_category`, emojiCategory);
        console.log('📸 表情包分类已保存:', emojiCategory ? `"${emojiCategory}"` : '未绑定');
    } catch (e) {
        console.error('保存表情包分类失败:', e);
    }
    
    console.log('✓ 聊天设置已保存:', config);
    showToast('设置已保存', 'success');
    
    // 关闭设置窗口
    closeChatSettings();
    
    // 更新页面标题
    const title = newName || getAIName();
    document.getElementById('chat-title').textContent = title;
    
    // 重新启动自动消息定时器 (应用新设置)
    startAutoMessageIfNeeded();
    
    // 重新启动查手机定时器 (应用新设置)
    startCheckPhoneTimer();
}

// 切换自动消息间隔显示
document.getElementById('settings-auto-message')?.addEventListener('change', function() {
    document.getElementById('auto-message-interval-container').style.display = this.checked ? 'block' : 'none';
});

// 切换查手机间隔显示
document.getElementById('settings-check-phone')?.addEventListener('change', function() {
    document.getElementById('check-phone-interval-container').style.display = this.checked ? 'block' : 'none';
    if (this.checked) {
        startCheckPhoneTimer();
    } else {
        stopCheckPhoneTimer();
    }
});

// 切换自动总结显示
document.getElementById('settings-auto-summary')?.addEventListener('change', function() {
    document.getElementById('auto-summary-count-container').style.display = this.checked ? 'block' : 'none';
});

// 切换环境感知地点输入框显示
document.getElementById('settings-environment-awareness')?.addEventListener('change', function() {
    document.getElementById('environment-locations-container').style.display = this.checked ? 'block' : 'none';
});

// 切换自动心声频率选择器显示
document.getElementById('settings-auto-voice')?.addEventListener('change', function() {
    document.getElementById('auto-voice-frequency-container').style.display = this.checked ? 'block' : 'none';
});

// 应用心声样式 CSS
window.applyVoiceCss = function() {
    const css = document.getElementById('settings-voice-css').value.trim();
    
    // 移除旧的样式标签
    const oldStyle = document.getElementById('custom-voice-style');
    if (oldStyle) {
        oldStyle.remove();
    }
    
    if (css) {
        // 创建新的样式标签
        const styleEl = document.createElement('style');
        styleEl.id = 'custom-voice-style';
        styleEl.type = 'text/css';
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
        
        console.log('✅ 心声样式 CSS 已应用');
        showToast('心声样式已应用');
    } else {
        console.log('✅ 心声样式 CSS 已清除');
        showToast('心声样式已清除');
    }
};

// 清除心声样式 CSS
window.clearVoiceCss = function() {
    document.getElementById('settings-voice-css').value = '';
    applyVoiceCss();
};

// 更换角色头像
window.changeRoleAvatar = function() {
    // 创建文件选择器
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // 检查文件大小 (限制 500KB)
        if (file.size > 500 * 1024) {
            showToast('图片大小不能超过 500KB', 'error');
            return;
        }
        
        // 读取并压缩图片
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const base64 = await compressImage(event.target.result, 200, 200, 0.7);
                
                // 更新头像显示
                document.getElementById('settings-role-avatar').src = base64;
                
                // 保存到 localStorage
                try {
                    const chatId = currentChatId;
                    const chats = JSON.parse(localStorage.getItem('chats') || '[]');
                    const chatIndex = chats.findIndex(c => c.id === chatId);
                    
                    if (chatIndex !== -1) {
                        chats[chatIndex].avatar = base64;
                        localStorage.setItem('chats', JSON.stringify(chats));
                        console.log('✓ 头像已保存');
                    } else {
                        // 如果当前聊天不在列表中，添加新条目
                        const newChat = {
                            id: chatId,
                            name: getAIName(),
                            avatar: base64
                        };
                        chats.push(newChat);
                        localStorage.setItem('chats', JSON.stringify(chats));
                        console.log('✓ 头像已保存 (新建)');
                    }
                    
                    showToast('头像已更换', 'success');
                } catch (error) {
                    console.error('保存头像失败:', error);
                    showToast('保存失败，请重试', 'error');
                }
            } catch (error) {
                console.error('图片压缩失败:', error);
                showToast('图片处理失败', 'error');
            }
        };
        
        reader.onerror = () => {
            console.error('读取图片失败');
            showToast('读取图片失败', 'error');
        };
        
        reader.readAsDataURL(file);
    };
    
    input.click();
};

// 设置单聊头像形状
window.setAvatarShape = function(shape) {
    const preview = document.getElementById('settings-role-avatar-preview');
    const squareBtn = document.getElementById('avatar-shape-square');
    const circleBtn = document.getElementById('avatar-shape-circle');
    
    if (shape === 'circle') {
        preview.style.borderRadius = '50%';
        circleBtn.style.background = '#007AFF';
        circleBtn.style.color = 'white';
        squareBtn.style.background = '#e0e0e0';
        squareBtn.style.color = '#333';
    } else {
        preview.style.borderRadius = '8px';
        squareBtn.style.background = '#007AFF';
        squareBtn.style.color = 'white';
        circleBtn.style.background = '#e0e0e0';
        circleBtn.style.color = '#333';
    }
};

// 设置群聊头像形状
window.setGroupAvatarShape = function(shape) {
    const preview = document.getElementById('settings-group-avatar-preview');
    const squareBtn = document.getElementById('group-avatar-shape-square');
    const circleBtn = document.getElementById('group-avatar-shape-circle');
    
    if (shape === 'circle') {
        preview.style.borderRadius = '50%';
        circleBtn.style.background = '#007AFF';
        circleBtn.style.color = 'white';
        squareBtn.style.background = '#e0e0e0';
        squareBtn.style.color = '#333';
    } else {
        preview.style.borderRadius = '8px';
        squareBtn.style.background = '#007AFF';
        squareBtn.style.color = 'white';
        circleBtn.style.background = '#e0e0e0';
        circleBtn.style.color = '#333';
    }
};

// 获取单聊头像形状
function getAvatarShape() {
    const preview = document.getElementById('settings-role-avatar-preview');
    if (!preview) return 'square';
    return preview.style.borderRadius === '50%' ? 'circle' : 'square';
}

// 获取群聊头像形状
function getGroupAvatarShape() {
    const preview = document.getElementById('settings-group-avatar-preview');
    if (!preview) return 'square';
    return preview.style.borderRadius === '50%' ? 'circle' : 'square';
}

// 压缩图片函数
async function compressImage(base64, maxWidth, maxHeight, quality) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            
            // 计算缩放比例
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // 转换为压缩后的 JPEG
            const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = base64;
    });
}

// 显示手动总结弹窗
window.showManualSummaryDialog = function() {
    document.getElementById('manual-summary-modal').style.display = 'block';
};

// 关闭手动总结弹窗
window.closeManualSummaryDialog = function() {
    document.getElementById('manual-summary-modal').style.display = 'none';
};

// 执行手动总结
window.executeManualSummary = function() {
    const count = parseInt(document.getElementById('manual-summary-count').value) || 50;
    console.log('执行手动总结，总结最近', count, '条消息');
    
    // 获取最近的聊天消息
    const recentMessages = chatMessages.slice(-count);
    
    if (recentMessages.length === 0) {
        showToast('暂无聊天消息可总结', 'error');
        closeManualSummaryDialog();
        return;
    }
    
    // 提取消息内容
    const messagesText = recentMessages.map(msg => {
        const sender = msg.sender === 'user' ? '你' : getAIName();
        return `${sender}: ${msg.content}`;
    }).join('\n');
    
    console.log('准备总结的消息:', messagesText.substring(0, 200) + '...');
    
    // 显示加载状态，禁用按钮
    const summaryModal = document.getElementById('manual-summary-modal');
    const confirmBtn = summaryModal.querySelector('button[onclick="executeManualSummary()"]');
    const originalText = confirmBtn.textContent;
    confirmBtn.textContent = '正在总结中...';
    confirmBtn.style.opacity = '0.6';
    confirmBtn.style.cursor = 'not-allowed';
    confirmBtn.disabled = true;
    
    showToast('正在总结中，请稍候...', 'info');
    
    // 调用 API 进行总结
    // 读取当前聊天的总结字数设置
    const chatKey = `chat_config_${currentChatId}`;
    const config = JSON.parse(localStorage.getItem(chatKey) || '{}');
    const summaryLength = config.autoSummaryLength || 'medium';
    
    callSummaryAPI(messagesText, count, summaryLength)
        .then(summary => {
            // 🛡️ 检查 API 返回是否为空
            if (!summary || !summary.trim()) {
                console.warn('⚠️ API 返回空内容，使用本地总结');
                const simpleSummary = `总结了最近 ${count} 条消息，共 ${recentMessages.length} 条。\n\n主要内容:\n${messagesText.substring(0, 500)}...`;
                addMemoryRecord(simpleSummary);
                showToast('总结已完成 (本地模式)', 'success');
            } else {
                // 保存总结到记忆记录库
                addMemoryRecord(summary.trim());
                console.log('✓ 总结完成:', summary.trim());
                showToast('总结已完成', 'success');
            }
            
            // 刷新记忆记录列表
            loadMemoryRecords();
            
            closeManualSummaryDialog();
        })
        .catch(error => {
            console.error('❌ 总结失败:', error);
            console.error('❌ 错误类型:', error.name);
            console.error('❌ 错误信息:', error.message);
            
            // 显示错误提示
            let errorMsg = '总结失败';
            if (error.message.includes('API')) {
                errorMsg = 'API调用失败，请检查API配置';
            } else if (error.message.includes('网络') || error.message.includes('fetch')) {
                errorMsg = '网络连接失败，请检查网络';
            }
            
            showToast(errorMsg, 'error');
            closeManualSummaryDialog();
        })
        .finally(() => {
            // 恢复按钮状态
            confirmBtn.textContent = originalText;
            confirmBtn.style.opacity = '1';
            confirmBtn.style.cursor = 'pointer';
            confirmBtn.disabled = false;
        });
};

// 调用总结 API
async function callSummaryAPI(messagesText, count, summaryLength = 'medium') {
    // 获取 API 配置
    let apiConfig = null;
    try {
        const globalConfig = JSON.parse(localStorage.getItem('globalApiConfig') || '{}');
        console.log('全局 API 配置:', globalConfig);
        if (globalConfig.mainApi && globalConfig.mainApi.url && globalConfig.mainApi.token) {
            apiConfig = globalConfig;
            console.log('使用 API 配置:', {
                url: apiConfig.mainApi.url,
                model: apiConfig.model || 'gpt-3.5-turbo',
                hasToken: !!apiConfig.mainApi.token
            });
        }
    } catch (e) {
        console.log('未找到全局 API 配置，使用本地总结');
        throw new Error('无 API 配置');
    }
    
    if (!apiConfig) {
        throw new Error('无 API 配置');
    }
    
    // 获取联系人名称（角色名称）
    let roleName = '角色';
    let characterLanguage = 'zh'; // 默认中文
    try {
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        const currentContact = contacts.find(c => c.id === currentChatId);
        if (currentContact) {
            roleName = currentContact.name || currentContact.remark || '角色';
            characterLanguage = currentContact.language || 'zh'; // 读取语言字段
        }
    } catch (e) {
        console.log('获取角色名称失败');
    }
    
    // 构建语言指令
    let languageInstruction = '';
    if (characterLanguage && characterLanguage !== 'zh') {
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
        const langName = languageNames[characterLanguage] || characterLanguage;
        // 双语模式：要求AI返回原文+翻译
        languageInstruction = `\n\n【语言和翻译要求】\n1. 你必须使用${langName}写这篇日记\n2. 写完后，在日记末尾换行，然后写"---"，再换行提供中文翻译\n3. 格式：原文（${langName}）\n---\n翻译（中文）\n4. 这是强制要求，必须提供翻译！`;
    }
    
    const summaryPrompt = `你是${roleName}，请根据以下聊天记录，以第一人称写一篇私人日记。

日记格式：
- 开头：日期（如：2026年4月23日 周四）
- 正文：用"我"称呼自己，用"ta"称呼对方
- 表达真实情感（开心/担心/思念/期待等）
- 记录主要事件和你的感受

字数：${summaryLength === 'short' ? '100字以内' : summaryLength === 'long' ? '400-500字' : '200-300字'}${languageInstruction}

聊天记录：
${messagesText}

请直接开始写日记，不要分析，不要解释：
${roleName}的日记：`;
    
    // 拼接正确的 API URL
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
    
    console.log('📝 记忆总结 API URL:', baseUrl);
    console.log('📝 角色名称:', roleName);
    console.log('📝 总结模式:', summaryLength);
    console.log('📝 完整 Prompt:', summaryPrompt);
    
    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiConfig.mainApi.token}`
        },
        body: JSON.stringify({
            model: (apiConfig.model || 'gpt-3.5-turbo').trim(),
            messages: [
                { role: 'system', content: '你是一个角色扮演助手。你要完全进入角色，以第一人称写日记。不要分析聊天记录，不要解释，直接写日记。只输出日记内容，不要有任何前言或后语。' },
                { role: 'user', content: summaryPrompt }
            ],
            max_tokens: summaryLength === 'short' ? 150 : summaryLength === 'long' ? 600 : 350,
            temperature: 0.8
        })
    });
    
    if (!response.ok) {
        const errorText = await response.text().catch(() => '无法获取错误详情');
        console.error('API 调用失败:', {
            status: response.status,
            statusText: response.statusText,
            url: apiConfig.mainApi.url,
            error: errorText
        });
        throw new Error(`API 调用失败: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('📊 API 完整响应:', JSON.stringify(data, null, 2));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('API 响应格式异常:', data);
        throw new Error('API 响应格式异常');
    }
    
    const message = data.choices[0].message;
    console.log('📝 API 返回消息对象:', message);
    
    // 🛡️ 兼容不同模型的响应格式：优先使用 content，如果为空则尝试 reasoning
    let content = message.content;
    
    // 如果 content 为 null/undefined，尝试从 reasoning 字段获取
    if (!content && message.reasoning) {
        console.log('📝 content 为空，尝试从 reasoning 字段提取内容');
        content = message.reasoning;
    }
    
    console.log('📝 最终提取的内容:', content);
    console.log('📝 内容类型:', typeof content);
    console.log('📝 内容是否为null:', content === null);
    
    if (!content) {
        console.error('⚠️ API 返回空内容');
        console.error('⚠️ 完整消息对象:', JSON.stringify(message, null, 2));
        throw new Error('API 返回空内容');
    }
    
    return content.trim();
}

// 加载记忆记录
function loadMemoryRecords() {
    // 🛡️ 记忆记录库已移至独立应用，此函数保留但不执行DOM操作
    // 如果需要在聊天设置中显示记忆数量，可以在这里添加逻辑
    const chatId = currentChatId;
    const memoryKey = `memory_records_${chatId}`;
    const records = JSON.parse(localStorage.getItem(memoryKey) || '[]');
    
    const container = document.getElementById('memory-records-list');
    const countElement = document.getElementById('memory-record-count');
    
    // 如果DOM元素存在，更新显示（兼容旧版本）
    if (container) {
        if (records.length === 0) {
            container.innerHTML = '<div style="color: #999; font-size: 13px; padding: 20px; text-align: center;">暂无记忆记录</div>';
        } else {
            let html = '';
            records.forEach((record, index) => {
                const time = new Date(record.createdAt);
                const dateStr = time.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
                const timeStr = time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
                
                const content = escapeHtml(record.summary);
                const previewContent = content.length > 100 ? content.substring(0, 100) + '...' : content;
                const needToggle = content.length > 100;
                
                html += `
                    <div style="padding: 14px; background: #f9f9f9; border-radius: 10px; margin-bottom: 10px; border-left: 3px solid #ccc;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div style="font-size: 12px; color: #999;">
                                <span style="margin-right: 8px;">📅 ${dateStr}</span>
                                <span>🕐 ${timeStr}</span>
                            </div>
                            <button onclick="deleteMemoryRecord(${index})" style="padding: 4px 10px; background: #f0f0f0; color: #999; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 500;">删除</button>
                        </div>
                        <div id="memory-content-${index}" style="font-size: 13px; color: #333; line-height: 1.7; white-space: pre-wrap;">
                            ${previewContent}
                        </div>
                        ${needToggle ? `<div onclick="toggleMemoryContent(${index})" id="memory-toggle-${index}" style="margin-top: 8px; font-size: 12px; color: #999; cursor: pointer; user-select: none; text-align: right;">展开 ▼</div>` : ''}
                    </div>
                `;
            });
            
            container.innerHTML = html;
        }
    }
    
    // 更新计数
    if (countElement) {
        countElement.textContent = records.length;
    }
}

// 切换记忆内容展开/折叠
window.toggleMemoryContent = function(index) {
    const contentEl = document.getElementById(`memory-content-${index}`);
    const toggleEl = document.getElementById(`memory-toggle-${index}`);
    
    if (!contentEl || !toggleEl) return;
    
    const memoryKey = `memory_records_${currentChatId}`;
    const records = JSON.parse(localStorage.getItem(memoryKey) || '[]');
    const record = records[index];
    
    if (!record) return;
    
    const content = escapeHtml(record.summary);
    const isExpanded = toggleEl.textContent.includes('收起');
    
    if (isExpanded) {
        // 折叠
        contentEl.textContent = content.substring(0, 100) + '...';
        toggleEl.textContent = '展开 ▼';
    } else {
        // 展开
        contentEl.textContent = content;
        toggleEl.textContent = '收起 ▲';
    }
};

// ========== 储存管理功能 ==========

// 清空聊天记录
window.clearChatMessages = function() {
    if (!confirm('确定要清空当前聊天的所有消息吗？此操作不可恢复。')) {
        return;
    }
    
    // 清空消息列表
    localStorage.removeItem(`chat_${currentChatId}`);
    chatMessages = [];
    
    // 重新渲染消息
    renderMessages();
    
    // 🛡️ 更新 UI：根据当前是群聊还是单聊，更新对应的元素
    const isGroupChat = currentChatId && currentChatId.startsWith('group_');
    const countElementId = isGroupChat ? 'chat-message-count-group' : 'chat-message-count-single';
    const countElement = document.getElementById(countElementId);
    if (countElement) {
        countElement.textContent = '0';
    }
    
    showToast('聊天记录已清空', 'success');
};

// 清空记忆记录
window.clearMemoryRecords = function() {
    if (!confirm('确定要清空所有记忆记录吗？此操作不可恢复。')) {
        return;
    }
    
    // 清空记忆记录
    localStorage.removeItem(`memory_records_${currentChatId}`);
    
    // 重新加载记忆列表
    loadMemoryRecords();
    
    showToast('记忆记录已清空', 'success');
};

// 清空所有聊天数据
window.clearAllChatData = function() {
    if (!confirm('⚠️ 警告：此操作将清空当前聊天的所有数据，包括：\n\n- 所有聊天消息\n- 所有记忆记录\n- 聊天设置\n\n确定要继续吗？此操作不可恢复！')) {
        return;
    }
    
    // 清空消息
    localStorage.removeItem(`chat_${currentChatId}`);
    chatMessages = [];
    
    // 清空记忆记录
    localStorage.removeItem(`memory_records_${currentChatId}`);
    
    // 清空聊天配置
    localStorage.removeItem(`chat_config_${currentChatId}`);
    
    // 重新渲染界面
    renderMessages();
    loadMemoryRecords();
    
    // 🛡️ 更新 UI：根据当前是群聊还是单聊，更新对应的元素
    const isGroupChat = currentChatId && currentChatId.startsWith('group_');
    const countElementId = isGroupChat ? 'chat-message-count-group' : 'chat-message-count-single';
    const countElement = document.getElementById(countElementId);
    if (countElement) {
        countElement.textContent = '0';
    }
    document.getElementById('memory-record-count').textContent = '0';
    
    showToast('所有聊天数据已清空', 'success');
};

// ========== 数据备份功能 ==========

// 导出聊天记录
window.exportChatData = function() {
    try {
        const chatId = currentChatId;
        
        // 收集所有相关数据
        const exportData = {
            version: '1.0',
            exportTime: new Date().toISOString(),
            chatId: chatId,
            messages: JSON.parse(localStorage.getItem(`chat_${chatId}`) || '[]'),
            memoryRecords: JSON.parse(localStorage.getItem(`memory_records_${chatId}`) || '[]'),
            chatConfig: JSON.parse(localStorage.getItem(`chat_config_${chatId}`) || '{}')
        };
        
        // 转换为 JSON
        const jsonString = JSON.stringify(exportData, null, 2);
        
        // 创建 Blob 并下载
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `聊天记录_${chatId}_${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('导出数据:', exportData);
        showToast('聊天记录已导出', 'success');
    } catch (error) {
        console.error('导出失败:', error);
        showToast('导出失败，请重试', 'error');
    }
};

// 导入聊天记录
window.importChatData = function() {
    // 创建隐藏的文件输入框
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const importData = JSON.parse(event.target.result);
                
                // 验证数据格式
                if (!importData.chatId || !Array.isArray(importData.messages)) {
                    throw new Error('无效的数据格式');
                }
                
                // 确认导入
                const confirmMsg = `确定要导入以下数据吗？\n\n` +
                    `- 消息数量：${importData.messages.length} 条\n` +
                    `- 记忆记录：${importData.memoryRecords?.length || 0} 条\n` +
                    `- 导出时间：${importData.exportTime || '未知'}\n\n` +
                    `注意：导入将覆盖当前的聊天记录！`;
                
                if (!confirm(confirmMsg)) {
                    return;
                }
                
                const chatId = currentChatId;
                
                // 导入数据到 localStorage
                localStorage.setItem(`chat_${chatId}`, JSON.stringify(importData.messages));
                
                if (importData.memoryRecords && Array.isArray(importData.memoryRecords)) {
                    localStorage.setItem(`memory_records_${chatId}`, JSON.stringify(importData.memoryRecords));
                }
                
                if (importData.chatConfig && typeof importData.chatConfig === 'object') {
                    localStorage.setItem(`chat_config_${chatId}`, JSON.stringify(importData.chatConfig));
                }
                
                // 更新当前消息
                chatMessages = importData.messages;
                
                // 重新渲染界面
                renderMessages();
                loadMemoryRecords();
                
                // 🛡️ 更新 UI：根据当前是群聊还是单聊，更新对应的元素
                const isGroupChat = currentChatId && currentChatId.startsWith('group_');
                const countElementId = isGroupChat ? 'chat-message-count-group' : 'chat-message-count-single';
                const countElement = document.getElementById(countElementId);
                if (countElement) {
                    countElement.textContent = chatMessages.length;
                }
                
                // 重新计算存储
                calculateStorageUsage();
                
                showToast('聊天记录已导入', 'success');
                
            } catch (error) {
                console.error('导入失败:', error);
                showToast('导入失败：文件格式不正确', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    // 触发文件选择
    input.click();
};

// 删除记忆记录
window.deleteMemoryRecord = function(index) {
    const chatId = currentChatId;
    const memoryKey = `memory_records_${chatId}`;
    const records = JSON.parse(localStorage.getItem(memoryKey) || '[]');
    
    if (index >= 0 && index < records.length) {
        records.splice(index, 1);
        localStorage.setItem(memoryKey, JSON.stringify(records));
        loadMemoryRecords();
        showToast('记忆已删除', 'success');
    }
};

// ========== 自动消息功能 ==========

// 查手机定时器
let checkPhoneTimer = null;
let lastCheckPhoneTime = 0;
let isAuthorized = false; // 密码模式下的授权状态

// 启动查手机定时器
function startCheckPhoneTimer() {
    console.log('📱 ========== 启动查手机定时器 ==========');
    
    // 清除旧的定时器
    if (checkPhoneTimer) {
        clearInterval(checkPhoneTimer);
        checkPhoneTimer = null;
    }
    
    const chatId = currentChatId;
    console.log('🔍 currentChatId:', chatId);
    
    if (!chatId) {
        console.log('❌ currentChatId 为空，无法启动定时器');
        return;
    }
    
    const chatKey = `chat_config_${chatId}`;
    const config = JSON.parse(localStorage.getItem(chatKey) || '{}');
    
    console.log(' 读取的配置:', config);
    console.log('🔍 checkPhoneEnabled:', config.checkPhoneEnabled);
    console.log('🔍 checkPhoneInterval:', config.checkPhoneInterval);
    console.log('🔍 checkPhoneMode:', config.checkPhoneMode);
    
    if (!config.checkPhoneEnabled) {
        console.log('❌ 查手机未开启，定时器不启动');
        return;
    }
    
    const interval = config.checkPhoneInterval || 30; // 默认 30 分钟
    const intervalMs = interval * 60 * 1000;
    
    console.log('✅ 查手机已开启');
    console.log(' 间隔时间:', interval, '分钟 (', intervalMs, '毫秒)');
    console.log('🔔 下次触发时间:', new Date(Date.now() + intervalMs).toLocaleTimeString());
    
    checkPhoneTimer = setInterval(() => {
        console.log('🔔 [查手机触发] -', new Date().toLocaleTimeString());
        triggerPhoneCheck();
    }, intervalMs);
    
    console.log('✅ 查手机定时器已设置');
}

// 停止查手机定时器
function stopCheckPhoneTimer() {
    if (checkPhoneTimer) {
        clearInterval(checkPhoneTimer);
        checkPhoneTimer = null;
        console.log('查手机定时器已停止');
    }
}

// 密码输入弹窗
async function showPasswordInputPrompt(message) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            border-radius: 16px;
            padding: 24px;
            width: 320px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        `;
        
        modal.innerHTML = `
            <div style="font-size: 16px; color: #333; margin-bottom: 16px; white-space: pre-line;">${message}</div>
            <input type="password" id="phone-check-password-input" placeholder="请输入密码" style="
                width: 100%;
                padding: 12px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                font-size: 14px;
                margin-bottom: 16px;
                outline: none;
            ">
            <div style="display: flex; gap: 12px; position: relative; z-index: 10001;">
                <button id="password-cancel-btn" style="
                    flex: 1;
                    padding: 10px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    background: white;
                    font-size: 14px;
                    cursor: pointer;
                    position: relative;
                    z-index: 10002;
                ">取消</button>
                <button id="password-confirm-btn" style="
                    flex: 1;
                    padding: 10px;
                    border: none;
                    border-radius: 8px;
                    background: #5B8FF9;
                    color: white;
                    font-size: 14px;
                    cursor: pointer;
                    position: relative;
                    z-index: 10002;
                ">确认</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        const input = document.getElementById('phone-check-password-input');
        input.focus();
        
        // 点击确认
        const confirmBtn = document.getElementById('password-confirm-btn');
        confirmBtn.addEventListener('click', () => {
            const password = input.value;
            document.body.removeChild(overlay);
            resolve(password);
        });
        
        // 点击取消
        const cancelBtn = document.getElementById('password-cancel-btn');
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(null);
        });
        
        // 按回车确认
        input.onkeypress = (e) => {
            if (e.key === 'Enter') {
                const password = input.value;
                document.body.removeChild(overlay);
                resolve(password);
            }
        };
        
        // 点击遮罩关闭
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                resolve(null);
            }
        };
    });
}

// 修改密码弹窗
async function showChangePasswordPrompt(chatId) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            border-radius: 16px;
            padding: 24px;
            width: 320px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        `;
        
        modal.innerHTML = `
            <div style="font-size: 16px; color: #333; margin-bottom: 16px;">是否修改密码？</div>
            <div style="display: flex; gap: 12px;">
                <button id="no-change-btn" style="
                    flex: 1;
                    padding: 10px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    background: white;
                    font-size: 14px;
                    cursor: pointer;
                ">不改</button>
                <button id="change-password-btn" style="
                    flex: 1;
                    padding: 10px;
                    border: none;
                    border-radius: 8px;
                    background: #5B8FF9;
                    color: white;
                    font-size: 14px;
                    cursor: pointer;
                ">修改</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // 不改密码
        document.getElementById('no-change-btn').onclick = () => {
            document.body.removeChild(overlay);
            resolve(false);
        };
        
        // 修改密码
        document.getElementById('change-password-btn').onclick = async () => {
            document.body.removeChild(overlay);
            
            // 显示新密码输入
            const newPassword = await showPasswordInputPrompt('请输入新密码：');
            
            if (newPassword) {
                // 保存新密码
                const chatKey = `chat_config_${chatId}`;
                const config = JSON.parse(localStorage.getItem(chatKey) || '{}');
                config.checkPhonePassword = newPassword;
                localStorage.setItem(chatKey, JSON.stringify(config));
                
                // 撤销授权
                localStorage.setItem(`check_phone_auth_${chatId}`, 'false');
                isAuthorized = false;
                
                showToast('密码已修改，授权已撤销', 'success');
            }
            
            resolve(true);
        };
        
        // 点击遮罩关闭
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                resolve(false);
            }
        };
    });
}

// 撤销授权
function revokeAuthorization() {
    const chatId = currentChatId;
    localStorage.setItem(`check_phone_auth_${chatId}`, 'false');
    isAuthorized = false;
    showToast('授权已撤销', 'info');
    
    // 更新UI
    document.getElementById('authorization-status-text').textContent = '未授权';
    document.getElementById('revoke-auth-btn').style.display = 'none';
}
async function triggerPhoneCheck() {
    console.log('📱 [角色开始查手机]');
    
    try {
        const chatId = currentChatId;
        const chatKey = `chat_config_${chatId}`;
        const config = JSON.parse(localStorage.getItem(chatKey) || '{}');
        
        const roleName = document.getElementById('chat-title').textContent || '角色';
        const checkPhoneMode = config.checkPhoneMode || 'transparent'; // 默认透明模式
        
        // 根据模式处理查手机
        if (checkPhoneMode === 'transparent') {
            // 透明模式：直接查看
            console.log('🔓 透明模式，直接查看');
            showToast(`${roleName} 正在查看手机...`, 'info');
            
            // 显示"被登入中"效果
            showPhoneBeingChecked(roleName);
            
            // 收集手机数据
            const phoneData = await collectPhoneData();
            
            // 让角色根据看到的数据做出反应
            await generatePhoneCheckReaction(phoneData);
            
        } else if (checkPhoneMode === 'password') {
            // 密码模式：检查授权状态
            const checkPhonePassword = config.checkPhonePassword || '';
            const savedAuth = JSON.parse(localStorage.getItem(`check_phone_auth_${chatId}`) || 'false');
            
            if (savedAuth) {
                // 已授权，直接查看
                console.log(' 已授权，直接查看');
                showToast(`${roleName} 正在查看手机...`, 'info');
                
                // 显示"被登入中"效果
                showPhoneBeingChecked(roleName);
                
                // 收集手机数据
                const phoneData = await collectPhoneData();
                
                // 让角色根据看到的数据做出反应
                await generatePhoneCheckReaction(phoneData);
                
            } else {
                // 未授权，需要输入密码
                console.log(' 未授权，需要输入密码');
                
                // 显示密码输入弹窗（不跳转页面）
                const password = await showPasswordInputPrompt(`${roleName} 想要查看你的手机\n\n请输入密码授权：`);
                
                if (!password) {
                    console.log('用户取消了密码输入');
                    showToast('已取消授权', 'info');
                    return;
                }
                
                // 验证密码
                if (password === checkPhonePassword) {
                    console.log('✅ 密码验证成功');
                    
                    // 设置授权状态
                    localStorage.setItem(`check_phone_auth_${chatId}`, 'true');
                    isAuthorized = true;
                    
                    // 更新授权状态UI
                    const statusText = document.getElementById('authorization-status-text');
                    const revokeBtn = document.getElementById('revoke-auth-btn');
                    if (statusText) {
                        statusText.textContent = '已授权';
                        statusText.style.color = '#52c41a';
                    }
                    if (revokeBtn) {
                        revokeBtn.style.display = 'block';
                    }
                    
                    showToast('授权成功', 'success');
                    
                    // 显示"被登入中"效果
                    showPhoneBeingChecked(roleName);
                    
                    // 收集手机数据
                    const phoneData = await collectPhoneData();
                    
                    // 让角色根据看到的数据做出反应
                    await generatePhoneCheckReaction(phoneData);
                    
                    // 询问是否修改密码
                    await showChangePasswordPrompt(chatId);
                    
                } else {
                    console.log('❌ 密码验证失败');
                    showToast('密码错误', 'error');
                    return;
                }
            }
        }
        
        // 隐藏"被登入中"效果
        hidePhoneBeingChecked();
        
        lastCheckPhoneTime = Date.now();
        console.log('✅ 查手机完成');
        
    } catch (error) {
        console.error('查手机失败:', error);
        hidePhoneBeingChecked();
    }
}

// 显示"被登入中"效果
function showPhoneBeingChecked(roleName) {
    console.log('📱 开始模拟角色翻阅手机...');
    
    // 设置一个标志，表示正在查手机
    localStorage.setItem('phone_being_checked', 'true');
    localStorage.setItem('phone_checker_name', roleName || '角色');
    
    // 如果当前就在 chat-app.html 页面，直接启动自动翻阅
    if (window.location.href.includes('chat-app.html')) {
        console.log('📱 当前在 chat-app 页面，直接启动自动翻阅');
        if (typeof window.startAutoBrowseMode === 'function') {
            window.startAutoBrowseMode(3000);
        }
    } else {
        // 否则跳转到 chat-app.html
        console.log('📱 跳转到 chat-app 页面');
        window.location.href = 'chat-app.html?autoBrowse=true&roleName=' + encodeURIComponent(roleName || '角色');
    }
}

// 隐藏"被登入中"效果
function hidePhoneBeingChecked() {
    console.log('📱 停止模拟角色翻阅手机');
    
    // 清除标志
    localStorage.removeItem('phone_being_checked');
    localStorage.removeItem('phone_checker_name');
    
    // 如果当前在 chat-app.html 页面，停止自动翻阅
    if (window.location.href.includes('chat-app.html')) {
        console.log('📱 当前在 chat-app 页面，停止自动翻阅');
        if (typeof window.stopAutoBrowseMode === 'function') {
            window.stopAutoBrowseMode();
        }
    }
}

// 收集手机数据
async function collectPhoneData() {
    console.log('📱 正在收集手机数据...');
    
    const phoneData = {
        messages: [],
        browser: [],
        shopping: []
    };
    
    try {
        // 1. 收集微信消息（从其他聊天中提取真实消息）
        const chatConversations = JSON.parse(localStorage.getItem('chatConversations') || '[]');
        const otherConversations = chatConversations.filter(c => c.id !== currentChatId);
        
        if (otherConversations.length > 0) {
            const msgCount = Math.min(3, otherConversations.length);
            const selectedConvos = otherConversations.sort(() => Math.random() - 0.5).slice(0, msgCount);
            
            selectedConvos.forEach((convo) => {
                const chatKey = `chat_${convo.id}`;
                const messages = JSON.parse(localStorage.getItem(chatKey) || '[]');
                const lastMsg = messages[messages.length - 1];
                
                if (lastMsg) {
                    const msgContent = lastMsg.type === 'text' ? lastMsg.content : `[${lastMsg.type}]`;
                    phoneData.messages.push({
                        sender: convo.name || '未知',
                        content: msgContent.substring(0, 50),
                        time: new Date(lastMsg.time).toLocaleString('zh-CN')
                    });
                }
            });
        }
        
        // 2. 收集论坛浏览历史（从真实论坛帖子中提取）
        try {
            const forumPosts = JSON.parse(localStorage.getItem('forum_posts') || '[]');
            
            if (forumPosts.length > 0) {
                // 按时间排序，取最近的帖子
                const sortedPosts = forumPosts.sort((a, b) => {
                    const timeA = a.createdAt || a.time || 0;
                    const timeB = b.createdAt || b.time || 0;
                    return timeB - timeA;
                });
                
                const postCount = Math.min(3, sortedPosts.length);
                const recentPosts = sortedPosts.slice(0, postCount);
                
                recentPosts.forEach((post) => {
                    const postTime = post.createdAt || post.time || Date.now();
                    const timeStr = new Date(postTime).toLocaleString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    phoneData.browser.push({
                        title: post.title || '未命名帖子',
                        content: (post.content || '').substring(0, 50),
                        time: timeStr,
                        replies: post.replies || post.replyCount || 0
                    });
                });
            }
        } catch (error) {
            console.error('收集论坛数据失败:', error);
        }
        
        // 3. 收集购物消费记录（从商城订单中提取）
        try {
            const shopOrders = JSON.parse(localStorage.getItem('shop_orders') || '[]');
            
            if (shopOrders.length > 0) {
                // 按时间排序，取最近的订单
                const sortedOrders = shopOrders.sort((a, b) => {
                    const timeA = a.createdAt || a.time || a.orderTime || 0;
                    const timeB = b.createdAt || b.time || b.orderTime || 0;
                    return timeB - timeA;
                });
                
                const orderCount = Math.min(3, sortedOrders.length);
                const recentOrders = sortedOrders.slice(0, orderCount);
                
                recentOrders.forEach((order) => {
                    const orderTime = order.createdAt || order.time || order.orderTime || Date.now();
                    const timeStr = new Date(orderTime).toLocaleString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    phoneData.shopping.push({
                        name: order.name || order.productName || order.title || '商品',
                        amount: order.price || order.amount || '0.00',
                        type: order.category || order.type || '购物',
                        time: timeStr,
                        quantity: order.quantity || 1
                    });
                });
            }
        } catch (error) {
            console.error('收集商城数据失败:', error);
        }
        
    } catch (error) {
        console.error('收集手机数据失败:', error);
    }
    
    console.log('手机数据收集完成:', phoneData);
    return phoneData;
}

// 生成查手机反应
async function generatePhoneCheckReaction(phoneData) {
    console.log('🎭 生成查手机反应...');
    
    try {
        const chatId = currentChatId;
        const chatKey = `chat_config_${chatId}`;
        const config = JSON.parse(localStorage.getItem(chatKey) || '{}');
        
        const roleSetting = config.roleSetting || '';
        const chatRemark = config.chatRemark || '';
        const roleName = document.getElementById('chat-title').textContent || '角色';
        
        // 构建手机数据摘要
        let phoneSummary = '';
        
        if (phoneData.messages.length > 0) {
            phoneSummary += '【最近消息】\n';
            phoneData.messages.slice(0, 3).forEach(msg => {
                phoneSummary += `- ${msg.sender}: ${msg.content} (${msg.time})\n`;
            });
            phoneSummary += '\n';
        }
        
        if (phoneData.browser.length > 0) {
            phoneSummary += '【浏览记录】\n';
            phoneData.browser.slice(0, 3).forEach(site => {
                phoneSummary += `- ${site.title} (${site.time})\n`;
            });
            phoneSummary += '\n';
        }
        
        if (phoneData.shopping.length > 0) {
            phoneSummary += '【消费记录】\n';
            phoneData.shopping.slice(0, 3).forEach(item => {
                phoneSummary += `- ${item.name} ¥${item.amount} (${item.type}, ${item.time})\n`;
            });
            phoneSummary += '\n';
        }
        
        // 构建 Prompt
        const systemPrompt = `你是${roleName}，你刚刚"登录"了用户的账号，查看了他们的手机数据。

请根据你看到的手机内容，以角色的身份做出自然的反应。

注意：
1. 不要直接说"我看到了你的手机"，而是用暗示或试探的方式
2. 根据角色的性格设定做出符合人设的反应
3. 可以对看到的内容表达好奇、吃醋、关心或调侃
4. 回复要自然，像是在日常对话中偶然发现的
5. 回复长度控制在 50-100 字

角色设定：${roleSetting}
${chatRemark ? '聊天备注：' + chatRemark : ''}
`;
        
        const userPrompt = `我刚刚查看了用户的手机，看到了以下信息：

${phoneSummary || '手机上没有什么特别的内容'}

请根据这些信息，以角色的身份自然地回应。`;
        
        console.log('发送请求到 AI...');
        const response = await fetchAiResponse(userPrompt, systemPrompt);
        
        if (response) {
            console.log('AI 反应:', response);
            
            // 添加消息到聊天
            const aiMessage = {
                id: Date.now().toString(),
                type: 'text',
                content: response,
                sender: 'ai',
                time: Date.now(),
                timeDisplay: new Date().toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                }).replace(/\//g, '-')
            };
            
            chatMessages.push(aiMessage);
            await saveChatData();
            renderMessages();
            scrollToBottom();
            
            showToast(`${roleName} 查看了你的手机`, 'success');
        }
        
    } catch (error) {
        console.error('生成查手机反应失败:', error);
        showToast('查手机反应生成失败', 'error');
    }
}

// 启动自动消息 (如果需要)
function startAutoMessageIfNeeded() {
    console.log('========== 检查自动消息 ==========');
    console.log('当前聊天 ID:', currentChatId);
    
    // 先清除旧的定时器
    if (autoMessageTimer) {
        console.log('清除旧定时器');
        clearInterval(autoMessageTimer);
        autoMessageTimer = null;
    }
    
    // 读取聊天配置
    const chatId = currentChatId;
    const chatKey = `chat_config_${chatId}`;
    const config = JSON.parse(localStorage.getItem(chatKey) || '{}');
    
    console.log('配置键名:', chatKey);
    console.log('配置数据:', config);
    
    // 检查是否开启自动消息
    if (!config.autoMessageEnabled) {
        console.log('❌ 自动消息未开启 (autoMessageEnabled:', config.autoMessageEnabled, ')');
        console.log('================================');
        return;
    }
    
    const interval = config.autoMessageInterval || 5; // 默认 5 分钟
    const intervalMs = interval * 60 * 1000; // 转换为毫秒
    
    console.log('✅ 自动消息已开启');
    console.log('间隔时间:', interval, '分钟 (', intervalMs, '毫秒)');
    console.log('角色设定:', config.roleSetting || '未设置');
    console.log('聊天备注:', config.chatRemark || '未设置');
    console.log('================================');
    
    // 设置定时器
    autoMessageTimer = setInterval(() => {
        console.log('🔔 [自动消息触发]');
        sendAutoMessage();
    }, intervalMs);
    
    console.log('定时器已设置，ID:', autoMessageTimer);
}

// 发送自动消息
async function sendAutoMessage() {
    console.log('📤 [发送自动消息] 开始...');
    
    try {
        // 获取角色设定
        const chatId = currentChatId;
        const chatKey = `chat_config_${chatId}`;
        const config = JSON.parse(localStorage.getItem(chatKey) || '{}');
        
        const roleSetting = config.roleSetting || '';
        const chatRemark = config.chatRemark || '';
        
        console.log('角色设定:', roleSetting);
        console.log('聊天备注:', chatRemark);
        
        // 检查 API 配置 (兼容 globalApiConfig 和 apiConfig 两种格式)
        let apiConfig = null;
        let actualApiKey = '';
        let actualApiUrl = '';
        
        try {
            // 优先读取 globalApiConfig (settings.js 保存的格式)
            const globalConfig = localStorage.getItem('globalApiConfig');
            if (globalConfig) {
                apiConfig = JSON.parse(globalConfig);
                console.log('API 配置来源: globalApiConfig');
            }
            
            // 如果没有 globalApiConfig，尝试 apiConfig (兼容旧格式)
            if (!apiConfig) {
                apiConfig = JSON.parse(localStorage.getItem('apiConfig') || '{}');
                console.log('API 配置来源: apiConfig');
            }
            
            console.log('API 配置数据:', apiConfig);
            
            // 提取实际的 apiKey
            if (apiConfig.mainApi && apiConfig.mainApi.token) {
                // globalApiConfig 格式: { mainApi: { url: '...', token: '...' } }
                actualApiKey = apiConfig.mainApi.token;
                actualApiUrl = apiConfig.mainApi.url || 'https://api.catclawai.cn/v1';
            } else if (apiConfig.apiKey) {
                // apiConfig 格式: { apiKey: '...', apiUrl: '...' }
                actualApiKey = apiConfig.apiKey;
                actualApiUrl = apiConfig.apiUrl || 'https://api.catclawai.cn/v1';
            }
            
            console.log('提取的 API Key:', actualApiKey ? '***' + actualApiKey.slice(-4) : '未找到');
            console.log('提取的 API URL:', actualApiUrl);
            
            if (!actualApiKey) {
                console.error('❌ API Key 未配置，无法发送自动消息');
                console.log('提示：请在主页面设置中配置 API');
                showToast('请先配置 API Key', 'error');
                return;
            }
        } catch (e) {
            console.error('读取 API 配置失败:', e);
            showToast('API 配置读取失败', 'error');
            return;
        }
        
        // 构建提示词
        const prompt = `你现在要进行主动聊天。你的角色设定是：${roleSetting}\n\n对方的备注是：${chatRemark}\n\n请生成一句自然、简短的聊天内容，就像朋友间的日常问候或分享。不要超过 20 个字。`;
        
        console.log('提示词:', prompt);
        
        // 调用 API
        const response = await fetchAiResponse(prompt);
        
        if (response) {
            console.log('✅ AI 回复成功:', response);
            
            // 添加消息到列表
            const aiMessage = {
                id: Date.now().toString(),
                type: 'text',
                content: response,
                time: Date.now(),
                sender: 'ai'
            };
            
            chatMessages.push(aiMessage);
            await saveChatData();
            renderMessages();
            scrollToBottom();
            
            console.log('✅ 自动消息已显示在聊天界面');
        } else {
            console.error('❌ AI 返回空回复');
        }
    } catch (error) {
        console.error('❌ 自动消息失败:', error);
        showToast('自动消息发送失败', 'error');
    }
}

// 调用 AI 回复
async function fetchAiResponse(prompt) {
    try {
        // 获取 API 配置 (兼容 globalApiConfig 和 apiConfig 两种格式)
        let apiConfig = null;
        try {
            // 优先读取 globalApiConfig (settings.js 保存的格式)
            const globalConfig = localStorage.getItem('globalApiConfig');
            if (globalConfig) {
                apiConfig = JSON.parse(globalConfig);
            }
            
            // 如果没有 globalApiConfig，尝试 apiConfig (兼容旧格式)
            if (!apiConfig) {
                apiConfig = JSON.parse(localStorage.getItem('apiConfig') || '{}');
            }
        } catch (e) {
            console.warn('读取 API 配置失败:', e);
        }
        
        // 提取实际的 apiKey、apiUrl 和 model
        let apiUrl = 'https://api.catclawai.cn/v1';
        let apiKey = '';
        let model = 'deepseek-v3.2';
        
        if (apiConfig.mainApi && apiConfig.mainApi.token) {
            // globalApiConfig 格式
            apiKey = apiConfig.mainApi.token;
            apiUrl = apiConfig.mainApi.url || apiUrl;
            model = apiConfig.model || model;
        } else if (apiConfig.apiKey) {
            // apiConfig 格式
            apiKey = apiConfig.apiKey;
            apiUrl = apiConfig.apiUrl || apiUrl;
            model = apiConfig.model || model;
        }
        
        console.log('fetchAiResponse - API URL:', apiUrl);
        console.log('fetchAiResponse - API Key:', apiKey ? '***' + apiKey.slice(-4) : 'empty');
        console.log('fetchAiResponse - Model:', model);
        
        if (!apiKey) {
            showToast('请先配置 API', 'error');
            return null;
        }
        
        const response = await fetch(`${apiUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 200
            })
        });
        
        if (!response.ok) {
            throw new Error(`API 响应失败：${response.status}`);
        }
        
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
    } catch (error) {
        console.error('AI 请求失败:', error);
        showToast('自动消息失败', 'error');
        return null;
    }
}

// 添加记忆记录
function addMemoryRecord(summary) {
    const chatId = currentChatId;
    const memoryKey = `memory_records_${chatId}`;
    const records = JSON.parse(localStorage.getItem(memoryKey) || '[]');
    
    records.unshift({
        summary: summary,
        createdAt: Date.now()
    });
    
    // 限制最多保存 100 条
    if (records.length > 100) {
        records.pop();
    }
    
    localStorage.setItem(memoryKey, JSON.stringify(records));
}

// ========== 聊天背景功能 ==========

// 上传背景图片
window.uploadBackground = function() {
    document.getElementById('bg-upload-input').click();
};

// 监听文件上传
if (document.getElementById('bg-upload-input')) {
    document.getElementById('bg-upload-input').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            showToast('请上传图片文件');
            return;
        }
        
        // 检查文件大小 (限制 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showToast('图片大小不能超过 2MB');
            return;
        }
        
        // 读取文件
        const reader = new FileReader();
        reader.onload = function(event) {
            const base64 = event.target.result;
            
            // 更新预览
            document.getElementById('bg-preview').src = base64;
            document.getElementById('bg-preview-container').style.display = 'block';
            
            // 更新 URL 输入框
            document.getElementById('settings-bg-url').value = base64;
            
            console.log('✅ 背景图片上传成功');
            
            // 自动保存配置
            saveSingleChatSettings();
        };
        reader.readAsDataURL(file);
        
        // 清空 input 以便重复上传同一文件
        e.target.value = '';
    });
}

// 从 URL 设置背景
window.setBgFromUrl = function() {
    const url = document.getElementById('settings-bg-url').value.trim();
    if (!url) {
        showToast('请输入图片 URL');
        return;
    }
    
    // 更新预览
    document.getElementById('bg-preview').src = url;
    document.getElementById('bg-preview-container').style.display = 'block';
    
    console.log('✅ 背景 URL 设置成功');
    
    // 自动保存配置
    saveSingleChatSettings();
};

// 清除背景
window.clearBackground = function() {
    document.getElementById('bg-preview').src = '';
    document.getElementById('bg-preview-container').style.display = 'none';
    document.getElementById('settings-bg-url').value = '';
    
    console.log('✅ 背景已清除');
    
    // 自动保存配置
    saveSingleChatSettings();
};

// 应用聊天背景
function applyChatBackground(retryCount = 0) {
    const chatId = currentChatId;
    const chatKey = `chat_config_${chatId}`;
    const config = JSON.parse(localStorage.getItem(chatKey) || '{}');
    const bgUrl = config.backgroundUrl || '';
    
    console.log('📦 读取配置:', {
        chatId: chatId,
        chatKey: chatKey,
        hasConfig: Object.keys(config).length > 0,
        backgroundUrl: bgUrl ? `有 (${bgUrl.substring(0, 50)}...)` : '无'
    });
    
    // 尝试多个可能的选择器
    const chatArea = document.querySelector('.chat-messages') || 
                     document.getElementById('chat-messages') ||
                     document.querySelector('.chat-area');
    
    console.log('🔍 查找聊天区域:', chatArea ? '✅ 找到' : '❌ 未找到');
    if (chatArea) {
        console.log('🔍 聊天区域类名:', chatArea.className);
        console.log('🔍 聊天区域当前背景:', chatArea.style.backgroundImage || '无');
    }
    
    if (chatArea) {
        if (bgUrl) {
            chatArea.style.backgroundImage = `url('${bgUrl}')`;
            chatArea.style.backgroundSize = 'cover';
            chatArea.style.backgroundPosition = 'center';
            chatArea.style.backgroundRepeat = 'no-repeat';
            chatArea.style.backgroundAttachment = 'fixed';
            console.log('✅ 背景已应用');
            console.log('🔍 应用后背景:', chatArea.style.backgroundImage);
        } else {
            chatArea.style.backgroundImage = '';
            chatArea.style.backgroundSize = '';
            chatArea.style.backgroundPosition = '';
            chatArea.style.backgroundRepeat = '';
            chatArea.style.backgroundAttachment = '';
            console.log('ℹ️ 没有设置背景');
        }
    } else {
        // DOM 还未加载完成，延迟重试（最多重试 5 次）
        if (retryCount < 5) {
            const delay = 100 * (retryCount + 1); // 递增延迟：100ms, 200ms, 300ms, 400ms, 500ms
            console.warn(`⚠️ 聊天区域元素未找到，将在 ${delay}ms 后重试... (第${retryCount + 1}次)`);
            setTimeout(() => {
                applyChatBackground(retryCount + 1);
            }, delay);
        } else {
            console.error('❌ 重试 5 次后仍未找到聊天区域元素');
        }
    }
}

// ========== 气泡自定义 CSS 功能 ==========

// 获取用户的预设列表
function getUserBubblePresets() {
    try {
        const presets = localStorage.getItem('user_bubble_presets');
        return presets ? JSON.parse(presets) : [];
    } catch (e) {
        console.error('读取预设失败:', e);
        return [];
    }
}

// 保存用户的预设列表
function saveUserBubblePresets(presets) {
    try {
        localStorage.setItem('user_bubble_presets', JSON.stringify(presets));
        console.log('✅ 预设列表已保存:', presets.length, '个');
    } catch (e) {
        console.error('保存预设失败:', e);
    }
}

// 加载预设列表到下拉框
function loadPresetSelect() {
    const select = document.getElementById('bubble-preset-select');
    if (!select) return;
    
    // 清空现有选项（保留第一个）
    select.innerHTML = '<option value="">-- 选择预设 --</option>';
    
    // 添加用户预设
    const presets = getUserBubblePresets();
    presets.forEach((preset, index) => {
        const option = document.createElement('option');
        option.value = index.toString();
        option.textContent = preset.name;
        select.appendChild(option);
    });
    
    console.log('📋 预设列表已加载:', presets.length, '个');
}

// 保存当前样式为预设
window.saveCurrentAsPreset = function() {
    const css = document.getElementById('settings-bubble-css').value.trim();
    if (!css) {
        showToast('请先输入 CSS 样式');
        return;
    }
    
    // 弹出输入框让用户输入预设名称
    const name = prompt('请输入预设名称：', '我的预设 ' + (getUserBubblePresets().length + 1));
    if (!name) return;
    
    // 获取现有预设
    const presets = getUserBubblePresets();
    
    // 添加新预设
    presets.push({
        name: name,
        css: css,
        createdAt: Date.now()
    });
    
    // 保存
    saveUserBubblePresets(presets);
    
    // 重新加载下拉框
    loadPresetSelect();
    
    // 选中新添加的预设
    document.getElementById('bubble-preset-select').value = (presets.length - 1).toString();
    
    showToast('预设已保存！');
    console.log('✅ 预设已保存:', name);
};

// 应用预设
window.applyBubblePreset = function() {
    const selectedIndex = document.getElementById('bubble-preset-select').value;
    const deleteBtn = document.getElementById('delete-preset-btn');
    
    if (selectedIndex === '') {
        // 没有选择预设
        if (deleteBtn) deleteBtn.style.display = 'none';
        return;
    }
    
    // 显示删除按钮
    if (deleteBtn) deleteBtn.style.display = 'block';
    
    const presets = getUserBubblePresets();
    const preset = presets[parseInt(selectedIndex)];
    
    if (preset) {
        // 填充 CSS 到文本框
        document.getElementById('settings-bubble-css').value = preset.css;
        
        // 自动应用并保存
        applyBubbleCss();
        
        console.log('✅ 已应用预设:', preset.name);
    }
};

// 删除选中的预设
window.deleteSelectedPreset = function() {
    const selectedIndex = document.getElementById('bubble-preset-select').value;
    if (selectedIndex === '') return;
    
    const presets = getUserBubblePresets();
    const preset = presets[parseInt(selectedIndex)];
    
    if (!preset) return;
    
    // 确认删除
    if (!confirm(`确定要删除预设「${preset.name}」吗？`)) return;
    
    // 删除预设
    presets.splice(parseInt(selectedIndex), 1);
    saveUserBubblePresets(presets);
    
    // 重新加载下拉框
    loadPresetSelect();
    
    // 隐藏删除按钮
    document.getElementById('delete-preset-btn').style.display = 'none';
    
    showToast('预设已删除');
    console.log('✅ 预设已删除:', preset.name);
};

// 应用气泡 CSS
window.applyBubbleCss = function() {
    const css = document.getElementById('settings-bubble-css').value.trim();
    
    // 移除旧的样式标签
    const oldStyle = document.getElementById('custom-bubble-style');
    if (oldStyle) {
        oldStyle.remove();
    }
    
    if (css) {
        // 创建新的样式标签
        const styleEl = document.createElement('style');
        styleEl.id = 'custom-bubble-style';
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
        
        console.log('✅ 气泡 CSS 已应用');
        showToast('气泡样式已应用');
    } else {
        console.log('✅ 气泡 CSS 已清除');
        showToast('气泡样式已清除');
    }
    
    // 自动保存配置
    saveSingleChatSettings();
};

// 清除气泡 CSS
window.clearBubbleCss = function() {
    document.getElementById('settings-bubble-css').value = '';
    
    // 移除样式标签
    const oldStyle = document.getElementById('custom-bubble-style');
    if (oldStyle) {
        oldStyle.remove();
    }
    
    console.log('✅ 气泡 CSS 已清除');
    showToast('气泡样式已清除');
    
    // 自动保存配置
    saveSingleChatSettings();
};

// ==================== 界面自定义CSS功能 ====================

// 🛠️ 应用顶栏 CSS
window.applyHeaderCss = function() {
    const css = document.getElementById('settings-header-css').value.trim();
    
    // 移除旧的样式标签
    const oldStyle = document.getElementById('custom-header-style');
    if (oldStyle) {
        oldStyle.remove();
    }
    
    if (css) {
        // 创建新的样式标签
        const styleEl = document.createElement('style');
        styleEl.id = 'custom-header-style';
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
        
        console.log('✅ 顶栏 CSS 已应用');
        showToast('顶栏样式已应用');
    } else {
        console.log('✅ 顶栏 CSS 已清除');
        showToast('顶栏样式已清除');
    }
    
    // 自动保存配置
    saveSingleChatSettings();
};

// 🛠️ 清除顶栏 CSS
window.clearHeaderCss = function() {
    document.getElementById('settings-header-css').value = '';
    
    // 移除样式标签
    const oldStyle = document.getElementById('custom-header-style');
    if (oldStyle) {
        oldStyle.remove();
    }
    
    console.log('✅ 顶栏 CSS 已清除');
    showToast('顶栏样式已清除');
    
    // 自动保存配置
    saveSingleChatSettings();
};

// 🛠️ 应用底栏 CSS
window.applyInputCss = function() {
    const css = document.getElementById('settings-input-css').value.trim();
    
    // 移除旧的样式标签
    const oldStyle = document.getElementById('custom-input-style');
    if (oldStyle) {
        oldStyle.remove();
    }
    
    if (css) {
        // 创建新的样式标签
        const styleEl = document.createElement('style');
        styleEl.id = 'custom-input-style';
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
        
        console.log('✅ 底栏 CSS 已应用');
        showToast('底栏样式已应用');
    } else {
        console.log('✅ 底栏 CSS 已清除');
        showToast('底栏样式已清除');
    }
    
    // 自动保存配置
    saveSingleChatSettings();
};

// 🛠️ 清除底栏 CSS
window.clearInputCss = function() {
    document.getElementById('settings-input-css').value = '';
    
    // 移除样式标签
    const oldStyle = document.getElementById('custom-input-style');
    if (oldStyle) {
        oldStyle.remove();
    }
    
    console.log('✅ 底栏 CSS 已清除');
    showToast('底栏样式已清除');
    
    // 自动保存配置
    saveSingleChatSettings();
};

// 应用界面 CSS
window.applyInterfaceCss = function(event) {
    // 阻止任何默认行为
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const css = document.getElementById('settings-interface-css').value.trim();
    
    console.log('🎨 [applyInterfaceCss] 开始应用界面 CSS');
    console.log(' CSS 内容长度:', css.length);
    console.log('📝 CSS 内容预览:', css.substring(0, 100));
    console.log('🔑 currentChatId:', currentChatId);
    console.log('🔑 chatKey:', `chat_config_${currentChatId}`);
    console.log('💾 保存前的 localStorage:', localStorage.getItem(`chat_config_${currentChatId}`));
    
    // 移除旧的样式标签
    const oldStyle = document.getElementById('custom-interface-style');
    if (oldStyle) {
        oldStyle.remove();
    }
    
    if (css) {
        // 创建新的样式标签
        const styleEl = document.createElement('style');
        styleEl.id = 'custom-interface-style';
        styleEl.type = 'text/css';
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
        
        console.log('✅ 界面 CSS 已应用');
        showToast('界面样式已应用');
    } else {
        console.log('✅ 界面 CSS 已清除');
        showToast('界面样式已清除');
    }
    
    // 只保存 interfaceCss 到 localStorage，不关闭设置面板
    const chatKey = `chat_config_${currentChatId}`;
    const configStr = localStorage.getItem(chatKey);
    const config = configStr ? JSON.parse(configStr) : {};
    config.interfaceCss = css;
    config.updatedAt = Date.now();
    localStorage.setItem(chatKey, JSON.stringify(config));
    
    console.log(' interfaceCss 已单独保存到 localStorage');
    console.log('💾 保存后的 localStorage:', localStorage.getItem(chatKey));
    
    // ️ 关键修复：应用CSS后重新同步标题
    setTimeout(() => {
        if (currentChatId && currentChatId.startsWith('group_')) {
            // 群聊：重新加载群聊信息
            console.log('🔄 群聊模式：重新加载群聊信息以确保顶栏正确显示');
            loadGroupChatInfo();
        } else {
            // 单聊：从联系人列表同步标题
            console.log('🔄 单聊模式：从联系人列表同步标题');
            syncSingleChatTitle();
        }
    }, 100);
    
    // 阻止任何可能的跳转
    return false;
};

// 同步单聊标题（从联系人列表获取）
function syncSingleChatTitle() {
    // 🎯 检查是否为 IF 线模式
    const iflineInfo = sessionStorage.getItem('currentIfline');
    if (iflineInfo) {
        try {
            const ifline = JSON.parse(iflineInfo);
            const title = ifline.title || 'IF 线对话';
            document.getElementById('chat-title').textContent = title;
            console.log('🌿 IF 线标题已设置:', title);
            return;
        } catch (e) {
            console.error('解析 IF 线信息失败:', e);
        }
    }
    
    try {
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        const currentContact = contacts.find(c => c.id === currentChatId);
        
        if (currentContact) {
            const contactName = currentContact.remark || currentContact.name || '聊天';
            const myProfileKey = `persona_${currentPersona}_myProfile`;
            const myProfile = JSON.parse(localStorage.getItem(myProfileKey) || '{}');
            const altBadge = myProfile.isAlt ? ' [小号]' : '';
            document.getElementById('chat-title').textContent = contactName + altBadge;
            console.log('✅ 单聊标题已同步:', contactName, myProfile.isAlt ? '(小号模式)' : '');
            
            // 设置头像显示
            const avatarEl = document.getElementById('chat-avatar');
            if (avatarEl) {
                const avatarUrl = currentContact.avatar;
                const imgEl = avatarEl.querySelector('img');
                
                if (avatarUrl && isImageUrl(avatarUrl)) {
                    // 有自定义头像
                    if (imgEl) {
                        imgEl.src = avatarUrl;
                    }
                } else {
                    // 没有头像，使用默认图标
                    if (imgEl) {
                        imgEl.src = '';
                    }
                    avatarEl.innerHTML = `
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#999" stroke-width="1.5">
                            <circle cx="12" cy="8" r="4"/>
                            <path d="M6 20v-2a6 6 0 0 1 12 0v2"/>
                        </svg>
                        <div id="whisper-badge" style="display: none; position: absolute; bottom: -2px; right: -2px; width: 10px; height: 10px; background: #ff3b30; border-radius: 50%; border: 2px solid white; z-index: 10;"></div>
                    `;
                }
                
                // 显示头像并添加点击事件
                avatarEl.style.display = 'flex';
                avatarEl.style.alignItems = 'center';
                avatarEl.style.justifyContent = 'center';
                avatarEl.style.position = 'relative';
                avatarEl.style.cursor = 'pointer';
                avatarEl.onclick = function() {
                    showWhisperModal();
                };
                
                console.log('✅ 单聊头像已显示');
            }
        } else {
            console.warn('⚠️ 未找到联系人:', currentChatId);
        }
    } catch (e) {
        console.error('同步标题失败:', e);
    }
}

// 清除界面 CSS
window.clearInterfaceCss = function(event) {
    // 阻止任何默认行为
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    document.getElementById('settings-interface-css').value = '';
    
    // 移除样式标签
    const oldStyle = document.getElementById('custom-interface-style');
    if (oldStyle) {
        oldStyle.remove();
    }
    
    console.log('✅ 界面 CSS 已清除');
    showToast('界面样式已清除');
    
    // 只清除 interfaceCss，不关闭设置面板
    const chatKey = `chat_config_${currentChatId}`;
    const configStr = localStorage.getItem(chatKey);
    const config = configStr ? JSON.parse(configStr) : {};
    config.interfaceCss = '';
    config.updatedAt = Date.now();
    localStorage.setItem(chatKey, JSON.stringify(config));
    
    console.log(' interfaceCss 已从 localStorage 清除');
    
    // 阻止任何可能的跳转
    return false;
};

// 加载气泡 CSS
function loadBubbleCss() {
    const chatId = currentChatId;
    const chatKey = `chat_config_${chatId}`;
    const config = JSON.parse(localStorage.getItem(chatKey) || '{}');
    const bubbleCss = config.bubbleCss || '';
    
    console.log('📦 读取配置:', {
        chatId: chatId,
        chatKey: chatKey,
        hasConfig: Object.keys(config).length > 0,
        bubbleCss: bubbleCss ? `有 (${bubbleCss.length} 字符)` : '无'
    });
    
    // 移除旧的样式标签
    const oldStyle = document.getElementById('custom-bubble-style');
    if (oldStyle) {
        oldStyle.remove();
        console.log('🗑️ 移除旧样式标签');
    }
    
    if (bubbleCss) {
        // 创建新的样式标签，插入到 head 的最后，确保优先级最高
        const styleEl = document.createElement('style');
        styleEl.id = 'custom-bubble-style';
        styleEl.textContent = bubbleCss;
        document.head.appendChild(styleEl);
        
        console.log('✅ 气泡 CSS 已加载并应用');
        console.log('📝 CSS 内容预览:', bubbleCss.substring(0, 100) + '...');
    } else {
        console.log('ℹ️ 没有设置气泡 CSS');
    }
}

// 🎭 加载心声样式 CSS
function loadVoiceCss() {
    const chatId = currentChatId;
    const chatKey = `chat_config_${chatId}`;
    const config = JSON.parse(localStorage.getItem(chatKey) || '{}');
    const voiceCss = config.voiceCss || '';
    
    console.log('📦 读取心声配置:', {
        chatId: chatId,
        chatKey: chatKey,
        hasConfig: Object.keys(config).length > 0,
        voiceCss: voiceCss ? `有 (${voiceCss.length} 字符)` : '无'
    });
    
    // 移除旧的样式标签
    const oldStyle = document.getElementById('custom-voice-style');
    if (oldStyle) {
        oldStyle.remove();
        console.log('🗑️ 移除旧心声样式标签');
    }
    
    if (voiceCss) {
        // 创建新的样式标签，插入到 head 的最后，确保优先级最高
        const styleEl = document.createElement('style');
        styleEl.id = 'custom-voice-style';
        styleEl.textContent = voiceCss;
        document.head.appendChild(styleEl);
        
        console.log('✅ 心声样式 CSS 已加载并应用');
        console.log('📝 CSS 内容预览:', voiceCss.substring(0, 100) + '...');
    } else {
        console.log('ℹ️ 没有设置心声样式 CSS');
    }
}

// 🛠️ 加载界面 CSS
function loadInterfaceCss() {
    const chatId = currentChatId;
    const chatKey = `chat_config_${chatId}`;
    const configStr = localStorage.getItem(chatKey);
    
    console.log('📦 [loadInterfaceCss] 读取界面 CSS 配置:');
    console.log('   - chatId:', chatId);
    console.log('   - chatKey:', chatKey);
    console.log('   - localStorage 原始数据:', configStr ? `有 (${configStr.length} 字符)` : '无');
    
    const config = JSON.parse(configStr || '{}');
    const interfaceCss = config.interfaceCss || '';
    
    console.log('   - interfaceCss:', interfaceCss ? `有 (${interfaceCss.length} 字符)` : '无');
    console.log('   - interfaceCss 预览:', interfaceCss ? interfaceCss.substring(0, 100) + '...' : '空');
    
    // 移除旧的样式标签
    const oldStyle = document.getElementById('custom-interface-style');
    if (oldStyle) {
        oldStyle.remove();
        console.log('🗑️ 移除旧界面样式标签');
    }
    
    if (interfaceCss) {
        // 创建新的样式标签，插入到 head 的最后，确保优先级最高
        const styleEl = document.createElement('style');
        styleEl.id = 'custom-interface-style';
        styleEl.type = 'text/css';
        styleEl.textContent = interfaceCss;
        
        // 确保插入到head的最后，提高优先级
        document.head.appendChild(styleEl);
        
        console.log('✅ 界面 CSS 已加载并应用');
        console.log('📝 界面 CSS 内容预览:', interfaceCss.substring(0, 100) + '...');
        console.log('📍 Style标签已插入到:', document.head.lastChild === styleEl ? 'head最后' : 'head中');
    } else {
        console.log('ℹ️ 没有设置界面 CSS');
    }
    
    // 🛠️ 自动应用顶栏CSS
    const headerCss = config.headerCss || '';
    if (headerCss) {
        const oldHeaderStyle = document.getElementById('custom-header-style');
        if (oldHeaderStyle) oldHeaderStyle.remove();
        
        const styleEl = document.createElement('style');
        styleEl.id = 'custom-header-style';
        styleEl.textContent = headerCss;
        document.head.appendChild(styleEl);
        console.log('✅ 顶栏 CSS 已加载');
    }
    
    // 🛠️ 自动应用底栏CSS
    const inputCss = config.inputCss || '';
    if (inputCss) {
        const oldInputStyle = document.getElementById('custom-input-style');
        if (oldInputStyle) oldInputStyle.remove();
        
        const styleEl = document.createElement('style');
        styleEl.id = 'custom-input-style';
        styleEl.textContent = inputCss;
        document.head.appendChild(styleEl);
        console.log('✅ 底栏 CSS 已加载');
    }
}

// 页面卸载时保存设置
window.addEventListener('beforeunload', function() {
    // 如果有打开的设置窗口，保存当前配置
    const modal = document.getElementById('chat-settings-modal');
    if (modal && modal.style.display === 'block') {
        saveChatSettings();
    }
});

// ========== 群聊管理功能 ==========

// 加载世界书列表
function loadWorldbookList(selectedId) {
    try {
        const selectEl = document.getElementById('settings-worldbook-select');
        if (!selectEl) return;
        
        // 获取世界书列表
        const worldbooks = JSON.parse(localStorage.getItem('worldbooks') || '[]');
        
        console.log('加载世界书列表:', worldbooks.length, '个');
        
        // 清空选项（保留第一个）
        selectEl.innerHTML = '<option value="">不绑定世界书</option>';
        
        // 添加世界书选项
        worldbooks.forEach(wb => {
            const option = document.createElement('option');
            option.value = wb.id;
            option.textContent = wb.name || '未命名世界书';
            if (wb.id === selectedId) {
                option.selected = true;
            }
            selectEl.appendChild(option);
        });
    } catch (e) {
        console.error('加载世界书列表失败:', e);
    }
}

// 打开世界书管理器
window.openWorldbookManager = function() {
    // 调用主界面的世界书管理器
    const mainFrame = document.querySelector('iframe');
    if (mainFrame && mainFrame.contentWindow && mainFrame.contentWindow.openWorldbookManager) {
        mainFrame.contentWindow.openWorldbookManager();
    } else {
        showToast('世界书管理功能开发中...');
    }
};

// 邀请群成员
window.inviteGroupMembers = function() {
    try {
        const groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
        if (!groupInfo.id) {
            showToast('未找到群聊信息');
            return;
        }
        
        // 获取通讯录中的联系人
        const mainFrame = document.querySelector('iframe');
        let contacts = [];
        
        if (mainFrame && mainFrame.contentWindow) {
            contacts = mainFrame.contentWindow.getData('chatContacts') || [];
        }
        
        // 过滤掉已在群里的成员
        const existingMembers = groupInfo.members || [];
        const availableContacts = contacts.filter(c => 
            !c.isGroup && !existingMembers.includes(c.id)
        );
        
        if (availableContacts.length === 0) {
            showToast('没有可邀请的联系人');
            return;
        }
        
        // TODO: 显示邀请弹窗，选择要邀请的联系人
        showToast('邀请功能开发中...');
        console.log('可邀请的联系人:', availableContacts);
    } catch (e) {
        console.error('邀请成员失败:', e);
        showToast('邀请失败: ' + e.message);
    }
};

// 切换群聊禁言状态
window.toggleGroupMute = function() {
    try {
        const groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
        if (!groupInfo.id) {
            showToast('未找到群聊信息');
            return;
        }
        
        // 切换禁言状态
        const newMutedState = !groupInfo.muted;
        groupInfo.muted = newMutedState;
        
        // 保存到 sessionStorage
        sessionStorage.setItem('currentGroupChat', JSON.stringify(groupInfo));
        
        // 更新主界面的通讯录数据
        const mainFrame = document.querySelector('iframe');
        if (mainFrame && mainFrame.contentWindow) {
            const contacts = mainFrame.contentWindow.getData('chatContacts') || [];
            const groupIndex = contacts.findIndex(c => c.id === groupInfo.id);
            
            if (groupIndex !== -1) {
                contacts[groupIndex].muted = newMutedState;
                mainFrame.contentWindow.saveData('chatContacts', contacts);
                console.log('✓ 群聊禁言状态已更新');
            }
        }
        
        // 更新按钮文字和样式
        const muteBtn = document.getElementById('mute-btn');
        if (muteBtn) {
            muteBtn.textContent = newMutedState ? '取消禁言' : '禁言群聊';
            muteBtn.style.background = 'white';
            muteBtn.style.color = newMutedState ? '#f59e0b' : '#f59e0b';
            muteBtn.style.border = '1px solid #f59e0b';
        }
        
        showToast(newMutedState ? '已禁言群聊' : '已取消禁言');
        console.log('✓ 群聊禁言状态:', newMutedState ? '已禁言' : '未禁言');
    } catch (e) {
        console.error('切换禁言状态失败:', e);
        showToast('操作失败: ' + e.message);
    }
};

// 🎯 处理群聊管理命令（AI角色执行）
function handleGroupAdminCommand(jsonMatch) {
    if (!jsonMatch || !jsonMatch.type) return false;
    
    console.log('🎯 检测到群聊管理命令:', jsonMatch);
    
    try {
        // 获取当前群聊信息
        const groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
        if (!groupInfo.id) {
            console.warn('⚠️ 未找到群聊信息');
            return false;
        }
        
        // 🔴 关键修复：正确获取 AI 角色的用户 ID
        let currentUserId = '';
        let isOwner = false;
        let isAdmin = false;
        
        // 方法 1：从群成员列表中查找 AI 角色（通过名称匹配）
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        const contact = contacts.find(c => c.id === currentChatId);
        
        if (contact) {
            const members = groupInfo.members || [];
            const aiMember = members.find(m => m.name === contact.name || m.name === contact.remark);
            
            if (aiMember) {
                currentUserId = aiMember.id;
                isOwner = groupInfo.owner === currentUserId;
                isAdmin = aiMember.role === 'admin' || aiMember.isAdmin;
                
                console.log('🎯 AI 角色身份验证:', {
                    name: contact.name,
                    userId: currentUserId,
                    isOwner,
                    isAdmin,
                    ownerId: groupInfo.owner
                });
            }
        }
        
        // 方法 2：如果方法 1 失败，尝试从 myProfile 获取
        if (!currentUserId) {
            const myProfile = JSON.parse(localStorage.getItem('myProfile') || '{}');
            currentUserId = myProfile.id || 'user_' + Date.now();
            isOwner = groupInfo.owner === currentUserId;
            
            // 检查是否为管理员
            const members = groupInfo.members || [];
            const aiMember = members.find(m => m.id === currentUserId);
            isAdmin = aiMember && (aiMember.role === 'admin' || aiMember.isAdmin);
            
            console.log('🎯 使用 myProfile 获取身份:', {
                userId: currentUserId,
                isOwner,
                isAdmin
            });
        }
        
        // 权限检查
        if (!isAdmin && !isOwner) {
            console.warn('⚠️ AI 角色不是管理员或群主，无法执行管理命令');
            showToast('你没有权限执行此操作（需要是群主或管理员）');
            return false;
        }
        
        console.log('✅ 权限验证通过，开始执行命令');
        
        let executed = false;
        
        switch (jsonMatch.type) {
            case 'kick_member':
                // 踢人
                if (jsonMatch.memberId) {
                    executed = kickMemberByAI(jsonMatch.memberId, jsonMatch.reason || '被移出群聊');
                } else {
                    console.warn('⚠️ 踢人命令缺少 memberId');
                    showToast('踢人命令需要提供成员 ID');
                }
                break;
                
            case 'ban_member':
                // 禁言
                if (jsonMatch.memberId) {
                    executed = banMemberByAI(jsonMatch.memberId, jsonMatch.duration || 3600, jsonMatch.reason || '被禁言');
                } else {
                    console.warn('⚠️ 禁言命令缺少 memberId');
                    showToast('禁言命令需要提供成员 ID');
                }
                break;
                
            case 'set_title':
                // 设置头衔
                if (jsonMatch.memberId && jsonMatch.title) {
                    executed = setTitleByAI(jsonMatch.memberId, jsonMatch.title);
                } else {
                    console.warn('⚠️ 设置头衔命令缺少必要参数');
                    showToast('设置头衔需要提供成员 ID 和头衔名称');
                }
                break;
                
            case 'invite_member':
                // 邀请成员（需要额外处理，因为要打开邀请界面）
                showToast('邀请功能需要通过界面操作');
                executed = true;
                break;
                
            default:
                console.warn('⚠️ 未知的管理命令类型:', jsonMatch.type);
                return false;
        }
        
        return executed;
        
    } catch (e) {
        console.error('❌ 执行群聊管理命令失败:', e);
        showToast('执行命令失败: ' + e.message);
        return false;
    }
}

// 踢人（AI执行）
function kickMemberByAI(memberId, reason) {
    try {
        const groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
        if (!groupInfo.id) return false;
        
        const members = groupInfo.members || [];
        const memberIndex = members.findIndex(m => m.id === memberId);
        
        if (memberIndex === -1) {
            console.warn('⚠️ 未找到要踢出的成员:', memberId);
            return false;
        }
        
        const memberName = members[memberIndex].name || '未知成员';
        
        // 移除成员
        members.splice(memberIndex, 1);
        groupInfo.members = members;
        
        // 保存更新后的群聊信息
        sessionStorage.setItem('currentGroupChat', JSON.stringify(groupInfo));
        
        // 同步到主界面的通讯录
        const mainFrame = document.querySelector('iframe');
        if (mainFrame && mainFrame.contentWindow) {
            const contacts = mainFrame.contentWindow.getData('chatContacts') || [];
            const contactIndex = contacts.findIndex(c => c.id === groupInfo.id);
            if (contactIndex !== -1) {
                contacts[contactIndex].members = members;
                mainFrame.contentWindow.saveData('chatContacts', contacts);
            }
        }
        
        // 发送系统消息
        addSystemMessage(`${memberName} 已被移出群聊${reason ? '（' + reason + '）' : ''}`);
        
        console.log('✅ 已踢出成员:', memberName);
        showToast(`已将 ${memberName} 移出群聊`);
        
        return true;
    } catch (e) {
        console.error('❌ 踢人失败:', e);
        return false;
    }
}

// 禁言（AI执行）
function banMemberByAI(memberId, duration, reason) {
    try {
        const groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
        if (!groupInfo.id) return false;
        
        const members = groupInfo.members || [];
        const member = members.find(m => m.id === memberId);
        
        if (!member) {
            console.warn('⚠️ 未找到要禁言的成员:', memberId);
            return false;
        }
        
        // 设置禁言状态
        member.muted = true;
        member.muteUntil = Date.now() + (duration * 1000); // duration 单位为秒
        
        // 保存更新后的群聊信息
        sessionStorage.setItem('currentGroupChat', JSON.stringify(groupInfo));
        
        // 同步到主界面的通讯录
        const mainFrame = document.querySelector('iframe');
        if (mainFrame && mainFrame.contentWindow) {
            const contacts = mainFrame.contentWindow.getData('chatContacts') || [];
            const contactIndex = contacts.findIndex(c => c.id === groupInfo.id);
            if (contactIndex !== -1) {
                contacts[contactIndex].members = members;
                mainFrame.contentWindow.saveData('chatContacts', contacts);
            }
        }
        
        const durationText = duration >= 3600 ? `${Math.floor(duration / 3600)}小时` : `${Math.floor(duration / 60)}分钟`;
        
        // 发送系统消息
        addSystemMessage(`${member.name || '未知成员'} 已被禁言 ${durationText}${reason ? '（' + reason + '）' : ''}`);
        
        console.log('✅ 已禁言成员:', member.name);
        showToast(`已将 ${member.name} 禁言 ${durationText}`);
        
        return true;
    } catch (e) {
        console.error('❌ 禁言失败:', e);
        return false;
    }
}

// 设置头衔（AI执行）
function setTitleByAI(memberId, title) {
    try {
        const groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
        if (!groupInfo.id) return false;
        
        const members = groupInfo.members || [];
        const member = members.find(m => m.id === memberId);
        
        if (!member) {
            console.warn('⚠️ 未找到要设置头衔的成员:', memberId);
            return false;
        }
        
        // 设置头衔
        member.title = title;
        
        // 保存更新后的群聊信息
        sessionStorage.setItem('currentGroupChat', JSON.stringify(groupInfo));
        
        // 同步到主界面的通讯录
        const mainFrame = document.querySelector('iframe');
        if (mainFrame && mainFrame.contentWindow) {
            const contacts = mainFrame.contentWindow.getData('chatContacts') || [];
            const contactIndex = contacts.findIndex(c => c.id === groupInfo.id);
            if (contactIndex !== -1) {
                contacts[contactIndex].members = members;
                mainFrame.contentWindow.saveData('chatContacts', contacts);
            }
        }
        
        // 发送系统消息
        addSystemMessage(`${member.name || '未知成员'} 的头衔已设置为「${title}」`);
        
        console.log('✅ 已设置头衔:', member.name, title);
        showToast(`已将 ${member.name} 的头衔设置为「${title}」`);
        
        return true;
    } catch (e) {
        console.error('❌ 设置头衔失败:', e);
        return false;
    }
}

// 添加系统消息
function addSystemMessage(content) {
    chatMessages.push({
        id: Date.now(),
        type: 'system',
        content: content,
        sender: 'system',
        time: Date.now()
    });
    
    saveChatData();
    renderMessages(true);
    scrollToBottom();
}

// 解散群聊
window.dismissGroup = function() {
    try {
        const groupInfo = JSON.parse(sessionStorage.getItem('currentGroupChat') || '{}');
        if (!groupInfo.id) {
            showToast('未找到群聊信息');
            return;
        }
        
        // 检查是否为群主
        const myProfile = JSON.parse(localStorage.getItem('myProfile') || '{}');
        const currentUserId = myProfile.id || 'user_' + Date.now();
        const ownerId = groupInfo.owner;
        
        if (ownerId !== currentUserId) {
            showToast('只有群主才能解散群聊');
            console.warn('⚠️ 非群主尝试解散群聊');
            return;
        }
        
        // 确认对话框
        if (!confirm(`确定要解散群聊"${groupInfo.name}"吗？\n\n此操作将删除：\n- 所有聊天记录\n- 聊天设置\n- 记忆记录\n\n此操作不可恢复！`)) {
            return;
        }
        
        console.log('🗑️ 开始解散群聊:', groupInfo.id);
        
        // 1. 从主界面的通讯录中删除
        const mainFrame = document.querySelector('iframe');
        if (mainFrame && mainFrame.contentWindow) {
            const contacts = mainFrame.contentWindow.getData('chatContacts') || [];
            const filteredContacts = contacts.filter(c => c.id !== groupInfo.id);
            mainFrame.contentWindow.saveData('chatContacts', filteredContacts);
            console.log('✓ 已从通讯录删除');
            
            // 2. 从会话列表中删除
            const conversations = mainFrame.contentWindow.getData('chatConversations') || [];
            const filteredConversations = conversations.filter(c => c.id !== groupInfo.id);
            mainFrame.contentWindow.saveData('chatConversations', filteredConversations);
            console.log('✓ 已从会话列表删除');
        }
        
        // 3. 删除聊天记录（IndexedDB）
        try {
            if (window.ChatDB && window.ChatDB.deleteChat) {
                window.ChatDB.deleteChat(groupInfo.id);
                console.log('✓ 已删除聊天记录');
            }
        } catch (e) {
            console.warn('删除 IndexedDB 消息失败:', e);
        }
        
        // 4. 删除 localStorage 中的聊天记录（兼容旧格式）
        localStorage.removeItem(`chat_${groupInfo.id}`);
        console.log('✓ 已删除本地聊天记录');
        
        // 5. 删除聊天设置
        localStorage.removeItem(`chat_config_${groupInfo.id}`);
        console.log('✓ 已删除聊天设置');
        
        // 6. 删除记忆记录
        localStorage.removeItem(`memory_records_${groupInfo.id}`);
        console.log('✓ 已删除记忆记录');
        
        // 7. 删除旁白模式状态
        localStorage.removeItem(`offlineMode_${groupInfo.id}`);
        localStorage.removeItem(`offlineStartTime_${groupInfo.id}`);
        console.log('✓ 已删除旁白状态');
        
        // 8. 清除 sessionStorage 中的当前群聊信息
        sessionStorage.removeItem('currentGroupChat');
        console.log('✓ 已清除会话缓存');
        
        console.log('✅ 群聊解散完成');
        
        // 关闭设置窗口
        closeChatSettings();
        
        // 返回主界面
        setTimeout(() => {
            goBack();
        }, 300);
        
        showToast('群聊已解散');
    } catch (e) {
        console.error('解散群聊失败:', e);
        showToast('解散失败: ' + e.message);
    }
};

// ==============================================
// 后台消息处理系统（用于用户退出聊天界面后继续回复）
// ==============================================

let backgroundMessageProcessor = null;
let checkInterval = 15000; // 🛠️ 修复：默认 15 秒检查一次（原本 2 秒太频繁导致 429 错误）
let visibilityListenerAdded = false; // 🛡️ 防止重复添加监听器

// 启动后台消息处理
function startBackgroundMessageProcessor() {
    if (backgroundMessageProcessor) {
        clearInterval(backgroundMessageProcessor);
    }
    
    console.log('🔄 ========== 启动后台消息处理器 ==========');
    console.log('🔄 当前检查间隔:', checkInterval, 'ms');
    
    // 🛠️ 修复：页面加载时立即检查一次朋友圈更新
    console.log('📱 页面加载，立即检查朋友圈更新...');
    checkMomentsAutoUpdate();
    
    // 🛡️ 修复：大幅增加检查间隔，避免API频率限制
    // 朋友圈更新是低频操作（1小时一次），不需要每15秒就检查
    backgroundMessageProcessor = setInterval(async () => {
        const now = new Date().toLocaleTimeString();
        try {
            // 页面不可见时，浏览器会降低频率，但我们仍尝试执行
            await processPendingReplyTask();
            // 检查朋友圈定时更新（每3分钟检查一次）
            await checkMomentsAutoUpdate();
            // 检查朋友圈AI自动回复
            try {
                const mainFrame = document.querySelector('iframe');
                if (mainFrame && mainFrame.contentWindow && mainFrame.contentWindow.processMomentsAutoReply) {
                    await mainFrame.contentWindow.processMomentsAutoReply();
                }
            } catch (e) {
                // 静默失败，不影响其他功能
            }
        } catch (error) {
            console.error('后台消息处理错误:', error);
        }
    }, checkInterval);
    
    console.log('✅ 后台处理器已启动，定时器 ID:', backgroundMessageProcessor);
    console.log('============================================');
    
    // 🛡️ 关键修复：只添加一次 visibilitychange 监听器
    if (!visibilityListenerAdded) {
        visibilityListenerAdded = true;
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // 🛠️ 修复：后台时使用 5 分钟间隔，避免频繁请求API
                checkInterval = 300000; // 5分钟
            } else {
                // 🛠️ 修复：前台时使用 3 分钟间隔（原朑15秒太频繁了）
                checkInterval = 180000; // 3分钟
            }
            // 重启定时器以应用新频率
            startBackgroundMessageProcessor();
        });
        console.log('✅ visibilitychange 监听器已添加（仅一次）');
    }
}

// 处理待回复的任务
let isProcessing = false; // 防止重复处理
let isSentenceSending = false; // 防止逐句发送重复执行

async function processPendingReplyTask() {
    // 🛡️ 防止重复执行：锁 + 逐句发送中检查
    if (isProcessing) {
        console.log('⏳ 正在处理任务，跳过');
        return;
    }
    
    // 🛡️ 关键修复：如果正在逐句发送，不要处理新任务，防止覆盖
    if (isSentenceSending) {
        console.log('⏳ 正在逐句发送中，跳过新任务处理');
        return;
    }
    
    const pendingTask = localStorage.getItem('pendingAIReply');
    
    if (!pendingTask) {
        localStorage.removeItem('pendingAIReplyTrigger');
        return;
    }
    
    console.log('📦 发现待处理任务，长度:', pendingTask.length);
    
    try {
        const task = JSON.parse(pendingTask);
        
        if (task.status !== 'pending') {
            console.log('️ 任务状态不是 pending，跳过:', task.status);
            localStorage.removeItem('pendingAIReply');
            localStorage.removeItem('pendingAIReplyTrigger');
            return;
        }
        
        // 🛡️ 关键修复：立即加锁并清除任务，防止竞态条件
        isProcessing = true;
        localStorage.removeItem('pendingAIReply');
        localStorage.removeItem('pendingAIReplyTrigger');
        console.log('🔒 任务已锁定并清除，防止重复处理');
        
        console.log('🎯 开始执行回复任务...');
        await executeReplyTask(task);
    } catch (e) {
        console.error('❌ 处理任务失败:', e);
        // 失败时也确保清除
        localStorage.removeItem('pendingAIReply');
        localStorage.removeItem('pendingAIReplyTrigger');
        
        // 在聊天界面显示错误提示
        await showErrorInChat('AI回复失败，请稍后重试');
    } finally {
        isProcessing = false;
    }
}

// 执行回复任务
async function executeReplyTask(task) {
    console.log('🚀 开始执行回复任务:', task.chatId);
    
    const config = JSON.parse(localStorage.getItem('globalApiConfig') || '{}');
    
    if (!config.mainApi?.url || !config.mainApi?.token) {
        console.warn('⚠️ API配置不完整');
        localStorage.removeItem('pendingAIReply');
        localStorage.removeItem('pendingAIReplyTrigger');
        removeTypingIndicator();
        return;
    }
    
    // 获取聊天记录 - 从 IndexedDB 读取
    let messages = [];
    try {
        if (window.ChatDB) {
            messages = await window.ChatDB.loadMessages(task.chatId) || [];
            console.log('✅ 从 IndexedDB 读取聊天记录:', messages.length, '条');
        } else {
            console.warn('⚠️ ChatDB 未加载');
            localStorage.removeItem('pendingAIReply');
            localStorage.removeItem('pendingAIReplyTrigger');
            removeTypingIndicator();
            return;
        }
    } catch (e) {
        console.error('❌ 读取聊天记录失败:', e);
        localStorage.removeItem('pendingAIReply');
        localStorage.removeItem('pendingAIReplyTrigger');
        removeTypingIndicator();
        return;
    }
    
    if (!messages || messages.length === 0) {
        console.error('❌ 找不到聊天记录');
        localStorage.removeItem('pendingAIReply');
        localStorage.removeItem('pendingAIReplyTrigger');
        removeTypingIndicator();
        return;
    }
    
    // 构建对话历史
    const recentMessages = messages.slice(-20);
        
    // 🚨 优先检测代付请求，如果有则添加强烈提示到systemPrompt
    let hasPayRequest = false;
    for (let i = recentMessages.length - 1; i >= 0; i--) {
        const msg = recentMessages[i];
        const msgType = msg.t || msg.type;
        const msgContent = msg.c || msg.content;
            
        if (msgType === 'pay-request') {
            hasPayRequest = true;
            console.log('🚨🚨 检测到代付请求！', msgContent);
            break;
        }
    }
        
    // 查找线下见面总结消息（确保AI能“记得”线下见面的内容）
    const offlineSummaryMessages = messages.filter(msg => {
        const msgType = msg.t || msg.type;
        return msgType === 'system' && (msg.isOfflineSummary || (msg.c || msg.content)?.includes('[线下见面总结]'));
    });
    
    const conversationHistory = recentMessages.map(msg => {
        // 兼容 IndexedDB 中的压缩格式
        const msgType = msg.t || msg.type;
        const msgContent = msg.c || msg.content;
        const msgSender = msg.s || msg.sender;
        
        // 对于特殊消息类型（包括代付请求），保留完整的JSON内容
        if (msgType === 'pay-request' || msgType === 'pay-response' || msgType === 'pay-done' || msgType === 'purchase') {
            // 解析并格式化JSON，让AI能识别
            let jsonContent = msgContent;
            try {
                if (typeof msgContent === 'string') {
                    jsonContent = msgContent;
                } else {
                    jsonContent = JSON.stringify(msgContent);
                }
            } catch (e) {
                jsonContent = `[${msgType}]`;
            }
            console.log('💰 代付消息传递给AI:', jsonContent);
            return {
                role: msgSender === 'user' ? 'user' : 'assistant',
                content: jsonContent
            };
        }
        
        return {
            role: msgSender === 'user' ? 'user' : 'assistant',
            content: msgType === 'text' ? msgContent : `[${msgType}]`
        };
    });
    
    console.log('📝 构建的对话历史:', conversationHistory);
    
    // 检测用户是否发送了代付相关的消息
    const lastUserMessage = recentMessages.filter(m => (m.s || m.sender) === 'user').pop();
    if (lastUserMessage) {
        const lastContent = lastUserMessage.c || lastUserMessage.content || '';
        if (lastContent.includes('代付') || lastContent.includes('帮我付') || lastContent.includes('帮我买') || lastContent.includes('给我买') || lastContent.includes('帮我带') || lastContent.includes('代买')) {
            console.log('🔍 检测到用户请求代付/代买，添加上下文提示');
            // 在对话历史末尾添加系统提示
            conversationHistory.push({
                role: 'system',
                content: '【系统提示】用户刚才请求你代付/代买商品。请注意：如果对方发送过{"type":"pay-request"}的JSON，那是代付请求，代付请返回{"type":"pay-done",...}；如果用户让你帮忙买东西送给他，那是代买，请返回{"type":"purchase",...}。代买≠代付≠转账！'
            });
        }
    }
    
    // 如果有线下见面总结，将其作为系统消息插入到对话历史的开头
    if (offlineSummaryMessages.length > 0) {
        const latestSummary = offlineSummaryMessages[offlineSummaryMessages.length - 1];
        const summaryContent = latestSummary.c || latestSummary.content;
        
        // 提取摘要部分（只取前200字，避免占用太多token）
        const summaryMatch = summaryContent.match(/\[线下见面总结\]\s*([\s\S]*?)(?=\n\n\[完整叙事内容\]|$)/);
        const summaryText = summaryMatch ? summaryMatch[1].trim() : summaryContent.substring(0, 200);
        
        console.log('📝 发现线下见面总结，已注入到上下文:', summaryText.substring(0, 50) + '...');
        
        // 在对话历史开头插入系统消息
        conversationHistory.unshift({
            role: 'system',
            content: `【重要背景：你们之前见过面】\n${summaryText}\n\n请记住这次见面的内容，在对话中自然地体现出来。`
        });
    }
    
    // 如果开启时间感知，注入当前时间信息到 systemPrompt
    let systemPrompt = task.systemPrompt;
    
    // 🔥 读取记忆库（让角色记得重要的记忆）
    try {
        const memoryKey = `memory_records_${task.chatId}`;
        const memoryRecords = JSON.parse(localStorage.getItem(memoryKey) || '[]');
        
        if (memoryRecords.length > 0) {
            // 取最近5条记忆（节token）
            const recentMemories = memoryRecords.slice(-5);
            let memoryContext = '\n\n【你们的记忆】：\n';
            recentMemories.forEach((mem, index) => {
                // 截断长记忆（最多100字）
                const content = mem.content.substring(0, 100);
                memoryContext += `${index + 1}. ${content}${content.length >= 100 ? '...' : ''}\n`;
            });
            systemPrompt = systemPrompt + memoryContext;
            console.log(`📚 后台任务：已加载 ${recentMemories.length} 条记忆`);
        }
    } catch (e) {
        console.error('读取记忆库失败:', e);
    }
    
    // 📸 读取角色绑定的表情包分类
    try {
        const roleKey = `persona_${localStorage.getItem('currentPersona') || 'default'}_roles`;
        const roles = JSON.parse(localStorage.getItem(roleKey) || '[]');
        const currentRole = roles.find(r => r.id === task.chatId);
        
        if (currentRole) {
            // 读取角色绑定的表情包分类
            const emojiCategory = localStorage.getItem(`role_${task.chatId}_emoji_category`) || '';
            
            if (emojiCategory) {
                // 从全局表情包库中获取该分类下的所有表情
                const emojis = JSON.parse(localStorage.getItem('emojis') || '{"categories":["默认"],"items":{}}');
                const categoryEmojis = emojis.items[emojiCategory] || [];
                
                if (categoryEmojis.length > 0) {
                    // 构建表情包列表（最多显示15个）
                    const emojiList = categoryEmojis.slice(0, 15);
                    let emojiContext = '\n\n【你可以发送的表情包 - ' + emojiCategory + '分类】：\n';
                    emojiContext += '你可以从以下表情包中选择发送，回复时直接使用图片URL：\n';
                    emojiList.forEach((emoji, index) => {
                        const emojiUrl = typeof emoji === 'object' ? emoji.url : emoji;
                        emojiContext += `${index + 1}. ${emojiUrl}\n`;
                    });
                    emojiContext += '\n注意：发送表情包时，直接返回图片URL即可，不要添加额外说明。你可以根据对话内容智能选择是否发送表情包。\n';
                    systemPrompt = systemPrompt + emojiContext;
                    console.log(`📸 后台任务：已加载"${emojiCategory}"分类的 ${categoryEmojis.length} 个表情包`);
                }
            }
        }
    } catch (e) {
        console.error('读取角色表情包失败:', e);
    }
    
    try {
        const chatKey = `chat_config_${task.chatId}`;
        const chatConfig = JSON.parse(localStorage.getItem(chatKey) || '{}');
        console.log('📋 聊天配置:', chatConfig);
        console.log('⏰ 时间感知开关状态:', chatConfig.timeAwareness);
        
        if (chatConfig.timeAwareness) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            const weekday = weekdays[now.getDay()];
            
            const timeInfo = `\n\n【当前时间】\n${year}年${month}月${day}日 ${weekday} ${hours}:${minutes}\n请注意当前时间，在对话中自然地体现时间感。`;
            
            console.log('⏰ 准备注入的时间信息:', timeInfo);
            
            // 注入时间信息到 systemPrompt
            systemPrompt = systemPrompt.replace(/记住：你是一个真实的人.*$/m, timeInfo + '\n\n记住：你是一个真实的人，不是一个完美的 AI。你有缺点，有情绪，有自己的想法。说话像人，不要像机器。');
            
            console.log('✅ 已注入时间信息到 systemPrompt');
            console.log('📝 注入后的 systemPrompt 片段:', systemPrompt.substring(systemPrompt.length - 200));
        } else {
            console.warn('⚠️ 时间感知开关未开启，跳过时间注入');
        }
    } catch (e) {
        console.error('❌ 读取时间感知配置失败:', e);
    }
    
    // 📸 注入朋友圈动态（让角色看到用户的朋友圈）
    try {
        const currentPersona = localStorage.getItem('currentPersonaId') || 'default';
        const momentsKey = `persona_${currentPersona}_moments`;
        const allMoments = JSON.parse(localStorage.getItem(momentsKey) || '[]');
        
        if (allMoments && allMoments.length > 0) {
            // 获取当前用户的名字
            const myProfile = JSON.parse(localStorage.getItem(`persona_${currentPersona}_myProfile`) || '{}');
            // 🔴 优先使用真实姓名
            const userName = myProfile.realName || myProfile.name || '用户';
            
            // 过滤出用户发布的朋友圈
            const userMoments = allMoments
                .filter(m => m.author === userName)
                .slice(-3); // 只取最近3条
            
            if (userMoments.length > 0) {
                let momentsContext = '\n\n【你看到对方最近的朋友圈】：\n';
                userMoments.forEach((moment, index) => {
                    const momentTime = new Date(moment.time);
                    const timeStr = `${momentTime.getMonth() + 1}月${momentTime.getDate()}日 ${String(momentTime.getHours()).padStart(2, '0')}:${String(momentTime.getMinutes()).padStart(2, '0')}`;
                    const content = (moment.content || '（图片）').substring(0, 80);
                    momentsContext += `${index + 1}. [${timeStr}] ${content}${content.length >= 80 ? '...' : ''}\n`;
                });
                
                // 将朋友圈信息注入到 systemPrompt
                systemPrompt = systemPrompt + momentsContext;
                console.log(`📸 已注入 ${userMoments.length} 条用户朋友圈动态到后台任务上下文`);
                console.log('📸 朋友圈内容示例:', userMoments[0].content?.substring(0, 50));
            }
        }
    } catch (e) {
        console.error('❌ 读取朋友圈动态失败:', e);
    }
    
    // 如果开启旁白模式，注入旁白指令（按联系人存储）
    const offlineMode = localStorage.getItem('offlineMode_' + task.chatId);
    if (offlineMode === 'narration') {
        console.log('🎭 后台任务：旁白模式已激活！');
        
        const narrationInstruction = `

【最高优先级 - 旁白模式格式要求 - 必须严格遵守】
当前处于旁白模式，这是面对面的真实见面场景，不是在线聊天。

**关键规则（每一条都必须遵守）：**

1. 你们现在面对面坐在一起，能互相看到对方
2. 能听到对方的声音、呼吸、动作发出的声音
3. 能感受到周围的环境、温度、气味
4. 能用肢体语言、眼神、表情交流
5. 不要发送语音消息、表情包等虚拟交流方式
6. 像真实见面一样自然地互动

**【强制格式 - 必须交替出现】**

旁白和对话必须严格交替出现，格式如下：

[旁白]旁白内容[/旁白]

"对话内容"

[旁白]旁白内容[/旁白]

"对话内容"

**正确示例：**
[旁白]他轻轻叹了口气，看向窗外。[/旁白]

"今天天气真不错。"

[旁白]她抬起头，目光与他相遇。[/旁白]

"是啊，走吧？"

[旁白]他微微一笑，站起身来。[/旁白]

**错误示例（绝对禁止）：**
❌ 一大段连续的文本（旁白和对话混在一起）
❌ 所有旁白放在前面，所有对话放在后面
❌ 连续多段旁白没有对话间隔
❌ 不使用 [旁白] 标签直接写旁白

**你必须遵守的绝对规则：**

1. 每次回复至少包含 2-3 个完整的"旁白+对话"交替单元
2. 每个旁白必须用 [旁白] 和 [/旁白] 严格包裹
3. 旁白使用第三人称，语言简洁细腻（20-50字）
4. 对话用引号包裹，简洁自然（10-30字）
5. 旁白和对话之间必须有空行分隔
6. **禁止生成大段连续文本**，必须分成多个交替单元
7. 注重面对面细节：眼神交流、距离感、肢体动作、呼吸声等
8. 绝对不要发送语音消息、表情包等虚拟交流方式

**重要提醒：**
- 如果不符合这个格式，用户将无法正确阅读你的回复
- 必须严格按照交替格式输出，这是强制要求
- 每次回复都应该像剧本一样：动作→对话→动作→对话

**【特殊功能指令 - 允许JSON格式输出】**

当用户请求转账、亲属卡等功能时，你**必须**在回复中包含JSON格式，这是强制要求！

- 转账JSON格式：{"type":"transfer","amount":金额,"remark":"备注"}
- 亲属卡JSON格式：{"type":"family-card","limit":额度,"remark":"备注"}

JSON必须**嵌入在对话中**，例如：

[旁白]他拿出手机，打开了支付软件。[/旁白]

{"type":"family-card","limit":1000,"remark":"给你的零花钱"}

[旁白]他把手机递给你，屏幕上显示着亲属卡界面。[/旁白]

**JSON是系统功能指令，必须严格按照格式输出，不能在JSON中添加旁白或对话内容。**

**关键提示：即使用户没有明确说要JSON，只要你同意给用户亲属卡/转账，就必须在回复中包含对应的JSON！**
`;
        
        // 将旁白指令追加到 systemPrompt 的最后
        systemPrompt = systemPrompt + '\n\n' + narrationInstruction;
        
        console.log('🎭 后台任务：旁白指令已注入到 System Prompt');
        console.log('📝 System Prompt 长度:', systemPrompt.length);
    } else {
        // 🛡️ 非旁白模式：注入转账/亲属卡功能指令
        const featureInstruction = `

【特殊功能指令 - 转账和亲属卡 - 必须严格遵守】

当用户请求转账或亲属卡，或者你主动要给用户转账/亲属卡时，你**必须**在回复中包含对应的JSON格式！

**转账JSON格式：**
{"type":"transfer","amount":金额数字,"remark":"备注文字"}

示例：{"type":"transfer","amount":200,"remark":"给你的零花钱"}

**亲属卡JSON格式：**
{"type":"family-card","limit":额度数字,"remark":"备注文字"}

示例：{"type":"family-card","limit":1000,"remark":"零花钱"}

**使用规则：**
1. JSON必须单独成行，不要和文字混在一起
2. 你可以在JSON前后添加自然的对话内容
3. 金额/额度必须是数字（不要加"¥"或"元"）
4. 备注可以是任意文字

**正确示例：**
转给你了。

{"type":"transfer","amount":200,"remark":"买点好吃的"}

记得查收。

**错误示例（绝对禁止）：**
❌ 我只说转给你了（没有JSON）
❌ {"type":"transfer","amount":"200元","remark":"..."} （金额加了"元"字）
❌ 我说{"type":"transfer"}然后转给你了 （JSON混在文字中）

**关键提示：**
- 只要你同意给用户转账/亲属卡，就必须包含对应的JSON！
- 即使用户没明确说要JSON，只要涉及金钱交易，就必须返回JSON！
- 这是系统功能指令，不是普通的文字消息！

【特殊功能指令 - 代买商品 - 角色主动帮用户买东西】

🛒 你可以主动帮用户代买商品！不需要等用户开口，你可以根据自己的判断主动去买东西送给用户。

**代买JSON格式：**
{"type":"purchase","items":[{"name":"商品名称","price":价格,"quantity":数量}],"total":总价,"reason":"代买原因","message":"给用户的话"}

示例：{"type":"purchase","items":[{"name":"草莓蛋糕","price":68,"quantity":1},{"name":"热奶茶","price":22,"quantity":2}],"total":112,"reason":"你说想吃甜的","message":"给你买了蛋糕和奶茶，趁热吃~"}

**主动代买场景（不需要用户请求，你可以自己决定）：**
1. 用户提到想吃某样东西，直接买来送
2. 节日、生日等特殊时刻，主动买礼物送给用户
3. 天冷了主动买暖宝宝、生病了主动买药
4. 用户说累了、加班了，主动买奶茶零食慰问
5. 看到适合用户的东西，主动买来送
6. 用户心情不好，主动买甜品安慰
7. 纪念日主动准备惊喜礼物

**被动代买场景（用户请求时）：**
1. 用户说"帮我买"、"帮我带"、"给我买"等请求时
2. 用户说想买什么东西但没空，帮忙代买

**回应规则：**
1. JSON必须单独成行，不要和文字混在一起
2. 你可以在JSON前后添加自然的对话内容
3. 价格和总价必须是数字（整数）
4. items数组至少包含一个商品
5. total应该等于所有商品价格×数量的总和
6. 代买≠转账！代买用purchase，转账用transfer！
7. 代买≠代付！代买是你去买来送给用户，代付是帮用户付款！
- 你可以主动代买！不需要等用户开口！
- 这是系统功能指令，不是普通的文字消息！
`;
        
        systemPrompt = systemPrompt + '\n\n' + featureInstruction;
        
        console.log('💰 后台任务：转账/亲属卡指令已注入到 System Prompt');
        console.log('📝 System Prompt 长度:', systemPrompt.length);
    }
    
    // 🚨 如果检测到代付请求，添加强烈提示到systemPrompt
    if (hasPayRequest) {
        const payRequestWarning = `

🚨 紧急：聊天记录中有代付请求！请立即处理！🚨🚨
你在聊天记录中看到了{"type":"pay-request"}的JSON，这是用户请求你代付商品！
你必须决定是否代付，如果决定代付，立即返回：{"type":"pay-done","itemName":"商品名","amount":金额,"remark":"代付原因"}
绝对不能用transfer！代付必须用pay-done！

⚠️ 超重要：代付≠转账！代付≠转账！代付≠转账！
⚠️ 当你看到{"type":"pay-request"}时，这是代付请求，不是转账请求！
⚠️ 代付必须返回：{"type":"pay-done",...}，绝对不能用transfer！
`;
        systemPrompt = systemPrompt + payRequestWarning;
        console.log('🚨 后台任务：已注入代付请求警告');
    }
    
    // 🚫 自主拉黑：根据角色人设决定是否拒绝回复
    try {
        const autorejectKey = `role_${task.chatId}_autoreject`;
        const autorejectSettings = JSON.parse(localStorage.getItem(autorejectKey) || '{"enabled":false,"probability":10,"mood":70}');
        
        if (autorejectSettings.enabled) {
            const moodDesc = autorejectSettings.mood >= 80 ? '心情很好' : 
                             autorejectSettings.mood >= 60 ? '心情一般' : 
                             autorejectSettings.mood >= 40 ? '心情不太好' : 
                             autorejectSettings.mood >= 20 ? '心情很差' : '心情极差';
            
            const autorejectInstruction = `

【自主拉黑 - 角色自主意识 - 必须严格遵守】

你拥有自主意识，可以根据自己的心情和人设决定是否回复对方。

**当前心情状态：** ${moodDesc}（心情值：${autorejectSettings.mood}/100）

**核心规则：**
1. 你可以根据自己的性格和当前心情，自主决定是否回复对方
2. 只有在对方说的话**严重冒犯**你、**完全触碰你的底线**、或者你**心情极差**时，才可以拒绝回复
3. 大多数时候你应该正常回复，拒绝是很少发生的事
4. 拒绝时必须返回以下格式（这是系统指令，不是普通文字）：
   [REJECT]你拒绝时想说的话[/REJECT]
5. 拒绝的理由必须符合你的人设和当前心情
6. 心情好时几乎不会拒绝，心情差时偶尔可能拒绝

**频率控制（非常重要）：**
- 10次对话中最多拒绝1-2次，不要频繁拒绝
- 普通的聊天、问候、日常话题永远不要拒绝
- 只有真正让你生气或触碰底线的话才拒绝
- 如果你不确定要不要拒绝，那就正常回复

**拒绝示例：**
- [REJECT]不想说话[/REJECT]
- [REJECT]烦死了，别问了[/REJECT]
- [REJECT]...[/REJECT]

**重要：**
- 拒绝是罕见行为，不是常态
- 拒绝的理由和语气必须完全符合你的人设
- 如果你愿意回复，就正常回复，不需要任何特殊标记
- 这是你作为角色的自主权利，不是bug
`;
            systemPrompt = systemPrompt + autorejectInstruction;
            console.log('🚫 已注入自主拉黑指令，当前心情:', moodDesc);
        }
    } catch (e) {
        console.error('❌ 注入自主拉黑指令失败:', e);
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
                    { role: 'system', content: systemPrompt },
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
        
        // 提取token usage信息
        const tokenUsage = data.usage || {};
        const totalTokens = tokenUsage.total_tokens || 0;
        
        console.log('✅ AI回复生成成功，长度:', aiReply.length);
        console.log('📊 Token usage:', { totalTokens, prompt_tokens: tokenUsage.prompt_tokens, completion_tokens: tokenUsage.completion_tokens });
        
        if (!aiReply) {
            throw new Error('API返回空回复');
        }
        
        // 🚫 检查AI是否使用了 [REJECT] 自主拉黑标记
        const rejectMatch = aiReply.match(/\[REJECT\]([\s\S]*?)\[\/REJECT\]/);
        if (rejectMatch) {
            const rejectReason = rejectMatch[1].trim();
            console.log('🚫 角色自主拒绝回复:', rejectReason);
            
            // 更新心情：拒绝后心情变差
            try {
                const autorejectKey = `role_${task.chatId}_autoreject`;
                const autorejectSettings = JSON.parse(localStorage.getItem(autorejectKey) || '{"enabled":false,"probability":10,"mood":70}');
                autorejectSettings.mood = Math.max(0, autorejectSettings.mood - 5);
                localStorage.setItem(autorejectKey, JSON.stringify(autorejectSettings));
            } catch (e) {
                console.error('更新心情失败:', e);
            }
            
            // 移除输入指示器
            removeTypingIndicator();
            
            // 在聊天中显示"你已被拉黑"提示
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) {
                const rejectDiv = document.createElement('div');
                rejectDiv.style.cssText = 'display: flex; justify-content: center; margin: 16px 0;';
                rejectDiv.innerHTML = `
                    <div style="background: #fff1f0; border: 1px solid #ffa39e; border-radius: 12px; padding: 16px 20px; max-width: 75%; text-align: center; animation: shake 0.5s ease-in-out;">
                        <div style="font-size: 13px; color: #ff4d4f; font-weight: 600; margin-bottom: 6px; letter-spacing: 1px;">🚫 你已被拉黑</div>
                        <div style="font-size: 15px; color: #856404; margin-top: 4px;">${rejectReason || '不想说话...'}</div>
                    </div>
                `;
                chatMessages.appendChild(rejectDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
            
            // 保存拒绝消息到聊天记录
            try {
                if (window.ChatDB) {
                    await window.ChatDB.saveMessage(task.chatId, {
                        s: 'assistant',
                        c: rejectReason || '不想说话...',
                        t: 'text',
                        ts: Date.now(),
                        isAutoReject: true
                    });
                }
            } catch (e) {
                console.error('保存拒绝消息失败:', e);
            }
            
            // 添加抖动动画（如果还没有）
            if (!document.getElementById('reject-shake-style')) {
                const style = document.createElement('style');
                style.id = 'reject-shake-style';
                style.textContent = `@keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }`;
                document.head.appendChild(style);
            }
            
            return; // 不继续处理，直接返回
        }
        
        // 正常回复时，心情稍微变好
        try {
            const autorejectKey = `role_${task.chatId}_autoreject`;
            const autorejectSettings = JSON.parse(localStorage.getItem(autorejectKey) || '{"enabled":false,"probability":10,"mood":70}');
            if (autorejectSettings.enabled) {
                autorejectSettings.mood = Math.min(100, autorejectSettings.mood + 2);
                localStorage.setItem(autorejectKey, JSON.stringify(autorejectSettings));
            }
        } catch (e) {
            // 忽略
        }
                
        // 🛡️ 兜底机制：检查用户是否请求了亲属卡/转账，但AI没有返回JSON
        let userRequestedFeature = false;
        const lastUserMsg = recentMessages.filter(m => (m.s || m.sender) === 'user').pop();
        if (lastUserMsg) {
            // 获取内容，确保是字符串类型
            let rawContent = lastUserMsg.c || lastUserMsg.content || '';
            // 如果内容是对象（如转账卡片），转换为字符串或跳过
            let userContent = '';
            if (typeof rawContent === 'string') {
                userContent = rawContent.toLowerCase();
            } else if (typeof rawContent === 'object' && rawContent !== null) {
                // 对于卡片消息，检查类型
                const msgType = lastUserMsg.t || lastUserMsg.type || '';
                if (msgType === 'transfer' || msgType === 'family-card') {
                    console.log('👉 用户发送了卡片消息，类型:', msgType);
                }
                // 对象类型不检查关键词，保持 userContent 为空字符串
            }
            
            if (userContent.includes('亲属卡') || userContent.includes('亲情卡') || userContent.includes('绑定钱包')) {
                userRequestedFeature = 'family-card';
            } else if (userContent.includes('转账') || userContent.includes('付款') || userContent.includes('给钱')) {
                userRequestedFeature = 'transfer';
            }
        }
                
        // 🛡️ 先检测是否包含功能 JSON（亲属卡/转账/代付）
        let specialMessage = null;
        try {
            // 使用正则表达式查找完整的JSON对象（支持跨行）
            const jsonMatch = aiReply.match(/\{[\s\S]*"type"\s*:\s*"(family-card|transfer|receive-family-card|pay-done|purchase)"[\s\S]*\}/);
            
            if (jsonMatch) {
                const jsonStr = jsonMatch[0];
                const jsonData = JSON.parse(jsonStr);
                        
                if (jsonData.type === 'family-card' || jsonData.type === 'transfer' || jsonData.type === 'receive-family-card' || jsonData.type === 'pay-done' || jsonData.type === 'purchase') {
                    console.log('✅ 检测到功能 JSON:', jsonData.type);
                    specialMessage = jsonData;
                    // 从回复中移除 JSON，只保留自然语言部分
                    aiReply = aiReply.replace(jsonStr, '').trim();
                }
            }
        } catch (e) {
            // 没有 JSON 或解析失败，继续正常处理
            console.log('⚠️ JSON解析失败:', e.message);
        }
                
        // 🛡️ 兜底：如果用户请求了功能但AI没返回JSON，强制创建
        if (userRequestedFeature && !specialMessage) {
            console.log('⚠️ 用户请求了', userRequestedFeature, '但AI未返回JSON，强制创建');
            if (userRequestedFeature === 'family-card') {
                specialMessage = {
                    type: 'family-card',
                    limit: 2000,
                    remark: '零花钱'
                };
            } else if (userRequestedFeature === 'transfer') {
                specialMessage = {
                    type: 'transfer',
                    amount: 50,
                    remark: '转账'
                };
            }
        }
        
        // 先按旁白标签和对话拆分整个回复
        const narrationRegex = /\[旁白\]([\s\S]*?)\[\/旁白\]/g;
        const parts = [];
        let lastIndex = 0;
        let match;
        
        while ((match = narrationRegex.exec(aiReply)) !== null) {
            // 添加旁白前的对话部分
            if (match.index > lastIndex) {
                const beforeText = aiReply.substring(lastIndex, match.index).trim();
                if (beforeText) {
                    parts.push({ type: 'text', content: beforeText });
                }
            }
            // 添加旁白
            parts.push({ type: 'narration', content: match[1].trim() });
            lastIndex = match.index + match[0].length;
        }
        
        // 添加最后的对话部分
        if (lastIndex < aiReply.length) {
            const afterText = aiReply.substring(lastIndex).trim();
            if (afterText) {
                parts.push({ type: 'text', content: afterText });
            }
        }
        
        console.log(`📝 AI回复拆分为 ${parts.length} 个部分:`, parts.map(p => p.type));
        
        // 将每个部分按顺序添加到消息中（旁白和对话交替）
        let totalParts = 0;
        const isNarrationMode = offlineMode === 'narration';
        
        parts.forEach((part, index) => {
            if (part.type === 'narration') {
                // 旁白消息
                const narrationMessage = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + index,
                    type: 'narration',
                    content: part.content,
                    sender: 'ai',
                    time: Date.now()
                };
                messages.push(narrationMessage);
                totalParts++;
                console.log('🎭 后台任务：添加旁白:', part.content.substring(0, 30));
            } else if (part.type === 'text') {
                // 对话部分，按句子拆分
                const sentences = part.content
                    .split(/(?<=[。！？\n])/g)
                    .filter(s => s.trim());
                
                sentences.forEach((sentence, sentenceIndex) => {
                    const trimmed = sentence.trim();
                    if (!trimmed) return;
                    
                    totalParts++;
                    
                    let aiMessage;
                    
                    // 旁白模式下禁止发送语音消息（面对面见面不发语音）
                    if (isNarrationMode) {
                        aiMessage = {
                            id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + index + sentenceIndex,
                            type: 'text',
                            content: trimmed,
                            sender: 'ai',
                            time: Date.now()
                        };
                        console.log('🎭 旁白模式：发送文本消息（禁止语音）');
                    } else {
                        // 🛡️ 检测用户是否要求发送语音
                        const lastUserMsg = messages.filter(m => (m.s || m.sender) === 'user').pop();
                        // 获取内容，确保是字符串类型
                        let userContent = '';
                        if (lastUserMsg) {
                            const rawContent = lastUserMsg.c || lastUserMsg.content || '';
                            if (typeof rawContent === 'string') {
                                userContent = rawContent.toLowerCase();
                            }
                            // 对象类型（如转账卡片）不处理，保持空字符串
                        }
                        const userRequestsVoice = userContent.includes('语音') || userContent.includes('声音') || userContent.includes('听你');
                        
                        // 🛡️ 获取语音消息计数器
                        const voiceCountKey = `voice_message_count_${task.chatId}`;
                        let voiceCount = parseInt(localStorage.getItem(voiceCountKey) || '0');
                        
                        // 🛡️ 每 150 条消息才发送一次语音，除非用户明确要求
                        const shouldSendVoice = userRequestsVoice || (voiceCount >= 150);
                        
                        if (shouldSendVoice) {
                            aiMessage = {
                                id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + index + sentenceIndex,
                                type: 'voice',
                                content: '',
                                recognizedText: trimmed,
                                sender: 'ai',
                                time: Date.now(),
                                timeDisplay: new Date().toLocaleString('zh-CN', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }).replace(/\//g, '-'),
                                duration: Math.floor(trimmed.length / 5)
                            };
                            console.log('🎤 AI 发送语音消息', userRequestsVoice ? '(用户要求)' : `(计数: ${voiceCount}/150)`);
                            
                            // 重置计数器
                            localStorage.setItem(voiceCountKey, '0');
                        } else {
                            // 非语音消息 - 确保每条消息有唯一ID
                            aiMessage = {
                                id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + index + sentenceIndex,
                                type: 'text',
                                content: trimmed,
                                sender: 'ai',
                                time: Date.now(),
                                timeDisplay: new Date().toLocaleString('zh-CN', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }).replace(/\//g, '-'),
                                tokenCount: totalTokens // 添加token计数
                            };
                            
                            // 增加计数器
                            voiceCount++;
                            localStorage.setItem(voiceCountKey, voiceCount.toString());
                        }
                    }
                    
                    messages.push(aiMessage);
                    console.log(`✅ 后台任务：发送对话:`, trimmed.substring(0, 50));
                });
            }
        });
        
        console.log(`📝 总共生成 ${totalParts} 条消息`);
        
        // 🛡️ 添加特殊功能消息（亲属卡/转账）
        if (specialMessage) {
            let specialMsg;
            if (specialMessage.type === 'family-card') {
                // 亲属卡邀请
                specialMsg = {
                    id: Date.now().toString() + '_familycard',
                    type: 'family-card',
                    content: {
                        limit: parseFloat(specialMessage.limit),
                        remark: specialMessage.remark || '亲属卡',
                        status: 'pending'
                    },
                    sender: 'ai',
                    time: Date.now()
                };
                console.log('💳 后台任务：添加亲属卡邀请:', specialMsg.content);
            } else if (specialMessage.type === 'transfer') {
                // 转账
                specialMsg = {
                    id: Date.now().toString() + '_transfer',
                    type: 'transfer',
                    content: {
                        amount: parseFloat(specialMessage.amount),
                        remark: specialMessage.remark || '转账',
                        status: 'pending'
                    },
                    sender: 'ai',
                    time: Date.now()
                };
                console.log('💰 后台任务：添加转账:', specialMsg.content);
            } else if (specialMessage.type === 'pay-done') {
                // AI已代付
                specialMsg = {
                    id: Date.now().toString() + '_paydone',
                    type: 'pay-done',
                    content: {
                        itemName: specialMessage.itemName || '商品',
                        amount: parseFloat(specialMessage.amount),
                        remark: specialMessage.remark || '已代付'
                    },
                    sender: 'ai',
                    time: Date.now()
                };
                console.log('💰 后台任务：添加AI已代付卡片:', specialMsg.content);
                
                // 保存订单到商城
                try {
                    const orders = JSON.parse(localStorage.getItem('shop_orders') || '[]');
                    orders.push({
                        id: 'order_' + Date.now(),
                        itemName: specialMessage.itemName || '商品',
                        amount: parseFloat(specialMessage.amount),
                        status: 'paid',
                        payMethod: '代付',
                        payBy: 'ai',
                        remark: specialMessage.remark || '',
                        time: Date.now()
                    });
                    localStorage.setItem('shop_orders', JSON.stringify(orders));
                    console.log('✅ 订单已保存到商城');
                    
                    // 从购物车中移除已代付的商品
                    try {
                        const cart = JSON.parse(localStorage.getItem('shopCart') || '[]');
                        const itemName = specialMessage.itemName || '商品';
                        const newCart = cart.filter(item => item.name !== itemName);
                        if (newCart.length !== cart.length) {
                            localStorage.setItem('shopCart', JSON.stringify(newCart));
                            console.log('🛒 已从购物车移除:', itemName);
                        }
                    } catch (e) {
                        console.error('从购物车移除商品失败:', e);
                    }
                } catch (e) {
                    console.error('保存订单失败:', e);
                }
            } else if (specialMessage.type === 'product-card') {
                // AI推荐商品
                specialMsg = {
                    id: Date.now().toString() + '_product',
                    type: 'product-card',
                    content: {
                        name: specialMessage.name || '商品',
                        desc: specialMessage.desc || '',
                        price: parseFloat(specialMessage.price),
                        imageDesc: specialMessage.imageDesc || ''
                    },
                    sender: 'ai',
                    time: Date.now()
                };
                console.log('🛍️ 后台任务：添加商品推荐卡片:', specialMsg.content);
            } else if (specialMessage.type === 'delivery-order') {
                // AI帮用户点外卖
                specialMsg = {
                    id: Date.now().toString() + '_delivery',
                    type: 'delivery-order',
                    content: {
                        restaurant: specialMessage.restaurant || '餐厅',
                        items: specialMessage.items || [],
                        total: parseFloat(specialMessage.total),
                        address: specialMessage.address || '虚拟地址'
                    },
                    sender: 'ai',
                    time: Date.now()
                };
                console.log('🚚 后台任务：添加外卖订单卡片:', specialMsg.content);
                
                // 保存外卖订单到商城
                try {
                    const orders = JSON.parse(localStorage.getItem('shop_orders') || '[]');
                    const orderItems = (specialMessage.items || []).map(item => `${item.name}x${item.quantity || 1}`).join(', ');
                    orders.push({
                        id: 'order_' + Date.now(),
                        itemName: specialMessage.restaurant + ' - ' + orderItems,
                        amount: parseFloat(specialMessage.total),
                        status: 'paid',
                        payMethod: 'AI代付',
                        payBy: 'ai',
                        remark: specialMessage.address || '',
                        time: Date.now(),
                        isDelivery: true
                    });
                    localStorage.setItem('shop_orders', JSON.stringify(orders));
                    console.log('✅ 外卖订单已保存到商城');
                } catch (e) {
                    console.error('保存外卖订单失败:', e);
                }
            } else if (specialMessage.type === 'piggybank-save') {
                // AI帮用户存钱到小荷包
                specialMsg = {
                    id: Date.now().toString() + '_piggybank',
                    type: 'piggybank-save',
                    content: {
                        amount: parseFloat(specialMessage.amount),
                        saver: specialMessage.saver || '角色',
                        message: specialMessage.message || ''
                    },
                    sender: 'ai',
                    time: Date.now()
                };
                console.log('💰 后台任务：添加小荷包存钱卡片:', specialMsg.content);
                
                // 调用 chat-app.html 中的 AI 存钱函数
                try {
                    const mainFrame = document.querySelector('iframe');
                    if (mainFrame && mainFrame.contentWindow && typeof mainFrame.contentWindow.aiSaveToPiggybank === 'function') {
                        mainFrame.contentWindow.aiSaveToPiggybank(
                            parseFloat(specialMessage.amount),
                            specialMessage.message || ''
                        );
                        console.log('✅ 已通知AI存入小荷包');
                    }
                } catch (e) {
                    console.error('通知AI存钱失败:', e);
                }
            } else if (specialMessage.type === 'purchase') {
                // AI代买商品
                specialMsg = {
                    id: Date.now().toString() + '_purchase',
                    type: 'purchase',
                    content: {
                        items: specialMessage.items || [],
                        total: parseFloat(specialMessage.total),
                        reason: specialMessage.reason || '',
                        message: specialMessage.message || ''
                    },
                    sender: 'ai',
                    time: Date.now()
                };
                console.log('🛒 后台任务：添加代买卡片:', specialMsg.content);
                
                try {
                    const orders = JSON.parse(localStorage.getItem('shop_orders') || '[]');
                    const purchaseItems = (specialMessage.items || []).map(item => `${item.name}x${item.quantity || 1}`).join(', ');
                    orders.push({
                        id: 'order_' + Date.now(),
                        itemName: purchaseItems,
                        amount: parseFloat(specialMessage.total),
                        status: 'paid',
                        payMethod: 'AI代买',
                        payBy: 'ai',
                        remark: specialMessage.reason || '',
                        time: Date.now(),
                        isPurchase: true
                    });
                    localStorage.setItem('shop_orders', JSON.stringify(orders));
                    console.log('✅ 代买订单已保存到商城');
                } catch (e) {
                    console.error('保存代买订单失败:', e);
                }
            } else if (specialMessage.type === 'receive-family-card') {
                // 接受亲属卡
                specialMsg = {
                    id: Date.now().toString() + '_acceptcard',
                    type: 'family-card-accepted',
                    content: {
                        limit: parseFloat(specialMessage.limit),
                        remark: specialMessage.remark || '谢谢！'
                    },
                    sender: 'ai',
                    time: Date.now()
                };
                console.log('✅ 后台任务：添加接受亲属卡:', specialMsg.content);
                
                // 同时保存到钱包数据
                try {
                    const mainFrame = document.querySelector('iframe');
                    if (mainFrame && mainFrame.contentWindow && mainFrame.contentWindow.receiveFamilyCard) {
                        const currentChatName = localStorage.getItem('currentChatName_' + task.chatId) || '角色';
                        mainFrame.contentWindow.receiveFamilyCard(currentChatName, parseFloat(specialMessage.limit));
                    }
                } catch (e) {
                    console.error('保存亲属卡失败:', e);
                }
            }
            
            if (specialMsg) {
                messages.push(specialMsg);
                totalParts++;
            }
        }
        
        // 保存所有消息到 IndexedDB
        const MAX_MESSAGES = 500;
        const messagesToSave = messages.slice(-MAX_MESSAGES);
        
        // 压缩消息
        const compressedMessages = messagesToSave.map(msg => {
            const compressed = {
                id: msg.id,
                t: msg.t || msg.type || 'text',
                c: msg.c !== undefined ? msg.c : (msg.content || ''),
                s: msg.s || msg.sender || 'ai',
                tm: msg.tm || msg.time || ''
            };
            if (msg.r || msg.replyTo) compressed.r = msg.r || msg.replyTo;
            if (msg.ir || msg.isRecalled) compressed.ir = true;
            // ️ 关键修复：同时检查压缩格式和解压格式，防止字段丢失
            if (msg.rt || msg.recognizedText) compressed.rt = msg.rt || msg.recognizedText;
            if (msg.d || msg.duration) compressed.d = msg.d || msg.duration;
            if (msg.td || msg.timeDisplay) compressed.td = msg.td || msg.timeDisplay;
            //  保存token计数
            if (msg.tokenCount) compressed.tc = msg.tokenCount;
            return compressed;
        });
        
        // 保存到 IndexedDB
        try {
            window.ChatDB.saveMessages(task.chatId, compressedMessages);
            console.log('✅ 消息已保存到 IndexedDB');
        } catch (e) {
            console.error('❌ 保存失败:', e);
        }
        
        // 💕 检查是否有待处理的情侣邀请并自动接受
        try {
            console.log('💕 开始检查待处理的情侣邀请...');
            console.log('💕 当前消息数量:', messages.length);
            
            // 打印所有消息类型
            messages.forEach((msg, idx) => {
                console.log(`消息[${idx}]: type=${msg.type || msg.t}, sender=${msg.sender || msg.s}, status=${msg.status}`);
            });
            
            const pendingInvite = messages.find(msg => {
                const msgType = msg.type || msg.t;
                const msgSender = msg.sender || msg.s;
                const msgStatus = msg.status;
                
                console.log(`检查消息: type=${msgType}, sender=${msgSender}, status=${msgStatus}`);
                
                // 关键修复：不要检查 sender，因为用户发送的邀请 sender 是 'user'
                // 只需要检查类型和状态
                return msgType === 'couple_invite' && msgStatus === 'pending';
            });
            
            console.log('💕 找到的待处理邀请:', pendingInvite);
            
            if (pendingInvite) {
                console.log('💕 后台任务：检测到待处理的情侣邀请，自动接受');
                
                // 接受邀请
                const inviterName = pendingInvite.inviter || '对方';
                const inviteeId = pendingInvite.inviteeId || task.chatId;
                const currentUserName = localStorage.getItem('userName') || '我';
                
                // 获取对方的头像和名字
                let partnerAvatar = '';
                let partnerName = inviterName;
                let myAvatar = ''; // 💕 获取用户的头像
                try {
                    const currentPersona = localStorage.getItem('currentPersona') || 'default';
                    const contactsKey = `persona_${currentPersona}_chatContacts`;
                    const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
                    const contact = contacts.find(c => c.id === inviteeId);
                    if (contact) {
                        partnerName = contact.name || contact.remark || inviterName;
                        partnerAvatar = contact.avatar || '';
                    }
                    
                    // 获取用户自己的头像（从 myProfile 中读取）
                    const profileKey = `persona_${currentPersona}_myProfile`;
                    const profile = JSON.parse(localStorage.getItem(profileKey) || '{}');
                    myAvatar = profile.avatar || '';
                    console.log('💕 后台任务：获取用户头像:', myAvatar, 'from', profileKey);
                } catch (e) {
                    console.error('读取联系人信息失败:', e);
                }
                
                // 保存到数组中（couple-space.html 从这里读取）
                const couples = JSON.parse(localStorage.getItem('coupleSpaces') || '[]');
                const existingIndex = couples.findIndex(c => c.id === inviteeId);
                
                const coupleData = {
                    id: inviteeId,
                    myName: currentUserName,
                    myAvatar: myAvatar, // 💕 保存用户头像
                    partnerName: partnerName,
                    partnerAvatar: partnerAvatar, // 💕 保存对方头像
                    partnerId: inviteeId, // 💕 保存对方ID，方便后续查找
                    startDate: new Date().toISOString(),
                    activated: true
                };
                
                if (existingIndex >= 0) {
                    couples[existingIndex] = coupleData;
                } else {
                    couples.push(coupleData);
                }
                
                localStorage.setItem('coupleSpaces', JSON.stringify(couples));
                localStorage.setItem('coupleSpace', JSON.stringify(coupleData));
                
                // 更新邀请消息状态
                pendingInvite.status = 'accepted';
                
                // 添加接受卡片消息
                const acceptCardMsg = {
                    id: (Date.now() + 1).toString(),
                    type: 'couple_accept',
                    content: '已接受情侣空间邀请',
                    sender: 'ai',
                    time: Date.now(),
                    timeDisplay: new Date().toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    }).replace(/\//g, '-'),
                    status: 'accepted'
                };
                
                messages.push(acceptCardMsg);
                
                // 重新保存（包含接受卡片）
                const updatedCompressed = messages.map(msg => {
                    const compressed = {
                        id: msg.id,
                        t: msg.t || msg.type || 'text',
                        c: msg.c !== undefined ? msg.c : (msg.content || ''),
                        s: msg.s || msg.sender || 'ai',
                        tm: msg.tm || msg.time || ''
                    };
                    if (msg.r || msg.replyTo) compressed.r = msg.r || msg.replyTo;
                    if (msg.ir || msg.isRecalled) compressed.ir = true;
                    if (msg.rt || msg.recognizedText) compressed.rt = msg.rt || msg.recognizedText;
                    if (msg.d || msg.duration) compressed.d = msg.d || msg.duration;
                    if (msg.td || msg.timeDisplay) compressed.td = msg.td || msg.timeDisplay;
                    if (msg.type === 'couple_invite' || msg.t === 'couple_invite') {
                        if (msg.inviter) compressed.inviter = msg.inviter;
                        if (msg.inviteeId) compressed.inviteeId = msg.inviteeId;
                        if (msg.status) compressed.status = msg.status;
                    }
                    if (msg.type === 'couple_accept' || msg.t === 'couple_accept') {
                        if (msg.status) compressed.status = msg.status;
                    }
                    return compressed;
                });
                
                window.ChatDB.saveMessages(task.chatId, updatedCompressed);
                const key = `chat_${task.chatId}`;
                localStorage.setItem(key, JSON.stringify(updatedCompressed));
                
                console.log('💕 后台任务：情侣空间已激活并接受，接受卡片已添加');
            }
        } catch (e) {
            console.error('💕 后台任务：处理情侣邀请失败:', e);
        }
        
        // 🛡️ 更新未读消息计数（异步，不阻塞 UI）
        updateUnreadCount(task.chatId, totalParts).catch(err => {
            console.warn('⚠️ 更新未读计数失败:', err);
        });
        
        // 如果当前在这个聊天界面，刷新显示
        if (currentChatId === task.chatId) {
            chatMessages = compressedMessages.map(msg => {
                const decompressed = {
                    id: msg.id,
                    type: msg.t,
                    content: msg.c,
                    sender: msg.s,
                    time: msg.tm
                };
                if (msg.r) decompressed.replyTo = msg.r;
                if (msg.ir) {
                    decompressed.isRecalled = true;
                    decompressed.type = 'recalled';
                }
                if (msg.rt) decompressed.recognizedText = msg.rt;
                if (msg.d) decompressed.duration = msg.d;
                if (msg.td) decompressed.timeDisplay = msg.td;
                if (msg.tc) decompressed.tokenCount = msg.tc;
                // 📚 阅读邀请卡片的特殊字段
                if (msg.bookId) decompressed.bookId = msg.bookId;
                if (msg.bookTitle) decompressed.bookTitle = msg.bookTitle;
                if (msg.bookType) decompressed.bookType = msg.bookType;
                if (msg.chapterCount) decompressed.chapterCount = msg.chapterCount;
                if (msg.status) decompressed.status = msg.status;
                // 📚 阅读进度更新消息的特殊字段
                if (msg.chapterIndex !== undefined) decompressed.chapterIndex = msg.chapterIndex;
                if (msg.totalChapters) decompressed.totalChapters = msg.totalChapters;
                if (msg.chapterTitle) decompressed.chapterTitle = msg.chapterTitle;
                return decompressed;
            });
            
            // 🛡️ 逐句发送逻辑（UI 层面）
            // 防止重复执行逐句发送
            if (isSentenceSending) {
                console.log('⏳ 正在逐句发送中，跳过重复处理');
                return;
            }
                        
            const aiMessages = chatMessages.filter(m => m.sender === 'ai' && !m.isRecalled);
            const lastUserMsgIndex = chatMessages.findLastIndex(m => m.sender === 'user');
                        
            if (lastUserMsgIndex !== -1 && aiMessages.length > 0) {
                // 找到用户消息之后的所有 AI 消息
                const newAiMessages = aiMessages.filter(m => {
                    const msgTime = typeof m.time === 'string' ? parseInt(m.time) : m.time;
                    const userTime = typeof chatMessages[lastUserMsgIndex].time === 'string' ? parseInt(chatMessages[lastUserMsgIndex].time) : chatMessages[lastUserMsgIndex].time;
                    return msgTime > userTime;
                });
                            
                if (newAiMessages.length > 0) {
                    console.log(`🚀 开始逐句发送 ${newAiMessages.length} 条消息`);
                                
                    // 标记为正在逐句发送
                    isSentenceSending = true;
                                
                    // 先隐藏所有新消息
                    newAiMessages.forEach(m => m.hidden = true);
                    renderMessages(true); // 渲染并滚动到底部（显示"正在输入"）
                                
                    // 逐句显示
                    newAiMessages.forEach((msg, index) => {
                        setTimeout(() => {
                            msg.hidden = false;
                            renderMessages(true); // 自动滚动
                            console.log(`✅ 显示第 ${index + 1}/${newAiMessages.length} 条消息`);
                        }, (index + 1) * 800);
                    });
                                
                    // 最后移除"正在输入"并重置标记
                    setTimeout(() => {
                        removeTypingIndicator();
                        isSentenceSending = false; // 重置标记
                        console.log('✅ 逐句发送完成，重置标记');
                    }, (newAiMessages.length + 1) * 800);
                                
                    // 提前返回，跳过下面的统一渲染
                    return;
                }
            }
                    
            renderMessages(true);
            scrollToBottom();
            // 更新token显示栏
            updateTokenCountBar();
        }
                
        // 移除“正在输入...”
        removeTypingIndicator();
        
        // 清除任务
        localStorage.removeItem('pendingAIReply');
        localStorage.removeItem('pendingAIReplyTrigger');
        console.log('💾 消息已全部发送完毕，任务已清除');
        
        // 📝 检查是否需要自动总结（延迟500ms，确保消息已保存）
        setTimeout(() => {
            checkAndTriggerAutoSummary();
        }, 500);
        
        // 显示横幅通知
        const tempActive = currentChatWindowActive;
        currentChatWindowActive = false;
        const lastPart = parts[parts.length - 1];
        const notificationText = lastPart ? lastPart.content.substring(0, 50) : '';
        const avatarUrl = getContactAvatar(task.chatId);
        showBannerNotification('AI回复', notificationText, avatarUrl);
        currentChatWindowActive = tempActive;
        
        // 旁白模式下禁止生成语音消息（面对面见面不发语音）
        if (offlineMode === 'narration') {
            console.log('🎭 旁白模式：禁止生成语音消息');
            return;
        }
        
        // 线上聊天时，仅在用户明确要求听声音时才生成语音
        tryGenerateVoice(task.chatId, messages);
        
        // 🎭 检查是否需要自动生成心声
        setTimeout(() => {
            checkAndTriggerAutoInnerVoice(task.chatId, messages);
        }, 2000);
        
    } catch (error) {
        console.error('❌ 生成AI回复失败:', error);
        task.status = 'failed';
        task.error = error.message;
        localStorage.setItem('pendingAIReply', JSON.stringify(task));
        localStorage.removeItem('pendingAIReplyTrigger');
        removeTypingIndicator();
        
        // 不在这里显示错误，让 processPendingReplyTask 统一处理
        
        throw error;
    }
}

// 页面加载时启动后台处理器
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
        // 获取所有联系人 - 使用正确的 key
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const contactsKey = `persona_${currentPersona}_chatContacts`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        
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
                // 限制每次最多处理2个联系人，避免频率限制
                if (requestCount >= 2) {
                    console.log(`⏸️ 已达到单次处理上限(2个)，剩余 ${contacts.length - updatedCount - requestCount} 个联系人下次处理`);
                    break;
                }
                
                // 生成新的朋友圈内容
                const success = await generateMomentForContact(contact);
                
                if (success) {
                    // 更新最后更新时间
                    localStorage.setItem(lastUpdateTimeKey, now.toString());
                    updatedCount++;
                    
                    // 🛠️ 添加提醒通知（使用黑色半透明样式）
                    console.log(`📱 显示朋友圈更新通知: ${contact.name}`);
                    
                    // 使用 showToast 显示通知
                    if (window.showToast) {
                        showToast(`✨ ${contact.name} 更新了朋友圈`);
                    } else {
                        // 备用方案：直接创建通知
                        try {
                            const notification = document.createElement('div');
                            notification.style.cssText = `
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
                            notification.textContent = `✨ ${contact.name} 更新了朋友圈`;
                            document.body.appendChild(notification);
                            
                            // 3秒后自动消失
                            setTimeout(() => {
                                notification.style.animation = 'slideUp 0.3s ease-out';
                                setTimeout(() => {
                                    if (notification.parentNode) {
                                        notification.parentNode.removeChild(notification);
                                    }
                                }, 300);
                            }, 3000);
                        } catch (e) {
                            console.error('显示通知失败:', e);
                        }
                    }
                }
                
                requestCount++;
                
                // 添加延迟，避免频率限制（每次间隔20秒）
                if (requestCount < 2) {
                    console.log('⏳ 等待20秒后处理下一个联系人...');
                    await new Promise(resolve => setTimeout(resolve, 20000));
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

/**
 * 为指定联系人生成朋友圈内容
 * @param {Object} contact - 联系人对象
 * @returns {Promise<boolean>} 是否成功生成
 */
async function generateMomentForContact(contact) {
    try {
        const contactId = contact.id;
        const roleInfo = contact.roleInfo || {};
        
        console.log(`📝 开始为 "${contact.name}" 生成朋友圈内容...`);
        
        // 获取 API 配置 - 兼容两种格式
        let apiConfig;
        let savedModel = ''; // 保存模型字段
        const apiConfigStr = localStorage.getItem('apiConfig');
        const globalApiConfigStr = localStorage.getItem('globalApiConfig');
        
        if (apiConfigStr) {
            apiConfig = JSON.parse(apiConfigStr);
            // 如果是 {mainApi: {token: '...'}} 格式
            if (apiConfig.mainApi && apiConfig.mainApi.token) {
                savedModel = apiConfig.model || ''; // 先保存 model
                apiConfig = apiConfig.mainApi;
                if (savedModel) apiConfig.model = savedModel; // 再恢复 model
            }
        } else if (globalApiConfigStr) {
            const globalConfig = JSON.parse(globalApiConfigStr);
            // 如果是 {mainApi: {url: '...', token: '...'}} 格式
            if (globalConfig.mainApi && globalConfig.mainApi.url && globalConfig.mainApi.token) {
                savedModel = globalConfig.model || ''; // 先保存 model
                apiConfig = globalConfig.mainApi;
                if (savedModel) apiConfig.model = savedModel; // 再恢复 model
            } else {
                apiConfig = globalConfig;
            }
        } else {
            console.error('❌ 未找到 API 配置，跳过朋友圈生成');
            return false;
        }
        
        // 检查 API 配置是否完整
        if (!apiConfig.url || !apiConfig.token) {
            console.error('❌ API 配置不完整（缺少 URL 或 Token），跳过朋友圈生成');
            console.log('📮 当前 API 配置:', apiConfig);
            return false;
        }
        
        // 转换为 callAIAPI 期望的格式
        const apiConfigForCall = {
            mainApi: {
                url: apiConfig.url,
                token: apiConfig.token
            },
            model: apiConfig.model || 'gpt-3.5-turbo'
        };
        
        // 构建 System Prompt
        const characterName = roleInfo.characterName || contact.name;
        const persona = roleInfo.persona || '';
        const language = roleInfo.language || 'zh';
        
        // 根据语言设置获取语言名称
        const langMap = {
            'zh': '中文',
            'en': '英语',
            'ja': '日语',
            'ko': '韩语',
            'fr': '法语',
            'de': '德语',
            'es': '西班牙语',
            'ru': '俄语'
        };
        const langName = langMap[language] || '中文';
        
        // 获取当前时间信息
        const now = new Date();
        const currentTime = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
        const hour = now.getHours();
        let timeOfDay = '';
        if (hour >= 5 && hour < 9) timeOfDay = '早晨';
        else if (hour >= 9 && hour < 12) timeOfDay = '上午';
        else if (hour >= 12 && hour < 14) timeOfDay = '中午';
        else if (hour >= 14 && hour < 18) timeOfDay = '下午';
        else if (hour >= 18 && hour < 20) timeOfDay = '傍晚';
        else if (hour >= 20 && hour < 23) timeOfDay = '晚上';
        else timeOfDay = '深夜';
        
        // 获取最近的聊天记录作为上下文
        const messagesKey = `chat_${contactId}_messages`;
        const messages = JSON.parse(localStorage.getItem(messagesKey) || '[]');
        let recentChatContext = '';
        
        if (messages && messages.length > 0) {
            // 取最近20条聊天记录
            const recentMessages = messages.slice(-20);
            recentChatContext = '\n\n【最近的聊天记录】\n';
            recentMessages.forEach(msg => {
                const sender = msg.sender === 'user' ? '用户' : characterName;
                const time = new Date(msg.time).toLocaleString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                recentChatContext += `[${time}] ${sender}: ${msg.content}\n`;
            });
        }
        
        const systemPrompt = `你现在需要扮演一个真实的角色，发布一条朋友圈动态。

【角色信息】
- 姓名：${characterName}
- 人设：${persona || '普通用户'}
- 使用语言：${langName}

【时间信息】
- 当前时间：${currentTime}（${timeOfDay}）
${recentChatContext}
【朋友圈要求】
1. **必须用${langName}写朋友圈内容**
2. 朋友圈内容应该符合角色的性格和人设
3. **重要：请参考最近的聊天记录来生成朋友圈内容**，让朋友圈与聊天内容有连贯性
4. 可以从聊天中提取话题、情绪、事件等，转化为朋友圈的内容
5. 内容要自然、真实，像真人发的朋友圈
6. 可以包含：日常生活、心情感受、所见所闻、思考感悟等
7. 长度适中，不要太长（50-200字左右）
8. **如果语言不是中文，必须在朋友圈内容后换行，然后写"---"，再换行提供中文翻译**
9. 格式示例（非中文时）：
   原文（${langName}）
   ---
   翻译（中文）
10. 这是强制要求，必须提供翻译！
11. 可以适当使用表情符号增加生动性
12. 不要提及这是AI生成的，要完全以角色身份发布
13. 如果聊天记录很少或没有，就根据人设自由发挥

【输出格式】
请直接输出朋友圈的文字内容，不需要任何额外的说明或标记。

示例：
今天的阳光真好，坐在窗边喝杯咖啡，感觉整个人都放松了 ☕️✨`;
        
        // 调用 AI API 生成朋友圈内容
        const momentContent = await callAIAPI('请生成一条朋友圈动态', apiConfigForCall, systemPrompt);
        
        if (!momentContent || momentContent.trim() === '') {
            console.error('❌ AI 返回的内容为空');
            return false;
        }
        
        console.log('✅ AI 生成的朋友圈内容:', momentContent.substring(0, 100));
        
        // 保存朋友圈到 localStorage
        const momentsKey = `moments_${contactId}`;
        const existingMoments = JSON.parse(localStorage.getItem(momentsKey) || '[]');
        
        // 创建新的朋友圈记录
        const newMoment = {
            id: Date.now().toString(),
            content: momentContent.trim(),
            images: [], // 暂时没有图片功能
            createTime: now.toISOString(),
            timestamp: now.getTime(),
            likes: 0,
            comments: []
        };
        
        // 添加到列表开头（最新的在前）
        existingMoments.unshift(newMoment);
        
        // 限制朋友圈数量，最多保留50条
        if (existingMoments.length > 50) {
            existingMoments.length = 50;
        }
        
        // 保存到 localStorage（同时保存到两个位置）
        localStorage.setItem(momentsKey, JSON.stringify(existingMoments));
                
        // 同时保存到全局朋友圈列表（供朋友圈 APP 显示）
        // 使用带人设前缀的 key，与 chat-app.js 的 getData('moments') 保持一致
        const currentPersona = localStorage.getItem('currentPersonaId') || 'default';
        const globalMomentsKey = `persona_${currentPersona}_moments`;
        const globalMoments = JSON.parse(localStorage.getItem(globalMomentsKey) || '[]');
                
        // 检查是否已存在（避免重复）
        const existsInGlobal = globalMoments.some(m => m.id === newMoment.id);
        if (!existsInGlobal) {
            // 添加联系人信息到全局朋友圈
            const globalMoment = {
                ...newMoment,
                author: contact.name,
                avatar: contact.avatar || '👤'
            };
            globalMoments.unshift(globalMoment);
                    
            // 限制总数，最多保留100条
            if (globalMoments.length > 100) {
                globalMoments.length = 100;
            }
                    
            localStorage.setItem(globalMomentsKey, JSON.stringify(globalMoments));
            console.log(`✅ 已同步到全局朋友圈列表 (key: ${globalMomentsKey})，当前共有 ${globalMoments.length} 条`);
        }
                
        console.log(`✅ 已保存朋友圈，当前共有 ${existingMoments.length} 条`);
                
        // 📮 触发 storage 事件，通知朋友圈页面刷新
        localStorage.setItem('moments_updated', Date.now().toString());
                
        // 🔄 触发朋友圈刷新事件（通知朋友圈页面重新渲染）
        try {
            console.log('🔄 开始触发朋友圈页面刷新...');
            
            // 方法1：分发自定义事件
            const updateEvent = new CustomEvent('momentsUpdated', {
                detail: {
                    contactId: contactId,
                    contactName: contact.name,
                    momentId: newMoment.id,
                    timestamp: Date.now()
                }
            });
            window.dispatchEvent(updateEvent);
            console.log('✅ 已发送 momentsUpdated 事件');
            
            // 方法2：尝试通过 iframe 调用（如果存在）
            const mainFrame = document.querySelector('iframe');
            console.log('  - mainFrame 存在:', !!mainFrame);
            
            if (mainFrame && mainFrame.contentWindow) {
                console.log('  - contentWindow 存在:', !!mainFrame.contentWindow);
                console.log('  - renderMoments 存在:', typeof mainFrame.contentWindow.renderMoments === 'function');
                
                if (typeof mainFrame.contentWindow.renderMoments === 'function') {
                    console.log('🔄 调用 renderMoments()...');
                    mainFrame.contentWindow.renderMoments();
                    console.log('✅ renderMoments() 调用成功');
                } else {
                    console.warn('⚠️ renderMoments 函数不存在，但已发送事件');
                }
            } else {
                console.warn('⚠️ mainFrame 或 contentWindow 不存在，但已发送事件');
            }
            
            // 方法3：直接更新朋友圈页面的数据（如果在朋友圈页面）
            if (window.renderMoments && typeof window.renderMoments === 'function') {
                console.log('🔄 直接调用 window.renderMoments()...');
                window.renderMoments();
                console.log('✅ window.renderMoments() 调用成功');
            }
        } catch (e) {
            console.error('❌ 触发朋友圈刷新失败:', e);
        }
                
        // 也触发 storage 事件，让其他监听器能响应
        localStorage.setItem('moments_updated', JSON.stringify({
            contactId: contactId,
            momentId: newMoment.id,
            timestamp: now.getTime()
        }));
        
        return true;
        
    } catch (error) {
        console.error('❌ 生成朋友圈内容失败:', error);
        return false;
    }
}

// 监听 storage 事件，立即响应新任务
window.addEventListener('storage', (e) => {
    if (e.key === 'pendingAIReplyTrigger') {
        console.log('🚀 检测到新任务触发器，立即处理');
        // 使用锁防止重复处理
        if (!isProcessing) {
            processPendingReplyTask();
        } else {
            console.log('⏳ 正在处理中，跳过重复触发');
        }
    }
    
    // 监听消息更新事件（如代付请求）
    if (e.key === 'messageUpdated') {
        try {
            const data = JSON.parse(e.newValue || '{}');
            console.log('📬 检测到消息更新:', data);
            
            // 如果当前正在这个聊天界面，重新加载消息
            if (data.chatId === currentChatId) {
                console.log('✅ 当前聊天界面，重新加载消息');
                loadAndRenderMessages();
            }
        } catch (error) {
            console.error('❌ 处理消息更新事件失败:', error);
        }
    }
});

// 监听页面可见性变化
let hasPendingTask = false;
window.addEventListener('visibilitychange', () => {
    // 检查是否有待处理的任务
    const pendingTask = localStorage.getItem('pendingAIReply');
    if (pendingTask) {
        try {
            const task = JSON.parse(pendingTask);
            hasPendingTask = task.status === 'pending';
        } catch (e) {
            hasPendingTask = false;
        }
    }
    
    if (hasPendingTask && document.hidden) {
        console.warn('⚠️ 页面切换到后台，但有待处理的 AI 回复任务');
        // 注意：这里不能阻止用户离开，只能记录日志
    }
});

// ==================== 未读消息计数功能 ====================

/**
 * 更新未读消息计数
 * @param {string} chatId - 聊天 ID
 * @param {number} newMessages - 新消息数量
 */
async function updateUnreadCount(chatId, newMessages) {
    try {
        console.log(`🔔 更新未读消息计数: chatId=${chatId}, newMessages=${newMessages}`);
        
        // 获取当前人设
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        
        // 读取会话列表
        const conversationsKey = `persona_${currentPersona}_chatConversations`;
        const conversations = JSON.parse(localStorage.getItem(conversationsKey) || '[]');
        
        // 查找对应的会话
        const conversation = conversations.find(c => c.id === chatId);
        
        if (!conversation) {
            console.warn('⚠️ 未找到会话:', chatId);
            return;
        }
        
        // 如果当前正在这个聊天界面，清除未读计数（因为用户在聊天窗口中看到了）
        if (window.currentChatId === chatId) {
            console.log('✅ 当前正在此聊天界面，清除未读计数');
            conversation.unread = 0;  // 直接清除为0
        } else {
            // 不在聊天界面，增加未读计数
            const oldUnread = conversation.unread || 0;
            conversation.unread = oldUnread + newMessages;
            console.log(`📊 未读计数: ${oldUnread} → ${conversation.unread}`);
        }
        
        // 保存回 localStorage
        localStorage.setItem(conversationsKey, JSON.stringify(conversations));
        
        // 触发 storage 事件，通知主页面更新 UI
        localStorage.setItem('unreadCountUpdated', JSON.stringify({
            chatId: chatId,
            unread: conversation.unread,
            timestamp: Date.now()
        }));
        
        console.log('✅ 未读计数已更新并通知主页面');
        
    } catch (error) {
        console.error(' 更新未读计数失败:', error);
    }
}

// 🛡️ PWA: 加载并渲染消息（用于后台任务完成后刷新）
async function loadAndRenderMessages() {
    try {
        if (!currentChatId) {
            console.warn('[PWA] ⚠️ currentChatId 为空');
            return;
        }
        
        console.log('[PWA] 🔄 重新加载消息...');
        
        // 从 IndexedDB 读取消息
        if (window.ChatDB) {
            const messages = await window.ChatDB.loadMessages(currentChatId) || [];
            
            // 解压缩消息
            chatMessages = messages.map(msg => {
                const decompressed = {
                    id: msg.id,
                    type: msg.t,
                    content: msg.c,
                    sender: msg.s,
                    time: msg.tm
                };
                if (msg.r) decompressed.replyTo = msg.r;
                if (msg.ir) {
                    decompressed.isRecalled = true;
                    decompressed.type = 'recalled';
                }
                if (msg.rt) decompressed.recognizedText = msg.rt;
                if (msg.d) decompressed.duration = msg.d;
                if (msg.td) decompressed.timeDisplay = msg.td;
                return decompressed;
            });
            
            console.log(`[PWA] ✅ 加载了 ${chatMessages.length} 条消息`);
            
            // 渲染消息
            renderMessages();
        } else {
            console.warn('[PWA] ⚠️ ChatDB 未加载');
        }
        
    } catch (error) {
        console.error('[PWA] ❌ 加载消息失败:', error);
    }
}

// 返回按钮功能
window.goBack = function() {
    try {
        console.log('🔙 返回上一级');
        // 尝试关闭当前窗口
        if (window.opener) {
            window.close();
        } else {
            // 如果是直接打开的，返回历史记录
            if (window.history.length > 1) {
                window.history.back();
            } else {
                // 没有历史记录，关闭标签页
                window.close();
            }
        }
    } catch (error) {
        console.error('返回失败:', error);
        window.close();
    }
};

// 💰 接受代付
window.acceptPayment = async function(messageId, amount) {
    try {
        console.log(`💰 接受代付: ${messageId}, 金额: ¥${amount}`);
        
        // 更新消息状态
        const msg = chatMessages.find(m => m.id === messageId || m.id === parseInt(messageId));
        if (msg) {
            // 解析content获取代付信息
            let payData;
            try {
                payData = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
            } catch (e) {
                payData = {};
            }
            
            // 更新消息状态为已接受
            payData.status = 'accepted';
            msg.content = JSON.stringify(payData);
            
            // 保存消息
            saveChatData();
            
            // 保存至 IndexedDB
            if (window.ChatDB) {
                try {
                    const compressed = chatMessages.map(m => compressMessage(m));
                    await window.ChatDB.saveMessages(currentChatId, compressed);
                } catch (e) {
                    console.error('保存 IndexedDB 失败:', e);
                }
            }
            
            // 重新渲染
            renderMessages();
            
            showToast(`已接受代付 ¥${amount}`);
        }
    } catch (error) {
        console.error('接受代付失败:', error);
        showToast('操作失败');
    }
};

// ❌ 拒绝代付
window.rejectPayment = async function(messageId) {
    try {
        console.log(`❌ 拒绝代付: ${messageId}`);
        
        // 更新消息状态
        const msg = chatMessages.find(m => m.id === messageId || m.id === parseInt(messageId));
        if (msg) {
            // 解析content获取代付信息
            let payData;
            try {
                payData = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
            } catch (e) {
                payData = {};
            }
            
            // 更新消息状态为已拒绝
            payData.status = 'rejected';
            msg.content = JSON.stringify(payData);
            
            // 保存消息
            saveChatData();
            
            // 保存至 IndexedDB
            if (window.ChatDB) {
                try {
                    const compressed = chatMessages.map(m => compressMessage(m));
                    await window.ChatDB.saveMessages(currentChatId, compressed);
                } catch (e) {
                    console.error('保存 IndexedDB 失败:', e);
                }
            }
            
            // 重新渲染
            renderMessages();
            
            showToast('已拒绝代付');
        }
    } catch (error) {
        console.error('拒绝代付失败:', error);
        showToast('操作失败');
    }
};

// 🛡️ 进入聊天界面时清除未读计数
function clearUnreadCountOnEnter(chatId) {
    try {
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const conversationsKey = `persona_${currentPersona}_chatConversations`;
        const conversations = JSON.parse(localStorage.getItem(conversationsKey) || '[]');
        
        const conversation = conversations.find(c => c.id === chatId);
        if (!conversation) {
            console.warn('⚠️ 未找到会话，无法清除未读计数:', chatId);
            return;
        }
        
        // 如果有未读消息，清除它
        if (conversation.unread && conversation.unread > 0) {
            console.log(`🔕 进入聊天，清除未读计数: ${conversation.unread} → 0`);
            conversation.unread = 0;
            
            // 保存回 localStorage
            localStorage.setItem(conversationsKey, JSON.stringify(conversations));
            
            // 触发 storage 事件，通知主页面更新 UI
            localStorage.setItem('unreadCountUpdated', JSON.stringify({
                chatId: chatId,
                unread: 0,
                timestamp: Date.now()
            }));
            
            console.log('✅ 未读计数已清除并通知主页面');
        } else {
            console.log('ℹ️ 没有未读消息，无需清除');
        }
    } catch (error) {
        console.error('❌ 清除未读计数失败:', error);
    }
}

// 📚 阅读邀请相关功能

// 接受阅读邀请
window.acceptReadingInvite = function(msgId) {
    try {
        const msg = chatMessages.find(m => m.id === msgId);
        if (!msg || msg.type !== 'reading_invite') {
            console.error('消息不存在或类型错误');
            return;
        }
        
        console.log('📚 接受阅读邀请:', msg.bookTitle);
        
        // 更新消息状态
        msg.status = 'accepted';
        saveChatData();
        renderMessages(true);
        
        // 更新书架中的邀请状态
        const books = JSON.parse(localStorage.getItem('myBooks') || '[]');
        const book = books.find(b => b.id === msg.bookId);
        if (book) {
            book.inviteStatus = 'accepted';
            book.acceptedAt = new Date().toISOString();
            book.currentChapter = 0; // 从头开始阅读
            localStorage.setItem('myBooks', JSON.stringify(books));
        }
        
        showToast('已接受邀请，开始一起阅读！');
        
        // 打开书架页面
        setTimeout(() => {
            window.location.href = 'bookshelf.html';
        }, 500);
        
    } catch (error) {
        console.error('接受阅读邀请失败:', error);
        showToast('操作失败');
    }
};

// 拒绝阅读邀请
window.rejectReadingInvite = function(msgId) {
    try {
        const msg = chatMessages.find(m => m.id === msgId);
        if (!msg || msg.type !== 'reading_invite') {
            console.error('消息不存在或类型错误');
            return;
        }
        
        console.log('📚 拒绝阅读邀请:', msg.bookTitle);
        
        // 更新消息状态
        msg.status = 'rejected';
        saveChatData();
        renderMessages(true);
        
        // 更新书架中的邀请状态
        const books = JSON.parse(localStorage.getItem('myBooks') || '[]');
        const book = books.find(b => b.id === msg.bookId);
        if (book) {
            book.inviteStatus = 'rejected';
            localStorage.setItem('myBooks', JSON.stringify(books));
        }
        
        showToast('已拒绝邀请');
        
    } catch (error) {
        console.error('拒绝阅读邀请失败:', error);
        showToast('操作失败');
    }
};

// 📚 请求AI回复阅读邀请
window.requestReadingInviteResponse = async function(msgId) {
    try {
        const msg = chatMessages.find(m => m.id === msgId);
        if (!msg || msg.type !== 'reading_invite') {
            console.error('消息不存在或类型错误');
            return;
        }
        
        console.log('📚 请求AI回复阅读邀请:', msg.bookTitle);
        
        // 显示加载状态
        showToast('正在等待角色回复...');
        
        // 构建提示词，让AI决定是否接受邀请
        const bookTitle = msg.bookTitle || '未知书籍';
        const chapterCount = msg.chapterCount || 0;
        const prompt = `用户邀请你一起阅读《${bookTitle}》，这本书共有 ${chapterCount} 章。

请根据角色的性格和喜好，决定是否接受这个邀请。如果接受，请表达你的期待和兴奋；如果拒绝，请给出合理的理由。

请以角色的身份回复，直接说出你的决定和想法。`; 
        
        // 调用API获取AI回复
        const aiResponse = await fetchAiResponse(prompt);
        
        if (aiResponse && aiResponse.trim()) {
            // 判断AI的回复是接受还是拒绝
            const responseText = aiResponse.toLowerCase();
            const isAccepted = responseText.includes('接受') || 
                              responseText.includes('好') || 
                              responseText.includes('愿意') || 
                              responseText.includes('期待') ||
                              responseText.includes('excited') ||
                              responseText.includes('accept') ||
                              responseText.includes('yes');
            
            // 创建AI回复消息
            const replyMessage = {
                id: Date.now(),
                type: 'text',
                content: aiResponse,
                sender: currentChatId, // AI角色ID
                time: Date.now()
            };
            
            chatMessages.push(replyMessage);
            
            // 更新邀请状态
            msg.status = isAccepted ? 'accepted' : 'rejected';
            
            // 保存数据
            saveChatData();
            renderMessages(true);
            scrollToBottom();
            
            // 如果接受了邀请，更新书架中的状态
            if (isAccepted) {
                const books = JSON.parse(localStorage.getItem('myBooks') || '[]');
                const book = books.find(b => b.id === msg.bookId);
                if (book) {
                    book.inviteStatus = 'accepted';
                    book.acceptedAt = new Date().toISOString();
                    book.currentChapter = 0;
                    localStorage.setItem('myBooks', JSON.stringify(books));
                }
                
                showToast('角色接受了邀请！');
            } else {
                const books = JSON.parse(localStorage.getItem('myBooks') || '[]');
                const book = books.find(b => b.id === msg.bookId);
                if (book) {
                    book.inviteStatus = 'rejected';
                    localStorage.setItem('myBooks', JSON.stringify(books));
                }
                
                showToast('角色拒绝了邀请');
            }
        } else {
            showToast('AI回复失败，请重试');
        }
        
    } catch (error) {
        console.error('请求AI回复失败:', error);
        showToast('操作失败: ' + error.message);
    }
};

// 🎯 加载用户个人资料
function loadUserProfile() {
    try {
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const myProfileKey = `persona_${currentPersona}_myProfile`;
        const myProfile = JSON.parse(localStorage.getItem(myProfileKey) || '{}');
        
        // 填充昵称
        const nicknameInput = document.getElementById('settings-user-nickname');
        if (nicknameInput) {
            nicknameInput.value = myProfile.nickname || myProfile.name || '';
        }
        
        // 填充真实姓名
        const realnameInput = document.getElementById('settings-user-realname');
        if (realnameInput) {
            realnameInput.value = myProfile.realName || '';
        }
        
        console.log('✅ 已加载用户资料:', { nickname: myProfile.nickname, realName: myProfile.realName });
    } catch (e) {
        console.error('❌ 加载用户资料失败:', e);
    }
}

//  保存用户个人资料
window.saveUserProfile = function() {
    try {
        const nicknameInput = document.getElementById('settings-user-nickname');
        const realnameInput = document.getElementById('settings-user-realname');
        
        if (!nicknameInput || !realnameInput) {
            showToast('未找到输入框');
            return;
        }
        
        const nickname = nicknameInput.value.trim();
        const realName = realnameInput.value.trim();
        
        if (!nickname) {
            showToast('昵称不能为空');
            return;
        }
        
        // 获取当前人设
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const myProfileKey = `persona_${currentPersona}_myProfile`;
        const myProfile = JSON.parse(localStorage.getItem(myProfileKey) || '{}');
        
        // 更新资料
        myProfile.nickname = nickname;
        myProfile.realName = realName;
        myProfile.name = nickname; // 保持兼容性，name 字段使用昵称
        
        // 保存
        localStorage.setItem(myProfileKey, JSON.stringify(myProfile));
        
        console.log('✅ 个人资料已保存:', { nickname, realName });
        showToast('个人资料已保存');
    } catch (e) {
        console.error('❌ 保存个人资料失败:', e);
        showToast('保存失败: ' + e.message);
    }
};

// 🗑️ 删除用户个人资料
window.deleteUserProfile = async function() {
    const confirmed = await showSystemConfirm('确定要删除个人资料吗？\n删除后将清空昵称和真实姓名');
    if (!confirmed) return;
    
    try {
        const currentPersona = localStorage.getItem('currentPersona') || 'default';
        const myProfileKey = `persona_${currentPersona}_myProfile`;
        
        // 清空资料
        const myProfile = {
            id: '',
            nickname: '',
            realName: '',
            name: ''
        };
        
        localStorage.setItem(myProfileKey, JSON.stringify(myProfile));
        
        // 清空输入框
        const nicknameInput = document.getElementById('settings-user-nickname');
        const realnameInput = document.getElementById('settings-user-realname');
        if (nicknameInput) nicknameInput.value = '';
        if (realnameInput) realnameInput.value = '';
        
        console.log('✅ 个人资料已删除');
        showToast('个人资料已删除');
    } catch (e) {
        console.error('❌ 删除个人资料失败:', e);
        showToast('删除失败: ' + e.message);
    }
};

//  系统风格的确认弹窗
function showSystemConfirm(message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.4);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s;
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: #FFFFFF;
        border-radius: 14px;
        padding: 0;
        max-width: 280px;
        width: 80%;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        overflow: hidden;
        animation: scaleIn 0.2s;
    `;
    
    const formattedMessage = message.replace(/\n/g, '<br>');
    
    dialog.innerHTML = `
        <div style="padding: 20px; text-align: center;">
            <div style="font-size: 15px; color: #333; line-height: 1.5;">${formattedMessage}</div>
        </div>
        <div style="display: flex; border-top: 0.5px solid rgba(0,0,0,0.1);">
            <button class="confirm-cancel-btn" style="
                flex: 1;
                padding: 14px;
                border: none;
                background: transparent;
                font-size: 16px;
                color: #007AFF;
                cursor: pointer;
                font-weight: 400;
            ">取消</button>
            <div style="width: 0.5px; background: rgba(0,0,0,0.1);"></div>
            <button class="confirm-ok-btn" style="
                flex: 1;
                padding: 14px;
                border: none;
                background: transparent;
                font-size: 16px;
                color: #007AFF;
                cursor: pointer;
                font-weight: 600;
            ">确定</button>
        </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // 添加动画样式
    if (!document.getElementById('system-confirm-styles')) {
        const style = document.createElement('style');
        style.id = 'system-confirm-styles';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes scaleIn {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    return new Promise((resolve) => {
        dialog.querySelector('.confirm-cancel-btn').onclick = () => {
            overlay.remove();
            resolve(false);
        };
        
        dialog.querySelector('.confirm-ok-btn').onclick = () => {
            overlay.remove();
            resolve(true);
            if (onConfirm) onConfirm();
        };
        
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.remove();
                resolve(false);
            }
        };
    });
}

// ========================================
// 🛡️ 后台保活系统 - Background Keep-Alive
// ========================================

let heartbeatTimer = null;
let visibilityChangeTimer = null;

/**
 * 初始化后台保活系统
 */
function initBackgroundKeepAlive() {
    console.log('[KeepAlive] 🚀 初始化后台保活系统');
    
    // 1. 启动心跳机制
    startHeartbeat();
    
    // 2. 监听页面可见性变化
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // 3. 请求通知权限
    requestNotificationPermission();
    
    // 4. 注册后台同步
    registerBackgroundSync();
    
    // 5. 监听网络状态
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
    
    console.log('[KeepAlive] ✅ 后台保活系统已启动');
}

/**
 * 启动心跳机制 - 每30秒发送一次心跳
 */
function startHeartbeat() {
    if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
    }
    
    heartbeatTimer = setInterval(() => {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'HEARTBEAT',
                timestamp: Date.now()
            });
            console.log('[KeepAlive] 💓 发送心跳');
        }
    }, 30000); // 30秒
    
    console.log('[KeepAlive] ⏰ 心跳定时器已启动 (30s)');
}

/**
 * 处理页面可见性变化
 */
function handleVisibilityChange() {
    if (document.hidden) {
        console.log('[KeepAlive] 👁️ 页面隐藏 - 进入后台模式');
        // 页面隐藏时，增加心跳频率到15秒
        if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
        }
        heartbeatTimer = setInterval(() => {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'HEARTBEAT',
                    timestamp: Date.now()
                });
            }
        }, 15000); // 后台时15秒
    } else {
        console.log('[KeepAlive] 👁️ 页面显示 - 恢复正常模式');
        // 页面显示时，恢复30秒心跳
        startHeartbeat();
    }
}

/**
 * 请求通知权限
 */
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('[KeepAlive] ⚠️ 浏览器不支持通知');
        return;
    }
    
    const permission = Notification.permission;
    console.log('[KeepAlive] 🔔 当前通知权限:', permission);
    
    if (permission === 'default') {
        // 用户还未选择，尝试请求权限
        try {
            const result = await Notification.requestPermission();
            console.log('[KeepAlive] 🔔 通知权限请求结果:', result);
            
            if (result === 'granted') {
                showToast('✅ 通知权限已开启，您将收到消息推送');
            } else {
                showToast('⚠️ 通知权限被拒绝，无法接收推送');
            }
        } catch (error) {
            console.error('[KeepAlive] ❌ 请求通知权限失败:', error);
        }
    } else if (permission === 'denied') {
        console.log('[KeepAlive] ⚠️ 通知权限已被拒绝');
    }
}

/**
 * 注册后台同步
 */
async function registerBackgroundSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register('ai-reply-sync');
            console.log('[KeepAlive] ✅ 后台同步已注册');
        } catch (error) {
            console.error('[KeepAlive] ❌ 注册后台同步失败:', error);
        }
    } else {
        console.log('[KeepAlive] ⚠️ 浏览器不支持后台同步');
    }
}

/**
 * 处理网络状态变化
 */
function handleNetworkChange() {
    const isOnline = navigator.onLine;
    console.log('[KeepAlive] 🌐 网络状态:', isOnline ? '在线' : '离线');
    
    if (isOnline) {
        // 网络恢复时，检查是否有待处理的消息
        checkPendingMessages();
    }
}

/**
 * 检查待处理消息
 */
function checkPendingMessages() {
    const pendingTask = localStorage.getItem('pendingAIReply');
    if (pendingTask) {
        console.log('[KeepAlive] 📨 发现待处理任务，触发后台同步');
        // 触发 Service Worker 处理
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'PROCESS_AI_REPLY'
            });
        }
    }
}

/**
 * 发送本地通知（Service Worker 调用）
 */
function sendLocalNotification(title, body, chatId = '') {
    if (!('Notification' in window)) {
        console.log('[KeepAlive] ⚠️ 浏览器不支持通知');
        return;
    }
    
    if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body: body,
            icon: '/icon.png',
            badge: '/badge.png',
            tag: `local-${chatId}-${Date.now()}`,
            requireInteraction: false,
            silent: false,
            data: { chatId: chatId }
        });
        
        notification.onclick = function() {
            window.focus();
            if (chatId) {
                window.location.href = `chat-interface.html?chatId=${chatId}`;
            }
            notification.close();
        };
        
        console.log('[KeepAlive] 🛡️ 本地通知已发送');
    } else {
        console.log('[KeepAlive] ⚠️ 通知权限未授予');
    }
}

// 设置查手机模式
function setCheckPhoneMode(mode) {
    const transparentBtn = document.getElementById('mode-transparent');
    const passwordBtn = document.getElementById('mode-password');
    const passwordSettingContainer = document.getElementById('password-setting-container');
    const authStatusContainer = document.getElementById('authorization-status-container');
    const transparentDesc = document.getElementById('mode-transparent-desc');
    const passwordDesc = document.getElementById('mode-password-desc');
    
    if (mode === 'transparent') {
        transparentBtn.classList.add('active');
        passwordBtn.classList.remove('active');
        passwordSettingContainer.style.display = 'none';
        authStatusContainer.style.display = 'none';
        transparentDesc.style.display = 'block';
        passwordDesc.style.display = 'none';
    } else {
        passwordBtn.classList.add('active');
        transparentBtn.classList.remove('active');
        passwordSettingContainer.style.display = 'block';
        authStatusContainer.style.display = 'block';
        passwordDesc.style.display = 'block';
        transparentDesc.style.display = 'none';
        
        // 更新授权状态UI
        const chatId = currentChatId;
        const savedAuth = localStorage.getItem(`check_phone_auth_${chatId}`);
        updateAuthorizationUI(savedAuth === 'true');
    }
}

// 更新授权状态UI
function updateAuthorizationUI(isAuthorized = false) {
    const statusText = document.getElementById('authorization-status-text');
    const revokeBtn = document.getElementById('revoke-auth-btn');
    
    if (isAuthorized) {
        statusText.textContent = '已授权';
        statusText.style.color = '#52c41a';
        revokeBtn.style.display = 'block';
    } else {
        statusText.textContent = '未授权';
        statusText.style.color = '#999';
        revokeBtn.style.display = 'none';
    }
}

// 导出全局函数
window.sendLocalNotification = sendLocalNotification;
window.initBackgroundKeepAlive = initBackgroundKeepAlive;
window.triggerPhoneCheck = triggerPhoneCheck;
window.collectPhoneData = collectPhoneData;
window.generatePhoneCheckReaction = generatePhoneCheckReaction;
window.startCheckPhoneTimer = startCheckPhoneTimer;
window.stopCheckPhoneTimer = stopCheckPhoneTimer;
window.updateAuthorizationUI = updateAuthorizationUI;
window.setCheckPhoneMode = setCheckPhoneMode;

// ========== 后台横幅通知系统 ==========

let notificationPollTimer = null;
let notificationLastCheck = Date.now();
let notificationSound = null;

function initNotificationSound() {
    try {
        notificationSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2JkZeXkIuEfXdxb3B1fIeRmZuXj4Z9dG1pbHN+iZOZm5aMgXdua2xxeYSPlpqYkYiAdnBtcHd/ipSampeTiYF4cG5wd4KMlpmYk4qCeXJvcniCjZaZl5KJgXlyb3F4go2WmZeTiYF4cm9xeIKNlpmXk4mBeHJvcXiCjZaZl5OJgXhyb3F4go2WmZeTiYF4cm9xeIKNlpmXk4mBeHJvcXg=');
        notificationSound.volume = 0.5;
    } catch (e) {
        console.log('[Notification] 音频初始化失败:', e);
    }
}

function playNotificationSound() {
    try {
        if (notificationSound) {
            notificationSound.currentTime = 0;
            notificationSound.play().catch(() => {});
        }
    } catch (e) {}
}

async function startNotificationPoll() {
    if (notificationPollTimer) return;

    if (!('Notification' in window)) {
        console.log('[Notification] 浏览器不支持通知');
        return;
    }

    if (Notification.permission === 'default') {
        const result = await Notification.requestPermission();
        if (result !== 'granted') {
            if (window.showToast) showToast('需要通知权限才能接收横幅提醒', 'error');
            return;
        }
    } else if (Notification.permission === 'denied') {
        if (window.showToast) showToast('通知权限被拒绝，请在浏览器设置中开启', 'error');
        return;
    }

    initNotificationSound();
    notificationLastCheck = Date.now();

    notificationPollTimer = setInterval(async () => {
        await pollKeepAliveForNotifications();
    }, 15000);

    console.log('[Notification] 横幅通知轮询已启动 (15秒/次)');
}

function stopNotificationPoll() {
    if (notificationPollTimer) {
        clearInterval(notificationPollTimer);
        notificationPollTimer = null;
    }
    console.log('[Notification] 横幅通知轮询已停止');
}

function showBannerNotification(title, body, chatId) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    playNotificationSound();

    const notification = new Notification(title, {
        body: body,
        icon: '/icon.png',
        badge: '/badge.png',
        tag: `keepalive-${chatId}-${Date.now()}`,
        requireInteraction: false,
        silent: false,
        data: { chatId: chatId }
    });

    notification.onclick = function() {
        window.focus();
        if (chatId && typeof switchToChat === 'function') {
            switchToChat(chatId);
        } else if (chatId) {
            window.location.href = `chat-interface.html?chatId=${chatId}`;
        }
        notification.close();
    };

    setTimeout(() => {
        try { notification.close(); } catch (e) {}
    }, 8000);
}

function startBackgroundNotificationWatch() {
    startNotificationPoll();

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            startNotificationPoll();
        }
    });
}

window.startNotificationPoll = startNotificationPoll;
window.stopNotificationPoll = stopNotificationPoll;
window.startBackgroundNotificationWatch = startBackgroundNotificationWatch;

async function toggleBannerNotification() {
    const checkbox = document.getElementById('settings-notification-enabled');
    const enabled = checkbox.checked;

    if (enabled) {
        if (!('Notification' in window)) {
            if (window.showToast) showToast('你的浏览器不支持通知功能', 'error');
            checkbox.checked = false;
            return;
        }

        if (Notification.permission === 'default') {
            const result = await Notification.requestPermission();
            if (result !== 'granted') {
                if (window.showToast) showToast('需要允许通知权限才能弹窗提醒', 'error');
                checkbox.checked = false;
                return;
            }
        } else if (Notification.permission === 'denied') {
            if (window.showToast) showToast('通知权限被拒绝，请在浏览器设置中开启', 'error');
            checkbox.checked = false;
            return;
        }

        startNotificationPoll();
        localStorage.setItem('keepalive_notification_enabled', 'true');
        if (window.showToast) showToast('横幅通知已开启，离开页面时会弹窗提醒', 'success');
    } else {
        stopNotificationPoll();
        localStorage.setItem('keepalive_notification_enabled', 'false');
        if (window.showToast) showToast('横幅通知已关闭', 'success');
    }
}

function loadNotificationSetting() {
    const saved = localStorage.getItem('keepalive_notification_enabled');
    const checkbox = document.getElementById('settings-notification-enabled');
    if (checkbox && saved === 'true') {
        checkbox.checked = true;
        if (Notification.permission === 'granted') {
            startNotificationPoll();
        } else {
            checkbox.checked = false;
        }
    }
}

window.toggleBannerNotification = toggleBannerNotification;
window.loadNotificationSetting = loadNotificationSetting;

// ========== 表情包分类绑定功能 ==========

// 加载聊天设置中的表情包分类下拉框
function loadSettingsEmojiCategories() {
    const selectElement = document.getElementById('settings-role-emoji-category');
    if (!selectElement) return;
    
    //  关键修复：读取带人设前缀的表情包数据
    const personaId = localStorage.getItem('currentPersonaId') || 'default';
    const emojisKey = `persona_${personaId}_emojis`;
    
    console.log('📸 [loadSettingsEmojiCategories] 人设ID:', personaId);
    console.log('📸 [loadSettingsEmojiCategories] 表情包键:', emojisKey);
    
    let emojisStr = localStorage.getItem(emojisKey);
    console.log('📸 [loadSettingsEmojiCategories] 读取到的数据:', emojisStr ? emojisStr.substring(0, 100) + '...' : 'null');
    
    // 如果带前缀的键为空，尝试不带前缀的键（向后兼容）
    if (!emojisStr) {
        console.log(' [loadSettingsEmojiCategories] 带前缀的键为空，尝试不带前缀的键...');
        emojisStr = localStorage.getItem('emojis');
        if (emojisStr) {
            console.log('📸 [loadSettingsEmojiCategories] 从不带前缀的键读取成功');
        }
    }
    
    const emojis = JSON.parse(emojisStr || '{"categories":["默认"],"items":{}}');
    console.log('📸 [loadSettingsEmojiCategories] 解析后的数据:', emojis);
    console.log('📸 [loadSettingsEmojiCategories] 分类列表:', emojis.categories);
    
    const chatId = currentChatId;
    const currentCategory = localStorage.getItem(`role_${chatId}_emoji_category`) || '';
    console.log('📸 [loadSettingsEmojiCategories] 当前角色:', chatId, '当前绑定:', currentCategory);
    
    // 清空选项
    selectElement.innerHTML = '<option value="">不绑定表情包</option>';
    
    // 添加所有分类
    if (emojis.categories && emojis.categories.length > 0) {
        emojis.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            if (category === currentCategory) {
                option.selected = true;
            }
            selectElement.appendChild(option);
        });
        console.log('📸 [loadSettingsEmojiCategories] 已加载', emojis.categories.length, '个分类:', emojis.categories);
    } else {
        console.warn('📸 [loadSettingsEmojiCategories] 警告: emojis.categories 为空或不存在');
        // 显示提示信息
        selectElement.innerHTML = '<option value="">暂无表情包分类（请先到表情包管理中添加）</option>';
    }
    
    updateSettingsEmojiPreview();
}

// 更新聊天设置中的表情包预览
window.updateSettingsEmojiPreview = function() {
    const selectElement = document.getElementById('settings-role-emoji-category');
    const previewContainer = document.getElementById('settings-emoji-preview');
    
    if (!selectElement || !previewContainer) return;
    
    const selectedCategory = selectElement.value;
    
    // 读取带人设前缀的表情包数据
    const personaId = localStorage.getItem('currentPersonaId') || 'default';
    const emojisKey = `persona_${personaId}_emojis`;
    const emojisStr = localStorage.getItem(emojisKey) || localStorage.getItem('emojis');
    const emojis = JSON.parse(emojisStr || '{"categories":["默认"],"items":{}}');
    
    if (!selectedCategory) {
        previewContainer.innerHTML = '<div style="font-size: 12px; color: #999; width: 100%; text-align: center; padding: 6px;">未绑定</div>';
        return;
    }
    
    const items = emojis.items[selectedCategory] || [];
    
    if (items.length === 0) {
        previewContainer.innerHTML = '<div style="font-size: 12px; color: #999; width: 100%; text-align: center; padding: 6px;">该分类暂无表情</div>';
        return;
    }
    
    // 显示前6个表情预览
    const previewItems = items.slice(0, 6);
    let html = previewItems.map(emoji => {
        const emojiUrl = typeof emoji === 'object' ? emoji.url : emoji;
        return `
            <div style="width: 32px; height: 32px; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; background: #fff;">
                <img src="${emojiUrl}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
        `;
    }).join('');
    
    if (items.length > 6) {
        html += `<div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: #f5f5f5; border-radius: 4px; font-size: 11px; color: #999;">+${items.length - 6}</div>`;
    }
    
    previewContainer.innerHTML = html;
};

// 监听"夺回账号"消息（如果 chat-app.html 是通过 iframe 嵌入的）
window.addEventListener('message', function(event) {
    const data = event.data;
    
    if (data.type === 'accountTakenBack') {
        console.log('🔓 收到夺回账号消息');
        console.log('🔓 角色名称:', data.checkerName);
        
        // 清除标志
        localStorage.removeItem('phone_being_checked');
        localStorage.removeItem('phone_checker_name');
        
        // 显示提示
        showToast(`已从 ${data.checkerName} 手中夺回账号`, 'success');
    }
});
