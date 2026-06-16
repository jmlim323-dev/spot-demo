import { useState, useEffect } from "react";
import { btn, infoBlock, metricCard } from "../../styles";

interface Props {
  onAction: (action: string) => void;
}

const SENSOR_FIELDS = [
  ["위치",     "중앙 싱크대 — B-01"],
  ["최초 감지", "13:39:20"],
  ["카메라",   "열화상 + 광학 복합"],
  ["센서 신호", "정상 수신 중"],
] as const;

const ACTIONS = [
  { label: "시설 담당자 알림", color: "#6366F1", key: "notify"  },
  { label: "급수 차단 요청",  color: "#EF4444", key: "shutoff" },
  { label: "미션 재개",       color: "#10B981", key: "resume"  },
] as const;

export default function HotWaterPanel({ onAction }: Props) {
  const [elapsed, setElapsed] = useState(187); // seconds, starts mid-event

  useEffect(() => {
    const t = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const liters = (elapsed * 0.12).toFixed(1);

  const metrics = [
    { label: "현재 온도",  value: "43.8℃",            sub: "기준: 40℃ 초과",  warn: true  },
    { label: "지속 시간",  value: `${mins}분 ${secs}초`, sub: "기준: 3분 초과",  warn: true  },
    { label: "예상 사용량", value: `${liters}L`,        sub: "누적 추정치",      warn: false },
  ] as const;

  return (
    <div>
      {/* Live metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {metrics.map(item => (
          <div key={item.label} style={metricCard(item.warn)}>
            <div style={{ fontSize: 11, color: "#6B7280" }}>{item.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: item.warn ? "#92400E" : "#166534", marginTop: 2 }}>
              {item.value}
            </div>
            <div style={{ fontSize: 11, color: item.warn ? "#B45309" : "#15803D", marginTop: 2 }}>
              {item.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Sensor info */}
      <div style={infoBlock.blue}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1E40AF", marginBottom: 6 }}>감지 정보</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {SENSOR_FIELDS.map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 11, color: "#93C5FD" }}>{k}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#1E3A8A" }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        {ACTIONS.map(a => (
          <button key={a.key} onClick={() => onAction(a.key)} style={btn.action(a.color)}>
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
