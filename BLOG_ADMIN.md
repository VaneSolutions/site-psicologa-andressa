# Administração do blog

O blog tem um painel próprio em `/admin`. A Andressa entra com GitHub, cria/edita/exclui posts e o painel salva tudo no arquivo `content/blog/posts.json` dentro do repositório.

Os tokens e secrets não ficam no JavaScript do navegador. O login GitHub passa pelas funções serverless em `/api`, e o token de acesso fica criptografado em cookie `HttpOnly`.

## Como criar o GitHub OAuth App

1. Acesse GitHub > Settings > Developer settings > OAuth Apps.
2. Clique em **New OAuth App**.
3. Preencha:
   - Application name: `Blog Andressa Martins`
   - Homepage URL: `https://SEU-DOMINIO`
   - Authorization callback URL: `https://SEU-DOMINIO/api/callback`
4. Salve o app.
5. Copie o **Client ID**.
6. Gere e copie um **Client Secret**.

Use o domínio real da Vercel, por exemplo `https://site-psicologa-andressa.vercel.app`, ou o domínio personalizado.

## Variáveis na Vercel

No projeto da Vercel, vá em Settings > Environment Variables e configure:

- `GITHUB_CLIENT_ID`: Client ID do OAuth App.
- `GITHUB_CLIENT_SECRET`: Client Secret do OAuth App.
- `SESSION_SECRET`: uma frase longa e aleatória para criptografar o cookie.
- `GITHUB_REPO`: `VaneMartiins/site-psicologa-andressa`
- `GITHUB_BRANCH`: `main`

Depois de salvar, faça um novo deploy.

## Permissão de acesso

A conta GitHub usada no `/admin` precisa ter permissão de escrita no repositório. Sem essa permissão, o painel até abre, mas não conseguirá salvar alterações.

## Como a Andressa acessa

1. Acesse `https://SEU-DOMINIO/admin`.
2. Clique em **Entrar com GitHub**.
3. Autorize o app.
4. O painel de publicações será carregado.

## Como publicar um post

1. Clique em **Novo post**.
2. Preencha:
   - título
   - slug
   - categoria
   - data
   - resumo
   - conteúdo completo
   - imagem opcional
   - status
3. Use status `Publicado` para aparecer no site.
4. Use status `Rascunho` para manter oculto.
5. Clique em **Salvar alterações**.

Posts publicados aparecem automaticamente em `/blog`. Cada post fica disponível em `/blog/slug-do-post`.

## Como excluir um post

1. No `/admin`, clique em **Excluir** no post.
2. Confirme a exclusão.
3. Clique em **Salvar alterações**.

## Como fazer deploy

O painel salva um commit no GitHub. A Vercel deve fazer deploy automaticamente após esse commit. Se precisar publicar manualmente, acesse o projeto na Vercel e use **Redeploy** no último deployment.

## Arquivos importantes

- `admin/index.html`: interface do painel.
- `admin.js`: lógica do painel.
- `api/auth.js`: inicia login GitHub.
- `api/callback.js`: recebe OAuth e grava cookie criptografado.
- `api/session.js`: verifica login.
- `api/logout.js`: encerra sessão.
- `api/posts.js`: lê e salva posts no GitHub.
- `api/_auth.js`: helpers de cookie e criptografia.
- `content/blog/posts.json`: banco de posts.
- `blog.html`: listagem pública.
- `blog/post.html`: template dos artigos.
- `blog.js`: renderização pública do blog.
- `vercel.json`: URLs limpas e rewrite `/blog/:slug`.
