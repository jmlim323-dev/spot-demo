import type { MissionStatus } from "../types";
import { STATUS_META } from "../constants";

interface StatusBadgeProps {
  status: MissionStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const s = STATUS_META[status];
  return (
    <span style={{
      padding: "3px 10px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      color: s.color,
      background: s.bg,
      border: `1px solid ${s.color}33`,
    }}>
      {s.text}
    </span>
  );
}
