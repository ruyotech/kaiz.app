#!/bin/bash

# ============================================
# KaizApp Backend - Google Cloud Deployment
# ============================================
# Prerequisites:
# 1. gcloud CLI installed: brew install google-cloud-sdk
# 2. Logged in: gcloud auth login
# 3. Billing enabled on your GCP account

set -e

# Configuration - CUSTOMIZE THESE
PROJECT_ID="majestic-tape-485503-f9"
REGION="us-central1"
SERVICE_NAME="kaiz-api"
DB_INSTANCE_NAME="kaiz-db"
DB_NAME="kaizapp"
DB_USER="kaizapp"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_step() {
    echo -e "${GREEN}==>${NC} $1"
}

echo_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo_error "gcloud CLI is not installed. Run: brew install google-cloud-sdk"
    exit 1
fi

# Parse command
COMMAND=${1:-"help"}

case $COMMAND in
    "setup")
        echo_step "Setting up GCP project..."
        
        # Create project (might fail if exists - that's ok)
        gcloud projects create $PROJECT_ID --name="Kaiz App" 2>/dev/null || true
        
        # Set default project
        gcloud config set project $PROJECT_ID
        
        echo_warn "IMPORTANT: Enable billing at https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID"
        echo "Press Enter after enabling billing..."
        read
        
        # Enable APIs
        echo_step "Enabling required APIs..."
        gcloud services enable \
            cloudbuild.googleapis.com \
            run.googleapis.com \
            sqladmin.googleapis.com \
            artifactregistry.googleapis.com \
            secretmanager.googleapis.com
        
        echo_step "Setup complete! Next run: ./deploy-gcp.sh create-db"
        ;;
        
    "create-db")
        echo_step "Creating Cloud SQL PostgreSQL instance..."
        echo_warn "This may take 5-10 minutes..."
        
        # Prompt for password
        echo "Enter a secure password for the database:"
        read -s DB_PASSWORD
        
        # Create instance
        gcloud sql instances create $DB_INSTANCE_NAME \
            --database-version=POSTGRES_16 \
            --tier=db-f1-micro \
            --region=$REGION \
            --root-password="$DB_PASSWORD" \
            --storage-type=SSD \
            --storage-size=10GB \
            --backup-start-time=03:00 \
            --availability-type=zonal
        
        # Create database
        echo_step "Creating database..."
        gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE_NAME
        
        # Create user
        echo_step "Creating database user..."
        gcloud sql users create $DB_USER \
            --instance=$DB_INSTANCE_NAME \
            --password="$DB_PASSWORD"
        
        # Store password as secret
        echo_step "Storing password as secret..."
        echo -n "$DB_PASSWORD" | gcloud secrets create db-password --data-file=- 2>/dev/null || \
            (echo -n "$DB_PASSWORD" | gcloud secrets versions add db-password --data-file=-)
        
        echo_step "Database created! Next run: ./deploy-gcp.sh create-secrets"
        ;;
        
    "create-secrets")
        echo_step "Creating secrets..."
        
        echo "Enter JWT secret (min 256 bits / 32 chars):"
        read -s JWT_SECRET
        echo ""
        
        echo "Enter Anthropic API key (from https://console.anthropic.com/):"
        read -s ANTHROPIC_API_KEY
        echo ""
        
        echo -n "$JWT_SECRET" | gcloud secrets create jwt-secret --data-file=- 2>/dev/null || \
            (echo -n "$JWT_SECRET" | gcloud secrets versions add jwt-secret --data-file=-)
        
        echo -n "$ANTHROPIC_API_KEY" | gcloud secrets create anthropic-api-key --data-file=- 2>/dev/null || \
            (echo -n "$ANTHROPIC_API_KEY" | gcloud secrets versions add anthropic-api-key --data-file=-)
        
        # Grant Cloud Run access to secrets
        PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
        
        gcloud secrets add-iam-policy-binding db-password \
            --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
            --role="roles/secretmanager.secretAccessor"
        
        gcloud secrets add-iam-policy-binding jwt-secret \
            --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
            --role="roles/secretmanager.secretAccessor"
        
        gcloud secrets add-iam-policy-binding anthropic-api-key \
            --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
            --role="roles/secretmanager.secretAccessor"
        
        echo_step "Secrets created! Next run: ./deploy-gcp.sh deploy"
        ;;
        
    "deploy")
        echo_step "Building and deploying to Cloud Run..."
        
        # Build and push image to Artifact Registry
        echo_step "Building Docker image..."
        gcloud builds submit --tag $REGION-docker.pkg.dev/$PROJECT_ID/kaiz-repo/$SERVICE_NAME
        
        # Deploy to Cloud Run
        echo_step "Deploying to Cloud Run..."
        gcloud run deploy $SERVICE_NAME \
            --image $REGION-docker.pkg.dev/$PROJECT_ID/kaiz-repo/$SERVICE_NAME \
            --platform managed \
            --region $REGION \
            --allow-unauthenticated \
            --memory 1Gi \
            --cpu 1 \
            --min-instances 0 \
            --max-instances 3 \
            --timeout 300 \
            --add-cloudsql-instances $PROJECT_ID:$REGION:$DB_INSTANCE_NAME \
            --set-env-vars "SPRING_PROFILES_ACTIVE=prod" \
            --set-env-vars "SPRING_DATASOURCE_URL=jdbc:postgresql:///kaizapp?cloudSqlInstance=$PROJECT_ID:$REGION:$DB_INSTANCE_NAME&socketFactory=com.google.cloud.sql.postgres.SocketFactory" \
            --set-env-vars "SPRING_DATASOURCE_USERNAME=$DB_USER" \
            --set-secrets "SPRING_DATASOURCE_PASSWORD=db-password:latest" \
            --set-secrets "JWT_SECRET=jwt-secret:latest" \
            --set-secrets "ANTHROPIC_API_KEY=anthropic-api-key:latest"
        
        # Get the URL
        SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')
        
        echo ""
        echo_step "🎉 Deployment complete!"
        echo ""
        echo "Your API is live at: ${GREEN}$SERVICE_URL${NC}"
        echo ""
        echo "Update your mobile app's api.ts with:"
        echo "  Production URL: $SERVICE_URL"
        echo ""
        echo "Test endpoints:"
        echo "  Health: $SERVICE_URL/actuator/health"
        echo "  Swagger: $SERVICE_URL/swagger-ui.html"
        ;;
        
    "redeploy")
        echo_step "Redeploying latest code..."
        
        gcloud builds submit --tag $REGION-docker.pkg.dev/$PROJECT_ID/kaiz-repo/$SERVICE_NAME
        gcloud run deploy $SERVICE_NAME \
            --image $REGION-docker.pkg.dev/$PROJECT_ID/kaiz-repo/$SERVICE_NAME \
            --region $REGION
        
        SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')
        echo_step "Redeployed! URL: $SERVICE_URL"
        ;;
        
    "logs")
        echo_step "Streaming logs..."
        gcloud run services logs read $SERVICE_NAME --region=$REGION --limit=100
        ;;
        
    "status")
        echo_step "Service Status:"
        gcloud run services describe $SERVICE_NAME --region=$REGION
        
        echo ""
        echo_step "Database Status:"
        gcloud sql instances describe $DB_INSTANCE_NAME
        ;;
        
    "url")
        SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')
        echo $SERVICE_URL
        ;;
    
    "set-anthropic-key")
        echo_step "Setting Anthropic API key..."
        echo "Enter your Anthropic API key (from https://console.anthropic.com/):"
        read -s ANTHROPIC_API_KEY
        echo ""
        
        # Create or update secret
        echo -n "$ANTHROPIC_API_KEY" | gcloud secrets create anthropic-api-key --data-file=- 2>/dev/null || \
            (echo -n "$ANTHROPIC_API_KEY" | gcloud secrets versions add anthropic-api-key --data-file=-)
        
        # Grant access
        PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
        gcloud secrets add-iam-policy-binding anthropic-api-key \
            --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
            --role="roles/secretmanager.secretAccessor" 2>/dev/null || true
        
        # Update Cloud Run service
        echo_step "Updating Cloud Run service with new secret..."
        gcloud run services update $SERVICE_NAME --region=$REGION \
            --set-secrets "ANTHROPIC_API_KEY=anthropic-api-key:latest"
        
        echo_step "Done! Anthropic API key has been set."
        ;;
        
    "cleanup")
        echo_warn "This will delete ALL resources. Are you sure? (type 'yes' to confirm)"
        read CONFIRM
        if [ "$CONFIRM" = "yes" ]; then
            echo_step "Deleting Cloud Run service..."
            gcloud run services delete $SERVICE_NAME --region=$REGION --quiet || true
            
            echo_step "Deleting Cloud SQL instance..."
            gcloud sql instances delete $DB_INSTANCE_NAME --quiet || true
            
            echo_step "Deleting secrets..."
            gcloud secrets delete db-password --quiet || true
            gcloud secrets delete jwt-secret --quiet || true
            gcloud secrets delete anthropic-api-key --quiet || true
            
            echo_step "Cleanup complete!"
        else
            echo "Cancelled."
        fi
        ;;
        
    "cost")
        echo_step "Estimated Monthly Costs (with $300 free tier):"
        echo ""
        echo "Cloud Run (kaiz-api):"
        echo "  - Free tier: 2M requests, 360k vCPU-seconds, 180k GiB-seconds"
        echo "  - Your usage: ~\$5-15/month for light-moderate traffic"
        echo ""
        echo "Cloud SQL (db-f1-micro):"
        echo "  - Instance: ~\$7-10/month"
        echo "  - Storage: ~\$1.70/month (10GB SSD)"
        echo "  - Backups: ~\$0.80/month"
        echo ""
        echo "Total estimated: \$15-30/month"
        echo "With \$300 credits: 10-20 months of runway!"
        echo ""
        echo "💡 Tips to reduce costs:"
        echo "  - Set min-instances=0 (already done)"
        echo "  - Delete unused Cloud SQL backups"
        echo "  - Use Cloud SQL only during development hours"
        ;;
        
    *)
        echo "KaizApp GCP Deployment Script"
        echo ""
        echo "Usage: ./deploy-gcp.sh <command>"
        echo ""
        echo "Commands:"
        echo "  setup             - Initial GCP project setup"
        echo "  create-db         - Create Cloud SQL PostgreSQL database"
        echo "  create-secrets    - Store secrets in Secret Manager"
        echo "  set-anthropic-key - Add/update Anthropic API key for Claude AI"
        echo "  deploy            - Build and deploy to Cloud Run"
        echo "  redeploy          - Quick redeploy of code changes"
        echo "  logs              - View recent logs"
        echo "  status            - Check service status"
        echo "  url               - Get the service URL"
        echo "  cost              - Show cost estimates"
        echo "  cleanup           - Delete all resources (DESTRUCTIVE!)"
        echo ""
        echo "Quick Start (run in order):"
        echo "  1. ./deploy-gcp.sh setup"
        echo "  2. ./deploy-gcp.sh create-db"
        echo "  3. ./deploy-gcp.sh create-secrets"
        echo "  4. ./deploy-gcp.sh deploy"
        ;;
esac
