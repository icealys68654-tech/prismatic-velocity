import * as THREE from "three";
import { seedFromImage } from "./seed.js";
import { generateSourceWorld, elementColor } from "./world-source.js";
import { buildWorldMesh } from "./world-mesh.js";
import { buildTraversalRoute } from "./traversal.js";
import { createGenrePrototype, getGenrePrototypeCatalog, prototypeInputForGenre } from "./genre-prototypes.js";
import { createInputController } from "./input-controller.js";
import { buildPrismaticLightField, flowPrismaticLightField } from "./prismatic-light-field.js";

const params = new URLSearchParams(location.search);
const requested = params.get("genre") || "action";
const catalog = getGenrePrototypeCatalog();
const genre = catalog[requested] ? requested : "action";

const seed = await seedFromImage("./seed.png");
const world = generateSourceWorld({ artifact: "seed.png", seed, width: 64, height: 64 });
const route = buildTraversalRoute(world);
const prototype = createGenrePrototype({ genre, world, route });

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02030a);
scene.fog = new THREE.FogExp2(0x030817, 0.0008);
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 12000);
camera.position.set(0, 90, 180);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0x8bdcff, 0x130b2a, 1.4));
const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(80, 180, 60);
scene.add(sun);

const meshData = buildWorldMesh(world);
const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.Float32BufferAttribute(meshData.vertices, 3));
geometry.setAttribute("color", new THREE.Float32BufferAttribute(meshData.colors, 3));
geometry.setIndex(meshData.indices);
geometry.computeVertexNormals();
const terrain = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
  vertexColors: true, metalness: 0.1, roughness: 0.82, wireframe: false,
}));
scene.add(terrain);

const cellSize = 5000 / 63;
const lightField = buildPrismaticLightField(world, { samples: 160, phase: 0.25 });
const positions = new Float32Array(lightField.points.length * 3);
const colors = new Float32Array(lightField.points.length * 3);
lightField.points.forEach((p, i) => {
  const o = i * 3;
  positions[o] = (p.x - 31.5) * cellSize;
  positions[o + 1] = 20 + p.elevation * 130;
  positions[o + 2] = (p.y - 31.5) * cellSize;
  colors[o] = p.color[0]; colors[o + 1] = p.color[1]; colors[o + 2] = p.color[2];
});
const lightGeometry = new THREE.BufferGeometry();
lightGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
lightGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
const lightMaterial = new THREE.PointsMaterial({
  size: 18, vertexColors: true, transparent: true, opacity: 0.55,
  blending: THREE.AdditiveBlending, depthWrite: false,
});
scene.add(new THREE.Points(lightGeometry, lightMaterial));

function addMarker(x, y, z, color, scale = 18) {
  const mesh = new THREE.Mesh(
    new THREE.OctahedronGeometry(scale, 1),
    new THREE.MeshPhysicalMaterial({ color, emissive: color, emissiveIntensity: 1.8, transmission: 0.3, transparent: true, opacity: 0.9 }),
  );
  mesh.position.set(x, y, z);
  scene.add(mesh);
  return mesh;
}

const palette = catalog[genre].palette;
const markers = [];
for (let i = 0; i < 24; i += 1) {
  const cell = route.cells[Math.floor(i * route.cells.length / 24)];
  markers.push(addMarker(
    (cell.x - 31.5) * cellSize,
    18 + Number(cell.elevation || 0) * 120,
    (cell.y - 31.5) * cellSize,
    palette[i % palette.length],
    10 + (i % 4) * 3,
  ));
}

function addGenreGeometry() {
  const definition = catalog[genre];
  const material = new THREE.MeshStandardMaterial({
    color: definition.palette[0], emissive: definition.palette[0], emissiveIntensity: 0.5,
    metalness: 0.5, roughness: 0.35,
  });
  if (["arena", "territory", "bases", "grid"].includes(definition.geometry)) {
    for (let i = 0; i < 12; i += 1) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(60, 8, 60), material);
      s.position.set(((i % 4) - 1.5) * 260, 35 + (i % 3) * 12, (Math.floor(i / 4) - 1) * 260);
      scene.add(s);
    }
  } else if (definition.geometry === "platforms") {
    for (let i = 0; i < 16; i += 1) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(130, 12, 70), material);
      p.position.set((i - 8) * 160, 90 + Math.sin(i * 0.8) * 90, Math.cos(i * 0.5) * 500);
      scene.add(p);
    }
  } else if (definition.geometry === "targets") {
    for (let i = 0; i < 18; i += 1) {
      addMarker((i - 9) * 130, 80 + (i % 3) * 80, -500 - (i % 5) * 170, definition.palette[i % 2], 22);
    }
  } else {
    for (let i = 0; i < 10; i += 1) {
      addMarker((i - 5) * 210, 70 + (i % 2) * 70, -350 - i * 150, definition.palette[i % 2], 28);
    }
  }
}
addGenreGeometry();

const player = addMarker(0, 80, 0, palette[1], 22);
const inputController = createInputController(window);
let previousRuntime = null;
let frame = 0;

const hud = document.createElement("div");
hud.className = "hud";
hud.innerHTML = `
  <div class="title">PRISMATIC EMERGENCE · ${genre.toUpperCase()}</div>
  <div class="objective">${catalog[genre].objective}</div>
  <div class="controls">${catalog[genre].input}</div>
  <div class="state" id="state"></div>
  <div class="genres">${Object.keys(catalog).map((g) => `<a href="?genre=${g}">${g}</a>`).join(" · ")}</div>
`;
document.body.appendChild(hud);

prototype.start();

function animate() {
  requestAnimationFrame(animate);
  frame += 1;
  const raw = inputController.read();
  const input = prototypeInputForGenre(genre, raw);
  const state = prototype.step(input);
  const position = state.position || { x: 0, y: 0, z: 0 };
  player.position.set(position.x, position.y + 35, position.z);
  camera.position.lerp(new THREE.Vector3(position.x, position.y + 150, position.z + 260), 0.055);
  camera.lookAt(position.x, position.y, position.z);

  const flowing = flowPrismaticLightField(lightField, state, previousRuntime);
  flowing.points.forEach((p, i) => {
    const o = i * 3;
    colors[o] = p.color[0] * p.intensity;
    colors[o + 1] = p.color[1] * p.intensity;
    colors[o + 2] = p.color[2] * p.intensity;
  });
  lightGeometry.attributes.color.needsUpdate = true;
  lightMaterial.opacity = 0.45 + Math.sin(frame * 0.04) * 0.1;
  previousRuntime = state;

  document.getElementById("state").textContent =
    `ROUTE ${state.route_index + 1}/${state.route_length} · SCORE ${state.score} · LEVEL ${state.level} · XP ${state.experience} · TURN ${state.turn} · ${state.completed ? "COMPLETE" : "ACTIVE"}`;
  renderer.render(scene, camera);
}
animate();

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
