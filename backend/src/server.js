const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const fileRoutes = require('./routes/fileRoutes');
const folderRoutes = require('./routes/folderRoutes');
const { initDB } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 5000;
const UPLOAD_ROOT = process.env.UPLOAD_ROOT || '/media/ismail/WD/FTP';

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
    console.log('  Body:', JSON.stringify(req.body).substring(0, 200));
  }
  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// Initialize Database
initDB();

// Routes
app.use('/api/files', fileRoutes);
app.use('/api/folders', folderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Disk space info
app.get('/api/disk-space', (req, res) => {
  try {
    const { execSync } = require('child_process');
    const output = execSync(`df "${UPLOAD_ROOT}"`).toString();
    const lines = output.trim().split('\n');
    const data = lines[1].split(/\s+/);

    const total = parseInt(data[1]) * 1024; // Convert from 1K-blocks to bytes
    const used = parseInt(data[2]) * 1024;
    const available = parseInt(data[3]) * 1024;
    const percent = parseInt(data[4]);

    console.log(`💾 Disk: ${percent}% used (${(used / 1024 / 1024 / 1024).toFixed(2)}GB / ${(total / 1024 / 1024 / 1024).toFixed(2)}GB)`);

    res.json({
      total,
      used,
      available,
      percent,
      totalGB: (total / 1024 / 1024 / 1024).toFixed(2),
      usedGB: (used / 1024 / 1024 / 1024).toFixed(2),
      availableGB: (available / 1024 / 1024 / 1024).toFixed(2)
    });
  } catch (err) {
    console.error('❌ Disk space error:', err.message);
    res.status(500).json({ error: 'Unable to read disk space' });
  }
});

// 404 handler for API
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve React frontend (only if build exists)
const buildPath = path.join(__dirname, '../../frontend/build');
const fs = require('fs');
if (fs.existsSync(buildPath)) {
  app.get('/:path(.*)', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Upload root: ${UPLOAD_ROOT}`);
  console.log(`✓ Logging enabled\n`);
});
