import {
  AmbientLight,
  BoxGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Raycaster,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from "three";
import type { Object3D } from "three";
import {
  chainWorldZ,
  mechIdleZ,
  mechRunTargetAfterHit,
  STREET,
  zonePadX,
  zonePadZ,
} from "../layout";
import {
  cloneKettenhochhausProp,
  hasKettenhochhausModel,
  preloadKettenhochhausModels,
  type KettenhochhausPropId,
} from "../loadModels";
import {
  brokenMask,
  chainProgress,
  clickZone,
  createSim,
  currentChain,
  type ClickResult,
} from "../sim";
import type { ChainZone, KettenhochhausConfig, KettenhochhausSimState } from "../types";
import { CHAIN_COUNT } from "../types";

export type KettenhochhausHud = {
  onProgress: (info: {
    progressLabel: string;
    letter: string;
    displayWord: string;
    lives: number;
    wrongAttempts: number;
    broken: boolean[];
  }) => void;
  onClick: (result: ClickResult) => void;
  onWon: (wrongAttempts: number) => void;
};

const ZONE_ORDER: ChainZone[] = ["anfang", "mitte", "ende"];

function proceduralBuilding(): Group {
  const g = new Group();
  const concrete = new MeshStandardMaterial({ color: 0x6a737c, roughness: 0.9, metalness: 0.05 });
  const accent = new MeshStandardMaterial({ color: 0x3d4650, roughness: 0.85, metalness: 0.1 });
  const tower = new Mesh(new BoxGeometry(1.6, 4.2, 1.4), concrete);
  tower.position.y = 2.1;
  const top = new Mesh(new BoxGeometry(1.8, 0.35, 1.55), accent);
  top.position.y = 4.35;
  g.add(tower, top);
  for (let row = 0; row < 5; row++) {
    for (const side of [-1, 1] as const) {
      const win = new Mesh(
        new BoxGeometry(0.22, 0.28, 0.05),
        new MeshStandardMaterial({ color: 0xffc857, emissive: 0x442200, emissiveIntensity: 0.35 }),
      );
      win.position.set(side * 0.45, 0.7 + row * 0.7, 0.72);
      g.add(win);
    }
  }
  return g;
}

function proceduralFlame(): Mesh {
  return new Mesh(
    new SphereGeometry(0.22, 10, 8),
    new MeshStandardMaterial({
      color: 0xff6a00,
      emissive: 0xff3d00,
      emissiveIntensity: 0.9,
      roughness: 0.6,
    }),
  );
}

function proceduralChainSpan(): Group {
  const g = new Group();
  const metal = new MeshStandardMaterial({ color: 0x8a9098, metalness: 0.75, roughness: 0.32 });
  const bar = new Mesh(new BoxGeometry(STREET.chainHalfSpan * 2, 0.12, 0.12), metal);
  bar.position.y = 0;
  g.add(bar);
  for (let i = -3; i <= 3; i++) {
    const link = new Mesh(new CylinderGeometry(0.14, 0.14, 0.08, 12), metal);
    link.rotation.z = Math.PI / 2;
    link.position.set(i * 0.55, 0, 0);
    g.add(link);
  }
  return g;
}

function proceduralMech(): Group {
  const g = new Group();
  const bodyMat = new MeshStandardMaterial({ color: 0x4da3ff, metalness: 0.35, roughness: 0.45 });
  const dark = new MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.4, roughness: 0.5 });
  const torso = new Mesh(new BoxGeometry(0.55, 0.7, 0.4), bodyMat);
  torso.position.y = 0.85;
  const head = new Mesh(new BoxGeometry(0.35, 0.32, 0.32), bodyMat);
  head.position.y = 1.4;
  const arm = new Mesh(new BoxGeometry(0.18, 0.55, 0.18), dark);
  arm.position.set(0.42, 0.95, 0);
  arm.name = "strikeArm";
  const legL = new Mesh(new BoxGeometry(0.18, 0.55, 0.22), dark);
  legL.position.set(-0.14, 0.28, 0);
  legL.name = "legL";
  const legR = new Mesh(new BoxGeometry(0.18, 0.55, 0.22), dark);
  legR.position.set(0.14, 0.28, 0);
  legR.name = "legR";
  g.add(torso, head, arm, legL, legR);
  return g;
}

function proceduralAxe(): Group {
  const g = new Group();
  const wood = new MeshStandardMaterial({ color: 0x6d4c41, roughness: 0.75, metalness: 0.05 });
  const steel = new MeshStandardMaterial({ color: 0xb0bec5, metalness: 0.85, roughness: 0.25 });
  const handle = new Mesh(new CylinderGeometry(0.04, 0.05, 0.85, 8), wood);
  handle.position.y = 0.35;
  const head = new Mesh(new BoxGeometry(0.45, 0.22, 0.08), steel);
  head.position.set(0.12, 0.78, 0);
  g.add(handle, head);
  return g;
}

function makeZonePad(zone: ChainZone, color: number): Group {
  const g = new Group();
  const mat = new MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.15 });
  const pad = new Mesh(new BoxGeometry(1.0, 0.16, 1.0), mat);
  pad.position.y = 0.08;
  g.add(pad);
  g.userData.zone = zone;
  return g;
}

function proceduralGround(): Mesh {
  return new Mesh(
    new BoxGeometry(14, 0.2, 18),
    new MeshStandardMaterial({ color: 0x5c8f4a, roughness: 0.95 }),
  );
}

function proceduralHose(): Group {
  const g = new Group();
  const rubber = new MeshStandardMaterial({ color: 0xc62828, roughness: 0.7, metalness: 0.1 });
  const coil = new Mesh(new CylinderGeometry(0.35, 0.35, 0.22, 16), rubber);
  coil.position.y = 0.12;
  const nozzle = new Mesh(
    new BoxGeometry(0.45, 0.1, 0.1),
    new MeshStandardMaterial({ color: 0xb0bec5, metalness: 0.6, roughness: 0.35 }),
  );
  nozzle.position.set(0.4, 0.18, 0);
  g.add(coil, nozzle);
  return g;
}

function mountProp(id: KettenhochhausPropId, fallback: () => Object3D): Object3D {
  return (hasKettenhochhausModel(id) && cloneKettenhochhausProp(id)) || fallback();
}

type ChainVisual = {
  root: Group;
  left: Object3D;
  right: Object3D;
};

type Phase =
  | { kind: "idle" }
  | { kind: "strike"; t: number; result: ClickResult; standZ: number }
  | { kind: "break"; t: number; chainIndex: number; won: boolean }
  | { kind: "run"; t: number; fromZ: number; toZ: number; won: boolean }
  | { kind: "extinguish"; t: number }
  | { kind: "done" };

const STRIKE_DUR = 0.38;
const BREAK_DUR = 0.55;
const RUN_DUR = 0.8;
const EXTINGUISH_DUR = 1.35;

export class KettenhochhausApp {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera: PerspectiveCamera;
  private sim: KettenhochhausSimState;
  private hud: KettenhochhausHud;
  private canvas: HTMLCanvasElement;
  private raycaster = new Raycaster();
  private pointer = new Vector2();
  private raf = 0;
  private lastTs = 0;
  private elapsed = 0;
  private disposed = false;
  private phase: Phase = { kind: "idle" };
  private mech!: Group;
  private strikeArm!: Object3D;
  private axe!: Object3D;
  private legL!: Object3D;
  private legR!: Object3D;
  private building!: Group;
  private hose!: Object3D;
  private flames: Mesh[] = [];
  private chains: ChainVisual[] = [];
  private zonePads: Group[] = [];
  private spray: Mesh | null = null;
  private onPointer: (e: PointerEvent) => void;
  private wonReported = false;

  constructor(canvas: HTMLCanvasElement, config: KettenhochhausConfig, hud: KettenhochhausHud) {
    this.canvas = canvas;
    this.hud = hud;
    this.sim = createSim(config);
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.camera = new PerspectiveCamera(50, 1, 0.1, 90);
    this.onPointer = (e) => this.handlePointer(e);
    canvas.addEventListener("pointerdown", this.onPointer);
  }

  async start(): Promise<void> {
    if (this.disposed) return;
    await preloadKettenhochhausModels();
    if (this.disposed) return;
    this.buildScene();
    this.placeMechAt(mechIdleZ(0));
    this.syncZonePads();
    this.updateCamera(true);
    this.resize();
    this.emitProgress();
    this.lastTs = performance.now();
    const loop = (ts: number) => {
      if (this.disposed) return;
      const dt = Math.min(0.05, (ts - this.lastTs) / 1000);
      this.lastTs = ts;
      this.elapsed += dt;
      this.tick(dt);
      this.renderer.render(this.scene, this.camera);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  chooseZone(zone: ChainZone): void {
    this.applyZone(zone);
  }

  resize(): void {
    const w = this.canvas.clientWidth || this.canvas.parentElement?.clientWidth || 800;
    const h = this.canvas.clientHeight || this.canvas.parentElement?.clientHeight || 600;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / Math.max(h, 1);
    this.camera.updateProjectionMatrix();
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.canvas.removeEventListener("pointerdown", this.onPointer);
    this.renderer.dispose();
  }

  private busy(): boolean {
    return this.phase.kind !== "idle";
  }

  private placeMechAt(z: number): void {
    this.mech.position.set(STREET.roadX, 0, z);
    this.mech.rotation.y = 0; // face +Z (forward)
  }

  private emitProgress(): void {
    const chain = currentChain(this.sim);
    this.hud.onProgress({
      progressLabel: chainProgress(this.sim),
      letter: chain?.displayLetter ?? "",
      displayWord: chain?.displayWord ?? "",
      lives: this.sim.lives,
      wrongAttempts: this.sim.wrongAttempts,
      broken: brokenMask(this.sim),
    });
  }

  private syncZonePads(): void {
    const idx = Math.min(this.sim.chainIndex, CHAIN_COUNT - 1);
    const active = this.phase.kind === "idle" && !this.sim.won;
    ZONE_ORDER.forEach((zone, i) => {
      const pad = this.zonePads[i]!;
      pad.position.set(zonePadX(zone), 0, zonePadZ(idx));
      pad.visible = active;
    });
  }

  private updateCamera(snap = false): void {
    const z = this.mech.position.z;
    const targetPos = { x: 0.15, y: 2.7, z: z - 5.2 };
    const look = { x: 0.2, y: 1.35, z: z + 2.8 };
    if (snap) {
      this.camera.position.set(targetPos.x, targetPos.y, targetPos.z);
    } else {
      this.camera.position.x += (targetPos.x - this.camera.position.x) * 0.1;
      this.camera.position.y += (targetPos.y - this.camera.position.y) * 0.1;
      this.camera.position.z += (targetPos.z - this.camera.position.z) * 0.1;
    }
    this.camera.lookAt(look.x, look.y, look.z);
  }

  private makeChainVisual(): ChainVisual {
    const root = new Group();
    const left = mountProp("chain", proceduralChainSpan);
    const right = mountProp("chain", proceduralChainSpan);
    // Long axis of baked chain is +Z; yaw so it spans +X (left→right).
    const yaw = Math.PI / 2;
    const scale = hasKettenhochhausModel("chain") ? 1.35 : 1;
    for (const half of [left, right]) {
      half.rotation.y = yaw;
      half.scale.setScalar(scale);
    }
    // Split into left / right halves of the screen-spanning barrier
    left.position.set(-STREET.chainHalfSpan * 0.45, 0, 0);
    right.position.set(STREET.chainHalfSpan * 0.45, 0, 0);
    root.add(left, right);
    return { root, left, right };
  }

  private resetChainVisual(cv: ChainVisual, z: number): void {
    cv.root.visible = true;
    cv.root.position.set(0, STREET.chainY, z);
    cv.root.rotation.set(0, 0, 0);
    cv.left.position.set(-STREET.chainHalfSpan * 0.45, 0, 0);
    cv.right.position.set(STREET.chainHalfSpan * 0.45, 0, 0);
    cv.left.rotation.set(0, Math.PI / 2, 0);
    cv.right.rotation.set(0, Math.PI / 2, 0);
    cv.left.scale.setScalar(hasKettenhochhausModel("chain") ? 1.35 : 1);
    cv.right.scale.setScalar(hasKettenhochhausModel("chain") ? 1.35 : 1);
  }

  private buildScene(): void {
    this.scene.background = new Color(0x6ea8d4);
    this.scene.add(new HemisphereLight(0xe8f4ff, 0x5a4030, 0.95));
    this.scene.add(new AmbientLight(0xffffff, 0.35));
    const sun = new DirectionalLight(0xfff0d8, 1.15);
    sun.position.set(3, 10, -2);
    this.scene.add(sun);

    const ground = mountProp("ground", proceduralGround);
    if (hasKettenhochhausModel("ground")) {
      ground.scale.set(1.4, 0.35, 1.8);
      ground.position.set(0, 0, 3.2);
    } else {
      ground.position.set(0, -0.1, 3);
    }
    this.scene.add(ground);

    const road = new Mesh(
      new BoxGeometry(3.2, 0.06, 16),
      new MeshStandardMaterial({ color: 0x4a4f55, roughness: 0.92, metalness: 0.05 }),
    );
    road.position.set(0, 0.02, 3.2);
    this.scene.add(road);

    const buildingMesh = mountProp("highrise", proceduralBuilding);
    this.building = buildingMesh as Group;
    this.building.position.set(STREET.buildingX, 0, STREET.buildingZ);
    if (hasKettenhochhausModel("highrise")) {
      this.building.scale.setScalar(0.95);
    }
    this.scene.add(this.building);

    const flameY = hasKettenhochhausModel("highrise") ? 3.15 : 4.6;
    for (let i = 0; i < 4; i++) {
      const flame = proceduralFlame();
      flame.position.set(
        STREET.buildingX + (i % 2 === 0 ? -0.35 : 0.35),
        flameY + (i < 2 ? 0 : 0.25),
        STREET.buildingZ + (i < 2 ? 0.35 : -0.25),
      );
      this.flames.push(flame);
      this.scene.add(flame);
    }

    this.hose = mountProp("hose", proceduralHose);
    this.hose.position.set(STREET.hoseX, 0, STREET.hoseZ);
    if (hasKettenhochhausModel("hose")) {
      this.hose.scale.setScalar(0.9);
      this.hose.rotation.y = Math.PI / 2;
    }
    this.scene.add(this.hose);

    this.mech = proceduralMech();
    this.strikeArm = this.mech.getObjectByName("strikeArm") ?? this.mech;
    this.legL = this.mech.getObjectByName("legL") ?? this.mech;
    this.legR = this.mech.getObjectByName("legR") ?? this.mech;

    this.axe = mountProp("axe", proceduralAxe);
    if (hasKettenhochhausModel("axe")) {
      // Bake: grip opposite head along +X → tip head upward for a chop
      this.axe.scale.setScalar(0.55);
      this.axe.rotation.set(0, 0, -Math.PI / 2.2);
      this.axe.position.set(0.12, -0.05, 0.05);
    } else {
      this.axe.scale.setScalar(0.7);
      this.axe.position.set(0.05, 0.15, 0);
    }
    this.strikeArm.add(this.axe);
    this.scene.add(this.mech);

    for (let i = 0; i < CHAIN_COUNT; i++) {
      const cv = this.makeChainVisual();
      this.resetChainVisual(cv, chainWorldZ(i));
      this.chains.push(cv);
      this.scene.add(cv.root);
    }

    const padColors = [0xffd600, 0x4da3ff, 0xff6b6b];
    ZONE_ORDER.forEach((zone, i) => {
      const pad = makeZonePad(zone, padColors[i]!);
      this.zonePads.push(pad);
      this.scene.add(pad);
    });
  }

  private handlePointer(e: PointerEvent): void {
    if (this.sim.won || this.disposed || this.busy()) return;
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.zonePads, true);
    if (!hits.length) return;
    let obj: Object3D | null = hits[0]!.object;
    let zone: ChainZone | undefined;
    while (obj) {
      zone = obj.userData?.zone as ChainZone | undefined;
      if (zone) break;
      obj = obj.parent;
    }
    if (!zone) return;
    this.applyZone(zone);
  }

  private applyZone(zone: ChainZone): void {
    if (this.sim.won || this.disposed || this.busy()) return;
    const standZ = this.mech.position.z;
    const result = clickZone(this.sim, zone);
    this.hud.onClick(result);
    this.phase = { kind: "strike", t: STRIKE_DUR, result, standZ };
    this.syncZonePads();
    this.emitProgress();

    if (result.kind === "restart") {
      this.chains.forEach((cv, i) => this.resetChainVisual(cv, chainWorldZ(i)));
      this.placeMechAt(mechIdleZ(0));
      this.syncZonePads();
    }
  }

  private startRunAfterBreak(brokenIndex: number, won: boolean): void {
    const fromZ = this.mech.position.z;
    const toZ = mechRunTargetAfterHit(brokenIndex);
    this.phase = { kind: "run", t: RUN_DUR, fromZ, toZ, won };
  }

  private reportWon(): void {
    if (this.wonReported) return;
    this.wonReported = true;
    this.hud.onWon(this.sim.wrongAttempts);
  }

  private tick(dt: number): void {
    this.animateFlames();
    this.animateIdleChains();
    this.advancePhase(dt);
    this.updateCamera(false);
  }

  private animateFlames(): void {
    let extinguishU = 0;
    if (this.phase.kind === "extinguish") {
      extinguishU = 1 - this.phase.t / EXTINGUISH_DUR;
      if (this.spray) {
        this.spray.scale.set(1, 1 + extinguishU * 2.5, 1);
        (this.spray.material as MeshStandardMaterial).opacity = 0.55 * (1 - extinguishU * 0.3);
      }
    } else if (this.phase.kind === "done") {
      extinguishU = 1;
    }
    for (let i = 0; i < this.flames.length; i++) {
      const f = this.flames[i]!;
      const bob = 0.04 * Math.sin(this.elapsed * 6 + i);
      if (extinguishU > 0) {
        const scale = Math.max(0.01, 1 - extinguishU);
        f.scale.setScalar(scale);
        (f.material as MeshStandardMaterial).emissiveIntensity = Math.max(0, 0.9 * (1 - extinguishU));
        f.visible = scale > 0.05;
      } else {
        f.visible = true;
        f.scale.setScalar(1 + bob + 0.08 * Math.sin(this.elapsed * 9 + i));
        (f.material as MeshStandardMaterial).emissiveIntensity = 0.9;
      }
    }
  }

  private animateIdleChains(): void {
    const broken = brokenMask(this.sim);
    const breakingIndex = this.phase.kind === "break" ? this.phase.chainIndex : -1;
    this.chains.forEach((cv, i) => {
      if (i === breakingIndex) return;
      if (broken[i]) {
        cv.root.visible = false;
        return;
      }
      cv.root.visible = true;
      const active = i === this.sim.chainIndex && this.phase.kind === "idle";
      const sag = active ? Math.sin(this.elapsed * 3) * 0.03 : 0;
      cv.root.position.y = STREET.chainY + sag;
      cv.root.rotation.z = active ? Math.sin(this.elapsed * 2.2) * 0.04 : 0;
    });
  }

  private advancePhase(dt: number): void {
    const p = this.phase;
    if (p.kind === "idle" || p.kind === "done") {
      this.strikeArm.rotation.z = 0;
      this.strikeArm.rotation.x = 0;
      this.legL.rotation.x = 0;
      this.legR.rotation.x = 0;
      return;
    }

    if (p.kind === "strike") {
      p.t = Math.max(0, p.t - dt);
      const u = 1 - p.t / STRIKE_DUR;
      // Overhead axe chop toward +Z
      const swing = Math.sin(u * Math.PI);
      this.strikeArm.rotation.x = -swing * 1.35;
      this.strikeArm.rotation.z = -swing * 0.35;
      this.mech.position.z = p.standZ + swing * 0.22;

      if (p.t <= 0) {
        this.strikeArm.rotation.x = 0;
        this.strikeArm.rotation.z = 0;
        this.placeMechAt(p.standZ);
        if (p.result.kind === "hit") {
          this.phase = {
            kind: "break",
            t: BREAK_DUR,
            chainIndex: p.result.chainIndex - 1,
            won: p.result.won,
          };
        } else {
          this.phase = { kind: "idle" };
          this.syncZonePads();
        }
      }
      return;
    }

    if (p.kind === "break") {
      p.t = Math.max(0, p.t - dt);
      const cv = this.chains[p.chainIndex];
      if (cv) {
        const u = 1 - p.t / BREAK_DUR;
        const fly = u * u;
        cv.left.position.x = -STREET.chainHalfSpan * 0.45 - fly * 1.8;
        cv.right.position.x = STREET.chainHalfSpan * 0.45 + fly * 1.8;
        cv.left.position.y = -fly * 1.2;
        cv.right.position.y = -fly * 1.2;
        cv.left.rotation.z = fly * 1.4;
        cv.right.rotation.z = -fly * 1.4;
        cv.left.rotation.x = fly * 0.6;
        cv.right.rotation.x = -fly * 0.6;
        if (p.t <= 0) cv.root.visible = false;
      }
      if (p.t <= 0) {
        this.startRunAfterBreak(p.chainIndex, p.won);
      }
      return;
    }

    if (p.kind === "run") {
      p.t = Math.max(0, p.t - dt);
      const u = 1 - p.t / RUN_DUR;
      const ease = u * u * (3 - 2 * u);
      this.mech.position.z = p.fromZ + (p.toZ - p.fromZ) * ease;
      const bob = Math.sin(u * Math.PI * 4) * 0.55;
      this.legL.rotation.x = bob;
      this.legR.rotation.x = -bob;
      this.mech.position.y = Math.abs(Math.sin(u * Math.PI * 4)) * 0.06;
      if (p.t <= 0) {
        this.legL.rotation.x = 0;
        this.legR.rotation.x = 0;
        this.mech.position.y = 0;
        this.placeMechAt(p.toZ);
        if (p.won) {
          this.beginExtinguish();
        } else {
          this.phase = { kind: "idle" };
          this.syncZonePads();
          this.emitProgress();
        }
      }
      return;
    }

    if (p.kind === "extinguish") {
      p.t = Math.max(0, p.t - dt);
      const u = 1 - p.t / EXTINGUISH_DUR;
      this.hose.position.z = STREET.hoseZ + Math.sin(u * Math.PI) * 0.12;
      this.strikeArm.rotation.x = -0.35 - u * 0.25;
      if (p.t <= 0) {
        this.strikeArm.rotation.x = 0;
        if (this.spray) this.spray.visible = false;
        this.phase = { kind: "done" };
        this.reportWon();
      }
    }
  }

  private beginExtinguish(): void {
    this.phase = { kind: "extinguish", t: EXTINGUISH_DUR };
    if (!this.spray) {
      this.spray = new Mesh(
        new CylinderGeometry(0.05, 0.28, 1.4, 10),
        new MeshStandardMaterial({
          color: 0x90caf9,
          transparent: true,
          opacity: 0.5,
          roughness: 0.4,
          metalness: 0,
        }),
      );
      this.spray.position.set(STREET.buildingX - 0.4, 1.6, STREET.buildingZ - 0.6);
      this.spray.rotation.x = -Math.PI / 2.4;
      this.scene.add(this.spray);
    }
    this.spray.visible = true;
    this.syncZonePads();
  }
}
