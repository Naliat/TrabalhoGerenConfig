document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reset-password-form');
    const toast = document.getElementById('toast-notification');
    const emailInput = document.getElementById('email');
    const tokenInput = document.getElementById('token');
    const userEmailSpan = document.getElementById('user-email');
    const passwordInput = document.getElementById('new-password');
    const confirmInput = document.getElementById('confirm-password');
    const passwordFeedback = document.getElementById('password-feedback');
    const confirmFeedback = document.getElementById('confirm-feedback');
    const passwordStrengthFill = document.getElementById('password-strength-fill');
    const passwordStrengthText = document.getElementById('password-strength-text');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const toggleConfirmBtn = document.getElementById('toggle-confirm-password');
    const submitButton = document.getElementById('submit-button');

    const reqElements = {
        length: document.getElementById('req-length'),
        uppercase: document.getElementById('req-uppercase'),
        lowercase: document.getElementById('req-lowercase'),
        number: document.getElementById('req-number'),
        special: document.getElementById('req-special')
    };

    const hostname = window.location.hostname;
    let API_URL;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        API_URL = "http://127.0.0.1:5000/api";
    } else {
        API_URL = "https://trab-de-lip-sitask.onrender.com/api";
    }

    function getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            email: params.get('email'),
            token: params.get('token')
        };
    }

    async function validateTokenOnLoad() {
        const params = getUrlParams();
        
        if (!params.email || !params.token) {
            showToast('❌ Link inválido ou expirado. Solicite um novo link.', 'error');
            setTimeout(() => {
                window.location.href = 'forgot-password.html';
            }, 2000);
            return false;
        }

        emailInput.value = params.email;
        tokenInput.value = params.token;
        userEmailSpan.textContent = params.email;

        try {
            const response = await fetch(`${API_URL}/validate-reset-token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: params.email,
                    token: params.token
                }),
            });

            const result = await response.json();

            if (!result.valid) {
                showToast('❌ Link inválido ou expirado. Solicite um novo link.', 'error');
                setTimeout(() => {
                    window.location.href = 'forgot-password.html';
                }, 3000);
                return false;
            }

            return true;
        } catch (error) {
            console.error("Erro ao validar token:", error);
            showToast('❌ Erro ao validar link. Tente novamente.', 'error');
            return false;
        }
    }

    function evaluatePasswordStrength(password) {
        let score = 0;
        const requirements = {
            hasLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecial: /[!@#$%^&*]/.test(password)
        };
        
        Object.keys(requirements).forEach((key, index) => {
            const element = Object.values(reqElements)[index];
            if (element) {
                if (requirements[key]) {
                    element.classList.add('valid');
                    element.classList.remove('invalid');
                    score++;
                } else {
                    element.classList.remove('valid');
                    element.classList.add('invalid');
                }
            }
        });
        
        let strength, strengthClass, message;
        
        if (password.length === 0) {
            strength = 0;
            strengthClass = '';
            message = 'Digite uma senha';
        } else if (score <= 1) {
            strength = 20;
            strengthClass = 'strength-very-weak';
            message = 'Muito fraca';
        } else if (score === 2) {
            strength = 40;
            strengthClass = 'strength-weak';
            message = 'Fraca';
        } else if (score === 3) {
            strength = 60;
            strengthClass = 'strength-fair';
            message = 'Média';
        } else if (score === 4) {
            strength = 80;
            strengthClass = 'strength-good';
            message = 'Forte';
        } else {
            strength = 100;
            strengthClass = 'strength-excellent';
            message = 'Excelente';
        }
        
        return {
            score,
            strength,
            strengthClass,
            message,
            requirements,
            isValid: score >= 3 && password.length >= 8
        };
    }

    function isValidPassword(password, confirmPassword = '') {
        const strength = evaluatePasswordStrength(password);
        
        if (password.length < 8) {
            return { 
                valid: false, 
                message: 'A senha deve ter pelo menos 8 caracteres',
                strength: strength
            };
        }
        
        if (strength.score < 3) {
            return { 
                valid: false, 
                message: 'Sua senha precisa ser mais forte. Adicione maiúsculas, números ou caracteres especiais.',
                strength: strength
            };
        }
        
        if (confirmPassword && password !== confirmPassword) {
            return { 
                valid: false, 
                message: 'As senhas não coincidem',
                strength: strength
            };
        }
        
        return { 
            valid: true, 
            message: 'Senha forte ✓',
            strength: strength
        };
    }

    function updatePasswordFeedback(password, confirmPassword = '') {
        if (!passwordInput || !passwordFeedback) return;
        
        if (password.trim() === '') {
            passwordInput.classList.remove('valid', 'invalid');
            passwordFeedback.textContent = '';
            passwordFeedback.className = 'feedback-message';
            passwordStrengthFill.className = 'password-strength-fill';
            passwordStrengthText.textContent = 'Força da senha:';
            return;
        }
        
        const validation = isValidPassword(password, confirmPassword);
        const strength = validation.strength;
        
        passwordStrengthFill.className = 'password-strength-fill';
        if (strength.strengthClass) {
            passwordStrengthFill.classList.add(strength.strengthClass);
        }
        
        passwordStrengthText.textContent = `Força da senha: ${strength.message}`;
        
        if (validation.valid) {
            passwordInput.classList.remove('invalid');
            passwordInput.classList.add('valid');
            passwordFeedback.textContent = validation.message;
            passwordFeedback.classList.remove('error-message');
            passwordFeedback.classList.add('success-message');
        } else {
            passwordInput.classList.remove('valid');
            passwordInput.classList.add('invalid');
            passwordFeedback.textContent = validation.message;
            passwordFeedback.classList.remove('success-message');
            passwordFeedback.classList.add('error-message');
        }
        
        if (confirmPassword) {
            updateConfirmFeedback(password, confirmPassword);
        }
    }

    function updateConfirmFeedback(password, confirmPassword) {
        if (!confirmInput || !confirmFeedback) return;
        
        if (confirmPassword.trim() === '') {
            confirmInput.classList.remove('valid', 'invalid');
            confirmFeedback.textContent = '';
            confirmFeedback.className = 'feedback-message';
            return;
        }
        
        if (password === confirmPassword && password.length >= 8) {
            confirmInput.classList.remove('invalid');
            confirmInput.classList.add('valid');
            confirmFeedback.textContent = 'Senhas coincidem ✓';
            confirmFeedback.classList.remove('error-message');
            confirmFeedback.classList.add('success-message');
        } else {
            confirmInput.classList.remove('valid');
            confirmInput.classList.add('invalid');
            confirmFeedback.textContent = password.length < 8 ? 
                'A senha principal é muito curta' : 
                'As senhas não coincidem';
            confirmFeedback.classList.remove('success-message');
            confirmFeedback.classList.add('error-message');
        }
    }

    function showToast(message, type = 'success') {
        if (!toast) {
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

    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            const password = e.target.value;
            const confirmPassword = confirmInput ? confirmInput.value : '';
            updatePasswordFeedback(password, confirmPassword);
        });
    }

    if (confirmInput) {
        confirmInput.addEventListener('input', (e) => {
            const password = passwordInput.value;
            const confirmPassword = e.target.value;
            updateConfirmFeedback(password, confirmPassword);
        });
    }

    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePasswordBtn.textContent = type === 'password' ? '👁' : '👁️‍🗨️';
        });
    }

    if (toggleConfirmBtn) {
        toggleConfirmBtn.addEventListener('click', () => {
            const type = confirmInput.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmInput.setAttribute('type', type);
            toggleConfirmBtn.textContent = type === 'password' ? '👁' : '👁️‍🗨️';
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const token = tokenInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmInput.value.trim();

        if (!email || !token || !password || !confirmPassword) {
            showToast('Preencha todos os campos.', 'error');
            return;
        }

        const passwordValidation = isValidPassword(password, confirmPassword);
        if (!passwordValidation.valid) {
            showToast(passwordValidation.message, 'error');
            updatePasswordFeedback(password, confirmPassword);
            
            if (password.length < 8) {
                passwordInput.focus();
            } else if (password !== confirmPassword) {
                confirmInput.focus();
            } else {
                passwordInput.focus();
            }
            return;
        }

        const originalText = submitButton.textContent;
        const originalHTML = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Redefinindo...';

        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    token: token,
                    new_password: password
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                showToast(result.error || 'Erro ao redefinir senha', 'error');
                return;
            }

            showToast('✅ Senha redefinida com sucesso! Redirecionando para login...', 'success');
            
            form.reset();
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            console.error("Erro na requisição:", error);
            showToast('❌ Falha ao conectar ao servidor. Verifique sua conexão.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            submitButton.innerHTML = originalHTML;
        }
    }

    async function init() {
        const tokenValid = await validateTokenOnLoad();
        
        if (!tokenValid) {
            if (form) {
                form.querySelectorAll('input, button').forEach(element => {
                    element.disabled = true;
                });
            }
            return;
        }

        if (form) {
            form.addEventListener('submit', handleSubmit);
        }
    }

    init();
});