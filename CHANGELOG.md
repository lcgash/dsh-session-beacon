# Changelog

## 1.0.0 — 2026-11-26

- First public release.
- Adds a single-color session status icon to the title-adjacent Session header action seat.
- Highest-priority status coloring: amber (waiting for human confirmation), green (just completed and unread), blue (running, with a pulsing halo), gray (idle only).
- Hovering the icon shows a floating session bar below the header with active sessions and the idle count; it collapses about three seconds after the pointer leaves.
- Clicking a badge opens the session; clicking the icon or the bar's beacon button opens the All sessions panel.
- English and Simplified Chinese UI dictionaries and plugin metadata.
- Client-only: no Host service, tool, model request, session event, persistence, or history read.
