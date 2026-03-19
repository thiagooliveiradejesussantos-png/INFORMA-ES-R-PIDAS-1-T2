// ===== BOT AUTÔNOMO - FALA SOZINHO =====

let botHasGreeted = false;

function initBot() {
    // Bot não se move mais, fica centralizado
    // Fala automaticamente após carregamento
    setTimeout(() => {
        if (!botHasGreeted) {
            botAutoGreet();
            botHasGreeted = true;
        }
    }, 2500);
    
    // Verificar novidades periodicamente
    setInterval(checkBotNews, 12000);
}

function botAutoGreet() {
    const now = new Date();
    const hour = now.getHours();
    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const dayName = dayNames[now.getDay()];
    
    let greeting = "Olá!";
    if (hour < 12) greeting = "Bom dia!";
    else if (hour < 18) greeting = "Boa tarde!";
    else greeting = "Boa noite!";
    
    const pinned = state.contents.filter(c => c.pinned).length;
    let message = `${greeting} Hoje é ${dayName}! `;
    
    if (pinned > 0) {
        message += `Temos ${pinned} novidade${pinned > 1 ? 's' : ''} fixada${pinned > 1 ? 's' : ''}! 📌`;
    } else {
        message += "Bem-vindo ao Easy Support! 📚";
    }
    
    // Adicionar mensagem sobre horários se for dia de aula
    const today = now.getDay();
    if (today >= 1 && today <= 5) {
        const hasClasses = SCHEDULES[today] && SCHEDULES[today].length > 0;
        if (hasClasses) {
            message += " Você tem aulas hoje! 📖";
        } else {
            message += " Dia de descanso! 🎉";
        }
    }
    
    botSpeak(message, 6000);
}

function botSpeak(msg, duration = 5000) {
    const bubble = document.getElementById('botBubble');
    const msgDiv = document.getElementById('botMessage');
    const typing = document.getElementById('typingIndicator');
    
    // Mostrar typing
    bubble.classList.add('show');
    msgDiv.style.opacity = '0.3';
    typing.classList.add('show');
    
    setTimeout(() => {
        typing.classList.remove('show');
        msgDiv.style.opacity = '1';
        msgDiv.textContent = msg;
        
        // Esconder após tempo
        setTimeout(() => {
            bubble.classList.remove('show');
        }, duration);
    }, 800);
}

function checkBotNews() {
    const pinned = state.contents.filter(c => c.pinned).length;
    const badge = document.getElementById('botBadge');
    
    if (pinned > 0) {
        badge.textContent = pinned > 9 ? '9+' : pinned;
        badge.classList.add('show');
        
        // Lembrar sobre novidades ocasionalmente (30% chance)
        if (Math.random() > 0.7) {
            const msgs = [
                `📌 Não esqueça: ${pinned} atualização${pinned > 1 ? 's' : ''} importante${pinned > 1 ? 's' : ''}!`,
                "📚 Verifique os horários de hoje!",
                "🔍 Use a busca para encontrar conteúdos!",
                "📸 Fotos já visíveis nos cards!"
            ];
            botSpeak(msgs[Math.floor(Math.random() * msgs.length)], 4000);
        }
    } else {
        badge.classList.remove('show');
    }
}