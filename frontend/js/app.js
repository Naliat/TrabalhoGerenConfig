// --- Imports dos Módulos ---
import { initAuthGatekeeper, loadUserData, getUserName, getDB, handleLogout } from './usuario.js';
import { initNavigation, showContentSection } from './navigation.js';
import { initCronograma, renderSchedule } from './cronograma.js';
import { initEstudos, renderLogStudyForm } from './estudos.js';
import { initRevisoes, renderRevisionsPage, renderDashboardRevisions, updateDashboardStats } from './revisoes.js';
import { renderReports } from './relatorios.js';
import { checkPendingRevisionNotifications } from './notifications.js';
import { initExport } from './export.js';

// --- Inicialização ao Carregar o DOM ---
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Verifica se o usuário está logado
    initAuthGatekeeper();
    
    // 2. Carrega os dados do usuário logado
    loadUserData();
    
    checkPendingRevisionNotifications();

    // 3. Define as funções de renderização de cada "página"
    
    // O renderDashboard é especial, pois busca dados de outros módulos (revisões, estudos)
    const renderDashboard = () => {
        renderDashboardRevisions();
        updateDashboardStats(); // Atualiza os cards de estatísticas
    };

    // 4. Mapeia os alvos da navegação para suas respectivas funções de renderização
    const renderMap = {
        'dashboard': renderDashboard,
        'schedule': renderSchedule,
        'log-study': renderLogStudyForm,
        'revisions': renderRevisionsPage,
        'reports': renderReports
    };

    // 5. Inicializa os Módulos
    
    // Inicializa a navegação, passando o mapa de renderização
    initNavigation(renderMap);
    
    // Inicializa o módulo de cronograma
    initCronograma();
    
    // Inicializa o módulo de estudos, passando a função de navegação
    initEstudos(showContentSection); 
    
    // Inicializa o módulo de revisões, passando o mapa para re-renderizar
    initRevisoes(renderMap);

    initExport();

    // 6. Configura a UI Principal
    
    // Define o cabeçalho de boas-vindas
    document.getElementById('welcome-header').textContent = `Olá, ${getUserName()}!`;
    
    // Adiciona o listener de logout
    document.getElementById('logout-button').addEventListener('click', handleLogout);

    // 7. Exibe a página inicial (Dashboard)
    showContentSection('dashboard');
});