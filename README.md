This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Seat Sage

**A cutting-edge, real-time event ticketing & management platform** engineered for scale, performance, and security. Built with Next.js 14, Convex, Clerk, and Stripe Connect, Seat Sage delivers a sophisticated queuing engine, live updates, and enterprise-grade payment flows.

---

**Live Demo:** [https://seat-sage.vercel.app](https://seat-sage.vercel.app)

---

## 🚀 Project Overview

Seat Sage empowers both attendees and organizers with:

* **Ultra-low latency** real-time availability powered by Convex subscriptions
* **Smart queue orchestration** with dynamic prioritization and time-limited holds
* **Seamless authentication** via Clerk (OAuth, SSO, multi‑factor)
* **Robust payment rails** using Stripe Connect (express payouts, application fees)
* **Full lifecycle ticket management** (issue, transfer, refund, recycle)

This platform is architected for high concurrency, fault tolerance, and regulatory compliance (PCI‑DSS, GDPR).

---

## 🔥 Key Features

### For Event Attendees

| Feature                   | Description                                                        |
| ------------------------- | ------------------------------------------------------------------ |
| 🎫 Real‑time availability | Live  ticket counts with sub‑100ms propagation                     |
| ⚡ Adaptive queueing       | Intelligent load‑shedding and position updates to prevent oversell |
| ⏱️ Timed reservations     | Automatic expiry of unpaid holds, with visual countdown timers     |
| 📱 Mobile‑first UI        | Responsive React components, offline caching, QR‑code wallets      |
| 🔒 Secure payments        | PCI‑compliant Stripe Checkout with 3DS and fraud mitigation        |
| 🔄 Refund automation      | Auto‑refund on cancellations, policy‑driven workflows              |

### For Event Organizers

| Feature                       | Description                                                         |
| ----------------------------- | ------------------------------------------------------------------- |
| 💳 Stripe Connect payouts     | Split‑and‑transfer funds, custom application fees, KYC support      |
| 📊 Live sales dashboard       | Real‑time charts (Recharts) and metrics powered by Convex functions |
| 🎯 Automated queue processing | Serverless CRON jobs to recycle tickets and manage waitlists        |
| 📈 Advanced analytics         | Cohort analysis, revenue forecasting, funnel metrics                |
| ❌ Graceful cancellations      | Batch‑refund engine with retry logic and idempotency keys           |
| 🔄 Bulk operations            | CSV import/export, mass ticket issuance and revocation              |

### Technical Highlights

* **Next.js 14 App Router** with hybrid SSR/SSG & streaming
* **Convex** for globally distributed, real‑time database and serverless functions
* **Clerk** for user management (passwordless, SSO, JWT, RBAC)
* **Stripe Connect** in Express mode, with on‑behalf‑of and application fees
* **Tailwind CSS** + **shadcn/ui** for a consistent, accessible design system
* **Rate limiting** via Redis & Convex middlewares to mitigate abuse
* **Webhooks** and **event sourcing** for audit trails and integrations
* **TypeScript end‑to‑end**: zero‑runtime type errors, full inference
* **CI/CD** with GitHub Actions, Vercel deployments, and automated canary releases

---

## 🛠 Architecture Diagram

```mermaid
flowchart LR
  subgraph Frontend
    A[Next.js Client] -->|GraphQL/Convex| B[Convex Edge]
    A -->|Clerk Auth| C[Clerk]
    A -->|Stripe.js| D[Stripe Checkout]
  end
  subgraph Backend
    B --> E[Convex Functions]
    E --> F[Postgres (Convex) & Storage]
    E --> G[Stripe Connect API]
    E --> H[Scheduler / CRON]
  end
  subgraph Integrations
    H --> E
    G -->|Webhooks| E
    C -->|Webhooks| E
  end
```

---

## 📥 Getting Started

1. **Clone** the repo:

   ```bash
   git clone https://github.com/your-org/seat-sage.git
   cd seat-sage
   ```
2. **Install** dependencies:

   ```bash
   npm install
   # or yarn
   ```
3. **Configure** environment variables in `.env.local`:

   ```ini
   NEXT_PUBLIC_CONVEX_URL=your_convex_url
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   CLERK_SECRET_KEY=your_clerk_secret
   STRIPE_SECRET_KEY=your_stripe_secret
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
4. **Run** in development:

   ```bash
   npm run dev
   ```
5. **Deploy** to Vercel (connected to GitHub) for automated builds & previews.

---

## 📚 Further Reading

* [Next.js 14 App Router](https://nextjs.org/docs)
* [Convex Real‑time Database](https://convex.dev/docs)
* [Clerk Auth Guides](https://clerk.com/docs)
* [Stripe Connect Platforms](https://stripe.com/docs/connect)
* [Tailwind CSS](https://tailwindcss.com/docs)

---

> *Seat Sage* — because every seat deserves the smartest reservation system. Happy ticketing!

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
