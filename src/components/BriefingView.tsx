import React, { useEffect, useState } from 'react';
import { CsvDailySmpRow, CsvMarketSnapshot } from '../data/csvSmpLoader';
import { QuickFilterKey } from '../data/smpMarketData';
import { HourlySmpChart } from './HourlySmpChart';
import { RealtimePowerSupplySection } from './RealtimePowerSupplySection';

interface BriefingViewProps {
  allRows: CsvDailySmpRow[];
  snapshot: CsvMarketSnapshot;
  selectedDateId: string;
  quickFilter: QuickFilterKey | null;
  onSelectDate: (dateId: string) => void;
  onSelectQuickFilter: (filter: QuickFilterKey) => void;
  onOpenPolicyModal: (topic: 'terms' | 'source' | 'support') => void;
}

export const BriefingView: React.FC<BriefingViewProps> = ({
  allRows,
  snapshot,
  selectedDateId,
  quickFilter,
  onSelectDate,
  onSelectQuickFilter,
  onOpenPolicyModal,
}) => {
  const [showSmpGuide, setShowSmpGuide] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    setIsSpeaking(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [snapshot.id]);

  const handleToggleAudioBriefing = () => {
    if (isSpeaking) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(
          `${snapshot.dateLabel} 육지 전력 시장 브리핑입니다. ${snapshot.briefingParagraph}`
        );
        utterance.lang = 'ko-KR';
        utterance.rate = 1.02;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } catch {
        // Keep playing visual state if speech synthesis is unavailable
      }
    }
  };

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Top Command & Briefing Header */}
      <section className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          {/* Status & Beginner Explainer Pop-badge */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e2e7ff] text-[#9d4300] text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-pulse" />
              한국전력거래소 육지 SMP
            </span>

            <button
              type="button"
              onClick={() => setShowSmpGuide((prev) => !prev)}
              aria-expanded={showSmpGuide}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#eaedff] text-[#584237] text-[11px] font-medium hover:bg-[#dae2fd] hover:text-[#131b2e] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px] text-[#f97316]">help</span>
              <span>SMP(계통한계가격)란?</span>
              <span className="opacity-50">|</span>
              <span className="text-[#9d4300] font-semibold">한전 도매 구입단가</span>
            </button>
          </div>

          {/* Beginner Explainer Card */}
          {showSmpGuide && (
            <div className="p-3.5 rounded-2xl bg-[#ffffff] shadow-md border border-[#e2e7ff] transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#f97316] text-[18px]">
                    lightbulb
                  </span>
                  <span className="text-[14px] font-bold text-[#131b2e]">초보자 안내서</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSmpGuide(false)}
                  aria-label="안내서 닫기"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#584237] hover:bg-[#f2f3ff] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
              <p className="text-[12.5px] text-[#584237] leading-[19px]">
                <strong className="text-[#131b2e]">SMP(System Marginal Price)</strong>는
                한국전력공사가 발전소(원자력, 석탄, LNG, 태양광 등)로부터 전기를 매입해오는{' '}
                <strong className="text-[#9d4300]">도매 시장 단가</strong>입니다. 쉽게 말해
                &apos;오늘 전기의 원가 시세&apos;를 의미합니다.
              </p>
            </div>
          )}

          {/* Hero Title */}
          <h1 className="text-[32px] leading-[40px] font-extrabold tracking-[-0.025em] text-[#131b2e] mt-1">
            오늘의 전기 시세
          </h1>
          <p className="text-[14px] leading-[20px] text-[#584237] font-medium">
            전력시장(SMP) 흐름을 입문자도 한눈에 쉽게 이해하는 일일 전력 가격 현황
          </p>
        </div>

        {/* Date Selection Dropdown & Quick Toggle Interface */}
        <div className="flex flex-col gap-2 bg-[#ffffff] p-2 rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          {/* Native Accessible Date Selector Dropdown for all 310 CSV Dates */}
          <div className="relative">
            <span className="material-symbols-outlined text-[18px] text-[#f97316] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              calendar_today
            </span>
            <select
              aria-label="날짜 선택"
              value={selectedDateId}
              onChange={(e) => onSelectDate(e.target.value)}
              className="w-full min-h-[44px] pl-10 pr-10 py-2 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] font-mono text-[12.5px] font-semibold tabular-nums appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#f97316]/40 transition-colors"
            >
              {allRows.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.dateLabel} · 평균 {row.weightedAvg.toFixed(2)}원
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined text-[18px] text-[#584237] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Quick Filter Segmented Control */}
          <div className="grid grid-cols-3 p-1 bg-[#eaedff] rounded-xl gap-1">
            {(
              [
                { key: 'yesterday', label: '전일' },
                { key: 'today', label: '최신일' },
                { key: '7d', label: '7일 평균' },
              ] as const
            ).map((item) => {
              const active = quickFilter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSelectQuickFilter(item.key)}
                  className={`py-2 min-h-[36px] rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#ffffff] text-[#9d4300] font-bold shadow-xs'
                      : 'text-[#584237] hover:text-[#131b2e]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Master Card: Daily Average SMP */}
      <section className="relative overflow-hidden p-5 rounded-2xl bg-[#ffffff] shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_16px_-2px_rgba(15,23,42,0.03)]">
        {/* Ambient Decorative Glow */}
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-gradient-to-br from-[#f97316]/20 to-transparent blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-2 mb-3 relative z-10">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-semibold text-[#584237]">
                가중평균 도매단가 (육지)
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#f97316]" />
            </div>
            <h2 className="text-[20px] leading-[28px] font-bold tracking-[-0.015em] text-[#131b2e] mt-0.5">
              {snapshot.mode === '7d' ? '7일 평균 SMP' : '하루 평균 SMP'}
            </h2>
          </div>

          {snapshot.deltaAmount !== null && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${
                snapshot.isUp
                  ? 'bg-[#ffdbce]/60 text-[#a73a00]'
                  : 'bg-[#e2e7ff] text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {snapshot.isUp ? 'trending_up' : 'trending_down'}
              </span>
              {snapshot.isUp ? '전일 대비 상승' : '전일 대비 하락'}
            </span>
          )}
        </div>

        {/* Big Hero Monospace Price Display */}
        <div className="flex items-baseline gap-1.5 my-3 relative z-10">
          <span className="font-mono text-[42px] leading-[48px] tracking-[-0.03em] font-extrabold text-[#9d4300] tabular-nums">
            {snapshot.average.toFixed(2)}
          </span>
          <span className="font-mono text-[15px] font-medium text-[#584237]">
            원 / kWh
          </span>
        </div>

        {/* Day-over-Day Delta Pill */}
        {snapshot.deltaAmount !== null &&
        snapshot.deltaPercent !== null &&
        snapshot.prevAverage !== null ? (
          <div className="flex items-center gap-2 pt-0.5 relative z-10 flex-wrap">
            <div
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg font-mono text-[11px] font-bold tabular-nums ${
                snapshot.isUp
                  ? 'bg-[#f97316]/12 text-[#9d4300]'
                  : 'bg-[#e2e7ff] text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                {snapshot.isUp ? 'arrow_upward' : 'arrow_downward'}
              </span>
              {snapshot.isUp ? '+' : ''}
              {snapshot.deltaAmount.toFixed(2)} 원 ({snapshot.isUp ? '+' : ''}
              {snapshot.deltaPercent.toFixed(2)}%)
            </div>
            <span className="text-[12px] text-[#584237] tabular-nums">
              이전 기준 ({snapshot.prevAverage.toFixed(2)}원) 대비
            </span>
          </div>
        ) : (
          <div className="text-[12px] text-[#584237] relative z-10">
            CSV 데이터 첫 기준일입니다.
          </div>
        )}

        {/* Mini Visual Sparkline Strip */}
        <div className="mt-5 pt-3.5 bg-[#f2f3ff]/75 -mx-5 -mb-5 px-5 py-3.5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-[#584237]">
              {snapshot.monthLabel}
            </span>
            <span className="font-mono text-[12px] font-semibold text-[#131b2e] tabular-nums mt-0.5">
              {snapshot.monthlyCumulativeAvg.toFixed(2)} 원/kWh
            </span>
          </div>
          <div className="h-6 w-24 flex items-end gap-1" aria-hidden="true">
            {snapshot.sparklineHeights.map((pct, i) => {
              const isLast = i === snapshot.sparklineHeights.length - 1;
              const opacities = [
                'bg-[#f97316]/30',
                'bg-[#f97316]/40',
                'bg-[#f97316]/50',
                'bg-[#f97316]/65',
                'bg-[#f97316]/75',
                'bg-[#f97316]',
              ];
              return (
                <span
                  key={i}
                  className={`flex-1 rounded-t ${opacities[i] ?? 'bg-[#f97316]'} ${
                    isLast ? 'shadow-xs' : ''
                  }`}
                  style={{ height: `${pct}%` }}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Auxiliary Mini Metric Cards (Novice Friendly Trio) */}
      <section className="grid grid-cols-3 gap-2">
        {/* 1. Peak Price Period */}
        <div className="p-3 rounded-2xl bg-[#ffffff] shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-semibold text-[#584237] leading-tight">
              가장 비싼 시간
            </span>
            <div className="w-5 h-5 rounded-md bg-[#ffdad6]/60 flex items-center justify-center text-[#ba1a1a] shrink-0">
              <span className="material-symbols-outlined text-[13px]">
                local_fire_department
              </span>
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-[15px] leading-[20px] font-bold text-[#131b2e] tabular-nums">
              {snapshot.peakHourLabel}{' '}
              <span className="text-[10.5px] font-normal text-[#584237]">경</span>
            </div>
            <div className="font-mono text-[11.5px] font-bold text-[#9d4300] mt-0.5 tabular-nums">
              {snapshot.peakPrice.toFixed(2)}{' '}
              <span className="font-normal text-[#584237]">원</span>
            </div>
          </div>
          <span className="mt-1.5 text-[10px] leading-[13px] text-[#584237]">
            {snapshot.peakNote}
          </span>
        </div>

        {/* 2. Lowest Price Period */}
        <div className="p-3 rounded-2xl bg-[#ffffff] shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-semibold text-[#584237] leading-tight">
              가장 저렴한 시간
            </span>
            <div className="w-5 h-5 rounded-md bg-[#e2e7ff] flex items-center justify-center text-[#a73a00] shrink-0">
              <span className="material-symbols-outlined text-[13px]">bedtime</span>
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-[15px] leading-[20px] font-bold text-[#131b2e] tabular-nums">
              {snapshot.lowHourLabel}{' '}
              <span className="text-[10.5px] font-normal text-[#584237]">경</span>
            </div>
            <div className="font-mono text-[11.5px] font-bold text-[#131b2e] mt-0.5 tabular-nums">
              {snapshot.lowPrice.toFixed(2)}{' '}
              <span className="font-normal text-[#584237]">원</span>
            </div>
          </div>
          <span className="mt-1.5 text-[10px] leading-[13px] text-[#584237]">
            {snapshot.lowNote}
          </span>
        </div>

        {/* 3. Daily Spread (Max - Min) */}
        <div className="p-3 rounded-2xl bg-[#ffffff] shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-semibold text-[#584237] leading-tight">
              일일 가격 변동폭
            </span>
            <div className="w-5 h-5 rounded-md bg-[#dae2fd] flex items-center justify-center text-[#9d4300] shrink-0">
              <span className="material-symbols-outlined text-[13px]">bolt</span>
            </div>
          </div>
          <div className="mt-2.5">
            <div className="font-mono text-[14.5px] leading-[20px] font-bold text-[#131b2e] tabular-nums">
              {snapshot.spreadAmount.toFixed(2)}
              <span className="text-[10.5px] font-sans font-normal text-[#584237]"> 원</span>
            </div>
            <div className="font-mono text-[11px] font-bold text-[#9d4300] mt-0.5 tabular-nums">
              +{snapshot.spreadPercent.toFixed(1)}%
            </div>
          </div>
          <span className="mt-1.5 text-[10px] leading-[13px] text-[#584237]">
            최고·최저 시간 차
          </span>
        </div>
      </section>

      {/* Quick Beginner Tip Banner */}
      <section className="p-3.5 rounded-2xl bg-[#e2e7ff] flex items-start gap-2.5">
        <span className="material-symbols-outlined text-[#f97316] text-[20px] mt-0.5 shrink-0">
          electric_meter
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] font-bold text-[#131b2e]">
            입문 팁: 전력 시장 단가는 왜 계속 변할까요?
          </span>
          <p className="text-[11.5px] leading-[17px] text-[#584237]">
            공장과 가정의 소비량이 급증하는 시간대에는 더 비싼 LNG·복합화력 발전기를 돌려야 하므로
            시간대별 SMP가 상승하게 됩니다.
          </p>
        </div>
      </section>

      {/* Hourly SMP Interactive Bar Chart */}
      <HourlySmpChart
        hourlyPrices={snapshot.hourlyPrices}
        dateLabel={snapshot.dateLabel}
      />

      {/* Realtime Power Supply Section (Live OpenAPI) */}
      <RealtimePowerSupplySection />

      {/* AI Market Briefing Card */}
      <section className="relative overflow-hidden p-4 rounded-2xl bg-[#ffffff] shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_16px_-2px_rgba(15,23,42,0.03)]">
        {/* Top Decorative Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#9d4300] via-[#f97316] to-[#d78900]" />

        {/* Header */}
        <div className="flex flex-col gap-3 mb-3 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#f97316] text-[#ffffff] flex items-center justify-center shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-[16px] font-bold text-[#131b2e]">오늘의 시장 브리핑</h3>
                <span className="px-1.5 py-0.5 rounded-full bg-[#f97316]/12 text-[#9d4300] font-mono text-[9.5px] font-bold">
                  CSV INSIGHT
                </span>
              </div>
              <p className="text-[11.5px] text-[#584237] leading-[16px]">
                선택한 날짜의 한국전력거래소 실측 데이터를 요약한 해설입니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleAudioBriefing}
            className={`w-full min-h-[42px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-semibold shadow-xs transition-colors cursor-pointer ${
              isSpeaking
                ? 'bg-[#283044] text-[#eef0ff]'
                : 'bg-[#9d4300] text-[#ffffff] hover:bg-[#a73a00]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isSpeaking ? 'stop_circle' : 'smart_toy'}
            </span>
            <span>{isSpeaking ? '음성 브리핑 재생 중 (터치하여 정지)' : '심층 해설 음성 듣기'}</span>
          </button>
        </div>

        {/* Comprehensive Narrative */}
        <div className="p-3.5 rounded-xl bg-[#f2f3ff]/80 mb-3">
          <p className="text-[13px] leading-[21px] text-[#131b2e]">
            {snapshot.briefingParagraph}
          </p>
        </div>

        {/* 3 Key Takeaways */}
        <div className="flex flex-col gap-2">
          {snapshot.takeaways.map((item) => (
            <div
              key={item.number}
              className="p-3 rounded-xl bg-[#eaedff] flex items-start gap-2.5"
            >
              <span className="w-6 h-6 rounded-full bg-[#f97316]/20 text-[#9d4300] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                {item.number}
              </span>
              <div className="flex flex-col">
                <span className="text-[12.5px] font-bold text-[#131b2e]">{item.title}</span>
                <span className="text-[11.5px] leading-[16.5px] text-[#584237] mt-0.5">
                  {item.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Data Authenticity & Disclaimer Banner */}
      <section className="p-3.5 rounded-xl bg-[#e2e7ff]/60 flex flex-col gap-1.5">
        <div className="flex items-start gap-1.5 text-[11px] font-semibold text-[#584237]">
          <span className="material-symbols-outlined text-[15px] text-[#9d4300] shrink-0 mt-0.5">
            verified_user
          </span>
          <span>
            데이터 출처: 한국전력거래소(KPX) 육지 일별 시간별 SMP ({snapshot.updatedAtLabel})
          </span>
        </div>
        <p className="text-[11px] leading-[16px] text-[#584237]">
          본 대시보드는 첨부된 한국전력거래소 육지 SMP 실데이터(원/kWh)를 기반으로 표시됩니다.
        </p>
      </section>

      {/* Compact Mobile Footer */}
      <footer className="pt-4 pb-2 border-t border-[#dae2fd] flex flex-col gap-3 text-[#584237]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-bold text-[#131b2e]">GridPulse</span>
            <span className="px-1.5 py-0.5 rounded bg-[#eaedff] font-mono text-[10px] text-[#584237]">
              v1.2.0
            </span>
          </div>
          <span className="flex items-center gap-1 text-[11px]">
            <span className="material-symbols-outlined text-[14px]">dataset</span>
            총 {allRows.length}일 CSV 연동
          </span>
        </div>
        <p className="text-[11px] leading-[16px]">
          초보자 및 전력 사업자를 위한 실시간 계통한계가격(SMP) 및 전력시장 인사이트 플랫폼
        </p>
        <div className="flex items-center justify-between text-[11px] pt-1">
          <span>© 2025 GridPulse</span>
          <div className="flex items-center gap-3 font-semibold">
            <button
              type="button"
              onClick={() => onOpenPolicyModal('terms')}
              className="hover:text-[#131b2e] cursor-pointer"
            >
              이용약관
            </button>
            <button
              type="button"
              onClick={() => onOpenPolicyModal('source')}
              className="hover:text-[#131b2e] cursor-pointer"
            >
              데이터 기준
            </button>
            <button
              type="button"
              onClick={() => onOpenPolicyModal('support')}
              className="hover:text-[#131b2e] cursor-pointer"
            >
              고객지원
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
