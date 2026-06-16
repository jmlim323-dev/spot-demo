import type { SpotUnit, SpotId } from "../types";
import { STATUS_META } from "../constants";

interface Props {
  spots: SpotUnit[];
  eventSpotId: SpotId | null;
  recommendedId: SpotId | null;
  movingId: SpotId | null;
}

const ZONE_AREAS = [
  { label: "A구역",    x: 60,  y: 60,  w: 240, h: 200, color: "#EEF2FF" },
  { label: "B구역",    x: 360, y: 60,  w: 240, h: 200, color: "#F0FDF4" },
  { label: "중앙구역", x: 210, y: 220, w: 240, h: 140, color: "#FFFBEB" },
  { label: "충전구역", x: 210, y: 340, w: 240, h: 100, color: "#F9FAFB" },
];

export default function ScenarioMap({ spots, eventSpotId, recommendedId, movingId }: Props) {
  return (
    <svg viewBox="0 0 660 480" style={{ width: "100%", height: "100%", display: "block" }}>

      {/* Zone backgrounds */}
      {ZONE_AREAS.map(z => (
        <g key={z.label}>
          <rect x={z.x} y={z.y} width={z.w} height={z.h}
            fill={z.color} stroke="#E5E7EB" strokeWidth={1} rx={8} />
          <text x={z.x + 12} y={z.y + 20} fontSize={11} fill="#9CA3AF" fontWeight={500}>{z.label}</text>
        </g>
      ))}

      {/* Event marker */}
      {eventSpotId && (() => {
        const sp = spots.find(s => s.id === eventSpotId);
        if (!sp) return null;
        return (
          <g>
            <circle cx={sp.x} cy={sp.y} r={32} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={2} opacity={0.6} />
            <text x={sp.x} y={sp.y - 36} textAnchor="middle" fontSize={10} fill="#92400E" fontWeight={600}>이벤트 발생</text>
          </g>
        );
      })()}

      {/* Recommended path line */}
      {recommendedId && (() => {
        const from = spots.find(s => s.id === recommendedId);
        const to   = spots.find(s => s.id === eventSpotId!);
        if (!from || !to) return null;
        return (
          <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
            stroke="#8B5CF6" strokeWidth={2} strokeDasharray="6 3" opacity={0.7} />
        );
      })()}

      {/* Spot units */}
      {spots.map(sp => {
        const isEvent   = sp.id === eventSpotId;
        const isRecom   = sp.id === recommendedId;
        const isMoving  = sp.id === movingId;
        const meta      = STATUS_META[sp.status];

        return (
          <g key={sp.id}>
            {/* Glow ring for recommended */}
            {isRecom && (
              <circle cx={sp.x} cy={sp.y} r={28} fill="none" stroke="#8B5CF6" strokeWidth={2.5} opacity={0.5} />
            )}
            {/* Error ring */}
            {sp.status === "error" && (
              <circle cx={sp.x} cy={sp.y} r={28} fill="none" stroke="#EF4444" strokeWidth={2} opacity={0.6} />
            )}
            {/* Main circle */}
            <circle cx={sp.x} cy={sp.y} r={22}
              fill={sp.status === "error" ? "#FEE2E2" : isEvent ? "#FEF3C7" : isRecom ? "#EDE9FE" : "#EEF2FF"}
              stroke={sp.status === "error" ? "#EF4444" : isEvent ? "#F59E0B" : isRecom ? "#8B5CF6" : "#6366F1"}
              strokeWidth={isEvent || isRecom ? 2.5 : 1.5}
            />
            <text textAnchor="middle" x={sp.x} y={sp.y + 5} fontSize={16}>🤖</text>
            {/* ID label */}
            <text textAnchor="middle" x={sp.x} y={sp.y + 36} fontSize={10} fontWeight={600} fill="#374151">
              {sp.id}
            </text>
            {/* Status badge */}
            <rect x={sp.x - 22} y={sp.y + 40} width={44} height={14} rx={7}
              fill={meta.bg} />
            <text textAnchor="middle" x={sp.x} y={sp.y + 50} fontSize={9} fill={meta.color} fontWeight={600}>
              {meta.text}
            </text>
            {/* Battery */}
            <text textAnchor="middle" x={sp.x} y={sp.y - 28} fontSize={9} fill="#6B7280">
              🔋{sp.battery}%
            </text>
            {/* Moving indicator */}
            {isMoving && (
              <text textAnchor="middle" x={sp.x} y={sp.y - 40} fontSize={9} fill="#8B5CF6" fontWeight={600}>
                → 이동 중
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
