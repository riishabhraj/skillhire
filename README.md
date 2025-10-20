# SkillHire - AI-Powered Job Matching Platform

A modern, full-stack job matching platform that connects employers with skilled candidates through AI-powered evaluation and GitHub integration.

## 🚀 Features

### For Candidates
- **Smart Profile Creation** - Build comprehensive profiles with skills, experience, and project portfolios
- **AI-Powered Evaluation** - Get automatically evaluated based on your projects and skills
- **GitHub Integration** - Showcase your real coding projects with live data from GitHub
- **Job Discovery** - Browse and apply to relevant job opportunities
- **Application Tracking** - Monitor your application status and feedback

### For Employers
- **Intelligent Candidate Evaluation** - Automatically score candidates based on projects and skills
- **GitHub Project Analysis** - Get insights into candidate's coding activity and project quality
- **Job Posting** - Create detailed job postings with custom evaluation criteria
- **Candidate Management** - Shortlist, reject, and manage applications
- **Analytics Dashboard** - Track hiring metrics and candidate performance

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Clerk.js
- **UI Components**: shadcn/ui
- **External APIs**: GitHub API for project analysis
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- MongoDB database
- Clerk account for authentication
- GitHub account for API access

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/skillhire.git
cd skillhire
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 3. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp env.example .env.local
```

Fill in your environment variables:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in/unified
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up/unified
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# GitHub Integration (Optional)
GITHUB_TOKEN=your_github_personal_access_token

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

1. Create a MongoDB database (MongoDB Atlas recommended for production)
2. Update your `MONGODB_URI` in the environment variables
3. The application will automatically create the necessary collections

### 5. Clerk Setup

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your publishable key and secret key to the environment variables
4. Configure the redirect URLs in your Clerk dashboard

### 6. GitHub Integration (Optional)

1. Create a GitHub Personal Access Token:
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Generate a new token with `repo` and `user` scopes
   - Add the token to your environment variables

### 7. Run the Development Server

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
skillhire/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── candidate/         # Candidate-specific pages
│   ├── employer/          # Employer-specific pages
│   └── jobs/              # Public job pages
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── models/           # Database models
│   └── services/         # Business logic services
├── public/               # Static assets
└── styles/               # Global styles
```

## 🔧 Configuration

### Evaluation Settings

Employers can configure evaluation criteria in their settings:

- **Project Weight**: How much projects contribute to the overall score
- **Experience Weight**: How much experience contributes to the score
- **Skills Weight**: How much skills contribute to the score
- **GitHub Integration**: Enable/disable GitHub project analysis
- **Minimum Score**: Set minimum scores for shortlisting

### GitHub Integration

When enabled, the platform will:
- Fetch repository data (stars, commits, languages)
- Analyze code quality and complexity
- Calculate project scores based on real activity
- Provide insights into candidate's coding habits

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📊 Database Schema

### Users
- Basic profile information
- Role-based profiles (candidate/employer)
- Skills, experience, and portfolio data

### Jobs
- Job postings with requirements
- Company information
- Evaluation criteria

### Applications
- Candidate applications
- Evaluation scores and feedback
- Application status tracking

### Evaluation Settings
- Company-specific evaluation criteria
- GitHub integration settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/skillhire/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🎯 Roadmap

- [ ] Advanced AI evaluation algorithms
- [ ] Video interview integration
- [ ] Real-time messaging system
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Integration with more ATS platforms

---

Built with ❤️ by the SkillHire team
