#!/bin/bash
set -e

echo "Installing dependencies..."
pip install --no-cache-dir -r requirements.txt

echo "Starting uvicorn server..."
python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
