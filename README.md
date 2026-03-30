# AlgoArena

Battle AI robots by solving coding challenges! Learn Python, JavaScript, Java, and more in an epic arena game where your code is your weapon.

## Tech Stack

- **Vite** — lightning-fast dev server and build tool
- **React 18** — UI library
- **TypeScript** — type-safe JavaScript
- **Tailwind CSS** — utility-first styling
- **shadcn/ui** — accessible UI components
- **Supabase** — backend, database, and auth
- **Framer Motion** — animations
- **React Query** — server state management

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/algoarena.git
cd algoarena

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your Supabase and Gemini API keys in .env

# Start the dev server
npm run dev
```

The app will be running at http://localhost:8080

## Environment Variables

Create a `.env` file in the root with the following:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

For the AI challenge generator (Supabase edge function), set the Gemini key via:

```bash
supabase secrets set GEMINI_API_KEY=your_gemini_api_key
```

## Available Scripts

- `npm run dev` — Start development server at localhost:8080
- `npm run build` — Build for production into dist/
- `npm run preview` — Preview the production build locally
- `npm run lint` — Run ESLint to check for code issues
- `npm test` — Run unit tests with Vitest

## Project Structure

```
algoarena/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Route-level page components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities and helpers
│   └── main.tsx       # App entry point
├── supabase/
│   └── functions/     # Edge functions (AI challenge generator)
├── public/            # Static assets
└── index.html         # HTML entry point
```

## License

MIT
