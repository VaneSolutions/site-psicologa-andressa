const WHATSAPP_NUMBER = "5521998971737";
const DEFAULT_MESSAGE = "Olá, Andressa. Gostaria de saber mais sobre a psicoterapia online.";

function buildWhatsAppUrl(message = DEFAULT_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

document.querySelectorAll(".whatsapp-link").forEach((link) => {
  link.href = buildWhatsAppUrl();
});

const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");

if (header && navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  header.querySelectorAll(".site-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const contactForm = document.querySelector("#contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const text = [
      `Olá, Andressa. Meu nome é ${name}.`,
      email ? `Meu e-mail é ${email}.` : "",
      message,
    ]
      .filter(Boolean)
      .join("\n\n");

    window.open(buildWhatsAppUrl(text), "_blank", "noreferrer");
  });
}

const blogPostsRoot = document.querySelector("#blog-posts");

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderBlogPosts(posts) {
  blogPostsRoot.innerHTML = posts
    .map((post) => {
      const videoUrl = String(post.videoUrl || "").trim();
      const hasVideo = /^https?:\/\//i.test(videoUrl);
      const body = String(post.body || "")
        .split(/\n{2,}/)
        .map((paragraph) => `<p>${escapeHtml(paragraph.trim())}</p>`)
        .join("");

      return `
        <article class="post-card">
          <div class="post-meta">
            <span>${escapeHtml(post.category)}</span>
            <span>${escapeHtml(post.date)}</span>
          </div>
          <h3>${escapeHtml(post.title)}</h3>
          <p>${escapeHtml(post.excerpt)}</p>
          <div class="post-body">
            ${body}
          </div>
          <div class="post-actions">
            ${
              hasVideo
                ? `<a class="button secondary" href="${escapeHtml(videoUrl)}" target="_blank" rel="noreferrer">${escapeHtml(post.videoLabel || "Assistir vídeo")}</a>`
                : ""
            }
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadBlogPosts() {
  if (!blogPostsRoot) {
    return;
  }

  let posts = Array.isArray(window.BLOG_POSTS) ? window.BLOG_POSTS : [];

  try {
    const response = await fetch("content/blog/posts.json", { cache: "no-store" });

    if (response.ok) {
      const data = await response.json();

      if (Array.isArray(data.posts)) {
        posts = data.posts;
      }
    }
  } catch (error) {
    // Some browsers block local JSON loading from file://. The fallback keeps local preview usable.
  }

  if (!posts.length) {
    blogPostsRoot.innerHTML = '<p class="empty-state">Nenhuma publicação disponível no momento.</p>';
    return;
  }

  renderBlogPosts(posts);
}

loadBlogPosts();
