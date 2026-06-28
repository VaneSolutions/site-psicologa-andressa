# Como editar o blog

O blog foi preparado para ser editado por uma área administrativa usando Decap CMS.

Depois que o site estiver publicado e conectado ao GitHub/Netlify, a Andressa acessa:

`https://endereco-do-site.com/admin/`

Na tela de administração, ela poderá editar a lista de publicações preenchendo:

- Título
- Categoria
- Data
- Resumo curto
- Texto principal
- Link do vídeo
- Texto do botão do vídeo

Os posts publicados ficam salvos no arquivo `content/blog/posts.json`. O arquivo `blog-posts.js` existe apenas como fallback para visualização local.

## Passo a passo para ativar

1. Suba este projeto para um repositório no GitHub.
2. Crie um site na Netlify apontando para esse repositório.
3. Na Netlify, ative Identity.
4. Na Netlify, ative Git Gateway.
5. Convide o e-mail da Andressa como usuária.
6. Depois do aceite do convite, ela entra em `/admin/` e publica pelo painel.

Se o repositório usar uma branch diferente de `main`, altere `branch: main` em `admin/config.yml`.

## Onde trocar campos importantes

- Número do WhatsApp: `script.js`
- Posts do blog: painel `/admin/`
- Configuração do CMS: `admin/config.yml`
