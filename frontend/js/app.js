// Aguarda o DOM carregar completamente
document.addEventListener('DOMContentLoaded', () => {

    const pages = document.querySelectorAll('.page');
    const gotoRegisterLink = document.getElementById('goto-register');
    const gotoLoginLink = document.getElementById('goto-login');
    
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const logoutButton = document.getElementById('logout-button');
    
    const sidebarLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const welcomeHeader = document.getElementById('welcome-header');
    
    const toast = document.getElementById('toast-notification');
    
    // Cronograma
    const scheduleTableCells = document.querySelectorAll('.schedule-table td[data-day]');
    const editScheduleBtn = document.getElementById('edit-schedule-btn');
    const saveScheduleBtn = document.getElementById('save-schedule-btn');
    
    // Registrar Estudo
    const logStudyForm = document.getElementById('log-study-form');
    const studyDateField = document.getElementById('study-date');
    
    // Revisões
    const revisionsTabsContainer = document.getElementById('revisions-tabs');
    const revisionTabLinks = document.querySelectorAll('.tab-link');
    const revisionTabContents = document.querySelectorAll('.tab-content');
    
    // --- 2. Estado da Aplicação e Banco de Dados (Simulado) ---
    
    let currentUser = null; // Email do usuário logado
    let db = {}; // Banco de dados local do usuário
    let users = JSON.parse(localStorage.getItem('studyFlowUsers')) || []; // Lista de usuários

    // --- 3. Funções Auxiliares ---

    // Mostra uma "página" (div) e esconde as outras
    function showPage(pageId) {
        pages.forEach(page => {
            page.classList.toggle('active', page.id === pageId);
        });
    }

    // Mostra uma notificação (toast)
    function showToast(message, type = 'success') {
        toast.textContent = message;
        toast.className = type; // Remove classes antigas
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Formata data YYYY-MM-DD para DD/MM/YYYY
    function formatDateBR(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }
    
    // Adiciona dias a uma data (string YYYY-MM-DD)
    function addDays(dateString, days) {
        const date = new Date(dateString + 'T00:00:00'); // Considera fuso local
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    }

    // Pega a data de hoje no formato YYYY-MM-DD
    function getToday() {
        return new Date().toISOString().split('T')[0];
    }
    
    // Gera um ID único simples
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Salva dados do usuário atual no localStorage
    function saveData() {
        if (currentUser) {
            localStorage.setItem(`db_${currentUser}`, JSON.stringify(db));
        }
    }
    
    // Carrega dados do usuário atual do localStorage
    function loadData() {
        if (currentUser) {
            db = JSON.parse(localStorage.getItem(`db_${currentUser}`));
            
            // Se for o primeiro login, inicializa o DB
            if (!db) {
                db = {
                    schedule: {
                        mon: "Português, Informática",
                        tue: "Banco de Dados, IA",
                        wed: "Matemática, Física",
                        thu: "Eng. de Software",
                        fri: "Português, Redação",
                        sat: "Revisão Geral",
                        sun: "Descanso"
                    },
                    studies: [],
                    revisions: []
                };
                saveData();
            }
        }
    }
    
    // Salva a lista de usuários
    function saveUsers() {
        localStorage.setItem('studyFlowUsers', JSON.stringify(users));
    }

    // --- 4. Lógica de Autenticação ---
    
    function handleRegister(e) {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        const userExists = users.find(user => user.email === email);
        
        if (userExists) {
            showToast('Este email já está cadastrado.', 'error');
            return;
        }
        
        users.push({ email, password });
        saveUsers();
        showToast('Conta criada com sucesso! Faça o login.');
        registerForm.reset();
        showPage('page-login');
    }
    
    function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        const user = users.find(user => user.email === email && user.password === password);
        
        if (user) {
            currentUser = user.email;
            sessionStorage.setItem('studyFlowUser', currentUser); // Mantém logado na sessão
            loadData();
            updateAllPages(); // Atualiza a UI com os dados do usuário
            welcomeHeader.textContent = `Olá, ${currentUser.split('@')[0]}!`;
            showPage('page-app');
            showContentSection('dashboard');
        } else {
            showToast('Email ou senha inválidos.', 'error');
        }
    }
    
    function handleLogout() {
        currentUser = null;
        sessionStorage.removeItem('studyFlowUser');
        db = {};
        loginForm.reset();
        showPage('page-login');
    }
    
    // Verifica se já existe um usuário na sessão
    function checkAuth() {
        const sessionUser = sessionStorage.getItem('studyFlowUser');
        if (sessionUser) {
            currentUser = sessionUser;
            loadData();
            updateAllPages();
            welcomeHeader.textContent = `Olá, ${currentUser.split('@')[0]}!`;
            showPage('page-app');
            showContentSection('dashboard');
        } else {
            showPage('page-login'); // Garante que comece no login
        }
    }

    // --- 5. Lógica de Navegação (SPA) ---
    
    // Alterna entre seções de conteúdo (Dashboard, Cronograma, etc.)
    function showContentSection(targetId) {
        // Esconde todas as seções
        contentSections.forEach(section => {
            section.classList.toggle('active', section.id === `content-${targetId}`);
        });
        
        // Atualiza o link ativo na sidebar
        sidebarLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.target === targetId);
        });
        
        // Atualiza o conteúdo da página antes de mostrar
        updateAllPages();
    }

    function handleNavClick(e) {
        e.preventDefault();
        const targetId = e.currentTarget.dataset.target;
        if (targetId) {
            showContentSection(targetId);
        }
    }

    // --- 6. Atualização de Conteúdo das Páginas ---

    function updateAllPages() {
        if (!currentUser) return; // Não faz nada se não estiver logado
        
        renderDashboard();
        renderSchedule();
        renderLogStudyForm(); // Apenas para setar a data
        renderRevisionsPage();
        renderReports();
    }

    // 1. Dashboard
    function renderDashboard() {
        const today = getToday();
        const revisionsToday = db.revisions.filter(r => r.revisionDate === today && r.status === 'pending');
        const container = document.getElementById('dashboard-revisions-today');
        const emptyMsg = document.getElementById('dashboard-revisions-today-empty');
        
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
        
        // Estatísticas
        const pendingRevisions = db.revisions.filter(r => r.status === 'pending').length;
        document.getElementById('stat-total-studies').textContent = db.studies.length;
        document.getElementById('stat-total-revisions').textContent = db.revisions.filter(r => r.status === 'completed').length;
        document.getElementById('stat-pending-revisions').textContent = pendingRevisions;
    }

    // 2. Cronograma
    function renderSchedule() {
        scheduleTableCells.forEach(cell => {
            const day = cell.getAttribute('data-day');
            cell.textContent = db.schedule[day] || '';
        });
    }
    
    function toggleScheduleEdit(e) {
        const isEditing = e.currentTarget.id === 'edit-schedule-btn';
        
        scheduleTableCells.forEach(cell => {
            cell.setAttribute('contenteditable', isEditing);
        });
        
        editScheduleBtn.classList.toggle('hidden', isEditing);
        saveScheduleBtn.classList.toggle('hidden', !isEditing);
        
        if (!isEditing) { // Clicou em Salvar
            // Salva os dados do cronograma
            scheduleTableCells.forEach(cell => {
                const day = cell.getAttribute('data-day');
                db.schedule[day] = cell.textContent.trim();
            });
            saveData();
            showToast('Cronograma salvo com sucesso!');
        }
    }

    // 3. Registrar Estudo
    function renderLogStudyForm() {
        // Define a data padrão como hoje
        studyDateField.value = getToday();
    }

    function handleLogStudySubmit(e) {
        e.preventDefault();
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
        
        saveData();
        showToast('Estudo registrado e revisões agendadas!');
        logStudyForm.reset();
        studyDateField.value = getToday(); // Reseta a data
        showContentSection('dashboard'); // Volta pro dashboard
    }

    // 4. Revisões
    function renderRevisionsPage() {
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

    function populateRevisionTab(tabId, revisions, emptyMessage) {
        const container = document.getElementById(tabId);
        container.innerHTML = '';
        
        if (revisions.length === 0) {
            container.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
            return;
        }
        
        revisions.forEach(rev => {
            container.appendChild(createRevisionCard(rev));
        });
    }
    
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
            buttonHtml = `
                <div class="revision-card-footer">
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
    
    function handleCompleteRevision(e) {
        const btn = e.target.closest('.complete-revision-btn');
        if (btn) {
            const revisionId = btn.dataset.id;
            const revision = db.revisions.find(r => r.id === revisionId);
            if (revision) {
                revision.status = 'completed';
                saveData();
                showToast('Revisão concluída!');
                // Atualiza a UI da página atual (seja dashboard ou revisões)
                updateAllPages();
            }
        }
    }
    
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

    // 5. Relatórios
    function renderReports() {
        const totalStudies = db.studies.length;
        const totalTimeMinutes = db.studies.reduce((sum, study) => sum + (study.time || 0), 0);
        const totalTimeHours = (totalTimeMinutes / 60).toFixed(1);
        const completedRevisions = db.revisions.filter(r => r.status === 'completed').length;
        const today = new Date(getToday() + 'T00:00:00');
        const overdueRevisions = db.revisions.filter(r => r.status === 'pending' && new Date(r.revisionDate + 'T00:00:00') < today).length;

        document.getElementById('report-total-studies').textContent = totalStudies;
        document.getElementById('report-total-time').textContent = `${totalTimeHours} h`;
        document.getElementById('report-completed-revisions').textContent = completedRevisions;
        document.getElementById('report-overdue-revisions').textContent = overdueRevisions;
        
        // Gráfico de Barras
        renderReportsChart();
    }
    
    function renderReportsChart() {
        const container = document.getElementById('reports-chart-container');
        container.innerHTML = '';
        
        if (db.studies.length === 0) {
                container.innerHTML = `
                <div class="empty-state">
                    Nenhum dado de estudo para exibir.
                </div>
            `;
            return;
        }

        // Agrupa estudos por disciplina (tempo)
        const stats = db.studies.reduce((acc, study) => {
            const subject = study.subject || 'Sem Disciplina';
            acc[subject] = (acc[subject] || 0) + (study.time || 0);
            return acc;
        }, {});
        
        const maxTime = Math.max(...Object.values(stats));
        
        // Cores para o gráfico (simples)
        const colors = ['#3b82f6', '#f59e0b', '#16a34a', '#dc2626', '#6366f1', '#ec4899'];
        let colorIndex = 0;
        
        for (const [subject, time] of Object.entries(stats)) {
            const percentage = maxTime > 0 ? (time / maxTime) * 100 : 0;
            const barColor = colors[colorIndex % colors.length];
            colorIndex++;
            
            const barElement = document.createElement('div');
            barElement.className = 'chart-bar-group';
            barElement.innerHTML = `
                <div class="chart-bar-label">${subject}</div>
                <div class="chart-bar-track">
                    <div class="chart-bar-fill" style="width: ${percentage}%; background-color: ${barColor};">
                        <span>${(time / 60).toFixed(1)} h</span>
                    </div>
                </div>
            `;
            container.appendChild(barElement);
        }
    }
    

    // --- 7. Inicialização e Event Listeners ---
    
    function init() {
        // Navegação de Autenticação
        gotoRegisterLink.addEventListener('click', () => showPage('page-register'));
        gotoLoginLink.addEventListener('click', () => showPage('page-login'));
        
        // Formulários de Autenticação
        registerForm.addEventListener('submit', handleRegister);
        loginForm.addEventListener('submit', handleLogin);
        logoutButton.addEventListener('click', handleLogout);
        
        // Navegação Principal
        sidebarLinks.forEach(link => {
            link.addEventListener('click', handleNavClick);
        });
        
        // Cronograma
        editScheduleBtn.addEventListener('click', toggleScheduleEdit);
        saveScheduleBtn.addEventListener('click', toggleScheduleEdit);
        
        // Registrar Estudo
        logStudyForm.addEventListener('submit', handleLogStudySubmit);
        
        // Revisões
        revisionsTabsContainer.addEventListener('click', handleTabClick);
        // Adiciona listener nos containers de conteúdo das abas e no dashboard (delegação de evento)
        document.getElementById('page-app').addEventListener('click', handleCompleteRevision);
        
        // Verifica o estado de login ao carregar
        checkAuth();
    }

    // Inicia a aplicação
    init();

});