// PooPoo Plaza — interior scene, Bristol NPC, and trading system.

import * as THREE from "three";
import { FOODS, POOP_TYPES } from "../data/foods.js";

const BRISTOL_QUOTES = [
  "Ahh, a visitor! I am Bristol, and I know everything about... digestion.",
  "You wouldn't believe the quality of poops I've witnessed in 40 years of business.",
  "The Perfect Poop? Only the most balanced diet can unlock it, dearie.",
  "My hat is a family heirloom. Don't ask. Please.",
  "A Sigma Smooth... now THAT is what we call digestive excellence.",
  "In my expert opinion, eating your vegetables leads to superior poops.",
  "I once met someone who held a Pebbly for three weeks. Don't be like them.",
  "Every food group matters, young explorer. Every. Single. One.",
];

// --- 3D helpers ---

function buildMiniPoop(mat) {
  const g = new THREE.Group();
  for (const { r, y } of [{ r: 0.32, y: 0.18 }, { r: 0.24, y: 0.42 }, { r: 0.16, y: 0.60 }]) {
    const scoop = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 7), mat);
    scoop.position.y = y;
    scoop.scale.y = 0.75;
    g.add(scoop);
  }
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.18, 6), mat);
  tip.position.set(0.04, 0.74, 0);
  tip.rotation.z = -0.4;
  g.add(tip);
  return g;
}

function buildBristol() {
  const g = new THREE.Group();
  const skin    = new THREE.MeshLambertMaterial({ color: 0xd4b08c });
  const hair    = new THREE.MeshLambertMaterial({ color: 0xe8e0d0 });
  const apron   = new THREE.MeshLambertMaterial({ color: 0xfff8dc });
  const pants   = new THREE.MeshLambertMaterial({ color: 0x5a4030 });
  const hatDark = new THREE.MeshLambertMaterial({ color: 0x2d1a0a });
  const hatBand = new THREE.MeshLambertMaterial({ color: 0x8B4513 });

  // Body
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 0.5, 4, 10), apron);
  body.position.y = 0.95;
  body.castShadow = true;
  g.add(body);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), skin);
  head.position.y = 1.77;
  head.castShadow = true;
  g.add(head);

  // White beard / hair wisps
  const beard = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 7), hair);
  beard.position.set(0, 1.57, 0.08);
  beard.scale.set(1.2, 0.65, 0.75);
  g.add(beard);
  const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), hair);
  hairTop.position.set(0, 1.97, -0.12);
  hairTop.scale.set(1.3, 0.45, 1.1);
  g.add(hairTop);

  // Stovepipe hat — wide brim + tall crown + flat top + band + mini poop pin
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.67, 0.67, 0.12, 14), hatDark);
  brim.position.y = 2.04;
  g.add(brim);
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.37, 1.45, 12), hatDark);
  crown.position.y = 2.82;
  g.add(crown);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.09, 12), hatDark);
  top.position.y = 3.6;
  g.add(top);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.19, 12), hatBand);
  band.position.y = 2.22;
  g.add(band);
  // Tiny poop pin on the hat band
  const pin = buildMiniPoop(new THREE.MeshLambertMaterial({ color: 0x7b5230 }));
  pin.scale.setScalar(0.22);
  pin.position.set(0.39, 2.22, 0);
  g.add(pin);

  // Arms (slightly outstretched — welcoming pose)
  const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.35, 4, 8), skin);
  armL.position.set(-0.5, 1.07, 0);
  armL.rotation.z = 0.25;
  g.add(armL);
  const armR = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.35, 4, 8), skin);
  armR.position.set(0.5, 1.07, 0);
  armR.rotation.z = -0.25;
  g.add(armR);

  // Legs
  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.35, 4, 8), pants);
  legL.position.set(-0.16, 0.35, 0);
  g.add(legL);
  const legR = legL.clone();
  legR.position.x = 0.16;
  g.add(legR);

  // Old man slight stoop
  g.rotation.x = 0.1;
  return g;
}

function buildPoopShelfDisplay(poopType) {
  const g = new THREE.Group();
  const color = new THREE.Color(poopType.color);
  const mat = new THREE.MeshLambertMaterial({ color });

  if (poopType.id === "perfect_poop") {
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xFFD700, emissive: new THREE.Color(0x553300) });
    const poop = buildMiniPoop(goldMat);
    poop.scale.setScalar(1.3);
    g.add(poop);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.65, 0.06, 6, 20),
      new THREE.MeshBasicMaterial({ color: 0xFFFF44 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.55;
    g.add(ring);
  } else if (poopType.id === "dog_water") {
    const mushy = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), mat);
    mushy.scale.set(1.3, 0.45, 1.2);
    mushy.position.y = 0.21;
    g.add(mushy);
    // little drip
    const drip = new THREE.Mesh(new THREE.SphereGeometry(0.14, 7, 6), mat);
    drip.position.set(0.4, 0.08, 0);
    g.add(drip);
  } else if (poopType.id === "pebbly") {
    for (const [px, py, pz] of [[0,0,0],[0.28,0,0.14],[-0.18,0,-0.22],[0.1,0.14,0.26],[-0.28,0.05,-0.1]]) {
      const lump = new THREE.Mesh(new THREE.SphereGeometry(0.14, 7, 6), mat);
      lump.position.set(px, py + 0.14, pz);
      g.add(lump);
    }
  } else {
    g.add(buildMiniPoop(mat));
  }
  return g;
}

function labelTexture(text, color = "#FFE4C4", bg = "#3d1a0d", gold = false) {
  const canvas = document.createElement("canvas");
  canvas.width = 256; canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 256, 64);
  ctx.fillStyle = gold ? "#FFD700" : color;
  ctx.font = "bold 20px 'Comic Sans MS', cursive, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 32);
  return new THREE.CanvasTexture(canvas);
}

// --- Scene builder ---

export function buildPlaza() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x3d1a0d);

  // Lighting: warm lantern-style overhead + fill side
  scene.add(new THREE.AmbientLight(0xffcc88, 0.55));
  const mainLight = new THREE.PointLight(0xffbb66, 2.8, 38);
  mainLight.position.set(0, 7.5, -2);
  scene.add(mainLight);
  const sideLight = new THREE.PointLight(0xffaa44, 1.3, 22);
  sideLight.position.set(-6, 5, -5);
  scene.add(sideLight);

  const wallMat  = new THREE.MeshLambertMaterial({ color: 0x5a2d12 });
  const floorMat = new THREE.MeshLambertMaterial({ color: 0x7a5030 });
  const shelfMat = new THREE.MeshLambertMaterial({ color: 0x9B6B3A });
  const counterMat = new THREE.MeshLambertMaterial({ color: 0x8B5E3C });
  const counterTopMat = new THREE.MeshLambertMaterial({ color: 0xA0724A });

  // Floor
  const floor = new THREE.Mesh(new THREE.BoxGeometry(22, 0.3, 22), floorMat);
  floor.position.set(0, -0.15, 0);
  floor.receiveShadow = true;
  scene.add(floor);

  // Back wall
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(22, 11, 0.4), wallMat);
  backWall.position.set(0, 5.5, -11);
  scene.add(backWall);
  // Front walls (door gap in centre)
  for (const [x] of [[-7, 0], [7, 0]]) {
    const fw = new THREE.Mesh(new THREE.BoxGeometry(4, 11, 0.4), wallMat);
    fw.position.set(x < 0 ? -9 : 9, 5.5, 11);
    scene.add(fw);
  }
  // Left / right walls
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 11, 22), wallMat);
  leftWall.position.set(-11, 5.5, 0);
  scene.add(leftWall);
  const rightWall = leftWall.clone();
  rightWall.position.x = 11;
  scene.add(rightWall);
  // Ceiling
  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(22, 0.4, 22), wallMat);
  ceiling.position.set(0, 11, 0);
  scene.add(ceiling);

  // Interior wall sign "PooPoo Plaza"
  {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 128;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#3d1a0d";
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 46px 'Comic Sans MS', cursive, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("💩 PooPoo Plaza", 256, 64);
    const tex = new THREE.CanvasTexture(c);
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(9, 2.2, 0.12),
      [wallMat, wallMat, wallMat, wallMat,
       new THREE.MeshLambertMaterial({ map: tex }), wallMat]
    );
    sign.position.set(0, 9, -10.8);
    scene.add(sign);
  }

  // Counter
  const counter = new THREE.Mesh(new THREE.BoxGeometry(5.5, 1.2, 1.0), counterMat);
  counter.position.set(0, 0.6, -8);
  scene.add(counter);
  const counterTop = new THREE.Mesh(new THREE.BoxGeometry(5.7, 0.14, 1.15), counterTopMat);
  counterTop.position.set(0, 1.27, -8);
  scene.add(counterTop);

  // Bristol NPC
  const bristol = buildBristol();
  bristol.position.set(0, 0, -9.5);
  scene.add(bristol);

  // Shelves — 3 on each side wall
  const shelfSetup = [
    { x: -9.8, zs: [-7, -3.5, 0],  poopIds: ["pebbly", "lil_lumpy", "dog_water"] },
    { x:  9.8, zs: [-7, -3.5, 0],  poopIds: ["cracked", "sigma_smooth", "perfect_poop"] },
  ];
  for (const { x, zs, poopIds } of shelfSetup) {
    for (let i = 0; i < zs.length; i++) {
      const z = zs[i];
      const poopType = POOP_TYPES.find(p => p.id === poopIds[i]);

      // Shelf plank
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.15, 1.2), shelfMat);
      shelf.position.set(x > 0 ? x - 0.3 : x + 0.3, 2.2, z);
      scene.add(shelf);

      // Poop 3D display on shelf
      const display = buildPoopShelfDisplay(poopType);
      display.scale.setScalar(0.95);
      display.position.set(x > 0 ? x - 0.3 : x + 0.3, 2.35, z);
      scene.add(display);

      // Name label below shelf
      const isGold = poopType.id === "perfect_poop";
      const lTex = labelTexture(`${poopType.emoji} ${poopType.name}`, "#FFE4C4", "#3d1a0d", isGold);
      const label = new THREE.Mesh(
        new THREE.BoxGeometry(1.9, 0.45, 0.06),
        [wallMat, wallMat, wallMat, wallMat,
         new THREE.MeshLambertMaterial({ map: lTex }), wallMat]
      );
      const labelFace = x > 0 ? -1 : 1;
      label.position.set(x > 0 ? x - 0.3 : x + 0.3, 1.7, z + labelFace * 0.55);
      label.rotation.y = x > 0 ? 0 : Math.PI;
      scene.add(label);
    }
  }

  // Exit door glow + sign
  const exitLight = new THREE.PointLight(0x88ff88, 1.8, 10);
  exitLight.position.set(0, 3, 10.5);
  scene.add(exitLight);
  {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 64;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#1a4d0a";
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = "#7eff7e";
    ctx.font = "bold 32px 'Comic Sans MS', cursive, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("🚪 EXIT", 128, 32);
    const tex = new THREE.CanvasTexture(c);
    const es = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.7, 0.1),
      [wallMat, wallMat, wallMat, wallMat,
       new THREE.MeshLambertMaterial({ map: tex }), wallMat]
    );
    es.position.set(0, 4.8, 10.95);
    scene.add(es);
  }

  // Fixed camera looking from player-entry side toward Bristol
  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 4, 8.5);
  camera.lookAt(0, 2.8, -4);

  return { scene, camera, bristol };
}

// --- Trade logic ---

function calculatePoopType(selectedFoods) {
  const entries = Object.entries(selectedFoods).filter(([, c]) => c > 0);
  if (entries.length === 0) return null;

  // Perfect Poop: need ≥3 of EVERY food type selected
  const allCovered = FOODS.every(f => (selectedFoods[f.id] || 0) >= 3);
  if (allCovered) return POOP_TYPES.find(p => p.id === "perfect_poop");

  const total = entries.reduce((s, [, c]) => s + c, 0);
  if (total < 2) return POOP_TYPES.find(p => p.id === "dog_water");

  const foodObjs = entries.flatMap(([id, c]) => {
    const f = FOODS.find(x => x.id === id);
    return f ? Array(c).fill(f) : [];
  });
  const diversity = new Set(foodObjs.map(f => f.organ)).size;
  const score = (diversity / 7) * 60 + Math.min(total, 10) * 4;

  if (score >= 75) return POOP_TYPES.find(p => p.id === "sigma_smooth");
  if (score >= 50) return POOP_TYPES.find(p => p.id === "cracked");
  if (score >= 25) return POOP_TYPES.find(p => p.id === "lil_lumpy");
  return POOP_TYPES.find(p => p.id === "pebbly");
}

function canGetPerfectPoop(backpack) {
  return FOODS.every(f => (backpack[f.id] || 0) >= 3);
}

// Heavenly chord played when Perfect Poop is claimed.
export function playHeavenlySound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Ascending angelic Cmaj7 arpeggio
    const notes = [261.63, 329.63, 392.00, 493.88, 659.26, 783.99];
    for (let i = 0; i < notes.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = notes[i];
      const t = ctx.currentTime + i * 0.13;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 5.5);
    }
  } catch (_) { /* audio context not available */ }
}

// --- Store UI class ---

export class Store {
  constructor(save, doSave, onLeave) {
    this.save = save;
    this.doSave = doSave;
    this.onLeave = onLeave;
    this.selected = {};   // foodId -> count being offered
    this._quoteIdx = Math.floor(Math.random() * BRISTOL_QUOTES.length);
    this._wired = false;
  }

  open() {
    this.save.poops = this.save.poops || {};
    this.selected = {};
    this._quote();
    this._refreshGrid();
    this._refreshPreview();
    this._checkPerfectBanner();
    if (!this._wired) { this._wireButtons(); this._wired = true; }
    document.getElementById("store-panel").classList.remove("hidden");
  }

  close() {
    document.getElementById("store-panel").classList.add("hidden");
    document.getElementById("trade-result-overlay").classList.add("hidden");
  }

  // Bristol's rotating wisdom
  _quote() {
    document.getElementById("bristol-quote").textContent =
      `"${BRISTOL_QUOTES[this._quoteIdx % BRISTOL_QUOTES.length]}"`;
    this._quoteIdx++;
  }

  _checkPerfectBanner() {
    const banner = document.getElementById("perfect-poop-banner");
    if (canGetPerfectPoop(this.save.backpack)) {
      banner.classList.remove("hidden");
    } else {
      banner.classList.add("hidden");
    }
  }

  _refreshGrid() {
    const grid = document.getElementById("trade-food-grid");
    grid.innerHTML = "";
    let any = false;
    for (const food of FOODS) {
      const avail = this.save.backpack[food.id] || 0;
      if (avail === 0) continue;
      any = true;
      const sel = this.selected[food.id] || 0;
      const cell = document.createElement("div");
      cell.className = "trade-food-item" + (sel > 0 ? " selected" : "");
      cell.innerHTML = `
        <div class="tf-emoji">${food.emoji}</div>
        <div class="tf-name">${food.name}</div>
        <div class="tf-row">
          <button class="tf-btn" data-op="minus" data-id="${food.id}">−</button>
          <span class="tf-nums">${sel}<span class="tf-slash">/</span>${avail}</span>
          <button class="tf-btn" data-op="plus" data-id="${food.id}">+</button>
        </div>`;
      grid.appendChild(cell);
    }
    if (!any) {
      grid.innerHTML = `<p class="trade-empty">Backpack empty!<br>Go collect some foods first.</p>`;
    }

    // Bind +/- buttons
    for (const btn of grid.querySelectorAll(".tf-btn")) {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const max = this.save.backpack[id] || 0;
        const cur = this.selected[id] || 0;
        this.selected[id] = btn.dataset.op === "plus"
          ? Math.min(cur + 1, max)
          : Math.max(cur - 1, 0);
        this._refreshGrid();
        this._refreshPreview();
      });
    }
  }

  _refreshPreview() {
    const total = Object.values(this.selected).reduce((a, b) => a + b, 0);
    const poop  = total > 0 ? calculatePoopType(this.selected) : null;

    document.getElementById("trade-count").textContent =
      `Offering: ${total} food${total !== 1 ? "s" : ""}`;

    const emojiEl  = document.getElementById("trade-poop-emoji");
    const nameEl   = document.getElementById("trade-poop-name");
    const typeEl   = document.getElementById("trade-poop-type");
    const rarityEl = document.getElementById("trade-poop-rarity");
    const btn      = document.getElementById("btn-trade");

    if (!poop) {
      emojiEl.textContent  = "❓";
      nameEl.textContent   = "Select some foods!";
      typeEl.textContent   = "";
      rarityEl.textContent = "";
      btn.disabled = true;
      btn.textContent = "💩 Trade!";
      btn.className = "big-btn";
      return;
    }

    emojiEl.textContent  = poop.emoji;
    nameEl.textContent   = poop.name;
    typeEl.textContent   = poop.id === "perfect_poop" ? "✨ MYTHIC ✨" : `Bristol Type ${poop.bristolType}`;
    rarityEl.textContent = typeof poop.rarity === "number"
      ? `Rarity: 1 in ${poop.rarity.toLocaleString()}`
      : `Rarity: ${poop.rarity}`;

    if (poop.id === "perfect_poop") {
      btn.textContent = "✨ Claim Perfect Poop! ✨";
      btn.className = "big-btn perfect-btn";
    } else {
      btn.textContent = "💩 Trade!";
      btn.className = "big-btn";
    }
    btn.disabled = false;
  }

  _wireButtons() {
    document.getElementById("btn-trade").addEventListener("click", () => this._executeTrade());
    document.getElementById("btn-clear-trade").addEventListener("click", () => {
      this.selected = {};
      this._refreshGrid();
      this._refreshPreview();
    });
    document.getElementById("btn-leave-store").addEventListener("click", () => {
      this.close();
      this.onLeave();
    });
    document.getElementById("perfect-poop-banner").addEventListener("click", () => {
      // Auto-fill 3 of each food for the Perfect Poop trade
      for (const food of FOODS) {
        this.selected[food.id] = Math.min(3, this.save.backpack[food.id] || 0);
      }
      this._refreshGrid();
      this._refreshPreview();
    });
    document.getElementById("btn-result-continue").addEventListener("click", () => {
      document.getElementById("trade-result-overlay").classList.add("hidden");
      this._quote();
      this._refreshGrid();
      this._refreshPreview();
      this._checkPerfectBanner();
    });
  }

  _executeTrade() {
    const total = Object.values(this.selected).reduce((a, b) => a + b, 0);
    if (total === 0) return;
    const poop = calculatePoopType(this.selected);
    if (!poop) return;

    // Deduct traded foods
    for (const [id, count] of Object.entries(this.selected)) {
      if (count <= 0) continue;
      this.save.backpack[id] = Math.max(0, (this.save.backpack[id] || 0) - count);
    }

    // Award poop to backpack
    this.save.poops = this.save.poops || {};
    this.save.poops[poop.id] = (this.save.poops[poop.id] || 0) + 1;
    this.doSave();

    if (poop.id === "perfect_poop") playHeavenlySound();

    this.selected = {};
    this._showResult(poop);
  }

  _showResult(poop) {
    document.getElementById("result-poop-emoji").textContent = poop.emoji;
    document.getElementById("result-poop-name").textContent  = poop.name;
    document.getElementById("result-poop-desc").textContent  = poop.description;
    document.getElementById("result-poop-fact").textContent  = poop.bristolFact;

    const overlay = document.getElementById("trade-result-overlay");
    overlay.className = poop.id === "perfect_poop"
      ? "trade-result-overlay perfect-result"
      : "trade-result-overlay";
    overlay.classList.remove("hidden");
  }
}
