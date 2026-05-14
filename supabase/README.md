# Supabase

Esta pasta deixa o banco pronto para quando voce fornecer:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` apenas para servidor/scripts

## Tabelas previstas

- `products`: cadastro de produtos.
- `affiliate_links`: links de afiliado por marketplace.
- `price_snapshots`: historico de preco e cupom.
- `articles`: artigos gerados, previews e publicados.
- `article_products`: relacao entre artigo e produto.
- `article_sources`: fontes usadas.
- `ad_slots`: configuracao de anuncios.
- `page_events`: eventos de visualizacao/scroll.
- `affiliate_clicks`: cliques em links afiliados.

## Regra importante

Anon key pode aparecer no frontend apenas para operacoes publicas e protegidas por RLS.
Service role key nunca vai para o frontend.
