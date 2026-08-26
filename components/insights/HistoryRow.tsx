import { Image, Text, View } from "react-native";
import dayjs from "dayjs";
import { formatCurrency } from "@/lib/utils";

interface HistoryRowProps {
    event: BillingEvent;
}

const HistoryRow = ({ event }: HistoryRowProps) => {
    return (
        <View className="history-row">
            <Image source={event.icon} className="history-icon" />
            <View className="history-copy">
                <Text className="history-name" numberOfLines={1}>
                    {event.subscriptionName}
                </Text>
                <Text className="history-date" numberOfLines={1}>
                    {dayjs(event.date).format("MMMM D, h:mm A")}
                </Text>
            </View>
            <View className="items-end">
                <Text className="history-price">{formatCurrency(event.price, event.currency)}</Text>
                <Text className="history-price-caption">
                    {event.billing === "Monthly" ? "per month" : "per year"}
                </Text>
            </View>
        </View>
    );
};

export default HistoryRow;
