#!/usr/bin/env node
/**
 * Bake Tripo Kettenhochhaus props into game GLBs (realistic PBR kept).
 *
 * Sources (gitignored): assets/tripo-out/kettenhochhaus/<id>/
 * Output: public/models/kettenhochhaus/<id>.glb
 *
 * Usage: node scripts/bake-kettenhochhaus-tripo.mjs
 */
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  clearNodeTransform,
  dedup,
  flatten,
  getBounds,
  prune,
  simplify,
  weld,
} from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const tripoRoot = join(rootDir, "assets/tripo-out/kettenhochhaus");
const outDir = join(rootDir, "public/models/kettenhochhaus");

/** @type {{ id: string, longest: number, sit: boolean, ratio: number, error: number }[]} */
const JOBS = [
  { id: "axe", longest: 1.1, sit: true, ratio: 0.5, error: 0.0015 },
  { id: "chain", longest: 1.6, sit: true, ratio: 0.55, error: 0.0015 },
  { id: "highrise", longest: 3.2, sit: true, ratio: 0.45, error: 0.002 },
  { id: "hose", longest: 1.4, sit: true, ratio: 0.5, error: 0.0015 },
  { id: "ground", longest: 4.0, sit: true, ratio: 0.5, error: 0.002 },
];

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

function bakeNodeTree(node) {
  clearNodeTransform(node);
  for (const child of node.listChildren()) bakeNodeTree(child);
}

function bakeAllNodeTransforms(doc) {
  for (const scene of doc.getRoot().listScenes()) {
    for (const root of scene.listChildren()) bakeNodeTree(root);
  }
}

function forEachPosition(doc, fn) {
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute("POSITION");
      if (!pos) continue;
      const nrm = prim.getAttribute("NORMAL");
      for (let i = 0; i < pos.getCount(); i++) {
        const v = pos.getElement(i, []);
        const n = nrm ? nrm.getElement(i, []) : null;
        fn(v, n);
        pos.setElement(i, v);
        if (nrm && n) nrm.setElement(i, n);
      }
      pos.setArray(pos.getArray());
      if (nrm) nrm.setArray(nrm.getArray());
    }
  }
}

function sceneSize(doc) {
  const b = getBounds(doc.getRoot().listScenes()[0]);
  return {
    min: b.min,
    max: b.max,
    size: [b.max[0] - b.min[0], b.max[1] - b.min[1], b.max[2] - b.min[2]],
    cx: (b.min[0] + b.max[0]) / 2,
    cy: (b.min[1] + b.max[1]) / 2,
    cz: (b.min[2] + b.max[2]) / 2,
  };
}

/** Tripo often faces +X → game forward +Z: (x,z) → (−z, x) */
function facePosZFromTripoX(doc) {
  forEachPosition(doc, (v, n) => {
    const x = v[0];
    const z = v[2];
    v[0] = -z;
    v[2] = x;
    if (n) {
      const nx = n[0];
      const nz = n[2];
      n[0] = -nz;
      n[2] = nx;
    }
  });
}

function centerSitScale(doc, { longest, sit }) {
  const s0 = sceneSize(doc);
  const span = Math.max(s0.size[0], s0.size[1], s0.size[2]);
  const scale = longest / Math.max(span, 1e-6);
  const minY = s0.min[1];
  forEachPosition(doc, (v) => {
    v[0] = (v[0] - s0.cx) * scale;
    v[1] = sit ? (v[1] - minY) * scale : (v[1] - s0.cy) * scale;
    v[2] = (v[2] - s0.cz) * scale;
  });
  return sceneSize(doc);
}

/** Keep Tripo PBR; only ensure materials have sensible names. */
function keepRealisticMaterials(doc, name) {
  for (const mat of doc.getRoot().listMaterials()) {
    if (!mat.getName()) mat.setName(name);
  }
}

async function simplifyDoc(doc, ratio, error = 0.0012) {
  await MeshoptSimplifier.ready;
  const steps = [weld({ tolerance: 0.0002 }), dedup()];
  if (ratio < 0.999) {
    steps.splice(1, 0, simplify({ simplifier: MeshoptSimplifier, ratio, error }));
    steps.push(prune());
  }
  await doc.transform(...steps);
  await doc.transform(prune());
}

function findSourceGlb(dir) {
  if (!existsSync(dir)) return null;
  /** @type {{ path: string, mtime: number }[]} */
  const found = [];
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    if (!existsSync(cur) || !statSync(cur).isDirectory()) continue;
    for (const name of readdirSync(cur)) {
      const p = join(cur, name);
      const st = statSync(p);
      if (st.isDirectory()) {
        stack.push(p);
        continue;
      }
      if (!name.endsWith(".glb")) continue;
      found.push({ path: p, mtime: st.mtimeMs });
    }
  }
  if (!found.length) return null;
  found.sort((a, b) => {
    const at = a.path.includes("texture") || a.path.includes("remake") ? 1 : 0;
    const bt = b.path.includes("texture") || b.path.includes("remake") ? 1 : 0;
    if (at !== bt) return bt - at;
    return b.mtime - a.mtime;
  });
  return found[0].path;
}

async function loadPrepared(path) {
  if (!existsSync(path)) throw new Error(`Missing Tripo source: ${path}`);
  const doc = await io.read(path);
  await doc.transform(flatten(), dedup());
  bakeAllNodeTransforms(doc);
  await doc.transform(dedup(), prune());
  return doc;
}

async function bakeOne(job) {
  const srcDir = join(tripoRoot, job.id);
  const src = findSourceGlb(srcDir);
  if (!src) {
    console.warn(`skip ${job.id}: no GLB under ${srcDir}`);
    return false;
  }
  const doc = await loadPrepared(src);
  facePosZFromTripoX(doc);
  const finalSize = centerSitScale(doc, { longest: job.longest, sit: job.sit });
  keepRealisticMaterials(doc, job.id);
  await simplifyDoc(doc, job.ratio, job.error);
  mkdirSync(outDir, { recursive: true });
  const dest = join(outDir, `${job.id}.glb`);
  const bytes = await io.writeBinary(doc);
  writeFileSync(dest, bytes);
  console.log(`${job.id}.glb ← Tripo`, {
    src,
    bytes: bytes.byteLength,
    size: finalSize.size.map((v) => +v.toFixed(3)),
  });
  return true;
}

let baked = 0;
for (const job of JOBS) {
  if (await bakeOne(job)) baked += 1;
}
if (baked === 0) {
  console.error(
    "No Kettenhochhaus props baked — run tripo make into assets/tripo-out/kettenhochhaus/<id>/ first.",
  );
  process.exitCode = 1;
} else {
  console.log(`Baked ${baked}/${JOBS.length} Kettenhochhaus props → ${outDir}`);
}
