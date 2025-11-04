import { Sparkles, Target, FileText } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/20 pt-20 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center space-y-6 animate-in fade-in duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full border border-accent/20 text-accent text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            AI-Powered Career Assistant
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Land Your{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Dream Job
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Automatically analyze how well your resume matches job descriptions and generate
            tailored applications that stand out.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 max-w-4xl mx-auto">
            <FeatureCard
              icon={<Target className="w-6 h-6" />}
              title="Smart Matching"
              description="AI analyzes and scores your resume against job requirements"
            />
            <FeatureCard
              icon={<FileText className="w-6 h-6" />}
              title="Optimized Content"
              description="Rewrites bullets to highlight your relevant experience"
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="Cover Letters"
              description="Generates personalized cover letters that impress"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="group p-6 bg-card rounded-xl border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default Hero;
