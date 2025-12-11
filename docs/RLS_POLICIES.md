# Row-Level Security (RLS) Policies

Complete guide to understanding and working with RLS policies in the AI tree chat database.

## Overview

Row-Level Security (RLS) ensures users can only access their own data. All tables have RLS enabled with carefully crafted policies.

**Key Principles:**
- ✅ Users own their sessions and nodes
- ✅ Service role bypasses all policies (server-side only)
- ✅ Soft-deleted records hidden from users
- ✅ Cascade security through relationships

## Policy Structure

Each table has policies for:
- **SELECT**: Reading data
- **INSERT**: Creating new records
- **UPDATE**: Modifying existing records
- **DELETE**: Removing records (hard delete)

Plus a catch-all service role policy for admin operations.

## Table-by-Table Breakdown

### Profiles

#### Policy: "Users can view own profile"
```sql
FOR SELECT USING (auth.uid() = id)
```
**What it does**: Users can only read their own profile row.

**Example**:
```typescript
// ✅ Works - viewing own profile
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()

// ❌ Returns empty - can't view other profiles
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', otherUserId)
  .single()
```

#### Policy: "Users can update own profile"
```sql
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id)
```
**What it does**: Users can only modify their own profile.

**Example**:
```typescript
// ✅ Works
await supabase
  .from('profiles')
  .update({ display_name: 'New Name' })
  .eq('id', user.id)

// ❌ Fails - can't update other profiles
await supabase
  .from('profiles')
  .update({ display_name: 'Hacked' })
  .eq('id', otherUserId)
```

### Dialog Sessions

#### Policy: "Users can view own sessions"
```sql
FOR SELECT USING (
  auth.uid() = user_id AND 
  deleted_at IS NULL
)
```
**What it does**: 
- Users see only their sessions
- Soft-deleted sessions are hidden

**Example**:
```typescript
// ✅ Returns only user's active sessions
const { data: sessions } = await supabase
  .from('dialog_sessions')
  .select('*')

// Sessions are automatically filtered by user_id
```

#### Policy: "Users can create own sessions"
```sql
FOR INSERT WITH CHECK (auth.uid() = user_id)
```
**What it does**: Users can only create sessions owned by themselves.

**Example**:
```typescript
// ✅ Works
await supabase.from('dialog_sessions').insert({
  user_id: user.id,
  title: 'My Chat'
})

// ❌ Fails - can't create session for another user
await supabase.from('dialog_sessions').insert({
  user_id: otherUserId,
  title: 'Their Chat'
})
```

#### Policy: "Users can update own sessions"
```sql
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id)
```
**What it does**: Users can only modify their own sessions.

**Example**:
```typescript
// ✅ Works
await supabase
  .from('dialog_sessions')
  .update({ title: 'Updated Title' })
  .eq('id', mySessionId)

// ❌ Fails
await supabase
  .from('dialog_sessions')
  .update({ title: 'Hacked' })
  .eq('id', otherUserSessionId)
```

#### Policy: "Users can delete own sessions"
```sql
FOR DELETE USING (auth.uid() = user_id)
```
**What it does**: Users can hard-delete their own sessions.

**Example**:
```typescript
// ✅ Works
await supabase
  .from('dialog_sessions')
  .delete()
  .eq('id', mySessionId)
```

### Conversation Nodes

#### Policy: "Users can view own conversation nodes"
```sql
FOR SELECT USING (
  auth.uid() = user_id AND 
  deleted_at IS NULL AND
  EXISTS (
    SELECT 1 FROM public.dialog_sessions
    WHERE id = conversation_nodes.session_id
    AND user_id = auth.uid()
    AND deleted_at IS NULL
  )
)
```
**What it does**: 
- Users see only nodes in their sessions
- Double-checks session ownership
- Hides soft-deleted nodes

**Why the EXISTS check?**: Defense in depth - even if user_id were somehow wrong, we verify session ownership.

**Example**:
```typescript
// ✅ Returns only nodes in user's sessions
const { data: nodes } = await supabase
  .from('conversation_nodes')
  .select('*')
  .eq('session_id', mySessionId)

// ❌ Returns empty for other users' sessions
const { data: empty } = await supabase
  .from('conversation_nodes')
  .select('*')
  .eq('session_id', otherUserSessionId)
```

#### Policy: "Users can create own conversation nodes"
```sql
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.dialog_sessions
    WHERE id = conversation_nodes.session_id
    AND user_id = auth.uid()
    AND deleted_at IS NULL
  )
)
```
**What it does**: 
- Users can only create nodes in their sessions
- Verifies session exists and is owned by user

**Example**:
```typescript
// ✅ Works - adding to own session
await supabase.from('conversation_nodes').insert({
  session_id: mySessionId,
  user_id: user.id,
  role: 'user',
  content: 'Hello'
})

// ❌ Fails - can't add to other user's session
await supabase.from('conversation_nodes').insert({
  session_id: otherUserSessionId,
  user_id: user.id,
  role: 'user',
  content: 'Sneaky'
})
```

#### Policy: "Users can update own conversation nodes"
```sql
FOR UPDATE
USING (
  auth.uid() = user_id AND
  EXISTS (SELECT 1 FROM public.dialog_sessions ...)
)
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (SELECT 1 FROM public.dialog_sessions ...)
)
```
**What it does**: Users can only modify nodes in their sessions.

**Example**:
```typescript
// ✅ Works - updating own node
await supabase
  .from('conversation_nodes')
  .update({ content: 'Updated' })
  .eq('id', myNodeId)

// ❌ Fails - can't update other user's node
await supabase
  .from('conversation_nodes')
  .update({ content: 'Hacked' })
  .eq('id', otherUserNodeId)
```

### Branch Options

#### Policy: "Users can view own branches"
```sql
FOR SELECT USING (
  deleted_at IS NULL AND
  EXISTS (
    SELECT 1 FROM public.dialog_sessions
    WHERE id = branch_options.session_id
    AND user_id = auth.uid()
    AND deleted_at IS NULL
  )
)
```
**What it does**: Users see branches in their sessions only.

**Example**:
```typescript
// ✅ Returns branches in user's sessions
const { data: branches } = await supabase
  .from('branch_options')
  .select('*')
  .eq('parent_node_id', myNodeId)
```

#### Similar policies exist for INSERT, UPDATE, DELETE
All follow the same pattern: verify session ownership.

### Node Paths

#### Policy: "Users can view own node paths"
```sql
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversation_nodes
    WHERE id = node_paths.descendant_id
    AND user_id = auth.uid()
    AND deleted_at IS NULL
  )
)
```
**What it does**: Users can view paths for nodes they own.

**Note**: Node paths are automatically created/deleted by triggers, so INSERT/UPDATE/DELETE policies aren't needed for users.

## Service Role Policies

Every table has:
```sql
CREATE POLICY "Service role has full access to [table]"
  ON public.[table]
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role')
```

**What it does**: Bypasses all RLS for admin operations.

**When to use**: Server-side operations, admin dashboards, background jobs.

**Example**:
```typescript
import { createSupabaseAdmin } from './lib/supabase'

// Server-side only!
const supabaseAdmin = createSupabaseAdmin()

// Can access any data
const { data: allSessions } = await supabaseAdmin
  .from('dialog_sessions')
  .select('*')
```

⚠️ **Security Warning**: Never expose service role key to clients!

## Testing RLS Policies

### Method 1: Using Supabase Studio

1. Go to **SQL Editor**
2. Run queries as different users:

```sql
-- Switch to anon role (simulates client)
SET ROLE anon;
SET request.jwt.claims = '{"sub": "user-id-here"}';

-- Now queries respect RLS
SELECT * FROM dialog_sessions;

-- Reset
RESET ROLE;
```

### Method 2: Using TypeScript

```typescript
// Create client with user's auth
const supabase = createSupabaseClient()
await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'password'
})

// Queries now respect RLS for this user
const { data, error } = await supabase
  .from('dialog_sessions')
  .select('*')

// Should only return this user's sessions
console.log(data)
```

### Method 3: Automated Tests

```typescript
import { describe, it, expect } from 'vitest'

describe('RLS Policies', () => {
  it('prevents users from viewing other sessions', async () => {
    // Create two users
    const user1 = await createTestUser('user1@test.com')
    const user2 = await createTestUser('user2@test.com')
    
    // User 1 creates a session
    const session = await createSession(supabase1, user1.id, 'Private Chat')
    
    // User 2 tries to access it
    const { data } = await supabase2
      .from('dialog_sessions')
      .select('*')
      .eq('id', session.id)
    
    // Should be empty
    expect(data).toHaveLength(0)
  })
})
```

## Common Issues and Solutions

### Issue: Getting Empty Results

**Symptom**: Queries return empty arrays when you expect data.

**Causes**:
1. Not authenticated
2. Wrong user authenticated
3. Accessing another user's data
4. Records are soft-deleted

**Solution**:
```typescript
// Check authentication
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user?.id)

// Check record ownership
const { data } = await supabase
  .from('dialog_sessions')
  .select('user_id')
  .eq('id', sessionId)
  .single()
console.log('Session owner:', data?.user_id)

// Compare
if (user?.id === data?.user_id) {
  console.log('✅ You own this session')
} else {
  console.log('❌ RLS is blocking access')
}
```

### Issue: Can't Insert Records

**Symptom**: INSERT queries fail silently.

**Causes**:
1. user_id doesn't match authenticated user
2. Referenced session doesn't exist or isn't owned by user

**Solution**:
```typescript
// Always use authenticated user's ID
const { data: { user } } = await supabase.auth.getUser()

await supabase.from('dialog_sessions').insert({
  user_id: user!.id, // Must match authenticated user
  title: 'My Chat'
})
```

### Issue: Need to Bypass RLS on Server

**Solution**: Use service role client
```typescript
// Server-side only!
import { createSupabaseAdmin } from './lib/supabase'

const admin = createSupabaseAdmin()
// Bypasses RLS
```

## Best Practices

### ✅ DO

1. **Always authenticate** before querying
   ```typescript
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) throw new Error('Not authenticated')
   ```

2. **Use service role on server** for admin operations
   ```typescript
   // In API route / server action
   const admin = createSupabaseAdmin()
   ```

3. **Test RLS policies** for your use cases
   ```typescript
   // Add RLS tests to your test suite
   ```

4. **Trust RLS** - don't add redundant checks
   ```typescript
   // ❌ Redundant
   const { data } = await supabase
     .from('dialog_sessions')
     .select('*')
     .eq('user_id', user.id) // RLS already does this!
   
   // ✅ Better
   const { data } = await supabase
     .from('dialog_sessions')
     .select('*')
   ```

### ❌ DON'T

1. **Don't expose service role key** to clients
   ```typescript
   // ❌ NEVER do this in client code
   const supabase = createClient(url, SERVICE_ROLE_KEY)
   ```

2. **Don't disable RLS** unless you have a very good reason
   ```sql
   -- ❌ Don't do this
   ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
   ```

3. **Don't try to circumvent RLS** in application code
   ```typescript
   // ❌ This won't work anyway
   await supabase.from('dialog_sessions').select('*').eq('user_id', 'any-user')
   // RLS will still filter to current user
   ```

## Debugging RLS

### Enable RLS Logging

In `supabase/config.toml`:
```toml
[db]
log_min_messages = "info"
```

### View Policy Evaluation

```sql
-- Check which policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public';
```

### Test Specific Policy

```sql
-- Simulate a user query
SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "user-id", "role": "authenticated"}';

-- Run query
SELECT * FROM dialog_sessions;

-- See what happened
EXPLAIN (VERBOSE) SELECT * FROM dialog_sessions;

-- Reset
RESET ROLE;
```

## Advanced: Custom Policies

If you need to add custom policies:

```sql
-- Example: Allow users to share sessions
CREATE TABLE session_shares (
  session_id UUID REFERENCES dialog_sessions(id),
  shared_with_user_id UUID REFERENCES auth.users(id),
  permission TEXT CHECK (permission IN ('read', 'write'))
);

-- Add policy to allow viewing shared sessions
CREATE POLICY "Users can view shared sessions"
  ON dialog_sessions
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM session_shares
      WHERE session_id = dialog_sessions.id
      AND shared_with_user_id = auth.uid()
    )
  );
```

## Summary

- **RLS is enabled** on all tables
- **Users see only their data** through ownership checks
- **Service role bypasses RLS** for admin operations
- **Policies cascade** through relationships (sessions → nodes → branches)
- **Soft deletes are hidden** from users automatically
- **Trust RLS** - it's your security layer

For more information:
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
