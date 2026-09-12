import {
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SRGBColorSpace,
  type Texture,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export const KETTENHOCHHAUS_PROP_IDS = ["chain", "highrise", "hose", "ground"] as const;
export type KettenhochhausPropId = (typeof KETTENHOCHHAUS_PROP_IDS)[number];

export const KETTENHOCHHAUS_URLS: Record<KettenhochhausPropId, string> = {
  chain: "/models/kettenhochhaus/chain.glb",
  highrise: "/models/kettenhochhaus/highrise.glb",
  hose: "/models/kettenhochhaus/hose.glb",
  ground: "/models/kettenhochhaus/ground.glb",
};

const templates = new Map<KettenhochhausPropId, Object3D>();
const loadFailed = new Set<KettenhochhausPropId>();
let preloadPromise: Promise<void> | null = null;

function stripNonMeshHelpers(root: Object3D): void {
  const remove: Object3D[] = [];
  root.traverse((obj) => {
    if ((obj as { isLight?: boolean }).isLight || (obj as { isCamera?: boolean }).isCamera) {
      remove.push(obj);
    }
  });
  for (const obj of remove) obj.parent?.remove(obj);
}

function prepareMaps(root: Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      const std = mat as MeshStandardMaterial;
      if (std.map) {
        const map = std.map as Texture;
        map.colorSpace = SRGBColorSpace;
        map.needsUpdate = true;
      }
    }
  });
}

async function loadOne(id: KettenhochhausPropId, loader: GLTFLoader): Promise<void> {
  try {
    const gltf = await loader.loadAsync(KETTENHOCHHAUS_URLS[id]);
    const root = gltf.scene;
    stripNonMeshHelpers(root);
    prepareMaps(root);
    templates.set(id, root);
  } catch {
    loadFailed.add(id);
  }
}

export function preloadKettenhochhausModels(): Promise<void> {
  if (preloadPromise) return preloadPromise;
  const loader = new GLTFLoader();
  preloadPromise = Promise.all(KETTENHOCHHAUS_PROP_IDS.map((id) => loadOne(id, loader))).then(
    () => {},
  );
  return preloadPromise;
}

export function hasKettenhochhausModel(id: KettenhochhausPropId): boolean {
  return templates.has(id);
}

export function cloneKettenhochhausProp(id: KettenhochhausPropId): Group | null {
  const tpl = templates.get(id);
  if (!tpl) return null;
  const clone = tpl.clone(true);
  clone.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh) return;
    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map((m) => m.clone());
    } else if (mesh.material) {
      mesh.material = mesh.material.clone();
    }
  });
  const g = new Group();
  g.name = id;
  g.add(clone);
  return g;
}
