# Have a look at a application
https://prism-ai-iota.vercel.app/
# 🎓 Prism - AI Career Guidance Platform

A comprehensive AI-powered career guidance web platform designed for Indian students. Provides personalized career advice, skills gap analysis, and 24/7 mentorship through intelligent chatbot powered by Google Gemini AI.

## 🌟 Features

### Core Functionality
- **AI-Powered Career Assessment**: Comprehensive questionnaire analyzed by Google Gemini AI
- **Personalized Recommendations**: Get career paths matched to your interests, skills, and goals
- **Skills Gap Analysis**: Identify skills you need to develop with learning resource recommendations
- **AI Mentor Chatbot**: 24/7 career guidance specifically trained for Indian students
- **Career Exploration**: Browse 500+ career paths with salary insights and exam requirements
- **User Authentication**: Secure Firebase authentication with Email/Password and Google Sign-In
- **Career Journey Tracking**: Track your progress through selected career paths
- **Job Search Integration**: Search and apply to jobs through Indeed API

### Technology Stack

**Frontend:**
- React 18 with Vite
- React Router for navigation
- Tailwind CSS for styling
- Lucide React for icons
- Firebase Auth
- Axios for API calls

**Backend:**
- Python 3.9+
- FastAPI web framework
- Langchain for AI orchestration
- Google Generative AI (Gemini)
- MongoDB database
- Pydantic for data validation
- CORS middleware

## 📁 Project Structure

```
Prism/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── app.py               # ASGI entry point
│   ├── database.py          # Database connection and queries
│   ├── user_database.py     # User data management
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment template
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API & Firebase services
│   │   ├── context/         # React context
│   │   ├── hooks/           # Custom React hooks
│   │   ├── App.jsx          # Main app
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example         # Environment template
│
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- MongoDB (Local or Atlas)
- Google API Key (Gemini)
- Firebase project

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure environment:**
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your credentials
# Required: GOOGLE_API_KEY, MONGODB_URI
```

5. **Setup MongoDB Database:**
   - **Local:** Ensure MongoDB is running locally. Default URI: `mongodb://localhost:27017/`
   - **Atlas:** Create a cluster, get the connection string, and update `MONGODB_URI` in `.env`.
   - The application will create necessary collections on first run.

6. **Get Google API Key:**
   - Visit https://makersuite.google.com/app/apikey
   - Create new API key
   - Add to `.env` file as `GOOGLE_API_KEY`

7. **Run backend:**
```bash
uvicorn main:app --reload --port 8000
```

Backend will run at: http://localhost:8000  
API docs at: http://localhost:8000/docs

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add Firebase configuration
```

4. **Setup Firebase:**
   - Go to https://console.firebase.google.com/
   - Create a new project
   - Enable Authentication (Email/Password + Google Sign-In)
   - Copy Firebase config values to `.env` file
   - Update `VITE_API_URL` to your backend URL

5. **Run frontend:**
```bash
npm run dev
```

Frontend will run at: http://localhost:5173

## 🔧 Environment Variables

### Backend (.env)

```env
# Required
GOOGLE_API_KEY=your_google_api_key_here
MONGODB_URI=mongodb://localhost:27017/
DB_NAME=prism_careers

# Optional - Email notifications
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Optional - Server config
PORT=8000
HOST=0.0.0.0
```

### Frontend (.env)

```env
# Required - Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Required - Backend API URL
VITE_API_URL=http://localhost:8000
```

## 🚀 Deployment

### Backend Deployment (Railway/Render/Heroku)

1. **Prepare for deployment:**
   - Ensure all environment variables are set in your hosting platform
   - Update CORS settings in `main.py` to allow your frontend domain
   - Set `HOST=0.0.0.0` and appropriate `PORT` in environment variables

2. **Database (MongoDB Atlas):**
   - Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas/database)
   - Whitelist `0.0.0.0/0` (or your server IP) in Network Access
   - Get the connection string (SRV) and set it as `MONGODB_URI` in your deployment platform variables

3. **Deploy:**
   ```bash
   # For Railway/Render, push to your repository
   git push origin main
   
   # Platform will auto-detect and deploy
   # Make sure to set all environment variables in platform dashboard
   ```

4. **Required Environment Variables on Platform:**
   - `GOOGLE_API_KEY`
   - `MONGODB_URI`
   - `DB_NAME` (optional, defaults to prism_careers)
   - `SMTP_SERVER`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` (optional)

### Frontend Deployment (Vercel/Netlify)

1. **Build the application:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy:**
   ```bash
   # For Vercel
   vercel deploy --prod
   
   # For Netlify
   netlify deploy --prod
   ```

3. **Set Environment Variables:**
   - Add all `VITE_*` variables in your hosting platform's environment settings
   - Update `VITE_API_URL` to your deployed backend URL

4. **Build Settings:**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`

### Production Checklist

- [ ] All environment variables are set (no hardcoded secrets)
- [ ] CORS is configured for your frontend domain
- [ ] Database is accessible from backend server (MongoDB Atlas Network Access)
- [ ] Firebase authentication is configured
- [ ] Google API key has proper quotas set
- [ ] SSL/HTTPS is enabled
- [ ] Error logging is configured
- [ ] Database backups are scheduled (Auto-managed by Atlas)

## 📡 API Endpoints

### Assessment
- `GET /api/assessment/questions` - Fetch assessment questions
- `POST /api/assessment/submit` - Submit answers for AI analysis

### Mentor
- `POST /api/mentor/chat` - Chat with AI mentor
- `GET /api/mentor/chat/history/{user_id}` - Get chat history

### Careers
- `GET /api/careers/explore` - Browse career paths
- `GET /api/careers/{slug}` - Get career details
- `POST /api/career/request` - Request new career addition

### User
- `GET /api/user/{user_id}/progress` - Get user progress
- `POST /api/user/selected-careers` - Save selected careers
- `POST /api/career-journey/select` - Select career journey

### Jobs
- `GET /api/jobs` - Get job listings
- `GET /api/jobs/indeed-search` - Search Indeed jobs
- `POST /api/jobs/apply` - Apply to job

## 🎨 Key Components

### Frontend Pages
- **LandingPage**: Hero, features, testimonials
- **Login/Signup**: Firebase authentication
- **Dashboard**: User overview and recommendations
- **Assessment**: Dynamic career questionnaire
- **AssessmentResults**: AI-generated recommendations with pagination
- **AIMentor**: Chat interface with AI
- **ExploreCareers**: Career path browser with pagination
- **CareerDetail**: Detailed career information
- **CareerJourney**: Track career path progress

### Backend Features
- **Dynamic Questions**: 10 comprehensive assessment questions
- **AI Analysis**: Gemini AI processes responses
- **JSON Responses**: Structured career recommendations
- **Context-Aware Chat**: Personalized mentor responses
- **Database Integration**: MongoDB for data persistence
- **Email Notifications**: Career request notifications

## 🔐 Security

- Firebase Authentication for user management
- Environment variables for sensitive data
- CORS configuration for API security
- Input validation with Pydantic
- NoSQL injection prevention (using ODM/ORM patterns)
- API key protection (never commit to git)

## 🛠️ Development Tips

1. **Backend Development:**
   - Use `--reload` flag for auto-restart: `uvicorn main:app --reload`
   - Check `/docs` for interactive API testing
   - Monitor console for AI response errors

2. **Frontend Development:**
   - Use React DevTools for debugging
   - Check browser console for errors
   - Test responsive design at different breakpoints

3. **Database:**
   - Use MongoDB Compass for database management
   - Backup database regularly during development
   - Check connection settings if errors occur

## 📝 License

MIT License - feel free to use for educational purposes

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For issues or questions:
- Check environment variables are properly set
- Review API docs at `/docs` endpoint
- Check Firebase and Google AI console for service status
- Verify database connection and credentials

## 🎯 Roadmap

- [ ] Add more career paths
- [ ] Integrate more AI models
- [ ] Add skill assessment tests
- [ ] Create mobile app
- [ ] Add mentor booking system
- [ ] Implement analytics dashboard
- [ ] Add career comparison feature

---

Built with ❤️ for Indian students seeking career guidance
