# Deploy Swifttle to Vercel

This app is ready for Vercel: it detects Next.js automatically. You need two free accounts — [GitHub](https://github.com) (to hold the code) and [Vercel](https://vercel.com) (to host it) — plus a free [Neon](https://neon.tech) Postgres database.

## 1. Create the database

1. Sign up at neon.tech and create a project (any region; Ghana is UTC+0).
2. On the project dashboard, copy the **connection string**. It looks like
   `postgres://user:pass@host/db?sslmode=require`.
3. Keep it private — it is a password. The app creates all tables on first request, so there is nothing else to set up in Neon.

## 2. Put the code on GitHub

### Option A — GitHub website (no Git or Node needed on your computer)

1. Go to https://github.com/new, name the repository `swifttle`, choose Public or Private, leave all "Initialize" boxes unchecked, and click **Create repository**.
2. On the next page click the **uploading an existing file** link.
3. Drag in **everything from this folder**: the `app`, `components`, `lib` and `public` folders, plus `package.json`, `vercel.json`, `README.md`, `DEPLOY.md`, `.gitignore`, `.vercelignore` and `.env.example`.
   - Do **not** upload `node_modules`, `.next`, `.env.local` or any file containing your Neon password.
4. Click **Commit changes**.

### Option B — Git on a computer that has it installed

```
git init
git add .
git commit -m "Swifttle shuttle app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/swifttle.git
git push -u origin main
```

Replace the URL with your repository's URL. `.vercelignore` and `.gitignore` keep secrets and `node_modules` out of the upload.

## 3. Import into Vercel

1. In Vercel click **Add New → Project**, then import the GitHub repository.
2. Framework preset should say **Next.js**. Leave the build command as `npm run build` (it is also in `vercel.json`).
3. Open **Environment Variables** and add:

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | the Neon connection string from step 1 |
   | `TZ_OFFSET_MINUTES` | `0` |
   | `OWNER_UID` | leave empty for now |

4. Click **Deploy**. Wait for the build to finish and open the provided URL.

## 4. Make yourself the operator

1. In the app, sign up as a **Passenger** (this will be your admin account).
2. Open **Account → Device ID**, copy the 20-character value.
3. In Vercel: **Settings → Environment Variables**, set `OWNER_UID` to that value, then **Deployments → Redeploy** (or push a small commit).
4. A **Driver approvals** card now appears in your Account tab.

## 5. Test the shuttle and live media

1. Open the site in a private window or on another phone, sign up as a **Driver**, pick a route, then approve that account from your operator window.
2. Driver opens **Trip → Start trip → Shuttle cam → Open camera**, then shares a **Photo** or **Clip** (camera permission required; Vercel provides HTTPS).
3. Passengers see new posts appear in the **Feed** tab and on the **Live** tab within seconds.

If something fails, check the Vercel **Deployment → Runtime Logs**. A `DATABASE_URL is not set on the server` message means step 3's environment variable is missing.

## Adding your own images and videos

Put files in `public/media/` and reference them as `/media/your-file.jpg` or `/media/your-file.mp4`:

- To change the preview artwork, edit `lib/demoMedia.js` (the `src` and optional `poster` fields).
- To change the sign-in hero image, edit the `<img src="/media/hero-shuttle.svg">` line in `components/AuthScreen.jsx`.
- Commit and push; Vercel redeploys automatically.

Recommended formats: JPEG/PNG/WebP images and MP4 (H.264) or WebM clips, 1280px wide or smaller. You can also upload real media from the driver device — no file editing needed.

## Optional: deploy with the Vercel CLI instead of the website (requires Node.js)

```
npm install -g vercel
vercel login
vercel link          # choose your project
vercel env add DATABASE_URL
vercel env add TZ_OFFSET_MINUTES
vercel --prod
```
