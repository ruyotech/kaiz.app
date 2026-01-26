# Docker Local Development Guide

## Prerequisites

- Docker Desktop installed
- Docker Compose installed

## Quick Start

```bash
cd apps/backend
```

### Build and Run

```bash
# Build and start all services (app + database)
docker-compose up --build

# Run in detached mode (background)
docker-compose up --build -d
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

## View Logs

```bash
# All services
docker-compose logs -f

# Only the API
docker-compose logs -f app

# Only the database
docker-compose logs -f db

# Last 100 lines
docker-compose logs --tail=100 app
```

## Container Management

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Restart a service
docker-compose restart app

# Rebuild a single service
docker-compose up --build app
```

## Access Services

| Service | URL |
|---------|-----|
| **API** | http://localhost:8080 |
| **Swagger UI** | http://localhost:8080/swagger-ui.html |
| **Health Check** | http://localhost:8080/actuator/health |
| **PostgreSQL** | localhost:5433 |

## Database Connection (Local Docker)

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| Port | `5433` |
| Database | `kaizapp` |
| Username | `kaizapp` |
| Password | `kaiz_dev_password` |

## Troubleshooting

### Container won't start
```bash
# Check logs for errors
docker-compose logs app

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Database connection issues
```bash
# Check if database is healthy
docker-compose ps

# View database logs
docker-compose logs db

# Connect to database container
docker exec -it kaizapp-db psql -U kaizapp -d kaizapp
```

### Port already in use
```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>
```

## Build Docker Image Only

```bash
# Build the image
docker build -t kaizapp-api .

# Run the image (requires external database)
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5433/kaizapp \
  -e SPRING_DATASOURCE_USERNAME=kaizapp \
  -e SPRING_DATASOURCE_PASSWORD=kaiz_dev_password \
  -e JWT_SECRET=dev-secret-key-that-is-at-least-256-bits-long-for-hs256 \
  kaizapp-api
```
