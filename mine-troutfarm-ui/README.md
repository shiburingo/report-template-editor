# @mine-troutfarm/ui

共通UIの初版パッケージです。ポータル配色・CSS変数・パレット管理を共通化します。

## 使い方（Vite / React）

1) CSS を読み込む

```css
@import "@mine-troutfarm/ui/theme.css";
```

2) パレットを適用する

```ts
import {
  PORTAL_PALETTES,
  DEFAULT_PORTAL_PALETTE_ID,
  applyPortalPalette,
  getPortalPaletteById,
} from "@mine-troutfarm/ui";

const palette = getPortalPaletteById(DEFAULT_PORTAL_PALETTE_ID);
applyPortalPalette("light", palette);
```

## 使い方（Flaskテンプレ）

- `theme.css` を `static/` 配下にコピーし、テンプレで読み込んでください。
- パレットは固定色で問題なければ JS 不要です。

## 同期対象

- `src/palettes.ts`
- `src/theme.css`

## 注意

- 本パッケージはローカル利用を想定しています。
- `package.json` で `file:../mine-troutfarm-ui` 参照にする運用を推奨します。
