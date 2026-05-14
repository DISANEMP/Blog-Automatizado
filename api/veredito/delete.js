const { deleteArticleBySlug } = require("../_lib/supabase-admin");

module.exports = async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "DELETE") {
    res.status(405).json({ error: "Metodo nao permitido." });
    return;
  }

  try {
    const slug = String(req.body?.slug || req.query.slug || "").trim();
    if (!slug) {
      res.status(400).json({ error: "Informe slug." });
      return;
    }
    const deleted = await deleteArticleBySlug(slug);
    res.status(200).json({ ok: true, deleted });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message,
      details: error.details || null
    });
  }
};
