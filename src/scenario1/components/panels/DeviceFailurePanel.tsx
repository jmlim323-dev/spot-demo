import { useState, useEffect } from "react";
import EventImageViewer from "../EventImageViewer";
import { downloadReport } from "../../lib/generateReport";
import { infoBlock } from "../../styles";

interface Props {
  onAction: (action: string) => void;
  onCheckDone?: (eventType: import("../../types").EventType, checkId: string, time: string) => void;
  onDeploySpot?: () => void;
  detectedAt?: string;
  initialCompleted?: Record<string, string>;
}

const HUMAN_STEPS = [
  { id: "h1", label: "보조 Spot 투입 승인",  desc: "AI가 SPOT-03을 현장에 투입하도록 요청합니다. 승인하시겠습니까?", isSpot: true },
  { id: "h2", label: "기기 복구 확인",        desc: "컴프레서 #3이 정상 동작하고 있습니까?" },
  { id: "h3", label: "유지보수 티켓 생성",    desc: "Boston Dynamics 서포트 티켓을 생성합니다.", isTicket: true },
] as const;

function nowHMS() {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2,"0")).join(":");
}

// ─── 티켓 모달 ────────────────────────────────────────────────────────────────
function TicketModal({ detectedAt, onClose }: { detectedAt: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showKo, setShowKo] = useState(false);

  const TICKET_STEPS = ["이벤트 로그 수집 중...", "기기 정보 조회 중...", "티켓 양식 자동 작성 중...", "완료!"];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStep(p => {
        if (p >= TICKET_STEPS.length - 1) { clearInterval(interval); setTimeout(() => setLoading(false), 400); return p; }
        return p + 1;
      });
    }, 450);
    return () => clearInterval(interval);
  }, []);

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const lastNormalTime = (() => { const d = new Date(Date.now()-11*60*1000); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; })();

  const subject = `[CUSTOMER] Spot SPOT-01 — Compressor #3 Fails to Respond (Health Check Failure)`;
  const description = `[Issue Summary]
SPOT-01 detected a device failure during scheduled patrol on ${dateStr}.
Compressor #3 (Location: Server Room C-05) has been unresponsive since ${detectedAt || now.toLocaleTimeString('ko-KR')}.

[Observed Symptoms]
- Health check failed: No response from Compressor #3
- Error Code: E-0x4A2
- Last normal response: ${lastNormalTime}
- Remote restart attempted: No response

[Environment]
- Robot: SPOT-01
- Software: Vantiq × Spot Patrol System
- Location: 설비실 C-05

[Attachments]
- Patrol camera image attached
- Vantiq event log available upon request`;

  const subjectKo = `[고객] Spot SPOT-01 — 컴프레서 #3 응답 불가 (헬스체크 실패)`;
  const descriptionKo = `[이슈 요약]
SPOT-01이 ${dateStr} 정기 순찰 중 기기 장애를 감지하였습니다.
컴프레서 #3 (위치: 설비실 C-05)이 ${detectedAt || now.toLocaleTimeString('ko-KR')}부터 응답하지 않고 있습니다.

[증상]
- 헬스체크 실패 · 오류 코드: E-0x4A2
- 마지막 정상 응답: ${lastNormalTime}
- 원격 재시작 시도: 응답 없음

[첨부파일]
- 순찰 카메라 이미지 첨부
- Vantiq 이벤트 로그 요청 시 제공 가능`;

  const handleCopy = (text: string) => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
      <div onClick={e => e.stopPropagation()} style={{ position: "relative", zIndex: 1, background: "#fff", borderRadius: 14, width: 560, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>🎫 Boston Dynamics 서포트 티켓</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setShowKo(p => !p)} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1px solid ${showKo ? "#6366F1" : "#E5E7EB"}`, background: showKo ? "#EEF2FF" : "#fff", color: showKo ? "#6366F1" : "#6B7280" }}>
              {showKo ? "🇺🇸 English" : "🇰🇷 한국어"}
            </button>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "#F3F4F6", cursor: "pointer", fontSize: 14, color: "#6B7280" }}>✕</button>
          </div>
        </div>
        {loading ? (
          <div style={{ padding: "32px 0", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>🎫</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#6366F1", marginBottom: 20 }}>티켓 양식 자동 생성 중...</div>
            <div style={{ background: "#E5E7EB", borderRadius: 99, height: 6, marginBottom: 16, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 99, background: "#6366F1", width: `${((loadingStep+1)/TICKET_STEPS.length)*100}%`, transition: "width 0.4s ease" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start", maxWidth: 260, margin: "0 auto" }}>
              {TICKET_STEPS.map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, background: i <= loadingStep ? "#6366F1" : "#E5E7EB", color: i <= loadingStep ? "#fff" : "#9CA3AF", transition: "all 0.3s" }}>
                    {i < loadingStep ? "✓" : i === loadingStep ? "·" : ""}
                  </span>
                  <span style={{ color: i <= loadingStep ? "#374151" : "#9CA3AF" }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div style={{ background: "#EFF6FF", borderRadius: 8, padding: "10px 12px", marginBottom: 16, fontSize: 11, color: "#1E40AF" }}>
              {showKo ? "한국어 번역본입니다. 실제 제출은 영문 양식을 사용하세요." : "아래 내용을 복사하여 Boston Dynamics 서포트 폼에 붙여넣기 하세요."}
              <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <span>🔗 접수 링크:</span>
                <a href="https://support.bostondynamics.com/s/" target="_blank" rel="noreferrer" style={{ color: "#2563EB", fontWeight: 700, textDecoration: "underline" }}>support.bostondynamics.com</a>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                <span>Subject</span>
                <button onClick={() => handleCopy(showKo ? subjectKo : subject)} style={{ padding: "3px 10px", borderRadius: 6, border: "1px solid #E5E7EB", background: "#fff", fontSize: 11, cursor: "pointer", color: "#6366F1" }}>복사</button>
              </div>
              <div style={{ background: "#F9FAFB", borderRadius: 8, padding: "10px 12px", border: "1px solid #E5E7EB", fontSize: 12, color: "#374151", fontFamily: "monospace" }}>{showKo ? subjectKo : subject}</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                <span>Description</span>
                <button onClick={() => handleCopy(showKo ? descriptionKo : description)} style={{ padding: "3px 10px", borderRadius: 6, border: "1px solid #E5E7EB", background: "#fff", fontSize: 11, cursor: "pointer", color: "#6366F1" }}>복사</button>
              </div>
              <pre style={{ background: "#F9FAFB", borderRadius: 8, padding: "10px 12px", border: "1px solid #E5E7EB", fontSize: 11, color: "#374151", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, fontFamily: "monospace", lineHeight: 1.6 }}>{showKo ? descriptionKo : description}</pre>
            </div>
            <button onClick={() => handleCopy(showKo ? `제목: ${subjectKo}\n\n설명:\n${descriptionKo}` : `Subject: ${subject}\n\nDescription:\n${description}`)} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: copied ? "#10B981" : "#6366F1", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {copied ? "✓ 전체 복사 완료!" : "📋 전체 내용 복사"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── 메인 패널 ────────────────────────────────────────────────────────────────
export default function DeviceFailurePanel({ onAction, onDeploySpot, detectedAt = '', initialCompleted = {} , onCheckDone }: Props) {
  const [agentDone, setAgentDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem("spot_agent_device_failure") ?? "false"); } catch { return false; }
  });
  const [agentStep, setAgentStep] = useState(0);
  const [humanDone, setHumanDone] = useState<Record<string,string>>(initialCompleted);
  const [showTicket, setShowTicket] = useState(false);

  const AGENT_STEPS = [
    { icon: "🔄", label: "헬스체크 재시도 완료 — 응답 없음",         done: agentStep > 0 },
    { icon: "🔌", label: "원격 재시작 시도 완료 — 응답 없음",         done: agentStep > 1 },
    { icon: "📋", label: "기기 장애 리포트 초안 작성 완료",            done: agentStep > 2 },
    { icon: "📨", label: "설비 관리팀 긴급 알림 자동 발송 완료",       done: agentStep > 3 },
  ];

  useEffect(() => {
    if (agentDone) return;
    const t = setInterval(() => {
      setAgentStep(p => {
        if (p >= AGENT_STEPS.length) { clearInterval(t); setAgentDone(true); try { localStorage.setItem("spot_agent_device_failure", "true"); } catch {} return p; }
        return p + 1;
      });
    }, 600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setHumanDone(initialCompleted);
    if (initialCompleted?.h1) {}
    if (initialCompleted?.h3) {}
  }, [JSON.stringify(initialCompleted)]);

  const allHumanDone = HUMAN_STEPS.every(s => humanDone[s.id]);

  const handleHuman = (id: string) => {
    const time = nowHMS();
    const next = { ...humanDone, [id]: time };
    setHumanDone(next);
    onCheckDone?.("device_failure", id, time);
    if (id === "h1" && onDeploySpot) onDeploySpot();
    if (id === "h3") setShowTicket(true);
    try {
      const raw = localStorage.getItem("spot_event_history");
      const records = raw ? JSON.parse(raw) : [];
      const idx = records.findIndex((r: any) => r.eventType === "device_failure");
      const steps = HUMAN_STEPS.filter(s => next[s.id]).map(s => ({ id: s.id, icon: "👤", label: s.label, desc: s.desc, completedAt: next[s.id] }));
      const rec = { eventType: "device_failure", title: "기기 동작 불가", icon: "⚠️", location: "기기 고장", detectedAt, completedAt: next["h3"] ?? "", steps };
      if (idx >= 0) records[idx] = rec; else records.push(rec);
      localStorage.setItem("spot_event_history", JSON.stringify(records));
    } catch {}
  };

  const lastNormal = (() => { const d = new Date(Date.now()-11*60*1000); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`; })();
  const captionTime = nowHMS();

  return (
    <div>
      <EventImageViewer src="/device_placeholder.jpg" alt="기기 고장" caption="SPOT-01 카메라 · 설비실 C-05" timestamp={captionTime} />

      <div style={{ ...infoBlock.red, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 16 }}>🔴</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#991B1B" }}>기기 응답 없음</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {[["기기명","컴프레서 #3"],["오류 코드","E-0x4A2"],["마지막 정상 응답", lastNormal],["위치","설비실 — C-05"]].map(([k,v]) => (
            <div key={k}>
              <div style={{ fontSize: 10, color: "#FCA5A5" }}>{k}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#7F1D1D" }}>{v}</div>
            </div>
          ))}
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
            <span style={{ width: 18, height: 18, borderRadius: "50%", background: s.done ? "#8B5CF6" : "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", flexShrink: 0 }}>{s.done ? "✓" : ""}</span>
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
                ? <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, color: "#10B981", fontWeight: 700 }}>{humanDone[s.id]}</span>
                    {"isTicket" in s && s.isTicket && (
                      <button onClick={() => setShowTicket(true)} style={{ padding: "2px 8px", borderRadius: 5, border: "1px solid #6366F1", background: "#EEF2FF", color: "#6366F1", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>티켓 보기</button>
                    )}
                    {"isSpot" in s && s.isSpot && onDeploySpot && (
                      <button onClick={onDeploySpot} style={{ padding: "2px 8px", borderRadius: 5, border: "1px solid #C4B5FD", background: "#F5F3FF", color: "#5B21B6", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>현황 보기</button>
                    )}
                  </div>
                : <button onClick={() => handleHuman(s.id)} disabled={!canAct} style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: canAct ? "#F59E0B" : "#E5E7EB", color: canAct ? "#fff" : "#9CA3AF", fontSize: 11, fontWeight: 700, cursor: canAct ? "pointer" : "not-allowed", flexShrink: 0 }}>확인</button>
              }
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button
            onClick={() => downloadReport({
              eventType: "device_failure",
              title: "기기 동작 불가",
              icon: "⚠️",
              location: "기기 고장",
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

      {showTicket && <TicketModal detectedAt={detectedAt} onClose={() => setShowTicket(false)} />}
    </div>
  );
}
