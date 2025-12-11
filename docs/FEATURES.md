# Features Overview

Comprehensive feature list for the AI Tree Chat database schema.

## Core Features

### 🌳 Tree-Structured Conversations

- **Branching support**: Create multiple conversation paths from any message
- **Depth tracking**: Automatic depth calculation for tree navigation
- **Parent-child relationships**: Self-referential structure for flexibility
- **Sequence ordering**: Order siblings for consistent display
- **Closure table**: Efficient ancestor/descendant queries via `node_paths`

**Use Cases:**
- Exploring different AI model responses
- A/B testing conversation strategies
- User-directed conversation flow
- Multiple conversation threads

### 👤 User Management

- **Profile system**: Extends Supabase auth with custom fields
- **Auto-creation**: Profiles automatically created on signup
- **Preferences storage**: JSONB for flexible user settings
- **Avatar support**: Store profile pictures
- **Soft deletes**: Preserve user data with `deleted_at`

### 💬 Session Management

- **Multiple sessions**: Users can have unlimited conversations
- **Pinned sessions**: Keep important chats at the top
- **Default settings**: Per-session model configuration
- **Last activity tracking**: Auto-updated on new messages
- **Rich metadata**: JSONB for custom session data
- **Session statistics**: Aggregated views for analytics

### 🤖 AI Model Integration

- **Multi-model support**: Works with any AI provider
- **Model metadata**: Track which model generated each response
- **Parameter tracking**: Store temperature, max_tokens, etc.
- **Token counting**: Monitor usage and costs
- **Provider flexibility**: Support OpenAI, Anthropic, etc.

### 📡 Real-Time Streaming

- **Streaming state**: Track in-progress responses
- **Incremental updates**: Update content as it streams
- **Error handling**: Capture streaming failures
- **Completion tracking**: Know when streaming finishes
- **Real-time subscriptions**: Live updates via Supabase Realtime

**Streaming Workflow:**
1. Create node with `is_streaming: true`
2. Update `content` incrementally
3. Complete with `streaming_complete: true`
4. Record token usage and timing

### 🔒 Security (RLS)

- **Row-level security**: Enabled on all tables
- **User isolation**: Users only see their own data
- **Cascading security**: Session ownership validates node access
- **Service role bypass**: Admin operations via service key
- **Soft delete filtering**: Deleted records automatically hidden

**Security Principles:**
- Defense in depth
- Explicit ownership checks
- No data leakage between users
- Server-side admin capabilities

### 🔍 Efficient Querying

- **Comprehensive indexes**: Optimized for common queries
- **Composite indexes**: Multi-column queries
- **Partial indexes**: Exclude soft-deleted records
- **Materialized paths**: Fast tree traversal
- **Pre-built views**: Common aggregations

**Indexed Fields:**
- user_id (all user-owned tables)
- session_id (nodes, branches)
- parent_id (tree traversal)
- is_streaming (real-time queries)
- deleted_at (soft delete filtering)

### 📊 Analytics & Statistics

- **Session statistics view**: Aggregated metrics per session
- **Token tracking**: Monitor AI usage and costs
- **Branch analytics**: Track which paths users prefer
- **Timing data**: Measure AI response times
- **Conversation metrics**: Depth, messages, branches

**Available Metrics:**
- Total messages per session
- User vs AI message ratio
- Token usage (prompt, completion, total)
- Maximum conversation depth
- Number of branch points
- Last activity timestamps

### 🔄 Data Integrity

- **Foreign key constraints**: Maintain referential integrity
- **Cascade deletes**: Clean up related records
- **Check constraints**: Validate enum values
- **Unique constraints**: Prevent duplicates
- **Automatic triggers**: Maintain computed fields

**Triggers:**
- Auto-update `updated_at` timestamps
- Maintain `node_paths` closure table
- Update session `last_activity_at`
- Create profile on user signup

### 🗂️ Branching System

- **Branch metadata**: Name and describe alternatives
- **Selection tracking**: Count how often each branch is chosen
- **Active branches**: Mark preferred paths
- **Branch discovery**: Find all alternatives from a node

**Use Cases:**
- Multiple AI responses to same prompt
- Different conversation directions
- A/B testing responses
- User exploration of alternatives

### 🕐 Soft Deletes

- **Non-destructive**: Data preserved with timestamp
- **Recoverable**: Can be restored by clearing `deleted_at`
- **Automatic filtering**: Queries exclude deleted records
- **Audit trail**: Know when records were deleted

**Soft Delete Pattern:**
```typescript
// Delete
UPDATE table SET deleted_at = NOW() WHERE id = 'x'

// Restore
UPDATE table SET deleted_at = NULL WHERE id = 'x'

// Permanent delete
DELETE FROM table WHERE deleted_at < NOW() - INTERVAL '30 days'
```

### 📝 Content Types

- **Text**: Plain text messages
- **JSON**: Structured data responses
- **Markdown**: Formatted content
- **Code**: Code snippets with syntax

**Role Types:**
- **system**: System prompts and instructions
- **user**: User messages
- **assistant**: AI responses
- **function**: Function call results

## Advanced Features

### Tree Traversal Patterns

**Adjacency List** (via parent_id):
```sql
SELECT * FROM conversation_nodes 
WHERE parent_id = 'node-id'
```

**Depth Queries**:
```sql
SELECT * FROM conversation_nodes 
WHERE session_id = 'x' AND depth = 2
```

**Closure Table** (via node_paths):
```sql
-- All ancestors
SELECT * FROM node_paths 
WHERE descendant_id = 'node-id'

-- All descendants
SELECT * FROM node_paths 
WHERE ancestor_id = 'node-id'
```

### Real-Time Subscriptions

**New messages**:
```typescript
supabase.channel('session')
  .on('postgres_changes', {
    event: 'INSERT',
    table: 'conversation_nodes',
    filter: `session_id=eq.${id}`
  }, callback)
```

**Streaming updates**:
```typescript
supabase.channel('node')
  .on('postgres_changes', {
    event: 'UPDATE',
    table: 'conversation_nodes',
    filter: `id=eq.${id}`
  }, callback)
```

### Views

**active_conversation_paths**:
- Pre-joined nodes with session info
- Includes ancestor path array
- Filtered to active records

**session_statistics**:
- Aggregated session metrics
- Token usage totals
- Message counts by role
- Branch point counting

## Performance Optimizations

### Indexing Strategy

1. **Primary access patterns**: user_id, session_id
2. **Tree traversal**: parent_id, depth
3. **Real-time queries**: is_streaming, session_id
4. **Soft deletes**: deleted_at with partial indexes
5. **Sorting**: last_activity_at, sequence_order

### Query Optimization

- Use indexes (they exclude soft-deleted records)
- Leverage views for complex aggregations
- Use closure table for deep tree queries
- Batch operations when possible
- Specify needed columns in SELECT

### Scalability Considerations

- **Partition** by created_at for very large datasets
- **Archive** old sessions to reduce active data
- **Materialize** complex views for faster reads
- **Cache** frequently accessed sessions
- **Rate limit** to prevent abuse

## Integration Points

### Supabase Auth

- Automatic profile creation on signup
- RLS uses `auth.uid()` for user identification
- Service role for admin operations
- JWT claims for role checking

### Supabase Realtime

- Enabled on conversation_nodes
- Enabled on dialog_sessions
- Enabled on branch_options
- Subscribe to specific sessions or nodes

### Supabase Storage (Future)

Potential integrations:
- Store conversation exports
- Save conversation screenshots
- Attach files to messages
- Profile avatars

## Use Cases

### ChatGPT-Style Interface

- Single linear conversation
- Don't use branching
- Focus on streaming updates
- Show typing indicators

### Tree Exploration UI

- Display branch options
- Allow jumping between branches
- Visualize conversation tree
- Compare different paths

### A/B Testing Platform

- Generate multiple responses
- Track selection counts
- Analyze preferred branches
- Optimize AI parameters

### Conversation Analysis

- Use session statistics
- Track token usage
- Measure response times
- Analyze conversation depth

### Multi-Model Comparison

- Same prompt, different models
- Create branches for each model
- Compare responses side-by-side
- Track performance metrics

## Future Enhancements

Potential additions:

- **Conversation sharing**: Share sessions between users
- **Collaboration**: Multiple users in same session
- **Message reactions**: Like/dislike responses
- **Conversation export**: Export as PDF, JSON, etc.
- **Search**: Full-text search across conversations
- **Tags/Categories**: Organize sessions
- **Templates**: Reusable conversation starters
- **Conversation forking**: Copy and continue existing sessions
- **Version control**: Track edits to messages

## Limitations

Current limitations to be aware of:

- **No message editing**: Messages are immutable (by design)
- **No conversation merging**: Can't combine sessions
- **No cross-session queries**: Each session is isolated
- **No message attachments**: Text only (can be added)
- **No rate limiting**: Implement at application level
- **No automatic archival**: Implement as needed

## Best Practices

1. **Always authenticate** before queries
2. **Use soft deletes** instead of hard deletes
3. **Leverage indexes** in WHERE clauses
4. **Batch operations** when possible
5. **Monitor token usage** to control costs
6. **Set default models** per session
7. **Use views** for complex queries
8. **Subscribe to real-time** for live updates
9. **Test RLS policies** thoroughly
10. **Archive old sessions** periodically

## Summary

This schema provides:
✅ Flexible tree-structured conversations
✅ Multi-model AI support
✅ Real-time streaming capabilities
✅ Comprehensive security
✅ Performance optimization
✅ Rich metadata tracking
✅ Branching and exploration
✅ Analytics and statistics
✅ Type-safe TypeScript integration
✅ Production-ready architecture
