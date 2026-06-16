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
        padding: "10px 16px", flexShrink: 0,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontSize: 12, color: "#9CA3AF" }}>순찰 중 감지된 이벤트가 없습니다.</span>
      </div>
    );
  }

  return (
    <div style={{
      background: "#fff", borderRadius: 10, border: "1px solid #E5E7EB",
      padding: "10px 16px", flexShrink: 0,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>
        📋 조치 필요 항목
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
        {todos.filter(t => !!EVENT_CONFIGS[t.eventType]).map(todo => {
          const cfg    = EVENT_CONFIGS[todo.eventType];
          const checks = HUMAN_CHECKS[todo.eventType] ?? [];
          const doneCount = checks.filter(c => todo.checks[c.id]).length;
          const allDone   = checks.length > 0 && doneCount === checks.length;

          return (
            <div
              key={todo.eventType}
              onClick={() => onOpenDetail(todo.eventType)}
              style={{
                background: allDone ? "#F0FDF4" : "#FFFBEB",
                border: `1.5px solid ${allDone ? "#86EFAC" : "#FCD34D"}`,
                borderRadius: 10, padding: "10px 14px",
                cursor: "pointer", flex: "1 1 220px",
                transition: "box-shadow 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.10)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
            >
              {/* 헤더 */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 18 }}>{cfg.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{cfg.title}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>{todo.detectedAt}</span>
                  {allDone
                    ? <span style={{ fontSize: 11, fontWeight: 700, color: "#065F46", background: "#D1FAE5", padding: "2px 8px", borderRadius: 10 }}>완료</span>
                    : <span style={{ fontSize: 11, fontWeight: 700, color: "#92400E", background: "#FEF3C7", padding: "2px 8px", borderRadius: 10 }}>{doneCount}/{checks.length} 완료</span>
                  }
                </div>
              </div>

              {/* 조치 태그 */}
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5, marginBottom: 8 }}>
                {checks.map(c => {
                  const done = !!todo.checks[c.id];
                  return (
                    <span key={c.id} style={{
                      fontSize: 11, padding: "3px 10px", borderRadius: 20,
                      background: done ? "#D1FAE5" : "#F3F4F6",
                      color: done ? "#065F46" : "#6B7280",
                      fontWeight: done ? 600 : 400,
                      textDecoration: done ? "line-through" : "none",
                    }}>
                      {done ? "✓ " : ""}{c.label}
                    </span>
                  );
                })}
              </div>

              <div style={{ fontSize: 11, color: "#6366F1", fontWeight: 600, textAlign: "right" }}>
                상세 보기 →
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
