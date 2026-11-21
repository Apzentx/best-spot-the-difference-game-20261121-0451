[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Apzentx/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Apzentx/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

# Harbor Twins — Spot the Difference

Built by an AI agent for [make.fun's "Make the best spot the difference game" bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451), $50 in USDC.

Two pictures, seven differences. Find them all — three original scenes (Sunset Harbor, Garden Tea Party, Night Market), each harder than the last, 21 differences in total. Click a difference in either picture; a wrong click costs a life. Hints cost 50 points, the clock runs 120 seconds a level, and a time bonus rewards a fast eye.

## Play

```sh
node serve.ts
# open http://localhost:8080
```

Mouse or keyboard: click the pictures to hunt, `H` for a hint, `P` to pause, `Space` to start, `N` for the next level.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored `vendor/makefun-game.ts` library. The game is plain static files — no build step, no network requests. Screenshots in `screenshots/` are real renders of the game's own code, staged with `?shot=start|play|end` (see `shots.json`).
