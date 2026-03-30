import { useState, useEffect, useCallback } from "react";
import {
  connectWallet,
  getCurrentAccount,
  getChainId,
  switchToMantle,
  isMantle,
  isWalletAvailable,
  shortenAddress,
  subscribeToWalletEvents,
  MANTLE_MAINNET,
} from "@/lib/web3";

export interface WalletState {
  account: string | null;
  shortAddress: string | null;
  chainId: string | null;
  isMantle: boolean;
  isConnecting: boolean;
  isSwitching: boolean;
  error: string | null;
  walletAvailable: boolean;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    account: null,
    shortAddress: null,
    chainId: null,
    isMantle: false,
    isConnecting: false,
    isSwitching: false,
    error: null,
    walletAvailable: isWalletAvailable(),
  });

  const refresh = useCallback(async () => {
    const account = await getCurrentAccount();
    const chainId = await getChainId();
    setState((prev) => ({
      ...prev,
      account,
      shortAddress: account ? shortenAddress(account) : null,
      chainId,
      isMantle: isMantle(chainId),
      walletAvailable: isWalletAvailable(),
      error: null,
    }));
  }, []);

  // Refresh on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Subscribe to wallet events
  useEffect(() => {
    const unsubscribe = subscribeToWalletEvents(
      (accounts) => {
        if (accounts.length === 0) {
          setState((prev) => ({
            ...prev,
            account: null,
            shortAddress: null,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            account: accounts[0],
            shortAddress: shortenAddress(accounts[0]),
            error: null,
          }));
        }
      },
      (_chainId) => {
        // chainChanged — refresh full state
        refresh();
      }
    );
    return unsubscribe;
  }, [refresh]);

  const connect = useCallback(async () => {
    if (!isWalletAvailable()) {
      setState((prev) => ({
        ...prev,
        error: "No Web3 wallet detected. Please install MetaMask from metamask.io",
      }));
      return;
    }
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));
    try {
      await connectWallet();
      await refresh();
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err.message || "Failed to connect wallet.",
      }));
    } finally {
      setState((prev) => ({ ...prev, isConnecting: false }));
    }
  }, [refresh]);

  const switchNetwork = useCallback(async () => {
    setState((prev) => ({ ...prev, isSwitching: true, error: null }));
    try {
      await switchToMantle();
      await refresh();
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err.message || "Failed to switch network.",
      }));
    } finally {
      setState((prev) => ({ ...prev, isSwitching: false }));
    }
  }, [refresh]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    connect,
    switchNetwork,
    clearError,
    mantleExplorerUrl: MANTLE_MAINNET.blockExplorerUrls[0],
  };
}
