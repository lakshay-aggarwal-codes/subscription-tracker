import {Text, View, TextInput, FlatList} from 'react-native'
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useState } from "react";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptionStore } from "@/lib/subscriptionStore";

import { useAppTheme } from "@/context/ThemeContext";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
    const { colors, isDark } = useAppTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const { subscriptions } = useSubscriptionStore();

    const filteredSubscriptions = subscriptions.filter((subscription) =>
        subscription.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subscription.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subscription.plan?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView className="flex-1 bg-background">
            <FlatList
                data={filteredSubscriptions}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={
                    <View className="px-5 pt-5">
                        <Text className="text-3xl font-sans-bold text-primary mb-5">Subscriptions</Text>
                        <TextInput
                            style={{ color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}
                            className="rounded-2xl px-4 py-4 text-base font-sans-medium mb-4"
                            placeholder="Search subscriptions..."
                            placeholderTextColor={isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)"}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                }
                renderItem={({ item }) => (
                    <SubscriptionCard
                        {...item}
                        expanded={expandedId === item.id}
                        onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    />
                )}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 12 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
            />
        </SafeAreaView>
    )
}
export default Subscriptions