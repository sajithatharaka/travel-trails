# 🌿 Travel Trails — The 7-Day Sri Lanka Escape

A single-trip landing page for Travel Trails: hero, route, day-by-day
itinerary, pricing tiers, testimonials, and an enquiry form.

---

## Stack

- **Next.js** (App Router) + **Tailwind CSS**
- No database. No custom backend. The enquiry form emails you directly
  via [Web3Forms](https://web3forms.com) — see below.

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure your trip enquiry emails

The enquiry form ([src/components/BookingForm.jsx](src/components/BookingForm.jsx))
submits straight from the browser to Web3Forms' public API, which emails
the submission to you. No server code, no database, nothing to host.

1. Go to [web3forms.com](https://web3forms.com) and enter your email to get
   a free access key (no account required).
2. Create `.env.local` in the project root:

   ```env
   NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=your-access-key
   ```

3. That's it — every submission on the site now lands in your inbox.

> Alternatives if you'd rather not use Web3Forms: swap the `fetch` call in
> `BookingForm.jsx` for [Formspree](https://formspree.io) or
> [EmailJS](https://www.emailjs.com) — both work the same way, client-side,
> no backend required.

### 3. Edit content

Open [config.js](config.js) — headline, route stops, day-by-day itinerary,
pricing tiers, testimonials, and contact details all live there. Colors
live in [tailwind.config.js](tailwind.config.js) (the Travel Trails jungle
& terracotta palette).

### 4. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploying to Vercel

```bash
npm install -g vercel
vercel
```

Add `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` under **Settings → Environment
Variables**. Since there's no backend or database, this also deploys fine
as a static export on any static host if you prefer.

---

## Photos

Every image on the page is currently a labeled placeholder — hero slides,
the route map, each itinerary day, and guest avatars
([src/components/ImageSlot.jsx](src/components/ImageSlot.jsx)).

**To add one: drop a file into [public/images/](public/images/) with the
right name — nothing else to edit.** Filenames are matched automatically
(`.jpg`, `.jpeg`, `.png`, or `.webp`), for example:

- `public/images/hero-1.jpg` → first hero slide
- `public/images/route-map.jpg` → route section map
- `public/images/day-sigiriya.jpg` → the Sigiriya itinerary day
- `public/images/avatar-1.jpg` → first testimonial's guest photo

Full filename list and recommended sizes in
[public/images/README.md](public/images/README.md). Restart `npm run dev`
(or rerun `npm run build`) after adding files — the lookup happens at
build time.

---

## File structure

```
travel-trails/
├── config.js                    ← Edit this (copy, itinerary, pricing, contact)
├── src/
│   ├── app/
│   │   ├── layout.jsx           ← HTML shell + metadata
│   │   ├── page.jsx             ← Full page layout, all sections
│   │   └── globals.css          ← Tailwind + base styles
│   └── components/
│       ├── HeroSlider.jsx       ← Auto-rotating hero background + dots
│       ├── ImageSlot.jsx        ← Placeholder for a photo not added yet
│       └── BookingForm.jsx      ← Enquiry form → Web3Forms (no backend)
├── package.json
├── tailwind.config.js           ← Travel Trails color palette
├── next.config.js
└── README.md
```
