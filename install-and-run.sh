#!/bin/bash
# Solspot Install and Run Script

set -e

echo "🌞 Solspot - Install and Run"
echo "=============================="
echo ""

# Load nvm if available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

# Check Node.js
if ! command -v node &> /dev/null; then
    # Try to activate nvm
    if [ -s "$NVM_DIR/nvm.sh" ]; then
        source "$NVM_DIR/nvm.sh"
        nvm use default 2>/dev/null || nvm use node 2>/dev/null || true
    fi
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js ikke fundet!"
        echo "   Installer Node.js fra https://nodejs.org/"
        echo "   Eller installer nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
        exit 1
    fi
fi

echo "✅ Node.js fundet: $(node --version)"
echo "✅ npm fundet: $(npm --version)"
echo ""

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installerer dependencies..."
    npm install
    echo "✅ Dependencies installeret"
else
    echo "✅ Dependencies allerede installeret"
fi

echo ""

# Check .env.local
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local fil ikke fundet!"
    if [ -f ".env.local.example" ]; then
        echo "📝 Opretter .env.local fra .env.local.example..."
        cp .env.local.example .env.local
        echo "✅ .env.local oprettet"
        echo ""
        echo "⚠️  VIGTIGT: Rediger .env.local og tilføj dine API keys!"
        echo "   Se SETUP.md for detaljerede instruktioner"
        echo ""
        read -p "Tryk Enter når du har udfyldt .env.local..."
    else
        echo "❌ .env.local.example ikke fundet!"
        exit 1
    fi
else
    echo "✅ .env.local fil findes"
fi

echo ""
echo "🚀 Starter udviklingsserveren..."
echo "   Besøg http://localhost:3000 i din browser"
echo ""

npm run dev
