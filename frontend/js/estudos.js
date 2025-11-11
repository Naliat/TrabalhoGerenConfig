import { getDB, saveUserData } from './usuario.js';
import { getToday, generateId, addDays, showToast } from './utils.js';

let logStudyForm = null;
let studyDateField = null;
let navigate = () => {}; // Função de callback para navegação

/**
 * Inicializa o módulo de registro de estudos.
 * @param {function} navigationCallback - Função para navegar para outra página (ex: showContentSection).
 */
export function initEstudos(navigationCallback) {
    logStudyForm = document.getElementById('log-study-form');
    studyDateField = document.getElementById('study-date');
    navigate = navigationCallback;

    logStudyForm.addEventListener('submit', handleLogStudySubmit);
}

/**
 * Define a data padrão do formulário como hoje.
 */
export function renderLogStudyForm() {
    if (studyDateField) {
        studyDateField.value = getToday();
    }
}

/**
 * Manipula o envio do formulário de registro de estudo.
 */
function handleLogStudySubmit(e) {
    e.preventDefault();
    const db = getDB();
    
    const date = studyDateField.value;
    const subject = document.getElementById('study-subject').value;
    const topic = document.getElementById('study-topic').value;
    const time = parseInt(document.getElementById('study-time').value);
    
    // Cria o estudo
    const newStudy = {
        id: generateId(),
        date,
        subject,
        topic,
        time
    };
    db.studies.push(newStudy);
    
    // Cria as revisões (D+1, D+7, D+14)
    const revisionDates = [
        addDays(date, 1),
        addDays(date, 7),
        addDays(date, 14)
    ];
    
    revisionDates.forEach((revDate, index) => {
        const newRevision = {
            id: generateId(),
            studyId: newStudy.id,
            subject: newStudy.subject,
            topic: newStudy.topic,
            revisionDate: revDate,
            status: 'pending', // pending, completed
            revisionCycle: `D+${index === 0 ? 1 : (index === 1 ? 7 : 14)}`
        };
        db.revisions.push(newRevision);
    });
    
    saveUserData();
    showToast('Estudo registrado e revisões agendadas!');
    logStudyForm.reset();
    renderLogStudyForm(); // Reseta a data
    
    // Navega de volta para o dashboard
    if (typeof navigate === 'function') {
        navigate('dashboard');
    }
}