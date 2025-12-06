import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckCircle2, TrendingUp, Briefcase, GraduationCap, Award, Check, X, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { AnalysisResult } from "@/pages/Index";

interface RevisedResumeDisplayProps {
  result: AnalysisResult;
}

type ChangeStatus = "pending" | "accepted" | "rejected";

interface ChangeState {
  summary: ChangeStatus;
  experience: Record<number, ChangeStatus>;
  skills: ChangeStatus;
  projects: Record<number, ChangeStatus>;
  education: Record<number, ChangeStatus>;
  honors: ChangeStatus;
}

const RevisedResumeDisplay = ({ result }: RevisedResumeDisplayProps) => {
  const [showComparison, setShowComparison] = useState(true);
  const [changeState, setChangeState] = useState<ChangeState>(() => ({
    summary: "pending",
    experience: Object.fromEntries(result.revisedResume.experience.map((_, i) => [i, "pending" as ChangeStatus])),
    skills: "pending",
    projects: Object.fromEntries((result.revisedResume.projects || []).map((_, i) => [i, "pending" as ChangeStatus])),
    education: Object.fromEntries(result.revisedResume.education.map((_, i) => [i, "pending" as ChangeStatus])),
    honors: "pending",
  }));

  const handleAccept = (section: keyof ChangeState, index?: number) => {
    setChangeState(prev => {
      if (index !== undefined && typeof prev[section] === 'object') {
        return {
          ...prev,
          [section]: { ...(prev[section] as Record<number, ChangeStatus>), [index]: "accepted" }
        };
      }
      return { ...prev, [section]: "accepted" };
    });
    toast.success("Change accepted");
  };

  const handleReject = (section: keyof ChangeState, index?: number) => {
    setChangeState(prev => {
      if (index !== undefined && typeof prev[section] === 'object') {
        return {
          ...prev,
          [section]: { ...(prev[section] as Record<number, ChangeStatus>), [index]: "rejected" }
        };
      }
      return { ...prev, [section]: "rejected" };
    });
    toast.info("Change rejected - original will be kept");
  };

  const handleReset = (section: keyof ChangeState, index?: number) => {
    setChangeState(prev => {
      if (index !== undefined && typeof prev[section] === 'object') {
        return {
          ...prev,
          [section]: { ...(prev[section] as Record<number, ChangeStatus>), [index]: "pending" }
        };
      }
      return { ...prev, [section]: "pending" };
    });
  };

  const acceptAll = () => {
    setChangeState({
      summary: "accepted",
      experience: Object.fromEntries(result.revisedResume.experience.map((_, i) => [i, "accepted" as ChangeStatus])),
      skills: "accepted",
      projects: Object.fromEntries((result.revisedResume.projects || []).map((_, i) => [i, "accepted" as ChangeStatus])),
      education: Object.fromEntries(result.revisedResume.education.map((_, i) => [i, "accepted" as ChangeStatus])),
      honors: "accepted",
    });
    toast.success("All changes accepted");
  };

  const getStatus = (section: keyof ChangeState, index?: number): ChangeStatus => {
    if (index !== undefined && typeof changeState[section] === 'object') {
      return (changeState[section] as Record<number, ChangeStatus>)[index] || "pending";
    }
    return changeState[section] as ChangeStatus;
  };

  const ReviewButtons = ({ section, index }: { section: keyof ChangeState; index?: number }) => {
    const status = getStatus(section, index);
    
    if (status === "accepted") {
      return (
        <div className="flex items-center gap-2">
          <Badge className="bg-green-500/10 text-green-700 border-green-500/30">
            <Check className="w-3 h-3 mr-1" /> Accepted
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => handleReset(section, index)}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      );
    }
    
    if (status === "rejected") {
      return (
        <div className="flex items-center gap-2">
          <Badge className="bg-red-500/10 text-red-700 border-red-500/30">
            <X className="w-3 h-3 mr-1" /> Rejected
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => handleReset(section, index)}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="border-green-500/30 text-green-700 hover:bg-green-500/10"
          onClick={() => handleAccept(section, index)}
        >
          <Check className="w-4 h-4 mr-1" /> Accept
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="border-red-500/30 text-red-700 hover:bg-red-500/10"
          onClick={() => handleReject(section, index)}
        >
          <X className="w-4 h-4 mr-1" /> Reject
        </Button>
      </div>
    );
  };

  return (
    <Card className="p-8 shadow-lg border-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Complete Revised Resume</h2>
        <div className="flex items-center gap-4">
          <Button variant="default" size="sm" onClick={acceptAll}>
            <Check className="w-4 h-4 mr-2" /> Accept All Changes
          </Button>
          <div className="flex items-center space-x-2">
            <Switch
              id="comparison-mode"
              checked={showComparison}
              onCheckedChange={setShowComparison}
            />
            <Label htmlFor="comparison-mode">Show Before/After</Label>
          </div>
        </div>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="honors">Honors</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold">Professional Summary</h3>
            </div>
            <ReviewButtons section="summary" />
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
          
          <div className={`p-4 rounded-lg border-2 ${
            getStatus("summary") === "rejected" 
              ? "bg-red-500/5 border-red-500/20 opacity-50" 
              : getStatus("summary") === "accepted"
              ? "bg-green-500/5 border-green-500/20"
              : "bg-accent/5 border-accent/20"
          }`}>
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
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base">{exp.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {exp.company} | {exp.dates}
                    {exp.location && ` | ${exp.location}`}
                  </p>
                </div>
                <ReviewButtons section="experience" index={idx} />
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

              <div className={`p-4 rounded-lg border-2 ${
                getStatus("experience", idx) === "rejected" 
                  ? "bg-red-500/5 border-red-500/20 opacity-50" 
                  : getStatus("experience", idx) === "accepted"
                  ? "bg-green-500/5 border-green-500/20"
                  : "bg-accent/5 border-accent/20"
              }`}>
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold">Skills</h3>
            </div>
            <ReviewButtons section="skills" />
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

          <div className={`p-4 rounded-lg border-2 ${
            getStatus("skills") === "rejected" 
              ? "bg-red-500/5 border-red-500/20 opacity-50" 
              : getStatus("skills") === "accepted"
              ? "bg-green-500/5 border-green-500/20"
              : "bg-accent/5 border-accent/20"
          }`}>
            <p className="text-xs font-semibold text-accent mb-3">ORGANIZED BY CATEGORY</p>
            <div className="space-y-4">
              {result.revisedResume.skills.categories.map((category, catIdx) => (
                <div key={catIdx}>
                  <p className="text-sm font-semibold mb-2">{category.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill, skillIdx) => (
                      <Badge key={skillIdx} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
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

          <div className="space-y-4">
            {result.revisedResume.education.map((edu, idx) => (
              <div key={idx} className={`p-4 rounded-lg border-2 ${
                getStatus("education", idx) === "rejected" 
                  ? "bg-red-500/5 border-red-500/20 opacity-50" 
                  : getStatus("education", idx) === "accepted"
                  ? "bg-green-500/5 border-green-500/20"
                  : "bg-accent/5 border-accent/20"
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-base">{edu.degree}</p>
                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                    <p className="text-sm text-muted-foreground">{edu.dates}</p>
                    {edu.details && (
                      <p className="text-sm mt-2">{edu.details}</p>
                    )}
                  </div>
                  <ReviewButtons section="education" index={idx} />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold">Projects</h3>
          </div>

          {(!result.revisedResume.projects || result.revisedResume.projects.length === 0) ? (
            <div className="p-4 bg-muted/30 rounded-lg border border-muted text-center">
              <p className="text-sm text-muted-foreground">No projects found in the original resume. Add projects to showcase your practical experience.</p>
            </div>
          ) : (
            result.revisedResume.projects.map((project, idx) => (
              <div key={idx} className="space-y-3 pb-6 border-b last:border-b-0">
                <div className={`p-4 rounded-lg border-2 ${
                  getStatus("projects", idx) === "rejected" 
                    ? "bg-red-500/5 border-red-500/20 opacity-50" 
                    : getStatus("projects", idx) === "accepted"
                    ? "bg-green-500/5 border-green-500/20"
                    : "bg-accent/5 border-accent/20"
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-base">{project.title}</h4>
                    <ReviewButtons section="projects" index={idx} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.technologies.map((tech, techIdx) => (
                      <Badge key={techIdx} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  <div className="space-y-2 mt-3">
                    {project.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{bullet}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* Honors Tab */}
        <TabsContent value="honors" className="space-y-4 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold">Honors & Affiliations</h3>
            </div>
            <ReviewButtons section="honors" />
          </div>

          {(!result.revisedResume.honors || result.revisedResume.honors.length === 0) ? (
            <div className="p-4 bg-muted/30 rounded-lg border border-muted text-center">
              <p className="text-sm text-muted-foreground">No honors or affiliations found in the original resume.</p>
            </div>
          ) : (
            <div className={`p-4 rounded-lg border-2 ${
              getStatus("honors") === "rejected" 
                ? "bg-red-500/5 border-red-500/20 opacity-50" 
                : getStatus("honors") === "accepted"
                ? "bg-green-500/5 border-green-500/20"
                : "bg-accent/5 border-accent/20"
            }`}>
              <div className="space-y-3">
                {result.revisedResume.honors.map((honor, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{honor}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default RevisedResumeDisplay;