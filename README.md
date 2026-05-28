# 📚 BookFlix

> A mobile-first book rental platform — browse, rent, and manage books with ease.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨ Features

### For Customers
- 🔍 **Browse & Search** — Filter books by genre, availability, and keyword
- 📖 **Book Detail Pages** — Full info with cover images, descriptions, and series grouping
- 📦 **Rent Requests** — Submit rental requests via a form; track status in real time
- ⭐ **Ratings** — Rate books after they are returned
- 💡 **Suggest Books** — Submit and track book suggestions
- 🔔 **Notifications** — Real-time bell notifications for rental status updates
- 📍 **Map-Based Address Picker** — Leaflet-powered delivery location selector
- 📱 **PWA Support** — Installable as a home screen app on mobile

### For Admins
- 📋 **Dashboard** — Overview of all rentals, users, and requests
- 📚 **Book Management** — Add, edit, delete books with image upload (Supabase Storage)
- 🗂️ **Genre Management** — Create and manage genres
- 👥 **User Management** — View users, manage bans and blocked IPs
- 📣 **Announcements** — Broadcast messages to all users
- 🟢 **Online Presence** — See which users are currently active
- 📊 **Suggestion Review** — Approve or reject user-submitted book suggestions

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Backend / Auth | [Supabase](https://supabase.com/) |
| Styling | Vanilla CSS (custom design system) |
| Maps | [Leaflet](https://leafletjs.com/) + [React Leaflet](https://react-leaflet.js.org/) |
| Analytics | [Vercel Analytics](https://vercel.com/analytics) + Speed Insights |
| PWA | Custom service worker |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com/) project

### 1. Clone & Install
```bash
git clone https://github.com/your-username/bookflix.git
cd bookflix
npm install
```

### 2. Set Up Supabase
1. In your Supabase project, open the **SQL Editor** and run [`supabase-schema.sql`](./supabase-schema.sql) to create all tables.
2. Go to **Storage** and create a public bucket named `book-covers`.

### 3. Configure Environment Variables
```bash
cp .env.example .env.local
```

Fill in your keys in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: Tawk.to live chat
NEXT_PUBLIC_TAWK_PROPERTY_ID=your-property-id
NEXT_PUBLIC_TAWK_WIDGET_ID=your-widget-id

# WhatsApp rental notifications
NEXT_PUBLIC_WHATSAPP_NUMBER=your-number-with-country-code
```

### 4. Run Locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
bookflix/
├── public/               # Static assets (icons, manifest, OG image)
├── src/
│   ├── app/
│   │   ├── admin/        # Admin dashboard & management pages
│   │   ├── customer/     # Customer browse, rentals, suggestions
│   │   ├── browse/       # Public book browsing
│   │   ├── login/        # Auth pages
│   │   └── api/          # Next.js API routes
│   ├── components/       # Shared UI components
│   └── lib/              # Supabase client helpers
├── supabase-schema.sql   # Full database schema
└── .env.example          # Environment variable template
```

---

## 🗄️ Database

The full schema is in [`supabase-schema.sql`](./supabase-schema.sql). Key tables:

- `books` — Book listings with metadata and availability
- `rentals` — Rental requests and status tracking
- `suggestions` — User-submitted book suggestions
- `announcements` — Admin broadcast messages
- `banned_ips` — IP-level access control

---

## 📜 Terms & Conditions

See [`BookFlix_Terms_and_Conditions.md`](./BookFlix_Terms_and_Conditions.md).

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
