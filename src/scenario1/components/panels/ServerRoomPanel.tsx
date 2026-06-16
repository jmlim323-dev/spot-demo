import { useState, useEffect } from "react";
import EventImageViewer from "../EventImageViewer";
import { downloadReport } from "../../lib/generateReport";
import { metricCard } from "../../styles";

interface Props {
  onAction: (action: string) => void;
  onCheckDone?: (eventType: import("../../types").EventType, checkId: string, time: string) => void;
  detectedAt?: string;
  initialCompleted?: Record<string, string>;
}

const HUMAN_STEPS = [
  { id: "h1", label: "공조 긴급조치 승인",  desc: "AI가 HVAC 긴급 냉각 모드 전환을 요청합니다. 승인하시겠습니까?" },
  { id: "h2", label: "온도 정상화 확인",    desc: "서버룸 온도가 정상 범위(40℃ 이하)로 복귀하였습니까?" },
] as const;

function nowHMS() {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2,"0")).join(":");
}

export default function ServerRoomPanel({ onAction, detectedAt = '', initialCompleted = {} , onCheckDone }: Props) {
  const [agentDone, setAgentDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem("spot_agent_server_room") ?? "false"); } catch { return false; }
  });
  const [agentStep, setAgentStep] = useState(0);
  const [humanDone, setHumanDone] = useState<Record<string,string>>(initialCompleted);
  const [temp, setTemp] = useState(72.4);

  const AGENT_STEPS = [
    { icon: "🌡️", label: "열화상 데이터 수집 완료",          done: agentStep > 0 },
    { icon: "🔍", label: "기준 온도 초과 판정 완료 (임계치 +32.4℃)", done: agentStep > 1 },
    { icon: "📋", label: "서버룸 이상 리포트 초안 작성 완료",  done: agentStep > 2 },
    { icon: "📨", label: "데이터센터 관리팀 긴급 알림 발송 완료", done: agentStep > 3 },
  ];

  useEffect(() => {
    if (agentDone) return;
    const t = setInterval(() => {
      setAgentStep(p => {
        if (p >= AGENT_STEPS.length) { clearInterval(t); setAgentDone(true); try { localStorage.setItem("spot_agent_server_room", "true"); } catch {} return p; }
        return p + 1;
      });
    }, 600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { setHumanDone(initialCompleted); }, [JSON.stringify(initialCompleted)]);
  useEffect(() => { const t = setInterval(() => setTemp(p => Math.min(98.7, +(p+0.1).toFixed(1))), 1000); return () => clearInterval(t); }, []);

  const allHumanDone = HUMAN_STEPS.every(s => humanDone[s.id]);

  const handleHuman = (id: string) => {
    const time = nowHMS();
    const next = { ...humanDone, [id]: time };
    setHumanDone(next);
    onCheckDone?.("server_room", id, time);
    try {
      const raw = localStorage.getItem("spot_event_history");
      const records = raw ? JSON.parse(raw) : [];
      const idx = records.findIndex((r: any) => r.eventType === "server_room");
      const steps = HUMAN_STEPS.filter(s => next[s.id]).map(s => ({ id: s.id, icon: "👤", label: s.label, desc: s.desc, completedAt: next[s.id] }));
      const rec = { eventType: "server_room", title: "서버룸 온도 이상 감지", icon: "🌡️", location: "서버룸", detectedAt, completedAt: next["h2"] ?? "", steps };
      if (idx >= 0) records[idx] = rec; else records.push(rec);
      localStorage.setItem("spot_event_history", JSON.stringify(records));
    } catch {}
  };

  const captionTime = nowHMS();

  return (
    <div>
      <EventImageViewer src="/thermal.jpg" alt="서버룸 열화상" caption="FLIR T865 열화상 · Rack B-03" timestamp={captionTime} />

      {/* 온도 메트릭 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[
          { label: "최고 온도",  value: `${temp.toFixed(1)}℃`, sub: `기준 대비 +${(temp-40).toFixed(1)}℃`, warn: true },
          { label: "평균 온도",  value: `${(temp*0.78).toFixed(1)}℃`, sub: "정상 범위 초과", warn: true },
          { label: "감지 위치",  value: "Rack B-03", sub: "서버룸 3번 랙", warn: false },
        ].map(m => (
          <div key={m.label} style={metricCard(m.warn)}>
            <div style={{ fontSize: 10, color: "#6B7280", marginBottom: 2 }}>{m.label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: m.warn ? "#991B1B" : "#111827" }}>{m.value}</div>
            <div style={{ fontSize: 10, color: m.warn ? "#B45309" : "#6B7280", marginTop: 2 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* AI 자동 처리 */}
      <div style={{ background: "#F5F3FF", borderRadius: 10, padding: "12px 14px", border: "1px solid #C4B5FD", marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#5B21B6", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          🤖 AI 에이전트 자동 처리
          {!agentDone && <span style={{ fontSize: 10, color: "#8B5CF6" }}>처리 중...</span>}
          {agentDone  && <span style={{ fontSize: 10, color: "#10B981", fontWeight: 700 }}>✓ 완료</span>}
        </div>
        {AGENT_STEPS.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, opacity: s.done ? 1 : 0.35, transition: "opacity 0.4s" }}>
            <span style={{ width: 18, height: 18, borderRadius: "50%", background: s.done ? "#8B5CF6" : "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", flexShrink: 0 }}>
              {s.done ? "✓" : ""}
            </span>
            <span style={{ fontSize: 11, color: s.done ? "#374151" : "#9CA3AF" }}>{s.icon} {s.label}</span>
          </div>
        ))}
      </div>

      {/* 사람 개입 */}
      <div style={{ background: "#FFFBEB", borderRadius: 10, padding: "12px 14px", border: "1px solid #FCD34D", marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#92400E", marginBottom: 10 }}>👤 담당자 확인 필요</div>
        {HUMAN_STEPS.map((s, i) => {
          const done = !!humanDone[s.id];
          const canAct = agentDone && !done;
          return (
            <div key={s.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < HUMAN_STEPS.length-1 ? 10 : 0, opacity: !agentDone ? 0.4 : 1, transition: "opacity 0.3s" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: done ? "#10B981" : "#FCD34D", color: done ? "#fff" : "#92400E", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                {done ? "✓" : i+1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#111827", marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "#6B7280" }}>{s.desc}</div>
              </div>
              {done
                ? <span style={{ fontSize: 10, color: "#10B981", fontWeight: 700, flexShrink: 0 }}>{humanDone[s.id]}</span>
                : <button onClick={() => handleHuman(s.id)} disabled={!canAct} style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: canAct ? "#F59E0B" : "#E5E7EB", color: canAct ? "#fff" : "#9CA3AF", fontSize: 11, fontWeight: 700, cursor: canAct ? "pointer" : "not-allowed", flexShrink: 0 }}>확인</button>
              }
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button
            onClick={() => downloadReport({
              eventType: "server_room",
              title: "서버룸 온도 이상 감지",
              icon: "🌡️",
              location: "서버룸",
              detectedAt: detectedAt,
              completedAt: humanDone[HUMAN_STEPS[HUMAN_STEPS.length-1].id] ?? "",
              steps: HUMAN_STEPS.filter(s => humanDone[s.id]).map(s => ({
                id: s.id, icon: "👤", label: s.label, desc: s.desc, completedAt: humanDone[s.id],
              })),
            })}
            style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "1px solid #6366F1", background: "#fff", color: "#6366F1", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            📄 리포트 다운로드
          </button>
          <button onClick={() => onAction("resume")} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: "#10B981", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            ✅ 조치 완료 — 미션 재개
          </button>
      </div>
    </div>
  );
}
