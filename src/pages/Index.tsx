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
}

const Index = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Hero />
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <AnalysisForm 
          onAnalysisComplete={setResult}
          isAnalyzing={isAnalyzing}
          setIsAnalyzing={setIsAnalyzing}
        />
        {result && <ResultsDisplay result={result} />}
      </main>
    </div>
  );
};

export default Index;
