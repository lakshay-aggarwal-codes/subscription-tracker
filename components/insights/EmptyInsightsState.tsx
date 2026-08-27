import { Text, View } from "react-native";

interface EmptyInsightsStateProps {
    monthLabel: string;
}

const EmptyInsightsState = ({ monthLabel }: EmptyInsightsStateProps) => {
    return (
        <View className="insights-empty-state">
            <Text className="text-3xl">📊</Text>
            <Text className="insights-empty-title">No charges in {monthLabel}</Text>
            <Text className="insights-empty-subtitle">
                None of your subscriptions were billed this month. Switch months or add a subscription to start
                building your insights.
            </Text>
        </View>
    );
};

export default EmptyInsightsState;
