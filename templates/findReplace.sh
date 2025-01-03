#!/bin/bash

# Function to display usage
usage() {
    echo "Usage: $0 <pattern> <replacement>"
    echo "Example: $0 'old_text' 'new_text'"
    exit 1
}

# Check if both arguments are provided
if [ $# -ne 2 ]; then
    usage
fi

# Assign arguments to variables
PATTERN=$1
REPLACEMENT=$2

# Confirm the action with the user
echo "This will replace all occurrences of '$PATTERN' with '$REPLACEMENT' in the current directory and subdirectories."
read -p "Are you sure you want to proceed? (yes/no): " CONFIRM

if [[ "$CONFIRM" != "yes" ]]; then
    echo "Operation canceled."
    exit 0
fi

# Use find and sed to process files
find . -type f -exec sed -i "s/${PATTERN}/${REPLACEMENT}/g" {} +

# Inform the user that the operation is complete
echo "Replacement completed."

