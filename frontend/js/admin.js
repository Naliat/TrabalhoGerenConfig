// admin.js
document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://127.0.0.1:5000/api";
  const tableBody = document.querySelector("#users-table tbody");
  const usersCount = document.getElementById("users-count");
  const toast = document.getElementById("toast");

  // admin key (X-ADMIN-KEY) - armazenada na sessão do navegador
  const adminKeyInput = document.getElementById("admin-key");
  const btnSetKey = document.getElementById("btn-set-key");
  const btnRefresh = document.getElementById("btn-refresh");

  const modal = document.getElementById("modal");
  const editId = document.getElementById("edit-id");
  const editEmail = document.getElementById("edit-email");
  const editName = document.getElementById("edit-name");
  const editPassword = document.getElementById("edit-password");
  const btnSave = document.getElementById("btn-save");
  const btnCancel = document.getElementById("btn-cancel");

  function showToast(msg, time = 3000) {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), time);
  }

  function getAdminKey() {
    return sessionStorage.getItem("adminKey") || "";
  }
  function setAdminKey(k) {
    if (k) sessionStorage.setItem("adminKey", k);
    else sessionStorage.removeItem("adminKey");
  }

  btnSetKey.addEventListener("click", () => {
    const k = adminKeyInput.value.trim();
    if (!k) { showToast("Informe a chave admin"); return; }
    setAdminKey(k);
    showToast("Chave admin salva na sessão (temporária)");
    adminKeyInput.value = "";
  });

  btnRefresh.addEventListener("click", loadUsers);

  // Carrega usuários via API
  async function loadUsers() {
    tableBody.innerHTML = "<tr><td colspan='5'>Carregando...</td></tr>";
    try {
      const res = await fetch(`${API_BASE}/users`);
      if (!res.ok) throw new Error("Falha ao buscar usuários");
      const data = await res.json();
      renderUsers(data);
    } catch (err) {
      console.error(err);
      tableBody.innerHTML = "<tr><td colspan='5'>Erro ao carregar usuários</td></tr>";
      showToast("Erro ao carregar usuários");
      usersCount.textContent = "";
    }
  }

  function renderUsers(users) {
    tableBody.innerHTML = "";
    usersCount.textContent = `Total: ${users.length}`;
    if (!users.length) {
      tableBody.innerHTML = "<tr><td colspan='5'>Nenhum usuário encontrado</td></tr>";
      return;
    }
    users.forEach(u => {
      // `u._id` pode vir como { $oid: "..." } pelo bson.json_util, então cuidamos:
      let id = u._id && (u._id.$oid || u._id);
      if (typeof id === "object" && id.$oid) id = id.$oid;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${id}</td>
        <td>${escapeHtml(u.email || "")}</td>
        <td>${escapeHtml(u.name || "")}</td>
        <td>${escapeHtml(u.created_at || "")}</td>
        <td class="actions">
          <button class="btn-edit" data-id="${id}">Editar</button>
          <button class="btn-delete" data-id="${id}">Apagar</button>
        </td>`;
      tableBody.appendChild(tr);
    });

    // ligar eventos
    document.querySelectorAll(".btn-delete").forEach(b => b.addEventListener("click", handleDelete));
    document.querySelectorAll(".btn-edit").forEach(b => b.addEventListener("click", handleEdit));
  }

  // segurança básica para evitar XSS em render
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Abre modal de edição
  function handleEdit(e) {
    const id = e.currentTarget.dataset.id;
    // carregar dados da linha
    const tr = e.currentTarget.closest("tr");
    const email = tr.children[1].textContent;
    const name = tr.children[2].textContent;

    editId.value = id;
    editEmail.value = email;
    editName.value = name;
    editPassword.value = "";

    modal.classList.remove("hidden");
  }

  btnCancel.addEventListener("click", () => modal.classList.add("hidden"));

  // salvar alterações
  btnSave.addEventListener("click", async () => {
    const id = editId.value;
    const payload = {
      email: editEmail.value.trim(),
      name: editName.value.trim()
    };
    const newPassword = editPassword.value.trim();
    if (newPassword) payload.password = newPassword;

    const adminKey = getAdminKey();
    if (!adminKey) { showToast("Informe a chave admin antes de editar"); return; }

    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-ADMIN-KEY": adminKey
        },
        body: JSON.stringify(payload)
      });
      const rj = await res.json();
      if (!res.ok) {
        showToast(rj.error || "Erro ao atualizar usuário");
        return;
      }
      showToast("Usuário atualizado");
      modal.classList.add("hidden");
      loadUsers();
    } catch (err) {
      console.error(err);
      showToast("Erro ao conectar ao servidor");
    }
  });

  // apagar usuário
  async function handleDelete(e) {
    const id = e.currentTarget.dataset.id;
    if (!confirm("Confirma exclusão deste usuário?")) return;

    const adminKey = getAdminKey();
    if (!adminKey) { showToast("Informe a chave admin antes de apagar"); return; }

    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
        headers: { "X-ADMIN-KEY": adminKey }
      });
      const rj = await res.json();
      if (!res.ok) {
        showToast(rj.error || "Erro ao apagar");
        return;
      }
      showToast("Usuário apagado");
      loadUsers();
    } catch (err) {
      console.error(err);
      showToast("Erro ao conectar ao servidor");
    }
  }

  // inicia
  loadUsers();
});
