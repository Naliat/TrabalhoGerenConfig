let contentSections = null;
let sidebarLinks = null;
let currentRenderMap = {};

/**
 * Inicializa o módulo de navegação, armazenando os seletores e o mapa de renderização.
 * @param {Object} renderMap - Um objeto que mapeia IDs de seção para funções de renderização.
 */
export function initNavigation(renderMap) {
    contentSections = document.querySelectorAll('.content-section');
    sidebarLinks = document.querySelectorAll('.nav-link');
    currentRenderMap = renderMap;

    sidebarLinks.forEach(link => {
        link.addEventListener('click', handleNavClick);
    });
}

/**
 * Manipulador de clique para os links da sidebar.
 * @param {Event} e - O evento de clique.
 */
function handleNavClick(e) {
    e.preventDefault();
    const targetId = e.currentTarget.dataset.target;
    if (targetId) {
        showContentSection(targetId);
    }
}

/**
 * Exibe uma seção de conteúdo específica e esconde as outras.
 * Também chama a função de renderização correspondente.
 * @param {string} targetId - O ID da seção a ser exibida (ex: 'dashboard').
 */
export function showContentSection(targetId) {
    // Esconde todas as seções
    contentSections.forEach(section => {
        section.classList.toggle('active', section.id === `content-${targetId}`);
    });
    
    // Atualiza o link ativo na sidebar
    sidebarLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.target === targetId);
    });
    
    // Chama a função de renderização específica para esta página
    const renderFunction = currentRenderMap[targetId];
    if (typeof renderFunction === 'function') {
        renderFunction();
    }
}