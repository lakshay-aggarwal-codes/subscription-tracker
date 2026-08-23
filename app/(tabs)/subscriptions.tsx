import { View, Text } from "react-native";
import { styled } from "nativewind";
import {SafeAreaView as RNSafeAreaView} from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
    return (
        <SafeAreaView className="flex-1 p-5 bg-background">
            <Text>Subscriptions</Text>
         </SafeAreaView>
    );
};

export default Subscriptions;