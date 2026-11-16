import React, { useEffect, useMemo, useState } from 'react';
import { BriefingView } from './components/BriefingView';
import { MarketReportView } from './components/MarketReportView';
import { RealtimeSmpTableView } from './components/RealtimeSmpTableView';
import {
  build7DayAverageSnapshot,
  buildSnapshotForRow,
  CsvDailySmpRow,
  loadKpxSmpCsv,
} from './data/csvSmpLoader';
import { QuickFilterKey } from './data/smpMarketData';

type NavTab = 'briefing' | 'realtime' | 'report';
type ModalState =
  | null
  | { type: 'notifications' }
  | { type: 'profile' }
  | { type: 'policy'; topic: 'terms' | 'source' | 'support' };

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('briefing');
  const [allRows, setAllRows] = useState<CsvDailySmpRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedDateId, setSelectedDateId] = useState<string>('');
  const [quickFilter, setQuickFilter] = useState<QuickFilterKey | null>('today');
  const [modal, setModal] = useState<ModalState>(null);
  const [unreadAlerts, setUnreadAlerts] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadKpxSmpCsv()
      .then((rows) => {
        if (cancelled) return;
        setAllRows(rows);
        if (rows.length > 0) {
          setSelectedDateId(rows[0].id);
        }
        setLoadError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(
          err instanceof Error ? err.message : 'CSV 데이터를 불러오는 중 오류가 발생했습니다.'
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedRow = useMemo(() => {
    if (allRows.length === 0) return null;
    return allRows.find((r) => r.id === selectedDateId) ?? allRows[0];
  }, [allRows, selectedDateId]);

  const currentSnapshot = useMemo(() => {
    if (!selectedRow) return null;
    if (quickFilter === '7d') {
      return build7DayAverageSnapshot(allRows, selectedRow);
    }
    return buildSnapshotForRow(allRows, selectedRow);
  }, [allRows, selectedRow, quickFilter]);

  const handleSelectDate = (dateId: string) => {
    setSelectedDateId(dateId);
    if (allRows.length > 0 && dateId === allRows[0].id) {
      setQuickFilter('today');
    } else if (allRows.length > 1 && dateId === allRows[1].id) {
      setQuickFilter('yesterday');
    } else {
      setQuickFilter(null);
    }
  };

  const handleSelectQuickFilter = (filter: QuickFilterKey) => {
    setQuickFilter(filter);
    if (allRows.length === 0) return;

    if (filter === 'today') {
      setSelectedDateId(allRows[0].id);
    } else if (filter === 'yesterday') {
      const currentIdx = allRows.findIndex((r) => r.id === selectedDateId);
      const prevIdx =
        currentIdx >= 0 && currentIdx + 1 < allRows.length
          ? currentIdx + 1
          : Math.min(1, allRows.length - 1);
      setSelectedDateId(allRows[prevIdx].id);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#eef0ff] flex justify-center sm:py-4">
      {/* Smartphone Viewport Shell (max-w-[430px]) */}
      <div className="relative w-full max-w-[430px] min-h-screen sm:min-h-[calc(100vh-2rem)] bg-[#faf8ff] sm:rounded-[32px] sm:shadow-[0_24px_60px_-12px_rgba(19,27,46,0.18)] sm:border sm:border-[#ffffff] flex flex-col overflow-x-clip">
        {/* Sticky Smartphone Header (56px) */}
        <header className="sticky top-0 z-40 h-14 px-4 bg-[#faf8ff]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] sm:rounded-t-[32px] flex items-center justify-between gap-2">
          {/* Brand Logo + Wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('briefing')}
            className="flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#f97316] to-[#9d4300] flex items-center justify-center shadow-xs">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-[#ffffff]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
              </svg>
            </span>
            <span className="text-[18px] font-bold tracking-tight text-[#131b2e]">
              GridPulse
            </span>
          </button>

          {/* Right Status & Utility Controls */}
          <div className="flex items-center gap-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e2e7ff]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-pulse" />
              <span className="font-mono text-[10px] font-medium text-[#584237] whitespace-nowrap">
                KPX CSV 연동
              </span>
            </div>

            <button
              type="button"
              aria-label="알림"
              onClick={() => {
                setUnreadAlerts(false);
                setModal({ type: 'notifications' });
              }}
              className="relative w-9 h-9 rounded-lg flex items-center justify-center text-[#584237] hover:bg-[#eaedff] hover:text-[#131b2e] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unreadAlerts && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#f97316]" />
              )}
            </button>

            <button
              type="button"
              aria-label="내 정보 및 설정"
              onClick={() => setModal({ type: 'profile' })}
              className="w-8 h-8 rounded-full bg-[#9d4300] text-[#ffffff] flex items-center justify-center shadow-xs hover:bg-[#a73a00] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </button>
          </div>
        </header>

        {/* Scrollable Smartphone Content Canvas */}
        <main className="flex-1 px-4 pt-4 pb-20">
          {loading && (
            <div className="flex flex-col gap-4 py-4 animate-pulse">
              <div className="h-8 w-44 bg-[#e2e7ff] rounded-xl" />
              <div className="h-24 w-full bg-[#ffffff] rounded-2xl" />
              <div className="h-44 w-full bg-[#ffffff] rounded-2xl" />
              <div className="h-64 w-full bg-[#ffffff] rounded-2xl" />
            </div>
          )}

          {!loading && loadError && (
            <div className="p-5 rounded-2xl bg-[#ffdad6] text-[#93000a] flex flex-col gap-2">
              <div className="flex items-center gap-2 font-bold text-[15px]">
                <span className="material-symbols-outlined text-[20px]">error</span>
                <span>CSV 데이터 연결 오류</span>
              </div>
              <p className="text-[13px]">{loadError}</p>
            </div>
          )}

          {!loading && !loadError && currentSnapshot && (
            <>
              {activeTab === 'briefing' && (
                <BriefingView
                  allRows={allRows}
                  snapshot={currentSnapshot}
                  selectedDateId={selectedDateId}
                  quickFilter={quickFilter}
                  onSelectDate={handleSelectDate}
                  onSelectQuickFilter={handleSelectQuickFilter}
                  onOpenPolicyModal={(topic) => setModal({ type: 'policy', topic })}
                />
              )}

              {activeTab === 'realtime' && (
                <RealtimeSmpTableView
                  allRows={allRows}
                  snapshot={currentSnapshot}
                  selectedDateId={selectedDateId}
                  onSelectDate={handleSelectDate}
                />
              )}

              {activeTab === 'report' && (
                <MarketReportView allRows={allRows} selectedDateId={selectedDateId} />
              )}
            </>
          )}
        </main>

        {/* Sticky Smartphone Bottom Tab Navigation (56px) */}
        <nav
          aria-label="하단 메뉴"
          className="sticky bottom-0 z-40 h-14 px-3 bg-[#ffffff]/95 backdrop-blur-xl border-t border-[#e2e7ff] sm:rounded-b-[32px] grid grid-cols-3 items-center gap-1"
        >
          {(
            [
              { key: 'briefing', label: '전력시장 브리핑', icon: 'dashboard' },
              { key: 'realtime', label: '실시간 SMP', icon: 'schedule' },
              { key: 'report', label: '시장 리포트', icon: 'analytics' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#f97316] text-[#582200] font-bold shadow-xs'
                    : 'text-[#584237] hover:bg-[#f2f3ff] hover:text-[#131b2e]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] leading-none">
                  {tab.icon}
                </span>
                <span className="text-[10.5px] leading-none whitespace-nowrap">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Sheet / Modal Overlay */}
        {modal && (
          <div
            className="fixed inset-0 z-50 bg-[#131b2e]/40 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setModal(null)}
          >
            <div
              className="w-full max-w-[430px] bg-[#ffffff] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col gap-3.5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-[#dae2fd] rounded-full mx-auto sm:hidden" />

              {modal.type === 'notifications' && currentSnapshot && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#f97316] text-[20px]">
                        notifications_active
                      </span>
                      <h3 className="text-[16px] font-bold text-[#131b2e]">
                        선택일 SMP 주요 알림
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModal(null)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#584237] hover:bg-[#f2f3ff] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="p-3 rounded-xl bg-[#ffdbca]/40 flex flex-col gap-0.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#9d4300]">최고 단가 시간대</span>
                        <span className="font-mono text-[#584237]">
                          {currentSnapshot.peakHourLabel}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#131b2e]">
                        {currentSnapshot.dateLabel} 최고가는{' '}
                        <strong>{currentSnapshot.peakPrice.toFixed(2)}원/kWh</strong>입니다.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#f2f3ff] flex flex-col gap-0.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#131b2e]">최저 단가 시간대</span>
                        <span className="font-mono text-[#584237]">
                          {currentSnapshot.lowHourLabel}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#584237]">
                        가장 저렴한 시간대는{' '}
                        <strong className="text-[#131b2e]">
                          {currentSnapshot.lowPrice.toFixed(2)}원/kWh
                        </strong>
                        를 기록했습니다.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {modal.type === 'profile' && allRows.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-[#9d4300] text-[#ffffff] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">person</span>
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold text-[#131b2e]">
                          한국전력거래소 육지 SMP
                        </h3>
                        <p className="text-[11.5px] text-[#584237]">
                          연동 기간: {allRows[allRows.length - 1].rawDate} ~ {allRows[0].rawDate} (
                          {allRows.length}일)
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModal(null)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#584237] hover:bg-[#f2f3ff] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#f2f3ff] flex flex-col gap-2">
                    <span className="text-[12px] font-bold text-[#131b2e]">
                      빠른 날짜 이동
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectDate(allRows[0].id);
                          setModal(null);
                        }}
                        className="py-2 rounded-xl text-[12px] font-bold bg-[#f97316] text-[#ffffff] cursor-pointer"
                      >
                        최신일 ({allRows[0].shortLabel})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectDate(allRows[allRows.length - 1].id);
                          setModal(null);
                        }}
                        className="py-2 rounded-xl text-[12px] font-bold bg-[#ffffff] text-[#584237] cursor-pointer"
                      >
                        첫날 ({allRows[allRows.length - 1].shortLabel})
                      </button>
                    </div>
                  </div>
                </>
              )}

              {modal.type === 'policy' && (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-[16px] font-bold text-[#131b2e]">
                      {modal.topic === 'terms'
                        ? '이용약관 안내'
                        : modal.topic === 'source'
                          ? '데이터 출처 및 기준 안내'
                          : '고객지원'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setModal(null)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#584237] hover:bg-[#f2f3ff] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                  <p className="text-[12.5px] leading-[19px] text-[#584237]">
                    {modal.topic === 'terms' &&
                      'GridPulse에서 제공하는 모든 SMP 시세 및 시장 브리핑 정보는 전력시장 이해를 돕기 위한 참고 자료이며, 실제 전력거래 정산 금액과는 전력시장운영규칙에 따라 차이가 발생할 수 있습니다.'}
                    {modal.topic === 'source' &&
                      '본 서비스는 첨부된 한국전력거래소(KPX) 육지 일별 시간별 SMP CSV(단위: 원/kWh, 기간·01시~24시·최대·최소·가중평균)를 실시간으로 파싱하여 시각화합니다.'}
                    {modal.topic === 'support' &&
                      '전력시장 데이터 해석이나 서비스 이용 중 궁금한 점은 시장 리포트 탭의 입문자 용어 사전을 참고해 주세요.'}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
