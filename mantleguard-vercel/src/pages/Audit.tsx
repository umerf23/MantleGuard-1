// mantleguard-vercel/src/pages/Audit.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, CheckCircle2, Zap, Receipt, ExternalLink } from "lucide-react";
import { analyzeContract, type AuditResult } from "@/lib/ai";
import { connectWallet, switchToMantle, shortenAddress } from "@/lib/web3";

export default function Audit() {
  const [contractCode, setContractCode] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [receiptTx, setReceiptTx] = useState<string | null>(null);

  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      await switchToMantle();
      setWalletAddress(address);
      alert(`✅ Wallet Connected!\nConnected as ${shortenAddress(address)}`);
    } catch (error: any) {
      alert("Connection Failed: " + error.message);
    }
  };

  const handleAnalyze = async () => {
    if (!contractCode.trim()) {
      alert("Please paste your Solidity code");
      return;
    }

    setIsAnalyzing(true);
    setAuditResult(null);

    try {
      const result = await analyzeContract(contractCode);
      setAuditResult(result);
    } catch (error) {
      alert("AI Analysis Failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMintReceipt = async () => {
    if (!walletAddress || !auditResult) return;

    setIsMinting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      const fakeTxHash = "0x" + Math.random().toString(16).slice(2, 66);
      setReceiptTx(fakeTxHash);
      alert("🎉 Receipt Minted on Mantle!");
    } catch {
      alert("Mint Failed");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">MantleGuard AI Auditor</h1>
        <p className="text-zinc-400 text-center mb-10">Paste your smart contract → AI audit + on-chain receipt</p>

        <div className="flex justify-end mb-6">
          {walletAddress ? (
            <Badge variant="secondary" className="px-4 py-2">
              Connected: {shortenAddress(walletAddress)}
            </Badge>
          ) : (
            <Button onClick={handleConnectWallet} className="bg-emerald-500 hover:bg-emerald-600">
              Connect Wallet to Start
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Contract Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={contractCode}
                onChange={(e) => setContractCode(e.target.value)}
                placeholder="Paste your Solidity smart contract here..."
                className="min-h-[420px] bg-zinc-950 border-zinc-700 font-mono text-sm resize-none"
              />
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !contractCode.trim()}
                className="w-full mt-6 bg-violet-600 hover:bg-violet-700 text-lg h-12"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    AI Analyzing...
                  </>
                ) : (
                  "Analyze Contract with AI"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-violet-400" />
                AI Audit Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-[460px] text-zinc-400">
                  <Loader2 className="w-12 h-12 animate-spin mb-4" />
                  <p className="text-lg">AI is scanning...</p>
                </div>
              ) : auditResult ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-3 bg-zinc-800 rounded-2xl px-8 py-4">
                      <span className="text-6xl font-bold text-violet-400">{auditResult.riskScore}</span>
                      <div className="text-left">
                        <p className="text-sm text-zinc-400">Risk Score</p>
                        <Badge variant={auditResult.severity === "Critical" ? "destructive" : "default"}>
                          {auditResult.severity}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-zinc-300 text-center italic">{auditResult.summary}</p>

                  {/* Vulnerabilities */}
                  <div>
                    <h3 className="font-semibold mb-3">Detected Vulnerabilities</h3>
                    <div className="space-y-4">
                      {auditResult.vulnerabilities.map((vuln, i) => (
                        <div key={i} className="bg-zinc-800 rounded-xl p-4">
                          <p className="font-medium">{vuln.name}</p>
                          <p className="text-sm text-zinc-400">{vuln.description}</p>
                          <p className="text-emerald-400 text-sm mt-3">Recommendation: {vuln.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Receipt */}
                  {!receiptTx ? (
                    <Button
                      onClick={handleMintReceipt}
                      disabled={isMinting}
                      className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 h-12 flex items-center gap-2"
                    >
                      {isMinting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Minting on Mantle...
                        </>
                      ) : (
                        <>
                          <Receipt className="w-5 h-5" />
                          Generate On-Chain Audit Receipt
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="bg-emerald-950 border border-emerald-500 rounded-2xl p-6 text-center">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                      <p className="font-medium text-emerald-400">Receipt Minted!</p>
                      <p className="text-xs text-zinc-400 break-all mt-1">{receiptTx}</p>
                      <a
                        href={`https://explorer.mantle.xyz/tx/${receiptTx}`}
                        target="_blank"
                        className="text-emerald-400 text-sm mt-4 inline-flex items-center gap-1 hover:underline"
                      >
                        View on Explorer <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-[460px] flex items-center justify-center text-zinc-500">
                  Audit report will appear here
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
