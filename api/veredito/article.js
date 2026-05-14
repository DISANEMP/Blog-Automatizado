const { getArticleBySlug } = require("../_lib/supabase-admin");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Metodo nao permitido." });
    return;
  }

  try {
    const slug = String(req.query.slug || "").trim();
    if (!slug) {
      res.status(400).json({ error: "Informe slug." });
      return;
    }
    const row = await getArticleBySlug(slug, true);
    if (!row) {
      res.status(404).json({ error: "Artigo nao encontrado." });
      return;
    }
    res.status(200).json({ ok: true, article: row.content_json, record: row });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message,
      details: error.details || null
    });
  }
};
