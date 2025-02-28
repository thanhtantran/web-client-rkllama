#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check and install Node.js if not present
if ! command_exists node; then
    echo -e "${BLUE}Node.js not found. Installing Node.js...${NC}"
    # Update package lists and install Node.js
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y nodejs
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Node.js installed successfully.${NC}"
    else
        echo -e "${RED}Failed to install Node.js. Please install it manually and try again.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}Node.js is already installed (version: $(node --version)).${NC}"
fi

# Check if serve is installed globally, install if not
if ! command_exists serve; then
    echo -e "${BLUE}Installing serve globally...${NC}"
    npm install -g serve
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}serve installed successfully.${NC}"
    else
        echo -e "${RED}Failed to install serve. Please install it manually (npm install -g serve) and try again.${NC}"
        exit 1
    fi
fi

WEB_CLIENT_DIR="./src"
if [ ! -d "$WEB_CLIENT_DIR" ]; then
    echo -e "${RED}Error: web-client directory not found. Please ensure it exists in the current directory.${NC}"
    exit 1
fi

cd "$WEB_CLIENT_DIR" || {
    echo -e "${RED}Error: Failed to navigate to web-client directory.${NC}"
    exit 1
}

# Default port
PORT=3000

# Check if port is available, increment if in use
while lsof -i :$PORT >/dev/null 2>&1; do
    echo -e "${BLUE}Port $PORT is in use. Trying the next available port...${NC}"
    PORT=$((PORT + 1))
done

# Start the web server with the available port
echo -e "${BLUE}Starting rkllama Web Server on port $PORT...${NC}"
serve -s -p "$PORT" &

# Store the process ID of serve
SERVE_PID=$!

# Wait a moment to ensure the server is up
sleep 2

# Check if the server started successfully
if ! lsof -i :$PORT >/dev/null 2>&1; then
    echo -e "${RED}Error: Failed to start the web server. Please check logs or try manually.${NC}"
    kill $SERVE_PID 2>/dev/null
    exit 1
fi

# Display the port
echo -e "${GREEN}rkllama Web Server is now running at http://localhost:$PORT${NC}"
echo -e "${GREEN}Port used: $PORT${NC}"


echo -e "${BLUE}Press Ctrl+C to stop the server.${NC}"
wait $SERVE_PID