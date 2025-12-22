#!/bin/bash

# Script to create placeholder images for G-iReport app
# Run this script to create basic placeholder images

echo "Creating placeholder images for G-iReport..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick not found. Installing placeholder approach..."
    echo ""
    echo "OPTION 1: Install ImageMagick and run this script again:"
    echo "  sudo apt-get install imagemagick  # Ubuntu/Debian"
    echo "  brew install imagemagick          # macOS"
    echo ""
    echo "OPTION 2: Download sample images manually:"
    echo "  - Logo (120x120): Place in src/assets/images/logo.png"
    echo "  - Splash (300x300): Place in src/assets/images/splash.png"
    echo "  - Onboarding images (600x400): Place in src/assets/images/illustrations/"
    echo ""
    echo "OPTION 3: Use online tools:"
    echo "  - https://placeholder.com - Generate placeholder images"
    echo "  - https://via.placeholder.com - Quick placeholders"
    echo ""
    exit 1
fi

# Create logo placeholder (120x120)
convert -size 120x120 xc:#2563EB \
    -gravity center \
    -fill white \
    -pointsize 20 \
    -annotate +0+0 "G-iReport\nLogo" \
    src/assets/images/logo.png

# Create splash placeholder (300x300)
convert -size 300x300 xc:#2563EB \
    -gravity center \
    -fill white \
    -pointsize 24 \
    -annotate +0+0 "G-iReport" \
    src/assets/images/splash.png

# Create onboarding illustrations (600x400)
convert -size 600x400 xc:#E0E7FF \
    -gravity center \
    -fill #2563EB \
    -pointsize 20 \
    -annotate +0+0 "Report\nIncidents" \
    src/assets/images/illustrations/onboarding1.png

convert -size 600x400 xc:#E0E7FF \
    -gravity center \
    -fill #2563EB \
    -pointsize 20 \
    -annotate +0+0 "Stay\nInformed" \
    src/assets/images/illustrations/onboarding2.png

convert -size 600x400 xc:#E0E7FF \
    -gravity center \
    -fill #2563EB \
    -pointsize 20 \
    -annotate +0+0 "Make a\nDifference" \
    src/assets/images/illustrations/onboarding3.png

echo "✅ Placeholder images created successfully!"
echo ""
echo "Created files:"
echo "  - src/assets/images/logo.png"
echo "  - src/assets/images/splash.png"
echo "  - src/assets/images/illustrations/onboarding1.png"
echo "  - src/assets/images/illustrations/onboarding2.png"
echo "  - src/assets/images/illustrations/onboarding3.png"
echo ""
echo "Note: Replace these with your actual app images before release!"
