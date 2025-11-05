import { useState } from "react";
import Hero from "@/components/Hero";
import AnalysisForm from "@/components/AnalysisForm";
import ResultsDisplay from "@/components/ResultsDisplay";

export interface AnalysisResult {
  matchScore: number;
  alignments: Array<{
    requirement: string;
    match: string;
    score: number;
  }>;
  rewrittenBullets: string[];
  coverLetter: string;
  revisedResume: {
    summary: {
      original: string;
      revised: string;
    };
    experience: Array<{
      title: string;
      company: string;
      dates: string;
      location?: string;
      originalBullets: string[];
      revisedBullets: string[];
    }>;
    skills: {
      original: string[];
      revised: string[];
      added: string[];
    };
    education: {
      original: string;
      revised: string;
    };
  };
}

const Index = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [originalResume, setOriginalResume] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Hero />
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <AnalysisForm 
          onAnalysisComplete={setResult}
          isAnalyzing={isAnalyzing}
          setIsAnalyzing={setIsAnalyzing}
          setOriginalResume={setOriginalResume}
        />
        {result && <ResultsDisplay result={result} originalResume={originalResume} />}
      </main>
    </div>
  );
};

export default Index;
