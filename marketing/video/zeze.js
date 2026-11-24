// Zézé in the videos: the app's mascot (mascot.js, built from
// src/components/mascot-art.ts by render.mjs) speaking recorded clips
// (audio/zeze-N.mp3), his mouth following the loudness of the voice.
//
//   const zeze = await ZEZE
//   const end = zeze.say(1, 0.4, "happy")     line 1 at 0.4 s; returns its end
//   html += zeze.place({ left, top, size, from, to, bubble })
;(() => {
  /** The recorded lines, shown in a bubble while he speaks. */
  const LINES = {
    1: "Salut, c'est moi, Zézé ! Prêt pour le quiz ?",
    2: "Trois… deux… un… c'est parti !",
    3: "Hmm… tu as trouvé ?",
    4: "Bravo, tu es fort, hein !",
    5: "Aïe aïe aïe… on révise un peu ?",
    6: "Waouh, tu le savais, ça ?",
    7: "Abonne-toi pour le prochain défi. On est ensemble !",
  }
  const FPS = 30
  /** Recorded clips the renderer mixes into the soundtrack: { src, at }. */
  window.clips = window.clips || []

  async function loudness(n, context) {
    const response = await fetch(`zeze-${n}.mp3`)
    if (!response.ok) return null
    const buffer = await context.decodeAudioData(await response.arrayBuffer())
    const data = buffer.getChannelData(0)
    const step = Math.round(buffer.sampleRate / FPS)
    const levels = []
    for (let i = 0; i < data.length; i += step) {
      const end = Math.min(data.length, i + step)
      let sum = 0
      for (let j = i; j < end; j++) sum += data[j] * data[j]
      levels.push(Math.sqrt(sum / (end - i)))
    }
    const peak = Math.max(...levels) || 1
    return { seconds: buffer.duration, levels: levels.map((v) => v / peak) }
  }

  window.ZEZE = (async () => {
    const { mascotSvg } = await import("./mascot.js")
    const context = new OfflineAudioContext(1, 1, 48000)
    const clips = {}
    for (const n of Object.keys(LINES))
      clips[n] = await loudness(n, context).catch(() => null)

    const talks = [] // { n, at, seconds }
    const moods = [] // { at, mood }
    const boxes = []

    const talkAt = (t) =>
      talks.find((talk) => t >= talk.at && t < talk.at + talk.seconds)
    const moodAt = (t) =>
      moods.filter((m) => m.at <= t).sort((a, b) => b.at - a.at)[0]

    onFrame.push((t) => {
      const talk = talkAt(t)
      let open = 0
      if (talk) {
        const level = clips[talk.n].levels[Math.floor((t - talk.at) * FPS)]
        open = Math.max(0, Math.min(1, ((level ?? 0) - 0.12) / 0.55))
      }
      const current = moodAt(t)
      const mood = current?.mood ?? "idle"
      // A little jump when he gets happy or surprised.
      const since = current ? t - current.at : 9
      const jump =
        (mood === "happy" || mood === "wow") && since < 0.7
          ? Math.sin((since / 0.7) * Math.PI) * 40
          : 0
      const shown =
        talk ?? talks.find((x) => t >= x.at && t < x.at + x.seconds + 0.5)
      for (const box of boxes) {
        const art = document.getElementById(box.id)
        if (!art) continue
        const key = `${mood}${Math.round(open * 5)}`
        if (art.dataset.key !== key) {
          art.dataset.key = key
          art.innerHTML = mascotSvg(mood, Math.round(open * 5) / 5)
        }
        art.style.transform = `translateY(${Math.sin(t * 2.6) * 7 - jump}px) rotate(${Math.sin(t * 1.3) * 2.5}deg)`
        const bubble = document.getElementById(`${box.id}-bubble`)
        if (bubble) {
          const on = shown && t >= box.from && t < box.to
          if (on) bubble.textContent = LINES[shown.n]
          const v = on
            ? Math.min(
                span(t, shown.at, shown.at + 0.25),
                1 -
                  span(
                    t,
                    shown.at + shown.seconds + 0.2,
                    shown.at + shown.seconds + 0.5
                  )
              )
            : 0
          bubble.style.opacity = String(v)
          bubble.style.transform = `scale(${0.9 + 0.1 * v})`
        }
      }
    })

    return {
      /** Line n spoken at `at`, in a mood; returns when he stops. */
      say(n, at, mood = "idle") {
        const clip = clips[n]
        moods.push({ at, mood })
        if (!clip) return at
        talks.push({ n, at, seconds: clip.seconds })
        window.clips.push({ src: `zeze-${n}.mp3`, at })
        return at + clip.seconds
      },
      /** Changes his face at `at`, without speaking. */
      mood(at, mood) {
        moods.push({ at, mood })
      },
      /** Zézé on screen from `from` to `to`, a speech bubble on his right. */
      place({ left, top, size = 260, from = 0, to = Infinity, bubble = true }) {
        const id = `zeze${boxes.length}`
        boxes.push({ id, from, to })
        return `
          <div data-in="${from}" ${to < Infinity ? `data-out="${to}"` : ""} data-fx="pop" style="position:absolute;left:${left}px;top:${top}px;width:${size}px;z-index:5">
            <div id="${id}" style="transform-origin:50% 90%"></div>
          </div>
          ${
            bubble
              ? `<div id="${id}-bubble" style="position:absolute;left:${left + size + 10}px;right:150px;top:${top + size * 0.12}px;z-index:5;opacity:0;transform-origin:0 60%;padding:22px 30px;border-radius:34px 34px 34px 8px;background:#fff;color:#17241e;box-shadow:0 10px 30px rgba(0,0,0,.18);font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:44px;line-height:1.15"></div>`
              : ""
          }`
      },
    }
  })()
})()
