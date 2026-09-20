Markdown
# AgriSense

AgriSense is a demo web application for **small and marginal farmers in India**: a smart crop advisory cockpit with weather intelligence, irrigation planning, cost and ROI modelling, pest screening from leaf photos, and **Google Gemini**–powered advisory text.

## Tech stack

- **Frontend:** React 19, Vite 8, Tailwind CSS v4, Framer Motion, Recharts, Lucide React, react-hot-toast, jsPDF + html2canvas
- **Backend:** Node.js, Express (API routing and backend services)
- **Database:** MongoDB (via Mongoose/native driver) for persistent storage
- **AI:** Google **Gemini** via `src/utils/ai.js` (`VITE_GEMINI_API_KEY`)
- **Weather:** [Open-Meteo](https://open-meteo.com/) (no API key)
- **PWA:** `public/manifest.json` + `public/sw.js` (shell cache; Gemini requests are not cached by the demo SW)

## Prerequisites

- Node.js 20+ recommended
- **MongoDB** (Local instance running on port 27017 or a free MongoDB Atlas URI)
- A **Google Gemini API key** (`VITE_GEMINI_API_KEY`) for advisories, leaf analysis, irrigation tips, cost suggestions, and weather-impact copy

## Setup

1. **Install dependencies**

   ```bash
   cd agrisense
   npm install
Environment variables

Copy .env.example to .env in the project root and configure your API key and database connection:

Code snippet
VITE_GEMINI_API_KEY=your_key_here
MONGO_URI=mongodb://localhost:27017/agrisense
(Note: If using MongoDB Atlas, replace the local URI with your cloud connection string).

Run in development

Starts both the Vite frontend and the Express backend concurrently:

Bash
npm run dev
Open http://localhost:5173. The backend server runs simultaneously (typically on port 5000).

Production build

Bash
npm run build
npm run preview
Feature map
Area	Route	Notes
Landing	/	Hero field canvas, stats, feature cards, testimonials, i18n + theme controls
Onboarding	/onboarding	Four-step profile configuration
Dashboard	/dashboard	Weather cards, health ring, advisory feed (Gemini), 7-day chart, growth timeline
Pest detection	/pest-detection	Leaf upload → Gemini vision JSON → timeline + treatment cards; history
Weather	/weather	Open-Meteo charts + Gemini farming-impact bullets
Irrigation	/irrigation	Heuristic next window, simulated moisture curve, Gemini tip, log table
Cost calculator	/cost	Live totals, ROI, pie chart, Gemini value-engineering tips, PDF card export
Reports	/reports	Season summary, lists, bar chart, PDF export
Privacy	/privacy	Data usage and storage explanations
Demo mode: A top banner explains that a sample profile (Ramesh Patil, Pune, tomato) backs incomplete profiles; weather uses Pune coordinates by default.

Ethics: First visit shows a consent modal for data handling.
Accessibility: Theme, language, font size, ARIA on key controls, icon + text on navigation.

Multilingual UI
Strings live in src/utils/translations.js (English, Marathi, Hindi). The navbar language selector state persists across sessions.

Scripts
Command	Purpose
npm run dev	Runs both frontend and backend concurrently
npm run dev:frontend	Starts only the Vite development server
npm run dev:backend	Starts only the Node/Express backend with Nodemon
npm run build	Production client build to dist/
npm run preview	Preview production build
npm run lint	Run ESLint across the codebase
Licence
Demo / educational use. Always validate agrochemical advice with local extension services and product labels.