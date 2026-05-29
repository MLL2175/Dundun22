// 角色表情包管理功能 - 按分类绑定

let currentRoleEmojiRoleId = null;

// 打开角色表情包分类选择器
window.openRoleEmojiManager = function() {
    const roleId = document.getElementById('role-id')?.value;
    if (!roleId) {
        showToast('请先保存角色');
        return;
    }
    
    currentRoleEmojiRoleId = roleId;
    renderRoleEmojiCategories();
    openModal('role-emoji-modal');
};

// 渲染表情包分类列表
function renderRoleEmojiCategories() {
    const emojis = getData('emojis') || { categories: ['默认'], items: {} };
    const roleId = currentRoleEmojiRoleId;
    
    if (!roleId) return;
    
    // 获取当前角色已绑定的分类
    const currentCategory = getData(`role_${roleId}_emoji_category`) || '';
    
    const listContainer = document.getElementById('role-emoji-category-list');
    if (!listContainer) return;
    
    let html = '';
    
    // 添加"不绑定"选项
    html += `
        <div onclick="window.selectRoleEmojiCategory('')" style="padding: 12px 16px; border: 2px solid ${currentCategory === '' ? '#1a1a1a' : '#e0e0e0'}; border-radius: 8px; cursor: pointer; background: ${currentCategory === '' ? '#f5f5f5' : '#fff'}; transition: all 0.2s;" onmouseover="this.style.borderColor='${currentCategory === '' ? '#1a1a1a' : '#999'}'" onmouseout="this.style.borderColor='${currentCategory === '' ? '#1a1a1a' : '#e0e0e0'}'">
            <div style="font-size: 14px; font-weight: 500; color: #333; margin-bottom: 4px;">不绑定表情包</div>
            <div style="font-size: 12px; color: #999;">角色将不能发送表情包</div>
        </div>
    `;
    
    // 添加所有分类选项
    emojis.categories.forEach(category => {
        const itemCount = (emojis.items[category] || []).length;
        const isSelected = currentCategory === category;
        
        html += `
            <div onclick="window.selectRoleEmojiCategory('${category}')" style="padding: 12px 16px; border: 2px solid ${isSelected ? '#1a1a1a' : '#e0e0e0'}; border-radius: 8px; cursor: pointer; background: ${isSelected ? '#f5f5f5' : '#fff'}; transition: all 0.2s;" onmouseover="this.style.borderColor='${isSelected ? '#1a1a1a' : '#999'}'" onmouseout="this.style.borderColor='${isSelected ? '#1a1a1a' : '#e0e0e0'}'">
                <div style="font-size: 14px; font-weight: 500; color: #333; margin-bottom: 4px;">${category}</div>
                <div style="font-size: 12px; color: #999;">包含 ${itemCount} 个表情</div>
            </div>
        `;
    });
    
    listContainer.innerHTML = html;
}

// 选择表情包分类
window.selectRoleEmojiCategory = function(category) {
    if (!currentRoleEmojiRoleId) return;
    
    // 保存选择的分类
    saveData(`role_${currentRoleEmojiRoleId}_emoji_category`, category);
    
    // 更新角色编辑弹窗中的下拉框
    const selectElement = document.getElementById('role-emoji-category');
    if (selectElement) {
        selectElement.value = category;
        updateRoleEmojiPreview();
    }
    
    // 关闭弹窗
    closeModal('role-emoji-modal');
    
    showToast(category ? `已绑定"${category}"分类` : '已解绑表情包');
};

// 更新角色编辑弹窗中的表情包分类下拉框
window.updateRoleEmojiCategorySelect = function() {
    const selectElement = document.getElementById('role-emoji-category');
    if (!selectElement) return;
    
    const emojis = getData('emojis') || { categories: ['默认'], items: {} };
    const roleId = document.getElementById('role-id')?.value;
    const currentCategory = roleId ? (getData(`role_${roleId}_emoji_category`) || '') : '';
    
    // 清空选项
    selectElement.innerHTML = '<option value="">不绑定表情包</option>';
    
    // 添加所有分类
    emojis.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        if (category === currentCategory) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
    
    updateRoleEmojiPreview();
};

// 更新角色编辑弹窗中的表情包预览
window.updateRoleEmojiPreview = function() {
    const selectElement = document.getElementById('role-emoji-category');
    const previewContainer = document.getElementById('role-emoji-category-preview');
    
    if (!selectElement || !previewContainer) return;
    
    const selectedCategory = selectElement.value;
    const emojis = getData('emojis') || { categories: ['默认'], items: {} };
    
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

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 延迟执行，确保DOM已完全加载
    setTimeout(() => {
        updateRoleEmojiCategorySelect();
    }, 100);
});
