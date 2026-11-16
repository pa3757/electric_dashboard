import React, { useMemo, useState } from 'react';
import { CsvDailySmpRow } from '../data/csvSmpLoader';
import { BEGINNER_GLOSSARY } from '../data/smpMarketData';

interface MarketReportViewProps {
  allRows: CsvDailySmpRow[];
  selectedDateId: string;
}

export const MarketReportView: React.FC<MarketReportViewProps> = ({
  allRows,
  selectedDateId,
}) => {
  const [expandedTerm, setExpandedTerm] = useState<string | null>(
    BEGINNER_GLOSSARY[0].term
  );

  // 7-day slice ending on selectedDateId
  const weeklyRows = useMemo(() => {
    const idx = Math.max(
      0,
      allRows.findIndex((r) => r.id === selectedDateId)
    );
    return allRows.slice(idx, idx + 7).reverse();
  }, [allRows, selectedDateId]);

  const weeklyMax = Math.max(...weeklyRows.map((r) => r.weightedAvg), 100);
  const weeklyMin = Math.max(0, Math.min(...weeklyRows.map((r) => r.weightedAvg)) - 10);

  // Monthly averages across the CSV
  const monthlySummaries = useMemo(() => {
    const map = new Map<string, { sum: number; count: number; max: number; min: number }>();
    for (const row of allRows) {
      const existing = map.get(row.monthKey);
      if (!existing) {
        map.set(row.monthKey, {
          sum: row.weightedAvg,
          count: 1,
          max: row.max,
          min: row.min,
        });
      } else {
        existing.sum += row.weightedAvg;
        existing.count += 1;
        existing.max = Math.max(existing.max, row.max);
        existing.min = Math.min(existing.min, row.min);
      }
    }
    return Array.from(map.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .slice(0, 6)
      .map(([monthKey, stats]) => ({
        monthKey,
        label: `${monthKey.slice(0, 4)}년 ${Number(monthKey.slice(5, 7))}월`,
        avg: stats.sum / stats.count,
        max: stats.max,
        min: stats.min,
        days: stats.count,
      }));
  }, [allRows]);

  return (
    <div className="flex flex-col gap-4 pb-6">
      <section className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold text-[#9d4300]">
          한국전력거래소 CSV 기반 분석 · 총 {allRows.length}일
        </span>
        <h1 className="text-[26px] leading-[34px] font-extrabold tracking-[-0.02em] text-[#131b2e]">
          전력 시장 리포트
        </h1>
        <p className="text-[13px] text-[#584237]">
          선택일 기준 최근 7일 SMP 추이와 월별 평균 단가, 입문자 용어를 확인하세요.
        </p>
      </section>

      {/* Weekly 7-day SMP Trend Card */}
      <section className="p-4 rounded-2xl bg-[#ffffff] shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col gap-3">
        <div>
          <h2 className="text-[16px] font-bold text-[#131b2e]">최근 7일 가중평균 SMP</h2>
          <p className="text-[11.5px] text-[#584237]">
            선택한 날짜 기준 직전 7일간의 육지 평균 단가 추이
          </p>
        </div>

        <div className="h-44 pt-6 pb-1 flex items-end justify-between gap-2">
          {weeklyRows.map((item, idx) => {
            const val = item.weightedAvg;
            const pct = Math.max(
              ((val - weeklyMin) / Math.max(weeklyMax - weeklyMin, 1)) * 100,
              18
            );
            const isSelected = idx === weeklyRows.length - 1;
            const dayChar = item.dateLabel.slice(-2, -1);
            const mmdd = item.shortLabel.slice(0, 5);

            return (
              <div
                key={item.id}
                className="flex-1 h-full flex flex-col items-center justify-end gap-1.5"
              >
                <span className="font-mono text-[10px] font-bold text-[#131b2e] tabular-nums">
                  {val.toFixed(1)}
                </span>
                <div className="w-full flex-1 flex items-end">
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      isSelected ? 'bg-[#f97316]' : 'bg-[#d2d9f4]'
                    }`}
                    style={{ height: `${pct.toFixed(1)}%` }}
                  />
                </div>
                <div className="flex flex-col items-center leading-tight">
                  <span
                    className={`text-[11px] font-bold ${
                      isSelected ? 'text-[#9d4300]' : 'text-[#131b2e]'
                    }`}
                  >
                    {dayChar}
                  </span>
                  <span className="font-mono text-[9.5px] text-[#584237] tabular-nums">
                    {mmdd}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Monthly SMP Summary from CSV */}
      <section className="p-4 rounded-2xl bg-[#ffffff] shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col gap-3">
        <div>
          <h2 className="text-[16px] font-bold text-[#131b2e]">월별 육지 SMP 요약</h2>
          <p className="text-[11.5px] text-[#584237]">
            CSV 실데이터 기반 최근 6개월 평균 및 최고·최저 단가(원/kWh)
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {monthlySummaries.map((m) => (
            <div
              key={m.monthKey}
              className="p-3 rounded-xl bg-[#f2f3ff] flex items-center justify-between gap-2"
            >
              <div className="flex flex-col">
                <span className="text-[12.5px] font-bold text-[#131b2e]">{m.label}</span>
                <span className="font-mono text-[10.5px] text-[#584237] tabular-nums">
                  최저 {m.min.toFixed(1)} ~ 최고 {m.max.toFixed(1)} ({m.days}일)
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-[14px] font-extrabold text-[#9d4300] tabular-nums">
                  {m.avg.toFixed(2)}
                </span>
                <span className="text-[10.5px] text-[#584237] ml-0.5">원</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Beginner Glossary Accordion */}
      <section className="p-4 rounded-2xl bg-[#ffffff] shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#f97316] text-[20px]">menu_book</span>
          <h2 className="text-[16px] font-bold text-[#131b2e]">입문자 전력 용어 사전</h2>
        </div>

        <div className="flex flex-col gap-2">
          {BEGINNER_GLOSSARY.map((item) => {
            const isOpen = expandedTerm === item.term;
            return (
              <div
                key={item.term}
                className="rounded-xl bg-[#f2f3ff]/80 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setExpandedTerm(isOpen ? null : item.term)}
                  className="w-full px-3.5 py-3 flex items-center justify-between gap-2 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[13px] font-bold text-[#131b2e] truncate">
                      {item.term}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#ffffff] text-[#9d4300] text-[10px] font-semibold shrink-0">
                      {item.badge}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-[#584237] shrink-0">
                    {isOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {isOpen && (
                  <p className="px-3.5 pb-3 text-[12px] leading-[18px] text-[#584237]">
                    {item.summary}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
