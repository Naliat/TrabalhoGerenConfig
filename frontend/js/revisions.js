async function loadRevisions() {
  const data = await apiGet("revisions");
  const container = document.getElementById("revisions");
  container.innerHTML = data.map(item => `
    <div class="card">
      <strong>${item.disciplina}</strong> - ${item.tema}
      <p>Revisões pendentes: ${item.revisoes.length}</p>
    </div>
  `).join("");
}
