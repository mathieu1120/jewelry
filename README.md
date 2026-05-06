# Jewelry Store

Next.js + Firebase + Stripe + Shippo. ~$0/mo fixed cost.

---

## Stack

| Layer | Service | Cost |
|---|---|---|
| Frontend + hosting | Next.js on Vercel | Free |
| Database + auth | Firebase Firestore + Auth | Free tier |
| Image storage | Firebase Storage | Free tier |
| Payments | Stripe Checkout | 2.9% + $0.30/sale |
| Shipping labels | Shippo | ~$3–5/label (USPS) |

---

## Setup

### 1. Firebase

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Add a **Web app** — copy the config values into `.env.local`
4. Enable **Firestore** (start in production mode)
5. Enable **Authentication** → Email/Password
6. Enable **Storage**
7. Create an account for your wife in Authentication → Users
8. Go to Project Settings → Service Accounts → **Generate new private key**
   - Download the JSON, minify it to one line, paste as `FIREBASE_ADMIN_CREDENTIALS`

#### Firestore security rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public reads for products
    match /products/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    // Orders: only authenticated admin
    match /orders/{id} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Storage security rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

### 2. Stripe

1. Create account at [stripe.com](https://stripe.com)
2. Get your keys from Dashboard → Developers → API keys
3. For the webhook:
   - Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
   - In dev: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   - Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`
   - In production: add webhook endpoint in Stripe Dashboard → `https://yourdomain.com/api/webhooks/stripe`
   - Select event: `checkout.session.completed`

---

### 3. Shippo

1. Create account at [goshippo.com](https://goshippo.com)
2. Get your API key from Settings → API
3. Connect a carrier (USPS is free to connect)
4. Copy your carrier account ID from Settings → Carriers into `SHIPPO_CARRIER_ACCOUNT`
5. Add your shop's return address to `.env.local` (SHOP_* variables)

---

### 4. Environment variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local .env.local
```

Add these extra Shippo/shop variables:

```
SHOP_OWNER_NAME=Your Name
SHOP_ADDRESS_LINE1=123 Main St
SHOP_CITY=San Diego
SHOP_STATE=CA
SHOP_ZIP=92101
SHOP_EMAIL=you@example.com
SHIPPO_CARRIER_ACCOUNT=your_carrier_account_id
```

---

### 5. Run locally

```bash
npm install
npm run dev
```

- Shop: http://localhost:3000
- Admin: http://localhost:3000/admin

---

### 6. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add all env variables in Vercel Dashboard → Project → Settings → Environment Variables.

---

## Swapping in your Lovable design

The project is structured so the design layer is completely separate from the logic:

- **`globals.css`** — update the CSS variables at the top (colors, fonts, radius)
- **`components/shop/`** — replace `ProductCard` and `BuyButton` with your Lovable components. Keep the props interface the same.
- **`app/page.tsx`** and **`app/product/[id]/page.tsx`** — replace the JSX markup. The data fetching at the top stays untouched.
- The `lib/` folder and API routes **never need to change** for a design swap.

---

## Project structure

```
src/
├── app/
│   ├── page.tsx                    # Shop homepage
│   ├── product/[id]/page.tsx       # Product detail
│   ├── success/page.tsx            # Post-purchase
│   ├── admin/
│   │   ├── page.tsx                # Product management
│   │   ├── orders/page.tsx         # Order management
│   │   └── login/page.tsx          # Admin login
│   └── api/
│       ├── checkout/route.ts       # Create Stripe session
│       ├── webhooks/stripe/route.ts # Handle payment success
│       └── orders/label/route.ts   # Generate Shippo label
├── components/
│   ├── shop/                       # Customer-facing UI
│   └── admin/                      # Admin UI
├── hooks/
│   └── useAdminAuth.ts             # Auth guard
├── lib/
│   ├── firebase.ts                 # Client SDK
│   ├── firebase-admin.ts           # Server SDK
│   ├── stripe.ts                   # Stripe client
│   ├── db.ts                       # Firestore helpers
│   ├── storage.ts                  # Image upload
│   └── utils.ts                    # formatPrice etc.
└── types/
    └── index.ts                    # Shared types
```
