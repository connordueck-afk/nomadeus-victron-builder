import type { AcOutput, SystemVoltage } from "./system";

export type ProductSection =
  | "MPPT Solar Chargers"
  | "Inverter / Chargers"
  | "DC-DC Converters"
  | "AC Chargers"
  | "Batteries"
  | "Battery Monitors"
  | "System Controllers"
  | "DC Distribution"
  | "Battery Protection"
  | "Transfer / Switching"
  | "Accessories / Other"
  | "Cables & Materials";

export type ProductType =
  | "mppt"
  | "dc-dc-converter"
  | "ac-charger"
  | "battery"
  | "inverter-charger"
  | "dc-distribution"
  | "battery-protection"
  | "transfer-switching"
  | "system-controller"
  | "battery-monitor"
  | "accessory"
  | "cables-materials";

export type DcDcDirectionality = "uni-directional" | "bi-directional";

export type Product = {
  id: string;
  manufacturer: string;
  section: ProductSection;
  productType: ProductType;
  family: string;
  modelNumber: string;
  description: string;
  dcVoltage?: string;
  acVoltage?: string;
  powerRating?: string;
  chargeCurrent?: string;
  pvInputVoltage?: string;
  pvPower?: string;
  currentRating?: string;
  communication?: string;
  dcDcDirectionality?: DcDcDirectionality;
  supportedSystemVoltages?: SystemVoltage[];
  supportedAcOutputs?: AcOutput[];
  msrp: number;
  oemPrice?: number;
  notes?: string;
};
