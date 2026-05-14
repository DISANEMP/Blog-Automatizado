const form = document.querySelector("#briefingForm");
const jsonEditor = document.querySelector("#jsonEditor");
const statusBadge = document.querySelector("#statusBadge");
const previewFrame = document.querySelector("#previewFrame");
const openPreview = document.querySelector("#openPreview");
const generatePreview = document.querySelector("#generatePreview");
const publishArticle = document.querySelector("#publishArticle");
const fillExample = document.querySelector("#fillExample");
const formatJson = document.querySelector("#formatJson");

function setStatus(message) {
  statusBadge.textContent = message;
}

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

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

function formData() {
  return Object.fromEntries(new FormData(form).entries());
}

function sourceObjects(value) {
  return splitList(value).map((url, index) => ({
    name: `Fonte ${index + 1}`,
    url,
    note: "Fonte informada para revisão editorial.",
    checkedAt: new Date().toISOString().slice(0, 10)
  }));
}

function buildArticle(input) {
  const product = input.product || input.title;
  const category = input.category || "Tecnologia";
  const goodPrice = input.goodPrice || "quando o preço final estiver abaixo dos concorrentes diretos";
  const audience = input.audience || "quem quer comprar bem sem cair em oferta bonita só no banner";
  const angle = input.angle || "vale comprar agora ou esperar?";
  const pros = splitList(input.pros);
  const cons = splitList(input.cons);
  const competitors = splitComma(input.competitors);
  const title = input.title;
  const slug = slugify(title);
  const today = new Date().toISOString().slice(0, 10);
  const currentPrice = input.currentPrice || "Ver preço atual";
  const marketplace = input.marketplace || "Marketplace";

  return {
    type: input.type || "review",
    status: "preview",
    title,
    slug,
    category,
    metaDescription: `${title}: veja veredito honesto, preço ideal, pontos fortes, limites e se vale comprar agora.`.slice(0, 165),
    excerpt: `Análise direta sobre ${product}, com preço ideal, pontos de atenção e recomendação honesta antes de comprar.`,
    author: "Equipe Veredito Tech",
    hero: {
      eyebrow: input.type === "deal" ? "Oferta com veredito" : "Review honesto antes de comprar",
      subtitle: `O ponto é simples: ${product} pode fazer sentido para ${audience}, mas a decisão depende de preço final, loja confiável e uso real. ${angle}`,
      primaryCta: "Clique aqui para ver a oferta",
      secondaryCta: "Ler veredito",
      visualType: input.imageUrl ? "product-image" : "css-illustration",
      imageUrl: input.imageUrl || "",
      imageAlt: product
    },
    shortAnswer: {
      label: "Resposta curta",
      text: `Vale considerar ${product} se ele estiver ${goodPrice} e se os pontos fortes combinarem com o seu uso. Se a oferta depender de cupom, frete caro ou vendedor duvidoso, calma: preço bonito sem contexto não paga boleto nem evita dor de cabeça.`
    },
    summaryCards: [
      { label: "Melhor para", value: audience },
      { label: "Preço bom", value: goodPrice },
      { label: "Atenção", value: cons[0] || "confirmar preço, frete e vendedor" },
      { label: "Veredito", value: "comprar só se o preço final fechar a conta" }
    ],
    verdict: {
      score: "8,2",
      summary: `${product} entra como boa compra quando preço, loja e uso real se encontram. Sem isso, é melhor comparar antes de clicar.`,
      bestFor: [audience, ...pros.slice(0, 2)],
      avoidIf: cons.length ? cons : ["o preço estiver perto de modelos superiores"]
    },
    offers: [
      {
        title: product,
        marketplace,
        originalUrl: "",
        affiliateUrl: input.affiliateUrl || "#",
        currentPrice,
        regularPrice: input.regularPrice || "",
        coupon: input.coupon || "",
        label: input.currentPrice ? "Preço checado manualmente" : "Oferta simulada",
        seller: marketplace,
        lastCheckedAt: today,
        priceStatus: input.currentPrice ? "real" : "simulated"
      }
    ],
    sections: [
      {
        heading: "Veredito rápido",
        body: `${product} é uma compra para analisar com cabeça fria. Se estiver ${goodPrice}, a conversa melhora. Se estiver caro, a melhor estratégia é comparar com alternativas próximas e esperar uma condição melhor.`
      },
      {
        heading: "Para quem vale a pena",
        body: `Vale para ${audience}. Também combina com quem prefere decidir com base em preço final, garantia e utilidade prática, não só em selo de promoção.`,
        items: pros.length ? pros : ["quem encontrou preço competitivo", "quem vai usar os recursos principais", "quem comprou de loja confiável"]
      },
      {
        heading: "Para quem não vale a pena",
        body: `Não vale comprar no impulso. Se o produto tiver limitações importantes para o seu uso, ou se um concorrente entregar mais por pouca diferença, o melhor clique pode ser o de voltar e comparar.`,
        items: cons.length ? cons : ["quem precisa do melhor desempenho absoluto", "quem encontrou concorrente melhor", "quem depende de frete muito caro"]
      },
      {
        heading: "O que conferir antes de comprar",
        body: "O preço final manda. Confira cupom no carrinho, frete, prazo, vendedor, garantia, versão exata do produto e política de troca. Oferta boa é a que continua boa depois que você coloca o CEP."
      },
      {
        heading: "Preço ideal",
        body: `A compra começa a ficar interessante ${goodPrice}. Acima disso, vale comparar com ${competitors.length ? competitors.join(", ") : "concorrentes diretos da mesma faixa"}.`
      }
    ],
    comparisonTable: {
      columns: ["Opção", "Melhor para", "Ponto forte", "Atenção"],
      rows: [
        [product, audience, pros[0] || "bom pacote geral", cons[0] || "confirmar preço final"],
        ...(competitors.length
          ? competitors.slice(0, 4).map((item) => [item, "comparar antes de decidir", "pode aparecer com preço melhor", "verificar ficha e garantia"])
          : [["Concorrente direto", "quem quer comparar preço", "pode ter melhor custo-benefício", "depende da oferta do dia"]])
      ]
    },
    faq: [
      {
        question: `${product} vale a pena?`,
        answer: `Vale se estiver ${goodPrice} e se os limites não atrapalharem seu uso. Se o preço estiver normal, compare antes.`
      },
      {
        question: "Quando comprar?",
        answer: "Quando preço, frete, cupom, vendedor e garantia fizerem sentido juntos. Um desconto isolado não basta."
      },
      {
        question: "O link é afiliado?",
        answer: "Sim, o post pode usar link de afiliado. Isso pode gerar comissão sem custo adicional para você."
      }
    ],
    internalLinks: [
      { title: "OLED, MiniLED ou QNED: qual TV comprar?", url: "previews/veredito-tech-oled-miniled-qned.html", reason: "Guia relacionado" },
      { title: "Comprar eletrônicos no fim do mês vale a pena?", url: "previews/veredito-tech-comprar-eletronicos-fim-do-mes.html", reason: "Timing de compra" }
    ],
    sources: sourceObjects(input.sources),
    creativeBrief: `Criar visual limpo e premium para ${product}, com foco em preço final, veredito e comparação honesta.`,
    qualityChecklist: {
      factChecked: false,
      proofread: true,
      mobileChecked: true,
      affiliateDisclosureIncluded: true,
      simulatedPricesOnlyInPreview: !input.currentPrice
    }
  };
}

async function api(path, payload) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erro inesperado.");
  return data;
}

function getArticleFromEditor() {
  try {
    return JSON.parse(jsonEditor.value);
  } catch {
    throw new Error("JSON inválido. Clique em formatar ou gere novamente pelo formulário.");
  }
}

function putArticle(article) {
  jsonEditor.value = JSON.stringify(article, null, 2);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const article = buildArticle(formData());
  putArticle(article);
  setStatus("JSON gerado");
});

generatePreview.addEventListener("click", async () => {
  setStatus("Gerando prévia...");
  try {
    const article = getArticleFromEditor();
    const result = await api("/api/veredito/preview", { article });
    previewFrame.src = `${result.previewUrl}?t=${Date.now()}`;
    openPreview.href = result.previewUrl;
    putArticle(result.article);
    setStatus("Prévia pronta");
  } catch (error) {
    setStatus(error.message);
  }
});

publishArticle.addEventListener("click", async () => {
  const confirmed = window.confirm("Publicar este artigo agora? Confira links, preço e fontes antes.");
  if (!confirmed) return;
  setStatus("Publicando...");
  try {
    const article = getArticleFromEditor();
    const result = await api("/api/veredito/publish", { article });
    previewFrame.src = `${result.postUrl}?t=${Date.now()}`;
    openPreview.href = result.postUrl;
    putArticle(result.article);
    setStatus("Publicado");
  } catch (error) {
    setStatus(error.message);
  }
});

formatJson.addEventListener("click", () => {
  try {
    putArticle(getArticleFromEditor());
    setStatus("JSON formatado");
  } catch (error) {
    setStatus(error.message);
  }
});

fillExample.addEventListener("click", () => {
  const values = {
    type: "review",
    category: "TVs",
    title: "Smart TV LG 75UA8550PSA vale a pena?",
    product: "Smart TV LG 75UA8550PSA",
    angle: "vale comprar agora ou esperar uma QNED baixar?",
    audience: "quem quer uma TV gigante para sala, streaming e futebol sem pagar preço de OLED",
    goodPrice: "abaixo de R$ 4.700",
    marketplace: "Casas Bahia",
    currentPrice: "R$ 4.274,05",
    regularPrice: "R$ 5.099,00",
    coupon: "TV75OFERTA",
    affiliateUrl: "https://example.com/casas-bahia-lg-75-afiliado",
    imageUrl: "",
    competitors: "Samsung Crystal 75, TCL C655 75, LG QNED 75",
    pros: "tela grande; webOS; bom preço para 75 polegadas; controle Smart Magic",
    cons: "painel 60 Hz; áudio simples; frete pode pesar; não é OLED nem MiniLED",
    sources: "https://www.lg.com/br/\nhttps://www.casasbahia.com.br/"
  };
  for (const [key, value] of Object.entries(values)) {
    const field = form.elements[key];
    if (field) field.value = value;
  }
  putArticle(buildArticle(values));
  setStatus("Exemplo carregado");
});

putArticle(buildArticle({
  type: "review",
  category: "Tecnologia",
  title: "Exemplo Veredito Tech",
  product: "Produto exemplo",
  angle: "vale comprar agora?",
  audience: "quem quer comprar melhor sem cair no impulso",
  goodPrice: "quando o preço final fizer sentido"
}));
