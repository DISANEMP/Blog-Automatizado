const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
    const [key, ...rest] = line.split("=");
    if (!process.env[key]) process.env[key] = rest.join("=").trim();
  }
}

loadEnvLocal();

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function paragraphize(text) {
  return String(text || "")
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph.trim())}</p>`)
    .join("\n");
}

function renderVisual(article) {
  const hero = article.hero || {};
  if (hero.imageUrl) {
    return `<img class="hero-image" src="${escapeHtml(hero.imageUrl)}" alt="${escapeHtml(hero.imageAlt || article.title)}">`;
  }
  return `<div class="css-visual"><div><strong>${escapeHtml(article.category || "Veredito Tech")}</strong><span>${escapeHtml(article.creativeBrief || "Visual autoral para compra inteligente")}</span></div></div>`;
}

function renderSummaryCards(cards = []) {
  if (!cards.length) return "";
  return `<section class="summary-strip" aria-label="Resumo do artigo">
${cards.map((card) => `        <div><strong>${escapeHtml(card.label)}</strong><span>${escapeHtml(card.value)}</span></div>`).join("\n")}
      </section>`;
}

function renderAd(label = "Publicidade", note = "Bloco AdSense simulado - ativar quando configurar client id e slots") {
  return `<div class="ad"><strong>${escapeHtml(label)}</strong><small>${escapeHtml(note)}</small></div>`;
}

function renderOffer(offer, disclosure) {
  if (!offer) return "";
  const priceLabel = offer.priceStatus === "simulated" ? "Preco simulado" : "Preco checado";
  const regular = offer.regularPrice ? `<p class="old-price">De: ${escapeHtml(offer.regularPrice)}</p>` : "";
  const coupon = offer.coupon ? `<span class="coupon">CUPOM: ${escapeHtml(offer.coupon)}</span>` : "";
  const url = offer.affiliateUrl || "#";
  return `<section class="offer-card" id="oferta">
          <div>
            <p class="eyebrow" style="color: var(--brand)">${escapeHtml(offer.label || priceLabel)}</p>
            <h2 style="margin-top: 0">${escapeHtml(offer.title)}</h2>
            ${regular}
            <p class="price">${escapeHtml(offer.currentPrice || "Ver preco atual")}</p>
            ${coupon}
            <p>${escapeHtml(offer.marketplace || "Marketplace")} ${offer.lastCheckedAt ? `- checado em ${escapeHtml(offer.lastCheckedAt)}` : ""}</p>
            <p>${escapeHtml(disclosure)}</p>
          </div>
          <a class="btn" href="${escapeHtml(url)}" rel="sponsored nofollow">Clique aqui e veja a oferta</a>
        </section>`;
}

function renderSections(sections = []) {
  return sections
    .map((section) => {
      const list = Array.isArray(section.items) && section.items.length
        ? `<ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
        : "";
      return `<h2>${escapeHtml(section.heading)}</h2>
${paragraphize(section.body)}
${list}`;
    })
    .join("\n");
}

function renderTable(table) {
  if (!table || !Array.isArray(table.columns) || !Array.isArray(table.rows) || !table.rows.length) return "";
  return `<h2 id="comparativo">Comparativo rapido</h2>
        <div class="table-wrap">
          <table>
            <thead><tr>${table.columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr></thead>
            <tbody>
${table.rows.map((row) => `              <tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("\n")}
            </tbody>
          </table>
        </div>`;
}

function renderFaq(faq = []) {
  if (!faq.length) return "";
  return `<h2>Perguntas frequentes</h2>
${faq.map((item) => `<h3>${escapeHtml(item.question)}</h3>\n<p>${escapeHtml(item.answer)}</p>`).join("\n")}`;
}

function renderInternalLinks(links = []) {
  if (!links.length) return "";
  return `<section class="rail-card">
          <h3>Proximas leituras</h3>
          <ul class="mini-list">
${links.map((link) => `            <li><a href="${escapeHtml(link.url)}">${escapeHtml(link.title)}</a></li>`).join("\n")}
          </ul>
        </section>`;
}

function renderSources(sources = []) {
  if (!sources.length) return "";
  return `<div class="source-links">
${sources.map((source) => `        <a href="${escapeHtml(source.url)}">${escapeHtml(source.name)}</a>`).join("\n")}
      </div>`;
}

function renderJsonLd(article, siteConfig) {
  const canonical = `${siteConfig.brand.siteUrl.replace(/\/$/, "")}/posts/${article.slug}.html`;
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    author: {
      "@type": "Organization",
      name: article.author || siteConfig.author.name
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.brand.name
    },
    datePublished: article.publishDate || new Date().toISOString(),
    dateModified: article.updatedDate || new Date().toISOString(),
    mainEntityOfPage: canonical
  };
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

function renderPage(article, options) {
  const siteConfig = readJson("config/site.config.json");
  const affiliateConfig = readJson("config/affiliate.config.json");
  const adsConfig = readJson("config/ads.config.json");
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "";
  const isPreview = options.mode !== "publish";
  const disclosure = affiliateConfig.defaultDisclosure || siteConfig.editorial.defaultDisclosure;
  const offer = Array.isArray(article.offers) ? article.offers[0] : null;
  const hasSimulatedOffer = Array.isArray(article.offers) && article.offers.some((item) => item.priceStatus === "simulated");
  if (!isPreview && hasSimulatedOffer && siteConfig.publishing.allowSimulatedPricesInPublished === false) {
    throw new Error("Publicacao bloqueada: existe preco simulado no artigo.");
  }

  const canonicalPath = isPreview ? `/previews/${article.slug}.html` : `/posts/${article.slug}.html`;
  const canonical = `${siteConfig.brand.siteUrl.replace(/\/$/, "")}${canonicalPath}`;
  const cssHref = isPreview ? "../assets/veredito.css" : "../assets/veredito.css";

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(article.title)} | ${escapeHtml(siteConfig.brand.name)}</title>
    <meta name="description" content="${escapeHtml(article.metaDescription)}">
    <meta name="robots" content="${isPreview ? "noindex," : ""}max-image-preview:large">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <link rel="stylesheet" href="${cssHref}">
    ${renderJsonLd(article, siteConfig)}
  </head>
  <body>
    ${isPreview ? '<div class="preview-note">PREVIA HTML - revise antes de publicar</div>' : ""}
    <header class="site-header">
      <nav class="nav" aria-label="Navegacao principal">
        <a class="logo" href="../index.html"><span class="logo-mark">${escapeHtml(siteConfig.brand.logoText)}</span><span>${escapeHtml(siteConfig.brand.name)}</span></a>
        <div class="nav-links">
          <a href="#resposta">Resposta</a>
          <a href="#oferta">Oferta</a>
          <a href="#comparativo">Comparativo</a>
          <a href="#fontes">Fontes</a>
        </div>
      </nav>
      <section class="hero">
        <div>
          <p class="eyebrow">${escapeHtml(article.hero.eyebrow)}</p>
          <h1>${escapeHtml(article.title)}</h1>
          <p>${escapeHtml(article.hero.subtitle)}</p>
          <div class="hero-actions">
            <a class="btn-light" href="#oferta">${escapeHtml(article.hero.primaryCta || "Ver oferta")}</a>
            <a class="btn-ghost" href="#resposta">${escapeHtml(article.hero.secondaryCta || "Ler veredito")}</a>
          </div>
        </div>
        <div class="visual-card">${renderVisual(article)}</div>
      </section>
      ${renderSummaryCards(article.summaryCards)}
    </header>
    <main class="shell">
      <article class="article">
        <div class="notice"><strong>Transparencia:</strong> ${escapeHtml(disclosure)} ${escapeHtml(siteConfig.editorial.reviewMethodDisclosure)}</div>
        <section class="answer" id="resposta"><strong>${escapeHtml(article.shortAnswer.label)}</strong>${escapeHtml(article.shortAnswer.text)}</section>
        ${renderAd("Publicidade", adsConfig.enabled ? "Espaco AdSense configurado" : "Bloco AdSense simulado - ative em config/ads.config.json")}
        ${renderSections(article.sections)}
        ${renderOffer(offer, disclosure)}
        ${renderTable(article.comparisonTable)}
        ${renderFaq(article.faq)}
      </article>
      <aside class="rail">
        <section class="rail-card">
          <span class="score">${escapeHtml(article.verdict?.score || "Guia")}</span>
          <h3>Veredito rapido</h3>
          <p>${escapeHtml(article.verdict?.summary || article.excerpt || article.shortAnswer.text)}</p>
        </section>
        <section class="rail-card group-card">
          <h3>Receba ofertas verificadas</h3>
          <p>Canal para alertas com preco, cupom, frete, vendedor e data da checagem.</p>
          <div class="group-actions"><a class="btn-light" href="#">WhatsApp</a><a class="btn-light" href="#">Telegram</a></div>
        </section>
        ${renderInternalLinks(article.internalLinks)}
        <section class="rail-card">
          <h3>Anuncio lateral</h3>
          ${renderAd("AdSense 300x250", adsConfig.enabled ? "Slot lateral configurado" : "simulado")}
        </section>
      </aside>
    </main>
    <footer class="footer" id="fontes">
      <p>${escapeHtml(article.sources?.length ? "Fontes consultadas e registradas para revisao editorial." : "Adicionar fontes antes de publicar.")}</p>
      ${renderSources(article.sources)}
    </footer>
    ${supabaseUrl && supabaseKey ? `<script>window.VEREDITO_SUPABASE={url:${JSON.stringify(supabaseUrl)},key:${JSON.stringify(supabaseKey)}};</script><script src="../assets/veredito-tracking.js"></script>` : ""}
  </body>
</html>`;
}

function updatePostsIndex(article, outputPath) {
  const postsPath = path.join(root, "data", "posts.json");
  const posts = fs.existsSync(postsPath) ? JSON.parse(fs.readFileSync(postsPath, "utf8")) : [];
  const post = {
    title: article.title,
    category: article.category,
    readTime: article.readTime || "6 min",
    excerpt: article.excerpt || article.metaDescription,
    image: article.hero?.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    url: outputPath.replace(/\\/g, "/")
  };
  const nextPosts = [post, ...posts.filter((item) => item.url !== post.url)];
  fs.writeFileSync(postsPath, `${JSON.stringify(nextPosts, null, 2)}\n`, "utf8");
  fs.writeFileSync(path.join(root, "posts", "posts.js"), `window.posts = ${JSON.stringify(nextPosts, null, 2)};\n\nwindow.offers = window.offers || [];\n`, "utf8");
}

function main() {
  const inputArg = process.argv[2];
  const mode = process.argv.includes("--publish") ? "publish" : "preview";
  if (!inputArg) {
    console.error("Uso: node scripts/render-veredito.js content/drafts/artigo.json [--publish]");
    process.exit(1);
  }
  const inputPath = path.resolve(root, inputArg);
  const article = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  article.slug = article.slug || slugify(article.title);
  const html = renderPage(article, { mode });
  const outputDir = mode === "publish" ? "posts" : "previews";
  const outputPath = path.join(outputDir, `${article.slug}.html`);
  fs.mkdirSync(path.join(root, outputDir), { recursive: true });
  fs.writeFileSync(path.join(root, outputPath), html, "utf8");
  if (mode === "publish") updatePostsIndex(article, outputPath);
  console.log(`${mode === "publish" ? "Publicado" : "Previa gerada"}: ${outputPath}`);
}

if (require.main === module) {
  main();
}

module.exports = {
  renderPage,
  updatePostsIndex,
  slugify
};
