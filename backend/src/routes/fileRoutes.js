const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { generateUUID } = require('../utils/uuid');
const { getDB } = require('../db/database');

const router = express.Router();
const UPLOAD_ROOT = '/home/ismail/Documents/FTP';

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = req.body.folderPath || UPLOAD_ROOT;
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Upload file
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  const db = getDB();
  const fileId = generateUUID();
  const folderPath = req.body.folderPath || UPLOAD_ROOT;
  const filePath = path.join(folderPath, req.file.filename);

  db.run(
    'INSERT INTO files (id, name, path, folder_id, size) VALUES (?, ?, ?, ?, ?)',
    [fileId, req.file.originalname, filePath, req.body.folderId || 'root', req.file.size],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to save file metadata' });
      }
      res.json({
        success: true,
        fileId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    }
  );
});

// Download file
router.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const db = getDB();

  db.get('SELECT path FROM files WHERE path LIKE ?', [`%${filename}`], (err, row) => {
    if (err || !row) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(row.path, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
    });
  });
});

// Delete file
router.delete('/:filename', (req, res) => {
  const filename = req.params.filename;
  const db = getDB();

  db.get('SELECT path, id FROM files WHERE path LIKE ?', [`%${filename}`], (err, row) => {
    if (err || !row) {
      return res.status(404).json({ error: 'File not found' });
    }

    fs.unlink(row.path, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete file' });
      }

      db.run('DELETE FROM files WHERE id = ?', [row.id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to remove file record' });
        }
        res.json({ success: true });
      });
    });
  });
});

// List files in folder
router.get('/list/:folderId', (req, res) => {
  const folderId = req.params.folderId || 'root';
  const db = getDB();

  db.all('SELECT id, name, size, uploaded_at FROM files WHERE folder_id = ? ORDER BY name',
    [folderId], (err, files) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to list files' });
      }
      res.json(files || []);
    });
});

module.exports = router;
