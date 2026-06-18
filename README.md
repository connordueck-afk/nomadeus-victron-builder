# Nomadeus Victron System Builder

Local React/Vite tool for comparing sample Victron-based system BOMs against a simplified Nomadeus all-in-one concept.

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Current App Shape

- Product data is split by type in `src/data/products/` and combined by `src/data/products.ts`.
- Product-type diagram rules live in `src/data/productTypes.ts`.
- Application defaults live in `src/data/applicationPresets.ts`.
- Initial system/comparison defaults live in `src/data/defaultSystem.ts`.
- Shared calculations live in `src/utils/calculations.ts`.
- CSV generation lives in `src/utils/csvExport.ts`.
- Browser persistence lives in `src/utils/storage.ts`.
- Main state wiring lives in `src/App.tsx`.

## Saved Systems

Completed systems are saved in browser `localStorage` as a local saved-system list. Saving a new system adds it to the sidebar dropdown; loading a saved system lets you edit it, and pressing Save again updates that selected record. These saves stay in the same browser profile on the same machine. Use CSV export for a simple portable BOM snapshot.

## Presentation Outputs

The main builder includes an `Architecture & Cost Structure` section designed for screenshots and slide prep. It summarizes the selected build as a system architecture diagram, shows OEM cost structure by product section and manufacturer, and can export the diagram as SVG or PNG for PowerPoint.

## Debug Notes

On this work machine, Node/npm were not available globally and the admin installer could not complete. A TypeScript/Vite build should be run on a machine with Node.js installed:

```bash
npm install
npm run build
npm run dev
```

The `.gitignore` excludes generated folders such as `node_modules`, `dist`, and the temporary portable Node files from the work-machine build attempt.

## Data Notice

The product database is split by product type under `src/data/products/`. Each product includes `manufacturer` and `productType` fields so non-Victron products can be added later. Every product should map to one of the canonical product types in `src/data/productTypes.ts`; those rules control how the product appears in the architecture diagram.

Victron MSRP values that exactly matched `victron_pricelist_2026_Q2_EuroC_USD.csv` were updated from the sheet's rounded USD price. The app treats product-level `oemPrice` as an optional manual override; if it is blank, OEM price is estimated from MSRP using the system's default OEM savings percentage. The file `victron-product-price-validation.csv` records the exact match status for the current seed catalog.

The current Victron list is expanded representative seed data, not a verified complete catalog. Simplified specs remain placeholders for concept validation only. Verify all model numbers, specs, MSRP, and OEM estimates before using the data for decisions.
