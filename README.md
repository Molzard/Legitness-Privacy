# Legitness Privacy

**Modular privacy & redaction toolkit for web browsers.**

Legitness Privacy is a Chrome extension that selectively blurs, censors, and replaces sensitive information across AI chat platforms and social media. Protect your privacy when screen-sharing, recording, or using your browser in public.

---

## Supported Platforms

| Platform | Status | Features |
|----------|--------|----------|
| **Instagram** | Active | DM preview sensor, profile photo blur, notes blur, nickname popup sensor |
| **Gemini** | Active | Chat history blur, profile sensor, active chat control, hover reveal |
| **ChatGPT** | Active | Chat history blur, profile sensor, active chat control, hover reveal |
| **Claude** | Active | Chat history blur, profile sensor, active chat control, hover reveal, greeting sensor |

---

## Features

### Universal

- **Master Toggle** — Enable/disable all protections per site
- **Zero Flash** — CSS-first approach ensures no sensitive content is visible even for a single frame during page load
- **Instant Response** — MutationObserver with zero-debounce ensures new content is protected immediately
- **Bilingual Support** — Works regardless of site language (English, Indonesian, etc.)
- **Per-Site Settings** — Each platform has independent configuration, saved via `chrome.storage.sync`

### Chat Platforms (Gemini, ChatGPT, Claude)

- **Chat History Blur** — Blurs all conversation titles in the sidebar
- **Active Chat Control** — Option to keep the currently open chat visible while blurring the rest
- **Hover to Reveal** — Hover over any blurred chat title to temporarily un-blur it
- **Profile Photo Blur** — Blurs your account avatar
- **Account Name Sensor** — Replace your name with "Legitness" or blur it entirely (mutually exclusive)
- **Account Tier Blur** — Blurs subscription level (Free, Plus, Pro, etc.)
- **Upgrade Button Blur** (ChatGPT) — Blurs the upgrade prompt
- **Greeting Sensor** (Claude, Gemini) — Blurs or replaces your name in the welcome greeting

### Instagram

- **DM Preview Sensor** — Blurs sender names in "sent an attachment/message" previews
- **Profile Photo Blur** — Blurs avatars in DM list, notes, note popups, info bar, and nickname cards
- **Note Content Blur** — Blurs note text and music titles (skips music notes automatically via `<audio>` detection)
- **Own Content Exclusion** — Your own note card, nickname card, and DM profile are excluded from blur
- **Grayscale Mode** — Optional black-and-white filter for profile photos

---

## Installation

### From Source (Developer Mode)

1. Clone this repository:

```bash
git clone https://github.com/molzrd/legitness-privacy.git
```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable **Developer mode** (toggle in top-right corner)

4. Click **Load unpacked** and select the cloned directory

5. The extension icon will appear in your toolbar

---

## Usage

1. Navigate to any supported website (Instagram, Gemini, ChatGPT, or Claude)

2. Click the **Legitness Privacy** icon in your browser toolbar

3. Toggle the **Master** switch to activate protections

4. Configure individual sensors using the toggle switches

5. Settings are saved automatically and persist across browser sessions

---

## Project Structure

```
legitness-privacy/
├── manifest.json          # Chrome extension manifest (MV3)
├── config.js              # Site configurations, rules, selectors
├── effects.js             # Visual effect engine (blur, grayscale, blackout)
├── engine.js              # Core runtime: CSS injection, JS handlers, MutationObserver
├── popup.html             # Extension popup UI (HTML + CSS)
├── popup.js               # Popup controller (settings management, rendering)
└── README.md
```

### Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  config.js  │────▶│  engine.js  │────▶│    Page DOM  │
│  (rules)    │     │  (runtime)  │     │  (injected)  │
└─────────────┘     └─────────────┘     └─────────────┘
                           ▲
                    ┌──────┴──────┐
                    │  effects.js │
                    │  (compose)  │
                    └─────────────┘

┌─────────────┐     ┌─────────────┐
│  popup.html │────▶│  popup.js   │◀──▶ chrome.storage.sync
│  (UI)       │     │  (controls) │
└─────────────┘     └─────────────┘
```

**config.js** — Declarative site definitions. Each site contains:
- `rules` — CSS selector-based blur targets with visual effects
- `options` — Additional modifiers (e.g., grayscale) linked to rules
- `jsRules` — Dynamic JavaScript handlers for complex scenarios

**engine.js** — Runs on every supported page:
- Generates and injects CSS from rules (instant, no flash)
- Executes JS handlers for dynamic content (DM previews, name replacement, active chat detection)
- Uses MutationObserver for SPAs (Instagram, Gemini, ChatGPT, Claude)

**effects.js** — Composes visual effects into CSS filter strings

**popup.js** — Manages the settings UI:
- Renders per-site toggle panels with grouped rules
- Handles mutex logic (e.g., "Replace Name" vs "Blur Name")
- Syncs settings to `chrome.storage.sync`

---

## Adding a New Site

1. Add the site URL to `manifest.json` under `host_permissions` and `content_scripts.matches`

2. Add a new entry in `config.js` under `sites`:

```javascript
newsite: {
    name: 'Site Name',
    icon: 'https://example.com/favicon.ico',
    domain: 'example.com',
    rules: [
        {
            id: 'chatTitle',
            label: 'Sensor Judul Chat',
            default: true,
            effects: [{ type: 'blur', amount: '12px' }],
            selectors: ['.sidebar-title']
        }
    ],
    options: [],
    jsRules: []
}
```

3. If the site needs dynamic handling, add a handler in `engine.js`:

```javascript
HANDLERS.newsite = {};
HANDLERS.newsite.someAction = function(enabled) {
    // Your logic here
};
```

No changes needed to `popup.js` — it renders automatically from the config.

---

## Privacy

- **No data collection** — The extension does not transmit any data externally
- **No analytics** — No tracking scripts or telemetry
- **Local storage only** — Settings are stored via Chrome's built-in `chrome.storage.sync`
- **No network requests** — All processing happens locally in the browser

---

## Technical Notes

- **CSS-first approach** — Visual effects (blur, grayscale) are applied via CSS selectors injected into a `<style>` element. This ensures zero-delay application with no visible flash.
- **Inline style override** — For "own card" exclusions, inline `style="filter: none !important"` overrides CSS rules (inline + `!important` has the highest specificity).
- **Hover reveal** — Uses `:hover` pseudo-class with higher specificity than the base blur rule, ensuring smooth toggle without JavaScript events.
- **Mutex switches** — "Replace Name" and "Blur Name" are mutually exclusive. Turning one on automatically turns the other off. Turning one off forces the other on (one must always be active when the parent is enabled).

---

## Credits

**Legitness Privacy** — *Got Blurred*
by Gwen Stecu

---

## License

This project is provided as-is for personal use. Not affiliated with Instagram, Google, OpenAI, or Anthropic.
```
