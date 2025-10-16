# Simple development Dockerfile for dev container
FROM node:18-alpine

# Use Node.js 22 as base
FROM node:22

# Install additional system dependencies
RUN apt-get update && apt-get install -y \
    git \
    bash \
    curl \
    wget \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update \
    && apt-get install gh -y \
    && rm -rf /var/lib/apt/lists/*

# Create workspace directory
WORKDIR /workspace

# Set the user to node (pre-existing in the image)
USER node

# Set working directory
WORKDIR /workspace

# Switch to node user (already exists in base image)
USER node

# Keep container running
CMD ["sleep", "infinity"]