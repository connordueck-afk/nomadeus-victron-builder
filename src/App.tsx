import { useMemo, useState } from "react";
import { AppLayout } from "./components/AppLayout";
import { ArchitectureDiagram } from "./components/ArchitectureDiagram";
import { NomadeusComparisonPanel } from "./components/NomadeusComparison";
import { ProductSection } from "./components/ProductSection";
import { ProductCatalogSummary, ProductsPage } from "./components/ProductsPage";
import { type AppView, Sidebar } from "./components/Sidebar";
import { SummaryPanel } from "./components/SummaryPanel";
import { applicationDefaults } from "./data/applicationPresets";
import { defaultComparison, defaultConfig } from "./data/defaultSystem";
import { defaultSystems } from "./data/defaultSystems";
import { productSections, products } from "./data/products";
import type { ProductSection as ProductSectionName } from "./types/product";
import type { Application, BomRow, NomadeusComparison, SystemConfig } from "./types/system";
import { enrichRows, getSystemTotals } from "./utils/calculations";
import { createCsvExport } from "./utils/csvExport";
import { isProductCompatibleWithConfig } from "./utils/productCompatibility";
import {
  deleteSavedSystem,
  listSavedSystems,
  loadSystem,
  saveSystem,
} from "./utils/storage";

function App() {
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);
  const [rows, setRows] = useState<BomRow[]>([]);
  const [comparison, setComparison] = useState<NomadeusComparison>(defaultComparison);
  const [savedSystems, setSavedSystems] = useState(() => listSavedSystems());
  const [selectedSavedSystemId, setSelectedSavedSystemId] = useState("");
  const [status, setStatus] = useState("Ready");
  const [activeView, setActiveView] = useState<AppView>("builder");
  const [collapsedSections, setCollapsedSections] = useState<
    Partial<Record<ProductSectionName, boolean>>
  >({});

  const enrichedRows = useMemo(
    () => enrichRows(rows, products, config.defaultOemDiscountPercent),
    [config.defaultOemDiscountPercent, rows],
  );
  const totals = useMemo(() => getSystemTotals(enrichedRows), [enrichedRows]);

  function handleApplicationChange(application: Application) {
    const defaults = applicationDefaults[application];
    setConfig((current) => ({
      ...current,
      application,
      systemVoltage: defaults.voltage,
      acOutput: defaults.acOutput,
    }));
  }

  function addRow(section: ProductSectionName) {
    const firstProduct = products.find(
      (product) =>
        product.section === section && isProductCompatibleWithConfig(product, config),
    );

    setCollapsedSections((current) => ({ ...current, [section]: false }));
    setRows((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        section,
        productId: firstProduct?.id ?? "",
        quantity: 1,
      },
    ]);
  }

  function updateRow(rowId: string, update: Partial<BomRow>) {
    setRows((current) =>
      current.map((row) => (row.id === rowId ? { ...row, ...update } : row)),
    );
  }

  function deleteRow(rowId: string) {
    setRows((current) => current.filter((row) => row.id !== rowId));
  }

  function handleSave() {
    const isExample = defaultSystems.some((d) => d.id === selectedSavedSystemId);
    const savedRecord = saveSystem(
      { config, rows, comparison },
      isExample ? undefined : selectedSavedSystemId || undefined,
    );
    setSavedSystems(listSavedSystems());
    setSelectedSavedSystemId(savedRecord.id);
    setStatus(`Saved "${savedRecord.name}"`);
  }

  function handleLoad(id: string) {
    if (!id) {
      setSelectedSavedSystemId("");
      return;
    }

    const saved = loadSystem(id);

    if (!saved) {
      setStatus("No saved system found");
      return;
    }

    setConfig({ ...defaultConfig, ...saved.config });
    setRows(saved.rows);
    setComparison(saved.comparison);
    setSelectedSavedSystemId(id);
    setStatus(`Loaded "${saved.config.systemName || "Untitled system"}"`);
  }

  function handleDeleteSavedSystem() {
    if (!selectedSavedSystemId) {
      setStatus("Select a saved system first");
      return;
    }

    deleteSavedSystem(selectedSavedSystemId);
    setSavedSystems(listSavedSystems());
    setSelectedSavedSystemId("");
    setStatus("Deleted saved system");
  }

  function handleReset() {
    setConfig(defaultConfig);
    setRows([]);
    setComparison(defaultComparison);
    setSelectedSavedSystemId("");
    setStatus("New unsaved system");
  }

  function handleExportCsv() {
    const csv = createCsvExport(config, enrichedRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${config.systemName || "nomadeus-system"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus("CSV exported");
  }

  function toggleSectionCollapsed(section: ProductSectionName) {
    setCollapsedSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

  function expandAllSections() {
    setCollapsedSections({});
  }

  function collapseAllSections() {
    setCollapsedSections(
      productSections.reduce<Partial<Record<ProductSectionName, boolean>>>(
        (sections, section) => ({ ...sections, [section]: true }),
        {},
      ),
    );
  }

  return (
    <AppLayout
      sidebar={
        <Sidebar
          activeView={activeView}
          config={config}
          savedSystems={savedSystems}
          defaultSystems={defaultSystems}
          selectedSavedSystemId={selectedSavedSystemId}
          status={status}
          onViewChange={setActiveView}
          onApplicationChange={handleApplicationChange}
          onConfigChange={setConfig}
          onSave={handleSave}
          onLoad={handleLoad}
          onDeleteSavedSystem={handleDeleteSavedSystem}
          onReset={handleReset}
          onExportCsv={handleExportCsv}
        />
      }
      summary={
        activeView === "builder" ? (
          <SummaryPanel rows={enrichedRows} totals={totals} comparison={comparison} />
        ) : (
          <ProductCatalogSummary products={products} />
        )
      }
    >
      {activeView === "builder" ? (
        <>
          <div className="builder-header">
            <div>
              <p className="eyebrow">Power System BOM Builder</p>
              <h1>{config.systemName || "Untitled system"}</h1>
            </div>
            <div className="header-meta">
              <span>{config.application}</span>
              <span>{config.systemVoltage}</span>
              <span>{config.acOutput}</span>
            </div>
          </div>

          <NomadeusComparisonPanel
            comparison={comparison}
            totals={totals}
            onChange={setComparison}
          />

          <ArchitectureDiagram
            config={config}
            rows={enrichedRows}
            totals={totals}
            comparison={comparison}
          />

          <div className="section-toolbar">
            <button type="button" className="secondary" onClick={expandAllSections}>
              Expand all
            </button>
            <button type="button" className="secondary" onClick={collapseAllSections}>
              Collapse all
            </button>
          </div>

          <div className="sections-stack">
            {productSections.map((section) => (
              <ProductSection
                key={section}
                section={section}
                config={config}
                rows={enrichedRows.filter((row) => row.section === section)}
                products={products.filter((product) => product.section === section)}
                isCollapsed={Boolean(collapsedSections[section])}
                onAdd={() => addRow(section)}
                onToggleCollapsed={() => toggleSectionCollapsed(section)}
                onUpdateRow={updateRow}
                onDeleteRow={deleteRow}
              />
            ))}
          </div>
        </>
      ) : (
        <ProductsPage products={products} />
      )}
    </AppLayout>
  );
}

export default App;
