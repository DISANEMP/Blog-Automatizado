const form = document.querySelector("#briefingForm");
const jsonEditor = document.querySelector("#jsonEditor");
const statusBadge = document.querySelector("#statusBadge");
const previewFrame = document.querySelector("#previewFrame");
const openPreview = document.querySelector("#openPreview");
const generatePreview = document.querySelector("#generatePreview");
const publishArticle = document.querySelector("#publishArticle");
const saveDraft = document.querySelector("#saveDraft");
const fillExample = document.querySelector("#fillExample");
const formatJson = document.querySelector("#formatJson");
const refreshDrafts = document.querySelector("#refreshDrafts");
const articleList = document.querySelector("#articleList");
const draftCount = document.querySelector("#draftCount");
const publishedCount = document.querySelector("#publishedCount");
const providerStatus = document.querySelector("#providerStatus");
const generateFromUrl = document.querySelector("#generateFromUrl");
const sourceUrl = document.querySelector("#sourceUrl");
const sourceAffiliateUrl = document.querySelector("#sourceAffiliateUrl");
const sourceAngle = document.querySelector("#sourceAngle");
const researchStatus = document.querySelector("#researchStatus");

let currentArticle = null;
let currentObjectUrl = null;

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
    note: "Fonte informada para revisao editorial.",
    checkedAt: new Date().toISOString().slice(0, 10)
  }));
}

function buildLocalArticle(input) {
  const product = input.product || input.title || "Produto exemplo";
  const category = input.category || "Tecnologia";
  const goodPrice = input.goodPrice || "quando o preco final estiver abaixo dos concorrentes diretos";
  const audience = input.audience || "quem quer comprar melhor sem cair no impulso";
  const angle = input.angle || "vale comprar agora?";
  const pros = splitList(input.pros);
  const cons = splitList(input.cons);
  const competitors = splitComma(input.competitors);
  const title = input.title || `${product} vale a pena?`;
  const today = new Date().toISOString().slice(0, 10);
  const currentPrice = input.currentPrice || "Ver preco atual";
  const marketplace = input.marketplace || "Marketplace";

  return {
    type: input.type || "review",
    status: "draft",
    title,
    slug: slugify(title),
    category,
    metaDescription: `${title}: veja veredito honesto, preco ideal, pontos fortes, limites e se vale comprar agora.`.slice(0, 165),
    excerpt: `Analise direta sobre ${product}, com preco ideal, pontos de atencao e recomendacao honesta antes de comprar.`,
    author: "Equipe Veredito Tech",
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
        body: `${product} e uma compra para analisar com cabeca fria. Se estiver ${goodPrice}, a conversa melhora. Se estiver caro, compare com alternativas proximas.`
      },
      {
        heading: "Para quem vale a pena",
        body: `Vale para ${audience}. Tambem combina com quem prefere decidir com base em preco final, garantia e utilidade pratica.`,
        items: pros.length ? pros : ["quem encontrou preco competitivo", "quem vai usar os recursos principais", "quem comprou de loja confiavel"]
      },
      {
        heading: "Para quem nao vale a pena",
        body: "Nao vale comprar no impulso. Se um concorrente entregar mais por pouca diferenca, o melhor clique pode ser o de voltar e comparar.",
        items: cons.length ? cons : ["quem precisa do melhor desempenho absoluto", "quem encontrou concorrente melhor", "quem depende de frete muito caro"]
      },
      {
        heading: "O que conferir antes de comprar",
        body: "O preco final manda. Confira cupom no carrinho, frete, prazo, vendedor, garantia, versao exata do produto e politica de troca."
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
      { question: `${product} vale a pena?`, answer: `Vale se estiver ${goodPrice} e se os limites nao atrapalharem seu uso.` },
      { question: "Quando comprar?", answer: "Quando preco, frete, cupom, vendedor e garantia fizerem sentido juntos." },
      { question: "O link e afiliado?", answer: "Sim, o post pode usar link de afiliado sem custo adicional para voce." }
    ],
    internalLinks: [],
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
}

async function requestJson(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erro inesperado.");
  return data;
}

async function postJson(path, payload) {
  return requestJson(path, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

function getArticleFromEditor() {
  try {
    return JSON.parse(jsonEditor.value);
  } catch {
    throw new Error("JSON invalido. Formate ou gere novamente.");
  }
}

function putArticle(article) {
  currentArticle = article;
  jsonEditor.value = JSON.stringify(article, null, 2);
}

function showRenderedResult(result, fallbackUrl) {
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);

  if (result.html) {
    previewFrame.removeAttribute("src");
    previewFrame.srcdoc = result.html;
    currentObjectUrl = URL.createObjectURL(new Blob([result.html], { type: "text/html" }));
    openPreview.href = currentObjectUrl;
    return;
  }

  if (fallbackUrl) {
    previewFrame.removeAttribute("srcdoc");
    previewFrame.src = `${fallbackUrl}?t=${Date.now()}`;
    openPreview.href = fallbackUrl;
  }
}

async function refreshList() {
  setStatus("Carregando publicacoes...");
  try {
    const data = await requestJson("/api/veredito/drafts");
    const articles = data.articles || [];
    draftCount.textContent = articles.filter((item) => item.status !== "published").length;
    publishedCount.textContent = articles.filter((item) => item.status === "published").length;
    articleList.innerHTML = articles.length
      ? articles.map(renderArticleItem).join("")
      : "<p>Nenhuma publicacao ainda. Gere o primeiro rascunho acima.</p>";
    setStatus("Lista atualizada");
  } catch (error) {
    articleList.innerHTML = `<p>${error.message}</p>`;
    setStatus("Configure Supabase");
  }
}

function renderArticleItem(item) {
  const publicUrl = item.status === "published" ? `/p/${item.slug}` : "";
  return `
    <div class="article-item">
      <div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.category || "Tecnologia")} | ${escapeHtml(item.status)} | ${escapeHtml(item.slug)}</p>
      </div>
      <div class="article-actions">
        <button type="button" class="secondary" data-load="${escapeHtml(item.slug)}">Editar</button>
        ${publicUrl ? `<a class="link-button" href="${publicUrl}" target="_blank">Abrir post</a>` : ""}
        <button type="button" class="secondary" data-delete="${escapeHtml(item.slug)}">Apagar</button>
      </div>
    </div>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function loadArticle(slug) {
  setStatus("Carregando artigo...");
  const data = await requestJson(`/api/veredito/article?slug=${encodeURIComponent(slug)}`);
  putArticle(data.article);
  const preview = await postJson("/api/veredito/preview", { article: data.article });
  showRenderedResult(preview, preview.previewUrl);
  setStatus("Artigo carregado");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("Gerando com o motor editorial...");
  try {
    const result = await postJson("/api/veredito/generate", { brief: formData() });
    providerStatus.textContent = result.provider || "ok";
    putArticle(result.article);
    const preview = await postJson("/api/veredito/preview", { article: result.article });
    showRenderedResult(preview, preview.previewUrl);
    await refreshList();
    setStatus("Rascunho gerado");
  } catch (error) {
    const article = buildLocalArticle(formData());
    putArticle(article);
    setStatus(error.message);
  }
});

generateFromUrl.addEventListener("click", async () => {
  const url = sourceUrl.value.trim();
  if (!url) {
    setStatus("Cole um link primeiro");
    sourceUrl.focus();
    return;
  }

  setStatus("Lendo link e pesquisando...");
  researchStatus.textContent = "Buscando dados da pagina, imagem, fontes e gerando texto na persona...";
  try {
    const result = await postJson("/api/veredito/generate-from-url", {
      url,
      affiliateUrl: sourceAffiliateUrl.value.trim(),
      angle: sourceAngle.value.trim()
    });
    providerStatus.textContent = result.provider || "ok";
    putArticle(result.article);
    researchStatus.textContent = `Extraido: ${result.extracted?.productName || result.extracted?.title || "produto"} | Fontes extras: ${result.searchSources?.length || 0}`;
    const preview = await postJson("/api/veredito/preview", { article: result.article });
    showRenderedResult(preview, preview.previewUrl);
    await refreshList();
    setStatus("Rascunho automatico pronto");
  } catch (error) {
    researchStatus.textContent = "Falhou ao ler automaticamente. Tente outro link, ou use campos avancados/manual.";
    setStatus(error.message);
  }
});

saveDraft.addEventListener("click", async () => {
  setStatus("Salvando rascunho...");
  try {
    const article = getArticleFromEditor();
    const result = await postJson("/api/veredito/preview", { article });
    putArticle(result.article);
    showRenderedResult(result, result.previewUrl);
    await refreshList();
    setStatus("Rascunho salvo");
  } catch (error) {
    setStatus(error.message);
  }
});

generatePreview.addEventListener("click", async () => {
  setStatus("Gerando preview...");
  try {
    const article = getArticleFromEditor();
    const result = await postJson("/api/veredito/preview", { article });
    putArticle(result.article);
    showRenderedResult(result, result.previewUrl);
    setStatus("Preview pronto");
  } catch (error) {
    setStatus(error.message);
  }
});

publishArticle.addEventListener("click", async () => {
  if (!window.confirm("Aprovar e publicar este artigo agora? Confira preco, link afiliado, imagem e fontes antes.")) return;
  setStatus("Publicando...");
  try {
    const article = getArticleFromEditor();
    const result = await postJson("/api/veredito/publish", { article });
    putArticle(result.article);
    showRenderedResult(result, result.postUrl);
    if (result.postUrl) openPreview.href = result.postUrl;
    await refreshList();
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

refreshDrafts.addEventListener("click", refreshList);

articleList.addEventListener("click", (event) => {
  const loadButton = event.target.closest("[data-load]");
  const deleteButton = event.target.closest("[data-delete]");
  if (loadButton) {
    loadArticle(loadButton.dataset.load).catch((error) => setStatus(error.message));
    return;
  }
  if (deleteButton) {
    const slug = deleteButton.dataset.delete;
    if (!window.confirm(`Apagar "${slug}" do Supabase?`)) return;
    setStatus("Apagando...");
    postJson("/api/veredito/delete", { slug })
      .then(refreshList)
      .then(() => setStatus("Apagado"))
      .catch((error) => setStatus(error.message));
  }
});

fillExample.addEventListener("click", () => {
  const values = {
    type: "review",
    category: "TVs",
    title: "Smart TV LG 75UA8550PSA vale a pena?",
    product: "Smart TV LG 75UA8550PSA",
    angle: "vale comprar agora ou esperar uma QNED baixar?",
    audience: "quem quer uma TV gigante para sala, streaming e futebol sem pagar preco de OLED",
    goodPrice: "abaixo de R$ 4.700",
    marketplace: "Casas Bahia",
    currentPrice: "R$ 4.274,05",
    regularPrice: "R$ 5.099,00",
    coupon: "TV75OFERTA",
    affiliateUrl: "https://example.com/casas-bahia-lg-75-afiliado",
    imageUrl: "",
    competitors: "Samsung Crystal 75, TCL C655 75, LG QNED 75",
    pros: "tela grande; webOS; bom preco para 75 polegadas; controle Smart Magic",
    cons: "painel 60 Hz; audio simples; frete pode pesar; nao e OLED nem MiniLED",
    sources: "https://www.lg.com/br/\nhttps://www.casasbahia.com.br/"
  };
  sourceUrl.value = "https://www.casasbahia.com.br/smart-tv-75-lg-4k-uhd-75ua8550psa-processador-a7-gen8-webos-25-bluetooth/p/55070130";
  sourceAffiliateUrl.value = values.affiliateUrl;
  sourceAngle.value = values.angle;
  for (const [key, value] of Object.entries(values)) {
    const field = form.elements[key];
    if (field) field.value = value;
  }
  putArticle(buildLocalArticle(values));
  setStatus("Exemplo carregado");
});

async function boot() {
  putArticle(buildLocalArticle({
    type: "review",
    category: "Tecnologia",
    title: "Exemplo Veredito Tech",
    product: "Produto exemplo",
    angle: "vale comprar agora?",
    audience: "quem quer comprar melhor sem cair no impulso",
    goodPrice: "quando o preco final fizer sentido"
  }));
  try {
    const config = await requestJson("/api/veredito/config");
    providerStatus.textContent = config?.site?.brand?.name ? "online" : "online";
  } catch {
    providerStatus.textContent = "parcial";
  }
  refreshList();
}

boot();
