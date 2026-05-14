const {
  renderPage,
  slugify
} = require("../../scripts/render-veredito");

function normalizeArticle(article, status = "preview") {
  const now = new Date().toISOString();
  const slug = article.slug ? slugify(article.slug) : slugify(article.title || "artigo");
  return {
    ...article,
    slug,
    status,
    updatedDate: now,
    publishDate: article.publishDate || now,
    author: article.author || "Equipe Veredito Tech"
  };
}

module.exports = function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Metodo nao permitido." });
    return;
  }

  const article = req.body && req.body.article;
  if (!article || !article.title) {
    res.status(400).json({ error: "Envie article.title." });
    return;
  }

  const normalized = normalizeArticle(article, "preview");
  const html = renderPage(normalized, { mode: "preview" });
  res.status(201).json({
    ok: true,
    article: normalized,
    html,
    previewUrl: null,
    note: "Preview renderizado em memoria na Vercel."
  });
};
