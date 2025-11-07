async function loadReports() {
  const data = await apiGet("schedule");
  const total = data.length;
  document.getElementById("reports").innerHTML = `
    <p>Total de estudos registrados: ${total}</p>
  `;
}
