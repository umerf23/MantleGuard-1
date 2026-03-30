# MantleGuard — AI Smart Contract Security Auditor for Mantle

**MantleGuard** is an AI-powered smart contract security auditor built specifically for the Mantle blockchain ecosystem. It allows developers to paste any Solidity contract and receive a comprehensive security audit, gas optimization report, and Mantle compatibility analysis — all in under 30 seconds. Audits can be permanently published on-chain to Mantle Mainnet.

---

## Live Demo

**Deployed on Vercel:** [mantle-guard.vercel.app](https://mantle-guard.vercel.app)

---

## Features

- **AI-Powered Security Analysis** — Uses GPT-4o to detect 12+ vulnerability classes including reentrancy, tx.origin auth, integer overflow, selfdestruct, delegatecall, and more
- **Mantle Network Integration** — Detects Mantle Mainnet (chainId 5000) automatically, auto-switches MetaMask to Mantle, and generates Mantle-specific compatibility reports
- **Web3 Wallet Authentication** — Real MetaMask connection via `window.ethereum`, with multi-wallet support (EIP-6963), account change listeners, and network detection
- **On-Chain Audit Publishing** — Encodes audit data (contract name, hash, score, risk) in ABI-encoded calldata and sends a real transaction to Mantle Mainnet — your audit lives on-chain forever
- **Security Score (0–100)** — Risk rating: SAFE / LOW / MEDIUM / HIGH / CRITICAL
- **Gas Optimization Report** — Mantle L2-specific tips plus general Solidity optimizations
- **Mantle Explorer Integration** — Every published audit links directly to the Mantle Explorer transaction

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Web3 | ethers.js v6 + MetaMask |
| AI | OpenAI GPT-4o (via API) |
| Chain | Mantle Mainnet (chainId 5000) |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [MetaMask](https://metamask.io/) browser extension
- MNT tokens on Mantle Mainnet for publishing audits (tiny gas fee ~$0.001)

### Run Locally

```bash
# Clone the repo
git clone https://github.com/umerf23/mantleguard.git
cd mantleguard

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`

### Deploy to Vercel

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Set **Framework Preset** to `Vite`
4. Add environment variable: `OPENAI_API_KEY` = your OpenAI API key
5. Deploy

---

## How It Works

### 1. Connect Wallet
Connect MetaMask — MantleGuard auto-detects if you're on Mantle Mainnet and offers to switch networks if needed.

### 2. Submit Contract
Paste Solidity source code directly, or enter a contract address to fetch it from Mantle Explorer.

### 3. AI Audit
GPT-4o analyzes the contract for:
- Reentrancy vulnerabilities
- Access control issues (tx.origin, missing modifiers)
- Integer overflow/underflow
- Unsafe delegatecall and low-level calls
- Selfdestruct risks
- Flash loan attack vectors
- Block timestamp dependency
- Unprotected public functions
- Outdated compiler versions
- And more...

### 4. Publish On-Chain
Click **Publish Audit on Mantle** to send a real transaction to Mantle Mainnet. The audit report is ABI-encoded in calldata and permanently stored on-chain, viewable on [Mantle Explorer](https://explorer.mantle.xyz).

---

## Mantle Network Details

| Property | Value |
|----------|-------|
| Chain ID | 5000 (Mainnet) / 5003 (Testnet) |
| RPC URL | https://rpc.mantle.xyz |
| Explorer | https://explorer.mantle.xyz |
| Native Token | MNT |
| Block Time | ~2 seconds |

---

## Bounty Submission

This project was built for the **Mantle Official AI Bounty** track.

**Requirements met:**
- ✅ Mantle network integration (chainId 5000, auto-switch, on-chain publishing)
- ✅ Real Web3 wallet authentication (MetaMask, EIP-6963 multi-wallet)
- ✅ AI-powered contract analysis (GPT-4o)
- ✅ Deployable on Vercel
- ✅ On-chain audit registry transactions on Mantle Mainnet

---

## License

MIT — built with love for the Mantle ecosystem.
