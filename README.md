# AI Chat Interface

An advanced chat interface built with Next.js, shadcn/ui, and Supabase, featuring conversation branching and real-time updates.

## Features

### UI Components
- **Chat History List**: Grouped message bubbles with timestamps and auto-scroll
- **Message Composer**: Multiline textarea with keyboard shortcuts
- **Branch Selection**: View and select different conversation branches
- **Session Navigation**: Sidebar to manage multiple chat sessions
- **Typing Indicator**: Visual feedback when AI is responding
- **Responsive Design**: Works seamlessly on mobile and desktop

### UX Features
- **Optimistic UI Updates**: Messages appear immediately before server confirmation
- **Loading Skeletons**: Smooth loading experience
- **Error Toasts**: User-friendly error notifications
- **Keyboard Shortcuts**:
  - `Enter`: Send message
  - `Shift + Enter`: New line in message
  - `⌘/Ctrl + K`: Create new chat
  - `⌘/Ctrl + N`: Create new session
- **Real-time Updates**: Live message synchronization via Supabase channels

### Database Schema
The application uses three main tables:
- **sessions**: Chat sessions with title and timestamps
- **branches**: Conversation branches within sessions
- **messages**: Individual messages with role (user/assistant/system)

## Getting Started

### Prerequisites
- Node.js 18+ installed
- A Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   Then edit `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Set up the database:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL in `supabase-schema.sql`

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with Toaster
│   ├── page.tsx            # Main page with ChatInterface
│   └── globals.css         # Global styles
├── components/
│   ├── chat/
│   │   ├── chat-interface.tsx       # Main chat interface
│   │   ├── chat-history-list.tsx    # Message list with auto-scroll
│   │   ├── message-bubble.tsx       # Individual message component
│   │   ├── message-composer.tsx     # Input area with send button
│   │   ├── session-sidebar.tsx      # Session navigation
│   │   ├── branch-selector.tsx      # Branch selection dropdown
│   │   └── typing-indicator.tsx     # AI typing animation
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── hooks/
│   │   ├── use-chat.ts              # Main chat logic hook
│   │   └── use-keyboard-shortcuts.ts # Keyboard shortcuts hook
│   ├── supabase/
│   │   ├── client.ts                # Supabase client setup
│   │   └── types.ts                 # Database type definitions
│   └── utils.ts            # Utility functions
└── supabase-schema.sql     # Database schema
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Styling**: Tailwind CSS
- **Date Formatting**: date-fns
- **Icons**: lucide-react
- **Notifications**: sonner

## Customization

### Connecting Your AI API

The chat interface includes a placeholder for AI responses. To connect your own AI API:

1. Open `lib/hooks/use-chat.ts`
2. Find the `sendMessage` function
3. Replace the placeholder response logic with your AI API call:

```typescript
// Replace this section:
const assistantMessage: Message = {
  // ...
  content: 'This is a placeholder response. Connect your AI API here.',
  // ...
}

// With your API call:
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ message: content }),
})
const data = await response.json()
const assistantMessage: Message = {
  // ...
  content: data.response,
  // ...
}
```

### Styling

The UI uses shadcn/ui components which are built on Tailwind CSS. You can customize:

- **Colors**: Edit `app/globals.css` CSS variables
- **Components**: Modify files in `components/ui/`
- **Theme**: Change the base color in `components.json`

## Development

### Running Tests
```bash
npm test
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Building for Production
```bash
npm run build
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
