import { useState, useRef } from "react";
import type { SpotUnit, SpotId, S2Step, S2LogEntry } from "./types";
import { INITIAL_SPOTS, STATUS_META, RECOMMENDATION } from "./constants";
import { s2layout, s2card, recommendBox, actionBtn, approveBtn, s2toast } from "./styles";
import ScenarioMap  from "./components/ScenarioMap";
import SpotCard     from "./components/SpotCard";
import S2ActivityLog from "./components/S2ActivityLog";

function nowHMS() {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2,"0")).join(":");
}

const STEPS: { key: S2Step; label: string }[] = [
  { key: "monitoring",       label: "통합 모니터링" },
  { key: "event_detected",   label: "이벤트 감지"   },
  { key: "spot_recommended", label: "Spot 추천"     },
  { key: "approved",         label: "관리자 승인"   },
  { key: "responding",       label: "임무 배정"     },
  { key: "spot_error",       label: "장애 대응"     },
  { key: "complete",         label: "대응 완료"     },
];

interface SpotScenario2Props {
  onClose?: () => void;
  initialStep?: "event_detected";
}

export default function SpotScenario2({ onClose, initialStep }: SpotScenario2Props = {}) {
  const [spots,     setSpots]    = useState<SpotUnit[]>(INITIAL_SPOTS.map(s =>
    s.id === "SPOT-01" && initialStep === "event_detected"
      ? { ...s, status: "responding" as const, mission: "기기 고장 감지 — 일시정지" }
      : { ...s }
  ));
  const [step,      setStep]     = useState<S2Step>(initialStep ?? "monitoring");
  const [movingId,  setMovingId] = useState<SpotId | null>(null);
  const [toast,     setToast]    = useState<string | null>(null);
  const [logs,      setLogs]     = useState<S2LogEntry[]>([
    { time: "13:40:00", msg: "Vantiq 통합 관제 시작 — Spot 4대 모니터링 중", type: "info" },
    ...(initialStep === "event_detected" ? [
      { time: nowHMS(), msg: "SPOT-01: 기기 고장 감지 — 미션 일시정지", type: "warn" as const },
    ] : []),
  ]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const eventSpotId: SpotId   = "SPOT-01";
  const recommendedId: SpotId = RECOMMENDATION.spotId;
  const showEvent  = step !== "monitoring";
  const showRecom  = ["spot_recommended","approved","responding"].includes(step);
  const isMoving   = step === "approved" || step === "responding";

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const addLog = (msg: string, type: S2LogEntry["type"] = "info") =>
    setLogs(prev => [...prev.slice(-29), { time: nowHMS(), msg, type }]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const updateSpot = (id: SpotId, patch: Partial<SpotUnit>) =>
    setSpots(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));

  // ── 단계별 액션 ──────────────────────────────────────────────────────────────

  const triggerEvent = () => {
    updateSpot("SPOT-01", { status: "responding", mission: "이벤트 감지 — 일시정지" });
    setStep("event_detected");
    addLog("SPOT-01: 소화기 미배치 이벤트 감지 — 미션 일시정지", "warn");
    showToast("⚠️ SPOT-01 이벤트 감지");
  };

  const requestRecommend = () => {
    setStep("spot_recommended");
    addLog("Vantiq: 거리·배터리·상태 기반 Spot 추천 분석 완료", "info");
    addLog(`추천 결과: ${recommendedId} (배터리 95%, 대기 중, 최근접)`, "action");
    showToast(`✦ ${recommendedId} 추가 투입 추천`);
  };

  const approveRecommend = () => {
    updateSpot(recommendedId, { status: "moving", mission: "긴급 미션 수신 → A구역 이동 중" });
    setMovingId(recommendedId);
    setStep("approved");
    addLog(`관리자 승인 완료 — ${recommendedId} 긴급 미션 배정`, "success");
    showToast(`✓ ${recommendedId} 이동 시작`);

    // 3초 후 현장 도착
    timerRef.current = setTimeout(() => {
      updateSpot(recommendedId, {
        status: "responding",
        mission: "A구역 소화기 구역 추가 촬영 중",
        x: 180, y: 160,
      });
      setMovingId(null);
      setStep("responding");
      addLog(`${recommendedId}: A구역 도착 — 추가 촬영 시작`, "info");
      showToast(`🤖 ${recommendedId} 현장 도착`);
    }, 3000);
  };

  const triggerSpotError = () => {
    updateSpot(recommendedId, { status: "error", signal: "lost", mission: "통신 장애 발생" });
    setStep("spot_error");
    addLog(`${recommendedId}: 통신 장애 발생 — 긴급 미션 중단`, "error");
    addLog("Vantiq: 대체 Spot 확인 중...", "warn");
    showToast(`🔴 ${recommendedId} 통신 장애`);
  };

  const deployBackup = () => {
    updateSpot("SPOT-04", { status: "moving", mission: "긴급 미션 수신 → A구역 이동 중", battery: 34 });
    setMovingId("SPOT-04");
    addLog("SPOT-04: 예비 투입 결정 — 충전 중단 후 A구역 이동", "action");
    showToast("🤖 SPOT-04 예비 투입");

    timerRef.current = setTimeout(() => {
      updateSpot("SPOT-04", { status: "complete", mission: "A구역 소화기 구역 점검 완료", x: 180, y: 200 });
      setMovingId(null);
      setStep("complete");
      updateSpot("SPOT-01", { status: "patrolling", mission: "구역 순찰 재개" });
      addLog("SPOT-04: A구역 도착 — 점검 시작", "info");
      addLog("SPOT-01: 미션 재개 — 순찰 계속", "success");
      addLog("대응 완료 — 전체 이력 저장됨", "success");
      showToast("✅ 대응 완료");
    }, 3000);
  };

  const dispatchWorker = () => {
    setStep("complete");
    updateSpot("SPOT-01", { status: "patrolling", mission: "구역 순찰 재개" });
    addLog("로봇 투입 불가 — 현장 작업자 대응으로 전환", "action");
    addLog("작업자 출동 요청 전송 완료", "success");
    addLog("대응 완료 — 전체 이력 저장됨", "success");
    showToast("👷 작업자 출동 요청");
  };

  const resetDemo = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSpots(INITIAL_SPOTS.map(s => ({ ...s })));
    setStep("monitoring");
    setMovingId(null);
    setLogs([{ time: nowHMS(), msg: "데모 초기화됨", type: "info" }]);
  };

  // ── Derived ──────────────────────────────────────────────────────────────────

  const stepOrder   = STEPS.map(s => s.key);
  const currentStep = stepOrder.indexOf(step);

  const spot01 = spots.find(s => s.id === "SPOT-01")!;
  const spot03 = spots.find(s => s.id === recommendedId)!;

  return (
    <div style={{ ...s2layout.page, height: onClose ? '100%' : 'calc(100vh - 48px)' }}>

      {/* ── Flow bar ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "8px 20px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const }}>
        {STEPS.map((s, i) => {
          const done   = currentStep > i;
          const active = step === s.key;
          // step_error는 응답중 다음에만 표시
          if (s.key === "spot_error" && !["spot_error","complete"].includes(step)) return null;
          return (
            <div key={s.key} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 10, fontWeight: 600, flexShrink: 0,
                  background: done ? "#10B981" : active ? "#6366F1" : "#E5E7EB",
                  color: done || active ? "#fff" : "#9CA3AF", transition: "all 0.3s",
                }}>
                  {done ? "✓" : "·"}
                </div>
                <span style={{ fontSize: 12, color: done ? "#065F46" : active ? "#4338CA" : "#9CA3AF", fontWeight: active ? 600 : 400 }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && <span style={{ color: "#D1D5DB", margin: "0 5px", fontSize: 12 }}>→</span>}
            </div>
          );
        })}
        </div>
        {onClose && (
          <button onClick={onClose} style={{
            padding: "5px 14px", borderRadius: 6, border: "1px solid #E5E7EB",
            background: "#fff", color: "#6B7280", fontSize: 12, cursor: "pointer", flexShrink: 0,
          }}>✕ 닫기</button>
        )}
      </div>

      {/* ── Main grid ── */}
      <div style={{ ...s2layout.mainGrid }}>

        {/* Left: map + spot grid */}
        <div style={s2layout.leftPane}>

          {/* Spot 현황 그리드 */}
          <div style={{ ...s2card, padding: "10px 14px", flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, marginBottom: 8 }}>Spot 현황</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {spots.map(sp => (
                <SpotCard
                  key={sp.id}
                  spot={sp}
                  active={sp.id === eventSpotId && showEvent}
                  recommended={sp.id === recommendedId && showRecom}
                />
              ))}
            </div>
          </div>

          {/* Map */}
          <div style={{ ...s2card, flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>현장 지도 — 통합 관제</span>
              <div style={{ display: "flex", gap: 12, fontSize: 10, color: "#9CA3AF" }}>
                <span>🟡 이벤트</span>
                <span style={{ color: "#8B5CF6" }}>— — 추천 경로</span>
              </div>
            </div>
            <div style={{ flex: 1, padding: 8, minHeight: 0, overflow: "hidden" }}>
              <ScenarioMap
                spots={spots}
                eventSpotId={showEvent ? eventSpotId : null}
                recommendedId={showRecom ? recommendedId : null}
                movingId={movingId}
              />
            </div>

            {/* Bottom action */}
            <div style={{ padding: "10px 14px", borderTop: "1px solid #F3F4F6" }}>
              {step === "monitoring" && (
                <button onClick={triggerEvent} style={{ width: "100%", padding: "9px 0", borderRadius: 8, border: "none", background: "#6366F1", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  ▶ 데모 시작 (이벤트 발생)
                </button>
              )}
              {step === "complete" && (
                <div style={{ background: "#F0FDF4", borderRadius: 8, padding: "9px 14px", display: "flex", alignItems: "center", gap: 8, border: "1px solid #86EFAC" }}>
                  <span>✅</span>
                  <span style={{ fontSize: 12, color: "#166534", fontWeight: 600 }}>대응 완료 — 이력 저장됨</span>
                </div>
              )}
              {!["monitoring","complete"].includes(step) && (
                <div style={{ fontSize: 12, color: "#6B7280", textAlign: "center" }}>
                  {step === "approved" || movingId ? "이동 중..." : "대응 진행 중..."}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: detail panel */}
        <div style={s2layout.rightPane}>
          <div style={s2layout.rightBody}>

            {/* 이벤트 감지 */}
            {step === "event_detected" && (
              <div>
                <div style={{ background: "#FEF3C7", borderRadius: 10, padding: "12px 14px", border: "1px solid #FCD34D", marginBottom: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#92400E", marginBottom: 4 }}>🧯 소화기 미배치 감지</div>
                  <div style={{ fontSize: 12, color: "#B45309" }}>SPOT-01 · A구역 소화기 거치대 · 높음 위험도</div>
                </div>
                <div style={{ background: "#F9FAFB", borderRadius: 8, padding: 12, border: "1px solid #E5E7EB", marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8 }}>AI 분석 결과</div>
                  {[["인식 결과","소화기 미감지"],["신뢰도","96.2%"],["감지 시각","13:42:07"],["위치","A-03 거치대"]].map(([k,v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                      <span style={{ color: "#9CA3AF" }}>{k}</span>
                      <span style={{ fontWeight: 600, color: "#374151" }}>{v}</span>
                    </div>
                  ))}
                </div>
                <button onClick={requestRecommend} style={approveBtn}>
                  Vantiq — 추가 투입 Spot 추천 요청
                </button>
              </div>
            )}

            {/* Spot 추천 */}
            {step === "spot_recommended" && (
              <div>
                <div style={recommendBox}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#5B21B6", marginBottom: 10 }}>✦ 추천 Spot: {recommendedId}</div>
                  {RECOMMENDATION.reasons.map((r, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, fontSize: 12, color: "#374151" }}>
                      <span style={{ color: "#8B5CF6", fontWeight: 700 }}>✓</span>{r}
                    </div>
                  ))}
                </div>
                <div style={{ background: "#F9FAFB", borderRadius: 8, padding: 12, border: "1px solid #E5E7EB", marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 6 }}>비교 분석</div>
                  {spots.filter(s => s.id !== "SPOT-01").map(sp => (
                    <div key={sp.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: sp.id === recommendedId ? "#5B21B6" : "#374151" }}>
                        {sp.id === recommendedId ? "★ " : ""}{sp.id}
                      </span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ fontSize: 10, color: "#9CA3AF" }}>배터리 {sp.battery}%</span>
                        <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 10,
                          background: STATUS_META[sp.status].bg, color: STATUS_META[sp.status].color }}>
                          {STATUS_META[sp.status].text}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={approveRecommend} style={approveBtn}>
                  ✓ 관리자 승인 — {recommendedId} 투입
                </button>
              </div>
            )}

            {/* 이동 중 */}
            {(step === "approved" || step === "responding") && (
              <div>
                <div style={{ background: "#EDE9FE", borderRadius: 10, padding: "12px 14px", border: "1px solid #C4B5FD", marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#5B21B6", marginBottom: 4 }}>
                    {step === "approved" ? "🤖 SPOT-03 이동 중..." : "🤖 SPOT-03 현장 도착"}
                  </div>
                  <div style={{ fontSize: 12, color: "#6D28D9" }}>
                    {step === "approved" ? "A구역 소화기 구역으로 이동 중입니다." : "추가 촬영 및 재확인 진행 중입니다."}
                  </div>
                </div>
                <div style={{ background: "#F9FAFB", borderRadius: 8, padding: 12, border: "1px solid #E5E7EB", marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 6 }}>역할 분담</div>
                  {[
                    ["SPOT-01", "현장 유지 — 이벤트 위치 대기"],
                    ["SPOT-02", "B구역 순찰 계속"],
                    ["SPOT-03", step === "approved" ? "A구역 이동 중" : "추가 촬영 진행"],
                    ["SPOT-04", "충전 중 (예비)"],
                  ].map(([id, role]) => (
                    <div key={id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11 }}>
                      <span style={{ fontWeight: 600, color: "#374151" }}>{id}</span>
                      <span style={{ color: "#6B7280" }}>{role}</span>
                    </div>
                  ))}
                </div>
                {step === "responding" && (
                  <button onClick={triggerSpotError} style={{ ...approveBtn, background: "#EF4444" }}>
                    🔴 SPOT-03 통신 장애 발생 (시뮬레이션)
                  </button>
                )}
              </div>
            )}

            {/* 통신 장애 */}
            {step === "spot_error" && (
              <div>
                <div style={{ background: "#FEE2E2", borderRadius: 10, padding: "12px 14px", border: "1px solid #FECACA", marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#991B1B", marginBottom: 4 }}>🔴 SPOT-03 통신 장애</div>
                  <div style={{ fontSize: 12, color: "#B91C1C" }}>긴급 미션 중단 — 대체 투입 필요</div>
                </div>
                <div style={{ background: "#FFFBEB", borderRadius: 8, padding: 12, border: "1px solid #FCD34D", marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#92400E", marginBottom: 6 }}>대체 가능 Spot</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>SPOT-04</span>
                    <span style={{ color: "#6B7280" }}>배터리 34% · 충전 중</span>
                  </div>
                  <div style={{ fontSize: 10, color: "#B45309" }}>⚠ 배터리 낮음 — 단거리 임무만 가능</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={deployBackup} style={actionBtn("#F59E0B")}>SPOT-04 긴급 투입</button>
                  <button onClick={dispatchWorker} style={actionBtn("#6B7280")}>작업자 대응 전환</button>
                </div>
              </div>
            )}

            {/* 완료 */}
            {step === "complete" && (
              <div style={{ textAlign: "center", paddingTop: 40 }}>
                <div style={{ fontSize: 44, marginBottom: 10 }}>✅</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#065F46", marginBottom: 8 }}>대응 완료</div>
                <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 20 }}>모든 이벤트가 처리되고 이력이 저장되었습니다.</div>
              </div>
            )}

            {/* 모니터링 */}
            {step === "monitoring" && (
              <div style={{ textAlign: "center", paddingTop: 60 }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📡</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#6B7280" }}>
                  Spot 4대 실시간 모니터링 중입니다.
                </div>
              </div>
            )}
          </div>

          <S2ActivityLog entries={logs} />
        </div>
      </div>

      {onClose && toast && <div style={s2toast}>{toast}</div>}
      {!onClose && toast && <div style={s2toast}>{toast}</div>}
    </div>
  );
}
