// A returning player with some progress, so the screens in the phones look
// lived in. Runs before the app frames load (same origin, same storage).
;(() => {
  const day = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10)
  const at = (n) => `${day(n)}T10:00:00Z`
  localStorage.setItem(
    "ci-geo-progress",
    JSON.stringify({
      version: 1,
      state: {
        xp: 740,
        onboarded: true,
        last: { game: "clues", at: new Date().toISOString() },
        xpByDay: { [day(0)]: 35 },
        played: { daily: 6, clues: 4, quiz: 5, closer: 2, pin: 2 },
        best: { clues: 21, closer: 12, "quiz:tout": 8, pin: 7, daily: 412 },
        daily: {
          [day(1)]: [12, 40, 8, 90, 30],
          [day(2)]: [20, 15, 60, 5, 44],
          [day(3)]: [9, 9, 30, 70, 12],
          [day(4)]: [33, 80, 12, 6, 20],
        },
        badges: {
          "premiers-pas": at(9),
          "rendez-vous": at(8),
          fidele: at(2),
          detective: at(5),
          curieux: at(1),
        },
        visited: [
          "ci-v-bouake",
          "ci-v-yamoussoukro",
          "ci-v-abidjan",
          "ci-v-korhogo",
          "ci-v-man",
          "ci-v-grand-bassam",
          "ci-v-katiola",
          "ci-v-beoumi",
          "ci-v-san-pedro",
          "ci-v-daloa",
          "ci-v-ferkessedougou",
          "ci-v-boundiali",
        ],
        read: [
          "site:tai",
          "peuple:baoule",
          "site:grand-bassam",
          "peuple:senoufo",
          "site:kong",
        ],
        settings: { sound: false, vibration: false, devMode: false },
      },
    })
  )
})()
