document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
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
     * Salva a lista de usuários no localStorage.
     * @param {Array} users - A lista de usuários a ser salva.
     */
    function saveUsers(users) {
        localStorage.setItem('studyFlowUsers', JSON.stringify(users));
    }

    /**
     * Lida com a submissão do formulário de registro.
     */
    function handleRegister(e) {
        e.preventDefault();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value.trim();
        const users = loadUsers();
        
        if (!email || !password) {
             showToast('Preencha todos os campos.', 'error');
            return;
        }

        if (password.length < 6) {
             showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }

        const userExists = users.find(user => user.email === email);
        
        if (userExists) {
            showToast('Este email já está cadastrado.', 'error');
            return;
        }
        
        users.push({ email, password });
        saveUsers(users);
        showToast('Conta criada com sucesso! Faça o login.');
        registerForm.reset();
        
        // Redireciona para a página de login
        setTimeout(() => {
             window.location.href = 'login.html';
        }, 1500);
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
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});