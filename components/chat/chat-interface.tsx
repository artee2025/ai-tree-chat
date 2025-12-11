'use client'

import { useEffect } from 'react'
import { useChat } from '@/lib/hooks/use-chat'
import { useKeyboardShortcuts } from '@/lib/hooks/use-keyboard-shortcuts'
import { SessionSidebar } from './session-sidebar'
import { ChatHistoryList } from './chat-history-list'
import { MessageComposer } from './message-composer'
import { BranchSelector } from './branch-selector'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export function ChatInterface() {
  const {
    sessions,
    currentSession,
    messages,
    branches,
    currentBranch,
    isLoading,
    isSending,
    createSession,
    sendMessage,
    switchSession,
    switchBranch
  } = useChat()

  // Set up keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'k',
      metaKey: true,
      callback: () => {
        createSession()
        toast.success('New chat created (⌘K)')
      }
    },
    {
      key: 'n',
      metaKey: true,
      callback: () => {
        createSession()
        toast.success('New session created (⌘N)')
      }
    }
  ])

  // Create initial session if none exists
  useEffect(() => {
    if (!isLoading && sessions.length === 0) {
      createSession()
    }
  }, [isLoading, sessions.length, createSession])

  // Auto-select first session if none selected
  useEffect(() => {
    if (!currentSession && sessions.length > 0) {
      switchSession(sessions[0])
    }
  }, [currentSession, sessions, switchSession])

  return (
    <div className="flex h-screen overflow-hidden">
      <SessionSidebar
        sessions={sessions}
        currentSession={currentSession}
        onSelectSession={switchSession}
        onCreateSession={createSession}
        isLoading={isLoading}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-3 flex items-center justify-between">
          <div className="flex-1 min-w-0 ml-12 lg:ml-0">
            {isLoading ? (
              <Skeleton className="h-6 w-48" />
            ) : (
              <h1 className="text-lg font-semibold truncate">
                {currentSession?.title || 'New Chat'}
              </h1>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <BranchSelector
              branches={branches}
              currentBranch={currentBranch}
              onSelectBranch={switchBranch}
            />
          </div>
        </div>

        {/* Chat area */}
        {isLoading ? (
          <div className="flex-1 px-4 py-8 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ChatHistoryList messages={messages} isTyping={isSending} />
        )}

        {/* Message composer */}
        <MessageComposer
          onSend={sendMessage}
          disabled={isSending || !currentSession}
          placeholder={
            currentSession
              ? 'Type a message...'
              : 'Create a session to start chatting'
          }
        />
      </div>
    </div>
  )
}
