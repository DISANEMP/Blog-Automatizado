const {
  renderPage,
  slugify
} = require("../../scripts/render-veredito");

function normalizeArticle(article) {
  const now = new Date().toISOString();
  const slug = article.slug ? slugify(article.slug) : slugify(article.title || "artigo");
  return {
    ...article,
    slug,
    status: "published",
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

  const normalized = normalizeArticle(article);
  const html = renderPage(normalized, { mode: "preview" });
  res.status(200).json({
    ok: true,
    article: normalized,
    html,
    postUrl: null,
    note: "Publicacao real em producao precisa ser ligada ao GitHub, CMS ou Supabase Storage. Este retorno mostra a pagina aprovada em memoria."
  });
};
