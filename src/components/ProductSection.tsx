import { BomRow } from "./BomRow";
import type { Product, ProductSection as ProductSectionName } from "../types/product";
import type { BomRow as BomRowType, SystemConfig } from "../types/system";
import type { EnrichedBomRow } from "../utils/calculations";
import { formatCurrency, getSectionTotals } from "../utils/calculations";
import { isProductCompatibleWithConfig } from "../utils/productCompatibility";

type ProductSectionProps = {
  section: ProductSectionName;
  config: SystemConfig;
  rows: EnrichedBomRow[];
  products: Product[];
  isCollapsed: boolean;
  onAdd: () => void;
  onToggleCollapsed: () => void;
  onUpdateRow: (rowId: string, update: Partial<BomRowType>) => void;
  onDeleteRow: (rowId: string) => void;
};

export function ProductSection({
  section,
  config,
  rows,
  products,
  isCollapsed,
  onAdd,
  onToggleCollapsed,
  onUpdateRow,
  onDeleteRow,
}: ProductSectionProps) {
  const totals = getSectionTotals(rows, section);
  const isDcDcSection = section === "DC-DC Converters";
  const compatibleProducts = products.filter((product) =>
    isProductCompatibleWithConfig(product, config),
  );
  const sectionId = section.replaceAll(" ", "-").replaceAll("/", "");
  const contentId = `${sectionId}-content`;

  return (
    <section className="product-card" id={sectionId}>
      <div className="section-header">
        <div>
          <h2>{section}</h2>
          <p>
            {rows.length} rows | {totals.hardwareCount} hardware items
          </p>
        </div>
        <div className="section-actions">
          <button
            type="button"
            className="secondary"
            onClick={onToggleCollapsed}
            aria-expanded={!isCollapsed}
            aria-controls={contentId}
          >
            {isCollapsed ? "Expand" : "Collapse"}
          </button>
          <button type="button" onClick={onAdd} disabled={compatibleProducts.length === 0}>
            + Add
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div id={contentId}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Manufacturer</th>
                  {isDcDcSection ? <th>Role</th> : null}
                  <th>Model Number</th>
                  <th>Description</th>
                  <th>Key Specs</th>
                  <th>Qty</th>
                  <th>Unit MSRP</th>
                  <th>Total MSRP</th>
                  <th>Unit OEM</th>
                  <th>Total OEM</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={isDcDcSection ? 12 : 11} className="empty-row">
                      {compatibleProducts.length === 0
                        ? `No compatible products for ${config.systemVoltage}.`
                        : "No products selected yet."}
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <BomRow
                      key={row.id}
                      index={index + 1}
                      row={row}
                      products={products}
                      config={config}
                      onUpdate={(update) => onUpdateRow(row.id, update)}
                      onDelete={() => onDeleteRow(row.id)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="section-totals">
            <span>Section MSRP: {formatCurrency(totals.msrp)}</span>
            <span>Section OEM: {formatCurrency(totals.oem)}</span>
          </div>
        </div>
      )}
    </section>
  );
}
