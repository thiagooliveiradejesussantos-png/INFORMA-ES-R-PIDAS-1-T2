// ===== ADMIN E AUTENTICAÇÃO =====

function openPasswordModal() {
    document.getElementById('passwordModal').classList.add('active');
    document.getElementById('passwordInput').value = '';
    setTimeout(() => document.getElementById('passwordInput').focus(), 100);
}

function closePasswordModal() {
    document.getElementById('passwordModal').classList.remove('active');
}

function checkPassword() {
    const input = document.getElementById('passwordInput').value;
    if (input === CONFIG.password) {
        closePasswordModal();
        state.isAdmin = true;
        document.getElementById('adminPanel').classList.add('active');
        renderScheduleList();
        renderTrash();
        botSpeak("🔓 Painel administrativo aberto! Agora você pode editar horários, publicar e gerenciar a lixeira.", 4000);
        renderContents(); // Re-render para mostrar botões de delete
    } else {
        closePasswordModal();
        showAccessDenied();
    }
}

function showAccessDenied() {
    const modal = document.getElementById('accessDenied');
    modal.classList.add('show');
    botSpeak("⚠️ Senha incorreta! Acesso negado.", 3000);
    setTimeout(() => modal.classList.remove('show'), 2500);
}

// ===== CONTEÚDO =====

function addContent(e) {
    e.preventDefault();
    
    const newContent = {
        id: Date.now(),
        title: document.getElementById('contentTitle').value,
        desc: document.getElementById('contentDesc').value,
        date: document.getElementById('contentDate').value,
        category: document.getElementById('contentCategory').value,
        tags: document.getElementById('contentTags').value.split(',').map(t => t.trim()).filter(t => t),
        pinned: document.getElementById('contentPinned').checked,
        images: [...state.tempImages],
        createdAt: new Date().toISOString()
    };
    
    state.contents.unshift(newContent);
    saveData();
    renderContents();
    
    // Reset form
    document.getElementById('contentForm').reset();
    document.getElementById('previewContainer').innerHTML = '';
    state.tempImages = [];
    document.getElementById('contentDate').valueAsDate = new Date();
    
    botSpeak(`✅ "${newContent.title}" publicado com sucesso! ${newContent.images.length > 0 ? newContent.images.length + ' foto(s) incluída(s)! 📷' : ''}`, 5000);
}

function deleteContent(id) {
    if (!confirm('Mover este item para a lixeira?')) return;
    
    const index = state.contents.findIndex(c => c.id === id);
    if (index > -1) {
        const item = state.contents[index];
        item.deletedAt = new Date().toISOString();
        trash.push(item);
        state.contents.splice(index, 1);
        
        saveData();
        saveTrash();
        renderContents();
        renderTrash();
        
        botSpeak("🗑️ Item movido para a lixeira! Você pode restaurá-lo se quiser.", 4000);
    }
}

function renderContents(searchTerm = '') {
    const grid = document.getElementById('contentGrid');
    
    let filtered = state.contents;
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = state.contents.filter(c => 
            c.title.toLowerCase().includes(term) ||
            c.desc.toLowerCase().includes(term) ||
            c.date.includes(term) ||
            c.tags.some(t => t.toLowerCase().includes(term))
        );
    }
    
    // Separar pinned e normal
    const pinned = filtered.filter(c => c.pinned);
    const normal = filtered.filter(c => !c.pinned);
    const sorted = [...pinned, ...normal];
    
    if (sorted.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <p>Nenhum conteúdo encontrado</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = sorted.map(c => `
        <div class="content-card">
            <div class="card-header">
                <div style="flex: 1;">
                    <div class="card-title">${c.title}</div>
                    <div class="card-date">📅 ${new Date(c.date).toLocaleDateString('pt-BR')} • ${c.category.toUpperCase()}</div>
                    ${c.pinned ? '<div class="pin-badge">📌 FIXADO</div>' : ''}
                </div>
                ${state.isAdmin ? `<button class="delete-card-btn" onclick="deleteContent(${c.id})" title="Mover para lixeira">🗑️</button>` : ''}
            </div>
            <div class="card-content">${c.desc}</div>
            ${c.images.length > 0 ? `
                <div class="card-images">
                    ${c.images.map((img, i) => `
                        <img src="${img}" class="card-image" onclick="openLightbox('${img}')" alt="Foto ${i + 1}">
                    `).join('')}
                </div>
            ` : ''}
            <div class="card-tags">
                ${c.tags.map(t => `<span class="tag">#${t}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

function searchContent() {
    const term = document.getElementById('searchBox').value;
    renderContents(term);
    
    if (term) {
        const count = state.contents.filter(c => 
            c.title.toLowerCase().includes(term.toLowerCase()) ||
            c.desc.toLowerCase().includes(term.toLowerCase())
        ).length;
        
        botSpeak(count > 0 ? `🔍 Encontrei ${count} resultado${count > 1 ? 's' : ''} para "${term}"` : `😕 Nada encontrado para "${term}"`, 4000);
    }
}

// ===== LIXEIRA =====

function renderTrash() {
    const list = document.getElementById('trashList');
    
    if (trash.length === 0) {
        list.innerHTML = '<div style="color: rgba(255,255,255,0.5); text-align: center; padding: 20px;">🗑️ Lixeira vazia</div>';
        return;
    }
    
    list.innerHTML = trash.map((item, index) => `
        <div class="trash-item">
            <div class="trash-item-title">${item.title}</div>
            <div class="trash-item-date">🗓️ Excluído em: ${new Date(item.deletedAt).toLocaleDateString('pt-BR')}</div>
            <div class="trash-actions">
                <button class="restore-btn" onclick="restoreFromTrash(${index})">♻️ Restaurar</button>
                <button class="permanent-delete-btn" onclick="permanentDelete(${index})">🗑️ Excluir Permanentemente</button>
            </div>
        </div>
    `).join('');
}

function restoreFromTrash(index) {
    const item = trash[index];
    delete item.deletedAt;
    state.contents.push(item);
    trash.splice(index, 1);
    
    saveData();
    saveTrash();
    renderContents();
    renderTrash();
    
    botSpeak(`♻️ "${item.title}" restaurado com sucesso!`, 4000);
}

function permanentDelete(index) {
    if (!confirm('⚠️ ATENÇÃO: Excluir permanentemente? Não poderá recuperar!')) return;
    
    trash.splice(index, 1);
    saveTrash();
    renderTrash();
    
    botSpeak("🗑️ Item excluído permanentemente!", 3000);
}

function emptyTrash() {
    if (!confirm('⚠️ Esvaziar toda a lixeira? Todos os itens serão perdidos para sempre!')) return;
    
    trash = [];
    saveTrash();
    renderTrash();
    
    botSpeak("🗑️ Lixeira esvaziada!", 3000);
}

// ===== HORÁRIOS =====

function changeDay(dayIndex) {
    state.currentDay = dayIndex;
    
    // Atualizar tabs
    document.querySelectorAll('.day-tab').forEach((tab, idx) => {
        tab.classList.toggle('active', idx === dayIndex);
    });
    
    renderSchedule(dayIndex);
    
    // Bot comenta se for hoje
    const today = new Date().getDay();
    if (dayIndex === today) {
        const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const hasClasses = SCHEDULES[dayIndex] && SCHEDULES[dayIndex].length > 0;
        
        if (hasClasses) {
            const count = SCHEDULES[dayIndex].length;
            botSpeak(`📚 Hoje é ${dayNames[dayIndex]}! Você tem ${count} aula${count > 1 ? 's' : ''}!`, 4000);
        } else {
            botSpeak(`🏖️ Hoje é ${dayNames[dayIndex]}! Dia de descanso!`, 4000);
        }
    }
}

function renderSchedule(dayIndex) {
    const container = document.getElementById('scheduleContainer');
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const schedule = SCHEDULES[dayIndex] || [];
    
    if (schedule.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏖️</div>
                <p>Sem aulas na ${dayNames[dayIndex]}</p>
            </div>
        `;
    } else {
        container.innerHTML = schedule.map(s => `
            <div class="time-slot">
                <div class="time">🕐 ${s.time}</div>
                <div class="subject">${s.subject}</div>
                <div class="room">📍 ${s.room}</div>
            </div>
        `).join('');
    }
}

// ===== EDITOR DE HORÁRIOS (ADMIN) =====

function renderScheduleList() {
    const list = document.getElementById('currentScheduleList');
    const daySelect = document.getElementById('scheduleDaySelect');
    const dayIndex = parseInt(daySelect.value);
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    let html = `<div style="margin-bottom: 15px;"><strong>📅 ${dayNames[dayIndex]}</strong></div>`;
    
    const daySchedule = SCHEDULES[dayIndex] || [];
    
    if (daySchedule.length === 0) {
        html += '<div style="color: rgba(255,255,255,0.5); padding: 10px;">Nenhuma aula cadastrada</div>';
    } else {
        daySchedule.forEach((item, index) => {
            html += `
                <div class="schedule-item">
                    <div class="schedule-item-info">
                        <div class="schedule-item-time">${item.time}</div>
                        <div class="schedule-item-subject">${item.subject}</div>
                        <div class="schedule-item-room">${item.room}</div>
                    </div>
                    <button class="delete-schedule-btn" onclick="deleteScheduleItem(${dayIndex}, ${index})">✕</button>
                </div>
            `;
        });
    }
    
    list.innerHTML = html;
}

// Atualizar lista quando mudar dia no select
document.addEventListener('DOMContentLoaded', () => {
    const daySelect = document.getElementById('scheduleDaySelect');
    if (daySelect) {
        daySelect.addEventListener('change', renderScheduleList);
    }
});

function addScheduleItem() {
    const dayIndex = parseInt(document.getElementById('scheduleDaySelect').value);
    const time = document.getElementById('scheduleTime').value;
    const subject = document.getElementById('scheduleSubject').value;
    const room = document.getElementById('scheduleRoom').value;
    
    if (!time || !subject || !room) {
        alert('Preencha todos os campos!');
        return;
    }
    
    if (!SCHEDULES[dayIndex]) {
        SCHEDULES[dayIndex] = [];
    }
    
    SCHEDULES[dayIndex].push({ time, subject, room });
    SCHEDULES[dayIndex].sort((a, b) => a.time.localeCompare(b.time));
    
    saveSchedules();
    renderScheduleList();
    
    // Atualizar visualização se estiver no mesmo dia
    if (state.currentDay === dayIndex) {
        renderSchedule(dayIndex);
    }
    
    botSpeak(`✅ Aula de ${subject} adicionada!`, 3000);
    
    // Limpar campos
    document.getElementById('scheduleTime').value = '';
    document.getElementById('scheduleSubject').value = '';
    document.getElementById('scheduleRoom').value = '';
}

function deleteScheduleItem(dayIndex, index) {
    if (!confirm('Remover esta aula?')) return;
    
    SCHEDULES[dayIndex].splice(index, 1);
    saveSchedules();
    renderScheduleList();
    
    if (state.currentDay === dayIndex) {
        renderSchedule(dayIndex);
    }
}

// ===== LIGHTBOX =====

function openLightbox(src) {
    document.getElementById('lightboxImg').src = src;
    document.getElementById('lightbox').classList.add('active');
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
}

// ===== INICIALIZAÇÃO =====

document.addEventListener('DOMContentLoaded', () => {
    loadSchedules();
    loadTrash();
    initData();
    initBot();
    
    renderSchedule(state.currentDay);
    renderContents();
    
    // Esconder loader
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 1500);
});

// Eventos globais
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closePasswordModal();
        closeLightbox();
        document.getElementById('accessDenied').classList.remove('show');
    }
    if (e.key === 'Enter' && document.getElementById('passwordModal').classList.contains('active')) {
        checkPassword();
    }
});