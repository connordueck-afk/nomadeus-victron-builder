import type { Product } from "../types/product";
import type { AcOutput, DcDcRole, SystemConfig, SystemVoltage } from "../types/system";
import { supportsDcDcRole } from "./dcDc";

export function isProductCompatibleWithConfig(
  product: Product,
  config: SystemConfig,
  dcDcRole?: DcDcRole,
): boolean {
  return (
    supportsSystemVoltage(product, config.systemVoltage) &&
    supportsAcOutput(product, config.acOutput) &&
    (!dcDcRole || supportsDcDcRole(product, dcDcRole))
  );
}

export function supportsSystemVoltage(product: Product, voltage: SystemVoltage): boolean {
  return (
    !product.supportedSystemVoltages ||
    product.supportedSystemVoltages.includes(voltage)
  );
}

export function supportsAcOutput(product: Product, acOutput: AcOutput): boolean {
  return !product.supportedAcOutputs || product.supportedAcOutputs.includes(acOutput);
}

export function getCompatibilityMismatchMessage(
  product: Product,
  config: SystemConfig,
  dcDcRole?: DcDcRole,
): string | null {
  const messages: string[] = [];

  if (!supportsSystemVoltage(product, config.systemVoltage)) {
    const supported =
      product.supportedSystemVoltages?.join(", ") || "unspecified system voltages";
    messages.push(`supports ${supported}, not ${config.systemVoltage}`);
  }

  if (!supportsAcOutput(product, config.acOutput)) {
    const supported = product.supportedAcOutputs?.join(", ") || "unspecified AC outputs";
    messages.push(`supports ${supported}, not ${config.acOutput}`);
  }

  if (dcDcRole && !supportsDcDcRole(product, dcDcRole)) {
    messages.push("is uni-directional, not bi-directional");
  }

  if (messages.length === 0) {
    return null;
  }

  return `Mismatch: ${product.modelNumber} ${messages.join("; ")}.`;
}
