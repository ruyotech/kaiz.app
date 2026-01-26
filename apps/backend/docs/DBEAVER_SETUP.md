# DBeaver Database Connection Guide

## Cloud SQL (Production)

### Connection Details

| Setting | Value |
|---------|-------|
| **Host** | `34.30.197.86` |
| **Port** | `5432` |
| **Database** | `kaizapp` |
| **Username** | `kaizapp` |
| **Password** | `KaizSecure2026` |

### Setup Steps

1. **Open DBeaver** → Click **New Database Connection** (plug icon)

2. **Select PostgreSQL** → Click **Next**

3. **Enter Connection Details**:
   - Host: `34.30.197.86`
   - Port: `5432`
   - Database: `kaizapp`
   - Username: `kaizapp`
   - Password: `KaizSecure2026`

4. **Test Connection** → Click **Test Connection**

5. **Finish** → Click **Finish**

### IP Authorization

Your IP must be authorized in Cloud SQL. Current authorized IP: `68.203.134.70`

**If your IP changed**, run:
```bash
# Get your current IP
curl -s https://ipinfo.io/ip

# Authorize your IP
gcloud sql instances patch kaiz-db \
  --authorized-networks="YOUR_IP/32" \
  --project=majestic-tape-485503-f9
```

### SSL Configuration (Optional)

For enhanced security, enable SSL:

1. In DBeaver connection settings, go to **SSL** tab
2. Check **Use SSL**
3. Set SSL Mode to **require**

---

## Local Docker Database

### Connection Details

| Setting | Value |
|---------|-------|
| **Host** | `localhost` |
| **Port** | `5433` |
| **Database** | `kaizapp` |
| **Username** | `kaizapp` |
| **Password** | `kaiz_dev_password` |

### Setup Steps

1. **Start Docker containers** first:
   ```bash
   cd apps/backend
   docker-compose up -d
   ```

2. **Open DBeaver** → **New Database Connection**

3. **Select PostgreSQL** → **Next**

4. **Enter Connection Details**:
   - Host: `localhost`
   - Port: `5433` (note: different from default 5432)
   - Database: `kaizapp`
   - Username: `kaizapp`
   - Password: `kaiz_dev_password`

5. **Test Connection** → **Finish**

---

## Useful Queries

### View All Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### View Users
```sql
SELECT id, email, full_name, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 20;
```

### View Tasks
```sql
SELECT t.id, t.title, t.status, u.email as user_email
FROM tasks t
JOIN users u ON t.user_id = u.id
ORDER BY t.created_at DESC
LIMIT 20;
```

### Check Migration Status
```sql
SELECT version, description, installed_on, success 
FROM flyway_schema_history 
ORDER BY installed_rank DESC;
```

### Database Size
```sql
SELECT pg_size_pretty(pg_database_size('kaizapp')) as db_size;
```

### Table Sizes
```sql
SELECT 
    relname as table_name,
    pg_size_pretty(pg_total_relation_size(relid)) as total_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

---

## Troubleshooting

### Connection Refused

**For Cloud SQL:**
1. Check your IP is authorized:
   ```bash
   gcloud sql instances describe kaiz-db --format="yaml(settings.ipConfiguration.authorizedNetworks)"
   ```
2. Verify the instance is running:
   ```bash
   gcloud sql instances describe kaiz-db --format="value(state)"
   ```

**For Local Docker:**
1. Check containers are running:
   ```bash
   docker ps | grep kaizapp-db
   ```
2. Check logs:
   ```bash
   docker-compose logs db
   ```

### Authentication Failed

- Double-check username and password
- For Cloud SQL, verify password:
  ```bash
  gcloud secrets versions access latest --secret=db-password --project=majestic-tape-485503-f9
  ```

### SSL Connection Error

If you get SSL errors, try:
1. In DBeaver, go to **Driver Properties** tab
2. Add property: `sslmode` = `disable` (for testing only)

---

## Quick Reference

| Environment | Host | Port | Password |
|-------------|------|------|----------|
| **Production (GCP)** | `34.30.197.86` | `5432` | `KaizSecure2026` |
| **Local Docker** | `localhost` | `5433` | `kaiz_dev_password` |
