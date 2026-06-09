// Food Quest — entry point. Wires together the world, player,
// foods, UI, save system, and PooPoo Plaza.

import * as THREE from "three";
import { LEVELS } from "../data/foods.js";
import { buildWorld } from "./world.js";
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

  // Plaza scene (built once, reused on every visit)
  const plaza = buildPlaza();
  plaza.camera.aspect = window.innerWidth / window.innerHeight;
  plaza.camera.updateProjectionMatrix();
  const store = new Store(save, () => doSave(false), exitStore);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    plaza.camera.aspect = window.innerWidth / window.innerHeight;
    plaza.camera.updateProjectionMatrix();
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

    if (game.location === "forest" && !game.paused) {
      player.update(dt, obstacles, half);
      foods.update(dt);

      // Proximity check: store entrance vs nearest food
      const distToEntrance = poopEntrance
        ? Math.hypot(player.position.x - poopEntrance.x, player.position.z - poopEntrance.z)
        : Infinity;

      if (distToEntrance < poopEntrance.r) {
        ui.showPrompt("Press F to enter 💩 PooPoo Plaza");
      } else {
        ui.showPickupPrompt(foods.nearest(player.position)?.food || null);
      }

      save.playSeconds += dt;
      autosaveTimer += dt;
      if (autosaveTimer >= AUTOSAVE_SECONDS) {
        autosaveTimer = 0;
        doSave(false);
      }
    }

    const activeScene  = game.location === "forest" ? game.forestScene : game.plaza.scene;
    const activeCamera = game.location === "forest" ? game.camera       : game.plaza.camera;
    renderer.render(activeScene, activeCamera);
  }
  frame();
}

// ---------- Store transitions ----------

function enterStore() {
  if (game.location !== "forest") return;
  game.location = "poopoo_plaza";
  game.paused = true;
  // Hide forest HUD elements that don't apply in the store
  document.getElementById("pickup-prompt").classList.add("hidden");
  document.getElementById("btn-pickup-touch").classList.add("hidden");
  document.getElementById("btn-jump-touch").classList.add("hidden");
  document.getElementById("touch-joystick").style.display = "none";
  game.store.open();
}

function exitStore() {
  if (game.location !== "poopoo_plaza") return;
  game.store.close();
  game.location = "forest";
  game.paused = false;
  // Place player just outside the entrance so they don't re-trigger immediately
  if (game.poopEntrance) {
    game.player.position.set(
      game.poopEntrance.x,
      0,
      game.poopEntrance.z + game.poopEntrance.r + 1
    );
    game.player.velocityY = 0;
    game.player.isGrounded = true;
  }
  document.getElementById("touch-joystick").style.display = "";
  document.getElementById("btn-jump-touch").classList.remove("hidden");
}

// ---------- Persistence ----------

function doSave(showIndicator = true) {
  const { save, player, ui } = game;
  save.position = { x: player.position.x, z: player.position.z };
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

function handleFKey() {
  if (game.location === "forest" && !game.paused) {
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
  document.getElementById("btn-pickup-touch").addEventListener("click", pickUpNearest);
}

function wireJumpTouch() {
  document.getElementById("btn-jump-touch").addEventListener("click", () => {
    if (game && game.location === "forest" && !game.paused) {
      game.player.triggerJump();
    }
  });
}

function toggleBackpack(forceClose = false) {
  const panel = document.getElementById("backpack-panel");
  const open = !panel.classList.contains("hidden");
  if (open || forceClose) {
    panel.classList.add("hidden");
    game.paused = false;
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
    game.paused = false;
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
