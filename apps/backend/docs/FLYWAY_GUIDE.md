# KAIZ Backend - Flyway Migration Guide

## Quick Reference

| Action | Command |
|--------|---------|
| Validate migrations locally | `./mvnw flyway:validate` |
| Check migration status | `./mvnw flyway:info` |
| Reset local DB | `docker-compose down -v && docker-compose up -d` |
| Reset GCP DB | See [Reset GCP Database](#reset-gcp-database) |
| Run migrations | Automatic on app start |

---

## Migration Structure

Our migrations are organized by domain modules:

```
V1__core_functions.sql       # Extensions, trigger functions
V2__identity.sql             # Users, auth, tokens
V3__life_wheel.sql           # Life dimensions, Eisenhower quadrants
V4__tasks.sql                # Sprints, epics, tasks, templates, tags
V5__challenges.sql           # Challenge system
V6__notifications.sql        # Notification system
V7__mindset.sql              # Motivational content
V8__essentia.sql             # Micro-learning
V9__community.sql            # Community features
V10__command_center.sql      # AI input processing
V11__sensai.sql              # AI coach
V12__admin.sql               # CMS, marketing
V13__family.sql              # Family workspaces
V14__universal_templates.sql # System templates (seed data)
```

---

## Common Scenarios & Fixes

### 1. Migration Failed in GCP Cloud Run Deployment

**Symptoms:**
- Build succeeds but deployment fails
- Cloud Run logs show: `Migration checksum mismatch` or `Migration failed`

**Fix:**
```bash
# 1. Check Cloud Run logs for the exact error
gcloud logging read "resource.type=cloud_run_revision" --limit=100 --format="value(textPayload)"

# 2. If checksum mismatch - someone modified an already-applied migration
# Option A: Fix the checksum (if change was intentional)
./mvnw flyway:repair -Dflyway.url=$DATABASE_URL -Dflyway.user=$DB_USER -Dflyway.password=$DB_PASSWORD

# Option B: Full reset (DESTROYS ALL DATA!)
# See Reset GCP Database section
```

### 2. Local Dev: "Migration checksum mismatch"

**Symptoms:**
- App fails to start locally
- Error mentions checksum doesn't match for V{N}

**Fix:**
```bash
# If you intentionally changed the migration file:
./mvnw flyway:repair

# If you need a clean slate:
docker-compose down -v
docker-compose up -d
# Wait 5 seconds for postgres to start
./mvnw spring-boot:run
```

### 3. Adding a New Column to Existing Table

**DON'T do this:** Edit an existing migration file ❌

**DO this:** Create a new migration file ✅

```sql
-- V15__add_column_to_tasks.sql
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS new_column VARCHAR(100);
```

### 4. Entity Field Added but Column Missing

**Symptoms:**
- JPA error: `column 'x' does not exist`
- App crashes on entity load

**Fix:**
```bash
# 1. Find the next version number
ls apps/backend/src/main/resources/db/migration/

# 2. Create new migration (e.g., V15__add_missing_column.sql)
# 3. Add the ALTER TABLE statement
# 4. Restart app
```

### 5. Enum Case Sensitivity Issues

**Symptoms:**
- `PSQLException: invalid input value for enum`
- Constraint violation on INSERT/UPDATE

**Root Cause:** JPA uses `EnumType.STRING` which produces UPPERCASE, but constraint expects lowercase.

**Fix:** Always use UPPERCASE in constraints:
```sql
-- ✅ Correct
CONSTRAINT chk_status CHECK (status IN ('DRAFT', 'TODO', 'IN_PROGRESS', 'DONE'))

-- ❌ Wrong
CONSTRAINT chk_status CHECK (status IN ('draft', 'todo', 'in_progress', 'done'))
```

### 6. Duplicate Migration Version

**Symptoms:**
- `Found more than one migration with version X`

**Fix:**
- Rename one of the duplicate files to the next available version
- Never reuse version numbers!

---

## Reset GCP Database

**⚠️ WARNING: This deletes ALL production/staging data!**

### Option A: Using Cloud Shell

```bash
# 1. Connect to Cloud SQL
gcloud sql connect kaiz-db --user=postgres --database=kaiz

# 2. Run the drop script (copy-paste content)
# Or download and run:
\i drop_all_tables.sql

# 3. Exit and redeploy
exit
gcloud run deploy kaiz-backend --source .
```

### Option B: Using psql directly

```bash
# Get connection info from GCP Console > Cloud SQL > kaiz-db

# Connect
psql -h <INSTANCE_IP> -U postgres -d kaiz

# Run drop script
\i scripts/drop_all_tables.sql

# Verify tables are dropped
\dt

# Exit
\q
```

### Option C: Quick Reset via Cloud Console

1. Go to GCP Console → Cloud SQL → kaiz-db
2. Databases → kaiz → Delete database
3. Create new database named `kaiz`
4. Redeploy Cloud Run service

---

## Flyway Configuration

Our Flyway config in `application.yml`:

```yaml
spring:
  flyway:
    enabled: true
    baseline-on-migrate: true      # Creates baseline if db not empty
    locations: classpath:db/migration
    clean-disabled: true           # Prevents accidental clean
    repair-on-migrate: true        # Auto-repairs checksum issues
  jpa:
    hibernate:
      ddl-auto: validate           # NEVER use 'update' in production!
```

---

## Pre-Deployment Checklist

Before pushing changes that include migrations:

- [ ] Migration file follows naming: `V{N}__{description}.sql`
- [ ] Version number is sequential (check existing files)
- [ ] SQL syntax tested locally with `docker-compose up`
- [ ] All enum constraints use UPPERCASE values
- [ ] `IF NOT EXISTS` / `IF EXISTS` used for idempotency
- [ ] No modification to already-deployed migrations
- [ ] Entity changes match migration changes

---

## Debugging Commands

```bash
# Check migration status
./mvnw flyway:info

# Validate migrations without applying
./mvnw flyway:validate

# See what Flyway would do
./mvnw flyway:migrate -Dflyway.dryRunOutput=dryrun.sql

# Repair checksum mismatches
./mvnw flyway:repair

# Show applied migrations in DB
psql -c "SELECT version, description, checksum, installed_on FROM flyway_schema_history ORDER BY installed_rank;"
```

---

## When Things Go Really Wrong

If migrations are completely broken and you need to start fresh:

1. **Backup data** (if any exists)
2. Run `scripts/drop_all_tables.sql` on GCP
3. Clear local Docker: `docker-compose down -v`
4. Verify migrations are correct
5. Deploy fresh

---

## Contact

For migration emergencies during deployment, check:
1. Cloud Run logs: `gcloud logging read "resource.type=cloud_run_revision" --limit=50`
2. Database logs: GCP Console → Cloud SQL → kaiz-db → Logs
