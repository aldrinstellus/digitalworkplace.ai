#!/bin/bash

# ============================================================
# Chat Core IQ - Primary Entry Point Startup Script
# ============================================================
# This script starts all required services for the Chat Core IQ
# website with embedded AI chatbot.
#
# PRIMARY URL: http://localhost:8888/Home/index.html
#
# Services:
#   - Next.js Backend (port 3001 with basePath /dcq): Chat API & widget assets
#   - Static Site Server (port 8888): Website with chatbot widgets
# ============================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project directory
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
STATIC_SITE_DIR="$PROJECT_DIR/public"

# PID files for cleanup
NEXTJS_PID=""
STATIC_PID=""

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"

    if [ -n "$NEXTJS_PID" ] && kill -0 "$NEXTJS_PID" 2>/dev/null; then
        kill "$NEXTJS_PID" 2>/dev/null
        echo -e "${GREEN}Next.js server stopped${NC}"
    fi

    if [ -n "$STATIC_PID" ] && kill -0 "$STATIC_PID" 2>/dev/null; then
        kill "$STATIC_PID" 2>/dev/null
        echo -e "${GREEN}Static site server stopped${NC}"
    fi

    # Kill any remaining processes on the ports
    lsof -ti:3002 | xargs kill -9 2>/dev/null || true
    lsof -ti:8888 | xargs kill -9 2>/dev/null || true

    echo -e "${GREEN}All services stopped. Goodbye!${NC}"
    exit 0
}

# Set up trap for cleanup
trap cleanup SIGINT SIGTERM EXIT

# Header
echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}     City of Doral - AI Chatbot Website                     ${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

# Check if ports are already in use
if lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}Warning: Port 3002 is already in use. Killing existing process...${NC}"
    lsof -ti:3002 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

if lsof -Pi :8888 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}Warning: Port 8888 is already in use. Killing existing process...${NC}"
    lsof -ti:8888 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Change to project directory
cd "$PROJECT_DIR"

# Start Next.js backend (for chat API and widget assets)
echo -e "${YELLOW}Starting Next.js backend on port 3002...${NC}"
npm run dev > /tmp/nextjs-cityofdoral.log 2>&1 &
NEXTJS_PID=$!
echo -e "${GREEN}Next.js server started (PID: $NEXTJS_PID)${NC}"

# Wait for Next.js to be ready
echo -e "${YELLOW}Waiting for Next.js to initialize...${NC}"
sleep 5

# Start static site server
echo -e "${YELLOW}Starting static site server on port 8888...${NC}"
cd "$STATIC_SITE_DIR"
python3 -m http.server 8888 > /tmp/static-cityofdoral.log 2>&1 &
STATIC_PID=$!
cd "$PROJECT_DIR"
echo -e "${GREEN}Static site server started (PID: $STATIC_PID)${NC}"

# Wait a moment for static server to start
sleep 2

# Open browser to the primary entry point
echo -e "${YELLOW}Opening browser...${NC}"
open "http://localhost:8888/Home/index.html"

# Display status
echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}     All services are running!                              ${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo -e "  ${BLUE}PRIMARY URL:${NC} ${GREEN}http://localhost:8888/Home/index.html${NC}"
echo ""
echo -e "  Services:"
echo -e "    - Static Site:    http://localhost:8888"
echo -e "    - Next.js API:    http://localhost:3002/dcq"
echo -e "    - Admin Panel:    http://localhost:3002/dcq/admin"
echo ""
echo -e "  Logs:"
echo -e "    - Next.js:        /tmp/nextjs-cityofdoral.log"
echo -e "    - Static Server:  /tmp/static-cityofdoral.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Function to start static server
start_static_server() {
    cd "$STATIC_SITE_DIR"
    python3 -m http.server 8888 >> /tmp/static-cityofdoral.log 2>&1 &
    STATIC_PID=$!
    cd "$PROJECT_DIR"
    echo -e "${GREEN}Static site server started (PID: $STATIC_PID)${NC}"
}

# Function to start Next.js
start_nextjs() {
    cd "$PROJECT_DIR"
    npm run dev >> /tmp/nextjs-cityofdoral.log 2>&1 &
    NEXTJS_PID=$!
    echo -e "${GREEN}Next.js server started (PID: $NEXTJS_PID)${NC}"
}

# Keep script running and monitor processes with AUTO-RESTART
RESTART_COUNT_STATIC=0
RESTART_COUNT_NEXTJS=0
MAX_RESTARTS=10

while true; do
    # Check if Next.js is still running
    if ! kill -0 "$NEXTJS_PID" 2>/dev/null; then
        RESTART_COUNT_NEXTJS=$((RESTART_COUNT_NEXTJS + 1))
        if [ $RESTART_COUNT_NEXTJS -le $MAX_RESTARTS ]; then
            echo -e "${YELLOW}[$(date)] Next.js stopped. Auto-restarting... (attempt $RESTART_COUNT_NEXTJS/$MAX_RESTARTS)${NC}"
            sleep 2
            start_nextjs
            sleep 5
        else
            echo -e "${RED}Next.js exceeded max restarts ($MAX_RESTARTS). Manual intervention required.${NC}"
            exit 1
        fi
    fi

    # Check if static server is still running
    if ! kill -0 "$STATIC_PID" 2>/dev/null; then
        RESTART_COUNT_STATIC=$((RESTART_COUNT_STATIC + 1))
        if [ $RESTART_COUNT_STATIC -le $MAX_RESTARTS ]; then
            echo -e "${YELLOW}[$(date)] Static server stopped. Auto-restarting... (attempt $RESTART_COUNT_STATIC/$MAX_RESTARTS)${NC}"
            sleep 1
            start_static_server
        else
            echo -e "${RED}Static server exceeded max restarts ($MAX_RESTARTS). Manual intervention required.${NC}"
            exit 1
        fi
    fi

    # Health check every 30 seconds
    sleep 30

    # Periodic health check with curl
    if ! curl -s -o /dev/null -w '' --max-time 5 http://localhost:8888/Home/index.html 2>/dev/null; then
        echo -e "${YELLOW}[$(date)] Static server health check failed. Port may be stuck.${NC}"
        lsof -ti:8888 | xargs kill -9 2>/dev/null || true
        sleep 1
        start_static_server
    fi

    if ! curl -s -o /dev/null -w '' --max-time 5 http://localhost:3002/dcq/api/health 2>/dev/null; then
        # Only warn, Next.js might just be slow
        :
    fi
done
