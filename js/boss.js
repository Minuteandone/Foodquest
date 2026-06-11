// The Gigantic iPad — a screen-time boss battle.
//
// Appears in the back of the map once the player has traded for poop.
// Battle unlock: BOSS.minPoops total poops, BOSS.minFancyPoops of them fancy.
// Attack cycle: 5 hops toward the player → falls flat (crushing trees and
// anyone underneath) → gets up → charges at 2× player speed → repeat.
// The player throws poops (damage = Bristol type number) and can place
// Dog Water puddles that make the iPad slip and fall early.

import * as THREE from "three";
import { POOP_TYPES, ORGANS, BOSS } from "../data/foods.js";
import { terrainHeight } from "./world.js";
import { WALK_SPEED } from "./player.js";

const SPAWN = { x: 0, z: -95 };       // the back of the map
const IPAD_W = 7, IPAD_H = 11, IPAD_D = 0.8;
const GRAVITY = 22;
const INTERACT_RANGE = 11;
const CHARGE_SPEED = WALK_SPEED * BOSS.chargeMultiplier;

const TAUNT = "Quit being outside, come play with me! I will destroy the outdoors and you! Mwahaha!";
const TAUNT_LOCKED = "...The iPad smirks. You don't have enough poop ammo to even scratch it. Check the chart!";
const TAUNT_READY = "Your backpack rumbles with quality poops. You can take this thing DOWN!";
const TAUNT_REMATCH = "Rebooted and angrier! I installed 47 updates just for you! Mwahaha!";

// ---------- iPad model ----------

function drawScreen(canvas, cracked) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;

  // Dark glass with a faint glow
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#22303f");
  grad.addColorStop(1, "#0c1118");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Angry eyes
  ctx.fillStyle = "#ff5252";
  ctx.save();
  ctx.translate(W * 0.32, H * 0.34);
  ctx.rotate(0.35);
  ctx.fillRect(-42, -12, 84, 24);
  ctx.restore();
  ctx.save();
  ctx.translate(W * 0.68, H * 0.34);
  ctx.rotate(-0.35);
  ctx.fillRect(-42, -12, 84, 24);
  ctx.restore();

  // Jagged evil grin
  ctx.strokeStyle = "#ff5252";
  ctx.lineWidth = 10;
  ctx.beginPath();
  const teeth = 6, gw = W * 0.55, gx = W * 0.225, gy = H * 0.58;
  ctx.moveTo(gx, gy);
  for (let i = 1; i <= teeth; i++) {
    ctx.lineTo(gx + (gw / teeth) * (i - 0.5), gy + (i % 2 ? 26 : 6));
    ctx.lineTo(gx + (gw / teeth) * i, gy);
  }
  ctx.stroke();

  // Fingerprints everywhere — it does NOT take care of itself
  for (let i = 0; i < 16; i++) {
    const fx = Math.random() * W, fy = Math.random() * H;
    const rot = Math.random() * Math.PI;
    ctx.strokeStyle = "rgba(220, 225, 235, 0.09)";
    ctx.lineWidth = 2;
    for (let r = 4; r <= 16; r += 3) {
      ctx.beginPath();
      ctx.ellipse(fx, fy, r, r * 1.4, rot, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  // Greasy smudge streaks + crumb stains
  for (let i = 0; i < 7; i++) {
    ctx.strokeStyle = "rgba(200, 200, 210, 0.06)";
    ctx.lineWidth = 12 + Math.random() * 14;
    ctx.lineCap = "round";
    const sx = Math.random() * W, sy = Math.random() * H;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(sx + 50, sy + 60, sx + 20 + Math.random() * 80, sy + 120);
    ctx.stroke();
  }
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = "rgba(150, 110, 50, 0.18)";
    ctx.beginPath();
    ctx.arc(Math.random() * W, Math.random() * H, 3 + Math.random() * 7, 0, Math.PI * 2);
    ctx.fill();
  }

  if (cracked) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + Math.random() * 0.4;
      let px = W / 2, py = H / 2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      for (let s = 0; s < 5; s++) {
        px += Math.cos(a) * (30 + Math.random() * 40) + (Math.random() - 0.5) * 30;
        py += Math.sin(a) * (30 + Math.random() * 40) + (Math.random() - 0.5) * 30;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    // X X eyes over the old ones
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 14;
    for (const ex of [W * 0.32, W * 0.68]) {
      ctx.beginPath();
      ctx.moveTo(ex - 30, H * 0.34 - 30); ctx.lineTo(ex + 30, H * 0.34 + 30);
      ctx.moveTo(ex + 30, H * 0.34 - 30); ctx.lineTo(ex - 30, H * 0.34 + 30);
      ctx.stroke();
    }
  }
}

function buildIpad() {
  // tilt pivots at the BASE of the iPad so falls look like tipping over
  const tilt = new THREE.Group();
  const body = new THREE.Group();
  body.position.y = IPAD_H / 2 + 0.05;
  tilt.add(body);

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(IPAD_W, IPAD_H, IPAD_D),
    new THREE.MeshLambertMaterial({ color: 0x565d66 })
  );
  frame.castShadow = true;
  body.add(frame);

  const canvas = document.createElement("canvas");
  canvas.width = 320; canvas.height = 512;
  drawScreen(canvas, false);
  const screenTex = new THREE.CanvasTexture(canvas);
  const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(IPAD_W - 0.9, IPAD_H - 1.6), screenMat);
  screen.position.z = IPAD_D / 2 + 0.02;
  body.add(screen);

  // Home button + selfie camera
  const button = new THREE.Mesh(
    new THREE.CircleGeometry(0.32, 16),
    new THREE.MeshLambertMaterial({ color: 0x23272d })
  );
  button.position.set(0, -IPAD_H / 2 + 0.55, IPAD_D / 2 + 0.02);
  body.add(button);
  const cam = new THREE.Mesh(
    new THREE.CircleGeometry(0.12, 10),
    new THREE.MeshBasicMaterial({ color: 0x111418 })
  );
  cam.position.set(0, IPAD_H / 2 - 0.5, IPAD_D / 2 + 0.02);
  body.add(cam);

  // World-space anchor for the body centre (used for aiming/hits)
  const center = new THREE.Object3D();
  center.position.y = IPAD_H / 2;
  tilt.add(center);

  return {
    tilt, center,
    redraw(cracked) {
      drawScreen(canvas, cracked);
      screenTex.needsUpdate = true;
    }
  };
}

// Little poop projectile / puddle meshes
function buildThrownPoop(poopType) {
  const g = new THREE.Group();
  const mat = poopType.id === "perfect_poop"
    ? new THREE.MeshLambertMaterial({ color: 0xFFD700, emissive: new THREE.Color(0x553300) })
    : new THREE.MeshLambertMaterial({ color: poopType.color });
  for (const { r, y } of [{ r: 0.28, y: 0 }, { r: 0.2, y: 0.22 }, { r: 0.13, y: 0.38 }]) {
    const scoop = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), mat);
    scoop.position.y = y;
    scoop.scale.y = 0.8;
    g.add(scoop);
  }
  return g;
}

function buildPuddle() {
  const g = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: 0x5a3a1a, transparent: true, opacity: 0.9 });
  const pool = new THREE.Mesh(new THREE.CircleGeometry(1.6, 18), mat);
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = 0.05;
  g.add(pool);
  const shine = new THREE.Mesh(
    new THREE.CircleGeometry(0.9, 14),
    new THREE.MeshBasicMaterial({ color: 0x8a6a3a, transparent: true, opacity: 0.5 })
  );
  shine.rotation.x = -Math.PI / 2;
  shine.position.set(0.25, 0.07, -0.2);
  g.add(shine);
  return g;
}

// ---------- Boss fight ----------

export class BossFight {
  constructor(scene, player, ui, save, env, hooks) {
    this.scene = scene;
    this.player = player;
    this.ui = ui;
    this.save = save;
    this.trees = env.trees;
    this.obstacles = env.obstacles;
    this.half = env.half;
    this.hooks = hooks;          // { save(), setPaused(bool) }

    this.spawned = false;
    this.state = "dormant";      // dormant | idle | battle | defeated
    this.hp = BOSS.hp;
    this.playerHp = 0;
    this.playerMaxHp = 0;
    this.invuln = 0;
    this.phase = null;
    this.time = 0;
    this.throwCooldown = 0;
    this.ammoIdx = 0;

    this.projectiles = [];
    this.puddles = [];
    this.fallingTrees = [];
    this.splats = [];
    this.bossObstacle = { x: SPAWN.x, z: SPAWN.z, radius: 4 };

    this.aimLine = null;
    this.placeRing = null;
  }

  // Spawns the iPad once any poop has ever been traded for.
  maybeSpawn() {
    if (this.spawned) return;
    const total = Object.values(this.save.poops || {}).reduce((a, b) => a + b, 0);
    if (total === 0 && !this.save.bossDefeated) return;

    this.spawned = true;
    this.ipad = buildIpad();
    this.root = new THREE.Group();
    this.root.add(this.ipad.tilt);
    this.root.position.set(SPAWN.x, terrainHeight(SPAWN.x, SPAWN.z), SPAWN.z);
    this.scene.add(this.root);
    this.obstacles.push(this.bossObstacle);

    if (this.save.bossDefeated) {
      this.state = "defeated";
      this.ipad.tilt.rotation.x = -Math.PI / 2;  // lying on its back
      this.ipad.redraw(true);
    } else {
      this.state = "idle";
    }
  }

  canInteract(pos) {
    return this.spawned &&
      (this.state === "idle" || this.state === "defeated") &&
      Math.hypot(pos.x - this.root.position.x, pos.z - this.root.position.z) < INTERACT_RANGE;
  }

  // ----- Requirement gate -----

  requirementStatus() {
    const poops = this.save.poops || {};
    const total = Object.values(poops).reduce((a, b) => a + b, 0);
    const fancy = BOSS.fancyIds.reduce((s, id) => s + (poops[id] || 0), 0);
    return {
      total, fancy,
      ok: total >= BOSS.minPoops && fancy >= BOSS.minFancyPoops
    };
  }

  // Fills the boss dialog: taunt + visual requirement chart.
  fillPanel() {
    const req = this.requirementStatus();
    document.getElementById("boss-taunt").textContent =
      `"${this.state === "defeated" ? TAUNT_REMATCH : TAUNT}"`;
    document.getElementById("boss-subtaunt").textContent =
      req.ok ? TAUNT_READY : TAUNT_LOCKED;

    const fancyNames = POOP_TYPES
      .filter(p => BOSS.fancyIds.includes(p.id))
      .map(p => `${p.emoji} ${p.name}`)
      .join(", ");

    const rows = [
      { icon: "💩", label: `Any poops × ${BOSS.minPoops}`, have: req.total, need: BOSS.minPoops },
      { icon: "✨", label: `Fancy poops × ${BOSS.minFancyPoops} (${fancyNames})`, have: req.fancy, need: BOSS.minFancyPoops }
    ];
    const box = document.getElementById("boss-reqs");
    box.innerHTML = "";
    for (const r of rows) {
      const done = r.have >= r.need;
      const row = document.createElement("div");
      row.className = "req-row" + (done ? " req-done" : "");
      row.innerHTML = `
        <span class="req-icon">${r.icon}</span>
        <div class="req-meta">
          <span class="req-label">${r.label}</span>
          <div class="req-bar"><div class="req-fill" style="width:${Math.min(100, (r.have / r.need) * 100)}%"></div></div>
        </div>
        <span class="req-count">${Math.min(r.have, r.need)}/${r.need}</span>
        <span class="req-check">${done ? "✅" : "❌"}</span>`;
      box.appendChild(row);
    }
    document.getElementById("boss-req-hint").textContent =
      req.ok ? "Battle unlocked! Your HP will be the total value of your poops."
             : "Trade more foods at 💩 PooPoo Plaza to unlock the battle!";
    document.getElementById("btn-start-battle").classList.toggle("hidden", !req.ok);
  }

  // ----- Battle lifecycle -----

  startBattle() {
    this.state = "battle";
    this.hp = BOSS.hp;
    // Player HP = total damage-value of the poops they bring to the fight
    this.playerMaxHp = POOP_TYPES.reduce(
      (s, p) => s + (this.save.poops[p.id] || 0) * p.damage, 0);
    this.playerHp = this.playerMaxHp;
    this.invuln = 0;
    this.ammoIdx = 0;
    this.phase = { name: "stepping", stepsLeft: BOSS.stepsPerCycle, sub: "pause", t: 0 };
    this.ipad.tilt.rotation.x = 0;
    this.ipad.tilt.position.y = 0;   // stop the idle hover
    this.ipad.redraw(false);

    // Aim line + dog water placement ring
    this.aimLine = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0x7CFC00 })
    );
    this.scene.add(this.aimLine);
    this.placeRing = new THREE.Mesh(
      new THREE.RingGeometry(1.3, 1.6, 20),
      new THREE.MeshBasicMaterial({ color: 0x44aaff, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    );
    this.placeRing.rotation.x = -Math.PI / 2;
    this.scene.add(this.placeRing);

    document.getElementById("boss-hp").classList.remove("hidden");
    document.getElementById("player-hp").classList.remove("hidden");
    document.getElementById("ammo-box").classList.remove("hidden");
    document.getElementById("btn-throw-touch").classList.remove("hidden");
    this.refreshBossHp();
    this.refreshPlayerHp();
    this.refreshAmmo();
    this.ui.hidePrompt();
  }

  endBattle(victory) {
    // The forest returns to normal: every knocked-down tree stands back up.
    for (const t of this.trees) {
      if (!t.alive) {
        t.alive = true;
        t.obstacle.radius = t.baseRadius;
        t.mesh.rotation.x = 0;
        t.mesh.rotation.z = 0;
        t.mesh.position.y = terrainHeight(t.x, t.z);
        if (!t.mesh.parent) this.scene.add(t.mesh);
      }
    }
    this.fallingTrees = [];
    for (const p of this.projectiles) this.scene.remove(p.mesh);
    this.projectiles = [];
    for (const p of this.puddles) this.scene.remove(p.mesh);
    this.puddles = [];
    for (const s of this.splats) this.scene.remove(s.mesh);
    this.splats = [];
    if (this.aimLine) { this.scene.remove(this.aimLine); this.aimLine = null; }
    if (this.placeRing) { this.scene.remove(this.placeRing); this.placeRing = null; }

    document.getElementById("boss-hp").classList.add("hidden");
    document.getElementById("player-hp").classList.add("hidden");
    document.getElementById("ammo-box").classList.add("hidden");
    document.getElementById("btn-throw-touch").classList.add("hidden");

    const endEmoji = document.getElementById("battle-end-emoji");
    const endTitle = document.getElementById("battle-end-title");
    const endBody = document.getElementById("battle-end-body");

    if (victory) {
      this.state = "defeated";
      this.save.bossDefeated = true;
      this.ipad.tilt.rotation.x = -Math.PI / 2;
      this.ipad.redraw(true);
      this.root.position.y = terrainHeight(this.root.position.x, this.root.position.z);
      this.bossObstacle.radius = 4;
      // Reward: every organ gets stronger from all that outdoor exercise!
      for (const id of Object.keys(ORGANS)) {
        this.save.organXp[id] = (this.save.organXp[id] || 0) + 25;
      }
      this.ui.refreshOrgans();
      this.ui.refreshPlayerInfo();
      endEmoji.textContent = "🎉🌳";
      endTitle.textContent = "You saved the forest!";
      endBody.textContent =
        "The Gigantic iPad powers down! Screens are fun sometimes, but playing outside " +
        "keeps your whole body strong. Every organ gained +25 XP from the adventure!";
    } else {
      this.state = "idle";
      this.root.position.set(SPAWN.x, terrainHeight(SPAWN.x, SPAWN.z), SPAWN.z);
      this.ipad.tilt.rotation.x = 0;
      this.ipad.tilt.rotation.z = 0;
      this.bossObstacle.x = SPAWN.x;
      this.bossObstacle.z = SPAWN.z;
      this.bossObstacle.radius = 4;
      // Send the player back to the sunny meadow to recover
      this.player.position.set(0, terrainHeight(0, 0), 0);
      this.player.velocityY = 0;
      endEmoji.textContent = "📱😈";
      endTitle.textContent = "The iPad got you!";
      endBody.textContent =
        "Ouch! Rest up, eat well, trade for more poops at 💩 PooPoo Plaza, and try again. " +
        "You've got this!";
    }
    this.hooks.save();
    this.hooks.setPaused(true);
    document.getElementById("battle-end-panel").classList.remove("hidden");
  }

  // ----- HUD -----

  refreshBossHp() {
    const pct = Math.max(0, (this.hp / BOSS.hp) * 100);
    document.getElementById("boss-hp-fill").style.width = `${pct}%`;
    document.getElementById("boss-hp-num").textContent = `${Math.max(0, this.hp)}/${BOSS.hp}`;
  }

  refreshPlayerHp() {
    const pct = this.playerMaxHp > 0 ? Math.max(0, (this.playerHp / this.playerMaxHp) * 100) : 0;
    document.getElementById("player-hp-fill").style.width = `${pct}%`;
    document.getElementById("player-hp-num").textContent =
      `${Math.max(0, this.playerHp)}/${this.playerMaxHp}`;
  }

  ammoList() {
    return POOP_TYPES.filter(p => (this.save.poops[p.id] || 0) > 0);
  }

  currentAmmo() {
    const list = this.ammoList();
    if (list.length === 0) return null;
    this.ammoIdx = ((this.ammoIdx % list.length) + list.length) % list.length;
    return list[this.ammoIdx];
  }

  cycleAmmo(dir) {
    if (this.state !== "battle") return;
    this.ammoIdx += dir;
    this.refreshAmmo();
  }

  refreshAmmo() {
    const ammo = this.currentAmmo();
    const emojiEl = document.getElementById("ammo-emoji");
    const nameEl = document.getElementById("ammo-name");
    const countEl = document.getElementById("ammo-count");
    const hintEl = document.getElementById("ammo-hint");
    if (!ammo) {
      emojiEl.textContent = "😱";
      nameEl.textContent = "Out of poop!";
      countEl.textContent = "";
      hintEl.textContent = "Dodge until the battle ends...";
      return;
    }
    emojiEl.textContent = ammo.emoji;
    nameEl.textContent = ammo.name;
    countEl.textContent = `×${this.save.poops[ammo.id]}`;
    hintEl.textContent = ammo.id === "dog_water"
      ? "Q / click: place slip trap · E: switch"
      : `Q / click: throw (${ammo.damage} dmg) · E: switch`;
  }

  // ----- Player actions -----

  tryThrow() {
    if (this.state !== "battle" || this.throwCooldown > 0) return;
    const ammo = this.currentAmmo();
    if (!ammo) return;
    this.throwCooldown = 0.4;

    this.save.poops[ammo.id] -= 1;
    this.hooks.save();

    if (ammo.id === "dog_water") {
      // Place a slippery puddle at the player's feet
      const mesh = buildPuddle();
      mesh.position.set(
        this.player.position.x,
        terrainHeight(this.player.position.x, this.player.position.z) + 0.05,
        this.player.position.z
      );
      this.scene.add(mesh);
      this.puddles.push({ x: mesh.position.x, z: mesh.position.z, mesh });
    } else {
      const { origin, vel, inRange } = this.computeArc();
      const mesh = buildThrownPoop(ammo);
      mesh.position.copy(origin);
      this.scene.add(mesh);
      this.projectiles.push({ mesh, vel: vel.clone(), poop: ammo, life: 4, inRange });
    }
    this.refreshAmmo();
  }

  // Lobbed arc from the player toward the iPad (auto-aimed, capped at
  // BOSS.throwRange — out-of-range throws fall short, so get closer!).
  computeArc() {
    const origin = new THREE.Vector3(
      this.player.position.x, this.player.position.y + 1.7, this.player.position.z);
    const target = new THREE.Vector3();
    this.ipad.center.getWorldPosition(target);

    const flat = new THREE.Vector3(target.x - origin.x, 0, target.z - origin.z);
    const dist = flat.length();
    const inRange = dist <= BOSS.throwRange;
    const reach = Math.min(dist, BOSS.throwRange);
    if (dist > 0.001) flat.normalize();

    const T = THREE.MathUtils.clamp(reach / 16, 0.45, 1.5);
    const dy = inRange ? (target.y - origin.y) : -origin.y;
    const vel = new THREE.Vector3(
      flat.x * (reach / T),
      dy / T + 0.5 * GRAVITY * T,
      flat.z * (reach / T)
    );
    return { origin, vel, target, inRange, T };
  }

  hitPlayer(dir) {
    if (this.invuln > 0 || this.state !== "battle") return;
    this.invuln = 1.5;
    this.playerHp -= BOSS.hitDamage;
    this.refreshPlayerHp();
    // Knockback + a little pop in the air
    const k = dir.clone().setY(0).normalize();
    const limit = this.half - 3;
    this.player.position.x = THREE.MathUtils.clamp(this.player.position.x + k.x * 6, -limit, limit);
    this.player.position.z = THREE.MathUtils.clamp(this.player.position.z + k.z * 6, -limit, limit);
    this.player.velocityY = 6;
    this.player.isGrounded = false;
    document.getElementById("player-hp").classList.add("hp-flash");
    setTimeout(() => document.getElementById("player-hp").classList.remove("hp-flash"), 400);
    if (this.playerHp <= 0) this.endBattle(false);
  }

  damageBoss(amount) {
    if (this.state !== "battle") return;
    this.hp -= amount;
    this.refreshBossHp();
    if (this.hp <= 0) {
      this.phase = { name: "dying", t: 0 };
    }
  }

  // ----- Helpers -----

  faceDir(dir) {
    this.root.rotation.y = Math.atan2(dir.x, dir.z);
  }

  dirToPlayer() {
    const d = new THREE.Vector3(
      this.player.position.x - this.root.position.x, 0,
      this.player.position.z - this.root.position.z);
    return d.length() > 0.001 ? d.normalize() : new THREE.Vector3(0, 0, 1);
  }

  crushTreesNear(x, z, radius) {
    for (const t of this.trees) {
      if (!t.alive) continue;
      if (Math.hypot(t.x - x, t.z - z) < radius) this.knockDownTree(t);
    }
  }

  knockDownTree(t) {
    t.alive = false;
    t.obstacle.radius = 0;
    // Fall away from the boss
    const away = Math.atan2(t.x - this.root.position.x, t.z - this.root.position.z);
    this.fallingTrees.push({ tree: t, t: 0, dir: away });
  }

  // The iPad lands flat: crush trees and maybe the player under its body.
  land(dir, slipped) {
    const foot = this.root.position;
    const perp = new THREE.Vector3(-dir.z, 0, dir.x);
    const test = (x, z) => {
      const rx = x - foot.x, rz = z - foot.z;
      const along = rx * dir.x + rz * dir.z;
      const side = Math.abs(rx * perp.x + rz * perp.z);
      return along > 0.5 && along < IPAD_H + 1 && side < IPAD_W / 2 + 1;
    };
    for (const t of this.trees) {
      if (t.alive && test(t.x, t.z)) this.knockDownTree(t);
    }
    if (test(this.player.position.x, this.player.position.z)) {
      this.hitPlayer(dir);
    }
    if (slipped) {
      const dogWater = POOP_TYPES.find(p => p.id === "dog_water");
      this.damageBoss(dogWater ? dogWater.damage : 5);
    }
  }

  checkPuddleSlip(moveDir) {
    for (let i = 0; i < this.puddles.length; i++) {
      const p = this.puddles[i];
      if (Math.hypot(p.x - this.root.position.x, p.z - this.root.position.z) < 2.4) {
        this.scene.remove(p.mesh);
        this.puddles.splice(i, 1);
        this.ipad.tilt.rotation.x = 0;
        this.phase = { name: "slipped", t: 0, dir: moveDir.clone() };
        return true;
      }
    }
    return false;
  }

  clampToWorld(v) {
    const limit = this.half - 4;
    v.x = THREE.MathUtils.clamp(v.x, -limit, limit);
    v.z = THREE.MathUtils.clamp(v.z, -limit, limit);
    return v;
  }

  // ----- Per-frame update -----

  update(dt) {
    if (!this.spawned) return;
    this.time += dt;
    this.throwCooldown = Math.max(0, this.throwCooldown - dt);
    this.invuln = Math.max(0, this.invuln - dt);

    // Idle hover so it looks alive (and smug)
    if (this.state === "idle") {
      this.ipad.tilt.position.y = Math.sin(this.time * 1.5) * 0.25 + 0.25;
      this.ipad.tilt.rotation.z = Math.sin(this.time * 0.8) * 0.03;
      this.faceDir(this.dirToPlayer());
    }

    // Falling tree animation (runs in and out of battle)
    for (let i = this.fallingTrees.length - 1; i >= 0; i--) {
      const f = this.fallingTrees[i];
      f.t += dt;
      const k = Math.min(1, f.t / 0.9);
      f.tree.mesh.rotation.x = Math.cos(f.dir - f.tree.mesh.rotation.y) * (Math.PI / 2) * k * k;
      f.tree.mesh.rotation.z = Math.sin(f.dir - f.tree.mesh.rotation.y) * (Math.PI / 2) * k * k;
      if (k >= 1) this.fallingTrees.splice(i, 1);
    }

    // Splat fade
    for (let i = this.splats.length - 1; i >= 0; i--) {
      const s = this.splats[i];
      s.t += dt;
      s.mesh.scale.setScalar(1 + s.t * 1.5);
      s.mesh.material.opacity = Math.max(0, 0.85 - s.t);
      if (s.t > 1) { this.scene.remove(s.mesh); this.splats.splice(i, 1); }
    }

    if (this.state !== "battle") return;

    this.updatePhase(dt);
    this.updateProjectiles(dt);
    this.updateAim();

    // Boss collision circle follows it while upright
    this.bossObstacle.x = this.root.position.x;
    this.bossObstacle.z = this.root.position.z;
    const upright = Math.abs(this.ipad.tilt.rotation.x) < 0.6;
    this.bossObstacle.radius = upright ? 3.5 : 0;
  }

  updatePhase(dt) {
    const p = this.phase;
    if (!p) return;
    p.t += dt;

    switch (p.name) {
      case "stepping": {
        // 5 hops toward the player, then the big slam
        if (p.sub === "pause") {
          if (p.t >= 0.35) {
            p.sub = "hop"; p.t = 0;
            p.from = this.root.position.clone();
            p.dir = this.dirToPlayer();
            this.faceDir(p.dir);
          }
        } else {
          const k = Math.min(1, p.t / 0.4);
          const pos = p.from.clone().addScaledVector(p.dir, BOSS.stepDistance * k);
          this.clampToWorld(pos);
          pos.y = terrainHeight(pos.x, pos.z) + Math.sin(k * Math.PI) * 1.4;
          this.root.position.copy(pos);
          this.crushTreesNear(pos.x, pos.z, 3.2);
          if (this.checkPuddleSlip(p.dir)) break;
          if (k >= 1) {
            this.root.position.y = terrainHeight(pos.x, pos.z);
            p.stepsLeft -= 1;
            p.t = 0;
            if (p.stepsLeft <= 0) {
              this.phase = { name: "slam_wind", t: 0, dir: this.dirToPlayer() };
              this.faceDir(this.phase.dir);
            } else {
              p.sub = "pause";
            }
          }
        }
        break;
      }
      case "slam_wind": {
        // Lean back... telegraphing the fall so kids can dodge
        this.ipad.tilt.rotation.x = -0.35 * Math.min(1, p.t / 0.7);
        if (p.t >= 0.7) this.phase = { name: "slam_fall", t: 0, dir: p.dir };
        break;
      }
      case "slam_fall": {
        const k = Math.min(1, p.t / 0.45);
        this.ipad.tilt.rotation.x = -0.35 + (Math.PI / 2 + 0.35) * k * k;
        if (k >= 1) {
          this.land(p.dir, false);
          this.phase = { name: "down", t: 0 };
        }
        break;
      }
      case "slipped": {
        // Wheels-out slip — faster, clumsier fall that hurts the iPad
        this.ipad.tilt.rotation.x = (Math.PI / 2) * Math.min(1, p.t / 0.3);
        this.ipad.tilt.rotation.z = Math.sin(p.t * 25) * 0.1 * (1 - p.t / 0.3);
        if (p.t >= 0.3) {
          this.ipad.tilt.rotation.z = 0;
          this.land(p.dir, true);
          this.phase = { name: "down", t: 0, long: true };
        }
        break;
      }
      case "down": {
        if (p.t >= (p.long ? 2.2 : 1.3)) this.phase = { name: "rise", t: 0 };
        break;
      }
      case "rise": {
        this.ipad.tilt.rotation.x = (Math.PI / 2) * (1 - Math.min(1, p.t / 0.8));
        if (p.t >= 0.8) {
          this.ipad.tilt.rotation.x = 0;
          this.phase = { name: "charge_wind", t: 0 };
        }
        break;
      }
      case "charge_wind": {
        // Revving up: angry shaking
        this.ipad.tilt.rotation.z = Math.sin(this.time * 30) * 0.06;
        this.faceDir(this.dirToPlayer());
        if (p.t >= 0.7) {
          this.ipad.tilt.rotation.z = 0;
          this.phase = { name: "charging", t: 0, dir: this.dirToPlayer() };
          this.faceDir(this.phase.dir);
        }
        break;
      }
      case "charging": {
        // Full speed at 2× the player's walk speed
        this.ipad.tilt.rotation.x = 0.22;
        const pos = this.root.position;
        pos.addScaledVector(p.dir, CHARGE_SPEED * dt);
        const limit = this.half - 4;
        const hitWall = Math.abs(pos.x) >= limit || Math.abs(pos.z) >= limit;
        this.clampToWorld(pos);
        pos.y = terrainHeight(pos.x, pos.z);
        this.crushTreesNear(pos.x, pos.z, 3.6);
        if (this.checkPuddleSlip(p.dir)) break;
        const dPlayer = Math.hypot(
          this.player.position.x - pos.x, this.player.position.z - pos.z);
        if (dPlayer < 3.8) {
          this.hitPlayer(p.dir);
          this.ipad.tilt.rotation.x = 0;
          this.phase = { name: "stepping", stepsLeft: BOSS.stepsPerCycle, sub: "pause", t: 0 };
        } else if (p.t >= 3.5 || hitWall) {
          this.ipad.tilt.rotation.x = 0;
          this.phase = { name: "stepping", stepsLeft: BOSS.stepsPerCycle, sub: "pause", t: 0 };
        }
        break;
      }
      case "dying": {
        // Dramatic topple backward, then victory
        this.ipad.tilt.rotation.x = -(Math.PI / 2) * Math.min(1, p.t / 0.9);
        this.ipad.tilt.rotation.z = Math.sin(p.t * 18) * 0.08 * (1 - Math.min(1, p.t / 0.9));
        if (p.t >= 1.2) {
          this.ipad.tilt.rotation.z = 0;
          this.phase = null;
          this.endBattle(true);
        }
        break;
      }
    }
  }

  updateProjectiles(dt) {
    const bossCenter = new THREE.Vector3();
    this.ipad.center.getWorldPosition(bossCenter);

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      pr.life -= dt;
      pr.vel.y -= GRAVITY * dt;
      pr.mesh.position.addScaledVector(pr.vel, dt);
      pr.mesh.rotation.x += dt * 8;

      const ground = terrainHeight(pr.mesh.position.x, pr.mesh.position.z);
      const hitBoss = this.state === "battle" &&
        pr.mesh.position.distanceTo(bossCenter) < 4.2;

      if (hitBoss) {
        this.spawnSplat(pr.mesh.position, pr.poop);
        this.damageBoss(pr.poop.damage);
      }
      if (hitBoss || pr.mesh.position.y <= ground || pr.life <= 0) {
        if (!hitBoss) this.spawnSplat(pr.mesh.position.setY(ground + 0.2), pr.poop);
        this.scene.remove(pr.mesh);
        this.projectiles.splice(i, 1);
      }
    }
  }

  spawnSplat(pos, poop) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 8, 6),
      new THREE.MeshBasicMaterial({
        color: poop.id === "perfect_poop" ? 0xFFD700 : poop.color,
        transparent: true, opacity: 0.85
      })
    );
    mesh.scale.y = 0.4;
    mesh.position.copy(pos);
    this.scene.add(mesh);
    this.splats.push({ mesh, t: 0 });
  }

  // Aiming line: a green arc when the iPad is in range, red when too far.
  // With Dog Water selected, a blue ring shows where the trap will go.
  updateAim() {
    const ammo = this.currentAmmo();

    if (!ammo) {
      this.aimLine.visible = false;
      this.placeRing.visible = false;
      return;
    }

    if (ammo.id === "dog_water") {
      this.aimLine.visible = false;
      this.placeRing.visible = true;
      this.placeRing.position.set(
        this.player.position.x,
        terrainHeight(this.player.position.x, this.player.position.z) + 0.1,
        this.player.position.z
      );
      return;
    }

    this.placeRing.visible = false;
    this.aimLine.visible = true;
    const { origin, vel, inRange, T } = this.computeArc();
    const pts = [];
    const steps = 22;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * T;
      pts.push(new THREE.Vector3(
        origin.x + vel.x * t,
        origin.y + vel.y * t - 0.5 * GRAVITY * t * t,
        origin.z + vel.z * t
      ));
    }
    this.aimLine.geometry.setFromPoints(pts);
    this.aimLine.material.color.set(inRange ? 0x7CFC00 : 0xff5555);
  }
}
