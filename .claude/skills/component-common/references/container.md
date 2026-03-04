# Container コンポーネント (Features + Zustand)

Store 設計: **zustand-pattern** スキルを参照。

## ディレクトリ構成

```
features/{feature}/
├── components/     # 機能 UI
├── schemas/        # Valibot スキーマ (valibot-patterns 参照)
├── stores/         # Zustand stores
├── hooks/          # カスタムフック (オプション)
├── types/          # スキーマから導出できない型のみ
└── index.ts        # 公開 API
```

## テンプレート

```tsx
import { useAuthStore } from "../stores/auth-store";
import { LoginFormPresentation } from "@/components/auth/login-form";

export function LoginFormContainer() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const login = useAuthStore((s) => s.login);

  return (
    <LoginFormPresentation
      isLoading={isLoading}
      error={error}
      onSubmit={(email, password) => login({ email, password })}
    />
  );
}
```

## 公開 API

```tsx
// features/auth/index.ts
export { LoginFormContainer } from "./components/login-form";
export { useAuth } from "./hooks/use-auth";
export { useAuthStore } from "./stores/auth-store";
export type { User, LoginCredentials } from "./types";
```

## 原則

1. コロケーション: components, stores, hooks, types を feature フォルダ内に配置
2. Container/Presentation 分離
3. 必要なものだけをエクスポート
4. Container は Store からセレクタで必要な state のみ取得し、Presentation に props で渡す
5. Store のセレクタ: **zustand-pattern** に従う
