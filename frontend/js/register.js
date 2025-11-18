document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const toast = document.getElementById('toast-notification');

    function showToast(message, type = 'success') {
        if (!toast) {
            alert(message);
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

        if (!email || !password) {
            showToast('Preencha todos os campos.', 'error');
            return;
        }

        if (password.length < 6) {
            showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                showToast(data.error || 'Erro ao registrar usuário', 'error');
                return;
            }

            showToast('Conta criada com sucesso! Faça login.');
            registerForm.reset();

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);

        } catch (error) {
            console.error("Erro na requisição:", error);
            showToast('Erro ao conectar ao servidor.', 'error');
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
