import { applications, acOutputs, systemVoltages } from "../data/applicationPresets";
import { productSections } from "../data/products";
import type { Application, SavedSystemRecord, SystemConfig } from "../types/system";

export type AppView = "builder" | "products";

type SidebarProps = {
  activeView: AppView;
  config: SystemConfig;
  savedSystems: SavedSystemRecord[];
  defaultSystems: SavedSystemRecord[];
  selectedSavedSystemId: string;
  status: string;
  onViewChange: (view: AppView) => void;
  onApplicationChange: (application: Application) => void;
  onConfigChange: (config: SystemConfig) => void;
  onSave: () => void;
  onLoad: (id: string) => void;
  onDeleteSavedSystem: () => void;
  onReset: () => void;
  onExportCsv: () => void;
};

export function Sidebar({
  activeView,
  config,
  savedSystems,
  defaultSystems,
  selectedSavedSystemId,
  status,
  onViewChange,
  onApplicationChange,
  onConfigChange,
  onSave,
  onLoad,
  onDeleteSavedSystem,
  onReset,
  onExportCsv,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">N</span>
        <div>
          <h2>Nomadeus</h2>
          <p>Power system builder</p>
        </div>
      </div>

      <div className="view-switch" aria-label="View">
        <button
          type="button"
          className={activeView === "builder" ? "active" : "secondary"}
          onClick={() => onViewChange("builder")}
        >
          Builder
        </button>
        <button
          type="button"
          className={activeView === "products" ? "active" : "secondary"}
          onClick={() => onViewChange("products")}
        >
          Products
        </button>
      </div>

      <label>
        Application
        <select
          value={config.application}
          onChange={(event) => onApplicationChange(event.target.value as Application)}
        >
          {applications.map((application) => (
            <option key={application}>{application}</option>
          ))}
        </select>
      </label>

      <label>
        System name
        <input
          value={config.systemName}
          onChange={(event) => onConfigChange({ ...config, systemName: event.target.value })}
        />
      </label>

      <label>
        System voltage
        <select
          value={config.systemVoltage}
          onChange={(event) =>
            onConfigChange({
              ...config,
              systemVoltage: event.target.value as SystemConfig["systemVoltage"],
            })
          }
        >
          {systemVoltages.map((voltage) => (
            <option key={voltage}>{voltage}</option>
          ))}
        </select>
      </label>

      <label>
        AC output
        <select
          value={config.acOutput}
          onChange={(event) =>
            onConfigChange({ ...config, acOutput: event.target.value as SystemConfig["acOutput"] })
          }
        >
          {acOutputs.map((output) => (
            <option key={output}>{output}</option>
          ))}
        </select>
      </label>

      <label>
        Default OEM savings %
        <input
          type="number"
          min={0}
          max={100}
          step={1}
          value={config.defaultOemDiscountPercent}
          onChange={(event) => {
            const nextValue = Number(event.target.value);
            onConfigChange({
              ...config,
              defaultOemDiscountPercent: Number.isFinite(nextValue) ? nextValue : 0,
            });
          }}
        />
      </label>

      <label>
        Notes
        <textarea
          value={config.notes}
          onChange={(event) => onConfigChange({ ...config, notes: event.target.value })}
          rows={4}
        />
      </label>

      <div className="action-grid">
        <button type="button" onClick={onSave}>
          Save
        </button>
        <button type="button" onClick={onExportCsv}>
          CSV
        </button>
        <button type="button" className="secondary" onClick={onReset}>
          New
        </button>
        <button
          type="button"
          className="secondary"
          onClick={onDeleteSavedSystem}
          disabled={
            !selectedSavedSystemId ||
            defaultSystems.some((d) => d.id === selectedSavedSystemId)
          }
        >
          Delete
        </button>
      </div>

      <label>
        Saved systems
        <select
          value={selectedSavedSystemId}
          onChange={(event) => onLoad(event.target.value)}
        >
          <option value="">Select saved system</option>
          {savedSystems.length > 0 && (
            <optgroup label="Saved">
              {savedSystems.map((system) => (
                <option key={system.id} value={system.id}>
                  {system.name} - {system.application}
                </option>
              ))}
            </optgroup>
          )}
          <optgroup label="Examples">
            {defaultSystems.map((system) => (
              <option key={system.id} value={system.id}>
                {system.name}
              </option>
            ))}
          </optgroup>
        </select>
      </label>

      <p className="status">{status}</p>

      <nav className="section-nav" aria-label="Product sections">
        {productSections.map((section) => (
          <a key={section} href={`#${section.replaceAll(" ", "-").replaceAll("/", "")}`}>
            {section}
          </a>
        ))}
      </nav>
    </aside>
  );
}
