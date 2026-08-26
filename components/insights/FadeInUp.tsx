import { useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";

interface FadeInUpProps {
    children: React.ReactNode;
    delay?: number;
    style?: ViewStyle;
}

const FadeInUp = ({ children, delay = 0, style }: FadeInUpProps) => {
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(progress, {
            toValue: 1,
            duration: 450,
            delay,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View
            style={[
                style,
                {
                    opacity: progress,
                    transform: [
                        {
                            translateY: progress.interpolate({
                                inputRange: [0, 1],
                                outputRange: [16, 0],
                            }),
                        },
                    ],
                },
            ]}
        >
            {children}
        </Animated.View>
    );
};

export default FadeInUp;
