import { useState, useCallback } from 'react';
import api from '../api';

/**
 * Custom hook for file uploads
 */
export default function useFileUpload(options = {}) {
  const {
    maxFiles = 10,
    maxSize = 100 * 1024 * 1024, // 100MB
    endpoint = '/uploads/ticket-attachments',
    onSuccess,
    onError
  } = options;

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const upload = useCallback(async (filesToUpload) => {
    if (!filesToUpload || filesToUpload.length === 0) return;

    // Validate file count
    if (files.length + filesToUpload.length > maxFiles) {
      const errorMsg = `Maximum ${maxFiles} files allowed`;
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // Validate file sizes
    const oversizedFiles = filesToUpload.filter(f => f.size > maxSize);
    if (oversizedFiles.length > 0) {
      const errorMsg = `Some files exceed the ${maxSize / (1024 * 1024)}MB limit`;
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      filesToUpload.forEach(file => formData.append('files', file));

      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        }
      });

      if (response.data.attachments) {
        setFiles(prev => [...prev, ...response.data.attachments]);
        onSuccess?.(response.data.attachments);
      }

      return response.data.attachments;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Upload failed';
      setError(errorMsg);
      onError?.(errorMsg);
      throw err;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [files.length, maxFiles, maxSize, endpoint, onSuccess, onError]);

  const removeFile = useCallback((index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setError(null);
  }, []);

  return {
    files,
    uploading,
    progress,
    error,
    upload,
    removeFile,
    clearFiles,
    setFiles
  };
}
