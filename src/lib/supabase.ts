import type { SupabaseClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** False when the build has no Supabase project: the app stays local only. */
export const cloudEnabled = !!(url && key)

let client: Promise<SupabaseClient> | null = null

/** The client, loaded on first use so the local-only app stays light. */
export function supabase(): Promise<SupabaseClient> {
  if (!url || !key) return Promise.reject(new Error("Supabase not configured"))
  client ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(url, key, {
      auth: {
        // The magic link comes back as ?code=…, which leaves the hash routes alone.
        flowType: "pkce",
        detectSessionInUrl: true,
        persistSession: true,
        storageKey: "ci-geo-auth",
      },
    })
  )
  return client
}
