# AgriSense

AgriSense is a demo web application for **small and marginal farmers in India**: a smart crop advisory cockpit with weather intelligence, irrigation planning, cost and ROI modelling, pest screening from leaf photos, and **Google Gemini**–powered advisory text (client-side API calls).

## Tech stack

- **Frontend:** React 19, Vite 8, Tailwind CSS v4, Framer Motion, Recharts, Lucide React, react-hot-toast, jsPDF + html2canvas
- **AI:** Google **Gemini** via `src/utils/ai.js` (`VITE_GEMINI_API_KEY`)
- **Weather:** [Open-Meteo](https://open-meteo.com/) (no API key)
- **Storage (demo):** `localStorage` for profile, advisories, pest history, irrigation log
- **PWA:** `public/manifest.json` + `public/sw.js` (shell cache; Gemini requests are not cached by the demo SW)

## Prerequisites

- Node.js 20+ recommended
- A **Google Gemini API key** (`VITE_GEMINI_API_KEY`) for advisories, leaf analysis, irrigation tips, cost suggestions, and weather-impact copy

## Setup

1. **Install dependencies**

   ```bash
   cd agrisense
   npm install
   ```

2. **Environment variables**

   Copy `.env.example` to `.env` in the project root and set:

   ```env
   VITE_GEMINI_API_KEY=your_key_here
   ```

3. **Run in development**

   ```bash
   npm run dev
   ```

   Open `http://localhost:5173`. If the key is missing, Gemini calls will fail at runtime (the UI still renders).

4. **Production build**

   ```bash
   npm run build
   npm run preview
   ```

   Gemini is called from the browser; protect your key appropriately for production (e.g. a small backend proxy) — this demo uses Vite env for simplicity.

## Feature map

| Area | Route | Notes |
|------|--------|--------|
| Landing | `/` | Hero field canvas, stats, feature cards, testimonials, i18n + theme controls |
| Onboarding | `/onboarding` | Four-step profile saved to `localStorage` |
| Dashboard | `/dashboard` | Weather cards, health ring, advisory feed (Gemini), 7-day chart, growth timeline |
| Pest detection | `/pest-detection` | Leaf upload → Gemini vision JSON → timeline + treatment cards; history (5) |
| Weather | `/weather` | Open-Meteo charts + Gemini farming-impact bullets |
| Irrigation | `/irrigation` | Heuristic next window, simulated moisture curve, Gemini tip, log table |
| Cost calculator | `/cost` | Live totals, ROI, pie chart, Gemini value-engineering tips, PDF card export |
| Reports | `/reports` | Season summary, lists, bar chart, PDF export |
| Privacy | `/privacy` | Data usage for the demo |

**Demo mode:** A top banner explains that a sample profile (Ramesh Patil, Pune, tomato) backs incomplete profiles; weather uses **Pune coordinates** by default.

**Ethics:** First visit shows a consent modal (local-only storage in this build). **Accessibility:** theme, language, font size, ARIA on key controls, icon + text on navigation.

## Multilingual UI

Strings live in `src/utils/translations.js` (English, Marathi, Hindi). The navbar language selector persists to `localStorage`.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production client build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

## Licence

Demo / educational use. Always validate agrrochemical advice with local extension services and product labels.
