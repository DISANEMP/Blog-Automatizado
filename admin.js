const form = document.querySelector("#generatorForm");
const draftList = document.querySelector("#draftList");
const statusBadge = document.querySelector("#statusBadge");

function setStatus(message) {
  statusBadge.textContent = message;
}

function formToJson(formElement) {
  return Object.fromEntries(new FormData(formElement).entries());
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erro inesperado.");
  return data;
}

function renderDraft(draft) {
  const publishedLink =
    draft.status === "published"
      ? `<a href="posts/${draft.slug}.html" target="_blank">Ver publicado</a>`
      : "";
  const button =
    draft.status === "published"
      ? `<span class="published">Publicado</span>`
      : `<button data-publish="${draft.id}">Aprovar e publicar</button>`;
  const sections = draft.sections
    .map((section) => `<h4>${section.heading}</h4><p>${section.body}</p>`)
    .join("");

  return `
    <article class="draft-card">
      <div class="draft-header">
        <div>
          <span class="meta">${draft.category} · ${draft.readTime} · ${draft.status}</span>
          <h3>${draft.title}</h3>
          <p>${draft.excerpt}</p>
        </div>
        <div class="actions">
          ${button}
          ${publishedLink}
        </div>
      </div>
      <div class="draft-body">
        <p><strong>SEO:</strong> ${draft.metaDescription}</p>
        <p><strong>Afiliado:</strong> ${draft.affiliate.marketplace} · ${draft.affiliate.currentPrice}</p>
        <p><strong>Criativo:</strong> ${draft.creativeBrief}</p>
        ${sections}
      </div>
    </article>
  `;
}

async function loadDrafts() {
  const drafts = await api("/api/drafts");
  draftList.innerHTML = drafts.length
    ? drafts.map(renderDraft).join("")
    : `<p class="meta">Nenhum rascunho ainda. Cadastre um produto para gerar a primeira publicação.</p>`;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("Gerando...");
  try {
    await api("/api/generate-draft", {
      method: "POST",
      body: JSON.stringify(formToJson(form))
    });
    form.reset();
    await loadDrafts();
    setStatus("Rascunho criado");
  } catch (error) {
    setStatus(error.message);
  }
});

draftList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-publish]");
  if (!button) return;

  setStatus("Publicando...");
  button.disabled = true;
  try {
    await api("/api/publish", {
      method: "POST",
      body: JSON.stringify({ id: button.dataset.publish })
    });
    await loadDrafts();
    setStatus("Publicado");
  } catch (error) {
    button.disabled = false;
    setStatus(error.message);
  }
});

loadDrafts().catch((error) => setStatus(error.message));
