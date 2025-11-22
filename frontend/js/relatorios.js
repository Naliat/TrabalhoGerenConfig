import { getDB } from './usuario.js';
import { getToday } from './utils.js';

/**
 * Renderiza a página de Relatórios (estatísticas e gráfico).
 */
export function renderReports() {
    const db = getDB();
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
    
    // Renderizar gráficos
    renderReportsChart();
    renderRevisionPieChart();
    renderStudyLineChart();
}

/**
 * Gráfico de Barras — Estudos por Disciplina
 */
function renderReportsChart() {
    const db = getDB();
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

    const stats = db.studies.reduce((acc, study) => {
        const subject = study.subject || 'Sem Disciplina';
        acc[subject] = (acc[subject] || 0) + (study.time || 0);
        return acc;
    }, {});
    
    const maxTime = Math.max(...Object.values(stats));
    const colors = ['#3b82f6', '#f59e0b', '#16a34a', '#dc2626', '#6366f1', '#ec4899'];
    let i = 0;
    
    for (const [subject, time] of Object.entries(stats)) {
        const percentage = (time / maxTime) * 100;

        const bar = `
            <div class="chart-bar-group">
                <div class="chart-bar-label">${subject}</div>
                <div class="chart-bar-track">
                    <div class="chart-bar-fill" style="width: ${percentage}%; background: ${colors[i++ % colors.length]}">
                        <span>${(time / 60).toFixed(1)} h</span>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += bar;
    }
}

/**
 * Gráfico de Pizza — Revisões Concluídas x Pendentes
 */
function renderRevisionPieChart() {
    const db = getDB();
    const completed = db.revisions.filter(r => r.status === "completed").length;
    const pending = db.revisions.filter(r => r.status === "pending").length;

    const ctx = document.getElementById("revisionPieChart");

    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Concluídas", "Pendentes"],
            datasets: [{
                data: [completed, pending],
                backgroundColor: ["#16a34a", "#dc2626"]
            }]
        }
    });
}

/**
 * Gráfico de Linha — Horas Estudadas por Dia
 */
function renderStudyLineChart() {
    const db = getDB();

    const grouped = {};
    db.studies.forEach(st => {
        grouped[st.date] = (grouped[st.date] || 0) + st.time;
    });

    const labels = Object.keys(grouped).sort();
    const values = labels.map(d => (grouped[d] / 60).toFixed(1));

    const ctx = document.getElementById("studyLineChart");

    new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Horas por dia",
                data: values,
                borderWidth: 2,
                borderColor: "#3b82f6",
                tension: 0.3
            }]
        }
    });
}
