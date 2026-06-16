import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Vantiq × Spot Demo",
  description: "Vantiq Spot 로봇 순찰 데모 — 시나리오 1",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
