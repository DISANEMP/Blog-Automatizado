const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

function requireSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    const error = new Error("Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Vercel.");
    error.statusCode = 503;
    throw error;
  }
}

async function supabaseFetch(path, options = {}) {
  requireSupabase();
  const response = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error(data?.message || data?.hint || response.statusText);
    error.statusCode = response.status;
    error.details = data;
    throw error;
  }
  return data;
}

function toArticleRow(article, status) {
  const now = new Date().toISOString();
  return {
    title: article.title,
    slug: article.slug,
    type: article.type || "review",
    status,
    category: article.category || "Tecnologia",
    meta_description: article.metaDescription || "",
    excerpt: article.excerpt || "",
    hero_image_url: article.hero?.imageUrl || "",
    hero_image_alt: article.hero?.imageAlt || article.title,
    author: article.author || "Equipe Veredito Tech",
    content_json: article,
    html_path: status === "published" ? `/p/${article.slug}` : null,
    canonical_url: status === "published" ? `/p/${article.slug}` : null,
    published_at: status === "published" ? (article.publishedAt || now) : null,
    updated_at: now
  };
}

async function upsertArticle(article, status = "draft") {
  const rows = await supabaseFetch("articles?on_conflict=slug", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify([toArticleRow(article, status)])
  });
  return rows[0];
}

async function listArticles() {
  return supabaseFetch("articles?select=id,title,slug,type,status,category,updated_at,published_at,html_path&order=updated_at.desc&limit=80", {
    method: "GET"
  });
}

async function getArticleBySlug(slug, includeDraft = false) {
  const statusFilter = includeDraft ? "" : "&status=eq.published";
  const rows = await supabaseFetch(`articles?select=*&slug=eq.${encodeURIComponent(slug)}${statusFilter}&limit=1`, {
    method: "GET"
  });
  return rows[0] || null;
}

async function deleteArticleBySlug(slug) {
  return supabaseFetch(`articles?slug=eq.${encodeURIComponent(slug)}`, {
    method: "DELETE",
    headers: { Prefer: "return=representation" }
  });
}

module.exports = {
  deleteArticleBySlug,
  getArticleBySlug,
  listArticles,
  upsertArticle
};
