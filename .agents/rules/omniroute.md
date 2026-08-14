# OmniRoute Local AI Router Rules & Directives for Antigravity

## System Topology & Endpoints
- **OmniRoute Core Proxy:** `http://localhost:20128/v1`
- **Ollama Engine:** `http://localhost:11434/v1`
- **MCP Provider:** Configured in `mcp_config.json` via `omniroute mcp`

## Preferred Model Selection
1. **Coding & Refactoring:** Use `ollama-local/qwen2.5:7b-instruct` or fallback to `auto/best-coding`
2. **Deep Reasoning & Architecture:** Use `ollama-local/deepseek-r1:7b` or fallback to `auto/best-reasoning`
3. **Low-Latency Checks:** Use `ollama-local/qwen2.5:0.5b` or `auto/best-fast`

## Recovery & Server Control
- OmniRoute start script: `C:\Users\MD SADIQUE AMIN\.omniroute\Start-OmniRoute.ps1`
- Ollama daemon start: `Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden`
