import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Database } from '@/lib/supabase/types'

type Message = Database['public']['Tables']['messages']['Row']

interface MessageBubbleProps {
  message: Message
  isOptimistic?: boolean
}

export function MessageBubble({ message, isOptimistic = false }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  return (
    <div
      className={cn(
        'flex gap-3 mb-4 group',
        isUser && 'flex-row-reverse',
        isOptimistic && 'opacity-60'
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={cn(
          isUser && 'bg-blue-600 text-white',
          isAssistant && 'bg-purple-600 text-white'
        )}>
          {isUser ? 'U' : 'AI'}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        'flex flex-col gap-1 max-w-[80%]',
        isUser && 'items-end'
      )}>
        <div className={cn(
          'rounded-lg px-4 py-2 text-sm',
          isUser && 'bg-blue-600 text-white',
          isAssistant && 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
        )}>
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>
        
        <span className={cn(
          'text-xs text-neutral-500 px-1 opacity-0 group-hover:opacity-100 transition-opacity',
          isUser && 'text-right'
        )}>
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </span>
      </div>
    </div>
  )
}
