# Renda Smart

Blog estatico para monetizacao com anuncios, afiliados e captura de e-mail.

## Como usar

1. Abra `index.html` no navegador para ver o blog.
2. Troque o nome, nicho e textos em `index.html`.
3. Substitua os links `#` em `posts/posts.js` pelos links reais de afiliado.
4. Adicione codigos de anuncio no bloco `.ad-band` do `index.html` e, se quiser, dentro dos posts.
5. Publique em Netlify, Vercel, Cloudflare Pages, GitHub Pages ou qualquer hospedagem estatica.

## Novo fluxo Veredito Tech

O projeto agora tem um fluxo mais profissional:

- `AGENTS.md`: equipe editorial, tecnologia, ads, SEO, Discover, Supabase, copy e QA.
- `config/`: configuracoes de site, voz, ads, afiliados, Discover e fontes de preco.
- `schemas/veredito-article.schema.json`: formato do JSON editorial.
- `assets/veredito.css`: template visual mobile-first.
- `scripts/render-veredito.js`: transforma JSON em HTML.
- `supabase/schema.sql`: banco preparado para produtos, artigos, ofertas, cliques e eventos.

Gerar uma previa:

```bash
npm.cmd run render -- content/drafts/veredito-template.json
```

Publicar:

```bash
npm.cmd run publish -- content/drafts/veredito-template.json --publish
```

Sincronizar com Supabase, depois de configurar as chaves:

```bash
npm.cmd run sync:supabase -- content/drafts/veredito-template.json
```

## Criar posts automatizados

Copie `content/post-template.json`, renomeie para algo como `melhores-ferramentas-ia.json` e preencha os campos.

Depois rode:

```bash
npm run generate
```

O script cria o HTML do post em `posts/` e atualiza a listagem da home em `posts/posts.js`.

## Estrategia recomendada

- Comece por um nicho com compra frequente: ferramentas de IA, produtividade, finanças pessoais, casa inteligente, beleza, suplementos, pets, tecnologia barata ou cursos digitais.
- Publique comparativos, listas, tutoriais e reviews com intenção de compra.
- Coloque aviso de afiliado em todas as páginas com recomendações.
- Meça cliques de afiliado com UTMs ou encurtador próprio.
- Só peça AdSense depois de ter conteúdo original suficiente, páginas institucionais e navegação clara.
