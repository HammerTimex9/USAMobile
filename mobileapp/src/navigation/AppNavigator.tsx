import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMoralis } from 'react-moralis';

import { AuthNavigator, DrawerNavigator, TabsNavigator } from './';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
	const [isSignedIn, setSignedIn] = useState(true);
	const { isAuthenticated } = useMoralis();
	useEffect(() => {
		if (isAuthenticated) {
			console.log('User Is Authenticated!');
		}else{
			console.log('User Is Not Authenticated');
		}
	}, [isAuthenticated]);

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





