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
  brokenMask,
  chainProgress,
  clickZone,
  createSim,
  currentChain,
  type ClickResult,
} from "../sim";
import type { ChainZone, KettenhochhausConfig, KettenhochhausSimState } from "../types";

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

function proceduralChainLink(): Group {
  const g = new Group();
  const metal = new MeshStandardMaterial({ color: 0x8a9098, metalness: 0.7, roughness: 0.35 });
  const ring = new Mesh(new CylinderGeometry(0.16, 0.16, 0.08, 16), metal);
  ring.rotation.z = Math.PI / 2;
  const bar = new Mesh(new BoxGeometry(0.08, 0.55, 0.08), metal);
  bar.position.y = -0.28;
  g.add(ring, bar);
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
  arm.position.set(0.4, 0.95, 0);
  arm.name = "strikeArm";
  const legL = new Mesh(new BoxGeometry(0.18, 0.55, 0.22), dark);
  legL.position.set(-0.14, 0.28, 0);
  const legR = new Mesh(new BoxGeometry(0.18, 0.55, 0.22), dark);
  legR.position.set(0.14, 0.28, 0);
  g.add(torso, head, arm, legL, legR);
  return g;
}

function makeZonePad(zone: ChainZone, color: number): Group {
  const g = new Group();
  const mat = new MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.15 });
  const pad = new Mesh(new BoxGeometry(1.1, 0.18, 1.1), mat);
  pad.position.y = 0.09;
  g.add(pad);
  g.userData.zone = zone;
  return g;
}

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
  private busy = false;
  private mech!: Group;
  private strikeArm!: Object3D;
  private building!: Group;
  private flames: Mesh[] = [];
  private chainRoots: Group[] = [];
  private zonePads: Group[] = [];
  private strikeT = 0;
  private breakT = 0;
  private breakingIndex = -1;
  private extinguishT = 0;
  private onPointer: (e: PointerEvent) => void;

  constructor(canvas: HTMLCanvasElement, config: KettenhochhausConfig, hud: KettenhochhausHud) {
    this.canvas = canvas;
    this.hud = hud;
    this.sim = createSim(config);
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.camera = new PerspectiveCamera(48, 1, 0.1, 80);
    this.camera.position.set(0.2, 2.4, 7.2);
    this.camera.lookAt(0.4, 1.6, 0);
    this.onPointer = (e) => this.handlePointer(e);
    canvas.addEventListener("pointerdown", this.onPointer);
  }

  start(): void {
    if (this.disposed) return;
    this.buildScene();
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

  /** HTML / external zone click (Anfang / Mitte / Ende). */
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

  private buildScene(): void {
    this.scene.background = new Color(0x6ea8d4);
    this.scene.add(new HemisphereLight(0xe8f4ff, 0x5a4030, 0.95));
    this.scene.add(new AmbientLight(0xffffff, 0.35));
    const sun = new DirectionalLight(0xfff0d8, 1.15);
    sun.position.set(4, 9, 3);
    this.scene.add(sun);

    const ground = new Mesh(
      new BoxGeometry(18, 0.2, 12),
      new MeshStandardMaterial({ color: 0x5c8f4a, roughness: 0.95 }),
    );
    ground.position.y = -0.1;
    this.scene.add(ground);

    this.building = proceduralBuilding();
    this.building.position.set(2.6, 0, -1.2);
    this.scene.add(this.building);

    for (let i = 0; i < 4; i++) {
      const flame = proceduralFlame();
      flame.position.set(
        2.6 + (i % 2 === 0 ? -0.35 : 0.35),
        4.6 + (i < 2 ? 0 : 0.25),
        -1.2 + (i < 2 ? 0.4 : -0.2),
      );
      this.flames.push(flame);
      this.scene.add(flame);
    }

    this.mech = proceduralMech();
    this.mech.position.set(-2.4, 0, 1.2);
    this.strikeArm = this.mech.getObjectByName("strikeArm") ?? this.mech;
    this.scene.add(this.mech);

    const chainXs = [-1.2, -0.15, 0.9, 1.95];
    for (let i = 0; i < 4; i++) {
      const root = new Group();
      const link = proceduralChainLink();
      link.scale.setScalar(1.35);
      root.add(link);
      root.position.set(chainXs[i]!, 1.35, 0.35);
      this.chainRoots.push(root);
      this.scene.add(root);
    }

    const padColors = [0xffd600, 0x4da3ff, 0xff6b6b];
    const padXs = [-1.35, 0.35, 2.05];
    ZONE_ORDER.forEach((zone, i) => {
      const pad = makeZonePad(zone, padColors[i]!);
      pad.position.set(padXs[i]!, 0, 2.35);
      this.zonePads.push(pad);
      this.scene.add(pad);
    });
  }

  private handlePointer(e: PointerEvent): void {
    if (this.sim.won || this.disposed || this.busy) return;
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
    if (this.sim.won || this.disposed || this.busy) return;
    this.busy = true;
    this.strikeT = 0.35;
    const result = clickZone(this.sim, zone);
    this.hud.onClick(result);

    if (result.kind === "hit") {
      this.breakingIndex = result.chainIndex - 1;
      this.breakT = 0.45;
      if (result.won) {
        this.extinguishT = 1.2;
        this.hud.onWon(this.sim.wrongAttempts);
      }
    } else if (result.kind === "restart") {
      for (const root of this.chainRoots) {
        root.visible = true;
        root.scale.setScalar(1);
      }
    }

    this.emitProgress();
    window.setTimeout(() => {
      this.busy = false;
    }, result.kind === "hit" ? 420 : 280);
  }

  private tick(dt: number): void {
    for (let i = 0; i < this.flames.length; i++) {
      const f = this.flames[i]!;
      const bob = 0.04 * Math.sin(this.elapsed * 6 + i);
      f.scale.setScalar(1 + bob + (this.extinguishT > 0 ? 0 : 0.08 * Math.sin(this.elapsed * 9 + i)));
      if (this.extinguishT > 0) {
        f.scale.multiplyScalar(Math.max(0, this.extinguishT / 1.2));
        (f.material as MeshStandardMaterial).emissiveIntensity = Math.max(0, this.extinguishT);
      }
    }
    if (this.extinguishT > 0) this.extinguishT = Math.max(0, this.extinguishT - dt);

    if (this.strikeT > 0) {
      this.strikeT = Math.max(0, this.strikeT - dt);
      const u = 1 - this.strikeT / 0.35;
      const swing = Math.sin(u * Math.PI) * 1.1;
      this.strikeArm.rotation.z = -swing;
      this.mech.position.x = -2.4 + swing * 0.35;
    } else {
      this.strikeArm.rotation.z = 0;
      this.mech.position.x = -2.4;
    }

    if (this.breakT > 0 && this.breakingIndex >= 0) {
      this.breakT = Math.max(0, this.breakT - dt);
      const root = this.chainRoots[this.breakingIndex];
      if (root) {
        const t = 1 - this.breakT / 0.45;
        root.scale.setScalar(Math.max(0.01, 1 - t));
        root.rotation.z = t * 0.8;
        if (this.breakT <= 0) root.visible = false;
      }
    }

    const broken = brokenMask(this.sim);
    this.chainRoots.forEach((root, i) => {
      if (broken[i] && this.breakingIndex !== i) {
        root.visible = false;
      } else if (!broken[i] && this.breakingIndex !== i) {
        root.visible = true;
        root.scale.setScalar(i === this.sim.chainIndex ? 1.15 : 1);
        root.rotation.y = this.elapsed * (i === this.sim.chainIndex ? 1.8 : 0.4);
      }
    });
  }
}
