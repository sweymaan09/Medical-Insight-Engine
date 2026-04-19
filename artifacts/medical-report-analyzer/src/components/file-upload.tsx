import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { UploadCloud, FileType, Loader2, X } from "lucide-react";
import { useUploadReport } from "@/hooks/use-upload-report";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadReport, isUploading } = useUploadReport();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleFiles = async (file: File) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, JPG, or PNG file.",
        variant: "destructive",
      });
      return;
    }

    try {
      const report = await uploadReport(file);
      toast({
        title: "Report uploaded successfully",
        description: "We are now analyzing your report...",
      });
      setLocation(`/reports/${report.id}`);
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center w-full max-w-2xl mx-auto border-2 border-dashed rounded-xl p-12 transition-all",
        isDragging ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-accent/50 hover:border-primary/50",
        isUploading ? "opacity-50 pointer-events-none" : ""
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileInput}
      />
      
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        {isUploading ? (
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        ) : (
          <UploadCloud className="w-8 h-8 text-primary" />
        )}
      </div>
      
      <h3 className="text-xl font-medium text-foreground mb-2">
        Upload your medical report
      </h3>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        Drag and drop your PDF or image file here, or click to browse. We'll extract and simplify your results securely.
      </p>
      
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        size="lg"
        className="px-8 rounded-full"
      >
        {isUploading ? "Uploading..." : "Select File"}
      </Button>

      <div className="flex items-center gap-4 mt-8 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5"><FileType className="w-4 h-4" /> PDF</span>
        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
        <span className="flex items-center gap-1.5"><FileType className="w-4 h-4" /> JPG / PNG</span>
      </div>
    </div>
  );
}