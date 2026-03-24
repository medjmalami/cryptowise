#!/bin/bash

MODEL=${OLLAMA_MODEL:-qwen2.5:3b}

echo "Starting Ollama..."
ollama serve &
OLLAMA_PID=$!

echo "Waiting for Ollama to be ready..."
until curl -s http://localhost:11434 > /dev/null 2>&1; do
  sleep 1
done

echo "Pulling model $MODEL if not present..."
ollama pull $MODEL

echo "Ollama is ready. Model: $MODEL"
echo "API available at http://localhost:11434"

wait $OLLAMA_PID