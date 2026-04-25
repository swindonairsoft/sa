# Swindon Airsoft — Website

Full-stack Next.js airsoft booking website with Supabase, Stripe, and Resend.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (Pages Router) |
| Styling | Tailwind CSS + custom CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Stripe Checkout |
| Email | Resend |
| Hosting | Vercel |
| Repo | GitHub |
| Backups | Google Drive (via GitHub Actions) |

## Project Structure

```
swindon-airsoft/
├── pages/                  # One file per page
│   ├── index.js            # Home
│   ├── events/
│   │   ├── index.js        # Events listing
│   │   └── [id].js         # Single event + booking
│   ├── pricing.js
│   ├── gallery.js
│   ├── rules.js
│   ├── contact.js
│   ├── profile/
│   │   ├── index.js        # Player profile
│   │   ├── waiver.js       # Waiver signing
│   │   └── ukara.js        # UKARA application
│   ├── admin/
│   │   ├── index.js        # Admin dashboard
│   │   ├── events.js       # Manage events
│   │   ├── players.js      # Player list
│   │   ├── ukara.js        # UKARA applications
│   │   └── bookings/[id].js
│   ├── auth/
│   │   ├── login.js
│   │   ├── register.js
│   │   └── callback.js
│   └── api/                # API routes
│       ├── bookings/
│       ├── admin/
│       ├── waiver/
│       ├── ukara/
│       └── webhooks/stripe.js
├── components/             # Reusable UI
│   ├── Layout.js
│   ├── Navbar.js
│   ├── Footer.js
│   └── EventCard.js
├── lib/                    # Data access layer (all DB queries)
│   ├── supabase.js         # Supabase client
│   ├── events.js           # Events queries
│   ├── bookings.js         # Bookings queries
│   ├── players.js          # Player/profile queries
│   ├── waivers.js          # Waiver queries
│   ├── ukara.js            # UKARA queries
│   ├── email.js            # Email sending
│   ├── stripe.js           # Stripe helpers
│   └── auth.js             # Auth helpers
├── styles/
│   └── globals.css
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── scripts/
│   ├── backup.sh           # Manual backup script
│   └── install-hooks.sh    # Install git pre-commit hook
└── .github/
    └── workflows/
        └── deploy.yml      # CI/CD + auto Google Drive backup
```

## Setup Guide

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/swindon-airsoft.git
cd swindon-airsoft
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase/migrations/001_initial_schema.sql`
3. Copy your Project URL and anon key from Settings > API

### 3. Stripe Setup

1. Create account at [stripe.com](https://stripe.com)
2. Get publishable and secret keys from Dashboard > Developers > API keys
3. Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Events to listen for: `checkout.session.completed`, `charge.refunded`

### 4. Resend Setup

1. Create account at [resend.com](https://resend.com)
2. Add and verify your domain
3. Create an API key

### 5. Environment Variables

```bash
cp .env.example .env.local
# Fill in all values in .env.local
```

### 6. First Admin User

After deploying, sign up with the email matching `ADMIN_EMAIL` in your env vars. Then in Supabase SQL Editor run:
```sql
INSERT INTO admin_users (user_id)
SELECT id FROM profiles WHERE email = 'admin@swindonairsoft.com';
```

### 7. Deploy to Vercel

```bash
npx vercel
# Follow prompts, add env vars in Vercel dashboard
```

### 8. GitHub Actions Secrets

In your GitHub repo > Settings > Secrets, add:
- `VERCEL_TOKEN` — from vercel.com/account/tokens
- `VERCEL_ORG_ID` — from `.vercel/project.json`
- `VERCEL_PROJECT_ID` — from `.vercel/project.json`
- `GOOGLE_DRIVE_SA_KEY` — Google Service Account JSON key
- `GOOGLE_DRIVE_BACKUP_FOLDER_ID` — ID from your Google Drive backup folder URL

### 9. Install Git Backup Hook (Local)

```bash
# Auto-backup before every commit
bash scripts/install-hooks.sh
```

## Backup System

**Automatic (on every push to main):**
- GitHub Actions creates a timestamped zip
- Uploads to your Google Drive backup folder
- Format: `swindon-airsoft_backup_YYYYMMDD_HHMMSS_GITHASH.zip`

**Manual:**
```bash
bash scripts/backup.sh
```

**Local pre-commit hook:**
- After running `install-hooks.sh`, a backup is automatically created before every `git commit`
- Keeps last 10 local backups

## Key Features

- **Events** — Create/manage with capacity, pricing, event type
- **Bookings** — Stripe checkout, filter by event date, resend tickets, refunds, move dates
- **Waivers** — Single comprehensive waiver with section checkboxes, U18 parent consent popup, pyro blocked for U18 (UK Fireworks Act), all edits need admin approval
- **Player Profiles** — Full profile with address, contact, DOB; edits need admin approval
- **UKARA** — £5/year, requires 3 game days in last 12 months, game days auto-logged on check-in
- **Admin Dashboard** — Revenue stats, bookings by event, waiver approval queue, UKARA management
- **Email** — Confirmation tickets, waiver approvals/rejections, UKARA notifications, refund confirmations
- **Mobile friendly** — Responsive across all pages and breakpoints
