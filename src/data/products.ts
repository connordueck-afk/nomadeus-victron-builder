import type { Product, ProductSection } from "../types/product";
import { acChargerProducts } from "./products/acChargerProducts";
import { accessoryProducts } from "./products/accessoryProducts";
import { batteryProducts } from "./products/batteryProducts";
import { batteryMonitorProducts } from "./products/batteryMonitorProducts";
import { batteryProtectionProducts } from "./products/batteryProtectionProducts";
import { cablesMaterialsProducts } from "./products/cablesMaterialsProducts";
import { dcDcConverterProducts } from "./products/dcDcConverterProducts";
import { dcDistributionProducts } from "./products/dcDistributionProducts";
import { inverterChargerProducts } from "./products/inverterChargerProducts";
import { mpptProducts } from "./products/mpptProducts";
import { systemControllerProducts } from "./products/systemControllerProducts";
import { transferSwitchingProducts } from "./products/transferSwitchingProducts";

export const productSections: ProductSection[] = [
  "MPPT Solar Chargers",
  "Inverter / Chargers",
  "DC-DC Converters",
  "AC Chargers",
  "Batteries",
  "Battery Monitors",
  "System Controllers",
  "DC Distribution",
  "Battery Protection",
  "Transfer / Switching",
  "Accessories / Other",
  "Cables & Materials",
];

export const products: Product[] = [
  ...mpptProducts,
  ...inverterChargerProducts,
  ...dcDcConverterProducts,
  ...acChargerProducts,
  ...batteryProducts,
  ...batteryMonitorProducts,
  ...systemControllerProducts,
  ...dcDistributionProducts,
  ...batteryProtectionProducts,
  ...transferSwitchingProducts,
  ...accessoryProducts,
  ...cablesMaterialsProducts,
];
