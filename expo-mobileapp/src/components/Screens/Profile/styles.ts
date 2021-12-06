import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
	container:{
		display: 'flex',
		flex:1,
    	alignItems: 'center',
    	padding: 10
	},
	bodyWrapper:{
		flex:1,
		width: '100%',
		alignItems: 'center',
	},
	form:{
		width: '80%'
	},
	inputWrapper:{},
	saveBtnWrapper:{
		width:'80%',
		paddingHorizontal: 8, 
		marginTop: 32
	}
	
});

export default styles;
