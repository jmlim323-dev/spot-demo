import { useState, useRef, useEffect } from "react";

import type { EventType, MissionStatus, ActionStep, SpotPosition, LogEntry } from "./types";
import {
  PATROL_PATH, EVENT_CONFIGS, SEVERITY_LABEL,
  FLOW_STEPS, ACTION_LABELS,
} from "./constants";
import {
  layout, card, text, btn, banner,
  eventHeader, toast as toastStyle,
} from "./styles";

import FlowStep              from "./components/FlowStep";
import StatusBadge           from "./components/StatusBadge";
import PatrolMap             from "./components/PatrolMap";
import ActivityLog, { AgentLogEntry } from "./components/ActivityLog";
import TodoList, { TodoEvent } from "./components/TodoList";
import FireExtinguisherPanel from "./components/panels/FireExtinguisherPanel";
import ServerRoomPanel       from "./components/panels/ServerRoomPanel";
import DeviceFailurePanel    from "./components/panels/DeviceFailurePanel";
import SpotScenario2           from "../scenario2/SpotScenario2";
import HistoryModal             from "./components/HistoryModal";
import { loadRecord, clearAllRecords } from "./lib/eventHistory";
import type { EventRecord }     from "./lib/eventHistory";

const EVENT_SEQUENCE: EventType[] = ["fire_extinguisher", "server_room", "device_failure"];

const EVENT_DESC: Record<EventType, string> = {
  fire_extinguisher: "소화기 거치대에서 소화기가 감지되지 않았습니다.",
  server_room:       "서버룸 Rack B-03에서 임계 온도를 초과하였습니다.",
  device_failure:    "설비실 기기에서 문제가 발생했습니다.",
};

function nowHMS(): string {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map(n => String(n).padStart(2, "0")).join(":");
}

// ─── localStorage에서 진행 상황 복원 ────────────────────────────────────────────
function loadSavedProgress(eventType: EventType): Record<string, string> {
  try {
    const rec = loadRecord(eventType);
    if (!rec) return {};
    return Object.fromEntries(rec.steps.map(s => [s.id, s.completedAt]));
  } catch {
    return {};
  }
}

// ─── 모달 컴포넌트 ────────────────────────────────────────────────────────────
function EventModal({
  activeEvent, eventSeqIdx, currentPointIdx, onAction, onClose, detectedAt, initialCompleted, onDeploySpot, onCheckDone,
}: {
  activeEvent: EventType;
  eventSeqIdx: number;
  currentPointIdx: number;
  onAction: (a: string, idx: number, nextEvIdx: number) => void;
  onClose: () => void;
  detectedAt: string;
  initialCompleted: Record<string, string>;
  onDeploySpot?: () => void;
  onCheckDone?: (eventType: EventType, checkId: string, time: string) => void;
}) {
  const cfg = EVENT_CONFIGS[activeEvent];
  const sev = SEVERITY_LABEL[cfg.severity];
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);

  const LOADING_STEPS = [
    "센서 데이터 수집 중...",
    "AI 이미지 분석 중...",
    "위험도 평가 중...",
    "조치 가이드 생성 중...",
  ];

  useEffect(() => {
    setLoading(true);
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep(p => {
        if (p >= LOADING_STEPS.length - 1) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 400);
          return p;
        }
        return p + 1;
      });
    }, 450);
    return () => clearInterval(interval);
  }, [activeEvent]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* 배경 딤 */}
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }}
      />

      {/* 모달 본체 */}
      <div style={{
        position: "relative", zIndex: 1,
        background: "#fff", borderRadius: 14,
        width: 480, maxHeight: "85vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        padding: 24,
      }}>
        {/* 헤더 */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 28 }}>{cfg.icon}</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{cfg.title}</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>
                {PATROL_PATH[cfg.triggerPoint].label} ·{" "}
                <span style={{ color: sev.color, fontWeight: 600 }}>위험도 {sev.text}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: "50%", border: "none",
            background: "#F3F4F6", cursor: "pointer", fontSize: 14, color: "#6B7280",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        {/* AI 분석 로딩 */}
        {loading ? (
          <div style={{ padding: "32px 0", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>🤖</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#6366F1", marginBottom: 20 }}>
              AI 에이전트 분석 중...
            </div>
            {/* 프로그레스 바 */}
            <div style={{ background: "#E5E7EB", borderRadius: 99, height: 6, marginBottom: 16, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 99, background: "#6366F1",
                width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%`,
                transition: "width 0.4s ease",
              }} />
            </div>
            {/* 단계 목록 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start", maxWidth: 280, margin: "0 auto" }}>
              {LOADING_STEPS.map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10,
                    background: i <= loadingStep ? "#6366F1" : "#E5E7EB",
                    color: i <= loadingStep ? "#fff" : "#9CA3AF",
                    transition: "all 0.3s",
                  }}>
                    {i < loadingStep ? "✓" : i === loadingStep ? "·" : ""}
                  </span>
                  <span style={{ color: i <= loadingStep ? "#374151" : "#9CA3AF", transition: "color 0.3s" }}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* 패널 내용 */}
        {activeEvent === "fire_extinguisher" && (
          <FireExtinguisherPanel
            onAction={(a) => { onAction(a, currentPointIdx, eventSeqIdx + 1); if (a === "resume") onClose(); }}
            detectedAt={detectedAt}
            initialCompleted={initialCompleted}
          />
        )}
        {activeEvent === "server_room" && (
          <ServerRoomPanel
            onAction={(a) => { onAction(a, currentPointIdx, eventSeqIdx + 1); if (a === "resume") onClose(); }}
            detectedAt={detectedAt}
            initialCompleted={initialCompleted}
          />
        )}
        {activeEvent === "device_failure" && (
          <DeviceFailurePanel
            onAction={(a) => { onAction(a, currentPointIdx, eventSeqIdx + 1); if (a === "resume") onClose(); }}
            detectedAt={detectedAt}
            initialCompleted={initialCompleted}
            onDeploySpot={onDeploySpot}
          />
        )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────
export default function SpotScenario1() {
  const [eventSeqIdx,     setEventSeqIdx]     = useState(0);
  const [activeEvent,     setActiveEvent]     = useState<EventType | null>(null);
  const [missionStatus,   setMissionStatus]   = useState<MissionStatus>("patrolling");
  const [actionStep,      setActionStep]      = useState<ActionStep>("monitoring");
  const [currentPointIdx, setCurrentPointIdx] = useState(0);
  const [spotPos,         setSpotPos]         = useState<SpotPosition>({ x: PATROL_PATH[0].x, y: PATROL_PATH[0].y, angle: 0 });
  const [toast,           setToast]           = useState<string | null>(null);
  const [isRunning,       setIsRunning]       = useState(false);
  const [missionComplete, setMissionComplete] = useState(false);
  const [showModal,       setShowModal]       = useState(false);
  const [showSpot2Modal,  setShowSpot2Modal]  = useState(false);
  const [showVideoModal,  setShowVideoModal]  = useState(false);
  const [historyRecord,   setHistoryRecord]   = useState<EventRecord | null>(null);
  const [detectedAt,      setDetectedAt]      = useState<string>("");
  const [completedEvents, setCompletedEvents] = useState<EventType[]>([]);
  const [todoEvents,      setTodoEvents]      = useState<TodoEvent[]>([]);
  // RAF 클로저 내에서 최신 todoEvents 참조를 위한 ref
  const syncTodoRef = (v: TodoEvent[]) => { todoEventsRef.current = v; return v; };
  const [activeEventForModal, setActiveEventForModal] = useState<EventType | null>(null);
  const [agentEntries,    setAgentEntries]    = useState<AgentLogEntry[]>([]);
  const [logEntries,      setLogEntries]      = useState<LogEntry[]>([
    { time: "13:40:00", msg: "SPOT-01 대기 중", type: "info" },
  ]);

  const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const todoEventsRef  = useRef<TodoEvent[]>([]);
  const cfg = activeEvent ? EVENT_CONFIGS[activeEvent] : null;

  const addAgentLog = (step: string, detail: string, type: AgentLogEntry["type"]) =>
    setAgentEntries(prev => [...prev.slice(-19), { time: nowHMS(), step, detail, type }]);

  const addLog = (msg: string, type: LogEntry["type"] = "info") =>
    setLogEntries(prev => [...prev.slice(-29), { time: nowHMS(), msg, type }]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const runPatrol = (fromIdx: number, nextEventIdx_param: number) => {
    // 기존 RAF 정리
    if (intervalRef.current) {
      try { (intervalRef.current as any).clear?.(); } catch {}
      intervalRef.current = null;
    }

    let nextEventIdx = nextEventIdx_param;
    let nextEvent = EVENT_SEQUENCE[nextEventIdx] ?? null;
    let triggerPt = nextEvent ? EVENT_CONFIGS[nextEvent].triggerPoint : PATROL_PATH.length;

    // 총 2분(120초)을 남은 세그먼트 수로 나눔
    const remainingSegs = PATROL_PATH.length - fromIdx - 1;
    const msPerSeg = remainingSegs > 0 ? 120000 / remainingSegs : 120000;
    const CHECKPOINT_PAUSE = 800; // 체크포인트마다 잠깐 멈추는 시간(ms)

    let currentIdx = fromIdx;
    let segStart = performance.now();
    let rafId: number;

    const tick = (now: number) => {
      const elapsed = now - segStart;
      const raw = Math.min(elapsed / msPerSeg, 1);
      // easeInOut
      const t = raw < 0.5 ? 2 * raw * raw : -1 + (4 - 2 * raw) * raw;

      const from = PATROL_PATH[currentIdx];
      const toIdx = Math.min(currentIdx + 1, PATROL_PATH.length - 1);
      const to = PATROL_PATH[toIdx];

      setSpotPos({
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
        angle: 0,
      });

      if (raw < 1) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      // 세그먼트 완료
      const next = currentIdx + 1;

      if (next >= PATROL_PATH.length) {
        setCurrentPointIdx(PATROL_PATH.length - 1);
        setSpotPos({ x: PATROL_PATH[PATROL_PATH.length - 1].x, y: PATROL_PATH[PATROL_PATH.length - 1].y, angle: 0 });
        setIsRunning(false);
        setMissionComplete(true);
        setMissionStatus("resumed");
        setActionStep("mission_resumed");
        addLog("순찰 미션 완료", "success");
        addAgentLog("리포트 생성", "전체 순찰 결과 리포트 작성 완료 — 담당자 이메일 발송", "complete");
        showToast("✅ 순찰 미션이 완료되었습니다.");
        return;
      }

      currentIdx = next;
      setCurrentPointIdx(next);
      segStart = now;

      if (next === triggerPt && nextEvent) {
        // 미션 멈추지 않고 계속 — AI가 자동 처리 후 투두 추가
        const ev = EVENT_CONFIGS[nextEvent];
        const detectedTime = nowHMS();
        setDetectedAt(detectedTime);
        // 감지된 이벤트를 투두리스트에 추가 (유효한 EventType만)
        const validTypes = ["fire_extinguisher", "server_room", "device_failure"];
        if (validTypes.includes(nextEvent)) {
          // ref로 최신 state 직접 읽기 (stale closure 방지)
          const current = todoEventsRef.current;
          if (!current.find(t => t.eventType === nextEvent)) {
            const updated = [...current, { eventType: nextEvent as EventType, detectedAt: detectedTime, checks: {} }];
            todoEventsRef.current = updated;
            setTodoEvents(updated);
          }
        }
        addLog(`이상 감지: ${ev.title} — AI 자동 처리 시작`, "warn");
        showToast(`⚠️ ${ev.title} 감지 — 계속 순찰 중`);
        // AI 자동 조치 로그 순차 기록
        setTimeout(() => addAgentLog("이상 탐지", `${ev.title} 감지 — 카메라·센서 데이터 수집 완료`, "analyze"), 500);
        setTimeout(() => addAgentLog("원인 분석", "AI 모델 추론 완료 — 즉각 조치 필요", "analyze"), 2000);
        setTimeout(() => addAgentLog("담당자 알림", `시설 관리팀 ${ev.icon} 알림 발송 완료`, "notify"), 5000);
        // 다음 이벤트 인덱스로 업데이트하고 계속 순찰
        nextEventIdx = nextEventIdx + 1;
        const nextNextEvent = EVENT_SEQUENCE[nextEventIdx] ?? null;
        triggerPt = nextNextEvent ? EVENT_CONFIGS[nextNextEvent].triggerPoint : PATROL_PATH.length;
        nextEvent = nextNextEvent;
      }

      if (PATROL_PATH[next].isCheckpoint && PATROL_PATH[next].label) {
        addLog(`체크포인트 도착: ${PATROL_PATH[next].label}`, "info");
        // 체크포인트에서 잠깐 멈춤
        setTimeout(() => {
          segStart = performance.now();
          rafId = requestAnimationFrame(tick);
        }, CHECKPOINT_PAUSE);
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    intervalRef.current = { clear: () => cancelAnimationFrame(rafId) } as any;
  };

  const startPatrol = () => {
    setShowVideoModal(true);
  };

  const beginPatrol = () => {
    setShowVideoModal(false);
    setMissionStatus("patrolling");
    setActionStep("monitoring");
    setCurrentPointIdx(0);
    setEventSeqIdx(0);
    setActiveEvent(null);
    setMissionComplete(false);
    setShowModal(false);
    setSpotPos({ x: PATROL_PATH[0].x, y: PATROL_PATH[0].y, angle: 0 });
    setIsRunning(true);
    setLogEntries([{ time: nowHMS(), msg: "SPOT-01 순찰 미션 시작", type: "info" }]);
    runPatrol(0, 0);
  };

  const resumePatrol = (fromIdx: number, nextEventIdx: number) => {
    // completedEvents 먼저 업데이트 (activeEvent가 null되기 전에)
    setCompletedEvents(prev =>
      activeEvent ? [...prev.filter(e => e !== activeEvent), activeEvent] : prev
    );
    setMissionStatus("patrolling");
    setActionStep("monitoring");
    setActiveEvent(null);
    setShowModal(false);
    setIsRunning(true);
    addLog("미션 재개 — 순찰 계속", "info");
    addAgentLog("조치 완료", "이벤트 처리 완료 — 미션 재개 승인됨", "complete");
    runPatrol(fromIdx, nextEventIdx);
  };

  const handleAction = (action: string, currentIdx: number, nextEvIdx: number) => {
    if (action === "deploy_spot") {
      setShowModal(false);
      setShowSpot2Modal(true);
      addLog("보조 Spot 투입 요청 — 다중 Spot 관제 화면 전환", "action");
      addAgentLog("보조 Spot 투입", "SPOT-01 기기 고장 대응 — 보조 Spot 투입 요청 전송", "notify");
      return;
    }
    const msg = ACTION_LABELS[action] ?? action;
    showToast(msg);
    if (action !== "resume") addLog(msg, "action");
    if (action === "resume") {
      resumePatrol(currentIdx, nextEvIdx);
    } else {
      setMissionStatus("responding");
      setActionStep("action_taken");
    }
  };

  const handleCheckDone = (eventType: EventType, checkId: string, time: string) => {
    setTodoEvents(prev => prev.map(t =>
      t.eventType === eventType
        ? { ...t, checks: { ...t.checks, [checkId]: time } }
        : t
    ));
  };

  const resetDemo = () => {
    if (intervalRef.current) { try { clearInterval(intervalRef.current as any); (intervalRef.current as any).clear?.(); } catch {} intervalRef.current = null; }

    setMissionStatus("patrolling");
    setActionStep("monitoring");
    setCurrentPointIdx(0);
    setEventSeqIdx(0);
    setActiveEvent(null);
    setMissionComplete(false);
    setShowModal(false);
    setShowSpot2Modal(false);
    setShowVideoModal(false);
    setSpotPos({ x: PATROL_PATH[0].x, y: PATROL_PATH[0].y, angle: 0 });
    setIsRunning(false);
    setAgentEntries([]);
    setCompletedEvents([]);
    setTodoEvents([]); todoEventsRef.current = [];
    setActiveEventForModal(null);
    setDetectedAt("");
    setHistoryRecord(null);
    clearAllRecords();
    // AI 에이전트 상태 초기화
    try {
      localStorage.removeItem("spot_agent_fire_extinguisher");
      localStorage.removeItem("spot_agent_server_room");
      localStorage.removeItem("spot_agent_device_failure");
    } catch {}
    setLogEntries([{ time: nowHMS(), msg: "데모 초기화됨", type: "info" }]);
  };

  const stepOrder   = FLOW_STEPS.map(s => s.key);
  const currentStep = stepOrder.indexOf(actionStep);
  const isPaused    = missionStatus === "paused" || missionStatus === "responding";

  return (
    <div style={layout.page}>

      {/* ── Flow bar ── */}
      <div style={{ ...layout.flowBar, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const }}>
          {FLOW_STEPS.map((s, i) => (
            <div key={s.key} style={{ display: "flex", alignItems: "center" }}>
              <FlowStep label={s.label} active={actionStep === s.key} done={currentStep > i} />
              {i < FLOW_STEPS.length - 1 && (
                <span style={{ color: "#D1D5DB", margin: "0 6px", fontSize: 14 }}>→</span>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <StatusBadge status={missionStatus} />
          <button onClick={resetDemo} style={btn.reset}>초기화</button>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div style={{ ...layout.mainGrid, minHeight: 0 }}>

        {/* Left pane */}
        <div style={layout.leftPane}>

          {/* 투두리스트 */}
          <TodoList
            todos={todoEvents}
            onOpenDetail={(evType) => {
              setShowModal(true);
              // 해당 이벤트 타입을 activeEvent로 임시 설정 (모달에서 보여줄 패널 결정)
              setActiveEventForModal(evType);
            }}
          />

          {/* Map card */}
          <div style={{ ...card.base, flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={card.header}>
              <span style={text.cardTitle}>현장 지도 — SPOT-01 경로</span>
              <div style={text.mapLegend}>
                <span><span style={{ display: "inline-block", width: 16, borderTop: "2px dashed #C7D2FE", verticalAlign: "middle", marginRight: 4 }} />계획 경로</span>
                <span><span style={{ display: "inline-block", width: 16, borderTop: "2px solid #6366F1", verticalAlign: "middle", marginRight: 4 }} />이동 완료</span>
              </div>
            </div>

            <div style={card.mapBody}>
              <PatrolMap
                spotPos={spotPos}
                currentPointIdx={currentPointIdx}
                activeEvent={(activeEvent ?? activeEventForModal)!}
                missionStatus={missionStatus}
                completedEvents={completedEvents}
                onMarkerClick={(evType) => {
                  const rec = loadRecord(evType);
                  const cfg2 = EVENT_CONFIGS[evType];
                  setHistoryRecord(rec ?? {
                    eventType: evType,
                    title: cfg2.title,
                    icon: cfg2.icon,
                    location: PATROL_PATH[cfg2.triggerPoint]?.label ?? "",
                    detectedAt: detectedAt,
                    completedAt: "",
                    steps: [],
                  });
                }}
              />
            </div>

            <div style={card.mapFooter}>
              {!isRunning && !missionComplete && actionStep === "monitoring" ? (
                <button onClick={startPatrol} style={btn.startPatrol}>▶ 순찰 시작</button>

              ) : missionComplete ? (
                <div style={banner.resumed}>
                  <span style={{ fontSize: 14 }}>✅</span>
                  <span style={{ fontSize: 12, color: "#166534", fontWeight: 600 }}>순찰 미션 완료</span>
                </div>

              ) : (
                <div style={{ fontSize: 12, color: "#6B7280", textAlign: "center" }}>순찰 진행 중...</div>
              )}
            </div>
          </div>
        </div>

        {/* Right pane — 로그 전용 */}
        <div style={{ ...layout.rightPane, flex: 1, minHeight: 0 }}>
          <ActivityLog entries={logEntries} agentEntries={agentEntries} />
        </div>
      </div>

      {/* ── 모달 ── */}
      {showModal && (activeEvent ?? activeEventForModal) && (
        <EventModal
          activeEvent={(activeEvent ?? activeEventForModal)!}
          eventSeqIdx={eventSeqIdx}
          currentPointIdx={currentPointIdx}
          onAction={handleAction}
          onClose={() => setShowModal(false)}
          detectedAt={detectedAt}
          initialCompleted={loadSavedProgress((activeEvent ?? activeEventForModal)!)}
          onDeploySpot={() => {
            setShowSpot2Modal(true);
            addLog("보조 Spot 투입 요청 — 다중 Spot 관제 화면 전환", "action");
            addAgentLog("보조 Spot 투입", "SPOT-01 기기 고장 대응 — 보조 Spot 투입 요청 전송", "notify");
          }}
          onCheckDone={handleCheckDone}
        />
      )}

      {/* ── 보조 Spot 투입 모달 ── */}
      {showSpot2Modal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 2000,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div onClick={() => setShowSpot2Modal(false)}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
          <div style={{
            position: "relative", zIndex: 1,
            width: "90vw", height: "85vh", maxWidth: 1100,
            background: "#F8FAFC", borderRadius: 16,
            boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
            overflow: "hidden", display: "flex", flexDirection: "column",
          }}>
            {/* 모달 헤더 */}
            <div style={{
              background: "#fff", borderBottom: "1px solid #E5E7EB",
              padding: "0 20px", height: 48, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 24, height: 24, background: "#8B5CF6", borderRadius: 6,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff" }}>V</div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>다중 Spot 관제</span>
                <span style={{ fontSize: 12, color: "#9CA3AF" }}>— 보조 Spot 투입 대응</span>
              </div>
              <button onClick={() => setShowSpot2Modal(false)} style={{
                width: 28, height: 28, borderRadius: "50%", border: "none",
                background: "#F3F4F6", cursor: "pointer", fontSize: 14, color: "#6B7280",
              }}>✕</button>
            </div>
            {/* 시나리오 2 컨텐츠 */}
            <div style={{ flex: 1, overflow: "hidden" }}>
              <SpotScenario2 onClose={() => setShowSpot2Modal(false)} initialStep="event_detected" />
            </div>
          </div>
        </div>
      )}

      {/* ── 출발 영상 모달 ── */}
      {showVideoModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1500,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.85)",
        }}>
          <div style={{ position: "relative", width: "75vw", maxWidth: 900 }}>
            {/* 헤더 */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", animation: "pulse 1s infinite" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>SPOT-01 · 실시간 카메라</span>
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>{nowHMS()}</span>
              </div>
              <button
                onClick={beginPatrol}
                style={{
                  padding: "6px 16px", borderRadius: 7, border: "none",
                  background: "#6366F1", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}
              >
                순찰 시작 →
              </button>
            </div>
            {/* 영상 */}
            <video
              src="/spot_departure.mp4"
              autoPlay
              muted
              style={{ width: "100%", borderRadius: 12, display: "block" }}
              onEnded={beginPatrol}
            />
            {/* 하단 안내 */}
            <div style={{ marginTop: 10, textAlign: "center", fontSize: 11, color: "#6B7280" }}>
              영상이 끝나면 자동으로 순찰이 시작됩니다
            </div>
          </div>
        </div>
      )}

      {/* ── 이력 조회 모달 ── */}
      {historyRecord && (
        <HistoryModal
          record={historyRecord}
          onClose={() => setHistoryRecord(null)}
        />
      )}

      {toast && <div style={toastStyle}>{toast}</div>}
    </div>
  );
}
