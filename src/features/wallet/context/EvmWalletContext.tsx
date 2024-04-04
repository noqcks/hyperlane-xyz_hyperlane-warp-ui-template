import { RainbowKitProvider, connectorsForWallets, lightTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import {
  argentWallet,
  coinbaseWallet,
  injectedWallet,
  ledgerWallet,
  metaMaskWallet,
  omniWallet,
  rainbowWallet,
  trustWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { PropsWithChildren, useMemo } from 'react';
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';

import { ProtocolType } from '@hyperlane-xyz/utils';

import { APP_NAME } from '../../../consts/app';
import { config } from '../../../consts/config';
import { getWarpCore } from '../../../context/context';
import { Color } from '../../../styles/Color';
import { getWagmiChainConfig } from '../../chains/metadata';
import { tryGetChainMetadata } from '../../chains/utils';

const { chains, publicClient } = configureChains(getWagmiChainConfig(), [publicProvider()]);

const connectorConfig = {
  chains,
  publicClient,
  appName: APP_NAME,
  projectId: config.walletConnectProjectId,
};

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({chains}),
      injectedWallet({chains}),
      walletConnectWallet({chains}),
      ledgerWallet({chains}),
    ],
  },
  {
    groupName: 'More',
    wallets: [
      coinbaseWallet({appName: "RainbowKit App", chains}),
      omniWallet({chains}),
      rainbowWallet({chains}),
      trustWallet({chains}),
      argentWallet({chains}),
    ],
  },
], { appName: 'RainbowKit App', projectId: 'YOUR_PROJECT_ID' });

const wagmiConfig = createConfig({
  autoConnect: true,
  publicClient,
  connectors,
});

export function EvmWalletContext({ children }: PropsWithChildren<unknown>) {
  const initialChain = useMemo(() => {
    const tokens = getWarpCore().tokens;
    const firstEvmToken = tokens.filter((token) => token.protocol === ProtocolType.Ethereum)?.[0];
    return tryGetChainMetadata(firstEvmToken?.chainName)?.chainId as number;
  }, []);
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        theme={lightTheme({
          accentColor: Color.primaryBlue,
          borderRadius: 'small',
          fontStack: 'system',
        })}
        initialChain={initialChain}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
