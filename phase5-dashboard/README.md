# Phase 5 Dashboard

## Overview
The Phase 5 Dashboard is a comprehensive web application designed to serve three types of users: learners, trainers, and policymakers. It provides role-specific dashboards with tailored features and analytics to support educational and training initiatives.

## Architecture
- **Backend**: FastAPI-based REST API
- **Frontend**: React application with Vite and Tailwind CSS
- **Database**: JSON-based data seeding (ready for database integration)

## Features

### 🎓 Learner Dashboard
- Personal learning progress tracking
- Skills and achievements display
- Course enrollment management
- Activity timeline and milestones

### 👨‍🏫 Trainer Dashboard
- Course and student management
- Class scheduling interface
- Student feedback and ratings
- Performance analytics

### 🏛️ Policymaker Dashboard
- System-wide analytics and KPIs
- Educational policy management
- Growth trends and reporting
- Impact assessment tools

## Quick Start

### Prerequisites
- Python 3.8+ (for backend)
- Node.js 16+ (for frontend)
- pip and npm package managers

### Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r app/requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Project Structure
```
phase5-dashboard/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application
│   │   ├── data_seed.json   # Sample data
│   │   └── requirements.txt # Python dependencies
│   └── README.md           # Backend documentation
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx         # Main app component
│   │   ├── api.js          # API client
│   │   └── ...            # Other frontend files
│   ├── package.json        # Node dependencies
│   └── README.md          # Frontend documentation
└── README.md              # This file
```

## Technology Stack

### Backend
- **FastAPI** - Modern, fast web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **Python-JOSE** - JWT handling
- **Passlib** - Password hashing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS
- **Axios** - HTTP client
- **ESLint** - Code linting

## API Endpoints
- `GET /` - Welcome message
- `GET /health` - Health check
- `GET /learners` - Learner data (planned)
- `GET /trainers` - Trainer data (planned)
- `GET /policymakers` - Policymaker data (planned)

## Development Roadmap
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User authentication and authorization
- [ ] Real-time notifications
- [ ] Advanced analytics and reporting
- [ ] Mobile responsive enhancements
- [ ] Export/import functionality
- [ ] Multi-language support

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License
This project is licensed under the MIT License.

## Support
For questions or issues, please create an issue in the repository or contact the development team.