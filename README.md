# AI Studio - Advanced AI Image Generation & Chat Platform

A professional full-stack AI platform featuring cutting-edge image generation with Stable Diffusion XL, intelligent chatbot powered by GPT-4o-mini, and an immersive 3D user interface built with Three.js.

## 🌟 Features

### 🎨 AI Image Generation
- **Stable Diffusion XL** integration for high-quality image generation
- **Multiple artistic styles** (Realistic, Artistic, Anime, Cartoon, Abstract, etc.)
- **Advanced controls** (steps, guidance scale, seed, negative prompts)
- **Real-time progress tracking** with streaming updates
- **No content restrictions** - full creative control
- **High-resolution output** up to 1024x1024

### 🤖 Intelligent AI Chatbot
- **GPT-4o-mini** powered conversations
- **Streaming responses** for real-time interaction
- **Context awareness** and conversation memory
- **System prompts** for customized behavior
- **Markdown support** with code highlighting
- **Session management** with history

### 🎭 3D Interactive Interface
- **Three.js** powered immersive UI
- **Smooth animations** and transitions
- **Responsive design** for all devices
- **Modern glassmorphism** aesthetics
- **Particle systems** and floating elements
- **Interactive 3D models**

### 📊 Complete History & Analytics
- **Full conversation history** with search
- **Image generation gallery** with favorites
- **Usage statistics** and insights
- **Export functionality** for data portability
- **Advanced filtering** and organization

### 🔒 Security & Performance
- **JWT authentication** with secure token management
- **Encrypted data storage** and transmission
- **Optimized performance** with smart caching
- **Background processing** for heavy tasks
- **Real-time progress** tracking
- **Mobile-first** responsive design

## 🚀 Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Three.js** for 3D graphics
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Query** for data fetching
- **Zustand** for state management

### Backend
- **FastAPI** for high-performance API
- **Python 3.11** with async support
- **MongoDB** for data persistence
- **JWT** for authentication
- **OpenAI API** for chat functionality
- **Stable Diffusion XL** for image generation
- **WebSocket** for real-time updates

### Infrastructure
- **Vercel** for frontend deployment
- **Render** for backend hosting
- **MongoDB Atlas** for database
- **Docker** for containerization
- **GitHub Actions** for CI/CD

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **MongoDB** (local or Atlas)
- **OpenAI API** key
- **Git** for version control

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ai-studio.git
cd ai-studio
```

### 2. Environment Setup
```bash
# Copy environment variables
cp .env.example .env

# Edit .env with your API keys and configuration
nano .env
```

### 3. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Frontend Setup
```bash
# Navigate to frontend directory (in new terminal)
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 5. Database Setup
```bash
# Make sure MongoDB is running locally, or use MongoDB Atlas
# The application will automatically create indexes on startup
```

## 🔧 Configuration

### Required Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

#### Backend (.env)
```env
# Database
MONGODB_URL=mongodb://localhost:27017/ai_studio

# Authentication
SECRET_KEY=your-super-secret-jwt-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# APIs
OPENAI_API_KEY=your-openai-api-key
STABILITY_API_KEY=your-stability-api-key  # Optional
HUGGINGFACE_API_TOKEN=your-huggingface-token  # Optional

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=True
FRONTEND_URL=http://localhost:3000
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set environment variables in Render dashboard
4. Use the provided `render.yaml` configuration

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Update the `MONGODB_URL` in your environment variables
3. Configure network access and database users

## 📱 Usage

### Getting Started
1. **Sign Up**: Create a new account or sign in
2. **Dashboard**: Overview of your activity and quick actions
3. **Generate Images**: Use the AI image generator with custom prompts
4. **Chat**: Interact with the AI chatbot for assistance
5. **History**: View and manage your generated content

### Image Generation
1. Navigate to the Image Generator
2. Enter your prompt and configure settings
3. Click "Generate" and watch real-time progress
4. Download or save to favorites

### AI Chat
1. Go to the AI Chatbot section
2. Start a conversation with custom system prompts
3. Enjoy streaming responses with full context
4. Access conversation history anytime

## 🔧 Development

### Project Structure
```
ai-studio/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities and API
│   │   └── types/           # TypeScript types
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # FastAPI backend
│   ├── routers/             # API route handlers
│   ├── models.py            # Pydantic models
│   ├── database.py          # Database connection
│   ├── auth.py              # Authentication logic
│   ├── main.py              # FastAPI app
│   └── requirements.txt
├── .env.example             # Environment template
├── vercel.json              # Vercel config
└── README.md
```

### Available Scripts

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

#### Backend
```bash
uvicorn main:app --reload    # Start development server
python -m pytest            # Run tests
black .                      # Format code
flake8 .                     # Lint code
```

### API Documentation
Once the backend is running, visit:
- **Interactive docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test        # Run Jest tests
npm run test:watch  # Watch mode
npm run test:coverage  # Coverage report
```

### Backend Testing
```bash
cd backend
python -m pytest tests/  # Run all tests
python -m pytest --cov=.  # With coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-4o-mini API
- **Stability AI** for Stable Diffusion XL
- **Three.js** community for 3D graphics
- **Next.js** team for the amazing framework
- **FastAPI** for the high-performance backend framework

## 📞 Support

- **Documentation**: Check the `/docs` endpoint when backend is running
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions

## 🔮 Roadmap

- [ ] **Voice Chat** integration
- [ ] **Video Generation** capabilities
- [ ] **Multi-language** support
- [ ] **Plugin System** for extensions
- [ ] **Advanced Analytics** dashboard
- [ ] **Team Collaboration** features
- [ ] **API Rate Limiting** and quotas
- [ ] **Advanced Model** fine-tuning

---

**Built with ❤️ for the AI community**