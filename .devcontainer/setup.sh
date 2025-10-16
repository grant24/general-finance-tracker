#!/bin/bash

# Development setup script for the dev container
echo "🚀 Setting up development environment..."

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build packages
echo "🔨 Building packages..."
npm run build:drizzle
npm run build:zod

# Wait for database to be ready
echo "🗄️ Waiting for database to be ready..."
until pg_isready -h db -p 5432 -U postgres; do
    echo "Waiting for database..."
    sleep 2
done

# Run database migrations
echo "🔄 Running database migrations..."
npm run push

# Seed database if needed
echo "🌱 Seeding database..."
npm run seed

echo "✅ Development environment is ready!"
echo "🎯 You can now run:"
echo "   - npm run dev (start both client and server)"
echo "   - npm run dev:client (start only frontend)"
echo "   - npm run dev:server (start only backend)"