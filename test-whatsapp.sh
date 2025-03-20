#!/bin/bash

# Test WhatsApp Script
# This script runs the WhatsApp test to verify that the service is working correctly

echo "Running WhatsApp test..."

# Run the test script with Node.js
node -r ts-node/register -r tsconfig-paths/register ./src/scripts/test-whatsapp.js

# Check the exit code
if [ $? -eq 0 ]; then
  echo "Test completed successfully!"
else
  echo "Test failed. Check the logs for details."
fi
