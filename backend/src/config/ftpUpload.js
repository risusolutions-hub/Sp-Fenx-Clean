const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// FTP Configuration from environment variables
const ftpConfig = {
  host: process.env.FTP_HOST || 'localhost',
  port: parseInt(process.env.FTP_PORT) || 21,
  user: process.env.FTP_USER || 'ftpuser',
  password: process.env.FTP_PASSWORD || 'ftppassword',
  secure: process.env.FTP_SECURE === 'true', // FTPS
  secureOptions: { rejectUnauthorized: false }
};

const FTP_BASE_PATH = process.env.FTP_BASE_PATH || '/uploads/tickets';

/**
 * Upload a file to FTP server
 * @param {Object} file - Multer file object
 * @param {string} complaintId - Complaint/ticket ID for organization
 * @returns {Object} Upload result with remote path
 */
async function uploadToFTP(file, complaintId) {
  const client = new ftp.Client();
  client.ftp.verbose = process.env.NODE_ENV === 'development';

  try {
    await client.access(ftpConfig);

    // Create organized directory structure: /uploads/tickets/YYYY-MM/complaintId/
    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const remotePath = `${FTP_BASE_PATH}/${yearMonth}/${complaintId || 'general'}`;

    // Ensure directories exist
    await client.ensureDir(remotePath);

    // Generate secure filename
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    const safeBaseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    const remoteFilename = `${Date.now()}-${uniqueId}-${safeBaseName}${ext}`;
    const fullRemotePath = `${remotePath}/${remoteFilename}`;

    // Upload file
    await client.uploadFrom(file.path, fullRemotePath);

    // Get file info
    const fileInfo = {
      originalName: file.originalname,
      filename: remoteFilename,
      remotePath: fullRemotePath,
      yearMonth,
      type: file.mimetype,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      storageType: 'ftp'
    };

    return { success: true, ...fileInfo };
  } catch (error) {
    console.error('FTP Upload Error:', error);
    throw new Error(`FTP upload failed: ${error.message}`);
  } finally {
    client.close();
  }
}

/**
 * Upload multiple files to FTP
 * @param {Array} files - Array of Multer file objects
 * @param {string} complaintId - Complaint/ticket ID
 * @returns {Array} Array of upload results
 */
async function uploadMultipleToFTP(files, complaintId) {
  const results = [];
  
  for (const file of files) {
    try {
      const result = await uploadToFTP(file, complaintId);
      results.push(result);
      
      // Clean up local temp file after successful FTP upload
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      results.push({
        success: false,
        originalName: file.originalname,
        error: error.message
      });
    }
  }
  
  return results;
}

/**
 * Download file from FTP
 * @param {string} remotePath - Full remote path
 * @param {string} localPath - Local destination path
 */
async function downloadFromFTP(remotePath, localPath) {
  const client = new ftp.Client();
  
  try {
    await client.access(ftpConfig);
    await client.downloadTo(localPath, remotePath);
    return { success: true, localPath };
  } catch (error) {
    console.error('FTP Download Error:', error);
    throw new Error(`FTP download failed: ${error.message}`);
  } finally {
    client.close();
  }
}

/**
 * Delete file from FTP
 * @param {string} remotePath - Full remote path to delete
 */
async function deleteFromFTP(remotePath) {
  const client = new ftp.Client();
  
  try {
    await client.access(ftpConfig);
    await client.remove(remotePath);
    return { success: true };
  } catch (error) {
    console.error('FTP Delete Error:', error);
    throw new Error(`FTP delete failed: ${error.message}`);
  } finally {
    client.close();
  }
}

/**
 * Check if FTP is configured and available
 */
async function checkFTPConnection() {
  const client = new ftp.Client();
  
  try {
    await client.access(ftpConfig);
    return { connected: true, host: ftpConfig.host };
  } catch (error) {
    return { connected: false, error: error.message };
  } finally {
    client.close();
  }
}

/**
 * Hybrid upload - try FTP first, fallback to local storage
 * @param {Object} file - Multer file object  
 * @param {string} complaintId - Complaint ID
 * @param {boolean} preferFTP - Whether to prefer FTP over local
 */
async function hybridUpload(file, complaintId, preferFTP = true) {
  if (preferFTP && process.env.FTP_ENABLED === 'true') {
    try {
      const result = await uploadToFTP(file, complaintId);
      return result;
    } catch (ftpError) {
      console.warn('FTP upload failed, falling back to local storage:', ftpError.message);
    }
  }
  
  // Fallback to local storage (file already saved by multer)
  const now = new Date();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  return {
    success: true,
    originalName: file.originalname,
    filename: file.filename,
    path: file.path.replace(/\\/g, '/'),
    relativePath: `tickets/${yearMonth}/${file.filename}`,
    yearMonth,
    type: file.mimetype,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    storageType: 'local'
  };
}

module.exports = {
  uploadToFTP,
  uploadMultipleToFTP,
  downloadFromFTP,
  deleteFromFTP,
  checkFTPConnection,
  hybridUpload,
  ftpConfig
};
