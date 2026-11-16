export interface CsvDailySmpRow {
  /** YYYY-MM-DD */
  id: string;
  /** Original CSV date string e.g. 2026/11/06 */
  rawDate: string;
  /** Korean formatted date e.g. 2026년 11월 06일 (금) */
  dateLabel: string;
  /** Short label e.g. 11/06 (금) */
  shortLabel: string;
  /** YYYY-MM */
  monthKey: string;
  /** 24 hourly prices (index 0 = 01시, index 23 = 24시) */
  hours: number[];
  /** 최대 column */
  max: number;
  /** 최소 column */
  min: number;
  /** 가중평균 column */
  weightedAvg: number;
}

export interface CsvHourlyPoint {
  hour: number;
  label: string;
  price: number;
  isMax: boolean;
  isMin: boolean;
  isHighTier: boolean;
}

export interface CsvMarketSnapshot {
  id: string;
  mode: 'day' | '7d';
  dateLabel: string;
  shortDateLabel: string;
  average: number;
  prevAverage: number | null;
  deltaAmount: number | null;
  deltaPercent: number | null;
  isUp: boolean;
  monthlyCumulativeAvg: number;
  monthLabel: string;
  sparklineHeights: number[];
  peakHourLabel: string;
  peakPrice: number;
  peakNote: string;
  lowHourLabel: string;
  lowPrice: number;
  lowNote: string;
  spreadAmount: number;
  spreadPercent: number;
  hourlyPrices: CsvHourlyPoint[];
  prevHourlyPrices: number[] | null;
  briefingParagraph: string;
  takeaways: Array<{
    number: number;
    title: string;
    description: string;
  }>;
  updatedAtLabel: string;
}

const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];

export function formatKoreanDate(rawDate: string): {
  id: string;
  dateLabel: string;
  shortLabel: string;
  monthKey: string;
} {
  const parts = rawDate.trim().split('/');
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  const dt = new Date(year, month - 1, day);
  const weekday = WEEKDAYS_KO[dt.getDay()] ?? '';
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');

  return {
    id: `${year}-${mm}-${dd}`,
    dateLabel: `${year}년 ${month}월 ${day}일 (${weekday})`,
    shortLabel: `${mm}/${dd} (${weekday})`,
    monthKey: `${year}-${mm}`,
  };
}

export function parseKpxCsvText(csvText: string): CsvDailySmpRow[] {
  const lines = csvText
    .replace(/^\uFEFF/, '')
    .split(/\r\n|\r|\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    throw new Error('CSV 데이터에 유효한 행이 없습니다.');
  }

  const headers = lines[0].split(',').map((h) => h.trim());
  const dateIdx = headers.findIndex((h) => h === '기간');
  const maxIdx = headers.findIndex((h) => h === '최대');
  const minIdx = headers.findIndex((h) => h === '최소');
  const avgIdx = headers.findIndex((h) => h === '가중평균');

  const hourIndices: number[] = [];
  for (let h = 1; h <= 24; h++) {
    const colName = `${String(h).padStart(2, '0')}시`;
    const idx = headers.findIndex((col) => col === colName);
    hourIndices.push(idx !== -1 ? idx : h);
  }

  const rows: CsvDailySmpRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim());
    const rawDate = cols[dateIdx !== -1 ? dateIdx : 0];
    if (!rawDate || !/^\d{4}\/\d{2}\/\d{2}$/.test(rawDate)) continue;

    const hours = hourIndices.map((idx) => {
      const val = parseFloat(cols[idx]);
      return Number.isFinite(val) ? val : 0;
    });

    const max =
      maxIdx !== -1 && Number.isFinite(parseFloat(cols[maxIdx]))
        ? parseFloat(cols[maxIdx])
        : Math.max(...hours);

    const min =
      minIdx !== -1 && Number.isFinite(parseFloat(cols[minIdx]))
        ? parseFloat(cols[minIdx])
        : Math.min(...hours);

    const weightedAvg =
      avgIdx !== -1 && Number.isFinite(parseFloat(cols[avgIdx]))
        ? parseFloat(cols[avgIdx])
        : Number((hours.reduce((a, b) => a + b, 0) / 24).toFixed(2));

    const formatted = formatKoreanDate(rawDate);

    rows.push({
      id: formatted.id,
      rawDate,
      dateLabel: formatted.dateLabel,
      shortLabel: formatted.shortLabel,
      monthKey: formatted.monthKey,
      hours,
      max,
      min,
      weightedAvg,
    });
  }

  // Sort newest date first
  rows.sort((a, b) => (a.id < b.id ? 1 : a.id > b.id ? -1 : 0));
  return rows;
}

export async function loadKpxSmpCsv(): Promise<CsvDailySmpRow[]> {
  const response = await fetch('/assets/aistudio/HOME________________SMP_e7ca8cd6.csv');
  if (!response.ok) {
    throw new Error(`CSV 파일을 불러올 수 없습니다 (HTTP ${response.status}).`);
  }

  const buffer = await response.arrayBuffer();

  // Try decoding as EUC-KR / CP949 first (standard KPX CSV encoding)
  let decoded = '';
  try {
    const eucKrDecoder = new TextDecoder('euc-kr');
    decoded = eucKrDecoder.decode(buffer);
    if (!decoded.includes('기간') || !decoded.includes('가중평균')) {
      decoded = new TextDecoder('utf-8').decode(buffer);
    }
  } catch {
    decoded = new TextDecoder('utf-8').decode(buffer);
  }

  return parseKpxCsvText(decoded);
}

function buildHourlyPoints(hours: number[]): CsvHourlyPoint[] {
  const maxVal = Math.max(...hours);
  const minVal = Math.min(...hours);
  const spread = Math.max(maxVal - minVal, 1);

  return hours.map((price, idx) => {
    const hour = idx + 1;
    const hourStr = String(hour).padStart(2, '0');
    const isMax = Math.abs(price - maxVal) < 0.001;
    const isMin = Math.abs(price - minVal) < 0.001;
    // Highlight upper-tier hours (top 18% of daily range) as high-tier, while exact max is primary orange
    const isHighTier = !isMax && price >= maxVal - spread * 0.15 && price > minVal;

    let label = `${hourStr}:00`;
    if (isMax) label = `${hourStr}:00 (최고)`;
    else if (isMin) label = `${hourStr}:00 (최저)`;

    return {
      hour,
      label,
      price,
      isMax,
      isMin,
      isHighTier,
    };
  });
}

function describeTimePeriod(hour: number): string {
  if (hour >= 1 && hour <= 5) return '심야 기저부하 구간';
  if (hour >= 6 && hour <= 8) return '이른 오전 수요 증가';
  if (hour >= 9 && hour <= 11) return '오전 피크 부하 구간';
  if (hour >= 12 && hour <= 15) return '정오 태양광 출력 구간';
  if (hour >= 16 && hour <= 20) return '저녁 피크 부하 구간';
  return '야간 수요 완화 구간';
}

export function buildSnapshotForRow(
  allRows: CsvDailySmpRow[],
  selectedRow: CsvDailySmpRow
): CsvMarketSnapshot {
  const rowIndex = allRows.findIndex((r) => r.id === selectedRow.id);
  const prevRow = rowIndex >= 0 && rowIndex + 1 < allRows.length ? allRows[rowIndex + 1] : null;

  const deltaAmount = prevRow
    ? Number((selectedRow.weightedAvg - prevRow.weightedAvg).toFixed(2))
    : null;
  const deltaPercent =
    prevRow && prevRow.weightedAvg > 0
      ? Number((((selectedRow.weightedAvg - prevRow.weightedAvg) / prevRow.weightedAvg) * 100).toFixed(2))
      : null;
  const isUp = deltaAmount !== null ? deltaAmount >= 0 : true;

  // Monthly cumulative average up to selectedRow in the same month
  const monthRows = allRows.filter(
    (r) => r.monthKey === selectedRow.monthKey && r.id <= selectedRow.id
  );
  const monthlyCumulativeAvg =
    monthRows.length > 0
      ? Number(
          (
            monthRows.reduce((sum, r) => sum + r.weightedAvg, 0) / monthRows.length
          ).toFixed(2)
        )
      : selectedRow.weightedAvg;

  // Last 6 days sparkline ending at selectedRow
  const sparkSlice = allRows.slice(rowIndex, rowIndex + 6).reverse();
  const sparkMin = Math.min(...sparkSlice.map((r) => r.weightedAvg));
  const sparkMax = Math.max(...sparkSlice.map((r) => r.weightedAvg));
  const sparkRange = Math.max(sparkMax - sparkMin, 1);
  const sparklineHeights = sparkSlice.map((r) =>
    Math.round(32 + ((r.weightedAvg - sparkMin) / sparkRange) * 68)
  );

  const hourlyPrices = buildHourlyPoints(selectedRow.hours);
  const maxHourPoint = hourlyPrices.find((p) => p.isMax) ?? hourlyPrices[0];
  const minHourPoint = hourlyPrices.find((p) => p.isMin) ?? hourlyPrices[0];

  const spreadAmount = Number((selectedRow.max - selectedRow.min).toFixed(2));
  const spreadPercent =
    selectedRow.min > 0
      ? Number(((spreadAmount / selectedRow.min) * 100).toFixed(1))
      : 0;

  const middayMin = Math.min(
    selectedRow.hours[11],
    selectedRow.hours[12],
    selectedRow.hours[13]
  );
  const hasMiddayDip =
    middayMin < selectedRow.weightedAvg * 0.92 &&
    minHourPoint.hour >= 11 &&
    minHourPoint.hour <= 15;

  const monthNum = Number(selectedRow.monthKey.split('-')[1]);
  const deltaSentence =
    prevRow && deltaAmount !== null && deltaPercent !== null
      ? `전일(${prevRow.shortLabel} ${prevRow.weightedAvg.toFixed(2)}원) 대비 ${Math.abs(deltaAmount).toFixed(2)}원(${deltaAmount >= 0 ? '+' : ''}${deltaPercent.toFixed(2)}%) ${deltaAmount >= 0 ? '상승' : '하락'}했습니다.`
      : '이전 거래일 비교 데이터가 없습니다.';

  const duckCurveSentence = hasMiddayDip
    ? `정오 무렵(${String(minHourPoint.hour).padStart(2, '0')}시경)에는 태양광 발전 출력 유입으로 ${minHourPoint.price.toFixed(2)}원까지 낮아지는 뚜렷한 덕 커브(Duck Curve) 패턴이 나타났습니다.`
    : `하루 중 가장 저렴한 시간대는 ${String(minHourPoint.hour).padStart(2, '0')}시경으로 ${minHourPoint.price.toFixed(2)}원/kWh를 기록했습니다.`;

  const briefingParagraph = `${selectedRow.dateLabel} 육지 가중평균 SMP는 ${selectedRow.weightedAvg.toFixed(2)}원/kWh로, ${deltaSentence} 하루 중 가장 비싼 시간대는 ${String(maxHourPoint.hour).padStart(2, '0')}시경(최고 ${maxHourPoint.price.toFixed(2)}원/kWh)으로 나타났으며, ${duckCurveSentence}`;

  const peakCount = hourlyPrices.filter((p) => p.isMax || p.isHighTier).length;

  return {
    id: selectedRow.id,
    mode: 'day',
    dateLabel: selectedRow.dateLabel,
    shortDateLabel: selectedRow.shortLabel,
    average: selectedRow.weightedAvg,
    prevAverage: prevRow ? prevRow.weightedAvg : null,
    deltaAmount,
    deltaPercent,
    isUp,
    monthlyCumulativeAvg,
    monthLabel: `${monthNum}월 누적 평균`,
    sparklineHeights,
    peakHourLabel: `${String(maxHourPoint.hour).padStart(2, '0')}:00`,
    peakPrice: selectedRow.max,
    peakNote: describeTimePeriod(maxHourPoint.hour),
    lowHourLabel: `${String(minHourPoint.hour).padStart(2, '0')}:00`,
    lowPrice: selectedRow.min,
    lowNote: describeTimePeriod(minHourPoint.hour),
    spreadAmount,
    spreadPercent,
    hourlyPrices,
    prevHourlyPrices: prevRow ? prevRow.hours : null,
    briefingParagraph,
    takeaways: [
      {
        number: 1,
        title: `최고가 ${String(maxHourPoint.hour).padStart(2, '0')}시 (${selectedRow.max.toFixed(2)}원)`,
        description: `하루 중 가장 비싼 시간대로 고단가 구간이 총 ${peakCount}시간 이어졌습니다.`,
      },
      {
        number: 2,
        title: `최저가 ${String(minHourPoint.hour).padStart(2, '0')}시 (${selectedRow.min.toFixed(2)}원)`,
        description: hasMiddayDip
          ? '낮 시간대 태양광 발전량 증가로 점심 무렵 단가가 크게 내려갔습니다.'
          : '전력 수요가 적은 시간대에 기저발전 위주로 공급되며 단가가 안정되었습니다.',
      },
      {
        number: 3,
        title: `일일 변동폭 ${spreadAmount.toFixed(2)}원/kWh`,
        description: `최저가 대비 최고가가 ${spreadPercent.toFixed(1)}% 높아 시간대별 가격 차이가 확인됩니다.`,
      },
    ],
    updatedAtLabel: `KPX 육지 SMP CSV (${selectedRow.rawDate})`,
  };
}

export function build7DayAverageSnapshot(
  allRows: CsvDailySmpRow[],
  anchorRow: CsvDailySmpRow
): CsvMarketSnapshot {
  const anchorIdx = Math.max(
    0,
    allRows.findIndex((r) => r.id === anchorRow.id)
  );
  const windowRows = allRows.slice(anchorIdx, anchorIdx + 7);
  const priorWindowRows = allRows.slice(anchorIdx + 7, anchorIdx + 14);

  const avgHours = Array.from({ length: 24 }, (_, hIdx) => {
    const sum = windowRows.reduce((acc, r) => acc + r.hours[hIdx], 0);
    return Number((sum / windowRows.length).toFixed(2));
  });

  const avgWeighted = Number(
    (
      windowRows.reduce((acc, r) => acc + r.weightedAvg, 0) / windowRows.length
    ).toFixed(2)
  );

  const prevWindowAvg =
    priorWindowRows.length > 0
      ? Number(
          (
            priorWindowRows.reduce((acc, r) => acc + r.weightedAvg, 0) /
            priorWindowRows.length
          ).toFixed(2)
        )
      : null;

  const deltaAmount =
    prevWindowAvg !== null ? Number((avgWeighted - prevWindowAvg).toFixed(2)) : null;
  const deltaPercent =
    prevWindowAvg !== null && prevWindowAvg > 0
      ? Number((((avgWeighted - prevWindowAvg) / prevWindowAvg) * 100).toFixed(2))
      : null;

  const hourlyPrices = buildHourlyPoints(avgHours);
  const maxHourPoint = hourlyPrices.find((p) => p.isMax) ?? hourlyPrices[0];
  const minHourPoint = hourlyPrices.find((p) => p.isMin) ?? hourlyPrices[0];

  const spreadAmount = Number((maxHourPoint.price - minHourPoint.price).toFixed(2));
  const spreadPercent =
    minHourPoint.price > 0
      ? Number(((spreadAmount / minHourPoint.price) * 100).toFixed(1))
      : 0;

  const monthRows = allRows.filter(
    (r) => r.monthKey === anchorRow.monthKey && r.id <= anchorRow.id
  );
  const monthlyCumulativeAvg =
    monthRows.length > 0
      ? Number(
          (
            monthRows.reduce((sum, r) => sum + r.weightedAvg, 0) / monthRows.length
          ).toFixed(2)
        )
      : avgWeighted;

  const sparkSlice = [...windowRows].reverse();
  const sparkMin = Math.min(...sparkSlice.map((r) => r.weightedAvg));
  const sparkMax = Math.max(...sparkSlice.map((r) => r.weightedAvg));
  const sparkRange = Math.max(sparkMax - sparkMin, 1);
  const sparklineHeights = sparkSlice.map((r) =>
    Math.round(32 + ((r.weightedAvg - sparkMin) / sparkRange) * 68)
  );

  const oldestInWindow = windowRows[windowRows.length - 1];
  const rangeLabel = `${oldestInWindow.shortLabel.slice(0, 5)} ~ ${anchorRow.shortLabel.slice(0, 5)} (7일 평균)`;
  const monthNum = Number(anchorRow.monthKey.split('-')[1]);

  return {
    id: `7d-${anchorRow.id}`,
    mode: '7d',
    dateLabel: rangeLabel,
    shortDateLabel: '7일 평균',
    average: avgWeighted,
    prevAverage: prevWindowAvg,
    deltaAmount,
    deltaPercent,
    isUp: deltaAmount !== null ? deltaAmount >= 0 : true,
    monthlyCumulativeAvg,
    monthLabel: `${monthNum}월 누적 평균`,
    sparklineHeights,
    peakHourLabel: `${String(maxHourPoint.hour).padStart(2, '0')}:00`,
    peakPrice: maxHourPoint.price,
    peakNote: describeTimePeriod(maxHourPoint.hour),
    lowHourLabel: `${String(minHourPoint.hour).padStart(2, '0')}:00`,
    lowPrice: minHourPoint.price,
    lowNote: describeTimePeriod(minHourPoint.hour),
    spreadAmount,
    spreadPercent,
    hourlyPrices,
    prevHourlyPrices: null,
    briefingParagraph: `${oldestInWindow.rawDate}부터 ${anchorRow.rawDate}까지 최근 ${windowRows.length}일간 육지 평균 SMP는 ${avgWeighted.toFixed(2)}원/kWh입니다. 시간대별 평균으로는 ${String(maxHourPoint.hour).padStart(2, '0')}시가 ${maxHourPoint.price.toFixed(2)}원으로 가장 높았고, ${String(minHourPoint.hour).padStart(2, '0')}시가 ${minHourPoint.price.toFixed(2)}원으로 가장 낮았습니다.`,
    takeaways: [
      {
        number: 1,
        title: `7일 평균 피크 ${String(maxHourPoint.hour).padStart(2, '0')}시 (${maxHourPoint.price.toFixed(2)}원)`,
        description: '최근 일주일 동안 해당 시간대에 전력 도매단가가 가장 높게 형성되었습니다.',
      },
      {
        number: 2,
        title: `7일 평균 최저 ${String(minHourPoint.hour).padStart(2, '0')}시 (${minHourPoint.price.toFixed(2)}원)`,
        description: '주간 평균 기준 가장 저렴한 전력 거래 시간대입니다.',
      },
      {
        number: 3,
        title: `${monthNum}월 누적 평균 ${monthlyCumulativeAvg.toFixed(2)}원`,
        description: `당월 누적 평균 대비 최근 7일 평균은 ${(avgWeighted - monthlyCumulativeAvg >= 0 ? '+' : '') + (avgWeighted - monthlyCumulativeAvg).toFixed(2)}원 수준입니다.`,
      },
    ],
    updatedAtLabel: `KPX 육지 SMP CSV (${oldestInWindow.rawDate}~${anchorRow.rawDate})`,
  };
}
