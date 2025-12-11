import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'
import { toast } from 'sonner'
import { RealtimeChannel } from '@supabase/supabase-js'

type Session = Database['public']['Tables']['sessions']['Row']
type Message = Database['public']['Tables']['messages']['Row']
type Branch = Database['public']['Tables']['branches']['Row']

export function useChat() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const supabase = createClient() as any

  // Load all sessions
  const loadSessions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      setSessions(data || [])
    } catch (error) {
      toast.error('Failed to load sessions')
      console.error('Error loading sessions:', error)
    }
  }, [supabase])

  // Load messages for a session
  const loadMessages = useCallback(async (sessionId: string, branchId?: string | null) => {
    try {
      let query = supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('order_index', { ascending: true })

      if (branchId) {
        query = query.or(`branch_id.eq.${branchId},branch_id.is.null`)
      } else {
        query = query.is('branch_id', null)
      }

      const { data, error } = await query

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      toast.error('Failed to load messages')
      console.error('Error loading messages:', error)
    }
  }, [supabase])

  // Load branches for a session
  const loadBranches = useCallback(async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (error) throw error
      
      const branches = data || []
      setBranches(branches)
      
      // Set main branch as current if available
      const mainBranch = branches.find((b: Branch) => b.is_main)
      if (mainBranch) {
        setCurrentBranch(mainBranch)
      }
    } catch (error) {
      toast.error('Failed to load branches')
      console.error('Error loading branches:', error)
    }
  }, [supabase])

  // Create a new session
  const createSession = useCallback(async (title?: string) => {
    try {
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          title: title || 'New Chat',
          updated_at: new Date().toISOString()
        } as Database['public']['Tables']['sessions']['Insert'])
        .select()
        .single()

      if (sessionError) throw sessionError

      // Create main branch for the session
      const { data: branch, error: branchError } = await supabase
        .from('branches')
        .insert({
          session_id: session.id,
          name: 'main',
          is_main: true
        } as Database['public']['Tables']['branches']['Insert'])
        .select()
        .single()

      if (branchError) throw branchError

      setSessions(prev => [session, ...prev])
      setCurrentSession(session)
      setCurrentBranch(branch)
      setMessages([])
      
      toast.success('New session created')
      return session
    } catch (error) {
      toast.error('Failed to create session')
      console.error('Error creating session:', error)
      return null
    }
  }, [supabase])

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!currentSession || !content.trim()) return null

    setIsSending(true)
    
    // Optimistic update - add user message immediately
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      session_id: currentSession.id,
      branch_id: currentBranch?.id || null,
      parent_message_id: messages[messages.length - 1]?.id || null,
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
      order_index: messages.length
    }
    
    setMessages(prev => [...prev, optimisticMessage])

    try {
      // Insert user message
      const { data: userMessage, error: messageError } = await supabase
        .from('messages')
        .insert({
          session_id: currentSession.id,
          branch_id: currentBranch?.id || null,
          parent_message_id: messages[messages.length - 1]?.id || null,
          role: 'user' as const,
          content: content.trim(),
          order_index: messages.length
        } as Database['public']['Tables']['messages']['Insert'])
        .select()
        .single()

      if (messageError) throw messageError

      // Replace optimistic message with real one
      setMessages(prev => 
        prev.map(msg => msg.id === optimisticMessage.id ? userMessage : msg)
      )

      // Update session updated_at
      await supabase
        .from('sessions')
        .update({ updated_at: new Date().toISOString() } as Database['public']['Tables']['sessions']['Update'])
        .eq('id', currentSession.id)

      // Here you would typically call your AI API and add the assistant response
      // For now, we'll add a placeholder
      const assistantMessage: Message = {
        id: `temp-assistant-${Date.now()}`,
        session_id: currentSession.id,
        branch_id: currentBranch?.id || null,
        parent_message_id: userMessage.id,
        role: 'assistant',
        content: 'This is a placeholder response. Connect your AI API here.',
        created_at: new Date().toISOString(),
        order_index: messages.length + 1
      }
      
      setMessages(prev => [...prev, assistantMessage])

      const { data: aiMessage, error: aiError } = await supabase
        .from('messages')
        .insert({
          session_id: currentSession.id,
          branch_id: currentBranch?.id || null,
          parent_message_id: userMessage.id,
          role: 'assistant' as const,
          content: assistantMessage.content,
          order_index: messages.length + 1
        } as Database['public']['Tables']['messages']['Insert'])
        .select()
        .single()

      if (aiError) throw aiError

      setMessages(prev => 
        prev.map(msg => msg.id === assistantMessage.id ? aiMessage : msg)
      )

      return userMessage
    } catch (error) {
      toast.error('Failed to send message')
      console.error('Error sending message:', error)
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id))
      return null
    } finally {
      setIsSending(false)
    }
  }, [currentSession, currentBranch, messages, supabase])

  // Switch to a different session
  const switchSession = useCallback((session: Session) => {
    setCurrentSession(session)
    setMessages([])
    setBranches([])
    setCurrentBranch(null)
  }, [])

  // Switch to a different branch
  const switchBranch = useCallback((branch: Branch) => {
    setCurrentBranch(branch)
    if (currentSession) {
      loadMessages(currentSession.id, branch.id)
    }
  }, [currentSession, loadMessages])

  // Initial load
  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      await loadSessions()
      setIsLoading(false)
    }
    init()
  }, [loadSessions])

  // Load messages and branches when session changes
  useEffect(() => {
    if (currentSession) {
      loadMessages(currentSession.id, currentBranch?.id)
      loadBranches(currentSession.id)
    }
  }, [currentSession, currentBranch?.id, loadMessages, loadBranches])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!currentSession) return

    let messageChannel: RealtimeChannel

    const setupRealtimeSubscription = () => {
      messageChannel = supabase
        .channel(`messages:${currentSession.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `session_id=eq.${currentSession.id}`
          },
          (payload: any) => {
            const newMessage = payload.new as Message
            setMessages(prev => {
              // Avoid duplicates
              if (prev.some(msg => msg.id === newMessage.id)) {
                return prev
              }
              return [...prev, newMessage]
            })
          }
        )
        .subscribe()
    }

    setupRealtimeSubscription()

    return () => {
      if (messageChannel) {
        supabase.removeChannel(messageChannel)
      }
    }
  }, [currentSession, supabase])

  return {
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
    switchBranch,
    loadSessions
  }
}
