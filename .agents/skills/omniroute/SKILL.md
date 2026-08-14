---
name: omniroute
description: Interface with, manage, and route LLM calls through OmniRoute (local AI proxy server and MCP provider).
---

# OmniRoute Integration & Management Skill for Antigravity

OmniRoute is a unified local AI proxy server, model router, and MCP tool provider running on `http://localhost:20128`.

## Core Configuration & Endpoints
- **Base URL**: `http://localhost:20128`
- **OpenAI Compatible Endpoint**: `http://localhost:20128/v1/chat/completions`
- **Models Endpoint**: `http://localhost:20128/v1/models`
- **Anthropic Compatible Endpoint**: `http://localhost:20128/v1/messages`
- **Environment File**: `C:\Users\MD SADIQUE AMIN\.omniroute\.env`
- **Data Directory**: `C:\Users\MD SADIQUE AMIN\.omniroute`

## CLI Commands Reference
- `omniroute doctor`: Validate database health, encryption, port, and dependencies.
- `omniroute status`: Show active OmniRoute server status.
- `omniroute serve --port 20128 --no-open`: Launch OmniRoute background server.
- `omniroute providers list`: List configured provider connections.
- `omniroute models`: List all available upstream and combo models.
- `omniroute repair`: Repair native binaries (`better-sqlite3`).
- `omniroute mcp status`: Inspect MCP server status.

## Model Combos & Routing
- `ollama-local/qwen2.5:7b-instruct`: Primary local coding model.
- `ollama-local/deepseek-r1:7b`: Local deep reasoning & architecture model.
- `ollama-local/qwen2.5:0.5b`: Ultra-fast syntax & single-word parser.
- `auto/coding:free` / `auto/best-coding`: Free high-performance coding model combo.
- `auto/reasoning` / `auto/best-reasoning`: Reasoning model combo.
- `auto/best-fast`: Low latency cloud stream fallback.

## Server Autostart Script
- PowerShell script: `C:\Users\MD SADIQUE AMIN\.omniroute\Start-OmniRoute.ps1`
- Batch script: `C:\Users\MD SADIQUE AMIN\.omniroute\start-omniroute.bat`
