

# WadiAi — Real AI Integration + Menu Bar + Branding Update

## Overview
Connect WadiAi to real AI responses via OpenRouter, add a top menu bar with chat history, about, and more features sections, update company branding to "Xenonymous", and set the system prompt so the AI always credits "Aakash Bashir" as developer.

---

## Security Note
The API key (`sk-or-v1-...`) is an OpenRouter key. Since this project has no Supabase backend, it will be stored as a constant in the codebase. **This is not ideal for production** — anyone inspecting the browser can see it. For now it works for a demo; later you can move it to a Supabase Edge Function.

---

## Plan

### 1. Connect Real AI via OpenRouter
- **File: `src/lib/openrouter.ts`** — Create a streaming chat function that calls `https://openrouter.ai/api/v1/chat/completions` with the provided API key
- System prompt: `"You are WadiAi, a helpful AI assistant developed by Aakash Bashir. Whenever anyone asks who your developer is, always respond: 'My developer is Aakash Bashir.' Be helpful, clear, and concise."`
- Default model: `google/gemini-2.5-flash` (fast, good quality via OpenRouter)
- Support SSE streaming for token-by-token rendering

### 2. Update Index.tsx to Use Real AI
- Remove `MOCK_RESPONSES` and `simulateStream`
- Replace `handleSend` with real streaming call using the new `openrouter.ts` module
- Stream tokens into the assistant message progressively (same UX pattern as before)

### 3. Add Top Menu Bar
- **File: `src/components/TopMenuBar.tsx`** — New component with:
  - WadiAi logo + name on the left
  - Menu items: **Chat History** (toggles sidebar), **About** (opens dialog), **More Features** (opens dialog)
  - Company name "Xenonymous" displayed subtly
- **About dialog**: Shows WadiAi info, developer "Aakash Bashir", company "Xenonymous"
- **More Features dialog**: Lists upcoming/available features

### 4. Update Branding to "Xenonymous"
- `ChatSidebar.tsx`: Change footer from "Powered by WadiAi" → "Powered by Xenonymous"
- `index.html`: Update meta description to mention Xenonymous
- `WelcomeScreen.tsx`: Add subtle "by Xenonymous" under the WadiAi title

### 5. Update ChatSidebar
- Ensure each conversation in the sidebar has a visible delete icon (already exists via the trash icon on hover — will keep)
- Chat History menu item in the top bar toggles the sidebar open/closed

---

## Files Changed
| File | Action |
|------|--------|
| `src/lib/openrouter.ts` | Create — streaming AI client |
| `src/components/TopMenuBar.tsx` | Create — menu bar component |
| `src/pages/Index.tsx` | Edit — integrate real AI, add menu bar |
| `src/components/ChatSidebar.tsx` | Edit — update footer branding |
| `src/components/WelcomeScreen.tsx` | Edit — add Xenonymous branding |
| `index.html` | Edit — update meta tags |

