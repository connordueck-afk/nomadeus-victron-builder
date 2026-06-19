import type { NomadeusComparison } from "../types/system";
import type { EnrichedBomRow, SystemTotals } from "../utils/calculations";
import { formatCurrency, getComparisonDeltas } from "../utils/calculations";

type SummaryPanelProps = {
  rows: EnrichedBomRow[];
  totals: SystemTotals;
  comparison: NomadeusComparison;
};

export function SummaryPanel({ rows, totals, comparison }: SummaryPanelProps) {
  const selectedRows = rows.filter((row) => row.product && row.quantity > 0);
  const sectionCosts = getSectionCosts(selectedRows);
  const manufacturerCosts = getManufacturerCosts(selectedRows);
  const deltas = getComparisonDeltas(totals, comparison);

  return (
    <aside className="summary-panel">
      <h2>Summary</h2>

      <div className="metric">
        <span>Total MSRP</span>
        <strong>{formatCurrency(totals.msrp)}</strong>
      </div>
      <div className="metric">
        <span>Total OEM estimate</span>
        <strong>{formatCurrency(totals.oem)}</strong>
      </div>
      <div className="metric">
        <span>Hardware count</span>
        <strong>{totals.hardwareCount}</strong>
      </div>
      <div className="metric">
        <span>Product lines</span>
        <strong>{totals.lineCount}</strong>
      </div>

      <hr />

      <div className="metric">
        <span>Inverter capacity</span>
        <strong>{totals.inverterCapacityVa.toLocaleString()} VA</strong>
      </div>
      <div className="metric">
        <span>MPPT charge current</span>
        <strong>{totals.mpptChargeCurrentA} A</strong>
      </div>
      <div className="metric">
        <span>DC-DC input current</span>
        <strong>{totals.dcDcInputCurrentA} A</strong>
      </div>
      <div className="metric">
        <span>DC-DC output current</span>
        <strong>{totals.dcDcOutputCurrentA} A</strong>
      </div>

      <hr />

      <div className="metric">
        <span>Nomadeus target cost</span>
        <strong>{formatCurrency(comparison.targetBomCost)}</strong>
      </div>
      <div className="metric">
        <span>Nomadeus boxes</span>
        <strong>{comparison.boxCount}</strong>
      </div>
      <div className="metric accent">
        <span>MSRP delta</span>
        <strong>{formatCurrency(deltas.msrpMinusSellingPrice)}</strong>
      </div>
      <div className="metric accent">
        <span>OEM cost delta</span>
        <strong>{formatCurrency(deltas.oemMinusTargetBom)}</strong>
      </div>
      <div className="metric accent">
        <span>Hardware reduction</span>
        <strong>{deltas.hardwareReduction}</strong>
      </div>

      <hr />

      <section className="summary-costs" aria-label="Cost structure">
        <h3>Cost Structure</h3>
        <CostBars title="By product section" rows={sectionCosts} total={totals.oem} />
        <CostBars title="By manufacturer" rows={manufacturerCosts} total={totals.oem} />
      </section>
    </aside>
  );
}

function CostBars({
  title,
  rows,
  total,
}: {
  title: string;
  rows: Array<{ label: string; value: number }>;
  total: number;
}) {
  return (
    <div className="cost-bars">
      <h4>{title}</h4>
      {rows.length === 0 ? (
        <p className="muted">No selected products yet.</p>
      ) : (
        rows.map((row) => {
          const percent = total > 0 ? Math.round((row.value / total) * 100) : 0;
          return (
            <div className="cost-bar" key={row.label}>
              <div className="cost-bar-label">
                <span>{row.label}</span>
                <strong>{formatCurrency(row.value)}</strong>
              </div>
              <div className="cost-bar-track">
                <span style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function getSectionCosts(rows: EnrichedBomRow[]) {
  return summarizeCosts(rows, (row) => row.section);
}

function getManufacturerCosts(rows: EnrichedBomRow[]) {
  return summarizeCosts(rows, (row) => row.product?.manufacturer ?? "Unknown");
}

function summarizeCosts(rows: EnrichedBomRow[], getLabel: (row: EnrichedBomRow) => string) {
  const costs = rows.reduce<Record<string, number>>((totals, row) => {
    const label = getLabel(row);
    return { ...totals, [label]: (totals[label] ?? 0) + row.lineOem };
  }, {});

  return Object.entries(costs)
    .map(([label, value]) => ({ label, value }))
    .filter((row) => row.value > 0)
    .sort((first, second) => second.value - first.value)
    .slice(0, 7);
}
