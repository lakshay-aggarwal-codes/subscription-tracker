import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';

const ListHeading = ({
    title,
    actionLabel = 'View All',
    onActionPress,
    showAction = true,
}: ListHeadingProps) => {
    return (
        <View className="list-head">
            <Text className="list-title">{title}</Text>
            {showAction && onActionPress ? (
                <TouchableOpacity
                    className="list-action"
                    onPress={onActionPress}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={actionLabel}
                >
                    <Text className="list-action-text">{actionLabel}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
};

export default ListHeading;