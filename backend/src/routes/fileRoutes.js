const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { generateUUID } = require('../utils/uuid');
const { getDB } = require('../db/database');

const router = express.Router();
const UPLOAD_ROOT = '/media/ismail/WD/FTP';

// Configure multer - save to temp first, then move to correct location
const storage = multer.memoryStorage(); // Store in memory temporarily
const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } }); // 500MB limit

// Upload file
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    console.log('❌ Upload failed: No file provided');
    return res.status(400).json({ error: 'No file provided' });
  }

  try {
    const db = getDB();
    const fileId = generateUUID();

    // Get folder path from multipart fields
    const folderPath = req.body.folderPath || UPLOAD_ROOT;
    const folderId = req.body.folderId || 'root';

    console.log(`📁 Upload Request:`);
    console.log(`   Folder ID: ${folderId}`);
    console.log(`   Folder Path: ${folderPath}`);
    console.log(`   File: ${req.file.originalname} (${req.file.size} bytes)`);

    // Ensure folder exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`   ✓ Created folder: ${folderPath}`);
    }

    // Save file to disk
    const filename = `${Date.now()}-${req.file.originalname}`;
    const filePath = path.join(folderPath, filename);

    fs.writeFileSync(filePath, req.file.buffer);
    console.log(`   ✓ File saved to: ${filePath}`);

    // Save to database
    db.run(
      'INSERT INTO files (id, name, path, folder_id, size) VALUES (?, ?, ?, ?, ?)',
      [fileId, req.file.originalname, filePath, folderId, req.file.size],
      (err) => {
        if (err) {
          console.log(`   ❌ DB Error: ${err.message}`);
          return res.status(500).json({ error: 'Failed to save file metadata' });
        }
        console.log(`   ✓ File ID: ${fileId}`);
        console.log(`   ✓ File metadata saved to DB\n`);
        res.json({
          success: true,
          fileId,
          filename,
          originalName: req.file.originalname,
          size: req.file.size
        });
      }
    );
  } catch (err) {
    console.log(`❌ Upload error: ${err.message}\n`);
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

// Download file
router.get('/download/:fileId', (req, res) => {
  const fileId = req.params.fileId;
  const db = getDB();

  console.log(`📥 Download Request for ID: ${fileId}`);

  db.get('SELECT path, name FROM files WHERE id = ?', [fileId], (err, row) => {
    if (err) {
      console.log(`❌ DB Error: ${err.message}`);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!row) {
      console.log(`❌ File not found in DB for ID: ${fileId}`);
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = row.path;
    const fileName = row.name;

    console.log(`   Path: ${filePath}`);
    console.log(`   Name: ${fileName}`);

    // Check if file exists on disk
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found on disk: ${filePath}`);
      return res.status(404).json({ error: 'File not found on disk' });
    }

    console.log(`✓ Sending file: ${fileName}`);
    res.download(filePath, fileName, (err) => {
      if (err && err.code !== 'ERR_HTTP_HEADERS_SENT') {
        console.log(`❌ Download error: ${err.message}`);
      }
    });
  });
});

// Delete file
router.delete('/:fileId', (req, res) => {
  const fileId = req.params.fileId;
  const db = getDB();

  db.get('SELECT path, id FROM files WHERE id = ?', [fileId], (err, row) => {
    if (err || !row) {
      console.log(`❌ Delete failed: File not found - ${fileId}`);
      return res.status(404).json({ error: 'File not found' });
    }

    fs.unlink(row.path, (err) => {
      if (err) {
        console.log(`❌ Delete error: ${err.message}`);
        return res.status(500).json({ error: 'Failed to delete file' });
      }

      db.run('DELETE FROM files WHERE id = ?', [row.id], (err) => {
        if (err) {
          console.log(`❌ DB Delete error: ${err.message}`);
          return res.status(500).json({ error: 'Failed to remove file record' });
        }
        console.log(`🗑️  Deleted: ${row.path}\n`);
        res.json({ success: true });
      });
    });
  });
});

// List files in folder
router.get('/list/:folderId', (req, res) => {
  const folderId = req.params.folderId || 'root';
  const db = getDB();

  db.all('SELECT id, name, size, path, uploaded_at FROM files WHERE folder_id = ? ORDER BY name',
    [folderId], (err, files) => {
      if (err) {
        console.log(`❌ List files error: ${err.message}`);
        return res.status(500).json({ error: 'Failed to list files' });
      }
      console.log(`📄 Listed ${(files || []).length} files for folder: ${folderId}`);
      res.json(files || []);
    });
});

module.exports = router;
