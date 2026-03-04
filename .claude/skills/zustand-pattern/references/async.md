# 非同期アクションと永続化

## 非同期アクション

Actions は `async` 関数として定義できる。loading / error state を明示的に管理する。

```tsx
import { create } from "zustand";

type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (creds: LoginCredentials) => Promise<void>;
  logout: () => void;
  resetError: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  login: async (creds) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await api.login(creds);
      set({ user, isLoading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "ログインに失敗しました", isLoading: false });
    }
  },
  logout: () => set({ user: null }),
  resetError: () => set({ error: null }),
}));
```

## 検索機能の実装例

```tsx
type SearchState = {
  keyword: string;
  results: Product[];
  isSearching: boolean;
  setKeyword: (keyword: string) => void;
  search: () => Promise<void>;
};

export const useSearchStore = create<SearchState>((set, get) => ({
  keyword: "",
  results: [],
  isSearching: false,
  setKeyword: (keyword) => set({ keyword }),
  search: async () => {
    const { keyword } = get();
    if (!keyword) {
      set({ results: [] });
      return;
    }
    set({ isSearching: true });
    try {
      const results = await searchProducts(keyword);
      set({ results, isSearching: false });
    } catch {
      set({ isSearching: false });
    }
  },
}));
```

## persist middleware（永続化）

`persist` middleware で state を AsyncStorage（React Native）や localStorage に自動保存する。

```tsx
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthState = {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // 永続化する state を限定（Actions は自動除外）
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
```

### partialize で保存対象を制御

`partialize` で保存する state を明示的に指定する。一時的な UI state（isLoading 等）は永続化しない。

```tsx
partialize: (state) => ({
  token: state.token,    // 永続化する
  user: state.user,      // 永続化する
  // isLoading は永続化しない
  // error は永続化しない
}),
```

## テスト

非同期 Actions のテストは `getState()` でアクセスする。

```tsx
import { useAuthStore } from "./auth-store";

// API モック
vi.mock("../api", () => ({
  api: {
    login: vi.fn(),
  },
}));

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    isLoading: false,
    error: null,
  });
});

describe("authStore", () => {
  it("login 成功時に user がセットされる", async () => {
    const mockUser = { id: "1", name: "Test User" };
    vi.mocked(api.login).mockResolvedValue({ user: mockUser });

    await useAuthStore.getState().login({ email: "test@example.com", password: "pass" });

    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it("login 失敗時に error がセットされる", async () => {
    vi.mocked(api.login).mockRejectedValue(new Error("認証エラー"));

    await useAuthStore.getState().login({ email: "test@example.com", password: "wrong" });

    expect(useAuthStore.getState().error).toBe("認証エラー");
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});
```
