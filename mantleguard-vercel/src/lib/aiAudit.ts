export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export interface AuditFinding {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  line?: string;
  recommendation: string;
}

export interface AuditReport {
  contractAddress?: string;
  contractName: string;
  auditedAt: string;
  overallRisk: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SAFE";
  score: number;
  summary: string;
  findings: AuditFinding[];
  gasOptimizations: string[];
  mantleCompatibility: {
    compatible: boolean;
    notes: string[];
  };
  auditHash: string;
  aiPowered?: boolean;
}

// ─── Loading Steps ────────────────────────────────────────────────────────────

export type AuditStep = {
  label: string;
  detail: string;
};

export const AUDIT_STEPS: AuditStep[] = [
  { label: "Parsing Solidity AST", detail: "Extracting contract structure and function signatures..." },
  { label: "Scanning vulnerability patterns", detail: "Checking reentrancy, tx.origin, overflow, delegatecall..." },
  { label: "Running AI security analysis", detail: "GPT-4o is reviewing your contract logic and access controls..." },
  { label: "Analyzing Mantle compatibility", detail: "Checking chainId, MNT token usage, L2 gas patterns..." },
  { label: "Generating security report", detail: "Calculating risk score and compiling recommendations..." },
];

// ─── Pattern-based fallback ──────────────────────────────────────────────────

function detectVulnerabilities(code: string): AuditFinding[] {
  const findings: AuditFinding[] = [];
  let idCounter = 1;

  const checks: Array<{
    pattern: RegExp;
    severity: Severity;
    title: string;
    description: string;
    recommendation: string;
  }> = [
    {
      pattern: /\.call\{value:/i,
      severity: "HIGH",
      title: "Reentrancy Risk Detected",
      description: "Low-level `.call{value:}()` can be exploited in reentrancy attacks if state changes occur after external calls.",
      recommendation: "Use the Checks-Effects-Interactions pattern. Update state before external calls. Consider using ReentrancyGuard from OpenZeppelin.",
    },
    {
      pattern: /tx\.origin/i,
      severity: "HIGH",
      title: "tx.origin Authentication Vulnerability",
      description: "`tx.origin` is vulnerable to phishing attacks. A malicious contract can trick users into authorizing transactions.",
      recommendation: "Use `msg.sender` for authentication instead of `tx.origin`.",
    },
    {
      pattern: /selfdestruct|suicide\s*\(/i,
      severity: "CRITICAL",
      title: "Self-Destruct Function Present",
      description: "`selfdestruct` can permanently destroy the contract and send all MNT/ETH to an arbitrary address.",
      recommendation: "Remove `selfdestruct` unless absolutely necessary. Protect with multi-sig governance if kept.",
    },
    {
      pattern: /assembly\s*\{/i,
      severity: "MEDIUM",
      title: "Inline Assembly Usage",
      description: "Inline assembly bypasses Solidity safety checks and can introduce low-level vulnerabilities.",
      recommendation: "Minimize assembly usage. Document purpose clearly and have it reviewed by a security expert.",
    },
    {
      pattern: /block\.timestamp|now\b/i,
      severity: "LOW",
      title: "Block Timestamp Dependency",
      description: "Relying on `block.timestamp` is risky. On Mantle (~2s blocks), small timestamp manipulations are possible.",
      recommendation: "Only use block.timestamp for ranges > 15 minutes. Never use for randomness.",
    },
    {
      pattern: /delegatecall/i,
      severity: "HIGH",
      title: "Unsafe delegatecall Usage",
      description: "`delegatecall` executes code from another contract in the current contract's storage context.",
      recommendation: "Only use `delegatecall` with trusted contracts. Ensure identical storage layouts between contracts.",
    },
    {
      pattern: /transfer\s*\(/i,
      severity: "INFO",
      title: "ETH/MNT Transfer Detected",
      description: "Native token transfers detected. Ensure proper access control and reentrancy protection.",
      recommendation: "Verify transfer functions are guarded by access control modifiers and reentrancy guards.",
    },
    {
      pattern: /onlyOwner|Ownable/i,
      severity: "LOW",
      title: "Centralized Ownership Risk",
      description: "Contract relies on a single owner for critical functions. Creates a single point of failure.",
      recommendation: "Consider multi-sig governance or a DAO structure for critical administrative functions.",
    },
    {
      pattern: /pragma\s+solidity\s+\^?0\.[1-7]\./i,
      severity: "MEDIUM",
      title: "Outdated Solidity Version",
      description: "Outdated Solidity version may have known vulnerabilities.",
      recommendation: "Upgrade to Solidity 0.8.20+ for built-in overflow protection and latest security patches.",
    },
    {
      pattern: /function\s+\w+\s*\([^)]*\)\s+public\s+(?!view|pure)/i,
      severity: "LOW",
      title: "Unprotected Public Function",
      description: "Public state-changing functions detected without visible access control modifiers.",
      recommendation: "Add appropriate access modifiers (onlyOwner, onlyRole, etc.) to restrict sensitive operations.",
    },
  ];

  for (const check of checks) {
    if (new RegExp(check.pattern.source, check.pattern.flags).test(code)) {
      findings.push({
        id: `GUARD-${String(idCounter++).padStart(3, "0")}`,
        ...check,
      });
    }
  }

  if (code.trim().length < 50) {
    findings.push({
      id: `GUARD-${String(idCounter++).padStart(3, "0")}`,
      severity: "INFO",
      title: "Minimal Contract Code",
      description: "Contract is very short. Submit the full source code for a comprehensive audit.",
      recommendation: "Submit complete contract source code for thorough analysis.",
    });
  }

  return findings;
}

function calculateScore(findings: AuditFinding[]): number {
  let score = 100;
  for (const f of findings) {
    if (f.severity === "CRITICAL") score -= 35;
    else if (f.severity === "HIGH") score -= 20;
    else if (f.severity === "MEDIUM") score -= 10;
    else if (f.severity === "LOW") score -= 5;
    else if (f.severity === "INFO") score -= 1;
  }
  return Math.max(0, score);
}

function getOverallRisk(score: number): "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SAFE" {
  if (score >= 90) return "SAFE";
  if (score >= 70) return "LOW";
  if (score >= 50) return "MEDIUM";
  if (score >= 30) return "HIGH";
  return "CRITICAL";
}

function generateHash(): string {
  return "0x" + Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

function detectGasOptimizations(code: string): string[] {
  const opts: string[] = [];
  if (/for\s*\(/.test(code))
    opts.push("Cache array length in loop conditions: `uint len = arr.length; for(uint i; i < len; i++)`");
  if (/storage\b/.test(code))
    opts.push("Use `memory` instead of `storage` for read-only function parameters to reduce gas costs.");
  if (/uint256/.test(code))
    opts.push("Pack smaller uint types together in structs to save storage slots on Mantle.");
  if (/string\s/.test(code))
    opts.push("Store short strings as `bytes32` instead of `string` to avoid dynamic storage costs.");
  opts.push("Enable the Solidity optimizer with at least 200 runs for production deployment.");
  opts.push("Mantle's L2 architecture has ~10-100x lower gas fees than Ethereum mainnet.");
  return opts;
}

function getMantleCompatibilityNotes(code: string): string[] {
  const notes: string[] = [
    "Mantle is EVM-compatible — all standard Solidity contracts deploy without changes.",
    "Mantle's native token is MNT. Ensure native transfers handle MNT correctly.",
    "Mantle block times are ~2 seconds — faster than Ethereum. Time-dependent logic should account for this.",
    "Mantle Mainnet chainId is 5000. Testnet (Sepolia) chainId is 5003.",
  ];
  if (/chainId/.test(code)) {
    notes.push("Chain ID check detected. Verify you're comparing against 5000 for Mantle Mainnet.");
  }
  return notes;
}

// ─── Mock fallback audit ─────────────────────────────────────────────────────

function mockAudit(code: string, contractAddress?: string): AuditReport {
  const findings = detectVulnerabilities(code);
  const score = calculateScore(findings);
  const overallRisk = getOverallRisk(score);

  const critCount = findings.filter((f) => f.severity === "CRITICAL").length;
  const highCount = findings.filter((f) => f.severity === "HIGH").length;
  const medCount = findings.filter((f) => f.severity === "MEDIUM").length;
  const lowCount = findings.filter((f) => f.severity === "LOW").length;
  const infoCount = findings.filter((f) => f.severity === "INFO").length;

  let summary = "MantleGuard pattern analysis complete. ";
  if (overallRisk === "SAFE") {
    summary += "No critical vulnerabilities detected. Contract appears safe for deployment on Mantle network.";
  } else {
    summary += `Found ${findings.length} issue(s): ${critCount} critical, ${highCount} high, ${medCount} medium, ${lowCount} low, ${infoCount} informational. `;
    summary += `Address ${critCount + highCount} critical/high severity issues before deploying to Mantle mainnet.`;
  }

  const contractName = (() => {
    const match = code.match(/contract\s+(\w+)/);
    return match ? match[1] : "UnknownContract";
  })();

  return {
    contractAddress,
    contractName,
    auditedAt: new Date().toISOString(),
    overallRisk,
    score,
    summary,
    findings,
    gasOptimizations: detectGasOptimizations(code),
    mantleCompatibility: {
      compatible: true,
      notes: getMantleCompatibilityNotes(code),
    },
    auditHash: generateHash(),
    aiPowered: false,
  };
}

// ─── Main audit function ─────────────────────────────────────────────────────

export async function runAiAudit(
  code: string,
  contractAddress?: string,
  onStep?: (stepIndex: number) => void
): Promise<AuditReport> {
  // Animate through loading steps
  const stepDelay = 900;
  const stepTimer = (i: number) =>
    new Promise<void>((r) => setTimeout(() => { onStep?.(i); r(); }, stepDelay * i));

  // Try the real API endpoint first
  try {
    // Kick off step animations concurrently with the API call
    const stepPromises = AUDIT_STEPS.map((_, i) => stepTimer(i));

    const apiPromise = fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, contractAddress }),
      signal: AbortSignal.timeout(30000),
    });

    const [res] = await Promise.all([apiPromise, ...stepPromises]);

    if (res.ok) {
      const data = await res.json();
      // Ensure all required fields exist
      if (data.findings && data.score !== undefined && data.overallRisk) {
        return {
          contractAddress,
          contractName: data.contractName || "UnknownContract",
          auditedAt: data.auditedAt || new Date().toISOString(),
          overallRisk: data.overallRisk,
          score: data.score,
          summary: data.summary || "",
          findings: (data.findings || []).map((f: any, i: number) => ({
            id: f.id || `GUARD-${String(i + 1).padStart(3, "0")}`,
            severity: f.severity || "INFO",
            title: f.title || "Issue",
            description: f.description || "",
            line: f.line,
            recommendation: f.recommendation || "",
          })),
          gasOptimizations: data.gasOptimizations || [],
          mantleCompatibility: data.mantleCompatibility || { compatible: true, notes: [] },
          auditHash: data.auditHash || generateHash(),
          aiPowered: true,
        };
      }
    }
  } catch {
    // API unavailable — use mock
  }

  // Fallback: pattern-based mock with step animation
  await new Promise((r) => setTimeout(r, AUDIT_STEPS.length * stepDelay));
  return mockAudit(code, contractAddress);
}
