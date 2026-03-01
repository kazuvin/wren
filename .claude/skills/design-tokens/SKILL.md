---
name: design-tokens
description: デザイントークンの設計・利用・追加。@wren/design-tokens パッケージが SSoT。Mobile (RN StyleSheet) で利用。トークンの追加・変更、スタイリング時のトークン参照、CSS 生成時に使用。
---

# Design Tokens (`@wren/design-tokens`)

TypeScript のデザイントークンを **Single Source of Truth (SSoT)** とし、Mobile プラットフォームで共有するパッケージ。

関連スキル:
- **component-creator-mobile**: Mobile コンポーネントでのトークン利用

## 設計方針

1. **SSoT**: すべてのデザイン値は `packages/design-tokens/src/tokens/` に TypeScript で定義
2. **プラットフォーム変換**: TS トークン → Tailwind v4 `@theme` CSS を自動生成
3. **型安全**: トークンキーは TypeScript の型として利用可能
4. **値の形式**: すべての値は CSS 互換文字列 (`"16px"`, `"#11181C"`)。RN では `parseNumeric()` で数値変換

## パッケージ構成

```
packages/design-tokens/
├── src/
│   ├── index.ts              # 公開 API (トークン + parseNumeric)
│   ├── tokens/               # トークン定義
│   │   ├── colors.ts         # light/dark カラー
│   │   ├── spacing.ts        # スペーシング
│   │   ├── typography.ts     # fontSize, lineHeight, fontWeight
│   │   ├── radius.ts         # ボーダー半径
│   │   └── index.ts          # 集約
│   ├── css.ts                # CSS カスタムプロパティ変換
│   └── tailwind.ts           # @theme CSS 生成
├── scripts/
│   └── generate-css.ts       # CSS 生成スクリプト
└── generated/
    └── theme.css             # 生成 CSS (git 管理)
```

## リファレンス

- [token-usage.md](references/token-usage.md) - トークンの使い方 (Mobile)
- [adding-tokens.md](references/adding-tokens.md) - トークンの追加・変更手順
