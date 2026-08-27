import { useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { type Href, useRouter } from "expo-router";
import { useSignIn } from "@clerk/expo";
import AuthTextField from "@/components/auth/AuthTextField";
import AuthButton from "@/components/auth/AuthButton";
import {
    getClerkErrorMessage,
    validateEmail,
    validatePassword,
    validateVerificationCode,
} from "@/lib/auth/validation";
import { posthog } from "@/lib/posthog";

type Step = "email" | "code" | "password";

const STEP_COPY: Record<Step, { title: string; subtitle: string }> = {
    email: {
        title: "Forgot password?",
        subtitle: "Enter your email and we'll send you a reset code",
    },
    code: {
        title: "Enter your code",
        subtitle: "We sent a 6-digit code to your email",
    },
    password: {
        title: "Set a new password",
        subtitle: "Choose a new password for your account",
    },
};

const ForgotPassword = () => {
    const { signIn } = useSignIn();
    const router = useRouter();

    const [step, setStep] = useState<Step>("email");
    const [emailAddress, setEmailAddress] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");

    const [fieldError, setFieldError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const codeRef = useRef<TextInput>(null);

    const handleSendCode = async () => {
        setFormError(null);
        const error = validateEmail(emailAddress);
        setFieldError(error);
        if (error) return;

        setIsSubmitting(true);
        try {
            const { error: createError } = await signIn.create({
                identifier: emailAddress.trim(),
            });
            if (createError) {
                setFormError(getClerkErrorMessage(createError, "We couldn't find that account."));
                return;
            }

            const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
            if (sendError) {
                setFormError(getClerkErrorMessage(sendError, "Couldn't send a reset code."));
                return;
            }

            setStep("code");
        } catch (err) {
            setFormError(getClerkErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyCode = async () => {
        setFormError(null);
        const error = validateVerificationCode(code);
        setFieldError(error);
        if (error) return;

        setIsSubmitting(true);
        try {
            const { error: verifyError } = await signIn.resetPasswordEmailCode.verifyCode({ code });
            if (verifyError) {
                setFormError(getClerkErrorMessage(verifyError, "That code isn't right."));
                return;
            }

            setStep("password");
        } catch (err) {
            setFormError(getClerkErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSetNewPassword = async () => {
        setFormError(null);
        const error = validatePassword(password);
        setFieldError(error);
        if (error) return;

        setIsSubmitting(true);
        try {
            const { error: submitError } = await signIn.resetPasswordEmailCode.submitPassword({
                password,
                signOutOfOtherSessions: true,
            });
            if (submitError) {
                setFormError(getClerkErrorMessage(submitError, "Couldn't set your new password."));
                return;
            }

            if (signIn.status === "complete") {
                posthog?.capture("password_reset_completed");
                await signIn.finalize({
                    navigate: () => {
                        router.replace("/" as Href);
                    },
                });
            } else {
                setFormError("Additional verification is required for this account.");
            }
        } catch (err) {
            setFormError(getClerkErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const copy = STEP_COPY[step];

    return (
        <SafeAreaView className="auth-safe-area" edges={["top", "bottom"]}>
            <KeyboardAvoidingView
                className="auth-screen"
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    className="auth-scroll"
                    contentContainerClassName="auth-content"
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="auth-brand-block">
                        <Text className="auth-title">{copy.title}</Text>
                        <Text className="auth-subtitle">{copy.subtitle}</Text>
                    </View>

                    <View className="auth-card">
                        <View className="auth-form">
                            {step === "email" ? (
                                <AuthTextField
                                    label="Email"
                                    placeholder="Enter your email"
                                    value={emailAddress}
                                    onChangeText={(text) => {
                                        setEmailAddress(text);
                                        if (fieldError) setFieldError(null);
                                    }}
                                    error={fieldError}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    textContentType="emailAddress"
                                    returnKeyType="done"
                                    onSubmitEditing={handleSendCode}
                                    editable={!isSubmitting}
                                />
                            ) : null}

                            {step === "code" ? (
                                <AuthTextField
                                    ref={codeRef}
                                    label="Verification code"
                                    placeholder="123456"
                                    value={code}
                                    onChangeText={(text) => {
                                        setCode(text.replace(/[^0-9]/g, "").slice(0, 6));
                                        if (fieldError) setFieldError(null);
                                    }}
                                    error={fieldError}
                                    keyboardType="number-pad"
                                    autoComplete="one-time-code"
                                    textContentType="oneTimeCode"
                                    maxLength={6}
                                    returnKeyType="done"
                                    onSubmitEditing={handleVerifyCode}
                                    editable={!isSubmitting}
                                />
                            ) : null}

                            {step === "password" ? (
                                <AuthTextField
                                    label="New password"
                                    placeholder="Enter a new password"
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (fieldError) setFieldError(null);
                                    }}
                                    error={fieldError}
                                    isPassword
                                    autoComplete="new-password"
                                    textContentType="newPassword"
                                    returnKeyType="done"
                                    onSubmitEditing={handleSetNewPassword}
                                    editable={!isSubmitting}
                                />
                            ) : null}

                            {formError ? <Text className="auth-error">{formError}</Text> : null}

                            {step === "email" ? (
                                <AuthButton
                                    label="Send reset code"
                                    onPress={handleSendCode}
                                    loading={isSubmitting}
                                    disabled={!emailAddress}
                                />
                            ) : null}

                            {step === "code" ? (
                                <AuthButton
                                    label="Verify code"
                                    onPress={handleVerifyCode}
                                    loading={isSubmitting}
                                    disabled={code.length !== 6}
                                />
                            ) : null}

                            {step === "password" ? (
                                <AuthButton
                                    label="Set new password"
                                    onPress={handleSetNewPassword}
                                    loading={isSubmitting}
                                    disabled={!password}
                                />
                            ) : null}
                        </View>
                    </View>

                    <Pressable
                        onPress={() => router.replace("/(auth)/sign-in" as Href)}
                        disabled={isSubmitting}
                        className="mt-5"
                    >
                        <Text className="auth-link text-center">Back to sign in</Text>
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ForgotPassword;