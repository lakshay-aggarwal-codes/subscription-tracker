import { ActivityIndicator, Pressable, PressableProps, Text } from "react-native";
import clsx from "clsx";
import { colors } from "@/constants/theme";

type AuthButtonProps = Omit<PressableProps, "className" | "style" | "disabled"> & {
    label: string;
    loading?: boolean;
    disabled?: boolean;
    variant?: "primary" | "secondary";
};

const AuthButton = ({
                        label,
                        loading = false,
                        disabled = false,
                        variant = "primary",
                        ...pressableProps
                    }: AuthButtonProps) => {
    const isInactive = disabled || loading;
    const isPrimary = variant === "primary";

    return (
        <Pressable
            className={clsx(
                isPrimary ? "auth-button" : "auth-secondary-button",
                isPrimary && isInactive && "auth-button-disabled"
            )}
            style={({ pressed }) => [{ opacity: pressed && !isInactive ? 0.85 : 1 }]}
            disabled={isInactive}
            accessibilityRole="button"
            accessibilityState={{ disabled: isInactive, busy: loading }}
            {...pressableProps}
        >
            {loading ? (
                <ActivityIndicator color={isPrimary ? colors.primary : colors.accent} />
            ) : (
                <Text className={isPrimary ? "auth-button-text" : "auth-secondary-button-text"}>
                    {label}
                </Text>
            )}
        </Pressable>
    );
};

export default AuthButton;