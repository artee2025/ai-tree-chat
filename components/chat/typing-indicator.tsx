import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-purple-600 text-white">
          AI
        </AvatarFallback>
      </Avatar>
      
      <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg px-4 py-3">
        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
      </div>
    </div>
  )
}
