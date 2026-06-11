// Player character, keyboard + touch controls, and a follow camera.

import * as THREE from "three";
import { terrainHeight } from "./world.js";

export const WALK_SPEED = 6;
const RUN_SPEED = 10;
const PLAYER_RADIUS = 0.5;

export class Player {
  constructor(scene, camera, startPos) {
    this.camera = camera;
    this.position = new THREE.Vector3(startPos.x, 0, startPos.z);
    this.heading = 0;          // direction the character model faces
    this.cameraYaw = 0;        // orbit angle around the player
    this.cameraPitch = 0.35;
    this.keys = {};
    this.joystick = { active: false, x: 0, y: 0 };
    this.walkCycle = 0;
    this.velocityY = 0;
    this.isGrounded = true;
    this.jumpWasDown = false;
    // Pluggable environment: forest uses rolling terrain, the plaza
    // swaps in a flat floor, a closer camera, and room bounds.
    this.groundFn = terrainHeight;
    this.cameraDist = 9;
    this.cameraBounds = null;   // {minX,maxX,minZ,maxZ,maxY} or null

    this.mesh = this.buildCharacter();
    scene.add(this.mesh);

    this.bindKeyboard();
    this.bindCameraDrag();
  }

  buildCharacter() {
    const g = new THREE.Group();
    const skin = new THREE.MeshLambertMaterial({ color: 0xffd9b3 });
    const shirt = new THREE.MeshLambertMaterial({ color: 0x4fc3f7 });
    const pants = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
    const packMat = new THREE.MeshLambertMaterial({ color: 0xe74c3c });

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 0.5, 4, 10), shirt);
    body.position.y = 0.95;
    body.castShadow = true;
    g.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), skin);
    head.position.y = 1.7;
    head.castShadow = true;
    g.add(head);

    // Backpack — it's a food quest, after all
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.55, 0.25), packMat);
    pack.position.set(0, 1.05, -0.35);
    pack.castShadow = true;
    g.add(pack);

    this.legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.35, 4, 8), pants);
    this.legL.position.set(-0.16, 0.35, 0);
    g.add(this.legL);
    this.legR = this.legL.clone();
    this.legR.position.x = 0.16;
    g.add(this.legR);

    this.armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.35, 4, 8), skin);
    this.armL.position.set(-0.48, 1.05, 0);
    g.add(this.armL);
    this.armR = this.armL.clone();
    this.armR.position.x = 0.48;
    g.add(this.armR);

    return g;
  }

  bindKeyboard() {
    window.addEventListener("keydown", (e) => { this.keys[e.code] = true; });
    window.addEventListener("keyup", (e) => { this.keys[e.code] = false; });
    window.addEventListener("blur", () => { this.keys = {}; });
  }

  // Mouse drag (or touch drag on the right half of the screen) orbits the camera.
  bindCameraDrag() {
    const canvas = document.getElementById("game-canvas");
    let dragging = false, lastX = 0, lastY = 0, touchId = null;

    canvas.addEventListener("mousedown", (e) => {
      dragging = true; lastX = e.clientX; lastY = e.clientY;
    });
    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      this.orbit(e.clientX - lastX, e.clientY - lastY);
      lastX = e.clientX; lastY = e.clientY;
    });
    window.addEventListener("mouseup", () => { dragging = false; });

    canvas.addEventListener("touchstart", (e) => {
      for (const t of e.changedTouches) {
        if (t.clientX > window.innerWidth / 2 && touchId === null) {
          touchId = t.identifier; lastX = t.clientX; lastY = t.clientY;
        }
      }
    }, { passive: true });
    canvas.addEventListener("touchmove", (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === touchId) {
          this.orbit(t.clientX - lastX, t.clientY - lastY);
          lastX = t.clientX; lastY = t.clientY;
        }
      }
    }, { passive: true });
    canvas.addEventListener("touchend", (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === touchId) touchId = null;
      }
    });
  }

  orbit(dx, dy) {
    this.cameraYaw -= dx * 0.005;
    this.cameraPitch = THREE.MathUtils.clamp(this.cameraPitch + dy * 0.004, 0.1, 1.2);
  }

  // Combined input vector from keyboard and joystick, in camera space.
  inputVector() {
    let x = 0, y = 0;
    if (this.keys["KeyW"] || this.keys["ArrowUp"]) y -= 1;
    if (this.keys["KeyS"] || this.keys["ArrowDown"]) y += 1;
    if (this.keys["KeyA"] || this.keys["ArrowLeft"]) x -= 1;
    if (this.keys["KeyD"] || this.keys["ArrowRight"]) x += 1;
    if (this.joystick.active) { x += this.joystick.x; y += this.joystick.y; }
    const len = Math.hypot(x, y);
    if (len > 1) { x /= len; y /= len; }
    return { x, y };
  }

  update(dt, obstacles, worldHalf) {
    const input = this.inputVector();
    const moving = input.x !== 0 || input.y !== 0;

    if (moving) {
      const speed = (this.keys["ShiftLeft"] || this.keys["ShiftRight"]) ? RUN_SPEED : WALK_SPEED;
      // Move relative to where the camera is looking
      const sin = Math.sin(this.cameraYaw), cos = Math.cos(this.cameraYaw);
      const dx = (input.x * cos - input.y * sin) * speed * dt;
      const dz = (input.x * sin + input.y * cos) * speed * dt;

      let nx = this.position.x + dx;
      let nz = this.position.z + dz;

      // Stay inside the world
      const limit = worldHalf - 2;
      nx = THREE.MathUtils.clamp(nx, -limit, limit);
      nz = THREE.MathUtils.clamp(nz, -limit, limit);

      // Push out of trees/rocks (circle collision, slide along)
      for (const ob of obstacles) {
        const ox = nx - ob.x, oz = nz - ob.z;
        const dist = Math.hypot(ox, oz);
        const minDist = ob.radius + PLAYER_RADIUS;
        if (dist < minDist && dist > 0.0001) {
          nx = ob.x + (ox / dist) * minDist;
          nz = ob.z + (oz / dist) * minDist;
        }
      }

      this.position.x = nx;
      this.position.z = nz;
      this.heading = Math.atan2(dx, dz);

      // Little walk bounce
      this.walkCycle += dt * 10;
      const swing = Math.sin(this.walkCycle) * 0.5;
      this.legL.rotation.x = swing;
      this.legR.rotation.x = -swing;
      this.armL.rotation.x = -swing * 0.7;
      this.armR.rotation.x = swing * 0.7;
    } else {
      this.legL.rotation.x *= 0.8;
      this.legR.rotation.x *= 0.8;
      this.armL.rotation.x *= 0.8;
      this.armR.rotation.x *= 0.8;
    }

    // Jump (edge-triggered so holding Space doesn't multi-jump)
    const jumpDown = !!this.keys["Space"];
    if (jumpDown && !this.jumpWasDown && this.isGrounded) {
      this.velocityY = 9;
      this.isGrounded = false;
    }
    this.jumpWasDown = jumpDown;

    // Gravity + vertical movement
    this.velocityY -= 22 * dt;
    this.position.y += this.velocityY * dt;

    // Clamp to the ground so we land properly
    const ground = this.groundFn(this.position.x, this.position.z);
    if (this.position.y <= ground) {
      this.position.y = ground;
      this.velocityY = 0;
      this.isGrounded = true;
    }

    this.mesh.position.copy(this.position);
    if (moving) {
      this.mesh.rotation.y = lerpAngle(this.mesh.rotation.y, this.heading, Math.min(1, dt * 10));
    }

    this.updateCamera(dt);
  }

  updateCamera(dt) {
    const dist = this.cameraDist;
    const cx = this.position.x + Math.sin(this.cameraYaw) * dist * Math.cos(this.cameraPitch);
    const cz = this.position.z + Math.cos(this.cameraYaw) * dist * Math.cos(this.cameraPitch);
    const cy = this.position.y + 2 + Math.sin(this.cameraPitch) * dist;
    const target = new THREE.Vector3(cx, Math.max(cy, this.groundFn(cx, cz) + 1.2), cz);
    // Keep the camera inside the room when indoors
    if (this.cameraBounds) {
      const b = this.cameraBounds;
      target.x = THREE.MathUtils.clamp(target.x, b.minX, b.maxX);
      target.z = THREE.MathUtils.clamp(target.z, b.minZ, b.maxZ);
      target.y = Math.min(target.y, b.maxY);
    }
    this.camera.position.lerp(target, Math.min(1, dt * 6));
    this.camera.lookAt(this.position.x, this.position.y + 1.4, this.position.z);
  }

  triggerJump() {
    if (this.isGrounded) {
      this.velocityY = 9;
      this.isGrounded = false;
      this.jumpWasDown = true;
    }
  }
}

// Interpolate angles the short way around so the character doesn't spin.
function lerpAngle(a, b, t) {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

// On-screen joystick for touch devices (bottom-left of the screen).
export function setupJoystick(player) {
  const zone = document.getElementById("touch-joystick");
  const base = document.getElementById("joystick-base");
  const thumb = document.getElementById("joystick-thumb");
  const RADIUS = 50;
  let touchId = null, originX = 0, originY = 0;

  zone.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    touchId = t.identifier;
    originX = t.clientX; originY = t.clientY;
    base.style.left = `${originX}px`;
    base.style.top = `${originY}px`;
    base.classList.add("active");
    player.joystick.active = true;
  }, { passive: false });

  zone.addEventListener("touchmove", (e) => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier !== touchId) continue;
      let dx = t.clientX - originX, dy = t.clientY - originY;
      const len = Math.hypot(dx, dy);
      if (len > RADIUS) { dx = dx / len * RADIUS; dy = dy / len * RADIUS; }
      thumb.style.transform = `translate(${dx}px, ${dy}px)`;
      player.joystick.x = dx / RADIUS;
      player.joystick.y = dy / RADIUS;
    }
  }, { passive: false });

  const end = (e) => {
    for (const t of e.changedTouches) {
      if (t.identifier !== touchId) continue;
      touchId = null;
      player.joystick.active = false;
      player.joystick.x = 0; player.joystick.y = 0;
      thumb.style.transform = "translate(0px, 0px)";
      base.classList.remove("active");
    }
  };
  zone.addEventListener("touchend", end);
  zone.addEventListener("touchcancel", end);
}
