import type { AcOutput, Application, SystemVoltage } from "../types/system";

export const applications: Application[] = [
  "Small RV",
  "Medium RV",
  "Large RV",
  "Marine Small",
  "Marine Heavy",
  "Mobile Work Truck",
  "Mobile Security Trailer",
  "Mobile Lighting Tower",
  "Off-Grid Cabin",
  "Custom",
];

export const systemVoltages: SystemVoltage[] = ["12 VDC", "24 VDC", "48 VDC"];

export const acOutputs: AcOutput[] = [
  "120 VAC",
  "120 / 240 VAC Split Phase",
  "230 VAC",
  "No AC Output",
];

export const applicationDefaults: Record<Application, { voltage: SystemVoltage; acOutput: AcOutput }> = {
  "Small RV": { voltage: "12 VDC", acOutput: "120 VAC" },
  "Medium RV": { voltage: "24 VDC", acOutput: "120 VAC" },
  "Large RV": { voltage: "48 VDC", acOutput: "120 / 240 VAC Split Phase" },
  "Marine Small": { voltage: "12 VDC", acOutput: "120 VAC" },
  "Marine Heavy": { voltage: "24 VDC", acOutput: "120 / 240 VAC Split Phase" },
  "Mobile Work Truck": { voltage: "12 VDC", acOutput: "120 VAC" },
  "Mobile Security Trailer": { voltage: "24 VDC", acOutput: "120 VAC" },
  "Mobile Lighting Tower": { voltage: "48 VDC", acOutput: "120 VAC" },
  "Off-Grid Cabin": { voltage: "48 VDC", acOutput: "120 / 240 VAC Split Phase" },
  Custom: { voltage: "24 VDC", acOutput: "120 VAC" },
};
