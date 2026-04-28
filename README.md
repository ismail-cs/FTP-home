# FTP Server with Web UI

A simple yet powerful FTP server with a modern web interface. Upload, download, and manage files directly from your browser!

## Features

✅ **Web-based File Management**
- Upload files via drag & drop or file picker
- Download files directly
- Delete files and folders
- Create nested folder structures

✅ **Local Storage**
- All files stored in `/home/ismail/Documents/FTP`
- No external database required (uses SQLite for metadata)
- Full control over your data

✅ **Modern UI**
- React with Tailwind CSS
- Responsive design
- Real-time folder navigation
- File previews with type indicators

✅ **Easy Deployment**
- Works with ngrok for internet access
- Zero configuration needed
- Works on Ubuntu/Linux

## Project Structure

```
FTP-server-project/
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── server.js    # Main server
│   │   ├── db/          # Database initialization
│   │   └── routes/      # API routes
│   ├── package.json
│   └── .env
├── frontend/             # React web UI
│   ├── src/
│   │   ├── App.js
│   │   └── components/  # React components
│   ├── package.json
│   └── public/
└── package.json         # Root scripts
```

## Quick Start

### 1. Install Dependencies
```bash
npm run setup
```

### 2. Development Mode (Backend + Frontend)
```bash
npm run dev
```

This will start:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

### 3. Production Build
```bash
npm run build
npm run backend
```

## API Endpoints

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files/download/:filename` - Download file
- `DELETE /api/files/:filename` - Delete file
- `GET /api/files/list/:folderId` - List files in folder

### Folders
- `POST /api/folders/create` - Create folder
- `GET /api/folders/structure/:folderId` - Get subfolders
- `GET /api/folders/info/:folderId` - Get folder info
- `DELETE /api/folders/:folderId` - Delete folder (must be empty)

## Configuration

Edit `backend/.env` to customize:
```env
PORT=5000                              # Server port
NODE_ENV=development                   # Environment
UPLOAD_ROOT=/home/ismail/Documents/FTP # Upload root path
```

## Deployment with ngrok

1. Start the application:
```bash
npm run build
npm run backend
```

2. Expose with ngrok in another terminal:
```bash
ngrok http 5000
```

3. Access via the provided ngrok URL

## Technology Stack

- **Frontend**: React 19, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: SQLite (metadata only)
- **File Storage**: Local filesystem

## Notes

- Files are permanently stored in `/home/ismail/Documents/FTP`
- Folder deletion only works when folder is empty
- Maximum file size depends on available disk space
- Database is stored in `backend/data/ftp.db`

## Troubleshooting

**Port already in use:**
Change PORT in `backend/.env`

**Permission denied errors:**
Ensure `/home/ismail/Documents/FTP` has write permissions

**Files not showing:**
Click the "Refresh" button or restart the app

## License

MIT
