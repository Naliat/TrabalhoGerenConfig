let currentUser = null;
let db = {};

/**
 * Verifica se o usuário está logado (na sessionStorage).
 * Se não estiver, redireciona para a página de login.
 */
export function initAuthGatekeeper() {
    currentUser = sessionStorage.getItem('studyFlowUser');
    if (!currentUser) {
        window.location.href = 'login.html';
    }
}

/**
 * Carrega os dados do usuário (do localStorage) para a variável 'db'.
 * Se não houver dados, inicializa com uma estrutura padrão.
 */
export function loadUserData() {
    if (currentUser) {
        db = JSON.parse(localStorage.getItem(`db_${currentUser}`));
        
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

/**
 * Salva o estado atual da variável 'db' no localStorage.
 */
export function saveUserData() {
    if (currentUser) {
        localStorage.setItem(`db_${currentUser}`, JSON.stringify(db));
    }
}

/**
 * Retorna o objeto 'db' completo.
 */
export function getDB() {
    return db;
}

/**
 * Retorna o email do usuário logado.
 */
export function getCurrentUserEmail() {
    return currentUser;
}

/**
 * Retorna o nome do usuário (parte antes do @).
 */
export function getUserName() {
    return currentUser ? currentUser.split('@')[0] : 'Aluno';
}

/**
 * Realiza o logout do usuário, limpa a sessão e redireciona para o login.
 */
export function handleLogout() {
    currentUser = null;
    sessionStorage.removeItem('studyFlowUser');
    db = {};
    window.location.href = 'login.html';
}