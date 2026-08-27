import { View, Text, Image, TouchableOpacity } from 'react-native';
import React, { useMemo } from 'react';
import images from '@/constants/image';
import { icons } from '@/constants/icons';
import dayjs from 'dayjs';

interface HomeHeaderProps {
    displayName: string;
    imageUrl?: string | null;
    onAddPress: () => void;
}

const HomeHeader = ({ displayName, imageUrl, onAddPress }: HomeHeaderProps) => {
    const greeting = useMemo(() => {
        const hour = dayjs().hour();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    }, []);

    const formattedDate = useMemo(() => {
        return dayjs().format('dddd, MMM D');
    }, []);

    return (
        <View className="home-header">
            <View className="home-user">
                <Image
                    source={imageUrl ? { uri: imageUrl } : images.avatar}
                    className="home-avatar"
                    accessibilityLabel="Profile picture"
                />
                <View className="ml-3.5">
                    <Text className="text-xs font-sans-semibold uppercase tracking-[0.5px] text-muted-foreground">
                        {formattedDate} • {greeting}
                    </Text>
                    <Text className="home-user-name !ml-0" numberOfLines={1}>
                        {displayName}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                onPress={onAddPress}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Add new subscription"
            >
                <Image source={icons.add} className="home-add-icon" />
            </TouchableOpacity>
        </View>
    );
};

export default HomeHeader;
