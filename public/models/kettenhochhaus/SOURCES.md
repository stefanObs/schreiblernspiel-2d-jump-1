# Kettenhochhaus models

Shipped GLBs for the chain / highrise minigame. Generated via Tripo → `npm run kettenhochhaus:bake-tripo`.

**Status:** assets pending (S03). No GLBs shipped yet — runtime uses placeholders until Tripo bake.

| File | Role | Concept | Tripo texture task |
|------|------|---------|-------------------|
| `chain.glb` | Chain to break | `assets/tripo-concepts/kettenhochhaus/chain.png` | — |
| `highrise.glb` | Burning highrise | `assets/tripo-concepts/kettenhochhaus/highrise.png` | — |
| `hose.glb` | Fire hose prop | `assets/tripo-concepts/kettenhochhaus/hose.png` | — |
| `ground.glb` | Ground / street | `assets/tripo-concepts/kettenhochhaus/ground.png` | — |

Orientation after bake: forward **+Z**, up **+Y**, sit on **Y = 0**.

**Handoff contract:** Tripo agent delivers baked GLBs + this `SOURCES.md` (mount/scale notes). Implementer only wires loader URLs in `src/minigames/kettenhochhaus/loadModels.ts` — no shared file edits in one slice.

Authoring: raw Tripo out is gitignored under `assets/tripo-out/kettenhochhaus/`.
