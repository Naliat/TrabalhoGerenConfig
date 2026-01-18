document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const toast = document.getElementById('toast-notification');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const showPasswordBtn = document.getElementById('show-password-btn') || 
                            document.querySelector('.show-password-btn');
    const loginButton = document.getElementById('login-button') || 
                        loginForm?.querySelector('button[type="submit"]');

    const hostname = window.location.hostname;
    let API_URL;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        API_URL = "http://127.0.0.1:5000/api";
    } else {
        AAPI_URL = "https://trabalhogerenconfig.onrender.com/api";
    }

    function showToast(message, type = 'success') {
        if (!toast) {
            console.error(message);
            return;
        }
        toast.textContent = message;
        toast.className = type;
        toast.classList.add('show');

        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    function isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (!emailRegex.test(email)) {
            return { 
                valid: false, 
                message: 'Formato de e-mail inválido. Ex: usuario@gmail.com' 
            };
        }
        
        return { valid: true, message: 'E-mail válido' };
    }

    function validateLoginFields(email, password) {
        if (!email || !password) {
            return { valid: false, message: 'Preencha todos os campos' };
        }

        const emailValidation = isValidEmail(email);
        if (!emailValidation.valid) {
            return { valid: false, message: emailValidation.message };
        }

        if (password.length < 6) {
            return { valid: false, message: 'A senha deve ter pelo menos 6 caracteres' };
        }

        return { valid: true, message: 'Campos válidos' };
    }

    function updateEmailFeedback(email) {
        if (!emailInput) return;
        
        if (email.trim() === '') {
            emailInput.classList.remove('valid', 'invalid');
            return;
        }
        
        const validation = isValidEmail(email);
        
        if (validation.valid) {
            emailInput.classList.remove('invalid');
            emailInput.classList.add('valid');
        } else {
            emailInput.classList.remove('valid');
            emailInput.classList.add('invalid');
        }
    }

    if (showPasswordBtn && passwordInput) {
        showPasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            showPasswordBtn.textContent = type === 'password' ? '👁' : '👁️‍🗨️';
        });
    }

    if (emailInput) {
        let debounceTimer;
        emailInput.addEventListener('input', (e) => {
            const email = e.target.value.trim();
            
            clearTimeout(debounceTimer);
            if (email) {
                debounceTimer = setTimeout(() => {
                    updateEmailFeedback(email);
                }, 500);
            } else {
                emailInput.classList.remove('valid', 'invalid');
            }
        });
    }

    async function handleLogin(e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        const validation = validateLoginFields(email, password);
        if (!validation.valid) {
            showToast(validation.message, "error");
            
            if (!email) {
                emailInput?.classList.add('invalid');
                emailInput?.focus();
            } else if (!isValidEmail(email).valid) {
                emailInput?.classList.add('invalid');
                emailInput?.focus();
            } else if (!password || password.length < 6) {
                passwordInput?.classList.add('invalid');
                passwordInput?.focus();
            }
            
            return;
        }

        if (loginButton) {
            const originalText = loginButton.textContent;
            const originalHTML = loginButton.innerHTML;
            loginButton.disabled = true;
            loginButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Entrando...';
            
            const restoreButton = () => {
                loginButton.disabled = false;
                loginButton.textContent = originalText;
                loginButton.innerHTML = originalHTML;
            };
            
            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                if (!response.ok) {
                    const contentType = response.headers.get("content-type");
                    let errorResult = {};
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        errorResult = await response.json();
                    }
                    
                    const errorMessage = errorResult.error || `Erro: Status ${response.status}`;
                    
                    if (errorMessage.includes('Email') || errorMessage.includes('não encontrado') || 
                        errorMessage.includes('incorreto')) {
                        emailInput?.classList.add('invalid');
                        emailInput?.focus();
                    } else if (errorMessage.includes('Senha') || errorMessage.includes('incorreta')) {
                        passwordInput?.classList.add('invalid');
                        passwordInput?.focus();
                    }
                    
                    showToast(errorMessage, "error");
                    restoreButton();
                    return;
                }
                
                const result = await response.json();

                if (result.user) {
                    sessionStorage.setItem("studyFlowUser", JSON.stringify(result.user));
                    
                    if (result.token) {
                        sessionStorage.setItem("studyFlowToken", result.token);
                    }
                }

                showToast("✅ Login realizado com sucesso!", "success");

                emailInput?.classList.remove('invalid', 'valid');
                passwordInput?.classList.remove('invalid');

                setTimeout(() => {
                    window.location.href = "app.html";
                }, 1000);

            } catch (err) {
                console.error("Erro no login:", err);
                showToast("❌ Falha ao conectar ao servidor. Verifique sua conexão.", "error");
                restoreButton();
            }
        } else {
            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                if (!response.ok) {
                    const errorResult = await response.json();
                    showToast(errorResult.error || `Erro: Status ${response.status}`, "error");
                    return;
                }
                
                const result = await response.json();
                sessionStorage.setItem("studyFlowUser", JSON.stringify(result.user));
                showToast("✅ Login realizado com sucesso!", "success");

                setTimeout(() => {
                    window.location.href = "app.html";
                }, 1000);

            } catch (err) {
                console.error("Erro no login:", err);
                showToast("❌ Falha ao conectar ao servidor. Verifique sua conexão.", "error");
            }
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

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && loginForm) {
            const focusedElement = document.activeElement;
            if (focusedElement === emailInput || focusedElement === passwordInput) {
                e.preventDefault();
                handleLogin(e);
            }
        }
    });

    console.log('✅ Login.js carregado com sucesso');
    console.log('🌐 API URL:', API_URL);
});