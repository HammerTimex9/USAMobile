import React from 'react';
import { Button } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';


import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { HomeScreen } from '../components/Screens';
import { TabsNavigator } from './';


const Drawer = createDrawerNavigator();
const INITIAL_ROUTE_NAME = 'Home';

function CustomDrawerContent(props) {
	const navigation = useNavigation<NativeStackNavigationProp<{route: {} }>>();
	return (
		<DrawerContentScrollView {...props}>
			<DrawerItemList {...props} />
			<DrawerItem label="Logout" onPress={()=>{
					//@ts-ignore
					navigation.replace('Auth',{})
				}
			}/>
		</DrawerContentScrollView>
	);
}



const DrawerNavigator = () => {
	return (
		<Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
			<Drawer.Screen
				name="Home"
				component={TabsNavigator}
				options={{
					title: 'DashBoard',
					drawerIcon: ({ focused, size, color }) => (
						<Ionicons name="home" size={size} color={color} />
					)
				}}
			/>
			<Drawer.Screen
				name="Profile"
				component={HomeScreen}
				options={{
					title: 'Profile',
					drawerIcon: ({ focused, size, color }) => (
						<Ionicons name="person" size={size} color={color} />
					)
				}}
			/>
			<Drawer.Screen
				name="Change Password"
				component={HomeScreen}
				options={{
					title: 'Password',
					drawerIcon: ({ focused, size, color }) => (
						<Ionicons name="key" size={size} color={color} />
					)
				}}
			/>
		</Drawer.Navigator>
	);
}

export default DrawerNavigator;


