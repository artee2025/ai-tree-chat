import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './message-bubble'
import { TypingIndicator } from './typing-indicator'
import { Database } from '@/lib/supabase/types'

type Message = Database['public']['Tables']['messages']['Row']

interface ChatHistoryListProps {
  messages: Message[]
  isTyping?: boolean
}

export function ChatHistoryList({ messages, isTyping = false }: ChatHistoryListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping])

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-500">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No messages yet</h3>
          <p className="text-sm">Start a conversation by sending a message below.</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 px-4">
      <div ref={scrollRef} className="py-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOptimistic={message.id.startsWith('temp-')}
          />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
