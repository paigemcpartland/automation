# Auto-Updating Color Report Workflow Setup

## Overview

Your color report workflow now includes **built-in auto-update functionality**! This means every time you run the workflow, it will:

1. ✅ Check for the latest version on GitHub
2. ✅ Automatically import any updates if available
3. ✅ Continue with the color report generation
4. ✅ Provide clear feedback about the update status

## How It Works

The workflow now starts with an auto-update check that:

- **Fetches** the latest workflow from GitHub
- **Attempts** to import it via n8n's API
- **Continues** with color report generation regardless of update success
- **Logs** the update status for transparency

## Setup Requirements

### 1. Environment Variables

You need to set up these environment variables in your n8n instance:

```bash
N8N_BASE_URL=https://your-n8n-instance.com
N8N_API_KEY=your-n8n-api-key
```

#### How to Set Environment Variables:

**Option A: n8n Cloud**
1. Go to your n8n workspace settings
2. Navigate to "Environment Variables"
3. Add the variables above

**Option B: Self-hosted n8n**
1. Edit your `.env` file or environment configuration
2. Add the variables above
3. Restart n8n

### 2. Get Your n8n API Key

1. Go to your n8n instance
2. Navigate to Settings → API
3. Generate a new API key
4. Copy the key to your environment variables

### 3. Verify Your n8n Base URL

- **n8n Cloud**: Use your workspace URL (e.g., `https://your-workspace.n8n.cloud`)
- **Self-hosted**: Use your n8n instance URL (e.g., `http://localhost:5678`)

## Usage

### One-Time Setup

1. **Import the workflow** into n8n (this is the only manual import needed!)
2. **Set up environment variables** as described above
3. **Test the workflow** by clicking "Execute workflow"

### Daily Usage

Simply **click "Execute workflow"** and the workflow will:

1. 🔄 Check for updates automatically
2. 📥 Import any new changes if available
3. 🎯 Generate your color report
4. 📊 Show you the update status in the execution log

## What You'll See

### Successful Update
```
✅ Workflow auto-updated successfully!
📅 Updated at: 2024-01-15T10:30:00.000Z
🆔 Workflow ID: abc123def456

🎯 Proceeding with color report generation...
```

### Update Failed (Continues Anyway)
```
⚠️ Workflow update failed, using current version
📅 Error time: 2024-01-15T10:30:00.000Z
❌ Error: 401 - Unauthorized

🎯 Proceeding with color report generation...
```

## Troubleshooting

### Common Issues

**1. "401 Unauthorized" Error**
- Check your `N8N_API_KEY` is correct
- Verify the API key has proper permissions

**2. "Failed to fetch latest workflow"**
- Check your internet connection
- Verify the GitHub repository is accessible
- Ensure the workflow file exists in the repo

**3. "Import failed"**
- Check your `N8N_BASE_URL` is correct
- Verify n8n is running and accessible
- Check workflow data format

### Manual Fallback

If auto-update fails, the workflow continues with the current version. You can also:

1. **Manual Import**: Use the GitHub raw URL directly in n8n
2. **Check Logs**: Review the execution logs for detailed error messages
3. **Verify Setup**: Double-check environment variables and API access

## Benefits

✅ **Fully Automated**: No manual imports needed  
✅ **Self-Updating**: Always uses the latest version  
✅ **Fault Tolerant**: Continues working even if update fails  
✅ **Transparent**: Clear feedback about update status  
✅ **Zero Downtime**: No interruption to your workflow  

## Development Workflow

1. **Make changes** in Cursor
2. **Commit and push** to GitHub
3. **Run the workflow** in n8n
4. **Auto-update** happens automatically
5. **New version** is used for color report generation

That's it! Your workflow is now completely self-managing and will always use the latest version from your GitHub repository. 