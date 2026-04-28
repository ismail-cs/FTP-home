#!/bin/bash

echo "🚀 FTP Server Setup & Start"
echo "=============================="

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run from the project root directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm run setup
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Available commands:"
echo "  npm run dev       - Start backend + frontend (dev mode)"
echo "  npm run backend   - Start backend only"
echo "  npm run frontend  - Start frontend only"
echo "  npm run build     - Build frontend for production"
echo ""
echo "Starting development mode..."
echo "(Frontend: http://localhost:3000 | Backend: http://localhost:5000)"
echo ""

npm run dev
