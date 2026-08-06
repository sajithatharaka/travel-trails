# 🚀 Landing Page Starter Kit

A pre-validation landing page for collecting early-access emails before you build your product.

---

## What's included

| Section | Purpose |
|---|---|
| **Hero** | Headline + email capture form |
| **Why** | 3-point problem/solution narrative |
| **Roadmap** | Phase timeline (Shipped / In Progress / Planned) |
| **FAQ** | Animated accordion |
| **Footer CTA** | Second email capture |

---

## Setup in 5 steps

### 1. Install dependencies

```bash
npm install
```

### 2. Configure your page

Open `config.js` — this is the **only file you need to edit** for most customisations:

- Brand name, tagline, description
- Accent color (one hex value)
- Hero copy and CTA text
- Why/pain points (3 cards)
- Roadmap phases
- FAQ items

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run this SQL in the Supabase SQL editor:

```sql
create table leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text default 'waitlist',
  created_at timestamptz default now()
);

alter table leads enable row level security;

create policy "Service role insert" on leads
  for insert with check (true);
```

3. Get your keys from **Project Settings → API**

### 4. Add environment variables

Create a `.env.local` file in the project root:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> ⚠️ Never commit `.env.local` to git. It's in `.gitignore` by default.

### 5. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploying to Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Add your env vars in the Vercel dashboard under **Settings → Environment Variables**.

---

## Viewing collected emails

In your Supabase dashboard → **Table Editor → leads**. You can also export as CSV.

---

## Optional: Add social proof

When you have real testimonials, uncomment and fill the `testimonials` array in `config.js`. The section auto-hides when the array is empty.

---

## File structure

```
landing-starter-kit/
├── config.js                  ← Edit this (brand, copy, colors)
├── src/
│   ├── app/
│   │   ├── layout.jsx         ← HTML shell + fonts
│   │   ├── page.jsx           ← Full page layout
│   │   └── globals.css        ← Tailwind + base styles
│   ├── components/
│   │   ├── EmailForm.jsx      ← Email capture (used in Hero + Footer)
│   │   └── FaqAccordion.jsx   ← Animated FAQ
│   └── lib/
│       ├── supabase.js        ← Supabase client
│       └── actions.js         ← Server action (insert email)
├── package.json
├── tailwind.config.js
├── next.config.js
└── README.md
```
