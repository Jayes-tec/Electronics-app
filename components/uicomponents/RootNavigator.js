import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import Home from '../../screens/Home';
import ProductDetails from '../../screens/ProductsDetail';
import Cart from '../../screens/Cart';
import AppHeader from './AppHeader';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Image, Text, View} from 'react-native';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';

// 1. HOW MANY SCREENS IS TO BE PRESENT IS CALLED STACK = createNativeStackNavigator()
// 2. DRAWER IS CREATED BY THE HELP OF  DRAWER = createDrawerNavigator()
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
export default function RootNavigator(props) {
  const ProjectDrawer = () => {
    return (
      <Drawer.Navigator
        initialRouteName="Home"
        drawerContent={props => <CustomDrawerContent {...props} />}>
        <Drawer.Screen
          name="Home"
          component={Home}
          options={{
            headerShown: false,

            drawerIcon: () => <MCI name={'home-city'} size={24} />,
          }}
        />
      </Drawer.Navigator>
    );
  };

  function CustomDrawerContent(props) {
    return (
      <DrawerContentScrollView {...props}>
        <View
          style={{padding: 20, alignItems: 'center', flexDirection: 'column'}}>
          <Image
            style={{
              marginBottom: 5,
              borderRadius: 50,
              resizeMode: 'contain',
              width: 100,
              height: 100,
            }}
            source={require('../../assets/alice.jpg')}
          />
          <Text style={{fontWeight: 'bold'}}>{'Alice Kumari'}</Text>
          <Text>+91 9301123085</Text>
          <Text style={{fontSize: 12}}>{'ss@gmail.com'}</Text>
        </View>

        <DrawerItemList {...props} />
        <DrawerItem
          label="My Profile"
          onPress={() => alert('hi')}
          icon={() => <MCI name={'account-box'} size={24} />}
        />
        <DrawerItem
          label="Settings"
          icon={() => <MCI name={'account-settings'} size={24} />}
        />

        <DrawerItem
          label="Logout"
          icon={() => <MCI name={'logout'} size={24} />}
        />
      </DrawerContentScrollView>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={'Mainscreen'}>
        <Stack.Screen
          name="Mainscreen"
          component={ProjectDrawer}
          options={{header: AppHeader}}
        />
        <Stack.Screen
          component={ProductDetails}
          name={'productdetails'}
          options={{headerShown: false}}
        />
        <Stack.Screen
          component={Cart}
          name={'cart'}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
