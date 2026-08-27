import { Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { useCountUp } from '@/lib/insights/useCountUp';

interface HomeHeroCardProps {
    totalSpending: number;
    percentChange: number | null;
    previousMonthSpending: number;
    activeCount: number;
    upcomingCount: number;
    onViewInsights: () => void;
}

const HomeHeroCard = ({
    totalSpending,
    percentChange,
    previousMonthSpending,
    activeCount,
    upcomingCount,
    onViewInsights,
}: HomeHeroCardProps) => {
    const animatedTotal = useCountUp(totalSpending, 600);
    const isIncrease = (percentChange ?? 0) > 0;
    const isDecrease = (percentChange ?? 0) < 0;

    return (
        <TouchableOpacity
            activeOpacity={0.92}
            onPress={onViewInsights}
            className="home-balance-card !min-h-0"
            accessibilityRole="button"
            accessibilityLabel="Financial Overview Card, tap to view insights"
        >
            {/* Top row: Label + Month tag */}
            <View className="flex-row items-center justify-between">
                <Text className="home-balance-label">Spent This Month</Text>
                <View className="rounded-full bg-white/20 px-3 py-1">
                    <Text className="text-xs font-sans-bold uppercase tracking-[0.5px] text-white">
                        Overview
                    </Text>
                </View>
            </View>

            {/* Middle: Prominent Amount */}
            <View className="my-1">
                <Text className="home-balance-amount" numberOfLines={1}>
                    {formatCurrency(animatedTotal)}
                </Text>
            </View>

            {/* Change badge vs last month */}
            <View className="flex-row items-center gap-2 flex-wrap">
                {percentChange !== null ? (
                    <>
                        <View className="rounded-full bg-white/20 px-2.5 py-0.5 flex-row items-center">
                            <Text className="text-xs font-sans-bold text-white">
                                {isIncrease ? '▲' : isDecrease ? '▼' : '•'} {Math.abs(percentChange)}%
                            </Text>
                        </View>
                        <Text className="text-xs font-sans-medium text-white/80">
                            vs. {formatCurrency(previousMonthSpending)} last month
                        </Text>
                    </>
                ) : (
                    <Text className="text-xs font-sans-medium text-white/80">
                        Current month active spending
                    </Text>
                )}
            </View>

            {/* Bottom mini metric tiles */}
            <View className="mt-4 flex-row gap-3 border-t border-white/20 pt-3.5">
                <View className="flex-1 rounded-2xl bg-white/15 p-2.5">
                    <Text className="text-[11px] font-sans-semibold uppercase tracking-[0.5px] text-white/75">
                        Active Subs
                    </Text>
                    <Text className="mt-0.5 text-base font-sans-bold text-white">
                        {activeCount}
                    </Text>
                </View>

                <View className="flex-1 rounded-2xl bg-white/15 p-2.5">
                    <Text className="text-[11px] font-sans-semibold uppercase tracking-[0.5px] text-white/75">
                        Due in 7 Days
                    </Text>
                    <Text className="mt-0.5 text-base font-sans-bold text-white">
                        {upcomingCount}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default HomeHeroCard;
