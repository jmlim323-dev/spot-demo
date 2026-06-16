import { EVENT_CONFIGS } from "../constants";
import type { EventType } from "../types";

export interface TodoEvent {
  eventType: EventType;
  detectedAt: string;
  checks: Record<string, string>;
}

const HUMAN_CHECKS: Record<EventType, { id: string; label: string }[]> = {
  fire_extinguisher: [
    { id: "h1", label: "현장 출동 승인" },
    { id: "h2", label: "소화기 배치 확인" },
  ],
  server_room: [
    { id: "h1", label: "공조 긴급조치 승인" },
    { id: "h2", label: "온도 정상화 확인" },
  ],
  device_failure: [
    { id: "h1", label: "보조 Spot 투입 승인" },
    { id: "h2", label: "기기 복구 확인" },
    { id: "h3", label: "유지보수 티켓 생성" },
  ],
};

interface Props {
  todos: TodoEvent[];
  onOpenDetail: (eventType: EventType) => void;
}

export default function TodoList({ todos, onOpenDetail }: Props) {
  if (todos.length === 0) {
    return (
      <div style={{
        background: "#fff", borderRadius: 10, border: "1px solid #E5E7EB",
        padding: "10px 14px", flexShrink: 0,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontSize: 11, color: "#9CA3AF" }}>순찰 중 감지된 이벤트가 없습니다.</span>
      </div>
    );
  }

  return (
    <div style={{
      background: "#fff", borderRadius: 10, border: "1px solid #E5E7EB",
      padding: "10px 14px", flexShrink: 0,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 8 }}>
        📋 조치 필요 항목
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
        {todos.filter(todo => !!EVENT_CONFIGS[todo.eventType]).map(todo => {
            const cfg    = EVENT_CONFIGS[todo.eventType];
          if (!cfg) return null;
          const checks = HUMAN_CHECKS[todo.eventType] ?? [];
          const doneCount = checks.filter(c => todo.checks[c.id]).length;
          const allDone   = checks.length > 0 && doneCount === checks.length;

          return (
            <div
              key={todo.eventType}
              onClick={() => onOpenDetail(todo.eventType)}
              style={{
                background: allDone ? "#F0FDF4" : "#FFFBEB",
                border: `1px solid ${allDone ? "#86EFAC" : "#FCD34D"}`,
                borderRadius: 10, padding: "8px 12px",
                cursor: "pointer", minWidth: 200, flex: "1 1 200px",
                transition: "all 0.2s",
              }}
            >
              {/* 이벤트 헤더 */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 16 }}>{cfg.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{cfg.title}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 10, color: "#9CA3AF" }}>{todo.detectedAt}</span>
                  {allDone
                    ? <span style={{ fontSize: 10, fontWeight: 700, color: "#065F46", background: "#D1FAE5", padding: "1px 8px", borderRadius: 10 }}>완료</span>
                    : <span style={{ fontSize: 10, fontWeight: 700, color: "#92400E", background: "#FEF3C7", padding: "1px 8px", borderRadius: 10 }}>{doneCount}/{checks.length}</span>
                  }
                </div>
              </div>

              {/* 체크리스트 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {checks.map(c => {
                  const done = !!todo.checks[c.id];
                  return (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{
                        width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                        border: `1.5px solid ${done ? "#10B981" : "#D1D5DB"}`,
                        background: done ? "#10B981" : "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, color: "#fff",
                      }}>
                        {done ? "✓" : ""}
                      </span>
                      <span style={{ fontSize: 11, color: done ? "#6B7280" : "#374151", textDecoration: done ? "line-through" : "none" }}>
                        {c.label}
                      </span>
                      {done && <span style={{ fontSize: 9, color: "#9CA3AF", marginLeft: "auto" }}>{todo.checks[c.id]}</span>}
                    </div>
                  );
                })}
              </div>

              <div style={{ fontSize: 10, color: "#6366F1", marginTop: 6, textAlign: "right" }}>
                상세 보기 →
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
