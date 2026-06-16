import type { LogEntry } from "../types";
import { activityLog } from "../styles";

export interface AgentLogEntry {
  time: string;
  step: string;
  detail: string;
  type: "analyze" | "recommend" | "notify" | "complete";
}

const LOG_PREFIX: Record<string, string> = {
  warn: "⚠ ", success: "✓ ", action: "→ ", info: "· ",
};

const AGENT_ICON: Record<string, string> = {
  analyze:   "🔍",
  recommend: "💡",
  notify:    "📨",
  complete:  "✅",
};

const AGENT_COLOR: Record<string, string> = {
  analyze:   "#6366F1",
  recommend: "#F59E0B",
  notify:    "#3B82F6",
  complete:  "#10B981",
};

interface Props {
  entries: LogEntry[];
  agentEntries: AgentLogEntry[];
}

export default function ActivityLog({ entries, agentEntries }: Props) {
  return (
    <div style={{ borderTop: "none", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>

      {/* 좌: 활동 로그 */}
      <div style={{ flex: 1, borderBottom: "1px solid #F3F4F6", display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
        <div style={{ padding: "7px 12px", borderBottom: "1px solid #F3F4F6", background: "#FAFAFA", flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>📋 순찰 활동 로그</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
          {[...entries].reverse().map((e, i) => (
            <div key={i} style={activityLog.row}>
              <span style={{ ...activityLog.time, fontSize: 12 }}>{e.time}</span>
              <span style={{ ...activityLog.msgColor(e.type), fontSize: 12 }}>
                {LOG_PREFIX[e.type] ?? "· "}{e.msg}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 우: AI 자동 조치 이력 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
        <div style={{ padding: "7px 12px", borderBottom: "1px solid #F3F4F6", background: "#FAFAFA", flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#5B21B6" }}>🤖 AI 자동 조치 이력</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
          {agentEntries.length === 0 ? (
            <div style={{ fontSize: 11, color: "#9CA3AF", textAlign: "center", paddingTop: 16 }}>
              이벤트 발생 시 AI가 자동으로 분석을 시작합니다.
            </div>
          ) : (
            [...agentEntries].reverse().map((e, i) => (
              <div key={i} style={{ display: "flex", gap: 7, marginBottom: 8, alignItems: "flex-start" }}>
                <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{AGENT_ICON[e.type]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2, gap: 4 }}>
                    <div style={{ flex: 1 }}>
                      {e.step.startsWith("[") && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#8B5CF6", background: "#F5F3FF", padding: "1px 6px", borderRadius: 8, marginRight: 5 }}>
                          {e.step.match(/\[.*?\]/)?.[0]}
                        </span>
                      )}
                      <span style={{ fontSize: 12, fontWeight: 600, color: AGENT_COLOR[e.type] }}>
                        {e.step.replace(/\[.*?\]\s*/, "")}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: "#9CA3AF", flexShrink: 0 }}>{e.time}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#374151", lineHeight: 1.4 }}>{e.detail}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
