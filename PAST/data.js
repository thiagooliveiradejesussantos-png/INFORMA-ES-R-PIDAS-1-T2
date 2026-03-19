// ===== CONFIGURAÇÃO =====
const CONFIG = {
    password: '2736',
    maxImages: 5
};

// ===== ESTADO GLOBAL =====
let state = {
    contents: [],
    tempImages: [],
    isAdmin: false,
    currentDay: new Date().getDay()
};

let SCHEDULES = {};
let trash = [];

// ===== CARREGAR DADOS =====
function loadSchedules() {
    const saved = localStorage.getItem('easysupport_schedules');
    if (saved) {
        SCHEDULES = JSON.parse(saved);
    } else {
        // Horários padrão
        SCHEDULES = {
            0: [],
            1: [
                { time: "07:30", subject: "Matemática", room: "Sala 101" },
                { time: "09:00", subject: "Português", room: "Sala 102" },
                { time: "10:30", subject: "História", room: "Sala 103" }
            ],
            2: [
                { time: "07:30", subject: "Química", room: "Lab 2" },
                { time: "09:00", subject: "Biologia", room: "Lab 3" },
                { time: "10:30", subject: "Geografia", room: "Sala 201" }
            ],
            3: [
                { time: "07:30", subject: "Física", room: "Lab 1" },
                { time: "09:00", subject: "Matemática", room: "Sala 101" },
                { time: "10:30", subject: "Ed. Física", room: "Ginásio" }
            ],
            4: [
                { time: "07:30", subject: "História", room: "Sala 103" },
                { time: "09:00", subject: "Português", room: "Sala 102" },
                { time: "10:30", subject: "Química", room: "Lab 2" }
            ],
            5: [
                { time: "07:30", subject: "Biologia", room: "Lab 3" },
                { time: "09:00", subject: "Geografia", room: "Sala 201" },
                { time: "10:30", subject: "Inglês", room: "Sala 202" }
            ],
            6: []
        };
        saveSchedules();
    }
}

function saveSchedules() {
    localStorage.setItem('easysupport_schedules', JSON.stringify(SCHEDULES));
}

function loadTrash() {
    const saved = localStorage.getItem('easysupport_trash');
    if (saved) {
        trash = JSON.parse(saved);
    } else {
        trash = [];
    }
}

function saveTrash() {
    localStorage.setItem('easysupport_trash', JSON.stringify(trash));
}

function initData() {
    const saved = localStorage.getItem('easysupport_data');
    if (saved) {
        state.contents = JSON.parse(saved);
    } else {
        // Dados iniciais
        state.contents = [{
            id: 1,
            title: "Bem-vindo ao Easy Support!",
            desc: "Sistema de apoio escolar completo! Fotos visíveis automaticamente, horários editáveis e lixeira para recuperar itens. 🎓📸",
            date: new Date().toISOString().split('T')[0],
            category: "geral",
            tags: ["boas-vindas", "sistema"],
            pinned: true,
            images: [],
            createdAt: new Date().toISOString()
        }];
        saveData();
    }
    
    const dateInput = document.getElementById('contentDate');
    if (dateInput) dateInput.valueAsDate = new Date();
}

function saveData() {
    localStorage.setItem('easysupport_data', JSON.stringify(state.contents));
}

// ===== PREVIEW DE IMAGENS =====
function previewImages() {
    const input = document.getElementById('contentImages');
    const container = document.getElementById('previewContainer');
    
    state.tempImages = [];
    container.innerHTML = '';

    if (input.files.length > CONFIG.maxImages) {
        alert(`Máximo ${CONFIG.maxImages} fotos!`);
        input.value = '';
        return;
    }

    Array.from(input.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            state.tempImages.push(e.target.result);
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'preview-item';
            container.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}