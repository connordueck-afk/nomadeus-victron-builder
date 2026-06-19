import type { Product } from "../types/product";
import type { BomRow, DcDcRole } from "../types/system";

export const dcDcRoles: DcDcRole[] = ["input", "output", "bidirectional"];

export function getDcDcRoleLabel(role: DcDcRole): string {
  return {
    input: "Input",
    output: "Output",
    bidirectional: "Bi-directional",
  }[role];
}

export function getDcDcDirectionalityLabel(product?: Product): string {
  if (product?.productType !== "dc-dc-converter") {
    return "";
  }

  return product.dcDcDirectionality === "bi-directional"
    ? "Bi-directional"
    : "Uni-directional";
}

export function getRowDcDcRole(row: BomRow): DcDcRole {
  return row.section === "DC-DC Converters" ? row.dcDcRole ?? "input" : "input";
}

export function supportsDcDcRole(product: Product, role: DcDcRole): boolean {
  if (product.productType !== "dc-dc-converter") {
    return true;
  }

  if (role === "bidirectional") {
    return product.dcDcDirectionality === "bi-directional";
  }

  return true;
}
