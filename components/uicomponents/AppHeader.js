import React from 'react';
import { Image, Dimensions, View, Text, TouchableOpacity } from 'react-native';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { useSelector } from 'react-redux';

const { width, height } = Dimensions.get('window');

export default function AppHeader(props) {
  const navigation = useNavigation();
  const cart = useSelector(state => state.mycart || {});
  const cartCount = Object.keys(cart).length;

  return (
    <View>
      <View
        style={{
          alignItems: 'center',
          backgroundColor: '#fff',
          display: 'flex',
          width: width,
          height: height * 0.06,
          justifyContent: 'space-between',
          flexDirection: 'row',
          paddingHorizontal: 15,
          paddingVertical: 5,
        }}>
        <MCI 
          name="menu"
          size={24}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        />
        <Image
          style={{ resizeMode: 'contain', width: 80, height: 80 }}
          source={require('../../assets/logo.png')}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
          <MCI name="account" size={24} />
          <TouchableOpacity onPress={() => navigation.navigate('cart')} style={{ position: 'relative' }}>
            <MCI name="cart" size={24} />
            {cartCount > 0 && (
              <View style={{
                position: 'absolute',
                right: -6,
                top: -6,
                backgroundColor: '#ff4757',
                borderRadius: 10,
                width: 16,
                height: 16,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
