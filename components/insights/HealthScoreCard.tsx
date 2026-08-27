import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { colors } from "@/constants/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 96;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const scoreColor = (score: number) => {
    if (score >= 80) return colors.success;
    if (score >= 55) return colors.accent;
    return colors.destructive;
};

interface HealthScoreCardProps {
    health: FinancialHealthResult;
}

const impactColor = (impact: "positive" | "negative" | "neutral") => {
    if (impact === "positive") return colors.success;
    if (impact === "negative") return colors.destructive;
    return colors.mutedForeground;
};

const HealthScoreCard = ({ health }: HealthScoreCardProps) => {
    const progress = useRef(new Animated.Value(0)).current;
    const ringColor = scoreColor(health.score);

    useEffect(() => {
        progress.setValue(0);
        Animated.timing(progress, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
        }).start();
    }, [health.score, progress]);

    const animatedDasharray = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [`0, ${CIRCUMFERENCE}`, `${(health.score / 100) * CIRCUMFERENCE}, ${CIRCUMFERENCE}`],
    });

    return (
        <View className="insight-card gap-1">
            <View className="flex-row items-center gap-5">
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
                            <AnimatedCircle
                                cx={SIZE / 2}
                                cy={SIZE / 2}
                                r={RADIUS}
                                stroke={ringColor}
                                strokeWidth={STROKE}
                                strokeDasharray={animatedDasharray}
                                strokeLinecap="round"
                                fill="none"
                            />
                        </G>
                    </Svg>
                    <View
                        className="items-center justify-center"
                        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                        pointerEvents="none"
                    >
                        <Text className="health-score-value">{health.score}</Text>
                    </View>
                </View>

                <View className="flex-1 gap-2">
                    <Text className="health-score-label">Financial Health</Text>
                    <View className="health-score-tag" style={{ backgroundColor: `${ringColor}22` }}>
                        <Text className="health-score-tag-text" style={{ color: ringColor }}>
                            {health.label}
                        </Text>
                    </View>
                </View>
            </View>

            <View className="mt-2">
                {health.factors.map((factor) => (
                    <View className="health-factor-row" key={factor.label}>
                        <View className="health-factor-dot" style={{ backgroundColor: impactColor(factor.impact) }} />
                        <View className="flex-1">
                            <Text className="health-factor-label">{factor.label}</Text>
                            <Text className="health-factor-detail">{factor.detail}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default HealthScoreCard;
