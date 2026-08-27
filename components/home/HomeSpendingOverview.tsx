import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { formatCurrency } from '@/lib/utils';

interface HomeSpendingOverviewProps {
    breakdown: CategoryBreakdownItem[];
    total: number;
    onViewInsights: () => void;
}

const HomeSpendingOverview = ({
    breakdown,
    total,
    onViewInsights,
}: HomeSpendingOverviewProps) => {
    if (breakdown.length === 0 || total <= 0) {
        return null;
    }

    // Display top 3 categories on the home dashboard for a compact overview
    const topCategories = breakdown.slice(0, 3);

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onViewInsights}
            className="insight-card my-2"
            accessibilityRole="button"
            accessibilityLabel="Spending overview by category, tap to view all insights"
        >
            <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-sans-bold text-primary">
                    Spending by Category
                </Text>
                <Text className="text-xs font-sans-semibold text-accent">
                    Details →
                </Text>
            </View>

            {/* Segmented Progress Bar */}
            <View className="h-3.5 w-full flex-row overflow-hidden rounded-full bg-muted mb-4">
                {breakdown.map((item) => (
                    <View
                        key={item.category}
                        style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.color,
                        }}
                    />
                ))}
            </View>

            {/* Top Categories rows */}
            <View className="gap-2.5">
                {topCategories.map((item) => (
                    <View key={item.category} className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2 flex-1 min-w-0 pr-2">
                            <View
                                className="size-3 rounded-full shrink-0"
                                style={{ backgroundColor: item.color }}
                            />
                            <Text
                                className="text-sm font-sans-semibold text-primary"
                                numberOfLines={1}
                            >
                                {item.category}
                            </Text>
                            <Text className="text-xs font-sans-medium text-muted-foreground shrink-0">
                                ({item.percentage}%)
                            </Text>
                        </View>
                        <Text className="text-sm font-sans-bold text-primary shrink-0">
                            {formatCurrency(item.total)}
                        </Text>
                    </View>
                ))}
            </View>
        </TouchableOpacity>
    );
};

export default HomeSpendingOverview;
