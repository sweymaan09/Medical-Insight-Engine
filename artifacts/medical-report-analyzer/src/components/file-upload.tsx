import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { UploadCloud, ImageIcon, FileText } from "lucide-react";
import { useUploadReport } from "@/hooks/use-upload-report";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
        title: "Wrong file type",
        description: "Please upload a photo (JPG/PNG) or PDF of your report.",
        variant: "destructive",
      });
      return;
    }

    try {
      const report = await uploadReport(file);
      toast({ title: "File uploaded! Reading your report now..." });
      setLocation(`/reports/${report.id}`);
    } catch {
      toast({
        title: "Upload failed",
        description: "Could not upload the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      animate={{
        borderColor: isDragging ? "hsl(var(--primary))" : isUploading ? "hsl(var(--primary))" : "#cbd5e1",
        scale: isDragging ? 1.01 : 1,
      }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative flex flex-col items-center justify-center w-full max-w-2xl mx-auto border-2 border-dashed rounded-2xl p-10 md:p-14 transition-colors cursor-pointer",
        isDragging ? "bg-teal-50" : "bg-white hover:bg-slate-50",
        isUploading && "pointer-events-none"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isUploading && fileInputRef.current?.click()}
      data-testid="upload-zone"
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileInput}
        data-testid="file-input"
      />

      {/* Icon area */}
      <div className="relative mb-5">
        <motion.div
          className="w-20 h-20 rounded-2xl bg-teal-50 flex items-center justify-center"
          animate={{ rotate: isDragging ? [0, -5, 5, 0] : 0 }}
          transition={{ duration: 0.4 }}
        >
          <AnimatePresence mode="wait">
            {isUploading ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center gap-1"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full"
                />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <UploadCloud className="w-9 h-9 text-teal-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Floating sparkles when dragging */}
        <AnimatePresence>
          {isDragging && (
            <>
              {["-top-3 -right-3", "-top-2 -left-4", "top-8 -right-5"].map((pos, i) => (
                <motion.div
                  key={i}
                  className={`absolute ${pos} w-3 h-3 bg-teal-300 rounded-full`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0], y: [-5, -15, -25] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">
        {isUploading ? "Uploading your report..." : isDragging ? "Drop it here!" : "Upload Medical Report"}
      </h3>
      <p className="text-slate-400 text-center mb-6 max-w-sm text-sm leading-relaxed">
        {isUploading
          ? "Please wait while we upload your file..."
          : "Take a clear photo of your report and upload it. We will explain every number in simple words."}
      </p>

      <Button
        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
        disabled={isUploading}
        size="lg"
        className="px-8 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-100"
        data-testid="button-select-file"
      >
        {isUploading ? "Uploading..." : "Choose File"}
      </Button>

      <div className="flex items-center gap-4 mt-6 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5" /> Photo (JPG / PNG)
        </span>
        <span className="w-1 h-1 rounded-full bg-slate-300" />
        <span className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" /> PDF file
        </span>
      </div>
    </motion.div>
  );
}
