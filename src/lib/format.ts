export const fmtKm = (km: number) =>
  `${Math.round(km).toLocaleString("fr-FR").replace(/ /g, " ")} km`

export const plural = (count: number, word: string, plural = `${word}s`) =>
  `${count} ${count > 1 ? plural : word}`

/** « de Bouaké », « d'Abidjan ». */
export const de = (name: string) =>
  /^[aeiouéèêîâô]/i.test(name) ? `d'${name}` : `de ${name}`

/** Lower case, no accents, words separated by single spaces. */
export const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()

export const coordinates = (point: { lat: number; lon: number }) =>
  `${point.lat.toFixed(2)}° N · ${Math.abs(point.lon).toFixed(2)}° O`
