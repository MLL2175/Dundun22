// 世界书管理模块

// 打开世界书管理器
window.openWorldbookManager = function() {
    console.log('打开世界书管理器');
    renderWorldbookList();
    document.getElementById('worldbook-modal').style.display = 'block';
};

// 关闭世界书管理器
window.closeWorldbookModal = function() {
    document.getElementById('worldbook-modal').style.display = 'none';
};

// 渲染世界书列表
function renderWorldbookList() {
    const container = document.getElementById('worldbook-list-container');
    if (!container) return;
    
    // 获取世界书列表
    const worldbooks = JSON.parse(localStorage.getItem('worldbooks') || '[]');
    
    console.log('世界书列表:', worldbooks);
    
    if (worldbooks.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #999;">
                <div style="font-size: 48px; margin-bottom: 16px;">📚</div>
                <div style="font-size: 14px;">暂无世界书，点击上方按钮创建</div>
            </div>
        `;
        return;
    }
    
    // 清空容器
    container.innerHTML = '';
    
    // 渲染每个世界书
    worldbooks.forEach((wb, index) => {
        const wbItem = document.createElement('div');
        wbItem.style.cssText = `
            padding: 16px;
            border: 1px solid #e5e5e5;
            border-radius: 12px;
            margin-bottom: 12px;
            transition: all 0.2s;
        `;
        wbItem.onmouseover = () => {
            wbItem.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        };
        wbItem.onmouseout = () => {
            wbItem.style.boxShadow = 'none';
        };
        
        const createdAt = wb.createdAt ? new Date(wb.createdAt).toLocaleDateString('zh-CN') : '未知';
        
        wbItem.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <div style="flex: 1;">
                    <div style="font-size: 16px; font-weight: 600; color: #333; margin-bottom: 4px;">${wb.name || '未命名世界书'}</div>
                    <div style="font-size: 12px; color: #999;">创建于 ${createdAt}</div>
                </div>
                <div style="display: flex; gap: 8px; margin-left: 12px;">
                    <button onclick="editWorldbook('${wb.id}')" style="padding: 6px 12px; background: #007AFF; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">编辑</button>
                    <button onclick="deleteWorldbook('${wb.id}')" style="padding: 6px 12px; background: #ff6b6b; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">删除</button>
                </div>
            </div>
            ${wb.description ? `<div style="font-size: 13px; color: #666; margin-top: 8px; line-height: 1.5;">${wb.description}</div>` : ''}
        `;
        
        container.appendChild(wbItem);
    });
}

// 显示添加世界书表单
window.showAddWorldbookForm = function() {
    const modalBody = document.getElementById('modal-body');
    if (!modalBody) return;
    
    modalBody.innerHTML = `
        <div style="padding: 20px;">
            <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 20px; color: #333;">创建新世界书</h3>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-size: 14px; color: #666; margin-bottom: 8px;">世界书名称 *</label>
                <input type="text" id="new-worldbook-name" style="width: 100%; padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; outline: none;" placeholder="请输入世界书名称">
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-size: 14px; color: #666; margin-bottom: 8px;">描述</label>
                <textarea id="new-worldbook-description" rows="4" style="width: 100%; padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; outline: none; resize: vertical; font-family: inherit;" placeholder="请输入世界书描述（可选）"></textarea>
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-size: 14px; color: #666; margin-bottom: 8px;">世界设定</label>
                <textarea id="new-worldbook-setting" rows="6" style="width: 100%; padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; outline: none; resize: vertical; font-family: inherit;" placeholder="请输入世界观、背景设定等内容"></textarea>
            </div>
            
            <div style="display: flex; gap: 12px; margin-top: 24px;">
                <button onclick="closeMobileModal()" style="flex: 1; padding: 12px; background: #f0f0f0; color: #666; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: 500;">取消</button>
                <button onclick="saveNewWorldbook()" style="flex: 1; padding: 12px; background: #07C160; color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: 500;">保存</button>
            </div>
        </div>
    `;
    
    // 使用现有的弹窗
    window.showMobileModal('创建世界书', '');
};

// 保存新世界书
window.saveNewWorldbook = function() {
    try {
        const name = document.getElementById('new-worldbook-name').value.trim();
        const description = document.getElementById('new-worldbook-description').value.trim();
        const setting = document.getElementById('new-worldbook-setting').value.trim();
        
        if (!name) {
            showToast('请输入世界书名称');
            return;
        }
        
        // 获取现有世界书列表
        const worldbooks = JSON.parse(localStorage.getItem('worldbooks') || '[]');
        
        // 创建新世界书
        const newWorldbook = {
            id: 'wb_' + Date.now(),
            name: name,
            description: description,
            setting: setting,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        // 添加到列表
        worldbooks.push(newWorldbook);
        
        // 保存到 localStorage
        localStorage.setItem('worldbooks', JSON.stringify(worldbooks));
        
        console.log('✓ 世界书创建成功:', newWorldbook);
        
        // 关闭弹窗
        closeMobileModal();
        
        // 刷新列表
        renderWorldbookList();
        
        showToast('世界书创建成功！');
    } catch (e) {
        console.error('创建世界书失败:', e);
        showToast('创建失败: ' + e.message);
    }
};

// 编辑世界书
window.editWorldbook = function(worldbookId) {
    const worldbooks = JSON.parse(localStorage.getItem('worldbooks') || '[]');
    const wb = worldbooks.find(w => w.id === worldbookId);
    
    if (!wb) {
        showToast('未找到世界书');
        return;
    }
    
    const modalBody = document.getElementById('modal-body');
    if (!modalBody) return;
    
    modalBody.innerHTML = `
        <div style="padding: 20px;">
            <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 20px; color: #333;">编辑世界书</h3>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-size: 14px; color: #666; margin-bottom: 8px;">世界书名称 *</label>
                <input type="text" id="edit-worldbook-name" value="${wb.name || ''}" style="width: 100%; padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; outline: none;" placeholder="请输入世界书名称">
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-size: 14px; color: #666; margin-bottom: 8px;">描述</label>
                <textarea id="edit-worldbook-description" rows="4" style="width: 100%; padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; outline: none; resize: vertical; font-family: inherit;" placeholder="请输入世界书描述（可选）">${wb.description || ''}</textarea>
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-size: 14px; color: #666; margin-bottom: 8px;">世界设定</label>
                <textarea id="edit-worldbook-setting" rows="6" style="width: 100%; padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; outline: none; resize: vertical; font-family: inherit;" placeholder="请输入世界观、背景设定等内容">${wb.setting || ''}</textarea>
            </div>
            
            <div style="display: flex; gap: 12px; margin-top: 24px;">
                <button onclick="closeMobileModal()" style="flex: 1; padding: 12px; background: #f0f0f0; color: #666; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: 500;">取消</button>
                <button onclick="updateWorldbook('${wb.id}')" style="flex: 1; padding: 12px; background: #007AFF; color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: 500;">更新</button>
            </div>
        </div>
    `;
    
    window.showMobileModal('编辑世界书', '');
};

// 更新世界书
window.updateWorldbook = function(worldbookId) {
    try {
        const name = document.getElementById('edit-worldbook-name').value.trim();
        const description = document.getElementById('edit-worldbook-description').value.trim();
        const setting = document.getElementById('edit-worldbook-setting').value.trim();
        
        if (!name) {
            showToast('请输入世界书名称');
            return;
        }
        
        // 获取世界书列表
        const worldbooks = JSON.parse(localStorage.getItem('worldbooks') || '[]');
        const wbIndex = worldbooks.findIndex(w => w.id === worldbookId);
        
        if (wbIndex === -1) {
            showToast('未找到世界书');
            return;
        }
        
        // 更新世界书
        worldbooks[wbIndex].name = name;
        worldbooks[wbIndex].description = description;
        worldbooks[wbIndex].setting = setting;
        worldbooks[wbIndex].updatedAt = Date.now();
        
        // 保存
        localStorage.setItem('worldbooks', JSON.stringify(worldbooks));
        
        console.log('✓ 世界书更新成功');
        
        // 关闭弹窗
        closeMobileModal();
        
        // 刷新列表
        renderWorldbookList();
        
        showToast('世界书更新成功！');
    } catch (e) {
        console.error('更新世界书失败:', e);
        showToast('更新失败: ' + e.message);
    }
};

// 删除世界书
window.deleteWorldbook = function(worldbookId) {
    if (!confirm('确定要删除这个世界书吗？此操作不可恢复！')) {
        return;
    }
    
    try {
        // 获取世界书列表
        const worldbooks = JSON.parse(localStorage.getItem('worldbooks') || '[]');
        const filteredWorldbooks = worldbooks.filter(w => w.id !== worldbookId);
        
        // 保存
        localStorage.setItem('worldbooks', JSON.stringify(filteredWorldbooks));
        
        console.log('✓ 世界书已删除');
        
        // 刷新列表
        renderWorldbookList();
        
        showToast('世界书已删除');
    } catch (e) {
        console.error('删除世界书失败:', e);
        showToast('删除失败: ' + e.message);
    }
};
