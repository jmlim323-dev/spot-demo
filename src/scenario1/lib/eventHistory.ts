import type { EventType } from "../types";
import type { TimelineStep } from "../components/ActionTimeline";

// ─── 타입 ─────────────────────────────────────────────────────────────────────

export interface EventRecord {
  eventType: EventType;
  title: string;
  icon: string;
  location: string;
  detectedAt: string;
  completedAt: string;
  steps: Array<{
    id: string;
    icon: string;
    label: string;
    desc: string;
    completedAt: string;
  }>;
}

const STORAGE_KEY = "spot_event_history";

export function saveEventRecord(record: EventRecord): void {
  try {
    const existing = loadAllRecords();
    const filtered = existing.filter(r => r.eventType !== record.eventType);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...filtered, record]));
  } catch (e) {
    console.error("이력 저장 실패", e);
  }
}

export function loadAllRecords(): EventRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function loadRecord(eventType: EventType): EventRecord | null {
  return loadAllRecords().find(r => r.eventType === eventType) ?? null;
}

export function clearAllRecords(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function buildSteps(
  steps: TimelineStep[],
  completed: Record<string, string>
): EventRecord["steps"] {
  return steps
    .filter(s => completed[s.id])
    .map(s => ({
      id:          s.id,
      icon:        s.icon,
      label:       s.label,
      desc:        s.desc,
      completedAt: completed[s.id],
    }));
}
