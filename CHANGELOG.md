# Changelog

All notable changes to this project are documented in this file.

## Unreleased - 2026-04-20

### Added

- Brain-region support in the atlas model, including dedicated node styling and receptor-to-region connections.
- Anatomical background asset in `assets/brain-human-lateral-view.svg` to anchor the atlas around real CNS anatomy.
- A receptor-region research base in `baza_receptorow_mozg.md`, covering 71 receptor nodes and their major CNS locations.
- A dedicated `NeuroShit Design System/` workspace with tokens, preview cards, source snapshots, and UI kit references.
- Richer atlas chrome in `index.html`: structured tooltip markup, dossier-style info panel, minimap header, live legend footer, brain-region toggle, and node-position reset control.

### Changed

- Reframed the product from a generic biochemical map into a neuro atlas focused on neurotransmitters, receptors, transporters, metabolites, and brain regions.
- Expanded `medical-encyclopedia.js` with the `brainRegion` node/edge vocabulary and updated several node placements to improve atlas readability.
- Deepened the canvas UI in `script.js` and `styles.css` with minimap, dossier interactions, richer legend states, and a more developed glass-panel visual language.
- Updated `README.md` so the repository description, assets, and interaction model match the current atlas scope.

### Planned

- Move the runtime stylesheet closer to the design-system tokens so `styles.css` and `NeuroShit Design System/colors_and_type.css` do not drift apart.
- Reduce render overhead by avoiding full minimap canvas reallocation on every frame and by trimming the most expensive full-screen visual effects.
- Split the large runtime logic in `script.js` into smaller browser-loaded files once the interaction model stabilizes.
- Add lightweight regression coverage for pan/zoom, minimap sync, legend states, info-panel content, and region toggling.
- Curate any permanent UI screenshots into a dedicated documentation location instead of keeping ad hoc captures at repository root.