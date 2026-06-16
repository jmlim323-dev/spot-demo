import type { CSSProperties } from "react";

export const s2layout = {
  page: {
    height: "calc(100vh - 48px)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column" as const,
    background: "#F8FAFC",
    fontFamily: "'Inter', 'Noto Sans KR', sans-serif",
  } as CSSProperties,

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 360px",
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
  } as CSSProperties,

  leftPane: {
    display: "flex",
    flexDirection: "column" as const,
    padding: 14,
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

  rightBody: {
    flex: 1,
    overflowY: "auto" as const,
    padding: 16,
  } as CSSProperties,
} as const;

export const s2card: CSSProperties = {
  background: "#fff",
  borderRadius: 10,
  border: "1px solid #E5E7EB",
};

export const spotCard = (active: boolean, error: boolean): CSSProperties => ({
  background: error ? "#FEF2F2" : active ? "#F5F3FF" : "#fff",
  borderRadius: 9,
  border: `1px solid ${error ? "#FECACA" : active ? "#C4B5FD" : "#E5E7EB"}`,
  padding: "10px 12px",
  cursor: "default",
  transition: "all 0.2s",
});

export const infoRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: 11,
  color: "#6B7280",
  marginTop: 4,
};

export const recommendBox: CSSProperties = {
  background: "#F5F3FF",
  borderRadius: 10,
  border: "2px solid #8B5CF6",
  padding: "14px 16px",
  marginBottom: 14,
};

export const actionBtn = (color: string): CSSProperties => ({
  flex: 1,
  padding: "9px 0",
  borderRadius: 7,
  border: "none",
  cursor: "pointer",
  background: color,
  color: "#fff",
  fontSize: 12,
  fontWeight: 600,
});

export const approveBtn: CSSProperties = {
  width: "100%",
  padding: "11px 0",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  background: "#8B5CF6",
  color: "#fff",
  fontSize: 13,
  fontWeight: 700,
};

export const s2toast: CSSProperties = {
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
  pointerEvents: "none",
};
