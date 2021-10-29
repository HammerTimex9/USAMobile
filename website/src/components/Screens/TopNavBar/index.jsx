import { useMoralis } from "react-moralis";

import { Box, Stack, Typography } from "@mui/material";
import { ExpertButton } from "../../Bits/ExpertButton";

import { LightSwitch } from "../../Bits/LightSwitch";
import { AuthButton } from "../../Bits/AuthButton";
import { ProfileAvatar } from "../../Bits/ProfileAvatar";
import { AddNetworkButton } from '../../Scrapbox/AddNetworkButton';

// import { useColorMode } from '../../contexts/colorModeContext';

import "./styles.css";
import USAWalletEagleLogo from "../../../media/logos/USAWalletLogo.svg";

export const TopNavBar = (props) => {
	const { isAuthenticated } = useMoralis();
	// const { colorMode } = useColorMode();
	return (
		<Stack direction="row" sx={{ mt: 3, alignSelf:'center'}} spacing={1}>
			<Box
				component="img"
				sx={{
					mr: .5,
					mt: 1,
					width: 70,
				}}
				alt="USA Wallet Logo"
				src={USAWalletEagleLogo}
			/>
			<Typography className="BrandName">
				USA Wallet
			</Typography>
			{isAuthenticated && <ExpertButton />}
			{/* <NetworkSelect /> */}
			<LightSwitch />
			<AuthButton />
			{isAuthenticated && <ProfileAvatar />}
			{isAuthenticated && <AddNetworkButton />}
		</Stack>

	);
};