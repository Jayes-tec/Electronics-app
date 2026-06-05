import React from 'react'
import { Dimensions, Text, TouchableOpacity, View } from 'react-native'
import MyButton from './MyButton'

const { width, height } = Dimensions.get('window')

export default function PlusMinusComponent({ qty = 0, onChange = () => {} }) {

    const handlePlus = () => {
        onChange(qty + 1)
    }

    const handleMinus = () => {
        if (qty > 0) {
            onChange(qty - 1)
        }
    }

    const Button = ({ msg, onPress }) => {
        return (
            <TouchableOpacity onPress={onPress}>
                <View style={{ width: width * 0.1, height: width * 0.1, backgroundColor: '#12daa8', borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#000' }}>
                        {msg}
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <View style={{ display: 'flex' }}>
            {qty === 0 ?
                <View>
                    <MyButton onPress={handlePlus} bg='#12daa8' msg='Add to Cart' w={0.45} h={0.08} brdCol='#fff' />
                </View> :
                <View style={{ width: width * 0.45, height: 50, marginTop: 10, paddingHorizontal: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Button msg='-' onPress={handleMinus} />
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>{qty}</Text>
                    <Button msg='+' onPress={handlePlus} />
                </View>
            }
        </View>
    )
}