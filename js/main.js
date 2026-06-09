// Food Quest — entry point. Wires together the world, player,
// foods, UI, and the save system.

import * as THREE from "three";
import { LEVELS } from "../data/foods.js";
import { buildWorld } from "./world.js";
import { Player, setupJoystick } from "./player.js";
import { FoodWorld } from "./foodWorld.js";
import { UI } from "./ui.js";
import {
  defaultSave, loadSave, writeSave, clearSave, exportSave, importSave
} from "./save.js";

const AUTOSAVE_SECONDS = 15;

let game = null; // holds everything once an adventure starts

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
  document.getElementById("title-screen").classList.add("hidden");
  document.getElementById("hud").classList.remove("hidden");

  const level = LEVELS.find((l) => l.id === save.levelId) || LEVELS[0];
  document.getElementById("level-name").textContent = level.name;

  // Renderer + scene
  const canvas = document.getElementById("game-canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 400);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const { obstacles, half } = buildWorld(scene, level);
  const spawn = save.position || { x: 0, z: 0 };
  const player = new Player(scene, camera, spawn);
  setupJoystick(player);
  const foods = new FoodWorld(scene, level);
  const ui = new UI(save);

  game = { save, level, renderer, scene, camera, player, foods, ui, paused: false };

  wireHudButtons();
  wirePickup();

  // Main loop
  const clock = new THREE.Clock();
  let autosaveTimer = 0;

  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.1);
    if (!game.paused) {
      player.update(dt, obstacles, half);
      foods.update(dt);
      ui.showPickupPrompt(foods.nearest(player.position)?.food || null);
      save.playSeconds += dt;

      autosaveTimer += dt;
      if (autosaveTimer >= AUTOSAVE_SECONDS) {
        autosaveTimer = 0;
        doSave(false);
      }
    }
    renderer.render(scene, camera);
  }
  frame();
}

function doSave(showIndicator = true) {
  const { save, player, ui } = game;
  save.position = { x: player.position.x, z: player.position.z };
  writeSave(save);
  if (showIndicator) ui.showSaved();
}

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
  doSave(false); // every pickup is saved instantly
}

function wirePickup() {
  window.addEventListener("keydown", (e) => {
    if (e.code === "KeyF") pickUpNearest();
    if (e.code === "KeyB") toggleBackpack();
    if (e.code === "Escape") toggleMenu();
  });
  document.getElementById("btn-pickup-touch").addEventListener("click", pickUpNearest);
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
      location.reload(); // restart with the imported save
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
