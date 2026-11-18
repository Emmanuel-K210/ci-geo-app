// Data and map for the generated videos: the app's reference (ci-geo.json),
// the district outlines (shapes.json, geoBoundaries CC BY 4.0) and the
// Découvrir texts (culture.json, written by render.mjs from src/culture).
;(() => {
  const B = { west: -8.75, east: -2.35, south: 4.15, north: 10.85 }
  const KX = Math.cos((7.5 * Math.PI) / 180)
  const W = 560
  const H = Math.round((W * (B.north - B.south)) / ((B.east - B.west) * KX))
  const px = (lon) => ((lon - B.west) / (B.east - B.west)) * W
  const py = (lat) => ((B.north - lat) / (B.north - B.south)) * H
  window.MAP = { W, H, px, py }

  const json = (file) => fetch(file).then((r) => r.json())
  window.DATA = Promise.all([
    json("ci-geo.json"),
    json("shapes.json"),
    json("culture.json"),
  ]).then(([geo, shapes, culture]) => {
    const districts = new Map(geo.districts.map((d) => [d.id, d]))
    const regions = new Map(geo.regions.map((r) => [r.id, r]))
    const villes = geo.villes.map((v) => ({
      ...v,
      district: districts.get(v.districtId),
      region: v.regionId ? regions.get(v.regionId) : null,
    }))
    for (const r of geo.regions)
      r.chefLieu = villes.find((v) => v.id === r.chefLieuVilleId)
    return { geo, shapes, culture, villes, districts, regions }
  })

  /** Params of the page URL. */
  window.PARAMS = new URLSearchParams(location.search)

  const SVG = "http://www.w3.org/2000/svg"
  const el = (name, attrs = {}) => {
    const node = document.createElementNS(SVG, name)
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v)
    return node
  }
  window.svgEl = el

  /** Draws the country into an <svg>; returns the layer to add marks to. */
  window.drawMap = (svg, data, { tint = "light" } = {}) => {
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`)
    const dark = tint === "dark"
    const path = (rings) =>
      rings
        .map(
          (ring) =>
            `M${ring.map(([lon, lat]) => `${px(lon).toFixed(1)},${py(lat).toFixed(1)}`).join("L")}Z`
        )
        .join("")
    svg.append(
      el("polyline", {
        points: data.shapes.coast
          .map(([lon, lat]) => `${px(lon)},${py(lat) + 8}`)
          .join(" "),
        fill: "none",
        stroke: dark ? "#2d566a" : "#9cc3d6",
        "stroke-width": 6,
        "stroke-dasharray": "2 8",
        "stroke-linecap": "round",
      })
    )
    const edge = el("g")
    const fill = el("g")
    for (const [id, rings] of Object.entries(data.shapes.districts)) {
      const d = path(rings)
      edge.append(
        el("path", {
          d,
          fill: dark ? "#213229" : "#dfe8df",
          stroke: dark ? "#4cc28b" : "#0b7a4b",
          "stroke-width": 5,
          "stroke-linejoin": "round",
        })
      )
      fill.append(
        el("path", {
          d,
          "data-district": id,
          fill: dark ? "#213229" : "#dfe8df",
          stroke: dark ? "rgba(76,194,139,.35)" : "rgba(11,122,75,.35)",
          "stroke-width": 1,
          "stroke-linejoin": "round",
        })
      )
    }
    svg.append(edge, fill)
    const marks = el("g")
    svg.append(marks)
    return marks
  }

  /** Great-circle distance in km, as in the app. */
  window.distanceKm = (a, b) => {
    const rad = (d) => (d * Math.PI) / 180
    const h =
      Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
      Math.cos(rad(a.lat)) *
        Math.cos(rad(b.lat)) *
        Math.sin(rad(b.lon - a.lon) / 2) ** 2
    return 2 * 6371 * Math.asin(Math.sqrt(h))
  }

  /** mulberry32, as lib/random.ts. */
  window.seededRng = (seed) => {
    let state = seed >>> 0
    return () => {
      state = (state + 0x6d2b79f5) >>> 0
      let t = state
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }
  window.shuffle = (list, rng) => {
    const copy = [...list]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }

  /** « de Bouaké », « d'Abidjan ». */
  window.de = (name) =>
    /^[aeiouéèêîâô]/i.test(name) ? `d'${name}` : `de ${name}`

  /** The end card shared by every video. */
  window.endCard = (from, line) => `
    <div data-in="${from}" data-fadein="0.3" class="layer dark">
      <div class="bar"><div class="flag"><span></span><span></span><span></span></div></div>
      <div class="layer center">
        <div data-in="${from + 0.2}" data-fx="zoom" class="logo" style="font-size: 110px">
          <svg viewBox="0 0 34 34" aria-hidden="true"><path d="M17 3c-6 0-10.5 4.6-10.5 10.3C6.5 21 17 31 17 31s10.5-10 10.5-17.7C27.5 7.6 23 3 17 3Z" fill="#e0680a"/><circle cx="17" cy="13.3" r="4" fill="#fff"/></svg>
          CI-Geo
        </div>
        <span data-in="${from + 0.6}" data-fx="pop" class="badge">${line}</span>
        <p data-in="${from + 1}" data-fx="up" class="url">ci-geo-app.vercel.app</p>
        <p data-in="${from + 1.3}" data-fx="fade" style="margin: 0; font-size: 38px; color: #9db0a5">Gratuit · sans inscription</p>
      </div>
    </div>`
})()
