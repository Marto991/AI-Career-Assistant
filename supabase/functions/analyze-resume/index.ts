import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_RESUME_LENGTH = 15000;
const MAX_JOB_DESC_LENGTH = 8000;

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
    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authError } = await supabaseClient.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Input validation
    const body = await req.json();
    const { resume, jobDescription } = body;

    if (!resume || typeof resume !== "string" || resume.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "Resume must be at least 50 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length < 20) {
      return new Response(
        JSON.stringify({ error: "Job description must be at least 20 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (resume.length > MAX_RESUME_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Resume must not exceed ${MAX_RESUME_LENGTH} characters.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (jobDescription.length > MAX_JOB_DESC_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Job description must not exceed ${MAX_JOB_DESC_LENGTH} characters.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing resume and job description for user:", claimsData.claims.sub);

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
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: "You are a career analysis expert. Always respond with valid JSON only. No markdown, no code blocks, just raw JSON." },
          { role: "user", content: analysisPrompt },
        ],
      }),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error("Analysis API error:", analysisResponse.status, errorText);
      throw new Error("ANALYSIS_FAILED");
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
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: "You are a professional resume writer. Always respond with valid, complete JSON only. No markdown, no code blocks, just raw JSON." },
          { role: "user", content: resumeRevisionPrompt },
        ],
      }),
    });

    if (!resumeResponse.ok) {
      const errorText = await resumeResponse.text();
      console.error("Resume revision API error:", resumeResponse.status, errorText);
      throw new Error("RESUME_REVISION_FAILED");
    }

    const resumeData = await resumeResponse.json();
    const cleanedResumeContent = cleanJsonResponse(resumeData.choices[0].message.content);
    const revisedResume = JSON.parse(cleanedResumeContent);
    console.log("Complete resume revision generated");

    // Step 3: Generate cover letter
    const coverLetterPrompt = `You are an expert career coach writing a compelling, personalized cover letter for this job application.

TONE & STYLE GUIDELINES:
- Professional yet warm and engaging - avoid stiff, robotic language
- Confident but not arrogant - demonstrate genuine enthusiasm
- Conversational flow while maintaining formality appropriate for business correspondence
- Use active voice and strong action verbs
- Show personality and authenticity

STRUCTURE (4 paragraphs, each separated by a BLANK LINE):
1. OPENING HOOK: Start with an engaging statement that captures attention - reference something specific about the company, role, or industry. Avoid generic openings like "I am writing to apply for..."
2. VALUE PROPOSITION: Highlight 2-3 key achievements with specific metrics that directly align with job requirements. Connect your experience to their needs.
3. CULTURAL FIT & MOTIVATION: Demonstrate knowledge of the company and explain why you're genuinely interested. Show how your values align with theirs.
4. STRONG CLOSE: End with confidence and a clear call to action. Express enthusiasm for discussing how you can contribute.

CRITICAL FORMATTING RULES:
- Start with "Dear Hiring Manager," on its own line
- Leave a BLANK LINE between greeting and first paragraph
- Leave a BLANK LINE between EACH paragraph (very important for proper document formatting)
- Each paragraph should be 3-5 sentences
- End with closing on its own line ("Sincerely," or "Best regards,")
- Leave a BLANK LINE then the candidate's name placeholder "[Your Name]"
- DO NOT include any contact info, date, or address at the beginning - those are added separately

Job Description:
${jobDescription}

Resume:
${resume}

Key Alignments to emphasize:
${analysis.alignments.map((a: any) => `- ${a.requirement}: ${a.match}`).join('\n')}

Write ONLY the body of the cover letter starting with "Dear Hiring Manager," - no header, no contact info, no date. Use blank lines between paragraphs.`;

    const coverLetterResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
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

    // Combine results - include ALL sections including projects and honors
    const result = {
      matchScore: analysis.matchScore,
      alignments: analysis.alignments,
      rewrittenBullets: revisedResume.rewrittenBullets || [],
      coverLetter,
      revisedResume: {
        summary: revisedResume.summary,
        experience: revisedResume.experience || [],
        skills: revisedResume.skills,
        projects: revisedResume.projects || [],
        education: revisedResume.education || [],
        honors: revisedResume.honors || [],
      },
    };
    
    console.log("Final result includes projects:", result.revisedResume.projects?.length || 0);
    console.log("Final result includes honors:", result.revisedResume.honors?.length || 0);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-resume function:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    return new Response(
      JSON.stringify({ error: "Unable to process your request. Please try again later.", code: "PROCESSING_ERROR" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
