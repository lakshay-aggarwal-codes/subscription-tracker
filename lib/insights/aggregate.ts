import dayjs from "dayjs";
import { eventsInMonth } from "./billingLedger";

const CATEGORY_PALETTE: Record<string, string> = {
    "Entertainment": "#ff6b6b",
    "AI Tools": "#b8d4e3",
    "Developer Tools": "#e8def8",
    "Design": "#f5c542",
    "Productivity": "#95e1d3",
    "Other": "#d4d4d4",
};

const FALLBACK_PALETTE = ["#ea7a53", "#8fd1bd", "#b8d4e3", "#f5c542", "#e8def8", "#95e1d3", "#ff6b6b"];

const colorForCategory = (category: string, fallbackIndex: number): string =>
    CATEGORY_PALETTE[category] ?? FALLBACK_PALETTE[fallbackIndex % FALLBACK_PALETTE.length];

const round2 = (value: number): number => Math.round(value * 100) / 100;

export const computeCategoryBreakdown = (events: BillingEvent[]): CategoryBreakdownItem[] => {
    const totals = new Map<string, { total: number; count: number }>();

    for (const event of events) {
        const existing = totals.get(event.category) ?? { total: 0, count: 0 };
        existing.total += event.price;
        existing.count += 1;
        totals.set(event.category, existing);
    }

    const grandTotal = events.reduce((sum, e) => sum + e.price, 0);

    return Array.from(totals.entries())
        .map(([category, { total, count }], index) => ({
            category,
            total: round2(total),
            count,
            percentage: grandTotal > 0 ? round2((total / grandTotal) * 100) : 0,
            color: colorForCategory(category, index),
        }))
        .sort((a, b) => b.total - a.total);
};

export const computeMonthlyOverview = (
    allEvents: BillingEvent[],
    monthKey: string,
    now = dayjs()
): MonthlyOverview => {
    const monthEvents = eventsInMonth(allEvents, monthKey);
    const monthMoment = dayjs(`${monthKey}-01`);
    const previousMonthKey = monthMoment.subtract(1, "month").format("YYYY-MM");
    const previousMonthEvents = eventsInMonth(allEvents, previousMonthKey);

    const totalSpending = round2(monthEvents.reduce((sum, e) => sum + e.price, 0));
    const previousMonthSpending = round2(previousMonthEvents.reduce((sum, e) => sum + e.price, 0));

    const percentChange =
        previousMonthSpending > 0
            ? round2(((totalSpending - previousMonthSpending) / previousMonthSpending) * 100)
            : null;

    const isCurrentMonth = monthMoment.format("YYYY-MM") === now.format("YYYY-MM");
    const daysElapsed = isCurrentMonth ? now.date() : monthMoment.daysInMonth();
    const averageDailySpending = daysElapsed > 0 ? round2(totalSpending / daysElapsed) : 0;

    const breakdown = computeCategoryBreakdown(monthEvents);
    const largestCategory = breakdown.length > 0 ? breakdown[0] : null;

    const highestCharge =
        monthEvents.length > 0
            ? monthEvents.reduce((max, e) => (e.price > max.price ? e : max), monthEvents[0])
            : null;

    const activeSubscriptionCount = new Set(monthEvents.map((e) => e.subscriptionId)).size;

    return {
        monthLabel: monthMoment.format("MMMM YYYY"),
        monthKey,
        totalSpending,
        previousMonthSpending,
        percentChange,
        averageDailySpending,
        largestCategory,
        highestCharge,
        activeSubscriptionCount,
        eventCount: monthEvents.length,
    };
};

export const computeTrend = (allEvents: BillingEvent[], monthKey: string, span = 6): TrendPoint[] => {
    const anchor = dayjs(`${monthKey}-01`);
    const points: TrendPoint[] = [];

    for (let i = span - 1; i >= 0; i -= 1) {
        const month = anchor.subtract(i, "month");
        const key = month.format("YYYY-MM");
        const total = round2(eventsInMonth(allEvents, key).reduce((sum, e) => sum + e.price, 0));
        points.push({
            monthKey: key,
            monthLabel: month.format("MMM"),
            total,
            isCurrent: key === monthKey,
        });
    }

    return points;
};

/**
 * A transparent, rule-based health score (0-100) — not a mysterious AI
 * number. Built from three measurable factors the data actually supports:
 * spend trend vs last month, how concentrated spend is in one category, and
 * how many active subscriptions are cancelled/paused vs active (a proxy for
 * "tidy subscription list").
 */
export const computeFinancialHealth = (
    overview: MonthlyOverview,
    breakdown: CategoryBreakdownItem[],
    subscriptions: Subscription[]
): FinancialHealthResult => {
    const factors: FinancialHealthResult["factors"] = [];
    let score = 100;

    // Trend factor
    if (overview.percentChange === null) {
        factors.push({
            label: "Spending trend",
            detail: "Not enough history yet to compare with last month.",
            impact: "neutral",
        });
    } else if (overview.percentChange > 15) {
        score -= 20;
        factors.push({
            label: "Spending trend",
            detail: `Up ${overview.percentChange}% vs last month.`,
            impact: "negative",
        });
    } else if (overview.percentChange > 0) {
        score -= 8;
        factors.push({
            label: "Spending trend",
            detail: `Up ${overview.percentChange}% vs last month.`,
            impact: "negative",
        });
    } else {
        factors.push({
            label: "Spending trend",
            detail: `Down ${Math.abs(overview.percentChange)}% vs last month.`,
            impact: "positive",
        });
    }

    // Concentration factor
    const topShare = breakdown.length > 0 ? breakdown[0].percentage : 0;
    if (topShare >= 60) {
        score -= 20;
        factors.push({
            label: "Category concentration",
            detail: `${breakdown[0].category} makes up ${topShare}% of spend.`,
            impact: "negative",
        });
    } else if (topShare >= 40) {
        score -= 8;
        factors.push({
            label: "Category concentration",
            detail: `${breakdown[0].category} makes up ${topShare}% of spend.`,
            impact: "neutral",
        });
    } else if (breakdown.length > 0) {
        factors.push({
            label: "Category concentration",
            detail: "Spending is well spread across categories.",
            impact: "positive",
        });
    }

    // Subscription tidiness factor
    const active = subscriptions.filter((s) => s.status === "active").length;
    const inactive = subscriptions.filter((s) => s.status === "paused" || s.status === "cancelled").length;
    if (inactive > 0 && active > 0 && inactive / (active + inactive) > 0.4) {
        score -= 12;
        factors.push({
            label: "Subscription list",
            detail: `${inactive} paused or cancelled subscription${inactive === 1 ? "" : "s"} still being tracked.`,
            impact: "negative",
        });
    } else {
        factors.push({
            label: "Subscription list",
            detail: `${active} active subscription${active === 1 ? "" : "s"} tracked.`,
            impact: "neutral",
        });
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    const label = score >= 80 ? "Healthy" : score >= 55 ? "Fair" : "Needs attention";

    return { score, label, factors };
};

export const generateSmartInsights = (
    overview: MonthlyOverview,
    breakdown: CategoryBreakdownItem[],
    trend: TrendPoint[],
    subscriptions: Subscription[]
): SmartInsight[] => {
    const insights: SmartInsight[] = [];
    let id = 0;
    const next = () => `insight-${id++}`;

    if (overview.percentChange !== null) {
        const direction = overview.percentChange <= 0 ? "decreased" : "increased";
        insights.push({
            id: next(),
            kind: "observation",
            tone: overview.percentChange <= 0 ? "positive" : "negative",
            text: `Your spending ${direction} by ${Math.abs(overview.percentChange)}% compared with last month.`,
        });
    }

    if (overview.largestCategory) {
        insights.push({
            id: next(),
            kind: "observation",
            tone: "neutral",
            text: `${overview.largestCategory.category} was your largest spending category at ${overview.largestCategory.percentage}% of the month's total.`,
        });
    }

    if (overview.highestCharge) {
        insights.push({
            id: next(),
            kind: "observation",
            tone: "neutral",
            text: `Your highest charge this month was ${overview.highestCharge.subscriptionName} on ${dayjs(
                overview.highestCharge.date
            ).format("MMMM D")}.`,
        });
    }

    if (trend.length >= 2) {
        const prior = trend[trend.length - 2];
        const current = trend[trend.length - 1];
        if (prior.total > 0 && current.total > prior.total * 1.3) {
            insights.push({
                id: next(),
                kind: "observation",
                tone: "negative",
                text: `Spending jumped sharply this month compared with ${prior.monthLabel}.`,
            });
        }
    }

    const activeSubs = subscriptions.filter((s) => s.status === "active");
    const monthlyRecurring = round2(
        activeSubs
            .filter((s) => (s.billing || s.frequency)?.toLowerCase() === "monthly")
            .reduce((sum, s) => sum + s.price, 0)
    );
    if (activeSubs.length > 0) {
        insights.push({
            id: next(),
            kind: "observation",
            tone: "neutral",
            text: `You have ${activeSubs.length} active subscription${activeSubs.length === 1 ? "" : "s"}${
                monthlyRecurring > 0 ? `, totaling roughly $${monthlyRecurring.toFixed(2)}/month in recurring charges` : ""
            }.`,
        });
    }

    const pausedOrCancelled = subscriptions.filter((s) => s.status === "paused" || s.status === "cancelled");
    if (pausedOrCancelled.length > 0) {
        insights.push({
            id: next(),
            kind: "recommendation",
            tone: "neutral",
            text: `You have ${pausedOrCancelled.length} paused or cancelled subscription${
                pausedOrCancelled.length === 1 ? "" : "s"
            } still in your list. Review them to confirm they're no longer billing.`,
        });
    }

    if (overview.largestCategory && overview.largestCategory.percentage >= 40) {
        insights.push({
            id: next(),
            kind: "recommendation",
            tone: "neutral",
            text: `${overview.largestCategory.category} accounts for a large share of your spend. Consider whether all ${overview.largestCategory.category.toLowerCase()} subscriptions are still worth it.`,
        });
    }

    return insights;
};
