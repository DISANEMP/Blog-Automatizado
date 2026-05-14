const postGrid = document.querySelector("#postGrid");
const offerList = document.querySelector("#offerList");
const searchInput = document.querySelector("#searchInput");
const searchForm = document.querySelector(".search");

function renderPosts(filter = "") {
  const normalized = filter.trim().toLowerCase();
  const posts = window.posts.filter((post) => {
    return [post.title, post.excerpt, post.category].join(" ").toLowerCase().includes(normalized);
  });

  postGrid.innerHTML = posts
    .map(
      (post) => `
        <article class="post-card">
          <img src="${post.image}" alt="${post.title}">
          <div>
            <span class="post-meta">${post.category} · ${post.readTime}</span>
            <h3>${post.title}</h3>
            <p>${post.excerpt}</p>
            <a href="${post.url}">Ler análise</a>
          </div>
        </article>
      `
    )
    .join("");
}

function renderOffers() {
  offerList.innerHTML = window.offers
    .map(
      (offer) => `
        <article class="offer-card">
          <span class="post-meta">${offer.program}</span>
          <h3>${offer.name}</h3>
          <p>${offer.description}</p>
          <p class="price">${offer.price}</p>
          <a href="${offer.url}" rel="sponsored nofollow">Ver oferta</a>
        </article>
      `
    )
    .join("");
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  renderPosts(searchInput.value);
});

searchInput.addEventListener("input", () => renderPosts(searchInput.value));

renderPosts();
renderOffers();
