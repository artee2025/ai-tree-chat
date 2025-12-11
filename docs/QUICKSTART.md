# Quick Start Guide

Get your AI tree chat database up and running in minutes!

## Prerequisites

- Node.js 18+ and npm
- Docker (for Supabase local development)

## 5-Minute Setup

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `@supabase/supabase-js` - JavaScript client
- `supabase` - CLI tool
- `typescript` - For type generation

### 2. Start Supabase

```bash
npm run db:start
```

This starts all Supabase services in Docker containers. First run will take a few minutes to download images.

**Expected Output:**
```
Started supabase local development setup.

         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGc...
service_role key: eyJhbGc...
```

### 3. Check Status

```bash
npm run db:status
```

Verify all services are running. Copy the `anon key` and `service_role key` for later.

### 4. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your keys from step 3:

```bash
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<paste-anon-key-here>
SUPABASE_SERVICE_ROLE_KEY=<paste-service-role-key-here>
```

### 5. Generate TypeScript Types

```bash
npm run db:types
```

This creates `lib/database.types.ts` with full type definitions.

### 6. Open Supabase Studio

Visit http://localhost:54323 in your browser.

- **SQL Editor**: Run queries
- **Table Editor**: View/edit data
- **Auth**: Manage users
- **Database**: View schema

## Your First Queries

### Option A: Using the Studio

1. Go to **Auth** tab
2. Click **Add user** → Add via email
3. Go to **Table Editor** → **profiles**
4. See the auto-created profile!

### Option B: Using TypeScript

Create a test file `test.ts`:

```typescript
import { createSupabaseClient, createSession, addConversationNode } from './lib/supabase'

async function main() {
  const supabase = createSupabaseClient()
  
  // Sign up a user
  const { data: authData } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'password123'
  })
  
  if (!authData.user) throw new Error('Failed to create user')
  
  // Create a session
  const session = await createSession(
    supabase,
    authData.user.id,
    'My First Chat',
    { default_model: 'gpt-4' }
  )
  
  console.log('Created session:', session.id)
  
  // Add a user message
  const userNode = await addConversationNode(
    supabase,
    session.id,
    authData.user.id,
    'user',
    'Hello, AI!',
    { depth: 0 }
  )
  
  console.log('Created user node:', userNode.id)
  
  // Add AI response
  const aiNode = await addConversationNode(
    supabase,
    session.id,
    authData.user.id,
    'assistant',
    'Hello! How can I help you today?',
    {
      parentId: userNode.id,
      depth: 1,
      modelName: 'gpt-4',
      modelProvider: 'openai'
    }
  )
  
  console.log('Created AI node:', aiNode.id)
}

main().catch(console.error)
```

Run it:
```bash
npx tsx test.ts
```

### Option C: Using SQL

Open Studio SQL Editor and run:

```sql
-- Create a test user profile (use actual auth.users ID)
-- First create auth user in the Auth tab, then:

-- Create a session
INSERT INTO public.dialog_sessions (user_id, title, default_model)
VALUES ('your-user-id', 'Test Chat', 'gpt-4')
RETURNING *;

-- Add a conversation node
INSERT INTO public.conversation_nodes (
  session_id, user_id, role, content, depth
)
VALUES (
  'your-session-id',
  'your-user-id',
  'user',
  'Hello, world!',
  0
)
RETURNING *;
```

## Testing the Schema

### 1. View Tables

In Studio, go to **Table Editor** and explore:
- `profiles` - User profiles
- `dialog_sessions` - Chat sessions
- `conversation_nodes` - Messages
- `branch_options` - Branches
- `node_paths` - Tree paths

### 2. Test RLS (Row Level Security)

In SQL Editor:

```sql
-- This will work (viewing own data)
SELECT * FROM dialog_sessions
WHERE user_id = auth.uid();

-- This will return empty (can't see other users' data)
SELECT * FROM dialog_sessions
WHERE user_id != auth.uid();
```

### 3. Test Real-Time

In your app:

```typescript
const supabase = createSupabaseClient()

// Subscribe to new nodes in a session
supabase
  .channel('my-channel')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'conversation_nodes',
      filter: `session_id=eq.${sessionId}`
    },
    (payload) => {
      console.log('New message!', payload)
    }
  )
  .subscribe()
```

Then add a node in Studio and watch the console!

### 4. Test Tree Structure

```sql
-- Create a conversation tree
WITH RECURSIVE tree AS (
  -- Root node
  SELECT id, parent_id, content, depth, ARRAY[id] as path
  FROM conversation_nodes
  WHERE parent_id IS NULL AND session_id = 'your-session-id'
  
  UNION ALL
  
  -- Children
  SELECT cn.id, cn.parent_id, cn.content, cn.depth, tree.path || cn.id
  FROM conversation_nodes cn
  JOIN tree ON cn.parent_id = tree.id
)
SELECT * FROM tree;
```

Or use the closure table:

```sql
-- Get all descendants of a node
SELECT 
  cn.*,
  np.depth as distance
FROM node_paths np
JOIN conversation_nodes cn ON np.descendant_id = cn.id
WHERE np.ancestor_id = 'your-node-id'
ORDER BY np.depth;
```

## Common Tasks

### Reset Database

⚠️ **Warning**: This deletes all data!

```bash
npm run db:reset
```

### Stop Supabase

```bash
npm run db:stop
```

### View Logs

```bash
supabase logs
```

### Run Specific Migration

```bash
supabase migration up --version <timestamp>
```

## Next Steps

1. **Read the full schema**: See [SCHEMA.md](./SCHEMA.md)
2. **Explore helpers**: Check out `lib/supabase.ts` for utility functions
3. **Build your app**: Use the generated types for full type safety
4. **Add seed data**: Edit `supabase/seed.sql` and run `npm run db:reset`

## Troubleshooting

### Port Already in Use

If you get port conflicts:

```bash
# Stop Supabase
npm run db:stop

# Or change ports in supabase/config.toml
```

### Types Not Generating

```bash
# Make sure Supabase is running
npm run db:status

# Try manual generation
supabase gen types typescript --local > lib/database.types.ts
```

### RLS Blocking Queries

If you're getting empty results:

1. Check you're authenticated: `supabase.auth.getUser()`
2. Verify user_id matches: Compare with query filter
3. Use service role key on server-side if needed

### Migration Errors

```bash
# View migration history
supabase migration list

# Reset and reapply
npm run db:reset
```

## Production Deployment

When ready for production:

1. **Create Supabase Project**: https://app.supabase.com
2. **Link Project**:
   ```bash
   supabase link --project-ref your-project-ref
   ```
3. **Push Migrations**:
   ```bash
   supabase db push
   ```
4. **Generate Remote Types**:
   ```bash
   export SUPABASE_PROJECT_ID=your-project-id
   npm run db:types:remote
   ```
5. **Update Environment Variables**: Use production URLs and keys

## Getting Help

- 📚 [Full README](../README.md)
- 🗺️ [Schema Documentation](./SCHEMA.md)
- 🌐 [Supabase Docs](https://supabase.com/docs)
- 💬 [Supabase Discord](https://discord.supabase.com)

Happy coding! 🚀
