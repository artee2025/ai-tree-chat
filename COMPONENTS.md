# Component Documentation

This document provides detailed information about all custom components in the AI Chat Interface.

## Chat Components

### ChatInterface

**Location**: `components/chat/chat-interface.tsx`

The main component that orchestrates the entire chat experience.

**Features**:
- Session management
- Message history display
- Real-time updates via Supabase
- Keyboard shortcuts (⌘K, ⌘N)
- Automatic session creation on first load
- Responsive layout with sidebar

**Props**: None (top-level component)

**Usage**:
```tsx
import { ChatInterface } from '@/components/chat/chat-interface'

export default function Page() {
  return <ChatInterface />
}
```

---

### ChatHistoryList

**Location**: `components/chat/chat-history-list.tsx`

Displays the list of messages in a scrollable area with auto-scroll to latest message.

**Props**:
- `messages: Message[]` - Array of message objects
- `isTyping?: boolean` - Whether to show typing indicator (default: false)

**Features**:
- Auto-scroll to bottom on new messages
- Empty state when no messages
- Smooth scrolling behavior
- Displays typing indicator when AI is responding

**Usage**:
```tsx
<ChatHistoryList 
  messages={messages} 
  isTyping={isSending} 
/>
```

---

### MessageBubble

**Location**: `components/chat/message-bubble.tsx`

Renders an individual message with appropriate styling based on role (user/assistant).

**Props**:
- `message: Message` - Message object containing content, role, timestamp, etc.
- `isOptimistic?: boolean` - Whether this is an optimistic (not yet confirmed) message

**Features**:
- Different styling for user vs assistant messages
- Avatar indicators (U for user, AI for assistant)
- Timestamp on hover
- Optimistic state with reduced opacity
- Responsive layout

**Usage**:
```tsx
<MessageBubble 
  message={message}
  isOptimistic={message.id.startsWith('temp-')} 
/>
```

---

### MessageComposer

**Location**: `components/chat/message-composer.tsx`

The input area where users type and send messages.

**Props**:
- `onSend: (content: string) => void` - Callback when message is sent
- `disabled?: boolean` - Whether input is disabled (default: false)
- `placeholder?: string` - Placeholder text (default: "Type a message...")

**Features**:
- Multiline textarea with auto-resize
- Enter to send, Shift+Enter for new line
- Disabled state while sending
- Send button with icon
- Prevents sending empty/whitespace-only messages

**Usage**:
```tsx
<MessageComposer
  onSend={sendMessage}
  disabled={isSending}
  placeholder="Type your message..."
/>
```

---

### SessionSidebar

**Location**: `components/chat/session-sidebar.tsx`

Navigation sidebar for managing chat sessions.

**Props**:
- `sessions: Session[]` - Array of session objects
- `currentSession: Session | null` - Currently active session
- `onSelectSession: (session: Session) => void` - Callback when session is selected
- `onCreateSession: () => void` - Callback to create new session
- `isLoading?: boolean` - Whether sessions are loading (default: false)

**Features**:
- List of all sessions with timestamps
- Create new session button
- Mobile-responsive (drawer on mobile, fixed sidebar on desktop)
- Loading skeletons
- Empty state
- Active session highlight

**Usage**:
```tsx
<SessionSidebar
  sessions={sessions}
  currentSession={currentSession}
  onSelectSession={switchSession}
  onCreateSession={createSession}
  isLoading={isLoading}
/>
```

---

### BranchSelector

**Location**: `components/chat/branch-selector.tsx`

Dropdown menu for selecting conversation branches.

**Props**:
- `branches: Branch[]` - Array of branch objects
- `currentBranch: Branch | null` - Currently active branch
- `onSelectBranch: (branch: Branch) => void` - Callback when branch is selected

**Features**:
- Dropdown menu with branch list
- Visual indicator for main branch
- Current branch checkmark
- Auto-hides when no branches available
- Responsive (icon-only on mobile)

**Usage**:
```tsx
<BranchSelector
  branches={branches}
  currentBranch={currentBranch}
  onSelectBranch={switchBranch}
/>
```

---

### TypingIndicator

**Location**: `components/chat/typing-indicator.tsx`

Animated indicator showing AI is typing.

**Props**: None

**Features**:
- Three animated dots
- AI avatar
- Consistent styling with message bubbles

**Usage**:
```tsx
{isTyping && <TypingIndicator />}
```

---

## Custom Hooks

### useChat

**Location**: `lib/hooks/use-chat.ts`

Main hook for all chat-related functionality and Supabase integration.

**Returns**:
```typescript
{
  sessions: Session[]              // All user sessions
  currentSession: Session | null   // Active session
  messages: Message[]              // Messages in current session
  branches: Branch[]               // Branches in current session
  currentBranch: Branch | null     // Active branch
  isLoading: boolean               // Initial load state
  isSending: boolean               // Message send state
  createSession: () => Promise     // Create new session
  sendMessage: (content) => Promise // Send a message
  switchSession: (session) => void // Change active session
  switchBranch: (branch) => void   // Change active branch
  loadSessions: () => Promise      // Refresh sessions list
}
```

**Features**:
- Session CRUD operations
- Message sending with optimistic updates
- Real-time message subscriptions
- Branch management
- Automatic data loading
- Error handling with toast notifications

**Usage**:
```tsx
function ChatComponent() {
  const {
    messages,
    sendMessage,
    isSending
  } = useChat()
  
  // Use the returned values and functions
}
```

---

### useKeyboardShortcuts

**Location**: `lib/hooks/use-keyboard-shortcuts.ts`

Hook for registering keyboard shortcuts.

**Parameters**:
```typescript
shortcuts: Array<{
  key: string
  metaKey?: boolean
  ctrlKey?: boolean
  shiftKey?: boolean
  callback: () => void
}>
```

**Features**:
- Support for modifier keys (Cmd/Ctrl, Shift)
- Case-insensitive key matching
- Automatic cleanup on unmount
- Prevents default browser behavior

**Usage**:
```tsx
useKeyboardShortcuts([
  {
    key: 'k',
    metaKey: true,
    callback: () => createNewChat()
  },
  {
    key: 'n',
    metaKey: true,
    callback: () => createNewSession()
  }
])
```

---

## Supabase Integration

### Client

**Location**: `lib/supabase/client.ts`

Creates and exports the Supabase browser client.

**Usage**:
```tsx
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
```

---

### Types

**Location**: `lib/supabase/types.ts`

TypeScript type definitions for the Supabase database schema.

**Exports**:
- `Database` - Full database schema type
- Type helpers for tables (Session, Message, Branch)

**Usage**:
```tsx
import { Database } from '@/lib/supabase/types'

type Message = Database['public']['Tables']['messages']['Row']
type MessageInsert = Database['public']['Tables']['messages']['Insert']
type MessageUpdate = Database['public']['Tables']['messages']['Update']
```

---

## shadcn/ui Components

The following shadcn/ui components are used throughout the application:

- **Button**: `components/ui/button.tsx`
- **Textarea**: `components/ui/textarea.tsx`
- **ScrollArea**: `components/ui/scroll-area.tsx`
- **Skeleton**: `components/ui/skeleton.tsx`
- **Sonner (Toast)**: `components/ui/sonner.tsx`
- **Separator**: `components/ui/separator.tsx`
- **Avatar**: `components/ui/avatar.tsx`
- **DropdownMenu**: `components/ui/dropdown-menu.tsx`
- **Dialog**: `components/ui/dialog.tsx`
- **Badge**: `components/ui/badge.tsx`

For detailed documentation on these components, see [shadcn/ui documentation](https://ui.shadcn.com).

---

## Styling Guidelines

### Using Tailwind CSS

All components use Tailwind CSS for styling. Key patterns:

```tsx
// Responsive design
className="hidden lg:block"  // Hidden on mobile, visible on desktop

// Dark mode support
className="bg-white dark:bg-neutral-950"

// Conditional classes with cn()
className={cn(
  'base-classes',
  condition && 'conditional-classes'
)}
```

### Color Scheme

The app uses neutral colors with accent colors for user/assistant messages:

- **User messages**: Blue (`bg-blue-600`)
- **Assistant messages**: Purple (`bg-purple-600`)
- **Neutral UI**: Gray/Neutral shades
- **Borders**: `border-neutral-200` / `dark:border-neutral-800`

### Spacing

- Use consistent spacing: `gap-2`, `gap-3`, `gap-4`
- Padding: `p-2`, `p-4`, `px-4 py-3`
- Margins: `mb-1`, `mb-2`, `mb-4`

---

## Best Practices

### Component Organization

1. **Import Order**:
   - React imports
   - Third-party imports
   - Local component imports
   - Type imports
   - Utility imports

2. **Props Interface**:
   - Define interface above component
   - Document complex props with comments
   - Use TypeScript for type safety

3. **State Management**:
   - Use hooks for local state
   - Use custom hooks for shared logic
   - Keep components focused on presentation

### Performance

1. **Memoization**:
   - Use `useCallback` for functions passed to children
   - Use `useMemo` for expensive calculations
   - Avoid unnecessary re-renders

2. **Real-time Subscriptions**:
   - Clean up subscriptions on unmount
   - Avoid duplicate subscriptions
   - Filter data at the database level

3. **Optimistic Updates**:
   - Show changes immediately
   - Revert on error
   - Replace with server data when confirmed

---

## Testing

All components have corresponding test files in `__tests__` directories.

**Test Coverage**:
- User interactions
- Props validation
- Conditional rendering
- Edge cases (empty states, errors)
- Keyboard shortcuts

**Running Tests**:
```bash
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage
```

---

## Troubleshooting Components

### Component Not Rendering

1. Check for TypeScript errors
2. Verify all required props are passed
3. Check browser console for errors
4. Ensure Supabase client is initialized

### Styles Not Applying

1. Verify Tailwind CSS is configured correctly
2. Check for conflicting CSS classes
3. Ensure dark mode classes are properly set
4. Clear `.next` cache and rebuild

### Real-time Not Working

1. Check Supabase connection
2. Verify real-time is enabled in Supabase project
3. Check subscription setup in useChat hook
4. Look for WebSocket errors in Network tab
