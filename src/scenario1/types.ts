// ─── Domain Types ─────────────────────────────────────────────────────────────

export type EventType = "fire_extinguisher" | "server_room" | "device_failure";

export type MissionStatus = "patrolling" | "paused" | "responding" | "resumed";

export type ActionStep =
  | "monitoring"
  | "event_detected"
  | "event_detail"
  | "action_taken"
  | "mission_resumed";

// ─── Data Shape Types ──────────────────────────────────────────────────────────

export interface PatrolPoint {
  id: string;
  x: number;
  y: number;
  label: string;
  isCheckpoint?: boolean;
}

export interface SpotPosition {
  x: number;
  y: number;
  angle: number;
}

export interface EventConfig {
  title: string;
  icon: string;
  severity: "high" | "medium" | "critical";
  triggerPoint: number;
  color: string;
  bgColor: string;
}

export interface SeverityMeta {
  text: string;
  color: string;
  bg: string;
}

export interface StatusMeta {
  text: string;
  color: string;
  bg: string;
}

export interface LogEntry {
  time: string;
  msg: string;
  type: "info" | "warn" | "success" | "action";
}
