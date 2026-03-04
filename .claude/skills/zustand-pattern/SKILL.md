---
name: zustand-pattern
description: パフォーマンスを重視した Zustand 状態管理パターン。Store 設計、セレクタによる最小限の re-render、非同期アクション、コードレビュー時に使用。利用側は必要な state のみ subscribe する。React Native / Expo 対応。
---

# Zustand パターン

**コアルール**: 利用側は必要な state のみ subscribe する。Store 全体の subscribe は禁止。

```tsx
// NG: Store 全体を subscribe（不要な re-render が発生）
const { user, isLoading } = useAuthStore();

// OK: 必要な state のみ個別に subscribe
const user = useAuthStore((s) => s.user);
const isLoading = useAuthStore((s) => s.isLoading);
```

## パターンガイド

| 用途                   | パターン                  | 参照                          |
| ---------------------- | ------------------------ | ----------------------------- |
| Store を定義したい      | Slice パターン            | [basics](references/basics.md) |
| state を読み取りたい    | セレクタ                  | [basics](references/basics.md) |
| state を更新したい      | Action 関数              | [basics](references/basics.md) |
| 非同期データ取得        | Async Action             | [async](references/async.md)  |
| 複数の値を subscribe   | 浅い比較セレクタ          | [basics](references/basics.md) |
| Store の永続化         | persist middleware        | [async](references/async.md)  |

## 命名規則

| タイプ            | パターン                  | 例                       |
| ----------------- | ------------------------ | ------------------------ |
| Store Hook        | `use{Feature}Store`      | `useAuthStore`           |
| セレクタ          | `(s) => s.xxx`           | `(s) => s.user`          |
| アクション        | `verb + 名詞`            | `login`, `resetError`    |

## ファイル構造

```
features/{feature}/
├── stores/
│   └── {feature}-store.ts   # Store 定義
├── components/
├── schemas/
├── hooks/
├── types/
└── index.ts
```

## Store の基本構造

```tsx
// features/auth/stores/auth-store.ts
import { create } from "zustand";

type AuthState = {
  // State
  user: User | null;
  isLoading: boolean;
  // Actions
  login: (creds: LoginCredentials) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  // State
  user: null,
  isLoading: false,
  // Actions
  login: async (creds) => {
    set({ isLoading: true });
    try {
      const user = await fetchLogin(creds);
      set({ user, isLoading: false });
    } catch {
      set({ isLoading: false });
      throw error;
    }
  },
  logout: () => set({ user: null }),
}));
```

## 利用側 (Container)

```tsx
// features/auth/components/login-form.tsx
import { useAuthStore } from "../stores/auth-store";

export function LoginFormContainer() {
  // 必要な state のみ個別に subscribe
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

## リファレンス

- [basics.md](references/basics.md) - Store 設計、セレクタ、パフォーマンス最適化
- [async.md](references/async.md) - 非同期アクション、永続化
