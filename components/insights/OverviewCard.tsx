import { Text, View } from "react-native";
import { formatCurrency } from "@/lib/utils";
import { useCountUp } from "@/lib/insights/useCountUp";

interface OverviewCardProps {
    overview: MonthlyOverview;
}

const OverviewCard = ({ overview }: OverviewCardProps) => {
    const animatedTotal = useCountUp(overview.totalSpending);
    const isIncrease = (overview.percentChange ?? 0) > 0;
    const isDecrease = (overview.percentChange ?? 0) < 0;

    return (
        <View className="overview-card">
            <Text className="overview-label">Spending · {overview.monthLabel}</Text>

            <View className="overview-change-row">
                <Text className="overview-amount">{formatCurrency(animatedTotal)}</Text>
            </View>

            {overview.percentChange !== null ? (
                <View className="overview-change-row">
                    <View className="overview-change-pill">
                        <Text className="overview-change-text">
                            {isIncrease ? "▲" : isDecrease ? "▼" : "•"} {Math.abs(overview.percentChange)}%
                        </Text>
                    </View>
                    <Text className="overview-change-caption">vs. {formatCurrency(overview.previousMonthSpending)} last month</Text>
                </View>
            ) : (
                <View className="overview-change-row">
                    <Text className="overview-change-caption">No prior month to compare yet</Text>
                </View>
            )}

            <View className="overview-stats-row">
                <View className="overview-stat">
                    <Text className="overview-stat-label">Avg / day</Text>
                    <Text className="overview-stat-value">{formatCurrency(overview.averageDailySpending)}</Text>
                </View>
                <View className="overview-stat">
                    <Text className="overview-stat-label">Charges</Text>
                    <Text className="overview-stat-value">{overview.eventCount}</Text>
                </View>
                <View className="overview-stat">
                    <Text className="overview-stat-label">Top category</Text>
                    <Text className="overview-stat-value" numberOfLines={1}>
                        {overview.largestCategory?.category ?? "—"}
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default OverviewCard;
