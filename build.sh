#!/bin/bash

# Docker Build Script for Web Monitoring PSRE
# Builds API and App images with versioned tags

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOCKER_USERNAME="taufikp"
API_IMAGE_NAME="monitoring-psre-api"
APP_IMAGE_NAME="monitoring-psre-app"

# Generate version tag: YYYYMMDD.XXXX (4 random hex digits)
DATE_TAG=$(date +%Y%m%d)
RANDOM_HEX=$(openssl rand -hex 2)  # 2 bytes = 4 hex characters
VERSION="${DATE_TAG}.${RANDOM_HEX}"

echo -e "${GREEN}=== Docker Build Script ===${NC}"
echo -e "${YELLOW}Version: ${VERSION}${NC}"
echo ""

# Function to build, tag and push image
build_image() {
    local context=$1
    local image_name=$2
    local version_file=$3
    
    echo -e "${YELLOW}Building ${image_name}...${NC}"
    
    # Build the image
    docker build -t "${DOCKER_USERNAME}/${image_name}:${VERSION}" \
                 -t "${DOCKER_USERNAME}/${image_name}:latest" \
                 "${context}"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Successfully built ${image_name}${NC}"
        
        # Save version to file
        echo "${VERSION}" > "${version_file}"
        echo -e "${GREEN}✓ Version saved to ${version_file}${NC}"
        
        # Push the images
        echo -e "${YELLOW}Pushing ${image_name} to Docker Hub...${NC}"
        docker push "${DOCKER_USERNAME}/${image_name}:${VERSION}"
        docker push "${DOCKER_USERNAME}/${image_name}:latest"
        
        echo -e "${GREEN}✓ Successfully pushed ${image_name}${NC}"
    else
        echo -e "${RED}✗ Failed to build ${image_name}${NC}"
        exit 1
    fi
    
    echo ""
}

# Build API
echo -e "${GREEN}[1/2] Building API${NC}"
build_image "./api" "${API_IMAGE_NAME}" "./api/version.txt"

# Build App
echo -e "${GREEN}[2/2] Building App${NC}"
build_image "./app" "${APP_IMAGE_NAME}" "./app/version.txt"

# Summary
echo -e "${GREEN}=== Build and Push Summary ===${NC}"
echo -e "Version: ${YELLOW}${VERSION}${NC}"
echo ""
echo "Images built and pushed:"
echo -e "  • ${DOCKER_USERNAME}/${API_IMAGE_NAME}:${VERSION}"
echo -e "  • ${DOCKER_USERNAME}/${API_IMAGE_NAME}:latest"
echo -e "  • ${DOCKER_USERNAME}/${APP_IMAGE_NAME}:${VERSION}"
echo -e "  • ${DOCKER_USERNAME}/${APP_IMAGE_NAME}:latest"
echo ""
echo -e "${GREEN}Build and push completed successfully!${NC}"
