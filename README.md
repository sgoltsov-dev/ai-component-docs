# AI Component Docs — Figma Plugin

Automatically builds a readme frame for your components. Reads variants and boolean properties, sends them to an AI model, and places a styled frame with descriptions and live instances right next to your component.

## Install

1. Download this repo as a ZIP (green **Code** button → **Download ZIP**)
2. Unzip it anywhere on your computer
3. Open **Figma Desktop**
4. Go to **Plugins → Development → Import plugin from manifest...**
5. Select `plugin/manifest.json` from the unzipped folder

To update: download the ZIP again and replace the old folder.

## How to use

1. Select a Component Set on the canvas
2. Open the plugin — it reads the selected component automatically
3. Pick an AI provider and paste your API key
4. Choose a language for descriptions
5. Click **Generate**

The plugin creates a `<ComponentName> / Readme` frame next to your component.

## AI providers

| Provider | Model | Get your key |
|---|---|---|
| Grok | grok-3-mini | [console.x.ai](https://console.x.ai) |
| Claude | claude-sonnet | [console.anthropic.com](https://console.anthropic.com) |
| OpenAI | gpt-4.1-mini | [platform.openai.com](https://platform.openai.com) |
| Gemini | gemini-2.0-flash-lite | [aistudio.google.com](https://aistudio.google.com) |
| DeepSeek | deepseek-chat | [platform.deepseek.com](https://platform.deepseek.com) |

Keys are stored locally on your computer. Nothing is shared.

## Requirements

- Figma Desktop
- A Component Set with Variant and/or Boolean properties
- An API key for any supported provider
