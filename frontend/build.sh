#!/bin/bash
set -e

# Install dependencies
npm install --production=false

# Run the build using node directly
node ./node_modules/vite/bin/vite.js build 