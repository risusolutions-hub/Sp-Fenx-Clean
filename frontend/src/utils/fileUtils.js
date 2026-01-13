// File utility functions

/**
 * Format file size to human readable
 */
export const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return '-';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
};

/**
 * Get file type category
 */
export const getFileCategory = (mimeType) => {
  if (!mimeType) return 'file';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'excel';
  return 'file';
};

/**
 * Check if file type is allowed
 */
export const isAllowedFileType = (file, allowedTypes) => {
  if (!allowedTypes || allowedTypes.length === 0) return true;
  return allowedTypes.includes(file.type);
};

/**
 * Check if file size is within limit
 */
export const isFileSizeValid = (file, maxSize) => {
  return file.size <= maxSize;
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename) => {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

/**
 * Truncate filename while keeping extension
 */
export const truncateFilename = (filename, maxLength = 20) => {
  if (!filename || filename.length <= maxLength) return filename;
  
  const ext = getFileExtension(filename);
  const nameWithoutExt = filename.slice(0, filename.lastIndexOf('.'));
  const truncatedName = nameWithoutExt.slice(0, maxLength - ext.length - 4) + '...';
  
  return ext ? `${truncatedName}.${ext}` : truncatedName;
};
