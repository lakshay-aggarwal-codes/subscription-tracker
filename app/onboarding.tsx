import { useEffect, useRef } from "react";
import {
    Image,
    Text,
    TouchableOpacity,
    View,
    Animated,
    StatusBar,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useRouter, type Href } from "expo-router";
import { useAuth } from "@clerk/expo";
import images from "@/constants/image";

const SafeAreaView = styled(RNSafeAreaView);

const Onboarding = () => {
    const router = useRouter();
    const { isSignedIn, isLoaded } = useAuth();

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;
    const patternScale = useRef(new Animated.Value(0.96)).current;

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            router.replace("/" as Href);
            return;
        }

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 650,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                damping: 18,
                stiffness: 120,
                useNativeDriver: true,
            }),
            Animated.spring(patternScale, {
                toValue: 1,
                damping: 14,
                stiffness: 90,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isLoaded, isSignedIn, fadeAnim, slideAnim, patternScale, router]);

    const handleGetStarted = () => {
        router.push("/(auth)/sign-in" as Href);
    };

    const handleCreateAccount = () => {
        router.push("/(auth)/sign-up" as Href);
    };

    return (
        <View className="flex-1 bg-accent">
            <StatusBar barStyle="light-content" backgroundColor="#ea7a53" />
            <SafeAreaView className="flex-1 justify-between" edges={["top", "bottom"]}>
                {/* Visual Pattern Artboard */}
                <View className="flex-1 items-center justify-center px-4 pt-2">
                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [{ scale: patternScale }],
                            width: "100%",
                            maxHeight: "85%",
                            aspectRatio: 1,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Image
                            source={images.splashPattern}
                            resizeMode="contain"
                            className="w-full h-full"
                            accessibilityLabel="Geometric artwork"
                        />
                    </Animated.View>
                </View>

                {/* Bottom Content Area */}
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }}
                    className="px-6 pb-8 pt-4"
                >
                    {/* Headline */}
                    <Text className="text-4xl font-sans-extrabold text-white text-center tracking-tight">
                        Gain Financial Clarity
                    </Text>

                    {/* Subtitle */}
                    <Text className="mt-2 text-base font-sans-medium text-white/85 text-center leading-6">
                        Track, analyze and cancel with ease
                    </Text>

                    {/* Get Started CTA Button */}
                    <TouchableOpacity
                        onPress={handleGetStarted}
                        activeOpacity={0.88}
                        className="mt-7 w-full items-center justify-center rounded-full bg-white py-4 px-6 shadow-sm"
                        accessibilityRole="button"
                        accessibilityLabel="Get Started"
                    >
                        <Text className="text-base font-sans-bold text-primary">
                            Get Started
                        </Text>
                    </TouchableOpacity>

                    {/* Secondary Navigation Row */}
                    <View className="mt-4 flex-row items-center justify-center gap-1.5">
                        <Text className="text-sm font-sans-medium text-white/80">
                            New to Recurrly?
                        </Text>
                        <TouchableOpacity
                            onPress={handleCreateAccount}
                            hitSlop={8}
                            accessibilityRole="button"
                            accessibilityLabel="Create an account"
                        >
                            <Text className="text-sm font-sans-bold text-white underline">
                                Create Account
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
};

export default Onboarding;