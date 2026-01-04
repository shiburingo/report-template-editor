import { useMemo, useState } from 'react';
import {
  DEFAULT_SALES_DAILY_TEMPLATE,
  DEFAULT_REMITTANCE_TEMPLATE,
  SALES_DAILY_TEMPLATE_KEY,
  normalizeRemittanceTemplate,
  normalizeSalesDailyTemplate,
  REMITTANCE_TEMPLATE_KEY,
  type SalesDailyTemplate,
  type RemittanceTemplate,
} from './template';

const TEMPLATE_LIST = [
  { id: 'remittance-slip', name: '売上金納付書', key: REMITTANCE_TEMPLATE_KEY },
  { id: 'sales-daily', name: '売上日報', key: SALES_DAILY_TEMPLATE_KEY },
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

const toReiwa = (date: Date) => {
  const reiwaStart = new Date('2019-05-01T00:00:00');
  let eraYear = date.getFullYear() - 2018;
  if (date < reiwaStart) {
    eraYear = date.getFullYear() - 1988;
    return `平成${eraYear}年${date.getMonth() + 1}月${date.getDate()}日`;
  }
  return `令和${eraYear}年${date.getMonth() + 1}月${date.getDate()}日`;
};

const getApiBase = () => {
  const env = (import.meta as any).env?.VITE_TEMPLATE_API_BASE as string | undefined;
  if (env && env.trim()) return env.trim();
  if (typeof window === 'undefined') return '';
  return window.location.pathname.startsWith('/report-template-editor/')
    ? '/mine-trout-cash-api'
    : '';
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

const loadLocalSalesDailyTemplate = () => {
  try {
    const raw = localStorage.getItem(SALES_DAILY_TEMPLATE_KEY);
    if (!raw) return DEFAULT_SALES_DAILY_TEMPLATE;
    return normalizeSalesDailyTemplate(JSON.parse(raw));
  } catch {
    return DEFAULT_SALES_DAILY_TEMPLATE;
  }
};

const saveLocalRemittanceTemplate = (template: RemittanceTemplate) => {
  localStorage.setItem(REMITTANCE_TEMPLATE_KEY, JSON.stringify(template));
};

const saveLocalSalesDailyTemplate = (template: SalesDailyTemplate) => {
  localStorage.setItem(SALES_DAILY_TEMPLATE_KEY, JSON.stringify(template));
};

export function App() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(TEMPLATE_LIST[0].id);
  const [remittanceTemplate, setRemittanceTemplate] = useState<RemittanceTemplate>(() => loadLocalRemittanceTemplate());
  const [salesDailyTemplate, setSalesDailyTemplate] = useState<SalesDailyTemplate>(() => loadLocalSalesDailyTemplate());
  const [status, setStatus] = useState<string>('');
  const [busy, setBusy] = useState(false);

  const apiBase = useMemo(() => getApiBase(), []);
  const isRemittance = selectedTemplateId === 'remittance-slip';
  const activeTemplateMeta = TEMPLATE_LIST.find((item) => item.id === selectedTemplateId);

  const rangeLabel = remittanceTemplate.text.rangeTemplate
    .split('{start}')
    .join(toReiwa(new Date('2026-01-01')))
    .split('{end}')
    .join(toReiwa(new Date('2026-01-03')));
  const createdAtLabel = `${toReiwa(new Date('2026-01-03'))} ${remittanceTemplate.text.createdAtSuffix}`.trim();

  const applyRemittanceTemplate = (next: RemittanceTemplate) => {
    setRemittanceTemplate(next);
    saveLocalRemittanceTemplate(next);
  };

  const applySalesDailyTemplate = (next: SalesDailyTemplate) => {
    setSalesDailyTemplate(next);
    saveLocalSalesDailyTemplate(next);
  };

  const updateRemittanceText = (key: keyof RemittanceTemplate['text'], value: string) => {
    applyRemittanceTemplate({
      ...remittanceTemplate,
      text: { ...remittanceTemplate.text, [key]: value },
    });
  };

  const updateRemittanceLayout = (key: keyof RemittanceTemplate['layout'], value: number) => {
    applyRemittanceTemplate({
      ...remittanceTemplate,
      layout: { ...remittanceTemplate.layout, [key]: value },
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

  const loadFromServer = async () => {
    if (!apiBase) {
      setStatus('API未設定のため読み込みできません。');
      return;
    }
    setBusy(true);
    setStatus('サーバーから読み込み中...');
    try {
      const templateKey = isRemittance ? REMITTANCE_TEMPLATE_KEY : SALES_DAILY_TEMPLATE_KEY;
      const res = await fetch(`${apiBase}/api/kv/${encodeURIComponent(templateKey)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { ok: boolean; value: unknown };
      if (isRemittance) {
        if (!json.value) {
          applyRemittanceTemplate(DEFAULT_REMITTANCE_TEMPLATE);
          setStatus('サーバーにはテンプレートが未登録でした。既定値を使用します。');
        } else {
          applyRemittanceTemplate(normalizeRemittanceTemplate(json.value));
          setStatus('サーバーのテンプレートを読み込みました。');
        }
      } else {
        if (!json.value) {
          applySalesDailyTemplate(DEFAULT_SALES_DAILY_TEMPLATE);
          setStatus('サーバーにはテンプレートが未登録でした。既定値を使用します。');
        } else {
          applySalesDailyTemplate(normalizeSalesDailyTemplate(json.value));
          setStatus('サーバーのテンプレートを読み込みました。');
        }
      }
    } catch (e: any) {
      setStatus(`読み込みに失敗しました: ${e?.message ?? String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const saveToServer = async () => {
    if (!apiBase) {
      setStatus('API未設定のため保存できません。');
      return;
    }
    setBusy(true);
    setStatus('サーバーへ保存中...');
    try {
      const templateKey = isRemittance ? REMITTANCE_TEMPLATE_KEY : SALES_DAILY_TEMPLATE_KEY;
      const payload = isRemittance ? remittanceTemplate : salesDailyTemplate;
      const res = await fetch(`${apiBase}/api/kv/${encodeURIComponent(templateKey)}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus('サーバーに保存しました。');
    } catch (e: any) {
      setStatus(`保存に失敗しました: ${e?.message ?? String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const resetTemplate = () => {
    if (isRemittance) {
      applyRemittanceTemplate(DEFAULT_REMITTANCE_TEMPLATE);
    } else {
      applySalesDailyTemplate(DEFAULT_SALES_DAILY_TEMPLATE);
    }
    setStatus('既定値に戻しました。');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <div className="app-title">帳票テンプレート編集</div>
          <div className="app-sub">帳票のレイアウトと文言をGUIで調整し、業務アプリに反映します。</div>
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
                  {item.id === 'remittance-slip' ? 'sales-management-system' : 'sales-report'}
                </div>
              </button>
            ))}
          </div>
          <div className="helper">
            <div className="helper-title">接続先</div>
            <div className="helper-value">{apiBase || '未設定'}</div>
            <div className="helper-note">保存は mine-trout-cash のKVに反映されます。</div>
          </div>
        </aside>

        <section className="panel preview">
          <div className="panel-title">プレビュー</div>
          <div className="preview-wrap">
            {isRemittance ? (
              <RemittancePreview
                template={remittanceTemplate}
                rangeLabel={rangeLabel}
                createdAtLabel={createdAtLabel}
                rows={sampleRows}
              />
            ) : (
              <SalesDailyPreview
                template={salesDailyTemplate}
                target={sampleDailyData}
                previous={samplePreviousDays}
              />
            )}
          </div>
        </section>

        <section className="panel editor">
          <div className="panel-title">{activeTemplateMeta?.name ?? '編集パネル'}</div>
          <div className="status">{status || '変更は自動でローカル保存されます。'}</div>

          {isRemittance ? (
            <>
              <section className="section">
                <div className="section-title">文言</div>
                <div className="grid">
                  <Field label="帳票タイトル">
                    <input value={remittanceTemplate.text.docTitle} onChange={(e) => updateRemittanceText('docTitle', e.target.value)} />
                  </Field>
                  <Field label="明細タイトル">
                    <input value={remittanceTemplate.text.detailTitle} onChange={(e) => updateRemittanceText('detailTitle', e.target.value)} />
                  </Field>
                  <Field label="上段ラベル">
                    <input value={remittanceTemplate.text.copyLabelTop} onChange={(e) => updateRemittanceText('copyLabelTop', e.target.value)} />
                  </Field>
                  <Field label="下段ラベル">
                    <input value={remittanceTemplate.text.copyLabelBottom} onChange={(e) => updateRemittanceText('copyLabelBottom', e.target.value)} />
                  </Field>
                  <Field label="表: 日付">
                    <input value={remittanceTemplate.text.tableDateHeader} onChange={(e) => updateRemittanceText('tableDateHeader', e.target.value)} />
                  </Field>
                  <Field label="表: 現金売上">
                    <input value={remittanceTemplate.text.tableCashHeader} onChange={(e) => updateRemittanceText('tableCashHeader', e.target.value)} />
                  </Field>
                  <Field label="合計ラベル">
                    <input value={remittanceTemplate.text.totalLabel} onChange={(e) => updateRemittanceText('totalLabel', e.target.value)} />
                  </Field>
                  <Field label="署名欄">
                    <input value={remittanceTemplate.text.signatureLabel} onChange={(e) => updateRemittanceText('signatureLabel', e.target.value)} />
                  </Field>
                  <Field label="作成ラベル">
                    <input value={remittanceTemplate.text.createdAtSuffix} onChange={(e) => updateRemittanceText('createdAtSuffix', e.target.value)} />
                  </Field>
                  <Field label="期間テンプレート">
                    <input value={remittanceTemplate.text.rangeTemplate} onChange={(e) => updateRemittanceText('rangeTemplate', e.target.value)} />
                  </Field>
                  <Field label="空欄メッセージ">
                    <input value={remittanceTemplate.text.emptyLabel} onChange={(e) => updateRemittanceText('emptyLabel', e.target.value)} />
                  </Field>
                </div>
              </section>

              <section className="section">
                <div className="section-title">レイアウト</div>
                <div className="grid">
                  <NumberField label="外側上余白 (mm)" value={remittanceTemplate.layout.contentPaddingTopMm} onChange={(v) => updateRemittanceLayout('contentPaddingTopMm', v)} />
                  <NumberField label="外側左右余白 (mm)" value={remittanceTemplate.layout.contentPaddingSideMm} onChange={(v) => updateRemittanceLayout('contentPaddingSideMm', v)} />
                  <NumberField label="上下シフト (mm)" value={remittanceTemplate.layout.halfShiftMm} onChange={(v) => updateRemittanceLayout('halfShiftMm', v)} />
                  <NumberField label="枠の高さ (mm)" value={remittanceTemplate.layout.frameHeightMm} onChange={(v) => updateRemittanceLayout('frameHeightMm', v)} />
                  <NumberField label="枠内余白 (mm)" value={remittanceTemplate.layout.framePaddingMm} onChange={(v) => updateRemittanceLayout('framePaddingMm', v)} />
                  <NumberField label="枠内下余白 (mm)" value={remittanceTemplate.layout.framePaddingBottomMm} onChange={(v) => updateRemittanceLayout('framePaddingBottomMm', v)} />
                  <NumberField label="タイトル文字 (px)" value={remittanceTemplate.layout.titleFontPx} onChange={(v) => updateRemittanceLayout('titleFontPx', v)} />
                  <NumberField label="メタ文字 (px)" value={remittanceTemplate.layout.metaFontPx} onChange={(v) => updateRemittanceLayout('metaFontPx', v)} />
                  <NumberField label="小見出し (px)" value={remittanceTemplate.layout.subFontPx} onChange={(v) => updateRemittanceLayout('subFontPx', v)} />
                  <NumberField label="表文字 (px)" value={remittanceTemplate.layout.tableFontPx} onChange={(v) => updateRemittanceLayout('tableFontPx', v)} />
                  <NumberField label="合計文字 (px)" value={remittanceTemplate.layout.totalFontPx} onChange={(v) => updateRemittanceLayout('totalFontPx', v)} />
                  <NumberField label="フッター文字 (px)" value={remittanceTemplate.layout.footerFontPx} onChange={(v) => updateRemittanceLayout('footerFontPx', v)} />
                  <NumberField label="署名文字 (px)" value={remittanceTemplate.layout.signatureFontPx} onChange={(v) => updateRemittanceLayout('signatureFontPx', v)} />
                  <NumberField label="署名枠 (mm)" value={remittanceTemplate.layout.signatureBoxMm} onChange={(v) => updateRemittanceLayout('signatureBoxMm', v)} />
                  <NumberField label="線幅 (px)" value={remittanceTemplate.layout.lineWidthPx} onChange={(v) => updateRemittanceLayout('lineWidthPx', v)} />
                  <NumberField label="表の行余白 (mm)" value={remittanceTemplate.layout.tableRowPaddingMm} onChange={(v) => updateRemittanceLayout('tableRowPaddingMm', v)} />
                  <NumberField label="QRサイズ (mm)" value={remittanceTemplate.layout.qrSizeMm} onChange={(v) => updateRemittanceLayout('qrSizeMm', v)} />
                </div>
              </section>
            </>
          ) : (
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
    '--rem-signature': `${template.layout.signatureBoxMm}mm`,
    '--rem-line-width': `${template.layout.lineWidthPx}px`,
    '--rem-table-row-pad': `${template.layout.tableRowPaddingMm}mm`,
    '--rem-qr-size': `${template.layout.qrSizeMm}mm`,
  } as React.CSSProperties;

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
        <div className="remittance-stamp">{template.text.signatureLabel}</div>
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
