import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';

interface HomeEmptyStateProps {
    onAddPress: () => void;
}

const HomeEmptyState = ({ onAddPress }: HomeEmptyStateProps) => {
    return (
        <View className="items-center justify-center rounded-3xl border border-dashed border-border bg-card px-6 py-10 my-4">
            <View className="size-16 items-center justify-center rounded-full bg-accent/10 mb-4">
                <Text className="text-3xl">💳</Text>
            </View>
            <Text className="text-lg font-sans-bold text-primary text-center">
                No Subscriptions Yet
            </Text>
            <Text className="mt-1 text-sm font-sans-medium text-muted-foreground text-center max-w-[260px] leading-5">
                Track your recurring expenses, renewals, and spending analytics in one place.
            </Text>
            <TouchableOpacity
                onPress={onAddPress}
                activeOpacity={0.8}
                className="mt-5 rounded-2xl bg-accent px-6 py-3"
                accessibilityRole="button"
                accessibilityLabel="Add your first subscription"
            >
                <Text className="text-sm font-sans-bold text-primary">
                    + Add Your First Subscription
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default HomeEmptyState;
