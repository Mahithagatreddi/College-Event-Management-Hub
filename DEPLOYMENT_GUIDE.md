# 🚀 Deployment Guide - Render.com

## Prerequisites
- GitHub account with repository access
- Render.com account (free tier available)
- MongoDB Atlas account for cloud database (or local MongoDB)

---

## Step 1: Prepare Repository

✅ All code is ready to deploy:
- Updated server.js with improved logging
- Event removal feature (DELETE endpoint) implemented
- All dependencies listed in package.json

### Push to GitHub:
```bash
git push origin agents/modify-server-js-code
```

---

## Step 2: Setup MongoDB (if not using local)

### Option A: MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create new cluster
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/btech_event_hub`

### Option B: Local MongoDB
- Connection string: `mongodb://127.0.0.1:27017/btech_event_hub`
- (Not recommended for Render as it won't have access to local DB)

---

## Step 3: Deploy to Render

### Method 1: Using render.yaml (Recommended)

1. Push the repo to GitHub with `render.yaml`
2. Go to https://dashboard.render.com
3. Click "New" → "Web Service"
4. Select GitHub repository
5. Choose branch: `agents/modify-server-js-code`
6. Configure settings:
   - **Name:** btech-event-hub-backend
   - **Environment:** Node
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && node server.js`
   - **Plan:** Free or Starter

7. Add Environment Variables:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/btech_event_hub
   JWT_SECRET=your_secure_jwt_secret_key_here_min_32_chars
   NODE_ENV=production
   PORT=3000
   ```

8. Click "Create Web Service"

### Method 2: Manual Setup (if render.yaml doesn't work)

1. In Render Dashboard:
   - New Web Service
   - Connect GitHub
   - Select repository
   - Set Start Command: `cd backend && node server.js`
   - Add environment variables

---

## Step 4: Verify Deployment

After deployment (5-10 minutes), test the API:

### Health Check:
```bash
curl https://btech-event-hub-backend.onrender.com/ping
```

Expected Response:
```json
{
  "success": true,
  "message": "Apex College Events API Online",
  "timestamp": "2026-06-02T21:33:00.000Z"
}
```

### Get Events:
```bash
curl https://btech-event-hub-backend.onrender.com/api/events
```

### Login as Coordinator:
```bash
curl -X POST https://btech-event-hub-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"coordinator","password":"coordinator"}'
```

---

## Environment Variables to Set

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | `your_secure_key_here` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `3000` |

---

## Available Endpoints After Deployment

### Authentication
- `POST /api/auth/register` - Register student
- `POST /api/auth/login` - Login user

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event details
- `POST /api/events/proposals` - Submit event proposal
- `POST /api/events/direct` - Create event directly (Coordinator)
- `DELETE /api/events/:id` - **Delete event (Coordinator)** ← NEW
- `POST /api/events/:id/register` - Register for event
- `POST /api/events/:id/feedback` - Submit feedback

### Calendar
- `GET /api/calendar` - Get calendar entries
- `POST /api/calendar` - Add calendar entry

---

## Troubleshooting

### Build Failed
- Check that `backend/package.json` exists
- Verify all dependencies are listed
- Check `render.yaml` syntax

### Runtime Errors
- Check environment variables are set
- Verify MongoDB connection string
- Review Render logs: Dashboard → Service → Logs

### 502 Bad Gateway
- App might be starting, wait 30 seconds
- Check if PORT environment variable is set
- Review application logs

### Database Connection Issues
- Verify MongoDB URI is correct
- Check MongoDB Atlas IP whitelist includes Render IPs
- Test connection locally first

---

## Monitoring & Logs

In Render Dashboard:
1. Select your service
2. Go to "Logs" tab
3. View real-time application logs
4. Check for errors and warnings

---

## Next Steps

After successful deployment:

1. ✅ Test all API endpoints
2. ✅ Verify database connectivity
3. ✅ Test coordinator event deletion feature
4. ✅ Setup monitoring/alerts
5. ✅ Configure custom domain (optional)
6. ✅ Enable auto-deploys from GitHub

---

## Quick Reference

**Service URL:** `https://btech-event-hub-backend.onrender.com`

**Default Accounts:**
- Admin: username `admin` / password `superadmin`
- Coordinator: username `coordinator` / password `coordinator`
- Student Demo: roll `24481A1270` / password `pass`

**Files Needed for Deployment:**
- ✅ `backend/package.json` - Dependencies
- ✅ `backend/server.js` - Entry point
- ✅ `render.yaml` - Deployment config
- ✅ All controller, route, model files

---

## Support

For issues:
1. Check Render Status page: https://status.render.com
2. Review application logs in Dashboard
3. Test locally first
4. Verify environment variables
5. Check MongoDB connection

---

**Deployment Status:** Ready to Deploy! 🚀
