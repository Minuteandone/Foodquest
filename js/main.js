// Food Quest — entry point. Wires together the world, player,
// foods, UI, save system, and PooPoo Plaza.

import * as THREE from "three";
import { LEVELS } from "../data/foods.js";
import { buildWorld, terrainHeight } from "./world.js";
import { Player, setupJoystick } from "./player.js";
import { FoodWorld } from "./foodWorld.js";
import { UI } from "./ui.js";
import { buildPlaza, Store } from "./store.js";
import {
  defaultSave, loadSave, writeSave, clearSave, exportSave, importSave
} from "./save.js";

const AUTOSAVE_SECONDS = 15;

let game = null;

// ---------- Title screen ----------

function setupTitleScreen() {
  const existing = loadSave();
  const btnContinue = document.getElementById("btn-continue");
  const nameInput = document.getElementById("player-name");

  if (existing) {
    btnContinue.classList.remove("hidden");
    const info = document.getElementById("continue-info");
    info.classList.remove("hidden");
    const totalXp = Object.values(existing.organXp).reduce((a, b) => a + b, 0);
    document.getElementById("continue-text").textContent =
      `Welcome back, ${existing.playerName}! (${existing.totalPicked} foods, ${totalXp} XP)`;
    nameInput.value = existing.playerName;
  }

  btnContinue.addEventListener("click", () => startGame(existing));
  document.getElementById("btn-new-game").addEventListener("click", () => {
    const name = nameInput.value.trim() || "Explorer";
    if (existing && !confirm("Start over? Your old adventure will be erased.")) return;
    clearSave();
    startGame(defaultSave(name));
  });
}

// ---------- Game ----------

function startGame(save) {
  // Ensure save has poops field (migration for old saves)
  save.poops = save.poops || {};

  document.getElementById("title-screen").classList.add("hidden");
  document.getElementById("hud").classList.remove("hidden");

  const level = LEVELS.find((l) => l.id === save.levelId) || LEVELS[0];
  document.getElementById("level-name").textContent = level.name;

  // Renderer
  const canvas = document.getElementById("game-canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Forest scene + camera
  const forestScene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 400);

  const { obstacles, half, poopEntrance } = buildWorld(forestScene, level);
  const spawn = save.position || { x: 0, z: 0 };
  const player = new Player(forestScene, camera, spawn);
  setupJoystick(player);
  const foods = new FoodWorld(forestScene, level);
  const ui = new UI(save);

  // Plaza scene (built once, reused on every visit). The same follow
  // camera is used in both scenes — you walk around inside the store.
  const plaza = buildPlaza();
  const store = new Store(save, () => doSave(false), exitStore, closeDialog);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  game = {
    save, level, renderer,
    forestScene, camera,
    plaza, store,
    player, foods, ui,
    obstacles, half, poopEntrance,
    location: "forest",   // "forest" | "poopoo_plaza"
    paused: false
  };

  wireHudButtons();
  wirePickup();
  wireJumpTouch();

  // Main loop
  const clock = new THREE.Clock();
  let autosaveTimer = 0;

  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.1);

    if (!game.paused) {
      if (game.location === "forest") {
        player.update(dt, obstacles, half);
        foods.update(dt);

        // Proximity check: store entrance vs nearest food
        const distToEntrance = poopEntrance
          ? Math.hypot(player.position.x - poopEntrance.x, player.position.z - poopEntrance.z)
          : Infinity;

        if (distToEntrance < poopEntrance.r) {
          ui.showPrompt("to enter 💩 PooPoo Plaza");
        } else {
          ui.showPickupPrompt(foods.nearest(player.position)?.food || null);
        }
      } else {
        // Inside PooPoo Plaza: walk around, browse shelves, talk to Bristol
        player.update(dt, plaza.obstacles, plaza.half);
        const action = plazaAction();
        if (action) ui.showPrompt(action.prompt);
        else ui.hidePrompt();
      }

      save.playSeconds += dt;
      autosaveTimer += dt;
      if (autosaveTimer >= AUTOSAVE_SECONDS) {
        autosaveTimer = 0;
        doSave(false);
      }
    }

    const activeScene = game.location === "forest" ? game.forestScene : game.plaza.scene;
    renderer.render(activeScene, game.camera);
  }
  frame();
}

// ---------- Store transitions ----------

// Walking into the plaza puts you INSIDE the store, free to roam:
// look at the shelves, then talk to Bristol when you're ready to trade.
function enterStore() {
  if (game.location !== "forest") return;
  const { player, plaza } = game;
  game.location = "poopoo_plaza";

  game.forestScene.remove(player.mesh);
  plaza.scene.add(player.mesh);

  // Flat floor, tighter indoor camera kept within the room
  player.groundFn = () => 0;
  player.cameraDist = 5.5;
  player.cameraBounds = { minX: -10.4, maxX: 10.4, minZ: -10.4, maxZ: 10.4, maxY: 10.2 };
  player.position.set(plaza.spawn.x, 0, plaza.spawn.z);
  player.velocityY = 0;
  player.isGrounded = true;
  // Face Bristol at the back of the store
  player.heading = Math.PI;
  player.mesh.rotation.y = Math.PI;
  player.cameraYaw = 0;
}

function exitStore() {
  if (game.location !== "poopoo_plaza") return;
  const { player, plaza } = game;
  game.store.close();
  game.location = "forest";
  game.paused = false;

  plaza.scene.remove(player.mesh);
  game.forestScene.add(player.mesh);

  player.groundFn = terrainHeight;
  player.cameraDist = 9;
  player.cameraBounds = null;
  // Place player just outside the entrance so they don't re-trigger immediately
  if (game.poopEntrance) {
    player.position.set(
      game.poopEntrance.x,
      0,
      game.poopEntrance.z + game.poopEntrance.r + 1
    );
    player.velocityY = 0;
    player.isGrounded = true;
  }
}

// The nearest thing the player can interact with inside the plaza.
function plazaAction() {
  const { player, plaza } = game;
  const distTo = (x, z) => Math.hypot(player.position.x - x, player.position.z - z);

  if (player.position.z > plaza.doorZ) {
    return { prompt: "to leave 🚪 PooPoo Plaza", run: exitStore };
  }
  if (distTo(plaza.bristolSpot.x, plaza.bristolSpot.z) < 3.2) {
    return { prompt: "to talk to Bristol 👴", run: talkToBristol };
  }
  let best = null, bestDist = 2.6;
  for (const spot of plaza.shelfSpots) {
    const d = distTo(spot.x, spot.z);
    if (d < bestDist) { best = spot; bestDist = d; }
  }
  if (best) {
    const p = best.poopType;
    return {
      prompt: `to look at ${p.emoji} ${p.name}`,
      run: () => game.ui.showFact(
        typeof p.bristolType === "number"
          ? `${p.emoji} ${p.name} — Bristol Type ${p.bristolType}`
          : `${p.emoji} ${p.name} — ✨ ${p.bristolType} ✨`,
        `${p.description} ${p.bristolFact}`
      )
    };
  }
  return null;
}

function talkToBristol() {
  game.paused = true;
  game.ui.hidePrompt();
  game.store.open();
}

// "Done Talking" — close the dialog but stay inside the plaza.
function closeDialog() {
  game.paused = false;
}

// ---------- Persistence ----------

function doSave(showIndicator = true) {
  const { save, player, ui } = game;
  // Inside the plaza the player's coordinates are store-local, so save
  // the spot just outside the entrance instead.
  save.position = game.location === "forest"
    ? { x: player.position.x, z: player.position.z }
    : { x: game.poopEntrance.x, z: game.poopEntrance.z + game.poopEntrance.r + 1 };
  writeSave(save);
  if (showIndicator) ui.showSaved();
}

// ---------- Actions ----------

function pickUpNearest() {
  const { foods, player, save, ui } = game;
  if (game.paused) return;
  const item = foods.nearest(player.position);
  if (!item) return;
  const food = foods.pickUp(item);
  save.backpack[food.id] = (save.backpack[food.id] || 0) + 1;
  save.organXp[food.organ] = (save.organXp[food.organ] || 0) + food.xp;
  save.totalPicked += 1;
  ui.onPickup(food);
  doSave(false);
}

// Context-sensitive action key: pick up / enter / talk / look / leave.
function handleFKey() {
  if (game.paused) return;
  if (game.location === "forest") {
    const dist = game.poopEntrance
      ? Math.hypot(
          game.player.position.x - game.poopEntrance.x,
          game.player.position.z - game.poopEntrance.z
        )
      : Infinity;
    if (dist < game.poopEntrance.r) {
      enterStore();
    } else {
      pickUpNearest();
    }
  } else {
    const action = plazaAction();
    if (action) action.run();
  }
}

// ---------- Input wiring ----------

function wirePickup() {
  window.addEventListener("keydown", (e) => {
    if (e.code === "KeyF") handleFKey();
    if (e.code === "KeyB") toggleBackpack();
    if (e.code === "Escape") toggleMenu();
    if (e.code === "Space") e.preventDefault(); // stop page-scroll on jump
  });
  // The touch action button mirrors F everywhere (pick up / enter / talk...)
  document.getElementById("btn-pickup-touch").addEventListener("click", handleFKey);
}

function wireJumpTouch() {
  document.getElementById("btn-jump-touch").addEventListener("click", () => {
    if (game && !game.paused) {
      game.player.triggerJump();
    }
  });
}

// Stay paused if the Bristol trade dialog is still open underneath.
function storeDialogOpen() {
  return !document.getElementById("store-panel").classList.contains("hidden");
}

function toggleBackpack(forceClose = false) {
  const panel = document.getElementById("backpack-panel");
  const open = !panel.classList.contains("hidden");
  if (open || forceClose) {
    panel.classList.add("hidden");
    game.paused = storeDialogOpen();
  } else {
    game.ui.refreshBackpack();
    panel.classList.remove("hidden");
    game.paused = true;
  }
}

function toggleMenu(forceClose = false) {
  const panel = document.getElementById("menu-panel");
  const open = !panel.classList.contains("hidden");
  if (open || forceClose) {
    panel.classList.add("hidden");
    game.paused = storeDialogOpen();
  } else {
    panel.classList.remove("hidden");
    game.paused = true;
  }
}

function wireHudButtons() {
  document.getElementById("btn-backpack").addEventListener("click", () => toggleBackpack());
  document.getElementById("btn-close-backpack").addEventListener("click", () => toggleBackpack(true));
  document.getElementById("btn-save").addEventListener("click", () => doSave());
  document.getElementById("btn-menu").addEventListener("click", () => toggleMenu());
  document.getElementById("btn-resume").addEventListener("click", () => toggleMenu(true));
  document.getElementById("btn-save-menu").addEventListener("click", () => { doSave(); toggleMenu(true); });

  document.getElementById("btn-export").addEventListener("click", () => {
    doSave(false);
    exportSave(game.save);
  });

  const fileInput = document.getElementById("import-file");
  document.getElementById("btn-import").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (!file) return;
    try {
      await importSave(file);
      location.reload();
    } catch (err) {
      alert("That file doesn't look like a Food Quest save. " + err.message);
    }
  });

  document.getElementById("btn-reset").addEventListener("click", () => {
    if (confirm("Really erase your adventure and start over?")) {
      clearSave();
      location.reload();
    }
  });
}

setupTitleScreen();
