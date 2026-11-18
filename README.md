# Swifttle

Campus shuttle app: passengers reserve seats and get a QR ticket, an approved driver runs the trip, and everybody can watch **live photos and short video clips sent from the driver's device**. The driver's phone *is* the shuttle — its camera is the live feed. Also includes a live map, ETAs, check-in by ticket code, demo card checkout, and dark mode. Built with Next.js 14 and Neon Postgres. Independent prototype, not affiliated with the University of Cape Coast.

## Deploy to Vercel (free)

The whole app runs on Vercel's serverless functions plus one free Neon database. No other accounts or services are needed — media is stored in the same database.

1. **Database.** Create a free project at [neon.tech](https://neon.tech). Copy the connection string from its dashboard (starts with `postgres://`, ends with `?sslmode=require`). Tables are created automatically on the first request.
2. **Code.** Create a new GitHub repository, upload the contents of this folder (`app`, `components`, `lib`, `package.json`, etc.). Do **not** upload `.env.local`, `.next` or `node_modules`.
3. **Vercel.** At [vercel.com](https://vercel.com) choose *Add New → Project*, import the repository, then in *Settings → Environment Variables* add:
   - `DATABASE_URL` = your Neon connection string
   - `TZ_OFFSET_MINUTES` = `0` (Ghana is UTC+0 all year)
   - leave `OWNER_UID` empty for now

   Click **Deploy**. Vercel detects Next.js automatically; no build settings needed.
4. **Create your accounts.** Open the site. Sign up as a *Passenger* first (this will be your operator account), then try booking a seat.
5. **Become the operator.** In the *Account* tab copy your **Device ID**. Back in Vercel, add `OWNER_UID` = that value and use *Deployments → Redeploy*. A *Driver approvals* card now appears in Account.
6. **Try the shuttle.** Open the site in a private window or on another phone (each browser is a different device), sign up as a *Driver*, then approve that account from your operator window. The driver opens the **Trip** tab, starts a trip, taps **Shuttle cam → Open camera**, and shares a **Photo** or a **Clip**. Passengers see posts appear in the **Feed** tab and as a strip on **Live**, refreshing every 6 seconds.

Camera access needs HTTPS (Vercel provides it) or `localhost`, and the browser will ask for camera/microphone permission. Nothing is uploaded until the driver taps a share button; the camera can be turned off at any time.

## Run locally

```
npm install
cp .env.example .env.local     # paste your DATABASE_URL into .env.local
npm run dev
```

Open http://localhost:3000. `OWNER_UID` and `TZ_OFFSET_MINUTES` can go in `.env.local` too.

## Feature tour

- **Book** — pick a route, day and departure; reserve up to 4 seats; demo card (or pay on board) and a QR ticket. Promo code `SWIFTTLE10` takes 10% off. Card `4242 4242 4242 4242` works; a number ending `0002` is declined.
- **Live** — schematic map with ETAs. Real driver trips replace the simulated demo fleet; the bus position follows the driver's stop updates.
- **Feed** — live photos and ≤8-second video clips from the driver device, with auto-refresh, photo lightbox and route filter. Drivers (and the operator) can remove their posts.
- **Trip** (driver) — start a trip, tap arrivals/departures, and use the Shuttle cam to publish to the feed. The route and live trip attached to each post are decided by the server.
- **Manifest** (driver) — check passengers in by typing the 6-character code under their QR code, or seat by seat.
- **Account** — Device ID, driver approvals (operator only), sign out, delete account.

## How it is built

| Path | What it does |
| --- | --- |
| `app/page.jsx`, `app/layout.jsx`, `app/globals.css` | Entry page, metadata, fonts and all styling |
| `app/api/[...kestrel]/route.js` | Every `/api/...` endpoint, including `media` (GET), `shareMedia` and `removeMedia` |
| `components/AppContext.jsx`, `App.jsx`, `Shell.jsx` | Shared state, 5-second state refresh, role-based tabs |
| `components/ShuttleCam.jsx`, `ShuttleFeed.jsx` | Driver camera capture (MediaRecorder + canvas) and the self-refreshing live media feed |
| `components/AuthScreen.jsx`, `Account.jsx` | Sign in/sign up, operator approvals |
| `components/book/`, `SeatGrid.jsx`, `RouteMap.jsx`, `Ticket.jsx`, `QrCode.jsx` | Booking steps and reusable UI pieces |
| `components/LiveView.jsx`, `components/driver/` | Passenger live view and driver trip/manifest screens |
| `lib/hooks.js`, `format.js`, `live.js`, `api.js` | Clock, seat/media polling, bus position maths, helpers |
| `lib/network.js` | Routes, stops, fares, timetables and promo code |
| `lib/db.js` | Neon connection and automatic table creation (including `media`) |

## Security and limits

- Login is a random httpOnly cookie; the public Device ID is a one-way hash of it. Prices, codes, departure times, the driver's route and the trip attached to media are all decided on the server. Passengers cannot see other passengers' names or post to the feed.
- Seats and tickets are written in one database transaction, so a race cannot leave half a booking.
- Media is base64 text in Neon (JPEG/PNG/WebP photos up to ~2 MB, WebM/MP4 clips up to ~2.7 MB). The browser compresses photos and caps clips at 8 seconds; posts are deleted after 7 days. For heavy video traffic, swap the `media` table for Vercel Blob storage.
- Card payment is a demo: no real money moves and only the last four digits are stored.
- Live bus position is estimated from the driver tapping arrived/departed, not GPS. Real GPS would be the next step, with the driver device broadcasting coordinates.
- There is no rate limiting on the API.
