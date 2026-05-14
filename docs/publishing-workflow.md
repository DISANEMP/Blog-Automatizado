# Workflow de publicacao

## Fluxo recomendado

1. Usuario informa pauta, produto ou link.
2. PriceResearchAgent pesquisa fontes, preco, cupom e concorrentes.
3. EditorialDirectorAgent define angulo.
4. SEOOptimizerAgent monta estrutura.
5. ProductReviewAgent cria veredito.
6. CopyMarketingAgent melhora CTA e leitura.
7. HumanizationAgent deixa o texto natural.
8. FactCheckingAgent revisa dados.
9. VisualQAAgent/PageBuilderAgent validam layout.
10. Renderizador cria preview HTML.
11. Usuario aprova.
12. Renderizador publica em `posts/`.
13. DeploymentOpsAgent envia para deploy.

## Como gerar uma previa por JSON

```bash
npm.cmd run render -- content/drafts/veredito-template.json
```

O arquivo sai em:

```text
previews/titulo-do-artigo.html
```

## Como publicar

```bash
npm.cmd run publish -- content/drafts/veredito-template.json --publish
```

O script bloqueia publicacao se houver preco simulado e a configuracao `allowSimulatedPricesInPublished` estiver falsa.

## Como sincronizar com Supabase

Depois de configurar `.env.local` ou variaveis de ambiente:

```bash
npm.cmd run sync:supabase -- content/drafts/veredito-template.json
```

Use apenas `SUPABASE_SERVICE_ROLE_KEY` em ambiente local/servidor. Nunca exponha no frontend.

## Comando ideal do usuario

```text
Crie preview: TV LG 75UA8550PSA.
Use link afiliado X.
Foque em Discover.
Nao publique sem minha aprovacao.
```

Ou, quando o projeto estiver configurado:

```text
Publique direto: melhores TVs 75 polegadas ate R$ 5.000.
Usar afiliados padrao.
Checar preco hoje.
```
