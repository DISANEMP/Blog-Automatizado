# Setup de Ads e Afiliados

## O que voce vai me fornecer depois

### Google AdSense

- `ADSENSE_CLIENT_ID`
- slots de anuncio:
  - after-intro
  - mid-article
  - sidebar
  - end-article opcional

Preencher em:

```text
config/ads.config.json
```

### Afiliados

Para cada marketplace:

- nome;
- link original;
- link afiliado;
- preco atual;
- preco normal;
- cupom;
- comissao estimada;
- vendedor;
- data da ultima checagem.

Preencher ou gerar dentro dos artigos JSON em:

```text
content/drafts/*.json
```

### Supabase

Configurar variaveis:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Executar `supabase/schema.sql` no SQL editor.

## Onde entra a busca de melhor preco

O projeto esta preparado para:

- pesquisa manual assistida;
- links informados pelo usuario;
- APIs oficiais;
- feeds de afiliado;
- comparadores quando permitido;
- snapshots de preco no Supabase.

Nao usar scraping agressivo.
