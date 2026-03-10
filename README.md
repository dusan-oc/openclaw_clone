# ✨ Glimr — Link-in-Bio for Creators

**The Linktree alternative built for influencers. No censorship. No paywalls.**

Glimr is a full-stack link-in-bio platform where creators can share all their links in one beautiful page — including OnlyFans, Fansly, and Telegram. Unlike Linktree, **we don't ban adult content.**

---

## Features

### For Creators
- 🔗 **Unlimited links** — Add, reorder, enable/disable anytime
- 🎨 **3 free themes** — Classic (dark), Neon (vibrant), Soft (pastel)
- 📊 **Full analytics free** — Visits, clicks, referrers, 30-day charts, top links
- 🔓 **No content restrictions** — Link to OnlyFans, Fansly, Telegram — whatever
- 📱 **Mobile-first** — Public pages optimized for Instagram/TikTok traffic
- 🔒 **SSR public profiles** — Fast, SEO-friendly server-side rendered pages

### Platform
- 👤 User registration + NextAuth v5 credentials authentication
- 🏠 Beautiful landing page with feature highlights
- 📊 Analytics dashboard with 30-day charts, CTR, top links, traffic sources
- ⚙️ Settings: display name, bio, avatar, theme picker
- 👑 Admin panel: user management, enable/disable accounts, platform stats

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | SQLite (better-sqlite3) |
| ORM | Drizzle ORM |
| Auth | NextAuth v5 (credentials) |
| Password | bcryptjs |

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Seed the database

```bash
npx tsx scripts/seed.ts
```

This creates the SQLite database (`glimr.db`) and three demo accounts.

### 3. Start the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Default Accounts

| Role | Email | Password | Username | Theme |
|------|-------|----------|----------|-------|
| Admin | admin@glimr.io | Admin1234! | admin | classic |
| Creator | alex@demo.com | Demo1234! | alexmucci | neon |
| Creator | violet@demo.com | Demo1234! | violetxo | soft |

**Demo profile pages:**
- [localhost:3000/alexmucci](http://localhost:3000/alexmucci) — Neon theme
- [localhost:3000/violetxo](http://localhost:3000/violetxo) — Soft theme

---

## Architecture

### Database Schema

```
users         — id, email, username, password_hash, display_name, bio, avatar_url, role, theme, enabled, created_at
links         — id, user_id, title, url, icon, position, enabled, click_count, created_at
page_views    — id, user_id, timestamp, ip_hash, user_agent, referrer, country
link_clicks   — id, link_id, user_id, timestamp, ip_hash, referrer
```

### File Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── (auth)/
│   │   ├── login/page.tsx          # Login
│   │   └── register/page.tsx       # Registration
│   ├── dashboard/
│   │   ├── page.tsx                # Dashboard (links + settings tabs)
│   │   └── analytics/page.tsx      # Analytics dashboard
│   ├── admin/page.tsx              # Admin panel
│   ├── [username]/page.tsx         # Public profile page (SSR)
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/      # NextAuth handler
│       │   └── register/           # Registration endpoint
│       ├── links/                  # Link CRUD
│       ├── analytics/
│       │   ├── click/              # Click tracking + 302 redirect
│       │   └── stats/              # Analytics stats
│       ├── admin/users/            # Admin user management
│       └── user/settings/          # Profile settings
├── components/
│   ├── ProfilePage.tsx             # Public profile (Classic/Neon/Soft themes)
│   ├── DashboardClient.tsx         # Dashboard interactive UI
│   └── AdminClient.tsx             # Admin panel interactive UI
└── lib/
    ├── auth.ts                     # NextAuth v5 config
    ├── utils.ts                    # cn(), hashIP(), getClientIP()
    └── db/
        ├── index.ts                # DB singleton
        ├── schema.ts               # Drizzle schema
        └── queries.ts              # Query helpers
scripts/
└── seed.ts                         # Database seeder
```

### Analytics Privacy

- **No raw IP storage** — IPs are hashed: `SHA256(ip + ua + date + salt).slice(0, 16)`
- Daily uniqueness: same visitor counted once per day per profile
- **302 redirects** (never 301) — ensures every click hits the server
- Referrers parsed to human-readable platform names (Instagram, TikTok, etc.)

### Click Tracking

Link clicks use a server-side 302 redirect approach:

```
User clicks link → /api/analytics/click?linkId=X&url=encoded_url
                → Server logs click to DB
                → 302 redirect to destination
```

No JavaScript required. Works even with JS disabled.

---

## Why Glimr?

Linktree **bans adult content creators**. Their ToS restricts "sexually explicit content", and creators using OnlyFans or Fansly have been removed.

Glimr fills this gap:
- ✅ Adult content allowed (within legal limits)
- ✅ RTA meta label on all public profiles
- ✅ Full analytics on free tier (Linktree gates these behind $9+/mo)
- ✅ All themes free (Linktree's best themes are paid)
- ✅ No Linktree branding tax

---

## License

Private — for Dusan's use. Not open source.
