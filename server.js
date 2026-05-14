const http = require("http");
const fs = require("fs");
const path = require("path");
const {
  renderPage: renderVereditoPage,
  updatePostsIndex: updateVereditoPostsIndex,
  slugify: vereditoSlugify
} = require("./scripts/render-veredito");

const root = __dirname;

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
    const [key, ...rest] = line.split("=");
    if (!process.env[key]) process.env[key] = rest.join("=").trim();
  }
}

loadEnvLocal();

const port = Number(process.env.PORT || 3100);
const dataDir = path.join(root, "data");
const postsDir = path.join(root, "posts");
const previewsDir = path.join(root, "previews");
const contentDraftsDir = path.join(root, "content", "drafts");
const draftsPath = path.join(dataDir, "drafts.json");
const postsDataPath = path.join(dataDir, "posts.json");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg"
};

function ensureFiles() {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(postsDir, { recursive: true });
  fs.mkdirSync(previewsDir, { recursive: true });
  fs.mkdirSync(contentDraftsDir, { recursive: true });
  if (!fs.existsSync(draftsPath)) fs.writeFileSync(draftsPath, "[]", "utf8");
  if (!fs.existsSync(postsDataPath)) fs.writeFileSync(postsDataPath, "[]", "utf8");
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function readProjectConfig(name) {
  return readJson(path.join(root, "config", name), {});
}

function normalizeVereditoArticle(article, status = "preview") {
  const now = new Date().toISOString();
  const slug = article.slug ? vereditoSlugify(article.slug) : vereditoSlugify(article.title || "artigo");
  return {
    ...article,
    slug,
    status,
    updatedDate: now,
    publishDate: article.publishDate || now,
    author: article.author || readProjectConfig("site.config.json").author?.name || "Equipe Veredito Tech"
  };
}

function saveVereditoDraft(article) {
  const draftPath = path.join(contentDraftsDir, `${article.slug}.json`);
  writeJson(draftPath, article);
  return draftPath;
}

function renderVereditoToFile(article, mode) {
  const html = renderVereditoPage(article, { mode });
  const dir = mode === "publish" ? postsDir : previewsDir;
  const relative = `${mode === "publish" ? "posts" : "previews"}/${article.slug}.html`;
  fs.writeFileSync(path.join(dir, `${article.slug}.html`), html, "utf8");
  if (mode === "publish") updateVereditoPostsIndex(article, relative);
  return relative;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 90);
}

function estimateReadTime(content) {
  const words = content.split(/\s+/).filter(Boolean).length;
  return `${Math.max(4, Math.ceil(words / 180))} min`;
}

function buildDraft(input) {
  const product = input.product.trim();
  const category = input.category.trim() || "Tecnologia";
  const audience = input.audience.trim() || "quem quer comprar tecnologia com bom custo-beneficio";
  const competitors = input.competitors.trim() || "modelos parecidos da mesma faixa de preco";
  const idealPrice = input.idealPrice.trim() || "quando estiver abaixo da media dos concorrentes diretos";
  const affiliateUrl = input.affiliateUrl.trim();
  const marketplace = input.marketplace.trim() || "Marketplace";
  const currentPrice = input.currentPrice.trim() || "Ver preco atual";
  const image = input.image.trim() || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";
  const title = `${product} vale a pena em 2026? Review honesto antes de comprar`;
  const slug = slugify(`${product}-vale-a-pena-2026`);
  const summary = `${product} pode valer a pena para ${audience}, desde que o preco esteja competitivo e as limitacoes facam sentido para o seu uso.`;
  const sections = [
    {
      heading: "Resposta curta",
      body: `${summary} A decisao fica melhor quando voce compara com ${competitors} e olha o preco real no dia da compra.`
    },
    {
      heading: "Veredito rapido",
      body: `O ${product} e uma boa opcao se entregar equilibrio entre desempenho, confiabilidade e preco. Ele nao deve ser tratado como compra automatica: vale comparar camera, bateria, garantia, armazenamento e reputacao do vendedor antes de fechar.`
    },
    {
      heading: "Para quem vale a pena",
      body: `Vale para ${audience}. Tambem faz sentido para quem quer um produto pratico, com boa disponibilidade no Brasil e compra segura em marketplace conhecido.`
    },
    {
      heading: "Para quem nao vale a pena",
      body: `Nao e a melhor escolha para quem precisa do melhor desempenho absoluto, quer pagar sempre o menor preco possivel ou encontrou um concorrente direto com especificacoes superiores por valor parecido.`
    },
    {
      heading: "Pontos positivos",
      body: "Boa intencao de compra, disponibilidade em lojas conhecidas, facilidade de comparacao e potencial para ofertas sazonais. Confirme sempre garantia, vendedor e ficha tecnica antes de recomendar."
    },
    {
      heading: "Pontos negativos",
      body: "O preco pode variar bastante, a ficha tecnica pode mudar por versao e algumas ofertas parecem boas ate incluir frete, prazo ou vendedor sem reputacao forte."
    },
    {
      heading: "Comparativo com concorrentes",
      body: `Compare o ${product} com ${competitors}. Se o concorrente tiver melhor camera, bateria, tela ou garantia pelo mesmo preco, ele pode ser a compra mais racional.`
    },
    {
      heading: "Faixa de preco ideal",
      body: `A compra comeca a fazer mais sentido ${idealPrice}. Evite recomendar com urgencia falsa; prefira dizer quando o preco esta realmente competitivo.`
    },
    {
      heading: "Perguntas frequentes",
      body: `O ${product} e bom para trabalho? Depende do seu uso. E bom para foto ou video? Compare amostras confiaveis e especificacoes. Vale comprar hoje? Vale se o preco atual estiver dentro da faixa ideal e o vendedor for confiavel.`
    },
    {
      heading: "Conclusao",
      body: `O ${product} pode ser uma compra inteligente, mas a recomendacao final depende do preco atual, do perfil de uso e dos concorrentes disponiveis. Para a maioria dos leitores, a melhor decisao e comparar antes de clicar no link de compra.`
    }
  ];
  const articleText = sections.map((section) => `${section.heading}\n${section.body}`).join("\n\n");

  return {
    id: `${Date.now()}`,
    status: "draft",
    createdAt: new Date().toISOString(),
    product,
    category,
    title,
    slug,
    metaDescription: summary.slice(0, 155),
    excerpt: summary,
    image,
    readTime: estimateReadTime(articleText),
    affiliate: {
      originalUrl: input.originalUrl.trim(),
      affiliateUrl,
      marketplace,
      currentPrice,
      estimatedCommission: input.estimatedCommission.trim(),
      note: input.note.trim(),
      lastCheckedAt: new Date().toISOString().slice(0, 10)
    },
    creativeBrief: `Criar card premium comparando ${product} com ${competitors}, destacando melhor uso, preco ideal e veredito honesto. Nao usar imagem protegida sem permissao.`,
    sections
  };
}

function renderArticle(draft) {
  const affiliateCta = draft.affiliate.affiliateUrl
    ? `<a href="${escapeHtml(draft.affiliate.affiliateUrl)}" rel="sponsored nofollow">Ver oferta em ${escapeHtml(draft.affiliate.marketplace)}</a>`
    : "<span>Link de afiliado ainda nao cadastrado.</span>";
  const sections = draft.sections
    .map((section) => `<h2>${escapeHtml(section.heading)}</h2>\n<p>${escapeHtml(section.body)}</p>`)
    .join("\n");

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(draft.title)} | Renda Smart</title>
    <meta name="description" content="${escapeHtml(draft.metaDescription)}" />
    <link rel="stylesheet" href="../styles.css" />
  </head>
  <body>
    <main class="article">
      <p class="eyebrow">${escapeHtml(draft.category)}</p>
      <h1>${escapeHtml(draft.title)}</h1>
      <p>${escapeHtml(draft.excerpt)}</p>
      <div class="affiliate-box">
        <strong>Aviso de afiliado:</strong>
        Este conteudo contem link de afiliado. Podemos receber comissao se voce comprar pelo link, sem custo adicional para voce.
      </div>
      ${sections}
      <div class="affiliate-box">
        <strong>Preco atual:</strong> ${escapeHtml(draft.affiliate.currentPrice)}<br>
        ${affiliateCta}
      </div>
      <p><a href="../index.html">Voltar para o blog</a></p>
    </main>
  </body>
</html>`;
}

function syncPostsJs(posts) {
  const offers = [
    {
      name: "Planilha de controle financeiro",
      program: "Produto digital",
      description: "Boa isca para capturar leads e recomendar ferramentas complementares.",
      price: "R$ 29,90",
      url: "#"
    },
    {
      name: "Curso de produtividade com IA",
      program: "Afiliado",
      description: "Ideal para posts sobre automacao, trabalho remoto e organizacao pessoal.",
      price: "Comissao ate 60%",
      url: "#"
    },
    {
      name: "Ferramenta de e-mail marketing",
      program: "SaaS",
      description: "Produto com potencial de comissao recorrente e uso real no proprio blog.",
      price: "Recorrente",
      url: "#"
    },
    {
      name: "Kit home office custo-beneficio",
      program: "Marketplace",
      description: "Combina com reviews, listas comparativas e guias de compra.",
      price: "Ver preco",
      url: "#"
    }
  ];
  fs.writeFileSync(
    path.join(postsDir, "posts.js"),
    `window.posts = ${JSON.stringify(posts, null, 2)};\n\nwindow.offers = ${JSON.stringify(offers, null, 2)};\n`,
    "utf8"
  );
}

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) req.destroy();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function handleApi(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/veredito/config") {
    sendJson(res, 200, {
      site: readProjectConfig("site.config.json"),
      ads: readProjectConfig("ads.config.json"),
      affiliate: readProjectConfig("affiliate.config.json"),
      discover: readProjectConfig("discover.config.json"),
      voice: readProjectConfig("voice-profile.json")
    });
    return;
  }

  if (req.method === "GET" && pathname === "/api/veredito/drafts") {
    const files = fs
      .readdirSync(contentDraftsDir)
      .filter((file) => file.endsWith(".json"))
      .map((file) => {
        const article = readJson(path.join(contentDraftsDir, file), {});
        return {
          file,
          title: article.title,
          slug: article.slug,
          status: article.status,
          category: article.category,
          updatedDate: article.updatedDate
        };
      });
    sendJson(res, 200, files);
    return;
  }

  if (req.method === "POST" && pathname === "/api/veredito/preview") {
    const input = await readBody(req);
    if (!input.article || !input.article.title) {
      sendJson(res, 400, { error: "Envie article.title." });
      return;
    }
    const article = normalizeVereditoArticle(input.article, "preview");
    saveVereditoDraft(article);
    const relative = renderVereditoToFile(article, "preview");
    sendJson(res, 201, {
      ok: true,
      article,
      draftPath: `content/drafts/${article.slug}.json`,
      previewUrl: `/${relative}`
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/veredito/publish") {
    const input = await readBody(req);
    let article = input.article;
    if (!article && input.slug) {
      article = readJson(path.join(contentDraftsDir, `${vereditoSlugify(input.slug)}.json`), null);
    }
    if (!article || !article.title) {
      sendJson(res, 400, { error: "Envie article ou slug de um rascunho existente." });
      return;
    }
    article = normalizeVereditoArticle(article, "published");
    saveVereditoDraft(article);
    const relative = renderVereditoToFile(article, "publish");
    sendJson(res, 200, {
      ok: true,
      article,
      postUrl: `/${relative}`
    });
    return;
  }

  if (req.method === "GET" && pathname === "/api/drafts") {
    sendJson(res, 200, readJson(draftsPath, []));
    return;
  }

  if (req.method === "GET" && pathname === "/api/posts") {
    sendJson(res, 200, readJson(postsDataPath, []));
    return;
  }

  if (req.method === "POST" && pathname === "/api/generate-draft") {
    const input = await readBody(req);
    if (!input.product || !input.product.trim()) {
      sendJson(res, 400, { error: "Informe o nome do produto." });
      return;
    }
    const drafts = readJson(draftsPath, []);
    const draft = buildDraft(input);
    drafts.unshift(draft);
    writeJson(draftsPath, drafts);
    sendJson(res, 201, draft);
    return;
  }

  if (req.method === "POST" && pathname === "/api/publish") {
    const input = await readBody(req);
    const drafts = readJson(draftsPath, []);
    const draft = drafts.find((item) => item.id === input.id);
    if (!draft) {
      sendJson(res, 404, { error: "Rascunho nao encontrado." });
      return;
    }

    draft.status = "published";
    draft.publishedAt = new Date().toISOString();
    fs.writeFileSync(path.join(postsDir, `${draft.slug}.html`), renderArticle(draft), "utf8");
    writeJson(draftsPath, drafts);

    const posts = readJson(postsDataPath, []);
    const newPost = {
      title: draft.title,
      category: draft.category,
      readTime: draft.readTime,
      excerpt: draft.excerpt,
      image: draft.image,
      url: `posts/${draft.slug}.html`
    };
    const nextPosts = [newPost, ...posts.filter((post) => post.url !== newPost.url)];
    writeJson(postsDataPath, nextPosts);
    syncPostsJs(nextPosts);
    sendJson(res, 200, { ok: true, post: newPost });
    return;
  }

  sendJson(res, 404, { error: "Rota nao encontrada." });
}

function serveStatic(req, res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(root, safePath));
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Arquivo nao encontrado.");
      return;
    }
    res.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath)] || "text/plain; charset=utf-8" });
    res.end(content);
  });
}

ensureFiles();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost:3000");
  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url.pathname);
      return;
    }
    serveStatic(req, res, url.pathname);
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Motor Afiliado Tech IA rodando em http://127.0.0.1:${port}/admin.html`);
});
