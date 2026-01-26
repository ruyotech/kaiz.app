# Swagger API Documentation Access

## Production (GCP Cloud Run)

### URL
```
https://kaiz-api-213334506754.us-central1.run.app/swagger-ui.html
```

### Access Requirements

Swagger is **IP-restricted** in production. Only whitelisted IPs can access it.

**Currently Whitelisted:** `68.203.134.70`

### If You Can't Access Swagger

1. **Check your current IP:**
   ```bash
   curl -s https://ipinfo.io/ip
   ```

2. **Add your IP to the whitelist:**
   ```bash
   # Update Cloud Run env var with your IP
   gcloud run services update kaiz-api \
     --region=us-central1 \
     --update-env-vars "SWAGGER_ALLOWED_IPS=68.203.134.70,YOUR_NEW_IP" \
     --project=majestic-tape-485503-f9
   ```

3. **For multiple IPs (comma-separated):**
   ```bash
   gcloud run services update kaiz-api \
     --region=us-central1 \
     --update-env-vars "SWAGGER_ALLOWED_IPS=68.203.134.70,1.2.3.4,5.6.7.8" \
     --project=majestic-tape-485503-f9
   ```

---

## Local Development

### URL
```
http://localhost:8080/swagger-ui.html
```

No IP restrictions in local development.

---

## Using Swagger UI

### 1. Authenticate

Most endpoints require JWT authentication:

1. **Register a user** (if you don't have one):
   - Expand `auth-controller`
   - Click `POST /api/v1/auth/register`
   - Click **Try it out**
   - Enter request body:
     ```json
     {
       "email": "test@example.com",
       "password": "Password123!",
       "fullName": "Test User"
     }
     ```
   - Click **Execute**

2. **Login to get token**:
   - Click `POST /api/v1/auth/login`
   - Click **Try it out**
   - Enter credentials:
     ```json
     {
       "email": "test@example.com",
       "password": "Password123!"
     }
     ```
   - Click **Execute**
   - Copy the `accessToken` from the response

3. **Authorize Swagger**:
   - Click the **Authorize** button (lock icon at top)
   - Enter: `Bearer YOUR_ACCESS_TOKEN`
   - Click **Authorize**
   - Click **Close**

Now all endpoints will include your JWT token.

### 2. Test Endpoints

- Expand any controller
- Click the endpoint you want to test
- Click **Try it out**
- Fill in parameters
- Click **Execute**

---

## API Endpoints Overview

| Controller | Description |
|------------|-------------|
| `auth-controller` | Login, register, password reset, token refresh |
| `user-controller` | User profile, preferences |
| `task-controller` | Create, update, delete tasks |
| `epic-controller` | Manage epics |
| `sprint-controller` | Sprint management |
| `challenge-controller` | 21-day challenges |
| `community-controller` | Community features |
| `essentia-controller` | Essentia books/cards |
| `command-center-controller` | AI command center |
| `notification-controller` | Notifications |
| `mindset-controller` | Mindset content |

---

## Alternative: API Docs (JSON)

Raw OpenAPI specification:
```
https://kaiz-api-213334506754.us-central1.run.app/api-docs
```

---

## cURL Examples

### Health Check (no auth)
```bash
curl https://kaiz-api-213334506754.us-central1.run.app/actuator/health
```

### Login
```bash
curl -X POST https://kaiz-api-213334506754.us-central1.run.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'
```

### Authenticated Request
```bash
curl https://kaiz-api-213334506754.us-central1.run.app/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Troubleshooting

### 403 Forbidden on Swagger

Your IP is not whitelisted. See "Add your IP to the whitelist" above.

### 401 Unauthorized on Endpoints

1. Make sure you clicked **Authorize** in Swagger
2. Token format must be: `Bearer <token>` (with space after Bearer)
3. Token may have expired - login again to get a new one

### Swagger UI Not Loading

1. Check the service is running:
   ```bash
   curl https://kaiz-api-213334506754.us-central1.run.app/actuator/health
   ```

2. Try the direct URL:
   ```
   https://kaiz-api-213334506754.us-central1.run.app/swagger-ui/index.html
   ```

---

## Quick Links

| Environment | Swagger URL |
|-------------|-------------|
| **Production** | https://kaiz-api-213334506754.us-central1.run.app/swagger-ui.html |
| **Local** | http://localhost:8080/swagger-ui.html |
