# MESH-TECH-V2 Dockerfile
FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev --no-audit --no-fund

# Copy source code
COPY . .

# Create auth directory
RUN mkdir -p auth_info

# Expose port
EXPOSE 3000

# Start the bot
CMD ["npm", "start"]
