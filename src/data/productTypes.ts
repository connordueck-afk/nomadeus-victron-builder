import type { ProductType } from "../types/product";

export type DiagramTone = "source" | "power" | "storage" | "control" | "load";

export type DiagramAnchor =
  | "solar"
  | "alternator"
  | "shore"
  | "generator"
  | "battery"
  | "dc-bus"
  | "ac-distribution"
  | "dc-loads"
  | "ac-loads";

export type ProductTypeRule = {
  type: ProductType;
  label: string;
  tone: DiagramTone;
  x: number;
  y: number;
  inputAnchors: DiagramAnchor[];
  outputAnchors: DiagramAnchor[];
  inputProductTypes?: ProductType[];
  outputProductTypes?: ProductType[];
};

export const productTypeRules: ProductTypeRule[] = [
  {
    type: "mppt",
    label: "MPPT",
    tone: "power",
    x: 315,
    y: 245,
    inputAnchors: ["solar"],
    outputAnchors: ["dc-bus"],
  },
  {
    type: "dc-dc-converter",
    label: "DC-DC",
    tone: "power",
    x: 315,
    y: 370,
    inputAnchors: ["alternator"],
    outputAnchors: ["dc-bus"],
  },
  {
    type: "ac-charger",
    label: "AC Charger",
    tone: "power",
    x: 920,
    y: 245,
    inputAnchors: ["shore"],
    outputAnchors: ["dc-bus"],
  },
  {
    type: "transfer-switching",
    label: "Transfer",
    tone: "power",
    x: 920,
    y: 370,
    inputAnchors: ["shore", "generator"],
    outputAnchors: ["ac-distribution"],
  },
  {
    type: "dc-distribution",
    label: "DC Distribution",
    tone: "power",
    x: 616,
    y: 445,
    inputAnchors: ["dc-bus"],
    outputAnchors: ["dc-loads"],
  },
  {
    type: "battery-protection",
    label: "Protection",
    tone: "power",
    x: 616,
    y: 610,
    inputAnchors: ["dc-bus"],
    outputAnchors: [],
  },
  {
    type: "inverter-charger",
    label: "Inverter/Charger",
    tone: "power",
    x: 920,
    y: 495,
    inputAnchors: ["shore", "dc-bus"],
    outputAnchors: ["ac-distribution"],
  },
  {
    type: "system-controller",
    label: "Controller",
    tone: "control",
    x: 616,
    y: 105,
    inputAnchors: ["dc-bus"],
    outputAnchors: [],
  },
  {
    type: "accessory",
    label: "Accessory",
    tone: "control",
    x: 360,
    y: 105,
    inputAnchors: ["dc-bus"],
    outputAnchors: [],
  },
  {
    type: "battery-monitor",
    label: "Monitor",
    tone: "control",
    x: 872,
    y: 105,
    inputAnchors: ["dc-bus"],
    outputAnchors: [],
  },
];

export function getProductTypeRule(type: ProductType): ProductTypeRule {
  const rule = productTypeRules.find((item) => item.type === type);

  if (!rule) {
    throw new Error(`Missing product type rule for ${type}`);
  }

  return rule;
}
