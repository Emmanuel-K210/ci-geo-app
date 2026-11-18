// Timeline for the video scenes. The renderer calls setTime(t) once per frame
// with increasing t (seconds); everything on screen is a function of t, so a
// render is the same every time.
//
//   <div data-in="3" data-out="7.5" data-fx="up">…</div>   shown from 3 s to 7.5 s
//   cue(5, () => …)                                         runs once at 5 s
;(() => {
  const clamp = (v) => Math.max(0, Math.min(1, v))
  const ease = (v) => 1 - (1 - v) ** 3
  const cues = []
  let next = 0

  window.cue = (at, run) => {
    cues.push({ at, run })
    cues.sort((a, b) => a.at - b.at)
  }

  /** Called each frame, with the frame time. */
  window.onFrame = window.onFrame || []

  window.setTime = (t) => {
    while (next < cues.length && cues[next].at <= t) cues[next++].run()
    for (const el of document.querySelectorAll("[data-in]")) {
      const start = Number(el.dataset.in)
      const end = el.dataset.out ? Number(el.dataset.out) : Infinity
      const fadeIn = Number(el.dataset.fadein ?? 0.45)
      const v = Math.min(
        ease(clamp((t - start) / fadeIn)),
        ease(clamp((end - t) / 0.35))
      )
      const k = 1 - v
      const fx = el.dataset.fx ?? "fade"
      el.style.opacity = String(v)
      el.style.visibility = v === 0 ? "hidden" : "visible"
      const base = el.dataset.base ?? ""
      el.style.transform =
        fx === "up"
          ? `${base} translateY(${k * 60}px)`
          : fx === "zoom"
            ? `${base} scale(${0.85 + v * 0.15})`
            : fx === "left"
              ? `${base} translateX(${k * 120}px)`
              : fx === "pop"
                ? `${base} scale(${v < 1 ? 0.4 + 0.75 * v - 0.15 * v * v : 1})`
                : base
    }
    for (const run of window.onFrame) run(t)
  }

  /** Progress of t between a and b, eased, from 0 to 1. */
  window.span = (t, a, b) => ease(clamp((t - a) / (b - a)))

  /** The app document inside a phone frame. */
  window.app = (id) => document.getElementById(id).contentWindow

  /** Async steps a scene registers to build itself before the first frame. */
  window.setup = []

  const loaded = (frame) =>
    new Promise((resolve) => {
      const doc = frame.contentDocument
      if (doc?.readyState === "complete" && doc.URL !== "about:blank") resolve()
      else frame.addEventListener("load", resolve, { once: true })
    })

  /** Resolves when the scene is built and its frames and photos have loaded. */
  window.ready = new Promise((resolve) => {
    if (document.readyState === "loading")
      document.addEventListener("DOMContentLoaded", resolve, { once: true })
    else resolve()
  })
    .then(() => Promise.all(window.setup.map((step) => step())))
    .then(async () => {
      const frames = [...document.querySelectorAll("iframe")]
      await Promise.all(frames.map(loaded))
      // Photos and lazy content inside the app need a moment more.
      if (frames.length) await new Promise((r) => setTimeout(r, 3500))
      await document.fonts.ready
    })
})()
