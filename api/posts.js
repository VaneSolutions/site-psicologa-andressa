const { getTokenFromRequest, sendJson } = require("./_auth");

const REPO = process.env.GITHUB_REPO || "VaneMartiins/site-psicologa-andressa";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const POSTS_PATH = "content/blog/posts.json";

function githubHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function getPostsFile(token) {
  const response = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${POSTS_PATH}?ref=${encodeURIComponent(BRANCH)}`,
    { headers: githubHeaders(token) }
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Nao foi possivel carregar posts do GitHub.");
  }

  const json = JSON.parse(Buffer.from(data.content, "base64").toString("utf8"));
  return { posts: Array.isArray(json.posts) ? json.posts : [], sha: data.sha };
}

function validatePosts(posts) {
  if (!Array.isArray(posts)) {
    throw new Error("Formato invalido: posts precisa ser uma lista.");
  }

  posts.forEach((post, index) => {
    const requiredFields = ["title", "slug", "category", "date", "summary", "content", "status"];

    requiredFields.forEach((field) => {
      if (!String(post[field] || "").trim()) {
        throw new Error(`Post ${index + 1}: campo obrigatorio ausente (${field}).`);
      }
    });

    if (!/^[a-z0-9-]+$/.test(post.slug)) {
      throw new Error(`Post ${index + 1}: slug deve conter apenas letras minusculas, numeros e hifens.`);
    }

    if (!["published", "draft"].includes(post.status)) {
      throw new Error(`Post ${index + 1}: status invalido.`);
    }
  });

  const slugs = posts.map((post) => post.slug);
  const repeatedSlug = slugs.find((slug, index) => slugs.indexOf(slug) !== index);

  if (repeatedSlug) {
    throw new Error(`Slug duplicado: ${repeatedSlug}.`);
  }
}

module.exports = async function handler(req, res) {
  const token = getTokenFromRequest(req);

  if (!token) {
    sendJson(res, 401, { message: "Login necessario." });
    return;
  }

  try {
    if (req.method === "GET") {
      const data = await getPostsFile(token);
      sendJson(res, 200, { posts: data.posts });
      return;
    }

    if (req.method === "POST") {
      const body = await readBody(req);
      validatePosts(body.posts);
      const current = await getPostsFile(token);
      const content = Buffer.from(`${JSON.stringify({ posts: body.posts }, null, 2)}\n`).toString("base64");
      const response = await fetch(`https://api.github.com/repos/${REPO}/contents/${POSTS_PATH}`, {
        method: "PUT",
        headers: githubHeaders(token),
        body: JSON.stringify({
          message: "Atualiza posts do blog",
          content,
          sha: current.sha,
          branch: BRANCH,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Nao foi possivel salvar posts no GitHub.");
      }

      sendJson(res, 200, { message: "Alterações salvas. A Vercel publicará o site após o deploy." });
      return;
    }

    sendJson(res, 405, { message: "Metodo nao permitido." });
  } catch (error) {
    sendJson(res, 400, { message: error.message });
  }
};
