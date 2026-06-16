import type { SpotUnit, SpotId, SpotStatus } from "./types";

export const INITIAL_SPOTS: SpotUnit[] = [
  { id: "SPOT-01", zone: "A구역", role: "안전설비 점검", status: "patrolling", battery: 82, signal: "good", mission: "구역 순찰 중",      x: 180, y: 160 },
  { id: "SPOT-02", zone: "B구역", role: "시설 상태 점검", status: "patrolling", battery: 71, signal: "good", mission: "구역 순찰 중",      x: 480, y: 160 },
  { id: "SPOT-03", zone: "중앙구역", role: "긴급 대응",   status: "standby",   battery: 95, signal: "good", mission: "대기 중",           x: 330, y: 280 },
  { id: "SPOT-04", zone: "충전구역", role: "예비 로봇",   status: "charging",  battery: 34, signal: "good", mission: "충전 중",           x: 330, y: 400 },
];

export const STATUS_META: Record<SpotStatus, { text: string; color: string; bg: string }> = {
  patrolling: { text: "순찰 중",   color: "#065F46", bg: "#D1FAE5" },
  standby:    { text: "대기 중",   color: "#1E40AF", bg: "#DBEAFE" },
  charging:   { text: "충전 중",   color: "#92400E", bg: "#FEF3C7" },
  responding: { text: "대응 중",   color: "#991B1B", bg: "#FEE2E2" },
  moving:     { text: "이동 중",   color: "#5B21B6", bg: "#EDE9FE" },
  error:      { text: "통신 장애", color: "#7F1D1D", bg: "#FEE2E2" },
  complete:   { text: "임무 완료", color: "#065F46", bg: "#D1FAE5" },
};

export const SIGNAL_META: Record<string, { text: string; color: string }> = {
  good: { text: "정상", color: "#10B981" },
  weak: { text: "약함", color: "#F59E0B" },
  lost: { text: "끊김", color: "#EF4444" },
};

export const EVENT_LOCATION = { x: 180, y: 160 }; // SPOT-01 위치 = 이벤트 발생 위치
export const SPOT03_TARGET   = { x: 180, y: 160 }; // SPOT-03 이동 목적지

export const RECOMMENDATION = {
  spotId: "SPOT-03" as SpotId,
  reasons: [
    "동일 현장 내 배치",
    "이벤트 위치와 가장 근접",
    "현재 대기 상태",
    "배터리 충분 (95%)",
  ],
};
