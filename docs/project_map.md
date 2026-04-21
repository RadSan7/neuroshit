# NeuroShit — Project Map

Interactive biochemical map of neurotransmitter systems and brain regions. Pure static web app (HTML/CSS/JS, Canvas 2D).
No build tooling, no package.json — runs directly in a browser (open `index.html` or serve statically).

## Entry point

- [index.html](index.html) — single-page shell. Contains:
  - `#toolbar` — brand, subtitle, system-filter dropdown, zoom/interaction controls.
  - `#canvas-container > #map` — main `<canvas>` (pan/zoom, pinch).
  - `#tooltip` — floating hover card.
  - `#info-panel` — slide-in details panel (right side).
  - `#minimap` — overview mini-canvas with draggable viewport rectangle.
  - `#legend` — node/connection legend (collapsible).
  - `#toggleBrainRegions` / `#resetPositions` — region visibility + manual layout recovery controls.

## JavaScript

### [medical-encyclopedia.js](medical-encyclopedia.js) — data layer (≈700 lines, IIFE)
Exports `window.MEDICAL_ENCYCLOPEDIA`:
- `colors` — type → hex.
- `nodeShapes` — type → shape geometry (`circle | roundedRect | hexagon | diamond`) + `renderAsLabel` flag (enzymes are pill-labels on edges, not standalone nodes).
- `connectionTypes` — edge styles (`synthesis`, `degradation`, `binding`, `reuptake`, `precursorConversion`, `inhibition`, `receptorInteraction`).
- `sharedNodes` — enzymes shared across systems (AADC, MAO-A, MAO-B, COMT, DBH, PNMT, …).
- `systems[]` — 9 neurotransmitter systems. Each has `id`, `name`, `color`, `nodes[]`, `connections[]`, optional `receptorGroups[]` (subtype hubs, e.g. D1/D2, 5-HT1/5-HT2).
- `receptorInteractions[]` — cross-receptor modulation edges (facilitation/inhibition/modulation).
- Brain-region nodes and region-presence edges are now part of the rendered atlas vocabulary.

### [script.js](script.js) — render + interaction engine (≈1600 lines, IIFE)
Organised in thematic sections (all inside a single closure):

| Section | Lines (approx) | What it does |
| --- | --- | --- |
| Graph build | 18–197 | Flatten encyclopedia into `allNodes`/`allEdges`, apply shape defs, build `receptorGroupData` (hub+members), add interaction edges. |
| Visibility | 201–216 | `updateVisibility()` filters by `activeSystems`; rebuilds synthesis chains. |
| Synthesis-chain detection | 222–283 | Collapses `(A→enzyme) + (enzyme→B)` pairs into one labelled arrow, enzyme rendered as a pill label. |
| Hit-testing / geometry | 288–436 | Shape-aware hit-test, shape-aware edge endpoint calculation, Bézier helpers. |
| Drawing primitives | 441–495 | Rounded-rect, hex, diamond paths, edge-label pill. |
| Render loop | 500–697 | Camera lerp, `requestRender()` single-frame scheduler, `draw()`, grid. |
| Edge rendering | 699–796 | `drawConnectionBetweenNodes`, `drawEdge`, arrows (triangle / bar). |
| Synthesis-chain rendering | 801–909 | Straight or curved substrate→product with enzyme label; avoids overlapping nodes. |
| Receptor-group rendering | 913–969 | Hub pill + fanned-out subtype branches. |
| Node rendering | 973–1129 | Shape-specific draw funcs, hover glow, label (multi-line, suffix-only for grouped receptors). |
| Pan / zoom | 1134–1240 | Mouse pan, right-drag zoom, wheel scroll/zoom, pinch. |
| Hover tooltip | 1244–1307 | Hit-test, content, edge-aware placement. |
| Click → info-panel | 1312–1439 | Builds panel HTML per node type (receptor gets extended fields + interactions + connections). |
| Toolbar | 1444–1463 | Interaction toggle, zoom buttons, keyboard shortcuts (`+`, `-`, `0`, `Esc`). |
| System filters | 1468–1506 | Dropdown with per-system checkboxes. |
| Minimap | 1510–1581 | Overview rendering + viewport rectangle sync. |

### Utility / maintenance scripts (Python + Node)
One-off data-cleanup scripts used to manipulate `medical-encyclopedia.js`:
- `fix_ligands.py`, `fix_lines.py`, `fix_script.py`, `fix_trace_amines.py`, `update_interactions.py`
- `fix_script.js`, `fix_script2.js` … `fix_script6.js`

Not part of the runtime. Safe to ignore unless editing the encyclopedia.

## Styles

- [styles.css](styles.css) — single stylesheet. Sections: CSS variables, `body` background (radial-gradient stack), `#app` decorative layers (grid + glow), toolbar, tooltip, info-panel, minimap, legend, scrollbar, responsive (`max-width: 768px`).

## Design System Workspace

- [NeuroShit Design System/README.md](NeuroShit%20Design%20System/README.md) — visual direction, token philosophy, and preview inventory.
- `NeuroShit Design System/colors_and_type.css` — design tokens and type system used as the visual reference source of truth.
- `NeuroShit Design System/preview/` — isolated previews for colors, spacing, surfaces, and UI components.
- `NeuroShit Design System/source/` — reference snapshot of the atlas implementation files.
- `NeuroShit Design System/ui_kits/neuroshit/` — component-oriented UI references (`AtlasCanvas.jsx`, `Toolbar.jsx`, `InfoPanel.jsx`, `Legend.jsx`, `Minimap.jsx`, `Tooltip.jsx`).

The runtime app still loads `styles.css` directly; the design-system workspace is currently a parallel reference package, not a wired build dependency.

## Supporting Research And Assets

- [assets/brain-human-lateral-view.svg](assets/brain-human-lateral-view.svg) — anatomical background used by the atlas.
- [baza_receptorow_mozg.md](baza_receptorow_mozg.md) — curated receptor-to-brain-region research base used to extend regional atlas coverage.

## Backups
- `script.js.bak`, `medical-encyclopedia.js.bak` — prior versions (not referenced).

## Local-Only Artifacts

- `.playwright-mcp/` — browser automation logs/snapshots. Not part of project history.
- Root-level PNG captures are manual QA screenshots. Keep them local unless they are curated into documentation.

## Runtime topology

```
index.html
  ├─ medical-encyclopedia.js   (IIFE → window.MEDICAL_ENCYCLOPEDIA)
  └─ script.js                 (IIFE, reads encyclopedia, mounts canvas + DOM handlers)
```

No modules, no bundler, no framework. Everything talks via the single global and direct DOM IDs.

## Current Snapshot

- The atlas now presents neurotransmitters, enzymes, receptors, transporters, metabolites, and brain-region context in one canvas workspace.
- UI chrome has shifted toward a dossier metaphor: richer hover cards, a structured side panel, minimap status chrome, and a denser legend/footer treatment.
- A standalone design-system workspace now exists alongside the app to guide future UI refactors without introducing build tooling.

## Known performance hotspots

1. `drawMinimap()` runs on **every** `draw()` call and re-assigns `canvas.width/height` each frame (full reallocation + clear). Should only repaint when `visibleNodes`/`visibleEdges` change; viewport rectangle can be updated purely via CSS on pan/zoom.
2. `#app::after` uses `filter: blur(48px)` on a full-viewport layer — forces an offscreen raster on every repaint. Pre-blurred gradients are cheaper.
3. `drawGrid()` paints the full visible grid every frame. Fine for pan/zoom, but could be rasterised to a tiled pattern if needed.

## Next Implementation Steps

1. Align runtime styling with the design-system token file so the live app and reference workspace cannot drift.
2. Tackle the minimap/full-screen repaint costs before adding more dense regional overlays.
3. Break `script.js` into smaller browser-loaded units after the interaction surface settles.
4. Add lightweight regression checks for zoom, minimap sync, panel content, legend counts, and region toggling.
