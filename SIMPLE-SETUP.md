# 🔐 Simple API Key Setup (No Enterprise Features Needed)

Since n8n only shows limited credential types, here's a simple approach that works on all plans.

## 🎯 **Option 1: Use n8n API Credential (Recommended)**

Since "n8n API" is available in your dropdown, let's use that for the auto-update functionality:

### **Set up n8n API Credential:**

1. **Click "Continue"** on the "n8n API" credential
2. **Configure it**:
   - **Name**: `n8n-api`
   - **API Key**: (your n8n API key)
   - **Base URL**: (your n8n URL, e.g., `http://localhost:5678`)
3. **Save the credential**

## 🔧 **Option 2: Manual Credential Setup in Nodes**

For the other API keys, set them up directly in the workflow nodes:

### **AssemblyAI Setup:**
1. **Open your workflow**
2. **Click on "HTTP Request1"** (AssemblyAI node)
3. **In the Authorization header field**, click the dropdown
4. **Select "Create New Credential"**
5. **Choose "Generic API"** (should be available here)
6. **Configure**:
   - **Name**: `assemblyai`
   - **API Key**: `ef63b27009744d2497d6f6ef24551ed8`
7. **Save**

### **Lambda Setup:**
1. **Click on "HTTP Request2"** (Lambda node)
2. **In the URL field**, you can use the direct URL:
   ```
   https://v5n3opfu34c7v2a23hpczguhma0bxmbp.lambda-url.us-east-2.on.aws/
   ```

## 🔄 **Option 3: Use Environment Variables (Alternative)**

If credentials don't work, you can set environment variables in your n8n configuration:

### **For Docker:**
Add to your docker-compose.yml:
```yaml
environment:
  - ASSEMBLYAI_API_KEY=ef63b27009744d2497d6f6ef24551ed8
  - LAMBDA_FUNCTION_URL=https://v5n3opfu34c7v2a23hpczguhma0bxmbp.lambda-url.us-east-2.on.aws/
```

### **For Local n8n:**
Create a `.env` file in your n8n directory:
```bash
ASSEMBLYAI_API_KEY=ef63b27009744d2497d6f6ef24551ed8
LAMBDA_FUNCTION_URL=https://v5n3opfu34c7v2a23hpczguhma0bxmbp.lambda-url.us-east-2.on.aws/
```

## ✅ **Recommended Approach**

1. **Set up the n8n API credential** (since it's available)
2. **Use manual credential setup** for AssemblyAI in the HTTP Request node
3. **Use direct URL** for Lambda function
4. **Test the workflow**

This approach will hide your API keys while working with the available n8n features on your plan.

## 🔒 **Security Note**

Even though we're using the API key in the workflow, it's still more secure than having it in the GitHub repository because:
- ✅ **Not in version control**
- ✅ **Encrypted in n8n's credential store**
- ✅ **Can be rotated easily**
- ✅ **Works on all n8n plans** 