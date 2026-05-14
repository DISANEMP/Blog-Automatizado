const {
  renderPage,
  slugify
} = require("../../scripts/render-veredito");
const { upsertArticle } = require("../_lib/supabase-admin");

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

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Metodo nao permitido." });
    return;
  }

  const article = req.body && req.body.article;
  if (!article || !article.title) {
    res.status(400).json({ error: "Envie article.title." });
    return;
  }

  try {
    const normalized = normalizeArticle(article);
    const row = await upsertArticle(normalized, "published");
    const html = renderPage(row.content_json, { mode: "publish" });
    res.status(200).json({
      ok: true,
      article: row.content_json,
      record: row,
      html,
      postUrl: `/p/${row.slug}`,
      note: "Publicado no Supabase e disponivel em URL publica dinamica."
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message,
      details: error.details || null
    });
  }
};
