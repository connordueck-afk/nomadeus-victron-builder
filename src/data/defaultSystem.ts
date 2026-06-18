import type { NomadeusComparison, SystemConfig } from "../types/system";

export const defaultConfig: SystemConfig = {
  application: "Medium RV",
  systemName: "Nomadeus Concept Comparison",
  systemVoltage: "24 VDC",
  acOutput: "120 VAC",
  defaultOemDiscountPercent: 35,
  notes: "",
};

export const defaultComparison: NomadeusComparison = {
  targetBomCost: 4200,
  estimatedSellingPrice: 7800,
  boxCount: 1,
  notes: "",
};
