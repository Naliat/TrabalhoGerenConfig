import { getDB, saveUserData } from './usuario.js';
import { getToday, formatDateBR, showToast, generateGoogleCalendarLink } from './utils.js';

let revisionsTabsContainer = null;
let revisionTabLinks = null;
let revisionTabContents = null;
let mainContent = null;
let renderMap = {}; // Para re-renderizar outras páginas

/**
 * Inicializa o módulo de revisões.
 * @param {Object} reRenderMap - O mapa de funções de renderização de app.js
 */
export function initRevisoes(reRenderMap) {
    revisionsTabsContainer = document.getElementById('revisions-tabs');
    revisionTabLinks = document.querySelectorAll('.tab-link');
    revisionTabContents = document.querySelectorAll('.tab-content');
    mainContent = document.querySelector('.main-content'); // Container principal
    renderMap = reRenderMap;

    if (revisionsTabsContainer) {
        revisionsTabsContainer.addEventListener('click', handleTabClick);
    }
    if (mainContent) {
        // Delegação de evento para os botões "Concluir"
        mainContent.addEventListener('click', handleCompleteRevision);
    }
}

/**
 * Renderiza as revisões pendentes no Dashboard.
 */
export function renderDashboardRevisions() {
    const db = getDB();
    const today = getToday();
    const revisionsToday = db.revisions.filter(r => r.revisionDate === today && r.status === 'pending');
    const container = document.getElementById('dashboard-revisions-today');
    const emptyMsg = document.getElementById('dashboard-revisions-today-empty');
    
    if (!container || !emptyMsg) return;

    container.innerHTML = ''; // Limpa
    
    if (revisionsToday.length === 0) {
        emptyMsg.classList.remove('hidden');
    } else {
        emptyMsg.classList.add('hidden');
        revisionsToday.forEach(rev => {
            const card = createRevisionCard(rev);
            container.appendChild(card);
        });
    }
}

/**
 * Atualiza os cards de estatísticas no Dashboard.
 */
export function updateDashboardStats() {
    const db = getDB();
    const pendingRevisions = db.revisions.filter(r => r.status === 'pending').length;
    
    document.getElementById('stat-total-studies').textContent = db.studies.length;
    document.getElementById('stat-total-revisions').textContent = db.revisions.filter(r => r.status === 'completed').length;
    document.getElementById('stat-pending-revisions').textContent = pendingRevisions;
}


/**
 * Renderiza a página completa de "Revisões" (com as abas).
 */
export function renderRevisionsPage() {
    const db = getDB();
    const today = new Date(getToday() + 'T00:00:00');
    
    const pending = db.revisions.filter(r => r.status === 'pending' && new Date(r.revisionDate + 'T00:00:00') >= today);
    const overdue = db.revisions.filter(r => r.status === 'pending' && new Date(r.revisionDate + 'T00:00:00') < today);
    const completed = db.revisions.filter(r => r.status === 'completed');
    
    // Ordena por data
    pending.sort((a, b) => new Date(a.revisionDate) - new Date(b.revisionDate));
    overdue.sort((a, b) => new Date(a.revisionDate) - new Date(b.revisionDate));
    completed.sort((a, b) => new Date(b.revisionDate) - new Date(a.revisionDate)); // Mais recentes primeiro

    populateRevisionTab('tab-content-pending', pending, 'Nenhuma revisão pendente.');
    populateRevisionTab('tab-content-overdue', overdue, 'Nenhuma revisão atrasada. Bom trabalho!');
    populateRevisionTab('tab-content-completed', completed, 'Nenhuma revisão foi concluída ainda.');
}

/**
 * Preenche o conteúdo de uma aba de revisão.
 * @param {string} tabId - O ID do container da aba.
 * @param {Array} revisions - A lista de revisões para exibir.
 * @param {string} emptyMessage - Mensagem para exibir se a lista estiver vazia.
 */
function populateRevisionTab(tabId, revisions, emptyMessage) {
    const container = document.getElementById(tabId);
    if (!container) return;

    container.innerHTML = '';
    
    if (revisions.length === 0) {
        container.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
        return;
    }
    
    revisions.forEach(rev => {
        container.appendChild(createRevisionCard(rev));
    });
}

/**
 * Cria o elemento HTML (card) para uma revisão.
 */
function createRevisionCard(rev) {
    const card = document.createElement('div');
    card.className = 'revision-card';
    
    const today = getToday();
    let tagText = rev.revisionCycle;
    let tagClass = 'tag-pending';
    
    if (rev.status === 'completed') {
        tagText = 'Concluída';
        tagClass = 'tag-completed';
        card.classList.add('status-completed');
    } else if (rev.revisionDate < today) {
        tagText = `Atrasada (${rev.revisionCycle})`;
        tagClass = 'tag-overdue';
        card.classList.add('status-overdue');
    } else if (rev.revisionDate === today) {
        tagText = `HOJE (${rev.revisionCycle})`;
        card.classList.add('status-today');
    }
    
    let buttonHtml = '';
    if (rev.status === 'pending') {
        
        // 2. Criar os detalhes do evento
        const calendarEvent = {
            title: `Revisão SITasks: ${rev.subject}`,
            description: `Revisar o conteúdo: ${rev.topic}\n(Ciclo: ${rev.revisionCycle})`,
            date: rev.revisionDate
        };
        const calendarLink = generateGoogleCalendarLink(calendarEvent);

        // 3. Adicionar o botão do calendário ao HTML
        buttonHtml = `
            <div class="revision-card-footer">
                <a href="${calendarLink}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="margin-right: 8px;">
                    Adicionar ao Google Calendário
                </a>
                <button class="btn btn-success btn-sm complete-revision-btn" data-id="${rev.id}">
                    Marcar como Concluída
                </button>
            </div>
        `;
    }

    card.innerHTML = `
        <div class="revision-card-header">
            <h4>${rev.subject}</h4>
            <span class="tag ${tagClass}">${tagText}</span>
        </div>
        <div class="revision-card-body">
            <p>${rev.topic}</p>
            <p class="date">Data da Revisão: ${formatDateBR(rev.revisionDate)}</p>
        </div>
        ${buttonHtml}
    `;
    
    return card;
}

/**
 * Manipula o clique no botão "Marcar como Concluída".
 */
function handleCompleteRevision(e) {
    const btn = e.target.closest('.complete-revision-btn');
    if (btn) {
        const revisionId = btn.dataset.id;
        const db = getDB();
        const revision = db.revisions.find(r => r.id === revisionId);
        
        if (revision) {
            revision.status = 'completed';
            saveUserData();
            showToast('Revisão concluída!');
            
            // Re-renderiza o Dashboard e a página de Revisões
            if (renderMap.dashboard) renderMap.dashboard();
            if (renderMap.revisions) renderMap.revisions();
        }
    }
}

/**
 * Manipula o clique nas abas (Pendentes, Atrasadas, Concluídas).
 */
function handleTabClick(e) {
    const targetTab = e.target.closest('.tab-link');
    if (!targetTab) return;
    
    const targetId = targetTab.dataset.tab; // 'pending', 'overdue', 'completed'

    // Atualiza abas
    revisionTabLinks.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === targetId);
    });
    
    // Atualiza conteúdo
    revisionTabContents.forEach(content => {
        content.classList.toggle('active', content.id === `tab-content-${targetId}`);
    });
}