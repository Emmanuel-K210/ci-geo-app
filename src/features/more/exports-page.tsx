import { Copy, Download } from "lucide-react"
import { useMemo, useState } from "react"

import { Button, PageTitle, Segmented } from "@/components/ui"
import { EXPORTS, type ExportKind } from "@/features/more/exports"
import { copyText, download } from "@/lib/share"

export function ExportsPage() {
  const [kind, setKind] = useState<ExportKind>("csv-villes")
  const text = useMemo(() => EXPORTS[kind].make(), [kind])
  const lines = text.split("\n").length
  const current = EXPORTS[kind]

  return (
    <div className="flex flex-col gap-4">
      <PageTitle eyebrow="Exports" title="Les données dans vos outils" />
      <Segmented
        label="Format"
        value={kind}
        onChange={setKind}
        options={(Object.keys(EXPORTS) as ExportKind[]).map((value) => ({
          value,
          label: EXPORTS[value].label,
        }))}
      />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => download(current.file, text, current.type)}>
          <Download className="size-4" aria-hidden />
          Télécharger {current.file}
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            void copyText(text, `${current.label} copié (${lines} lignes)`)
          }
        >
          <Copy className="size-4" aria-hidden />
          Copier
        </Button>
      </div>
      <textarea
        readOnly
        spellCheck={false}
        value={text}
        aria-label="Aperçu de l'export"
        className="min-h-80 w-full rounded-2xl border border-line bg-surface p-3.5 font-mono text-xs leading-relaxed"
      />
      <p className="text-xs text-muted">
        {lines.toLocaleString("fr-FR")} lignes.
      </p>
    </div>
  )
}
