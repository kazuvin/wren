---
name: component-creator-mobile
description: React Native / Expo コンポーネント作成。apps/mobile 配下の作業時に使用。StyleSheet, View/Text/Pressable, @testing-library/react-native を使用。デザイントークンは @wren/design-tokens から TS import で利用。共通パターンは component-common スキルを参照。
---

# Component Creator - Mobile (React Native / Expo)

関連スキル:
- **component-common**: 共通パターン (Decision Guide, 命名規則, Container パターン)
- **design-tokens**: デザイントークン (色・スペーシング等の SSoT)
- **zustand-pattern**: Store design for containers

## クイックスタート

### Presentation

```tsx
import { Pressable, Text, StyleSheet, type ViewStyle } from "react-native";

type ButtonProps = {
  variant?: "primary" | "secondary";
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({ variant = "primary", title, style, ...props }: ButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        pressed && styles.pressed,
        props.disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <Text style={[styles.text, textVariantStyles[variant]]}>{title}</Text>
    </Pressable>
  );
}
```

### Container

```tsx
import { useAuthStore } from "../stores/auth-store";

export function LoginForm() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const login = useAuthStore((s) => s.login);
  // Container/Presentation 分割 → component-common 参照
}
```

## リファレンス

- [presentation.md](references/presentation.md) - RN Presentation パターン
- [ui-components.md](references/ui-components.md) - RN UI カタログ
