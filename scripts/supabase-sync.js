const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function env(name) {
  return process.env[name] || "";
}

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
    const [key, ...rest] = line.split("=");
    if (!process.env[key]) process.env[key] = rest.join("=").trim();
  }
}

function requireEnv(name) {
  const value = env(name);
  if (!value) throw new Error(`Variavel ausente: ${name}`);
  return value;
}

async function supabaseRequest(table, payload) {
  const url = requireEnv("SUPABASE_URL").replace(/\/$/, "");
  const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
  const publicKey = env("SUPABASE_ANON_KEY") || env("SUPABASE_PUBLISHABLE_KEY");
  const key = serviceKey || publicKey;
  if (!key) throw new Error("Configure SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_ANON_KEY.");
  if (!serviceKey) {
    console.warn("Aviso: usando chave publica/anon. Inserts dependem das policies RLS do Supabase.");
  }
  const response = await fetch(`${url}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase ${response.status}: ${text}`);
  }

  return response.json();
}

function articlePayload(article) {
  return {
    title: article.title,
    slug: article.slug,
    type: article.type,
    status: article.status || "preview",
    category: article.category,
    meta_description: article.metaDescription,
    excerpt: article.excerpt,
    hero_image_url: article.hero?.imageUrl || null,
    hero_image_alt: article.hero?.imageAlt || null,
    author: article.author || "Equipe Veredito Tech",
    content_json: article,
    html_path: article.status === "published" ? `posts/${article.slug}.html` : `previews/${article.slug}.html`,
    canonical_url: `${(env("SITE_URL") || "https://seudominio.com.br").replace(/\/$/, "")}/posts/${article.slug}.html`,
    published_at: article.status === "published" ? new Date().toISOString() : null
  };
}

async function main() {
  loadEnvLocal();
  const inputArg = process.argv[2];
  if (!inputArg) {
    console.error("Uso: node scripts/supabase-sync.js content/drafts/artigo.json");
    process.exit(1);
  }
  const inputPath = path.resolve(root, inputArg);
  const article = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const result = await supabaseRequest("articles", articlePayload(article));
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
