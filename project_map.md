# NeuroShit — Project Map

Interactive biochemical map of neurotransmitter systems. Pure static web app (HTML/CSS/JS, Canvas 2D).
No build tooling, no package.json — runs directly in a browser (open `index.html` or serve statically).

## Entry point

- [index.html](index.html) — single-page shell. Contains:
  - `#toolbar` — brand, subtitle, system-filter dropdown, zoom/interaction controls.
  - `#canvas-container > #map` — main `<canvas>` (pan/zoom, pinch).
  - `#tooltip` — floating hover card.
  - `#info-panel` — slide-in details panel (right side).
  - `#minimap` — overview mini-canvas with draggable viewport rectangle.
  - `#legend` — node/connection legend (collapsible).

## JavaScript

### [medical-encyclopedia.js](medical-encyclopedia.js) — data layer (≈700 lines, IIFE)
Exports `window.MEDICAL_ENCYCLOPEDIA`:
- `colors` — type → hex.
- `nodeShapes` — type → shape geometry (`circle | roundedRect | hexagon | diamond`) + `renderAsLabel` flag (enzymes are pill-labels on edges, not standalone nodes).
- `connectionTypes` — edge styles (`synthesis`, `degradation`, `binding`, `reuptake`, `precursorConversion`, `inhibition`, `receptorInteraction`).
- `sharedNodes` — enzymes shared across systems (AADC, MAO-A, MAO-B, COMT, DBH, PNMT, …).
- `systems[]` — 9 neurotransmitter systems. Each has `id`, `name`, `color`, `nodes[]`, `connections[]`, optional `receptorGroups[]` (subtype hubs, e.g. D1/D2, 5-HT1/5-HT2).
- `receptorInteractions[]` — cross-receptor modulation edges (facilitation/inhibition/modulation).

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

## Backups
- `script.js.bak`, `medical-encyclopedia.js.bak` — prior versions (not referenced).

## Runtime topology

```
index.html
  ├─ medical-encyclopedia.js   (IIFE → window.MEDICAL_ENCYCLOPEDIA)
  └─ script.js                 (IIFE, reads encyclopedia, mounts canvas + DOM handlers)
```

No modules, no bundler, no framework. Everything talks via the single global and direct DOM IDs.

## Known performance hotspots

1. `drawMinimap()` runs on **every** `draw()` call and re-assigns `canvas.width/height` each frame (full reallocation + clear). Should only repaint when `visibleNodes`/`visibleEdges` change; viewport rectangle can be updated purely via CSS on pan/zoom.
2. `#app::after` uses `filter: blur(48px)` on a full-viewport layer — forces an offscreen raster on every repaint. Pre-blurred gradients are cheaper.
3. `drawGrid()` paints the full visible grid every frame. Fine for pan/zoom, but could be rasterised to a tiled pattern if needed.
