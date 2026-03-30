import { ethers } from "ethers";
import { getEthersCompatibleProvider, MANTLE_MAINNET } from "./web3";

/**
 * MantleGuard Audit Registry
 *
 * Audit records are stored on Mantle by sending a transaction whose calldata
 * encodes the audit report.  The ABI matches a minimal AuditRegistry contract
 * so the record is both human-readable on Mantle Explorer and forward-compatible
 * with a future deployed registry contract.
 *
 * Function signature: recordAudit(string contractName, bytes32 auditHash, uint8 score, string riskLevel)
 */

export const MANTLEGUARD_REGISTRY_ADDRESS =
  "0x4d616E74e4Cd4b4b37Bc7e8B4e3D5f3a2c41f5e";

const REGISTRY_ABI = [
  "function recordAudit(string contractName, bytes32 auditHash, uint8 score, string riskLevel)",
];

export interface OnChainReceipt {
  txHash: string;
  blockNumber: number;
  from: string;
  explorerUrl: string;
  timestamp: number;
}

function friendlyTxError(err: any): string {
  const code = err?.code;
  const msg: string = (err?.message || err?.reason || "").toLowerCase();

  if (code === 4001 || msg.includes("user rejected") || msg.includes("denied")) {
    return "Transaction rejected. You cancelled the request in your wallet.";
  }
  if (code === -32002 || msg.includes("already pending")) {
    return "A wallet request is already pending. Open MetaMask and approve or reject it first.";
  }
  if (code === -32603 || msg.includes("internal")) {
    return "Wallet internal error. Make sure MetaMask is unlocked and on Mantle network, then try again.";
  }
  if (msg.includes("insufficient funds") || msg.includes("insufficient balance")) {
    return "Insufficient MNT balance for gas. Add some MNT to your wallet and try again.";
  }
  if (msg.includes("nonce") || msg.includes("replacement")) {
    return "Transaction nonce error. Try resetting your MetaMask account nonce in Settings → Advanced → Reset Account.";
  }
  if (msg.includes("network") || msg.includes("chain")) {
    return "Wrong network detected. Please switch to Mantle Mainnet in MetaMask and try again.";
  }
  if (msg.includes("gas")) {
    return "Gas estimation failed. The transaction may be invalid on the current network.";
  }
  return err?.message || "Transaction failed. Please try again.";
}

export async function publishAuditToMantle(params: {
  contractName: string;
  auditHash: string;
  score: number;
  riskLevel: string;
}): Promise<OnChainReceipt> {
  // Use the smart provider picker (respects multi-wallet environments)
  const rawProvider = getEthersCompatibleProvider();
  const provider = new ethers.BrowserProvider(rawProvider as any);

  // Verify we're on Mantle before attempting transaction
  const network = await provider.getNetwork().catch(() => null);
  if (!network) {
    throw new Error("Could not detect network. Make sure MetaMask is unlocked and connected.");
  }

  const chainId = Number(network.chainId);
  if (chainId !== 5000 && chainId !== 5003) {
    throw new Error(
      `Wrong network (chainId: ${chainId}). Please switch to Mantle Mainnet in MetaMask, then try again.`
    );
  }

  // Request signer — this is what triggers MetaMask confirmation popup
  let signer: ethers.Signer;
  try {
    signer = await provider.getSigner();
  } catch (err: any) {
    throw new Error(friendlyTxError(err));
  }

  // Encode calldata
  const iface = new ethers.Interface(REGISTRY_ABI);
  const hashBytes = params.auditHash.startsWith("0x")
    ? params.auditHash
    : "0x" + params.auditHash;

  // Pad/truncate to 32 bytes for bytes32
  const paddedHash = ethers.zeroPadBytes(
    ethers.getBytes(hashBytes.slice(0, 66)),
    32
  );

  let calldata: string;
  try {
    calldata = iface.encodeFunctionData("recordAudit", [
      params.contractName,
      paddedHash,
      params.score,
      params.riskLevel,
    ]);
  } catch (err: any) {
    throw new Error("Failed to encode transaction data: " + (err?.message || ""));
  }

  // Send transaction — this triggers MetaMask to show the confirmation dialog
  let tx: ethers.TransactionResponse;
  try {
    tx = await signer.sendTransaction({
      to: MANTLEGUARD_REGISTRY_ADDRESS,
      value: 0n,
      data: calldata,
      gasLimit: 150000n,
    });
  } catch (err: any) {
    throw new Error(friendlyTxError(err));
  }

  // Wait for confirmation
  let receipt: ethers.TransactionReceipt | null;
  try {
    receipt = await tx.wait(1);
  } catch (err: any) {
    throw new Error("Transaction was sent but failed to confirm: " + (err?.message || ""));
  }

  if (!receipt) {
    throw new Error("Transaction timed out waiting for confirmation.");
  }

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    from: receipt.from,
    explorerUrl: `${MANTLE_MAINNET.blockExplorerUrls[0]}/tx/${receipt.hash}`,
    timestamp: Date.now(),
  };
}

export async function getMantleNetwork(): Promise<{
  chainId: bigint;
  name: string;
  isMantle: boolean;
}> {
  const rawProvider = getEthersCompatibleProvider();
  const provider = new ethers.BrowserProvider(rawProvider as any);
  const network = await provider.getNetwork();
  const isMantle = network.chainId === 5000n || network.chainId === 5003n;
  return {
    chainId: network.chainId,
    name: isMantle ? "Mantle" : network.name,
    isMantle,
  };
}
