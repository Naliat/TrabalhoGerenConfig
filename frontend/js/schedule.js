async function addStudy(e) {
  e.preventDefault();
  const disciplina = document.getElementById("disciplina").value;
  const tema = document.getElementById("tema").value;
  const tempo = document.getElementById("tempo").value;

  await apiPost("schedule", { disciplina, tema, tempo });
  loadSchedule();
}

async function loadSchedule() {
  const data = await apiGet("schedule");
  const container = document.getElementById("schedule");
  container.innerHTML = data.map(item => `
    <div class="card">
      <strong>${item.disciplina}</strong> - ${item.tema} (${item.tempo} min)
    </div>
  `).join("");
}
