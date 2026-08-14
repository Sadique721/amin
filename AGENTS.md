# AGENTS.md — Antigravity & OmniRoute Local AI Engine Directives

## System Overview
This project is connected with OmniRoute local AI proxy and Ollama inference engine for zero-cost, local-first pair programming.

## Endpoints & Ports
- **OmniRoute Proxy:** `http://localhost:20128/v1` (OpenAI Compatible)
- **Ollama Engine:** `http://localhost:11434/v1` (On-Device GGUF)

## Active Models
- `ollama-local/qwen2.5:7b-instruct`: Primary Coding Model
- `ollama-local/deepseek-r1:7b`: Complex Reasoning & Logic
- `ollama-local/qwen2.5:0.5b`: Ultra-fast Single-word / Syntax Check
- `auto/best-coding` / `auto/best-reasoning`: Cloud Fallback Combos
