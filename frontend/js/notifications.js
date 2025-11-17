// Em js/notifications.js
import { getDB } from './usuario.js';
import { getToday } from './utils.js';

/**
 * Verifica se há revisões pendentes (hoje ou atrasadas) e dispara uma notificação.
 */
export function checkPendingRevisionNotifications() {
    const db = getDB();
    const today = getToday();
    
    const pendingReviews = db.revisions.filter(r => 
        r.status === 'pending' && 
        new Date(r.revisionDate + 'T00:00:00') <= new Date(today + 'T00:00:00')
    );

    const count = pendingReviews.length;
    
    if (count > 0) {
        // Tenta enviar a notificação
        requestNotificationPermission(count);
    }       
}

/**
 * Solicita permissão e, se concedida, exibe a notificação.
 * @param {number} count - O número de revisões pendentes.
 */
function requestNotificationPermission(count) {
    if (!('Notification' in window)) {
        console.warn('Este navegador não suporta notificações.');
        return;
    }

    if (Notification.permission === 'granted') {
        // Se já temos permissão, ótimo!
        showNotification(count);
    } else if (Notification.permission !== 'denied') {
        // Senão, vamos pedir
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showNotification(count);
            }
        });
    }
    // Se a permissão foi 'denied', não podemos fazer nada.
}

/**
 * Constrói e exibe a notificação.
 * @param {number} count - O número de revisões pendentes.
 */
function showNotification(count) {
    const title = 'SITasks - Revisões Pendentes';
    const body = count === 1
        ? 'Você tem 1 revisão pendente para hoje ou atrasada.'
        : `Você tem ${count} revisões pendentes. Não se esqueça!`;
        
    const options = {
        body: body,
        icon: '../favicon.ico' // (Opcional: adicione um ícone se tiver)
    };
    
    // Cria a notificação
    const notification = new Notification(title, options);
    
    // (Opcional) Foca a janela do navegador se o usuário clicar na notificação
    notification.onclick = () => {
        window.focus();
    };
}