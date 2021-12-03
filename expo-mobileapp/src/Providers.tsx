import React from "react";
import { Platform } from "react-native";
import { MoralisProvider } from "react-moralis";
import Moralis from "moralis/react-native.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { enableViaWalletConnect } from "./Moralis/enableViaWalletConnect";
import WalletConnectProvider, {
  WalletConnectProviderProps,
} from "./WalletConnect";
import { expo } from "../app.json";
import { MoralisDappProvider } from "./providers/MoralisDappProvider/MoralisDappProvider";
import {
  REACT_APP_MORALIS_APPLICATION_ID,
  REACT_APP_MORALIS_SERVER_URL,
} from "@env";

interface ProvidersProps {
  readonly children: JSX.Element;
}

const { slug } = expo;

/**
 * Initialization of Moralis
 */
const appId = REACT_APP_MORALIS_APPLICATION_ID;
const serverUrl = REACT_APP_MORALIS_SERVER_URL;
const environment = "native";

// Initialize Moralis with AsyncStorage to support react-native storage
Moralis.setAsyncStorage(AsyncStorage);
// @ts-ignore
Moralis.enable = enableViaWalletConnect;

const walletConnectOptions: WalletConnectProviderProps = {
  redirectUrl: Platform.OS === "web" ? window.location.origin : `${slug}://`,
  storageOptions: {
    // @ts-ignore
    asyncStorage: AsyncStorage,
  },
  qrcodeModalOptions: {
    mobileLinks: ["metamask"],
  }
};

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <WalletConnectProvider {...walletConnectOptions}>
      <MoralisProvider
        appId={appId}
        serverUrl={serverUrl}
        environment={environment}>
        <MoralisDappProvider>
            {children}
        </MoralisDappProvider>
      </MoralisProvider>
    </WalletConnectProvider>
  );
};
