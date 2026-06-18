import type { SystemConfig } from "../types/system";
import type { EnrichedBomRow } from "./calculations";

const headers = [
  "Application",
  "System name",
  "System voltage",
  "AC output",
  "Product section",
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
