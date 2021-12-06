import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useMoralis } from "react-moralis";

import { HomeScreen, ProfileScreen, ChangePasswordScreen } from '../components/Screens';
import { TabsNavigator } from './';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
	const { isAuthenticated, logout } = useMoralis();
	return (
		<DrawerContentScrollView {...props}>
			<DrawerItemList {...props} />
			<DrawerItem 
				label="Logout" 
				onPress={()=>{
					if(isAuthenticated){
						logout();
					}
				}}
				icon= {({ color, size }) => <Ionicons color={color} size={size} name={'log-out'} />}
			/>
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
					title: 'USA Wallet',
					drawerIcon: ({ size, color }) => (
						<Ionicons name="home" size={size} color={color} />
					)
				}}
			/>
			<Drawer.Screen
				name="Profile"
				component={ProfileScreen}
				options={{
					title: 'Profile',
					drawerIcon: ({ size, color }) => (
						<Ionicons name="person" size={size} color={color} />
					)
				}}
			/>
			<Drawer.Screen
				name="Change Password"
				component={ChangePasswordScreen}
				options={{
					title: 'Password',
					drawerIcon: ({ size, color }) => (
						<Ionicons name="key" size={size} color={color} />
					)
				}}
			/>
		</Drawer.Navigator>
	);
}

export default DrawerNavigator;


