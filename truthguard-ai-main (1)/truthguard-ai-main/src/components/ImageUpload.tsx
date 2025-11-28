import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void;
  selectedImage: string | null;
  onClear: () => void;
}

const ImageUpload = ({ onImageSelect, selectedImage, onClear }: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPG, PNG, WEBP, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      onImageSelect(file, preview);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  if (selectedImage) {
    return (
      <Card className="glass p-4 relative group">
        <Button
          onClick={onClear}
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </Button>
        <div className="relative rounded-lg overflow-hidden">
          <img 
            src={selectedImage} 
            alt="Selected for verification" 
            className="w-full h-auto max-h-96 object-contain"
          />
        </div>
        <p className="text-sm text-muted-foreground mt-3 text-center">
          Image ready for analysis
        </p>
      </Card>
    );
  }

  return (
    <Card
      className={`glass p-8 border-2 border-dashed cursor-pointer transition-all hover-lift ${
        isDragging ? 'border-primary bg-primary/5' : 'border-border'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <div className="p-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10">
          {isDragging ? (
            <Upload className="w-10 h-10 text-primary animate-bounce" />
          ) : (
            <ImageIcon className="w-10 h-10 text-primary" />
          )}
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold mb-1">
            {isDragging ? 'Drop image here' : 'Upload an image to verify'}
          </p>
          <p className="text-sm text-muted-foreground">
            Click or drag & drop an image • JPG, PNG, WEBP • Max 10MB
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ImageUpload;
