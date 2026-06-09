# 🍎 Food Quest

A 3D open-world health literacy game for kids. Explore the Sunny Forest,
collect healthy foods into your backpack, and watch your body grow stronger —
every food powers up the organ it helps in real life!

## How to play

| Action | Keyboard | Touch screen |
|---|---|---|
| Walk | `W` `A` `S` `D` or arrow keys | drag the joystick (bottom-left) |
| Run | hold `Shift` | — |
| Look around | drag with the mouse | drag the right half of the screen |
| Pick up food | `F` | tap the 🖐 button |
| Backpack | `B` | tap 🎒 |
| Menu | `Esc` | tap ☰ |

Walk up to a glowing food and pick it up. It goes into your backpack, gives
XP to the organ it helps (carrots → 👀 eyes, blueberries → 🧠 brain, broccoli
→ 🦴 bones…), and teaches you a real health fact. Picked foods regrow after a
short while, so the forest never runs out.

## Running the game

The game is plain HTML/JS (Three.js loaded from a CDN) — no build step.
Browsers block ES modules from `file://`, so serve the folder with any static
server:

```bash
# Python
python3 -m http.server 8000

# or Node
npx serve .
```

Then open http://localhost:8000 in a browser (works on phones/tablets too).

## Saving

- Progress **auto-saves** every 15 seconds and on every pickup
  (stored in the browser's localStorage).
- The title screen offers **Continue Adventure** when a save exists.
- From the ☰ menu you can **export** your save as a JSON file and
  **import** it on another device.

## Customizing the game (the fun part!)

All game data lives in [`data/foods.js`](data/foods.js) and is written to be
edited by kids, parents, and teachers:

- **`FOODS`** — add your own foods! Each one has a name, emoji, 3D shape,
  color, the organ it helps, XP value, and a health fact.
- **`ORGANS`** — the body parts with XP meters (heart, brain, bones,
  muscles, eyes, tummy).
- **`LEVELS`** — world settings: size, tree count, food count, respawn time,
  colors. The structure supports adding more levels later (a beach? a
  mountain?).
- **`xpForLevel`** — how much XP each organ level requires.

Example: add a watermelon that helps the tummy:

```js
{
  id: "watermelon", name: "Watermelon", emoji: "🍉", organ: "tummy", xp: 9,
  fact: "Watermelon is 92% water — it helps keep your whole body hydrated!",
  color: "#2ecc71", shape: "sphere", scale: 1.2
}
```

Refresh the page and it appears in the forest. 🌳

## Project layout

```
index.html        page + HUD markup
css/style.css     all UI styling
data/foods.js     ← customizable game data (foods, organs, levels)
js/main.js        entry point, game loop, save wiring
js/world.js       forest terrain, trees, rocks, lighting
js/player.js      character, WASD + touch joystick, follow camera
js/foodWorld.js   food spawning, animation, pickup logic
js/ui.js          organ meters, backpack, fact toasts
js/save.js        localStorage save/load + export/import
```
