// VARIÁVEIS DE CONFIGURAÇÃO QUE AGORA SERÃO DINÂMICAS
let STUDY_TIME = 25;
let SHORT_BREAK_TIME = 5;
let LONG_BREAK_TIME = 15;

let timerInterval;
let isRunning = false;
let currentMode = 'study'; // 'study', 'short-break', 'long-break'
let totalSeconds = STUDY_TIME * 60; 

// Elementos do DOM
const display = document.getElementById('pomodoro-timer');
const btnStart = document.getElementById('pomodoro-start');
const btnPause = document.getElementById('pomodoro-pause');
const btnReset = document.getElementById('pomodoro-reset');
const modeButtons = document.querySelectorAll('.pomodoro-settings button');

// NOVOS ELEMENTOS DE CONFIGURAÇÃO
const inputStudyTime = document.getElementById('input-study-time');
const inputShortBreak = document.getElementById('input-short-break');
const inputLongBreak = document.getElementById('input-long-break');
const btnApplyConfig = document.getElementById('apply-config');


// --- Funções Principais ---

function updateDisplay() {
    const min = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const sec = String(totalSeconds % 60).padStart(2, '0');
    if (display) {
        display.textContent = `${min}:${sec}`;
        document.title = `(${min}:${sec}) - SITasks Pomodoro`; 
    }
}

function startPomodoro() {
    if (isRunning) return; 
    isRunning = true;
    
    btnStart?.classList.add('hidden');
    btnPause?.classList.remove('hidden');

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (totalSeconds > 0) {
            totalSeconds--;
            updateDisplay();
        } else {
            clearInterval(timerInterval);
            isRunning = false;
            
            const message = currentMode === 'study' ? 'Tempo de ESTUDO finalizado! Hora da Pausa!' : 'Pausa finalizada! Hora de Voltar a Estudar!';
            alert(message);
            
            // Alterna para o próximo modo
            if (currentMode === 'study') {
                setMode(SHORT_BREAK_TIME, 'short-break');
            } else {
                 setMode(STUDY_TIME, 'study');
            }

            btnStart?.classList.remove('hidden');
            btnPause?.classList.add('hidden');
        }
    }, 1000);
}

function pausePomodoro() {
    if (!isRunning) return;
    isRunning = false;
    clearInterval(timerInterval);
    
    btnStart?.classList.remove('hidden');
    btnPause?.classList.add('hidden');
}

function resetPomodoro() {
    pausePomodoro();
    
    let initialTime;
    if (currentMode === 'study') initialTime = STUDY_TIME;
    else if (currentMode === 'short-break') initialTime = SHORT_BREAK_TIME;
    else if (currentMode === 'long-break') initialTime = LONG_BREAK_TIME;
    
    totalSeconds = initialTime * 60;
    updateDisplay();
}

function setMode(timeMinutes, mode) {
    pausePomodoro(); 
    currentMode = mode;
    totalSeconds = timeMinutes * 60;
    updateDisplay();

    // Atualiza o destaque nos botões de modo
    modeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-mode') === mode) {
            btn.classList.add('active');
        }
    });
}


// --- Funções de Configuração ---

function applyNewConfig() {
    // 1. Atualiza as variáveis globais com os novos valores dos inputs
    STUDY_TIME = parseInt(inputStudyTime.value) || 25;
    SHORT_BREAK_TIME = parseInt(inputShortBreak.value) || 5;
    LONG_BREAK_TIME = parseInt(inputLongBreak.value) || 15;

    // 2. Atualiza os textos dos botões de modo com os novos tempos
    document.querySelector('[data-mode="study"]').textContent = `Estudo (${STUDY_TIME} min)`;
    document.querySelector('[data-mode="short-break"]').textContent = `Pausa Curta (${SHORT_BREAK_TIME} min)`;
    document.querySelector('[data-mode="long-break"]').textContent = `Pausa Longa (${LONG_BREAK_TIME} min)`;
    
    // 3. Reinicia o timer para o modo atual (com o novo tempo)
    resetPomodoro();
    
    // Opcional: Notificação
    alert(`Configurações aplicadas: Estudo: ${STUDY_TIME} min, Curta: ${SHORT_BREAK_TIME} min, Longa: ${LONG_BREAK_TIME} min.`);
}

// --- Listeners de Eventos ---

// Controles
btnStart?.addEventListener('click', startPomodoro);
btnPause?.addEventListener('click', pausePomodoro);
btnReset?.addEventListener('click', resetPomodoro);

// Botão Aplicar Configuração
btnApplyConfig?.addEventListener('click', applyNewConfig);

// Seleção de Modo
modeButtons.forEach(button => {
    button.addEventListener('click', function() {
        const mode = this.getAttribute('data-mode');
        let time;
        if (mode === 'study') time = STUDY_TIME;
        else if (mode === 'short-break') time = SHORT_BREAK_TIME;
        else if (mode === 'long-break') time = LONG_BREAK_TIME;
        
        if (mode) {
            setMode(time, mode);
        }
    });
});


// Inicializa a configuração e o display ao carregar
applyNewConfig();