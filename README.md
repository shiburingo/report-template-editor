# 帳票テンプレート編集

業務アプリの帳票テンプレート（納付書・売上日報・年別比較）をGUIで編集し、KVに保存するためのツールです。

## 開発起動

```bash
npm install
npm run dev
```

## 本番想定

- base path: `/report-template-editor/`
- 保存先KV（既定）:
  - `reportTemplates.remittance`（売上金納付書 / mine-trout-cash-api）
  - `reportTemplates.salesDaily`（売上日報 / mine-trout-cash-api）
- foreign-visitor-system 用:
  - `reportTemplates.foreignVisitorYearComparison`（年別比較 / foreign-visitor-system）
- APIベース:
  - `VITE_TEMPLATE_API_BASE`（mine-trout-cash 系）
  - `VITE_FV_TEMPLATE_API_BASE`（foreign-visitor-system / 既定は `/api`）
