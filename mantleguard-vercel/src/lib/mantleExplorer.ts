const MANTLE_EXPLORER_API = "https://explorer.mantle.xyz/api";

export interface ContractInfo {
  address: string;
  name: string;
  sourceCode: string;
  abi: string;
  compilerVersion: string;
  isVerified: boolean;
}

export async function fetchContractFromExplorer(
  address: string
): Promise<ContractInfo | null> {
  try {
    const url = `${MANTLE_EXPLORER_API}?module=contract&action=getsourcecode&address=${address}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "1" && data.result && data.result.length > 0) {
      const result = data.result[0];
      return {
        address,
        name: result.ContractName || "Unknown",
        sourceCode: result.SourceCode || "",
        abi: result.ABI || "",
        compilerVersion: result.CompilerVersion || "",
        isVerified: result.SourceCode !== "",
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function getExplorerLink(address: string, type: "address" | "tx" = "address"): string {
  return `https://explorer.mantle.xyz/${type}/${address}`;
}
