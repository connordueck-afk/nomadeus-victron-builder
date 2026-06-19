import { productSections } from "../data/products";
import type { Product } from "../types/product";
import { formatCurrency } from "../utils/calculations";
import { getDcDcDirectionalityLabel } from "../utils/dcDc";

type ProductsPageProps = {
  products: Product[];
};

export function ProductsPage({ products }: ProductsPageProps) {
  return (
    <>
      <div className="builder-header">
        <div>
          <p className="eyebrow">Product Catalog</p>
          <h1>Product catalog</h1>
        </div>
        <div className="header-meta">
          <span>{products.length} products</span>
          <span>{productSections.length} categories</span>
        </div>
      </div>

      <div className="sections-stack">
        {productSections.map((section) => {
          const sectionProducts = products.filter((product) => product.section === section);
          const columns = getVisibleColumns(sectionProducts);

          return (
            <section
              key={section}
              className="product-card catalog-section"
              id={section.replaceAll(" ", "-").replaceAll("/", "")}
            >
              <div className="section-header">
                <div>
                  <h2>{section}</h2>
                  <p>{sectionProducts.length} products</p>
                </div>
              </div>

              <div className="table-wrap">
                <table className="catalog-table">
                  <thead>
                    <tr>
                      {columns.map((column) => (
                        <th key={column.key}>{column.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sectionProducts.map((product) => (
                      <tr key={product.id}>
                        {columns.map((column) => (
                          <td
                            key={column.key}
                            className={column.key === "modelNumber" ? "model-cell" : undefined}
                          >
                            {column.render(product)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

type CatalogColumn = {
  key: string;
  label: string;
  isOptional?: boolean;
  hasValue: (product: Product) => boolean;
  render: (product: Product) => string;
};

const catalogColumns: CatalogColumn[] = [
  {
    key: "manufacturer",
    label: "Manufacturer",
    hasValue: () => true,
    render: (product) => product.manufacturer,
  },
  {
    key: "family",
    label: "Family",
    hasValue: () => true,
    render: (product) => product.family,
  },
  {
    key: "modelNumber",
    label: "Model Number",
    hasValue: () => true,
    render: (product) => product.modelNumber,
  },
  {
    key: "description",
    label: "Description",
    hasValue: () => true,
    render: (product) => product.description,
  },
  {
    key: "dcVoltage",
    label: "DC Voltage",
    isOptional: true,
    hasValue: (product) => Boolean(product.dcVoltage),
    render: (product) => product.dcVoltage || "-",
  },
  {
    key: "acVoltage",
    label: "AC Voltage",
    isOptional: true,
    hasValue: (product) => Boolean(product.acVoltage),
    render: (product) => product.acVoltage || "-",
  },
  {
    key: "powerRating",
    label: "Power",
    isOptional: true,
    hasValue: (product) => Boolean(product.powerRating),
    render: (product) => product.powerRating || "-",
  },
  {
    key: "chargeCurrent",
    label: "Charge / Output Current",
    isOptional: true,
    hasValue: (product) => Boolean(product.chargeCurrent),
    render: (product) => product.chargeCurrent || "-",
  },
  {
    key: "pvInputVoltage",
    label: "PV Input",
    isOptional: true,
    hasValue: (product) => Boolean(product.pvInputVoltage),
    render: (product) => product.pvInputVoltage || "-",
  },
  {
    key: "pvPower",
    label: "PV Power",
    isOptional: true,
    hasValue: (product) => Boolean(product.pvPower),
    render: (product) => product.pvPower || "-",
  },
  {
    key: "currentRating",
    label: "Current Rating",
    isOptional: true,
    hasValue: (product) => Boolean(product.currentRating),
    render: (product) => product.currentRating || "-",
  },
  {
    key: "communication",
    label: "Communication",
    isOptional: true,
    hasValue: (product) => Boolean(product.communication),
    render: (product) => product.communication || "-",
  },
  {
    key: "dcDcDirectionality",
    label: "Directionality",
    isOptional: true,
    hasValue: (product) => Boolean(product.dcDcDirectionality),
    render: (product) => getDcDcDirectionalityLabel(product) || "-",
  },
  {
    key: "supportedSystemVoltages",
    label: "System Voltages",
    isOptional: true,
    hasValue: (product) => Boolean(product.supportedSystemVoltages?.length),
    render: (product) => formatList(product.supportedSystemVoltages),
  },
  {
    key: "supportedAcOutputs",
    label: "AC Outputs",
    isOptional: true,
    hasValue: (product) => Boolean(product.supportedAcOutputs?.length),
    render: (product) => formatList(product.supportedAcOutputs),
  },
  {
    key: "msrp",
    label: "MSRP",
    hasValue: () => true,
    render: (product) => formatCurrency(product.msrp),
  },
  {
    key: "oemPrice",
    label: "OEM Price",
    isOptional: true,
    hasValue: (product) => typeof product.oemPrice === "number" && Number.isFinite(product.oemPrice),
    render: (product) => formatOptionalCurrency(product.oemPrice),
  },
  {
    key: "notes",
    label: "Notes",
    isOptional: true,
    hasValue: (product) => Boolean(product.notes),
    render: (product) => product.notes || "-",
  },
];

function getVisibleColumns(products: Product[]): CatalogColumn[] {
  return catalogColumns.filter(
    (column) => !column.isOptional || products.some((product) => column.hasValue(product)),
  );
}

export function ProductCatalogSummary({ products }: ProductsPageProps) {
  const pricedProducts = products.filter((product) => product.msrp > 0);
  const totalMsrp = products.reduce((total, product) => total + product.msrp, 0);
  const categoriesWithProducts = productSections.filter((section) =>
    products.some((product) => product.section === section),
  );

  return (
    <aside className="summary-panel">
      <h2>Catalog</h2>

      <div className="metric">
        <span>Products</span>
        <strong>{products.length}</strong>
      </div>
      <div className="metric">
        <span>Categories</span>
        <strong>{categoriesWithProducts.length}</strong>
      </div>
      <div className="metric">
        <span>Priced products</span>
        <strong>{pricedProducts.length}</strong>
      </div>
      <div className="metric">
        <span>Total MSRP listed</span>
        <strong>{formatCurrency(totalMsrp)}</strong>
      </div>

      <hr />

      {productSections.map((section) => {
        const count = products.filter((product) => product.section === section).length;

        return (
          <div key={section} className="metric catalog-count">
            <span>{section}</span>
            <strong>{count}</strong>
          </div>
        );
      })}
    </aside>
  );
}

function formatList(values?: readonly string[]): string {
  return values && values.length > 0 ? values.join(", ") : "-";
}

function formatOptionalCurrency(value?: number): string {
  return typeof value === "number" && Number.isFinite(value) ? formatCurrency(value) : "-";
}
