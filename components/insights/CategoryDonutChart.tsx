import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { formatCurrency } from "@/lib/utils";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CategoryDonutChartProps {
    breakdown: CategoryBreakdownItem[];
    total: number;
}

const SIZE = 180;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const CategoryDonutChart = ({ breakdown, total }: CategoryDonutChartProps) => {
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        progress.setValue(0);
        Animated.timing(progress, {
            toValue: 1,
            duration: 750,
            useNativeDriver: false,
        }).start();
    }, [breakdown, progress]);

    if (breakdown.length === 0 || total <= 0) {
        return null;
    }

    let cumulativePercent = 0;

    return (
        <View className="items-center">
            <View style={{ width: SIZE, height: SIZE }}>
                <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                    <G rotation="-90" origin={`${SIZE / 2}, ${SIZE / 2}`}>
                        <Circle
                            cx={SIZE / 2}
                            cy={SIZE / 2}
                            r={RADIUS}
                            stroke="rgba(0,0,0,0.06)"
                            strokeWidth={STROKE}
                            fill="none"
                        />
                        {breakdown.map((item) => {
                            const segmentLength = (item.percentage / 100) * CIRCUMFERENCE;
                            const offset = (cumulativePercent / 100) * CIRCUMFERENCE;
                            cumulativePercent += item.percentage;

                            const animatedDasharray = progress.interpolate({
                                inputRange: [0, 1],
                                outputRange: [`0, ${CIRCUMFERENCE}`, `${segmentLength}, ${CIRCUMFERENCE}`],
                            });

                            return (
                                <AnimatedCircle
                                    key={item.category}
                                    cx={SIZE / 2}
                                    cy={SIZE / 2}
                                    r={RADIUS}
                                    stroke={item.color}
                                    strokeWidth={STROKE}
                                    strokeDasharray={animatedDasharray}
                                    strokeDashoffset={-offset}
                                    strokeLinecap="butt"
                                    fill="none"
                                />
                            );
                        })}
                    </G>
                </Svg>

                <View
                    className="items-center justify-center"
                    style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                    pointerEvents="none"
                >
                    <Text className="text-xs font-sans-semibold text-muted-foreground">Total</Text>
                    <Text className="text-xl font-sans-extrabold text-primary" numberOfLines={1}>
                        {formatCurrency(total)}
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default CategoryDonutChart;
