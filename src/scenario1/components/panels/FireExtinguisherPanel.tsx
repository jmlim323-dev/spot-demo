import { useState, useEffect } from "react";
import EventImageViewer from "../EventImageViewer";
import { downloadReport } from "../../lib/generateReport";

interface Props {
  onAction: (action: string) => void;
  onCheckDone?: (eventType: import("../../types").EventType, checkId: string, time: string) => void;
  detectedAt?: string;
  initialCompleted?: Record<string, string>;
}

interface AgentStep {
  icon: string;
  label: string;
  done: boolean;
}

const HUMAN_STEPS = [
  { id: "h1", label: "현장 출동 승인",    desc: "AI 분석 결과를 확인하고 담당자 출동을 승인하세요." },
  { id: "h2", label: "소화기 배치 완료 확인", desc: "담당자가 소화기를 지정 위치에 배치하였습니까?" },
] as const;

function nowHMS() {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2,"0")).join(":");
}

export default function FireExtinguisherPanel({ onAction, detectedAt = '', initialCompleted = {} , onCheckDone }: Props) {
  const [agentDone, setAgentDone]   = useState(() => {
    try { return JSON.parse(localStorage.getItem("spot_agent_fire_extinguisher") ?? "false"); } catch { return false; }
  });
  const [agentStep, setAgentStep]   = useState(() => {
    try { return agentDone ? 99 : 0; } catch { return 0; }
  });
  const [humanDone, setHumanDone]   = useState<Record<string,string>>(initialCompleted);

  const AGENT_STEPS: AgentStep[] = [
    { icon: "📷", label: "현장 이미지 수집 완료",         done: agentStep > 0 },
    { icon: "🔍", label: "소화기 미배치 판정 완료",        done: agentStep > 1 },
    { icon: "📋", label: "사고 리포트 초안 작성 완료",     done: agentStep > 2 },
    { icon: "📨", label: "시설 담당자 알림 자동 발송 완료", done: agentStep > 3 },
  ];

  useEffect(() => {
    if (agentDone) return;
    const t = setInterval(() => {
      setAgentStep(p => {
        if (p >= AGENT_STEPS.length) {
          clearInterval(t);
          setAgentDone(true);
          return p;
        }
        return p + 1;
      });
    }, 600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setHumanDone(initialCompleted);
  }, [JSON.stringify(initialCompleted)]);

  const allHumanDone = HUMAN_STEPS.every(s => humanDone[s.id]);

  const handleHuman = (id: string) => {
    const time = nowHMS();
    const next = { ...humanDone, [id]: time };
    setHumanDone(next);
    onCheckDone?.("fire_extinguisher", id, time);
    // localStorage 저장
    try {
      const raw = localStorage.getItem("spot_event_history");
      const records = raw ? JSON.parse(raw) : [];
      const idx = records.findIndex((r: any) => r.eventType === "fire_extinguisher");
      const steps = HUMAN_STEPS.filter(s => next[s.id]).map(s => ({ id: s.id, icon: "👤", label: s.label, desc: s.desc, completedAt: next[s.id] }));
      const rec = { eventType: "fire_extinguisher", title: "소화기 미배치 감지", icon: "🧯", location: "소화기", detectedAt, completedAt: next["h2"] ?? "", steps };
      if (idx >= 0) records[idx] = rec; else records.push(rec);
      localStorage.setItem("spot_event_history", JSON.stringify(records));
    } catch {}
  };

  return (
    <div>
      {/* 이미지 비교 */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 8 }}>📸 이미지 비교 — 1시간 전 vs 현재</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#065F46", background: "#D1FAE5", border: "1px solid #6EE7B7", borderRadius: "6px 6px 0 0", padding: "4px 10px", textAlign: "center" }}>✅ 1시간 전 — 정상</div>
            <EventImageViewer src="/fire_normal.jpg" alt="정상" caption="SPOT-01 · 이전 순찰" timestamp={(() => { const d = new Date(Date.now()-3600000); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; })()} />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#991B1B", background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "6px 6px 0 0", padding: "4px 10px", textAlign: "center" }}>⚠️ 현재 — 미감지</div>
            <EventImageViewer src="/fire_abnormal.jpg" alt="미배치" caption="SPOT-01 · 현재 순찰" timestamp={detectedAt || nowHMS()} />
          </div>
        </div>
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

      {/* 사람 개입 포인트 */}
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
              eventType: "fire_extinguisher",
              title: "소화기 미배치 감지",
              icon: "🧯",
              location: "소화기",
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
