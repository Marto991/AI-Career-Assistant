import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const analysis = JSON.parse(analysisData.choices[0].message.content);
    console.log("Analysis complete:", analysis);

    // Step 2: Rewrite resume bullets
    const rewritePrompt = `Based on this job description and the candidate's resume, rewrite 5 key resume bullets that are most relevant to this position. Make them achievement-oriented, quantifiable, and keyword-rich for ATS systems.

Job Description:
${jobDescription}

Resume:
${resume}

Key Alignments:
${analysis.alignments.map((a: any) => `- ${a.requirement}: ${a.match}`).join('\n')}

Return ONLY a JSON object with this structure:
{
  "bullets": ["bullet 1", "bullet 2", "bullet 3", "bullet 4", "bullet 5"]
}`;

    const rewriteResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a professional resume writer. Always respond with valid JSON only." },
          { role: "user", content: rewritePrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!rewriteResponse.ok) {
      throw new Error("Failed to rewrite bullets");
    }

    const rewriteData = await rewriteResponse.json();
    const rewrittenBullets = JSON.parse(rewriteData.choices[0].message.content).bullets;
    console.log("Bullets rewritten");

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
      rewrittenBullets,
      coverLetter,
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
