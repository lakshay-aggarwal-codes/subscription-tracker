import dayjs, { Dayjs } from "dayjs";

const MAX_EVENTS_PER_SUBSCRIPTION = 240; // 20 years of monthly billing — safety cap

const normalizeCadence = (billing?: string): "Monthly" | "Yearly" | null => {
    const value = (billing || "").trim().toLowerCase();
    if (value === "monthly") return "Monthly";
    if (value === "yearly" || value === "annually" || value === "annual") return "Yearly";
    return null;
};

const advance = (date: Dayjs, cadence: "Monthly" | "Yearly"): Dayjs =>
    cadence === "Monthly" ? date.add(1, "month") : date.add(1, "year");

export interface LedgerResult {
    events: BillingEvent[];
    excludedSubscriptions: Subscription[]; // no usable startDate/cadence to project from
}

export const generateEventsForSubscription = (
    subscription: Subscription,
    boundary: Dayjs
): BillingEvent[] => {
    const cadence = normalizeCadence(subscription.billing || subscription.frequency);
    if (!cadence || !subscription.startDate) return [];

    const start = dayjs(subscription.startDate);
    if (!start.isValid()) return [];

    let effectiveBoundary = boundary;
    if (subscription.status === "cancelled" && subscription.renewalDate) {
        const renewal = dayjs(subscription.renewalDate);
        if (renewal.isValid() && renewal.isBefore(boundary)) {
            effectiveBoundary = renewal;
        }
    }

    if (start.isAfter(effectiveBoundary)) return [];

    const events: BillingEvent[] = [];
    let cursor = start;
    let index = 0;

    while (!cursor.isAfter(effectiveBoundary) && index < MAX_EVENTS_PER_SUBSCRIPTION) {
        events.push({
            id: `${subscription.id}-${cursor.format("YYYY-MM-DD")}`,
            subscriptionId: subscription.id,
            subscriptionName: subscription.name,
            icon: subscription.icon,
            category: subscription.category?.trim() || "Other",
            color: subscription.color,
            billing: cadence,
            price: subscription.price,
            currency: subscription.currency || "USD",
            date: cursor.toISOString(),
        });
        cursor = advance(cursor, cadence);
        index += 1;
    }

    return events;
};


export const buildBillingLedger = (
    subscriptions: Subscription[],
    now: Dayjs = dayjs()
): LedgerResult => {
    const events: BillingEvent[] = [];
    const excludedSubscriptions: Subscription[] = [];

    for (const subscription of subscriptions) {
        const subscriptionEvents = generateEventsForSubscription(subscription, now);
        if (subscriptionEvents.length === 0 && !normalizeCadence(subscription.billing || subscription.frequency)) {
            excludedSubscriptions.push(subscription);
            continue;
        }
        if (subscriptionEvents.length === 0 && !subscription.startDate) {
            excludedSubscriptions.push(subscription);
            continue;
        }
        events.push(...subscriptionEvents);
    }

    events.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

    return { events, excludedSubscriptions };
};

export const eventsInMonth = (events: BillingEvent[], monthKey: string): BillingEvent[] =>
    events.filter((event) => dayjs(event.date).format("YYYY-MM") === monthKey);
