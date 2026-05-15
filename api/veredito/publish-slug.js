const { getArticleBySlug, upsertArticle } = require("../_lib/supabase-admin");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Metodo nao permitido." });
    return;
  }

  try {
    const slug = String(req.body?.slug || "").trim();
    if (!slug) {
      res.status(400).json({ error: "Informe slug." });
      return;
    }
    const row = await getArticleBySlug(slug, true);
    if (!row) {
      res.status(404).json({ error: "Rascunho nao encontrado." });
      return;
    }
    const article = {
      ...row.content_json,
      status: "published",
      publishedAt: row.content_json.publishedAt || new Date().toISOString()
    };
    const published = await upsertArticle(article, "published");
    res.status(200).json({
      ok: true,
      article: published.content_json,
      record: published,
      postUrl: `/p/${published.slug}`
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message,
      details: error.details || null
    });
  }
};
