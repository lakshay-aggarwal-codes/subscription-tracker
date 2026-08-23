import "@/global.css"
import {Text} from "react-native";
import {Link} from "expo-router";
import { styled } from "nativewind";
import {SafeAreaView as RNSafeAreaView} from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);
export default function App() {
    return (
        <SafeAreaView className="flex-1 p-5 bg-background">
            <Text className="text-xl font-bold text-success">
                Welcome to Nativewind!
            </Text>
            <Link href="/onboarding" className='mt-4 rounded bg-primary text-white p-4'>Go To Onboarding</Link>
            <Link href="/(auth)/sign-in" className='mt-4 rounded bg-primary text-white p-4'>Go To SignIn</Link>
            <Link href="/(auth)/sign-up" className='mt-4 rounded bg-primary text-white p-4'>Go To SignUp</Link>

            <Link href="/subscriptions/spotify">Spotify Subscription</Link>
            <Link href={{
                pathname: '/subscriptions/[id]',
                params: {id: "claude"}
            }}
            >Claude Max Subscription</Link>
        </SafeAreaView>
    );
}