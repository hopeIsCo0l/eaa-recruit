# EAA-Recruit Deployment Manual

End-to-end deployment guide for the EAA-Recruit stack to a cloud platform where outbound SMTP (Gmail :587) works. Primary target: **Railway**. A Render alternative is documented at the end.

---

## 1. Architecture Recap

Six runtime components, all containerised:

| # | Service       | Tech                       | Port (internal) | Notes                                     |
|---|---------------|----------------------------|-----------------|-------------------------------------------|
| 1 | `postgres`    | Postgres 16                | 5432            | Flyway migrates schema on backend boot    |
| 2 | `redis`       | Redis 7                    | 6379            | Used for OTP cache + rate limit           |
| 3 | `backend`     | Spring Boot 3.2.5 / Java 21| 8080            | The main API. Dockerfile in `backend/`    |
| 4 | `ai-service`  | FastAPI / Python 3.11      | 8000            | Resume parsing, grading. Internal-only    |
| 5 | `exam-engine` | Go 1.23                    | 8090            | Coding-exam runner. Internal-only         |
| 6 | `frontend`    | Next.js 16 (Turbopack)     | 80 (3000 dev)   | Public. Proxies `/api/v1/*` → backend     |

Public traffic: `frontend` only. Backend exposed for direct `/api/v1` clients (e.g. curl). `ai-service` and `exam-engine` reachable only on the platform's private network.

Trust links:
- frontend → backend (HTTP, via `BACKEND_URL`)
- backend ↔ ai-service ↔ exam-engine (HTTP, secured by shared `INTERNAL_API_KEY`)

---

## 2. Pre-deploy Checklist

Before touching the platform, finish these in the repo / locally:

- [ ] **Commit and push the current branch** to GitHub (`feat/new-frontend` or merge to `main` first). Platforms deploy from a remote.
- [ ] **Generate production secrets** (do NOT reuse dev values):
  - `JWT_SECRET` — 256-bit random hex
    ```powershell
    -join ((1..64) | ForEach-Object { '{0:x}' -f (Get-Random -Max 16) })
    ```
  - `INTERNAL_API_KEY` — 32-byte URL-safe random
    ```powershell
    [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Max 256 }) -as [byte[]])
    ```
  - `MAIL_PASS` — 16-char Gmail App Password for `ethirecruit@gmail.com` (already provisioned: `rbajiqvnjirujvxk`)
  - Save these in a password manager BEFORE pasting into the platform — you'll need them twice (backend + ai-service + exam-engine share `INTERNAL_API_KEY`).
- [ ] **Confirm Flyway migrations are clean locally**: backend started without error → schema v11 applied.
- [ ] **Decide what to do about file uploads** (`cv-uploads/`, `xai-reports/`). Ephemeral container filesystem will lose these on restart. Options:
  - Accept loss for now (student demo) — uploaded CVs vanish on redeploy.
  - Mount a Railway Volume to `/app/cv-uploads` (paid: $0.25/GB/mo).
  - Switch to S3-compatible storage (R2, B2, S3) — code change needed; out of scope for first deploy.
  - **This manual assumes "accept loss" for the initial deploy.** Volumes section is in §9.
- [ ] **`.env` is in `.gitignore`** (already verified) — no creds in repo.

---

## 3. Pick a Platform

| Platform     | Free?                  | Best for                                       | Why or why not                                    |
|--------------|------------------------|------------------------------------------------|---------------------------------------------------|
| **Railway**  | $5/mo credit on trial  | Multi-service Docker apps, fastest setup       | One dashboard, managed Postgres + Redis           |
| Render       | Yes (sleeps on idle)   | Static + single service deploys                | Free Postgres is 90-day expiry; no free Redis     |
| Fly.io       | Generous free tier     | Multi-region, cost-sensitive long term         | Steeper CLI, manual Postgres + Upstash Redis      |
| Heroku       | No (paid only)         | Legacy familiarity                             | More expensive than the above                     |

**This manual uses Railway** for the main walkthrough. Render alternative is in §10.

---

## 4. Railway: First-Time Setup

### 4.1 Account + GitHub link

1. Sign up at https://railway.app via your GitHub account.
2. Verify email (Railway sends one — needed for free trial credit).
3. Click **New Project** → **Deploy from GitHub repo** → authorise Railway to read your `hopeIsCo0l/EAA-recruit` repo (or whichever the remote is).
4. Cancel out — we'll add services one at a time so config is explicit.

### 4.2 Create the project shell

1. **New Project** → name it `eaa-recruit-prod`.
2. The blank project canvas appears. We'll add services to it in §5–§8.

> The platform's private DNS resolves service names. Inside the project, `backend` reaches Postgres at `${{Postgres.RAILWAY_PRIVATE_DOMAIN}}` and Redis at `${{Redis.RAILWAY_PRIVATE_DOMAIN}}`. These templated variables are filled at deploy time. Use them everywhere instead of hard-coded hostnames.

---

## 5. Provision Postgres and Redis

### 5.1 Postgres

1. In the project, click **+ New** → **Database** → **Add PostgreSQL**.
2. Wait for it to provision (~30 s). You'll see two tabs: **Data** and **Variables**.
3. Click **Variables**. Note the auto-generated:
   - `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
   - `DATABASE_URL` (full JDBC-ish URL — but it's `postgresql://`, not `jdbc:postgresql://`)
4. **Important**: Spring Boot expects a JDBC URL. We'll build it from the parts (see §6.3).

### 5.2 Redis

1. **+ New** → **Database** → **Add Redis**.
2. Variables tab provides: `REDISHOST`, `REDISPORT`, `REDISPASSWORD`, `REDIS_URL`.
3. Note: Redis has a password in prod (no password locally). Spring's `spring.data.redis.password` env var handles it — already wired in `application.yml` via `${REDIS_PASSWORD:}`.

---

## 6. Deploy the Backend

### 6.1 Add the service

1. **+ New** → **GitHub Repo** → pick `EAA-recruit`.
2. Railway scans the repo and asks which directory. Set **Root Directory** to `backend`.
3. It detects `Dockerfile` automatically. **Build method**: Dockerfile.
4. Rename the service from the auto-generated name to `backend`. Settings → Service → Service Name.

### 6.2 Public networking

1. **Settings** → **Networking** → **Generate Domain**. Railway issues a `*.up.railway.app` URL like `backend-production-abcd.up.railway.app`. Save this URL — the frontend needs it.
2. Make sure the **target port is 8080** (Railway auto-detects from `EXPOSE 8080` in the Dockerfile, but verify).

### 6.3 Environment variables

In **Variables**, paste these (Railway has a "Raw Editor" for bulk paste):

```ini
# Database — references Postgres service variables
SPRING_DATASOURCE_URL=jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}
SPRING_DATASOURCE_USERNAME=${{Postgres.PGUSER}}
SPRING_DATASOURCE_PASSWORD=${{Postgres.PGPASSWORD}}

# Redis
REDIS_HOST=${{Redis.REDISHOST}}
REDIS_PORT=${{Redis.REDISPORT}}
REDIS_PASSWORD=${{Redis.REDISPASSWORD}}

# Service URLs (private DNS within the project)
AI_SERVICE_URL=http://${{ai-service.RAILWAY_PRIVATE_DOMAIN}}:8000
EXAM_ENGINE_URL=http://${{exam-engine.RAILWAY_PRIVATE_DOMAIN}}:8090

# Secrets — paste real values
JWT_SECRET=<paste 256-bit hex from §2>
INTERNAL_API_KEY=<paste base64 key from §2>

# Mail (Gmail SMTP — works from Railway, not local network)
MAIL_ENABLED=true
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=ethirecruit@gmail.com
MAIL_PASS=rbajiqvnjirujvxk
MAIL_FROM=ethirecruit@gmail.com

# Spring runtime
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=prod
```

> The `${{ServiceName.VAR}}` syntax is Railway-specific templating. It resolves to the actual value at deploy time and updates automatically if the referenced service rotates credentials.

> `ai-service` and `exam-engine` services don't exist yet — Railway will show "unresolved variable" warnings until §7 and §8 are done. That's fine. Backend won't crash on this; the service URLs are only hit when grading or parsing endpoints are called.

### 6.4 First deploy

1. Click **Deploy**.
2. Watch the **Deploys** tab. The Dockerfile build runs (`gradle bootJar`). Takes 3-5 min cold.
3. Once running, open the **Logs** tab. Look for:
   ```
   Started RecruitApplication in X seconds
   Tomcat started on port 8080
   ```
4. Sanity check from your laptop:
   ```powershell
   curl https://backend-production-abcd.up.railway.app/actuator/health
   ```
   Expect `{"status":"UP"}`.

### 6.5 Verify Flyway ran

In Logs, you should see:
```
Successfully validated 11 migrations
Schema "public" is up to date.
```

If migrations failed (e.g. "found checksum mismatch"), Postgres has stale state from a previous deploy attempt. Connect via the Postgres service's **Data** tab and drop the `flyway_schema_history` table, then redeploy.

---

## 7. Deploy ai-service

1. **+ New** → **GitHub Repo** → same `EAA-recruit`. Root Directory: `ai-service`.
2. Rename service to `ai-service`.
3. **Variables**:
   ```ini
   REDIS_URL=redis://default:${{Redis.REDISPASSWORD}}@${{Redis.RAILWAY_PRIVATE_DOMAIN}}:${{Redis.REDISPORT}}
   SPRING_CALLBACK_URL=http://${{backend.RAILWAY_PRIVATE_DOMAIN}}:8080
   INTERNAL_API_KEY=<same value as backend>
   AI_SERVICE_PUBLIC_URL=http://${{ai-service.RAILWAY_PRIVATE_DOMAIN}}:8000
   PORT=8000
   ```

   > `AI_SERVICE_PUBLIC_URL` is what ai-service embeds in the `xaiReportUrl` it sends to Spring on every `/ai-score` callback. Spring later uses that URL to fetch the PDF via `XaiReportService`. It must be reachable from the backend container.
4. **Settings** → **Networking**: do NOT generate a public domain. ai-service is internal.
5. Deploy. In Logs, expect `Uvicorn running on http://0.0.0.0:8000`.

---

## 8. Deploy exam-engine

1. **+ New** → **GitHub Repo** → root `exam-engine`.
2. Rename service to `exam-engine`.
3. **Variables**:
   ```ini
   PORT=8090
   REDIS_ADDR=${{Redis.RAILWAY_PRIVATE_DOMAIN}}:${{Redis.REDISPORT}}
   REDIS_PASSWORD=${{Redis.REDISPASSWORD}}
   SPRING_BASE_URL=http://${{backend.RAILWAY_PRIVATE_DOMAIN}}:8080
   AI_GRADING_URL=http://${{ai-service.RAILWAY_PRIVATE_DOMAIN}}:8000
   INTERNAL_API_KEY=<same value as backend>
   ```
4. No public domain.
5. Deploy. Logs should show `listening on :8090`.

---

## 9. Deploy the Frontend

1. **+ New** → **GitHub Repo** → root `frontend`.
2. Rename to `frontend`.
3. **Variables**:
   ```ini
   BACKEND_URL=https://<backend public domain from §6.2>
   NODE_ENV=production
   PORT=80
   HOSTNAME=0.0.0.0
   ```
4. **Settings** → **Networking** → **Generate Domain**. Note this URL — this is what users visit.
5. **Settings** → **Service** → **Target Port**: `80`.
6. Deploy. Logs should show `started server on 0.0.0.0:80`.

### 9.1 Test the full chain

Open the frontend URL in a browser:
1. `/register` — fill in real email, submit.
2. Backend logs (Railway → backend → Logs) should show:
   ```
   Candidate account created id=X email='you@gmail.com'
   OTP email dispatched to 'you@gmail.com'
   ```
3. Check the inbox. Email from `ethirecruit@gmail.com` with the 6-digit code arrives within ~5 s.
4. Enter the code on `/verify-otp`. Redirect to `/login`. Sign in.

---

## 10. Persistent Storage (optional, deferred)

Container filesystems are ephemeral on Railway. Uploaded CVs and XAI reports in `/app/cv-uploads` and `/app/xai-reports` vanish on every redeploy.

If you want them to persist:

1. Backend service → **Settings** → **Volumes** → **+ Add Volume**.
2. Mount path: `/app/cv-uploads`. Size: 1 GB ($0.25/mo).
3. Repeat for `/app/xai-reports`.
4. Redeploy backend so the new mounts take effect.

For production-grade storage, migrate to S3-compatible (Cloudflare R2 is free up to 10 GB). That's a code change in the upload handlers — out of scope here.

---

## 11. Custom Domain (optional)

1. Frontend service → **Settings** → **Networking** → **Custom Domain** → enter `recruit.yourdomain.com`.
2. Railway shows a CNAME target. Add it at your DNS registrar.
3. Wait for propagation (5–60 min). Railway auto-issues a Let's Encrypt cert.
4. Repeat for backend if you want a clean `api.yourdomain.com` instead of `*.up.railway.app`. Update `BACKEND_URL` on the frontend service when done.

---

## 12. Post-Deploy: Seed an Admin

The seed admin from local dev (`admin@eaa.dz / Test1234!`) is created by Flyway migration `V*__seed_users.sql` if it exists. Confirm:

```powershell
# From Railway's Postgres service Data tab, run:
SELECT email, role, is_active FROM users WHERE role IN ('ADMIN', 'SUPER_ADMIN');
```

If empty, insert manually via Railway's psql shell (Data tab → Query):

```sql
INSERT INTO users (email, password_hash, role, full_name, is_active)
VALUES (
  'admin@eaa.dz',
  '$2a$10$<bcrypt of Test1234! — generate locally>',
  'SUPER_ADMIN',
  'EAA Super Admin',
  true
);
```

To generate the bcrypt hash locally:
```powershell
cd D:/EAA-recruit/backend
./gradlew --quiet bcryptHash -PrawPassword=Test1234! 2>/dev/null
# Or use any online bcrypt tool with cost=10
```

---

## 13. Verifying SMTP From Production

Once backend is up on Railway, prove SMTP isn't blocked there:

```powershell
# Hit register endpoint
curl -X POST https://<backend-public>/api/v1/auth/register/candidate `
  -H "Content-Type: application/json" `
  -d '{"fullName":"SMTP Test","email":"YOUR-INBOX@gmail.com","password":"Test1234!","phone":"+251911000000"}'
```

Watch backend logs. You want:
```
OTP email dispatched to 'YOUR-INBOX@gmail.com'
```

Not:
```
MailConnectException: Couldn't connect to host
MailAuthenticationException: Username and Password not accepted
```

If you see `MailAuthenticationException`, the App Password got revoked — regenerate at https://myaccount.google.com/apppasswords and update `MAIL_PASS` in Railway.

---

## 14. CI / Auto-Redeploy

By default, Railway redeploys every service on every push to the connected branch. To restrict:

1. Service → **Settings** → **Source** → **Branch**: set to `main`.
2. **Settings** → **Deploys** → **Auto Deploy**: off, if you want manual control.

Keep this on for `frontend` / `backend` and off for `ai-service` / `exam-engine` if you're iterating quickly on UI/API and rarely touching the others — saves build minutes.

---

## 15. Troubleshooting

### Backend won't start: `Failed to determine a suitable driver class`
Postgres env vars missing or `SPRING_DATASOURCE_URL` is the raw `postgresql://...` instead of `jdbc:postgresql://...`. Fix the URL prefix (see §6.3).

### Backend logs show `Connection refused` to Redis
Redis password not set, or `REDIS_PASSWORD` was forgotten in §6.3. Spring tries unauthenticated → Redis rejects. Add the var, redeploy.

### Frontend renders but `/api/v1/*` returns 502
`BACKEND_URL` on the frontend service is wrong or backend is down. Check it's the full `https://...up.railway.app` URL, no trailing slash.

### OTP email never arrives, no error in logs
You're on the mock adapter — `MAIL_ENABLED` is not `true`. Backend logs would show `[MOCK OTP]` lines. Set the var, redeploy.

### `Caused by: ...invalid checksum` on Flyway
A migration file changed after being applied. Either revert the file or drop `flyway_schema_history` (data loss safe — just metadata) and redeploy.

### Backend OOM-killed
Free Railway plan gives 512 MB RAM. Java 21 + Spring Boot fits, but barely. Add `JAVA_OPTS=-Xmx400m -XX:+UseSerialGC` to backend variables to keep heap small.

### "Service Unavailable" on registration
OTP send failed AND `MAIL_ENABLED=true`. Check backend logs for the actual exception (auth fail vs timeout vs DNS).

---

## 16. Render Alternative (Brief)

If you'd rather use Render:

1. Sign up at render.com.
2. **New** → **PostgreSQL** — free 90-day instance, then $7/mo.
3. **Redis** — Render killed free Redis; use Upstash (`upstash.com`, free 10k commands/day) and point `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` at it.
4. **New** → **Web Service** → Docker → repo → set Root Directory per service.
5. Render auto-detects the `Dockerfile`. Same env var matrix as §6.3 / §7 / §8 / §9.
6. **Internal hostnames** on Render: `<service-name>.onrender.com` is public. For private networking use `<service-name>:<port>` only across services in the same workspace.
7. Free tier sleeps after 15 min idle — first request takes ~30 s cold. Fine for demos, painful for live use.

---

## 17. Rollback

Every deploy on Railway is a numbered revision. To revert:

1. Service → **Deployments** → find the last green one → **... menu** → **Rollback**.
2. Active deploy switches instantly. No downtime.

For Postgres state rollback, Railway has automated daily backups on paid plan. On free trial, take manual `pg_dump`s if you make breaking schema changes:

```powershell
$env:PGPASSWORD = "<from Postgres Variables>"
pg_dump -h <PGHOST> -U <PGUSER> -d <PGDATABASE> -F c -f backup.dump
```

---

## 18. Cost Snapshot (Railway, May 2026)

| Item                          | Monthly cost (estimate)   |
|-------------------------------|---------------------------|
| Backend (512 MB / shared CPU) | ~$3                       |
| Frontend                      | ~$2                       |
| ai-service                    | ~$2                       |
| exam-engine                   | ~$1                       |
| Postgres (1 GB)               | ~$5                       |
| Redis (256 MB)                | ~$3                       |
| **Total**                     | **~$16/mo after free credit** |

Trial credit ($5) covers ~10 days. Add a card before that runs out.

---

## 19. Final Checklist Before Demo

- [ ] All six services show green status on Railway.
- [ ] `GET https://<backend>/actuator/health` returns `{"status":"UP"}`.
- [ ] `https://<frontend>/` loads the landing page.
- [ ] Register with a real email → OTP arrives → verify → redirect to login → sign in.
- [ ] Admin login works (`admin@eaa.dz`).
- [ ] JWT cookie set on login (DevTools → Application → Cookies → `eaa_jwt`).
- [ ] Backend logs show no `ERROR` lines on a 10-minute idle.

You're live.
