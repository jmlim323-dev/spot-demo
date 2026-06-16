import type { S2LogEntry } from "../types";

const PREFIX: Record<string, string> = {
  warn: "⚠ ", success: "✓ ", action: "→ ", error: "✗ ", info: "· ",
};
const COLOR: Record<string, string> = {
  warn: "#92400E", success: "#065F46", action: "#1E40AF", error: "#991B1B", info: "#374151",
};

export default function S2ActivityLog({ entries }: { entries: S2LogEntry[] }) {
  return (
    <div style={{ borderTop: "1px solid #E5E7EB", padding: "10px 16px", maxHeight: 280, overflowY: "auto", flexShrink: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 6 }}>활동 로그</div>
      {[...entries].reverse().map((e, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: "#9CA3AF", flexShrink: 0 }}>{e.time}</span>
          <span style={{ fontSize: 10, color: COLOR[e.type] ?? "#374151" }}>
            {PREFIX[e.type]}{e.msg}
          </span>
        </div>
      ))}
    </div>
  );
}
