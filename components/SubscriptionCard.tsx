import {View, Text, Image, Pressable} from 'react-native'
import {formatCurrency, formatStatusLabel, formatSubscriptionDateTime} from "@/lib/utils";
import clsx from "clsx";

const fallback = "Not Provided";
const SubscriptionCard = ({name, price, currency, icon,status, billing, color, category, plan, renewalDate, expanded, onPress, paymentMethod, startDate}: SubscriptionCardProps) => {
    return (
        <Pressable onPress={onPress} className={clsx('sub-card', expanded ? 'sub-card-expanded' : 'bg-card')} style= {!expanded && color ? {backgroundColor: color} : undefined}>
            <View className='sub-head'>
                <View className='sub-main'>
                    <Image source={icon} className='sub-icon'></Image>
                    <View className='sub-copy'>
                        <Text numberOfLines={1} className='sub-title'>
                            {name}
                        </Text>
                        <Text numberOfLines={1} ellipsizeMode='tail' className='sub-meta'>
                            {category?.trim() || plan?.trim() || (renewlDate ? formatSubscriptionDateTime(renewalDate) : "")}
                        </Text>
                    </View>
                </View>

                <View className='sub-price-box'>
                    <Text className='sub-price'>{formatCurrency(price, currency)}</Text>
                    <Text className='sub-billing'>{billing}</Text>
                </View>
            </View>

            {expanded && (
                <View className='sub-bdy'>
                   <View className='sub-details'>

                       <View className='sub-row'>
                           <View className='sub-row-copy'>
                               <Text className='sub-label'>
                                   Payment:
                               </Text>
                               <Text numberOfLines={1} ellipsizeMode='tail' className='sub-value'>
                                   {paymentMethod?.trim() ?? fallback}
                               </Text>
                           </View>
                       </View>

                       <View className='sub-row'>
                           <View className='sub-row-copy'>
                               <Text className='sub-label'>
                                   Category:
                               </Text>
                               <Text numberOfLines={1} ellipsizeMode='tail' className='sub-value'>
                                   {(category?.trim() || plan?.trim()) ?? fallback}
                               </Text>
                           </View>
                       </View>

                       <View className='sub-row'>
                           <View className='sub-row-copy'>
                               <Text className='sub-label'>
                                   Started:
                               </Text>
                               <Text numberOfLines={1} ellipsizeMode='tail' className='sub-value'>
                                   {(startDate ? formatSubscriptionDateTime(startDate):"")?? fallback}
                               </Text>
                           </View>
                       </View>

                       <View className='sub-row'>
                           <View className='sub-row-copy'>
                               <Text className='sub-label'>
                                   Renewal Date:
                               </Text>
                               <Text numberOfLines={1} ellipsizeMode='tail' className='sub-value'>
                                   {(renewalDate ? formatSubscriptionDateTime(renewalDate):"")?? fallback}
                               </Text>
                           </View>
                       </View>

                       <View className='sub-row'>
                           <View className='sub-row-copy'>
                               <Text className='sub-label'>
                                   Status:
                               </Text>
                               <Text numberOfLines={1} ellipsizeMode='tail' className='sub-value'>
                                   {(status ? formatStatusLabel(status) :"") ?? fallback}
                               </Text>
                           </View>
                       </View>

                   </View>
                </View>
            )}
        </Pressable>
    )
}
export default SubscriptionCard