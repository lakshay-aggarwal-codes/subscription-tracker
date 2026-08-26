import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import clsx from "clsx";
import { colors } from "@/constants/theme";
import { formatCurrency } from "@/lib/utils";

const CHART_HEIGHT = 110;

interface TrendBarProps {
    point: TrendPoint;
    maxTotal: number;
}

const TrendBar = ({ point, maxTotal }: TrendBarProps) => {
    const height = useRef(new Animated.Value(0)).current;
    const targetHeight = maxTotal > 0 ? Math.max((point.total / maxTotal) * CHART_HEIGHT, point.total > 0 ? 6 : 2) : 2;

    useEffect(() => {
        height.setValue(0);
        Animated.timing(height, {
            toValue: targetHeight,
            duration: 600,
            delay: 80,
            useNativeDriver: false,
        }).start();
    }, [targetHeight, height]);

    return (
        <View className="flex-1 items-center">
            <View style={{ height: CHART_HEIGHT, justifyContent: "flex-end" }}>
                <Animated.View
                    style={{
                        width: 14,
                        height,
                        borderRadius: 7,
                        backgroundColor: point.isCurrent ? colors.accent : colors.primary,
                    }}
                />
            </View>
            <Text
                className={clsx("trend-bar-label", point.isCurrent && "trend-bar-label-current")}
                numberOfLines={1}
            >
                {point.monthLabel}
            </Text>
        </View>
    );
};

interface TrendChartProps {
    trend: TrendPoint[];
}

const TrendChart = ({ trend }: TrendChartProps) => {
    const maxTotal = Math.max(...trend.map((p) => p.total), 0);
    const current = trend.find((p) => p.isCurrent);

    return (
        <View>
            <View className="flex-row items-end gap-2">
                {trend.map((point) => (
                    <TrendBar key={point.monthKey} point={point} maxTotal={maxTotal} />
                ))}
            </View>
            {current && (
                <Text className="insights-footnote">
                    {current.monthLabel}: {formatCurrency(current.total)}
                </Text>
            )}
        </View>
    );
};

export default TrendChart;
