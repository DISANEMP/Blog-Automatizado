(function () {
  const config = window.VEREDITO_SUPABASE;
  if (!config || !config.url || !config.key) return;

  const endpoint = config.url.replace(/\/$/, "");
  const headers = {
    apikey: config.key,
    Authorization: `Bearer ${config.key}`,
    "Content-Type": "application/json"
  };

  function send(table, payload) {
    fetch(`${endpoint}/rest/v1/${table}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(function () {});
  }

  function basePayload() {
    return {
      page_url: location.href,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent
    };
  }

  send("page_events", {
    event_name: "page_view",
    event_payload: {
      title: document.title,
      path: location.pathname
    },
    ...basePayload()
  });

  document.addEventListener("click", function (event) {
    const link = event.target.closest("a[rel*='sponsored']");
    if (!link) return;
    send("affiliate_clicks", {
      marketplace: link.dataset.marketplace || null,
      target_url: link.href,
      page_url: location.href
    });
  });
})();
