export type RegionKey = 'land' | 'jeju';
export type QuickFilterKey = 'yesterday' | 'today' | '7d';

export interface HourlyPricePoint {
  hour: number;
  label: string;
  price: number;
  isPeak: boolean;
  isMax?: boolean;
  isMin?: boolean;
}

export interface MarketSnapshot {
  id: string;
  dateLabel: string;
  shortDateLabel: string;
  region: RegionKey;
  average: number;
  prevAverage: number;
  deltaAmount: number;
  deltaPercent: number;
  isUp: boolean;
  monthlyCumulativeAvg: number;
  sparklineHeights: number[];
  peakHourLabel: string;
  peakPrice: number;
  peakNote: string;
  lowHourLabel: string;
  lowPrice: number;
  lowNote: string;
  reserveMarginPercent: number;
  reserveStatusLabel: string;
  reserveCapacityGw: string;
  hourlyPrices: HourlyPricePoint[];
  briefingParagraph: string;
  takeaways: Array<{
    number: number;
    title: string;
    description: string;
  }>;
  updatedAtLabel: string;
}

function buildHourlySeries(
  prices: number[],
  peakHours: number[] = [9, 10, 11, 17, 18, 19]
): HourlyPricePoint[] {
  const maxVal = Math.max(...prices);
  const minVal = Math.min(...prices);
  let maxAssigned = false;
  let minAssigned = false;

  return prices.map((price, idx) => {
    const hour = idx + 1;
    const hourStr = hour.toString().padStart(2, '0');
    const isMax = !maxAssigned && price === maxVal;
    if (isMax) maxAssigned = true;
    const isMin = !minAssigned && price === minVal;
    if (isMin) minAssigned = true;

    let label = `${hourStr}:00`;
    if (isMax) label = `${hourStr}:00 (최고)`;
    else if (isMin) label = `${hourStr}:00 (최저)`;

    return {
      hour,
      label,
      price,
      isPeak: peakHours.includes(hour),
      isMax,
      isMin,
    };
  });
}

export const DATE_OPTIONS: Array<{ id: string; label: string; quickFilter?: QuickFilterKey }> = [
  { id: '2025-05-19', label: '2025년 5월 19일 (월)', quickFilter: 'today' },
  { id: '2025-05-18', label: '2025년 5월 18일 (일)', quickFilter: 'yesterday' },
  { id: '2025-05-17', label: '2025년 5월 17일 (토)' },
  { id: '2025-05-16', label: '2025년 5월 16일 (금)' },
  { id: '2025-05-15', label: '2025년 5월 15일 (목)' },
];

const LAND_TODAY_PRICES = [
  118.4, 116.8, 115.5, 115.1, 117.2, 124.9, 135.0, 145.8,
  158.4, 162.7, 160.1, 146.5, 141.2, 144.3, 148.9, 154.2,
  164.5, 168.2, 163.4, 152.0, 142.1, 133.5, 125.8, 120.3,
];

const JEJU_TODAY_PRICES = [
  134.2, 131.5, 129.8, 128.4, 131.9, 140.5, 151.2, 163.8,
  175.4, 179.6, 174.8, 159.2, 152.4, 156.8, 162.5, 169.4,
  182.1, 189.6, 184.2, 171.5, 160.8, 150.4, 142.6, 137.7,
];

const LAND_YESTERDAY_PRICES = [
  114.2, 113.0, 112.4, 112.9, 114.8, 121.0, 129.5, 139.2,
  148.6, 153.4, 151.0, 142.1, 137.4, 140.2, 144.8, 150.5,
  158.2, 161.8, 157.4, 148.9, 139.5, 131.2, 124.0, 118.6,
];

const JEJU_YESTERDAY_PRICES = [
  130.1, 128.4, 126.9, 126.2, 129.0, 137.4, 146.8, 158.2,
  168.5, 172.0, 167.4, 154.6, 148.9, 152.0, 158.3, 164.9,
  176.2, 183.4, 178.0, 166.3, 156.1, 146.5, 139.0, 134.2,
];

const LAND_7D_PRICES = [
  116.8, 115.2, 114.1, 113.8, 116.0, 123.4, 133.2, 143.9,
  155.1, 159.4, 156.8, 144.9, 139.8, 142.7, 147.2, 152.8,
  162.4, 166.1, 161.5, 150.8, 141.0, 132.4, 124.9, 119.4,
];

const JEJU_7D_PRICES = [
  132.5, 130.1, 128.6, 127.5, 130.8, 139.2, 149.4, 161.2,
  172.4, 176.2, 171.8, 157.4, 151.0, 155.1, 160.8, 167.6,
  179.8, 186.4, 181.2, 169.0, 158.6, 148.8, 141.2, 136.4,
];

const LAND_SAT_PRICES = [
  115.4, 114.1, 113.2, 112.7, 114.9, 122.0, 131.1, 140.8,
  150.2, 154.8, 152.1, 143.5, 138.9, 141.6, 145.9, 151.4,
  159.7, 163.1, 158.9, 149.8, 140.2, 132.0, 124.7, 119.2,
];

const LAND_FRI_PRICES = [
  119.2, 117.6, 116.4, 115.8, 118.1, 126.3, 137.4, 148.2,
  160.5, 164.9, 162.0, 147.8, 142.5, 145.6, 150.4, 156.1,
  166.8, 170.4, 165.2, 153.6, 143.4, 134.8, 126.9, 121.4,
];

const LAND_THU_PRICES = [
  117.8, 116.2, 114.9, 114.4, 116.7, 124.1, 134.2, 144.9,
  157.2, 161.5, 158.9, 145.6, 140.4, 143.5, 148.1, 153.4,
  163.8, 167.4, 162.5, 151.3, 141.5, 132.9, 125.2, 119.8,
];

export function getMarketSnapshot(
  dateId: string,
  quickFilter: QuickFilterKey | null,
  region: RegionKey
): MarketSnapshot {
  if (quickFilter === '7d') {
    if (region === 'jeju') {
      return {
        id: '7d-jeju',
        dateLabel: '최근 7일 종합',
        shortDateLabel: '7일 평균',
        region: 'jeju',
        average: 158.92,
        prevAverage: 156.15,
        deltaAmount: 2.77,
        deltaPercent: 1.77,
        isUp: true,
        monthlyCumulativeAvg: 157.4,
        sparklineHeights: [55, 62, 58, 75, 70, 92],
        peakHourLabel: '18:00',
        peakPrice: 186.4,
        peakNote: '저녁 LNG 발전 가중',
        lowHourLabel: '04:00',
        lowPrice: 127.5,
        lowNote: '심야 풍력 출력 양호',
        reserveMarginPercent: 16.8,
        reserveStatusLabel: '정상 (안정)',
        reserveCapacityGw: '제주 계통 안정 운영',
        hourlyPrices: buildHourlySeries(JEJU_7D_PRICES),
        briefingParagraph:
          '최근 7일간 제주 지역 평균 SMP는 158.92원/kWh로 직전 주 대비 1.77% 상승했습니다. 낮 시간대 태양광 출력 제어 및 풍력 발전 유입으로 12~14시 단가가 완화되었으나, 일몰 이후 17~19시 사이 저녁 피크 시간대에는 육지 연계선(HVDC) 및 LNG 발전 비중이 높아지며 180원대 후반까지 형성되었습니다.',
        takeaways: [
          {
            number: 1,
            title: '제주 저녁 피크 186원대',
            description: '태양광 발전이 종료되는 18시 무렵 주간 최고 단가가 반복 형성되었습니다.',
          },
          {
            number: 2,
            title: '주간 신재생 출력 안정화',
            description: '맑은 날씨가 이어지며 낮 12~14시 제주 도매단가 상승 압력을 낮췄습니다.',
          },
          {
            number: 3,
            title: '제주 계통 수급 원활',
            description: '주간 평균 예비율 16.8%로 별도 수급 경보 없이 안정적으로 운영되었습니다.',
          },
        ],
        updatedAtLabel: '2025.05.19 18:00 기준 (7일 평균)',
      };
    }

    return {
      id: '7d-land',
      dateLabel: '최근 7일 종합',
      shortDateLabel: '7일 평균',
      region: 'land',
      average: 141.12,
      prevAverage: 138.9,
      deltaAmount: 2.22,
      deltaPercent: 1.6,
      isUp: true,
      monthlyCumulativeAvg: 140.18,
      sparklineHeights: [50, 62, 55, 78, 72, 95],
      peakHourLabel: '18:00',
      peakPrice: 166.1,
      peakNote: '저녁 피크 부하 가중',
      lowHourLabel: '04:00',
      lowPrice: 113.8,
      lowNote: '심야 기저발전 위주',
      reserveMarginPercent: 19.2,
      reserveStatusLabel: '정상 (안정)',
      reserveCapacityGw: '평균 예비력 14.2 GW',
      hourlyPrices: buildHourlySeries(LAND_7D_PRICES),
      briefingParagraph:
        '최근 7일간 육지 평균 SMP는 141.12원/kWh로 전주 대비 2.22원(+1.60%) 완만하게 상승했습니다. 평일 산업체 가동과 초여름 기온 상승으로 오전 10시(159.4원)와 저녁 18시(166.1원)에 이중 피크가 뚜렷하게 나타났으며, 낮 13시경에는 태양광 발전량 증가로 139원대까지 하락하는 덕 커브 흐름이 지속되었습니다.',
      takeaways: [
        {
          number: 1,
          title: '오전·저녁 이중 피크 패턴',
          description: '10시경 159원, 18시경 166원대로 하루 두 차례 단가 고점이 형성되었습니다.',
        },
        {
          number: 2,
          title: '정오 태양광 가격 완충 지속',
          description: '최근 1주일간 12~14시 태양광 발전 호조로 점심 시간대 단가가 안정되었습니다.',
        },
        {
          number: 3,
          title: '주간 전력 예비율 여유',
          description: '평균 예비율 19.2%로 안정적 전력 공급 여력을 꾸준히 유지했습니다.',
        },
      ],
      updatedAtLabel: '2025.05.19 18:00 기준 (7일 평균)',
    };
  }

  if (quickFilter === 'yesterday' || dateId === '2025-05-18') {
    if (region === 'jeju') {
      return {
        id: '2025-05-18-jeju',
        dateLabel: '2025년 5월 18일 (일)',
        shortDateLabel: '어제',
        region: 'jeju',
        average: 155.8,
        prevAverage: 158.2,
        deltaAmount: -2.4,
        deltaPercent: -1.52,
        isUp: false,
        monthlyCumulativeAvg: 157.1,
        sparklineHeights: [65, 70, 60, 58, 52, 48],
        peakHourLabel: '18:00',
        peakPrice: 183.4,
        peakNote: '일몰 후 저녁 수요 집중',
        lowHourLabel: '04:00',
        lowPrice: 126.2,
        lowNote: '주말 심야 부하 감소',
        reserveMarginPercent: 18.2,
        reserveStatusLabel: '정상 (안정)',
        reserveCapacityGw: '제주 계통 여유 양호',
        hourlyPrices: buildHourlySeries(JEJU_YESTERDAY_PRICES),
        briefingParagraph:
          '어제(5월 18일 일요일) 제주 평균 SMP는 155.80원/kWh로 주말 상업용 전력 수요 감소에 힘입어 전일 대비 1.52% 하락했습니다. 오전 피크 폭이 평일 대비 완만했으나 저녁 18시에는 가정용 냉방·조명 수요가 집중되며 183.40원을 기록했습니다.',
        takeaways: [
          {
            number: 1,
            title: '주말 수요 감소로 소폭 하락',
            description: '상업·산업 부하가 줄어들며 전일 대비 2.40원 낮아진 흐름을 보였습니다.',
          },
          {
            number: 2,
            title: '풍력·태양광 동반 기여',
            description: '낮 시간대 신재생 발전 비중 확대로 오전~오후 단가가 안정되었습니다.',
          },
          {
            number: 3,
            title: '여유로운 휴일 전력 수급',
            description: '예비율 18.2% 수준을 유지해 수급 불안 요인이 전혀 없었습니다.',
          },
        ],
        updatedAtLabel: '2025.05.18 24:00 확정 기준',
      };
    }

    return {
      id: '2025-05-18-land',
      dateLabel: '2025년 5월 18일 (일)',
      shortDateLabel: '어제',
      region: 'land',
      average: 139.43,
      prevAverage: 141.25,
      deltaAmount: -1.82,
      deltaPercent: -1.29,
      isUp: false,
      monthlyCumulativeAvg: 139.95,
      sparklineHeights: [65, 72, 60, 68, 58, 52],
      peakHourLabel: '18:00',
      peakPrice: 161.8,
      peakNote: '주말 저녁 가정 부하',
      lowHourLabel: '03:00',
      lowPrice: 112.4,
      lowNote: '심야 기저발전 위주',
      reserveMarginPercent: 21.4,
      reserveStatusLabel: '정상 (안정)',
      reserveCapacityGw: '예비력 15.6 GW 확보',
      hourlyPrices: buildHourlySeries(LAND_YESTERDAY_PRICES),
      briefingParagraph:
        '어제(5월 18일 일요일) 하루 평균 SMP는 139.43원/kWh로 주말 휴무에 따른 산업체 전력 수요 감소 영향으로 전일 대비 1.82원(-1.29%) 하락했습니다. 새벽 03시 112.40원으로 저점을 형성했고, 저녁 18시경 가정 및 상업시설 수요가 몰리며 161.80원까지 올랐으나 전반적으로 차분한 시세를 보였습니다.',
      takeaways: [
        {
          number: 1,
          title: '휴일 산업 부하 감소 효과',
          description: '공장 가동률이 낮아 오전 피크 상승폭이 평일보다 10원 이상 낮았습니다.',
        },
        {
          number: 2,
          title: '새벽 03시 최저 112.40원',
          description: '원자력 등 기저발전기 중심으로 전력이 공급되어 단가가 안정되었습니다.',
        },
        {
          number: 3,
          title: '높은 수급 예비율 21.4%',
          description: '15.6 GW의 충분한 예비력을 확보해 안정적인 계통 상태를 기록했습니다.',
        },
      ],
      updatedAtLabel: '2025.05.18 24:00 확정 기준',
    };
  }

  // Specific historical dates (Sat/Fri/Thu)
  if (dateId === '2025-05-17' || dateId === '2025-05-16' || dateId === '2025-05-15') {
    const basePrices =
      dateId === '2025-05-17'
        ? LAND_SAT_PRICES
        : dateId === '2025-05-16'
          ? LAND_FRI_PRICES
          : LAND_THU_PRICES;
    const adjustedPrices =
      region === 'jeju' ? basePrices.map((p) => Number((p + 17.8).toFixed(2))) : basePrices;
    const avg = Number((adjustedPrices.reduce((a, b) => a + b, 0) / 24).toFixed(2));
    const maxP = Math.max(...adjustedPrices);
    const minP = Math.min(...adjustedPrices);
    const dateOption = DATE_OPTIONS.find((d) => d.id === dateId)!;

    return {
      id: `${dateId}-${region}`,
      dateLabel: dateOption.label,
      shortDateLabel: dateOption.label.slice(6, 12),
      region,
      average: avg,
      prevAverage: Number((avg - 1.45).toFixed(2)),
      deltaAmount: 1.45,
      deltaPercent: Number(((1.45 / (avg - 1.45)) * 100).toFixed(2)),
      isUp: true,
      monthlyCumulativeAvg: region === 'jeju' ? 157.2 : 140.05,
      sparklineHeights: [50, 60, 56, 72, 68, 84],
      peakHourLabel: '18:00',
      peakPrice: maxP,
      peakNote: '저녁 피크 부하 가중',
      lowHourLabel: '04:00',
      lowPrice: minP,
      lowNote: '심야 기저발전 위주',
      reserveMarginPercent: dateId === '2025-05-17' ? 20.1 : 17.9,
      reserveStatusLabel: '정상 (안정)',
      reserveCapacityGw: region === 'jeju' ? '제주 계통 안정 운영' : '예비력 13.5 GW 확보',
      hourlyPrices: buildHourlySeries(adjustedPrices),
      briefingParagraph: `${dateOption.label} ${region === 'jeju' ? '제주' : '육지'} 평균 SMP는 ${avg.toFixed(2)}원/kWh로 집계되었습니다. 18시경 최고 ${maxP.toFixed(2)}원까지 상승했으며, 심야 04시경 ${minP.toFixed(2)}원으로 가장 저렴한 단가를 나타냈습니다. 정오 시간대 태양광 출력 유입이 가격 급등을 효과적으로 억제했습니다.`,
      takeaways: [
        {
          number: 1,
          title: '저녁 18시 피크 도달',
          description: `해당 일자 최고 단가는 18시 기준 ${maxP.toFixed(2)}원/kWh로 기록되었습니다.`,
        },
        {
          number: 2,
          title: '심야 최저 단가 구간',
          description: `새벽 04시경 ${minP.toFixed(2)}원/kWh로 하루 중 가장 낮은 수준을 보였습니다.`,
        },
        {
          number: 3,
          title: '안정적인 계통 예비력',
          description: '전일과 유사한 수급 균형 속에 비상 단계 없이 원활히 공급되었습니다.',
        },
      ],
      updatedAtLabel: `${dateId.replace(/-/g, '.')} 24:00 확정 기준`,
    };
  }

  // Default: Today (2025-05-19)
  if (region === 'jeju') {
    return {
      id: '2025-05-19-jeju',
      dateLabel: '2025년 5월 19일 (월)',
      shortDateLabel: '오늘',
      region: 'jeju',
      average: 161.4,
      prevAverage: 155.8,
      deltaAmount: 5.6,
      deltaPercent: 3.59,
      isUp: true,
      monthlyCumulativeAvg: 158.12,
      sparklineHeights: [55, 65, 60, 74, 80, 100],
      peakHourLabel: '18:00',
      peakPrice: 189.6,
      peakNote: '일몰 후 LNG 기동 증가',
      lowHourLabel: '04:00',
      lowPrice: 128.4,
      lowNote: '심야 풍력 발전 유입',
      reserveMarginPercent: 16.4,
      reserveStatusLabel: '정상 (안정)',
      reserveCapacityGw: '제주 계통 정상 운영',
      hourlyPrices: buildHourlySeries(JEJU_TODAY_PRICES),
      briefingParagraph:
        '오늘(5월 19일) 제주 지역 하루 평균 SMP는 161.40원/kWh로 어제(155.80원) 대비 5.60원(+3.59%) 상승했습니다. 월요일 업무 재개와 기온 상승으로 오전 10시(179.60원)와 저녁 18시(189.60원)에 강한 상승 흐름이 나타났으며, 낮 12~14시에는 제주 내 태양광 발전 출력이 늘며 단가가 150원대로 일시 하락했습니다.',
      takeaways: [
        {
          number: 1,
          title: '제주 저녁 피크 189.60원',
          description: '태양광 발전 종료 직후인 18시경 도내 최고 단가가 형성되었습니다.',
        },
        {
          number: 2,
          title: '낮 12~14시 신재생 완충',
          description: '풍부한 일사량 덕분에 정오 무렵 가격 상승세가 잠시 꺾였습니다.',
        },
        {
          number: 3,
          title: '제주 전력 수급 안정',
          description: '예비율 16.4%로 도내 전력 공급에는 차질이 없는 상태입니다.',
        },
      ],
      updatedAtLabel: '2025.05.19 18:00 기준',
    };
  }

  return {
    id: '2025-05-19-land',
    dateLabel: '2025년 5월 19일 (월)',
    shortDateLabel: '오늘',
    region: 'land',
    average: 142.85,
    prevAverage: 139.43,
    deltaAmount: 3.42,
    deltaPercent: 2.45,
    isUp: true,
    monthlyCumulativeAvg: 140.18,
    sparklineHeights: [50, 67, 58, 83, 75, 100],
    peakHourLabel: '18:00',
    peakPrice: 168.2,
    peakNote: '저녁 피크 부하 가중',
    lowHourLabel: '04:00',
    lowPrice: 115.1,
    lowNote: '심야 기저발전 위주',
    reserveMarginPercent: 18.5,
    reserveStatusLabel: '정상 (안정)',
    reserveCapacityGw: '예비력 13.8 GW 확보',
    hourlyPrices: buildHourlySeries(LAND_TODAY_PRICES),
    briefingParagraph:
      '오늘(5월 19일) 하루 평균 SMP는 142.85원/kWh로, 평년 및 전일 대비 소폭 상승세를 나타냈습니다. 오후 17시~19시 퇴근 및 저녁 시간대 냉·난방 전력 수요 집중과 LNG 발전기 기동 비중 증가로 인해 해당 시간대 최고 168.20원까지 상승했습니다. 반면 심야 시간대(02~06시)는 기저부하 발전 위주로 가동되어 110~120원대의 안정적인 흐름을 유지했습니다. 신재생에너지 발전 비중이 높은 정오 무렵(12~14시)에는 태양광 발전 출력 증가로 가격 상승이 일시 둔화되는 전형적인 덕 커브(Duck Curve) 현상의 완만한 초기 패턴이 관측되었습니다.',
    takeaways: [
      {
        number: 1,
        title: '퇴근길 저녁 피크 주의',
        description: '18시경 168.20원으로 하루 중 단가가 최고조에 달했습니다.',
      },
      {
        number: 2,
        title: '낮 12~14시 태양광 방어 효과',
        description: '쾌청한 날씨로 태양광 발전량이 유입되며 점심 가격 급등을 막았습니다.',
      },
      {
        number: 3,
        title: '수급 비상 단계 없음',
        description: '예비율 18.5%로 전력 수급 상황은 전반적으로 매우 원활합니다.',
      },
    ],
    updatedAtLabel: '2025.05.19 18:00 기준',
  };
}

export const WEEKLY_TREND_DATA = [
  { day: '화', date: '05.13', land: 138.4, jeju: 154.2 },
  { day: '수', date: '05.14', land: 140.15, jeju: 157.8 },
  { day: '목', date: '05.15', land: 141.68, jeju: 159.4 },
  { day: '금', date: '05.16', land: 144.32, jeju: 162.1 },
  { day: '토', date: '05.17', land: 140.02, jeju: 157.8 },
  { day: '일', date: '05.18', land: 139.43, jeju: 155.8 },
  { day: '월', date: '05.19', land: 142.85, jeju: 161.4 },
];

export const BEGINNER_GLOSSARY = [
  {
    term: 'SMP (계통한계가격)',
    badge: '핵심 도매단가',
    summary:
      '한국전력이 발전사로부터 전기를 사 올 때 적용하는 시간별 도매 시장 가격입니다. 가장 비싼 발전기의 발전 단가(주로 LNG)가 그 시간의 전체 SMP를 결정합니다.',
  },
  {
    term: '덕 커브 (Duck Curve)',
    badge: '태양광 영향',
    summary:
      '낮 12~14시 태양광 발전량이 급증하면 기존 발전기 수요가 줄어 가격 그래프가 오리 배처럼 움푹 패였다가, 해가 지는 18시에 오리 목처럼 치솟는 현상입니다.',
  },
  {
    term: '전력 수급 여유율 (예비율)',
    badge: '안전 지표',
    summary:
      '최대 전력 수요 대비 공급 가능 능력이 얼마나 남았는지 나타냅니다. 보통 10% 이상이면 정상(안정)으로 보며, 5.5 GW 미만 시 관심·주의 경보가 발령됩니다.',
  },
  {
    term: '육지 vs 제주 SMP 차이',
    badge: '지역별 시세',
    summary:
      '제주는 본토와 독립된 계통 비중이 크고 유류·LNG 발전 단가 및 해저 연계선(HVDC) 제약을 받기 때문에 일반적으로 육지보다 SMP가 15~25원 높게 형성됩니다.',
  },
];
