# NeuroShit Design System

Interactive biochemical atlas of the human nervous system. Dark, spacious, scientific — a navigable graph of neurotransmitters, enzymes, receptors, transporters, and their pharmacology.

## Files
- `design_system/colors_and_type.css` — single source of truth (CSS vars)
- `preview/*.html` — design-system cards (Colors, Type, Spacing, Components, Brand)
- `ui_kits/neuroshit/UI Kit.html` — clickable hi-fi recreation

## Vibe
- Background: deep space (`#0a0a1a`) with a soft radial vignette toward `#1a1a2e`, a subtle dot-grid (`~30px`) and a sparse 120px grid line overlay.
- Surfaces: glass — `rgba(15,15,35,0.92-0.96)` with a 16px blur, hairline borders `rgba(255,255,255,0.08)`.
- Primary accent: neon green `#4ade80` for "alive" (nodes, hover, selected, checks). Secondary: cyan `#22d3ee` for co-accents & brand gradient.
- Typography: **Outfit** (200–800) for all UI, **Fira Code** for formulas/IDs.
- Node vocabulary is geometric: circle = neurotransmitter, pill = enzyme, hexagon = receptor, diamond = transporter, small circle = precursor/metabolite. Each node type carries a signature color with a matching glow.
- Edges carry meaning via style: solid (synthesis), short-dash (degradation), long-dash (receptor binding), fine dash (reuptake), dotted (precursor conversion).

## Usage
Every token lives in `colors_and_type.css`. Load it once, consume via `var(--ns-*)`. Layouts use a 4px spacing base.
