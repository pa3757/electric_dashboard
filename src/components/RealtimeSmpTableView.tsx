import React, { useMemo, useState } from 'react';
import { CsvDailySmpRow, CsvMarketSnapshot } from '../data/csvSmpLoader';

interface RealtimeSmpTableViewProps {
  allRows: CsvDailySmpRow[];
  snapshot: CsvMarketSnapshot;
  selectedDateId: string;
  onSelectDate: (dateId: string) => void;
}

type HourFilter = 'all' | 'peak' | 'normal';

export const RealtimeSmpTableView: React.FC<RealtimeSmpTableViewProps> = ({
  allRows,
  snapshot,
  selectedDateId,
  onSelectDate,
}) => {
  const [hourFilter, setHourFilter] = useState<HourFilter>('all');

  const filteredRows = useMemo(() => {
    return snapshot.hourlyPrices.filter((row) => {
      if (hourFilter === 'peak') return row.isMax || row.isHighTier;
      if (hourFilter === 'normal') return !row.isMax && !row.isHighTier;
      return true;
    });
  }, [snapshot.hourlyPrices, hourFilter]);

  return (
    <div className="flex flex-col gap-4 pb-6">
      <section className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold text-[#9d4300]">
          24시간 정산 단가표 · {snapshot.dateLabel}
        </span>
        <h1 className="text-[26px] leading-[34px] font-extrabold tracking-[-0.02em] text-[#131b2e]">
          시간별 SMP 상세표
        </h1>
        <p className="text-[13px] text-[#584237]">
          선택한 날짜의 01시부터 24시까지 육지 도매 전력 단가(원/kWh)를 표로 확인하세요.
        </p>
      </section>

      {/* Date Dropdown & Filter Controls */}
      <section className="p-3 rounded-2xl bg-[#ffffff] shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col gap-2.5">
        <div className="relative">
          <span className="material-symbols-outlined text-[18px] text-[#f97316] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            calendar_today
          </span>
          <select
            aria-label="상세표 날짜 선택"
            value={selectedDateId}
            onChange={(e) => onSelectDate(e.target.value)}
            className="w-full min-h-[42px] pl-10 pr-9 py-2 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] font-mono text-[12px] font-semibold tabular-nums appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#f97316]/40"
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

        <div className="grid grid-cols-3 p-0.5 bg-[#f2f3ff] rounded-xl text-[11.5px] font-semibold gap-1">
          {(
            [
              { key: 'all', label: '전체 24시간' },
              { key: 'peak', label: '최고·고단가' },
              { key: 'normal', label: '일반 시간' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setHourFilter(tab.key)}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                hourFilter === tab.key
                  ? 'bg-[#ffffff] text-[#131b2e] font-bold shadow-xs'
                  : 'text-[#584237] hover:text-[#131b2e]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Hourly Ledger Table */}
      <section className="rounded-2xl bg-[#ffffff] shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2.5 bg-[#f2f3ff] border-b border-[#e2e7ff] font-mono text-[10.5px] font-semibold text-[#584237]">
          <span className="col-span-4">시간대</span>
          <span className="col-span-3 text-center">구간</span>
          <span className="col-span-2 text-right">전일비</span>
          <span className="col-span-3 text-right">단가(원)</span>
        </div>

        <div className="divide-y divide-[#f2f3ff]">
          {filteredRows.map((row) => {
            const prevPrice = snapshot.prevHourlyPrices
              ? snapshot.prevHourlyPrices[row.hour - 1]
              : null;
            const diff = prevPrice !== null ? row.price - prevPrice : null;

            return (
              <div
                key={row.hour}
                className={`grid grid-cols-12 items-center px-4 py-3 text-[12.5px] ${
                  row.isMax ? 'bg-[#ffdbca]/35' : ''
                }`}
              >
                <div className="col-span-4 flex items-center gap-1.5 font-mono font-semibold text-[#131b2e] tabular-nums">
                  <span>{String(row.hour).padStart(2, '0')}:00</span>
                  {row.isMax && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#f97316] text-[#ffffff]">
                      최고
                    </span>
                  )}
                  {row.isMin && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#dae2fd] text-[#131b2e]">
                      최저
                    </span>
                  )}
                </div>

                <div className="col-span-3 flex justify-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${
                      row.isMax
                        ? 'bg-[#f97316]/20 text-[#9d4300]'
                        : row.isHighTier
                          ? 'bg-[#ffdbca]/60 text-[#9d4300]'
                          : 'bg-[#eaedff] text-[#584237]'
                    }`}
                  >
                    {row.isMax ? '최고 피크' : row.isHighTier ? '고단가' : '일반'}
                  </span>
                </div>

                <div
                  className={`col-span-2 text-right font-mono text-[10.5px] tabular-nums ${
                    diff === null
                      ? 'text-[#8c7164]'
                      : diff > 0
                        ? 'text-[#9d4300]'
                        : diff < 0
                          ? 'text-[#131b2e]'
                          : 'text-[#584237]'
                  }`}
                >
                  {diff === null
                    ? '-'
                    : `${diff > 0 ? '+' : ''}${diff.toFixed(1)}`}
                </div>

                <div
                  className={`col-span-3 text-right font-mono font-bold tabular-nums ${
                    row.isMax
                      ? 'text-[#f97316]'
                      : row.isHighTier
                        ? 'text-[#9d4300]'
                        : 'text-[#131b2e]'
                  }`}
                >
                  {row.price.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
