const { generateWithGemini } = require("../_lib/gemini");
const { fetchProductPage, googleSearch } = require("../_lib/page-research");
const { upsertArticle } = require("../_lib/supabase-admin");
const { slugify } = require("../../scripts/render-veredito");

function inferFromUrl(sourceUrl) {
  const parsed = new URL(sourceUrl);
  const pathText = decodeURIComponent(parsed.pathname)
    .replace(/\/p\/.*$/i, "")
    .replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const productName = pathText
    ? pathText.split(" ").slice(0, 14).join(" ")
    : parsed.hostname.replace(/^www\./, "");
  return {
    sourceUrl,
    finalUrl: sourceUrl,
    title: productName,
    description: "",
    imageUrl: "",
    productName,
    brand: "",
    sku: "",
    marketplace: parsed.hostname.replace(/^www\./, ""),
    currentPrice: "",
    regularPrice: "",
    availability: "",
    jsonLdTypes: [],
    extractionWarning: "A loja bloqueou ou nao entregou HTML suficiente para extracao automatica."
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Metodo nao permitido." });
    return;
  }

  try {
    const sourceUrl = String(req.body?.url || "").trim();
    const affiliateUrl = String(req.body?.affiliateUrl || sourceUrl).trim();
    const angle = String(req.body?.angle || "vale comprar agora?").trim();
    if (!sourceUrl || !/^https?:\/\//i.test(sourceUrl)) {
      res.status(400).json({ error: "Cole uma URL valida de produto/oferta." });
      return;
    }

    let extracted;
    let extractionError = "";
    try {
      extracted = await fetchProductPage(sourceUrl);
    } catch (error) {
      extractionError = error.message;
      extracted = inferFromUrl(sourceUrl);
    }
    const query = `${extracted.productName || extracted.title} vale a pena comparativo preco`;
    const searchSources = await googleSearch(query);
    const pageSource = {
      name: extracted.marketplace || "Pagina do produto",
      url: extracted.finalUrl || sourceUrl,
      note: "Pagina informada pelo usuario; dados extraidos automaticamente.",
      checkedAt: new Date().toISOString().slice(0, 10)
    };

    const brief = {
      type: "review",
      category: "Tecnologia",
      title: `${extracted.productName || extracted.title} vale a pena?`,
      product: extracted.productName || extracted.title,
      angle,
      audience: req.body?.audience || "quem esta pesquisando antes de comprar e nao quer cair em oferta bonita so no banner",
      goodPrice: req.body?.goodPrice || "quando o preco final, frete e vendedor fecharem a conta",
      marketplace: req.body?.marketplace || extracted.marketplace,
      currentPrice: req.body?.currentPrice || extracted.currentPrice,
      regularPrice: req.body?.regularPrice || extracted.regularPrice,
      affiliateUrl,
      originalUrl: sourceUrl,
      imageUrl: req.body?.imageUrl || extracted.imageUrl,
      competitors: req.body?.competitors || "",
      pros: "",
      cons: "",
      sources: [pageSource, ...searchSources].map((source) => source.url).join("\n"),
      extracted,
      extractionError,
      researchSources: [pageSource, ...searchSources],
      generationMode: "url-first",
      personaInstruction: "Escreva como o dono do projeto: direto, brasileiro, pratico, com analogias simples, humor leve e sem erro proposital. Use frases naturais como 'calma, nao e bem assim', 'o preco final manda' e 'se fizer sentido no bolso e no uso, ai a conversa muda' quando couber.",
      creativeInstruction: "Use a imagem extraida da pagina como imagem autorizada do anuncio quando existir. Se nao existir imagem boa, gere briefing visual proprio em vez de inventar imagem."
    };

    const result = await generateWithGemini(brief);
    const article = {
      ...result.article,
      slug: slugify(result.article.slug || result.article.title),
      status: "draft",
      hero: {
        ...(result.article.hero || {}),
        imageUrl: result.article.hero?.imageUrl || extracted.imageUrl,
        imageAlt: result.article.hero?.imageAlt || extracted.productName || extracted.title
      },
      offers: Array.isArray(result.article.offers) && result.article.offers.length
        ? result.article.offers.map((offer, index) => index === 0 ? {
            ...offer,
            originalUrl: sourceUrl,
            affiliateUrl,
            marketplace: offer.marketplace || extracted.marketplace,
            currentPrice: offer.currentPrice || extracted.currentPrice || "Ver preco atual",
            lastCheckedAt: new Date().toISOString().slice(0, 10),
            priceStatus: extracted.currentPrice || req.body?.currentPrice ? "real" : "estimate"
          } : offer)
        : [{
            title: extracted.productName || extracted.title,
            marketplace: extracted.marketplace,
            originalUrl: sourceUrl,
            affiliateUrl,
            currentPrice: extracted.currentPrice || "Ver preco atual",
            regularPrice: extracted.regularPrice || "",
            label: extracted.currentPrice ? "Preco extraido da pagina" : "Preco para checar",
            seller: extracted.marketplace,
            lastCheckedAt: new Date().toISOString().slice(0, 10),
            priceStatus: extracted.currentPrice ? "real" : "estimate"
          }],
      sources: brief.researchSources
    };

    const row = await upsertArticle(article, "draft");
    res.status(201).json({
      ok: true,
      provider: result.provider,
      note: extractionError ? `${result.note} Extracao direta limitada: ${extractionError}` : result.note,
      extracted,
      extractionError,
      searchSources,
      article: row.content_json,
      record: row
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message,
      details: error.details || null
    });
  }
};
