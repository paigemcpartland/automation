#!/bin/bash

echo "🚀 Setting up Color Report Automation for GitHub Auto-Deployment"
echo "================================================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not initialized. Run 'git init' first."
    exit 1
fi

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

# Get repository name
read -p "Enter repository name (default: color-report-automation): " REPO_NAME
REPO_NAME=${REPO_NAME:-color-report-automation}

# Create GitHub repository URL
GITHUB_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

echo ""
echo "📋 Setup Instructions:"
echo "======================"
echo ""
echo "1. Create GitHub repository:"
echo "   - Go to https://github.com/new"
echo "   - Repository name: $REPO_NAME"
echo "   - Make it PRIVATE (recommended for API keys)"
echo "   - Don't initialize with README (we already have one)"
echo ""
echo "2. Add remote and push:"
echo "   git remote add origin $GITHUB_URL"
echo "   git add ."
echo "   git commit -m 'Initial commit with auto-deployment setup'"
echo "   git push -u origin main"
echo ""
echo "3. Set up GitHub Secrets:"
echo "   - Go to https://github.com/$GITHUB_USERNAME/$REPO_NAME/settings/secrets/actions"
echo "   - Add these secrets:"
echo "     * AWS_ACCESS_KEY_ID"
echo "     * AWS_SECRET_ACCESS_KEY"
echo "     * OPENAI_API_KEY"
echo ""
echo "4. Update Lambda function name:"
echo "   - Edit .github/workflows/deploy-lambda.yml"
echo "   - Change 'color-report-lambda' to your actual Lambda function name"
echo ""
echo "5. Import n8n workflow:"
echo "   - In n8n, go to Workflows"
echo "   - Click 'Import from URL'"
echo "   - Use: https://raw.githubusercontent.com/$GITHUB_USERNAME/$REPO_NAME/main/My%20workflow%202%20(26).json"
echo ""
echo "🎯 Development Workflow:"
echo "======================="
echo ""
echo "To make changes from Cursor:"
echo "1. Edit files in Cursor"
echo "2. git add ."
echo "3. git commit -m 'Your changes'"
echo "4. git push"
echo "5. Lambda auto-deploys via GitHub Actions"
echo "6. Re-import n8n workflow from GitHub URL"
echo ""
echo "✅ Setup complete! Follow the instructions above to configure auto-deployment." 