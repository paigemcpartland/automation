#!/bin/bash

# Enhanced Color Report Lambda Deployment Script
# This script sets up the Lambda function with Sharp and FFmpeg layers

set -e

# Configuration
FUNCTION_NAME="color-report-frame-extraction"
RUNTIME="nodejs20.x"
HANDLER="index.handler"
REGION="us-east-2"
BUCKET="color-reports-assets"
TIMEOUT=300
MEMORY_SIZE=1024

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎨 Enhanced Color Report Lambda Deployment${NC}"
echo "================================================"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  jq is not installed. Installing...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install jq
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y jq
    else
        echo -e "${RED}❌ Please install jq manually for your OS${NC}"
        exit 1
    fi
fi

# Create deployment directory
echo -e "${BLUE}📁 Creating deployment directory...${NC}"
DEPLOY_DIR="lambda-deployment"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Copy Lambda function
echo -e "${BLUE}📄 Copying Lambda function...${NC}"
cp index.mjs $DEPLOY_DIR/
cp color-utils.js $DEPLOY_DIR/

# Create package.json for dependencies
echo -e "${BLUE}📦 Creating package.json...${NC}"
cat > $DEPLOY_DIR/package.json << EOF
{
  "name": "color-report-lambda",
  "version": "1.0.0",
  "description": "Enhanced color report frame extraction Lambda",
  "main": "index.mjs",
  "type": "module",
  "dependencies": {
    "@aws-sdk/client-s3": "^3.0.0",
    "sharp": "^0.32.0"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
EOF

# Install dependencies
echo -e "${BLUE}📥 Installing dependencies...${NC}"
cd $DEPLOY_DIR
npm install --production

# Create deployment package
echo -e "${BLUE}📦 Creating deployment package...${NC}"
zip -r ../lambda-deployment.zip . -x "*.git*" "node_modules/.cache/*"
cd ..

# Check if function exists
echo -e "${BLUE}🔍 Checking if Lambda function exists...${NC}"
if aws lambda get-function --function-name $FUNCTION_NAME --region $REGION &> /dev/null; then
    echo -e "${YELLOW}⚠️  Function exists. Updating...${NC}"
    UPDATE_EXISTING=true
else
    echo -e "${GREEN}✅ Function doesn't exist. Creating new...${NC}"
    UPDATE_EXISTING=false
fi

# Get or create Sharp layer
echo -e "${BLUE}🔍 Checking for Sharp layer...${NC}"
SHARP_LAYER_ARN=$(aws lambda list-layers --region $REGION --query "Layers[?LayerName=='sharp-nodejs20'].LatestMatchingVersion.LayerVersionArn" --output text)

if [ -z "$SHARP_LAYER_ARN" ] || [ "$SHARP_LAYER_ARN" == "None" ]; then
    echo -e "${YELLOW}⚠️  Sharp layer not found. Creating...${NC}"
    
    # Create Sharp layer
    mkdir -p sharp-layer/nodejs
    cd sharp-layer/nodejs
    npm install sharp
    cd ../..
    
    # Create Sharp layer package
    cd sharp-layer
    zip -r ../sharp-layer.zip .
    cd ..
    
    # Publish Sharp layer
    SHARP_LAYER_ARN=$(aws lambda publish-layer-version \
        --layer-name "sharp-nodejs20" \
        --description "Sharp image processing library for Node.js 20" \
        --license-info "Apache-2.0" \
        --zip-file fileb://sharp-layer.zip \
        --compatible-runtimes nodejs20.x \
        --region $REGION \
        --query 'LayerVersionArn' \
        --output text)
    
    echo -e "${GREEN}✅ Sharp layer created: $SHARP_LAYER_ARN${NC}"
else
    echo -e "${GREEN}✅ Sharp layer found: $SHARP_LAYER_ARN${NC}"
fi

# Get or create FFmpeg layer
echo -e "${BLUE}🔍 Checking for FFmpeg layer...${NC}"
FFMPEG_LAYER_ARN=$(aws lambda list-layers --region $REGION --query "Layers[?LayerName=='ffmpeg-nodejs20'].LatestMatchingVersion.LayerVersionArn" --output text)

if [ -z "$FFMPEG_LAYER_ARN" ] || [ "$FFMPEG_LAYER_ARN" == "None" ]; then
    echo -e "${YELLOW}⚠️  FFmpeg layer not found. You'll need to create this manually.${NC}"
    echo -e "${BLUE}📋 Instructions:${NC}"
    echo "1. Download FFmpeg static build for Linux x64"
    echo "2. Create a layer with /opt/bin/ffmpeg and /opt/bin/ffprobe"
    echo "3. Name the layer 'ffmpeg-nodejs20'"
    echo ""
    echo -e "${YELLOW}⚠️  For now, using a placeholder ARN. Please update manually.${NC}"
    FFMPEG_LAYER_ARN="arn:aws:lambda:us-east-2:123456789012:layer:ffmpeg-nodejs20:1"
else
    echo -e "${GREEN}✅ FFmpeg layer found: $FFMPEG_LAYER_ARN${NC}"
fi

# Create IAM role if needed
echo -e "${BLUE}🔍 Checking IAM role...${NC}"
ROLE_NAME="color-report-lambda-role"
ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text 2>/dev/null || echo "")

if [ -z "$ROLE_ARN" ]; then
    echo -e "${YELLOW}⚠️  IAM role not found. Creating...${NC}"
    
    # Create trust policy
    cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
    
    # Create role
    ROLE_ARN=$(aws iam create-role \
        --role-name $ROLE_NAME \
        --assume-role-policy-document file://trust-policy.json \
        --query 'Role.Arn' \
        --output text)
    
    # Attach policies
    aws iam attach-role-policy \
        --role-name $ROLE_NAME \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    
    # Create S3 policy
    cat > s3-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::$BUCKET/*"
    }
  ]
}
EOF
    
    aws iam put-role-policy \
        --role-name $ROLE_NAME \
        --policy-name S3Access \
        --policy-document file://s3-policy.json
    
    echo -e "${GREEN}✅ IAM role created: $ROLE_ARN${NC}"
else
    echo -e "${GREEN}✅ IAM role found: $ROLE_ARN${NC}"
fi

# Deploy Lambda function
echo -e "${BLUE}🚀 Deploying Lambda function...${NC}"

if [ "$UPDATE_EXISTING" = true ]; then
    # Update existing function
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://lambda-deployment.zip \
        --region $REGION
    
    aws lambda update-function-configuration \
        --function-name $FUNCTION_NAME \
        --runtime $RUNTIME \
        --handler $HANDLER \
        --timeout $TIMEOUT \
        --memory-size $MEMORY_SIZE \
        --layers $SHARP_LAYER_ARN $FFMPEG_LAYER_ARN \
        --region $REGION
    
    echo -e "${GREEN}✅ Function updated successfully!${NC}"
else
    # Create new function
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime $RUNTIME \
        --handler $HANDLER \
        --role $ROLE_ARN \
        --zip-file fileb://lambda-deployment.zip \
        --timeout $TIMEOUT \
        --memory-size $MEMORY_SIZE \
        --layers $SHARP_LAYER_ARN $FFMPEG_LAYER_ARN \
        --region $REGION
    
    echo -e "${GREEN}✅ Function created successfully!${NC}"
fi

# Set environment variables
echo -e "${BLUE}🔧 Setting environment variables...${NC}"
aws lambda update-function-configuration \
    --function-name $FUNCTION_NAME \
    --environment Variables="{BUCKET=$BUCKET}" \
    --region $REGION

echo -e "${YELLOW}⚠️  Don't forget to set OPENAI_API_KEY environment variable:${NC}"
echo "aws lambda update-function-configuration \\"
echo "  --function-name $FUNCTION_NAME \\"
echo "  --environment Variables=\"{BUCKET=$BUCKET,OPENAI_API_KEY=your_key_here}\" \\"
echo "  --region $REGION"

# Create function URL
echo -e "${BLUE}🔗 Creating function URL...${NC}"
aws lambda create-function-url-config \
    --function-name $FUNCTION_NAME \
    --auth-type NONE \
    --region $REGION 2>/dev/null || echo -e "${YELLOW}⚠️  Function URL already exists${NC}"

# Get function URL
FUNCTION_URL=$(aws lambda get-function-url-config \
    --function-name $FUNCTION_NAME \
    --region $REGION \
    --query 'FunctionUrl' \
    --output text)

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${BLUE}📋 Function Details:${NC}"
echo "Name: $FUNCTION_NAME"
echo "URL: $FUNCTION_URL"
echo "Region: $REGION"
echo "Runtime: $RUNTIME"
echo "Memory: ${MEMORY_SIZE}MB"
echo "Timeout: ${TIMEOUT}s"
echo ""
echo -e "${BLUE}🔧 Next Steps:${NC}"
echo "1. Set OPENAI_API_KEY environment variable"
echo "2. Update your n8n workflow with the new function URL"
echo "3. Test with a sample video"
echo ""
echo -e "${GREEN}🎉 Your enhanced color report Lambda is ready!${NC}"

# Cleanup
echo -e "${BLUE}🧹 Cleaning up...${NC}"
rm -rf $DEPLOY_DIR
rm -f lambda-deployment.zip
rm -f sharp-layer.zip
rm -rf sharp-layer
rm -f trust-policy.json
rm -f s3-policy.json

echo -e "${GREEN}✅ Cleanup complete!${NC}" 