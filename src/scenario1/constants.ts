import type { PatrolPoint, EventConfig, EventType, SeverityMeta, StatusMeta, MissionStatus, ActionStep } from "./types";

// ─── Patrol Path ──────────────────────────────────────────────────────────────

export const PATROL_PATH: PatrolPoint[] = [
  { id: "p1",  x: 255,  y: 430, label: "시작 위치",   isCheckpoint: true  },
  { id: "p2",  x: 255,  y: 220, label: "",            isCheckpoint: false },
  { id: "p3",  x: 370,  y: 125, label: "소화기",      isCheckpoint: true  },
  { id: "p4",  x: 580,  y: 115, label: "",            isCheckpoint: false },
  { id: "p5",  x: 720,  y: 155, label: "서버룸",      isCheckpoint: true  },
  { id: "p6",  x: 850,  y: 115, label: "",            isCheckpoint: false },
  { id: "p7",  x: 1000, y: 115, label: "",            isCheckpoint: false },
  { id: "p8",  x: 1155, y: 115, label: "",            isCheckpoint: false },
  { id: "p9",  x: 1155, y: 345, label: "기기 고장",   isCheckpoint: true  },
  { id: "p10", x: 1050, y: 345, label: "",            isCheckpoint: false },
  { id: "p11", x: 600,  y: 345, label: "",            isCheckpoint: false },
  { id: "p12", x: 255,  y: 345, label: "",            isCheckpoint: false },
  { id: "p13", x: 255,  y: 430, label: "",            isCheckpoint: true  },
];

// ─── Event Configurations ─────────────────────────────────────────────────────

export const EVENT_CONFIGS: Record<EventType, EventConfig> = {
  fire_extinguisher: {
    title: "소화기 미배치 감지",
    icon: "🧯",
    severity: "high",
    triggerPoint: 2,
    color: "#F59E0B",
    bgColor: "#FEF3C7",
  },
  server_room: {
    title: "서버룸 온도 이상 감지",
    icon: "🌡️",
    severity: "critical",
    triggerPoint: 4,
    color: "#EF4444",
    bgColor: "#FEE2E2",
  },
  device_failure: {
    title: "기기 동작 불가 (헬스체크 실패)",
    icon: "⚠️",
    severity: "critical",
    triggerPoint: 8,
    color: "#EF4444",
    bgColor: "#FEE2E2",
  },
};

// ─── Severity Labels ──────────────────────────────────────────────────────────

export const SEVERITY_LABEL: Record<string, SeverityMeta> = {
  critical: { text: "긴급", color: "#991B1B", bg: "#FEE2E2" },
  high:     { text: "높음", color: "#92400E", bg: "#FEF3C7" },
  medium:   { text: "중간", color: "#1E40AF", bg: "#DBEAFE" },
};

// ─── Mission Status Labels ────────────────────────────────────────────────────

export const STATUS_META: Record<MissionStatus, StatusMeta> = {
  patrolling: { text: "순찰 중",   color: "#065F46", bg: "#D1FAE5" },
  paused:     { text: "일시정지", color: "#92400E", bg: "#FEF3C7" },
  responding: { text: "대응 중",  color: "#991B1B", bg: "#FEE2E2" },
  resumed:    { text: "재개됨",   color: "#1E3A5F", bg: "#DBEAFE" },
};

// ─── Action Result Messages ───────────────────────────────────────────────────

export const ACTION_LABELS: Record<string, string> = {
  retake:   "추가 촬영 요청을 전송했습니다.",
  worker:   "작업자 확인 요청을 전송했습니다.",
  resume:   "미션을 재개합니다.",
  notify:   "시설 담당자에게 알림을 보냈습니다.",
  shutoff:  "급수 차단 요청을 전송했습니다.",
  retry:    "헬스체크 재시도 중...",
  restart:  "원격 재시작 요청을 전송했습니다.",
  dispatch: "작업자 출동을 요청했습니다.",
};

// ─── Flow Steps ───────────────────────────────────────────────────────────────

export const FLOW_STEPS: { key: ActionStep; label: string }[] = [
  { key: "monitoring",      label: "순찰 모니터링" },
  { key: "event_detected",  label: "이벤트 감지"   },
  { key: "event_detail",    label: "상세 확인"     },
  { key: "action_taken",    label: "조치 선택"     },
  { key: "mission_resumed", label: "미션 재개"     },
];

// ─── Map Visual Config ────────────────────────────────────────────────────────

export const MAP_COLORS = {
  gridLine:        "#F3F4F6",
  zoneLabel:       "#D1D5DB",
  pathPlanned:     "#C7D2FE",
  pathCompleted:   "#6366F1",
  pointVisited:    "#6366F1",
  pointCurrent:    "#A5B4FC",
  pointDefault:    "#E5E7EB",
  pointStroke:     "#D1D5DB",
  spotNormal:      { fill: "#EEF2FF", stroke: "#6366F1" },
  spotPaused:      { fill: "#FEF3C7", stroke: "#F59E0B" },
} as const;

export const PATROL_SPEED_MS = 900; // ms per checkpoint
