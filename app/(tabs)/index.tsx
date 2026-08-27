import "@/global.css";
import { useState, useMemo } from "react";
import { FlatList, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/expo";
import { usePostHog } from "posthog-react-native";
import dayjs from "dayjs";

import { useAppTheme } from "@/context/ThemeContext";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { buildBillingLedger, eventsInMonth } from "@/lib/insights/billingLedger";
import {
    computeCategoryBreakdown,
    computeMonthlyOverview,
} from "@/lib/insights/aggregate";

import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import FadeInUp from "@/components/insights/FadeInUp";

import HomeHeader from "@/components/home/HomeHeader";
import HomeHeroCard from "@/components/home/HomeHeroCard";
import QuickActions from "@/components/home/QuickActions";
import HomeSpendingOverview from "@/components/home/HomeSpendingOverview";
import RecentActivity from "@/components/home/RecentActivity";
import HomeEmptyState from "@/components/home/HomeEmptyState";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
    const router = useRouter();
    const { user } = useUser();
    const posthog = usePostHog();
    const { subscriptions, addSubscription } = useSubscriptionStore();

    const { colors, isDark } = useAppTheme();

    const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const now = useMemo(() => dayjs(), []);
    const currentMonthKey = useMemo(() => now.format("YYYY-MM"), [now]);

    // Build the ledger of historical and projected events
    const { events: allEvents } = useMemo(
        () => buildBillingLedger(subscriptions, now),
        [subscriptions, now]
    );

    // Compute monthly spending metrics and category distribution
    const overview = useMemo(
        () => computeMonthlyOverview(allEvents, currentMonthKey, now),
        [allEvents, currentMonthKey, now]
    );

    const monthEvents = useMemo(
        () => eventsInMonth(allEvents, currentMonthKey),
        [allEvents, currentMonthKey]
    );

    const categoryBreakdown = useMemo(
        () => computeCategoryBreakdown(monthEvents),
        [monthEvents]
    );

    // Active subscriptions list
    const activeSubscriptions = useMemo(
        () => subscriptions.filter((s) => s.status === "active"),
        [subscriptions]
    );

    // Get upcoming subscriptions (active with renewal date within next 7 days)
    const upcomingSubscriptions: UpcomingSubscription[] = useMemo(() => {
        const nextWeek = now.add(7, "days");
        return subscriptions
            .filter((sub) => {
                if (sub.status !== "active" || !sub.renewalDate) return false;
                const renewal = dayjs(sub.renewalDate);
                return renewal.isAfter(now) && renewal.isBefore(nextWeek);
            })
            .map((sub) => {
                const daysLeft = Math.max(0, dayjs(sub.renewalDate).diff(now, "day"));
                return {
                    id: sub.id,
                    icon: sub.icon,
                    name: sub.name,
                    price: sub.price,
                    currency: sub.currency || "USD",
                    daysLeft,
                };
            })
            .sort((a, b) => a.daysLeft - b.daysLeft);
    }, [subscriptions, now]);

    // User display name
    const displayName =
        user?.firstName || user?.fullName || user?.emailAddresses?.[0]?.emailAddress || "There";

    // Handlers
    const handleSubscriptionPress = (item: Subscription) => {
        const isExpanding = expandedSubscriptionId !== item.id;
        setExpandedSubscriptionId((currentId) => (currentId === item.id ? null : item.id));
        posthog?.capture?.(isExpanding ? "subscription_expanded" : "subscription_collapsed", {
            subscription_name: item.name,
            subscription_id: item.id,
        });
    };

    const handleCreateSubscription = (newSubscription: Subscription) => {
        addSubscription(newSubscription);
        posthog?.capture?.("subscription_created", {
            subscription_name: newSubscription.name,
            subscription_price: newSubscription.price,
            subscription_frequency: newSubscription.frequency || "Monthly",
            subscription_category: newSubscription.category || "Other",
        });
    };

    const navigateToSubscriptions = () => {
        posthog?.capture?.("home_navigated_to_subscriptions");
        router.push("/(tabs)/subscriptions");
    };

    const navigateToInsights = () => {
        posthog?.capture?.("home_navigated_to_insights");
        router.push("/(tabs)/insights");
    };

    const hasSubscriptions = subscriptions.length > 0;

    return (
        <SafeAreaView className="flex-1 bg-background">
            <FlatList
                className="px-5"
                showsVerticalScrollIndicator={false}
                contentContainerClassName="pb-32 pt-2"
                ListHeaderComponent={() => (
                    <>
                        <HomeHeader
                            displayName={displayName}
                            imageUrl={user?.imageUrl}
                            onAddPress={() => setIsModalVisible(true)}
                        />

                        {hasSubscriptions ? (
                            <>
                                <FadeInUp delay={0}>
                                    <HomeHeroCard
                                        totalSpending={overview.totalSpending}
                                        percentChange={overview.percentChange}
                                        previousMonthSpending={overview.previousMonthSpending}
                                        activeCount={activeSubscriptions.length}
                                        upcomingCount={upcomingSubscriptions.length}
                                        onViewInsights={navigateToInsights}
                                    />
                                </FadeInUp>

                                <FadeInUp delay={60}>
                                    <QuickActions
                                        onAddPress={() => setIsModalVisible(true)}
                                        onViewSubscriptions={navigateToSubscriptions}
                                        onViewInsights={navigateToInsights}
                                    />
                                </FadeInUp>

                                {upcomingSubscriptions.length > 0 && (
                                    <FadeInUp delay={120}>
                                        <View className="mb-2">
                                            <ListHeading
                                                title="Upcoming Renewals"
                                                actionLabel="View All"
                                                onActionPress={navigateToSubscriptions}
                                            />
                                            <FlatList
                                                data={upcomingSubscriptions}
                                                renderItem={({ item }) => (
                                                    <UpcomingSubscriptionCard {...item} />
                                                )}
                                                keyExtractor={(item) => item.id}
                                                horizontal
                                                showsHorizontalScrollIndicator={false}
                                                contentContainerClassName="pr-4 py-1"
                                            />
                                        </View>
                                    </FadeInUp>
                                )}

                                {categoryBreakdown.length > 0 && (
                                    <FadeInUp delay={160}>
                                        <HomeSpendingOverview
                                            breakdown={categoryBreakdown}
                                            total={overview.totalSpending}
                                            onViewInsights={navigateToInsights}
                                        />
                                    </FadeInUp>
                                )}

                                {monthEvents.length > 0 && (
                                    <FadeInUp delay={200}>
                                        <View className="mt-2 mb-1">
                                            <ListHeading
                                                title="Recent Activity"
                                                actionLabel="Full History"
                                                onActionPress={navigateToInsights}
                                            />
                                            <RecentActivity events={monthEvents} />
                                        </View>
                                    </FadeInUp>
                                )}

                                <FadeInUp delay={240}>
                                    <View className="mt-3">
                                        <ListHeading
                                            title="Your Subscriptions"
                                            actionLabel="Manage"
                                            onActionPress={navigateToSubscriptions}
                                        />
                                    </View>
                                </FadeInUp>
                            </>
                        ) : (
                            <HomeEmptyState onAddPress={() => setIsModalVisible(true)} />
                        )}
                    </>
                )}
                data={hasSubscriptions ? subscriptions : []}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <FadeInUp delay={0}>
                        <SubscriptionCard
                            {...item}
                            expanded={expandedSubscriptionId === item.id}
                            onPress={() => handleSubscriptionPress(item)}
                        />
                    </FadeInUp>
                )}
                extraData={expandedSubscriptionId}
                ItemSeparatorComponent={() => <View className="h-3" />}
            />

            <CreateSubscriptionModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSubmit={handleCreateSubscription}
            />
        </SafeAreaView>
    );
}