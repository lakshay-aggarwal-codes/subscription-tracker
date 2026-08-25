import { forwardRef, useState } from "react";
import { Pressable, Text, TextInput, TextInputProps, View } from "react-native";
import clsx from "clsx";
import { colors } from "@/constants/theme";

type AuthTextFieldProps = Omit<TextInputProps, "className" | "style"> & {
    label: string;
    error?: string | null;
    isPassword?: boolean;
};

const AuthTextField = forwardRef<TextInput, AuthTextFieldProps>(
    ({ label, error, isPassword = false, secureTextEntry, ...inputProps }, ref) => {
        const [isVisible, setIsVisible] = useState(false);

        const hidesText = isPassword ? !isVisible : secureTextEntry;

        return (
            <View className="auth-field">
                <Text className="auth-label">{label}</Text>

                <View className="relative justify-center">
                    <TextInput
                        ref={ref}
                        className={clsx("auth-input", isPassword && "pr-14", error && "auth-input-error")}
                        placeholderTextColor={colors.mutedForeground}
                        secureTextEntry={hidesText}
                        autoCorrect={false}
                        accessibilityLabel={label}
                        accessibilityState={{ disabled: inputProps.editable === false }}
                        {...inputProps}
                    />

                    {isPassword ? (
                        <Pressable
                            onPress={() => setIsVisible((prev) => !prev)}
                            hitSlop={10}
                            className="absolute right-4 h-6 items-center justify-center"
                            accessibilityRole="button"
                            accessibilityLabel={isVisible ? "Hide password" : "Show password"}
                        >
                            <Text className="text-xs font-sans-semibold text-accent">
                                {isVisible ? "Hide" : "Show"}
                            </Text>
                        </Pressable>
                    ) : null}
                </View>

                {error ? (
                    <Text className="auth-error" accessibilityLiveRegion="polite">
                        {error}
                    </Text>
                ) : null}
            </View>
        );
    }
);

AuthTextField.displayName = "AuthTextField";

export default AuthTextField;