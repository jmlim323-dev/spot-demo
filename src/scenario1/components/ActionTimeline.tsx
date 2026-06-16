import { useState, useEffect } from "react";
import { saveEventRecord, buildSteps } from "../lib/eventHistory";
import { downloadReport } from "../lib/generateReport";
import type { EventType } from "../types";
import { EVENT_CONFIGS, PATROL_PATH } from "../constants";

export interface TimelineStep {
  id: string;
  label: string;
  desc: string;
  badge: "action" | "confirm" | "complete";
  icon: string;
  onCustomAction?: () => void;  // 실행 버튼 클릭 시 커스텀 동작
}

interface Props {
  steps: TimelineStep[];
  eventType: EventType;
  detectedAt: string;
  onAllComplete: () => void;
  onResume: () => void;
  initialCompleted?: Record<string, string>;
}

const BADGE_META = {
  action:   { text: "실행",    bg: "#EFF6FF", color: "#1D4ED8" },
  confirm:  { text: "확인",    bg: "#FEF3C7", color: "#92400E" },
  complete: { text: "완료확인", bg: "#F0FDF4", color: "#166534" },
};

function nowHMS() {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map(n => String(n).padStart(2, "0")).join(":");
}

export default function ActionTimeline({
  steps, eventType, detectedAt,
  onAllComplete, onResume,
  initialCompleted = {},
}: Props) {
  const [completed, setCompleted] = useState<Record<string, string>>(initialCompleted);
  const allDone = steps.every(s => completed[s.id]);

  // 모달이 열릴 때마다 저장된 진행 상황 복원
  useEffect(() => {
    setCompleted(initialCompleted);
  }, [JSON.stringify(initialCompleted)]);

  const handleStep = (id: string) => {
    const step = steps.find(s => s.id === id);
    if (step?.onCustomAction) step.onCustomAction();
    const next = { ...completed, [id]: nowHMS() };
    setCompleted(next);

    // 단계마다 실시간 저장
    const cfg = EVENT_CONFIGS[eventType];
    const triggerPt = PATROL_PATH[cfg.triggerPoint];
    const allNowDone = steps.every(s => next[s.id]);
    saveEventRecord({
      eventType,
      title:       cfg.title,
      icon:        cfg.icon,
      location:    triggerPt?.label ?? "",
      detectedAt,
      completedAt: allNowDone ? nowHMS() : "",
      steps:       buildSteps(steps, next),
    });

    if (allNowDone) {
      onAllComplete();
    }
  };

  const handleDownload = () => {
    const cfg = EVENT_CONFIGS[eventType];
    const triggerPt = PATROL_PATH[cfg.triggerPoint];
    downloadReport({
      eventType,
      title:       cfg.title,
      icon:        cfg.icon,
      location:    triggerPt?.label ?? "",
      detectedAt,
      completedAt: nowHMS(),
      steps:       buildSteps(steps, completed),
    });
  };

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {steps.map((step, i) => {
          const done     = !!completed[step.id];
          const prevDone = i === 0 || !!completed[steps[i - 1].id];
          const badge    = BADGE_META[step.badge];

          return (
            <div key={step.id} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "10px 0",
              borderBottom: i < steps.length - 1 ? "1px solid #F3F4F6" : "none",
              opacity: !prevDone ? 0.45 : 1,
              transition: "opacity 0.2s",
            }}>
              <div style={{
                minWidth: 24, height: 24, borderRadius: "50%",
                background: done ? "#10B981" : "#1D4ED8",
                color: "#fff", fontSize: 11, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: 1,
              }}>
                {done ? "✓" : i + 1}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "1px 6px",
                    borderRadius: 12, background: badge.bg, color: badge.color,
                  }}>{badge.text}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>
                    {step.icon} {step.label}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "#6B7280" }}>{step.desc}</div>
              </div>

              <div style={{ flexShrink: 0, paddingTop: 2 }}>
                {done ? (
                  <span style={{ fontSize: 10, color: "#10B981", fontWeight: 700 }}>
                    {completed[step.id]}
                  </span>
                ) : (
                  <button
                    onClick={() => handleStep(step.id)}
                    disabled={!prevDone}
                    style={{
                      padding: "4px 10px", borderRadius: 6, border: "none",
                      background: prevDone ? "#1D4ED8" : "#E5E7EB",
                      color: prevDone ? "#fff" : "#9CA3AF",
                      fontSize: 11, fontWeight: 600,
                      cursor: prevDone ? "pointer" : "not-allowed",
                    }}
                  >
                    실행
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 완료 시 버튼들 */}
      {allDone && (
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button onClick={handleDownload} style={{
            flex: 1, padding: "10px 0", borderRadius: 8, border: "1px solid #6366F1",
            background: "#fff", color: "#6366F1", fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>
            📄 리포트 다운로드
          </button>
          <button onClick={onResume} style={{
            flex: 1, padding: "10px 0", borderRadius: 8, border: "none",
            background: "#10B981", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>
            ✅ 조치 완료 — 미션 재개
          </button>
        </div>
      )}

    </div>
  );
}
