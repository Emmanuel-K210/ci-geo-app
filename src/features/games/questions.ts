import { GROUPES, groupeById, PEUPLES } from "@/culture/peuples"
import { SITES } from "@/culture/sites"
import { ABIDJAN, geo, villeById, villes } from "@/geo"
import { pick, shuffle, type Rng } from "@/lib/random"

export type Question = {
  type: string
  text: string
  good: string
  options: string[]
  why: string
}

export const QUIZ_MODES = [
  "tout",
  "cheflieu",
  "region",
  "district",
  "abidjan",
  "quartier",
  "peuples",
  "sites",
] as const
export type QuizMode = (typeof QUIZ_MODES)[number]

const others = (good: string, pool: string[], rng: Rng, count = 3) =>
  shuffle(
    [...new Set(pool)].filter((name) => name !== good),
    rng
  ).slice(0, count)

const regions = geo.regions
const nonAutonomous = geo.districts.filter((district) => !district.autonome)
const abidjanCommunes = ABIDJAN.localites.map((localite) => localite.nom)
const withRegion = villes.filter((ville) => ville.region)
const withQuartiers = villes.filter(
  (ville) => ville !== ABIDJAN && ville.quartiers.length > 0
)

type Generator = { label: string; hint: string; make: (rng: Rng) => Question }

const GENERATORS: Record<Exclude<QuizMode, "tout">, Generator> = {
  cheflieu: {
    label: "Chefs-lieux",
    hint: "Le chef-lieu de chaque région",
    make: (rng) => {
      const region = pick(regions, rng)
      const good = region.chefLieu.nom
      return {
        type: "Chef-lieu",
        text: `Quel est le chef-lieu de la région ${region.nom} ?`,
        good,
        options: [
          good,
          ...others(
            good,
            regions.map((r) => r.chefLieu.nom),
            rng
          ),
        ],
        why: `${good} est le chef-lieu de la région ${region.nom} (district ${region.district.nom}).`,
      }
    },
  },
  region: {
    label: "Régions",
    hint: "Dans quelle région se trouve la ville",
    make: (rng) => {
      const ville = pick(withRegion, rng)
      const good = ville.region!.nom
      return {
        type: "Région",
        text: `Dans quelle région se trouve ${ville.nom} ?`,
        good,
        options: [
          good,
          ...others(
            good,
            regions.map((r) => r.nom),
            rng
          ),
        ],
        why: `${ville.nom} est dans la région ${good}, district ${ville.district.nom}.`,
      }
    },
  },
  district: {
    label: "Districts",
    hint: "Le district de chaque région",
    make: (rng) => {
      const region = pick(regions, rng)
      const good = region.district.nom
      return {
        type: "District",
        text: `À quel district appartient la région ${region.nom} ?`,
        good,
        options: [
          good,
          ...others(
            good,
            nonAutonomous.map((d) => d.nom),
            rng
          ),
        ],
        why: `La région ${region.nom} fait partie du district ${good}.`,
      }
    },
  },
  abidjan: {
    label: "Quartiers d'Abidjan",
    hint: "Dans quelle commune est le quartier",
    make: (rng) => {
      const quartier = pick(ABIDJAN.quartiers, rng)
      const good = quartier.localite.nom
      return {
        type: "Abidjan",
        text: `Dans quelle commune d'Abidjan se trouve le quartier ${quartier.nom} ?`,
        good,
        options: [good, ...others(good, abidjanCommunes, rng)],
        why: `${quartier.nom} est un quartier de ${good}.`,
      }
    },
  },
  quartier: {
    label: "Quartiers des villes",
    hint: "À quelle ville appartient le quartier",
    make: (rng) => {
      const ville = pick(withQuartiers, rng)
      const quartier = pick(ville.quartiers, rng)
      const good = ville.nom
      // A name shared by two cities (« Commerce ») would have two good answers.
      const pool = withQuartiers
        .filter((c) => !c.quartiers.some((q) => q.nom === quartier.nom))
        .map((c) => c.nom)
      return {
        type: "Quartier",
        text: `Le quartier ${quartier.nom} se trouve dans quelle ville ?`,
        good,
        options: [good, ...others(good, pool, rng)],
        why: `${quartier.nom} est un quartier de ${good}.`,
      }
    },
  },
  peuples: {
    label: "Peuples",
    hint: "Qui sont-ils, d'où viennent-ils",
    make: (rng) => {
      const peuple = pick(PEUPLES, rng)
      const groupe = groupeById(peuple.groupeId)!
      if (rng() < 0.35) {
        const good = groupe.nom
        return {
          type: "Peuples",
          text: `À quel grand groupe appartiennent les ${peuple.nom} ?`,
          good,
          options: [
            good,
            ...others(
              good,
              GROUPES.map((g) => g.nom),
              rng
            ),
          ],
          why: `Les ${peuple.nom} font partie du groupe ${good} : ${groupe.aire.toLowerCase()}.`,
        }
      }
      const good = peuple.nom
      return {
        type: "Qui sont-ils ?",
        text: pick(peuple.indices, rng),
        good,
        options: [
          good,
          ...others(
            good,
            PEUPLES.map((p) => p.nom),
            rng
          ),
        ],
        why: `Ce sont les ${good}. ${peuple.resume}`,
      }
    },
  },
  sites: {
    label: "Sites et histoires",
    hint: "Les lieux à visiter et leurs récits",
    make: (rng) => {
      const site = pick(SITES, rng)
      const ville = villeById(`ci-v-${site.ville}`)
      if (ville && rng() < 0.4) {
        const good = ville.nom
        return {
          type: "Sites",
          text: `Près de quelle ville se trouve : ${site.nom} ?`,
          good,
          options: [
            good,
            ...others(
              good,
              villes.map((v) => v.nom),
              rng
            ),
          ],
          why: `${site.nom} : ${site.resume.charAt(0).toLowerCase()}${site.resume.slice(1)} Ville la plus proche : ${good}.`,
        }
      }
      const good = site.nom
      return {
        type: "Quel est ce lieu ?",
        text: pick(site.indices, rng),
        good,
        options: [
          good,
          ...others(
            good,
            SITES.map((s) => s.nom),
            rng
          ),
        ],
        why: `C'est ${good}. ${site.resume}`,
      }
    },
  },
}

export const quizModes: Record<QuizMode, { label: string; hint: string }> = {
  tout: { label: "Tout mélangé", hint: "Toutes les catégories" },
  ...GENERATORS,
}

export function makeQuestion(
  mode: QuizMode,
  previous: string[] = [],
  rng: Rng = Math.random
): Question {
  const generate = () =>
    mode === "tout"
      ? GENERATORS[
          pick(Object.keys(GENERATORS) as Exclude<QuizMode, "tout">[], rng)
        ].make(rng)
      : GENERATORS[mode].make(rng)
  let question = generate()
  for (let tries = 0; tries < 20; tries++) {
    if (
      !previous.includes(question.text) &&
      new Set(question.options).size === 4
    )
      break
    question = generate()
  }
  return { ...question, options: shuffle([...new Set(question.options)], rng) }
}
