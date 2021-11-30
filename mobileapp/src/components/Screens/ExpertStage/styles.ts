import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
	container:{},
	expertCardWrapper:{
		display: 'flex',
		flexDirection:'row',
		alignItems: 'flex-start',
		justifyContent: 'center',
		height: 150,
		borderWidth:1,
		borderRadius:10,
		padding:8
	},
	textWrapper:{
		flex: 2,
		height:'100%',
		justifyContent: 'center'
	},
	iconWrapper:{
		flex: 1,
		height:'100%',
		paddingRight:8,
		justifyContent: 'center',
		alignItems: 'flex-end'
	},
	icon:{
		width:100,
		height: 100
	}
});

export default styles;
