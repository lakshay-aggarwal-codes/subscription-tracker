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
import { useSignUp, useAuth } from "@clerk/expo";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import AuthTextField from "@/components/auth/AuthTextField";
import AuthButton from "@/components/auth/AuthButton";
import {
    validateEmail,
    validatePassword,
    validateVerificationCode,
    getClerkErrorMessage,
} from "@/lib/auth/validation";
import { posthog } from "@/lib/posthog";

const SafeAreaView = styled(RNSafeAreaView);

const SignUp = () => {
    const { signUp, fetchStatus } = useSignUp();
    const { isSignedIn } = useAuth();
    const router = useRouter();

    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [showVerification, setShowVerification] = useState(false);

    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [codeError, setCodeError] = useState<string | null>(null);
    const [generalError, setGeneralError] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const codeInputRef = useRef<TextInput>(null);

    // If already signed in, redirect to tabs cleanly via useEffect
    useEffect(() => {
        if (isSignedIn) {
            router.replace("/" as Href);
        }
    }, [isSignedIn, router]);

    if (isSignedIn) {
        return null;
    }

    const handleSignUp = async () => {
        setGeneralError(null);
        setEmailError(null);
        setPasswordError(null);

        // Pre-validation
        const emailValidation = validateEmail(emailAddress);
        if (emailValidation) {
            setEmailError(emailValidation);
            return;
        }

        const passwordValidation = validatePassword(password);
        if (passwordValidation) {
            setPasswordError(passwordValidation);
            return;
        }

        if (!signUp || fetchStatus === 'fetching') return;

        setIsLoading(true);

        try {
            const result = await signUp.password({
                emailAddress: emailAddress.trim(),
                password,
            });

            if (result?.error) {
                setGeneralError(getClerkErrorMessage(result.error));
                setIsLoading(false);
                return;
            }

            await signUp.verifications.sendEmailCode();
            setShowVerification(true);
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

        if (!signUp || fetchStatus === 'fetching') return;

        setIsLoading(true);

        try {
            const result = await signUp.verifications.verifyEmailCode({
                code: code.trim(),
            });

            if (result?.error) {
                setGeneralError(getClerkErrorMessage(result.error));
                setIsLoading(false);
                return;
            }

            if (signUp.status === "complete") {
                posthog?.capture("sign_up_completed", {
                    verification_method: "email_code",
                });

                await signUp.finalize();
                router.replace("/" as Href);
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
        if (!signUp) return;
        try {
            await signUp.verifications.sendEmailCode();
        } catch (err) {
            setGeneralError(getClerkErrorMessage(err));
        }
    };

    const handleBack = () => {
        setShowVerification(false);
        setCode("");
        setCodeError(null);
        setGeneralError(null);
    };

    // Verification View
    if (showVerification) {
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
                            <Text className="auth-title">Verify your email</Text>
                            <Text className="auth-subtitle">
                                We sent a verification code to {emailAddress}
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
                                    label="Verify Email"
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
                                    onPress={handleBack}
                                    className="py-2 items-center"
                                    hitSlop={8}
                                >
                                    <Text className="text-xs font-sans-semibold text-muted-foreground">
                                        ← Back to Sign Up
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    // Sign Up Form
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
                        <Text className="auth-title">Create your account</Text>
                        <Text className="auth-subtitle">
                            Start tracking your subscriptions and never miss a payment
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
                                    placeholder="Create a strong password"
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (passwordError) setPasswordError(null);
                                        if (generalError) setGeneralError(null);
                                    }}
                                    error={passwordError}
                                    isPassword
                                    autoComplete="password-new"
                                    textContentType="newPassword"
                                    editable={!isLoading}
                                    returnKeyType="done"
                                    onSubmitEditing={handleSignUp}
                                />
                                {!passwordError && (
                                    <Text className="text-xs font-sans-medium text-muted-foreground mt-1.5">
                                        Minimum 8 characters required
                                    </Text>
                                )}
                            </View>

                            {generalError ? (
                                <View className="rounded-xl bg-destructive/10 p-3 border border-destructive/20">
                                    <Text className="text-xs font-sans-medium text-destructive text-center">
                                        {generalError}
                                    </Text>
                                </View>
                            ) : null}

                            <AuthButton
                                label="Create Account"
                                onPress={handleSignUp}
                                loading={isLoading}
                                disabled={!emailAddress.trim() || !password.trim()}
                            />
                        </View>
                    </View>

                    <View className="auth-link-row">
                        <Text className="auth-link-copy">Already have an account?</Text>
                        <Link href="/(auth)/sign-in" asChild>
                            <Pressable hitSlop={8}>
                                <Text className="auth-link">Sign In</Text>
                            </Pressable>
                        </Link>
                    </View>

                    <View nativeID="clerk-captcha" />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SignUp;