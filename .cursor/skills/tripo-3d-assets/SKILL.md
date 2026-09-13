---
name: tripo-3d-assets
description: >-
  Authors Ballkanone and Kettenhochhaus 3D meshes via realistic concept art →
  Tripo3D image-to-mesh → bake scripts → shipped GLBs. Runtime never calls Tripo.
  Use when generating or rebuilding props under public/models/ballkanone/ or
  public/models/kettenhochhaus/.
---

# Tripo 3D assets (Schreiblernspiel)

**Runtime never calls Tripo.** Play ships baked GLBs under `public/models/<minigame>/`. Authoring sources live in gitignored `assets/tripo-out/`.

Full CLI / path cookbook: [pipeline.md](pipeline.md). Ownership: [docs/AGENT_OWNERS.md](../../../docs/AGENT_OWNERS.md).

**Style:** photorealistic props (wood, metal, rubber, concrete) — **not** Stil C comic, **not** Asphalt-Comic toon. Keep Tripo PBR albedo; bake does **not** convert to toon materials.

Supported minigames: **ballkanone** and **kettenhochhaus** (separate folders; never mix paths).

## Hard rules

1. **Concept first** — isolated prop PNG on plain studio ground under `assets/tripo-concepts/<minigame>/`.
2. **Credits before generate** — `tripo doctor` / `tripo balance`. Stop and ask the user to top up if balance is 0.
3. **Ship only baked outputs** — commit `public/models/<minigame>/**/*.glb` + bake scripts; never commit `assets/tripo-out/` or `.tripo/`.
4. **Orientation contract** — local **forward +Z**, **up +Y**, rest on **Y = 0** after bake.
5. **Do not edit** `src/minigames/**` gameplay (except documenting URLs in `SOURCES.md` handoff).
6. **Do not touch** `public/art/**` (owned by `comic-rettung-art`).

## Ballkanone MVP props

| Id | Out GLB | Role |
|----|---------|------|
| `cannon` | `cannon.glb` | Ballkanone am unteren Rand |
| `ball` | `ball.glb` | Geschoss |
| `crate` | `crate.glb` | Hindernis / Versteck |
| `barrier` | `barrier.glb` | niedrige Barriere |
| `tree` | `tree.glb` | Parkbaum (Szenerie) |
| `lamp` | `lamp.glb` | Straßenlaterne |
| `bush` | `bush.glb` | Busch |
| `rock` | `rock.glb` | Stein |

## Kettenhochhaus MVP props

| Id | Out GLB | Role |
|----|---------|------|
| `axe` | `axe.glb` | Feuerwehr- / Rettungs-Axt |
| `chain` | `chain.glb` | Querkette (L→R über den Bildschirm) |
| `highrise` | `highrise.glb` | Brennendes Hochhaus |
| `hose` | `hose.glb` | Löschschlauch / Prop |
| `ground` | `ground.glb` | Boden / Straße |

## Agent checklist

```
Task Progress:
- [ ] 1. Credits OK (`tripo balance`)
- [ ] 2. Concept PNG under assets/tripo-concepts/<minigame>/
- [ ] 3. tripo make → assets/tripo-out/<minigame>/... (gitignored)
- [ ] 4. npm run <minigame>:bake-tripo → public/models/<minigame>/
- [ ] 5. Update SOURCES.md
- [ ] 6. Handoff: GLB paths + scale notes (no gameplay edits)
```

Bake scripts:

- Ballkanone: `npm run ballkanone:bake-tripo`
- Kettenhochhaus: `npm run kettenhochhaus:bake-tripo`
