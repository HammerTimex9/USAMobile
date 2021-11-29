import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthNavigator, DrawerNavigator, TabsNavigator } from './';
const Stack = createNativeStackNavigator();

const AppNavigator = () => {

	return (
		<NavigationContainer>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				<Stack.Screen name="Auth" component={AuthNavigator} />
				<Stack.Screen name="Drawer" component={DrawerNavigator} />
			</Stack.Navigator>
		</NavigationContainer>
	)
}

export default AppNavigator;

// const AppNavigator = () => {
// 	const [isSignedIn, setSignedIn] = useState(false);

// 	return (
// 		<NavigationContainer>
// 			<Stack.Navigator
// 				screenOptions={{
// 					headerShown: false
// 				}}>
// 				{
// 					isSignedIn ? (
// 						<Stack.Screen name="Drawer" component={DrawerNavigator} />
// 					) : (
// 						<Stack.Screen name="Auth" component={AuthNavigator} />
// 					)
// 				}
// 			</Stack.Navigator>
// 		</NavigationContainer>
// 	)
// }

// export default AppNavigator;





