const API_URL = "http://127.0.0.1:5000/api";

async function criarUsuario(nome, email) {
  const resposta = await fetch(`${API_URL}/usuario/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email }),
  });
  return resposta.json();
}

async function listarUsuarios() {
  const resposta = await fetch(`${API_URL}/usuario/`);
  return resposta.json();
}
