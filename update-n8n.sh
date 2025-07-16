#!/bin/bash

# Get GitHub username and repo name from git remote
GITHUB_URL=$(git remote get-url origin 2>/dev/null)

if [ -z "$GITHUB_URL" ]; then
    echo "❌ No GitHub remote found. Run setup-github.sh first."
    exit 1
fi

# Extract username and repo from URL
if [[ $GITHUB_URL == *"github.com"* ]]; then
    # Handle both HTTPS and SSH URLs
    if [[ $GITHUB_URL == *"https://"* ]]; then
        REPO_PATH=$(echo $GITHUB_URL | sed 's|https://github.com/||' | sed 's|.git||')
    else
        REPO_PATH=$(echo $GITHUB_URL | sed 's|git@github.com:||' | sed 's|.git||')
    fi
    
    GITHUB_USERNAME=$(echo $REPO_PATH | cut -d'/' -f1)
    REPO_NAME=$(echo $REPO_PATH | cut -d'/' -f2)
else
    echo "❌ Invalid GitHub URL format"
    exit 1
fi

echo "🔄 n8n Workflow Update"
echo "======================"
echo ""
echo "After pushing changes to GitHub, update your n8n workflow:"
echo ""
echo "📋 Quick Options:"
echo "1. Open n8n-import.html in your browser (bookmark it!)"
echo "2. Or use the URL below manually"
echo ""
echo "🔗 Import URL:"
echo "https://raw.githubusercontent.com/$GITHUB_USERNAME/$REPO_NAME/main/My%20workflow%202%20(26).json"
echo ""
echo "📝 Manual Steps:"
echo "1. Go to your n8n instance"
echo "2. Navigate to Workflows"
echo "3. Find your color report workflow"
echo "4. Click the three dots menu → 'Import from URL'"
echo "5. Paste the URL above"
echo "6. Click 'Import' to update the workflow"
echo ""
echo "💡 Pro Tip: Bookmark the n8n-import.html file for one-click updates!" 