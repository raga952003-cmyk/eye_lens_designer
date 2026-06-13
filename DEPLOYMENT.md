# Deployment Guide - Eluno AI OMS

This guide covers multiple deployment options for the Eluno AI Order Management System.

---

## Option 1: Vercel + Render (Recommended - Free Tier)

### Step 1: Deploy Backend to Render

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with your GitHub account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `raga952003-cmyk/eye_lens_designer`
   - Configure:
     - **Name**: `eluno-oms-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
     - **Plan**: Free

3. **Add Database**
   - In Render Dashboard, click "New +" → "PostgreSQL"
   - Name: `eluno-oms-db`
   - Plan: Free
   - Copy the "Internal Database URL"

4. **Configure Environment Variables** (in Web Service settings)
   - `DATABASE_URL`: [Paste the PostgreSQL Internal Database URL]
   - `GEMINI_API_KEY`: [Your Gemini API key]
   - `PYTHON_VERSION`: `3.11.0`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy your backend URL: `https://eluno-oms-backend.onrender.com`

### Step 2: Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with your GitHub account

2. **Import Project**
   - Click "New Project"
   - Import `raga952003-cmyk/eye_lens_designer`
   - Vercel auto-detects Vite configuration

3. **Configure Build Settings**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variable**
   - Click "Environment Variables"
   - Add: `VITE_API_URL` = `https://eluno-oms-backend.onrender.com/api`
   - Apply to: Production, Preview, Development

5. **Deploy**
   - Click "Deploy"
   - Wait for build (2-5 minutes)
   - Your app will be live at: `https://your-project.vercel.app`

### Step 3: Update Backend CORS

After deployment, update the backend CORS settings to allow your Vercel domain:

1. In Render dashboard, go to your backend service
2. Go to "Environment" tab
3. Add: `FRONTEND_URL` = `https://your-project.vercel.app`
4. The backend will automatically allow this origin

**Total Cost**: FREE (with limitations)
- Render Free: 750 hours/month
- Vercel Free: 100 GB bandwidth/month
- PostgreSQL Free: 1 GB storage

---

## Option 2: Railway (All-in-One - Simplest)

### Step 1: Deploy to Railway

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose: `raga952003-cmyk/eye_lens_designer`

3. **Railway Auto-Detection**
   Railway will automatically detect:
   - Frontend (Node.js/Vite)
   - Backend (Python/FastAPI)

4. **Add PostgreSQL Database**
   - Click "+ New"
   - Select "Database" → "Add PostgreSQL"
   - Railway creates database automatically

5. **Configure Services**

   **Backend Service:**
   - Root Directory: `backend`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Add Environment Variables:
     - `DATABASE_URL`: (Link to PostgreSQL service)
     - `GEMINI_API_KEY`: [Your API key]

   **Frontend Service:**
   - Root Directory: `/` (root)
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Add Environment Variable:
     - `VITE_API_URL`: (Link to Backend service URL + `/api`)

6. **Deploy**
   - Railway automatically deploys both services
   - Get your URLs:
     - Frontend: `https://your-app.up.railway.app`
     - Backend: `https://your-backend.up.railway.app`

**Cost**: 
- $5 free credit/month
- After: ~$10-15/month for both services + database

---

## Option 3: DigitalOcean App Platform (Production Ready)

### Step 1: Deploy to DigitalOcean

1. **Create DigitalOcean Account**
   - Go to https://cloud.digitalocean.com
   - Sign up and verify email

2. **Create New App**
   - Go to "Apps" → "Create App"
   - Choose "GitHub" → Authorize → Select repository
   - Choose branch: `main`

3. **Configure Resources**

   **Web Service (Backend):**
   - Name: `eluno-backend`
   - Source Directory: `/backend`
   - Environment: `Python`
   - Build Command: `pip install -r requirements.txt`
   - Run Command: `uvicorn main:app --host 0.0.0.0 --port 8080`
   - HTTP Port: `8080`
   - Instance Size: Basic ($5/month)

   **Static Site (Frontend):**
   - Name: `eluno-frontend`
   - Source Directory: `/`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Instance Size: Free

4. **Add Database**
   - Click "Add Resource" → "Database"
   - Choose: PostgreSQL
   - Plan: Basic ($15/month)
   - DigitalOcean auto-generates `${db.DATABASE_URL}`

5. **Environment Variables**

   **Backend:**
   - `DATABASE_URL`: `${db.DATABASE_URL}`
   - `GEMINI_API_KEY`: [Your API key]

   **Frontend:**
   - `VITE_API_URL`: `${eluno-backend.PUBLIC_URL}/api`

6. **Deploy**
   - Review and click "Create Resources"
   - Wait 10-15 minutes
   - Access your app at the provided URL

**Cost**: ~$20/month
- Backend: $5/month
- Database: $15/month
- Frontend: Free

---

## Option 4: Docker Deployment (Self-Hosted)

If you have your own VPS (AWS EC2, DigitalOcean Droplet, etc.):

### Prerequisites
- Linux server with Docker installed
- Domain name (optional)

### Deployment Steps

1. **SSH into your server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Clone repository**
   ```bash
   git clone https://github.com/raga952003-cmyk/eye_lens_designer.git
   cd eye_lens_designer
   ```

3. **Create environment files**
   ```bash
   # Backend .env
   echo "DATABASE_URL=postgresql://user:pass@db:5432/eluno_oms" > backend/.env
   echo "GEMINI_API_KEY=your_key" >> backend/.env
   
   # Frontend .env
   echo "VITE_API_URL=http://your-domain.com/api" > .env
   ```

4. **Update docker-compose.yml with production settings**
   ```bash
   nano docker-compose.yml
   # Update PostgreSQL credentials
   # Update API URLs
   ```

5. **Build and run**
   ```bash
   docker-compose up -d --build
   ```

6. **Set up Nginx reverse proxy** (optional)
   ```bash
   sudo apt install nginx
   # Configure Nginx to proxy requests to Docker containers
   ```

7. **Set up SSL certificate** (optional)
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## Recommended Choice by Use Case

| Use Case | Best Option | Cost | Complexity |
|----------|------------|------|-----------|
| **Demo/Portfolio** | Vercel + Render | Free | Easy |
| **Quick Deploy** | Railway | $10-15/mo | Easiest |
| **Production** | DigitalOcean | $20/mo | Medium |
| **Full Control** | Self-Hosted VPS | $5-20/mo | Hard |
| **Enterprise** | AWS/Azure/GCP | $50+/mo | Hard |

---

## Post-Deployment Checklist

- [ ] Test all API endpoints
- [ ] Verify database connection
- [ ] Test order creation and updates
- [ ] Verify ML model predictions work
- [ ] Test Gemini AI recommendations
- [ ] Check mobile responsiveness
- [ ] Set up monitoring (optional)
- [ ] Configure custom domain (optional)
- [ ] Set up automated backups

---

## Monitoring & Maintenance

### Free Monitoring Tools
- **Uptime Robot**: https://uptimerobot.com (Monitor uptime)
- **Better Stack**: https://betterstack.com (Log monitoring)
- **Sentry**: https://sentry.io (Error tracking)

### Database Backups
- Render: Automatic daily backups on paid plans
- Railway: Manual backups via dashboard
- DigitalOcean: Automatic daily backups included

---

## Troubleshooting

### Backend won't start
- Check environment variables are set correctly
- Verify DATABASE_URL format
- Check logs in deployment platform

### Frontend can't connect to backend
- Verify VITE_API_URL is correct
- Check backend CORS settings
- Ensure backend is running and accessible

### Database connection errors
- Verify DATABASE_URL format
- Check database is running
- Verify network connectivity between services

---

## Need Help?

1. Check deployment platform documentation
2. Review application logs
3. Test API endpoints with curl or Postman
4. Check GitHub Issues for known problems

---

**Quick Deploy Commands Summary:**

```bash
# Render deployment (render.yaml included)
git push origin main

# Railway deployment
railway up

# Vercel deployment
vercel --prod

# Docker deployment
docker-compose up -d --build
```
