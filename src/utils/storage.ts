import { defaultSystems } from "../data/defaultSystems";
import type { SavedSystem, SavedSystemRecord } from "../types/system";

const LEGACY_STORAGE_KEY = "nomadeus-builder-system-v1";
const SAVED_SYSTEMS_KEY = "nomadeus-builder-saved-systems-v1";

export function listSavedSystems(): SavedSystemRecord[] {
  const raw = localStorage.getItem(SAVED_SYSTEMS_KEY);
  const records = parseRecords(raw);

  if (records.length > 0) {
    return sortSavedSystems(records);
  }

  const legacySystem = loadLegacySystem();
  if (!legacySystem) {
    return [];
  }

  const migratedRecord = createSavedSystemRecord(legacySystem);
  localStorage.setItem(SAVED_SYSTEMS_KEY, JSON.stringify([migratedRecord]));
  localStorage.removeItem(LEGACY_STORAGE_KEY);

  return [migratedRecord];
}

export function saveSystem(system: SavedSystem, existingId?: string): SavedSystemRecord {
  const current = listSavedSystems();
  const nextRecord = createSavedSystemRecord(system, existingId);
  const nextRecords = current.some((record) => record.id === nextRecord.id)
    ? current.map((record) => (record.id === nextRecord.id ? nextRecord : record))
    : [...current, nextRecord];

  localStorage.setItem(SAVED_SYSTEMS_KEY, JSON.stringify(sortSavedSystems(nextRecords)));
  return nextRecord;
}

export function loadSystem(id: string): SavedSystem | null {
  const userSystem = listSavedSystems().find((record) => record.id === id)?.system;
  if (userSystem) return userSystem;
  return defaultSystems.find((record) => record.id === id)?.system ?? null;
}

export function deleteSavedSystem(id: string): void {
  const nextRecords = listSavedSystems().filter((record) => record.id !== id);
  localStorage.setItem(SAVED_SYSTEMS_KEY, JSON.stringify(nextRecords));
}

export function clearSavedSystems(): void {
  localStorage.removeItem(SAVED_SYSTEMS_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}

function createSavedSystemRecord(system: SavedSystem, existingId?: string): SavedSystemRecord {
  return {
    id: existingId ?? crypto.randomUUID(),
    name: system.config.systemName.trim() || "Untitled system",
    application: system.config.application,
    updatedAt: new Date().toISOString(),
    system,
  };
}

function loadLegacySystem(): SavedSystem | null {
  const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SavedSystem;
  } catch {
    return null;
  }
}

function parseRecords(raw: string | null): SavedSystemRecord[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as SavedSystemRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function sortSavedSystems(records: SavedSystemRecord[]): SavedSystemRecord[] {
  return [...records].sort(
    (first, second) => Date.parse(second.updatedAt) - Date.parse(first.updatedAt),
  );
}
