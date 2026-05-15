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
    const row = await getArticleBySlug(slug, true);
    if (!row) {
      res.status(404).send("Rascunho nao encontrado.");
      return;
    }
    const html = renderPage(row.content_json, { mode: "preview" });
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(html);
  } catch (error) {
    res.status(error.statusCode || 500).send(error.message);
  }
};
