# Handoff - Veredito Tech / Motor Afiliado Tech IA

Data do estado: 2026-05-14

## Estado atual

O projeto virou um motor local para blog de tecnologia, afiliados, ads leves, SEO e Discover.

Principais partes prontas:

- `AGENTS.md`: equipe conceitual completa com engenharia, SEO, copy, ads, Supabase, Discover, QA, mobile, afiliados e seguranca.
- `studio.html`: painel no navegador para gerar JSON, criar previa HTML e publicar.
- `scripts/render-veredito.js`: renderizador JSON -> HTML.
- `assets/veredito.css`: CSS mobile-first centralizado.
- `assets/veredito-tracking.js`: tracking publico para page views e cliques afiliados.
- `config/*.json`: configuracoes de site, voz, ads, afiliados, Discover, fontes e plataforma.
- `schemas/veredito-article.schema.json`: schema editorial.
- `supabase/schema-essential.sql`: tabelas principais ja executadas com sucesso.
- `supabase/schema-tracking.sql`: tabelas de eventos/cliques ja executadas com sucesso.
- `.env.local`: contem Supabase URL, anon key e publishable key. Nao commitar.

## Supabase

Projeto inferido/configurado:

```text
https://embynsxunjitdvklwadk.supabase.co
```

`npm.cmd run check:supabase` retornou:

```text
Supabase REST: 200 OK
```

Tabelas criadas:

- `products`
- `affiliate_links`
- `price_snapshots`
- `articles`
- `article_products`
- `article_sources`
- `ad_slots`
- `page_events`
- `affiliate_clicks`

Observacao: service role key nao foi fornecida e nao deve ser colada no chat. Publicacao local funciona sem ela. Sync administrativo com Supabase exige service role ou policies especificas.

## Comandos

Rodar servidor local:

```bash
npm.cmd run dev
```

Abrir Studio:

```text
http://127.0.0.1:3100/studio.html
```

Gerar previa via JSON:

```bash
npm.cmd run render -- content/drafts/veredito-template.json
```

Publicar via JSON:

```bash
npm.cmd run publish -- content/drafts/veredito-template.json --publish
```

Testar Supabase:

```bash
npm.cmd run check:supabase
```

## Tracking

`scripts/render-veredito.js` carrega `.env.local` e injeta:

```html
window.VEREDITO_SUPABASE = { url, key }
<script src="../assets/veredito-tracking.js"></script>
```

O tracking envia:

- `page_view` para `page_events`
- cliques em links `rel*="sponsored"` para `affiliate_clicks`

## Sobre mudanca de nome

Nao precisa refazer o sistema.

Alterar marca em:

```text
config/site.config.json
config/voice-profile.json se quiser ajustar tom
```

Depois regenerar as paginas novas. Paginas antigas geradas em `posts/` e `previews/` podem precisar ser regeneradas.

## Proximo passo recomendado

1. Melhorar o Studio para ter botao "Salvar no Supabase" quando houver service role/server endpoint seguro.
2. Criar tela simples de dashboard lendo `page_events` e `affiliate_clicks`.
3. Criar gerador de pauta por cluster.
4. Criar integracao futura com API de IA/pesquisa.
5. Escolher nome final antes de publicar dominio.

## Como continuar em nova conversa

Mensagem sugerida:

```text
Continue do HANDOFF.md no projeto Veredito Tech. Leia AGENTS.md, README.md e HANDOFF.md. O Studio ja existe em /studio.html, Supabase ja esta conectado com anon key, schemas essential/tracking ja foram rodados com sucesso. Continue a partir do proximo passo recomendado.
```
