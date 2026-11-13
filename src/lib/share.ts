import { toast } from "sonner"

export async function copyText(text: string, done = "Copié") {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(done)
    return true
  } catch {
    toast.error("Copie refusée par le navigateur : sélectionnez le texte.")
    return false
  }
}

/** The share sheet on phones, the clipboard elsewhere. */
export async function shareOrCopy(text: string) {
  if (navigator.share) {
    try {
      await navigator.share({ text })
      return
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
    }
  }
  await copyText(text, "Résultat copié : collez-le où vous voulez")
}

export function download(filename: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
