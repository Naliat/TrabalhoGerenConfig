/**
 * Inicializa os botões de exportação (impressão).
 */
export function initExport() {
    const exportScheduleBtn = document.getElementById('export-schedule-pdf');
    const exportReportsBtn = document.getElementById('export-reports-pdf');
    
    if (exportScheduleBtn) {
        exportScheduleBtn.addEventListener('click', () => {
            // A mágica acontece com o CSS @media print
            window.print();
        });
    }
    
    if (exportReportsBtn) {
        exportReportsBtn.addEventListener('click', () => {
            window.print();
        });
    }
}