import { useMemo } from "react";
import { productTypeRules } from "../data/productTypes";
import type { DiagramTone, ProductTypeRule } from "../data/productTypes";
import type { ProductType } from "../types/product";
import type { SystemConfig, NomadeusComparison } from "../types/system";
import type { EnrichedBomRow, SystemTotals } from "../utils/calculations";
import { formatCurrency, getComparisonDeltas } from "../utils/calculations";

type ArchitectureDiagramProps = {
  config: SystemConfig;
  rows: EnrichedBomRow[];
  totals: SystemTotals;
  comparison: NomadeusComparison;
};

type DiagramBlock = {
  id: string;
  title: string;
  subtitle: string;
  detail: string;
  x: number;
  y: number;
  width: number;
  height: number;
  tone: DiagramTone;
};

type DiagramConnector = {
  from: string;
  to: string;
};

type DiagramPort = {
  id: string;
  blockId: string;
  kind: "input" | "output";
  side: PortSide;
  x: number;
  y: number;
  angle: number;
};

type DiagramModel = {
  blocks: Record<string, DiagramBlock>;
  connectors: DiagramConnector[];
  ports: DiagramPort[];
  portMap: DiagramPortMap;
};

type ProductUnit = {
  model: string;
  family: string;
  productType: ProductType;
  powerRating?: string;
  currentRating?: string;
};

type PortSide = "left" | "right" | "top" | "bottom";
type DiagramPortMap = Record<
  string,
  Record<DiagramPort["kind"], Partial<Record<PortSide, DiagramPort>>>
>;

const diagramId = "architecture-diagram-svg";
const NODE_WIDTH = 188;
const NODE_HEIGHT = 92;

export function ArchitectureDiagram({
  config,
  rows,
  totals,
  comparison,
}: ArchitectureDiagramProps) {
  const selectedRows = rows.filter((row) => row.product && row.quantity > 0);
  const diagram = useMemo(() => getDiagramModel(selectedRows), [selectedRows]);
  const deltas = getComparisonDeltas(totals, comparison);

  return (
    <section className="presentation-panel">
      <div className="presentation-header">
        <div>
          <p className="eyebrow">Presentation view</p>
          <h2>Architecture</h2>
        </div>
        <div className="presentation-actions">
          <button type="button" onClick={() => downloadDiagramSvg(config.systemName)}>
            Export SVG
          </button>
          <button type="button" onClick={() => downloadDiagramPng(config.systemName)}>
            Export PNG
          </button>
        </div>
      </div>

      <div className="diagram-frame">
        <svg
          id={diagramId}
          className="architecture-svg"
          viewBox="0 0 1420 900"
          role="img"
          aria-label="System architecture diagram"
        >
          <defs>
          </defs>
          <rect width="1420" height="900" rx="18" fill="#fbfcfe" />
          <text x="40" y="48" className="svg-title">
            {config.systemName || "Untitled system"}
          </text>
          <text x="40" y="76" className="svg-subtitle">
            {config.application} | {config.systemVoltage} | {config.acOutput}
          </text>

          {diagram.connectors.map(({ from, to }) => (
            <Connector
              key={`${from}-${to}`}
              from={diagram.blocks[from]}
              to={diagram.blocks[to]}
              fromPort={getConnectorPort(diagram.portMap, diagram.blocks, from, to, "output")}
              toPort={getConnectorPort(diagram.portMap, diagram.blocks, to, from, "input")}
            />
          ))}

          {Object.values(diagram.blocks).map((block) => (
            <DiagramNode key={block.id} block={block} />
          ))}

          {diagram.ports.map((port) => (
            <DiagramPortNode key={port.id} port={port} />
          ))}

          <g transform="translate(40 825)">
            <text className="svg-kicker">Selected product build</text>
            <text x="0" y="28" className="svg-metric">
              MSRP {formatCurrency(totals.msrp)}
            </text>
            <text x="210" y="28" className="svg-metric">
              OEM {formatCurrency(totals.oem)}
            </text>
            <text x="405" y="28" className="svg-metric">
              Hardware {totals.hardwareCount} items
            </text>
            <text x="650" y="28" className="svg-metric">
              Nomadeus delta {formatCurrency(deltas.oemMinusTargetBom)}
            </text>
          </g>
        </svg>
      </div>
    </section>
  );
}

function DiagramNode({ block }: { block: DiagramBlock }) {
  return (
    <g transform={`translate(${block.x} ${block.y})`}>
      <rect className={`diagram-node ${block.tone}`} width={block.width} height={block.height} rx="8" />
      <text x="14" y="26" className="node-title">
        {block.title}
      </text>
      <text x="14" y="49" className="node-subtitle">
        {block.subtitle}
      </text>
      <text x="14" y="72" className="node-detail">
        {block.detail}
      </text>
    </g>
  );
}

function DiagramPortNode({ port }: { port: DiagramPort }) {
  return (
    <path
      className={`diagram-port ${port.kind}`}
      d="M 7 0 L -5 6 L -5 -6 Z"
      transform={`translate(${port.x} ${port.y}) rotate(${port.angle})`}
    />
  );
}

function Connector({
  from,
  to,
  fromPort,
  toPort,
}: {
  from?: DiagramBlock;
  to?: DiagramBlock;
  fromPort?: DiagramPort;
  toPort?: DiagramPort;
}) {
  if (!from || !to || !fromPort || !toPort) {
    return null;
  }

  const d = getConnectorPath(fromPort, toPort);

  return (
    <path
      className="diagram-connector"
      d={d}
    />
  );
}

function getConnectorPath(startPort: DiagramPort, endPort: DiagramPort): string {
  const LEAD = 58;
  const start = { x: startPort.x, y: startPort.y };
  const end = { x: endPort.x, y: endPort.y };
  const startControl = offsetPoint(start, getSideVector(startPort.side), LEAD);
  const endControl = offsetPoint(end, getSideVector(endPort.side), LEAD);

  return `M ${start.x} ${start.y} C ${startControl.x} ${startControl.y}, ${endControl.x} ${endControl.y}, ${end.x} ${end.y}`;
}

function getDiagramModel(rows: EnrichedBomRow[]): DiagramModel {
  const unitsByType = getUnitsByType(rows);
  const unitsFor = (type: ProductType) => unitsByType[type] ?? [];
  const accessoryUnits = unitsFor("accessory");
  const batteryUnits = unitsFor("battery");
  const dcDistributionUnits = unitsFor("dc-distribution");
  const hasDcDistribution = dcDistributionUnits.length > 0;

  const allBlocks: Record<string, DiagramBlock> = {
    solar: block("solar", "Solar Array", "PV source", "Panels entered outside BOM", 55, 245, "source"),
    alternator: block("alternator", "Alternator", "Vehicle / engine source", "Source entered outside BOM", 55, 370, "source"),
    shore: block("shore", "Shore Power", "Grid / pedestal input", "Source entered outside BOM", 1175, 245, "source"),
    generator: block("generator", "Generator", "Optional AC source", "Source entered outside BOM", 1175, 370, "source"),
    battery: block(
      "battery",
      "Battery Bank",
      batteryUnits.length > 0 ? summarizeUnitFamilies(batteryUnits) : "External battery system",
      summarizeBatteryDetails(batteryUnits),
      360,
      570,
      "storage",
    ),
    "dc-bus": block(
      "dc-bus",
      hasDcDistribution ? "DC Distribution" : "DC Bus",
      hasDcDistribution ? summarizeUnitFamilies(dcDistributionUnits) : "Common DC backbone",
      hasDcDistribution ? summarizeDcDistributionDetails(dcDistributionUnits) : "Distribution/protection attach here",
      616,
      445,
      "power",
    ),
    "dc-loads": block("dc-loads", "DC Loads", "Loads and branch circuits", "Downstream DC circuits", 360, 695, "load"),
    "ac-distribution": block("ac-distribution", "AC Distribution", configAcSummary(rows), "AC loads attach here", 1175, 570, "power"),
    "ac-loads": block("ac-loads", "AC Loads", "Branch circuits", summarizeUnitFamilies(accessoryUnits), 1175, 695, "load"),
    ...productTypeRules.filter((rule) => rule.type !== "dc-distribution").reduce<Record<string, DiagramBlock>>(
      (acc, rule) => ({ ...acc, ...createUnitBlocks(rule, unitsFor(rule.type)) }),
      {},
    ),
  };

  const productConnectors = productTypeRules
    .filter((rule) => rule.type !== "dc-distribution")
    .flatMap((rule) => getRuleConnectors(rule, unitsFor, allBlocks));

  const hasAcOutput = productConnectors.some((c) => c.to === "ac-distribution");

  const allConnectors: DiagramConnector[] = [
    ...productConnectors,
    { from: "battery", to: "dc-bus" },
    { from: "dc-bus", to: "dc-loads" },
    ...(hasAcOutput ? [{ from: "ac-distribution", to: "ac-loads" }] : []),
  ];

  const connectedIds = new Set(allConnectors.flatMap((c) => [c.from, c.to]));

  const blocks = Object.fromEntries(
    Object.entries(allBlocks).filter(([id]) => connectedIds.has(id)),
  );

  const connectors = uniqueConnectors(
    allConnectors.filter((c) => blocks[c.from] !== undefined && blocks[c.to] !== undefined),
  );

  resolveOverlaps(blocks);

  const portMap = getDiagramPortMap(blocks, connectors);
  const ports = Object.values(portMap).flatMap((blockPorts) => [
    ...Object.values(blockPorts.input),
    ...Object.values(blockPorts.output),
  ]);

  return { blocks, connectors, ports, portMap };
}

function getDiagramPortMap(
  blocks: Record<string, DiagramBlock>,
  connectors: DiagramConnector[],
): DiagramPortMap {
  const portSides = Object.fromEntries(
    Object.keys(blocks).map((blockId) => [
      blockId,
      { input: new Set<PortSide>(), output: new Set<PortSide>() },
    ]),
  ) as Record<string, Record<DiagramPort["kind"], Set<PortSide>>>;

  for (const connector of connectors) {
    const from = blocks[connector.from];
    const to = blocks[connector.to];
    if (!from || !to) {
      continue;
    }

    portSides[connector.from].output.add(getConnectionSide(from, to));
    portSides[connector.to].input.add(getConnectionSide(to, from));
  }

  return Object.fromEntries(
    Object.entries(blocks).map(([blockId, block]) => {
      const sides = portSides[blockId];
      return [
        blockId,
        {
          input: Object.fromEntries(
            [...sides.input].map((side) => [side, getBlockPort(block, side, "input", sides)]),
          ),
          output: Object.fromEntries(
            [...sides.output].map((side) => [side, getBlockPort(block, side, "output", sides)]),
          ),
        },
      ];
    }),
  ) as DiagramPortMap;
}

function getBlockPort(
  block: DiagramBlock,
  side: PortSide,
  kind: DiagramPort["kind"],
  sides: Record<DiagramPort["kind"], Set<PortSide>>,
): DiagramPort {
  const point = getSidePoint(block, side, getPortLane(kind, side, sides));
  const angle = kind === "input" ? getInputAngle(side) : getOutputAngle(side);

  return {
    id: `${block.id}-${kind}-${side}`,
    blockId: block.id,
    kind,
    side,
    angle,
    ...point,
  };
}

function getConnectorPort(
  portMap: DiagramPortMap,
  blocks: Record<string, DiagramBlock>,
  blockId: string,
  connectedBlockId: string,
  kind: DiagramPort["kind"],
): DiagramPort | undefined {
  const block = blocks[blockId];
  const connectedBlock = blocks[connectedBlockId];
  if (!block || !connectedBlock) {
    return undefined;
  }

  return portMap[blockId]?.[kind]?.[getConnectionSide(block, connectedBlock)];
}

function getConnectionSide(block: DiagramBlock, connectedBlock: DiagramBlock): PortSide {
  const centerX = block.x + block.width / 2;
  const centerY = block.y + block.height / 2;
  const connectedCenterX = connectedBlock.x + connectedBlock.width / 2;
  const connectedCenterY = connectedBlock.y + connectedBlock.height / 2;
  const dx = connectedCenterX - centerX;
  const dy = connectedCenterY - centerY;

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? "right" : "left";
  }

  return dy >= 0 ? "bottom" : "top";
}

function getSidePoint(block: DiagramBlock, side: PortSide, lane: number): { x: number; y: number } {
  const centerX = block.x + block.width / 2;
  const centerY = block.y + block.height / 2;
  const verticalY = centerY + lane;
  const horizontalX = centerX + lane;

  switch (side) {
    case "left":
      return { x: block.x, y: verticalY };
    case "right":
      return { x: block.x + block.width, y: verticalY };
    case "top":
      return { x: horizontalX, y: block.y };
    case "bottom":
      return { x: horizontalX, y: block.y + block.height };
  }
}

function getPortLane(
  kind: DiagramPort["kind"],
  side: PortSide,
  sides: Record<DiagramPort["kind"], Set<PortSide>>,
): number {
  const bothKindsOnSide = sides.input.has(side) && sides.output.has(side);
  if (!bothKindsOnSide) {
    return 0;
  }

  return kind === "input" ? -12 : 12;
}

function getInputAngle(side: PortSide): number {
  return { left: 0, right: 180, top: 90, bottom: -90 }[side];
}

function getOutputAngle(side: PortSide): number {
  return { left: 180, right: 0, top: -90, bottom: 90 }[side];
}

function getSideVector(side: PortSide): { x: number; y: number } {
  return {
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
    top: { x: 0, y: -1 },
    bottom: { x: 0, y: 1 },
  }[side];
}

function offsetPoint(
  point: { x: number; y: number },
  vector: { x: number; y: number },
  distance: number,
): { x: number; y: number } {
  return { x: point.x + vector.x * distance, y: point.y + vector.y * distance };
}

function uniqueConnectors(connectors: DiagramConnector[]): DiagramConnector[] {
  const seen = new Set<string>();

  return connectors.filter((connector) => {
    const key = `${connector.from}-${connector.to}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function resolveOverlaps(blocks: Record<string, DiagramBlock>): void {
  const GAP = 22;
  const Y_MIN = 90;
  const Y_MAX = 815;

  const ordered = Object.values(blocks).sort((a, b) => a.y - b.y || a.x - b.x);

  for (const block of ordered) {
    if (block.y < Y_MIN) {
      block.y = Y_MIN;
    }
  }

  for (let pass = 0; pass < ordered.length; pass++) {
    let changed = false;

    for (let i = 0; i < ordered.length; i++) {
      for (let j = i + 1; j < ordered.length; j++) {
        const upper = ordered[i];
        const lower = ordered[j];

        if (!blocksOverlapHorizontally(upper, lower)) {
          continue;
        }

        const minY = upper.y + upper.height + GAP;
        if (lower.y < minY) {
          lower.y = minY;
          changed = true;
        }
      }
    }

    ordered.sort((a, b) => a.y - b.y || a.x - b.x);

    if (!changed) {
      break;
    }
  }

  const overflow = Math.max(...ordered.map((block) => block.y + block.height)) - Y_MAX;
  if (overflow > 0) {
    for (const block of ordered) {
      block.y = Math.max(Y_MIN, block.y - overflow);
    }
  }
}

function blocksOverlapHorizontally(first: DiagramBlock, second: DiagramBlock): boolean {
  const GAP = 16;
  return first.x < second.x + second.width + GAP && second.x < first.x + first.width + GAP;
}

function configAcSummary(rows: EnrichedBomRow[]): string {
  const acProducts = rows.filter((row) => row.product?.acVoltage);
  const voltages = [...new Set(acProducts.map((row) => row.product?.acVoltage).filter(Boolean))];
  return voltages.slice(0, 2).join(", ") || "AC output distribution";
}

function getUnitsByType(rows: EnrichedBomRow[]): Partial<Record<ProductType, ProductUnit[]>> {
  return rows.reduce<Partial<Record<ProductType, ProductUnit[]>>>((units, row) => {
    if (!row.product) {
      return units;
    }

    const productType = row.product.productType;
    const productUnits = Array.from({ length: row.quantity }, () => ({
      model: row.product?.modelNumber ?? "",
      family: row.product?.family ?? "",
      productType,
      powerRating: row.product?.powerRating,
      currentRating: row.product?.currentRating,
    }));

    return {
      ...units,
      [productType]: [...(units[productType] ?? []), ...productUnits],
    };
  }, {});
}

function createUnitBlocks(
  rule: ProductTypeRule,
  units: ProductUnit[],
): Record<string, DiagramBlock> {
  if (units.length === 0) {
    return {};
  }

  const spacing = Math.max(66, 98 - Math.max(0, units.length - 1) * 8);

  return units.reduce<Record<string, DiagramBlock>>((blocks, unit, index) => {
    const title = units.length > 1 ? `${rule.label} #${index + 1}` : rule.label;
    return {
      ...blocks,
      [`${rule.type}-${index + 1}`]: block(
        `${rule.type}-${index + 1}`,
        title,
        unit.model || `${units.length} selected`,
        unit.family || "Not selected",
        rule.x,
        rule.y + index * spacing,
        rule.tone,
      ),
    };
  }, {});
}

function unitIds(type: ProductType, units: ProductUnit[]): string[] {
  return Array.from({ length: units.length }, (_, index) => `${type}-${index + 1}`);
}

function getRuleConnectors(
  rule: ProductTypeRule,
  unitsFor: (type: ProductType) => ProductUnit[],
  blocks: Record<string, DiagramBlock>,
): DiagramConnector[] {
  const ids = unitIds(rule.type, unitsFor(rule.type));
  const anchorInputs = rule.inputAnchors.flatMap((input) =>
    ids.map((id) => ({ from: input, to: id })),
  );
  const anchorOutputs = rule.outputAnchors.flatMap((output) =>
    ids.map((id) => ({ from: id, to: output })),
  );
  const productInputs = (rule.inputProductTypes ?? []).flatMap((type) =>
    unitIds(type, unitsFor(type)).flatMap((sourceId) => ids.map((id) => ({ from: sourceId, to: id }))),
  );
  const productOutputs = (rule.outputProductTypes ?? []).flatMap((type) => {
    const targetId = unitIds(type, unitsFor(type)).find((id) => blocks[id]);
    return targetId ? ids.map((id) => ({ from: id, to: targetId })) : [];
  });

  return [...anchorInputs, ...anchorOutputs, ...productInputs, ...productOutputs];
}

function summarizeUnitFamilies(units: ProductUnit[]): string {
  const families = [...new Set(units.map((unit) => unit.family).filter(Boolean))];
  return families.slice(0, 2).join(", ") || "Not selected";
}

function summarizeBatteryDetails(units: ProductUnit[]): string {
  if (units.length === 0) {
    return "Capacity entered outside BOM";
  }

  const totalCapacityKwh = units.reduce(
    (total, unit) => total + parseEnergyKwh(unit.powerRating),
    0,
  );

  if (totalCapacityKwh > 0) {
    return `${formatCapacityKwh(totalCapacityKwh)} total | ${units.length} batteries`;
  }

  const ratings = [...new Set(units.map((unit) => unit.currentRating).filter(Boolean))];
  const ratingSummary = ratings.slice(0, 2).join(", ");
  return ratingSummary ? `${units.length} selected | ${ratingSummary}` : `${units.length} selected`;
}

function summarizeDcDistributionDetails(units: ProductUnit[]): string {
  const ratings = [...new Set(units.map((unit) => unit.powerRating).filter(Boolean))];
  const ratingSummary = ratings.slice(0, 2).join(", ");
  return ratingSummary ? `${units.length} selected | ${ratingSummary}` : `${units.length} selected`;
}

function parseEnergyKwh(value?: string): number {
  const match = value?.match(/([\d.]+)\s*(kwh|wh)/i);
  if (!match) {
    return 0;
  }

  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) {
    return 0;
  }

  return match[2].toLowerCase() === "wh" ? amount / 1000 : amount;
}

function formatCapacityKwh(value: number): string {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value >= 10 ? 1 : 2,
  }).format(value)} kWh`;
}

function block(
  id: string,
  title: string,
  subtitle: string,
  detail: string,
  x: number,
  y: number,
  tone: DiagramTone,
): DiagramBlock {
  return { id, title, subtitle, detail, x, y, width: NODE_WIDTH, height: NODE_HEIGHT, tone };
}

function downloadDiagramSvg(systemName: string) {
  const svg = document.getElementById(diagramId);
  if (!svg) {
    return;
  }

  const source = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  downloadBlob(blob, `${safeFileName(systemName)}-architecture.svg`);
}

function downloadDiagramPng(systemName: string) {
  const svg = document.getElementById(diagramId);
  if (!svg) {
    return;
  }

  const source = new XMLSerializer().serializeToString(svg);
  const url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml;charset=utf-8" }));
  const image = new Image();

  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 2520;
    canvas.height = 1800;
    const context = canvas.getContext("2d");

    if (!context) {
      URL.revokeObjectURL(url);
      return;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, `${safeFileName(systemName)}-architecture.png`);
      }
      URL.revokeObjectURL(url);
    });
  };

  image.src = url;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function safeFileName(value: string) {
  return (value || "nomadeus-system").replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "").toLowerCase();
}
