import type { Product } from "../types/product";
import type { BomRow as BomRowType, SystemConfig } from "../types/system";
import type { EnrichedBomRow } from "../utils/calculations";
import { formatCurrency, getKeySpecs } from "../utils/calculations";
import {
  getCompatibilityMismatchMessage,
  isProductCompatibleWithConfig,
} from "../utils/productCompatibility";

type BomRowProps = {
  index: number;
  row: EnrichedBomRow;
  products: Product[];
  config: SystemConfig;
  onUpdate: (update: Partial<BomRowType>) => void;
  onDelete: () => void;
};

export function BomRow({ index, row, products, config, onUpdate, onDelete }: BomRowProps) {
  const compatibleProducts = products.filter((product) =>
    isProductCompatibleWithConfig(product, config),
  );
  const currentProduct = row.product;
  const currentIsInOptions = compatibleProducts.some(
    (product) => product.id === currentProduct?.id,
  );
  const options =
    currentProduct && !currentIsInOptions
      ? [currentProduct, ...compatibleProducts]
      : compatibleProducts;
  const mismatchMessage = currentProduct
    ? getCompatibilityMismatchMessage(currentProduct, config)
    : null;

  return (
    <tr className={mismatchMessage ? "mismatch-row" : undefined}>
      <td>{index}</td>
      <td>{row.product?.manufacturer ?? ""}</td>
      <td>
        <select
          value={row.productId}
          onChange={(event) => onUpdate({ productId: event.target.value })}
          aria-label="Product model number"
          className={mismatchMessage ? "mismatch-select" : undefined}
        >
          {options.map((product) => (
            <option key={product.id} value={product.id}>
              {product.description} ({product.modelNumber})
              {product.id === currentProduct?.id && mismatchMessage ? " (mismatch)" : ""}
            </option>
          ))}
        </select>
      </td>
      <td>
        {row.product?.description ?? "Select a product"}
        {mismatchMessage ? <span className="mismatch-note">{mismatchMessage}</span> : null}
      </td>
      <td className="spec-cell">{getKeySpecs(row.product)}</td>
      <td>
        <input
          className="qty-input"
          type="number"
          min={0}
          step={1}
          value={row.quantity}
          onChange={(event) => onUpdate({ quantity: Number(event.target.value) })}
          aria-label="Quantity"
        />
      </td>
      <td>{formatCurrency(row.product?.msrp ?? 0)}</td>
      <td>{formatCurrency(row.lineMsrp)}</td>
      <td>
        <span>{formatCurrency(row.unitOem)}</span>
        {row.oemPriceSource === "estimated" ? <span className="price-source">est.</span> : null}
      </td>
      <td>{formatCurrency(row.lineOem)}</td>
      <td>
        <button type="button" className="danger" onClick={onDelete}>
          Delete
        </button>
      </td>
    </tr>
  );
}
