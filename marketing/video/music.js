// An original, royalty-free loop composed in code: an afro-pop groove (104
// BPM by default) with kick, shaker, bass and a balafon-like melody over
// Am – F – C – G. Rendered offline, so the same every time.
;(() => {
  /** Midi note → frequency. */
  const hz = (midi) => 440 * 2 ** ((midi - 69) / 12)

  // Am F C G, as bass roots and pentatonic melody notes over each bar.
  const BARS = [
    { root: 45, melody: [69, 72, 76, 72, 74, 72, 69, 67] },
    { root: 41, melody: [69, 72, 77, 76, 72, 69, 72, 74] },
    { root: 48, melody: [72, 76, 79, 76, 74, 72, 76, 72] },
    { root: 43, melody: [71, 74, 79, 74, 76, 74, 71, 67] },
  ]

  function noiseBuffer(ctx) {
    const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let seed = 7
    for (let i = 0; i < data.length; i++) {
      seed = (seed * 16807) % 2147483647
      data[i] = (seed / 2147483647) * 2 - 1
    }
    return buffer
  }

  function kick(ctx, out, t) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.setValueAtTime(140, t)
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12)
    gain.gain.setValueAtTime(0.9, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
    osc.connect(gain).connect(out)
    osc.start(t)
    osc.stop(t + 0.32)
  }

  function shaker(ctx, out, noise, t, level) {
    const src = ctx.createBufferSource()
    src.buffer = noise
    const filter = ctx.createBiquadFilter()
    filter.type = "highpass"
    filter.frequency.value = 7000
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(level, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
    src.connect(filter).connect(gain).connect(out)
    src.start(t, (t * 0.37) % 0.9)
    src.stop(t + 0.07)
  }

  function bass(ctx, out, t, midi, length) {
    const osc = ctx.createOscillator()
    osc.type = "triangle"
    osc.frequency.value = hz(midi)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.001, t)
    gain.gain.exponentialRampToValueAtTime(0.5, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, t + length)
    osc.connect(gain).connect(out)
    osc.start(t)
    osc.stop(t + length + 0.02)
  }

  /** A struck wooden bar: two partials and a fast decay. */
  function balafon(ctx, out, t, midi, level) {
    for (const [ratio, amount, decay] of [
      [1, 1, 0.35],
      [3.9, 0.25, 0.08],
    ]) {
      const osc = ctx.createOscillator()
      osc.frequency.value = hz(midi) * ratio
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.001, t)
      gain.gain.exponentialRampToValueAtTime(level * amount, t + 0.005)
      gain.gain.exponentialRampToValueAtTime(0.001, t + decay)
      osc.connect(gain).connect(out)
      osc.start(t)
      osc.stop(t + decay + 0.02)
    }
  }

  /**
   * Schedules `seconds` of the loop into `out`, starting at 0. A transpose
   * (semitones) and a tempo give each video its own variation.
   */
  window.composeMusic = (
    ctx,
    out,
    seconds,
    { transpose = 0, bpm = 104 } = {}
  ) => {
    const BEAT = 60 / bpm
    const noise = noiseBuffer(ctx)
    const bus = ctx.createGain()
    bus.gain.value = 0.55
    bus.connect(out)
    const bar = BEAT * 4
    for (let start = 0, n = 0; start < seconds; start += bar, n++) {
      const chord = BARS[n % BARS.length]
      const root = chord.root + transpose
      const melody = chord.melody.map((midi) => midi + transpose)
      for (let b = 0; b < 4; b++) kick(ctx, bus, start + b * BEAT)
      for (let s = 0; s < 16; s++)
        shaker(ctx, bus, noise, start + (s * BEAT) / 4, s % 2 ? 0.08 : 0.16)
      // Bass: root on 1, a syncopated push before 3, the fifth on 4.
      bass(ctx, bus, start, root, BEAT * 1.2)
      bass(ctx, bus, start + BEAT * 1.75, root, BEAT * 0.6)
      bass(ctx, bus, start + BEAT * 2.5, root + 12, BEAT * 0.4)
      bass(ctx, bus, start + BEAT * 3, root + 7, BEAT * 0.8)
      // The melody comes in after the first two bars.
      if (n >= 2)
        melody.forEach((midi, k) =>
          balafon(ctx, bus, start + (k * BEAT) / 2, midi, k % 2 ? 0.18 : 0.26)
        )
    }
  }
})()
