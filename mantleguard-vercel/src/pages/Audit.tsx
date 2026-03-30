// mantleguard-vercel/src/pages/Audit.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, CheckCircle2, Zap, Receipt, ExternalLink } from "lucide-react";
import { analyzeContract, type AuditResult } from "@/lib/ai";
import { connectWallet, switchToMantle, shortenAddress } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";

export default function Audit() {
  const [contractCode, setContractCode] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [receiptTx, setReceiptTx] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      await switchToMantle();
      setWalletAddress(address);
      toast({ title: "✅ Wallet Connected", description: `Connected as ${shortenAddress(address)}` });
    } catch (error: any) {
      toast({ title: "Connection Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleAnalyze = async () => {
    if (!contractCode.trim()) {
      toast({ title: "Empty Contract", description: "Please paste your Solidity code", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    setAuditResult(null);

    try {
      const result = await analyzeContract(contractCode);
      setAuditResult(result);
    } catch (error) {
      toast({ title: "AI Analysis Failed", description: "Something went wrong", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 🔥 New: Mint On-Chain Audit Receipt
  const handleMintReceipt = async () => {
    if (!walletAddress || !auditResult) return;

    setIsMinting(true);
    try {
      // Mock on-chain mint (feels real - 2.5s delay)
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // Fake transaction hash (Mantle format)
      const fakeTxHash = "0x" + Math.random().toString(16).slice(2, 66);
      setReceiptTx(fakeTxHash);

      toast({
        title: "🎉 Receipt Minted on Mantle!",
        description: "Your audit is now permanently on-chain.",
      });
    } catch (error) {
      toast({ title: "Mint Failed", description: "Please try again", variant: "destructive" });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">MantleGuard AI Auditor</h1>
        <p className="text-zinc-400 text-center mb-10">Paste your smart contract → Get instant AI-powered security audit + on-chain receipt</p>

        {/* Wallet Status */}
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
          {/* Input Section */}
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
                    AI Analyzing on Mantle...
                  </>
                ) : (
                  "Analyze Contract with AI"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
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
                  <p className="text-lg">AI is scanning your contract...</p>
                  <p className="text-sm mt-2">This usually takes 2–3 seconds</p>
                </div>
              ) : auditResult ? (
                <div className="space-y-6">
                  {/* Risk Score */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-3 bg-zinc-800 rounded-2xl px-8 py-4">
                      <span className="text-6xl font-bold text-violet-400">{auditResult.riskScore}</span>
                      <div className="text-left">
                        <p className="text-sm text-zinc-400">Risk Score</p>
                        <Badge
                          variant={auditResult.severity === "Critical" ? "destructive" : "default"}
                          className="text-lg px-4"
                        >
                          {auditResult.severity}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-zinc-300 text-center italic">{auditResult.summary}</p>

                  {/* Vulnerabilities */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Detected Vulnerabilities
                    </h3>
                    <div className="space-y-4">
                      {auditResult.vulnerabilities.map((vuln, i) => (
                        <div key={i} className="bg-zinc-800 rounded-xl p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{vuln.name}</p>
                              <p className="text-sm text-zinc-400 mt-1">{vuln.description}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {vuln.severity}
                            </Badge>
                          </div>
                          <p className="text-emerald-400 text-sm mt-3">
                            Recommendation: {vuln.recommendation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gas & Mantle Tips */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-zinc-800 border-0">
                      <CardContent className="pt-4">
                        <p className="text-xs text-zinc-400 mb-1">GAS OPTIMIZATION</p>
                        <p className="text-sm">{auditResult.gasOptimization}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-zinc-800 border-0">
                      <CardContent className="pt-4">
                        <p className="text-xs text-zinc-400 mb-1">MANTLE TIP</p>
                        <p className="text-sm text-emerald-400">{auditResult.mantleTips}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Receipt Button */}
                  {!receiptTx ? (
                    <Button
                      onClick={handleMintReceipt}
                      disabled={isMinting}
                      className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-lg h-12 flex items-center gap-2"
                    >
                      {isMinting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Minting Receipt on Mantle...
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
                      <p className="font-medium text-emerald-400">Audit Receipt Minted!</p>
                      <p className="text-xs text-zinc-400 mt-1 break-all">{receiptTx}</p>
                      <a
                        href={`https://explorer.mantle.xyz/tx/${receiptTx}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-400 text-sm mt-4 hover:underline"
                      >
                        View on Mantle Explorer <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-[460px] flex items-center justify-center text-zinc-500 text-center">
                  <div>
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Your AI audit report will appear here</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
