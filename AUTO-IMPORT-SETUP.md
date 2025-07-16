# Auto-Import Workflow Setup

This workflow automatically imports the latest version of your color report workflow from GitHub each time it runs.

## 🎯 How It Works

1. **Fetch Latest Workflow**: Downloads the latest workflow JSON from GitHub
2. **Import via API**: Uses n8n's API to import the workflow automatically
3. **Success/Error Handling**: Provides clear feedback on import status

## 🚀 Setup Instructions

### 1. Import the Auto-Import Workflow

1. Go to your n8n instance
2. Click **Import from URL**
3. Use this URL: `https://raw.githubusercontent.com/paigemcpartland/automation/main/auto-import-workflow.json`
4. Save the workflow

### 2. Configure Environment Variables

In your n8n instance, set these environment variables:

#### Option A: n8n Cloud
1. Go to **Settings** → **Environment Variables**
2. Add these variables:
   - `N8N_BASE_URL`: Your n8n instance URL (e.g., `https://your-instance.n8n.cloud`)
   - `N8N_API_KEY`: Your n8n API key

#### Option B: Self-Hosted n8n
1. In your n8n configuration, add:
   ```bash
   N8N_BASE_URL=https://your-n8n-domain.com
   N8N_API_KEY=your-api-key
   ```

### 3. Get Your n8n API Key

1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Give it a name like "Auto-Import"
4. Copy the generated key

### 4. Test the Auto-Import

1. Run the "Auto-Import Color Report Workflow"
2. Check the output for success/error messages
3. Verify the workflow was imported in your Workflows list

## 🔄 Usage

### Every Time You Update Your Workflow:

1. **Edit in Cursor**:
   ```bash
   # Edit My workflow 2 (26).json in Cursor
   git add "My workflow 2 (26).json"
   git commit -m "Update workflow logic"
   git push
   ```

2. **Run Auto-Import**:
   - Go to your n8n instance
   - Find "Auto-Import Color Report Workflow"
   - Click **Execute Workflow**
   - The latest version will be imported automatically!

## 🎯 Benefits

✅ **One-click updates** - No manual import needed  
✅ **Always current** - Gets the latest version from GitHub  
✅ **Error handling** - Clear feedback if something goes wrong  
✅ **API-based** - Uses n8n's official API for reliable imports  

## 🔧 Troubleshooting

### Common Issues:

1. **API Key Error**:
   - Verify your `N8N_API_KEY` is correct
   - Check that the API key has proper permissions

2. **Base URL Error**:
   - Ensure `N8N_BASE_URL` points to your n8n instance
   - Include the full URL (e.g., `https://your-instance.n8n.cloud`)

3. **Workflow Import Fails**:
   - Check that the GitHub repository is accessible
   - Verify the workflow file exists in the repo
   - Check the workflow JSON format

### Manual Fallback:

If auto-import fails, you can always import manually:
1. Go to **Workflows** → **Import from URL**
2. Use: `https://raw.githubusercontent.com/paigemcpartland/automation/main/My%20workflow%202%20(26).json`

## 📊 Workflow Structure

```
Manual Trigger → Fetch Latest Workflow → Check Response
                                              ↓
                                    ┌─────────────────┐
                                    │   Success?      │
                                    └─────────────────┘
                                              ↓
                                    ┌─────────────────┐
                                    │   Yes    │  No  │
                                    └─────────────────┘
                                              ↓
                                    ┌─────────────────┐
                                    │ Import via API  │
                                    └─────────────────┘
                                              ↓
                                    ┌─────────────────┐
                                    │ Import Success? │
                                    └─────────────────┘
                                              ↓
                                    ┌─────────────────┐
                                    │   Yes    │  No  │
                                    └─────────────────┘
                                              ↓
                                    ┌─────────────────┐
                                    │ Success Message │
                                    └─────────────────┘
```

## 🎉 Complete Automation

With this setup, your development workflow becomes:

1. **Edit in Cursor** → **Push to GitHub** → **Lambda auto-deploys**
2. **Edit workflow in Cursor** → **Push to GitHub** → **Run auto-import** → **Workflow updates**

Everything is now automated! 🚀 