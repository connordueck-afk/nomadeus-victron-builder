import type { ProductSection } from "./product";

export type Application =
  | "Small RV"
  | "Medium RV"
  | "Large RV"
  | "Marine Small"
  | "Marine Heavy"
  | "Mobile Work Truck"
  | "Mobile Security Trailer"
  | "Mobile Lighting Tower"
  | "Off-Grid Cabin"
  | "Custom";

export type SystemVoltage = "12 VDC" | "24 VDC" | "48 VDC";

export type AcOutput =
  | "120 VAC"
  | "120 / 240 VAC Split Phase"
  | "230 VAC"
  | "No AC Output";

export type BomRow = {
  id: string;
  section: ProductSection;
  productId: string;
  quantity: number;
};

export type SystemConfig = {
  application: Application;
  systemName: string;
  systemVoltage: SystemVoltage;
  acOutput: AcOutput;
  defaultOemDiscountPercent: number;
  notes: string;
};

export type NomadeusComparison = {
  targetBomCost: number;
  estimatedSellingPrice: number;
  boxCount: number;
  notes: string;
};

export type SavedSystem = {
  config: SystemConfig;
  rows: BomRow[];
  comparison: NomadeusComparison;
};

export type SavedSystemRecord = {
  id: string;
  name: string;
  application: Application;
  updatedAt: string;
  system: SavedSystem;
};
