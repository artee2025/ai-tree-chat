# Contributing Guide

Thank you for contributing to the AI Tree Chat database schema! This guide will help you get started.

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-tree-chat.git
   cd ai-tree-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Supabase locally**
   ```bash
   npm run db:start
   ```

4. **Create a feature branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

## Making Changes

### Schema Changes

When modifying the database schema:

1. **Create a new migration**
   ```bash
   supabase migration new descriptive_name
   ```

2. **Write your SQL changes** in the new migration file

3. **Test the migration**
   ```bash
   npm run db:reset
   ```

4. **Update TypeScript types**
   ```bash
   npm run db:types
   ```

5. **Update documentation**
   - Update `README.md` if adding new features
   - Update `docs/SCHEMA.md` for schema changes
   - Update `docs/RLS_POLICIES.md` if changing policies

### Code Changes

When modifying helper functions or utilities:

1. **Follow existing code style**
   - Use TypeScript
   - Add JSDoc comments for functions
   - Use descriptive variable names

2. **Update types**
   ```bash
   npm run db:types
   ```

3. **Add examples** to `examples/` directory if adding new patterns

### Documentation Changes

- Use clear, concise language
- Include code examples
- Add explanations for complex concepts
- Update table of contents if needed

## Testing Your Changes

### Manual Testing

1. **Reset database**
   ```bash
   npm run db:reset
   ```

2. **Test in Studio**
   - Open http://localhost:54323
   - Try your changes in the SQL editor
   - Verify RLS policies work correctly

3. **Test with TypeScript**
   ```typescript
   // Create a test file
   import { createSupabaseClient } from './lib/supabase'
   
   async function test() {
     const supabase = createSupabaseClient()
     // Test your changes
   }
   
   test().catch(console.error)
   ```

### RLS Testing

Test RLS policies with different users:

```sql
-- In SQL Editor
SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "test-user-id"}';

-- Run your query
SELECT * FROM your_table;

-- Reset
RESET ROLE;
```

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(schema): add user preferences column to profiles

Added a JSONB column to store user preferences including theme,
language, and notification settings.

Closes #123
```

```
fix(rls): correct session ownership check in nodes policy

The previous policy didn't properly validate session ownership
when inserting nodes. This fix adds an EXISTS check.

Fixes #456
```

### Branch Naming

- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions

Example: `feat/add-session-sharing`

## Pull Request Process

1. **Update documentation**
   - README.md
   - SCHEMA.md
   - QUICKSTART.md if needed

2. **Ensure migrations work**
   ```bash
   npm run db:reset
   ```

3. **Generate fresh types**
   ```bash
   npm run db:types
   ```

4. **Create pull request**
   - Use a clear title
   - Describe your changes
   - Link related issues
   - Add screenshots if relevant

5. **Respond to reviews**
   - Address feedback
   - Push updates to same branch
   - Mark conversations as resolved

## Code Style

### SQL

```sql
-- Use uppercase for keywords
CREATE TABLE public.example (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add comments for complex logic
COMMENT ON COLUMN example.name IS 'User-facing name';

-- Indent subqueries
SELECT 
  e.id,
  (
    SELECT COUNT(*) 
    FROM other_table 
    WHERE example_id = e.id
  ) as count
FROM example e;
```

### TypeScript

```typescript
/**
 * Description of what this function does
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @returns Promise resolving to user data
 */
export async function getUser(
  supabase: SupabaseClient,
  userId: string
): Promise<User> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}
```

### Documentation

```markdown
# Clear Headings

Use clear, descriptive headings.

## Code Examples

Include runnable code examples:

\`\`\`typescript
// With comments explaining the code
const result = await doSomething()
\`\`\`

## Explanations

Explain WHY, not just WHAT.
```

## Migration Best Practices

### DO ✅

1. **Make migrations idempotent**
   ```sql
   CREATE TABLE IF NOT EXISTS ...
   ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...
   ```

2. **Add indexes**
   ```sql
   CREATE INDEX idx_table_column ON table(column);
   ```

3. **Include RLS policies**
   ```sql
   ALTER TABLE table ENABLE ROW LEVEL SECURITY;
   CREATE POLICY ...
   ```

4. **Add comments**
   ```sql
   COMMENT ON TABLE table IS 'Purpose of this table';
   ```

5. **Use transactions**
   Migrations are automatically wrapped in transactions

### DON'T ❌

1. **Don't drop columns without migration path**
   ```sql
   -- ❌ Don't do this without data migration
   ALTER TABLE table DROP COLUMN important_data;
   ```

2. **Don't change types without compatibility check**
   ```sql
   -- ❌ Might break existing data
   ALTER TABLE table ALTER COLUMN id TYPE INTEGER;
   ```

3. **Don't forget foreign keys**
   ```sql
   -- ❌ Missing FK constraint
   CREATE TABLE table (
     user_id UUID
   );
   
   -- ✅ With FK
   CREATE TABLE table (
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
   );
   ```

## RLS Policy Guidelines

### Policy Naming

Use descriptive names:
```sql
CREATE POLICY "Users can view own sessions"
  ON dialog_sessions
  FOR SELECT
  USING (auth.uid() = user_id);
```

### Security First

Always think about security:

```sql
-- ✅ Good - validates ownership
CREATE POLICY "Users can insert own nodes"
  ON conversation_nodes
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM dialog_sessions
      WHERE id = conversation_nodes.session_id
      AND user_id = auth.uid()
    )
  );

-- ❌ Bad - doesn't validate session ownership
CREATE POLICY "Users can insert nodes"
  ON conversation_nodes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Service Role Access

Always provide service role bypass:

```sql
CREATE POLICY "Service role has full access"
  ON table
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');
```

## Documentation Standards

### README.md

- Overview and features
- Quick start guide
- Basic usage examples
- Links to detailed docs

### SCHEMA.md

- ER diagrams
- Table descriptions
- Field descriptions
- Index information
- Query patterns

### QUICKSTART.md

- Step-by-step setup
- Copy-paste examples
- Common tasks
- Troubleshooting

### RLS_POLICIES.md

- Policy explanations
- Security considerations
- Testing methods
- Best practices

## Review Checklist

Before submitting PR:

- [ ] Migrations apply cleanly (`npm run db:reset`)
- [ ] Types generated successfully (`npm run db:types`)
- [ ] RLS policies tested
- [ ] Documentation updated
- [ ] Examples added if needed
- [ ] Code follows style guide
- [ ] Commit messages follow format
- [ ] No sensitive data in commits

## Getting Help

- **Questions**: Open a discussion
- **Bugs**: Open an issue with reproduction steps
- **Features**: Open an issue describing the use case
- **Security**: Email security@example.com (don't open public issue)

## Community

- Be respectful and inclusive
- Help others learn
- Share knowledge
- Give constructive feedback
- Celebrate contributions

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).

---

Thank you for contributing! 🎉
