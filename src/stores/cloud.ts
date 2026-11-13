import type { Session, SupabaseClient } from "@supabase/supabase-js"
import { create } from "zustand"

import { cloudEnabled, supabase } from "@/lib/supabase"
import { mergeProgress } from "@/stores/merge-progress"
import { progressData, useProgress, type ProgressData } from "@/stores/progress"

export type CloudStatus =
  "off" | "loading" | "signed-out" | "syncing" | "synced" | "error"

type CloudState = {
  status: CloudStatus
  email: string | null
  lastSync: string | null
  error: string | null
}

export const useCloud = create<CloudState>()(() => ({
  status: cloudEnabled ? "loading" : "off",
  email: null,
  lastSync: null,
  error: null,
}))

let userId: string | null = null
let applyingRemote = false
let pushTimer: ReturnType<typeof setTimeout> | undefined

const PUSH_DELAY_MS = 3000

/** Settings stay on the device: the cloud keeps the rest. */
function saved(state: ProgressData): Omit<ProgressData, "settings"> {
  const { settings: _settings, ...rest } = progressData(state)
  return rest
}

function failed(error: unknown) {
  useCloud.setState({
    status: "error",
    error: error instanceof Error ? error.message : String(error),
  })
}

async function push(client: SupabaseClient) {
  if (!userId) return
  useCloud.setState({ status: "syncing" })
  const { error } = await client.from("progress").upsert({
    user_id: userId,
    data: saved(useProgress.getState()),
    updated_at: new Date().toISOString(),
  })
  if (error) return failed(error)
  useCloud.setState({
    status: "synced",
    lastSync: new Date().toISOString(),
    error: null,
  })
}

/** Fetches the account's save, merges it with this device's, saves both. */
async function pullAndMerge(client: SupabaseClient) {
  if (!userId) return
  useCloud.setState({ status: "syncing" })
  const { data, error } = await client
    .from("progress")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle()
  if (error) return failed(error)
  if (data?.data) {
    applyingRemote = true
    useProgress.setState(
      mergeProgress(
        progressData(useProgress.getState()),
        data.data as Partial<ProgressData>
      )
    )
    applyingRemote = false
  }
  await push(client)
}

function onSession(client: SupabaseClient, session: Session | null) {
  const next = session?.user.id ?? null
  if (next === userId) return
  userId = next
  if (!session) {
    useCloud.setState({ status: "signed-out", email: null, lastSync: null })
    return
  }
  useCloud.setState({ email: session.user.email ?? null })
  void pullAndMerge(client)
}

let started = false

/** Connects the save to the account, if the build has a Supabase project. */
export function startCloud() {
  if (!cloudEnabled || started) return
  started = true
  void supabase()
    .then(async (client) => {
      client.auth.onAuthStateChange((_event, session) => {
        // Supabase asks not to call it back from inside this listener.
        setTimeout(() => onSession(client, session), 0)
      })
      const { data } = await client.auth.getSession()
      onSession(client, data.session)
      if (!data.session) useCloud.setState({ status: "signed-out" })
      // The magic link leaves ?code=… in the address: clean it once used.
      if (new URLSearchParams(location.search).has("code"))
        history.replaceState(null, "", location.pathname + location.hash)

      useProgress.subscribe(() => {
        if (!userId || applyingRemote) return
        clearTimeout(pushTimer)
        pushTimer = setTimeout(() => void push(client), PUSH_DELAY_MS)
      })
    })
    .catch(failed)
}

/** Sends the e-mail with the magic link and the six-digit code. */
export async function sendMagicLink(email: string) {
  const client = await supabase()
  const { error } = await client.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: location.origin + location.pathname },
  })
  if (error) throw error
}

/** Signs in with the code of the e-mail, for another device than the link. */
export async function verifyCode(email: string, token: string) {
  const client = await supabase()
  const { error } = await client.auth.verifyOtp({ email, token, type: "email" })
  if (error) throw error
}

export async function syncNow() {
  await pullAndMerge(await supabase())
}

export async function signOut() {
  clearTimeout(pushTimer)
  const client = await supabase()
  await push(client)
  await client.auth.signOut()
}
