import type { EventRecord } from "./eventHistory";

const AI_STEPS: Record<string, { icon: string; label: string }[]> = {
  fire_extinguisher: [
    { icon: "📷", label: "현장 이미지 수집 완료" },
    { icon: "🔍", label: "소화기 미배치 판정 완료" },
    { icon: "📋", label: "사고 리포트 초안 작성 완료" },
    { icon: "📨", label: "시설 담당자 알림 자동 발송 완료" },
  ],
  server_room: [
    { icon: "🌡️", label: "열화상 데이터 수집 완료" },
    { icon: "🔍", label: "기준 온도 초과 판정 완료 (임계치 +32.4℃)" },
    { icon: "📋", label: "서버룸 이상 리포트 초안 작성 완료" },
    { icon: "📨", label: "데이터센터 관리팀 긴급 알림 발송 완료" },
  ],
  device_failure: [
    { icon: "🔄", label: "헬스체크 재시도 완료 — 응답 없음" },
    { icon: "🔌", label: "원격 재시작 시도 완료 — 응답 없음" },
    { icon: "📋", label: "기기 장애 리포트 초안 작성 완료" },
    { icon: "📨", label: "설비 관리팀 긴급 알림 자동 발송 완료" },
  ],
};

export function generateReportHTML(record: EventRecord): string {
  const aiSteps = AI_STEPS[record.eventType] ?? [];

  const aiStepsHTML = aiSteps.map((s, i) => `
    <div class="tl-item">
      <div class="tl-num ai">${i + 1}</div>
      <div class="tl-content">
        <div class="tl-label">
          <span class="tl-badge badge-ai">자동처리</span>
          ${s.icon} ${s.label}
        </div>
        <div class="tl-desc">AI 에이전트가 자동으로 처리하였습니다.</div>
      </div>
      <div class="tl-time">${record.detectedAt}</div>
    </div>`).join("");

  const humanStepsHTML = record.steps.map((s, i) => `
    <div class="tl-item">
      <div class="tl-num">${i + 1}</div>
      <div class="tl-content">
        <div class="tl-label">
          <span class="tl-badge badge-confirm">담당자 확인</span>
          ${s.icon} ${s.label}
        </div>
        <div class="tl-desc">${s.desc}</div>
      </div>
      <div class="tl-time">${s.completedAt}</div>
    </div>`).join("");

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"/>
<title>사고 처리 보고서 — ${record.title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Noto Sans KR', sans-serif; font-size: 13px; color: #0f172a; background: #fff; padding: 36px 44px; line-height: 1.6; }
  .report-header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 2.5px solid #6366F1; padding-bottom: 16px; margin-bottom: 24px; }
  .report-title { font-size: 22px; font-weight: 800; color: #0f172a; }
  .report-subtitle { font-size: 13px; color: #5a6478; margin-top: 4px; }
  .report-meta { text-align: right; font-size: 11px; color: #9aa3b2; line-height: 1.8; }
  .overview-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
  .overview-card { border: 1px solid #e2e6ed; border-radius: 10px; padding: 12px 14px; background: #f8fafc; }
  .overview-card .oc-label { font-size: 10px; font-weight: 700; color: #9aa3b2; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; }
  .overview-card .oc-value { font-size: 13px; font-weight: 700; color: #0f172a; }
  .overview-card.highlight { border-color: #c7d2fe; background: #eef2ff; }
  .overview-card.highlight .oc-value { color: #6366F1; }
  section { margin-bottom: 28px; }
  h2 { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #e2e6ed; }
  .section-desc { font-size: 11px; color: #9aa3b2; margin-bottom: 12px; margin-top: -6px; }
  .tl-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
  .tl-num { min-width: 24px; height: 24px; border-radius: 50%; background: #6366F1; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .tl-num.ai { background: #8B5CF6; }
  .tl-content { flex: 1; }
  .tl-label { font-weight: 600; color: #0f172a; font-size: 13px; }
  .tl-desc { font-size: 11px; color: #5a6478; margin-top: 2px; }
  .tl-badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 20px; margin-right: 6px; }
  .badge-ai      { background: #ede9fe; color: #5b21b6; }
  .badge-confirm { background: #fef3c7; color: #92400e; }
  .tl-time { font-size: 11px; color: #10B981; font-weight: 700; white-space: nowrap; flex-shrink: 0; padding-top: 3px; }
  .report-footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e6ed; display: flex; justify-content: space-between; font-size: 10px; color: #9aa3b2; }
  .event-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 700; margin-bottom: 4px; background: #eef2ff; color: #6366F1; border: 1px solid #c7d2fe; }
  @media print { body { padding: 20px 28px; } @page { margin: 12mm 14mm; size: A4; } }
</style>
</head>
<body>
<div class="report-header">
  <div>
    <div class="report-title">🤖 SPOT-01 이벤트 처리 보고서</div>
    <div class="report-subtitle">Vantiq × Spot 관제 시스템 — 자동 생성 보고서</div>
    <div style="margin-top:10px"><span class="event-badge">${record.icon} ${record.title}</span></div>
  </div>
  <div class="report-meta">
    <div>보고서 생성</div>
    <div>${record.completedAt}</div>
    <div style="margin-top:6px">Vantiq 관제센터</div>
  </div>
</div>

<section>
  <h2>1. 이벤트 개요</h2>
  <div class="overview-grid">
    <div class="overview-card"><div class="oc-label">이벤트 유형</div><div class="oc-value">${record.icon} ${record.title}</div></div>
    <div class="overview-card"><div class="oc-label">감지 위치</div><div class="oc-value">${record.location}</div></div>
    <div class="overview-card"><div class="oc-label">감지 시각</div><div class="oc-value">${record.detectedAt}</div></div>
    <div class="overview-card highlight"><div class="oc-label">조치 완료</div><div class="oc-value">${record.completedAt}</div></div>
  </div>
</section>

<section>
  <h2>2. AI 에이전트 자동 처리 이력</h2>
  <p class="section-desc">이벤트 감지 후 AI 에이전트가 자동으로 수행한 분석 및 조치 내역입니다.</p>
  ${aiStepsHTML}
</section>

<section>
  <h2>3. 담당자 확인 및 조치 이력</h2>
  <p class="section-desc">담당자가 직접 확인하고 승인한 조치 내역입니다.</p>
  ${humanStepsHTML || '<p style="color:#9aa3b2;font-size:12px;padding:10px 0">기록된 담당자 조치 없음</p>'}
</section>

<div class="report-footer">
  <span>Vantiq × Spot 관제 시스템 (Powered by Vantiq)</span>
  <span>본 문서는 시스템에 의해 자동 생성되었습니다</span>
</div>
<script>window.onload = function() { window.print(); };</script>
</body>
</html>`;
}

export function downloadReport(record: EventRecord): void {
  const html = generateReportHTML(record);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `spot_report_${record.eventType}_${record.completedAt.replace(/:/g,"")}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
