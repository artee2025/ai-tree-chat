# AI Tree Chat

Interactive AI-powered chat application built with Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn UI, and Supabase.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with CSS Variables for theming
- **UI Components**: shadcn UI built on Radix UI primitives
- **Backend**: Supabase (PostgreSQL + Authentication)
- **Code Quality**: ESLint and Prettier
- **Icons**: Lucide React
- **Package Manager**: npm

## Features

- ✅ Next.js 14 with App Router
- ✅ TypeScript for type safety
- ✅ Responsive design with Tailwind CSS
- ✅ Pre-built shadcn UI components (Button, Input, Textarea, Sheet, Tabs, ScrollArea)
- ✅ Dark mode support with theme switching
- ✅ Supabase integration for backend services
- ✅ ESLint and Prettier configuration
- ✅ Modern font loading with Inter
- ✅ Smooth animations and transitions
- ✅ Optimized for Vercel deployment

## Project Structure

```
project/
├── src/
│   ├── app/                          # Next.js app directory
│   │   ├── layout.tsx               # Root layout with metadata
│   │   ├── page.tsx                 # Home page
│   │   └── globals.css              # Global styles and theme variables
│   ├── components/
│   │   └── ui/                      # shadcn UI components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── textarea.tsx
│   │       ├── dialog.tsx
│   │       ├── sheet.tsx
│   │       ├── tabs.tsx
│   │       └── scroll-area.tsx
│   ├── lib/
│   │   ├── utils.ts                 # Utility functions (cn helper)
│   │   └── supabase/
│   │       ├── server.ts            # Supabase client for server components
│   │       └── client.ts            # Supabase client for client components
│   ├── hooks/                       # Custom React hooks
│   └── utils/                       # Utility functions
├── public/                          # Static assets
├── .eslintrc.json                   # ESLint configuration
├── .prettierrc.json                 # Prettier configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
├── next.config.js                   # Next.js configuration
├── postcss.config.mjs               # PostCSS configuration
├── components.json                  # shadcn configuration
├── .env.example                     # Environment variables template
└── package.json                     # Project dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for backend integration)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd project
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your configuration:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
OPENROUTER_API_KEY=your-openrouter-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Environment Configuration

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from project settings
3. Add them to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### API Keys

Add your API keys to `.env.local`:

- `OPENROUTER_API_KEY` - For OpenRouter API access
- `OPENAI_API_KEY` - For OpenAI API access

## Theme System

The application uses CSS variables for theming, supporting both light and dark modes:

- Located in `src/app/globals.css`
- Light mode variables are in `:root`
- Dark mode variables are in `.dark`
- Easily customizable by modifying the CSS variables

### Available Color Variables

- `--background` / `--foreground`
- `--primary` / `--primary-foreground`
- `--secondary` / `--secondary-foreground`
- `--destructive` / `--destructive-foreground`
- `--muted` / `--muted-foreground`
- `--accent` / `--accent-foreground`
- `--card` / `--card-foreground`
- `--popover` / `--popover-foreground`
- `--border`, `--input`, `--ring`

## Components

### Pre-built UI Components

All components are built on Radix UI primitives for accessibility:

- **Button** - Primary, secondary, outline, ghost, and link variants
- **Input** - Text input with Tailwind styling
- **Textarea** - Multi-line text input
- **Dialog** - Modal dialog component
- **Sheet** - Sliding panel from any side
- **Tabs** - Tab navigation component
- **ScrollArea** - Custom scrollable area

### Usage Example

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Example() {
  return (
    <div className="space-y-4">
      <Input placeholder="Enter your message..." />
      <Button>Send</Button>
    </div>
  );
}
```

## Supabase Integration

### Server Component Usage

```tsx
import { supabase } from "@/lib/supabase/server";

export default async function Example() {
  const { data } = await supabase.from("table_name").select();
  return <div>{/* Use data */}</div>;
}
```

### Client Component Usage

```tsx
"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function Example() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabaseClient.from("table_name").select();
      setData(data || []);
    }
    fetchData();
  }, []);

  return <div>{/* Use data */}</div>;
}
```

## Deployment

### Vercel Deployment

This project is optimized for Vercel deployment:

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel project settings
4. Deploy automatically on push

The `next.config.js` is pre-configured for optimal Vercel performance.

## Development Workflow

1. Create feature branches from `main`
2. Run `npm run lint` before committing
3. Use `npm run format` to ensure code consistency
4. Build locally with `npm run build` to verify
5. Create pull requests for review

## TypeScript

The project is fully typed with TypeScript for type safety. The `tsconfig.json` includes:

- Path aliases for cleaner imports (`@/*`)
- Strict type checking
- JSX support for React
- Modern ES2020 target

## Code Quality

### ESLint

ESLint is configured with Next.js recommended rules. Run linting:

```bash
npm run lint
```

### Prettier

Prettier is configured for consistent code formatting. Format your code:

```bash
npm run format
```

## Performance Optimizations

- Image optimization with Next.js Image component
- Code splitting with Next.js App Router
- Optimized package imports with Tailwind CSS
- CSS variables for efficient theming
- Font loading optimization with `next/font`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC

## Support

For issues and questions, please use the GitHub Issues page.

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn UI Documentation](https://ui.shadcn.com)
- [Radix UI Documentation](https://www.radix-ui.com)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
