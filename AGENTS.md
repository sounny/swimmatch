# AGENTS

## Memory
- 2024-05-20: Initial vanilla JavaScript dashboard. Replaced previous React prototype.
  - Added SVG silhouette that scales with height and wingspan.
  - Basic heuristics compute BMI, ape index, and suggest strokes/distances.
  - Included presets for Phelps, Dressel, Finke, Ledecky and McIntosh.
- 2025-08-13: Introduced reusable swimmer shape for more realistic silhouette and mini-stroke panels.
- 2025-08-13: Added simple coach tests panel with SWOLF and CSS calculations stored in localStorage.
- 2025-08-26: Replaced swimmer silhouette with adjustable stick figure and added animated mini-stroke panels colored by stroke suitability.
- 2025-08-27: Reworked figure into block swimmer silhouette with rotatable limbs.
- 2025-12-15: Restyled dashboard with darker pro layout, stat cards, accent bars, and denser form grid.
- 2025-12-15: Overhauled the dashboard look with an organic SVG swimmer, lane-style stroke mini panels, richer heuristics (leverage/streamline/kick/timing), and new callouts; ran Prettier on core files.

## Instructions for future agents
- Keep the project framework-free (vanilla JS, CSS, HTML).
- Append notes in **Memory** with date and what you changed or considered.
- Aim for realistic silhouettes and hydrodynamics visuals; maintain minimalist monochrome style.
- Run `npx prettier --check index.html main.js metrics.js` before committing.
- Document reasoning and next ideas here to help the next contributor.
