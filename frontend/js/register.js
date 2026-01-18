document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const toast = document.getElementById('toast-notification');
    const emailInput = document.getElementById('register-email');
    const emailFeedback = document.getElementById('email-feedback');
    const passwordInput = document.getElementById('register-password');
    const confirmInput = document.getElementById('confirm-password');
    const passwordFeedback = document.getElementById('password-feedback');
    const confirmFeedback = document.getElementById('confirm-feedback');
    const nameInput = document.getElementById('register-name');
    const nameFeedback = document.getElementById('name-feedback');
    const passwordStrengthFill = document.getElementById('password-strength-fill');
    const passwordStrengthText = document.getElementById('password-strength-text');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const toggleConfirmBtn = document.getElementById('toggle-confirm-password');

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
        API_URL = "https://trabalhogerenconfig.onrender.com/api";
    }


    function isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(email)) {
            return {
                valid: false,
                message: 'Formato de e-mail inválido. Ex: usuario@gmail.com'
            };
        }

        return { valid: true, message: 'E-mail válido ✓' };
    }

    // Função para validar nome
    function isValidName(name) {
        if (name.trim().length < 2) {
            return {
                valid: false,
                message: 'Nome deve ter pelo menos 2 caracteres'
            };
        }

        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) {
            return {
                valid: false,
                message: 'Nome deve conter apenas letras e espaços'
            };
        }

        return { valid: true, message: 'Nome válido ✓' };
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
                message: 'Sua senha precisa ser mais forte',
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

    function updateEmailFeedback(email) {
        if (!emailInput || !emailFeedback) return;

        if (email.trim() === '') {
            emailInput.classList.remove('valid', 'invalid');
            emailFeedback.textContent = '';
            emailFeedback.className = 'feedback-message';
            return;
        }

        const validation = isValidEmail(email);

        if (validation.valid) {
            emailInput.classList.remove('invalid');
            emailInput.classList.add('valid');
            emailFeedback.textContent = validation.message;
            emailFeedback.classList.remove('error-message');
            emailFeedback.classList.add('success-message');
        } else {
            emailInput.classList.remove('valid');
            emailInput.classList.add('invalid');
            emailFeedback.textContent = validation.message;
            emailFeedback.classList.remove('success-message');
            emailFeedback.classList.add('error-message');
        }
    }

    // Atualiza feedback visual do nome
    function updateNameFeedback(name) {
        if (!nameInput || !nameFeedback) return;

        if (name.trim() === '') {
            nameInput.classList.remove('valid', 'invalid');
            nameFeedback.textContent = '';
            nameFeedback.className = 'feedback-message';
            return;
        }

        const validation = isValidName(name);

        if (validation.valid) {
            nameInput.classList.remove('invalid');
            nameInput.classList.add('valid');
            nameFeedback.textContent = validation.message;
            nameFeedback.classList.remove('error-message');
            nameFeedback.classList.add('success-message');
        } else {
            nameInput.classList.remove('valid');
            nameInput.classList.add('invalid');
            nameFeedback.textContent = validation.message;
            nameFeedback.classList.remove('success-message');
            nameFeedback.classList.add('error-message');
        }
    }

    // Atualiza feedback visual da senha
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

        // Atualiza barra de força
        passwordStrengthFill.className = 'password-strength-fill';
        if (strength.strengthClass) {
            passwordStrengthFill.classList.add(strength.strengthClass);
        }

        // Atualiza texto da força
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

    async function checkEmailAvailability(email) {
        try {
            const response = await fetch(`${API_URL}/check-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                return await response.json();
            }
            return { available: false, message: 'Erro ao verificar e-mail' };
        } catch (error) {
            return { available: false, message: 'Erro de conexão' };
        }
    }


    if (emailInput) {
        let debounceTimer;
        emailInput.addEventListener('input', (e) => {
            const email = e.target.value.trim();
            updateEmailFeedback(email);

            clearTimeout(debounceTimer);
            if (email && isValidEmail(email).valid) {
                debounceTimer = setTimeout(async () => {
                    const check = await checkEmailAvailability(email);
                    if (!check.available) {
                        emailFeedback.textContent = check.message;
                        emailFeedback.classList.add('error-message');
                        emailInput.classList.add('invalid');
                        emailInput.classList.remove('valid');
                    }
                }, 800);
            }
        });
    }

    if (nameInput) {
        nameInput.addEventListener('input', (e) => {
            updateNameFeedback(e.target.value);
        });
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


    async function handleRegister(e) {
        e.preventDefault();

        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value.trim();
        const confirmPassword = document.getElementById('confirm-password').value.trim();
        const name = document.getElementById('register-name').value.trim();

        if (!email || !password || !confirmPassword || !name) {
            showToast('Preencha todos os campos.', 'error');
            return;
        }

        const emailValidation = isValidEmail(email);
        if (!emailValidation.valid) {
            showToast(emailValidation.message, 'error');
            updateEmailFeedback(email);
            emailInput.focus();
            return;
        }

        const nameValidation = isValidName(name);
        if (!nameValidation.valid) {
            showToast(nameValidation.message, 'error');
            updateNameFeedback(name);
            nameInput.focus();
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

        const submitButton = document.getElementById('register-button');
        const originalText = submitButton.textContent;
        const originalHTML = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.textContent = 'Processando...';
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processando...';

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name }),
            });

            const result = await response.json();

            if (!response.ok) {
                if (response.status === 409 ||
                    result.error?.toLowerCase().includes('email') ||
                    result.error?.toLowerCase().includes('já existe') ||
                    result.error?.toLowerCase().includes('already')) {

                    showToast('❌ Este e-mail já está cadastrado. Use outro e-mail.', 'error');

                    emailInput.classList.add('invalid');
                    emailFeedback.textContent = 'Este e-mail já está em uso';
                    emailFeedback.classList.add('error-message');
                    emailInput.focus();

                } else {
                    showToast(result.error || `Erro ao registrar: ${response.statusText}`, 'error');
                }
                return;
            }

            showToast('✅ Conta criada com sucesso! Redirecionando para login...', 'success');
            registerForm.reset();


            [emailInput, passwordInput, confirmInput, nameInput].forEach(input => {
                if (input) input.classList.remove('valid', 'invalid');
            });

            [emailFeedback, passwordFeedback, confirmFeedback, nameFeedback].forEach(feedback => {
                if (feedback) {
                    feedback.textContent = '';
                    feedback.className = 'feedback-message';
                }
            });

            passwordStrengthFill.className = 'password-strength-fill';
            passwordStrengthText.textContent = 'Força da senha:';

            Object.values(reqElements).forEach(el => {
                if (el) {
                    el.classList.remove('valid', 'invalid');
                }
            });

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);

        } catch (error) {
            console.error("Erro na requisição:", error);
            showToast('❌ Falha ao conectar ao servidor. Verifique sua conexão.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            submitButton.innerHTML = originalHTML;
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