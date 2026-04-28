# FTP Server - Getting Started Guide

## ✅ What's Been Built

Your FTP Server is ready to use! Here's what you have:

### 🎯 Features
- ✅ **Web-based File Management** - Upload, download, delete files via browser
- ✅ **Folder Management** - Create nested folders, organize files
- ✅ **Drag & Drop Upload** - Simply drag files into the browser
- ✅ **Local Storage** - All files stored in `/home/ismail/Documents/FTP`
- ✅ **Responsive UI** - Works on desktop, tablet, and mobile
- ✅ **Real-time Refresh** - Instant updates when files/folders are added or removed

### 📁 Project Structure
```
FTP-server-project/
├── backend/              # Express.js REST API
├── frontend/             # React web UI
├── start.sh             # Quick start script
└── README.md            # Full documentation
```

---

## 🚀 Quick Start (Choose One)

### Option 1: Use the Start Script (Easiest)
```bash
cd /home/ismail/Documents/FTP-server-project
./start.sh
```

### Option 2: Manual Start
```bash
cd /home/ismail/Documents/FTP-server-project

# First time only - install all dependencies
npm run setup

# Then start the app (backend + frontend together)
npm run dev
```

### Option 3: Start Individually
```bash
# Terminal 1 - Start Backend (http://localhost:5000)
npm run backend

# Terminal 2 - Start Frontend (http://localhost:3000)
npm run frontend
```

---

## 🌐 Access the App

After starting, open your browser:
- **Development**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health
- **Upload Root**: `/home/ismail/Documents/FTP`

---

## 📊 File Structure Overview

### Backend Files
```
backend/
├── src/
│   ├── server.js           # Main Express app
│   ├── db/database.js      # SQLite setup
│   ├── routes/
│   │   ├── fileRoutes.js   # File upload/download/delete
│   │   └── folderRoutes.js # Folder create/navigate/delete
│   └── utils/uuid.js       # UUID generator
├── data/
│   └── ftp.db             # SQLite database (auto-created)
└── .env                    # Configuration
```

### Frontend Components
```
frontend/src/
├── App.js                   # Main application
├── components/
│   ├── FileExplorer.js     # Main file browser
│   ├── FileList.js         # File display grid
│   ├── FolderList.js       # Folder display grid
│   ├── UploadArea.js       # Drag-drop file upload
│   └── NewFolderModal.js   # Create folder dialog
└── App.css                 # Tailwind styles
```

---

## 🎮 How to Use

### Upload Files
1. **Drag & Drop**: Drag files directly into the "Upload" section
2. **Choose Files**: Click "Choose Files" button and select multiple files
3. Files appear instantly in the file list below

### Create Folders
1. Click "+ New Folder" button
2. Enter folder name (no "/" characters)
3. Click "Create"
4. Navigate into folder by clicking it

### Navigate Folders
- Click any folder to enter it
- Use breadcrumb navigation at top to go back
- Current path is shown in browser URL

### Download Files
- Click the ⬇️ button on any file
- File downloads to your default download folder

### Delete Files/Folders
- Click 🗑️ button on any file or folder
- Folders must be empty to delete
- Deleted files are permanent!

---

## ⚙️ Configuration

Edit `backend/.env` to customize:

```env
PORT=5000                              # Server port
NODE_ENV=development                   # development | production
UPLOAD_ROOT=/home/ismail/Documents/FTP # Where files are stored
```

---

## 🌍 Deploy with ngrok (Internet Access)

After your app is running:

### Step 1: Start the app
```bash
npm run build    # Build frontend for production
npm run backend  # Start backend server
```

### Step 2: In another terminal, expose with ngrok
```bash
ngrok http 5000
```

### Step 3: Access from anywhere
- Your unique ngrok URL will be displayed (e.g., `https://xxxx-xx-xxx-xxx-xx.ngrok.io`)
- Share this URL to access your FTP server from anywhere on the internet

**Note**: ngrok URL changes each time you restart (unless you have a paid account)

---

## 🐛 Troubleshooting

### Port 5000 Already in Use
```bash
# Change PORT in backend/.env to 5001, 5002, etc.
PORT=5001
```
Then restart the backend.

### "Permission denied" on files
```bash
# Fix permissions on FTP directory
chmod -R 755 /home/ismail/Documents/FTP
```

### Files not showing after upload
- Click "🔄 Refresh" button
- Check browser console for errors (F12)
- Ensure `/home/ismail/Documents/FTP` has write permissions

### Frontend won't rebuild
```bash
# Clear React cache
rm -rf frontend/node_modules/.cache
npm run build
```

### Backend won't start
```bash
# Check if port is in use
sudo lsof -i :5000

# Check Node.js version
node --version  # Should be v18 or higher
```

---

## 📊 Available API Endpoints

### Files API
```
POST   /api/files/upload                    - Upload file
GET    /api/files/download/:filename        - Download file
DELETE /api/files/:filename                 - Delete file
GET    /api/files/list/:folderId           - List files in folder
```

### Folders API
```
POST   /api/folders/create                  - Create folder
GET    /api/folders/structure/:folderId    - Get subfolders
GET    /api/folders/info/:folderId         - Get folder info
DELETE /api/folders/:folderId              - Delete folder
```

---

## 🔒 Security Notes

- ⚠️ This app is designed for **local/internal use**
- No authentication by default (easy to add if needed)
- All files stored locally - no cloud upload
- Use ngrok secure features for better security if exposing publicly
- Never expose directly to the internet without security measures

---

## 📦 Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend | React | 19.2.5 |
| Styling | Tailwind CSS | Latest |
| Backend | Express | 5.2.1 |
| Runtime | Node.js | 18+ |
| Database | SQLite | 6.0.1 |

---

## 💡 Tips & Tricks

### Create Nested Folders
1. Create folder "Projects"
2. Click to enter "Projects"
3. Create "Python" folder inside
4. Create "Flask-App" inside Python
5. Path: `FTP → Projects → Python → Flask-App`

### Organize by Type
Create folders like:
- 📁 Documents
- 📁 Images
- 📁 Videos
- 📁 Code
- 📁 Archives

### Automatic Cleanup
Old files stay until manually deleted. Consider archiving old folders.

---

## 📝 Production Checklist

Before going public with ngrok:
- [ ] Change `NODE_ENV=production` in `.env`
- [ ] Test file upload/download
- [ ] Check file permissions
- [ ] Verify ngrok URL works
- [ ] Test on mobile device
- [ ] Plan security (add authentication if needed)

---

## 🆘 Need Help?

1. **Check logs**: Look at terminal output for error messages
2. **Browser console**: Press F12 to see frontend errors
3. **Check file permissions**: `ls -la /home/ismail/Documents/FTP`
4. **Restart everything**: Kill processes and start fresh
5. **Check GitHub**: Visit project repository for updates

---

## 🎉 You're All Set!

Your FTP server is ready to use. Start with:
```bash
./start.sh
```

Then open http://localhost:3000 in your browser and start uploading files!

Happy uploading! 🚀
