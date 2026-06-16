export type SpotId = "SPOT-01" | "SPOT-02" | "SPOT-03" | "SPOT-04";
export type SpotStatus = "patrolling" | "standby" | "charging" | "responding" | "moving" | "error" | "complete";
export type S2EventType = "fire_extinguisher";
export type S2Step = "monitoring" | "event_detected" | "event_detail" | "spot_recommended" | "approved" | "responding" | "spot_error" | "complete";

export interface SpotUnit {
  id: SpotId;
  zone: string;
  role: string;
  status: SpotStatus;
  battery: number;
  signal: "good" | "weak" | "lost";
  mission: string;
  x: number;
  y: number;
}

export interface S2LogEntry {
  time: string;
  msg: string;
  type: "info" | "warn" | "success" | "action" | "error";
}
