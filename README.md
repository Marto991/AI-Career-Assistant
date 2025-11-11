AI Career Assistant
Project Information

URL: https://ai-career-assistant-e0b7onmo6-marto991s-projects.vercel.app/

Overview

The AI Career Assistant is an intelligent web application designed to help job seekers optimize their resumes and application materials.
It compares a candidate’s resume to a target job description, calculates a match score, identifies strengths and gaps, and generates a revised resume and personalized cover letter in real time.

By leveraging advanced AI and intuitive design, this platform simplifies the job application process and improves the likelihood of passing Applicant Tracking Systems (ATS) and recruiter screening.

Users can:

Upload or paste their resume and a job description.

Receive an AI-generated match score (0–100) and detailed alignment analysis.

View a complete, revised resume with improved formatting and optimized sections.

Generate a customized cover letter tailored to the same job description.

Download both documents instantly as .docx files.

No installation or local setup is required — the app runs entirely in the browser.

Features

Resume Analysis – Calculates a match score between resume and job description.

Alignment Breakdown – Highlights how each requirement aligns with experience.

Resume Revision – Generates a full before/after version with improved sections.

Cover Letter Generation – Writes a tailored, job-specific letter.

Document Export – Enables one-click downloads of the resume, cover letter, or both.

Technologies Used

React + TypeScript – modern frontend architecture

Vite – fast build and development framework

Tailwind CSS + shadcn/ui – responsive and elegant user interface

Supabase (Edge Function) – backend logic and API endpoint management

Google Gemini 2.5 Flash – AI model powering analysis and text generation

Environment Variables

For secure configuration during deployment, define the following variables in your Vercel project settings (or a .env file for local testing):

# Supabase configuration
VITE_SUPABASE_URL=<your_supabase_project_url>
VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>

# AI model / API keys
VITE_GEMINI_API_KEY=<your_gemini_model_key>

# Optional backend API endpoint
VITE_API_ENDPOINT=<custom_backend_url_if_applicable>


🔒 Keep all API keys private. Do not commit your .env file to version control.

Deployment

The project is hosted and automatically deployed via Vercel.

Deployment Steps

Push updates to your GitHub repository.

Vercel detects new commits and triggers a fresh build.

The live version is updated instantly at your public URL.

Deployment Notes

Ensure only required plugins are active in vite.config.ts (e.g., react()).

Confirm that index.html includes accurate meta tags (title, description, favicon).

Store all environment variables securely in Vercel’s Environment Variables tab.

After build completion, your production URL will be active immediately.


Developed by Martin Mitrevski
University of Massachusetts Dartmouth – Fall 2025
📧 martin.mitrevski91@gmail.com
