import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMoralis } from "react-moralis";

import  AuthNavigator from './AuthNavigator';
import DrawerNavigator from './DrawerNavigator';
import  TabsNavigator from './TabsNavigator';

const Stack = createNativeStackNavigator();

// const AppNavigator = () => {

// 	return (
// 		<NavigationContainer>
// 			<Stack.Navigator screenOptions={{ headerShown: false }}>
// 				<Stack.Screen name="Auth" component={AuthNavigator} />
// 				<Stack.Screen name="Drawer" component={DrawerNavigator} />
// 			</Stack.Navigator>
// 		</NavigationContainer>
// 	)
// }

// export default AppNavigator;

const AppNavigator = () => {
	// const [isSignedIn, setSignedIn] = useState(false);
	const { isAuthenticated } = useMoralis();


	return (
		<NavigationContainer>
			<Stack.Navigator
				screenOptions={{
					headerShown: false
				}}>
				{
					isAuthenticated ? (
						<Stack.Screen name="Drawer" component={DrawerNavigator} />
					) : (
						<Stack.Screen name="Auth" component={AuthNavigator} />
					)
				}
			</Stack.Navigator>
		</NavigationContainer>
	)
}

export default AppNavigator;





