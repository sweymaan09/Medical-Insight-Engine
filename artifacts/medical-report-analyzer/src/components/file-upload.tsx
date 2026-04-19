import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { UploadCloud, ImageIcon, FileText } from "lucide-react";
import { useUploadReport } from "@/hooks/use-upload-report";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
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
      animate={{ scale: isDragging ? 1.015 : 1 }}
      transition={{ duration: 0.2 }}
      className="relative flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-10 md:p-14 cursor-pointer"
      style={{
        background: isDragging
          ? "rgba(20,184,166,0.07)"
          : "transparent",
        transition: "background 0.2s",
      }}
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

      {/* Pulsing ring when dragging */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: "absolute", inset: 0, borderRadius: 16,
              border: "2px solid rgba(45,212,191,0.6)",
              boxShadow: "0 0 30px rgba(45,212,191,0.3), inset 0 0 30px rgba(45,212,191,0.05)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Icon area */}
      <div className="relative mb-6">
        <motion.div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: "rgba(20,184,166,0.12)",
            border: "1px solid rgba(45,212,191,0.3)",
            boxShadow: "0 0 24px rgba(20,184,166,0.2)",
          }}
          animate={{
            rotate: isDragging ? [0, -6, 6, 0] : 0,
            boxShadow: isUploading
              ? ["0 0 16px rgba(20,184,166,0.3)", "0 0 40px rgba(20,184,166,0.7)", "0 0 16px rgba(20,184,166,0.3)"]
              : "0 0 24px rgba(20,184,166,0.2)",
          }}
          transition={{
            rotate: { duration: 0.4 },
            boxShadow: isUploading ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 },
          }}
        >
          <AnimatePresence mode="wait">
            {isUploading ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    border: "3px solid rgba(45,212,191,0.2)",
                    borderTopColor: "#2dd4bf",
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <UploadCloud className="w-9 h-9" style={{ color: "#2dd4bf" }} />
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
                  className={`absolute ${pos} w-3 h-3 rounded-full`}
                  style={{ background: "#2dd4bf", boxShadow: "0 0 12px rgba(45,212,191,0.8)" }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0], y: [-5, -20, -35] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      <h3 className="text-xl font-bold mb-2 text-center" style={{ color: "#e2e8f0" }}>
        {isUploading ? "Uploading your report..." : isDragging ? "Drop it here!" : "Upload Medical Report"}
      </h3>
      <p className="text-center mb-7 max-w-sm text-sm leading-relaxed" style={{ color: "rgba(186,230,253,0.6)" }}>
        {isUploading
          ? "Please wait while we upload your file..."
          : "Take a clear photo of your report and upload it. We will explain every number in simple words."}
      </p>

      <motion.button
        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
        disabled={isUploading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        style={{
          padding: "0.75rem 2.5rem",
          borderRadius: 9999,
          fontWeight: 700,
          fontSize: "0.95rem",
          background: isUploading ? "rgba(45,212,191,0.3)" : "linear-gradient(135deg, #14b8a6, #06b6d4)",
          color: "#fff",
          border: "none",
          cursor: isUploading ? "not-allowed" : "pointer",
          boxShadow: "0 0 24px rgba(20,184,166,0.5), 0 4px 16px rgba(20,184,166,0.3)",
          letterSpacing: "0.02em",
        }}
        data-testid="button-select-file"
      >
        {isUploading ? "Uploading..." : "Choose File"}
      </motion.button>

      <div className="flex items-center gap-4 mt-6 text-xs" style={{ color: "rgba(186,230,253,0.45)" }}>
        <span className="flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5" /> Photo (JPG / PNG)
        </span>
        <span className="w-1 h-1 rounded-full" style={{ background: "rgba(186,230,253,0.3)" }} />
        <span className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" /> PDF file
        </span>
      </div>
    </motion.div>
  );
}
