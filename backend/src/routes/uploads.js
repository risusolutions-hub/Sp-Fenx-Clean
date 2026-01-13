const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { upload } = require('../config/upload');
const { hybridUpload, uploadMultipleToFTP, checkFTPConnection, deleteFromFTP, downloadFromFTP } = require('../config/ftpUpload');
const { requireLogin, loadCurrentUser } = require('../middleware/auth');

router.use(loadCurrentUser);

// Upload files for ticket attachments (supports FTP and local)
router.post('/ticket-attachments', requireLogin, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const complaintId = req.body.complaintId || 'general';
    const useFTP = process.env.FTP_ENABLED === 'true';
    
    const attachments = [];
    
    for (const file of req.files) {
      try {
        const result = await hybridUpload(file, complaintId, useFTP);
        attachments.push({
          ...result,
          uploadedBy: req.currentUser?.id
        });
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        attachments.push({
          success: false,
          originalName: file.originalname,
          error: uploadError.message
        });
      }
    }

    const successful = attachments.filter(a => a.success !== false);
    const failed = attachments.filter(a => a.success === false);

    res.json({ 
      success: true, 
      attachments: successful,
      failed,
      message: `${successful.length} file(s) uploaded successfully${failed.length > 0 ? `, ${failed.length} failed` : ''}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// Check FTP connection status
router.get('/ftp-status', requireLogin, async (req, res) => {
  try {
    const status = await checkFTPConnection();
    res.json({ 
      success: true, 
      ftp: status,
      ftpEnabled: process.env.FTP_ENABLED === 'true'
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Delete a single attachment
router.delete('/ticket-attachments/:filename', requireLogin, async (req, res) => {
  try {
    const { filename } = req.params;
    const { yearMonth, storageType, remotePath } = req.query;
    
    if (storageType === 'ftp' && remotePath) {
      // Delete from FTP
      await deleteFromFTP(remotePath);
      res.json({ success: true, message: 'File deleted from FTP' });
    } else {
      // Delete from local storage
      if (!yearMonth) {
        return res.status(400).json({ error: 'yearMonth query parameter required' });
      }

      const filePath = path.join(__dirname, '../../uploads/tickets', yearMonth, filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ success: true, message: 'File deleted' });
      } else {
        res.status(404).json({ error: 'File not found' });
      }
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Serve uploaded files (with authentication) - local files
router.get('/files/:yearMonth/:filename', requireLogin, (req, res) => {
  const { yearMonth, filename } = req.params;
  const filePath = path.join(__dirname, '../../uploads/tickets', yearMonth, filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Download FTP file (streams through server)
router.get('/ftp-file', requireLogin, async (req, res) => {
  try {
    const { remotePath, filename } = req.query;
    
    if (!remotePath) {
      return res.status(400).json({ error: 'remotePath required' });
    }

    // Create temp path
    const tempDir = path.join(__dirname, '../../uploads/temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempPath = path.join(tempDir, `${Date.now()}-${filename || 'download'}`);
    
    // Download from FTP
    await downloadFromFTP(remotePath, tempPath);
    
    // Send file
    res.download(tempPath, filename || path.basename(remotePath), (err) => {
      // Clean up temp file
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      if (err) {
        console.error('Download send error:', err);
      }
    });
  } catch (error) {
    console.error('FTP download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

module.exports = router;
