import { Shield, Zap, Lock, Search, ChevronRight, ExternalLink, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { Link } from "wouter";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Shield,
    title: "AI-Powered Vulnerability Detection",
    description:
      "Advanced pattern recognition scans for reentrancy attacks, integer overflows, access control issues, and 20+ vulnerability classes.",
  },
  {
    icon: Zap,
    title: "Mantle Network Native",
    description:
      "Built exclusively for the Mantle ecosystem. Fetch verified contracts directly from Mantle Explorer and audit in seconds.",
  },
  {
    icon: Lock,
    title: "On-Chain Audit Receipt",
    description:
      "Every audit generates a unique cryptographic hash stored on-chain — a verifiable proof of your audit for your users.",
  },
  {
    icon: Search,
    title: "Gas Optimization Insights",
    description:
      "Beyond security, MantleGuard provides actionable gas optimization recommendations tailored for Mantle's L2 architecture.",
  },
];

const stats = [
  { label: "Contracts Audited", value: "1,247+" },
  { label: "Vulnerabilities Found", value: "8,391+" },
  { label: "Mantle Projects Protected", value: "312+" },
  { label: "Avg. Audit Time", value: "< 30s" },
];

const recentAudits = [
  { contract: "0x3a4e...f82c", risk: "LOW", score: 88, name: "MantleSwap LP" },
  { contract: "0x9b12...cc01", risk: "MEDIUM", score: 61, name: "NFT Marketplace" },
  { contract: "0x1f7d...a445", risk: "SAFE", score: 97, name: "Staking Vault" },
];

function RiskBadge({ risk }: { risk: string }) {
  const colors: Record<string, string> = {
    SAFE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
    LOW: "bg-green-500/15 text-green-400 border-green-500/40",
    MEDIUM: "bg-yellow-500/15 text-yellow-400 border-yellow-500/40",
    HIGH: "bg-orange-500/15 text-orange-400 border-orange-500/40",
    CRITICAL: "bg-red-500/15 text-red-400 border-red-500/40",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold border ${colors[risk] || colors.MEDIUM}`}>
      {risk}
    </span>
  );
}

export default function Home() {
  const wallet = useWallet();

  return (
    <div className="min-h-screen bg-background grid-bg">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Shield className="w-7 h-7 text-primary" />
              <span className="text-xl font-bold text-foreground">
                Mantle<span className="text-primary">Guard</span>
              </span>
              <Badge variant="outline" className="text-xs ml-1 border-primary/40 text-primary">
                BETA
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              {wallet.account && !wallet.isMantle && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10"
                  onClick={wallet.switchNetwork}
                  data-testid="button-switch-network"
                >
                  <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                  Switch to Mantle
                </Button>
              )}
              {wallet.account ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30">
                    <div className="w-2 h-2 rounded-full bg-primary pulse-green" />
                    <span className="text-sm font-mono text-primary" data-testid="text-wallet-address">
                      {wallet.shortAddress}
                    </span>
                  </div>
                  <Link href="/audit">
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-open-auditor">
                      Launch Auditor
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              ) : wallet.walletAvailable ? (
                <Button
                  size="sm"
                  onClick={wallet.connect}
                  disabled={wallet.isConnecting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  data-testid="button-connect-wallet"
                >
                  {wallet.isConnecting ? "Connecting..." : "Connect Wallet"}
                </Button>
              ) : (
                <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="border-primary/50 text-primary">
                    Install MetaMask
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm mb-8">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Built for the Mantle Ecosystem
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 leading-tight">
            AI Smart Contract
            <br />
            <span className="text-primary glow-green">Security Auditor</span>
            <br />
            for Mantle Network
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            MantleGuard uses AI to scan your Solidity contracts for vulnerabilities, 
            gas inefficiencies, and Mantle-specific issues — in under 30 seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            {wallet.account ? (
              <Link href="/audit">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 text-base"
                  data-testid="button-hero-audit"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Start Auditing
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
            ) : wallet.walletAvailable ? (
              <div className="flex flex-col items-center gap-2">
                <Button
                  size="lg"
                  onClick={wallet.connect}
                  disabled={wallet.isConnecting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 text-base"
                  data-testid="button-hero-connect"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  {wallet.isConnecting ? "Connecting..." : "Connect Wallet to Start"}
                </Button>
                {wallet.error && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-2 max-w-sm text-center">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{wallet.error}</span>
                    <button onClick={wallet.clearError} className="ml-1 opacity-70 hover:opacity-100">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary/50 text-primary h-12 px-8 text-base"
                  >
                    <Shield className="w-5 h-5 mr-2" />
                    Install MetaMask to Start
                  </Button>
                </a>
                <p className="text-sm text-muted-foreground">A Web3 wallet is required to use MantleGuard</p>
              </div>
            )}
            <a
              href="https://explorer.mantle.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-explorer"
            >
              Mantle Explorer
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-card border border-border text-center">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            Comprehensive Security Analysis
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Everything you need to ship secure smart contracts on Mantle
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Audits */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            Recent Audits
          </h2>
          <p className="text-center text-muted-foreground mb-10">
            Contracts recently scanned on Mantle network
          </p>
          <div className="space-y-3">
            {recentAudits.map((audit) => (
              <div
                key={audit.contract}
                className="flex items-center justify-between p-4 rounded-xl bg-card border border-border"
              >
                <div className="flex items-center gap-3">
                  {audit.risk === "SAFE" || audit.risk === "LOW" ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  )}
                  <div>
                    <div className="font-medium text-foreground">{audit.name}</div>
                    <div className="text-xs font-mono text-muted-foreground">{audit.contract}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-bold text-foreground">{audit.score}/100</div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                  <RiskBadge risk={audit.risk} />
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            {wallet.account ? (
              <Link href="/audit">
                <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/10" data-testid="button-audit-yours">
                  Audit Your Contract
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                className="border-primary/40 text-primary hover:bg-primary/10"
                onClick={wallet.connect}
                data-testid="button-connect-audit"
              >
                Connect Wallet to Audit
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            How MantleGuard Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Connect & Submit",
                description:
                  "Connect your Web3 wallet to Mantle network, then paste your contract code or enter a verified contract address.",
              },
              {
                step: "02",
                title: "AI Analysis",
                description:
                  "MantleGuard's AI engine scans for 20+ vulnerability types, gas inefficiencies, and Mantle-specific compatibility issues.",
              },
              {
                step: "03",
                title: "Get Your Report",
                description:
                  "Receive a detailed audit report with risk scores, remediation steps, and a cryptographic audit hash.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-5xl font-mono font-bold text-primary/20 mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">
              Mantle<span className="text-primary">Guard</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built for the Mantle Network ecosystem • AI-powered smart contract security
          </p>
          <a
            href="https://www.mantle.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Powered by Mantle
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>
    </div>
  );
}
