// src/utils/threatIntel.js

const registrars = [
  "NameCheap Inc.",
  "GoDaddy LLC",
  "Cloudflare Registrar",
  "Google Domains",
  "Tucows Domains",
  "Amazon Registrar"
];

const countries = ["US", "IN", "CN", "RU", "DE", "GB", "NL"];

export function generateThreatIntel(url) {
  const seed = url.length * url.charCodeAt(0);

  const registrar = registrars[seed % registrars.length];
  const country = countries[seed % countries.length];

  const year = 2015 + (seed % 9);
  const month = (seed % 12) + 1;
  const day = (seed % 28) + 1;

  const reputation = 40 + (seed % 60); // 40–99
  const darkWebHits = seed % 3 === 0;

  return {
    registrar,
    created: `${year}-${month.toString().padStart(2, "0")}-${day}`,
    country,
    reputation,
    darkWeb: darkWebHits,
  };
}
