import { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
} from "react-native";
import { Link, useRouter, type Href } from "expo-router";
import { useSignIn, useAuth } from "@clerk/expo";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import AuthTextField from "@/components/auth/AuthTextField";
import AuthButton from "@/components/auth/AuthButton";
import {
    validateEmail,
    validateVerificationCode,
    getClerkErrorMessage,
} from "@/lib/auth/validation";
import { posthog } from "@/lib/posthog";

const SafeAreaView = styled(RNSafeAreaView);

const SignIn = () => {
    const { signIn, fetchStatus } = useSignIn();
    const { isSignedIn } = useAuth();
    const router = useRouter();

    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");

    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [codeError, setCodeError] = useState<string | null>(null);
    const [generalError, setGeneralError] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const codeInputRef = useRef<TextInput>(null);

    // If already signed in, navigate to tabs cleanly via useEffect (side-effect)
    useEffect(() => {
        if (isSignedIn) {
            router.replace("/" as Href);
        }
    }, [isSignedIn, router]);

    if (isSignedIn) {
        return null;
    }

    const handleSignIn = async () => {
        setGeneralError(null);
        setEmailError(null);
        setPasswordError(null);

        // Pre-validate inputs
        const emailValidation = validateEmail(emailAddress);
        if (emailValidation) {
            setEmailError(emailValidation);
            return;
        }

        if (!password.trim()) {
            setPasswordError("Password is required");
            return;
        }

        if (!signIn || fetchStatus === 'fetching') return;

        setIsLoading(true);

        try {
            const result = await signIn.password({
                emailAddress: emailAddress.trim(),
                password,
            });

            if (result?.error) {
                setGeneralError(getClerkErrorMessage(result.error));
                setIsLoading(false);
                return;
            }

            if (signIn.status === "complete") {
                posthog?.capture("sign_in_completed", {
                    authentication_method: "password",
                });

                await signIn.finalize({
                    navigate: () => {
                        router.replace("/" as Href);
                    },
                });
                return;
            }

            if (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust") {
                const emailFactor = signIn.supportedSecondFactors?.find(
                    (f) => f.strategy === "email_code"
                );
                if (emailFactor) {
                    await signIn.mfa.sendEmailCode();
                }
            } else {
                setGeneralError("Additional verification required. Please check your account.");
            }
        } catch (err) {
            setGeneralError(getClerkErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        setCodeError(null);
        setGeneralError(null);

        const codeValidation = validateVerificationCode(code);
        if (codeValidation) {
            setCodeError(codeValidation);
            return;
        }

        if (!signIn || fetchStatus === 'fetching') return;

        setIsLoading(true);

        try {
            const result = await signIn.mfa.verifyEmailCode({ code: code.trim() });

            if (result?.error) {
                setGeneralError(getClerkErrorMessage(result.error));
                setIsLoading(false);
                return;
            }

            if (signIn.status === "complete") {
                posthog?.capture("sign_in_completed", {
                    authentication_method: "email_mfa",
                });

                await signIn.finalize({
                    navigate: () => {
                        router.replace("/" as Href);
                    },
                });
                return;
            }

            setGeneralError("Verification was not completed. Please try again.");
        } catch (err) {
            setGeneralError(getClerkErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!signIn) return;
        try {
            await signIn.mfa.sendEmailCode();
        } catch (err) {
            setGeneralError(getClerkErrorMessage(err));
        }
    };

    // MFA / Verification Screen
    if (signIn?.status === "needs_client_trust" || signIn?.status === "needs_second_factor") {
        return (
            <SafeAreaView className="auth-safe-area" edges={["top", "bottom"]}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    className="auth-screen"
                >
                    <ScrollView
                        className="auth-scroll"
                        contentContainerClassName="auth-content"
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="auth-brand-block">
                            <View className="auth-logo-wrap">
                                <View className="auth-logo-mark">
                                    <Text className="auth-logo-mark-text">R</Text>
                                </View>
                                <View>
                                    <Text className="auth-wordmark">Recurrly</Text>
                                    <Text className="auth-wordmark-sub">SUBSCRIPTIONS</Text>
                                </View>
                            </View>
                            <Text className="auth-title">Verify your identity</Text>
                            <Text className="auth-subtitle">
                                We sent a 6-digit verification code to your email
                            </Text>
                        </View>

                        <View className="auth-card">
                            <View className="auth-form">
                                <AuthTextField
                                    ref={codeInputRef}
                                    label="Verification Code"
                                    placeholder="Enter 6-digit code"
                                    value={code}
                                    onChangeText={(text) => {
                                        setCode(text.replace(/[^0-9]/g, "").slice(0, 6));
                                        if (codeError) setCodeError(null);
                                        if (generalError) setGeneralError(null);
                                    }}
                                    error={codeError}
                                    keyboardType="number-pad"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    editable={!isLoading}
                                    onSubmitEditing={handleVerifyCode}
                                    returnKeyType="done"
                                />

                                {generalError ? (
                                    <View className="rounded-xl bg-destructive/10 p-3 border border-destructive/20">
                                        <Text className="text-xs font-sans-medium text-destructive text-center">
                                            {generalError}
                                        </Text>
                                    </View>
                                ) : null}

                                <AuthButton
                                    label="Verify"
                                    onPress={handleVerifyCode}
                                    loading={isLoading}
                                    disabled={code.length !== 6}
                                />

                                <AuthButton
                                    label="Resend Code"
                                    variant="secondary"
                                    onPress={handleResendCode}
                                    disabled={isLoading}
                                />

                                <TouchableOpacity
                                    onPress={() => signIn?.reset?.()}
                                    className="py-2 items-center"
                                    hitSlop={8}
                                >
                                    <Text className="text-xs font-sans-semibold text-muted-foreground">
                                        Start Over
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    // Standard Sign In Form
    return (
        <SafeAreaView className="auth-safe-area" edges={["top", "bottom"]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                className="auth-screen"
            >
                <ScrollView
                    className="auth-scroll"
                    contentContainerClassName="auth-content"
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="auth-brand-block">
                        <View className="auth-logo-wrap">
                            <View className="auth-logo-mark">
                                <Text className="auth-logo-mark-text">R</Text>
                            </View>
                            <View>
                                <Text className="auth-wordmark">Recurrly</Text>
                                <Text className="auth-wordmark-sub">SUBSCRIPTIONS</Text>
                            </View>
                        </View>
                        <Text className="auth-title">Welcome back</Text>
                        <Text className="auth-subtitle">
                            Sign in to continue managing your subscriptions
                        </Text>
                    </View>

                    <View className="auth-card">
                        <View className="auth-form">
                            <AuthTextField
                                label="Email Address"
                                placeholder="name@example.com"
                                value={emailAddress}
                                onChangeText={(text) => {
                                    setEmailAddress(text);
                                    if (emailError) setEmailError(null);
                                    if (generalError) setGeneralError(null);
                                }}
                                error={emailError}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                textContentType="emailAddress"
                                editable={!isLoading}
                                returnKeyType="next"
                            />

                            <View>
                                <AuthTextField
                                    label="Password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (passwordError) setPasswordError(null);
                                        if (generalError) setGeneralError(null);
                                    }}
                                    error={passwordError}
                                    isPassword
                                    autoComplete="password"
                                    textContentType="password"
                                    editable={!isLoading}
                                    returnKeyType="done"
                                    onSubmitEditing={handleSignIn}
                                />
                                <View className="items-end mt-1.5">
                                    <Link href="/(auth)/forgot-password" asChild>
                                        <TouchableOpacity hitSlop={8}>
                                            <Text className="text-xs font-sans-semibold text-accent">
                                                Forgot Password?
                                            </Text>
                                        </TouchableOpacity>
                                    </Link>
                                </View>
                            </View>

                            {generalError ? (
                                <View className="rounded-xl bg-destructive/10 p-3 border border-destructive/20">
                                    <Text className="text-xs font-sans-medium text-destructive text-center">
                                        {generalError}
                                    </Text>
                                </View>
                            ) : null}

                            <AuthButton
                                label="Sign In"
                                onPress={handleSignIn}
                                loading={isLoading}
                                disabled={!emailAddress.trim() || !password.trim()}
                            />
                        </View>
                    </View>

                    <View className="auth-link-row">
                        <Text className="auth-link-copy">Don&apos;t have an account?</Text>
                        <Link href="/(auth)/sign-up" asChild>
                            <Pressable hitSlop={8}>
                                <Text className="auth-link">Create Account</Text>
                            </Pressable>
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SignIn;