#!/bin/bash
set -e

echo "🔍 Diagnosing build issue..."

# Check package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json missing! Creating..."
    # Create package.json (content from above)
else
    echo "✅ package.json found"
fi

# Verify git tracking
if git ls-files --error-unmatch package.json >/dev/null 2>&1; then
    echo "✅ package.json is tracked by git"
else
    echo "❌ package.json not tracked! Adding..."
    git add package.json
fi

# Check if committed
if git diff --cached --quiet package.json 2>/dev/null; then
    echo "✅ package.json is committed"
else
    echo "❌ package.json has uncommitted changes! Committing..."
    git commit -m "Fix: Ensure package.json is committed for build"
fi

# Test local build
echo "🧪 Testing local build..."
npm install
npm run build

echo "🚀 Pushing to remote..."
git push origin main

echo "✅ Fixed! Check your Netlify deploy now."
