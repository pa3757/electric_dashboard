import React, { useMemo, useState } from 'react';
import { CsvHourlyPoint } from '../data/csvSmpLoader';

interface HourlySmpChartProps {
  hourlyPrices: CsvHourlyPoint[];
  dateLabel: string;
}

export const HourlySmpChart: React.FC<HourlySmpChartProps> = ({
  hourlyPrices,
  dateLabel,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { minAxis, maxAxis, yTicks, maxHour, minHour } = useMemo(() => {
    const prices = hourlyPrices.map((p) => p.price);
    const rawMax = Math.max(...prices, 100);
    const rawMin = Math.min(...prices, 80);

    // Choose clean rounded 5-tick Y-axis bounds
    const stepBase = rawMax - rawMin > 120 ? 40 : rawMax - rawMin > 60 ? 20 : 10;
    const axisMin = Math.max(0, Math.floor((rawMin - stepBase * 0.6) / stepBase) * stepBase);
    const axisMax = Math.ceil((rawMax + stepBase * 0.4) / stepBase) * stepBase;
    const span = Math.max(axisMax - axisMin, 40);
    const tickStep = span / 4;
    const ticks = [
      Math.round(axisMax),
      Math.round(axisMin + tickStep * 3),
      Math.round(axisMin + tickStep * 2),
      Math.round(axisMin + tickStep),
      Math.round(axisMin),
    ];

    const maxPt = hourlyPrices.find((p) => p.isMax) ?? hourlyPrices[0];
    const minPt = hourlyPrices.find((p) => p.isMin) ?? hourlyPrices[0];

    return {
      minAxis: axisMin,
      maxAxis: axisMax,
      yTicks: ticks,
      maxHour: maxPt?.hour ?? 18,
      minHour: minPt?.hour ?? 4,
    };
  }, [hourlyPrices]);

  const activePoint = activeIndex !== null ? hourlyPrices[activeIndex] : null;
  const activePercentX =
    activeIndex !== null ? ((activeIndex + 0.5) / hourlyPrices.length) * 100 : 50;
  const clampedTooltipX = Math.min(Math.max(activePercentX, 24), 76);

  return (
    <section className="p-4 rounded-2xl bg-[#ffffff] shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_16px_-2px_rgba(15,23,42,0.03)] flex flex-col">
      {/* Header Row */}
      <div className="flex flex-col gap-3 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-[17px] leading-[24px] font-bold tracking-[-0.01em] text-[#131b2e]">
                시간별 SMP 단가 추이
              </h3>
              <span className="font-mono text-[10px] font-medium px-2 py-0.5 rounded bg-[#e2e7ff] text-[#584237] uppercase tracking-wider whitespace-nowrap">
                01시 ~ 24시
              </span>
            </div>
            <p className="text-[12px] leading-[17px] text-[#584237] mt-1">
              {dateLabel} 기준 · 막대를 터치하면 시간별 단가를 확인할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Legend & Region Tag */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5 text-[11px] font-semibold text-[#584237]">
            <span className="flex items-center gap-1 whitespace-nowrap">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#f97316] inline-block" />
              최고 시간대
            </span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#ffb690] inline-block" />
              고단가
            </span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#d2d9f4] inline-block" />
              일반시간
            </span>
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#eaedff] text-[11px] font-bold text-[#9d4300] whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f97316]" />
            육지 SMP
          </div>
        </div>
      </div>

      {/* Interactive Bar Chart Area */}
      <div className="relative w-full mt-1 pt-2">
        {/* Floating Active Tooltip */}
        <div
          className={`absolute -top-2 bg-[#283044] text-[#eef0ff] px-2.5 py-1.5 rounded-xl shadow-lg font-mono text-[11px] pointer-events-none transition-all duration-150 z-20 flex items-center gap-1.5 whitespace-nowrap ${
            activePoint ? 'opacity-100 -translate-y-1' : 'opacity-0 translate-y-1'
          }`}
          style={{
            left: `calc(28px + (100% - 28px) * ${clampedTooltipX / 100})`,
            transform: 'translateX(-50%)',
          }}
        >
          {activePoint && (
            <>
              <span className="font-semibold text-[#ffdbca]">{activePoint.label}</span>
              <span className="text-[#8c7164]">|</span>
              <span className="font-bold text-[#ffffff] tabular-nums">
                {activePoint.price.toFixed(2)} 원
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-bold ${
                  activePoint.isMax
                    ? 'bg-[#f97316] text-[#ffffff]'
                    : activePoint.isHighTier
                      ? 'bg-[#9d4300] text-[#ffdbca]'
                      : 'bg-[#3f485e] text-[#eef0ff]'
                }`}
              >
                {activePoint.isMax ? '최고가' : activePoint.isHighTier ? '고단가' : '일반'}
              </span>
            </>
          )}
        </div>

        {/* 24-Hour Bar Canvas */}
        <div className="relative h-56 w-full flex items-end pt-7 pb-1">
          {/* Y-Axis Gridlines */}
          <div className="absolute inset-0 top-7 bottom-1 flex flex-col justify-between pointer-events-none">
            {yTicks.map((tick, idx) => (
              <div key={`${tick}-${idx}`} className="w-full flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-[#584237] w-7 text-right tabular-nums shrink-0">
                  {tick}
                </span>
                <div className="w-full h-px bg-[#e2e7ff]" />
              </div>
            ))}
          </div>

          {/* 24 Vertical Bars */}
          <div
            className="relative z-10 w-full ml-8 h-full flex items-end justify-between gap-[3px]"
            onMouseLeave={() => setActiveIndex(null)}
          >
            {hourlyPrices.map((point, index) => {
              const clampedRatio = Math.min(
                Math.max((point.price - minAxis) / Math.max(maxAxis - minAxis, 1), 0.08),
                0.98
              );
              const heightPct = `${(clampedRatio * 100).toFixed(1)}%`;
              const isSelected = activeIndex === index;

              let barColor = 'bg-[#d2d9f4] hover:bg-[#f97316]/80';
              if (point.isMax) {
                barColor =
                  'bg-[#f97316] shadow-[0_2px_10px_rgba(249,115,22,0.4)] hover:bg-[#9d4300]';
              } else if (point.isHighTier) {
                barColor = 'bg-[#ffb690] hover:bg-[#f97316]';
              } else if (point.isMin) {
                barColor = 'bg-[#dae2fd] hover:bg-[#f97316]/80';
              }

              return (
                <button
                  key={point.hour}
                  type="button"
                  aria-label={`${point.hour}시 ${point.price.toFixed(2)}원`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => setActiveIndex(isSelected ? null : index)}
                  className="group relative flex-1 h-full flex items-end cursor-pointer focus:outline-none"
                >
                  <div
                    className={`w-full rounded-t-[3px] transition-all duration-150 relative ${barColor} ${
                      isSelected ? 'ring-2 ring-[#131b2e]/50 brightness-95' : ''
                    }`}
                    style={{ height: heightPct }}
                  >
                    {point.isMax && (
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 font-mono text-[8px] font-extrabold text-[#9d4300] tracking-tight">
                        MAX
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* X-Axis Timestamps */}
        <div className="ml-8 flex justify-between text-[#584237] font-mono text-[9.5px] pt-2 tabular-nums">
          <span>01시</span>
          <span>04시</span>
          <span>08시</span>
          <span>12시</span>
          <span>16시</span>
          <span>20시</span>
          <span>24시</span>
        </div>
      </div>

      {/* Selected Hour Quick Readout */}
      {activePoint && (
        <div className="mt-3 px-3 py-2 rounded-xl bg-[#ffdbca]/40 flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-1.5 text-[#131b2e] font-semibold">
            <span className="material-symbols-outlined text-[16px] text-[#9d4300]">schedule</span>
            <span className="font-mono">{activePoint.label}</span>
            <span className="text-[#584237] font-normal">
              ({activePoint.isMax ? '당일 최고가' : activePoint.isHighTier ? '고단가 구간' : '일반 구간'})
            </span>
          </div>
          <span className="font-mono font-bold text-[#9d4300] tabular-nums">
            {activePoint.price.toFixed(2)} 원/kWh
          </span>
        </div>
      )}

      {/* Footnote Strip */}
      <div className="mt-3 bg-[#f2f3ff] rounded-xl px-3 py-2.5 flex flex-col gap-1 text-[11.5px]">
        <div className="flex items-start gap-1.5 text-[#584237] leading-[16px]">
          <span className="material-symbols-outlined text-[#f97316] text-[15px] mt-0.5 shrink-0">
            info
          </span>
          <span>
            주황색 막대({String(maxHour).padStart(2, '0')}시)가 하루 중 가장 비싼 시간대이며,{' '}
            {String(minHour).padStart(2, '0')}시가 가장 저렴했습니다.
          </span>
        </div>
        <div className="flex justify-end">
          <span className="font-mono text-[10.5px] text-[#131b2e] font-semibold">
            단위: 원 / kWh
          </span>
        </div>
      </div>
    </section>
  );
};
