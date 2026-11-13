import { Link } from "@tanstack/react-router"
import {
  BarChart3,
  ChevronRight,
  Download,
  ListTree,
  MousePointerClick,
} from "lucide-react"

import { PageTitle } from "@/components/ui"
import { rawData } from "@/geo"

const LINKS = [
  {
    to: "/plus/liste",
    title: "Liste",
    text: "Districts, régions, villes et quartiers en arbre.",
    icon: ListTree,
  },
  {
    to: "/plus/statistiques",
    title: "Statistiques",
    text: "Ce que contient le référentiel.",
    icon: BarChart3,
  },
  {
    to: "/plus/exports",
    title: "Exports",
    text: "CSV, SQL PostgreSQL et JSON.",
    icon: Download,
  },
  {
    to: "/plus/selecteur",
    title: "Sélecteur",
    text: "Ville, commune puis quartier : la démo du formulaire.",
    icon: MousePointerClick,
  },
] as const

export function MorePage() {
  return (
    <div className="flex flex-col gap-4">
      <PageTitle eyebrow="Plus" title="Le référentiel" />
      <div className="flex flex-col card px-4">
        {LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="flex min-h-16 items-center gap-3 border-b border-line last:border-0"
          >
            <link.icon className="size-5 text-green" aria-hidden />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="font-medium">{link.title}</span>
              <span className="text-[13px] text-muted">{link.text}</span>
            </span>
            <ChevronRight className="size-5 text-muted" aria-hidden />
          </Link>
        ))}
      </div>
      <section className="flex flex-col gap-2 card p-4 text-sm">
        <h2 className="font-display text-lg font-semibold">
          À propos des données
        </h2>
        <p>
          Version {rawData.version} : {rawData.districts.length} districts,{" "}
          {rawData.regions.length} régions, {rawData.villes.length} villes,{" "}
          {rawData.localites.length} localités et {rawData.quartiers.length}{" "}
          quartiers.
        </p>
        <p className="text-muted">
          Le découpage administratif est complet ; les quartiers ne le sont pas.
          Les coordonnées sont celles des centres-villes, arrondies à environ 1
          km, et le contour du pays est simplifié : à vérifier avant un usage de
          précision.
        </p>
        <p className="text-muted">
          Les récits de « Découvrir » sont des résumés à vocation de découverte
          ; chacun renvoie à son article Wikipédia. Les photos viennent de
          Wikimedia Commons, avec le nom de leur auteur et leur licence.
        </p>
      </section>
    </div>
  )
}
