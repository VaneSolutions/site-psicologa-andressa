const adminState = {
  posts: [],
};

const loginPanel = document.querySelector("#admin-login");
const editorPanel = document.querySelector("#admin-editor");
const postsRoot = document.querySelector("#admin-posts");
const statusText = document.querySelector("#admin-status");

function adminEscape(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function createEmptyPost() {
  return {
    title: "",
    slug: "",
    category: "",
    date: new Date().toISOString().slice(0, 10),
    summary: "",
    content: "",
    image: "",
    status: "draft",
  };
}

function setStatus(message) {
  if (statusText) {
    statusText.textContent = message;
  }
}

function renderPosts() {
  postsRoot.innerHTML = adminState.posts
    .map((post, index) => `
      <article class="admin-post" data-index="${index}">
        <div class="admin-post-header">
          <h3>${post.title ? adminEscape(post.title) : "Novo post"}</h3>
          <button class="button secondary delete-post" type="button" data-index="${index}">Excluir</button>
        </div>
        <label>
          Título
          <input name="title" value="${adminEscape(post.title)}" required>
        </label>
        <label>
          Slug
          <input name="slug" value="${adminEscape(post.slug)}" required placeholder="exemplo-de-slug">
        </label>
        <label>
          Categoria
          <input name="category" value="${adminEscape(post.category)}" required>
        </label>
        <label>
          Data
          <input name="date" type="date" value="${adminEscape(post.date)}" required>
        </label>
        <label>
          Resumo
          <textarea name="summary" rows="3" required>${adminEscape(post.summary)}</textarea>
        </label>
        <label>
          Conteúdo completo
          <textarea name="content" rows="10" required>${adminEscape(post.content)}</textarea>
        </label>
        <label>
          Imagem opcional
          <input name="image" value="${adminEscape(post.image)}" placeholder="/assets/uploads/imagem.jpg ou https://...">
        </label>
        <label>
          Status
          <select name="status">
            <option value="published" ${post.status === "published" ? "selected" : ""}>Publicado</option>
            <option value="draft" ${post.status === "draft" ? "selected" : ""}>Rascunho</option>
          </select>
        </label>
      </article>
    `)
    .join("");
}

function collectPosts() {
  return Array.from(document.querySelectorAll(".admin-post")).map((postElement) => {
    const getField = (name) => postElement.querySelector(`[name="${name}"]`).value.trim();

    return {
      title: getField("title"),
      slug: getField("slug"),
      category: getField("category"),
      date: getField("date"),
      summary: getField("summary"),
      content: getField("content"),
      image: getField("image"),
      status: getField("status"),
    };
  });
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Não foi possível concluir a ação.");
  }

  return data;
}

async function loadAdmin() {
  const session = await requestJson("/api/session");

  if (!session.authenticated) {
    loginPanel.hidden = false;
    editorPanel.hidden = true;
    return;
  }

  loginPanel.hidden = true;
  editorPanel.hidden = false;

  const data = await requestJson("/api/posts");
  adminState.posts = Array.isArray(data.posts) ? data.posts : [];
  renderPosts();
  setStatus(`${adminState.posts.length} post(s) carregado(s).`);
}

document.querySelector("#add-post")?.addEventListener("click", () => {
  adminState.posts.unshift(createEmptyPost());
  renderPosts();
  setStatus("Novo rascunho criado. Preencha os campos e salve.");
});

document.querySelector("#save-posts")?.addEventListener("click", async () => {
  try {
    setStatus("Salvando...");
    adminState.posts = collectPosts();
    const data = await requestJson("/api/posts", {
      method: "POST",
      body: JSON.stringify({ posts: adminState.posts }),
    });
    setStatus(data.message || "Alterações salvas.");
  } catch (error) {
    setStatus(error.message);
  }
});

document.querySelector("#logout")?.addEventListener("click", async () => {
  await requestJson("/api/logout", { method: "POST" });
  window.location.reload();
});

postsRoot?.addEventListener("click", (event) => {
  const button = event.target.closest(".delete-post");

  if (!button) {
    return;
  }

  const index = Number(button.dataset.index);
  const post = adminState.posts[index];

  if (window.confirm(`Excluir "${post.title || "post sem título"}"?`)) {
    adminState.posts.splice(index, 1);
    renderPosts();
    setStatus("Post removido da lista. Clique em salvar para publicar a exclusão.");
  }
});

loadAdmin().catch((error) => {
  loginPanel.hidden = false;
  editorPanel.hidden = true;
  setStatus(error.message);
});
