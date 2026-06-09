#!/bin/bash

# Vercel Deployment Quick Setup Script
# This script helps you prepare and deploy your Next.js app to Vercel

echo "🚀 Sowmyakka Frontend - Vercel Deployment Setup"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local
    echo "✅ .env.local created from .env.example"
    echo "   ⚠️  Please update NEXT_PUBLIC_API_BASE_URL if needed"
else
    echo "✅ .env.local already exists"
fi
echo ""

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🎉 Ready for Vercel deployment!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Push to GitHub: git push origin main"
    echo "   2. Go to https://vercel.com"
    echo "   3. Click 'Add New Project'"
    echo "   4. Select your GitHub repository"
    echo "   5. Add environment variables:"
    echo "      - NEXT_PUBLIC_API_BASE_URL"
    echo "   6. Click 'Deploy'"
    echo ""
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
