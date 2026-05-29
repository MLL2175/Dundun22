// 检查并修复 chat-interface.js 的语法问题
// 此脚本将帮助您定位问题

console.log('开始检查...');

// 读取文件
const fs = require('fs');
const path = 'e:/project_20260401_020123/Netlify-Deploy-Package/chat-interface.js';

try {
    const content = fs.readFileSync(path, 'utf8');
    
    // 检查是否有BOM
    if (content.charCodeAt(0) === 0xFEFF) {
        console.log('⚠️  文件包含BOM字符，正在移除...');
        const cleanContent = content.slice(1);
        fs.writeFileSync(path, cleanContent, 'utf8');
        console.log('✅ BOM已移除');
    } else {
        console.log('✅ 文件没有BOM');
    }
    
    // 尝试解析
    new Function(content);
    console.log('✅ JS文件语法正常');
    
} catch(e) {
    console.error('❌ 错误:', e.message);
    console.error('❌ 位置:', e.stack);
}
