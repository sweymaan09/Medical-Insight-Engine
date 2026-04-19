import { useState, useCallback } from "react";
import { Report } from "@workspace/api-client-react";

export function useUploadReport() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadReport = useCallback(async (file: File): Promise<Report> => {
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || "Failed to upload report");
      }

      const data = await response.json();
      setIsUploading(false);
      return data;
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setIsUploading(false);
      throw err;
    }
  }, []);

  return { uploadReport, isUploading, error };
}