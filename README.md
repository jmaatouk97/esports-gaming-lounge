# Nexus — Esports & LAN Lounge OS

A premium operating system for a gaming cafe, esports arena and LAN center. Built with React 19, Vite, TypeScript, Tailwind CSS v4, Zustand and [open-glass-ui](https://www.npmjs.com/package/open-glass-ui) liquid-glass primitives.

**Live:** https://jmaatouk97.github.io/esports-gaming-lounge/

## Run

```bash
npm install
npm run dev      # http://127.0.0.1:5173
npm run build    # typecheck + production build
npm run preview
```

## Routes

| Route | Module |
| --- | --- |
| `/` | Overview — live KPIs, revenue chart, zone heatmap, activity and fleet alerts |
| `/cafe` | Cafe & Floor — POS terminal plus the full floor map editor |
| `/stock` | Stock — inventory filters, low-stock banner, restock and new-item flows |
| `/finance` | Finance — revenue vs. cost, payment mix, shift ledger, debt settlement, Z-report |
| `/members` | Members — CRM with tiers, balances, top-up drawer and member creation |
| `/monitoring` | Monitoring — live telemetry grid with compact/standard/detailed density and thumbnail mode |
| `/events` | Events — reservations calendar, day timeline, check-in, tournaments and brackets |
| `/reports` | Shift Reports — guided close, variance reconciliation, Z-report, handover |
| `/ui-showcase` | UI Showcase — interactive component laboratory for every primitive in the system |
| `/settings` | Settings — theme presets, density, motion and operational preferences |

## Flagship: floor map editor

`src/components/floor/FloorEditor.tsx` renders the live floor and the editing surface.

- Drag stations and zones; drag handles to resize; rotate via the rotate handle.
- Pan (drag background or middle mouse), zoom (wheel / controls), fit to viewport.
- Marquee multi-select, measure tool, add station / table / label / zone.
- Undo, redo, save and reset; live vs. edit modes.
- Left-click a station opens the right-hand drawer; right-click opens a cursor-anchored glass context menu with submenus.
- Batch toolbar for multi-station actions, including a broadcast message composer.

All hardware actions (remote desktop, restart, shutdown, wake-on-LAN, lock, messages) are clearly labelled **simulated** and require a Windows client agent.

## Reservations & tournaments

`/events` includes:

- Month and week reservation views, day filtering by status.
- Booking creation (member, zone, station, date/time, duration, guests, deposit, note).
- Check-in, confirmation, cancellation, deposit totals and a day timeline.
- Single and double elimination brackets: score maps, decide matches, advance winners, prize-pool split, bracket reset.
- Tournament drafting with game, team count and prize pool.

## Appearance studio

The header palette button opens the Appearance Studio:

- Light and dark mode, 16 presets, 6 font pairings.
- Six glass-optics sliders (strength, bezel, dispersion, frost, blur, specular).
- Live WebGL backgrounds — LED matrix, aurora mesh, vector grid and film grain — with speed, intensity and pause controls. Animation pauses when the tab is hidden and honours reduced-motion preferences.
- Persisted in `localStorage` under `nexus-appearance-v2`.

## Persistence keys

| Key | Contents |
| --- | --- |
| `nexus-appearance-v2` | Mode, preset, font pair, optics and live background settings |
| `nexus-floor-v3` | Station positions, sizes, rotation, zones and floor extras |

The floor layout is browser-local by design; seeded deployments always start from 36 stations across four zones.

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`:

1. `npm ci` and `npm run build` on Node 22.
2. Vite uses base `/esports-gaming-lounge/` when `GITHUB_ACTIONS=true`.
3. `dist/index.html` is copied to `dist/404.html` for SPA deep-link fallback.
4. GitHub Pages deploys the artifact.

## Notes

- Motion honours `prefers-reduced-motion` and can be disabled in Settings.
- The production build emits one JS chunk; the Vite >500 kB notice is informational.
- Demo data is simulated and resets with the seeded dataset on a fresh browser profile.
