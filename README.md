# Nexus — Gaming Lounge OS

A polished, animated admin interface for a gaming lounge, built with React, Vite, TypeScript, Tailwind CSS v4 and [open-glass-ui](https://www.npmjs.com/package/open-glass-ui) liquid-glass components.

## Run

```bash
npm install
npm run dev      # http://127.0.0.1:5173
npm run build    # typecheck + production build
npm run preview
```

## Workspaces

| Page | Highlights |
| --- | --- |
| Overview | Live KPI stats, revenue/expense area chart, zone heatmap, activity feed, fleet alerts |
| Cafe & Floor | POS catalog + sticky cart and a 24-station floor map; station drawer can start sessions or order food for a PC |
| Stock | Inventory table, category/status filters, low-stock banner, restock and new-item dialogs |
| Finance | Revenue vs. cost bars, payment-mix donut, shift ledger, debt settlement, Z-report |
| Members | Member CRM with tiers, balances, top-up drawer and new-member flow |
| Monitoring | 24-node live telemetry grid, remote actions, fleet health queue, system inventory, alerts |
| Shift Reports | Guided shift-close stepper, variance reconciliation, Z-report preview and archive, handover notes |
| Settings | Theme presets, table density, motion, ambient and telemetry preferences |

## Theming

Six curated presets — Nordic Cobalt, Tokyo Dusk, Emerald Lounge, Solar Sand, Velvet Iris, Monochrome Titanium — recolor the ambient mesh, surfaces, charts and the open-glass provider accent. Selection persists in `localStorage` under `nexus-theme`.

## Notes

- Dark glass only; neutral UI surfaces with accents reserved for actions, data and status.
- Motion respects `prefers-reduced-motion` and can be disabled in Settings.
- The build currently emits a single JS chunk; the >500 kB notice is informational.
