AI Career Assistant
Project Information

URL: https://your-vercel-app-url.vercel.app

Overview

The AI Career Assistant is an intelligent web application that helps job seekers optimize their resumes and application materials.
It compares a candidate’s resume to a target job description, calculates a match score, identifies missing keywords, and automatically generates a revised resume and a personalized cover letter.

This project integrates AI with a clean, responsive interface to help users save time and improve the quality of their applications.

Editing and Development

You can edit and develop the project using your preferred workflow.

🖥️ Local Development

Clone the Repository

git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>


Install Dependencies

npm install


Start the Development Server

npm run dev


This will start the app locally with hot-reload and live preview enabled.

💻 GitHub Codespaces (Optional)

Open your repository on GitHub.

Click Code → Codespaces → New Codespace.

Develop directly in the browser, then commit and push your changes.

🧩 Edit Directly in GitHub

Navigate to the desired file.

Click the ✏️ Edit button.

Make changes, commit, and push.

Technologies Used

React + TypeScript – component-based frontend with static typing

Vite – fast build tool and dev server

Tailwind CSS + shadcn/ui – responsive styling and modern UI components

Supabase (Edge Function) – backend processing and API integration

Google Gemini 2.5 Flash – AI model for resume analysis and text generation

Environment Variables

To configure the project for local or production use, define the following variables in a .env file at the project root:

# Supabase configuration
VITE_SUPABASE_URL=<your_supabase_project_url>
VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>

# AI model or API keys
VITE_GEMINI_API_KEY=<your_gemini_model_key>

# Optional configuration
VITE_API_ENDPOINT=<custom_backend_url_if_applicable>


🔒 Never commit your .env file to GitHub.
Use Vercel’s Environment Variables tab to securely store and manage secrets for deployment.

Deployment

The project is deployed on Vercel for fast, automatic CI/CD hosting.

To deploy updates:

Commit and push your latest changes to GitHub.

Vercel automatically detects new commits and rebuilds your project.

Visit your Vercel dashboard to view build logs or manage custom domains.

Notes for Deployment

Ensure that your vite.config.ts only includes required plugins (e.g., react()), and that no unused packages or tags remain from local testing.

Verify that your index.html includes only relevant meta tags and assets (e.g., project title, description, and favicon).

Set up your environment variables on Vercel under Project Settings → Environment Variables.

When the build completes, the production URL will be available instantly.

Credits

Developed by Martin Mitrevski
University of Massachusetts Dartmouth – Fall 2025
📧 martin.mitrevski91@gmail.com

🔗 GitHub Repository
