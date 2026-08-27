import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme as useRNColorScheme, Appearance, StatusBar } from "react-native";
import * as SecureStore from "expo-secure-store";

export type ThemeMode = "light" | "dark" | "system";

export const themeColors = {
    light: {
        background: "#fff9e3",
        foreground: "#081126",
        card: "#fff8e7",
        muted: "#f6eecf",
        mutedForeground: "rgba(0, 0, 0, 0.6)",
        primary: "#081126",
        accent: "#ea7a53",
        border: "rgba(0, 0, 0, 0.1)",
        success: "#16a34a",
        destructive: "#dc2626",
        subscription: "#8fd1bd",
        inputBg: "#fff9e3",
    },
    dark: {
        background: "#0d131f",
        foreground: "#f3f4f6",
        card: "#182232",
        muted: "#273549",
        mutedForeground: "rgba(255, 255, 255, 0.5)",
        primary: "#ea7a53", // accent color or readable text color
        accent: "#ea7a53",
        border: "rgba(255, 255, 255, 0.1)",
        success: "#22c55e",
        destructive: "#ef4444",
        subscription: "#1f4d41", // dark subscription panel bg
        inputBg: "#0d131f",
    },
};

export type ThemeColors = typeof themeColors.light;

interface ThemeContextType {
    themeMode: ThemeMode;
    isDark: boolean;
    colors: ThemeColors;
    setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

import { View } from "react-native";
import { vars } from "react-native-css";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemScheme = useRNColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>("system");

    useEffect(() => {
        // Load initial theme mode from SecureStore
        SecureStore.getItemAsync("user-theme-mode")
            .then((savedMode) => {
                if (savedMode === "light" || savedMode === "dark" || savedMode === "system") {
                    setThemeModeState(savedMode as ThemeMode);
                }
            })
            .catch((e) => console.log("Failed to load theme mode", e));
    }, []);

    const isDark =
        themeMode === "system"
            ? systemScheme === "dark"
            : themeMode === "dark";

    const currentColors = isDark ? themeColors.dark : themeColors.light;

    const themeVariables = {
        "--background": currentColors.background,
        "--foreground": currentColors.foreground,
        "--card": currentColors.card,
        "--muted": currentColors.muted,
        "--muted-foreground": currentColors.mutedForeground,
        "--primary": currentColors.primary,
        "--border": currentColors.border,
        "--subscription": currentColors.subscription,
    };

    const setThemeMode = async (mode: ThemeMode) => {
        try {
            setThemeModeState(mode);
            await SecureStore.setItemAsync("user-theme-mode", mode);
        } catch (e) {
            console.log("Failed to save theme mode", e);
        }
    };

    return (
        <ThemeContext.Provider value={{ themeMode, isDark, colors: currentColors, setThemeMode }}>
            <StatusBar
                barStyle={isDark ? "light-content" : "dark-content"}
                backgroundColor={currentColors.background}
            />
            <View style={[{ flex: 1 }, vars(themeVariables)]}>
                {children}
            </View>
        </ThemeContext.Provider>
    );
};

export const useAppTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useAppTheme must be used within a ThemeProvider");
    }
    return context;
};
