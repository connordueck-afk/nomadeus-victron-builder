import type { NomadeusComparison } from "../types/system";
import type { SystemTotals } from "../utils/calculations";
import { formatCurrency, getComparisonDeltas } from "../utils/calculations";

type NomadeusComparisonProps = {
  comparison: NomadeusComparison;
  totals: SystemTotals;
  onChange: (comparison: NomadeusComparison) => void;
};

export function NomadeusComparisonPanel({
  comparison,
  totals,
  onChange,
}: NomadeusComparisonProps) {
  const deltas = getComparisonDeltas(totals, comparison);

  return (
    <section className="comparison-panel">
      <div>
        <p className="eyebrow">Concept validation</p>
        <h2>Nomadeus Comparison</h2>
      </div>

      <div className="comparison-grid">
        <label>
          Target BOM cost
          <input
            type="number"
            min={0}
            value={comparison.targetBomCost}
            onChange={(event) =>
              onChange({ ...comparison, targetBomCost: Number(event.target.value) })
            }
          />
        </label>
        <label>
          Estimated selling price
          <input
            type="number"
            min={0}
            value={comparison.estimatedSellingPrice}
            onChange={(event) =>
              onChange({ ...comparison, estimatedSellingPrice: Number(event.target.value) })
            }
          />
        </label>
        <label>
          Box count
          <input
            type="number"
            min={0}
            value={comparison.boxCount}
            onChange={(event) => onChange({ ...comparison, boxCount: Number(event.target.value) })}
          />
        </label>
        <label>
          Notes
          <input
            value={comparison.notes}
            onChange={(event) => onChange({ ...comparison, notes: event.target.value })}
          />
        </label>
      </div>

      <div className="delta-row">
        <span>
          MSRP minus Nomadeus selling price:{" "}
          <strong>{formatCurrency(deltas.msrpMinusSellingPrice)}</strong>
        </span>
        <span>
          OEM minus Nomadeus target BOM:{" "}
          <strong>{formatCurrency(deltas.oemMinusTargetBom)}</strong>
        </span>
        <span>
          Hardware reduction: <strong>{deltas.hardwareReduction}</strong>
        </span>
      </div>
    </section>
  );
}
