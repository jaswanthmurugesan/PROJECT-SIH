# AI-Powered Personalized Learning Path Generator

A comprehensive MERN stack application designed to analyze learner profiles and generate personalized learning recommendations for India's skilling ecosystem, aligned with NSQF (National Skills Qualifications Framework).

## 🎯 Project Overview

This project addresses the SIH problem statement of creating an AI-enabled personalized career navigation system that helps learners find optimal training pathways based on their individual profiles, aspirations, and industry demands.

### Current Implementation: Learner Profile Analysis

The first phase focuses on comprehensive learner profiling, capturing:

- **Academic Background**: Education, certifications, field of study
- **Skills Assessment**: Technical and soft skills with proficiency levels
- **Socio-Economic Context**: Location, income, employment status, technology access
- **Learning Preferences**: Pace, style, time availability, attention span
- **Career Aspirations**: Goals, industry preferences, salary expectations

## 🛠️ Tech Stack

### Frontend

- **React 18** with Vite for fast development
- **Vanilla CSS** for styling with responsive design
- **Axios** for API communication

### Backend

- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication (ready for future implementation)
- **CORS** enabled for cross-origin requests

## 📁 Project Structure

```
NEW PS/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── LearnerProfileForm.jsx
│   │   │   └── LearnerProfileForm.css
│   │   ├── services/        # API service layer
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/                  # Node.js backend application
│   ├── models/              # MongoDB data models
│   │   └── LearnerProfile.js
│   ├── routes/              # Express route handlers
│   │   └── learnerRoutes.js
│   ├── server.js            # Main server file
│   ├── .env                 # Environment variables
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd "NEW PS"
   ```

2. **Setup Backend**

   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**
   Create/update `.env` file in the backend directory:

   ```
   MONGODB_URI=mongodb://localhost:27017/learning-path-generator
   PORT=5000
   JWT_SECRET=your-secret-key-here
   ```

4. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start MongoDB** (if using local installation)

   ```bash
   mongod
   ```

2. **Start Backend Server**

   ```bash
   cd backend
   npm run dev
   ```

   Backend will run on http://localhost:5000

3. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on http://localhost:5173

## 📋 API Endpoints

### Learner Profile Management

| Method | Endpoint                         | Description                    |
| ------ | -------------------------------- | ------------------------------ |
| GET    | `/api/learners`                  | Get all learner profiles       |
| GET    | `/api/learners/:id`              | Get specific learner profile   |
| POST   | `/api/learners`                  | Create new learner profile     |
| PUT    | `/api/learners/:id`              | Update learner profile         |
| DELETE | `/api/learners/:id`              | Soft delete learner profile    |
| GET    | `/api/learners/:id/completeness` | Get profile completeness score |
| POST   | `/api/learners/search`           | Search profiles with criteria  |

### Example API Usage

**Create Learner Profile:**

```bash
curl -X POST http://localhost:5000/api/learners \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "personalInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "academicBackground": {
      "highestEducation": "Graduate",
      "fieldOfStudy": "Computer Science"
    }
  }'
```

## 🎨 Features Implemented

### Comprehensive Profile Form

- **Multi-step wizard** with progress tracking
- **Responsive design** for mobile and desktop
- **Dynamic skill management** with add/remove functionality
- **Form validation** with real-time feedback
- **Profile completeness calculation**

### Data Models

- **Flexible schema** supporting diverse learner backgrounds
- **Validation rules** ensuring data quality
- **Computed fields** for profile completeness
- **Soft delete** functionality for data retention

### API Features

- **RESTful endpoints** with consistent response format
- **Search and filtering** capabilities
- **Error handling** with descriptive messages
- **Data validation** at multiple levels

## 🔮 Future Enhancements

### Phase 2: AI Recommendation Engine

- Machine learning models for skill-job mapping
- Collaborative filtering for course recommendations
- Natural language processing for aspirations analysis

### Phase 3: Industry Integration

- Real-time job market data integration
- NSQF qualification mapping
- Training provider API connections

### Phase 4: Advanced Features

- Multilingual support (Hindi, regional languages)
- Progress tracking and adaptive learning paths
- Gamification elements
- Mobile application

## 🧪 Testing

### Manual Testing

1. Open the application in your browser
2. Fill out the learner profile form step by step
3. Verify data persistence by checking MongoDB
4. Test API endpoints using tools like Postman

### Automated Testing (Future)

- Unit tests for components and API endpoints
- Integration tests for database operations
- End-to-end testing with Cypress

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Notes

### Data Privacy Considerations

- Sensitive information is properly validated
- No hardcoded credentials in the codebase
- Environment variables for configuration

### Scalability Features

- Modular architecture for easy extension
- Database indexing ready for implementation
- API pagination for large datasets

### Accessibility

- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly labels

## 📞 Support

For questions or support, please contact the development team or create an issue in the repository.

---

**Note**: This is the first phase of the AI-Powered Personalized Learning Path Generator. The current implementation focuses on comprehensive learner profiling, which serves as the foundation for future AI-driven recommendations and career pathway generation.
