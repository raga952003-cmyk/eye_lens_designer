# Render Deployment Setup Guide

Your service is at: https://eye-lens-designer.onrender.com

## Current Issue: Build Failed - requirements.txt not found

**Root Cause**: Render is looking for requirements.txt in the root directory instead of the `backend/` folder.

---

## SOLUTION: Update Render Service Settings

### Step 1: Go to Render Dashboard

1. Visit: https://dashboard.render.com
2. Click on your service: **"eye-lens-designer"**
3. Go to **"Settings"** tab

### Step 2: Update Root Directory ⚠️ CRITICAL

**Find "Root Directory" setting:**
- Current value: (empty or wrong)
- **Change to**: `backend`
- Click **"Save Changes"**

This tells Render to look for files inside the backend folder!

### Step 3: Verify Build Command

**Build Command should be:**
```
pip install --upgrade pip && pip install -r requirements.txt
```

### Step 4: Verify Start Command

**Start Command should be:**
```
python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Step 5: Set Environment to Python

**Environment:**
- Make sure it's set to **"Python"** (not Ruby!)

### Step 6: Add Environment Variables

Go to **"Environment"** tab and add:

**Required:**
```
PYTHON_VERSION=3.11.0
ENVIRONMENT=production
```

**Database (if using PostgreSQL):**
```
DATABASE_URL=[Your PostgreSQL URL]
```

**API Key:**
```
GEMINI_API_KEY=[Your Gemini API Key]
```

### Step 7: Manual Redeploy

After updating all settings:
1. Click **"Manual Deploy"** button
2. Select **"Deploy latest commit"**
3. Wait for build (5-10 minutes)
4. Check logs for success

---

## Alternative: Use render.yaml Blueprint

If manual configuration is too complex, Render can use the `render.yaml` file in your repository:

### Option A: Create New Service from Blueprint

1. Go to Render Dashboard
2. Click **"New +"** → **"Blueprint"**
3. Connect your repository: `raga29429-blip/eye_lens`
4. Render will automatically read `render.yaml`
5. It will create:
   - Backend service (with correct rootDir)
   - Frontend service
   - PostgreSQL database
6. Click **"Apply"**

This automatically configures everything correctly!

---

## Detailed Configuration Reference

### Backend Service Configuration

**Settings Tab:**
```
Service Name: eluno-oms-backend
Environment: Python
Root Directory: backend          ← CRITICAL!
Build Command: pip install --upgrade pip && pip install -r requirements.txt
Start Command: python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Environment Tab:**
```
PYTHON_VERSION=3.11.0
ENVIRONMENT=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
GEMINI_API_KEY=your_api_key_here
```

**Advanced Tab:**
```
Python Version: 3.11.0
Health Check Path: /
Auto-Deploy: Yes
```

---

## Common Issues & Solutions

### Issue 1: "Module not found" errors

**Solution:** Verify `backend/requirements.txt` has all dependencies:
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
python-dotenv==1.0.0
pydantic==2.5.3
scikit-learn==1.6.1
numpy==1.26.3
pandas==2.2.0
google-generativeai==0.8.6
twilio
```

### Issue 2: "Command not found: uvicorn"

**Solution:** Change start command to:
```
python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Issue 3: Database connection errors

**Solution:** 
- Ensure PostgreSQL database is created
- Use **Internal Database URL** (starts with `postgresql://`)
- Verify URL is set in environment variables

### Issue 4: Port binding errors

**Solution:** 
- Render provides `$PORT` environment variable
- Make sure start command uses `--port $PORT`
- Don't hardcode port 8000

### Issue 5: Build takes forever / times out

**Solution:**
- Free tier has limited resources
- Reduce dependencies if possible
- Consider upgrading to paid plan

---

## Testing Your Deployment

Once deployed successfully:

### Test Backend API:
```
https://eye-lens-designer.onrender.com/
```
Should return:
```json
{
  "message": "Eluno AI OMS Backend API",
  "status": "running"
}
```

### Test API Docs:
```
https://eye-lens-designer.onrender.com/docs
```
Should show FastAPI Swagger documentation

### Test Inventory Endpoint:
```
https://eye-lens-designer.onrender.com/api/inventory
```

---

## Deploying Frontend to Render

1. In Render Dashboard, click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL` = `https://eye-lens-designer.onrender.com/api`
5. Deploy

---

## Alternative: Deploy Frontend to Vercel

Since backend is on Render, you can use Vercel for frontend:

1. Go to https://vercel.com
2. Import your repository
3. Add environment variable:
   - `VITE_API_URL` = `https://eye-lens-designer.onrender.com/api`
4. Deploy

This is **faster and more reliable** for the frontend!

---

## Free Tier Limitations

**Render Free Tier:**
- ⚠️ Service spins down after 15 minutes of inactivity
- ⚠️ First request after sleep takes 30-60 seconds (cold start)
- ✅ 750 hours/month (enough for one service)
- ✅ Auto-deploy from GitHub

**PostgreSQL Free:**
- ✅ 256 MB storage
- ✅ Expires after 90 days (you'll need to renew)
- ✅ Good for development

---

## Checking Logs

Real-time logs:
1. Go to your service dashboard
2. Click **"Logs"** tab
3. Look for errors in red

Common log errors:
- `ModuleNotFoundError` → Missing dependency in requirements.txt
- `Port already in use` → Start command issue
- `Connection refused` → Database connection issue
- `Application startup failed` → Check main.py for errors

---

## Upgrade Options

If free tier is too slow:

**Starter Plan ($7/month):**
- No sleep/cold starts
- Better performance
- More reliable

**PostgreSQL Paid ($7/month):**
- 1 GB storage
- No 90-day expiration
- Better performance

---

## Complete Setup Checklist

Backend Service:
- [ ] Root Directory set to `backend`
- [ ] Build command correct
- [ ] Start command uses `python -m uvicorn`
- [ ] Python version set to 3.11.0
- [ ] ENVIRONMENT=production set
- [ ] DATABASE_URL configured
- [ ] GEMINI_API_KEY set
- [ ] Service shows "Live" status
- [ ] Logs show "Uvicorn running on"
- [ ] Can access root endpoint
- [ ] API docs accessible at /docs

Database:
- [ ] PostgreSQL database created
- [ ] Internal Database URL copied
- [ ] URL added to web service environment

Frontend (Optional):
- [ ] Static site created OR using Vercel
- [ ] VITE_API_URL points to backend
- [ ] Build successful
- [ ] Can access frontend URL

---

## Quick Troubleshooting Commands

Test backend from terminal:
```bash
curl https://eye-lens-designer.onrender.com/
curl https://eye-lens-designer.onrender.com/docs
curl https://eye-lens-designer.onrender.com/api/inventory
```

---

## Need Help?

1. Check **Render Logs** first
2. Verify all **environment variables**
3. Ensure **database is connected**
4. Try **manual redeploy**
5. Check **GitHub repo** has latest code

---

## Your Current Status

✅ Code pushed to GitHub
✅ Render service created
❌ Service returning 503 (needs configuration)

**Next Steps:**
1. Go to Render Dashboard
2. Check logs for specific error
3. Follow configuration steps above
4. Redeploy manually
