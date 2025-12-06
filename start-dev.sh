#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Finance App Development Environment${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    cd backend && docker compose down
    # Kill background processes
    jobs -p | xargs -r kill 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Step 1: Start PostgreSQL
echo -e "${BLUE}[1/3] Starting PostgreSQL database...${NC}"
cd backend
docker compose up -d db

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}Waiting for database to be ready...${NC}"
until docker compose exec -T db pg_isready -U postgres > /dev/null 2>&1; do
    echo -e "${YELLOW}Database is starting up...${NC}"
    sleep 2
done
echo -e "${GREEN}✓ Database is ready${NC}"
echo ""

# Step 2: Start Go Backend
echo -e "${BLUE}[2/3] Starting Go backend server...${NC}"
cd ../backend/go-server
~/go/bin/air -c .air.toml &
BACKEND_PID=$!

# Wait for backend to be ready
echo -e "${YELLOW}Waiting for backend to be ready...${NC}"
sleep 3
until curl -s http://localhost:8000/health > /dev/null 2>&1; do
    echo -e "${YELLOW}Backend is starting up...${NC}"
    sleep 2
done
echo -e "${GREEN}✓ Backend is ready at http://localhost:8000${NC}"
echo ""

# Step 3: Start Next.js Frontend
echo -e "${BLUE}[3/3] Starting Next.js frontend...${NC}"
cd ../../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}All services are running!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${BLUE}Frontend:${NC}  http://localhost:3000"
echo -e "${BLUE}Backend:${NC}   http://localhost:8000"
echo -e "${BLUE}Database:${NC}  localhost:5432"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for background processes
wait
