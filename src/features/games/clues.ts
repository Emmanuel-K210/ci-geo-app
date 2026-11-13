import { ABIDJAN, distanceKm, nearest, YAMOUSSOUKRO, type Ville } from "@/geo"
import { bearing, direction, towards, type Direction } from "@/geo/compass"
import { de, fmtKm, normalize } from "@/lib/format"

export const CLUE_COUNT = 5
export const CLUES_ROUND = 5

export type Clue = { label: string; text: string }

export function cluesFor(target: Ville): Clue[] {
  const reference = target === YAMOUSSOUKRO ? ABIDJAN : YAMOUSSOUKRO
  const [closest] = nearest(target, 1)
  const letters = target.nom.replace(/[^\p{L}]/gu, "").length
  const region = target.region
  // « Région San-Pédro » would give the answer away.
  const named = (name: string) =>
    normalize(name).includes(normalize(target.nom))
  return [
    {
      label: "Distance",
      text: `À ${fmtKm(distanceKm(reference, target))} ${towards(direction(bearing(reference, target)))} ${de(reference.nom)}, à vol d'oiseau.`,
    },
    {
      label: "District",
      text: target.district.autonome
        ? "Elle forme un district autonome à elle seule."
        : named(target.district.nom)
          ? "Son district porte un nom qui contient le sien."
          : `Elle est dans le district ${target.district.nom}.`,
    },
    {
      label: "Région",
      text: !region
        ? "Elle n'appartient à aucune région : c'est l'une des deux villes-districts du pays."
        : named(region.nom)
          ? region.chefLieu === target
            ? "C'est le chef-lieu d'une région qui porte son nom."
            : "Elle est dans une région dont le nom contient le sien."
          : region.chefLieu === target
            ? `C'est le chef-lieu de la région ${region.nom}.`
            : `Elle est dans la région ${region.nom}, dont le chef-lieu est ${region.chefLieu.nom}.`,
    },
    {
      label: "Voisine",
      text: `Sa plus proche voisine est ${closest.ville.nom}, à ${fmtKm(closest.km)}.`,
    },
    {
      label: "Nom",
      text: `Son nom commence par « ${target.nom[0]} » et compte ${letters} lettres.`,
    },
  ]
}

export type Guess = { ville: Ville; km: number; towards: Direction }

/** Where the mystery city is, seen from a wrong guess. */
export function guessFeedback(guess: Ville, target: Ville): Guess {
  return {
    ville: guess,
    km: distanceKm(guess, target),
    towards: direction(bearing(guess, target)),
  }
}

/** 5 points when found on the first clue, one less per wrong guess. */
export const cluePoints = (wrongGuesses: number) =>
  Math.max(0, CLUE_COUNT - wrongGuesses)
