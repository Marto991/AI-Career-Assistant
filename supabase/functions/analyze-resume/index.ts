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
    const resumeRevisionPrompt = `You are an expert resume writer and ATS optimization specialist. Analyze the resume and create a comprehensive revision tailored to the job description.

Parse the original resume and provide revisions for EACH section with specific improvements:

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
    "revised": "compelling ATS-optimized summary highlighting relevant skills and achievements"
  },
  "experience": [
    {
      "title": "job title",
      "company": "company name",
      "dates": "date range",
      "location": "location if available",
      "originalBullets": ["original bullet 1", "original bullet 2", ...],
      "revisedBullets": ["optimized bullet with quantifiable achievements", ...]
    }
  ],
  "skills": {
    "original": ["skill1", "skill2", ...],
    "revised": ["optimized skill1", "skill2", ...],
    "added": ["new relevant skill from job description", ...]
  },
  "education": {
    "original": "original education section text",
    "revised": "enhanced education section with relevant coursework/achievements"
  },
  "rewrittenBullets": ["top 5 most impactful revised bullets for quick reference"]
}

Important:
- Extract ALL experience bullets from the original resume
- Revise each bullet to be achievement-oriented with quantifiable results
- Add relevant keywords from the job description naturally
- Maintain truthfulness - enhance phrasing but don't fabricate experience
- For skills, identify gaps between resume and job requirements`;

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
