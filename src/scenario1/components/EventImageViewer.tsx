import { useState } from "react";

interface Props {
  src: string;
  alt: string;
  caption?: string;
  timestamp?: string;
  height?: number;
}

export default function EventImageViewer({ src, alt, caption, timestamp, height = 160 }: Props) {
  const [lightbox, setLightbox] = useState(false);

  return (
    <>
      {/* 이미지 카드 */}
      <div style={{
        borderRadius: 10, overflow: "hidden",
        border: "1px solid #E5E7EB", marginBottom: 14, position: "relative",
      }}>
        <div style={{ position: "relative", cursor: "zoom-in" }} onClick={() => setLightbox(true)}>
          <img
            src={src} alt={alt}
            style={{ width: "100%", display: "block", height, objectFit: "cover" }}
          />
          {/* 확대 버튼 오버레이 */}
          <div style={{
            position: "absolute", top: 8, right: 8,
            background: "rgba(0,0,0,0.55)", borderRadius: 6,
            padding: "4px 8px", display: "flex", alignItems: "center", gap: 4,
          }}>
            <span style={{ fontSize: 12, color: "#fff" }}>🔍</span>
            <span style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>확대</span>
          </div>
        </div>
        {/* 캡션 바 */}
        <div style={{
          background: "#1F2937", padding: "6px 12px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 11, color: "#9CA3AF" }}>{caption}</span>
          {timestamp && <span style={{ fontSize: 10, color: "#6B7280" }}>{timestamp}</span>}
        </div>
      </div>

      {/* 라이트박스 */}
      {lightbox && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 2000,
            background: "rgba(0,0,0,0.88)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}
            onClick={e => e.stopPropagation()}>
            <img
              src={src} alt={alt}
              style={{
                maxWidth: "90vw", maxHeight: "85vh",
                borderRadius: 10, display: "block",
                boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
              }}
            />
            {caption && (
              <div style={{
                background: "rgba(0,0,0,0.7)", borderRadius: "0 0 10px 10px",
                padding: "8px 16px", display: "flex", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: 12, color: "#D1D5DB" }}>{caption}</span>
                {timestamp && <span style={{ fontSize: 11, color: "#9CA3AF" }}>{timestamp}</span>}
              </div>
            )}
            <button
              onClick={() => setLightbox(false)}
              style={{
                position: "absolute", top: -14, right: -14,
                width: 32, height: 32, borderRadius: "50%",
                background: "#374151", border: "2px solid #6B7280",
                color: "#fff", fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >✕</button>
          </div>
        </div>
      )}
    </>
  );
}
