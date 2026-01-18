document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgot-password-form');
    const toast = document.getElementById('toast-notification');
    const emailInput = document.getElementById('email');
    const emailFeedback = document.getElementById('email-feedback');
    const successMessage = document.getElementById('success-message');
    const submitButton = document.getElementById('submit-button');

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
                message: 'Formato de e-mail inválido' 
            };
        }
        
        return { valid: true, message: 'E-mail válido ✓' };
    }

    function updateEmailFeedback(email) {
        if (!emailInput || !emailFeedback) return;
        
        if (email.trim() === '') {
            emailInput.classList.remove('valid', 'invalid');
            emailFeedback.textContent = '';
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

    if (emailInput) {
        emailInput.addEventListener('input', (e) => {
            updateEmailFeedback(e.target.value);
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const email = emailInput.value.trim();

        const emailValidation = isValidEmail(email);
        if (!emailValidation.valid) {
            showToast(emailValidation.message, 'error');
            updateEmailFeedback(email);
            emailInput.focus();
            return;
        }

        const originalText = submitButton.textContent;
        const originalHTML = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...';

        try {
            const response = await fetch(`${API_URL}/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (!response.ok) {
                showToast(result.error || 'Erro ao processar solicitação', 'error');
                return;
            }

            showToast('✅ Link de recuperação enviado! Verifique seu e-mail.', 'success');
            
            if (successMessage) {
                successMessage.style.display = 'block';
            }
            
            form.reset();
            emailInput.classList.remove('valid', 'invalid');
            emailFeedback.textContent = '';


        } catch (error) {
            console.error("Erro na requisição:", error);
            showToast('❌ Falha ao conectar ao servidor. Verifique sua conexão.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            submitButton.innerHTML = originalHTML;
        }
    }

    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
});