# KAIZ Project - GitHub Copilot Instructions

## Admin Authentication (Testing)

### Test Admin Credentials

| Field | Value |
|-------|-------|
| Email | `admin@kaiz.app` |
| Password | `Admin123!` |
| Role | `SUPER_ADMIN` |
| Setup Key | `KAIZ_ADMIN_SETUP_2026` |

### Admin API Endpoints

**Local:** `http://localhost:8080`
**GCP:** `https://kaiz-api-213334506754.us-central1.run.app`

```bash
# Create first admin (one-time setup)
curl -X POST {BASE_URL}/api/v1/admin/auth/setup \
  -H "Content-Type: application/json" \
  -H "X-Setup-Key: KAIZ_ADMIN_SETUP_2026" \
  -d '{"email": "admin@kaiz.app", "password": "Admin123!", "fullName": "System Admin", "role": "SUPER_ADMIN"}'

# Login
curl -X POST {BASE_URL}/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@kaiz.app", "password": "Admin123!"}'

# Response includes: accessToken, refreshToken, admin info

# Use admin token for protected endpoints
curl {BASE_URL}/api/v1/admin/content/site \
  -H "Authorization: Bearer {accessToken}"
```

### Admin Roles

| Role | Description |
|------|-------------|
| `SUPER_ADMIN` | Full access to all admin features |
| `ADMIN` | Standard admin access |
| `SUPPORT` | Customer support access |
| `MARKETING` | Marketing content access |

### Web Admin Login Flow

1. User enters email/password on `/admin/login`
2. POST to `/api/v1/admin/auth/login`
3. Store `accessToken` and `refreshToken` in localStorage
4. Redirect to `/admin/dashboard`
5. Include `Authorization: Bearer {token}` on all admin API calls

---

## Flyway Database Migrations

### Critical Rules

1. **NEVER modify an already-applied migration**
   - If a migration file (e.g., `V4__tasks.sql`) has been deployed to GCP, you CANNOT change it
   - Create a NEW migration file instead (e.g., `V15__alter_tasks_add_column.sql`)
   - Modifying deployed migrations causes checksum mismatches that break deployments

2. **Version numbers are sequential**
   - Check existing files in `apps/backend/src/main/resources/db/migration/`
   - Always use the next available version number
   - Never skip or reuse version numbers

3. **Enum values must be UPPERCASE**
   - Our JPA entities use `@Enumerated(EnumType.STRING)` which stores UPPERCASE
   - All SQL CHECK constraints must use UPPERCASE values:
   ```sql
   -- ✅ Correct
   CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE'))
   
   -- ❌ Wrong - will cause runtime errors
   CHECK (status IN ('todo', 'in_progress', 'done'))
   ```

4. **Use defensive SQL patterns**
   ```sql
   -- For new tables
   CREATE TABLE IF NOT EXISTS ...
   
   -- For adding columns
   ALTER TABLE x ADD COLUMN IF NOT EXISTS y ...
   
   -- For dropping
   DROP TABLE IF EXISTS x CASCADE;
   DROP INDEX IF EXISTS idx_name;
   ```

5. **Include audit columns on all entity tables**
   ```sql
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
   created_by UUID REFERENCES users(id),
   updated_by UUID REFERENCES users(id)
   ```

### Migration File Naming

```
V{VERSION}__{description}.sql

Examples:
V15__add_task_priority_column.sql
V16__create_achievements_table.sql
V17__fix_notification_constraints.sql
```

- Double underscore after version number
- Lowercase with underscores (snake_case)
- Descriptive action: `add_`, `create_`, `alter_`, `fix_`, `drop_`

### When Making Database Changes

Before creating/modifying migrations:

1. **Check current migration state**
   ```bash
   ls apps/backend/src/main/resources/db/migration/
   ```

2. **Identify the highest version number**
   - Current structure: V1-V14

3. **Create new migration file**
   - Never edit V1-V14 (these are deployed)
   - Create V15, V16, etc. for new changes

4. **Test locally first**
   ```bash
   docker-compose down -v && docker-compose up -d
   ./mvnw spring-boot:run
   ```

### Entity-to-Migration Workflow

When adding a new field to a JPA entity:

1. Add the field to the entity class
2. Create a new migration file with the corresponding `ALTER TABLE`
3. Ensure the column type matches:
   - `String` → `VARCHAR(n)` or `TEXT`
   - `Long` → `BIGINT`
   - `Integer` → `INTEGER`
   - `Boolean` → `BOOLEAN`
   - `LocalDateTime` → `TIMESTAMP WITH TIME ZONE`
   - `UUID` → `UUID`
   - `Enum` → `VARCHAR(50)` with CHECK constraint

### Domain Module Mapping

Our migrations are organized by domain. When adding features:

| Domain | Migration File | Related Entities |
|--------|---------------|------------------|
| Identity | V2 | User, RefreshToken |
| Tasks | V4 | Task, Epic, Sprint, TaskTemplate |
| Challenges | V5 | Challenge, ChallengeEntry |
| Notifications | V6 | Notification, NotificationPreference |
| Mindset | V7 | MindsetTheme, MindsetContent |
| Essentia | V8 | EssentiaBook, EssentiaCard |
| Community | V9 | CommunityMember, Article, Story |
| Command Center | V10 | CommandCenterDraft |
| SensAI | V11 | SensaiSettings, Standup |
| Admin | V12 | SiteContent, FAQ, Pricing |
| Family | V13 | Family, FamilyMember |

### Common Patterns

**Adding a nullable column:**
```sql
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(20);
```

**Adding a required column with default:**
```sql
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false NOT NULL;
```

**Adding a foreign key:**
```sql
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);
```

**Creating an index:**
```sql
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status_created ON tasks(status, created_at DESC);
```

**Adding a CHECK constraint:**
```sql
ALTER TABLE tasks ADD CONSTRAINT chk_tasks_priority 
CHECK (priority IS NULL OR priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT'));
```

### Red Flags - Stop and Ask

If you encounter these scenarios, pause and clarify:

1. **Request to modify V1-V14** → These are deployed, create new migration instead
2. **Removing a column** → Data loss! Confirm intent first
3. **Changing column type** → May require data migration
4. **Dropping constraints** → May indicate data integrity issues
5. **Large seed data changes** → Consider if data should be in migration or seeder

### Troubleshooting Reference

See [FLYWAY_GUIDE.md](apps/backend/docs/FLYWAY_GUIDE.md) for:
- Common error fixes
- GCP database reset procedure
- Pre-deployment checklist
- Debug commands

---

## GCP Deployment & Operations

### Project Info
| Resource | Value |
|----------|-------|
| Project ID | `majestic-tape-485503-f9` |
| Region | `us-central1` |
| Service | `kaiz-api` |
| DB Instance | `kaiz-db` |
| DB Name | `kaizapp` |
| DB User | `kaizapp` |
| DB IP | `34.30.197.86` |

### Redeploy to GCP (Full Steps)

```bash
# 1. Navigate to backend
cd apps/backend

# 2. Build and push image to Artifact Registry
gcloud builds submit --tag us-central1-docker.pkg.dev/majestic-tape-485503-f9/kaiz-repo/kaiz-api

# 3. Deploy to Cloud Run
gcloud run deploy kaiz-api \
  --image us-central1-docker.pkg.dev/majestic-tape-485503-f9/kaiz-repo/kaiz-api:latest \
  --region us-central1 \
  --platform managed
```

### Connect to GCP Database (No Password Prompt)

**IMPORTANT:** Always use direct psql with `PGPASSWORD` env var to avoid interactive password prompts that AI cannot handle:

```bash
# Get password from Secret Manager
PGPASSWORD=$(gcloud secrets versions access latest --secret=db-password)

# Connect and run query (single command - no prompt)
PGPASSWORD='KaizSecure2026!' psql -h 34.30.197.86 -U kaizapp -d kaizapp -c "SELECT 1;"

# Run SQL file
PGPASSWORD='KaizSecure2026!' psql -h 34.30.197.86 -U kaizapp -d kaizapp -f scripts/drop_all_tables.sql

# Interactive session (still no password prompt)
PGPASSWORD='KaizSecure2026!' psql -h 34.30.197.86 -U kaizapp -d kaizapp

# Check tables
PGPASSWORD='KaizSecure2026!' psql -h 34.30.197.86 -U kaizapp -d kaizapp -c "\dt"

# Check flyway history
PGPASSWORD='KaizSecure2026!' psql -h 34.30.197.86 -U kaizapp -d kaizapp -c "SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank;"
```

**⚠️ NEVER use `gcloud sql connect`** - it spawns interactive psql that prompts for password, which AI cannot handle.

### View Cloud Run Logs (Deployment Failures)

When deployment fails, use these commands in order:

```bash
# 1. Quick check - see last errors
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=kaiz-api AND severity>=ERROR" --limit=10 --format="table(timestamp,textPayload)"

# 2. Full logs with Spring Boot errors (most useful)
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=kaiz-api" --limit=50 --format=json | python3 -c "
import sys,json
logs = json.load(sys.stdin)
for l in logs:
    msg = l.get('textPayload') or l.get('jsonPayload',{}).get('message','')
    if msg and ('Exception' in msg or 'Error' in msg or 'failed' in msg.lower()):
        print(msg[:500])
"

# 3. Get ALL recent logs (raw)
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=kaiz-api" --limit=100 --format="value(textPayload)"

# 4. Check build logs if build failed
gcloud builds list --limit=1 --format="value(id)" | xargs gcloud builds log
```

### Check Deployment Status

```bash
# Service status
gcloud run services describe kaiz-api --region=us-central1 --format="yaml(status)"

# List revisions (see which version is serving)
gcloud run revisions list --service=kaiz-api --region=us-central1 --limit=5

# Health check
curl -s https://kaiz-api-213334506754.us-central1.run.app/actuator/health
```

### Reset GCP Database (Nuclear Option)

```bash
# Drop all tables and let Flyway recreate on next deploy
PGPASSWORD='KaizSecure2026!' psql -h 34.30.197.86 -U kaizapp -d kaizapp -c "
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO kaizapp;
"

# Then redeploy
cd apps/backend
gcloud builds submit --tag us-central1-docker.pkg.dev/majestic-tape-485503-f9/kaiz-repo/kaiz-api
gcloud run deploy kaiz-api --image us-central1-docker.pkg.dev/majestic-tape-485503-f9/kaiz-repo/kaiz-api:latest --region us-central1 --platform managed
```

---

## Docker Local Development Workflow (Java 21 Spring Boot)

### Critical Rule: ALWAYS Test Locally Before GCP Deploy

**On EVERY backend code change, follow this exact workflow:**

1. **Rebuild Docker image locally (uses LOCAL PostgreSQL container)**
2. **Check container logs - verify Flyway migrations succeed**
3. **Verify health endpoint against LOCAL database**
4. **Only then deploy to GCP (which runs against GCP Cloud SQL)**
5. **Verify GCP deployment is healthy**

### Local vs GCP Database

| Environment | Database | Connection |
|-------------|----------|------------|
| **Local Docker** | `kaizapp-db` container (PostgreSQL 16) | `jdbc:postgresql://db:5432/kaizapp` |
| **GCP Cloud Run** | Cloud SQL (`34.30.197.86`) | `jdbc:postgresql://34.30.197.86:5432/kaizapp` |

**⚠️ IMPORTANT:** Local testing uses `docker-compose.yml` which spins up BOTH:
- `kaizapp-api` - Spring Boot backend
- `kaizapp-db` - Local PostgreSQL 16 database

Flyway migrations run FIRST against local DB. Only after success do we deploy to GCP.

### Step-by-Step Workflow

#### Step 1: Navigate to Backend
```bash
cd apps/backend
```

#### Step 2: Stop Existing Containers & Rebuild
```bash
# Stop and remove old containers (keep volumes for DB data)
docker-compose down

# Rebuild and start fresh (use --build to force rebuild)
# This starts BOTH app + local db containers
docker-compose up --build -d
```

#### Step 3: Check Container Logs (Flyway + Startup)
```bash
# Wait for startup and check logs
sleep 15 && docker-compose logs app

# Look for these SUCCESS indicators:
# ✅ "Started KaizappBackendApplication in X seconds"
# ✅ "Tomcat started on port 8080"
# ✅ "Successfully applied X migrations" (Flyway)
# ✅ "Migrating schema 'public' to version X"

# Watch for these FAILURE indicators:
# ❌ "Exception", "Error", "failed"
# ❌ "Bean creation exception"
# ❌ "Flyway migration failed"
# ❌ "Migration checksum mismatch"
# ❌ Container exits/restarts
```

#### Step 4: Verify Health Endpoint (Against Local DB)
```bash
# Test actuator health - this confirms local DB connection works
curl -s http://localhost:8080/actuator/health | jq .

# Expected response (note db status UP):
# {"status":"UP","components":{"db":{"status":"UP","details":{"database":"PostgreSQL"}},...}}

# Check local DB directly (port 5433 maps to container's 5432)
docker-compose exec db psql -U kaizapp -d kaizapp -c "\dt"

# Verify Flyway history in local DB
docker-compose exec db psql -U kaizapp -d kaizapp -c "SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank;"
```

#### Step 5: Deploy to GCP (Only After Local Success)
```bash
# Build and push to Artifact Registry
gcloud builds submit --tag us-central1-docker.pkg.dev/majestic-tape-485503-f9/kaiz-repo/kaiz-api

# Deploy to Cloud Run
gcloud run deploy kaiz-api \
  --image us-central1-docker.pkg.dev/majestic-tape-485503-f9/kaiz-repo/kaiz-api:latest \
  --region us-central1 \
  --platform managed
```

#### Step 6: Verify GCP Deployment
```bash
# Health check (now running against GCP Cloud SQL)
curl -s https://kaiz-api-213334506754.us-central1.run.app/actuator/health

# Check for errors in Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=kaiz-api AND severity>=ERROR" --limit=10 --format="table(timestamp,textPayload)"

# Check Flyway ran successfully on GCP DB
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=kaiz-api" --limit=50 --format="value(textPayload)" | grep -E "Flyway|migration|Started|Error|Exception"
```

### Quick Commands Reference

```bash
# === LOCAL DOCKER (uses local PostgreSQL) ===
# Full rebuild cycle (clean DB + fresh migrations)
docker-compose down -v && docker-compose up --build -d && sleep 15 && docker-compose logs app

# Quick rebuild (keep DB data)
docker-compose down && docker-compose up --build -d && sleep 10 && docker-compose logs app

# Watch logs in real-time
docker-compose logs -f app

# Check both containers are running
docker-compose ps

# Check local DB tables
docker-compose exec db psql -U kaizapp -d kaizapp -c "\dt"

# Check Flyway history locally
docker-compose exec db psql -U kaizapp -d kaizapp -c "SELECT version, description FROM flyway_schema_history ORDER BY installed_rank;"

# Enter backend container shell (for debugging)
docker-compose exec app sh

# === GCP DEPLOY (only after local success) ===
# One-liner deploy (after local verification)
cd apps/backend && gcloud builds submit --tag us-central1-docker.pkg.dev/majestic-tape-485503-f9/kaiz-repo/kaiz-api && gcloud run deploy kaiz-api --image us-central1-docker.pkg.dev/majestic-tape-485503-f9/kaiz-repo/kaiz-api:latest --region us-central1 --platform managed

# === VERIFICATION ===
# Local health (against local DB)
curl -s http://localhost:8080/actuator/health | jq .

# GCP health (against Cloud SQL)
curl -s https://kaiz-api-213334506754.us-central1.run.app/actuator/health | jq .
```

### Dockerfile Best Practices (Java 21 Spring Boot)

Our Dockerfile follows these production-ready patterns:

1. **Multi-stage build** - Separates build and runtime for smaller images
2. **Dependency caching** - `mvn dependency:go-offline` before copying source
3. **Non-root user** - Runs as `kaiz` user for security
4. **Alpine base** - Minimal image size with `eclipse-temurin:21-jre-alpine`
5. **Health checks** - Built-in HEALTHCHECK for container orchestration
6. **G1GC tuning** - Optimized for Cloud Run's containerized environment

### Red Flags - DO NOT DEPLOY

**Stop and fix locally if you see ANY of these:**

1. ❌ `docker-compose logs` shows exceptions or errors
2. ❌ Container keeps restarting (`docker-compose ps` shows restart loop)
3. ❌ Health endpoint returns non-200 or `{"status":"DOWN"}`
4. ❌ Flyway migration errors (checksum mismatch, SQL syntax)
5. ❌ Bean creation/injection failures
6. ❌ Port binding issues

### Common Local Docker Issues

**Container won't start:**
```bash
# Check what's wrong
docker-compose logs backend

# Common fixes:
# 1. Port conflict - stop other services on 8080
lsof -i :8080

# 2. Stale build - force rebuild
docker-compose build --no-cache backend

# 3. Volume issues - reset
docker-compose down -v
```

**Database connection issues:**
```bash
# Ensure DB is running
docker-compose ps db

# Check DB logs
docker-compose logs db

# Verify connection from backend container
docker-compose exec backend sh -c "nc -zv db 5432"
```

**Flyway migration stuck:**
```bash
# Reset local DB completely
docker-compose down -v && docker-compose up -d

# Check flyway status in container
docker-compose exec backend sh -c "cat /app/application.properties | grep flyway"
```

### AI Assistant Checklist

When making backend changes, I (the AI) will:

- [ ] Make the code change
- [ ] Run `docker-compose down && docker-compose up --build -d`
- [ ] Wait and check `docker-compose logs backend`
- [ ] Verify `curl http://localhost:8080/actuator/health` returns UP
- [ ] Only then proceed with GCP deployment
- [ ] After GCP deploy, verify `curl https://kaiz-api-213334506754.us-central1.run.app/actuator/health`
- [ ] Check GCP logs for any errors

**NEVER skip local Docker testing before GCP deployment!**
