import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  DEFAULT_FV_YEAR_COMPARISON_TEMPLATE,
  DEFAULT_SALES_DAILY_TEMPLATE,
  DEFAULT_REMITTANCE_TEMPLATE,
  DEFAULT_REMITTANCE_AR_TEMPLATE,
  DEFAULT_AR_INVOICE_SETTINGS,
  DEFAULT_AR_DELIVERY_NOTE_SETTINGS,
  FV_YEAR_COMPARISON_TEMPLATE_KEY,
  SALES_DAILY_TEMPLATE_KEY,
  REMITTANCE_AR_TEMPLATE_KEY,
  AR_INVOICE_SETTINGS_KEY,
  AR_DELIVERY_NOTE_SETTINGS_KEY,
  normalizeArDeliveryNoteSettings,
  normalizeArInvoiceSettings,
  normalizeForeignVisitorTemplate,
  normalizeRemittanceArTemplate,
  normalizeRemittanceTemplate,
  normalizeSalesDailyTemplate,
  REMITTANCE_TEMPLATE_KEY,
  type ForeignVisitorYearComparisonTemplate,
  type ArDeliveryNoteSettings,
  type ArInvoiceSettings,
  type SalesDailyTemplate,
  type RemittanceTemplate,
} from './template';

const TEMPLATE_LIST = [
  { id: 'remittance-slip', name: '売上金納付書', key: REMITTANCE_TEMPLATE_KEY },
  { id: 'remittance-ar', name: '売掛金納付書', key: REMITTANCE_AR_TEMPLATE_KEY },
  { id: 'sales-daily', name: '売上日報', key: SALES_DAILY_TEMPLATE_KEY },
  { id: 'fv-year-comparison', name: 'インバウンド年別比較', key: FV_YEAR_COMPARISON_TEMPLATE_KEY },
  { id: 'ar-invoice', name: '請求書（売掛管理）', key: AR_INVOICE_SETTINGS_KEY },
  { id: 'ar-delivery', name: '納品書（売掛管理）', key: AR_DELIVERY_NOTE_SETTINGS_KEY },
];

const sampleRows = [
  { date: '2026-01-01', cashSales: 47300 },
  { date: '2026-01-02', cashSales: 11900 },
  { date: '2026-01-03', cashSales: 9950 },
];

const sampleDailyData = {
  date: '2026-01-03',
  total: 69150,
  receivableCollection: 3500,
  categories: [
    { category: '鱒', sources: [{ source: 'cash', amount: 22000 }] },
    { category: '釣鱒', sources: [{ source: 'cash', amount: 28000 }, { source: 'credit', amount: 4500 }] },
    { category: '竿', sources: [{ source: 'cash', amount: 9000 }] },
    { category: '雑', sources: [{ source: 'mobile', amount: 5650 }] },
  ],
  visitorsEstimate: 43,
  foodTroutCount: 12,
  anglingTroutCount: 31,
  rodCount: 5,
};

const samplePreviousDays = [
  {
    date: '2026-01-02',
    total: 54200,
    receivableCollection: 0,
    categories: [
      { category: '鱒', sources: [{ source: 'cash', amount: 12000 }] },
      { category: '釣鱒', sources: [{ source: 'cash', amount: 24000 }] },
      { category: '竿', sources: [{ source: 'cash', amount: 6000 }] },
      { category: '雑', sources: [{ source: 'credit', amount: 12200 }] },
    ],
  },
  {
    date: '2026-01-01',
    total: 47800,
    receivableCollection: 0,
    categories: [
      { category: '鱒', sources: [{ source: 'cash', amount: 11000 }] },
      { category: '釣鱒', sources: [{ source: 'cash', amount: 22000 }] },
      { category: '竿', sources: [{ source: 'cash', amount: 5800 }] },
      { category: '雑', sources: [{ source: 'mobile', amount: 9000 }] },
    ],
  },
];

const sampleComparisonYears = [2024, 2025];
const sampleComparisonLabel = '2024 / 2025';

const toReiwa = (date: Date) => {
  const reiwaStart = new Date('2019-05-01T00:00:00');
  let eraYear = date.getFullYear() - 2018;
  if (date < reiwaStart) {
    eraYear = date.getFullYear() - 1988;
    return `平成${eraYear}年${date.getMonth() + 1}月${date.getDate()}日`;
  }
  return `令和${eraYear}年${date.getMonth() + 1}月${date.getDate()}日`;
};

const toReiwaMonth = (date: Date) => {
  const reiwaStart = new Date('2019-05-01T00:00:00');
  let eraYear = date.getFullYear() - 2018;
  if (date < reiwaStart) {
    eraYear = date.getFullYear() - 1988;
    return `平成${eraYear}年${date.getMonth() + 1}月`;
  }
  return `令和${eraYear}年${date.getMonth() + 1}月`;
};

const getApiBase = () => {
  const env = (import.meta as any).env?.VITE_TEMPLATE_API_BASE as string | undefined;
  if (env && env.trim()) return env.trim();
  if (typeof window === 'undefined') return '';
  return window.location.pathname.startsWith('/report-template-editor/')
    ? '/mine-trout-cash-api'
    : '';
};

const getForeignVisitorApiBase = () => {
  const env = (import.meta as any).env?.VITE_FV_TEMPLATE_API_BASE as string | undefined;
  if (env && env.trim()) return env.trim();
  if (typeof window === 'undefined') return '';
  return window.location.pathname.startsWith('/report-template-editor/')
    ? '/api'
    : '';
};

const getAccountsReceivableApiBase = () => {
  const env = (import.meta as any).env?.VITE_AR_SETTINGS_API_BASE as string | undefined;
  if (env && env.trim()) return env.trim();
  if (typeof window === 'undefined') return '';
  return window.location.pathname.startsWith('/report-template-editor/')
    ? '/accounts-receivable-api'
    : '';
};

const joinBase = (base: string, path: string) => {
  if (!base) return path;
  return `${base.replace(/\/$/, '')}${path}`;
};

const toYmd = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const loadLocalRemittanceTemplate = () => {
  try {
    const raw = localStorage.getItem(REMITTANCE_TEMPLATE_KEY);
    if (!raw) return DEFAULT_REMITTANCE_TEMPLATE;
    return normalizeRemittanceTemplate(JSON.parse(raw));
  } catch {
    return DEFAULT_REMITTANCE_TEMPLATE;
  }
};

const loadLocalRemittanceArTemplate = () => {
  try {
    const raw = localStorage.getItem(REMITTANCE_AR_TEMPLATE_KEY);
    if (!raw) return DEFAULT_REMITTANCE_AR_TEMPLATE;
    return normalizeRemittanceArTemplate(JSON.parse(raw));
  } catch {
    return DEFAULT_REMITTANCE_AR_TEMPLATE;
  }
};

const loadLocalSalesDailyTemplate = () => {
  try {
    const raw = localStorage.getItem(SALES_DAILY_TEMPLATE_KEY);
    if (!raw) return DEFAULT_SALES_DAILY_TEMPLATE;
    return normalizeSalesDailyTemplate(JSON.parse(raw));
  } catch {
    return DEFAULT_SALES_DAILY_TEMPLATE;
  }
};

const loadLocalForeignVisitorTemplate = () => {
  try {
    const raw = localStorage.getItem(FV_YEAR_COMPARISON_TEMPLATE_KEY);
    if (!raw) return DEFAULT_FV_YEAR_COMPARISON_TEMPLATE;
    return normalizeForeignVisitorTemplate(JSON.parse(raw));
  } catch {
    return DEFAULT_FV_YEAR_COMPARISON_TEMPLATE;
  }
};

const loadLocalArInvoiceSettings = () => {
  try {
    const raw = localStorage.getItem(AR_INVOICE_SETTINGS_KEY);
    if (!raw) return DEFAULT_AR_INVOICE_SETTINGS;
    return normalizeArInvoiceSettings(JSON.parse(raw));
  } catch {
    return DEFAULT_AR_INVOICE_SETTINGS;
  }
};

const loadLocalArDeliverySettings = () => {
  try {
    const raw = localStorage.getItem(AR_DELIVERY_NOTE_SETTINGS_KEY);
    if (!raw) return DEFAULT_AR_DELIVERY_NOTE_SETTINGS;
    return normalizeArDeliveryNoteSettings(JSON.parse(raw));
  } catch {
    return DEFAULT_AR_DELIVERY_NOTE_SETTINGS;
  }
};

const saveLocalRemittanceTemplate = (template: RemittanceTemplate) => {
  localStorage.setItem(REMITTANCE_TEMPLATE_KEY, JSON.stringify(template));
};

const saveLocalRemittanceArTemplate = (template: RemittanceTemplate) => {
  localStorage.setItem(REMITTANCE_AR_TEMPLATE_KEY, JSON.stringify(template));
};

const saveLocalSalesDailyTemplate = (template: SalesDailyTemplate) => {
  localStorage.setItem(SALES_DAILY_TEMPLATE_KEY, JSON.stringify(template));
};

const saveLocalForeignVisitorTemplate = (template: ForeignVisitorYearComparisonTemplate) => {
  localStorage.setItem(FV_YEAR_COMPARISON_TEMPLATE_KEY, JSON.stringify(template));
};

const saveLocalArInvoiceSettings = (settings: ArInvoiceSettings) => {
  localStorage.setItem(AR_INVOICE_SETTINGS_KEY, JSON.stringify(settings));
};

const saveLocalArDeliverySettings = (settings: ArDeliveryNoteSettings) => {
  localStorage.setItem(AR_DELIVERY_NOTE_SETTINGS_KEY, JSON.stringify(settings));
};

export function App() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(TEMPLATE_LIST[0].id);
  const [remittanceTemplate, setRemittanceTemplate] = useState<RemittanceTemplate>(() => loadLocalRemittanceTemplate());
  const [remittanceArTemplate, setRemittanceArTemplate] =
    useState<RemittanceTemplate>(() => loadLocalRemittanceArTemplate());
  const [salesDailyTemplate, setSalesDailyTemplate] = useState<SalesDailyTemplate>(() => loadLocalSalesDailyTemplate());
  const [foreignVisitorTemplate, setForeignVisitorTemplate] =
    useState<ForeignVisitorYearComparisonTemplate>(() => loadLocalForeignVisitorTemplate());
  const [arInvoiceSettings, setArInvoiceSettings] = useState<ArInvoiceSettings>(() => loadLocalArInvoiceSettings());
  const [arDeliverySettings, setArDeliverySettings] =
    useState<ArDeliveryNoteSettings>(() => loadLocalArDeliverySettings());
  const [latestInvoice, setLatestInvoice] = useState<{
    id: number;
    invoiceNo: string;
    customerName: string;
    periodFrom: string;
    periodTo: string;
  } | null>(null);
  const [latestDeliveryNote, setLatestDeliveryNote] = useState<{
    id: number;
    customerName: string;
    saleDate: string;
    productName?: string | null;
  } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewNonce, setPreviewNonce] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [busy, setBusy] = useState(false);

  const apiBase = useMemo(() => getApiBase(), []);
  const fvApiBase = useMemo(() => getForeignVisitorApiBase(), []);
  const arApiBase = useMemo(() => getAccountsReceivableApiBase(), []);
  const isRemittanceSales = selectedTemplateId === 'remittance-slip';
  const isRemittanceAr = selectedTemplateId === 'remittance-ar';
  const isRemittance = isRemittanceSales || isRemittanceAr;
  const isSalesDaily = selectedTemplateId === 'sales-daily';
  const isForeignVisitor = selectedTemplateId === 'fv-year-comparison';
  const isArInvoice = selectedTemplateId === 'ar-invoice';
  const isArDelivery = selectedTemplateId === 'ar-delivery';
  const isArSettings = isArInvoice || isArDelivery;
  const activeTemplateMeta = TEMPLATE_LIST.find((item) => item.id === selectedTemplateId);
  const currentApiBase = isForeignVisitor ? fvApiBase : apiBase;
  const currentSettingsApiBase = isArSettings ? arApiBase : currentApiBase;

  const activeRemittanceTemplate = isRemittanceAr ? remittanceArTemplate : remittanceTemplate;
  const remittanceStart = isRemittanceAr ? toReiwaMonth(new Date('2026-01-01')) : toReiwa(new Date('2026-01-01'));
  const remittanceEnd = isRemittanceAr ? toReiwaMonth(new Date('2026-01-03')) : toReiwa(new Date('2026-01-03'));
  const rangeLabel = activeRemittanceTemplate.text.rangeTemplate
    .split('{start}')
    .join(remittanceStart)
    .split('{end}')
    .join(remittanceEnd);
  const createdAtLabel = `${toReiwa(new Date('2026-01-03'))} ${activeRemittanceTemplate.text.createdAtSuffix}`.trim();

  const applyRemittanceTemplate = (next: RemittanceTemplate) => {
    if (isRemittanceAr) {
      setRemittanceArTemplate(next);
      saveLocalRemittanceArTemplate(next);
      return;
    }
    setRemittanceTemplate(next);
    saveLocalRemittanceTemplate(next);
  };

  const applySalesDailyTemplate = (next: SalesDailyTemplate) => {
    setSalesDailyTemplate(next);
    saveLocalSalesDailyTemplate(next);
  };

  const applyForeignVisitorTemplate = (next: ForeignVisitorYearComparisonTemplate) => {
    setForeignVisitorTemplate(next);
    saveLocalForeignVisitorTemplate(next);
  };

  const applyArInvoiceSettings = (next: ArInvoiceSettings) => {
    setArInvoiceSettings(next);
    saveLocalArInvoiceSettings(next);
  };

  const applyArDeliverySettings = (next: ArDeliveryNoteSettings) => {
    setArDeliverySettings(next);
    saveLocalArDeliverySettings(next);
  };

  const updateRemittanceText = (key: keyof RemittanceTemplate['text'], value: string) => {
    applyRemittanceTemplate({
      ...activeRemittanceTemplate,
      text: { ...activeRemittanceTemplate.text, [key]: value },
    });
  };

  const updateRemittanceLayout = (key: keyof RemittanceTemplate['layout'], value: number) => {
    applyRemittanceTemplate({
      ...activeRemittanceTemplate,
      layout: { ...activeRemittanceTemplate.layout, [key]: value },
    });
  };

  const updateSalesDailyText = (key: keyof SalesDailyTemplate['text'], value: string) => {
    applySalesDailyTemplate({
      ...salesDailyTemplate,
      text: { ...salesDailyTemplate.text, [key]: value },
    });
  };

  const updateSalesDailyLabel = (key: keyof SalesDailyTemplate['text']['labels'], value: string) => {
    applySalesDailyTemplate({
      ...salesDailyTemplate,
      text: { ...salesDailyTemplate.text, labels: { ...salesDailyTemplate.text.labels, [key]: value } },
    });
  };

  const updateSalesDailyLayout = (key: keyof SalesDailyTemplate['layout'], value: number) => {
    applySalesDailyTemplate({
      ...salesDailyTemplate,
      layout: { ...salesDailyTemplate.layout, [key]: value },
    });
  };

  const updateForeignVisitorText = (
    key: keyof ForeignVisitorYearComparisonTemplate['text'],
    value: string
  ) => {
    applyForeignVisitorTemplate({
      ...foreignVisitorTemplate,
      text: { ...foreignVisitorTemplate.text, [key]: value },
    });
  };

  const updateForeignVisitorLayout = (
    key: keyof ForeignVisitorYearComparisonTemplate['layout'],
    value: number
  ) => {
    applyForeignVisitorTemplate({
      ...foreignVisitorTemplate,
      layout: { ...foreignVisitorTemplate.layout, [key]: value },
    });
  };

  const updateArInvoice = (key: keyof ArInvoiceSettings, value: string | number | boolean) => {
    applyArInvoiceSettings({
      ...arInvoiceSettings,
      [key]: value,
    });
  };

  const updateArDelivery = (key: keyof ArDeliveryNoteSettings, value: string) => {
    applyArDeliverySettings({
      ...arDeliverySettings,
      [key]: value,
    });
  };

  const refreshLatestArPreviews = async () => {
    if (!arApiBase) {
      setPreviewError('accounts-receivable APIが未設定です。');
      return;
    }
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const invRes = await fetch(joinBase(arApiBase, '/api/invoices'), { credentials: 'include' });
      if (!invRes.ok) throw new Error(`請求書取得: HTTP ${invRes.status}`);
      const invJson = (await invRes.json()) as { invoices?: any[] };
      const inv = Array.isArray(invJson.invoices) ? invJson.invoices[0] : null;
      setLatestInvoice(
        inv
          ? {
              id: Number(inv.id),
              invoiceNo: String(inv.invoiceNo ?? ''),
              customerName: String(inv.customerName ?? ''),
              periodFrom: String(inv.periodFrom ?? ''),
              periodTo: String(inv.periodTo ?? ''),
            }
          : null
      );

      const today = new Date();
      const from = new Date();
      from.setFullYear(today.getFullYear() - 5);
      const dnRes = await fetch(
        joinBase(arApiBase, `/api/delivery-notes?from=${toYmd(from)}&to=${toYmd(today)}&limit=1`),
        { credentials: 'include' }
      );
      if (!dnRes.ok) throw new Error(`納品書取得: HTTP ${dnRes.status}`);
      const dnJson = (await dnRes.json()) as { items?: any[] };
      const dn = Array.isArray(dnJson.items) ? dnJson.items[0] : null;
      setLatestDeliveryNote(
        dn
          ? {
              id: Number(dn.id),
              customerName: String(dn.customerName ?? ''),
              saleDate: String(dn.saleDate ?? ''),
              productName: dn.productName ? String(dn.productName) : null,
            }
          : null
      );
    } catch (e: any) {
      setPreviewError(e?.message ?? String(e));
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    if (!isArSettings) return;
    void refreshLatestArPreviews();
  }, [isArSettings, arApiBase]);

  const loadFromServer = async () => {
    if (!currentSettingsApiBase) {
      setStatus('API未設定のため読み込みできません。');
      return;
    }
    setBusy(true);
    setStatus('サーバーから読み込み中...');
    try {
      if (isArSettings) {
        const res = await fetch(`${currentSettingsApiBase}/api/device-settings`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as { settings?: Record<string, unknown> };
        const settings = json.settings || {};
        if (isArInvoice) {
          const raw = settings[AR_INVOICE_SETTINGS_KEY];
          if (!raw) {
            applyArInvoiceSettings(DEFAULT_AR_INVOICE_SETTINGS);
            setStatus('サーバーには請求書設定が未登録でした。既定値を使用します。');
          } else {
            applyArInvoiceSettings(normalizeArInvoiceSettings(raw));
            setStatus('請求書設定を読み込みました。');
          }
        } else {
          const raw = settings[AR_DELIVERY_NOTE_SETTINGS_KEY];
          if (!raw) {
            applyArDeliverySettings(DEFAULT_AR_DELIVERY_NOTE_SETTINGS);
            setStatus('サーバーには納品書設定が未登録でした。既定値を使用します。');
          } else {
            applyArDeliverySettings(normalizeArDeliveryNoteSettings(raw));
            setStatus('納品書設定を読み込みました。');
          }
        }
        await refreshLatestArPreviews();
      } else {
        const templateKey = isRemittance
          ? (isRemittanceAr ? REMITTANCE_AR_TEMPLATE_KEY : REMITTANCE_TEMPLATE_KEY)
          : isSalesDaily
          ? SALES_DAILY_TEMPLATE_KEY
          : FV_YEAR_COMPARISON_TEMPLATE_KEY;
        const res = await fetch(`${currentSettingsApiBase}/api/kv/${encodeURIComponent(templateKey)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as { ok: boolean; value: unknown };
        if (isRemittance) {
          if (!json.value) {
            applyRemittanceTemplate(isRemittanceAr ? DEFAULT_REMITTANCE_AR_TEMPLATE : DEFAULT_REMITTANCE_TEMPLATE);
            setStatus('サーバーにはテンプレートが未登録でした。既定値を使用します。');
          } else {
            applyRemittanceTemplate(
              isRemittanceAr ? normalizeRemittanceArTemplate(json.value) : normalizeRemittanceTemplate(json.value)
            );
            setStatus('サーバーのテンプレートを読み込みました。');
          }
        } else if (isSalesDaily) {
          if (!json.value) {
            applySalesDailyTemplate(DEFAULT_SALES_DAILY_TEMPLATE);
            setStatus('サーバーにはテンプレートが未登録でした。既定値を使用します。');
          } else {
            applySalesDailyTemplate(normalizeSalesDailyTemplate(json.value));
            setStatus('サーバーのテンプレートを読み込みました。');
          }
        } else {
          if (!json.value) {
            applyForeignVisitorTemplate(DEFAULT_FV_YEAR_COMPARISON_TEMPLATE);
            setStatus('サーバーにはテンプレートが未登録でした。既定値を使用します。');
          } else {
            applyForeignVisitorTemplate(normalizeForeignVisitorTemplate(json.value));
            setStatus('サーバーのテンプレートを読み込みました。');
          }
        }
      }
    } catch (e: any) {
      setStatus(`読み込みに失敗しました: ${e?.message ?? String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const saveToServer = async () => {
    if (!currentSettingsApiBase) {
      setStatus('API未設定のため保存できません。');
      return;
    }
    setBusy(true);
    setStatus('サーバーへ保存中...');
    try {
      if (isArSettings) {
        const payload = isArInvoice ? arInvoiceSettings : arDeliverySettings;
        const key = isArInvoice ? AR_INVOICE_SETTINGS_KEY : AR_DELIVERY_NOTE_SETTINGS_KEY;
        const res = await fetch(`${currentSettingsApiBase}/api/device-settings`, {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ settings: { [key]: payload } }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setStatus('帳票設定を保存しました。プレビューを更新できます。');
        setPreviewNonce((prev) => prev + 1);
      } else {
        const templateKey = isRemittance
          ? (isRemittanceAr ? REMITTANCE_AR_TEMPLATE_KEY : REMITTANCE_TEMPLATE_KEY)
          : isSalesDaily
          ? SALES_DAILY_TEMPLATE_KEY
          : FV_YEAR_COMPARISON_TEMPLATE_KEY;
        const payload = isRemittance
          ? activeRemittanceTemplate
          : isSalesDaily
          ? salesDailyTemplate
          : foreignVisitorTemplate;
        const res = await fetch(`${currentSettingsApiBase}/api/kv/${encodeURIComponent(templateKey)}`, {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setStatus('サーバーに保存しました。');
      }
    } catch (e: any) {
      setStatus(`保存に失敗しました: ${e?.message ?? String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const resetTemplate = () => {
    if (isArSettings) {
      if (isArInvoice) {
        applyArInvoiceSettings(DEFAULT_AR_INVOICE_SETTINGS);
      } else {
        applyArDeliverySettings(DEFAULT_AR_DELIVERY_NOTE_SETTINGS);
      }
    } else if (isRemittance) {
      applyRemittanceTemplate(isRemittanceAr ? DEFAULT_REMITTANCE_AR_TEMPLATE : DEFAULT_REMITTANCE_TEMPLATE);
    } else if (isSalesDaily) {
      applySalesDailyTemplate(DEFAULT_SALES_DAILY_TEMPLATE);
    } else {
      applyForeignVisitorTemplate(DEFAULT_FV_YEAR_COMPARISON_TEMPLATE);
    }
    setStatus('既定値に戻しました。');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-brand">
          <a className="app-logo" href="/top/" aria-label="ポータルへ戻る">
            <img src="/top/title-icon-light.svg" alt="" />
          </a>
          <div>
            <div className="app-title">帳票テンプレート編集</div>
            <div className="app-sub">帳票のレイアウトと文言をGUIで調整し、業務アプリに反映します。</div>
          </div>
        </div>
        <div className="app-actions">
          <button className="btn ghost" type="button" onClick={loadFromServer} disabled={busy}>読み込み</button>
          <button className="btn" type="button" onClick={saveToServer} disabled={busy}>保存</button>
          <button className="btn ghost" type="button" onClick={resetTemplate} disabled={busy}>既定値</button>
        </div>
      </header>

      <main className="app-main">
        <aside className="panel sidebar">
          <div className="panel-title">帳票一覧</div>
          <div className="list">
            {TEMPLATE_LIST.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`list-item ${selectedTemplateId === item.id ? 'active' : ''}`}
                onClick={() => setSelectedTemplateId(item.id)}
              >
                <div className="list-title">{item.name}</div>
                <div className="list-meta">
                  {item.id === 'remittance-slip' || item.id === 'remittance-ar'
                    ? 'sales-management-system'
                    : item.id === 'sales-daily'
                    ? 'sales-report'
                    : item.id === 'fv-year-comparison'
                    ? 'foreign-visitor-system'
                    : 'accounts-receivable'}
                </div>
              </button>
            ))}
          </div>
          <div className="helper">
            <div className="helper-title">接続先</div>
            <div className="helper-value">{currentSettingsApiBase || '未設定'}</div>
            <div className="helper-note">
              {isArSettings
                ? '保存は accounts-receivable の設定に反映されます。'
                : isForeignVisitor
                ? '保存は foreign-visitor-system のKVに反映されます。'
                : '保存は mine-trout-cash のKVに反映されます。'}
            </div>
          </div>
        </aside>

        <section className="panel preview">
          <div className="panel-title">プレビュー</div>
          <div className="preview-wrap">
            {isArInvoice ? (
              <InvoicePreview
                settings={arInvoiceSettings}
                latest={latestInvoice}
                apiBase={arApiBase}
                loading={previewLoading}
                error={previewError}
                nonce={previewNonce}
                onReload={refreshLatestArPreviews}
              />
            ) : isArDelivery ? (
              <DeliveryNotePreview
                settings={arDeliverySettings}
                latest={latestDeliveryNote}
                apiBase={arApiBase}
                loading={previewLoading}
                error={previewError}
                nonce={previewNonce}
                onReload={refreshLatestArPreviews}
              />
            ) : isRemittance ? (
              <RemittancePreview
                template={activeRemittanceTemplate}
                rangeLabel={rangeLabel}
                createdAtLabel={createdAtLabel}
                rows={sampleRows}
              />
            ) : isSalesDaily ? (
              <SalesDailyPreview
                template={salesDailyTemplate}
                target={sampleDailyData}
                previous={samplePreviousDays}
              />
            ) : (
              <ForeignVisitorPreview template={foreignVisitorTemplate} />
            )}
          </div>
        </section>

        <section className="panel editor">
          <div className="panel-title">{activeTemplateMeta?.name ?? '編集パネル'}</div>
          <div className="status">{status || '変更は自動でローカル保存されます。'}</div>

          {isArInvoice ? (
            <>
              <section className="section">
                <div className="section-title">請求書の体裁</div>
                <div className="grid">
                  <Field label="タイトル">
                    <input value={arInvoiceSettings.title} onChange={(e) => updateArInvoice('title', e.target.value)} />
                  </Field>
                  <Field label="ご請求金額ラベル">
                    <input
                      value={arInvoiceSettings.amountLabel}
                      onChange={(e) => updateArInvoice('amountLabel', e.target.value)}
                    />
                  </Field>
                  <Field label="件名プレフィックス">
                    <input
                      value={arInvoiceSettings.subjectPrefix}
                      onChange={(e) => updateArInvoice('subjectPrefix', e.target.value)}
                    />
                  </Field>
                  <NumberField label="タイトル文字サイズ" value={arInvoiceSettings.titleFontSize} onChange={(v) => updateArInvoice('titleFontSize', v)} />
                  <NumberField label="本文文字サイズ" value={arInvoiceSettings.bodyFontSize} onChange={(v) => updateArInvoice('bodyFontSize', v)} />
                  <NumberField label="金額文字サイズ" value={arInvoiceSettings.amountFontSize} onChange={(v) => updateArInvoice('amountFontSize', v)} />
                  <NumberField label="上余白(mm)" value={arInvoiceSettings.topMarginMm} onChange={(v) => updateArInvoice('topMarginMm', v)} />
                  <NumberField label="左右余白(mm)" value={arInvoiceSettings.sideMarginMm} onChange={(v) => updateArInvoice('sideMarginMm', v)} />
                  <NumberField label="罫線太さ" value={arInvoiceSettings.lineWidth} onChange={(v) => updateArInvoice('lineWidth', v)} />
                  <NumberField label="表ヘッダー高さ(mm)" value={arInvoiceSettings.headerHeightMm} onChange={(v) => updateArInvoice('headerHeightMm', v)} />
                  <NumberField label="表行の高さ(mm)" value={arInvoiceSettings.rowHeightMm} onChange={(v) => updateArInvoice('rowHeightMm', v)} />
                  <label className="field checkbox">
                    <span>振込先を表示</span>
                    <input
                      type="checkbox"
                      checked={arInvoiceSettings.showBank}
                      onChange={(e) => updateArInvoice('showBank', e.target.checked)}
                    />
                  </label>
                  <label className="field checkbox">
                    <span>備考を表示</span>
                    <input
                      type="checkbox"
                      checked={arInvoiceSettings.showNotes}
                      onChange={(e) => updateArInvoice('showNotes', e.target.checked)}
                    />
                  </label>
                  <Field label="備考本文（複数行）">
                    <textarea
                      rows={4}
                      value={arInvoiceSettings.notesText}
                      placeholder="空欄の場合は既定文を表示します。"
                      onChange={(e) => updateArInvoice('notesText', e.target.value)}
                    />
                  </Field>
                </div>
              </section>
            </>
          ) : isArDelivery ? (
            <>
              <section className="section">
                <div className="section-title">納品書の体裁</div>
                <div className="grid">
                  <Field label="タイトル">
                    <input value={arDeliverySettings.title} onChange={(e) => updateArDelivery('title', e.target.value)} />
                  </Field>
                  <Field label="発行者名">
                    <input
                      value={arDeliverySettings.issuerName}
                      onChange={(e) => updateArDelivery('issuerName', e.target.value)}
                    />
                  </Field>
                  <Field label="発行者電話">
                    <input
                      value={arDeliverySettings.issuerPhone}
                      onChange={(e) => updateArDelivery('issuerPhone', e.target.value)}
                    />
                  </Field>
                  <Field label="発行者住所">
                    <input
                      value={arDeliverySettings.issuerAddress}
                      onChange={(e) => updateArDelivery('issuerAddress', e.target.value)}
                    />
                  </Field>
                  <Field label="フッターメモ">
                    <input
                      value={arDeliverySettings.footerNote}
                      placeholder="例: お問い合わせはお電話にてお願いします。"
                      onChange={(e) => updateArDelivery('footerNote', e.target.value)}
                    />
                  </Field>
                </div>
              </section>
            </>
          ) : isRemittance ? (
            <>
              <section className="section">
                <div className="section-title">文言</div>
                <div className="grid">
                  <Field label="帳票タイトル">
                    <input value={activeRemittanceTemplate.text.docTitle} onChange={(e) => updateRemittanceText('docTitle', e.target.value)} />
                  </Field>
                  <Field label="明細タイトル">
                    <input value={activeRemittanceTemplate.text.detailTitle} onChange={(e) => updateRemittanceText('detailTitle', e.target.value)} />
                  </Field>
                  <Field label="上段ラベル">
                    <input value={activeRemittanceTemplate.text.copyLabelTop} onChange={(e) => updateRemittanceText('copyLabelTop', e.target.value)} />
                  </Field>
                  <Field label="下段ラベル">
                    <input value={activeRemittanceTemplate.text.copyLabelBottom} onChange={(e) => updateRemittanceText('copyLabelBottom', e.target.value)} />
                  </Field>
                  <Field label="表: 日付">
                    <input value={activeRemittanceTemplate.text.tableDateHeader} onChange={(e) => updateRemittanceText('tableDateHeader', e.target.value)} />
                  </Field>
                  <Field label="表: 現金売上">
                    <input value={activeRemittanceTemplate.text.tableCashHeader} onChange={(e) => updateRemittanceText('tableCashHeader', e.target.value)} />
                  </Field>
                  <Field label="合計ラベル">
                    <input value={activeRemittanceTemplate.text.totalLabel} onChange={(e) => updateRemittanceText('totalLabel', e.target.value)} />
                  </Field>
                  <Field label="署名欄">
                    <input value={activeRemittanceTemplate.text.signatureLabel} onChange={(e) => updateRemittanceText('signatureLabel', e.target.value)} />
                  </Field>
                  <Field label="作成ラベル">
                    <input value={activeRemittanceTemplate.text.createdAtSuffix} onChange={(e) => updateRemittanceText('createdAtSuffix', e.target.value)} />
                  </Field>
                  <Field label="期間テンプレート">
                    <input value={activeRemittanceTemplate.text.rangeTemplate} onChange={(e) => updateRemittanceText('rangeTemplate', e.target.value)} />
                  </Field>
                  <Field label="空欄メッセージ">
                    <input value={activeRemittanceTemplate.text.emptyLabel} onChange={(e) => updateRemittanceText('emptyLabel', e.target.value)} />
                  </Field>
                </div>
              </section>

              <section className="section">
                <div className="section-title">レイアウト</div>
                <div className="grid">
                  <NumberField label="外側上余白 (mm)" value={activeRemittanceTemplate.layout.contentPaddingTopMm} onChange={(v) => updateRemittanceLayout('contentPaddingTopMm', v)} />
                  <NumberField label="外側左右余白 (mm)" value={activeRemittanceTemplate.layout.contentPaddingSideMm} onChange={(v) => updateRemittanceLayout('contentPaddingSideMm', v)} />
                  <NumberField label="上下シフト (mm)" value={activeRemittanceTemplate.layout.halfShiftMm} onChange={(v) => updateRemittanceLayout('halfShiftMm', v)} />
                  <NumberField label="枠の高さ (mm)" value={activeRemittanceTemplate.layout.frameHeightMm} onChange={(v) => updateRemittanceLayout('frameHeightMm', v)} />
                  <NumberField label="枠内余白 (mm)" value={activeRemittanceTemplate.layout.framePaddingMm} onChange={(v) => updateRemittanceLayout('framePaddingMm', v)} />
                  <NumberField label="枠内下余白 (mm)" value={activeRemittanceTemplate.layout.framePaddingBottomMm} onChange={(v) => updateRemittanceLayout('framePaddingBottomMm', v)} />
                  <NumberField label="タイトル文字 (px)" value={activeRemittanceTemplate.layout.titleFontPx} onChange={(v) => updateRemittanceLayout('titleFontPx', v)} />
                  <NumberField label="メタ文字 (px)" value={activeRemittanceTemplate.layout.metaFontPx} onChange={(v) => updateRemittanceLayout('metaFontPx', v)} />
                  <NumberField label="小見出し (px)" value={activeRemittanceTemplate.layout.subFontPx} onChange={(v) => updateRemittanceLayout('subFontPx', v)} />
                  <NumberField label="表文字 (px)" value={activeRemittanceTemplate.layout.tableFontPx} onChange={(v) => updateRemittanceLayout('tableFontPx', v)} />
                  <NumberField label="合計文字 (px)" value={activeRemittanceTemplate.layout.totalFontPx} onChange={(v) => updateRemittanceLayout('totalFontPx', v)} />
                  <NumberField label="フッター文字 (px)" value={activeRemittanceTemplate.layout.footerFontPx} onChange={(v) => updateRemittanceLayout('footerFontPx', v)} />
                  <NumberField label="署名文字 (px)" value={activeRemittanceTemplate.layout.signatureFontPx} onChange={(v) => updateRemittanceLayout('signatureFontPx', v)} />
                  <NumberField label="署名線幅 (mm)" value={activeRemittanceTemplate.layout.signatureBoxMm} onChange={(v) => updateRemittanceLayout('signatureBoxMm', v)} />
                  <NumberField label="線幅 (px)" value={activeRemittanceTemplate.layout.lineWidthPx} onChange={(v) => updateRemittanceLayout('lineWidthPx', v)} />
                  <NumberField label="表の行余白 (mm)" value={activeRemittanceTemplate.layout.tableRowPaddingMm} onChange={(v) => updateRemittanceLayout('tableRowPaddingMm', v)} />
                  <NumberField label="QRサイズ (mm)" value={activeRemittanceTemplate.layout.qrSizeMm} onChange={(v) => updateRemittanceLayout('qrSizeMm', v)} />
                </div>
              </section>
            </>
          ) : isSalesDaily ? (
            <>
              <section className="section">
                <div className="section-title">文言</div>
                <div className="grid">
                  <Field label="帳票タイトル">
                    <input value={salesDailyTemplate.text.title} onChange={(e) => updateSalesDailyText('title', e.target.value)} />
                  </Field>
                  <Field label="日付テンプレート">
                    <input value={salesDailyTemplate.text.metaTemplate} onChange={(e) => updateSalesDailyText('metaTemplate', e.target.value)} />
                  </Field>
                  <Field label="売掛テンプレート">
                    <input value={salesDailyTemplate.text.receivableTemplate} onChange={(e) => updateSalesDailyText('receivableTemplate', e.target.value)} />
                  </Field>
                  <Field label="指標テンプレート">
                    <input value={salesDailyTemplate.text.metricsTemplate} onChange={(e) => updateSalesDailyText('metricsTemplate', e.target.value)} />
                  </Field>
                  <Field label="区分: 支払い">
                    <input value={salesDailyTemplate.text.sectionPayment} onChange={(e) => updateSalesDailyText('sectionPayment', e.target.value)} />
                  </Field>
                  <Field label="区分: 品目">
                    <input value={salesDailyTemplate.text.sectionCategory} onChange={(e) => updateSalesDailyText('sectionCategory', e.target.value)} />
                  </Field>
                  <Field label="区分: 過去数日">
                    <input value={salesDailyTemplate.text.sectionPrevious} onChange={(e) => updateSalesDailyText('sectionPrevious', e.target.value)} />
                  </Field>
                  <Field label="合計ラベル">
                    <input value={salesDailyTemplate.text.totalLabel} onChange={(e) => updateSalesDailyText('totalLabel', e.target.value)} />
                  </Field>
                  <Field label="空欄ラベル">
                    <input value={salesDailyTemplate.text.noneLabel} onChange={(e) => updateSalesDailyText('noneLabel', e.target.value)} />
                  </Field>
                  <Field label="現金ラベル">
                    <input value={salesDailyTemplate.text.labels.cash} onChange={(e) => updateSalesDailyLabel('cash', e.target.value)} />
                  </Field>
                  <Field label="クレジットラベル">
                    <input value={salesDailyTemplate.text.labels.credit} onChange={(e) => updateSalesDailyLabel('credit', e.target.value)} />
                  </Field>
                  <Field label="スマホラベル">
                    <input value={salesDailyTemplate.text.labels.mobile} onChange={(e) => updateSalesDailyLabel('mobile', e.target.value)} />
                  </Field>
                  <Field label="売掛ラベル">
                    <input value={salesDailyTemplate.text.labels.receivable} onChange={(e) => updateSalesDailyLabel('receivable', e.target.value)} />
                  </Field>
                </div>
              </section>

              <section className="section">
                <div className="section-title">レイアウト</div>
                <div className="grid">
                  <NumberField label="余白 (mm)" value={salesDailyTemplate.layout.pageMarginMm} onChange={(v) => updateSalesDailyLayout('pageMarginMm', v)} />
                  <NumberField label="タイトル文字 (px)" value={salesDailyTemplate.layout.titleFontPx} onChange={(v) => updateSalesDailyLayout('titleFontPx', v)} />
                  <NumberField label="メタ文字 (px)" value={salesDailyTemplate.layout.metaFontPx} onChange={(v) => updateSalesDailyLayout('metaFontPx', v)} />
                  <NumberField label="セクション間隔 (px)" value={salesDailyTemplate.layout.sectionGapPx} onChange={(v) => updateSalesDailyLayout('sectionGapPx', v)} />
                  <NumberField label="枠線幅 (px)" value={salesDailyTemplate.layout.sectionBorderPx} onChange={(v) => updateSalesDailyLayout('sectionBorderPx', v)} />
                  <NumberField label="枠内余白 (px)" value={salesDailyTemplate.layout.sectionPaddingPx} onChange={(v) => updateSalesDailyLayout('sectionPaddingPx', v)} />
                  <NumberField label="見出し文字 (px)" value={salesDailyTemplate.layout.labelFontPx} onChange={(v) => updateSalesDailyLayout('labelFontPx', v)} />
                  <NumberField label="行文字 (px)" value={salesDailyTemplate.layout.rowFontPx} onChange={(v) => updateSalesDailyLayout('rowFontPx', v)} />
                  <NumberField label="小行文字 (px)" value={salesDailyTemplate.layout.rowSmallFontPx} onChange={(v) => updateSalesDailyLayout('rowSmallFontPx', v)} />
                  <NumberField label="過去一覧間隔 (px)" value={salesDailyTemplate.layout.prevGridGapPx} onChange={(v) => updateSalesDailyLayout('prevGridGapPx', v)} />
                </div>
              </section>
            </>
          ) : (
            <>
              <section className="section">
                <div className="section-title">文言</div>
                <div className="grid">
                  <Field label="事業所名">
                    <input value={foreignVisitorTemplate.text.orgName} onChange={(e) => updateForeignVisitorText('orgName', e.target.value)} />
                  </Field>
                  <Field label="帳票タイトル">
                    <input value={foreignVisitorTemplate.text.docTitle} onChange={(e) => updateForeignVisitorText('docTitle', e.target.value)} />
                  </Field>
                  <Field label="対象年ラベル">
                    <input value={foreignVisitorTemplate.text.targetYearsLabel} onChange={(e) => updateForeignVisitorText('targetYearsLabel', e.target.value)} />
                  </Field>
                  <Field label="バッジラベル">
                    <input value={foreignVisitorTemplate.text.badgeLabel} onChange={(e) => updateForeignVisitorText('badgeLabel', e.target.value)} />
                  </Field>
                  <Field label="印刷日時ラベル">
                    <input value={foreignVisitorTemplate.text.printedAtLabel} onChange={(e) => updateForeignVisitorText('printedAtLabel', e.target.value)} />
                  </Field>
                </div>
              </section>

              <section className="section">
                <div className="section-title">レイアウト</div>
                <div className="grid">
                  <NumberField label="上余白 (mm)" value={foreignVisitorTemplate.layout.pageMarginTopMm} onChange={(v) => updateForeignVisitorLayout('pageMarginTopMm', v)} />
                  <NumberField label="左右余白 (mm)" value={foreignVisitorTemplate.layout.pageMarginSideMm} onChange={(v) => updateForeignVisitorLayout('pageMarginSideMm', v)} />
                  <NumberField label="下余白 (mm)" value={foreignVisitorTemplate.layout.pageMarginBottomMm} onChange={(v) => updateForeignVisitorLayout('pageMarginBottomMm', v)} />
                  <NumberField label="事業所名 (px)" value={foreignVisitorTemplate.layout.orgFontPx} onChange={(v) => updateForeignVisitorLayout('orgFontPx', v)} />
                  <NumberField label="タイトル (px)" value={foreignVisitorTemplate.layout.titleFontPx} onChange={(v) => updateForeignVisitorLayout('titleFontPx', v)} />
                  <NumberField label="メタ (px)" value={foreignVisitorTemplate.layout.metaFontPx} onChange={(v) => updateForeignVisitorLayout('metaFontPx', v)} />
                  <NumberField label="バッジ (px)" value={foreignVisitorTemplate.layout.badgeFontPx} onChange={(v) => updateForeignVisitorLayout('badgeFontPx', v)} />
                  <NumberField label="ヘッダ余白 (px)" value={foreignVisitorTemplate.layout.headerGapPx} onChange={(v) => updateForeignVisitorLayout('headerGapPx', v)} />
                  <NumberField label="詳細表文字 (px)" value={foreignVisitorTemplate.layout.detailFontPx} onChange={(v) => updateForeignVisitorLayout('detailFontPx', v)} />
                  <NumberField label="詳細表余白 (px)" value={foreignVisitorTemplate.layout.detailPaddingPx} onChange={(v) => updateForeignVisitorLayout('detailPaddingPx', v)} />
                </div>
              </section>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        step="0.5"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function RemittancePreview({
  template,
  rangeLabel,
  createdAtLabel,
  rows,
}: {
  template: RemittanceTemplate;
  rangeLabel: string;
  createdAtLabel: string;
  rows: { date: string; cashSales: number }[];
}) {
  const styleVars = {
    '--rem-content-top': `${template.layout.contentPaddingTopMm}mm`,
    '--rem-content-side': `${template.layout.contentPaddingSideMm}mm`,
    '--rem-half-shift': `${template.layout.halfShiftMm}mm`,
    '--rem-frame-height': `${template.layout.frameHeightMm}mm`,
    '--rem-frame-padding': `${template.layout.framePaddingMm}mm`,
    '--rem-frame-padding-bottom': `${template.layout.framePaddingBottomMm}mm`,
    '--rem-title-font': `${template.layout.titleFontPx}px`,
    '--rem-meta-font': `${template.layout.metaFontPx}px`,
    '--rem-sub-font': `${template.layout.subFontPx}px`,
    '--rem-table-font': `${template.layout.tableFontPx}px`,
    '--rem-total-font': `${template.layout.totalFontPx}px`,
    '--rem-footer-font': `${template.layout.footerFontPx}px`,
    '--rem-signature-font': `${template.layout.signatureFontPx}px`,
    '--rem-signature-w': `${template.layout.signatureBoxMm}mm`,
    '--rem-line-width': `${template.layout.lineWidthPx}px`,
    '--rem-table-row-pad': `${template.layout.tableRowPaddingMm}mm`,
    '--rem-qr-size': `${template.layout.qrSizeMm}mm`,
  } as CSSProperties;

  const total = rows.reduce((sum, row) => sum + row.cashSales, 0);

  return (
    <div className="remittance-page" style={styleVars}>
      <div className="remittance-cut-line"></div>
      <div className="remittance-seal"></div>
      <div className="remittance-punch left top" />
      <div className="remittance-punch left bottom" />
      <div className="remittance-punch right top" />
      <div className="remittance-punch right bottom" />

      <div className="remittance-content">
        <div className="remittance-half-wrap shift-up">
          <RemittanceHalf
            template={template}
            title={template.text.copyLabelTop}
            rangeLabel={rangeLabel}
            createdAtLabel={createdAtLabel}
            total={total}
            rows={rows}
          />
        </div>
        <div className="remittance-half-wrap shift-down">
          <RemittanceHalf
            template={template}
            title={template.text.copyLabelBottom}
            rangeLabel={rangeLabel}
            createdAtLabel={createdAtLabel}
            total={total}
            rows={rows}
            inverted
          />
        </div>
      </div>
    </div>
  );
}

function RemittanceHalf({
  template,
  title,
  rangeLabel,
  createdAtLabel,
  total,
  rows,
  inverted,
}: {
  template: RemittanceTemplate;
  title: string;
  rangeLabel: string;
  createdAtLabel: string;
  total: number;
  rows: { date: string; cashSales: number }[];
  inverted?: boolean;
}) {
  const signatureDateLabel = toReiwa(new Date('2026-01-03'));
  return (
    <section className={`remittance-half${inverted ? ' inverted' : ''}`}>
      <div>
        <div className="remittance-title">{template.text.docTitle}</div>
        <div className="remittance-meta">
          <span>{rangeLabel}</span>
          <span>{title}</span>
        </div>
        <div className="remittance-sub">{template.text.detailTitle}</div>
      </div>

      <div>
        <table className="remittance-table">
          <thead>
            <tr>
              <th>{template.text.tableDateHeader}</th>
              <th>{template.text.tableCashHeader}</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 7).map((row) => (
              <tr key={row.date}>
                <td>{row.date.split('-').join('/')}</td>
                <td>{row.cashSales.toLocaleString()}円</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="remittance-total">
          {template.text.totalLabel} {total.toLocaleString()}円
        </div>
      </div>

      <div className="remittance-footer">
        <div>{createdAtLabel}</div>
        <div className="remittance-stamp">
          <div className="remittance-stamp-date">{signatureDateLabel}</div>
          <div className="remittance-stamp-line">{template.text.signatureLabel}</div>
        </div>
      </div>
    </section>
  );
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', minimumFractionDigits: 0 }).format(amount);

const formatFiscalYearLabel = (date: Date) => {
  const fiscalYear = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
  try {
    const parts = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', { era: 'short', year: 'numeric' })
      .formatToParts(new Date(fiscalYear, 3, 1));
    const era = parts.find(p => p.type === 'era')?.value ?? '';
    const year = parts.find(p => p.type === 'year')?.value ?? '';
    if (era && year) return `${era}${year}年度`;
  } catch {
    // ignore
  }
  return `${fiscalYear}年度`;
};

function SalesDailyPreview({
  template,
  target,
  previous,
}: {
  template: SalesDailyTemplate;
  target: typeof sampleDailyData;
  previous: typeof samplePreviousDays;
}) {
  const dayDate = new Date(`${target.date}T00:00:00`);
  const headerDate = dayDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
  const fiscalLabel = formatFiscalYearLabel(dayDate);
  const receivableValue = target.receivableCollection > 0
    ? `あり（${formatCurrency(target.receivableCollection)}）`
    : template.text.noneLabel;

  const metricsParts = [];
  if ((target.visitorsEstimate || 0) > 0) metricsParts.push(`来場者数 ${target.visitorsEstimate}`);
  if ((target.foodTroutCount || 0) > 0) metricsParts.push(`食用鱒 ${target.foodTroutCount}`);
  if ((target.anglingTroutCount || 0) > 0) metricsParts.push(`鱒釣 ${target.anglingTroutCount}`);
  if ((target.rodCount || 0) > 0) metricsParts.push(`竿 ${target.rodCount}`);
  const metricsLabel = metricsParts.join(' / ');

  const sourceTotals = target.categories.reduce(
    (acc, cat) => {
      cat.sources.forEach((source) => {
        acc[source.source] = (acc[source.source] || 0) + source.amount;
      });
      return acc;
    },
    { cash: 0, credit: 0, mobile: 0, receivable: 0 } as Record<string, number>
  );

  const categoryTotals = target.categories.map((cat) => {
    const total = cat.sources.reduce((sum, source) => sum + source.amount, 0);
    return { category: cat.category, total };
  }).filter((cat) => cat.total !== 0);

  const paymentRows: Array<[string, number]> = [
    [template.text.labels.cash, sourceTotals.cash || 0],
    [template.text.labels.credit, sourceTotals.credit || 0],
    [template.text.labels.mobile, sourceTotals.mobile || 0],
    [template.text.labels.receivable, sourceTotals.receivable || 0],
  ];

  const styleVars = {
    '--sr-page-margin': `${template.layout.pageMarginMm}mm`,
    '--sr-title-size': `${template.layout.titleFontPx}px`,
    '--sr-meta-size': `${template.layout.metaFontPx}px`,
    '--sr-section-gap': `${template.layout.sectionGapPx}px`,
    '--sr-border-width': `${template.layout.sectionBorderPx}px`,
    '--sr-section-pad': `${template.layout.sectionPaddingPx}px`,
    '--sr-label-size': `${template.layout.labelFontPx}px`,
    '--sr-row-size': `${template.layout.rowFontPx}px`,
    '--sr-row-small-size': `${template.layout.rowSmallFontPx}px`,
    '--sr-prev-gap': `${template.layout.prevGridGapPx}px`,
  } as React.CSSProperties;

  return (
    <div className="sales-daily-page" style={styleVars}>
      <div className="sales-daily-content">
        <div className="print-title">{template.text.title}</div>
        <div className="print-meta">
          {template.text.metaTemplate.replaceAll('{date}', headerDate).replaceAll('{fiscal}', fiscalLabel)}
        </div>
        <div className="print-meta">
          {template.text.receivableTemplate.replaceAll('{label}', receivableValue)}
        </div>
        {metricsLabel && (
          <div className="print-meta">
            {template.text.metricsTemplate.replaceAll('{metrics}', metricsLabel)}
          </div>
        )}

        <div className="print-section print-main">
          <div className="print-label">{template.text.sectionPayment}</div>
          {paymentRows.map(([label, value]) => (
            <div key={label} className="print-row">
              <span>{label}</span>
              <span>{formatCurrency(value)}</span>
            </div>
          ))}
          <div className="print-row"><span>{template.text.totalLabel}</span><span>{formatCurrency(target.total)}</span></div>
        </div>

        <div className="print-section print-category">
          <div className="print-label">{template.text.sectionCategory}</div>
          {categoryTotals.length > 0 ? (
            categoryTotals.map((item) => (
              <div key={item.category} className="print-row print-row-small">
                <span>{item.category}</span>
                <span>{formatCurrency(item.total)}</span>
              </div>
            ))
          ) : (
            <div className="print-row print-row-small"><span>{template.text.noneLabel}</span><span>¥0</span></div>
          )}
        </div>

        <div className="print-section">
          <div className="print-label">{template.text.sectionPrevious}</div>
          <div className="print-prev-list">
            {previous.map((day) => {
              const date = new Date(`${day.date}T00:00:00`).toLocaleDateString('ja-JP', {
                month: 'numeric',
                day: 'numeric',
                weekday: 'short',
              });
              const totals = day.categories.reduce(
                (acc, cat) => {
                  cat.sources.forEach((source) => {
                    acc[source.source] = (acc[source.source] || 0) + source.amount;
                  });
                  return acc;
                },
                { cash: 0, credit: 0, mobile: 0, receivable: 0 } as Record<string, number>
              );
              const rows: Array<[string, number]> = [
                [template.text.labels.cash, totals.cash || 0],
                [template.text.labels.credit, totals.credit || 0],
                [template.text.labels.mobile, totals.mobile || 0],
                [template.text.labels.receivable, totals.receivable || 0],
              ];

              return (
                <div key={day.date} className="prev-card">
                  <div className="prev-date">{date}</div>
                  {rows.map(([label, value]) => (
                    <div key={`${day.date}-${label}`} className="row">
                      <span>{label}</span>
                      <span>{formatCurrency(value)}</span>
                    </div>
                  ))}
                  <div className="prev-total">{template.text.totalLabel} {formatCurrency(day.total)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ForeignVisitorPreview({
  template,
}: {
  template: ForeignVisitorYearComparisonTemplate;
}) {
  const styleVars = {
    '--fv-page-margin-top': `${template.layout.pageMarginTopMm}mm`,
    '--fv-page-margin-side': `${template.layout.pageMarginSideMm}mm`,
    '--fv-page-margin-bottom': `${template.layout.pageMarginBottomMm}mm`,
    '--fv-org-font': `${template.layout.orgFontPx}px`,
    '--fv-title-font': `${template.layout.titleFontPx}px`,
    '--fv-meta-font': `${template.layout.metaFontPx}px`,
    '--fv-badge-font': `${template.layout.badgeFontPx}px`,
    '--fv-header-gap': `${template.layout.headerGapPx}px`,
    '--fv-detail-font': `${template.layout.detailFontPx}px`,
    '--fv-detail-pad': `${template.layout.detailPaddingPx}px`,
  } as React.CSSProperties;

  return (
    <div className="fv-report-page" style={styleVars}>
      <div className="fv-report-content">
        <div className="fv-header">
          <div>
            <div className="fv-org">{template.text.orgName}</div>
            <div className="fv-title">{template.text.docTitle}</div>
            <div className="fv-meta">
              {template.text.targetYearsLabel}：{sampleComparisonLabel}
            </div>
          </div>
          <div className="fv-badge">
            {template.text.badgeLabel}
          </div>
          <div className="fv-meta">
            {template.text.printedAtLabel}：2026-01-03 09:00
          </div>
        </div>
        <div className="fv-divider" />
        <div className="fv-grid">
          {sampleComparisonYears.map((y) => (
            <div key={y} className="fv-card">
              <div className="fv-card-title">{y}年</div>
              <div className="fv-card-body">
                <div className="fv-row">
                  <span>訪問者数</span>
                  <span>3,240名</span>
                </div>
                <div className="fv-row">
                  <span>件数</span>
                  <span>210件</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="fv-block">
          <div className="fv-block-title">月別訪問者数の推移</div>
          <div className="fv-block-chart" />
        </div>
        <div className="fv-block">
          <div className="fv-block-title">国・地域別訪問者内訳</div>
          <div className="fv-block-chart" />
        </div>
        <div className="fv-table">
          <div className="fv-table-head">
            <span>月</span>
            <span>2024年</span>
            <span>2025年</span>
          </div>
          {[1, 2, 3].map((m) => (
            <div key={m} className="fv-table-row">
              <span>{m}月</span>
              <span>120</span>
              <span>160</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InvoicePreview({
  settings,
  latest,
  apiBase,
  loading,
  error,
  nonce,
  onReload,
}: {
  settings: ArInvoiceSettings;
  latest: { id: number; invoiceNo: string; customerName: string; periodFrom: string; periodTo: string } | null;
  apiBase: string;
  loading: boolean;
  error: string | null;
  nonce: number;
  onReload: () => void;
}) {
  const styleVars = {
    '--inv-title-size': `${settings.titleFontSize}px`,
    '--inv-body-size': `${settings.bodyFontSize}px`,
    '--inv-amount-size': `${settings.amountFontSize}px`,
    '--inv-top-margin': `${settings.topMarginMm}mm`,
    '--inv-side-margin': `${settings.sideMarginMm}mm`,
    '--inv-line-width': `${settings.lineWidth}px`,
    '--inv-header-height': `${settings.headerHeightMm}mm`,
    '--inv-row-height': `${settings.rowHeightMm}mm`,
  } as CSSProperties;
  const pdfUrl = latest ? `${joinBase(apiBase, `/api/invoices/${latest.id}/pdf`)}?t=${nonce}` : '';

  return (
    <div className="invoice-preview-page" style={styleVars}>
      <div className="invoice-preview-toolbar">
        <div className="invoice-preview-title">最新の請求書プレビュー</div>
        <button type="button" className="btn ghost" onClick={onReload} disabled={loading}>
          最新帳票を再取得
        </button>
      </div>
      {error ? <div className="preview-error">{error}</div> : null}
      {loading ? <div className="preview-loading">読み込み中...</div> : null}
      {!loading && !latest ? <div className="preview-empty">請求書が見つかりませんでした。</div> : null}
      {latest && (
        <>
          <div className="preview-meta">
            {latest.invoiceNo} / {latest.customerName} / {latest.periodFrom}〜{latest.periodTo}
          </div>
          <iframe className="preview-iframe" title="請求書PDF" src={pdfUrl} />
        </>
      )}
    </div>
  );
}

function DeliveryNotePreview({
  settings,
  latest,
  apiBase,
  loading,
  error,
  nonce,
  onReload,
}: {
  settings: ArDeliveryNoteSettings;
  latest: { id: number; customerName: string; saleDate: string; productName?: string | null } | null;
  apiBase: string;
  loading: boolean;
  error: string | null;
  nonce: number;
  onReload: () => void;
}) {
  const pdfUrl = latest ? `${joinBase(apiBase, `/api/delivery-notes/by-id/${latest.id}/pdf`)}?t=${nonce}` : '';
  return (
    <div className="delivery-preview-page">
      <div className="invoice-preview-toolbar">
        <div className="invoice-preview-title">最新の納品書プレビュー</div>
        <button type="button" className="btn ghost" onClick={onReload} disabled={loading}>
          最新帳票を再取得
        </button>
      </div>
      {error ? <div className="preview-error">{error}</div> : null}
      {loading ? <div className="preview-loading">読み込み中...</div> : null}
      {!loading && !latest ? <div className="preview-empty">納品書が見つかりませんでした。</div> : null}
      {latest && (
        <>
          <div className="preview-meta">
            {latest.saleDate} / {latest.customerName} {latest.productName ? `/ ${latest.productName}` : ''}
          </div>
          <iframe className="preview-iframe" title="納品書PDF" src={pdfUrl} />
        </>
      )}
    </div>
  );
}
