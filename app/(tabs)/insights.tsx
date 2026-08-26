import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import dayjs from "dayjs";

import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { buildBillingLedger, eventsInMonth } from "@/lib/insights/billingLedger";
import {
    computeCategoryBreakdown,
    computeFinancialHealth,
    computeMonthlyOverview,
    computeTrend,
    generateSmartInsights,
} from "@/lib/insights/aggregate";

import MonthSwitcher from "@/components/insights/MonthSwitcher";
import OverviewCard from "@/components/insights/OverviewCard";
import CategoryDonutChart from "@/components/insights/CategoryDonutChart";
import CategoryBreakdownList from "@/components/insights/CategoryBreakdownList";
import TrendChart from "@/components/insights/TrendChart";
import HealthScoreCard from "@/components/insights/HealthScoreCard";
import InsightsList from "@/components/insights/InsightsList";
import HistoryRow from "@/components/insights/HistoryRow";
import EmptyInsightsState from "@/components/insights/EmptyInsightsState";
import FadeInUp from "@/components/insights/FadeInUp";

const SafeAreaView = styled(RNSafeAreaView);

const Insights = () => {
    const { subscriptions } = useSubscriptionStore();
    const now = useMemo(() => dayjs(), []);
    const currentMonthKey = now.format("YYYY-MM");
    const [selectedMonthKey, setSelectedMonthKey] = useState(currentMonthKey);

    const { events: allEvents, excludedSubscriptions } = useMemo(
        () => buildBillingLedger(subscriptions, now),
        [subscriptions, now]
    );

    const overview = useMemo(
        () => computeMonthlyOverview(allEvents, selectedMonthKey, now),
        [allEvents, selectedMonthKey, now]
    );

    const monthEvents = useMemo(() => eventsInMonth(allEvents, selectedMonthKey), [allEvents, selectedMonthKey]);
    const breakdown = useMemo(() => computeCategoryBreakdown(monthEvents), [monthEvents]);
    const trend = useMemo(() => computeTrend(allEvents, selectedMonthKey, 6), [allEvents, selectedMonthKey]);
    const health = useMemo(
        () => computeFinancialHealth(overview, breakdown, subscriptions),
        [overview, breakdown, subscriptions]
    );
    const insights = useMemo(
        () => generateSmartInsights(overview, breakdown, trend, subscriptions),
        [overview, breakdown, trend, subscriptions]
    );

    const hasData = overview.eventCount > 0;
    const isCurrentMonth = selectedMonthKey === currentMonthKey;

    const goToPreviousMonth = () => {
        setSelectedMonthKey(dayjs(`${selectedMonthKey}-01`).subtract(1, "month").format("YYYY-MM"));
    };

    const goToNextMonth = () => {
        if (isCurrentMonth) return;
        setSelectedMonthKey(dayjs(`${selectedMonthKey}-01`).add(1, "month").format("YYYY-MM"));
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView
                className="flex-1 px-5"
                showsVerticalScrollIndicator={false}
                contentContainerClassName="pb-30"
            >
                <View className="insights-header mt-5">
                    <Text className="insights-title">Monthly Insights</Text>
                </View>

                <MonthSwitcher
                    label={overview.monthLabel}
                    onPrevious={goToPreviousMonth}
                    onNext={goToNextMonth}
                    nextDisabled={isCurrentMonth}
                />

                {!hasData ? (
                    <FadeInUp>
                        <EmptyInsightsState monthLabel={overview.monthLabel} />
                    </FadeInUp>
                ) : (
                    <>
                        <FadeInUp delay={0}>
                            <OverviewCard overview={overview} />
                        </FadeInUp>

                        <FadeInUp delay={80} style={{ marginTop: 24 }}>
                            <Text className="section-title">Category Breakdown</Text>
                            <View className="insight-card">
                                <CategoryDonutChart breakdown={breakdown} total={overview.totalSpending} />
                                <View className="mt-5">
                                    <CategoryBreakdownList breakdown={breakdown} />
                                </View>
                            </View>
                        </FadeInUp>

                        <FadeInUp delay={140} style={{ marginTop: 24 }}>
                            <Text className="section-title">6-Month Trend</Text>
                            <View className="insight-card">
                                <TrendChart trend={trend} />
                            </View>
                        </FadeInUp>

                        <FadeInUp delay={200} style={{ marginTop: 24 }}>
                            <Text className="section-title">Financial Health</Text>
                            <HealthScoreCard health={health} />
                        </FadeInUp>

                        {insights.length > 0 && (
                            <FadeInUp delay={260} style={{ marginTop: 24 }}>
                                <Text className="section-title">Smart Insights</Text>
                                <View className="insight-card">
                                    <InsightsList insights={insights} />
                                </View>
                            </FadeInUp>
                        )}

                        <FadeInUp delay={320} style={{ marginTop: 24 }}>
                            <Text className="section-title">History</Text>
                            <View className="gap-3">
                                {monthEvents.map((event) => (
                                    <HistoryRow key={event.id} event={event} />
                                ))}
                            </View>
                        </FadeInUp>

                        {excludedSubscriptions.length > 0 && (
                            <Text className="insights-footnote mt-4">
                                {excludedSubscriptions.length} subscription{excludedSubscriptions.length === 1 ? "" : "s"}{" "}
                                without a start date {excludedSubscriptions.length === 1 ? "isn't" : "aren't"} included
                                in these charts.
                            </Text>
                        )}

                        <Text className="insights-footnote">
                            Amounts are projected from each subscription's billing cycle, not a separate transaction
                            log.
                        </Text>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default Insights;
