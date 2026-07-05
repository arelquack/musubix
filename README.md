# Musubix

**Musubix** is a next-generation decentralized freelance platform built on the **Stellar Network** and **Soroban Smart Contracts**. It bridges the gap between traditional Web2 usability and Web3 trustlessness. 

By utilizing backend-managed custodial wallets, Musubix offers a seamless, password-free login experience while maintaining cryptographically verified job histories, secure escrow payments, and an automated AI-driven job specification analyzer.

---

## 🌟 Key Features

1. **Web2 UX with Web3 Power:** Users log in with just an email. Wallets and keys are securely generated and managed by the backend, completely removing the complexity of browser-extension wallets (like Freighter or xBull).
2. **Soroban Smart Contract Escrow:** When a client hires a freelancer, the payment is locked securely in a Soroban smart contract. Funds are only released upon mutual agreement.
3. **AI Smart Checker:** When clients post jobs, our AI analyzes the job title, description, and budget. It provides actionable feedback and a score to ensure high-quality job postings.
4. **Rich Identity Profiles:** Freelancers and Clients have fully customizable profiles, including avatars, professional bios, skills, and portfolio/social links.
5. **IDR DEX Liquidity:** Built-in treasury system interacting with the Stellar DEX, allowing seamless tokenized fiat conversions (e.g., XLM to IDR).

---

## 🏗 Architecture

The project is structured as a monorepo consisting of a Next.js frontend and a NestJS microservices backend.

- **Frontend (`/src`)**: Next.js 14+ (App Router), React, Vanilla CSS with a bespoke dark-theme design system (`matsu` & `shu` color palette).
- **Backend (`/backend`)**: NestJS Microservices architecture using TCP message passing.
  - `api-gateway`: Handles HTTP requests from the frontend and routes them to the appropriate microservice.
  - `user-job-service`: Manages SQLite databases (via Prisma), user identities, and job postings.
  - `stellar-service`: Handles custodial wallet encryption, transaction signing, and Soroban contract interactions.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- SQLite (included with Prisma)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/musubix.git
cd musubix
```

### 2. Setup the Backend
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

**Database Setup & Seeding:**
Initialize the SQLite database and run the Prisma migrations. This will also automatically seed the database with mock users and treasury setups when the server starts.
```bash
npx prisma db push
```

**Start the Backend Microservices:**
Run the following commands in separate terminal windows (or use a process manager):

Terminal 1 (User Job Service):
```bash
npm run start:dev user-job-service
```

Terminal 2 (API Gateway):
```bash
npm run start:dev api-gateway
```
*Note: The `stellar-service` logic is currently integrated into the User Job Service for MVP simplification, so only these two services are required.*

### 3. Setup the Frontend
Open a new terminal window, navigate back to the root directory, and install the frontend dependencies:
```bash
cd ..
npm install
```

Start the Next.js development server:
```bash
npm run dev
```

### 4. Usage
Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Login as Client:** Click "Sign in" and use `client@musubix.com`.
- **Login as Freelancer:** Click "Sign in" and use `freelancer@musubix.com`.

*(Because this is an MVP using custodial wallets and mock authentication, you simply enter the email to log in).*

---

## 📖 How to Use the Platform

### For Clients
1. Log in using a client email.
2. Go to the **Client Dashboard**.
3. **Post a Job:** Fill in the title, description, and budget. The **AI Smart Checker** will evaluate your job spec in real-time.
4. **Hire:** Browse available freelancers, review their profiles (Bio, Skills, GitHub), and accept them for a job.
5. **Lock Escrow:** Securely lock the payment in the Soroban smart contract.
6. **Approve Work:** Once the freelancer submits their work, approve it to release the funds.

### For Freelancers
1. Log in using a freelancer email.
2. Go to the **Freelancer Dashboard**.
3. **Find Work:** Browse open jobs and apply/accept them.
4. **Edit Profile:** Click your name in the top right corner to visit your Profile page. Click "Edit Profile Details" to update your Avatar, Bio, Skills, and Calendly links.
5. **Submit Work:** Once you finish a locked job, submit your work URL. Wait for the client's approval to receive your payment directly into your custodial wallet.

---

## 🛠 Tech Stack

- **Frontend:** Next.js, React, Vanilla CSS, Stellar SDK
- **Backend:** NestJS, Prisma ORM, SQLite, Stellar SDK, Soroban SDK
- **Blockchain:** Stellar Testnet

---

## 🔒 Security Note (Custodial Wallets)
For this MVP, Musubix utilizes a **Wizard of Oz** custodial wallet system. User secret keys are encrypted (AES-256) and stored in the backend database. Transaction signing occurs server-side. While this provides a frictionless Web2 UX, it implies that users must trust the platform. Future iterations may explore Account Abstraction or Passkeys for non-custodial security without sacrificing UX.

---

## 📄 License
This project is licensed under the MIT License.
