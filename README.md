# PropChain - Real Estate Tokenization Platform

A decentralized application for tokenizing real estate properties using ERC-1155 tokens on the Etherlink blockchain.

## 🌐 Live Demo

**Deployed Application:** [https://prop-chain.onrender.com/](https://prop-chain.onrender.com/)

> ⚠️ **Note:** The application is deployed on Render's free tier. The backend may need up to a minute to wake up on first access.

## 🚀 Features

- **Property Management**: Create and manage real estate property listings
- **Blockchain Tokenization**: Convert properties into ERC-1155 tokens
- **SIWE Authentication**: Secure login using Sign-In with Ethereum
- **Etherlink Integration**: Built on Etherlink Testnet for fast, low-cost transactions
- **MetaMask Support**: Connect your wallet to interact with the platform

## 🔐 Getting Started

### Prerequisites

1. **MetaMask Wallet**: Install the [MetaMask browser extension](https://metamask.io/)
2. **Etherlink Testnet**: Configure your wallet for Etherlink Testnet
   - Network Name: `Etherlink Testnet`
   - RPC URL: `https://node.ghostnet.etherlink.com`
   - Chain ID: `128123`
   - Currency Symbol: `XTZ`
   - Block Explorer: `https://testnet.explorer.etherlink.com`

### Using the Application

1. **Visit the App**: Go to [https://prop-chain.onrender.com/](https://prop-chain.onrender.com/)
2. **Connect Wallet**: Click "Connect Wallet" and select MetaMask
3. **Switch Network**: If prompted, switch to Etherlink Testnet
4. **Sign In**: Complete the SIWE (Sign-In with Ethereum) authentication
5. **Create Properties**: Add your real estate properties to the platform
6. **Tokenize**: Convert your properties into tradeable ERC-1155 tokens

## 🏗️ Architecture

### Frontend (`apps/web`)

- **React + TypeScript**: Modern web application
- **Vite**: Fast build tool and development server
- **Wagmi**: React hooks for Ethereum
- **TailwindCSS**: Utility-first CSS framework

### Backend (`apps/api`)

- **NestJS**: Progressive Node.js framework
- **MongoDB**: Database for property metadata
- **JWT + SIWE**: Secure authentication
- **File Upload**: Image handling for property photos

### Smart Contracts (`contracts`)

- **Solidity**: ERC-1155 token contract
- **Hardhat**: Development and deployment framework
- **OpenZeppelin**: Secure contract libraries

## 🛠️ Development

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd propchain

# Install dependencies
npm install

# Build all packages
npm run build
```

### Development Servers

```bash
# Start both frontend and backend in development mode
npm run dev
```

### Smart Contract Deployment

```bash
# Deploy contracts to Etherlink Testnet
npm run deploy
```

## 🌍 Deployment

The application is deployed using:

- **Frontend**: Static hosting on Render
- **Backend**: Node.js application on Render (free tier)
- **Smart Contracts**: Deployed to Etherlink Testnet
- **Database**: MongoDB Atlas

## 🔗 Links

- **Live Application**: [https://prop-chain.onrender.com/](https://prop-chain.onrender.com/)
- **Etherlink Explorer**: [https://testnet.explorer.etherlink.com](https://testnet.explorer.etherlink.com)
- **MetaMask**: [https://metamask.io/](https://metamask.io/)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ on Etherlink Testnet
