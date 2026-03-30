export const MANTLE_MAINNET = {
  chainId: "0x1388",
  chainIdDecimal: 5000,
  chainName: "Mantle",
  rpcUrls: ["https://rpc.mantle.xyz"],
  nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
  blockExplorerUrls: ["https://explorer.mantle.xyz"],
};

export const MANTLE_TESTNET = {
  chainId: "0x138B",
  chainIdDecimal: 5003,
  chainName: "Mantle Sepolia Testnet",
  rpcUrls: ["https://rpc.sepolia.mantle.xyz"],
  nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
  blockExplorerUrls: ["https://explorer.sepolia.mantle.xyz"],
};

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getProvider() {
  if (typeof window === "undefined") return null;

  // Support EIP-6963 multi-wallet — prefer MetaMask if multiple providers exist
  const eth = window.ethereum;
  if (!eth) return null;

  // If multiple providers, pick MetaMask
  if ((eth as any).providers?.length) {
    const mm = (eth as any).providers.find((p: any) => p.isMetaMask);
    return mm || (eth as any).providers[0];
  }

  return eth;
}

export function isWalletAvailable(): boolean {
  return !!getProvider();
}

function friendlyError(err: any): string {
  const code = err?.code;
  const msg: string = err?.message || "";

  if (code === 4001 || msg.toLowerCase().includes("user rejected")) {
    return "Connection rejected. Please approve the request in your wallet.";
  }
  if (code === -32002 || msg.toLowerCase().includes("already pending")) {
    return "A wallet request is already pending. Open MetaMask and approve or reject it first.";
  }
  if (code === -32603) {
    return "Wallet internal error. Try unlocking MetaMask, then connect again.";
  }
  if (code === 4902) {
    return "Mantle network not found in your wallet. It will be added automatically.";
  }
  if (msg.toLowerCase().includes("no ethereum")) {
    return "No Web3 wallet detected. Please install MetaMask.";
  }
  return msg || "Unknown wallet error. Please try again.";
}

export async function connectWallet(): Promise<string> {
  const provider = getProvider();
  if (!provider) {
    throw new Error(
      "No Web3 wallet detected. Please install MetaMask from metamask.io"
    );
  }

  try {
    const accounts: string[] = await provider.request({
      method: "eth_requestAccounts",
    });
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts returned from wallet.");
    }
    return accounts[0];
  } catch (err: any) {
    throw new Error(friendlyError(err));
  }
}

export async function getCurrentAccount(): Promise<string | null> {
  const provider = getProvider();
  if (!provider) return null;
  try {
    const accounts: string[] = await provider.request({
      method: "eth_accounts",
    });
    return accounts?.length > 0 ? accounts[0] : null;
  } catch {
    return null;
  }
}

export async function getChainId(): Promise<string> {
  const provider = getProvider();
  if (!provider) return "";
  try {
    return await provider.request({ method: "eth_chainId" });
  } catch {
    return "";
  }
}

export async function switchToMantle(): Promise<void> {
  const provider = getProvider();
  if (!provider) throw new Error("No wallet detected.");

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: MANTLE_MAINNET.chainId }],
    });
  } catch (err: any) {
    // 4902 = chain not added yet
    if (err?.code === 4902 || err?.code === -32603) {
      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: MANTLE_MAINNET.chainId,
              chainName: MANTLE_MAINNET.chainName,
              rpcUrls: MANTLE_MAINNET.rpcUrls,
              nativeCurrency: MANTLE_MAINNET.nativeCurrency,
              blockExplorerUrls: MANTLE_MAINNET.blockExplorerUrls,
            },
          ],
        });
      } catch (addErr: any) {
        throw new Error(friendlyError(addErr));
      }
    } else {
      throw new Error(friendlyError(err));
    }
  }
}

export function isMantle(chainId: string): boolean {
  return (
    chainId === MANTLE_MAINNET.chainId ||
    chainId === MANTLE_TESTNET.chainId
  );
}

/**
 * Returns an ethers-compatible provider using the correct wallet extension.
 * Use this instead of `new ethers.BrowserProvider(window.ethereum)` directly.
 */
export function getEthersCompatibleProvider(): NonNullable<Window["ethereum"]> {
  const provider = getProvider();
  if (!provider) throw new Error("No Web3 wallet detected. Please install MetaMask from metamask.io");
  return provider;
}

export function subscribeToWalletEvents(
  onAccountsChanged: (accounts: string[]) => void,
  onChainChanged: (chainId: string) => void
): () => void {
  const provider = getProvider();
  if (!provider) return () => {};

  provider.on("accountsChanged", onAccountsChanged);
  provider.on("chainChanged", onChainChanged);

  return () => {
    provider.removeListener?.("accountsChanged", onAccountsChanged);
    provider.removeListener?.("chainChanged", onChainChanged);
  };
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
      providers?: any[];
    };
  }
}
