const express = require('express');
const fs = require('fs');
const path = require('path');
const { generateUUID } = require('../utils/uuid');
const { getDB } = require('../db/database');

const router = express.Router();
const UPLOAD_ROOT = '/home/ismail/Documents/FTP';

// Create folder
router.post('/create', (req, res) => {
  const { folderName, parentPath, parentId } = req.body;

  if (!folderName || !folderName.trim()) {
    return res.status(400).json({ error: 'Folder name required' });
  }

  const folderId = generateUUID();
  const folderPath = path.join(parentPath || UPLOAD_ROOT, folderName);

  // Check if folder already exists
  if (fs.existsSync(folderPath)) {
    return res.status(400).json({ error: 'Folder already exists' });
  }

  // Create folder in filesystem
  fs.mkdir(folderPath, { recursive: true }, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to create folder' });
    }

    // Save to database
    const db = getDB();
    db.run(
      'INSERT INTO folders (id, name, path, parent_id) VALUES (?, ?, ?, ?)',
      [folderId, folderName, folderPath, parentId || 'root'],
      (err) => {
        if (err) {
          // Rollback: delete created folder
          fs.rmdir(folderPath, () => {});
          return res.status(500).json({ error: 'Failed to save folder metadata' });
        }
        res.json({ success: true, folderId, folderPath });
      }
    );
  });
});

// Get folder structure
router.get('/structure/:folderId', (req, res) => {
  const folderId = req.params.folderId || 'root';
  const db = getDB();

  db.all('SELECT id, name, path FROM folders WHERE parent_id = ? ORDER BY name',
    [folderId], (err, folders) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to get folders' });
      }
      res.json(folders || []);
    });
});

// Get folder info
router.get('/info/:folderId', (req, res) => {
  const folderId = req.params.folderId || 'root';
  const db = getDB();

  db.get('SELECT id, name, path, parent_id FROM folders WHERE id = ?',
    [folderId], (err, folder) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to get folder' });
      }
      if (!folder) {
        return res.status(404).json({ error: 'Folder not found' });
      }
      res.json(folder);
    });
});

// Delete folder (only if empty)
router.delete('/:folderId', (req, res) => {
  const folderId = req.params.folderId;
  const db = getDB();

  if (folderId === 'root') {
    return res.status(400).json({ error: 'Cannot delete root folder' });
  }

  db.get('SELECT path FROM folders WHERE id = ?', [folderId], (err, folder) => {
    if (err || !folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Check if folder is empty
    fs.readdir(folder.path, (err, files) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to check folder' });
      }

      if (files.length > 0) {
        return res.status(400).json({ error: 'Folder is not empty' });
      }

      fs.rmdir(folder.path, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to delete folder' });
        }

        db.run('DELETE FROM folders WHERE id = ?', [folderId], (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to remove folder record' });
          }
          res.json({ success: true });
        });
      });
    });
  });
});

module.exports = router;
