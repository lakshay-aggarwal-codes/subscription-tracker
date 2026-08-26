import {SplashScreen, Stack } from "expo-router";
import '@/global.css';
import {useFonts} from "expo-font";
import {useEffect, useRef} from "react";
import {ClerkProvider, useAuth, useUser} from '@clerk/expo';
import {tokenCache} from '@clerk/expo/token-cache';
import {PostHogProvider} from 'posthog-react-native';
import {posthog} from '@/lib/posthog';

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
    throw new Error('Add your Clerk Publishable Key to the .env file');
}

function RootLayoutContent() {
    const {isLoaded: authLoaded} = useAuth();
    const {user} = useUser();
    const identifiedUserId = useRef<string | null>(null);

    const [fontsLoaded] = useFonts({
        'sans-regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
        'sans-bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
        'sans-medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
        'sans-semibold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
        'sans-extrabold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
        'sans-light': require('../assets/fonts/PlusJakartaSans-Light.ttf')
    })

    useEffect(() => {
        if (fontsLoaded && authLoaded) {
            SplashScreen.hideAsync()
        }
    }, [fontsLoaded, authLoaded])

    useEffect(() => {
        if (!posthog) return;

        if (!user) {
            identifiedUserId.current = null;
            return;
        }

        if (identifiedUserId.current === user.id) return;

        posthog.identify(user.id, {
            $set: {
                ...(user.primaryEmailAddress?.emailAddress && {
                    email: user.primaryEmailAddress.emailAddress,
                }),
                ...(user.fullName && {name: user.fullName}),
            },
        });
        identifiedUserId.current = user.id;
    }, [user]);

    if (!fontsLoaded || !authLoaded) return null;

    const content = <Stack screenOptions={{headerShown: false}} />;

    return posthog ? (
        <PostHogProvider client={posthog}>{content}</PostHogProvider>
    ) : content;
}

export default function RootLayout() {
    return (
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
            <RootLayoutContent />
        </ClerkProvider>
    );
}