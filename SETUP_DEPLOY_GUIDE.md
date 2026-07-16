# 🏫 School Result Management System - Setup & Deploy Guide

Welcome! This guide will walk you through setting up the database and deploying the School Result Management System to Cloudflare Pages at **godgenerals.pages.dev**.

---

## 📋 Overview

| Component | Technology |
|-----------|-----------|
| **Frontend** | Next.js 15 (App Router) + TypeScript + Tailwind CSS |
| **Backend** | Next.js API Routes + Server Actions |
| **Database** | PostgreSQL (via InsForge) |
| **ORM** | Prisma |
| **Hosting** | Cloudflare Pages (Workers) via OpenNext |
| **Domain** | godgenerals.pages.dev |

---

## 🔧 Prerequisites

You'll need these accounts (all free):

1. **GitHub account** ✅ (already have - repo created)
2. **InsForge account** (for PostgreSQL database) - [insforge.dev](https://insforge.dev/)
3. **Cloudflare account** - [dash.cloudflare.com](https://dash.cloudflare.com/sign-up)
4. **GitHub token** ✅ (already provided)

---

## 🗄️ Step 1: Set Up InsForge Database

> **InsForge** is an open-source backend platform that includes PostgreSQL. Setting it up gives you a free PostgreSQL database for your school result system.

### Option A: Using Zeabur (Easiest - Recommended)

1. **Create a free Zeabur account** at [zeabur.com](https://zeabur.com/)
2. **Create a new project** (e.g., "school-result")
3. **Add Integration → InsForge**
   - This automatically deploys InsForge with a PostgreSQL database
   - Zeabur handles the networking between the app and database
4. **Get your PostgreSQL connection string**:
   - Go to your Zeabur project dashboard
   - Look for the **InsForge icon** below the "Add Service" button
   - Click it to access the InsForge Information Page
   - Find the **External Connection String** - it looks like:
     ```
     postgresql://user:password@host:5432/dbname?schema=public
     ```

### Option B: Direct InsForge Setup

1. Go to [insforge.dev](https://insforge.dev/) and sign up
2. Create a new project
3. Follow the dashboard instructions to get your PostgreSQL connection string

---

## ⚙️ Step 2: Configure the Database Connection

1. **Open the `.env` file** in the project root and replace the placeholder with your actual InsForge PostgreSQL connection string:

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@YOUR_HOST:5432/YOUR_DB?schema=public"
JWT_SECRET="your-secret-key-change-this-to-something-random"
NEXT_PUBLIC_APP_URL="https://godgenerals.pages.dev"
```

2. **Install dependencies and generate Prisma client** (in your terminal):

```bash
cd school-result
npm install --legacy-peer-deps
npx prisma generate
```

3. **Push the schema to your database**:

```bash
npx prisma db push
```

4. **Seed the database with default data**:

```bash
node prisma/seed.js
```

After seeding, you'll have:
- **Admin login:** `admin@school.com` / `admin123`
- **Teacher login:** `teacher@school.com` / `teacher123`
- 23 default subjects (Mathematics, English, Physics, etc.)
- 18 classes (JSS 1-3 A/B/C, SS 1-3 A/B/C)
- Terms for the current year

---

## 🚀 Step 3: Deploy to Cloudflare Pages

### Connect GitHub to Cloudflare

1. **Log in** to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. **Go to Workers & Pages** (left sidebar)
3. Click **Create** → **Pages** → **Connect to Git**
4. **Authorize GitHub** and select the `school-result-system` repository
5. In the **Set up builds and deployment** section:

| Setting | Value |
|---------|-------|
| **Framework preset** | Select **"None"** (important: Cloudflare Pages needs custom config for OpenNext) |
| **Build command** | `npx opennextjs-cloudflare build` (for CI/CD; `npm run deploy` for manual deploys from your local machine) |
| **Build output directory** | `.open-next` |
| **Root directory** | `/` (leave default) |

### Set Environment Variables in Cloudflare

In the Cloudflare Pages dashboard, go to **Settings** → **Environment variables** and add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your InsForge PostgreSQL connection string |
| `JWT_SECRET` | Your secret key |
| `NEXT_PUBLIC_APP_URL` | `https://godgenerals.pages.dev` |

### Deploy

6. Click **Save and Deploy**
7. Wait for the build to complete (~3-5 minutes)

---

## 🌐 Step 4: Set Up Custom Domain

1. In your Cloudflare Pages project, go to **Custom domains** tab
2. Click **Set up a domain**
3. Enter `godgenerals.pages.dev`
4. Cloudflare will automatically configure the DNS

> Your site will be live at `https://godgenerals.pages.dev` 🎉

---

## 🛠️ Step 5: Post-Deployment Setup

### 1. Log in as Admin
- Go to `https://godgenerals.pages.dev`
- **Click the Teacher Portal card 3 times** to reveal the login modal
- Sign in with: `admin@school.com` / `admin123`

### 2. Configure School Settings
- Go to **Settings** in the admin sidebar
- Set your school name, address, phone, email
- **Upload the school logo** (logo.jpeg from the project folder)
- **Upload principal signature** (extract from logo.jpeg)
- Set principal name

### 3. Assign Subjects to Classes
- Go to **Subjects** → Click **Add Default Subjects**
- Go to **Classes** → For each class, click **"Assign Subject"**

### 4. Create Teachers
- Go to **Teachers** → **Add Teacher**
- Fill in teacher details and password
- Then go to **Classes** and assign teachers to subjects

### 5. Register Students
- Go to **Students** → **Add Student**
- Each student gets a unique PIN
- **Share the PIN with students** so they can check their results

### 6. Teacher Instructions
- Teachers log in by clicking the **Teacher Portal card 3 times**
- They'll see their assigned classes
- Click a class → see students → **Scores** to input marks
- **Report** to write remarks and add signature
- **Calculate Positions** to rank students
- **Publish Result** to make it visible to students

### 7. Student Instructions
- Students go to the homepage → **Check Your Result**
- Enter **Admission Number** and **PIN**
- View and **Download** result as PDF

---

## 📁 Project Structure

```
school-result/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.js                # Seed script with default data
├── public/
│   ├── logo.jpeg              # School logo
│   └── template.jpeg          # Result template reference
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page (with hidden 3-click login)
│   │   ├── login/             # (login modal appears on homepage)
│   │   ├── student/           # Student result checking
│   │   ├── admin/             # Admin dashboard
│   │   ├── teacher/           # Teacher dashboard
│   │   └── api/               # API route handlers
│   ├── components/
│   │   ├── ResultTemplate.tsx  # Paper-format result display
│   │   ├── SignaturePad.tsx    # Canvas-based signature drawing
│   │   └── Navbar.tsx          # Navigation bar
│   └── lib/
│       ├── prisma.ts           # Prisma client
│       ├── auth.ts             # Authentication utilities
│       ├── utils.ts            # Grading, PIN, remark helpers
│       └── actions.ts          # Server actions
├── wrangler.jsonc              # Cloudflare Workers config
├── open-next.config.ts         # OpenNext adapter config
├── .env                        # Environment variables
└── package.json
```

---

## 💡 Key Features

### ✅ Automatic Calculations
- **Grades:** A (80-100), B (70-79), C (60-69), D (50-59), E (40-49), F (0-39)
- **Position:** Automatically calculated when you click "Calculate Positions"
- **Teacher Remark:** Auto-generated based on average score

### ✅ Result Template (Paper Format)
- Removed "Sign" column from the table ✅
- Removed "Duplicate" text ✅
- Underscores replaced with real data ✅
- Teacher signature (drawn on canvas) ✅
- Principal signature (auto from uploaded image) ✅
- Teacher report & Principal report sections ✅

### ✅ Security
- **Hidden teacher/admin login** (click 3 times to reveal)
- **Student PIN-based access** (4-digit PIN)
- **Session-based auth** with cookies
- **Role-based access** (admin vs teacher permissions)

---

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| **Database connection error** | Check that `DATABASE_URL` is correct in Cloudflare environment variables |
| **Blank page on deploy** | Verify the build output directory is `.open-next` and the framework preset is correct |
| **Login not working** | Make sure you seeded the database. Use `node prisma/seed.js` |
| **Images not loading** | Upload logo and signature again through the Settings page after deployment |
| **Positions not calculating** | Make sure scores are saved first, then click "Calculate Positions" |
| **Student can't see result** | Teacher must click "Publish Result" after entering scores |

---

## 📞 Need Help?

- **InsForge Docs:** [docs.insforge.dev](https://docs.insforge.dev/)
- **Cloudflare Pages Docs:** [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages/)
- **OpenNext Docs:** [opennext.js.org/cloudflare](https://opennext.js.org/cloudflare)

---

**🎉 Your School Result Management System is ready!**
