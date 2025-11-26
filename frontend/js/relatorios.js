import { getDB } from './usuario.js';
import { getToday } from './utils.js';

export function renderReports() {
    const db = getDB();

    const totalStudies = db.studies.length;
    const totalTimeMinutes = db.studies.reduce((sum, study) => sum + (study.time || 0), 0);
    const totalTimeHours = (totalTimeMinutes / 60).toFixed(1);

    const completedRevisions = db.revisions.filter(r => r.status === 'completed').length;
    const today = new Date(getToday() + 'T00:00:00');

    const overdueRevisions = db.revisions.filter(r =>
        r.status === 'pending' && new Date(r.revisionDate + 'T00:00:00') < today
    ).length;

    // Atualizar elementos apenas se existirem
    const totalStudiesEl = document.getElementById('report-total-studies');
    const totalTimeEl = document.getElementById('report-total-time');
    const completedRevisionsEl = document.getElementById('report-completed-revisions');
    const overdueRevisionsEl = document.getElementById('report-overdue-revisions');

    if (totalStudiesEl) totalStudiesEl.textContent = totalStudies;
    if (totalTimeEl) totalTimeEl.textContent = `${totalTimeHours} h`;
    if (completedRevisionsEl) completedRevisionsEl.textContent = completedRevisions;
    if (overdueRevisionsEl) overdueRevisionsEl.textContent = overdueRevisions;

    // Renderizar gráficos
    renderReportsChart();
    renderRevisionPieChart();
    renderStudyLineChart();
}

function renderReportsChart() {
    const db = getDB();
    const container = document.getElementById('reports-chart-container');

    if (!container) {
        console.error('Elemento reports-chart-container não encontrado');
        return;
    }

    container.innerHTML = '';

    if (db.studies.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                Nenhum dado de estudo para exibir.
            </div>
        `;
        return;
    }

    const stats = db.studies.reduce((acc, study) => {
        const subject = study.subject || 'Sem Disciplina';
        acc[subject] = (acc[subject] || 0) + (study.time || 0);
        return acc;
    }, {});

    const maxTime = Math.max(...Object.values(stats));
    const colors = ['#3b82f6', '#f59e0b', '#16a34a', '#dc2626', '#6366f1', '#ec4899'];

    let i = 0;

    for (const [subject, time] of Object.entries(stats)) {
        const percentage = maxTime > 0 ? (time / maxTime) * 100 : 0;
        const hours = (time / 60).toFixed(1);

        const bar = `
            <div class="chart-bar-group">
                <div class="chart-bar-label">${subject}</div>
                <div class="chart-bar-track">
                    <div class="chart-bar-fill"
                         style="width: ${percentage}%; background: ${colors[i++ % colors.length]}">
                        <span>${hours} h</span>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML += bar;
    }
}

function renderRevisionPieChart() {
    const db = getDB();
    const ctx = document.getElementById("revisionPieChart");

    // Verificar se o elemento existe
    if (!ctx) {
        console.error('Elemento revisionPieChart não encontrado');
        return;
    }

    // Destruir gráfico anterior se existir
    if (ctx.chart) {
        ctx.chart.destroy();
    }

    const completed = db.revisions.filter(r => r.status === "completed").length;
    const pending = db.revisions.filter(r => r.status === "pending").length;

    // Verificar se há dados para exibir
    if (completed === 0 && pending === 0) {
        ctx.style.display = 'none';
        return;
    }

    ctx.style.display = 'block';
    ctx.chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Concluídas", "Pendentes"],
            datasets: [{
                data: [completed, pending],
                backgroundColor: ["#16a34a", "#dc2626"],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

function renderStudyLineChart() {
    const db = getDB();
    const ctx = document.getElementById("studyLineChart");

    if (!ctx) {
        console.error('Elemento studyLineChart não encontrado');
        return;
    }

    // Destruir gráfico anterior se existir
    if (ctx.chart) {
        ctx.chart.destroy();
    }

    const grouped = {};

    db.studies.forEach(st => {
        grouped[st.date] = (grouped[st.date] || 0) + st.time;
    });

    const labels = Object.keys(grouped).sort();
    const values = labels.map(d => (grouped[d] / 60).toFixed(1));

    // Verificar se há dados para exibir
    if (labels.length === 0) {
        ctx.style.display = 'none';
        return;
    }

    ctx.style.display = 'block';
    ctx.chart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Horas por dia",
                data: values,
                borderWidth: 2,
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                fill: true,
                tension: 0.3,
                pointBackgroundColor: "#3b82f6",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Horas'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Data'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}
