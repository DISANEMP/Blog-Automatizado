const { buildArticleFromBrief } = require("./article-factory");

function extractJson(text) {
  const cleaned = String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first >= 0 && last > first) return JSON.parse(cleaned.slice(first, last + 1));
  return JSON.parse(cleaned);
}

async function generateWithGemini(brief) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      article: buildArticleFromBrief(brief),
      provider: "local-template",
      note: "GEMINI_API_KEY nao configurada. Usei gerador local."
    };
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const prompt = `Voce e o OrchestratorAgent do Veredito Tech. Gere APENAS JSON valido, sem markdown.

Objetivo: criar um artigo de compra em portugues do Brasil, honesto, util, mobile-first, com SEO, afiliado discreto e tom humano.

Regras:
- nao invente preco como fato; se vier preco no briefing, marque como checado manualmente;
- se faltar fonte, deixe qualityChecklist.factChecked=false;
- evite promessa exagerada e clickbait;
- inclua aviso de afiliado indiretamente no conteudo;
- use a persona do dono: linguagem direta, brasileira, pratica, com analogias simples e humor leve quando ajudar;
- nao imite erro de digitacao; revise ortografia e mantenha cara profissional;
- escreva como consultor de compra, nao como catalogo;
- se o briefing vier de URL, aproveite titulo, imagem, fonte e dados extraidos, mas deixe claro quando preco precisa ser confirmado;
- faca uma leitura mais criativa que o obvio: crie veredito, contexto de uso, cuidado real e comparacao de compra;
- estrutura obrigatoria: title, slug, type, status, category, metaDescription, excerpt, author, hero, shortAnswer, summaryCards, verdict, offers, sections, comparisonTable, faq, internalLinks, sources, creativeBrief, qualityChecklist.

Briefing:
${JSON.stringify(brief, null, 2)}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.45
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    const article = buildArticleFromBrief(brief);
    article.generationWarning = data?.error?.message || "Falha no Gemini; fallback local usado.";
    return { article, provider: "local-template", note: article.generationWarning };
  }

  const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
  const article = extractJson(text);
  return { article, provider: model, note: "Gerado com Gemini." };
}

module.exports = {
  generateWithGemini
};
