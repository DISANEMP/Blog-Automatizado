const { listArticles } = require("../_lib/supabase-admin");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Metodo nao permitido." });
    return;
  }

  try {
    const articles = await listArticles();
    res.status(200).json({ ok: true, articles });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message,
      details: error.details || null
    });
  }
};
