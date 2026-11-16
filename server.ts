import 'dotenv/config';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KPX_ENDPOINT =
  'https://apis.data.go.kr/B552115/SmpWithForecastDemand/getSmpWithForecastDemand';

function getKstTodayYyyymmdd(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date()).replace(/-/g, '');
}

function readXmlTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i'));
  return match ? match[1].trim() : null;
}

function parseXmlItems(xml: string): Array<Record<string, string>> {
  const items: Array<Record<string, string>> = [];
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/gi);
  for (const match of itemMatches) {
    const block = match[1];
    const obj: Record<string, string> = {};
    const fieldMatches = block.matchAll(/<([a-zA-Z0-9_]+)>([^<]*)<\/\1>/g);
    for (const f of fieldMatches) {
      obj[f[1]] = f[2].trim();
    }
    if (Object.keys(obj).length > 0) {
      items.push(obj);
    }
  }
  return items;
}

function normalizeItems(rawItems: Array<Record<string, unknown>>) {
  return rawItems
    .map((item) => {
      const hourRaw =
        item.hour ?? item.time ?? item.tradeHour ?? item.hourCd ?? item.tm ?? 0;
      const hour = Number(String(hourRaw).replace(/[^0-9]/g, '')) || 0;
      const smp = Number(item.smp ?? item.smpVal ?? item.landSmp ?? 0);
      const areaName = String(item.areaName ?? item.areaNm ?? item.region ?? '육지');

      const mlfd = Number(item.mlfd ?? 0);
      const jlfd = Number(item.jlfd ?? 0);
      const slfd = Number(item.slfd ?? 0);

      const areaDemand = areaName.includes('제주')
        ? jlfd || slfd
        : mlfd || slfd;

      const forecastDemand = Number(
        item.forecastDemand ??
          item.forecastLoad ??
          item.mlndForecastLoad ??
          item.demand ??
          item.prdictPower ??
          (areaDemand || 0)
      );

      const tradeDate = String(item.date ?? item.tradeDay ?? item.baseDate ?? '');

      return {
        hour,
        areaName,
        tradeDate,
        smp: Number.isFinite(smp) ? smp : 0,
        forecastDemand: Number.isFinite(forecastDemand) ? forecastDemand : 0,
        mlfd: Number.isFinite(mlfd) ? mlfd : 0,
        jlfd: Number.isFinite(jlfd) ? jlfd : 0,
        slfd: Number.isFinite(slfd) ? slfd : 0,
        raw: item,
      };
    })
    .sort((a, b) => a.hour - b.hour);
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.get('/api/power-supply', async (req, res) => {
    // Merge .env and .env.local without letting empty values overwrite runtime Secrets
    const envFiles = [path.resolve(__dirname, '.env'), path.resolve(__dirname, '.env.local')];
    const fileVars: Record<string, string> = {};
    for (const filePath of envFiles) {
      if (fs.existsSync(filePath)) {
        const parsedFile = dotenv.parse(fs.readFileSync(filePath));
        for (const [k, v] of Object.entries(parsedFile)) {
          if (v && v.trim()) {
            fileVars[k] = v.trim();
          }
        }
      }
    }

    const candidateKeys = [
      'KPX_API_KEY',
      'DATA_GO_KR_API_KEY',
      'SERVICE_KEY',
      'VITE_KPX_API_KEY',
      'VITE_DATA_GO_KR_API_KEY',
    ];

    let rawKey = '';
    for (const keyName of candidateKeys) {
      const val = (fileVars[keyName] || process.env[keyName] || '').trim();
      if (
        val &&
        val !== 'YOUR_DATA_GO_KR_SERVICE_KEY' &&
        val !== 'MY_KPX_API_KEY'
      ) {
        rawKey = val;
        break;
      }
    }

    const dateParam =
      typeof req.query.date === 'string' && /^\d{8}$/.test(req.query.date.trim())
        ? req.query.date.trim()
        : getKstTodayYyyymmdd();

    if (!rawKey) {
      res.status(400).json({
        ok: false,
        date: dateParam,
        endpoint: KPX_ENDPOINT,
        errorCode: 'MISSING_API_KEY',
        errorMessage:
          '인증키가 설정되지 않았습니다. 프로젝트 루트의 .env 파일(KPX_API_KEY) 또는 Secrets 패널에 인증키를 입력해 주세요.',
      });
      return;
    }

    const encodedKey = /%[0-9A-Fa-f]{2}/.test(rawKey)
      ? rawKey
      : encodeURIComponent(rawKey);

    const queryString = [
      `serviceKey=${encodedKey}`,
      'pageNo=1',
      'numOfRows=48',
      'dataType=json',
      `date=${encodeURIComponent(dateParam)}`,
    ].join('&');

    const requestUrl = `${KPX_ENDPOINT}?${queryString}`;

    try {
      const upstream = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json, application/xml, text/xml;q=0.9, */*;q=0.8',
        },
        signal: AbortSignal.timeout(10000),
      });

      const bodyText = await upstream.text();

      if (!upstream.ok) {
        res.status(upstream.status).json({
          ok: false,
          date: dateParam,
          endpoint: KPX_ENDPOINT,
          httpStatus: upstream.status,
          errorCode: `HTTP_${upstream.status}`,
          errorMessage: `공공데이터포털 API 요청이 실패했습니다 (HTTP ${upstream.status} ${upstream.statusText}). ${bodyText.slice(0, 240)}`,
        });
        return;
      }

      const trimmed = bodyText.trim();

      // Handle XML responses (common for data.go.kr OpenAPI_ServiceResponse auth/gateway errors)
      if (trimmed.startsWith('<')) {
        const returnReasonCode = readXmlTag(trimmed, 'returnReasonCode');
        const returnAuthMsg = readXmlTag(trimmed, 'returnAuthMsg');
        const errMsg = readXmlTag(trimmed, 'errMsg');
        const resultCode = readXmlTag(trimmed, 'resultCode');
        const resultMsg = readXmlTag(trimmed, 'resultMsg');

        if (returnReasonCode || (resultCode && resultCode !== '00')) {
          res.status(502).json({
            ok: false,
            date: dateParam,
            endpoint: KPX_ENDPOINT,
            errorCode: returnReasonCode || resultCode || 'API_XML_ERROR',
            errorMessage:
              [returnAuthMsg, errMsg, resultMsg].filter(Boolean).join(' · ') ||
              '공공데이터포털 XML 오류 응답이 반환되었습니다.',
            rawSnippet: trimmed.slice(0, 300),
          });
          return;
        }

        const xmlItems = parseXmlItems(trimmed);
        res.json({
          ok: true,
          date: dateParam,
          endpoint: KPX_ENDPOINT,
          fetchedAt: new Date().toISOString(),
          items: normalizeItems(xmlItems),
        });
        return;
      }

      // Handle JSON responses
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(trimmed) as Record<string, unknown>;
      } catch {
        res.status(502).json({
          ok: false,
          date: dateParam,
          endpoint: KPX_ENDPOINT,
          errorCode: 'INVALID_JSON',
          errorMessage: `API 응답을 JSON으로 해석할 수 없습니다: ${trimmed.slice(0, 200)}`,
        });
        return;
      }

      const responseObj = parsed.response as
        | {
            header?: { resultCode?: string; resultMsg?: string };
            body?: { items?: { item?: unknown } | unknown };
          }
        | undefined;

      const header = responseObj?.header;
      if (header?.resultCode && header.resultCode !== '00') {
        res.status(502).json({
          ok: false,
          date: dateParam,
          endpoint: KPX_ENDPOINT,
          errorCode: header.resultCode,
          errorMessage: header.resultMsg || 'API 응답 결과 코드 오류입니다.',
        });
        return;
      }

      const itemsContainer = responseObj?.body?.items as
        | { item?: unknown }
        | Array<Record<string, unknown>>
        | undefined;

      let rawItems: Array<Record<string, unknown>> = [];
      if (Array.isArray(itemsContainer)) {
        rawItems = itemsContainer;
      } else if (itemsContainer && typeof itemsContainer === 'object' && 'item' in itemsContainer) {
        const inner = (itemsContainer as { item?: unknown }).item;
        if (Array.isArray(inner)) {
          rawItems = inner as Array<Record<string, unknown>>;
        } else if (inner && typeof inner === 'object') {
          rawItems = [inner as Record<string, unknown>];
        }
      }

      res.json({
        ok: true,
        date: dateParam,
        endpoint: KPX_ENDPOINT,
        fetchedAt: new Date().toISOString(),
        items: normalizeItems(rawItems),
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : '외부 API 서버와 통신하는 중 알 수 없는 오류가 발생했습니다.';
      res.status(502).json({
        ok: false,
        date: dateParam,
        endpoint: KPX_ENDPOINT,
        errorCode: 'NETWORK_ERROR',
        errorMessage: message,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GridPulse server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
