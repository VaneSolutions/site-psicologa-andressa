const POSTS_URL = "/content/blog/posts.json";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return escapeHtml(dateValue);
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function renderParagraphs(content = "") {
  return String(content)
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph.trim())}</p>`)
    .join("");
}

async function loadPosts() {
  const response = await fetch(POSTS_URL, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Não foi possível carregar os posts.");
  }

  const data = await response.json();
  return Array.isArray(data.posts) ? data.posts : [];
}

function renderBlogList(posts) {
  const blogList = document.querySelector("#blog-list");

  if (!blogList) {
    return;
  }

  const publishedPosts = posts
    .filter((post) => post.status === "published")
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));

  if (!publishedPosts.length) {
    blogList.innerHTML = '<p class="empty-state">Nenhuma publicação disponível no momento.</p>';
    return;
  }

  blogList.innerHTML = publishedPosts
    .map((post) => {
      const image = post.image
        ? `<img class="blog-card-image" src="${escapeHtml(post.image)}" alt="">`
        : "";

      return `
        <article class="blog-card">
          ${image}
          <div class="post-meta">
            <span>${escapeHtml(post.category)}</span>
            <span>${formatDate(post.date)}</span>
          </div>
          <h2>${escapeHtml(post.title)}</h2>
          <p>${escapeHtml(post.summary)}</p>
          <a class="button secondary" href="/blog/${escapeHtml(post.slug)}">Ler artigo</a>
        </article>
      `;
    })
    .join("");
}

function renderHomeArticles(posts) {
  const homeArticles = document.querySelector("#home-articles");

  if (!homeArticles) {
    return;
  }

  const latestPosts = posts
    .filter((post) => post.status === "published")
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 3);

  if (!latestPosts.length) {
    homeArticles.innerHTML = '<p class="empty-state">Nenhuma publicação disponível no momento.</p>';
    return;
  }

  homeArticles.innerHTML = latestPosts
    .map((post) => {
      const image = post.image
        ? `<img class="blog-card-image" src="${escapeHtml(post.image)}" alt="">`
        : '<div class="blog-card-image blog-card-placeholder" aria-hidden="true"></div>';

      return `
        <article class="blog-card">
          ${image}
          <div class="post-meta">
            <span>${escapeHtml(post.category)}</span>
            <span>${formatDate(post.date)}</span>
          </div>
          <h2>${escapeHtml(post.title)}</h2>
          <p>${escapeHtml(post.summary)}</p>
          <a class="button secondary" href="/blog/${escapeHtml(post.slug)}">Ler artigo</a>
        </article>
      `;
    })
    .join("");
}

function renderBlogPost(posts) {
  const article = document.querySelector("#blog-post");

  if (!article) {
    return;
  }

  const urlSlug = new URLSearchParams(window.location.search).get("slug");
  const pathSlug = window.location.pathname.split("/").filter(Boolean).pop();
  const slug = urlSlug || pathSlug;
  const post = posts.find((item) => item.slug === slug && item.status === "published");

  if (!post) {
    document.title = "Artigo não encontrado | Andressa Martins";
    article.innerHTML = `
      <a class="back-link" href="/blog">Voltar para o blog</a>
      <h1>Artigo não encontrado</h1>
      <p class="article-lead">Esse texto ainda não está publicado ou não existe.</p>
    `;
    return;
  }

  document.title = `${post.title} | Andressa Martins`;

  const image = post.image
    ? `<img class="article-image" src="${escapeHtml(post.image)}" alt="">`
    : "";

  article.innerHTML = `
    <a class="back-link" href="/blog">Voltar para o blog</a>
    <div class="post-meta">
      <span>${escapeHtml(post.category)}</span>
      <span>${formatDate(post.date)}</span>
    </div>
    <h1>${escapeHtml(post.title)}</h1>
    <p class="article-lead">${escapeHtml(post.summary)}</p>
    ${image}
    ${renderParagraphs(post.content)}
  `;
}

loadPosts()
  .then((posts) => {
    renderBlogList(posts);
    renderHomeArticles(posts);
    renderBlogPost(posts);
  })
  .catch(() => {
    const blogList = document.querySelector("#blog-list");
    const homeArticles = document.querySelector("#home-articles");
    const article = document.querySelector("#blog-post");

    if (blogList) {
      blogList.innerHTML = '<p class="empty-state">Não foi possível carregar as publicações.</p>';
    }

    if (homeArticles) {
      homeArticles.innerHTML = '<p class="empty-state">Não foi possível carregar os artigos.</p>';
    }

    if (article) {
      article.innerHTML = `
        <a class="back-link" href="/blog">Voltar para o blog</a>
        <h1>Não foi possível carregar este artigo</h1>
        <p class="article-lead">Tente novamente em alguns instantes.</p>
      `;
    }
  });
