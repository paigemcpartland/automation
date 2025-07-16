# 🔧 n8n API Setup for Auto-Update

The workflow needs your n8n API key to enable auto-update functionality. Here's how to set it up:

## 🎯 **Step 1: Find Your n8n API Key**

### **For n8n Cloud:**
1. **Go to n8n Settings** (gear icon in top right)
2. **Look for "API" or "API Keys"** section
3. **Click "Create API Key"**
4. **Give it a name** like "Workflow Auto-Update"
5. **Copy the generated key**

### **For Local n8n:**
1. **Check if API is enabled** in your n8n configuration
2. **Look for API key** in your environment variables
3. **Or create one** in n8n settings if available

## 🔧 **Step 2: Update the Workflow**

1. **Open the workflow** in n8n
2. **Click on "Import Workflow via API"** node
3. **In the "X-N8N-API-KEY" header value**, replace `your-n8n-api-key-here` with your actual API key
4. **Save the workflow**

## 🌐 **Step 3: Update the URL (if needed)**

The workflow is currently set to use `http://localhost:5678`. If you're using n8n Cloud, update the URL:

1. **Click on "Import Workflow via API"** node
2. **In the "URL" field**, replace `http://localhost:5678` with your n8n URL:
   - For n8n Cloud: `https://your-instance.n8n.cloud`
   - For local n8n: `http://localhost:5678` (keep as is)

## ✅ **Step 4: Test Auto-Update**

1. **Run the workflow**
2. **Check the execution logs** to see if auto-update works
3. **If successful**, you'll see a message about the workflow being updated

## 🔄 **Alternative: Skip Auto-Update**

If you can't find your API key or don't want to set it up:

1. **Use the simplified workflow** instead:
   ```
   https://raw.githubusercontent.com/paigemcpartland/automation/main/WORKFLOW-WITHOUT-AUTO-UPDATE.json
   ```

2. **The simplified workflow** has all the same features except auto-update

## 🚨 **Important Notes**

- **API keys are sensitive** - don't share them
- **The workflow will still work** even if auto-update fails
- **You can always manually import** the latest version from GitHub

## 📞 **Need Help?**

If you can't find your API key:
1. **Check n8n documentation** for your specific setup
2. **Use the simplified workflow** for now
3. **We can help you troubleshoot** the API setup later 