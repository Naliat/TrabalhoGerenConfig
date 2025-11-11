document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const toast = document.getElementById('toast-notification');

    /**
     * Mostra uma notificação (toast) na tela.
     * @param {string} message - A mensagem a ser exibida.
     * @param {string} [type='success'] - 'success' ou 'error'.
     */
    function showToast(message, type = 'success') {
        if (!toast) {
            console.warn('Elemento toast não encontrado. Usando alert() como fallback.');
            alert(message);
            return;
        }
        toast.textContent = message;
        toast.className = type; // Remove classes antigas
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    /**
     * Carrega a lista de usuários do localStorage.
     * @returns {Array} - A lista de usuários.
     */
    function loadUsers() {
        return JSON.parse(localStorage.getItem('studyFlowUsers')) || [];
    }

    /**
     * Lida com a submissão do formulário de login.
     */
    function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const users = loadUsers();

        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Salva o usuário na *sessão* (dura enquanto o navegador está aberto)
            sessionStorage.setItem('studyFlowUser', user.email);
            // Redireciona para a página principal do app
            window.location.href = 'app.html';
        } else {
            showToast('Email ou senha inválidos.', 'error');
        }
    }

    /**
     * "Auth Guard" - Se o usuário já estiver logado, redireciona para o app.
     */
    function checkAuthGuard() {
        if (sessionStorage.getItem('studyFlowUser')) {
            window.location.href = 'app.html';
        }
    }

    // --- Inicialização ---
    checkAuthGuard(); // Verifica se já está logado
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});