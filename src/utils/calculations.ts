import type { Product, ProductSection } from "../types/product";
import type { BomRow, NomadeusComparison } from "../types/system";

export type EnrichedBomRow = BomRow & {
  product?: Product;
  unitOem: number;
  oemPriceSource: "manual" | "estimated" | "none";
  lineMsrp: number;
  lineOem: number;
};

export type SectionTotals = {
  msrp: number;
  oem: number;
  hardwareCount: number;
  lineCount: number;
};

export type SystemTotals = SectionTotals & {
  inverterCapacityVa: number;
  mpptChargeCurrentA: number;
  dcDcOutputCurrentA: number;
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function enrichRows(
  rows: BomRow[],
  products: Product[],
  defaultOemDiscountPercent: number,
): EnrichedBomRow[] {
  return rows.map((row) => {
    const product = products.find((item) => item.id === row.productId);
    const quantity = sanitizeQuantity(row.quantity);
    const oemPrice = product
      ? getEffectiveOemPrice(product, defaultOemDiscountPercent)
      : { value: 0, source: "none" as const };

    return {
      ...row,
      quantity,
      product,
      unitOem: oemPrice.value,
      oemPriceSource: oemPrice.source,
      lineMsrp: product ? product.msrp * quantity : 0,
      lineOem: oemPrice.value * quantity,
    };
  });
}

export function getSectionTotals(rows: EnrichedBomRow[], section: ProductSection): SectionTotals {
  const sectionRows = rows.filter((row) => row.section === section);

  return sectionRows.reduce<SectionTotals>(
    (totals, row) => ({
      msrp: totals.msrp + row.lineMsrp,
      oem: totals.oem + row.lineOem,
      hardwareCount: totals.hardwareCount + row.quantity,
      lineCount: totals.lineCount + (row.product ? 1 : 0),
    }),
    { msrp: 0, oem: 0, hardwareCount: 0, lineCount: 0 },
  );
}

export function getSystemTotals(rows: EnrichedBomRow[]): SystemTotals {
  return rows.reduce<SystemTotals>(
    (totals, row) => {
      const chargeCurrent = parseFirstNumber(row.product?.chargeCurrent);
      const powerRating = parseFirstNumber(row.product?.powerRating);

      return {
        msrp: totals.msrp + row.lineMsrp,
        oem: totals.oem + row.lineOem,
        hardwareCount: totals.hardwareCount + row.quantity,
        lineCount: totals.lineCount + (row.product ? 1 : 0),
        inverterCapacityVa:
          totals.inverterCapacityVa +
          (row.product?.productType === "inverter-charger" ? powerRating * row.quantity : 0),
        mpptChargeCurrentA:
          totals.mpptChargeCurrentA +
          (row.product?.productType === "mppt" ? chargeCurrent * row.quantity : 0),
        dcDcOutputCurrentA:
          totals.dcDcOutputCurrentA +
          (row.product?.productType === "dc-dc-converter" ? chargeCurrent * row.quantity : 0),
      };
    },
    {
      msrp: 0,
      oem: 0,
      hardwareCount: 0,
      lineCount: 0,
      inverterCapacityVa: 0,
      mpptChargeCurrentA: 0,
      dcDcOutputCurrentA: 0,
    },
  );
}

export function getComparisonDeltas(totals: SystemTotals, comparison: NomadeusComparison) {
  return {
    msrpMinusSellingPrice: totals.msrp - comparison.estimatedSellingPrice,
    oemMinusTargetBom: totals.oem - comparison.targetBomCost,
    hardwareReduction: totals.hardwareCount - comparison.boxCount,
  };
}

export function getKeySpecs(product?: Product): string {
  if (!product) {
    return "";
  }

  return [
    product.dcVoltage,
    product.acVoltage,
    product.powerRating,
    product.chargeCurrent,
    product.pvInputVoltage ? `PV ${product.pvInputVoltage}` : undefined,
    product.pvPower,
    product.currentRating,
    product.communication,
  ]
    .filter(Boolean)
    .join(" | ");
}

export function sanitizeQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) {
    return 1;
  }

  return Math.max(0, Math.round(quantity));
}

export function getEffectiveOemPrice(
  product: Product,
  defaultOemDiscountPercent: number,
): { value: number; source: EnrichedBomRow["oemPriceSource"] } {
  if (typeof product.oemPrice === "number" && Number.isFinite(product.oemPrice)) {
    return { value: product.oemPrice, source: "manual" };
  }

  const discount = clamp(defaultOemDiscountPercent, 0, 100);
  return {
    value: Math.round(product.msrp * (1 - discount / 100)),
    source: "estimated",
  };
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
}

function parseFirstNumber(value?: string): number {
  const match = value?.match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}
