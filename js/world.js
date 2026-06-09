// Builds the 3D forest world: terrain, trees, rocks, flowers, lighting.

import * as THREE from "three";

// Gentle rolling hills from layered sine waves (deterministic, no seed needed).
export function terrainHeight(x, z) {
  return (
    Math.sin(x * 0.045) * Math.cos(z * 0.045) * 2.2 +
    Math.sin(x * 0.012 + 3) * Math.cos(z * 0.017 + 1) * 4.0 +
    Math.sin(x * 0.11) * Math.sin(z * 0.13) * 0.5
  );
}

export function buildWorld(scene, level) {
  const half = level.size / 2;

  // Sky + fog
  scene.background = new THREE.Color(level.skyColor);
  scene.fog = new THREE.Fog(level.fogColor, 40, 160);

  // Lighting: warm sun + soft sky bounce
  const sun = new THREE.DirectionalLight(0xfff2cc, 2.2);
  sun.position.set(60, 90, 40);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -120;
  sun.shadow.camera.right = 120;
  sun.shadow.camera.top = 120;
  sun.shadow.camera.bottom = -120;
  sun.shadow.camera.far = 300;
  scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xbfe3ff, 0x4a7c3f, 0.9));

  // Terrain
  const segs = 96;
  const groundGeo = new THREE.PlaneGeometry(level.size, level.size, segs, segs);
  groundGeo.rotateX(-Math.PI / 2);
  const pos = groundGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, terrainHeight(pos.getX(i), pos.getZ(i)));
  }
  groundGeo.computeVertexNormals();
  const ground = new THREE.Mesh(
    groundGeo,
    new THREE.MeshLambertMaterial({ color: level.groundColor })
  );
  ground.receiveShadow = true;
  scene.add(ground);

  // Reusable materials/geometries for instancing-by-hand
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x7a5230 });
  const leafMats = [
    new THREE.MeshLambertMaterial({ color: 0x2d7a35 }),
    new THREE.MeshLambertMaterial({ color: 0x3f9444 }),
    new THREE.MeshLambertMaterial({ color: 0x1f6b2e })
  ];
  const trunkGeo = new THREE.CylinderGeometry(0.25, 0.4, 2.4, 7);
  const leafGeo = new THREE.ConeGeometry(1.6, 3.2, 8);
  const rockGeo = new THREE.DodecahedronGeometry(0.8, 0);
  const rockMat = new THREE.MeshLambertMaterial({ color: 0x95a5a6 });
  const stemGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 4);
  const stemMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });
  const petalGeo = new THREE.SphereGeometry(0.14, 6, 5);
  const petalMats = [
    new THREE.MeshLambertMaterial({ color: 0xff8fb3 }),
    new THREE.MeshLambertMaterial({ color: 0xfff176 }),
    new THREE.MeshLambertMaterial({ color: 0xb39ddb })
  ];

  // Obstacles (trees + rocks) for simple collision: {x, z, radius}
  const obstacles = [];
  const rand = (min, max) => min + Math.random() * (max - min);

  // Keep a clear spawn meadow in the middle
  const clearOfSpawn = (x, z) => Math.hypot(x, z) > 8;

  for (let i = 0; i < level.treeCount; i++) {
    const x = rand(-half + 6, half - 6);
    const z = rand(-half + 6, half - 6);
    if (!clearOfSpawn(x, z)) continue;
    const y = terrainHeight(x, z);
    const s = rand(0.8, 1.8);

    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.2;
    trunk.castShadow = true;
    tree.add(trunk);
    const layers = 2 + Math.floor(Math.random() * 2);
    for (let l = 0; l < layers; l++) {
      const leaf = new THREE.Mesh(leafGeo, leafMats[i % leafMats.length]);
      leaf.position.y = 3 + l * 1.4;
      leaf.scale.setScalar(1 - l * 0.25);
      leaf.castShadow = true;
      tree.add(leaf);
    }
    tree.position.set(x, y, z);
    tree.scale.setScalar(s);
    tree.rotation.y = Math.random() * Math.PI * 2;
    scene.add(tree);
    obstacles.push({ x, z, radius: 0.55 * s });
  }

  for (let i = 0; i < level.rockCount; i++) {
    const x = rand(-half + 4, half - 4);
    const z = rand(-half + 4, half - 4);
    if (!clearOfSpawn(x, z)) continue;
    const s = rand(0.5, 1.6);
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.set(x, terrainHeight(x, z) + 0.3 * s, z);
    rock.scale.setScalar(s);
    rock.rotation.set(Math.random(), Math.random() * Math.PI, Math.random());
    rock.castShadow = true;
    scene.add(rock);
    obstacles.push({ x, z, radius: 0.8 * s });
  }

  for (let i = 0; i < level.flowerCount; i++) {
    const x = rand(-half + 3, half - 3);
    const z = rand(-half + 3, half - 3);
    const y = terrainHeight(x, z);
    const flower = new THREE.Group();
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 0.25;
    flower.add(stem);
    const petal = new THREE.Mesh(petalGeo, petalMats[i % petalMats.length]);
    petal.position.y = 0.55;
    flower.add(petal);
    flower.position.set(x, y, z);
    scene.add(flower);
  }

  // Soft boundary fence of bushes so kids can't walk off the edge
  const bushGeo = new THREE.SphereGeometry(1.4, 7, 6);
  const bushMat = new THREE.MeshLambertMaterial({ color: 0x2e6b2e });
  const step = 6;
  for (let d = -half; d <= half; d += step) {
    for (const [x, z] of [[d, -half], [d, half], [-half, d], [half, d]]) {
      const bush = new THREE.Mesh(bushGeo, bushMat);
      bush.position.set(x, terrainHeight(x, z) + 0.6, z);
      bush.scale.set(1, 0.8, 1);
      scene.add(bush);
    }
  }

  const poopStore = buildPoopStore(scene);
  for (const ob of poopStore.obstacles) obstacles.push(ob);

  return { obstacles, half, poopEntrance: poopStore.entrance };
}

export function buildPoopStore(scene) {
  const STORE_X = -70, STORE_Z = -70;
  const storeY = terrainHeight(STORE_X, STORE_Z);

  const brownMat   = new THREE.MeshLambertMaterial({ color: 0x6B3A2A });
  const darkMat    = new THREE.MeshLambertMaterial({ color: 0x3d1a0a });

  const storeGroup = new THREE.Group();

  // Three stacked squashed spheres — the classic poop swirl
  const scoopData = [
    { r: 4.5, sy: 0.62, y: 2.8 },
    { r: 3.2, sy: 0.78, y: 8.0 },
    { r: 2.0, sy: 0.88, y: 12.6 }
  ];
  for (const s of scoopData) {
    const scoop = new THREE.Mesh(new THREE.SphereGeometry(s.r, 14, 10), brownMat);
    scoop.scale.y = s.sy;
    scoop.position.y = s.y;
    scoop.castShadow = true;
    storeGroup.add(scoop);
  }

  // Swirl tip
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3.2, 8), brownMat);
  tip.position.set(0.7, 16.8, 0);
  tip.rotation.z = -0.35;
  tip.castShadow = true;
  storeGroup.add(tip);

  // Sign with canvas texture
  const signCanvas = document.createElement("canvas");
  signCanvas.width = 512; signCanvas.height = 128;
  const ctx = signCanvas.getContext("2d");
  ctx.fillStyle = "#FFF8E7";
  ctx.roundRect(4, 4, 504, 120, 14);
  ctx.fill();
  ctx.fillStyle = "#5c2e0a";
  ctx.font = "bold 46px 'Comic Sans MS', cursive, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("💩 PooPoo Plaza", 256, 64);
  const signTex = new THREE.CanvasTexture(signCanvas);

  const signFaceMat  = new THREE.MeshLambertMaterial({ map: signTex });
  const signSideMat  = darkMat;
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(6.5, 1.5, 0.35),
    [signSideMat, signSideMat, signSideMat, signSideMat, signFaceMat, signSideMat]
  );
  sign.position.set(0, 5.8, 5.4);
  storeGroup.add(sign);

  // Sign post
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 5.5, 7), darkMat);
  post.position.set(0, 2.75, 5.4);
  storeGroup.add(post);

  // Entrance pillars + lintel
  for (const side of [-3, 3]) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 5.5, 8), darkMat);
    pillar.position.set(side, 2.75, 5);
    pillar.castShadow = true;
    storeGroup.add(pillar);
  }
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(7, 0.7, 0.6), darkMat);
  lintel.position.set(0, 5.65, 5);
  storeGroup.add(lintel);

  storeGroup.position.set(STORE_X, storeY, STORE_Z);
  scene.add(storeGroup);

  return {
    obstacles: [{ x: STORE_X, z: STORE_Z, radius: 5.5 }],
    entrance: { x: STORE_X, z: STORE_Z + 8, r: 7 }
  };
}
