import type { SystemConfig } from "../types/system";
import type { EnrichedBomRow } from "./calculations";
import { getDcDcDirectionalityLabel, getDcDcRoleLabel, getRowDcDcRole } from "./dcDc";

const headers = [
  "Application",
  "System name",
  "System voltage",
  "AC output",
  "Product section",
  "DC-DC role",
  "DC-DC directionality",
  "Manufacturer",
  "Model number",
  "Description",
  "Quantity",
  "Unit MSRP",
  "Total MSRP",
  "Unit OEM",
  "OEM price source",
  "Total OEM",
  "Notes",
];

export function createCsvExport(config: SystemConfig, rows: EnrichedBomRow[]): string {
  const body = rows.map((row) => [
    config.application,
    config.systemName,
    config.systemVoltage,
    config.acOutput,
    row.section,
    row.section === "DC-DC Converters" ? getDcDcRoleLabel(getRowDcDcRole(row)) : "",
    getDcDcDirectionalityLabel(row.product),
    row.product?.manufacturer ?? "",
    row.product?.modelNumber ?? "",
    row.product?.description ?? "",
    row.quantity,
    row.product?.msrp ?? 0,
    row.lineMsrp,
    row.unitOem,
    row.oemPriceSource,
    row.lineOem,
    row.product?.notes ?? config.notes,
  ]);

  return [headers, ...body]
    .map((cells) => cells.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
}
