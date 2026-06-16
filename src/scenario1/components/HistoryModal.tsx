import type { EventRecord } from "../lib/eventHistory";
import { downloadReport } from "../lib/generateReport";
import { EVENT_CONFIGS } from "../constants";
import type { EventType } from "../types";
import FireExtinguisherPanel from "./panels/FireExtinguisherPanel";
import ServerRoomPanel       from "./panels/ServerRoomPanel";
import DeviceFailurePanel    from "./panels/DeviceFailurePanel";

interface Props {
  record: EventRecord;
  onClose: () => void;
}

export default function HistoryModal({ record, onClose }: Props) {
  const cfg = EVENT_CONFIGS[record.eventType as EventType];

  // initialCompleted: step id → completedAt 맵
  const initialCompleted = Object.fromEntries(
    record.steps.map(s => [s.id, s.completedAt])
  );

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1200,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />

      <div style={{
        position: "relative", zIndex: 1,
        background: "#fff", borderRadius: 14,
        width: 500, maxHeight: "88vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        padding: 24,
      }}>
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 26 }}>{record.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{record.title}</div>
              <div style={{ fontSize: 11, color: "#6B7280" }}>
                {record.location} · 감지 {record.detectedAt} · 완료 {record.completedAt}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: "50%", border: "none",
            background: "#F3F4F6", cursor: "pointer", fontSize: 14, color: "#6B7280",
          }}>✕</button>
        </div>

        {/* 패널 (이력 조회) */}
        {record.eventType === "fire_extinguisher" && (
          <FireExtinguisherPanel
            onAction={() => {}}
            detectedAt={record.detectedAt}
            initialCompleted={initialCompleted}
          />
        )}
        {record.eventType === "server_room" && (
          <ServerRoomPanel
            onAction={() => {}}
            detectedAt={record.detectedAt}
            initialCompleted={initialCompleted}
          />
        )}
        {record.eventType === "device_failure" && (
          <DeviceFailurePanel
            onAction={() => {}}
            detectedAt={record.detectedAt}
            initialCompleted={initialCompleted}
          />
        )}
      </div>
    </div>
  );
}
