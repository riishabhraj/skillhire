# ProjectHire - AI-Powered Job Matching Platform

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
- **AI-Powered Screening** - Use Hugging Face LLMs for advanced candidate analysis
- **GitHub Project Analysis** - Get insights into candidate's coding activity and project quality
- **Flexible Payment Plans** - Pay per job posting with Basic ($99) or Premium ($128) plans
- **Job Posting** - Create detailed job postings with custom evaluation criteria
- **Candidate Management** - Shortlist, reject, and manage applications
- **Analytics Dashboard** - Track hiring metrics and candidate performance

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Clerk.js
- **Payment Processing**: Lemon Squeezy
- **AI Integration**: Hugging Face Inference API
- **UI Components**: shadcn/ui
- **External APIs**: GitHub API for project analysis
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- MongoDB database
- Clerk account for authentication
- Lemon Squeezy account for payment processing
- GitHub account for API access (optional)
- Hugging Face account for AI evaluation (optional)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/projecthire.git
cd projecthire
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

# Hugging Face AI Evaluation (Optional)
HF_TOKEN=your_hugging_face_api_token
HF_MODEL=meta-llama/Meta-Llama-3-70B-Instruct

# Lemon Squeezy Payment Processing
LEMONSQUEEZY_API_KEY=your_lemonsqueezy_api_key
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
LEMONSQUEEZY_BASIC_VARIANT_ID=your_basic_variant_id
LEMONSQUEEZY_PREMIUM_VARIANT_ID=your_premium_variant_id
NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID=your_store_id

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

### 6. Lemon Squeezy Setup (Required for Payments)

1. Create a Lemon Squeezy account at [lemonsqueezy.com](https://lemonsqueezy.com)
2. Create two products:
   - Basic Job Posting: $99 (one-time payment)
   - Premium Job Posting: $128 (one-time payment)
3. Get your API credentials from Settings > API
4. Set up a webhook endpoint pointing to `/api/webhooks/lemonsqueezy`
5. Add all credentials to your environment variables

See [LEMONSQUEEZY_SETUP.md](./LEMONSQUEEZY_SETUP.md) for detailed instructions.

### 7. GitHub Integration (Optional)

1. Create a GitHub Personal Access Token:
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Generate a new token with `repo` scope
   - Add the token to your environment variables

### 8. Hugging Face Integration (Optional)

1. Create a Hugging Face account at [huggingface.co](https://huggingface.co)
2. Generate an API token from Settings > Access Tokens
3. Choose your preferred model (default: meta-llama/Meta-Llama-3-70B-Instruct)
4. Add credentials to your environment variables

### 9. Run the Development Server

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
projecthire/
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

1. Check the [Issues](https://github.com/yourusername/projecthire/issues) page
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

Built with ❤️ by the ProjectHire team
