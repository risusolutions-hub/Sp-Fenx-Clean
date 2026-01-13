// Export all constants
export * from './issueCategories';
export * from './priorityOptions';
export * from './statusConfig';
export * from './navigation';

// App-wide constants
export const APP_NAME = 'Sparkle Service';
export const APP_VERSION = '1.0.0';

// Work hours
export const WORK_START_HOUR = 9;  // 9 AM
export const WORK_END_HOUR = 19;   // 7 PM

// File upload limits
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_FILES_PER_UPLOAD = 10;
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/mpeg',
  'video/webm',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain'
];

// Date formats
export const DATE_FORMAT = 'DD MMM YYYY';
export const TIME_FORMAT = 'hh:mm A';
export const DATETIME_FORMAT = 'DD MMM YYYY, hh:mm A';
