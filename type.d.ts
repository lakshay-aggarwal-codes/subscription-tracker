import type { ImageSourcePropType } from "react-native";

declare global {
    interface AppTab {
        name: string;
        title: string;
        icon: ImageSourcePropType;
    }

    interface TabIconProps {
        focused: boolean;
        icon: ImageSourcePropType;
    }

    interface Subscription {
        id: string;
        icon: ImageSourcePropType;
        name: string;
        plan?: string;
        category?: string;
        paymentMethod?: string;
        status?: string;
        startDate?: string;
        price: number;
        currency?: string;
        billing: string;
        frequency?: string;
        renewalDate?: string;
        color?: string;
    }

    interface SubscriptionCardProps extends Omit<Subscription, "id"> {
        expanded: boolean;
        onPress: () => void;
        onCancelPress?: () => void;
        isCancelling?: boolean;
    }

    interface UpcomingSubscription {
        id: string;
        icon: ImageSourcePropType;
        name: string;
        price: number;
        currency?: string;
        daysLeft: number;
    }

    interface UpcomingSubscriptionCardProps
        extends Omit<UpcomingSubscription, "id"> {}

    interface ListHeadingProps {
        title: string;
    }

    // ---- Monthly Insights ----

    interface BillingEvent {
        id: string;
        subscriptionId: string;
        subscriptionName: string;
        icon: ImageSourcePropType;
        category: string;
        color?: string;
        billing: string;
        price: number;
        currency: string;
        date: string; // ISO date of the charge
    }

    interface CategoryBreakdownItem {
        category: string;
        total: number;
        percentage: number;
        color: string;
        count: number;
    }

    interface MonthlyOverview {
        monthLabel: string;
        monthKey: string; // YYYY-MM
        totalSpending: number;
        previousMonthSpending: number;
        percentChange: number | null; // null when there is no previous-month baseline
        averageDailySpending: number;
        largestCategory: CategoryBreakdownItem | null;
        highestCharge: BillingEvent | null;
        activeSubscriptionCount: number;
        eventCount: number;
    }

    interface TrendPoint {
        monthKey: string;
        monthLabel: string;
        total: number;
        isCurrent: boolean;
    }

    interface FinancialHealthResult {
        score: number; // 0-100
        label: string;
        factors: {
            label: string;
            detail: string;
            impact: "positive" | "negative" | "neutral";
        }[];
    }

    interface SmartInsight {
        id: string;
        kind: "observation" | "recommendation";
        tone: "positive" | "negative" | "neutral";
        text: string;
    }
}

export {};