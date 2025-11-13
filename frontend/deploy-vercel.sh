#!/bin/bash

# Vercel Deployment Helper Script
# Run this before deploying to check everything is ready

echo "🚀 Vercel Deployment Checker"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the frontend directory"
    exit 1
fi

echo "✅ In frontend directory"
echo ""

# Check if git repo exists
if [ ! -d ".git" ]; then
    cd ..
    if [ ! -d ".git" ]; then
        echo "❌ No git repository found. Initialize one first:"
        echo "   git init"
        echo "   git add ."
        echo "   git commit -m 'Initial commit'"
        exit 1
    fi
    cd frontend
fi

echo "✅ Git repository found"
echo ""

# Check for uncommitted changes
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "⚠️  Warning: You have uncommitted changes"
    echo "   Commit them before deploying:"
    echo "   git add ."
    echo "   git commit -m 'Ready for deployment'"
    echo ""
fi

# Check critical files exist
echo "📋 Checking critical files..."
files=("package.json" "next.config.ts" "vercel.json" ".env.local")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ Missing: $file"
    fi
done
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not found. Run: npm install"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Try to build locally
echo "🔨 Testing local build..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build successful"
else
    echo "❌ Build failed! Fix errors before deploying"
    echo "   Run: npm run build"
    exit 1
fi
echo ""

# Check environment variables
echo "🔑 Environment variables check:"
echo ""
echo "Required for Vercel (add these in Vercel Dashboard):"
echo "  - OPENAI_API_KEY"
echo "  - ANTHROPIC_API_KEY"
echo "  - DEEPSEEK_API_KEY"
echo "  - NEXT_PUBLIC_GEMINI_API_KEY"
echo "  - NEXT_PUBLIC_RPC_ENDPOINT"
echo "  - POLKADOT_ADMIN_SEED"
echo "  - ELEVENLABS_API_KEY"
echo "  - NEXT_PUBLIC_MONZO_CLIENT_ID"
echo "  - MONZO_CLIENT_SECRET"
echo ""

echo "================================"
echo "✅ Ready for Vercel deployment!"
echo ""
echo "Next steps:"
echo "1. Push to GitHub:"
echo "   git push origin main"
echo ""
echo "2. Go to vercel.com"
echo "3. Import your repository"
echo "4. Set root directory: frontend"
echo "5. Add environment variables"
echo "6. Deploy!"
echo ""
echo "Or use Vercel CLI:"
echo "   npm i -g vercel"
echo "   vercel"
echo ""
