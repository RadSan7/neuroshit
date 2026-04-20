# NeuroShit UI Kit

Hi-fi clickable recreation of the NeuroShit atlas — toolbar, filter dropdown, canvas-rendered biochemical map, hover tooltip, info panel, minimap, legend. Cosmetic port of `source/` — not production code.

## Components
- `Toolbar.jsx` — brand wordmark + filter dropdown + zoom cluster
- `Legend.jsx` — bottom-right key panel (collapsible)
- `Minimap.jsx` — bottom-left overview
- `InfoPanel.jsx` — right-docked detail panel
- `Tooltip.jsx` — floating hover card
- `AtlasCanvas.jsx` — canvas graph with pan/zoom + hand-placed subset of the dopamine + serotonin systems

## What's clickable
- Filter toggle opens system dropdown, checkboxes filter visible nodes
- Hover any node → tooltip follows cursor
- Click any node → info panel slides in from the right with details
- Close button rotates 90° on hover, dismisses panel
- Zoom in/out/reset buttons, keyboard shortcuts `+` `-` `0`
- Legend collapsible via header chevron
