import type { EventType, MissionStatus, SpotPosition } from "../types";
import { PATROL_PATH, EVENT_CONFIGS } from "../constants";

interface PatrolMapProps {
  spotPos: SpotPosition;
  currentPointIdx: number;
  activeEvent: EventType | null;
  missionStatus: MissionStatus;
  completedEvents?: EventType[];
  onMarkerClick?: (eventType: EventType) => void;
}

const EVENT_POINT: Record<string, { color: string; label: string; eventKey: EventType }> = {
  "p3":  { color: "#F59E0B", label: "소화기",  eventKey: "fire_extinguisher" },
  "p5":  { color: "#EF4444", label: "서버룸",  eventKey: "server_room"       },
  "p9":  { color: "#EF4444", label: "기기 고장", eventKey: "device_failure"  },
};

export default function PatrolMap({
  spotPos, currentPointIdx, activeEvent, missionStatus,
  completedEvents = [], onMarkerClick,
}: PatrolMapProps) {
  const isPaused     = missionStatus === "paused" || missionStatus === "responding";
  const activePointId =
    activeEvent === "fire_extinguisher" ? "p3" :
    activeEvent === "server_room"       ? "p5" :
    activeEvent === "device_failure"    ? "p9" : null;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <img src="/floorplan.png" alt="도면"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />

      <svg viewBox="0 0 1280 720"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>

        {/* 계획 경로 */}
        <polyline
          points={PATROL_PATH.map(p => `${p.x},${p.y}`).join(" ")}
          fill="none" stroke="#6366F1" strokeWidth={2.5} strokeDasharray="10 6" opacity={0.35}
        />

        {/* 완료 경로 */}
        {currentPointIdx > 0 && (
          <polyline
            points={PATROL_PATH.slice(0, currentPointIdx + 1).map(p => `${p.x},${p.y}`).join(" ")}
            fill="none" stroke="#6366F1" strokeWidth={3} opacity={0.8}
          />
        )}

        {/* 체크포인트 마커 */}
        {PATROL_PATH.map((pt, i) => {
          if (!pt.isCheckpoint) return null;

          const visited   = i < currentPointIdx;
          const isCurrent = i === currentPointIdx;
          const evMeta    = EVENT_POINT[pt.id];
          const isActive  = pt.id === activePointId && isPaused;
          const isCompletedEvent = evMeta && completedEvents.includes(evMeta.eventKey);
          const isClickable = isCompletedEvent && onMarkerClick;

          const color = evMeta ? evMeta.color : "#6366F1";
          const r = isActive ? 16 : 12;

          return (
            <g key={pt.id}
              style={{ cursor: isClickable ? "pointer" : "default" }}
              onClick={() => isClickable && onMarkerClick(evMeta.eventKey)}
            >
              {/* 글로우 */}
              {evMeta && (
                <circle cx={pt.x} cy={pt.y} r={r + 8}
                  fill={color} opacity={isActive ? 0.25 : isCompletedEvent ? 0.15 : 0.1} />
              )}

              {/* 완료 이벤트 - 클릭 가능 표시 (점선 링) */}
              {isCompletedEvent && !isActive && (
                <circle cx={pt.x} cy={pt.y} r={r + 12}
                  fill="none" stroke={color} strokeWidth={1.5}
                  strokeDasharray="4 3" opacity={0.6} />
              )}

              {/* 원 */}
              <circle cx={pt.x} cy={pt.y} r={r}
                fill={visited && !isActive ? color : pt.id === "p1" ? "#6366F1" : "white"}
                stroke={color} strokeWidth={2.5} opacity={0.95}
              />

              {/* 내부 텍스트 */}
              {isActive && (
                <text x={pt.x} y={pt.y + 5} textAnchor="middle" fontSize={13} fill="white" fontWeight={700}>!</text>
              )}
              {visited && !isActive && (
                <text x={pt.x} y={pt.y + 5} textAnchor="middle" fontSize={11} fill="white" fontWeight={700}>✓</text>
              )}

              {/* 라벨 */}
              {pt.label && (
                <g>
                  <rect x={pt.x - 44} y={pt.y + r + 4} width={88} height={20} rx={5}
                    fill={isActive ? color : "#1F2937"} opacity={0.85} />
                  <text x={pt.x} y={pt.y + r + 17}
                    textAnchor="middle" fontSize={11} fill="white" fontWeight={600}>
                    {pt.label}
                  </text>
                </g>
              )}

              {/* 클릭 힌트 */}
              {isCompletedEvent && !isActive && (
                <text x={pt.x} y={pt.y + r + 30}
                  textAnchor="middle" fontSize={9} fill={color} opacity={0.8}>
                  이력 보기
                </text>
              )}
            </g>
          );
        })}

        {/* SPOT-01 */}
        <g transform={`translate(${spotPos.x}, ${spotPos.y})`}>
          <circle r={20}
            fill={isPaused ? "#FEF3C7" : "#EEF2FF"}
            stroke={isPaused ? "#F59E0B" : "#6366F1"}
            strokeWidth={2.5} opacity={0.95}
          />
          <text textAnchor="middle" y={6} fontSize={18}>🤖</text>
          <rect x={-26} y={24} width={52} height={16} rx={4} fill="#1F2937" opacity={0.82} />
          <text textAnchor="middle" y={36} fontSize={10} fontWeight={700} fill="white">SPOT-01</text>
        </g>
      </svg>
    </div>
  );
}
