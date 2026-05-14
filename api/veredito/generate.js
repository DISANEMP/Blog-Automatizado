const { generateWithGemini } = require("../_lib/gemini");
const { upsertArticle } = require("../_lib/supabase-admin");
const { slugify } = require("../../scripts/render-veredito");

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
    const row = await upsertArticle(article, "draft");
    res.status(201).json({
      ok: true,
      provider: result.provider,
      note: result.note,
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
