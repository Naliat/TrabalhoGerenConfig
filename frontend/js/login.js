document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const toast = document.getElementById('toast-notification');

    // CORREÇÃO: Define a URL da API dinamicamente com base no ambiente
    const hostname = window.location.hostname;
    let API_URL;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Ambiente de Desenvolvimento Local
        API_URL = "http://127.0.0.1:5000/api";
    } else {
        // Ambiente de Produção (Render)
        API_URL = "https://trab-de-lip-sitask.onrender.com/api";
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

        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    async function handleLogin(e) {
        e.preventDefault();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();

        if (!email || !password) {
            showToast("Preencha todos os campos.", "error");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            // Melhoria: Lida com erros de rede (status 500, 403, 404, etc.)
            if (!response.ok) {
                // Tenta ler o erro do corpo da resposta JSON
                const contentType = response.headers.get("content-type");
                let errorResult = {};
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    errorResult = await response.json();
                } else {
                    // Se não for JSON, usa o status HTTP
                    showToast(`Erro de rede: Status ${response.status}`, "error");
                    return;
                }
                
                showToast(errorResult.error || `Erro de rede: Status ${response.status}`, "error");
                return;
            }
            
            const result = await response.json();

            sessionStorage.setItem("studyFlowUser", JSON.stringify(result.user));

            showToast("Login realizado com sucesso!");

            setTimeout(() => {
                window.location.href = "app.html";
            }, 1000);

        } catch (err) {
            // Este catch lida com falhas de DNS ou falha de conexão inicial.
            console.error("Erro no login:", err);
            // Mensagem de erro mais útil
            showToast("Falha ao se conectar ao servidor. Verifique sua conexão.", "error");
        }
    }

    function checkAuthGuard() {
        if (sessionStorage.getItem("studyFlowUser")) {
            window.location.href = "app.html";
        }
    }

    checkAuthGuard();

    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }
});