import type { CSSProperties } from "react";

// ─── Layout ───────────────────────────────────────────────────────────────────

export const layout = {
  page: {
    height: "calc(100vh - 48px)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column" as const,
    background: "#F8FAFC",
    fontFamily: "'Inter', 'Noto Sans KR', sans-serif",
  } as CSSProperties,

  header: {
    background: "#fff",
    borderBottom: "1px solid #E5E7EB",
    padding: "0 20px",
    height: 48,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  } as CSSProperties,

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  } as CSSProperties,

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  } as CSSProperties,

  logoBox: {
    width: 28,
    height: 28,
    background: "#6366F1",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    color: "#fff",
  } as CSSProperties,

  flowBar: {
    background: "#fff",
    borderBottom: "1px solid #E5E7EB",
    padding: "8px 20px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap" as const,
  } as CSSProperties,

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "7fr 3fr",
    gap: 0,
    flex: 1,
    overflow: "hidden",
  } as CSSProperties,

  leftPane: {
    padding: 14,
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
    overflow: "hidden",
  } as CSSProperties,

  rightPane: {
    borderLeft: "1px solid #E5E7EB",
    background: "#fff",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
  } as CSSProperties,

  rightPaneBody: {
    flex: 1,
    overflowY: "auto" as const,
    padding: 16,
  } as CSSProperties,
} as const;

// ─── Cards & Panels ───────────────────────────────────────────────────────────

export const card = {
  base: {
    background: "#fff",
    borderRadius: 10,
    border: "1px solid #E5E7EB",
  } as CSSProperties,

  header: {
    padding: "10px 14px",
    borderBottom: "1px solid #F3F4F6",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  } as CSSProperties,

  mapBody: {
    flex: 1,
    padding: 8,
    minHeight: 0,
    overflow: "hidden",
  } as CSSProperties,

  mapFooter: {
    padding: "10px 14px",
    borderTop: "1px solid #F3F4F6",
    flexShrink: 0,
  } as CSSProperties,
} as const;

// ─── Event Selector ───────────────────────────────────────────────────────────

export const eventSelector = {
  wrapper: {
    background: "#fff",
    borderRadius: 10,
    border: "1px solid #E5E7EB",
    padding: "12px 14px",
    flexShrink: 0,
  } as CSSProperties,

  label: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: 500,
    marginBottom: 8,
  } as CSSProperties,

  buttonRow: {
    display: "flex",
    gap: 8,
  } as CSSProperties,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const text = {
  appTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
  } as CSSProperties,

  appSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 8,
  } as CSSProperties,

  cardTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#374151",
  } as CSSProperties,

  sectionLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 6,
  } as CSSProperties,

  muted: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center" as const,
  } as CSSProperties,

  mapLegend: {
    display: "flex",
    gap: 12,
    fontSize: 10,
    color: "#9CA3AF",
  } as CSSProperties,
} as const;

// ─── Buttons ──────────────────────────────────────────────────────────────────

export const btn = {
  reset: {
    padding: "5px 12px",
    borderRadius: 6,
    border: "1px solid #E5E7EB",
    background: "#fff",
    color: "#374151",
    fontSize: 12,
    cursor: "pointer",
  } as CSSProperties,

  startPatrol: {
    width: "100%",
    padding: "9px 0",
    borderRadius: 8,
    border: "none",
    background: "#6366F1",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  } as CSSProperties,

  viewDetail: {
    marginLeft: "auto",
    padding: "5px 12px",
    borderRadius: 6,
    border: "none",
    background: "#F59E0B",
    color: "#fff",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
  } as CSSProperties,

  action: (color: string): CSSProperties => ({
    flex: 1,
    padding: "9px 0",
    borderRadius: 7,
    border: "none",
    cursor: "pointer",
    background: color,
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
  }),

  actionGrid: (color: string): CSSProperties => ({
    padding: "9px 0",
    borderRadius: 7,
    border: "none",
    cursor: "pointer",
    background: color,
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
  }),

  eventDetail: (color: string): CSSProperties => ({
    padding: "9px 20px",
    borderRadius: 8,
    border: "none",
    background: color,
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  }),
} as const;

// ─── Status Banners ───────────────────────────────────────────────────────────

export const banner = {
  paused: {
    background: "#FFFBEB",
    borderRadius: 8,
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid #FCD34D",
  } as CSSProperties,

  resumed: {
    background: "#F0FDF4",
    borderRadius: 8,
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid #86EFAC",
  } as CSSProperties,
} as const;

// ─── Flow Step ────────────────────────────────────────────────────────────────

export const flowStep = {
  dot: (done: boolean, active: boolean): CSSProperties => ({
    width: 24,
    height: 24,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 600,
    background: done ? "#10B981" : active ? "#6366F1" : "#E5E7EB",
    color: done || active ? "#fff" : "#9CA3AF",
    transition: "all 0.3s",
    flexShrink: 0,
  }),

  label: (done: boolean, active: boolean): CSSProperties => ({
    fontSize: 12,
    color: done ? "#065F46" : active ? "#4338CA" : "#9CA3AF",
    fontWeight: active ? 600 : 400,
  }),
} as const;

// ─── Event Detail Header ──────────────────────────────────────────────────────

export const eventHeader = (bgColor: string, borderColor: string): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 12,
  padding: "10px 12px",
  borderRadius: 8,
  background: bgColor,
  border: `1px solid ${borderColor}44`,
});

// ─── Activity Log ─────────────────────────────────────────────────────────────

export const activityLog = {
  wrapper: {
    borderTop: "1px solid #E5E7EB",
    padding: "10px 16px",
    maxHeight: 280,
    overflowY: "auto" as const,
    flexShrink: 0,
  } as CSSProperties,

  row: {
    display: "flex",
    gap: 8,
    marginBottom: 4,
  } as CSSProperties,

  time: {
    fontSize: 10,
    color: "#9CA3AF",
    flexShrink: 0,
  } as CSSProperties,

  msgColor: (type: string): CSSProperties => ({
    fontSize: 10,
    color:
      type === "warn"    ? "#92400E" :
      type === "success" ? "#065F46" :
      type === "action"  ? "#1E40AF" :
      "#374151",
  }),
} as const;

// ─── Toast ────────────────────────────────────────────────────────────────────

export const toast: CSSProperties = {
  position: "fixed",
  bottom: 20,
  left: "50%",
  transform: "translateX(-50%)",
  background: "#1F2937",
  color: "#fff",
  padding: "10px 20px",
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 500,
  zIndex: 999,
  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  pointerEvents: "none",
};

// ─── Panel: Info Blocks ───────────────────────────────────────────────────────

export const infoBlock = {
  yellow: {
    background: "#FFFBEB",
    borderRadius: 8,
    padding: 12,
    border: "1px solid #FCD34D",
    marginBottom: 12,
  } as CSSProperties,

  red: {
    background: "#FEF2F2",
    borderRadius: 8,
    padding: 12,
    border: "1px solid #FECACA",
    marginBottom: 12,
  } as CSSProperties,

  blue: {
    background: "#EFF6FF",
    borderRadius: 8,
    padding: 12,
    border: "1px solid #BFDBFE",
    marginBottom: 12,
  } as CSSProperties,

  gray: {
    background: "#F9FAFB",
    borderRadius: 8,
    padding: 10,
    border: "1px solid #E5E7EB",
  } as CSSProperties,

  imagePlaceholder: {
    background: "#1F2937",
    borderRadius: 6,
    height: 90,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column" as const,
    gap: 4,
  } as CSSProperties,

  imageWide: {
    background: "#1F2937",
    borderRadius: 8,
    height: 76,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
  } as CSSProperties,
} as const;

// ─── Metric Card (hot water panel) ───────────────────────────────────────────

export const metricCard = (warn: boolean): CSSProperties => ({
  background: warn ? "#FEF3C7" : "#F0FDF4",
  borderRadius: 8,
  padding: "10px 12px",
  border: `1px solid ${warn ? "#FCD34D" : "#86EFAC"}`,
});
