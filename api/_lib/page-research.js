function absoluteUrl(value, baseUrl) {
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return value || "";
  }
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function matchMeta(html, key) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${key}["'][^>]*>`, "i")
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeHtml(match[1]);
  }
  return "";
}

function matchTitle(html) {
  const og = matchMeta(html, "og:title");
  if (og) return og;
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return title ? decodeHtml(stripHtml(title[1])) : "";
}

function extractJsonLd(html) {
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const parsed = [];
  for (const block of blocks) {
    try {
      const value = JSON.parse(block[1].trim());
      if (Array.isArray(value)) parsed.push(...value);
      else parsed.push(value);
    } catch {
      // Ignore broken structured data.
    }
  }
  return parsed;
}

function flattenJsonLd(items) {
  const flat = [];
  for (const item of items) {
    if (!item) continue;
    if (Array.isArray(item)) flat.push(...flattenJsonLd(item));
    else if (item["@graph"]) flat.push(...flattenJsonLd(item["@graph"]));
    else flat.push(item);
  }
  return flat;
}

function findProductJsonLd(items) {
  return flattenJsonLd(items).find((item) => {
    const type = item["@type"];
    return Array.isArray(type) ? type.includes("Product") : type === "Product";
  }) || null;
}

function pickImage(product, html, url) {
  const productImage = Array.isArray(product?.image) ? product.image[0] : product?.image;
  const og = matchMeta(html, "og:image") || matchMeta(html, "twitter:image");
  return absoluteUrl(productImage || og || "", url);
}

function pickOffer(product) {
  const offers = Array.isArray(product?.offers) ? product.offers[0] : product?.offers;
  if (!offers) return {};
  return {
    currentPrice: offers.price ? `R$ ${String(offers.price).replace(".", ",")}` : "",
    regularPrice: "",
    marketplace: offers.seller?.name || "",
    availability: offers.availability || "",
    currency: offers.priceCurrency || ""
  };
}

async function fetchProductPage(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 VereditoTechBot/1.0 (+https://veredito.tech)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    },
    redirect: "follow"
  });
  const html = await response.text();
  if (!response.ok) {
    const error = new Error(`Nao consegui ler a pagina (${response.status}).`);
    error.statusCode = response.status;
    throw error;
  }

  const jsonLd = extractJsonLd(html);
  const product = findProductJsonLd(jsonLd);
  const offer = pickOffer(product);
  const title = product?.name || matchTitle(html);
  const description = product?.description || matchMeta(html, "og:description") || matchMeta(html, "description");
  const imageUrl = pickImage(product, html, url);

  return {
    sourceUrl: url,
    finalUrl: response.url,
    title: stripHtml(title).slice(0, 180),
    description: stripHtml(description).slice(0, 600),
    imageUrl,
    productName: stripHtml(product?.name || title).slice(0, 160),
    brand: typeof product?.brand === "string" ? product.brand : product?.brand?.name || "",
    sku: product?.sku || product?.mpn || "",
    marketplace: offer.marketplace || new URL(response.url).hostname.replace(/^www\./, ""),
    currentPrice: offer.currentPrice,
    regularPrice: offer.regularPrice,
    availability: offer.availability,
    jsonLdTypes: flattenJsonLd(jsonLd).map((item) => item["@type"]).filter(Boolean).slice(0, 10)
  };
}

async function googleSearch(query) {
  const key = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;
  if (!key || !cx || !query) return [];

  const params = new URLSearchParams({
    key,
    cx,
    q: query,
    num: "5",
    gl: "br",
    hl: "pt-BR"
  });
  const response = await fetch(`https://www.googleapis.com/customsearch/v1?${params.toString()}`);
  const data = await response.json();
  if (!response.ok) return [];
  return (data.items || []).map((item) => ({
    name: item.title,
    url: item.link,
    note: item.snippet || "Resultado do Google Custom Search.",
    checkedAt: new Date().toISOString().slice(0, 10)
  }));
}

module.exports = {
  fetchProductPage,
  googleSearch
};
