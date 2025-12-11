/**
 * Basic Usage Examples for AI Tree Chat Database
 * 
 * This file demonstrates common operations and patterns for working with the database.
 */

import { 
  createSupabaseClient, 
  createSession,
  addConversationNode,
  startStreamingNode,
  updateStreamingContent,
  completeStreaming,
  getConversationTree,
  getNodeBranches,
  createBranch,
  getUserSessions
} from '../lib/supabase'

/**
 * Example 1: Creating a new chat session
 */
async function example1_CreateSession() {
  const supabase = createSupabaseClient()
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  // Create a new session
  const session = await createSession(
    supabase,
    user.id,
    'Introduction to AI',
    {
      default_model: 'gpt-4',
      default_temperature: 0.7,
      default_max_tokens: 2000,
      description: 'A conversation exploring AI concepts'
    }
  )
  
  console.log('Created session:', session.id)
  return session
}

/**
 * Example 2: Adding messages to a conversation
 */
async function example2_AddMessages(sessionId: string) {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  // Add user message
  const userMessage = await addConversationNode(
    supabase,
    sessionId,
    user.id,
    'user',
    'What is artificial intelligence?',
    { depth: 0 }
  )
  
  console.log('Added user message:', userMessage.id)
  
  // Add AI response
  const aiResponse = await addConversationNode(
    supabase,
    sessionId,
    user.id,
    'assistant',
    'Artificial Intelligence (AI) refers to the simulation of human intelligence in machines...',
    {
      parentId: userMessage.id,
      depth: 1,
      modelName: 'gpt-4',
      modelProvider: 'openai',
      temperature: 0.7,
      metadata: { reasoning: 'Provided comprehensive definition' }
    }
  )
  
  console.log('Added AI response:', aiResponse.id)
  
  return { userMessage, aiResponse }
}

/**
 * Example 3: Streaming an AI response
 */
async function example3_StreamingResponse(sessionId: string, parentNodeId: string) {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  // Start streaming
  const streamingNode = await startStreamingNode(
    supabase,
    sessionId,
    user.id,
    parentNodeId,
    2, // depth
    'gpt-4',
    'openai'
  )
  
  console.log('Started streaming node:', streamingNode.id)
  
  // Simulate streaming chunks (in real app, this comes from AI API)
  const chunks = [
    'Machine learning is',
    ' a subset of AI',
    ' that enables systems',
    ' to learn from data.'
  ]
  
  let accumulatedContent = ''
  
  for (const chunk of chunks) {
    accumulatedContent += chunk
    await updateStreamingContent(supabase, streamingNode.id, accumulatedContent)
    console.log('Updated content:', accumulatedContent)
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  // Complete streaming
  await completeStreaming(
    supabase,
    streamingNode.id,
    {
      promptTokens: 20,
      completionTokens: 15,
      totalTokens: 35
    }
  )
  
  console.log('Completed streaming')
  return streamingNode
}

/**
 * Example 4: Creating conversation branches
 */
async function example4_CreateBranches(sessionId: string, parentNodeId: string) {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  // Get parent node depth
  const { data: parentNode } = await supabase
    .from('conversation_nodes')
    .select('depth')
    .eq('id', parentNodeId)
    .single()
  
  if (!parentNode) throw new Error('Parent node not found')
  
  // Create first branch (detailed explanation)
  const branch1 = await addConversationNode(
    supabase,
    sessionId,
    user.id,
    'assistant',
    'Here are detailed examples: 1. Virtual assistants like Siri, 2. Recommendation systems...',
    {
      parentId: parentNodeId,
      depth: parentNode.depth + 1,
      sequence_order: 0,
      modelName: 'gpt-4',
      modelProvider: 'openai'
    }
  )
  
  // Record branch option
  await createBranch(
    supabase,
    sessionId,
    parentNodeId,
    branch1.id,
    'Detailed Examples',
    'Provides specific examples with descriptions'
  )
  
  // Create second branch (concise list)
  const branch2 = await addConversationNode(
    supabase,
    sessionId,
    user.id,
    'assistant',
    'Quick examples: Virtual assistants, Self-driving cars, Recommendation engines, Image recognition',
    {
      parentId: parentNodeId,
      depth: parentNode.depth + 1,
      sequence_order: 1,
      modelName: 'gpt-4',
      modelProvider: 'openai'
    }
  )
  
  // Record branch option
  await createBranch(
    supabase,
    sessionId,
    parentNodeId,
    branch2.id,
    'Concise List',
    'Brief list of examples'
  )
  
  console.log('Created two branches')
  return { branch1, branch2 }
}

/**
 * Example 5: Querying conversation tree
 */
async function example5_QueryTree(sessionId: string) {
  const supabase = createSupabaseClient()
  
  // Get full tree structure
  const { nodes, flatNodes } = await getConversationTree(supabase, sessionId)
  
  console.log('Root nodes:', nodes.length)
  console.log('Total nodes:', flatNodes.length)
  
  // Print tree structure
  function printTree(node: any, indent = 0) {
    const prefix = '  '.repeat(indent)
    console.log(`${prefix}[${node.role}] ${node.content?.substring(0, 50)}...`)
    
    if (node.children) {
      node.children.forEach((child: any) => printTree(child, indent + 1))
    }
  }
  
  nodes.forEach(node => printTree(node))
  
  return { nodes, flatNodes }
}

/**
 * Example 6: Working with branches
 */
async function example6_WorkWithBranches(parentNodeId: string) {
  const supabase = createSupabaseClient()
  
  // Get all branches from a parent node
  const branches = await getNodeBranches(supabase, parentNodeId)
  
  console.log(`Found ${branches?.length || 0} branches`)
  
  branches?.forEach((branch: any) => {
    console.log(`Branch: ${branch.branch_name}`)
    console.log(`  Description: ${branch.branch_description}`)
    console.log(`  Selected: ${branch.selection_count} times`)
    console.log(`  Content: ${branch.child_node.content.substring(0, 50)}...`)
  })
  
  return branches
}

/**
 * Example 7: Real-time subscription
 */
async function example7_RealtimeSubscription(sessionId: string) {
  const supabase = createSupabaseClient()
  
  console.log('Setting up real-time subscription...')
  
  // Subscribe to new messages in session
  const channel = supabase
    .channel(`session-${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'conversation_nodes',
        filter: `session_id=eq.${sessionId}`
      },
      (payload) => {
        console.log('New message received:', {
          id: payload.new.id,
          role: payload.new.role,
          content: payload.new.content?.substring(0, 50)
        })
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversation_nodes',
        filter: `session_id=eq.${sessionId}`
      },
      (payload) => {
        if (payload.new.is_streaming) {
          console.log('Streaming update:', {
            id: payload.new.id,
            content: payload.new.content?.substring(0, 50)
          })
        }
      }
    )
    .subscribe((status) => {
      console.log('Subscription status:', status)
    })
  
  // Return cleanup function
  return () => {
    supabase.removeChannel(channel)
    console.log('Unsubscribed from real-time updates')
  }
}

/**
 * Example 8: Listing user's sessions
 */
async function example8_ListSessions() {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  // Get user's sessions
  const sessions = await getUserSessions(supabase, user.id, {
    includePinned: true,
    limit: 20,
    offset: 0
  })
  
  console.log(`Found ${sessions?.length || 0} sessions`)
  
  sessions?.forEach((session: any) => {
    console.log(`\nSession: ${session.title}`)
    console.log(`  ID: ${session.id}`)
    console.log(`  Created: ${new Date(session.created_at).toLocaleDateString()}`)
    console.log(`  Last activity: ${new Date(session.last_activity_at).toLocaleDateString()}`)
    console.log(`  Pinned: ${session.is_pinned ? 'Yes' : 'No'}`)
    console.log(`  Model: ${session.default_model || 'N/A'}`)
  })
  
  return sessions
}

/**
 * Example 9: Soft delete a session
 */
async function example9_SoftDelete(sessionId: string) {
  const supabase = createSupabaseClient()
  
  // Soft delete
  const { error } = await supabase
    .from('dialog_sessions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', sessionId)
  
  if (error) throw error
  
  console.log('Session soft deleted:', sessionId)
  
  // Verify it's hidden
  const { data } = await supabase
    .from('dialog_sessions')
    .select('*')
    .eq('id', sessionId)
  
  console.log('Session visible after delete:', data?.length || 0)
  // Should be 0 because RLS filters out deleted_at IS NOT NULL
}

/**
 * Example 10: Using views for statistics
 */
async function example10_SessionStatistics(sessionId: string) {
  const supabase = createSupabaseClient()
  
  // Query session statistics view
  const { data: stats, error } = await supabase
    .from('session_statistics')
    .select('*')
    .eq('session_id', sessionId)
    .single()
  
  if (error) throw error
  
  console.log('\nSession Statistics:')
  console.log(`  Title: ${stats?.title}`)
  console.log(`  Total nodes: ${stats?.total_nodes}`)
  console.log(`  User messages: ${stats?.user_messages}`)
  console.log(`  AI messages: ${stats?.assistant_messages}`)
  console.log(`  Total tokens: ${stats?.total_tokens_used}`)
  console.log(`  Max depth: ${stats?.max_depth}`)
  console.log(`  Branch points: ${stats?.branch_points}`)
  
  return stats
}

/**
 * Complete workflow example
 */
async function completeWorkflowExample() {
  console.log('=== Complete Workflow Example ===\n')
  
  try {
    // 1. Create session
    console.log('1. Creating session...')
    const session = await example1_CreateSession()
    
    // 2. Add initial messages
    console.log('\n2. Adding initial messages...')
    const { userMessage, aiResponse } = await example2_AddMessages(session.id)
    
    // 3. Add follow-up with streaming
    console.log('\n3. Adding follow-up question...')
    const followUp = await addConversationNode(
      createSupabaseClient(),
      session.id,
      (await createSupabaseClient().auth.getUser()).data.user!.id,
      'user',
      'Can you give me examples?',
      { parentId: aiResponse.id, depth: 2 }
    )
    
    console.log('\n4. Streaming AI response...')
    await example3_StreamingResponse(session.id, followUp.id)
    
    // 5. Create branches
    console.log('\n5. Creating alternative responses...')
    await example4_CreateBranches(session.id, followUp.id)
    
    // 6. Query tree
    console.log('\n6. Querying conversation tree...')
    await example5_QueryTree(session.id)
    
    // 7. View statistics
    console.log('\n7. Viewing statistics...')
    await example10_SessionStatistics(session.id)
    
    // 8. Set up real-time (and clean up after 5 seconds)
    console.log('\n8. Setting up real-time subscription...')
    const cleanup = await example7_RealtimeSubscription(session.id)
    setTimeout(cleanup, 5000)
    
    console.log('\n=== Workflow Complete! ===')
  } catch (error) {
    console.error('Error in workflow:', error)
  }
}

// Export examples
export {
  example1_CreateSession,
  example2_AddMessages,
  example3_StreamingResponse,
  example4_CreateBranches,
  example5_QueryTree,
  example6_WorkWithBranches,
  example7_RealtimeSubscription,
  example8_ListSessions,
  example9_SoftDelete,
  example10_SessionStatistics,
  completeWorkflowExample
}

// If running directly
if (require.main === module) {
  completeWorkflowExample().catch(console.error)
}
