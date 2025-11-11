/**
 * Mostra uma notificação (toast) na tela.
 * @param {string} message - A mensagem a ser exibida.
 * @param {string} [type='success'] - O tipo de toast ('success', 'error', 'warning').
 */
export function showToast(message, type = 'success') {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;

    toast.textContent = message;
    toast.className = type; // Remove classes antigas
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Formata uma data de 'YYYY-MM-DD' para 'DD/MM/YYYY'.
 * @param {string} dateString - A data no formato 'YYYY-MM-DD'.
 * @returns {string} A data formatada.
 */
export function formatDateBR(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Adiciona um número de dias a uma data.
 * @param {string} dateString - A data inicial ('YYYY-MM-DD').
 * @param {number} days - O número de dias a adicionar.
 * @returns {string} A nova data no formato 'YYYY-MM-DD'.
 */
export function addDays(dateString, days) {
    const date = new Date(dateString + 'T00:00:00'); // Considera fuso local
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

/**
 * Retorna a data de hoje no formato 'YYYY-MM-DD'.
 */
export function getToday() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Gera um ID único simples.
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}