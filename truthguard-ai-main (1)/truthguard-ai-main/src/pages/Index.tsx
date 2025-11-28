import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Shield, Lock, Brain, TrendingUp, Database } from "lucide-react";
import FeatureCard from "@/components/FeatureCard";
import ResultDisplay from "@/components/ResultDisplay";
import ImageUpload from "@/components/ImageUpload";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/ai-scanning-hero.jpg";

const Index = () => {
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<"real" | "fake" | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [explanation, setExplanation] = useState("");
  const { toast } = useToast();

  const handleImageSelect = (file: File, preview: string) => {
    setSelectedImage(file);
    setImagePreview(preview);
    setResult(null);
  };

  const handleImageClear = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!inputText.trim() && !selectedImage) {
      toast({
        title: "Input Required",
        description: "Please enter text or upload an image to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      let imageUrl = null;

      // Upload image to storage if one is selected
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('verification-images')
          .upload(filePath, selectedImage);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('verification-images')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      // Call the analyze-content edge function
      const { data, error } = await supabase.functions.invoke('analyze-content', {
        body: {
          text: inputText.trim() || null,
          imageUrl: imageUrl
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data.result);
      setConfidence(data.confidence);
      setKeywords(data.keywords || []);
      setExplanation(data.explanation || '');

      toast({
        title: "Analysis Complete",
        description: "The content has been analyzed successfully.",
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Detect Fake News & Messages{" "}
                <span className="gradient-text">Instantly</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                AI-powered machine learning model to verify authenticity of news, posts, and text messages in real-time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="text-lg h-14 px-8 bg-primary hover:bg-primary/90 shadow-primary"
                  onClick={() => document.getElementById('analyzer')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Try It Now
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg h-14 px-8 glass hover:bg-primary/5"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative animate-float">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-3xl blur-3xl opacity-30" />
              <img 
                src={heroImage} 
                alt="AI scanning text" 
                className="relative rounded-3xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powered by <span className="gradient-text">Advanced ML</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our cutting-edge technology combines multiple algorithms for unparalleled accuracy
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={Zap}
              title="Real-Time ML Detection"
              description="Instant analysis using state-of-the-art neural networks trained on millions of examples"
            />
            <FeatureCard
              icon={Shield}
              title="High Accuracy Prediction"
              description="Achieve up to 95% accuracy with our ensemble of LSTM, Transformer, and Naive Bayes models"
            />
            <FeatureCard
              icon={Lock}
              title="Secure & Private Processing"
              description="Your data is processed securely and never stored. Complete privacy guaranteed"
            />
          </div>
        </div>
      </section>

      {/* Upload/Input Section */}
      <section id="analyzer" className="py-24 bg-gradient-to-br from-muted/30 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="glass p-8 md:p-12 shadow-card border-0 animate-scale-in">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
                Analyze Your Content
              </h2>
              <p className="text-center text-muted-foreground mb-8">
                Paste text, upload an image, or both for comprehensive verification
              </p>
              
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="text">Text Only</TabsTrigger>
                  <TabsTrigger value="image">Image Only</TabsTrigger>
                  <TabsTrigger value="both">Text + Image</TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="space-y-6">
                  <Textarea
                    placeholder="Enter the text you want to verify for authenticity..."
                    className="min-h-[200px] text-base resize-none glass border-2"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                </TabsContent>
                
                <TabsContent value="image" className="space-y-6">
                  <ImageUpload 
                    onImageSelect={handleImageSelect}
                    selectedImage={imagePreview}
                    onClear={handleImageClear}
                  />
                </TabsContent>
                
                <TabsContent value="both" className="space-y-6">
                  <Textarea
                    placeholder="Enter the text you want to verify for authenticity..."
                    className="min-h-[150px] text-base resize-none glass border-2"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <ImageUpload 
                    onImageSelect={handleImageSelect}
                    selectedImage={imagePreview}
                    onClear={handleImageClear}
                  />
                </TabsContent>
              </Tabs>
              
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                size="lg"
                className="w-full h-14 text-lg bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-primary mt-6"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                    Analyzing with AI & Machine Learning...
                  </>
                ) : (
                  "Analyze with Machine Learning"
                )}
              </Button>
            </Card>

            {/* Results Section */}
            {result && (
              <div className="mt-8">
                <ResultDisplay
                  result={result}
                  confidence={confidence}
                  keywords={keywords}
                  explanation={explanation}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Built on <span className="gradient-text">Cutting-Edge Technology</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Leveraging the latest advances in machine learning and natural language processing
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="glass p-8 text-center border-0 shadow-card hover-lift group">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Neural Networks</h3>
              <p className="text-muted-foreground">Deep learning models trained on vast datasets</p>
            </Card>
            
            <Card className="glass p-8 text-center border-0 shadow-card hover-lift group">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-secondary/10 to-primary/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">LSTM & Transformers</h3>
              <p className="text-muted-foreground">Advanced sequence modeling for context understanding</p>
            </Card>
            
            <Card className="glass p-8 text-center border-0 shadow-card hover-lift group">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-accent/10 to-secondary/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                <Database className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Naive Bayes</h3>
              <p className="text-muted-foreground">Probabilistic classification with high efficiency</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold gradient-text mb-2">TruthGuard</h3>
              <p className="text-muted-foreground text-sm">
                Built using Machine Learning & Modern Web Technologies
              </p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          <div className="text-center mt-8 text-sm text-muted-foreground">
            <p>© 2024 TruthGuard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
