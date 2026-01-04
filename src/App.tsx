import { useMemo, useState } from 'react';
import {
  DEFAULT_REMITTANCE_TEMPLATE,
  normalizeRemittanceTemplate,
  REMITTANCE_TEMPLATE_KEY,
  type RemittanceTemplate,
} from './template';

const TEMPLATE_LIST = [
  { id: 'remittance-slip', name: '売上金納付書', key: REMITTANCE_TEMPLATE_KEY },
];

const sampleRows = [
  { date: '2026-01-01', cashSales: 47300 },
  { date: '2026-01-02', cashSales: 11900 },
  { date: '2026-01-03', cashSales: 9950 },
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

const loadLocalTemplate = () => {
  try {
    const raw = localStorage.getItem(REMITTANCE_TEMPLATE_KEY);
    if (!raw) return DEFAULT_REMITTANCE_TEMPLATE;
    return normalizeRemittanceTemplate(JSON.parse(raw));
  } catch {
    return DEFAULT_REMITTANCE_TEMPLATE;
  }
};

const saveLocalTemplate = (template: RemittanceTemplate) => {
  localStorage.setItem(REMITTANCE_TEMPLATE_KEY, JSON.stringify(template));
};

export function App() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(TEMPLATE_LIST[0].id);
  const [template, setTemplate] = useState<RemittanceTemplate>(() => loadLocalTemplate());
  const [status, setStatus] = useState<string>('');
  const [busy, setBusy] = useState(false);

  const apiBase = useMemo(() => getApiBase(), []);

  const rangeLabel = template.text.rangeTemplate
    .split('{start}')
    .join(toReiwa(new Date('2026-01-01')))
    .split('{end}')
    .join(toReiwa(new Date('2026-01-03')));
  const createdAtLabel = `${toReiwa(new Date('2026-01-03'))} ${template.text.createdAtSuffix}`.trim();

  const applyTemplate = (next: RemittanceTemplate) => {
    setTemplate(next);
    saveLocalTemplate(next);
  };

  const updateText = (key: keyof RemittanceTemplate['text'], value: string) => {
    applyTemplate({
      ...template,
      text: { ...template.text, [key]: value },
    });
  };

  const updateLayout = (key: keyof RemittanceTemplate['layout'], value: number) => {
    applyTemplate({
      ...template,
      layout: { ...template.layout, [key]: value },
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
      const res = await fetch(`${apiBase}/api/kv/${encodeURIComponent(REMITTANCE_TEMPLATE_KEY)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { ok: boolean; value: unknown };
      if (!json.value) {
        applyTemplate(DEFAULT_REMITTANCE_TEMPLATE);
        setStatus('サーバーにはテンプレートが未登録でした。既定値を使用します。');
      } else {
        applyTemplate(normalizeRemittanceTemplate(json.value));
        setStatus('サーバーのテンプレートを読み込みました。');
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
      const res = await fetch(`${apiBase}/api/kv/${encodeURIComponent(REMITTANCE_TEMPLATE_KEY)}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(template),
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
    applyTemplate(DEFAULT_REMITTANCE_TEMPLATE);
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
                <div className="list-meta">sales-management-system</div>
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
            <RemittancePreview
              template={template}
              rangeLabel={rangeLabel}
              createdAtLabel={createdAtLabel}
              rows={sampleRows}
            />
          </div>
        </section>

        <section className="panel editor">
          <div className="panel-title">編集パネル</div>
          <div className="status">{status || '変更は自動でローカル保存されます。'}</div>

          <section className="section">
            <div className="section-title">文言</div>
            <div className="grid">
              <Field label="帳票タイトル">
                <input value={template.text.docTitle} onChange={(e) => updateText('docTitle', e.target.value)} />
              </Field>
              <Field label="明細タイトル">
                <input value={template.text.detailTitle} onChange={(e) => updateText('detailTitle', e.target.value)} />
              </Field>
              <Field label="上段ラベル">
                <input value={template.text.copyLabelTop} onChange={(e) => updateText('copyLabelTop', e.target.value)} />
              </Field>
              <Field label="下段ラベル">
                <input value={template.text.copyLabelBottom} onChange={(e) => updateText('copyLabelBottom', e.target.value)} />
              </Field>
              <Field label="表: 日付">
                <input value={template.text.tableDateHeader} onChange={(e) => updateText('tableDateHeader', e.target.value)} />
              </Field>
              <Field label="表: 現金売上">
                <input value={template.text.tableCashHeader} onChange={(e) => updateText('tableCashHeader', e.target.value)} />
              </Field>
              <Field label="合計ラベル">
                <input value={template.text.totalLabel} onChange={(e) => updateText('totalLabel', e.target.value)} />
              </Field>
              <Field label="署名欄">
                <input value={template.text.signatureLabel} onChange={(e) => updateText('signatureLabel', e.target.value)} />
              </Field>
              <Field label="作成ラベル">
                <input value={template.text.createdAtSuffix} onChange={(e) => updateText('createdAtSuffix', e.target.value)} />
              </Field>
              <Field label="期間テンプレート">
                <input value={template.text.rangeTemplate} onChange={(e) => updateText('rangeTemplate', e.target.value)} />
              </Field>
              <Field label="空欄メッセージ">
                <input value={template.text.emptyLabel} onChange={(e) => updateText('emptyLabel', e.target.value)} />
              </Field>
            </div>
          </section>

          <section className="section">
            <div className="section-title">レイアウト</div>
            <div className="grid">
              <NumberField label="外側上余白 (mm)" value={template.layout.contentPaddingTopMm} onChange={(v) => updateLayout('contentPaddingTopMm', v)} />
              <NumberField label="外側左右余白 (mm)" value={template.layout.contentPaddingSideMm} onChange={(v) => updateLayout('contentPaddingSideMm', v)} />
              <NumberField label="上下シフト (mm)" value={template.layout.halfShiftMm} onChange={(v) => updateLayout('halfShiftMm', v)} />
              <NumberField label="枠の高さ (mm)" value={template.layout.frameHeightMm} onChange={(v) => updateLayout('frameHeightMm', v)} />
              <NumberField label="枠内余白 (mm)" value={template.layout.framePaddingMm} onChange={(v) => updateLayout('framePaddingMm', v)} />
              <NumberField label="枠内下余白 (mm)" value={template.layout.framePaddingBottomMm} onChange={(v) => updateLayout('framePaddingBottomMm', v)} />
              <NumberField label="タイトル文字 (px)" value={template.layout.titleFontPx} onChange={(v) => updateLayout('titleFontPx', v)} />
              <NumberField label="メタ文字 (px)" value={template.layout.metaFontPx} onChange={(v) => updateLayout('metaFontPx', v)} />
              <NumberField label="小見出し (px)" value={template.layout.subFontPx} onChange={(v) => updateLayout('subFontPx', v)} />
              <NumberField label="表文字 (px)" value={template.layout.tableFontPx} onChange={(v) => updateLayout('tableFontPx', v)} />
              <NumberField label="合計文字 (px)" value={template.layout.totalFontPx} onChange={(v) => updateLayout('totalFontPx', v)} />
              <NumberField label="フッター文字 (px)" value={template.layout.footerFontPx} onChange={(v) => updateLayout('footerFontPx', v)} />
              <NumberField label="署名文字 (px)" value={template.layout.signatureFontPx} onChange={(v) => updateLayout('signatureFontPx', v)} />
              <NumberField label="署名枠 (mm)" value={template.layout.signatureBoxMm} onChange={(v) => updateLayout('signatureBoxMm', v)} />
              <NumberField label="線幅 (px)" value={template.layout.lineWidthPx} onChange={(v) => updateLayout('lineWidthPx', v)} />
              <NumberField label="表の行余白 (mm)" value={template.layout.tableRowPaddingMm} onChange={(v) => updateLayout('tableRowPaddingMm', v)} />
              <NumberField label="QRサイズ (mm)" value={template.layout.qrSizeMm} onChange={(v) => updateLayout('qrSizeMm', v)} />
            </div>
          </section>
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
