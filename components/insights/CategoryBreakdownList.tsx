import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { formatCurrency } from "@/lib/utils";

interface CategoryRowProps {
    item: CategoryBreakdownItem;
}

const CategoryRow = ({ item }: CategoryRowProps) => {
    const width = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        width.setValue(0);
        Animated.timing(width, {
            toValue: item.percentage,
            duration: 700,
            useNativeDriver: false,
        }).start();
    }, [item.percentage, width]);

    return (
        <View>
            <View className="category-row">
                <View className="category-dot" style={{ backgroundColor: item.color }} />
                <Text className="category-row-name" numberOfLines={1}>
                    {item.category}
                </Text>
                <View className="category-row-meta">
                    <Text className="category-row-amount">{formatCurrency(item.total)}</Text>
                    <Text className="category-row-percent">{item.percentage}% · {item.count} charge{item.count === 1 ? "" : "s"}</Text>
                </View>
            </View>
            <View className="category-track">
                <Animated.View
                    className="category-fill"
                    style={{
                        backgroundColor: item.color,
                        width: width.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
                    }}
                />
            </View>
        </View>
    );
};

interface CategoryBreakdownListProps {
    breakdown: CategoryBreakdownItem[];
}

const CategoryBreakdownList = ({ breakdown }: CategoryBreakdownListProps) => {
    return (
        <View className="gap-4">
            {breakdown.map((item) => (
                <CategoryRow key={item.category} item={item} />
            ))}
        </View>
    );
};

export default CategoryBreakdownList;
