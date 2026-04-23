# Store Analytics

I manage two small businesses in New York — a deli and a convenience store doing about $50K a week combined. For a long time I tracked everything in a 7-sheet Google Sheets system with a bunch of cross-sheet formulas. It worked, but it was fragile, hard to read, and only I knew how to use it.

This is the rebuild. A proper web app where I (or any business owner) can sign up, add their stores, and track revenue, expenses, and payroll — with the same financial logic the spreadsheet had, but actually usable.

It's also built to be multi-tenant from day one, meaning any number of businesses can use it without their data ever touching each other.

---

## What it tracks

Every week, for each store, the app tracks:

- **Daily revenue** — split into cash and credit separately, not just a total. This matters because cash is in the drawer right now, credit hits the bank in a day or two.
- **Expenses** — broken into categories (inventory, utilities, supplies, etc.) and tagged by how they were paid: out of the cash drawer, by vendor check, or from an external source. This distinction is what makes the "Cash Left" calculation work correctly.
- **Payroll** — per employee, per store, per week.

From those three inputs, the app computes:

| Metric | What it means |
|---|---|
| Total Income | Cash + credit combined |
| NET | Total income minus everything — all expenses and payroll |
| Cash Left | Cash income minus only the expenses that came out of the drawer and payroll. Vendor checks and external inventory don't count here because that money was never in the drawer. |

---

## Tech stack

- **Next.js 16** — frontend and API routes
- **PostgreSQL + Prisma 7** — database, hosted on Supabase
- **NextAuth.js** — login with email/password or Google
- **TailwindCSS** — styling
- **TypeScript** — strict mode, no exceptions
- **Recharts** — charts and graphs (coming in Phase 2)
- **Python Flask + Google Cloud Vision** — OCR receipt scanning (coming in Phase 3)

---

## How the code is organized

The project follows a strict rule: one file, one job.

```
src/
├── app/api/          — HTTP only. No business logic here.
├── helpers/          — All the actual business logic lives here.
├── lib/              — Shared setup: database client, auth config, utilities.
├── components/       — UI broken into forms, layout, charts, and small primitives.
├── types/            — All TypeScript types defined in one place.
└── hooks/            — Custom React hooks.
```

API routes take a request and return a response. The math and database logic happens in `helpers/`. Components just display data. This makes it easy to test, easy to change, and easy to understand what's happening where.

---

## Database structure

Every piece of data belongs to an organization. Every query filters by the logged-in user's org. There's no way to accidentally read another business's data.

```
User → Organization → Locations → Revenue / Expenses / Payroll
```

---

## Decisions I had to make (and why)

### Why are cash and credit stored as separate columns instead of one total?

Because "Cash Left" — the number that tells you how much cash to pull from the store — only uses cash income. If I stored a single total, I'd lose the ability to calculate that without adding another field. Keeping them separate means the data is always complete.

### Why is there a "payment source" field on expenses?

This came directly from looking at the actual weekly spreadsheet. Some expenses — like vendor inventory paid by check, or cigarettes sourced from outside the store — don't come out of the cash drawer. So they affect the profit calculation (NET) but not the cash calculation (Cash Left).

One field, `payment_source`, with three options: `CASH_DRAWER`, `CHECK`, or `EXTERNAL`. That's all it takes to make both calculations correct.

### Why are weekly totals calculated in code instead of stored in the database?

If you store a calculated value, you have to update it every time any related row changes. If you forget, the stored total is wrong and you don't know it. Calculating on the fly means the numbers are always correct because they're always derived fresh from the source data.

### Why does every table store `org_id` directly?

The "clean" relational way to check if an expense belongs to you would be: expense → location → organization → check the owner. That's two joins every time.

Instead, every table stores `org_id` directly so every query is just `WHERE org_id = ?`. Less joins, one consistent pattern, and harder to accidentally skip the check.

### Why does login use JWT instead of storing sessions in the database?

NextAuth (the auth library) normally stores session data in the database. That works great for Google login, but email/password login has a quirk — NextAuth doesn't automatically create the database session row when you log in with a password, only when you go through an OAuth flow.

The fix is switching to JWT sessions: instead of a database row, your login is stored as an encrypted cookie in your browser. The math still works, Google login still works, and email/password login works too. The only tradeoff is that sessions can't be force-expired server-side, which isn't a requirement for this app.

### Why doesn't the middleware (proxy) check if the user has an organization?

The middleware runs on literally every request — every page, every API call, every image. Putting a database query there would mean hitting Supabase hundreds of times per session for no reason.

The middleware only does one thing: check if you're logged in by reading your session cookie. If you're not, it sends you to the login page. That's it.

The check for whether you've set up your organization happens in the dashboard layout — a server component that only runs when you actually try to open the dashboard. That's the right place for it.

---

## Running it locally

```bash
npm install
cp .env.example .env
# Fill in your database URL, NextAuth secret, and Google OAuth credentials

npx prisma generate
npx prisma migrate dev
npm run dev
```

Open `http://localhost:3000/signup`, create an account, set up your business and locations, and you're in.

---

## Roadmap

**Phase 1 (current)** — Auth, onboarding, data entry forms, weekly summary dashboard.

**Phase 2** — Charts. Week-over-week revenue trends, expense breakdowns by category, payroll summaries. All built with Recharts.

**Phase 3** — Receipt scanning. A separate Python service that uses Google Cloud Vision to read handwritten receipts, including mixed Arabic and English text. You review anything it's not confident about before it gets saved.
