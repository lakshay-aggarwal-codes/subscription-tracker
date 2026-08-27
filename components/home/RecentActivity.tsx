import { View, Text, Image } from 'react-native';
import React from 'react';
import dayjs from 'dayjs';
import { formatCurrency } from '@/lib/utils';

interface RecentActivityProps {
    events: BillingEvent[];
}

const RecentActivity = ({ events }: RecentActivityProps) => {
    if (events.length === 0) {
        return null;
    }

    // Show top 3 recent billing events on the dashboard
    const displayEvents = events.slice(0, 3);

    return (
        <View className="gap-2.5 my-1">
            {displayEvents.map((event) => (
                <View key={event.id} className="history-row">
                    <Image source={event.icon} className="history-icon" />
                    <View className="history-copy">
                        <Text className="history-name" numberOfLines={1}>
                            {event.subscriptionName}
                        </Text>
                        <Text className="history-date" numberOfLines={1}>
                            {dayjs(event.date).format('MMM D, YYYY')} • {event.category}
                        </Text>
                    </View>
                    <View className="items-end">
                        <Text className="history-price">{formatCurrency(event.price, event.currency)}</Text>
                        <Text className="history-price-caption">
                            {event.billing}
                        </Text>
                    </View>
                </View>
            ))}
        </View>
    );
};

export default RecentActivity;
