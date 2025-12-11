import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { MessageSquarePlus, MessageSquare, X, Menu } from 'lucide-react'
import { Database } from '@/lib/supabase/types'

type Session = Database['public']['Tables']['sessions']['Row']

interface SessionSidebarProps {
  sessions: Session[]
  currentSession: Session | null
  onSelectSession: (session: Session) => void
  onCreateSession: () => void
  isLoading?: boolean
}

export function SessionSidebar({
  sessions,
  currentSession,
  onSelectSession,
  onCreateSession,
  isLoading = false
}: SessionSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const sidebarContent = (
    <div className="h-full flex flex-col bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
      <div className="p-4 flex items-center justify-between">
        <h2 className="font-semibold text-lg">Chat Sessions</h2>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="px-4 pb-4">
        <Button
          onClick={() => {
            onCreateSession()
            setIsOpen(false)
          }}
          className="w-full gap-2"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            <>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-3 mb-2">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-center text-sm text-neutral-500">
              No sessions yet. Create your first chat!
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => {
                  onSelectSession(session)
                  setIsOpen(false)
                }}
                className={cn(
                  'w-full text-left p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors mb-1',
                  currentSession?.id === session.id &&
                    'bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700'
                )}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 mt-1 shrink-0 text-neutral-500" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {session.title || 'Untitled Chat'}
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {formatDistanceToNow(new Date(session.updated_at), {
                        addSuffix: true
                      })}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-40"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-50 w-[280px] transform transition-transform duration-200 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {sidebarContent}
      </div>
    </>
  )
}
