# MantleGuard-1 🛡️

**AI-Powered Smart Contract Security Auditor for Mantle Network**

MantleGuard uses advanced AI (GPT-4o + custom analysis) to scan smart contracts for vulnerabilities, provide risk scores, gas optimization suggestions, and generate on-chain audit receipts — all built natively for the **Mantle L2 ecosystem**.

### 🎯 Perfect for Mantle AI Bounty ("When AI Meets Mantle")

- **AI-Driven Audit**: Detects reentrancy, access control issues, overflow, etc.
- **Mantle-Native**: Wallet connect, chain switching, and on-chain receipt minting
- **Real-Time Insights**: Risk score, severity breakdown, and remediation steps
- **Beautiful & Fast UI**: Modern React 19 + Tailwind v4 + shadcn/ui

### 🚀 Live Demo
→ **[https://mantle-guard-1.vercel.app](https://mantle-guard-1.vercel.app)** (update this link after you deploy)

### ✨ Features
- Connect wallet (MetaMask / Rabby / OKX supported)
- Paste any Solidity contract → AI instant analysis
- Visual risk dashboard + detailed report
- On-chain audit receipt (NFT-style proof)
- Fully responsive + dark theme optimized for Mantle branding

### 🛠️ Tech Stack
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui + Framer Motion
- **Web3**: ethers.js v6 + custom multi-wallet handler
- **AI**: GPT-4o powered analysis (mock/demo ready for real API)
- **Deployment**: Vercel (Root Directory = `mantleguard-vercel`)
- **Network**: Mantle Mainnet (Chain ID 5000)

### 📦 How to Run Locally

```bash
cd mantleguard-vercel
npm install
npm run dev
