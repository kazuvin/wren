import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
	const colorScheme = useColorScheme();

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<KeyboardProvider>
				<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
					<Stack>
						<Stack.Screen name="index" options={{ headerShown: false }} />
						<Stack.Screen name="modal" options={{ presentation: "modal", title: "タスクを追加" }} />
					</Stack>
					<StatusBar style="auto" />
				</ThemeProvider>
			</KeyboardProvider>
		</GestureHandlerRootView>
	);
}
