import { analyzeContract, type AuditResult } from '@/lib/ai';
import { useState } from 'react';
import { useState } from "react";
import {
  Shield,// mantleguard-vercel/src/pages/Audit.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import { analyzeContract, type AuditResult } from "@/lib/ai";
import { connectWallet, switchToMantle, shortenAddress } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";

export default function Audit() {
  const [contractCode, setContractCode] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      await switchToMantle();
      setWalletAddress(address);
      toast({ title: "Wallet Connected", description: `Connected as ${shortenAddress(address)}` });
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">MantleGuard AI Auditor</h1>
        <p className="text-zinc-400 text-center mb-10">Paste your smart contract → Get instant AI-powered security audit</p>

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

                  {/* Summary */}
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

                  <Button className="w-full mt-4" variant="outline">
                    Generate On-Chain Audit Receipt (Coming in next update)
                  </Button>
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
  ArrowLeft,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Zap,
  ExternalLink,
  Copy,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  XCircle,
  Search,
  Link2,
  Blocks,
} from "lucide-react";
import { Link } from "wouter";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { runAiAudit, type AuditReport, type Severity, AUDIT_STEPS } from "@/lib/aiAudit";
import { fetchContractFromExplorer, getExplorerLink } from "@/lib/mantleExplorer";
import { publishAuditToMantle, type OnChainReceipt } from "@/lib/onChain";
import { useToast } from "@/hooks/use-toast";

const SAMPLE_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleVault is Ownable {
    mapping(address => uint256) public balances;
    
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    
    constructor() Ownable(msg.sender) {}
    
    function deposit() external payable {
        require(msg.value > 0, "Must send MNT");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        
        // WARNING: Potential reentrancy - state updated before call but using low-level call
        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawal(msg.sender, amount);
    }
    
    function emergencyWithdraw() external onlyOwner {
        selfdestruct(payable(owner()));
    }
    
    // Using tx.origin for auth check - BAD PRACTICE
    function adminAction() external {
        require(tx.origin == owner(), "Not authorized");
    }
    
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}`;

const severityConfig: Record<Severity, { color: string; bg: string; icon: any; label: string }> = {
  CRITICAL: { color: "text-red-400", bg: "bg-risk-high", icon: XCircle, label: "CRITICAL" },
  HIGH:     { color: "text-orange-400", bg: "bg-risk-high", icon: AlertTriangle, label: "HIGH" },
  MEDIUM:   { color: "text-yellow-400", bg: "bg-risk-medium", icon: AlertTriangle, label: "MEDIUM" },
  LOW:      { color: "text-green-400", bg: "bg-risk-low", icon: Info, label: "LOW" },
  INFO:     { color: "text-blue-400", bg: "bg-risk-info", icon: Info, label: "INFO" },
};

const riskConfig = {
  CRITICAL: { color: "text-red-400",     bg: "bg-red-500/10 border-red-500/40",         label: "CRITICAL RISK" },
  HIGH:     { color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/40",   label: "HIGH RISK" },
  MEDIUM:   { color: "text-yellow-400",  bg: "bg-yellow-500/10 border-yellow-500/40",   label: "MEDIUM RISK" },
  LOW:      { color: "text-green-400",   bg: "bg-green-500/10 border-green-500/40",     label: "LOW RISK" },
  SAFE:     { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/40", label: "SAFE" },
};

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 90 ? "#10b981"
    : score >= 70 ? "#22c55e"
    : score >= 50 ? "#eab308"
    : score >= 30 ? "#f97316"
    : "#ef4444";

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <circle
          cx="64" cy="64" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground">{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function FindingCard({ finding }: { finding: any }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = severityConfig[finding.severity as Severity];
  const Icon = cfg.icon;

  return (
    <div className={`rounded-xl border p-4 ${cfg.bg}`}>
      <button className="w-full text-left" onClick={() => setExpanded(!expanded)}
        data-testid={`button-finding-${finding.id}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Icon className={`w-5 h-5 flex-shrink-0 ${cfg.color}`} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-mono font-bold ${cfg.color}`}>{finding.id}</span>
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${cfg.color} border border-current border-opacity-40`}>
                  {cfg.label}
                </span>
              </div>
              <p className="font-semibold text-foreground text-sm mt-0.5">{finding.title}</p>
            </div>
          </div>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
        </div>
      </button>
      {expanded && (
        <div className="mt-4 space-y-3 pl-8">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-foreground/90">{finding.description}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Recommendation</p>
            <p className="text-sm text-foreground/90">{finding.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Audit() {
  const wallet = useWallet();
  const { toast } = useToast();
  const [mode, setMode] = useState<"code" | "address">("code");
  const [code, setCode] = useState(SAMPLE_CONTRACT);
  const [contractAddress, setContractAddress] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [onChainReceipt, setOnChainReceipt] = useState<OnChainReceipt | null>(null);

  const handleFetchContract = async () => {
    if (!contractAddress || !contractAddress.startsWith("0x")) {
      toast({ title: "Invalid address", description: "Enter a valid 0x... contract address.", variant: "destructive" });
      return;
    }
    setIsFetching(true);
    try {
      const info = await fetchContractFromExplorer(contractAddress);
      if (info && info.sourceCode) {
        setCode(info.sourceCode);
        setMode("code");
        toast({ title: "Contract fetched!", description: `Loaded ${info.name} from Mantle Explorer.` });
      } else {
        toast({
          title: "Contract not found or unverified",
          description: "Only verified contracts can be fetched. Paste the code manually.",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Fetch failed", description: "Could not reach Mantle Explorer.", variant: "destructive" });
    } finally {
      setIsFetching(false);
    }
  };

  const handleAudit = async () => {
    if (!code.trim()) {
      toast({ title: "No code to audit", description: "Paste your Solidity code or load a contract.", variant: "destructive" });
      return;
    }
    if (!wallet.account) {
      toast({ title: "Wallet not connected", description: "Connect your wallet to run an audit.", variant: "destructive" });
      return;
    }
    setIsAuditing(true);
    setAuditStep(0);
    setReport(null);
    setOnChainReceipt(null);
    try {
      const result = await runAiAudit(
        code,
        mode === "address" ? contractAddress : undefined,
        (stepIndex) => setAuditStep(stepIndex)
      );
      setReport(result);
      toast({
        title: result.aiPowered ? "AI Audit complete!" : "Audit complete!",
        description: `${result.findings.length} issues found. Score: ${result.score}/100`,
      });
    } catch (err: any) {
      toast({ title: "Audit failed", description: err.message, variant: "destructive" });
    } finally {
      setIsAuditing(false);
      setAuditStep(0);
    }
  };

  const handlePublishToMantle = async () => {
    if (!report) return;

    if (!wallet.account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    // Auto-switch to Mantle if on wrong network
    if (!wallet.isMantle) {
      toast({
        title: "Switching to Mantle...",
        description: "MetaMask will ask you to switch network. Please approve.",
      });
      try {
        await wallet.switchNetwork();
      } catch {
        toast({
          title: "Network switch failed",
          description: "Please manually switch to Mantle Mainnet in MetaMask, then click Publish again.",
          variant: "destructive",
        });
        return;
      }
      // Small delay to let wallet state settle
      await new Promise((r) => setTimeout(r, 800));
    }

    setIsPublishing(true);
    try {
      toast({
        title: "Check MetaMask",
        description: "A transaction confirmation popup should appear in MetaMask. Approve it to publish on-chain.",
      });
      const receipt = await publishAuditToMantle({
        contractName: report.contractName,
        auditHash: report.auditHash,
        score: report.score,
        riskLevel: report.overallRisk,
      });
      setOnChainReceipt(receipt);
      toast({
        title: "Published to Mantle!",
        description: `Block #${receipt.blockNumber} — Your audit is permanently on-chain.`,
      });
    } catch (err: any) {
      const msg: string = err?.message || "Transaction failed";
      toast({
        title: "Publish failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
  };

  const rc = report ? riskConfig[report.overallRisk] : null;

  return (
    <div className="min-h-screen bg-background grid-bg">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </Link>
              <div className="w-px h-5 bg-border" />
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="font-bold text-foreground">
                  Mantle<span className="text-primary">Guard</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {wallet.account && !wallet.isMantle && (
                <Button
                  variant="outline" size="sm"
                  className="border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10"
                  onClick={wallet.switchNetwork}
                  data-testid="button-switch-network-audit"
                >
                  <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                  Switch to Mantle
                </Button>
              )}
              {wallet.account ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="w-2 h-2 rounded-full bg-primary pulse-green" />
                  <span className="text-sm font-mono text-primary" data-testid="text-wallet-address-audit">
                    {wallet.shortAddress}
                  </span>
                  {wallet.isMantle && (
                    <span className="text-xs text-primary/60 ml-1">• Mantle</span>
                  )}
                </div>
              ) : (
                <Button size="sm" onClick={wallet.connect} className="bg-primary text-primary-foreground"
                  data-testid="button-connect-audit-nav">
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Smart Contract Auditor</h1>
          <p className="text-muted-foreground">
            Submit Solidity code for AI security analysis, then publish the audit permanently to Mantle
          </p>
        </div>

        {!wallet.account && (
          <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-400">
                {wallet.walletAvailable ? "Wallet not connected" : "No wallet detected"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {wallet.walletAvailable
                  ? "Connect your wallet to Mantle network to run audits and publish on-chain"
                  : "Please install MetaMask to use MantleGuard"}
              </p>
              {wallet.error && (
                <p className="text-xs text-destructive mt-1">{wallet.error}</p>
              )}
            </div>
            {wallet.walletAvailable ? (
              <Button
                size="sm"
                onClick={wallet.connect}
                disabled={wallet.isConnecting}
                className="bg-primary text-primary-foreground"
                data-testid="button-connect-banner"
              >
                {wallet.isConnecting ? "Connecting..." : "Connect"}
              </Button>
            ) : (
              <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="border-primary/50 text-primary">
                  Install MetaMask
                </Button>
              </a>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── LEFT: Input Panel ── */}
          <div className="space-y-6">
            {/* Mode Toggle */}
            <div className="flex gap-2">
              {(["code", "address"] as const).map((m) => (
                <button key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors border ${
                    mode === m
                      ? "bg-primary/10 border-primary/40 text-primary"
                      : "bg-card border-border text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`button-mode-${m}`}>
                  {m === "code" ? "Paste Code" : "Contract Address"}
                </button>
              ))}
            </div>

            {/* Address Fetch */}
            {mode === "address" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Mantle Contract Address</label>
                <div className="flex gap-2">
                  <input
                    type="text" value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    placeholder="0x1234...abcd"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground font-mono text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
                    data-testid="input-contract-address"
                  />
                  <Button variant="outline" onClick={handleFetchContract} disabled={isFetching}
                    className="border-border hover:border-primary/40"
                    data-testid="button-fetch-contract">
                    {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Only verified contracts on{" "}
                  <a href="https://explorer.mantle.xyz" target="_blank" rel="noopener noreferrer"
                    className="text-primary hover:underline">
                    Mantle Explorer
                  </a>{" "}
                  can be fetched automatically.
                </p>
              </div>
            )}

            {/* Code Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Solidity Code</label>
                <button onClick={() => setCode(SAMPLE_CONTRACT)}
                  className="text-xs text-primary hover:underline"
                  data-testid="button-load-sample">
                  Load sample
                </button>
              </div>
              <textarea
                value={code} onChange={(e) => setCode(e.target.value)}
                rows={22}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground font-mono text-xs resize-none focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 leading-relaxed"
                placeholder="// Paste your Solidity contract here..."
                data-testid="textarea-contract-code"
              />
            </div>

            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold"
              onClick={handleAudit}
              disabled={isAuditing || !wallet.account}
              data-testid="button-run-audit"
            >
              {isAuditing ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Analyzing contract...</>
              ) : (
                <><Shield className="w-5 h-5 mr-2" />Run AI Security Audit</>
              )}
            </Button>

            {/* Mantle Network Info */}
            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${wallet.isMantle ? "bg-primary pulse-green" : "bg-muted-foreground"}`} />
                <span className="text-sm font-semibold text-foreground">
                  Mantle Network {wallet.isMantle ? "(Connected)" : "(Not connected)"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>Chain ID: 5000</span>
                <span>Gas Token: MNT</span>
                <span>Finality: ~2s</span>
                <span>EVM Compatible: Yes</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Results Panel ── */}
          <div className="space-y-6">
            {isAuditing && (
              <div className="rounded-xl bg-card border border-primary/20 p-6 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative flex-shrink-0">
                    <Shield className="w-8 h-8 text-primary/40" />
                    <Loader2 className="w-4 h-4 text-primary animate-spin absolute -bottom-0.5 -right-0.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">AI Security Analysis Running</p>
                    <p className="text-xs text-primary">GPT-4o is auditing your contract...</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {AUDIT_STEPS.map((step, i) => {
                    const isDone = i < auditStep;
                    const isActive = i === auditStep;
                    return (
                      <div key={i} className={`flex items-start gap-3 transition-opacity duration-300 ${i > auditStep ? "opacity-30" : "opacity-100"}`}>
                        <div className="flex-shrink-0 mt-0.5">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          ) : isActive ? (
                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-border" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium ${isActive ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.label}
                          </p>
                          {isActive && (
                            <p className="text-xs text-muted-foreground mt-0.5">{step.detail}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${((auditStep + 1) / AUDIT_STEPS.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {!report && !isAuditing && (
              <div className="flex flex-col items-center justify-center h-64 rounded-xl bg-card border border-dashed border-border space-y-3">
                <Shield className="w-12 h-12 text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm">Audit results will appear here</p>
              </div>
            )}

            {report && !isAuditing && (
              <div className="space-y-5">
                {/* Score Card */}
                <div className={`p-6 rounded-xl border ${rc?.bg}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-foreground">{report.contractName}</h3>
                        {report.aiPowered && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold">
                            <Zap className="w-3 h-3" />GPT-4o
                          </span>
                        )}
                      </div>
                      {report.contractAddress && (
                        <a href={getExplorerLink(report.contractAddress)} target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5">
                          {report.contractAddress.slice(0, 10)}...
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <span className={`text-2xl font-bold ${rc?.color}`}>{rc?.label}</span>
                  </div>

                  <ScoreRing score={report.score} />

                  <p className="text-sm text-foreground/80 mt-4 text-center leading-relaxed">
                    {report.summary}
                  </p>

                  {/* Audit Hash */}
                  <div className="mt-4 p-3 rounded-lg bg-background/40 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground font-semibold">AUDIT FINGERPRINT</span>
                      <button onClick={() => copyText(report.auditHash, "Audit hash")}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        data-testid="button-copy-hash">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs font-mono text-primary break-all">{report.auditHash}</p>
                  </div>
                </div>

                {/* ── ON-CHAIN PUBLISH SECTION ── */}
                <div className="rounded-xl border border-primary/30 bg-primary/5 overflow-hidden">
                  <div className="p-4 border-b border-primary/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Blocks className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold text-foreground">Publish Audit to Mantle Blockchain</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Store the audit hash, score, and risk level permanently on Mantle. Anyone can verify your audit
                      via the transaction hash on Mantle Explorer. Costs a tiny amount of MNT for gas.
                    </p>
                  </div>

                  <div className="p-4">
                    {!onChainReceipt ? (
                      <>
                        {!wallet.account ? (
                          <Button className="w-full bg-primary text-primary-foreground" onClick={wallet.connect}
                            data-testid="button-connect-publish">
                            Connect Wallet to Publish
                          </Button>
                        ) : !wallet.isMantle ? (
                          <Button className="w-full border-yellow-500/40 text-yellow-400" variant="outline"
                            onClick={wallet.switchNetwork}
                            data-testid="button-switch-publish">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Switch to Mantle to Publish
                          </Button>
                        ) : (
                          <Button
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                            onClick={handlePublishToMantle}
                            disabled={isPublishing}
                            data-testid="button-publish-onchain"
                          >
                            {isPublishing ? (
                              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Waiting for confirmation...</>
                            ) : (
                              <><Link2 className="w-4 h-4 mr-2" />Publish to Mantle</>
                            )}
                          </Button>
                        )}

                        {/* What gets stored */}
                        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                          {[
                            { label: "Contract Name", value: report.contractName },
                            { label: "Security Score", value: `${report.score}/100` },
                            { label: "Risk Level", value: report.overallRisk },
                          ].map((item) => (
                            <div key={item.label} className="p-2 rounded-lg bg-background/40 border border-border">
                              <div className="text-sm font-bold text-primary">{item.value}</div>
                              <div className="text-[10px] text-muted-foreground">{item.label}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      /* On-chain receipt */
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          <span className="font-semibold text-emerald-400">Audit published on Mantle!</span>
                        </div>

                        <div className="space-y-2">
                          <div className="p-3 rounded-lg bg-background/60 border border-emerald-500/20">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground font-semibold">TRANSACTION HASH</span>
                              <button onClick={() => copyText(onChainReceipt.txHash, "Transaction hash")}
                                className="text-muted-foreground hover:text-primary transition-colors"
                                data-testid="button-copy-txhash">
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-xs font-mono text-emerald-400 break-all">{onChainReceipt.txHash}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 rounded-lg bg-background/40 border border-border text-center">
                              <div className="text-sm font-bold text-foreground">#{onChainReceipt.blockNumber}</div>
                              <div className="text-[10px] text-muted-foreground">Block Number</div>
                            </div>
                            <div className="p-3 rounded-lg bg-background/40 border border-border text-center">
                              <div className="text-sm font-bold text-foreground">Mantle</div>
                              <div className="text-[10px] text-muted-foreground">Network</div>
                            </div>
                          </div>

                          <a
                            href={onChainReceipt.explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-primary/30 text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
                            data-testid="link-view-on-explorer"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View on Mantle Explorer
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Finding Counts */}
                <div className="grid grid-cols-5 gap-2">
                  {(["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"] as Severity[]).map((sev) => {
                    const count = report.findings.filter((f) => f.severity === sev).length;
                    const cfg = severityConfig[sev];
                    return (
                      <div key={sev} className={`p-2 rounded-lg border text-center ${cfg.bg}`}>
                        <div className={`text-lg font-bold ${cfg.color}`}>{count}</div>
                        <div className={`text-[10px] font-semibold ${cfg.color}`}>{sev}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Findings */}
                {report.findings.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      Security Findings
                    </h4>
                    {report.findings.map((finding) => <FindingCard key={finding.id} finding={finding} />)}
                  </div>
                )}

                {report.findings.length === 0 && (
                  <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                    <p className="font-semibold text-emerald-400">No vulnerabilities detected!</p>
                    <p className="text-sm text-muted-foreground mt-1">This contract passed all security checks.</p>
                  </div>
                )}

                {/* Gas Optimizations */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Gas Optimizations
                  </h4>
                  <div className="p-4 rounded-xl bg-card border border-border space-y-2">
                    {report.gasOptimizations.map((opt, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mantle Compatibility */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Mantle Compatibility
                  </h4>
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm font-semibold text-primary">EVM Compatible — Ready for Mantle deployment</span>
                    </div>
                    {report.mantleCompatibility.notes.map((note, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 flex-shrink-0" />
                        {note}
                      </div>
                    ))}
                  </div>
                </div>

                {/* New Audit */}
                <Button variant="outline" className="w-full border-border hover:border-primary/40"
                  onClick={() => { setReport(null); setOnChainReceipt(null); }}
                  data-testid="button-new-audit">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Run New Audit
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
