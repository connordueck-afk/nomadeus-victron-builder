import { acOutputs, applications, systemVoltages } from "../data/applicationPresets";
import { productSections } from "../data/products";
import { defaultComparison, defaultConfig } from "../data/defaultSystem";
import type {
  AcOutput,
  Application,
  BomRow,
  DcDcRole,
  NomadeusComparison,
  SavedSystem,
  SystemConfig,
  SystemVoltage,
} from "../types/system";

const SYSTEM_FILE_FORMAT = "nomadeus-system-setup";
const SYSTEM_FILE_VERSION = 1;
const dcDcRoles: DcDcRole[] = ["input", "output", "bidirectional"];

type SystemFile = {
  format: typeof SYSTEM_FILE_FORMAT;
  version: typeof SYSTEM_FILE_VERSION;
  exportedAt: string;
  system: SavedSystem;
};

export function createSystemFile(system: SavedSystem): string {
  const file: SystemFile = {
    format: SYSTEM_FILE_FORMAT,
    version: SYSTEM_FILE_VERSION,
    exportedAt: new Date().toISOString(),
    system,
  };

  return `${JSON.stringify(file, null, 2)}\n`;
}

export function parseSystemFile(contents: string): SavedSystem {
  let parsed: unknown;

  try {
    parsed = JSON.parse(contents);
  } catch {
    throw new Error("That file is not valid JSON.");
  }

  if (!isRecord(parsed)) {
    throw new Error("That file does not contain a system setup.");
  }

  const maybeSystem =
    parsed.format === SYSTEM_FILE_FORMAT && parsed.version === SYSTEM_FILE_VERSION
      ? parsed.system
      : parsed;

  if (!isRecord(maybeSystem)) {
    throw new Error("That file does not contain a Nomadeus system setup.");
  }

  return normalizeSystem(maybeSystem);
}

export function safeSystemFileName(systemName: string): string {
  const baseName = systemName.trim() || "nomadeus-system";
  return (
    baseName.replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "").toLowerCase() ||
    "nomadeus-system"
  );
}

function normalizeSystem(value: Record<string, unknown>): SavedSystem {
  return {
    config: normalizeConfig(value.config),
    rows: normalizeRows(value.rows),
    comparison: normalizeComparison(value.comparison),
  };
}

function normalizeConfig(value: unknown): SystemConfig {
  if (!isRecord(value)) {
    throw new Error("The setup file is missing system configuration.");
  }

  const application = parseOption<Application>(value.application, applications, defaultConfig.application);
  const systemVoltage = parseOption<SystemVoltage>(
    value.systemVoltage,
    systemVoltages,
    defaultConfig.systemVoltage,
  );
  const acOutput = parseOption<AcOutput>(value.acOutput, acOutputs, defaultConfig.acOutput);

  return {
    application,
    systemName: parseString(value.systemName, defaultConfig.systemName),
    systemVoltage,
    acOutput,
    defaultOemDiscountPercent: parseNumber(
      value.defaultOemDiscountPercent,
      defaultConfig.defaultOemDiscountPercent,
    ),
    notes: parseString(value.notes, defaultConfig.notes),
  };
}

function normalizeRows(value: unknown): BomRow[] {
  if (!Array.isArray(value)) {
    throw new Error("The setup file is missing BOM rows.");
  }

  return value.map((row, index) => {
    if (!isRecord(row)) {
      throw new Error(`BOM row ${index + 1} is not valid.`);
    }

    const section = parseOption(row.section, productSections, undefined);
    if (!section) {
      throw new Error(`BOM row ${index + 1} has an unknown section.`);
    }

    const dcDcRole = parseOption(row.dcDcRole, dcDcRoles, undefined);

    return {
      id: parseString(row.id, crypto.randomUUID()),
      section,
      productId: parseString(row.productId, ""),
      quantity: Math.max(0, parseNumber(row.quantity, 1)),
      ...(dcDcRole ? { dcDcRole } : {}),
    };
  });
}

function normalizeComparison(value: unknown): NomadeusComparison {
  if (!isRecord(value)) {
    return defaultComparison;
  }

  return {
    targetBomCost: parseNumber(value.targetBomCost, defaultComparison.targetBomCost),
    estimatedSellingPrice: parseNumber(
      value.estimatedSellingPrice,
      defaultComparison.estimatedSellingPrice,
    ),
    boxCount: parseNumber(value.boxCount, defaultComparison.boxCount),
    notes: parseString(value.notes, defaultComparison.notes),
  };
}

function parseOption<T extends string>(
  value: unknown,
  options: readonly T[],
  fallback: T,
): T;
function parseOption<T extends string>(
  value: unknown,
  options: readonly T[],
  fallback: undefined,
): T | undefined;
function parseOption<T extends string>(
  value: unknown,
  options: readonly T[],
  fallback: T | undefined,
): T | undefined {
  return typeof value === "string" && options.includes(value as T) ? (value as T) : fallback;
}

function parseString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function parseNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
