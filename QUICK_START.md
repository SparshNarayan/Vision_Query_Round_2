# VisionQuery - Quick Start Guide ⚡

Get VisionQuery running in under 3 minutes!

## 🎯 Prerequisites Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] Terminal/Command Prompt ready

## 🚀 Setup Steps

### Step 1: Backend Setup (2 minutes)

1. **Open terminal in project root**

2. **Navigate to backend:**
   ```bash
   cd backend
   ```

3. **Create virtual environment:**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # Mac/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
   ⏱️ *This takes 2-3 minutes (downloads ML models)*

5. **Create .env file:**
   ```bash
   # Windows
   copy .env.example .env
   
   # Mac/Linux
   cp .env.example .env
   ```

6. **Edit .env** - Open `.env` file and set:
   ```
   SECRET_KEY=your-super-secret-key-change-this-to-random-string
   ```

7. **Start backend:**
   ```bash
   uvicorn main:app --reload
   ```
   ✅ Backend running on http://localhost:8000

### Step 2: Frontend Setup (1 minute)

1. **Open NEW terminal** (keep backend running)

2. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```
   ⏱️ *Takes ~1 minute*

4. **Start frontend:**
   ```bash
   npm start
   ```
   ✅ Browser opens automatically at http://localhost:3000

## 🎉 You're Done!

### First Time Setup Checklist:
- [ ] Backend running (terminal 1)
- [ ] Frontend running (terminal 2)
- [ ] Browser shows VisionQuery login page

### Try It Out:

1. **Register**: Click "Register" → Create account
2. **Login**: Use your credentials
3. **Upload**: Go to Upload tab → Upload an image
4. **Classify**: Go to Results → Click "Classify" on an image
5. **Search**: Go to Search tab → Type "a dog" → See results!

## 🐛 Common Issues

### "Module not found" error
- Make sure you're in the `backend/` directory when running backend
- Activate virtual environment: `venv\Scripts\activate` (Windows)

### Port 8000 already in use
- Change port in `backend/main.py`: `uvicorn.run(app, port=8001)`
- Update frontend API URL in `frontend/src/services/api.js`

### Port 3000 already in use
- Terminal will ask if you want to use different port - press Y

### "CLIP model download failed"
- Check internet connection
- Models download on first run (~400MB)

### Images not showing
- Make sure backend is running
- Check browser console for errors
- Verify image path in database

## 📋 Quick Commands Reference

```bash
# Backend (from backend/ directory)
uvicorn main:app --reload

# Frontend (from frontend/ directory)
npm start

# Stop servers
Ctrl+C in each terminal
```

## 🎓 Next Steps

- Read `README.md` for full documentation
- Check API docs at http://localhost:8000/docs
- Upload some images and try searching!

---

**Happy Hacking! 🚀**
