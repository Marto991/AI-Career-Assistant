import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckCircle2, TrendingUp, Briefcase, GraduationCap, Award } from "lucide-react";
import type { AnalysisResult } from "@/pages/Index";

interface RevisedResumeDisplayProps {
  result: AnalysisResult;
}

const RevisedResumeDisplay = ({ result }: RevisedResumeDisplayProps) => {
  const [showComparison, setShowComparison] = useState(true);

  return (
    <Card className="p-8 shadow-lg border-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Complete Revised Resume</h2>
        <div className="flex items-center space-x-2">
          <Switch
            id="comparison-mode"
            checked={showComparison}
            onCheckedChange={setShowComparison}
          />
          <Label htmlFor="comparison-mode">Show Before/After</Label>
        </div>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold">Professional Summary</h3>
          </div>
          
          {showComparison && result.revisedResume.summary.original && (
            <div className="space-y-3">
              <div className="p-4 bg-muted/30 rounded-lg border border-muted">
                <p className="text-xs font-semibold text-muted-foreground mb-2">ORIGINAL</p>
                <p className="text-sm">{result.revisedResume.summary.original}</p>
              </div>
              <div className="flex justify-center">
                <div className="p-2 bg-accent/10 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                </div>
              </div>
            </div>
          )}
          
          <div className="p-4 bg-accent/5 rounded-lg border-2 border-accent/20">
            <p className="text-xs font-semibold text-accent mb-2">REVISED</p>
            <p className="text-sm leading-relaxed">{result.revisedResume.summary.revised}</p>
          </div>
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience" className="space-y-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold">Professional Experience</h3>
          </div>

          {result.revisedResume.experience.map((exp, idx) => (
            <div key={idx} className="space-y-4 pb-6 border-b last:border-b-0">
              <div>
                <h4 className="font-bold text-base">{exp.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {exp.company} | {exp.dates}
                  {exp.location && ` | ${exp.location}`}
                </p>
              </div>

              {showComparison && exp.originalBullets.length > 0 && (
                <div className="space-y-3">
                  <div className="p-4 bg-muted/30 rounded-lg border border-muted">
                    <p className="text-xs font-semibold text-muted-foreground mb-3">ORIGINAL</p>
                    <div className="space-y-2">
                      {exp.originalBullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2">
                          <span className="text-muted-foreground text-xs mt-1">•</span>
                          <p className="text-sm flex-1">{bullet}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="p-2 bg-accent/10 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 bg-accent/5 rounded-lg border-2 border-accent/20">
                <p className="text-xs font-semibold text-accent mb-3">REVISED & OPTIMIZED</p>
                <div className="space-y-2">
                  {exp.revisedBullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <p className="text-sm flex-1">{bullet}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-4 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold">Skills</h3>
          </div>

          {showComparison && result.revisedResume.skills.original.length > 0 && (
            <div className="space-y-3">
              <div className="p-4 bg-muted/30 rounded-lg border border-muted">
                <p className="text-xs font-semibold text-muted-foreground mb-3">ORIGINAL</p>
                <div className="flex flex-wrap gap-2">
                  {result.revisedResume.skills.original.map((skill, idx) => (
                    <Badge key={idx} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex justify-center">
                <div className="p-2 bg-accent/10 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-accent/5 rounded-lg border-2 border-accent/20">
            <p className="text-xs font-semibold text-accent mb-3">REVISED & ENHANCED</p>
            <div className="flex flex-wrap gap-2">
              {result.revisedResume.skills.revised.map((skill, idx) => (
                <Badge key={idx} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {result.revisedResume.skills.added.length > 0 && (
            <div className="p-4 bg-green-500/5 rounded-lg border-2 border-green-500/20">
              <p className="text-xs font-semibold text-green-600 mb-3">
                SUGGESTED ADDITIONS (from job requirements)
              </p>
              <div className="flex flex-wrap gap-2">
                {result.revisedResume.skills.added.map((skill, idx) => (
                  <Badge key={idx} className="bg-green-500/10 text-green-700 border-green-500/30">
                    + {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="space-y-4 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold">Education</h3>
          </div>

          {showComparison && result.revisedResume.education.original && (
            <div className="space-y-3">
              <div className="p-4 bg-muted/30 rounded-lg border border-muted">
                <p className="text-xs font-semibold text-muted-foreground mb-2">ORIGINAL</p>
                <p className="text-sm whitespace-pre-wrap">{result.revisedResume.education.original}</p>
              </div>
              <div className="flex justify-center">
                <div className="p-2 bg-accent/10 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-accent/5 rounded-lg border-2 border-accent/20">
            <p className="text-xs font-semibold text-accent mb-2">REVISED</p>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {result.revisedResume.education.revised}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default RevisedResumeDisplay;
