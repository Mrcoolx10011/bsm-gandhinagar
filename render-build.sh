#!/usr/bin/env bash
# Build script for Render deployment

set -e  # Exit on any error

echo "Starting build process..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Clean any previous builds
echo "Cleaning previous builds..."
rm -rf dist/

# Build the frontend
echo "Building frontend..."
npm run build

# Verify build output
echo "Verifying build output..."
if [ ! -d "dist" ]; then
  echo "ERROR: dist directory not found after build"
  exit 1
fi

if [ ! -f "dist/index.html" ]; then
  echo "ERROR: index.html not found in dist directory"
  exit 1
fi

echo "Build completed successfully!"
echo "Build output:"
ls -la dist/
