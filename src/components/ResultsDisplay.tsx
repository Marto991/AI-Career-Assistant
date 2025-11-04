import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, CheckCircle2 } from "lucide-react";
import type { AnalysisResult } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";

interface ResultsDisplayProps {
  result: AnalysisResult;
}

const ResultsDisplay = ({ result }: ResultsDisplayProps) => {
  const { toast } = useToast();

  const handleDownload = () => {
    toast({
      title: "Download Ready",
      description: "Your application materials would be downloaded as .docx (feature coming soon)",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-8 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Match Score */}
      <Card className="p-8 shadow-lg border-2">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Overall Match Score</h2>
          <div className={`text-6xl font-bold ${getScoreColor(result.matchScore)}`}>
            {result.matchScore}%
          </div>
          <Progress value={result.matchScore} className="h-3" />
          <p className="text-muted-foreground">
            {result.matchScore >= 80
              ? "Excellent match! Your profile aligns very well with this role."
              : result.matchScore >= 60
              ? "Good match! Some areas could be enhanced."
              : "Consider highlighting more relevant experience."}
          </p>
        </div>
      </Card>

      {/* Alignments */}
      <Card className="p-8 shadow-lg border-2">
        <h2 className="text-2xl font-bold mb-6">Key Alignments</h2>
        <div className="space-y-4">
          {result.alignments.map((alignment, idx) => (
            <div key={idx} className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <p className="font-semibold text-sm">Requirement: {alignment.requirement}</p>
                  <p className="text-sm text-muted-foreground">Your Match: {alignment.match}</p>
                  <div className="flex items-center gap-2">
                    <Progress value={alignment.score} className="h-2 flex-1" />
                    <span className="text-sm font-medium">{alignment.score}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Rewritten Bullets */}
      <Card className="p-8 shadow-lg border-2">
        <h2 className="text-2xl font-bold mb-6">Optimized Resume Bullets</h2>
        <div className="space-y-3">
          {result.rewrittenBullets.map((bullet, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <span className="text-accent font-bold">•</span>
              <p className="flex-1 text-sm">{bullet}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Cover Letter */}
      <Card className="p-8 shadow-lg border-2">
        <h2 className="text-2xl font-bold mb-6">Personalized Cover Letter</h2>
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{result.coverLetter}</p>
        </div>
      </Card>

      {/* Download Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleDownload}
          size="lg"
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          <Download className="mr-2 h-5 w-5" />
          Download Application Materials
        </Button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
