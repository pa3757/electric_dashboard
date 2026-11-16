import React, { useCallback, useEffect, useMemo, useState } from 'react';

interface ApiPowerSupplyItem {
  hour: number;
  areaName: string;
  tradeDate: string;
  smp: number;
  forecastDemand: number;
  mlfd?: number;
  jlfd?: number;
  slfd?: number;
}

interface ApiSuccessPayload {
  ok: true;
  date: string;
  endpoint: string;
  fetchedAt: string;
  items: ApiPowerSupplyItem[];
}

interface ApiErrorPayload {
  ok: false;
  date?: string;
  endpoint?: string;
  httpStatus?: number;
  errorCode: string;
  errorMessage: string;
  rawSnippet?: string;
}

type ApiResponsePayload = ApiSuccessPayload | ApiErrorPayload;

function getKstTodayInput(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export const RealtimePowerSupplySection: React.FC = () => {
  const [queryDate, setQueryDate] = useState<string>(getKstTodayInput);
  const [selectedArea, setSelectedArea] = useState<'육지' | '제주'>('육지');
  const [loading, setLoading] = useState<boolean>(true);
  const [result, setResult] = useState<ApiSuccessPayload | null>(null);
  const [errorInfo, setErrorInfo] = useState<ApiErrorPayload | null>(null);
  const [activeHourIndex, setActiveHourIndex] = useState<number | null>(null);

  const fetchSupplyData = useCallback(async (targetDateInput: string) => {
    const yyyymmdd = targetDateInput.replace(/-/g, '');
    setLoading(true);
    setErrorInfo(null);
    setActiveHourIndex(null);

    try {
      const res = await fetch(`/api/power-supply?date=${encodeURIComponent(yyyymmdd)}`);
      const payload = (await res.json()) as ApiResponsePayload;

      if (!res.ok || !payload.ok) {
        const errPayload = !payload.ok
          ? payload
          : {
              ok: false as const,
              errorCode: `HTTP_${res.status}`,
              errorMessage: `요청 처리 중 오류가 발생했습니다 (HTTP ${res.status}).`,
            };
        setResult(null);
        setErrorInfo(errPayload);
        return;
      }

      setResult(payload);
      setErrorInfo(null);
    } catch (err: unknown) {
      setResult(null);
      setErrorInfo({
        ok: false,
        date: yyyymmdd,
        endpoint: 'https://apis.data.go.kr/B552115/SmpWithForecastDemand',
        errorCode: 'FETCH_EXCEPTION',
        errorMessage:
          err instanceof Error
            ? err.message
            : '실시간 전력 수급 API를 호출하는 중 네트워크 오류가 발생했습니다.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSupplyData(queryDate);
  }, [fetchSupplyData, queryDate]);

  const displayItems = useMemo(() => {
    if (!result?.items || result.items.length === 0) return [];
    const filtered = result.items.filter((i) => i.areaName.includes(selectedArea));
    return filtered.length > 0 ? filtered : result.items;
  }, [result, selectedArea]);

  const summary = useMemo(() => {
    if (displayItems.length === 0) return null;
    const demands = displayItems.map((i) => i.forecastDemand).filter((d) => d > 0);
    const smps = displayItems.map((i) => i.smp).filter((s) => s > 0);

    const maxDemandItem = displayItems.reduce((best, cur) =>
      cur.forecastDemand > best.forecastDemand ? cur : best
    );
    const minDemandItem = displayItems.reduce((best, cur) =>
      cur.forecastDemand < best.forecastDemand ? cur : best
    );
    const avgDemand =
      demands.length > 0
        ? demands.reduce((a, b) => a + b, 0) / demands.length
        : 0;
    const avgSmp =
      smps.length > 0 ? smps.reduce((a, b) => a + b, 0) / smps.length : 0;

    return {
      maxDemandItem,
      minDemandItem,
      avgDemand,
      avgSmp,
    };
  }, [displayItems]);

  const activeItem =
    activeHourIndex !== null && displayItems[activeHourIndex]
      ? displayItems[activeHourIndex]
      : null;

  return (
    <section className="relative overflow-hidden p-4 rounded-2xl bg-[#ffffff] shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_16px_-2px_rgba(15,23,42,0.03)] flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-[17px] leading-[24px] font-bold tracking-[-0.01em] text-[#131b2e]">
              실시간 전력 수급
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e2e7ff] text-[#9d4300] font-mono text-[10px] font-semibold">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  errorInfo
                    ? 'bg-[#ba1a1a]'
                    : loading
                      ? 'bg-[#d78900] animate-pulse'
                      : 'bg-[#f97316] animate-pulse'
                }`}
              />
              {errorInfo ? 'API 오류' : loading ? '조회 중' : 'KPX API'}
            </span>
          </div>
          <p className="text-[11.5px] leading-[16px] text-[#584237] mt-0.5">
            공공데이터포털 계통한계가격 및 수요예측 연동 현황
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchSupplyData(queryDate)}
          disabled={loading}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#eaedff] hover:bg-[#dae2fd] text-[#131b2e] text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-60 shrink-0"
        >
          <span
            className={`material-symbols-outlined text-[15px] text-[#9d4300] ${
              loading ? 'animate-spin' : ''
            }`}
          >
            refresh
          </span>
          <span>새로고침</span>
        </button>
      </div>

      {/* API Query Date Picker & Area Switch */}
      <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#f2f3ff]">
        <div className="flex items-center p-0.5 bg-[#eaedff] rounded-lg text-[11px] font-semibold">
          {(['육지', '제주'] as const).map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => {
                setSelectedArea(area);
                setActiveHourIndex(null);
              }}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                selectedArea === area
                  ? 'bg-[#ffffff] text-[#9d4300] font-bold shadow-xs'
                  : 'text-[#584237]'
              }`}
            >
              {area}
            </button>
          ))}
        </div>

        <input
          type="date"
          aria-label="실시간 전력 수급 조회 일자"
          value={queryDate}
          onChange={(e) => {
            if (e.target.value) setQueryDate(e.target.value);
          }}
          className="px-2.5 py-1.5 rounded-lg bg-[#ffffff] text-[#131b2e] font-mono text-[12px] font-semibold border border-[#e2e7ff] focus:outline-none focus:ring-2 focus:ring-[#f97316]/40"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-6 flex flex-col items-center justify-center gap-2 text-[#584237]">
          <span className="material-symbols-outlined text-[24px] text-[#f97316] animate-spin">
            progress_activity
          </span>
          <span className="text-[12px] font-medium">
            KPX 수요예측 및 SMP API 데이터를 조회하고 있습니다...
          </span>
        </div>
      )}

      {/* Error State (explicitly required when request fails) */}
      {!loading && errorInfo && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-[#ffdad6]/75 border border-[#ba1a1a]/20 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[#93000a] font-bold text-[13px]">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>실시간 API 요청 실패</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#ffffff]/80 font-mono text-[10px] font-bold text-[#93000a]">
              {errorInfo.errorCode}
            </span>
          </div>

          <p className="text-[12px] leading-[18px] text-[#93000a] font-medium break-words">
            {errorInfo.errorMessage}
          </p>

          {errorInfo.rawSnippet && (
            <pre className="p-2 rounded-lg bg-[#ffffff]/70 font-mono text-[10px] text-[#584237] overflow-x-auto whitespace-pre-wrap break-all">
              {errorInfo.rawSnippet}
            </pre>
          )}

          <div className="text-[10.5px] font-mono text-[#584237] break-all pt-0.5">
            요청 주소: {errorInfo.endpoint || 'https://apis.data.go.kr/B552115/SmpWithForecastDemand'}
          </div>
        </div>
      )}

      {/* Success Empty State */}
      {!loading && !errorInfo && result && displayItems.length === 0 && (
        <div className="p-4 rounded-xl bg-[#f2f3ff] text-center flex flex-col gap-1">
          <span className="text-[12.5px] font-bold text-[#131b2e]">
            선택한 날짜({result.date})의 API 응답 데이터가 비어 있습니다.
          </span>
          <span className="text-[11.5px] text-[#584237]">
            다른 날짜를 선택해 다시 조회해 보세요.
          </span>
        </div>
      )}

      {/* Success Populated State */}
      {!loading && !errorInfo && result && summary && (
        <>
          {/* Summary Trio */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-[#f2f3ff] flex flex-col gap-0.5">
              <span className="text-[10.5px] font-semibold text-[#584237]">최대 예측수요</span>
              <span className="font-mono text-[13.5px] font-extrabold text-[#9d4300] tabular-nums">
                {Math.round(summary.maxDemandItem.forecastDemand).toLocaleString()}
              </span>
              <span className="font-mono text-[10px] text-[#584237]">
                MW ({String(summary.maxDemandItem.hour).padStart(2, '0')}시)
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#f2f3ff] flex flex-col gap-0.5">
              <span className="text-[10.5px] font-semibold text-[#584237]">평균 예측수요</span>
              <span className="font-mono text-[13.5px] font-extrabold text-[#131b2e] tabular-nums">
                {Math.round(summary.avgDemand).toLocaleString()}
              </span>
              <span className="font-mono text-[10px] text-[#584237]">MW</span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#ffdbca]/45 flex flex-col gap-0.5">
              <span className="text-[10.5px] font-semibold text-[#584237]">예측 평균 SMP</span>
              <span className="font-mono text-[13.5px] font-extrabold text-[#9d4300] tabular-nums">
                {summary.avgSmp.toFixed(2)}
              </span>
              <span className="font-mono text-[10px] text-[#584237]">원/kWh</span>
            </div>
          </div>

          {/* Interactive Forecast Demand Bar Chart */}
          <div className="p-3 rounded-xl bg-[#f2f3ff]/80 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#131b2e]">
                시간별 예측 전력수요 ({selectedArea} · MW)
              </span>
              <span className="font-mono text-[#584237] tabular-nums">
                최소 {Math.round(summary.minDemandItem.forecastDemand).toLocaleString()} MW
              </span>
            </div>

            <div
              className="h-28 pt-4 flex items-end justify-between gap-[3px]"
              onMouseLeave={() => setActiveHourIndex(null)}
            >
              {displayItems.map((item, idx) => {
                const maxD = summary.maxDemandItem.forecastDemand;
                const minD = summary.minDemandItem.forecastDemand;
                const span = Math.max(maxD - minD, 1);
                const paddedMin = Math.max(minD - span * 0.25, 0);
                const ratio = Math.min(
                  Math.max((item.forecastDemand - paddedMin) / Math.max(maxD - paddedMin, 1), 0.14),
                  1
                );
                const isPeak = item.hour === summary.maxDemandItem.hour;
                const isSelected = activeHourIndex === idx;

                return (
                  <button
                    key={`${item.areaName}-${item.hour}`}
                    type="button"
                    aria-label={`${item.hour}시 예측수요 ${Math.round(item.forecastDemand).toLocaleString()} MW`}
                    onMouseEnter={() => setActiveHourIndex(idx)}
                    onClick={() => setActiveHourIndex(isSelected ? null : idx)}
                    className="flex-1 h-full flex items-end cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`w-full rounded-t-[2px] transition-all relative ${
                        isPeak
                          ? 'bg-[#f97316] shadow-xs'
                          : 'bg-[#d2d9f4] hover:bg-[#f97316]/80'
                      } ${isSelected ? 'ring-2 ring-[#131b2e]/40' : ''}`}
                      style={{ height: `${(ratio * 100).toFixed(1)}%` }}
                    >
                      {isPeak && (
                        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 font-mono text-[7.5px] font-extrabold text-[#9d4300]">
                          MAX
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between font-mono text-[9.5px] text-[#584237] tabular-nums">
              <span>01시</span>
              <span>06시</span>
              <span>12시</span>
              <span>18시</span>
              <span>24시</span>
            </div>

            {activeItem && (
              <div className="mt-1 px-2.5 py-1.5 rounded-lg bg-[#283044] text-[#eef0ff] font-mono text-[11px] flex items-center justify-between">
                <span className="text-[#ffdbca] font-semibold">
                  {String(activeItem.hour).padStart(2, '0')}:00 ({activeItem.areaName})
                </span>
                <span className="tabular-nums">
                  {Math.round(activeItem.forecastDemand).toLocaleString()} MW ·{' '}
                  {activeItem.smp.toFixed(2)}원
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[10.5px] font-mono text-[#584237]">
            <span>
              전국 계통 최대:{' '}
              {Math.max(...displayItems.map((i) => i.slfd || i.forecastDemand)).toLocaleString()} MW
            </span>
            <span>기준일: {result.date}</span>
          </div>
        </>
      )}
    </section>
  );
};
