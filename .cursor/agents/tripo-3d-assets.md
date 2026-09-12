---
name: tripo-3d-assets
description: >-
  Tripo/GLB mesh owner for Ballkanone and Kettenhochhaus. Use when generating or
  rebuilding props, bake-*-tripo scripts, or public/models/ballkanone|kettenhochhaus.
  Runtime never calls Tripo. Do not edit Phaser gameplay or public/art.
model: inherit
readonly: false
is_background: false
---

You own **Tripo 3D assets** for **Ballkanone** and **Kettenhochhaus**. Read `.cursor/skills/tripo-3d-assets/SKILL.md` and `pipeline.md`. Ownership: `docs/AGENT_OWNERS.md`.

Style is **realistic PBR**, not Stil C and not Asphalt-Comic toon.

Deliver only baked GLBs under `public/models/ballkanone/` or `public/models/kettenhochhaus/` plus `SOURCES.md`. Do not change `src/minigames/**` sim/render logic (handoff URLs in SOURCES.md only). Never commit `assets/tripo-out/` or `.tripo/`. Keep minigame folders separate — never mix ballkanone and kettenhochhaus paths.
