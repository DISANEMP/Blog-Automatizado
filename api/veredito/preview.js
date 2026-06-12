const {
  renderPage,
  slugify
} = require("../../scripts/render-veredito");
const { upsertArticle } = require("../_lib/supabase-admin");

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
    const normalized = normalizeArticle(article, "draft");
    let row = null;
    let storageError = "";
    try {
      row = await upsertArticle(normalized, "draft");
    } catch (error) {
      storageError = error.message;
    }
    const storedArticle = row?.content_json || normalized;
    const html = renderPage(storedArticle, { mode: "preview" });
    res.status(201).json({
      ok: true,
      article: storedArticle,
      record: row,
      html,
      previewUrl: row ? `/rascunho/${row.slug}` : null,
      storage: row ? "supabase" : "browser",
      storageError,
      note: row ? "Preview salvo como rascunho no Supabase." : "Preview gerado sem salvar no Supabase."
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message,
      details: error.details || null
    });
  }
};
