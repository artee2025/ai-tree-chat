# Setup Guide

This guide will help you set up the AI Chat Interface application for local development.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.x or higher
- npm or yarn
- A Supabase account (free tier works)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized
3. Go to Project Settings > API
4. Copy your project URL and anon/public key

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 4. Set Up Database Schema

1. In your Supabase project, navigate to the SQL Editor
2. Open the `supabase-schema.sql` file from this repository
3. Copy the entire contents
4. Paste it into the SQL Editor
5. Click "Run" to execute the SQL

This will create:
- `sessions` table for chat sessions
- `branches` table for conversation branches
- `messages` table for all chat messages
- Necessary indexes for performance
- Row Level Security policies
- Triggers for automatic timestamp updates

### 5. Verify Database Setup

In the Supabase dashboard:
1. Go to Table Editor
2. You should see three tables: `sessions`, `branches`, and `messages`
3. Check that all columns are created correctly

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Test the Application

1. The app should automatically create a new session on first load
2. Type a message and press Enter or click Send
3. You should see your message appear immediately (optimistic update)
4. The AI will respond with a placeholder message
5. Try the keyboard shortcuts:
   - `⌘/Ctrl + K`: Create new chat
   - `⌘/Ctrl + N`: Create new session
   - `Enter`: Send message
   - `Shift + Enter`: New line

## Troubleshooting

### Issue: "Failed to load sessions" error

**Solution:**
- Check that your Supabase URL and anon key are correct in `.env.local`
- Verify that the database schema has been set up correctly
- Check the browser console for detailed error messages

### Issue: Messages not appearing

**Solution:**
- Check that the `messages` table exists in Supabase
- Verify RLS policies are set up correctly
- Check the Network tab in browser DevTools for failed requests

### Issue: Real-time updates not working

**Solution:**
- Ensure your Supabase project has real-time enabled (it's on by default)
- Check that you're using the correct table names in subscriptions
- Verify there are no network/firewall issues blocking WebSocket connections

### Issue: TypeScript errors

**Solution:**
- Run `npm install` to ensure all dependencies are installed
- Delete `.next` folder and restart dev server: `rm -rf .next && npm run dev`
- Check that `lib/supabase/types.ts` matches your actual database schema

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Next Steps

### Connect Your AI API

The application currently uses placeholder responses. To connect a real AI:

1. Create an API route at `app/api/chat/route.ts`
2. Update `lib/hooks/use-chat.ts` to call your API
3. See the README for detailed instructions

### Customize Styling

- Edit CSS variables in `app/globals.css`
- Modify component styles in `components/ui/`
- Change theme colors in `components.json`

### Add Authentication

To add user authentication:
1. Set up Supabase Auth in your project
2. Update RLS policies to filter by `auth.uid()`
3. Add login/signup components
4. Update the chat hook to use authenticated users

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Need Help?

If you encounter issues not covered here:
1. Check the browser console for errors
2. Review Supabase logs in the dashboard
3. Ensure all environment variables are set correctly
4. Verify database schema matches the provided SQL file
