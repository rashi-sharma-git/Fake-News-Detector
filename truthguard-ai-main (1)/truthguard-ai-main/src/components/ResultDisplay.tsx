import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ResultDisplayProps {
  result: "real" | "fake" | null;
  confidence: number;
  keywords?: string[];
  explanation?: string;
}

const ResultDisplay = ({ result, confidence, keywords, explanation }: ResultDisplayProps) => {
  if (!result) return null;

  const isReal = result === "real";
  const Icon = isReal ? CheckCircle2 : XCircle;
  const resultColor = isReal ? "text-green-500" : "text-red-500";
  const bgColor = isReal ? "from-green-500/10 to-green-600/5" : "from-red-500/10 to-red-600/5";
  const borderColor = isReal ? "border-green-500/30" : "border-red-500/30";

  return (
    <div className="animate-slide-up space-y-6">
      <Card className={`glass p-8 border-2 ${borderColor} shadow-glow`}>
        <div className="flex items-center gap-4 mb-6">
          <div className={`p-4 rounded-full bg-gradient-to-br ${bgColor}`}>
            <Icon className={`w-12 h-12 ${resultColor}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-3xl font-bold mb-2">
              {isReal ? "Likely Real" : "Likely Fake"}
            </h3>
            <p className="text-muted-foreground">
              Confidence Score: {confidence}%
            </p>
          </div>
        </div>
        
        <Progress value={confidence} className="h-3 mb-6" />

        {explanation && (
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Analysis Details</h4>
                <p className="text-sm text-muted-foreground">{explanation}</p>
              </div>
            </div>
          </div>
        )}

        {keywords && keywords.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
              Key Indicators Detected
            </h4>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ResultDisplay;
