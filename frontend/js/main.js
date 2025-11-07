document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formUsuario");
  const tabelaBody = document.querySelector("#tabelaUsuarios tbody");

  async function carregarUsuarios() {
    const usuarios = await listarUsuarios();
    tabelaBody.innerHTML = "";
    usuarios.forEach(u => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.nome}</td>
        <td>${u.email}</td>
        <td>${u.criado_em || ""}</td>
      `;
      tabelaBody.appendChild(tr);
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    if (!nome || !email) return alert("Preencha todos os campos!");

    await criarUsuario(nome, email);
    form.reset();
    carregarUsuarios();
  });

  carregarUsuarios();
});
