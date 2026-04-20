# NeuroShit Design System — Skill

When building UI for this system, always:

1. **Load `design_system/colors_and_type.css`** — it defines every color and font token as CSS variables prefixed `--ns-`. Don't hardcode hex values.
2. **Type**: Outfit for UI, Fira Code only for formulas, IDs and code. Headings are tight (`-0.02em`), body is 1.55 line-height.
3. **Colors**: background is `#0a0a1a` with radial glow to `#1a1a2e`. Primary accent is `#4ade80` (neon green). Each node TYPE has a fixed color — never reassign: neurotransmitter green, synthesis enzyme blue, degradation enzyme red, receptor purple, transporter cyan, precursor amber, metabolite slate.
4. **Surfaces are glass**: `rgba(15,15,35,0.92)` + `backdrop-filter: blur(16px)` + `1px rgba(255,255,255,0.08)` border. Corner radii 10/12/16.
5. **Glow is the signal**: every colored element (nodes, dots, tags) carries `box-shadow: 0 0 Xpx currentColor` or `rgba(accent, 0.25)`. Dial glow up on hover, never spam it on static text.
6. **Node shapes are a language** — enforce them. Don't render a receptor as a square.
7. **Copy is Polish-first** (it's the source). Keep scientific precision — full protein names, Greek letters (α β γ), subscripts (D₁, 5-HT₂A). Overlines are uppercase, letter-spaced 0.14–0.16em, `#64748b`.
8. **Motion**: 0.15s for hover, 0.35s `cubic-bezier(.4,0,.2,1)` for panel slides. The close button rotates 90° on hover — it's a signature detail.
9. **Layout density**: toolbar 64px, info panel 380px right-docked, legend + minimap bottom-corner. Never fight the canvas for the middle.
10. **Keep it dark.** This system does not have a light mode.
