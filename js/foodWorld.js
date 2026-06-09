// Spawns food items in the world, animates them, and handles pickups.

import * as THREE from "three";
import { FOODS } from "../data/foods.js";
import { terrainHeight } from "./world.js";

const PICKUP_RANGE = 2.6;

function buildFoodMesh(food) {
  const g = new THREE.Group();
  const color = new THREE.Color(food.color);
  const mat = new THREE.MeshLambertMaterial({ color });

  switch (food.shape) {
    case "carrot": {
      const body = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.8, 8), mat);
      body.rotation.x = Math.PI; // point down
      body.position.y = 0.4;
      g.add(body);
      const leaf = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 0.3, 6),
        new THREE.MeshLambertMaterial({ color: 0x2e7d32 })
      );
      leaf.position.y = 0.9;
      g.add(leaf);
      break;
    }
    case "berry": {
      // a little cluster of three berries
      for (const [dx, dz] of [[0, 0], [0.22, 0.08], [-0.14, 0.2]]) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 7), mat);
        b.position.set(dx, 0.18, dz);
        g.add(b);
      }
      break;
    }
    case "broccoli": {
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.14, 0.4, 6),
        new THREE.MeshLambertMaterial({ color: 0x9ccc65 })
      );
      stem.position.y = 0.2;
      g.add(stem);
      const top = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 7), mat);
      top.position.y = 0.55;
      top.scale.y = 0.8;
      g.add(top);
      break;
    }
    case "mushroom": {
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.16, 0.4, 8),
        new THREE.MeshLambertMaterial({ color: 0xf5e6cc })
      );
      stem.position.y = 0.2;
      g.add(stem);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat);
      cap.position.y = 0.4;
      g.add(cap);
      break;
    }
    case "nut": {
      const nut = new THREE.Mesh(new THREE.SphereGeometry(0.25, 7, 6), mat);
      nut.position.y = 0.25;
      nut.scale.set(1, 1.15, 0.9);
      g.add(nut);
      break;
    }
    default: { // sphere (apple, orange, pear...)
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 9), mat);
      body.position.y = 0.3;
      g.add(body);
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.15, 4),
        new THREE.MeshLambertMaterial({ color: 0x5d4037 })
      );
      stem.position.y = 0.65;
      g.add(stem);
    }
  }

  // Glowing ring so foods are easy to spot between the trees
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.04, 8, 24),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.05;
  g.add(ring);

  g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  g.scale.setScalar(food.scale * 1.3);
  return g;
}

export class FoodWorld {
  constructor(scene, level) {
    this.scene = scene;
    this.level = level;
    this.items = [];      // { food, mesh, baseY, phase, alive, respawnAt }
    this.time = 0;

    const half = level.size / 2 - 8;
    for (let i = 0; i < level.foodCount; i++) {
      const food = FOODS[i % FOODS.length];
      const x = (Math.random() * 2 - 1) * half;
      const z = (Math.random() * 2 - 1) * half;
      this.spawnItem(food, x, z);
    }
  }

  spawnItem(food, x, z) {
    const mesh = buildFoodMesh(food);
    const baseY = terrainHeight(x, z) + 0.15;
    mesh.position.set(x, baseY, z);
    this.scene.add(mesh);
    this.items.push({
      food, mesh, baseY,
      phase: Math.random() * Math.PI * 2,
      alive: true,
      respawnAt: 0
    });
  }

  // Bob + spin animations, and regrow picked food after the respawn delay.
  update(dt) {
    this.time += dt;
    for (const item of this.items) {
      if (!item.alive) {
        if (this.time >= item.respawnAt) {
          item.alive = true;
          item.mesh.visible = true;
          item.mesh.scale.setScalar(item.food.scale * 1.3);
        }
        continue;
      }
      item.mesh.position.y = item.baseY + 0.15 + Math.sin(this.time * 2 + item.phase) * 0.12;
      item.mesh.rotation.y += dt * 1.2;
    }
  }

  // Closest living food within pickup range of the player, or null.
  nearest(playerPos) {
    let best = null, bestDist = PICKUP_RANGE;
    for (const item of this.items) {
      if (!item.alive) continue;
      const d = Math.hypot(
        item.mesh.position.x - playerPos.x,
        item.mesh.position.z - playerPos.z
      );
      if (d < bestDist) { best = item; bestDist = d; }
    }
    return best;
  }

  pickUp(item) {
    item.alive = false;
    item.mesh.visible = false;
    item.respawnAt = this.time + this.level.respawnSeconds;
    return item.food;
  }
}
