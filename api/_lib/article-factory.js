const { slugify } = require("../../scripts/render-veredito");

function splitList(value) {
  return String(value || "")
    .split(/[;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitComma(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function sourceObjects(value) {
  return splitList(value).map((url, index) => ({
    name: `Fonte ${index + 1}`,
    url,
    note: "Fonte informada para revisao editorial.",
    checkedAt: new Date().toISOString().slice(0, 10)
  }));
}

function estimateReadTime(article) {
  const text = [
    article.title,
    article.excerpt,
    ...(article.sections || []).map((section) => `${section.heading} ${section.body}`),
    ...(article.faq || []).map((item) => `${item.question} ${item.answer}`)
  ].join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return `${Math.max(5, Math.ceil(words / 180))} min`;
}

function buildArticleFromBrief(input = {}) {
  const product = input.product || input.title || "Produto em analise";
  const title = input.title || `${product} vale a pena?`;
  const category = input.category || "Tecnologia";
  const goodPrice = input.goodPrice || "quando o preco final estiver abaixo dos concorrentes diretos";
  const audience = input.audience || "quem quer comprar melhor sem cair no impulso";
  const angle = input.angle || "vale comprar agora ou esperar?";
  const pros = splitList(input.pros);
  const cons = splitList(input.cons);
  const competitors = splitComma(input.competitors);
  const today = new Date().toISOString().slice(0, 10);
  const currentPrice = input.currentPrice || "Ver preco atual";
  const marketplace = input.marketplace || "Marketplace";
  const slug = slugify(input.slug || title);

  const article = {
    type: input.type || "review",
    status: "draft",
    title,
    slug,
    category,
    metaDescription: `${title}: veja veredito honesto, preco ideal, pontos fortes, limites e se vale comprar agora.`.slice(0, 165),
    excerpt: `Analise direta sobre ${product}, com preco ideal, pontos de atencao e recomendacao honesta antes de comprar.`,
    author: input.author || "Equipe Veredito Tech",
    hero: {
      eyebrow: input.type === "deal" ? "Oferta com veredito" : "Review honesto antes de comprar",
      subtitle: `O ponto e simples: ${product} pode fazer sentido para ${audience}, mas a decisao depende de preco final, loja confiavel e uso real. ${angle}`,
      primaryCta: "Clique aqui para ver a oferta",
      secondaryCta: "Ler veredito",
      visualType: input.imageUrl ? "product-image" : "css-illustration",
      imageUrl: input.imageUrl || "",
      imageAlt: product
    },
    shortAnswer: {
      label: "Resposta curta",
      text: `Vale considerar ${product} se ele estiver ${goodPrice} e se os pontos fortes combinarem com o seu uso. Se a oferta depender de cupom, frete caro ou vendedor duvidoso, calma: preco bonito sem contexto nao paga boleto nem evita dor de cabeca.`
    },
    summaryCards: [
      { label: "Melhor para", value: audience },
      { label: "Preco bom", value: goodPrice },
      { label: "Atencao", value: cons[0] || "confirmar preco, frete e vendedor" },
      { label: "Veredito", value: "comprar so se o preco final fechar a conta" }
    ],
    verdict: {
      score: "8,2",
      summary: `${product} entra como boa compra quando preco, loja e uso real se encontram. Sem isso, e melhor comparar antes de clicar.`,
      bestFor: [audience, ...pros.slice(0, 2)],
      avoidIf: cons.length ? cons : ["o preco estiver perto de modelos superiores"]
    },
    offers: [
      {
        title: product,
        marketplace,
        originalUrl: input.originalUrl || "",
        affiliateUrl: input.affiliateUrl || "#",
        currentPrice,
        regularPrice: input.regularPrice || "",
        coupon: input.coupon || "",
        label: input.currentPrice ? "Preco checado manualmente" : "Oferta simulada",
        seller: marketplace,
        lastCheckedAt: today,
        priceStatus: input.currentPrice ? "real" : "simulated"
      }
    ],
    sections: [
      {
        heading: "Veredito rapido",
        body: `${product} e uma compra para analisar com cabeca fria. Se estiver ${goodPrice}, a conversa melhora. Se estiver caro, a melhor estrategia e comparar com alternativas proximas e esperar uma condicao melhor.`
      },
      {
        heading: "Para quem vale a pena",
        body: `Vale para ${audience}. Tambem combina com quem prefere decidir com base em preco final, garantia e utilidade pratica, nao so em selo de promocao.`,
        items: pros.length ? pros : ["quem encontrou preco competitivo", "quem vai usar os recursos principais", "quem comprou de loja confiavel"]
      },
      {
        heading: "Para quem nao vale a pena",
        body: `Nao vale comprar no impulso. Se o produto tiver limitacoes importantes para o seu uso, ou se um concorrente entregar mais por pouca diferenca, o melhor clique pode ser o de voltar e comparar.`,
        items: cons.length ? cons : ["quem precisa do melhor desempenho absoluto", "quem encontrou concorrente melhor", "quem depende de frete muito caro"]
      },
      {
        heading: "O que conferir antes de comprar",
        body: "O preco final manda. Confira cupom no carrinho, frete, prazo, vendedor, garantia, versao exata do produto e politica de troca. Oferta boa e a que continua boa depois que voce coloca o CEP."
      },
      {
        heading: "Preco ideal",
        body: `A compra comeca a ficar interessante ${goodPrice}. Acima disso, vale comparar com ${competitors.length ? competitors.join(", ") : "concorrentes diretos da mesma faixa"}.`
      }
    ],
    comparisonTable: {
      columns: ["Opcao", "Melhor para", "Ponto forte", "Atencao"],
      rows: [
        [product, audience, pros[0] || "bom pacote geral", cons[0] || "confirmar preco final"],
        ...(competitors.length
          ? competitors.slice(0, 4).map((item) => [item, "comparar antes de decidir", "pode aparecer com preco melhor", "verificar ficha e garantia"])
          : [["Concorrente direto", "quem quer comparar preco", "pode ter melhor custo-beneficio", "depende da oferta do dia"]])
      ]
    },
    faq: [
      {
        question: `${product} vale a pena?`,
        answer: `Vale se estiver ${goodPrice} e se os limites nao atrapalharem seu uso. Se o preco estiver normal, compare antes.`
      },
      {
        question: "Quando comprar?",
        answer: "Quando preco, frete, cupom, vendedor e garantia fizerem sentido juntos. Um desconto isolado nao basta."
      },
      {
        question: "O link e afiliado?",
        answer: "Sim, o post pode usar link de afiliado. Isso pode gerar comissao sem custo adicional para voce."
      }
    ],
    internalLinks: [
      { title: "OLED, MiniLED ou QNED: qual TV comprar?", url: "/previews/veredito-tech-oled-miniled-qned.html", reason: "Guia relacionado" },
      { title: "Comprar eletronicos no fim do mes vale a pena?", url: "/previews/veredito-tech-comprar-eletronicos-fim-do-mes.html", reason: "Timing de compra" }
    ],
    sources: sourceObjects(input.sources),
    creativeBrief: `Criar visual limpo e premium para ${product}, com foco em preco final, veredito e comparacao honesta.`,
    qualityChecklist: {
      factChecked: false,
      proofread: true,
      mobileChecked: true,
      affiliateDisclosureIncluded: true,
      simulatedPricesOnlyInPreview: !input.currentPrice
    }
  };

  article.readTime = estimateReadTime(article);
  return article;
}

module.exports = {
  buildArticleFromBrief,
  estimateReadTime
};
