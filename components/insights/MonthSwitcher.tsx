import { Pressable, Text, View } from "react-native";
import clsx from "clsx";

interface MonthSwitcherProps {
    label: string;
    onPrevious: () => void;
    onNext: () => void;
    nextDisabled: boolean;
}

const MonthSwitcher = ({ label, onPrevious, onNext, nextDisabled }: MonthSwitcherProps) => {
    return (
        <View className="month-switcher">
            <Pressable
                className="month-switcher-btn"
                onPress={onPrevious}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Previous month"
            >
                <Text className="month-switcher-arrow">‹</Text>
            </Pressable>

            <Text className="month-switcher-label">{label}</Text>

            <Pressable
                className={clsx("month-switcher-btn", nextDisabled && "month-switcher-btn-disabled")}
                onPress={onNext}
                disabled={nextDisabled}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Next month"
            >
                <Text className="month-switcher-arrow">›</Text>
            </Pressable>
        </View>
    );
};

export default MonthSwitcher;
