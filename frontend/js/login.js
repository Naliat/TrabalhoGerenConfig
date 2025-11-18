document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const toast = document.getElementById('toast-notification');

    const API_URL = "http://127.0.0.1:5000/api";

    function showToast(message, type = 'success') {
        if (!toast) {
            alert(message);
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

            const result = await response.json();

            if (!response.ok) {
                showToast(result.error || "Erro ao logar.", "error");
                return;
            }
            sessionStorage.setItem("studyFlowUser", JSON.stringify(result.user));

            showToast("Login realizado com sucesso!");

          
            setTimeout(() => {
                window.location.href = "app.html";
            }, 1000);

        } catch (err) {
            console.error("Erro no login:", err);
            showToast("Falha ao conectar ao servidor.", "error");
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
