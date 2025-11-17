/**
 * Mostra uma notificação (toast) na tela.
 * @param {string} message - A mensagem a ser exibida.
 * @param {string} [type='success'] - O tipo de toast ('success', 'error', 'warning').
 * @param {object} eventDetails
 * @param {string} eventDetails.title - Título do evento.
 * @param {string} eventDetails.description - Descrição do evento.
 * @param {string} eventDetails.date - Data do evento ('YYYY-MM-DD').
 * @returns {string} - A URL formatada.
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

export function generateGoogleCalendarLink(eventDetails) {
    const { title, description, date } = eventDetails;

    // O Google Calendar espera datas em UTC (YYYYMMDDTHHMMSSZ).
    // Vamos criar um evento de 1 hora no dia da revisão, às 9h da manhã (local).
    const startDate = new Date(date + 'T09:00:00');
    const endDate = new Date(date + 'T10:00:00');

    // Formata para o padrão do Google (ex: 20251117T090000)
    const formatDate = (dt) => dt.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
    
    // No formato do Google, o fuso UTC é Z, mas se quisermos usar o fuso local
    // e o formato sem Z, removemos o Z e o toISOString.
    // Para simplicidade, vamos usar o toISOString e o Z.
    const isoStartDate = startDate.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
    const isoEndDate = endDate.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';

    const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
    const params = new URLSearchParams({
        'text': title,
        'details': description,
        'dates': `${isoStartDate}/${isoEndDate}`,
        'ctz': 'America/Sao_Paulo' // (Opcional, mas bom para fuso)
    });

    return `${baseUrl}&${params.toString()}`;
}