import { render, screen } from '@testing-library/react'
import { MessageBubble } from '../message-bubble'
import { Database } from '@/lib/supabase/types'

type Message = Database['public']['Tables']['messages']['Row']

describe('MessageBubble', () => {
  const mockUserMessage: Message = {
    id: '1',
    session_id: 'session-1',
    branch_id: null,
    parent_message_id: null,
    role: 'user',
    content: 'Hello, world!',
    created_at: new Date().toISOString(),
    order_index: 0,
  }

  const mockAssistantMessage: Message = {
    id: '2',
    session_id: 'session-1',
    branch_id: null,
    parent_message_id: '1',
    role: 'assistant',
    content: 'Hi there! How can I help?',
    created_at: new Date().toISOString(),
    order_index: 1,
  }

  it('renders user message correctly', () => {
    render(<MessageBubble message={mockUserMessage} />)
    expect(screen.getByText('Hello, world!')).toBeInTheDocument()
    expect(screen.getByText('U')).toBeInTheDocument()
  })

  it('renders assistant message correctly', () => {
    render(<MessageBubble message={mockAssistantMessage} />)
    expect(screen.getByText('Hi there! How can I help?')).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument()
  })

  it('shows optimistic state', () => {
    const { container } = render(<MessageBubble message={mockUserMessage} isOptimistic />)
    const messageElement = container.querySelector('.opacity-60')
    expect(messageElement).toBeInTheDocument()
  })

  it('displays correct avatar for user', () => {
    render(<MessageBubble message={mockUserMessage} />)
    const avatar = screen.getByText('U')
    expect(avatar).toBeInTheDocument()
  })

  it('displays correct avatar for assistant', () => {
    render(<MessageBubble message={mockAssistantMessage} />)
    const avatar = screen.getByText('AI')
    expect(avatar).toBeInTheDocument()
  })
})
