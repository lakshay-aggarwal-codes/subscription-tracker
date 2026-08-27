import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { icons } from '@/constants/icons';

interface QuickActionsProps {
    onAddPress: () => void;
    onViewSubscriptions: () => void;
    onViewInsights: () => void;
}

const QuickActions = ({
    onAddPress,
    onViewSubscriptions,
    onViewInsights,
}: QuickActionsProps) => {
    return (
        <View className="my-3 flex-row gap-2.5">
            <TouchableOpacity
                onPress={onAddPress}
                activeOpacity={0.75}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 px-2"
                accessibilityRole="button"
                accessibilityLabel="Add Subscription"
            >
                <Image source={icons.plus} className="size-4" resizeMode="contain" />
                <Text className="text-xs font-sans-bold text-primary" numberOfLines={1}>
                    Add
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={onViewSubscriptions}
                activeOpacity={0.75}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 px-2"
                accessibilityRole="button"
                accessibilityLabel="View All Subscriptions"
            >
                <Image source={icons.wallet} className="size-4" resizeMode="contain" />
                <Text className="text-xs font-sans-bold text-primary" numberOfLines={1}>
                    Subscriptions
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={onViewInsights}
                activeOpacity={0.75}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 px-2"
                accessibilityRole="button"
                accessibilityLabel="View Analytics Insights"
            >
                <Image source={icons.activity} className="size-4" resizeMode="contain" />
                <Text className="text-xs font-sans-bold text-primary" numberOfLines={1}>
                    Insights
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default QuickActions;
