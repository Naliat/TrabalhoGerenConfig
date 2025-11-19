// frontend/js/usuario.js
let currentUser = null;
let db = {};

function _parseStoredUser(stored) {
    if (!stored) return null;

    // 1) tenta JSON.parse (valor moderno: JSON.stringify(user))
    try {
        const parsed = JSON.parse(stored);
        // se for objeto com email, ok
        if (parsed && typeof parsed === 'object' && parsed.email) return parsed;
    } catch (err) {
        // ignora — tente interpretar como string simples abaixo
    }

    // 2) se for apenas uma string de email (legado), normalize para objeto
    // Ex.: stored === "fulano@gmail.com"
    if (typeof stored === 'string' && stored.includes('@')) {
        return { email: stored };
    }

    // 3) caso contrário, inválido
    return null;
}

export function initAuthGatekeeper() {
    const stored = sessionStorage.getItem("studyFlowUser");
    currentUser = _parseStoredUser(stored);

    // se encontrei um valor legado (string) eu atualizo para o formato moderno
    if (currentUser && typeof stored === 'string') {
        // salva no formato moderno para evitar problemas futuros
        sessionStorage.setItem("studyFlowUser", JSON.stringify(currentUser));
    }

    if (!currentUser) {
        // garante que não haja lixo no storage
        sessionStorage.removeItem("studyFlowUser");
        window.location.href = "login.html";
    }
}

export function loadUserData() {
    if (currentUser && currentUser.email) {
        const key = `db_${currentUser.email}`;
        try {
            db = JSON.parse(localStorage.getItem(key));
        } catch (err) {
            db = null;
        }

        if (!db) {
            db = {
                schedule: {
                    mon: "Português, Informática",
                    tue: "Banco de Dados, IA",
                    wed: "Matemática, Física",
                    thu: "Eng. de Software",
                    fri: "Português, Redação",
                    sat: "Revisão Geral",
                    sun: "Descanso"
                },
                studies: [],
                revisions: []
            };
            saveUserData();
        }
    }
}

export function saveUserData() {
    if (currentUser && currentUser.email) {
        localStorage.setItem(`db_${currentUser.email}`, JSON.stringify(db));
    }
}

export function getDB() {
    return db;
}

export function getCurrentUserEmail() {
    return currentUser ? currentUser.email : null;
}

export function getUserName() {
    return currentUser ? currentUser.email.split('@')[0] : "Aluno";
}

export function handleLogout() {
    sessionStorage.removeItem("studyFlowUser");
    db = {};
    currentUser = null;
    window.location.href = "login.html";
}
