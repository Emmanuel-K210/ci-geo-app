import { Cloud, CloudOff, LogOut, Mail, RefreshCw } from "lucide-react"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui"
import {
  sendMagicLink,
  signOut,
  syncNow,
  useCloud,
  verifyCode,
} from "@/stores/cloud"

const inputClass =
  "min-h-11 w-full rounded-xl border border-line bg-paper px-3.5 text-[15px] outline-none focus:border-green"

const errorText = (error: unknown) =>
  error instanceof Error ? error.message : "Une erreur est survenue."

function SignIn() {
  const [email, setEmail] = useState("")
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [code, setCode] = useState("")
  const [busy, setBusy] = useState(false)

  async function send(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    try {
      await sendMagicLink(email.trim())
      setSentTo(email.trim())
    } catch (error) {
      toast.error("Envoi impossible", { description: errorText(error) })
    } finally {
      setBusy(false)
    }
  }

  async function verify(event: FormEvent) {
    event.preventDefault()
    if (!sentTo) return
    setBusy(true)
    try {
      await verifyCode(sentTo, code.trim())
      toast.success("Connecté : votre progression est sauvegardée")
    } catch (error) {
      toast.error("Code refusé", { description: errorText(error) })
    } finally {
      setBusy(false)
    }
  }

  if (sentTo)
    return (
      <form onSubmit={verify} className="flex flex-col gap-2.5">
        <p className="text-sm">
          E-mail envoyé à <b>{sentTo}</b>. Touchez le lien qu'il contient, ou
          saisissez ici le code reçu.
        </p>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Code à 6 chiffres</span>
          <input
            className={`${inputClass} font-mono tracking-[0.3em]`}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6,10}"
            required
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={busy}>
            Valider le code
          </Button>
          <Button variant="ghost" onClick={() => setSentTo(null)}>
            Changer d'e-mail
          </Button>
        </div>
      </form>
    )

  return (
    <form onSubmit={send} className="flex flex-col gap-2.5">
      <p className="text-sm text-muted">
        Retrouvez votre progression sur tous vos appareils. Pas de mot de passe
        : un lien de connexion arrive par e-mail.
      </p>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-muted">Adresse e-mail</span>
        <input
          className={inputClass}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <Button type="submit" disabled={busy} className="self-start">
        <Mail className="size-4" aria-hidden />
        Recevoir le lien
      </Button>
    </form>
  )
}

function SignedIn() {
  const { status, email, lastSync, error } = useCloud()
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-sm">
        Connecté avec <b>{email}</b>
      </p>
      <p className="text-xs text-muted" aria-live="polite">
        {status === "syncing"
          ? "Synchronisation…"
          : status === "error"
            ? `Échec de la synchronisation : ${error}`
            : lastSync
              ? `Sauvegardé à ${new Date(lastSync).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
              : "Sauvegarde en attente"}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="ghost"
          disabled={status === "syncing"}
          onClick={() => void syncNow()}
        >
          <RefreshCw className="size-4" aria-hidden />
          Synchroniser
        </Button>
        <Button variant="ghost" onClick={() => void signOut()}>
          <LogOut className="size-4" aria-hidden />
          Se déconnecter
        </Button>
      </div>
    </div>
  )
}

/** Signing in with a magic link keeps the progress in the cloud. */
export function CloudSection() {
  const status = useCloud((state) => state.status)
  const email = useCloud((state) => state.email)
  if (status === "off") return null
  return (
    <section className="flex flex-col gap-3 card p-4">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
        {email ? (
          <Cloud className="size-5 text-green" aria-hidden />
        ) : (
          <CloudOff className="size-5 text-muted" aria-hidden />
        )}
        Sauvegarde
      </h2>
      {status === "loading" ? (
        <p className="text-sm text-muted">Chargement…</p>
      ) : email ? (
        <SignedIn />
      ) : (
        <SignIn />
      )}
    </section>
  )
}
