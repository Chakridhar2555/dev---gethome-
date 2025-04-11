#!/bin/bash

# Make script executable
# chmod +x deploy.sh

# Install Vercel CLI if not installed
if ! [ -x "$(command -v vercel)" ]; then
  echo 'Error: Vercel CLI is not installed. Installing...' >&2
  npm install -g vercel
fi

# Initialize Vercel project if not initialized
if [ ! -d ".vercel" ]; then
  echo "Initializing Vercel project..."
  vercel
fi

# Pull environment variables from Vercel (optional - in case you want to merge with existing)
# vercel env pull .env.production

# Read environment variables from file
echo "Reading environment variables from vercel.env..."
while read -r line; do
  # Skip empty lines and comments
  [[ -z "$line" || "$line" == \#* ]] && continue
  
  # Parse key and value
  key=$(echo $line | cut -d '=' -f 1)
  value=$(echo $line | cut -d '=' -f 2-)
  
  # Trim spaces
  key=$(echo $key | xargs)
  
  echo "Adding environment variable: $key"
  echo "$value" | vercel env add $key production -y
done < vercel.env

# Deploy to production
echo "Deploying to production..."
vercel --prod

echo "Deployment complete!" 