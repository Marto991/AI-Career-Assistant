import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to clean JSON from markdown code blocks
function cleanJsonResponse(content: string): string {
  // Remove markdown code blocks if present
  return content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resume, jobDescription } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing resume and job description...");

    // Step 1: Extract requirements and calculate match score
    const analysisPrompt = `You are an expert career coach and ATS (Applicant Tracking System) analyzer. 

Analyze this resume against the job description and provide:
1. An overall match score (0-100)
2. Top 5 key alignments with specific requirements from the job and matching experience from the resume
3. Score each alignment (0-100)

Resume:
${resume}

Job Description:
${jobDescription}

Return ONLY a JSON object with this exact structure:
{
  "matchScore": number,
  "alignments": [
    {
      "requirement": "specific job requirement",
      "match": "specific matching experience from resume",
      "score": number
    }
  ]
}`;

    const analysisResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a career analysis expert. Always respond with valid JSON only." },
          { role: "user", content: analysisPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error("Analysis API error:", analysisResponse.status, errorText);
      throw new Error(`AI analysis failed: ${errorText}`);
    }

    const analysisData = await analysisResponse.json();
    const cleanedAnalysisContent = cleanJsonResponse(analysisData.choices[0].message.content);
    const analysis = JSON.parse(cleanedAnalysisContent);
    console.log("Analysis complete:", analysis);

    // Step 2: Generate complete revised resume
    const resumeRevisionPrompt = `You are an expert resume writer and ATS optimization specialist with deep expertise in creating professional, recruiter-friendly resumes. Analyze the resume and create a comprehensive revision tailored to the job description.

Parse the original resume and provide revisions for EACH section with specific improvements following professional resume best practices:

Job Description:
${jobDescription}

Original Resume:
${resume}

Key Alignments:
${analysis.alignments.map((a: any) => `- ${a.requirement}: ${a.match}`).join('\n')}

Return ONLY a JSON object with this exact structure:
{
  "summary": {
    "original": "extracted original summary/objective if present, or empty string",
    "revised": "2-3 sentence professional summary emphasizing multidisciplinary background, technical competencies, and cross-industry adaptability. Use phrases like 'leveraging data-driven insights across domains' to signal versatility."
  },
  "experience": [
    {
      "title": "job title",
      "company": "company name",
      "dates": "date range",
      "location": "location if available",
      "originalBullets": ["original bullet 1", "original bullet 2", ...],
      "revisedBullets": ["MUST start with action verb, include quantifiable metrics, 1-2 lines, highlight both technical and transferable skills, tie to business outcomes"]
    }
  ],
  "skills": {
    "original": ["skill1", "skill2", ...],
    "categories": [
      {
        "name": "Programming & Tools",
        "skills": ["Python", "SQL", "R", "Git", "etc."]
      },
      {
        "name": "Data Science & Analytics",
        "skills": ["Machine Learning", "Statistical Analysis", "Data Visualization", "etc."]
      },
      {
        "name": "Soft Skills",
        "skills": ["Leadership", "Communication", "Problem-solving", "Team Collaboration"]
      }
    ],
    "added": ["Relevant skills from job description not in original"]
  },
  "projects": [
    {
      "title": "Project name",
      "description": "Brief description",
      "technologies": ["tech1", "tech2"],
      "bullets": ["Achievement or detail about project"]
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "institution": "Institution name",
      "dates": "Graduation date or date range",
      "details": "GPA, relevant coursework, or honors if applicable"
    }
  ],
  "honors": ["Honor or affiliation 1", "Honor or affiliation 2"],
  "rewrittenBullets": ["Top 5 most impactful revised bullets showcasing both technical expertise and cross-industry value"]
}

CRITICAL FORMATTING RULES (ATS-Friendly & Professional):
- ALL bullets MUST start with strong action verbs in consistent tense
- EVERY bullet MUST follow parallel grammatical structure
- Include SPECIFIC numbers, percentages, or metrics wherever possible
- Avoid vague statements - be concrete and results-focused
- Use 1-2 lines per bullet maximum for scannability
- Emphasize BOTH technical competencies AND soft skills (leadership, communication, analytical thinking)
- Use standard industry terminology that ATS systems recognize
- Present candidate as versatile professional who applies technical skills across various settings
- No generic phrases like "responsible for" - always achievement-oriented
- Current roles use present tense, past roles use past tense consistently

CONTENT REQUIREMENTS:
- Extract ALL experience entries from original resume
- Extract ALL projects from original resume with their technologies and achievements
- Organize skills into logical categories (Programming/Tools, Data Science, Soft Skills, etc.)
- Format education chronologically (MOST RECENT FIRST) with each degree as separate entry
- Extract honors, awards, and professional affiliations
- Preserve truthfulness - enhance phrasing but never fabricate experience
- Naturally incorporate relevant keywords from job description
- Highlight transferable skills valuable in any industry
- Balance technical depth with cross-industry appeal`;

    const resumeResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a professional resume writer. Always respond with valid, complete JSON only." },
          { role: "user", content: resumeRevisionPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!resumeResponse.ok) {
      const errorText = await resumeResponse.text();
      console.error("Resume revision API error:", resumeResponse.status, errorText);
      throw new Error(`Failed to generate revised resume: ${errorText}`);
    }

    const resumeData = await resumeResponse.json();
    const cleanedResumeContent = cleanJsonResponse(resumeData.choices[0].message.content);
    const revisedResume = JSON.parse(cleanedResumeContent);
    console.log("Complete resume revision generated");

    // Step 3: Generate cover letter
    const coverLetterPrompt = `Write a compelling, personalized cover letter for this job application. Use the candidate's background and the key alignments to craft a narrative that demonstrates fit. Keep it professional, concise (3-4 paragraphs), and highlight quantifiable achievements.

Job Description:
${jobDescription}

Resume:
${resume}

Key Alignments:
${analysis.alignments.map((a: any) => `- ${a.requirement}: ${a.match}`).join('\n')}

Write the complete cover letter as plain text (no JSON, no markdown). Include a professional greeting and closing.`;

    const coverLetterResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a professional career writer specializing in cover letters." },
          { role: "user", content: coverLetterPrompt },
        ],
      }),
    });

    if (!coverLetterResponse.ok) {
      throw new Error("Failed to generate cover letter");
    }

    const coverLetterData = await coverLetterResponse.json();
    const coverLetter = coverLetterData.choices[0].message.content;
    console.log("Cover letter generated");

    // Combine results
    const result = {
      matchScore: analysis.matchScore,
      alignments: analysis.alignments,
      rewrittenBullets: revisedResume.rewrittenBullets,
      coverLetter,
      revisedResume: {
        summary: revisedResume.summary,
        experience: revisedResume.experience,
        skills: revisedResume.skills,
        education: revisedResume.education,
      },
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-resume function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
