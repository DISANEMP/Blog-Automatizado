const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const contentDir = path.join(root, "content");
const postsDir = path.join(root, "posts");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function articleHtml(post) {
  const sections = post.sections
    .map((section) => {
      const paragraphs = section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n");
      return `<h2>${escapeHtml(section.heading)}</h2>\n${paragraphs}`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(post.title)} | Renda Smart</title>
    <meta name="description" content="${escapeHtml(post.description)}" />
    <link rel="stylesheet" href="../styles.css" />
  </head>
  <body>
    <main class="article">
      <p class="eyebrow">${escapeHtml(post.category)}</p>
      <h1>${escapeHtml(post.title)}</h1>
      ${sections}
      <div class="affiliate-box">
        <strong>Recomendação:</strong>
        ${escapeHtml(post.affiliateBox)}
      </div>
      <p><a href="../index.html">Voltar para o blog</a></p>
    </main>
  </body>
</html>`;
}

function loadPosts() {
  return fs
    .readdirSync(contentDir)
    .filter((file) => file.endsWith(".json") && file !== "post-template.json")
    .map((file) => JSON.parse(fs.readFileSync(path.join(contentDir, file), "utf8")));
}

function writeIndexData(posts) {
  const offers = posts.flatMap((post) => post.offers || []);
  const defaultOffers = [
    {
      name: "Planilha de controle financeiro",
      program: "Produto digital",
      description: "Boa isca para capturar leads e recomendar ferramentas complementares.",
      price: "R$ 29,90",
      url: "#"
    },
    {
      name: "Ferramenta de e-mail marketing",
      program: "SaaS",
      description: "Produto com potencial de comissão recorrente e uso real no próprio blog.",
      price: "Recorrente",
      url: "#"
    }
  ];
  const serializedPosts = JSON.stringify(
    posts.map((post) => ({
      title: post.title,
      category: post.category,
      readTime: post.readTime,
      excerpt: post.description,
      image: post.image,
      url: `posts/${post.slug}.html`
    })),
    null,
    2
  );
  const serializedOffers = JSON.stringify(offers.length ? offers : defaultOffers, null, 2);

  fs.writeFileSync(
    path.join(postsDir, "posts.js"),
    `window.posts = ${serializedPosts};\n\nwindow.offers = ${serializedOffers};\n`,
    "utf8"
  );
}

const posts = loadPosts();
if (posts.length === 0) {
  console.log("Nenhum JSON novo em content/. Copie post-template.json, edite e rode npm run generate.");
  process.exit(0);
}

for (const post of posts) {
  fs.writeFileSync(path.join(postsDir, `${post.slug}.html`), articleHtml(post), "utf8");
}

writeIndexData(posts);
console.log(`Gerados ${posts.length} post(s).`);
