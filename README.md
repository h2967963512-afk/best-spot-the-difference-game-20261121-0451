# Twin Tales — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/h2967963512-afk/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/h2967963512-afk/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

An entry for make.fun's `best-spot-the-difference-game-20261121-0451` bounty ("Make the best spot the difference game").

Two pictures. A handful of sneaky changes. Find them all before the clock runs out.

Three hand-drawn scenes, every shape drawn in code — no borrowed art: a sunny
park (5 differences), a cozy kitchen (7), and a moon base (9). Click a difference
in either picture and a red ring marks the find; a wrong click costs 5 seconds.
Hints, a countdown timer, a time bonus and a best score keep the hunt tense.

## How to play

- **Click:** a difference in either picture. Found ones get a red ring on both sides.
- **Hint:** `H` (or click the Hints counter) — a dashed gold ring pulses around a
  difference you haven't found yet. Three per level.
- **Keys:** `P` pause, `R` restart the level, `N` next level, `M` mute, `Enter` start.
- **Win:** find every difference in all three scenes. Stars depend on time left.

## Run it

```sh
node serve.ts        # then open http://localhost:8080
```

No build step, no network: `game/` is plain static files, and the sound is
synthesized in code with the Web Audio API.

## Layout

- `game/index.html` — page shell and canvas.
- `game/src/config.js` — every tuning number and colour.
- `game/src/random.js` — seeded RNG (no `Math.random` in the game).
- `game/src/scenes.js` — the three scenes, drawn in code, and their differences.
- `game/src/world.js` — the simulation: screens, timer, scoring, hints.
- `game/src/input.js` — keyboard and mouse state.
- `game/src/audio.js` — synthesized sound effects and music-box loop.
- `game/src/render.js` — everything the player sees.
- `game/src/shots.js` — deterministic screenshot states (`?shot=cover|kitchen|moon|win`).
- `game/src/main.js` — boot, loop and menus.
- `main.ts` — the entrypoint: copies `game/` and `screenshots/` to `/output`
  and writes `dossier.json`.
- `screenshots/` — four real renders of the game (cover, kitchen, moon base, level clear).

## License

MIT — see `LICENSE`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=cj11yvbn&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
