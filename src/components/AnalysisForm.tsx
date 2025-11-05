import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { AnalysisResult } from "@/pages/Index";

interface AnalysisFormProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (value: boolean) => void;
  setOriginalResume: (resume: string) => void;
}

const AnalysisForm = ({ onAnalysisComplete, isAnalyzing, setIsAnalyzing, setOriginalResume }: AnalysisFormProps) => {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!resume.trim() || !jobDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both your resume and the job description.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setOriginalResume(resume);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-resume", {
        body: { resume, jobDescription },
      });

      if (error) throw error;

      onAnalysisComplete(data);
      
      toast({
        title: "Analysis Complete!",
        description: "Your personalized application materials are ready.",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="p-8 shadow-lg border-2">
      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="resume" className="text-sm font-semibold flex items-center gap-2">
            Your Resume
            <span className="text-muted-foreground font-normal">(paste your resume text)</span>
          </label>
          <Textarea
            id="resume"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="Paste your resume here... Include your work experience, skills, education, and achievements."
            className="min-h-[200px] resize-none font-mono text-sm"
            disabled={isAnalyzing}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="jobDescription" className="text-sm font-semibold flex items-center gap-2">
            Job Description
            <span className="text-muted-foreground font-normal">(paste the job posting)</span>
          </label>
          <Textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here... Include requirements, responsibilities, and qualifications."
            className="min-h-[200px] resize-none font-mono text-sm"
            disabled={isAnalyzing}
          />
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Analyze & Generate
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default AnalysisForm;
