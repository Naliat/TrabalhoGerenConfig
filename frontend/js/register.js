document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const toast = document.getElementById('toast-notification');

    // CORREÇÃO CRÍTICA: Define a URL da API dinamicamente com base no ambiente
    const hostname = window.location.hostname;
    let API_URL;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Ambiente de Desenvolvimento Local
        API_URL = "http://127.0.0.1:5000/api";
    } else {
        // Ambiente de Produção (Render)
        API_URL = "https://trab-de-lip-sitask.onrender.com/api"; // URL de Produção Correta
    }
    // Fim da definição da URL

    function showToast(message, type = 'success') {
        if (!toast) {
            // Usando console.error/log em vez de alert, conforme as boas práticas.
            console.error(message);
            return;
        }
        toast.textContent = message;
        toast.className = type;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    async function handleRegister(e) {
        e.preventDefault();

        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value.trim();
        const name = document.getElementById('register-name').value.trim();

        if (!email || !password || !name) {
            showToast('Preencha todos os campos.', 'error');
            return;
        }

        if (password.length < 6) {
            showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }

        try {
            // Usa a URL dinâmica definida acima
            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password, name }),
            });

            // Melhoria: Trata a resposta se o status não for OK
            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                let errorResult = {};
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    errorResult = await response.json();
                }

                showToast(errorResult.error || `Erro ao registrar: Status ${response.status}`, 'error');
                return;
            }

            // Se o response.ok for true, processa o sucesso
            // Não precisa de await response.json() aqui se o backend não retornar dados de sucesso
            // Se o backend retornar JSON, use: const data = await response.json();
            
            showToast('Conta criada com sucesso! Faça login.');
            registerForm.reset();

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);

        } catch (error) {
            // Este catch lida com falhas de DNS ou falha de conexão inicial.
            console.error("Erro na requisição:", error);
            showToast('Falha ao conectar ao servidor. Verifique sua conexão.', 'error');
        }
    }

    function checkAuthGuard() {
        if (sessionStorage.getItem('studyFlowUser')) {
            window.location.href = 'app.html';
        }
    }

    checkAuthGuard();

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});