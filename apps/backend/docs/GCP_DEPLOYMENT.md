# Google Cloud Platform Deployment Guide

## Prerequisites

1. Google Cloud SDK installed:
   ```bash
   brew install --cask google-cloud-sdk
   ```

2. Authenticated with GCP:
   ```bash
   gcloud auth login
   ```

3. Project configured:
   ```bash
   gcloud config set project majestic-tape-485503-f9
   ```

## Current Deployment Info

| Resource | Value |
|----------|-------|
| **Project ID** | `majestic-tape-485503-f9` |
| **Region** | `us-central1` |
| **Service Name** | `kaiz-api` |
| **API URL** | `https://kaiz-api-213334506754.us-central1.run.app` |
| **DB Instance** | `kaiz-db` |

## Deploy New Version

### Quick Deploy (Recommended)

```bash
cd apps/backend

# Build and deploy in one command
gcloud builds submit --tag us-central1-docker.pkg.dev/majestic-tape-485503-f9/kaiz-repo/kaiz-api --project=majestic-tape-485503-f9

# Deploy to Cloud Run
gcloud run deploy kaiz-api \
  --image us-central1-docker.pkg.dev/majestic-tape-485503-f9/kaiz-repo/kaiz-api:latest \
  --region us-central1 \
  --platform managed \
  --project=majestic-tape-485503-f9
```

### Check Deployment Status

```bash
# Get service URL
gcloud run services describe kaiz-api --region=us-central1 --format='value(status.url)'

# Check service status
gcloud run services describe kaiz-api --region=us-central1

# List all revisions
gcloud run revisions list --service=kaiz-api --region=us-central1
```

## View Logs

### Cloud Run Logs

```bash
# Recent logs
gcloud run services logs read kaiz-api --region=us-central1 --limit=100

# Stream logs (real-time)
gcloud run services logs tail kaiz-api --region=us-central1

# Logs with specific filter
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=kaiz-api" \
  --limit=50 \
  --format="table(timestamp,textPayload)" \
  --project=majestic-tape-485503-f9
```

### Cloud Build Logs

```bash
# List recent builds
gcloud builds list --limit=5 --project=majestic-tape-485503-f9

# Get specific build logs
gcloud builds log <BUILD_ID> --project=majestic-tape-485503-f9
```

### Error Logs

```bash
# Find errors in logs
gcloud logging read "resource.type=cloud_run_revision AND severity>=ERROR" \
  --limit=20 \
  --project=majestic-tape-485503-f9

# JSON format for detailed errors
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=kaiz-api" \
  --limit=50 \
  --format=json \
  --project=majestic-tape-485503-f9 | grep -i error
```

## Manage Environment Variables

```bash
# View current env vars
gcloud run services describe kaiz-api --region=us-central1 \
  --format="yaml(spec.template.spec.containers[0].env)"

# Update env var
gcloud run services update kaiz-api --region=us-central1 \
  --update-env-vars "KEY=value"

# Update Swagger allowed IPs
gcloud run services update kaiz-api --region=us-central1 \
  --update-env-vars "SWAGGER_ALLOWED_IPS=68.203.134.70,NEW_IP"
```

## Manage Secrets

```bash
# List secrets
gcloud secrets list --project=majestic-tape-485503-f9

# View secret value
gcloud secrets versions access latest --secret=db-password --project=majestic-tape-485503-f9
gcloud secrets versions access latest --secret=jwt-secret --project=majestic-tape-485503-f9

# Update a secret
echo -n "new-password" | gcloud secrets versions add db-password --data-file=- --project=majestic-tape-485503-f9
```

## Rollback Deployment

```bash
# List revisions
gcloud run revisions list --service=kaiz-api --region=us-central1

# Rollback to previous revision
gcloud run services update-traffic kaiz-api \
  --region=us-central1 \
  --to-revisions=kaiz-api-00006-xyz=100
```

## Database Management

```bash
# Check database status
gcloud sql instances describe kaiz-db --project=majestic-tape-485503-f9

# Connect via Cloud SQL Proxy (for migrations)
gcloud sql connect kaiz-db --user=kaizapp --database=kaizapp

# Authorize new IP for direct access
gcloud sql instances patch kaiz-db \
  --authorized-networks="IP1/32,IP2/32" \
  --project=majestic-tape-485503-f9
```

## Troubleshooting

### Service not starting

```bash
# Check latest revision status
gcloud run revisions describe $(gcloud run revisions list --service=kaiz-api --region=us-central1 --limit=1 --format='value(name)') --region=us-central1

# Check for errors
gcloud logging read "resource.type=cloud_run_revision AND severity>=ERROR" --limit=20 --project=majestic-tape-485503-f9
```

### Database connection issues

```bash
# Verify Cloud SQL connection
gcloud sql instances describe kaiz-db --format="value(connectionName)"

# Check if Cloud SQL Admin API is enabled
gcloud services list --enabled | grep sqladmin
```

### Build failures

```bash
# Check build logs
gcloud builds list --limit=1 --format='value(id)' | xargs gcloud builds log
```

## Cost Monitoring

```bash
# View billing
gcloud billing accounts list

# Check Cloud Run usage
gcloud run services describe kaiz-api --region=us-central1 --format="yaml(status.traffic)"
```

## Useful URLs

- **API Health**: https://kaiz-api-213334506754.us-central1.run.app/actuator/health
- **Swagger UI**: https://kaiz-api-213334506754.us-central1.run.app/swagger-ui.html
- **GCP Console**: https://console.cloud.google.com/run?project=majestic-tape-485503-f9
- **Cloud SQL**: https://console.cloud.google.com/sql/instances?project=majestic-tape-485503-f9
- **Logs Explorer**: https://console.cloud.google.com/logs?project=majestic-tape-485503-f9
