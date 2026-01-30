#!/bin/bash
# Install script to make 'filetree' command available globally

echo "🔧 Installing filetree command globally..."

# Create the bin directory if it doesn't exist
mkdir -p /usr/local/bin

# Create a symlink to the filetree script
ln -sf "/Users/aryan/Desktop/filetree/index.js" "/usr/local/bin/filetree"

echo "✅ Done! Run 'filetree' from anywhere to see a live file tree."
echo "   You can also run 'filetree /path/to/directory' to view a specific folder."
