# Zustand 基礎: Store 設計とセレクタ

## Store 設計の原則

1. **State と Actions を同じ Store に定義**: 型で明示的に宣言する
2. **Store は feature 単位で分割**: 1つの巨大な Store を避ける
3. **Actions は Store 内に定義**: 外部から `set` を直接呼ばない

```tsx
import { create } from "zustand";

type CounterState = {
  count: number;
  increment: (step?: number) => void;
  decrement: (step?: number) => void;
  reset: () => void;
};

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: (step = 1) => set((s) => ({ count: s.count + step })),
  decrement: (step = 1) => set((s) => ({ count: s.count - step })),
  reset: () => set({ count: 0 }),
}));
```

## セレクタ（パフォーマンスの要）

### 必須ルール: 必要な state のみ subscribe する

Zustand は subscribe している state が変更されたときのみ re-render する。Store 全体を subscribe すると、どの state が変更されても re-render が発生する。

```tsx
// NG: Store 全体を subscribe
const { count } = useCounterStore();

// OK: 個別セレクタで subscribe
const count = useCounterStore((s) => s.count);
```

### Actions の subscribe

Actions は参照が変わらないため、re-render を引き起こさない。個別に取得する。

```tsx
const increment = useCounterStore((s) => s.increment);
```

### 複数の値を subscribe する場合

複数の値が必要な場合は `useShallow` を使う。

```tsx
import { useShallow } from "zustand/react/shallow";

// OK: useShallow で浅い比較
const { user, isLoading } = useAuthStore(
  useShallow((s) => ({ user: s.user, isLoading: s.isLoading }))
);
```

**注意**: `useShallow` はオブジェクトの浅い比較を行う。ネストしたオブジェクトの一部が変わっても、トップレベルの参照が同じなら re-render しない。

## 派生 State

Store 内で computed value を定義する場合は `get` を使う。

```tsx
type CartState = {
  items: CartItem[];
  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item) => set((s) => ({ items: [...s.items, item] })),
  removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
}));

// 派生値はセレクタで計算する
const totalPrice = useCartStore((s) =>
  s.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);
```

**注意**: セレクタ内で毎回新しいオブジェクト/配列を生成する場合、毎回 re-render が発生する。その場合は `useShallow` またはメモ化を検討する。

```tsx
// NG: 毎回新しい配列を生成 → 毎回 re-render
const itemNames = useCartStore((s) => s.items.map((i) => i.name));

// OK: useShallow で浅い比較
const itemNames = useCartStore(useShallow((s) => s.items.map((i) => i.name)));
```

## Slice パターン（大規模 Store の分割）

Store が大きくなった場合、Slice パターンで分割する。

```tsx
// stores/auth-slice.ts
export type AuthSlice = {
  user: User | null;
  login: (creds: LoginCredentials) => Promise<void>;
  logout: () => void;
};

export const createAuthSlice: StateCreator<AppState, [], [], AuthSlice> = (set) => ({
  user: null,
  login: async (creds) => {
    const user = await fetchLogin(creds);
    set({ user });
  },
  logout: () => set({ user: null }),
});

// stores/app-store.ts
import { create, type StateCreator } from "zustand";

type AppState = AuthSlice & UISlice;

export const useAppStore = create<AppState>()((...args) => ({
  ...createAuthSlice(...args),
  ...createUISlice(...args),
}));
```

## Store 外からのアクセス

React コンポーネント外から Store にアクセスする場合は `getState` / `setState` を使う。

```tsx
// ユーティリティやミドルウェアから
const user = useAuthStore.getState().user;
useAuthStore.getState().logout();
```

## テスト

Store はテスト前にリセットする。

```tsx
import { useCounterStore } from "./counter-store";

beforeEach(() => {
  useCounterStore.setState({ count: 0 });
});

describe("counterStore", () => {
  it("increment で count が増加する", () => {
    const { increment } = useCounterStore.getState();
    increment();
    expect(useCounterStore.getState().count).toBe(1);
  });

  it("step を指定して increment できる", () => {
    const { increment } = useCounterStore.getState();
    increment(5);
    expect(useCounterStore.getState().count).toBe(5);
  });

  it("reset で 0 に戻る", () => {
    useCounterStore.setState({ count: 10 });
    const { reset } = useCounterStore.getState();
    reset();
    expect(useCounterStore.getState().count).toBe(0);
  });
});
```
