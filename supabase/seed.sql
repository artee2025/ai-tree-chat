-- Seed data for AI tree chat application
-- This file contains sample data for testing and development

-- Note: This assumes you have created test users through Supabase Auth
-- You can create test users via the Supabase Studio Auth section or through the API

-- ============================================================================
-- SAMPLE DATA - UNCOMMENT AND MODIFY WITH REAL USER IDS
-- ============================================================================

-- Example: If you have a test user with ID '550e8400-e29b-41d4-a716-446655440000'
-- Uncomment and replace with your actual test user ID

/*
-- Insert test profile (will be created automatically via trigger, but you can update it)
UPDATE public.profiles
SET 
  username = 'demo_user',
  display_name = 'Demo User',
  bio = 'This is a demo user for testing the AI tree chat application',
  preferences = '{"theme": "dark", "language": "en"}'::jsonb
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Insert sample dialog session
INSERT INTO public.dialog_sessions (
  id,
  user_id,
  title,
  description,
  default_model,
  default_temperature,
  is_pinned
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '550e8400-e29b-41d4-a716-446655440000',
  'Introduction to AI',
  'A conversation exploring artificial intelligence concepts',
  'gpt-4',
  0.7,
  true
);

-- Insert root conversation node (user message)
INSERT INTO public.conversation_nodes (
  id,
  session_id,
  user_id,
  parent_id,
  role,
  content,
  depth,
  sequence_order
) VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  '550e8400-e29b-41d4-a716-446655440000',
  NULL,
  'user',
  'What is artificial intelligence?',
  0,
  0
);

-- Insert assistant response
INSERT INTO public.conversation_nodes (
  id,
  session_id,
  user_id,
  parent_id,
  role,
  content,
  depth,
  sequence_order,
  model_name,
  model_provider,
  temperature,
  prompt_tokens,
  completion_tokens,
  total_tokens,
  generation_started_at,
  generation_completed_at
) VALUES (
  'b0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000001',
  '550e8400-e29b-41d4-a716-446655440000',
  'b0000000-0000-0000-0000-000000000001',
  'assistant',
  'Artificial Intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think and learn like humans. It encompasses various technologies including machine learning, natural language processing, and computer vision.',
  1,
  0,
  'gpt-4',
  'openai',
  0.7,
  15,
  58,
  73,
  NOW() - INTERVAL '5 seconds',
  NOW() - INTERVAL '2 seconds'
);

-- Insert follow-up user message
INSERT INTO public.conversation_nodes (
  id,
  session_id,
  user_id,
  parent_id,
  role,
  content,
  depth,
  sequence_order
) VALUES (
  'b0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000001',
  '550e8400-e29b-41d4-a716-446655440000',
  'b0000000-0000-0000-0000-000000000002',
  'user',
  'Can you give me some examples of AI applications?',
  2,
  0
);

-- Insert assistant response with examples
INSERT INTO public.conversation_nodes (
  id,
  session_id,
  user_id,
  parent_id,
  role,
  content,
  depth,
  sequence_order,
  model_name,
  model_provider,
  temperature,
  prompt_tokens,
  completion_tokens,
  total_tokens
) VALUES (
  'b0000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000001',
  '550e8400-e29b-41d4-a716-446655440000',
  'b0000000-0000-0000-0000-000000000003',
  'assistant',
  'Here are some common AI applications:

1. **Virtual Assistants**: Siri, Alexa, Google Assistant
2. **Recommendation Systems**: Netflix, Spotify, Amazon product recommendations
3. **Image Recognition**: Face unlock on phones, medical image analysis
4. **Natural Language Processing**: Chatbots, translation services, sentiment analysis
5. **Autonomous Vehicles**: Self-driving cars
6. **Fraud Detection**: Banking and credit card fraud prevention
7. **Healthcare**: Disease diagnosis, drug discovery',
  3,
  0,
  'gpt-4',
  'openai',
  0.7,
  85,
  127,
  212
);

-- Create an alternative branch (different response to the same question)
INSERT INTO public.conversation_nodes (
  id,
  session_id,
  user_id,
  parent_id,
  role,
  content,
  depth,
  sequence_order,
  model_name,
  model_provider,
  temperature,
  prompt_tokens,
  completion_tokens,
  total_tokens
) VALUES (
  'b0000000-0000-0000-0000-000000000005',
  'a0000000-0000-0000-0000-000000000001',
  '550e8400-e29b-41d4-a716-446655440000',
  'b0000000-0000-0000-0000-000000000003',
  'assistant',
  'AI applications are everywhere! Let me categorize them by industry:

**Consumer Technology**: Smart home devices, voice assistants, personalized content feeds
**Healthcare**: Diagnostic tools, treatment planning, robotic surgery
**Finance**: Algorithmic trading, risk assessment, fraud detection
**Transportation**: Self-driving cars, traffic optimization, route planning
**Entertainment**: Game AI, content recommendation, creative tools
**Business**: Customer service chatbots, sales forecasting, process automation',
  3,
  1,
  'gpt-4',
  'openai',
  0.9,
  85,
  115,
  200
);

-- Record the branch option
INSERT INTO public.branch_options (
  session_id,
  parent_node_id,
  child_node_id,
  branch_name,
  branch_description,
  is_active,
  selection_count
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000004',
  'Detailed list format',
  'Response with numbered list and detailed examples',
  true,
  1
);

INSERT INTO public.branch_options (
  session_id,
  parent_node_id,
  child_node_id,
  branch_name,
  branch_description,
  is_active,
  selection_count
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000005',
  'Industry categorization',
  'Response organized by industry sectors',
  false,
  0
);

-- Insert another session for variety
INSERT INTO public.dialog_sessions (
  id,
  user_id,
  title,
  description,
  default_model,
  default_temperature,
  is_pinned
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  '550e8400-e29b-41d4-a716-446655440000',
  'Machine Learning Basics',
  'Learning about machine learning fundamentals',
  'gpt-3.5-turbo',
  0.5,
  false
);

-- Simple conversation in second session
INSERT INTO public.conversation_nodes (
  id,
  session_id,
  user_id,
  parent_id,
  role,
  content,
  depth,
  sequence_order
) VALUES (
  'b0000000-0000-0000-0000-000000000010',
  'a0000000-0000-0000-0000-000000000002',
  '550e8400-e29b-41d4-a716-446655440000',
  NULL,
  'user',
  'What is machine learning?',
  0,
  0
);

INSERT INTO public.conversation_nodes (
  id,
  session_id,
  user_id,
  parent_id,
  role,
  content,
  depth,
  sequence_order,
  model_name,
  model_provider,
  temperature,
  prompt_tokens,
  completion_tokens,
  total_tokens
) VALUES (
  'b0000000-0000-0000-0000-000000000011',
  'a0000000-0000-0000-0000-000000000002',
  '550e8400-e29b-41d4-a716-446655440000',
  'b0000000-0000-0000-0000-000000000010',
  'assistant',
  'Machine learning is a subset of AI that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing algorithms that can access data and use it to learn for themselves.',
  1,
  0,
  'gpt-3.5-turbo',
  'openai',
  0.5,
  12,
  48,
  60
);
*/

-- ============================================================================
-- HELPER QUERIES FOR TESTING
-- ============================================================================

-- Uncomment these to test your seed data:

/*
-- View all sessions for a user
SELECT * FROM public.dialog_sessions 
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY last_activity_at DESC;

-- View conversation tree for a session
SELECT 
  id,
  parent_id,
  role,
  LEFT(content, 50) as content_preview,
  depth,
  sequence_order,
  created_at
FROM public.conversation_nodes
WHERE session_id = 'a0000000-0000-0000-0000-000000000001'
ORDER BY depth, sequence_order;

-- View branch options
SELECT 
  bo.*,
  parent.content as parent_content,
  child.content as child_content
FROM public.branch_options bo
JOIN public.conversation_nodes parent ON bo.parent_node_id = parent.id
JOIN public.conversation_nodes child ON bo.child_node_id = child.id
WHERE bo.session_id = 'a0000000-0000-0000-0000-000000000001';

-- View session statistics
SELECT * FROM session_statistics
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- View node paths (closure table)
SELECT 
  ancestor.content as ancestor_content,
  descendant.content as descendant_content,
  np.depth
FROM public.node_paths np
JOIN public.conversation_nodes ancestor ON np.ancestor_id = ancestor.id
JOIN public.conversation_nodes descendant ON np.descendant_id = descendant.id
WHERE descendant.id = 'b0000000-0000-0000-0000-000000000004'
ORDER BY np.depth DESC;
*/
