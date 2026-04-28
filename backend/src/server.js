const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const fileRoutes = require('./routes/fileRoutes');
const folderRoutes = require('./routes/folderRoutes');
const { initDB } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 5000;
const UPLOAD_ROOT = '/home/ismail/Documents/FTP';

// Middleware
app.use(cors());
app.use(express.json());
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

// Serve React frontend (only if build exists)
const buildPath = path.join(__dirname, '../../frontend/build');
const fs = require('fs');
if (fs.existsSync(buildPath)) {
  app.get('/:path(.*)', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Upload root: ${UPLOAD_ROOT}`);
});
