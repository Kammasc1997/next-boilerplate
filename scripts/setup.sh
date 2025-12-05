#!/bin/bash

# Solspot Setup Script
# Dette script hjælper med at opsætte projektet

set -e

echo "🌞 Solspot Setup"
echo "================"
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local fil findes allerede"
else
    echo "📝 Opretter .env.local fil..."
    if [ -f ".env.local.example" ]; then
        cp .env.local.example .env.local
        echo "✅ .env.local oprettet fra .env.local.example"
        echo "⚠️  Husk at udfylde dine API keys i .env.local"
    else
        echo "❌ .env.local.example ikke fundet"
        exit 1
    fi
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✅ Dependencies er allerede installeret"
else
    echo "📦 Installerer dependencies..."
    if command -v npm &> /dev/null; then
        npm install
        echo "✅ Dependencies installeret"
    else
        echo "❌ npm ikke fundet. Installer Node.js først."
        exit 1
    fi
fi

echo ""
echo "✅ Setup færdig!"
echo ""
echo "Næste skridt:"
echo "1. Rediger .env.local og tilføj dine API keys"
echo "2. Opsæt Supabase database (se QUICKSTART.md)"
echo "3. Kør 'npm run dev' for at starte serveren"
echo ""

