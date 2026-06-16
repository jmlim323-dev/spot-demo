import type { SpotUnit } from "../types";
import { STATUS_META, SIGNAL_META } from "../constants";
import { spotCard } from "../styles";

interface Props {
  spot: SpotUnit;
  active?: boolean;
  recommended?: boolean;
}

export default function SpotCard({ spot, active = false, recommended = false }: Props) {
  const statusMeta = STATUS_META[spot.status];
  const signalMeta = SIGNAL_META[spot.signal];
  const isError    = spot.status === "error";

  return (
    <div style={spotCard(active || recommended, isError)}>
      {/* 상단: 이름 + 상태 배지 */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>🤖</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{spot.id}</div>
            <div style={{ fontSize: 11, color: "#6B7280" }}>{spot.zone} · {spot.role}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
          <span style={{
            padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600,
            color: statusMeta.color, background: statusMeta.bg, whiteSpace: "nowrap",
          }}>
            {statusMeta.text}
          </span>
          {recommended && (
            <span style={{
              padding: "2px 8px", borderRadius: 12, fontSize: 10, fontWeight: 600,
              color: "#5B21B6", background: "#EDE9FE",
            }}>
              ★ 추천
            </span>
          )}
        </div>
      </div>

      {/* 하단: 배터리 · 신호 · 미션 한 줄 */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: "#6B7280" }}>
        <span>
          🔋 <span style={{ fontWeight: 600, color: spot.battery < 40 ? "#EF4444" : "#374151" }}>
            {spot.battery}%
          </span>
        </span>
        <span>
          📡 <span style={{ fontWeight: 600, color: signalMeta.color }}>{signalMeta.text}</span>
        </span>
        <span style={{ color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          📋 {spot.mission}
        </span>
      </div>
    </div>
  );
}
