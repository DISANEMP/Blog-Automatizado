const form = document.querySelector("#briefingForm");
const jsonEditor = document.querySelector("#jsonEditor");
const statusBadge = document.querySelector("#statusBadge");
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
const currentDraft = document.querySelector("#currentDraft");
const generatePreview = document.querySelector("#generatePreview");

let currentArticle = null;

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
  const title = input.title || `${product} vale a pena?`;
  const goodPrice = input.goodPrice || "quando o preco final fizer sentido";

  return {
    type: input.type || "review",
    status: "draft",
    title,
    slug: slugify(title),
    category: input.category || "Tecnologia",
    metaDescription: `${title}: veja veredito honesto, preco ideal, pontos fortes, limites e se vale comprar agora.`.slice(0, 165),
    excerpt: `Analise direta sobre ${product}, com recomendacao honesta antes de comprar.`,
    author: "Equipe Veredito Tech",
    hero: {
      eyebrow: "Review honesto antes de comprar",
      subtitle: `${product} pode fazer sentido, mas o preco final manda. Vamos olhar uso real, loja, garantia e alternativas antes do clique.`,
      primaryCta: "Clique aqui para ver a oferta",
      secondaryCta: "Ler veredito",
      imageUrl: input.imageUrl || "",
      imageAlt: product
    },
    shortAnswer: {
      label: "Resposta curta",
      text: `Vale considerar se estiver ${goodPrice}. Se o preco estiver normal, compare antes.`
    },
    summaryCards: [
      { label: "Melhor para", value: input.audience || "quem quer comprar melhor sem impulso" },
      { label: "Preco bom", value: goodPrice },
      { label: "Atencao", value: "confirmar preco, frete e vendedor" },
      { label: "Veredito", value: "comprar so se fechar a conta" }
    ],
    verdict: {
      score: "8,0",
      summary: `${product} so vira boa compra quando preco, uso e loja confiavel se encontram.`,
      bestFor: [input.audience || "quem quer comprar melhor"],
      avoidIf: ["o preco estiver perto de modelos superiores"]
    },
    offers: [
      {
        title: product,
        marketplace: input.marketplace || "Marketplace",
        originalUrl: input.originalUrl || "",
        affiliateUrl: input.affiliateUrl || "#",
        currentPrice: input.currentPrice || "Ver preco atual",
        regularPrice: input.regularPrice || "",
        label: input.currentPrice ? "Preco checado manualmente" : "Preco para checar",
        seller: input.marketplace || "Marketplace",
        lastCheckedAt: new Date().toISOString().slice(0, 10),
        priceStatus: input.currentPrice ? "real" : "estimate"
      }
    ],
    sections: [
      { heading: "Veredito rapido", body: `${product} precisa ser analisado com calma. Se o preco final fizer sentido, ai a conversa muda.` },
      { heading: "Para quem vale a pena", body: input.audience || "Vale para quem quer comprar com mais contexto e menos impulso." },
      { heading: "O que conferir antes de comprar", body: "Confira preco final, frete, prazo, vendedor, garantia, versao exata e politica de troca." }
    ],
    comparisonTable: {
      columns: ["Opcao", "Melhor para", "Ponto forte", "Atencao"],
      rows: [[product, "uso geral", "avaliar oferta", "confirmar preco final"]]
    },
    faq: [
      { question: `${product} vale a pena?`, answer: `Depende do preco final e do seu uso. ${goodPrice}.` }
    ],
    internalLinks: [],
    sources: sourceObjects(input.sources),
    creativeBrief: `Criar visual limpo para ${product}, com foco em preco final e veredito.`,
    qualityChecklist: {
      factChecked: false,
      proofread: true,
      mobileChecked: true,
      affiliateDisclosureIncluded: true
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

function postJson(path, payload) {
  return requestJson(path, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

function getArticleFromEditor() {
  try {
    return JSON.parse(jsonEditor.value);
  } catch {
    throw new Error("JSON invalido. Chama o Codex ou gere de novo.");
  }
}

function putArticle(article) {
  currentArticle = article;
  jsonEditor.value = JSON.stringify(article, null, 2);
  renderCurrentDraft(article);
}

function draftUrl(article) {
  return `/rascunho/${article.slug}`;
}

function publicUrl(article) {
  return `/p/${article.slug}`;
}

function renderCurrentDraft(article) {
  if (!article?.slug) {
    currentDraft.hidden = true;
    return;
  }
  currentDraft.hidden = false;
  const isPublished = article.status === "published";
  const url = isPublished ? publicUrl(article) : draftUrl(article);
  currentDraft.innerHTML = `
    <h3>${escapeHtml(article.title)}</h3>
    <p>${escapeHtml(article.category || "Tecnologia")} | ${isPublished ? "publicado" : "rascunho"} | ${escapeHtml(article.slug)}</p>
    <div class="current-actions">
      <a class="link-button" href="${url}" target="_blank">${isPublished ? "Abrir post" : "Abrir rascunho"}</a>
      ${isPublished ? "" : `<button type="button" class="danger" data-publish-current="${escapeHtml(article.slug)}">Publicar</button>`}
      <button type="button" class="secondary" data-delete-current="${escapeHtml(article.slug)}">Apagar</button>
    </div>`;
}

async function refreshList() {
  setStatus("Carregando...");
  try {
    const data = await requestJson("/api/veredito/drafts");
    const articles = data.articles || [];
    draftCount.textContent = articles.filter((item) => item.status !== "published").length;
    publishedCount.textContent = articles.filter((item) => item.status === "published").length;
    articleList.innerHTML = articles.length
      ? articles.map(renderArticleItem).join("")
      : "<p>Nenhum rascunho ainda. Cole um link acima e gere o primeiro.</p>";
    setStatus("Pronto");
  } catch (error) {
    articleList.innerHTML = `<p>${error.message}</p>`;
    setStatus("Erro");
  }
}

function renderArticleItem(item) {
  const isPublished = item.status === "published";
  const url = isPublished ? `/p/${item.slug}` : `/rascunho/${item.slug}`;
  return `
    <div class="article-item">
      <div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.category || "Tecnologia")} | ${isPublished ? "publicado" : "rascunho"}</p>
      </div>
      <div class="article-actions">
        <a class="link-button" href="${url}" target="_blank">${isPublished ? "Abrir post" : "Abrir rascunho"}</a>
        <button type="button" class="secondary" data-load="${escapeHtml(item.slug)}">Carregar</button>
        ${isPublished ? "" : `<button type="button" class="danger" data-publish="${escapeHtml(item.slug)}">Publicar</button>`}
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
  setStatus("Carregando...");
  const data = await requestJson(`/api/veredito/article?slug=${encodeURIComponent(slug)}`);
  putArticle(data.article);
  setStatus("Rascunho carregado");
}

async function publishSlug(slug) {
  setStatus("Publicando...");
  const result = await postJson("/api/veredito/publish-slug", { slug });
  putArticle(result.article);
  await refreshList();
  window.open(result.postUrl, "_blank");
  setStatus("Publicado");
}

async function deleteSlug(slug) {
  if (!window.confirm(`Apagar "${slug}"?`)) return;
  setStatus("Apagando...");
  await postJson("/api/veredito/delete", { slug });
  if (currentArticle?.slug === slug) {
    currentArticle = null;
    jsonEditor.value = "";
    currentDraft.hidden = true;
  }
  await refreshList();
  setStatus("Apagado");
}

generateFromUrl.addEventListener("click", async () => {
  const url = sourceUrl.value.trim();
  if (!url) {
    setStatus("Cole um link");
    sourceUrl.focus();
    return;
  }

  const previewTab = window.open("about:blank", "_blank");
  if (previewTab) {
    previewTab.document.write("<p style='font-family:system-ui;padding:24px'>Gerando rascunho...</p>");
  }

  setStatus("Gerando...");
  researchStatus.textContent = "Lendo o link e montando o rascunho. Se o site bloquear, eu ainda tento criar uma previa segura.";

  try {
    const result = await postJson("/api/veredito/generate-from-url", {
      url,
      affiliateUrl: sourceAffiliateUrl.value.trim(),
      angle: sourceAngle.value.trim()
    });
    providerStatus.textContent = result.provider || "online";
    putArticle(result.article);
    await refreshList();
    const urlToOpen = draftUrl(result.article);
    if (previewTab) previewTab.location.href = urlToOpen;
    researchStatus.textContent = "Rascunho pronto. Revise a aba que abriu antes de publicar.";
    setStatus("Rascunho pronto");
  } catch (error) {
    if (previewTab) previewTab.close();
    researchStatus.textContent = "Nao consegui gerar com esse link agora. Tente outro site/produto para testar.";
    setStatus(error.message);
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("Gerando...");
  try {
    const result = await postJson("/api/veredito/generate", { brief: formData() });
    putArticle(result.article);
    await refreshList();
    window.open(draftUrl(result.article), "_blank");
    setStatus("Rascunho gerado");
  } catch (error) {
    const article = buildLocalArticle(formData());
    putArticle(article);
    setStatus(error.message);
  }
});

saveDraft.addEventListener("click", async () => {
  setStatus("Salvando...");
  try {
    const article = getArticleFromEditor();
    const result = await postJson("/api/veredito/preview", { article });
    putArticle(result.article);
    await refreshList();
    setStatus("Rascunho salvo");
  } catch (error) {
    setStatus(error.message);
  }
});

generatePreview.addEventListener("click", async () => {
  try {
    const article = getArticleFromEditor();
    const result = await postJson("/api/veredito/preview", { article });
    putArticle(result.article);
    window.open(result.previewUrl || draftUrl(result.article), "_blank");
    setStatus("Rascunho aberto");
  } catch (error) {
    setStatus(error.message);
  }
});

publishArticle.addEventListener("click", async () => {
  try {
    const article = getArticleFromEditor();
    const result = await postJson("/api/veredito/publish", { article });
    putArticle(result.article);
    await refreshList();
    window.open(result.postUrl, "_blank");
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
  const publishButton = event.target.closest("[data-publish]");
  if (loadButton) loadArticle(loadButton.dataset.load).catch((error) => setStatus(error.message));
  if (deleteButton) deleteSlug(deleteButton.dataset.delete).catch((error) => setStatus(error.message));
  if (publishButton) publishSlug(publishButton.dataset.publish).catch((error) => setStatus(error.message));
});

currentDraft.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-current]");
  const publishButton = event.target.closest("[data-publish-current]");
  if (deleteButton) deleteSlug(deleteButton.dataset.deleteCurrent).catch((error) => setStatus(error.message));
  if (publishButton) publishSlug(publishButton.dataset.publishCurrent).catch((error) => setStatus(error.message));
});

fillExample.addEventListener("click", () => {
  sourceUrl.value = "https://www.apple.com/br/macbook-neo/";
  sourceAffiliateUrl.value = "";
  sourceAngle.value = "vale a pena ou e melhor comparar com MacBook Air?";
  sourceUrl.focus();
  setStatus("Exemplo pronto");
});

async function boot() {
  try {
    const config = await requestJson("/api/veredito/config");
    providerStatus.textContent = config?.site?.brand?.name ? "online" : "online";
  } catch {
    providerStatus.textContent = "parcial";
  }
  refreshList();
}

boot();
