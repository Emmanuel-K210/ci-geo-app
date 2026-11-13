// Writes the poster pages into marketing/posters/. Each poster shows the real
// app in phone frames (iframes of the built app, same origin as the poster).
import { writeFileSync } from "node:fs"

const out = (name) => new URL(`posters/${name}.html`, import.meta.url)

const PIN = `<svg viewBox="0 0 34 34" aria-hidden="true"><path d="M17 3c-6 0-10.5 4.6-10.5 10.3C6.5 21 17 31 17 31s10.5-10 10.5-17.7C27.5 7.6 23 3 17 3Z" fill="#e0680a"/><circle cx="17" cy="13.3" r="4" fill="#fff"/></svg>`
const FLAG = (height) =>
  `<div style="position:absolute;inset:0 0 auto 0;height:${height}px"><div class="flag"><span></span><span></span><span></span></div></div>`
const CREDIT_MAP =
  "Limites des districts : geoBoundaries (Banque mondiale, CC BY 4.0)"
const CREDIT_PHOTOS = "Photos : Wikimedia Commons"

/** A phone at (left, top), `width` wide, showing `route` of the app. */
function phone(left, top, width, route, rotate = 0) {
  const scale = ((width * 0.94) / 390).toFixed(4)
  return `<div class="phone" style="left:${left}px;top:${top}px;--w:${width}px;--s:${scale};transform:rotate(${rotate}deg)"><div class="screen"><iframe src="/#${route}" scrolling="no"></iframe></div></div>`
}

function page(title, width, height, body) {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${title}</title>
<link rel="stylesheet" href="poster.css">
<script src="demo.js"></script>
<style>body{width:${width}px;height:${height}px}</style>
</head>
<body>
${body}
</body>
</html>
`
}

const POSTERS = {
  // LinkedIn, link or landscape image post.
  "linkedin-1200x627": page(
    "LinkedIn paysage",
    1200,
    627,
    `${FLAG(8)}
<img class="map" src="carte.svg" style="right:-60px;top:20px;width:620px;opacity:.55" alt="">
<div style="position:absolute;left:64px;top:52px;width:610px;display:flex;flex-direction:column;gap:20px">
  <div class="logo" style="font-size:30px">${PIN} CI-Geo</div>
  <p class="eyebrow" style="font-size:15px">Nouvelle application · gratuite</p>
  <h1 class="display" style="font-size:54px">La Côte d'Ivoire, <span class="accent">ville par ville,</span> peuple par peuple.</h1>
  <p style="margin:0;font-size:20px;line-height:1.45;color:var(--muted)">Un atlas des 14 districts, les récits des peuples et des sites, et 10 jeux pour apprendre la géographie du pays en s'amusant.</p>
  <div class="chips" style="font-size:16px"><span class="chip"><b>46</b> villes</span><span class="chip"><b>16</b> peuples</span><span class="chip"><b>15</b> sites</span><span class="chip"><b>10</b> jeux</span></div>
</div>
${phone(745, 66, 236, "/", -6)}
${phone(945, 112, 236, "/decouvrir/sites/tai", 5)}
<p class="credit" style="left:64px;bottom:12px">${CREDIT_MAP} · ${CREDIT_PHOTOS}</p>`
  ),

  // LinkedIn, portrait feed image (the most visible format in the feed).
  "linkedin-1080x1350": page(
    "LinkedIn portrait",
    1080,
    1350,
    `${FLAG(12)}
<div style="position:absolute;left:80px;top:76px;right:80px;display:flex;flex-direction:column;gap:22px">
  <div class="logo" style="font-size:36px">${PIN} CI-Geo</div>
  <h1 class="display" style="font-size:76px">Connaissez-vous vraiment <span class="accent">la Côte d'Ivoire&nbsp;?</span></h1>
  <p style="margin:0;font-size:26px;line-height:1.45;color:var(--muted);max-width:840px">Atlas, histoire des peuples, sites à visiter et jeux de géographie : une application gratuite, pensée pour le téléphone.</p>
</div>
<img class="map" src="carte.svg" style="left:290px;top:470px;width:700px;opacity:.5" alt="">
${phone(60, 560, 290, "/atlas?ville=ci-v-korhogo", -5)}
${phone(395, 515, 290, "/", 0)}
${phone(730, 560, 290, "/decouvrir/sites", 5)}
<div style="position:absolute;left:80px;right:80px;bottom:58px;display:flex;align-items:center;justify-content:space-between;gap:20px">
  <div class="chips" style="font-size:22px"><span class="chip"><b>14</b> districts</span><span class="chip"><b>16</b> peuples</span><span class="chip"><b>10</b> jeux</span></div>
  <span class="cta" style="font-size:26px">Gratuit · sans inscription</span>
</div>
<p class="credit" style="left:80px;bottom:18px">${CREDIT_MAP} · ${CREDIT_PHOTOS}</p>`
  ),

  // WhatsApp status: the daily challenge.
  "whatsapp-statut-defi-1080x1920": page(
    "WhatsApp statut défi",
    1080,
    1920,
    `<div style="position:absolute;inset:0;background:radial-gradient(circle at 85% 12%, rgba(224,104,10,.22), transparent 45%),radial-gradient(circle at 10% 90%, rgba(11,122,75,.18), transparent 45%)"></div>
${FLAG(14)}
<div style="position:absolute;left:80px;right:80px;top:110px;display:flex;flex-direction:column;gap:26px;align-items:flex-start">
  <div class="logo" style="font-size:40px">${PIN} CI-Geo</div>
  <h1 class="display" style="font-size:104px">Tu connais vraiment <span class="accent">ton pays&nbsp;?</span></h1>
  <p style="margin:0;font-size:34px;line-height:1.4;color:var(--muted)">Chaque jour, 5 villes à placer sur la carte. Le même défi pour tout le monde. Partage ton score 🟩🟨🟧</p>
</div>
${phone(310, 690, 460, "/", 0)}
<div style="position:absolute;left:0;right:0;bottom:64px;display:flex;flex-direction:column;align-items:center;gap:18px">
  <span class="cta" style="font-size:40px;box-shadow:0 20px 40px -18px rgba(224,104,10,.8)">Relève le défi du jour</span>
  <p style="margin:0;font-size:26px;color:var(--muted)">Gratuit · sans inscription · sur ton téléphone</p>
</div>`
  ),

  // WhatsApp status: peoples and sites.
  "whatsapp-statut-recits-1080x1920": page(
    "WhatsApp statut récits",
    1080,
    1920,
    `<div style="position:absolute;inset:0;background:#17241e"></div>
<img class="map" src="carte.svg" style="left:-120px;top:980px;width:900px;opacity:.16" alt="">
${FLAG(14)}
<div style="position:absolute;left:80px;right:80px;top:110px;display:flex;flex-direction:column;gap:26px;color:#eef2ee">
  <div class="logo" style="font-size:40px">${PIN} CI-Geo</div>
  <p class="eyebrow" style="font-size:26px;color:#4cc28b">Découvrir</p>
  <h1 class="display" style="font-size:90px">Abla Pokou, Kong, Grand-Bassam… <span class="accent">les histoires</span> derrière les lieux.</h1>
  <p style="margin:0;font-size:32px;line-height:1.4;opacity:.8">16 peuples, leurs origines et leurs traditions. 15 sites à visiter, avec leur récit et leurs photos.</p>
</div>
${phone(100, 800, 400, "/decouvrir/peuples/baoule", -5)}
${phone(580, 850, 400, "/decouvrir/sites/grand-bassam", 5)}
<div style="position:absolute;left:0;right:0;bottom:56px;display:flex;flex-direction:column;align-items:center;gap:16px">
  <span class="cta" style="font-size:38px;box-shadow:0 20px 40px -18px rgba(0,0,0,.7)">Lis le récit du jour</span>
  <p style="margin:0;font-size:22px;color:#9db0a5">${CREDIT_PHOTOS} · Limites : geoBoundaries (CC BY 4.0)</p>
</div>`
  ),

  // Square: WhatsApp groups, Facebook, Instagram.
  "carre-1080x1080": page(
    "Carré",
    1080,
    1080,
    `${FLAG(12)}
<img class="map" src="carte.svg" style="right:-60px;top:120px;width:620px;opacity:.6" alt="">
<div style="position:absolute;left:72px;top:76px;width:540px;display:flex;flex-direction:column;gap:26px">
  <div class="logo" style="font-size:36px">${PIN} CI-Geo</div>
  <h1 class="display" style="font-size:72px">Apprends la Côte d'Ivoire <span class="accent">en jouant.</span></h1>
  <ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:14px;font-size:26px;font-weight:600">
    <li>📍 Les 14 districts sur une vraie carte</li>
    <li>📖 L'histoire des peuples et des sites</li>
    <li>🎮 10 jeux, un défi chaque jour</li>
    <li>🏆 Niveaux, badges et duels entre amis</li>
  </ul>
  <span class="cta" style="font-size:30px;align-self:flex-start">Gratuit · sans inscription</span>
</div>
${phone(665, 300, 320, "/jeux", 4)}
<p class="credit" style="left:72px;bottom:20px">${CREDIT_MAP}</p>`
  ),
}

for (const [name, html] of Object.entries(POSTERS))
  writeFileSync(out(name), html)
console.log(Object.keys(POSTERS).join("\n"))
