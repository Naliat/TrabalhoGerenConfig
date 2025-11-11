import { getDB, saveUserData } from './usuario.js';
import { showToast } from './utils.js';

let scheduleTableCells = null;
let editScheduleBtn = null;
let saveScheduleBtn = null;

/**
 * Inicializa o módulo de cronograma, configurando os listeners dos botões.
 */
export function initCronograma() {
    scheduleTableCells = document.querySelectorAll('.schedule-table td[data-day]');
    editScheduleBtn = document.getElementById('edit-schedule-btn');
    saveScheduleBtn = document.getElementById('save-schedule-btn');

    editScheduleBtn.addEventListener('click', () => toggleScheduleEdit(true));
    saveScheduleBtn.addEventListener('click', () => toggleScheduleEdit(false));
}

/**
 * Renderiza os dados do cronograma na tabela.
 */
export function renderSchedule() {
    const db = getDB();
    scheduleTableCells.forEach(cell => {
        const day = cell.getAttribute('data-day');
        cell.textContent = db.schedule[day] || '';
    });
}

/**
 * Alterna entre os modos de edição e visualização do cronograma.
 * @param {boolean} isEditing - True para entrar no modo de edição, false para salvar e sair.
 */
function toggleScheduleEdit(isEditing) {
    scheduleTableCells.forEach(cell => {
        cell.setAttribute('contenteditable', isEditing);
    });
    
    editScheduleBtn.classList.toggle('hidden', isEditing);
    saveScheduleBtn.classList.toggle('hidden', !isEditing);
    
    if (!isEditing) { // Clicou em Salvar
        const db = getDB();
        scheduleTableCells.forEach(cell => {
            const day = cell.getAttribute('data-day');
            db.schedule[day] = cell.textContent.trim();
        });
        saveUserData();
        showToast('Cronograma salvo com sucesso!');
    }
}