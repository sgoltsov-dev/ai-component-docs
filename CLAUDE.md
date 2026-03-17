# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development

This is a Figma plugin — there is no build step, no package manager, and no test runner. The files are loaded directly by Figma.

To develop:
1. Open Figma Desktop
2. Go to **Plugins → Development → Import plugin from manifest...**
3. Select `manifest.json`
4. Edit `code.js` or `ui.html`, then re-run the plugin from **Plugins → Development → Component Readme Generator**

## Critical constraints

The Figma plugin sandbox uses an old JS engine. Before every edit, check `code.js` and `ui.html` for these patterns.

**Never use:**
- Optional chaining: `?.`
- Nullish coalescing: `??`
- Arrow functions: `=>`
- Template literals: `` ` ``

**Always use instead:**
- Regular functions: `function() {}`
- Ternary operators: `x ? x : y`
- String concatenation: `"Hello " + name`

## Architecture

The plugin follows the standard Figma two-process model:

- **`code.js`** — runs in the Figma sandbox (has access to the Figma API, no DOM, no `fetch`). Reads the selected ComponentSet, builds the readme frame on canvas, and persists the API key via `figma.clientStorage`.
- **`ui.html`** — runs in an iframe (has DOM and `fetch`, no Figma API access). Contains all UI and makes the Claude API call directly from the browser context (requires the `anthropic-dangerous-direct-browser-access` header).

Communication between the two processes is via `figma.ui.postMessage` (sandbox → UI) and `parent.postMessage({ pluginMessage: ... }, "*")` (UI → sandbox).

### Message flow

1. UI sends `GET_COMPONENT` → sandbox reads selection, replies with `COMPONENT_DATA` (variants + booleans)
2. UI calls Claude API (`generateDescriptions()` in `ui.html`) with the component structure
3. UI sends `BUILD_README` with the JSON descriptions → sandbox builds the frame via `buildReadme()`
4. Sandbox replies `DONE` or `ERROR`

### Readme frame structure

`buildReadme()` creates a vertical auto-layout frame named `<ComponentName> / Readme` placed 80px to the right of the ComponentSet. It has sections for: States, Value, Trailing, and Boolean options — each rendered as two-column rows of cards (label + description + live component instance).

The plugin currently handles three hardcoded variant property names: `State`, `Value`, and `Trailing`. Boolean properties are handled generically.

### Claude API usage

The prompt is built in `generateDescriptions()` inside `ui.html`. The model is `claude-haiku-4-5-20251001`. The prompt requests a specific JSON schema with `componentDescription`, `states`, `values`, `trailing`, and `booleans` keys. To customize tone or format, edit `userPrompt` in that function.

The API key is stored in `figma.clientStorage` (persisted per-user in Figma's local storage) and loaded on plugin startup.
