# Kettenhochhaus models

Shipped GLBs for the chain / highrise minigame. Generated via Tripo → `npm run kettenhochhaus:bake-tripo`.

| File | Role | Concept | Tripo texture task |
|------|------|---------|-------------------|
| `chain.glb` | Chain to break | `assets/tripo-concepts/kettenhochhaus/chain.png` | `62c9e0d9` |
| `highrise.glb` | Burning highrise | `assets/tripo-concepts/kettenhochhaus/highrise.png` | `2330534f` |
| `hose.glb` | Fire hose prop | `assets/tripo-concepts/kettenhochhaus/hose.png` | `37533fe0` |
| `ground.glb` | Ground / street | `assets/tripo-concepts/kettenhochhaus/ground.png` | `340dfed5` |

Orientation after bake: forward **+Z**, up **+Y**, sit on **Y = 0**.

**Bake extents (unit boxes after sit/scale):**

| File | Size (X × Y × Z) | Notes |
|------|------------------|-------|
| `chain.glb` | ~0.65 × 0.44 × 1.6 | Long axis along **+Z**; mount at center; break/hit along Z |
| `highrise.glb` | ~1.52 × 3.2 × 1.61 | Tall on **+Y**; facade faces roughly **+Z**; fire/smoke is baked albedo only |
| `hose.glb` | ~1.4 × 0.53 × 1.09 | Coil on ground; brass nozzle toward **+X** after remap — yaw if nozzle must face +Z |
| `ground.glb` | ~4.0 × 0.51 × 4.0 | Thick asphalt slab; scale XZ to playfield; keep thin Y |

**Runtime scales (suggested):** chain ×0.9–1.1, highrise ×0.7–1.0 (or taller if world units need it), hose ×0.85–1.0, ground ×1.0–1.5 on XZ only.

**Handoff contract:** Tripo agent delivers baked GLBs + this `SOURCES.md` (mount/scale notes). Implementer only wires loader URLs in `src/minigames/kettenhochhaus/loadModels.ts` — no shared file edits in one slice.

Authoring: raw Tripo out is gitignored under `assets/tripo-out/kettenhochhaus/`.
