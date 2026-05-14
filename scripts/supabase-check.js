const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
    const [key, ...rest] = line.split("=");
    if (!process.env[key]) process.env[key] = rest.join("=").trim();
  }
}

async function main() {
  loadEnvLocal();
  const url = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Configure SUPABASE_URL e SUPABASE_ANON_KEY ou SUPABASE_PUBLISHABLE_KEY.");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  const response = await fetch(`${url}/rest/v1/articles?select=id&limit=1`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`
    },
    signal: controller.signal
  });
  clearTimeout(timeout);

  console.log(`Supabase REST: ${response.status} ${response.statusText}`);
  if (!response.ok) {
    console.log(await response.text());
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
