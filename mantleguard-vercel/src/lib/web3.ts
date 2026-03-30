// mantleguard-vercel/src/lib/web3.ts
import { BrowserProvider } from "ethers";

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

// 🔥 FINAL MULTI-WALLET FIX (MetaMask + Rabby + OKX + Phantom)
function getInjectedProvider(): any {
  if (typeof window === "undefined" || !window.ethereum) return null;

  let eth = window.ethereum as any;

  // 1. Prefer MetaMask if it exists
  if (eth.isMetaMask === true) return eth;

  // 2. Multiple providers array (most common with many extensions)
  if (Array.isArray(eth.providers) && eth.providers.length > 0) {
    const metaMask = eth.providers.find((p: any) => p.isMetaMask === true);
    if (metaMask) return metaMask;
    return eth.providers[0];
  }

  // 3. Fallback for other injection styles
  if (eth.providers && typeof eth.providers === "object") {
    const metaMask = Object.values(eth.providers).find((p: any) => (p as any).isMetaMask === true);
    if (metaMask) return metaMask;
    return Object.values(eth.providers)[0];
  }

  return eth;
}

function setGlobalProvider() {
  const provider = getInjectedProvider();
  if (provider) (window as any).ethereum = provider;
  return provider;
}

export async function connectWallet(): Promise<string> {
  const provider = setGlobalProvider();
  if (!provider) {
    throw new Error("No Web3 wallet detected. Please install MetaMask or another EVM wallet.");
  }

  try {
    // Direct request (most reliable with Rabby/OKX)
    const accounts: string[] = await provider.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found.");
    }
    return accounts[0];
  } catch (err: any) {
    console.error("Me: Unexpected error", err);

    if (err.code === 4001) throw new Error("Connection rejected by user.");
    if (err.code === -32002) throw new Error("Wallet is already processing a request. Please wait.");
    throw new Error(err.message || "Failed to connect wallet");
  }
}

export async function getCurrentAccount(): Promise<string | null> {
  const provider = getInjectedProvider();
  if (!provider) return null;
  try {
    const ethersProvider = new BrowserProvider(provider);
    const accounts = await ethersProvider.listAccounts();
    return accounts.length > 0 ? accounts[0].address : null;
  } catch {
    return null;
  }
}

export async function getChainId(): Promise<string> {
  const provider = getInjectedProvider();
  if (!provider) return "";
  try {
    const ethersProvider = new BrowserProvider(provider);
    const network = await ethersProvider.getNetwork();
    return "0x" + network.chainId.toString(16);
  } catch {
    return "";
  }
}

export async function switchToMantle(): Promise<void> {
  const provider = getInjectedProvider();
  if (!provider) throw new Error("No wallet detected.");
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: MANTLE_MAINNET.chainId }],
    });
  } catch (err: any) {
    if (err.code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: MANTLE_MAINNET.chainId,
          chainName: MANTLE_MAINNET.chainName,
          rpcUrls: MANTLE_MAINNET.rpcUrls,
          nativeCurrency: MANTLE_MAINNET.nativeCurrency,
          blockExplorerUrls: MANTLE_MAINNET.blockExplorerUrls,
        }],
      });
    } else {
      throw err;
    }
  }
}

export function isMantle(chainId: string): boolean {
  return chainId === MANTLE_MAINNET.chainId || chainId === MANTLE_TESTNET.chainId;
}
