# VocaSync

A modern language translation and learning platform built with React, TypeScript, and Clerk authentication.

## Features

- 🔐 Secure authentication with Clerk
- 🌐 Multi-language translation support
- 🤖 AI-powered translation assistance
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Clerk account for authentication

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vocasync.git
cd vocasync
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Clerk Authentication
- React Router DOM

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌟 Features

### 1. Advanced Translation
- Real-time translation between 100+ languages
- Auto-language detection
- Text-to-speech capabilities
- Copy-to-clipboard functionality
- Modern, intuitive interface
- Support for multiple language pairs

### 2. AI-Powered Language Assistant
- Interactive chatbot for language learning
- Purpose-based language recommendations
- Practice conversations in target languages
- Instant feedback and corrections
- Contextual learning scenarios
- Support for multiple learning purposes:
  - Business
  - Travel
  - Education
  - Social
  - Technical

### 3. User Authentication
- Secure authentication using Clerk
- Google OAuth integration
- Protected routes and features
- User session management
- Personalized dashboard

### 4. Modern UI/UX
- Responsive design for all devices
- Dark mode with gradient themes
- Glassmorphism effects
- Smooth animations and transitions
- Intuitive navigation
- Loading states and error handling

### 5. Dashboard Features
- Translation history
- User statistics
- Language preferences
- Quick actions
- Recent activity tracking

## 🛠️ Tech Stack

### Frontend
- React with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Lucide React for icons
- Clerk for authentication

### Backend
- Flask (Python)
- SQLAlchemy for database
- Google Translate API
- Groq LLM for chatbot
- Flask-Login for session management
- Flask-CORS for cross-origin requests

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vocasync.git
cd vocasync
```

2. Set up the backend:
```bash
cd project/backend
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
pip install -r requirements.txt
```

3. Set up the frontend:
```bash
cd project
npm install
```

4. Create a `.env` file in the backend directory:
```env
FLASK_APP=app.py
FLASK_ENV=development
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GROQ_API_KEY=your_groq_api_key
```

5. Create a `.env` file in the frontend directory:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### Running the Application

1. Start the backend server:
```bash
cd project/backend
python app.py
```

2. Start the frontend development server:
```bash
cd project
npm start
```

3. Open your browser and navigate to `http://localhost:5173`

## 📝 API Endpoints

### Translation API
- `POST /api/translate` - Translate text
- `POST /api/text-to-speech` - Convert text to speech
- `GET /api/detect-location` - Detect user's location for language suggestions

### Chatbot API
- `POST /api/chatbot/start` - Start a new conversation
- `POST /api/chatbot/chat` - Send messages to the chatbot

### Authentication API
- `GET /api/auth/google/url` - Get Google OAuth URL
- `GET /api/auth/google/callback` - Handle Google OAuth callback
- `POST /api/auth/logout` - Logout user

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Clerk](https://clerk.dev/) for authentication
- [Google Translate](https://cloud.google.com/translate) for translation services
- [Groq](https://groq.com/) for LLM capabilities
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [React](https://reactjs.org/) for the frontend framework
- [Flask](https://flask.palletsprojects.com/) for the backend framework

## 📞 Support

For support, email support@vocasync.com or create an issue in the repository.

## 🔄 Updates

- Version 1.0.0 - Initial release
- Added AI-powered language assistant
- Implemented Google OAuth authentication
- Added text-to-speech capabilities
- Enhanced UI with modern design elements 