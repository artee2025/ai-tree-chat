/**
 * Supabase client configuration and helper utilities
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Type aliases for convenience
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Profile = Tables<'profiles'>
export type DialogSession = Tables<'dialog_sessions'>
export type ConversationNode = Tables<'conversation_nodes'>
export type BranchOption = Tables<'branch_options'>
export type NodePath = Tables<'node_paths'>

// Initialize Supabase client
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient<Database>(supabaseUrl, supabaseKey)
}

// Initialize Supabase admin client (server-side only)
export const createSupabaseAdmin = () => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase admin environment variables')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * Helper function to get conversation tree for a session
 */
export async function getConversationTree(
  supabase: ReturnType<typeof createSupabaseClient>,
  sessionId: string
) {
  const { data: nodes, error } = await supabase
    .from('conversation_nodes')
    .select('*')
    .eq('session_id', sessionId)
    .is('deleted_at', null)
    .order('depth', { ascending: true })
    .order('sequence_order', { ascending: true })

  if (error) throw error

  // Build tree structure
  const nodeMap = new Map<string, ConversationNode & { children: ConversationNode[] }>();
  const rootNodes: (ConversationNode & { children: ConversationNode[] })[] = [];

  // First pass: create map with all nodes
  nodes.forEach(node => {
    nodeMap.set(node.id, { ...node, children: [] })
  })

  // Second pass: build tree structure
  nodes.forEach(node => {
    const nodeWithChildren = nodeMap.get(node.id)!
    if (node.parent_id) {
      const parent = nodeMap.get(node.parent_id)
      if (parent) {
        parent.children.push(nodeWithChildren)
      }
    } else {
      rootNodes.push(nodeWithChildren)
    }
  })

  return { nodes: rootNodes, flatNodes: nodes }
}

/**
 * Helper function to get all ancestors of a node
 */
export async function getNodeAncestors(
  supabase: ReturnType<typeof createSupabaseClient>,
  nodeId: string
) {
  const { data, error } = await supabase
    .from('node_paths')
    .select(`
      depth,
      ancestor:conversation_nodes!node_paths_ancestor_id_fkey(*)
    `)
    .eq('descendant_id', nodeId)
    .order('depth', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Helper function to get all descendants of a node
 */
export async function getNodeDescendants(
  supabase: ReturnType<typeof createSupabaseClient>,
  nodeId: string
) {
  const { data, error } = await supabase
    .from('node_paths')
    .select(`
      depth,
      descendant:conversation_nodes!node_paths_descendant_id_fkey(*)
    `)
    .eq('ancestor_id', nodeId)
    .order('depth', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Helper function to get branch options for a node
 */
export async function getNodeBranches(
  supabase: ReturnType<typeof createSupabaseClient>,
  parentNodeId: string
) {
  const { data, error } = await supabase
    .from('branch_options')
    .select(`
      *,
      child_node:conversation_nodes!branch_options_child_node_id_fkey(*)
    `)
    .eq('parent_node_id', parentNodeId)
    .is('deleted_at', null)
    .order('selection_count', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Helper function to create a new session
 */
export async function createSession(
  supabase: ReturnType<typeof createSupabaseClient>,
  userId: string,
  title: string = 'New Conversation',
  options?: Partial<Insertable<'dialog_sessions'>>
) {
  const { data, error } = await supabase
    .from('dialog_sessions')
    .insert({
      user_id: userId,
      title,
      ...options
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Helper function to add a node to the conversation
 */
export async function addConversationNode(
  supabase: ReturnType<typeof createSupabaseClient>,
  sessionId: string,
  userId: string,
  role: 'user' | 'assistant' | 'system' | 'function',
  content: string,
  options?: {
    parentId?: string
    depth?: number
    modelName?: string
    modelProvider?: string
    temperature?: number
    metadata?: Record<string, any>
  }
) {
  const { data, error } = await supabase
    .from('conversation_nodes')
    .insert({
      session_id: sessionId,
      user_id: userId,
      role,
      content,
      parent_id: options?.parentId || null,
      depth: options?.depth ?? 0,
      model_name: options?.modelName,
      model_provider: options?.modelProvider,
      temperature: options?.temperature,
      metadata: options?.metadata || {}
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Helper function to start streaming a response
 */
export async function startStreamingNode(
  supabase: ReturnType<typeof createSupabaseClient>,
  sessionId: string,
  userId: string,
  parentId: string,
  depth: number,
  modelName?: string,
  modelProvider?: string
) {
  const { data, error } = await supabase
    .from('conversation_nodes')
    .insert({
      session_id: sessionId,
      user_id: userId,
      parent_id: parentId,
      role: 'assistant',
      content: '',
      depth,
      is_streaming: true,
      streaming_complete: false,
      model_name: modelName,
      model_provider: modelProvider,
      generation_started_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Helper function to update streaming content
 */
export async function updateStreamingContent(
  supabase: ReturnType<typeof createSupabaseClient>,
  nodeId: string,
  content: string
) {
  const { error } = await supabase
    .from('conversation_nodes')
    .update({ content })
    .eq('id', nodeId)

  if (error) throw error
}

/**
 * Helper function to complete streaming
 */
export async function completeStreaming(
  supabase: ReturnType<typeof createSupabaseClient>,
  nodeId: string,
  tokenUsage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  },
  streamError?: string
) {
  const { error } = await supabase
    .from('conversation_nodes')
    .update({
      is_streaming: false,
      streaming_complete: !streamError,
      stream_error: streamError || null,
      generation_completed_at: new Date().toISOString(),
      prompt_tokens: tokenUsage?.promptTokens,
      completion_tokens: tokenUsage?.completionTokens,
      total_tokens: tokenUsage?.totalTokens
    })
    .eq('id', nodeId)

  if (error) throw error
}

/**
 * Helper function to create a branch
 */
export async function createBranch(
  supabase: ReturnType<typeof createSupabaseClient>,
  sessionId: string,
  parentNodeId: string,
  childNodeId: string,
  branchName?: string,
  branchDescription?: string
) {
  const { data, error } = await supabase
    .from('branch_options')
    .insert({
      session_id: sessionId,
      parent_node_id: parentNodeId,
      child_node_id: childNodeId,
      branch_name: branchName,
      branch_description: branchDescription
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Helper function to increment branch selection count
 */
export async function selectBranch(
  supabase: ReturnType<typeof createSupabaseClient>,
  branchOptionId: string
) {
  const { error } = await supabase.rpc('increment_branch_selection', {
    branch_id: branchOptionId
  })

  if (error) {
    // Fallback if RPC doesn't exist
    const { data: branch } = await supabase
      .from('branch_options')
      .select('selection_count')
      .eq('id', branchOptionId)
      .single()

    if (branch) {
      await supabase
        .from('branch_options')
        .update({ selection_count: branch.selection_count + 1 })
        .eq('id', branchOptionId)
    }
  }
}

/**
 * Helper function to soft delete a session
 */
export async function softDeleteSession(
  supabase: ReturnType<typeof createSupabaseClient>,
  sessionId: string
) {
  const { error } = await supabase
    .from('dialog_sessions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', sessionId)

  if (error) throw error
}

/**
 * Helper function to get user's sessions
 */
export async function getUserSessions(
  supabase: ReturnType<typeof createSupabaseClient>,
  userId: string,
  options?: {
    includePinned?: boolean
    limit?: number
    offset?: number
  }
) {
  let query = supabase
    .from('dialog_sessions')
    .select('*, conversation_nodes(count)')
    .eq('user_id', userId)
    .is('deleted_at', null)

  if (options?.includePinned) {
    query = query.order('is_pinned', { ascending: false })
  }

  query = query
    .order('last_activity_at', { ascending: false })
    .range(options?.offset ?? 0, (options?.offset ?? 0) + (options?.limit ?? 50) - 1)

  const { data, error } = await query

  if (error) throw error
  return data
}
