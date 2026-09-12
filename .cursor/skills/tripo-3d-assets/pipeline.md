# Tripo pipeline cookbook (Ballkanone + Kettenhochhaus)

Companion to [SKILL.md](SKILL.md).

## CLI setup

```bash
export PATH="$HOME/.local/node/bin:$HOME/.local/bin:$PATH"
tripo doctor
tripo balance
```

## Canonical `tripo make`

Replace `<minigame>` with `ballkanone` or `kettenhochhaus`:

```bash
tripo make <concept.png> \
  --model tripo-p1 \
  --for game-pc \
  --then texture \
  --name <history-name> \
  -o <assets/tripo-out/<minigame>/<id>> \
  --json \
  --timeout 1800 \
  --yes \
  --no-open
```

## Bake

### Ballkanone

```bash
npm run ballkanone:bake-tripo
```

Script: `scripts/bake-ballkanone-tripo.mjs`  
Sources: `assets/tripo-out/ballkanone/<id>/`  
Output: `public/models/ballkanone/<id>.glb`

### Kettenhochhaus

```bash
npm run kettenhochhaus:bake-tripo
```

Script: `scripts/bake-kettenhochhaus-tripo.mjs`  
Sources: `assets/tripo-out/kettenhochhaus/<id>/`  
Output: `public/models/kettenhochhaus/<id>.glb`

Both bakers:

1. Find `model.glb` under `assets/tripo-out/<minigame>/<id>/` (prefer `texture/`)
2. Flatten + bake node transforms
3. Remap Tripo +X → game **+Z** (`facePosZFromTripoX`)
4. Center XZ, sit on min Y, scale to job caps
5. Keep PBR albedo / metallic-roughness (no comic rewrite)
6. meshopt simplify + weld/dedup/prune
7. Write `public/models/<minigame>/<id>.glb`

Without sources: exit ≠ 0 and a clear error (no silent success).

## Concept tips

- Isolated prop on plain studio ground
- One primary volume; clear silhouette
- Photoreal materials (painted metal, rubber, wood, concrete)
- Clear facing: front toward camera-right in concept ≈ bake +Z
