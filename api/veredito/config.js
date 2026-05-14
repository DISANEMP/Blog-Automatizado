const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

module.exports = function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Metodo nao permitido." });
    return;
  }

  res.status(200).json({
    site: readJson("config/site.config.json"),
    ads: readJson("config/ads.config.json"),
    affiliate: readJson("config/affiliate.config.json"),
    discover: readJson("config/discover.config.json"),
    voice: readJson("config/voice-profile.json")
  });
};
