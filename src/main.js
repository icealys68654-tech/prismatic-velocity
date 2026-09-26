import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { seedFromImage, PRISMATIC_SEED_VERSION } from "./seed.js";
import { IntegrationCoordinator } from "./integrations.js";

const seed = await seedFromImage("./seed.png");
const coordinator = new IntegrationCoordinator({
  runtime: "prismatic-velocity",
  seed,
  version: PRISMATIC_SEED_VERSION,
});
const provenance = { source_artifact:"seed.png", seed, algorithm_version:"1", grid_resolution:"64x64", generated_at:new Date().toISOString(), generator:"Transmutation World / Prismatic Velocity" };
console.info("PROVENANCE", provenance, { coordinator, PRISMATIC_SEED_VERSION });

const adapterState = {
  boa: "idle",
  holocron: "idle",
  lastError: null,
  frameCount: 0,
};

const statusEl = document.getElementById("status");
const adapterEl = document.createElement("div");
adapterEl.id = "adapter-status";
adapterEl.style.marginTop = "8px";
adapterEl.style.fontSize = "11px";
adapterEl.style.opacity = "0.9";
statusEl.appendChild(adapterEl);

function refreshAdapterStatus() {
  adapterEl.textContent = `ADAPTERS: BOA ${adapterState.boa.toUpperCase()} • HOLOCRON ${adapterState.holocron.toUpperCase()}`;
  if (adapterState.lastError) {
    adapterEl.title = adapterState.lastError;
  } else {
    adapterEl.title = "Adapters online";
  }
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02030a);
scene.fog = new THREE.FogExp2(0x030817, 0.00075);

const camera = new THREE.PerspectiveCamera(76, innerWidth/innerHeight, 0.1, 12000);
camera.position.set(0, 4, 12);

const renderer = new THREE.WebGLRenderer({ antialias:true, powerPreference:"high-performance" });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight), 1.35, 0.65, 0.16));

scene.add(new THREE.HemisphereLight(0x8bdcff,0x130b2a,1.25));
const sun = new THREE.DirectionalLight(0xffffff,3.0);
sun.position.set(80,140,40); sun.castShadow=true; scene.add(sun);

const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(4500*3);
for(let i=0;i<starPos.length;i+=3){ starPos[i]=(Math.random()-.5)*9000; starPos[i+1]=(Math.random()-.1)*3500; starPos[i+2]=(Math.random()-.5)*9000; }
starGeo.setAttribute("position",new THREE.BufferAttribute(starPos,3));
scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xaedcff,size:3,sizeAttenuation:true})));

function rngFactory(n){ let t=n>>>0; return ()=>((t=(t*1664525+1013904223)>>>0)/4294967296); }
const rng=rngFactory(seed);
const palette=[0x00d9ff,0x7b2cff,0xff2b12,0xffdf22,0x4dff74];

function makeTrack(){
  const pts=[], count=420;
  for(let i=0;i<count;i++){
    const t=i/count*Math.PI*2;
    const r=250 + 55*Math.sin(3*t+seed*.001) + 32*Math.sin(7*t);
    const y=22*Math.sin(2*t)+10*Math.sin(5*t+1.4);
    pts.push(new THREE.Vector3(Math.cos(t)*r,y,Math.sin(t)*r));
  }
  const curve=new THREE.CatmullRomCurve3(pts,true,"centripetal",0.25);
  const roadGeo=new THREE.TubeGeometry(curve,900,8,16,true);
  const road=new THREE.Mesh(roadGeo,new THREE.MeshStandardMaterial({color:0x101522,metalness:.85,roughness:.3}));
  road.receiveShadow=true; scene.add(road);

  const glowMat=new THREE.MeshBasicMaterial({color:0x16d8ff});
  for(let i=0;i<90;i++){
    const p=curve.getPointAt(i/90), q=curve.getPointAt((i+.006)%1);
    const dir=q.clone().sub(p).normalize();
    const side=new THREE.Vector3(-dir.z,0,dir.x).normalize();
    for(const s of [-1,1]){
      const m=new THREE.Mesh(new THREE.BoxGeometry(.22,.18,12),glowMat);
      m.position.copy(p).add(side.multiplyScalar(s*7.3)); m.lookAt(q); scene.add(m);
    }
  }
  return curve;
}
const track=makeTrack();

function terrain(){
  const g=new THREE.PlaneGeometry(5000,5000,180,180);
  const pos=g.attributes.position;
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i), z=pos.getY(i);
    const h=18*Math.sin(x*.006+seed*.00001)*Math.cos(z*.005)+
      9*Math.sin(x*.021+z*.014)+4*Math.sin(x*.08-z*.06);
    pos.setZ(i,h);
  }
  g.rotateX(-Math.PI/2);
  const m=new THREE.MeshStandardMaterial({color:0x07121a,metalness:.05,roughness:.95});
  const mesh=new THREE.Mesh(g,m); mesh.receiveShadow=true; scene.add(mesh);
}
terrain();

function crystal(x,y,z,s,c){
  const g=new THREE.OctahedronGeometry(s,1);
  const m=new THREE.MeshPhysicalMaterial({color:c,emissive:c,emissiveIntensity:2.2,metalness:.1,roughness:.15,transmission:.25,transparent:true,opacity:.92});
  const o=new THREE.Mesh(g,m); o.position.set(x,y,z); o.rotation.set(rng()*2,rng()*2,rng()*2); scene.add(o);
}
for(let i=0;i<160;i++){
  const a=rng()*Math.PI*2, r=360+rng()*1300;
  crystal(Math.cos(a)*r,10+rng()*100,Math.sin(a)*r,4+rng()*22,palette[(rng()*palette.length)|0]);
}

function bike(color=0x00eaff){
  const group=new THREE.Group();
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.8,3.4,8,16),new THREE.MeshPhysicalMaterial({color,metalness:.85,roughness:.16,emissive:color,emissiveIntensity:.65}));
  body.rotation.x=Math.PI/2; body.scale.set(1,.55,1); group.add(body);
  const canopy=new THREE.Mesh(new THREE.SphereGeometry(.7,24,12),new THREE.MeshPhysicalMaterial({color:0x091321,metalness:.2,roughness:.05,transmission:.8,transparent:true,opacity:.72}));
  canopy.scale.set(1,.45,.7); canopy.position.y=.55; group.add(canopy);
  const glow=new THREE.PointLight(color,12,28); glow.position.y=.2; group.add(glow);
  for(const s of [-1,1]){
    const wing=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,4.4),new THREE.MeshBasicMaterial({color}));
    wing.position.set(s*.75,0,0); group.add(wing);
  }
  return group;
}

const player=bike(0x00eaff); scene.add(player);
let tParam=.02, lateral=0, speed=0, nitro=3, shield=100, lap=1;
const ai=[];
for(let i=0;i<9;i++){ const b=bike(palette[i%palette.length]); scene.add(b); ai.push({mesh:b,t:(.02+i*.011)%1,speed: .0017+rng()*.0011,offset:(rng()-.5)*5}); }

const keys={};
addEventListener("keydown",e=>{keys[e.code]=true;if(e.code==="KeyR")reset();});
addEventListener("keyup",e=>keys[e.code]=false);
function reset(){tParam=.02;lateral=0;speed=0;nitro=3;shield=100;lap=1;}

const projectiles=[];
addEventListener("keydown",e=>{
  if(e.code==="Space" && !e.repeat){
    const p=new THREE.Mesh(new THREE.SphereGeometry(.18,10,10),new THREE.MeshBasicMaterial({color:0xffef7a}));
    p.position.copy(player.position); p.userData.v=new THREE.Vector3(0,0,-1).applyQuaternion(player.quaternion).multiplyScalar(8); scene.add(p); projectiles.push(p);
  }
});

function updateBike(obj,t,offset){
  const p=track.getPointAt((t%1+1)%1), q=track.getPointAt(((t+.001)%1+1)%1);
  const tangent=q.clone().sub(p).normalize();
  const side=new THREE.Vector3(-tangent.z,0,tangent.x).normalize();
  obj.position.copy(p).add(side.multiplyScalar(offset)).add(new THREE.Vector3(0,2.2,0));
  obj.lookAt(q.clone().add(side.multiplyScalar(offset)).add(new THREE.Vector3(0,2.1,0)));
  obj.rotation.z += Math.sin(performance.now()*.008)*.025;
}

async function runAdapters(snapshot) {
  const input = { keys: { ...keys } };
  try {
    adapterState.boa = "running";
    refreshAdapterStatus();
    await coordinator.executeBoaWorkflow({
      input,
      deltaTime: snapshot.deltaTime,
    });
    adapterState.boa = "ok";
    adapterState.lastError = null;
  } catch (error) {
    adapterState.boa = "error";
    adapterState.lastError = error?.message || String(error);
    console.warn("BOA adapter failed", error);
  }

  try {
    adapterState.holocron = "running";
    refreshAdapterStatus();
    await coordinator.executeHolocronAbstraction({
      items: [{ id: "race-state", ...snapshot }],
      query: "prismatic-velocity",
      bindings: {
        B: 0,
        A: 1,
        Y: 2,
        X: 3,
        L: 4,
        R: 5,
        Select: 8,
        Start: 9,
      },
    });
    adapterState.holocron = "ok";
    adapterState.lastError = null;
  } catch (error) {
    adapterState.holocron = "error";
    adapterState.lastError = error?.message || String(error);
    console.warn("HOLOCRON adapter failed", error);
  }

  refreshAdapterStatus();
}

let prev=performance.now();
function animate(now){
  requestAnimationFrame(animate);
  const dt=Math.min((now-prev)/16.67,2); prev=now;
  const accel=(keys.KeyW?0.000055:0)-(keys.KeyS?0.000035:0);
  speed += accel*dt; speed*=Math.pow(.996,dt);
  if(keys.ShiftLeft && nitro>0 && speed>.001){ speed+=.00016*dt; nitro-=.003*dt; }
  speed=THREE.MathUtils.clamp(speed,0,.0069);
  lateral += ((keys.KeyD?1:0)-(keys.KeyA?1:0))*.09*dt;
  lateral*=Math.pow(.82,dt); lateral=THREE.MathUtils.clamp(lateral,-6,6);
  tParam=(tParam+speed*dt)%1;
  updateBike(player,tParam,lateral);
  const cp=track.getPointAt(tParam), cq=track.getPointAt((tParam+.004)%1);
  const forward=cq.clone().sub(cp).normalize();
  camera.position.lerp(player.position.clone().add(forward.clone().multiplyScalar(-15)).add(new THREE.Vector3(0,6,0)),.09);
  camera.lookAt(player.position.clone().add(forward.multiplyScalar(25)));

  for(let i=0;i<ai.length;i++){ ai[i].t=(ai[i].t+ai[i].speed*dt)%1; updateBike(ai[i].mesh,ai[i].t,ai[i].offset); }
  for(let i=projectiles.length-1;i>=0;i--){ const p=projectiles[i]; p.position.add(p.userData.v); if(p.position.length()>4000){scene.remove(p);projectiles.splice(i,1);} }

  document.querySelector("#kmh").textContent=Math.round(speed*145000);
  document.querySelector("#boost").textContent=`NITRO ×${Math.max(0,Math.ceil(nitro))}`;
  document.querySelector("#shield").style.width=`${Math.max(0,shield)}%`;

  const snapshot = {
    player: {
      position: player.position.clone(),
      speed,
      nitro,
      shield,
      lap,
      lateral,
      tParam,
    },
    ai: ai.map((b) => ({
      position: b.mesh.position.clone(),
      speed: b.speed,
      offset: b.offset,
      t: b.t,
    })),
    camera: camera.position.clone(),
    input: { keys: { ...keys } },
    deltaTime: dt,
    timestamp: now,
  };
  coordinator.updateGameState(snapshot);
  adapterState.frameCount += 1;
  if (adapterState.frameCount % 6 === 0) {
    void runAdapters(snapshot);
  }

  composer.render();
}
refreshAdapterStatus();
animate(performance.now());

addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);
});
