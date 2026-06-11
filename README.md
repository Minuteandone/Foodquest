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

Keep an eye out for 💩 poop hiding between the trees — picking it up fills
your 😂 Funny meter (and sneaks in a lesson about fiber).

### 💩 PooPoo Plaza

Find the giant poop building in the forest and press `F` to step inside.
You can walk around the store, inspect the poops on the shelves — each one
is modeled after a real **Bristol Stool Chart** type (1 = pebbly lumps up to
the ideal smooth Type 4 and beyond) — and talk to Bristol, the old clerk
behind the counter. Trade him foods from your backpack: the more balanced
your offer, the healthier the poop you get back. Collect 3 of every food to
unlock the legendary ✨ Perfect Poop ✨.

### 📱 Boss battle: The Gigantic iPad

Once you've traded for poop, a gigantic, fingerprint-smeared iPad appears at
the back of the map, threatening to destroy the outdoors. Press `F` to face
it — a chart shows what you need to unlock the battle (**5 poops**, with
**2 fancy ones**: Cracked, Sigma Smooth, or Perfect).

In battle, your HP equals the total value of the poops you brought, and each
iPad hit costs 3 HP. The iPad hops 5 steps then falls flat (crushing trees
and anyone underneath), then charges at double your speed — over and over
until someone wins. Throw poops with `Q`, a mouse click, or the 🎯 touch
button (damage = Bristol type number, Perfect Poop hits for 10) along the
green aiming arc, and switch ammo with `E`. Dog Water can't be thrown —
place it as a puddle and the iPad slips and falls early. When the battle
ends, the forest springs back to normal.

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
