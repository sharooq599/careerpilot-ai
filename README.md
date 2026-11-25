
# 🚀 CareerPilot AI – Intelligent AI-Powered Career Assistant

CareerPilot AI is a full-stack AI-powered career management platform designed to help job seekers manage their resumes, discover career opportunities, analyze job compatibility, prepare for interviews, and track job applications.

The platform integrates Artificial Intelligence with modern web technologies to provide personalized career guidance and simplify the job search process.

## ✨ Key Features

### 1. User Authentication
- User registration and login.
- JWT-based authentication.
- Secure password hashing.
- Protected application routes.

### 2. Resume Management
- Upload PDF and DOCX resumes.
- Extract resume content.
- Manage uploaded resumes.

### 3. AI Resume Matching
- Analyze resumes against job descriptions.
- Generate resume match scores.
- Identify matched and missing skills.
- Provide AI-powered recommendations.

### 4. AI Career Recommendations
- Personalized career guidance.
- Recommended job roles.
- Skills to learn.
- Learning roadmaps.
- Project recommendations.

### 5. Job Management
- Add new job opportunities.
- View available jobs.
- Edit job details.
- Delete jobs.

### 6. Application Tracking
- Track job applications.
- Update application statuses.
- Manage interview and follow-up details.
- Monitor application progress.

### 7. AI Interview Preparation
- Generate role-specific interview questions.
- Choose experience levels and interview topics.
- View suggested answer outlines.
- Copy individual questions or all questions.

### 8. Profile Management
- Update personal information.
- Change account password.
- Validate profile information.

### 9. Dashboard
- View career activity statistics.
- Monitor resumes, jobs, applications and AI analyses.
- Navigate between career management tools.

## 🛠️ Technology Stack

**Frontend**
- React.js
- JavaScript
- Vite
- Axios
- React Router
- CSS
- Lucide React

**Backend**
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication

**Database**
- PostgreSQL

**Artificial Intelligence**
- OpenRouter API
- LLM Integration
- AI-powered Resume Analysis
- AI Career Recommendations
- AI Interview Question Generation

## 🏗️ Project Structure

```text
ai-career-agent/
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   └── services/
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
│
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

- Python 3.10 or later
- Node.js and npm
- PostgreSQL
- Git
- OpenRouter API key

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd ai-career-agent
```

### 2. Backend Setup

Open a terminal:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure your backend environment variables in a `.env` file using your local PostgreSQL database credentials and OpenRouter API key.

Example configuration:

```env
DATABASE_URL=your_postgresql_connection_string
SECRET_KEY=your_secret_key
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-4o-mini
```

Start the backend:

```bash
uvicorn app.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

API Documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## 🔐 Security

- JWT-based authentication.
- Password hashing.
- Protected API endpoints.
- Environment variables for sensitive configuration.
- User-based access control for job management.

Never commit API keys, passwords, database credentials, or `.env` files to GitHub.

## 🎯 Project Objective

The main objective of CareerPilot AI is to build an intelligent career management platform that combines resume analysis, AI-driven career recommendations, interview preparation, and application tracking in one place.

## 👨‍💻 Author

**Shaik Sharooq Ali**

MCA Graduate | Full-Stack Developer | AI Enthusiast

GitHub: https://github.com/sharooq599

---

⭐ If you find this project interesting, feel free to explore the repository and share your feedback.