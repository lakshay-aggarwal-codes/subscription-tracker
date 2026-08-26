import { Text, View } from "react-native";

interface InsightsListProps {
    insights: SmartInsight[];
}

const iconFor = (insight: SmartInsight): string => {
    if (insight.kind === "recommendation") return "💡";
    if (insight.tone === "positive") return "↓";
    if (insight.tone === "negative") return "↑";
    return "•";
};

const InsightsList = ({ insights }: InsightsListProps) => {
    if (insights.length === 0) return null;

    return (
        <View>
            {insights.map((insight, index) => (
                <View
                    key={insight.id}
                    className="insight-list-item"
                    style={index === 0 ? undefined : { borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.08)" }}
                >
                    <View className="insight-list-icon">
                        <Text className="insight-list-icon-text">{iconFor(insight)}</Text>
                    </View>
                    <Text className="insight-list-text">{insight.text}</Text>
                </View>
            ))}
        </View>
    );
};

export default InsightsList;
