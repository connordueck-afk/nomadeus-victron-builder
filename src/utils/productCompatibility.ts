import type { Product } from "../types/product";
import type { AcOutput, SystemConfig, SystemVoltage } from "../types/system";

export function isProductCompatibleWithConfig(
  product: Product,
  config: SystemConfig,
): boolean {
  return (
    supportsSystemVoltage(product, config.systemVoltage) &&
    supportsAcOutput(product, config.acOutput)
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

  if (messages.length === 0) {
    return null;
  }

  return `Mismatch: ${product.modelNumber} ${messages.join("; ")}.`;
}
