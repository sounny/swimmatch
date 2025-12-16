# SwimMatch Development Plan

## Quick take on ref/reserach.md
- Strong breadth: covers stroke mechanics, pacing, starts/turns, biomechanics, physiology, hydrodynamics, tech landscape, and visualization needs.
- Issues: pervasive encoding artifacts (e.g., `??`), repeated citations, and a few very long paragraphs that hurt readability.
- Suggestions: clean encoding, dedupe repeated source mentions, tighten sections into actionable requirements, and pull out priority metric sets for MVP vs. later waves (e.g., stroke+split core, then start/turn, then physiology/video overlays).

## Backlog (ordered)
1. Fix encoding artifacts in ref/reserach.md and reflow into readable paragraphs.
2. Condense the report into an executive summary with 1-page takeaways for coaches.
3. Extract a canonical metric glossary (definitions, units, equations, sampling rules).
4. Tag metrics by difficulty-to-capture vs. value-to-coach for prioritization.
5. Create a metric dependency map (what needs stroke id, turn markers, HR, etc.).
6. List concrete data sources for each metric (manual entry, wearables, video, timing).
7. Define swim event taxonomy (course length, stroke, distance, relay vs individual).
8. Create an evidence table mapping each metric to cited literature/source URLs.
9. Draft a privacy/consent note for ingesting biometrics and athlete video.
10. Publish a cleaned PDF version of the research for stakeholders.
11. Define MVP scope: manual inputs + derived stroke/pace metrics + insights.
12. Draft v1 user stories for coaches, swimmers, analysts (deck-side vs remote).
13. Map primary flows: add swimmer, log session, analyze race, compare over time.
14. Design IA: dashboard, session list, race analysis, athlete profile, insights inbox.
15. Identify offline/low-connectivity needs for pool deck usage.
16. Document localization needs (metric/imperial, language support).
17. Specify accessibility targets (WCAG 2.1 AA for forms/charts).
18. Define roles/permissions (coach, swimmer, staff, viewer).
19. Plan monetization/tiers (free logging vs pro analytics/video sync).
20. Draft KPI tree for the product (weekly active coaches, logged sessions, insights viewed).
21. Design core data model: swimmer, session, rep, split, stroke counts, turns, notes.
22. Model start/turn events with timestamps, locations, and qualitative tags.
23. Add biometrics model: HR, HRV, lactate, RPE, wellness fields per session.
24. Design import formats (CSV for splits/strokes, JSON for wearable streams).
25. Define versioned metric calculations to avoid silent changes over time.
26. Create validation rules for manual entry (range checks, required combos).
27. Plan storage for raw vs derived metrics to allow recomputation.
28. Add swimmer equipment context (suit, fins, paddles) to sessions.
29. Model pool metadata (course length, depth, altitude) per location.
30. Set up sample datasets for dev/testing (anonymized realistic sessions).
31. Implement stroke rate calculator from stroke timestamps and duration.
32. Implement DPS calculator using distance and stroke count with unit safety.
33. Implement stroke index (velocity x DPS) with configurable smoothing.
34. Implement SWOLF with course-length awareness and multi-length averaging.
35. Add pacing analysis: per-lap variance, negative split detection, pacing score.
36. Implement start metrics: reaction, block time, flight distance placeholders.
37. Implement turn metrics: in/out distances, push-off speed proxy, breakout length.
38. Add CSS/critical speed calculator with regression over multiple tests.
39. Add training zone calculator (pace, HR, RPE bands) from CSS/threshold inputs.
40. Build metric quality flags (estimated, measured, missing data markers).
41. Design race analysis view: splits chart, stroke count chart, turn markers overlay.
42. Add DPS vs stroke rate scatter with efficiency bands per stroke type.
43. Add split consistency sparkline to session list cards.
44. Create comparative race overlay (athlete vs goal/benchmark splits).
45. Add table view with conditional formatting for turns, strokes, HR zones.
46. Implement interactive timeline linking video and metric cursor.
47. Add export to PDF/CSV for a selected session or race.
48. Design mobile-first deck mode with large tap targets and offline cache.
49. Add coach notes + tags panel attached to any rep or race segment.
50. Implement onboarding tour that highlights key visuals and inputs.
51. Refine SVG swimmer: add shoulder/hip rotation states per stroke type.
52. Add dynamic streamline scoring overlay (angle, hip drop, head position sliders).
53. Animate underwater dolphin kicks with configurable count and amplitude.
54. Add breakout distance marker synced to stroke animations.
55. Implement drag/buoyancy heuristic visualization from body ratios and suit choice.
56. Allow side/profile toggle for better breaststroke/butterfly visuals.
57. Add tempo trainer overlay (beep cadence) to sync with arm cycles.
58. Add lane environment options (depth, wave profile) to affect visuals subtly.
59. Expose anthropometric presets per stroke specialist (sprinter vs distance).
60. Add screenshot/export for the silhouette + metric snapshot.
61. Build quick log form for 25/50 repeats with stroke count/time inputs.
62. Add bulk entry grid for set logging (copy/paste from sheets).
63. Implement stopwatch-style capture with keyboard shortcuts.
64. Add RPE, sleep, soreness checkboxes to each session for context.
65. Allow tagging sets (aerobic, race-pace, skills) for filtering analytics.
66. Implement per-stroke technique checklists (hit/miss) per session.
67. Add goal times and auto-gap display versus logged reps.
68. Surface personal bests and seasonal bests per event.
69. Add reminders for CSS/threshold re-tests on cadence (e.g., every 6 weeks).
70. Implement deletion/undo and audit log for session edits.
71. Prototype manual video upload with time alignment to splits.
72. Add YouTube/Drive link support with start-offset metadata.
73. Research TritonWear/FORM API availability and mock ingestion adapters.
74. Design generic wearable import interface (timestamped strokes, pace, HR).
75. Add CSV import wizard with column mapping templates per device.
76. Plan camera marker support (clap/flash) for DIY video alignment.
77. Define webhook schema for live timing systems (touchpad hits).
78. Add export endpoint for third-party analysis tools (JSON/CSV).
79. Implement consent tracking for video uploads per swimmer.
80. Create sample integration stubs for local dev without hardware.
81. Build rules-based insights: pace drop-off alerts, turn slowdowns, SR drift.
82. Add comparison insights versus personal baseline and team percentile.
83. Implement coaching suggestion library mapped to detected issues.
84. Add anomaly detection for outlier strokes or heart rate spikes.
85. Create a session summary generator (bullet points) from metrics.
86. Prototype predictive model for race time from CSS + stroke metrics.
87. Add goal-tracking widgets with progress bars per metric.
88. Implement notification preferences (email/push) for new insights.
89. Add AB testing hooks for insight phrasing and thresholds.
90. Log insight feedback (helpful/not) to tune future recommendations.
91. Set up unit tests for metric calculators (SR, DPS, SWOLF, CSS).
92. Add golden dataset regression tests to catch algorithm changes.
93. Implement frontend visual regression snapshots for charts and SVGs.
94. Add accessibility audit (axe) to key pages and fix issues.
95. Add performance budgets for main dashboard load and interactions.
96. Implement offline cache tests for deck mode forms.
97. Add lint/format hooks and CI job for prettier/eslint checks.
98. Set up bundling/treeshaking to keep JS/CSS sizes in check.
99. Profile animation performance on low-end mobile and optimize SVG.
100. Document QA checklist per release (devices, strokes, inputs).
101. Pick hosting/runtime stack and create environment configs.
102. Set up feature flags for gradual rollout of new metrics and visuals.
103. Implement backups for user data and uploads with retention policy.
104. Add audit logging for data changes (sessions, metrics, profiles).
105. Define PII handling (encryption at rest/transport, deletion flow).
106. Set up error tracking/monitoring with alerting.
107. Add synthetic data mode for demos without real athlete info.
108. Create migration plan for evolving data schemas.
109. Document SLOs for API responsiveness and availability.
110. Prepare an incident response playbook for data issues.
111. Write coach-facing help docs with GIFs of key workflows.
112. Create a drills/sets library referenced by insights.
113. Publish a public changelog and roadmap page.
114. Plan beta program with 3-5 teams for feedback cycles.
115. Collect and publish anonymized benchmarks by age/stroke as reference.
