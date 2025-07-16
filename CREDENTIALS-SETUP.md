# 🔐 n8n Credentials Setup Guide

Since External Secrets and Environments are Enterprise-only features, we'll use n8n's built-in credential system to hide your API keys.

## 📋 Required Credentials

You need to set up these credentials in n8n:

### 1. AssemblyAI Credential
- **Name**: `assemblyai`
- **Type**: Generic API
- **Fields**:
  - `apiKey`: `ef63b27009744d2497d6f6ef24551ed8`

### 2. Lambda Function Credential
- **Name**: `lambda`
- **Type**: Generic API
- **Fields**:
  - `url`: `https://v5n3opfu34c7v2a23hpczguhma0bxmbp.lambda-url.us-east-2.on.aws/`

### 3. n8n API Credential (for auto-update)
- **Name**: `n8n-api`
- **Type**: Generic API
- **Fields**:
  - `apiKey`: (your n8n API key)
  - `baseUrl`: (your n8n URL, e.g., `http://localhost:5678`)

## 🛠️ Step-by-Step Setup

### Step 1: Create AssemblyAI Credential

1. **Go to Credentials**:
   - In n8n, click "Credentials" in the left sidebar
   - Click "Add Credential"

2. **Select Generic API**:
   - Search for "Generic API"
   - Click on it

3. **Configure the Credential**:
   - **Name**: `assemblyai`
   - **API Key**: `ef63b27009744d2497d6f6ef24551ed8`
   - Click "Save"

### Step 2: Create Lambda Credential

1. **Add Another Credential**:
   - Click "Add Credential" again
   - Select "Generic API"

2. **Configure the Credential**:
   - **Name**: `lambda`
   - **URL**: `https://v5n3opfu34c7v2a23hpczguhma0bxmbp.lambda-url.us-east-2.on.aws/`
   - Click "Save"

### Step 3: Create n8n API Credential

1. **Add Another Credential**:
   - Click "Add Credential" again
   - Select "Generic API"

2. **Configure the Credential**:
   - **Name**: `n8n-api`
   - **API Key**: (your n8n API key)
   - **Base URL**: (your n8n URL)
   - Click "Save"

## 🔧 Update Workflow to Use Credentials

The workflow has been updated to use credentials instead of environment variables:

- `{{ $env.ASSEMBLYAI_API_KEY }}` → `{{ $credentials.assemblyai.apiKey }}`
- `{{ $env.LAMBDA_FUNCTION_URL }}` → `{{ $credentials.lambda.url }}`
- `{{ $env.N8N_API_KEY }}` → `{{ $credentials.n8n-api.apiKey }}`
- `{{ $env.N8N_BASE_URL }}` → `{{ $credentials.n8n-api.baseUrl }}`

## ✅ Verification

After setting up credentials:

1. **Import the updated workflow** from GitHub
2. **Test the workflow** - it should now use the credentials
3. **Check execution logs** to ensure no API key errors

## 🔒 Security Benefits

- ✅ **API keys are encrypted** in n8n's credential store
- ✅ **No hardcoded secrets** in workflow files
- ✅ **Works on all n8n plans** (Free, Pro, Enterprise)
- ✅ **Easy to rotate keys** - just update the credential
- ✅ **Team collaboration** - credentials can be shared securely

## 🚨 Important Notes

- **Never share credential screenshots** - they may contain sensitive data
- **Use descriptive names** for credentials to avoid confusion
- **Test thoroughly** after setting up credentials
- **Backup your credentials** if you need to migrate n8n instances

## 🔄 Alternative: Manual Credential Setup

If you prefer to set up credentials manually in the workflow:

1. **Edit each HTTP Request node**
2. **Click on the credential field**
3. **Select "Create New Credential"**
4. **Follow the setup steps above**

This approach works on all n8n plans and keeps your API keys secure! 