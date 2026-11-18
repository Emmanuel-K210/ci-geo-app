// Sound effects synthesized in code (royalty-free), placed by the scenes:
// window.sfx = [{ type, at }], type one of tick, ding, whoosh, pop, chime.
;(() => {
  function noise(ctx, seconds) {
    const buffer = ctx.createBuffer(
      1,
      Math.ceil(ctx.sampleRate * seconds),
      ctx.sampleRate
    )
    const data = buffer.getChannelData(0)
    let seed = 11
    for (let i = 0; i < data.length; i++) {
      seed = (seed * 16807) % 2147483647
      data[i] = (seed / 2147483647) * 2 - 1
    }
    return buffer
  }

  function tone(ctx, out, t, freq, length, level, type = "sine") {
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.value = freq
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(level, t + 0.004)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + length)
    osc.connect(gain).connect(out)
    osc.start(t)
    osc.stop(t + length + 0.02)
    return osc
  }

  const EFFECTS = {
    /** A wooden clock tick, for countdowns and timers. */
    tick(ctx, out, t) {
      tone(ctx, out, t, 1900, 0.05, 0.35, "triangle")
      tone(ctx, out, t, 950, 0.04, 0.2)
    },
    /** A bright bell, for a good answer. */
    ding(ctx, out, t) {
      for (const [freq, level, length] of [
        [1318.5, 0.35, 0.9],
        [2637, 0.12, 0.5],
        [1975.5, 0.1, 0.6],
      ])
        tone(ctx, out, t, freq, length, level)
    },
    /** Air rushing past, for a change of screen. */
    whoosh(ctx, out, t) {
      const src = ctx.createBufferSource()
      src.buffer = noise(ctx, 0.5)
      const filter = ctx.createBiquadFilter()
      filter.type = "bandpass"
      filter.Q.value = 1.2
      filter.frequency.setValueAtTime(400, t)
      filter.frequency.exponentialRampToValueAtTime(3500, t + 0.25)
      filter.frequency.exponentialRampToValueAtTime(900, t + 0.45)
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.5, t + 0.18)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.48)
      src.connect(filter).connect(gain).connect(out)
      src.start(t)
      src.stop(t + 0.5)
    },
    /** A bubbly pop, for something appearing. */
    pop(ctx, out, t) {
      const osc = tone(ctx, out, t, 500, 0.12, 0.4)
      osc.frequency.setValueAtTime(380, t)
      osc.frequency.exponentialRampToValueAtTime(950, t + 0.08)
    },
    /** A short rising arpeggio, for the end card. */
    chime(ctx, out, t) {
      ;[784, 988, 1175, 1568].forEach((freq, i) =>
        tone(ctx, out, t + i * 0.07, freq, 0.6, 0.18)
      )
    },
  }

  /** Schedules the effects into `out`. */
  window.playSfx = (ctx, out, list = []) => {
    for (const { type, at } of list) EFFECTS[type]?.(ctx, out, Math.max(0, at))
  }
})()
