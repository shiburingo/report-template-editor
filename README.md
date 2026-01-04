# 帳票テンプレート編集

mine-trout-cash の帳票テンプレート（納付書など）をGUIで編集し、KVに保存するためのツールです。

## 開発起動

```bash
npm install
npm run dev
```

## 本番想定

- base path: `/report-template-editor/`
- 保存先KV: `reportTemplates.remittance`（mine-trout-cash-api）
- APIベースは `VITE_TEMPLATE_API_BASE` で上書き可能

