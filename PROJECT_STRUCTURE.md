# Project Structure - Eluno AI OMS

## 📁 Clean Folder Structure

```
eye_lens/
├── backend/                    # Python FastAPI Backend
│   ├── routers/               # API endpoint handlers
│   │   ├── alerts.py
│   │   ├── inventory.py
│   │   ├── metrics.py
│   │   ├── ml_model.py
│   │   ├── orders.py
│   │   └── recommendations.py
│   ├── services/              # Business logic
│   │   ├── alert_manager.py
│   │   ├── dashboard_service.py
│   │   ├── gemini_integration.py
│   │   ├── inventory_manager.py
│   │   ├── order_lifecycle_manager.py
│   │   └── prediction_engine.py
│   ├── database.py            # Database configuration
│   ├── Dockerfile             # Backend Docker image
│   ├── main.py                # Application entry point
│   ├── models.py              # SQLAlchemy data models
│   ├── nixpacks.toml          # Railway build config
│   ├── README.md              # Backend documentation
│   ├── requirements.txt       # Python dependencies
│   ├── schemas.py             # Pydantic request/response schemas
│   ├── seed_data.py           # Database seeding script
│   └── start.sh               # Startup script
│
├── frontend/                  # React TypeScript Frontend
│   ├── src/
│   │   ├── components/       # UI Components
│   │   │   ├── AlertsTab.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── InventoryTab.tsx
│   │   │   ├── OrdersTab.tsx
│   │   │   ├── PredictionsTab.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── config/
│   │   │   └── api.ts        # API configuration
│   │   ├── App.tsx           # Main application
│   │   ├── index.css         # Global styles
│   │   ├── main.tsx          # Entry point
│   │   └── types.ts          # TypeScript types
│   ├── Dockerfile            # Frontend Docker image
│   ├── index.html            # HTML template
│   ├── package.json          # Node dependencies
│   ├── README.md             # Frontend documentation
│   ├── tsconfig.json         # TypeScript config
│   └── vite.config.ts        # Vite build config
│
├── docs/                      # Documentation
│   ├── DEPLOYMENT.md         # Multi-platform deployment guide
│   ├── RAILWAY_SETUP.md      # Railway-specific guide
│   └── RENDER_SETUP.md       # Render-specific guide
│
├── .kiro/                     # Kiro specifications
│   └── specs/
│       └── eluno-ai-order-management-system/
│           ├── .config.kiro
│           ├── design.md
│           ├── requirements.md
│           └── tasks.md
│
├── .env.example              # Environment variables template
├── .gitignore                # Git exclusions
├── docker-compose.yml        # Docker orchestration
├── Eluno_OMS_Integration_Demo.ipynb  # Demo notebook
├── order_breach_model (1).pkl        # Trained ML model
├── Procfile                  # Process file for deployment
├── PROJECT_STRUCTURE.md      # This file
├── railway.toml              # Railway configuration
├── README.md                 # Main project documentation
├── render.yaml               # Render configuration
├── runtime.txt               # Python version specification
├── test_api_integration.py   # API integration tests
└── vercel.json               # Vercel configuration
```

## 🗂️ Key Changes Made

### ✅ Organized Structure
- **Backend**: All Python code in `backend/` folder
- **Frontend**: All React code in `frontend/` folder
- **Docs**: All guides in `docs/` folder
- **Root**: Only essential config files

### ❌ Removed Files
- `server.ts` - Not needed with separate folders
- `metadata.json` - Unnecessary metadata
- `eluno_db.json` - Using SQL database instead
- `eluno_integration_demo.ipynb` - Duplicate notebook
- `Dockerfile.frontend` - Moved to `frontend/Dockerfile`
- `render-backend.yaml` - Consolidated into `render.yaml`

### 📝 Added Files
- `backend/README.md` - Backend-specific documentation
- `frontend/README.md` - Frontend-specific documentation
- `frontend/Dockerfile` - Frontend Docker configuration
- `PROJECT_STRUCTURE.md` - This documentation

## 🚀 Running the Project

### Development Mode

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
Access: http://localhost:8000

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Access: http://localhost:3000

### Docker Mode

```bash
docker-compose up --build
```
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

## 📦 Deployment

Each platform has its own configuration:

- **Railway**: Uses `railway.toml` + `backend/nixpacks.toml`
- **Render**: Uses `render.yaml`
- **Vercel**: Uses `vercel.json` (frontend only)
- **Docker**: Uses `docker-compose.yml`

See `docs/DEPLOYMENT.md` for complete deployment instructions.

## 🔐 Environment Variables

**Backend (.env):**
```env
DATABASE_URL=sqlite:///./eluno_oms.db
GEMINI_API_KEY=your_api_key
ENVIRONMENT=development
PORT=8000
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:8000/api
```

## 📊 File Count

- **Backend**: 20 files
- **Frontend**: 17 files
- **Documentation**: 4 files
- **Configuration**: 10 files
- **Specifications**: 4 files
- **ML/Data**: 2 files
- **Total**: 57 files (clean and organized!)

## 🎯 Benefits of New Structure

1. **Clear Separation**: Frontend and backend are completely separated
2. **Easy Deployment**: Each folder can be deployed independently
3. **Better Organization**: Documentation in dedicated folder
4. **Cleaner Root**: Only essential configuration files at root
5. **Scalable**: Easy to add new services or components
6. **Docker Ready**: Each service has its own Dockerfile
7. **CI/CD Friendly**: Clear build paths for each service

## 📖 Next Steps

1. See `README.md` for project overview
2. See `backend/README.md` for backend setup
3. See `frontend/README.md` for frontend setup
4. See `docs/DEPLOYMENT.md` for deployment options

---

**Repository**: https://github.com/raga29429-blip/eye_lens

**Status**: ✅ Production Ready
