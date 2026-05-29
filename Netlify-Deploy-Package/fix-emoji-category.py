#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修改 chat-interface.js 中的角色表情包逻辑
从"单个表情列表"改为"分类绑定"
"""

import re

file_path = 'e:/project_20260401_020123/Netlify-Deploy-Package/chat-interface.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 旧代码模式
old_pattern = r'''// 📸 读取角色绑定的表情包
    try \{
        const roleKey = `persona_\$\{localStorage\.getItem\('currentPersona'\) \|\| 'default'\}_roles`;
        const roles = JSON\.parse\(localStorage\.getItem\(roleKey\) \|\| '\[\]'\);
        const currentRole = roles\.find\(r => r\.id === (currentChatId|task\.chatId)\);
        
        if \(currentRole\) \{
            const roleEmojisKey = `role_\$\{(currentChatId|task\.chatId)\}_emojis`;
            const roleEmojis = JSON\.parse\(localStorage\.getItem\(roleEmojisKey\) \|\| '\[\]'\);
            
            if \(roleEmojis\.length > 0\) \{
                // 构建表情包列表（最多显示10个）
                const emojiList = roleEmojis\.slice\(0, 10\);
                let emojiContext = '\\n\\n【你可以发送的表情包】：\\n';
                emojiContext \+= '你可以从以下表情包中选择发送，回复时直接使用图片URL：\\n';
                emojiList\.forEach\(\(emojiUrl, index\) => \{
                    emojiContext \+= `\$\{index \+ 1\}\. \$\{emojiUrl\}\\n`;
                \}\);
                emojiContext \+= '\\n注意：发送表情包时，直接返回图片URL即可，不要添加额外说明。\\n';
                systemPrompt = systemPrompt \+ emojiContext;
                console\.log\(`📸 (已加载|后台任务：已加载) \$\{roleEmojis\.length\} 个角色表情包`\);
            \}
        \}
    \} catch \(e\) \{
        console\.error\('读取角色表情包失败:', e\);
    \}'''

# 新代码模板
def replacement(match):
    chat_id_var = match.group(1) if match.group(1) == 'currentChatId' else 'task.chatId'
    log_prefix = '后台任务：' if chat_id_var == 'task.chatId' else ''
    
    return f'''//  读取角色绑定的表情包分类
    try {{
        const roleKey = `persona_${{localStorage.getItem('currentPersona') || 'default'}}_roles`;
        const roles = JSON.parse(localStorage.getItem(roleKey) || '[]');
        const currentRole = roles.find(r => r.id === {chat_id_var});
        
        if (currentRole) {{
            // 读取角色绑定的表情包分类
            const emojiCategory = localStorage.getItem(`role_${{{chat_id_var}}}_emoji_category`) || '';
            
            if (emojiCategory) {{
                // 从全局表情包库中获取该分类下的所有表情
                const emojis = JSON.parse(localStorage.getItem('emojis') || '{{"categories":["默认"],"items":{{}}}}');
                const categoryEmojis = emojis.items[emojiCategory] || [];
                
                if (categoryEmojis.length > 0) {{
                    // 构建表情包列表（最多显示15个）
                    const emojiList = categoryEmojis.slice(0, 15);
                    let emojiContext = '\\n\\n【你可以发送的表情包 - ' + emojiCategory + '分类】：\\n';
                    emojiContext += '你可以从以下表情包中选择发送，回复时直接使用图片URL：\\n';
                    emojiList.forEach((emoji, index) => {{
                        const emojiUrl = typeof emoji === 'object' ? emoji.url : emoji;
                        emojiContext += `${{index + 1}}. ${{emojiUrl}}\\n`;
                    }});
                    emojiContext += '\\n注意：发送表情包时，直接返回图片URL即可，不要添加额外说明。你可以根据对话内容智能选择是否发送表情包。\\n';
                    systemPrompt = systemPrompt + emojiContext;
                    console.log(`{log_prefix}已加载"${{emojiCategory}}"分类的 ${{categoryEmojis.length}} 个表情包`);
                }}
            }}
        }}
    }} catch (e) {{
        console.error('读取角色表情包失败:', e);
    }}'''

# 执行替换
new_content = re.sub(old_pattern, replacement, content, flags=re.DOTALL)

# 写回文件
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ 修改完成！")
print("已将角色表情包从'单个表情列表'改为'分类绑定'模式")
