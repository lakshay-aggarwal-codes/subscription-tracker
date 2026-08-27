import React, { useState } from 'react';
import { Text, View, Pressable, Image, ScrollView, Modal, Platform, Switch } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useClerk, useUser } from '@clerk/expo';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import { posthog } from '@/lib/posthog';
import images from '@/constants/image';
import { useAppTheme, ThemeMode } from '@/context/ThemeContext';
import Constants from 'expo-constants';

const SafeAreaView = styled(RNSafeAreaView);

// Supported currencies for selector
const CURRENCIES = [
    { code: "USD", symbol: "$", label: "US Dollar ($)" },
    { code: "INR", symbol: "₹", label: "Indian Rupee (₹)" },
    { code: "EUR", symbol: "€", label: "Euro (€)" },
    { code: "GBP", symbol: "£", label: "British Pound (£)" }
];

const Settings = () => {
    const { signOut } = useClerk();
    const { user } = useUser();
    const { themeMode, isDark, colors, setThemeMode } = useAppTheme();

    // State settings
    const [hapticEnabled, setHapticEnabled] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [currency, setCurrency] = useState("USD");

    // Modal view visibility controls
    const [themeModalVisible, setThemeModalVisible] = useState(false);
    const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
    const [signOutConfirmVisible, setSignOutConfirmVisible] = useState(false);

    React.useEffect(() => {
        // Fetch persisted haptic/currency settings
        Promise.all([
            SecureStore.getItemAsync("pref-haptic").then(val => {
                if (val !== null) setHapticEnabled(val === "true");
            }),
            SecureStore.getItemAsync("pref-notifications").then(val => {
                if (val !== null) setNotificationsEnabled(val === "true");
            }),
            SecureStore.getItemAsync("pref-currency").then(val => {
                if (val !== null) setCurrency(val);
            })
        ]).catch(err => console.log("Failed reading settings preferences", err));
    }, []);

    const triggerHaptic = () => {
        if (hapticEnabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
    };

    const handleHapticToggle = async (val: boolean) => {
        setHapticEnabled(val);
        if (val) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        }
        await SecureStore.setItemAsync("pref-haptic", val ? "true" : "false");
    };

    const handleNotificationsToggle = async (val: boolean) => {
        triggerHaptic();
        setNotificationsEnabled(val);
        await SecureStore.setItemAsync("pref-notifications", val ? "true" : "false");
    };

    const handleThemeSelect = async (mode: ThemeMode) => {
        triggerHaptic();
        await setThemeMode(mode);
        setThemeModalVisible(false);
        posthog?.capture('theme_changed', { theme: mode });
    };

    const handleCurrencySelect = async (code: string) => {
        triggerHaptic();
        setCurrency(code);
        await SecureStore.setItemAsync("pref-currency", code);
        setCurrencyModalVisible(false);
        posthog?.capture('currency_changed', { currency: code });
    };

    const handleSignOut = async () => {
        triggerHaptic();
        try {
            posthog?.capture('sign_out_completed');
            posthog?.reset();
            setSignOutConfirmVisible(false);
            await signOut();
        } catch (error) {
            console.error('Sign-out failed:', error);
        }
    };

    const displayName = user?.firstName || user?.fullName || user?.emailAddresses[0]?.emailAddress || 'User';
    const email = user?.emailAddresses[0]?.emailAddress;
    const version = Constants.expoConfig?.version ?? '1.0.0';

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="p-5 pb-32">
                
                {/* Polish Header */}
                <View className="mb-6">
                    <Text className="text-3xl font-sans-bold text-primary">Settings</Text>
                    <Text className="text-sm font-sans-medium text-muted-foreground mt-0.5">Manage your preferences</Text>
                </View>

                {/* Profile Card */}
                <View className="auth-card mb-5 flex-row items-center gap-4">
                    <Image
                        source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
                        className="size-16 rounded-full border border-border"
                    />
                    <View className="flex-1">
                        <Text className="text-lg font-sans-bold text-primary" numberOfLines={1}>{displayName}</Text>
                        {email && (
                            <Text className="text-xs font-sans-medium text-muted-foreground mt-0.5" numberOfLines={1}>{email}</Text>
                        )}
                    </View>
                </View>

                {/* Appearance Settings Section */}
                <View className="mb-6">
                    <Text className="text-xs font-sans-bold uppercase tracking-[1px] text-muted-foreground mb-2">Appearance</Text>
                    <View className="auth-card p-0 overflow-hidden">
                        <Pressable 
                            android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
                            onPress={() => { triggerHaptic(); setThemeModalVisible(true); }}
                            className="flex-row justify-between items-center px-4 py-4 border-b border-border"
                        >
                            <Text className="text-sm font-sans-semibold text-primary">Theme</Text>
                            <View className="flex-row items-center gap-1">
                                <Text className="text-sm font-sans-medium text-muted-foreground capitalize">
                                    {themeMode}
                                </Text>
                                <Text className="text-muted-foreground text-xs"> ❯</Text>
                            </View>
                        </Pressable>
                    </View>
                </View>

                {/* Preferences Section */}
                <View className="mb-6">
                    <Text className="text-xs font-sans-bold uppercase tracking-[1px] text-muted-foreground mb-2">Preferences</Text>
                    <View className="auth-card p-0 overflow-hidden">
                        
                        {/* Currency Selector */}
                        <Pressable 
                            android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
                            onPress={() => { triggerHaptic(); setCurrencyModalVisible(true); }}
                            className="flex-row justify-between items-center px-4 py-4 border-b border-border"
                        >
                            <Text className="text-sm font-sans-semibold text-primary">Currency</Text>
                            <View className="flex-row items-center gap-1">
                                <Text className="text-sm font-sans-medium text-muted-foreground uppercase">
                                    {currency} ({CURRENCIES.find(c => c.code === currency)?.symbol})
                                </Text>
                                <Text className="text-muted-foreground text-xs"> ❯</Text>
                            </View>
                        </Pressable>

                        {/* Notifications Toggle */}
                        <View className="flex-row justify-between items-center px-4 py-3 border-b border-border">
                            <View className="flex-1 pr-4">
                                <Text className="text-sm font-sans-semibold text-primary">Reminders</Text>
                                <Text className="text-xs font-sans-medium text-muted-foreground mt-0.5">Receive reminders about upcoming renewals</Text>
                            </View>
                            <Switch 
                                trackColor={{ false: "#e4e4e7", true: "#f9a885" }}
                                thumbColor={notificationsEnabled ? "#ea7a53" : "#f4f4f5"}
                                ios_backgroundColor="#e4e4e7"
                                onValueChange={handleNotificationsToggle}
                                value={notificationsEnabled}
                            />
                        </View>

                        {/* Haptic Feedback Toggle */}
                        <View className="flex-row justify-between items-center px-4 py-3">
                            <View className="flex-1 pr-4">
                                <Text className="text-sm font-sans-semibold text-primary">Haptic Feedback</Text>
                                <Text className="text-xs font-sans-medium text-muted-foreground mt-0.5">Tactile vibrations for interactions</Text>
                            </View>
                            <Switch 
                                trackColor={{ false: "#e4e4e7", true: "#f9a885" }}
                                thumbColor={hapticEnabled ? "#ea7a53" : "#f4f4f5"}
                                ios_backgroundColor="#e4e4e7"
                                onValueChange={handleHapticToggle}
                                value={hapticEnabled}
                            />
                        </View>

                    </View>
                </View>

                {/* Account Section */}
                <View className="mb-6">
                    <Text className="text-xs font-sans-bold uppercase tracking-[1px] text-muted-foreground mb-2">Account</Text>
                    <View className="auth-card p-0 overflow-hidden">
                        <View className="flex-row justify-between items-center px-4 py-4 border-b border-border">
                            <Text className="text-sm font-sans-semibold text-primary">Account ID</Text>
                            <Text className="text-xs font-sans-medium text-muted-foreground" numberOfLines={1} ellipsizeMode="middle">
                                {user?.id ?? "N/A"}
                            </Text>
                        </View>
                        <View className="flex-row justify-between items-center px-4 py-4 border-b border-border">
                            <Text className="text-sm font-sans-semibold text-primary">Member Since</Text>
                            <Text className="text-xs font-sans-medium text-muted-foreground">
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </Text>
                        </View>
                        <Pressable 
                            android_ripple={{ color: 'rgba(239, 68, 68, 0.1)' }}
                            onPress={() => { triggerHaptic(); setSignOutConfirmVisible(true); }}
                            className="flex-row justify-between items-center px-4 py-4"
                        >
                            <Text className="text-sm font-sans-bold text-destructive">Sign Out</Text>
                            <Text className="text-destructive text-xs">❯</Text>
                        </Pressable>
                    </View>
                </View>

                {/* App Information Section */}
                <View className="mb-6">
                    <Text className="text-xs font-sans-bold uppercase tracking-[1px] text-muted-foreground mb-2">App</Text>
                    <View className="auth-card p-0 overflow-hidden">
                        <View className="flex-row justify-between items-center px-4 py-4 border-b border-border">
                            <Text className="text-sm font-sans-semibold text-primary">Version</Text>
                            <Text className="text-xs font-sans-medium text-muted-foreground">{version}</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>

            {/* Premium Theme Selector Modal Bottom Sheet */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={themeModalVisible}
                onRequestClose={() => setThemeModalVisible(false)}
            >
                <Pressable className="flex-1 bg-black/55" onPress={() => setThemeModalVisible(false)}>
                    <View className="mt-auto rounded-t-[32px] bg-card p-6 pb-10 border-t border-border">
                        <View className="w-12 h-1.5 bg-muted rounded-full self-center mb-6" />
                        <Text className="text-xl font-sans-bold text-primary mb-1">Choose Appearance</Text>
                        <Text className="text-xs font-sans-medium text-muted-foreground mb-6">Select how the interface should look</Text>
                        
                        <View className="gap-3">
                            <Pressable 
                                onPress={() => handleThemeSelect("light")}
                                className={`flex-row justify-between items-center p-4 rounded-2xl border ${themeMode === 'light' ? 'border-accent bg-accent/10' : 'border-border bg-background'}`}
                            >
                                <View>
                                    <Text className="text-sm font-sans-bold text-primary">☀️ Light</Text>
                                    <Text className="text-xs font-sans-medium text-muted-foreground mt-0.5">Bright and clean theme</Text>
                                </View>
                                {themeMode === 'light' && <Text className="text-accent text-lg">✓</Text>}
                            </Pressable>

                            <Pressable 
                                onPress={() => handleThemeSelect("dark")}
                                className={`flex-row justify-between items-center p-4 rounded-2xl border ${themeMode === 'dark' ? 'border-accent bg-accent/10' : 'border-border bg-background'}`}
                            >
                                <View>
                                    <Text className="text-sm font-sans-bold text-primary">🌙 Dark</Text>
                                    <Text className="text-xs font-sans-medium text-muted-foreground mt-0.5">Easier on the eyes in low light</Text>
                                </View>
                                {themeMode === 'dark' && <Text className="text-accent text-lg">✓</Text>}
                            </Pressable>

                            <Pressable 
                                onPress={() => handleThemeSelect("system")}
                                className={`flex-row justify-between items-center p-4 rounded-2xl border ${themeMode === 'system' ? 'border-accent bg-accent/10' : 'border-border bg-background'}`}
                            >
                                <View>
                                    <Text className="text-sm font-sans-bold text-primary">◐ System</Text>
                                    <Text className="text-xs font-sans-medium text-muted-foreground mt-0.5">Follow device system settings</Text>
                                </View>
                                {themeMode === 'system' && <Text className="text-accent text-lg">✓</Text>}
                            </Pressable>
                        </View>
                    </View>
                </Pressable>
            </Modal>

            {/* Currency Selector Modal Bottom Sheet */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={currencyModalVisible}
                onRequestClose={() => setCurrencyModalVisible(false)}
            >
                <Pressable className="flex-1 bg-black/55" onPress={() => setCurrencyModalVisible(false)}>
                    <View className="mt-auto rounded-t-[32px] bg-card p-6 pb-10 border-t border-border">
                        <View className="w-12 h-1.5 bg-muted rounded-full self-center mb-6" />
                        <Text className="text-xl font-sans-bold text-primary mb-1">Select Default Currency</Text>
                        <Text className="text-xs font-sans-medium text-muted-foreground mb-6">Choose currency for displaying pricing metrics</Text>
                        
                        <View className="gap-3">
                            {CURRENCIES.map(curr => (
                                <Pressable 
                                    key={curr.code}
                                    onPress={() => handleCurrencySelect(curr.code)}
                                    className={`flex-row justify-between items-center p-4 rounded-2xl border ${currency === curr.code ? 'border-accent bg-accent/10' : 'border-border bg-background'}`}
                                >
                                    <View>
                                        <Text className="text-sm font-sans-bold text-primary">{curr.label}</Text>
                                        <Text className="text-xs font-sans-medium text-muted-foreground mt-0.5">{curr.code} mode</Text>
                                    </View>
                                    {currency === curr.code && <Text className="text-accent text-lg">✓</Text>}
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </Pressable>
            </Modal>

            {/* Sign Out Confirmation Alert Bottom Sheet */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={signOutConfirmVisible}
                onRequestClose={() => setSignOutConfirmVisible(false)}
            >
                <Pressable className="flex-1 bg-black/60 justify-center items-center p-5" onPress={() => setSignOutConfirmVisible(false)}>
                    <Pressable className="w-full max-w-[340px] rounded-3xl bg-card p-6 border border-border" onPress={e => e.stopPropagation()}>
                        <Text className="text-lg font-sans-bold text-primary mb-2 text-center">Sign out?</Text>
                        <Text className="text-sm font-sans-medium text-muted-foreground mb-6 text-center leading-5">
                            You will need to sign in again to access your tracked subscriptions.
                        </Text>
                        
                        <View className="flex-row gap-3">
                            <Pressable 
                                onPress={() => { triggerHaptic(); setSignOutConfirmVisible(false); }}
                                className="flex-1 items-center justify-center rounded-2xl border border-border py-3.5 bg-background"
                            >
                                <Text className="text-sm font-sans-semibold text-muted-foreground">Cancel</Text>
                            </Pressable>
                            <Pressable 
                                onPress={handleSignOut}
                                className="flex-1 items-center justify-center rounded-2xl bg-destructive py-3.5"
                            >
                                <Text className="text-sm font-sans-bold text-white">Sign Out</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

        </SafeAreaView>
    );
};

export default Settings;