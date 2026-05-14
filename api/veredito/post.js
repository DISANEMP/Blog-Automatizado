const { getArticleBySlug } = require("../_lib/supabase-admin");
const { renderPage } = require("../../scripts/render-veredito");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).send("Metodo nao permitido.");
    return;
  }

  try {
    const slug = String(req.query.slug || "").replace(/\.html$/, "").trim();
    if (!slug) {
      res.status(400).send("Informe slug.");
      return;
    }
    const row = await getArticleBySlug(slug, false);
    if (!row) {
      res.status(404).send("Artigo nao encontrado ou ainda nao publicado.");
      return;
    }
    const html = renderPage(row.content_json, { mode: "publish" });
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=86400");
    res.status(200).send(html);
  } catch (error) {
    res.status(error.statusCode || 500).send(error.message);
  }
};
