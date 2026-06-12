const { generateWithGemini } = require("../_lib/gemini");
const { upsertArticle } = require("../_lib/supabase-admin");
const { renderPage, slugify } = require("../../scripts/render-veredito");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Metodo nao permitido." });
    return;
  }

  try {
    const brief = req.body?.brief || req.body || {};
    const result = await generateWithGemini(brief);
    const article = {
      ...result.article,
      slug: slugify(result.article.slug || result.article.title),
      status: "draft"
    };
    let row = null;
    let storageError = "";
    try {
      row = await upsertArticle(article, "draft");
    } catch (error) {
      storageError = error.message;
    }
    const storedArticle = row?.content_json || article;
    res.status(201).json({
      ok: true,
      provider: result.provider,
      note: result.note,
      storage: row ? "supabase" : "browser",
      storageError,
      article: storedArticle,
      record: row,
      html: renderPage(storedArticle, { mode: "preview" }),
      previewUrl: row ? `/rascunho/${row.slug}` : null
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message,
      details: error.details || null
    });
  }
};
