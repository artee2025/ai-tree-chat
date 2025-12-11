-- Initial schema for AI tree chat application
-- Created: 2023-12-11

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS / PROFILES TABLE
-- ============================================================================
-- Extends Supabase auth.users with additional profile information

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  preferences JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Index for username lookups
CREATE INDEX idx_profiles_username ON public.profiles(username) WHERE deleted_at IS NULL;

-- Index for soft delete queries
CREATE INDEX idx_profiles_deleted_at ON public.profiles(deleted_at);

-- ============================================================================
-- DIALOG SESSIONS TABLE
-- ============================================================================
-- Stores user chat sessions with metadata

CREATE TABLE public.dialog_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  description TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  default_model TEXT,
  default_temperature DECIMAL(3, 2) DEFAULT 0.7,
  default_max_tokens INTEGER,
  is_pinned BOOLEAN DEFAULT FALSE,
  last_activity_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Index for user's sessions
CREATE INDEX idx_dialog_sessions_user_id ON public.dialog_sessions(user_id) WHERE deleted_at IS NULL;

-- Index for user's pinned sessions
CREATE INDEX idx_dialog_sessions_user_pinned ON public.dialog_sessions(user_id, is_pinned) WHERE deleted_at IS NULL;

-- Index for last activity sorting
CREATE INDEX idx_dialog_sessions_last_activity ON public.dialog_sessions(user_id, last_activity_at DESC) WHERE deleted_at IS NULL;

-- Index for soft delete queries
CREATE INDEX idx_dialog_sessions_deleted_at ON public.dialog_sessions(deleted_at);

-- ============================================================================
-- CONVERSATION NODES TABLE
-- ============================================================================
-- Stores messages/nodes in the conversation tree structure

CREATE TABLE public.conversation_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.dialog_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.conversation_nodes(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'function')),
  content TEXT,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'json', 'markdown', 'code')),
  depth INTEGER NOT NULL DEFAULT 0,
  sequence_order INTEGER NOT NULL DEFAULT 0,
  
  -- Model metadata
  model_name TEXT,
  model_provider TEXT,
  temperature DECIMAL(3, 2),
  max_tokens INTEGER,
  
  -- Streaming state
  is_streaming BOOLEAN DEFAULT FALSE,
  streaming_complete BOOLEAN DEFAULT TRUE,
  stream_error TEXT,
  
  -- Token usage
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  
  -- Timing information
  generation_started_at TIMESTAMPTZ,
  generation_completed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Index for session queries
CREATE INDEX idx_conversation_nodes_session_id ON public.conversation_nodes(session_id) WHERE deleted_at IS NULL;

-- Index for user queries
CREATE INDEX idx_conversation_nodes_user_id ON public.conversation_nodes(user_id) WHERE deleted_at IS NULL;

-- Index for tree traversal (parent-child relationship)
CREATE INDEX idx_conversation_nodes_parent_id ON public.conversation_nodes(parent_id) WHERE deleted_at IS NULL;

-- Composite index for session tree queries
CREATE INDEX idx_conversation_nodes_session_parent ON public.conversation_nodes(session_id, parent_id) WHERE deleted_at IS NULL;

-- Index for streaming state queries
CREATE INDEX idx_conversation_nodes_streaming ON public.conversation_nodes(session_id, is_streaming) WHERE deleted_at IS NULL;

-- Index for depth-based queries (helpful for tree traversal)
CREATE INDEX idx_conversation_nodes_depth ON public.conversation_nodes(session_id, depth) WHERE deleted_at IS NULL;

-- Index for ordering within same parent
CREATE INDEX idx_conversation_nodes_sequence ON public.conversation_nodes(parent_id, sequence_order) WHERE deleted_at IS NULL;

-- Index for soft delete queries
CREATE INDEX idx_conversation_nodes_deleted_at ON public.conversation_nodes(deleted_at);

-- ============================================================================
-- BRANCH OPTIONS TABLE
-- ============================================================================
-- Captures branching metadata and alternative conversation paths

CREATE TABLE public.branch_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.dialog_sessions(id) ON DELETE CASCADE,
  parent_node_id UUID NOT NULL REFERENCES public.conversation_nodes(id) ON DELETE CASCADE,
  child_node_id UUID NOT NULL REFERENCES public.conversation_nodes(id) ON DELETE CASCADE,
  branch_name TEXT,
  branch_description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  selection_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- Ensure a child node can only have one parent in branch options
  CONSTRAINT unique_child_per_session UNIQUE (session_id, child_node_id)
);

-- Index for finding branches from a parent node
CREATE INDEX idx_branch_options_parent_node ON public.branch_options(parent_node_id) WHERE deleted_at IS NULL;

-- Index for finding parent of a child node
CREATE INDEX idx_branch_options_child_node ON public.branch_options(child_node_id) WHERE deleted_at IS NULL;

-- Index for session queries
CREATE INDEX idx_branch_options_session_id ON public.branch_options(session_id) WHERE deleted_at IS NULL;

-- Index for active branches
CREATE INDEX idx_branch_options_active ON public.branch_options(parent_node_id, is_active) WHERE deleted_at IS NULL;

-- Index for soft delete queries
CREATE INDEX idx_branch_options_deleted_at ON public.branch_options(deleted_at);

-- ============================================================================
-- NODE PATHS TABLE (Join table for efficient tree navigation)
-- ============================================================================
-- Stores materialized paths for efficient ancestor/descendant queries

CREATE TABLE public.node_paths (
  ancestor_id UUID NOT NULL REFERENCES public.conversation_nodes(id) ON DELETE CASCADE,
  descendant_id UUID NOT NULL REFERENCES public.conversation_nodes(id) ON DELETE CASCADE,
  depth INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (ancestor_id, descendant_id)
);

-- Index for finding all descendants of a node
CREATE INDEX idx_node_paths_ancestor ON public.node_paths(ancestor_id, depth);

-- Index for finding all ancestors of a node
CREATE INDEX idx_node_paths_descendant ON public.node_paths(descendant_id, depth);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dialog_sessions_updated_at
  BEFORE UPDATE ON public.dialog_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_nodes_updated_at
  BEFORE UPDATE ON public.conversation_nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branch_options_updated_at
  BEFORE UPDATE ON public.branch_options
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update session last_activity_at when nodes are added
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.dialog_sessions
  SET last_activity_at = NOW()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_activity_on_node
  AFTER INSERT ON public.conversation_nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_session_activity();

-- Function to maintain node_paths for tree traversal
CREATE OR REPLACE FUNCTION update_node_paths()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert self-reference
  INSERT INTO public.node_paths (ancestor_id, descendant_id, depth)
  VALUES (NEW.id, NEW.id, 0);
  
  -- Insert paths from ancestors if there is a parent
  IF NEW.parent_id IS NOT NULL THEN
    INSERT INTO public.node_paths (ancestor_id, descendant_id, depth)
    SELECT ancestor_id, NEW.id, depth + 1
    FROM public.node_paths
    WHERE descendant_id = NEW.parent_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER maintain_node_paths
  AFTER INSERT ON public.conversation_nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_node_paths();

-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dialog_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branch_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.node_paths ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - PROFILES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can do everything
CREATE POLICY "Service role has full access to profiles"
  ON public.profiles
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- RLS POLICIES - DIALOG_SESSIONS
-- ============================================================================

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
  ON public.dialog_sessions
  FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Users can create their own sessions
CREATE POLICY "Users can create own sessions"
  ON public.dialog_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
  ON public.dialog_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own sessions (soft delete)
CREATE POLICY "Users can delete own sessions"
  ON public.dialog_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY "Service role has full access to sessions"
  ON public.dialog_sessions
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- RLS POLICIES - CONVERSATION_NODES
-- ============================================================================

-- Users can view nodes in their own sessions
CREATE POLICY "Users can view own conversation nodes"
  ON public.conversation_nodes
  FOR SELECT
  USING (
    auth.uid() = user_id AND 
    deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM public.dialog_sessions
      WHERE id = conversation_nodes.session_id
      AND user_id = auth.uid()
      AND deleted_at IS NULL
    )
  );

-- Users can create nodes in their own sessions
CREATE POLICY "Users can create own conversation nodes"
  ON public.conversation_nodes
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.dialog_sessions
      WHERE id = conversation_nodes.session_id
      AND user_id = auth.uid()
      AND deleted_at IS NULL
    )
  );

-- Users can update nodes in their own sessions
CREATE POLICY "Users can update own conversation nodes"
  ON public.conversation_nodes
  FOR UPDATE
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.dialog_sessions
      WHERE id = conversation_nodes.session_id
      AND user_id = auth.uid()
      AND deleted_at IS NULL
    )
  )
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.dialog_sessions
      WHERE id = conversation_nodes.session_id
      AND user_id = auth.uid()
      AND deleted_at IS NULL
    )
  );

-- Users can delete nodes in their own sessions
CREATE POLICY "Users can delete own conversation nodes"
  ON public.conversation_nodes
  FOR DELETE
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.dialog_sessions
      WHERE id = conversation_nodes.session_id
      AND user_id = auth.uid()
    )
  );

-- Service role has full access
CREATE POLICY "Service role has full access to nodes"
  ON public.conversation_nodes
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- RLS POLICIES - BRANCH_OPTIONS
-- ============================================================================

-- Users can view branches in their own sessions
CREATE POLICY "Users can view own branches"
  ON public.branch_options
  FOR SELECT
  USING (
    deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM public.dialog_sessions
      WHERE id = branch_options.session_id
      AND user_id = auth.uid()
      AND deleted_at IS NULL
    )
  );

-- Users can create branches in their own sessions
CREATE POLICY "Users can create own branches"
  ON public.branch_options
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dialog_sessions
      WHERE id = branch_options.session_id
      AND user_id = auth.uid()
      AND deleted_at IS NULL
    )
  );

-- Users can update branches in their own sessions
CREATE POLICY "Users can update own branches"
  ON public.branch_options
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.dialog_sessions
      WHERE id = branch_options.session_id
      AND user_id = auth.uid()
      AND deleted_at IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dialog_sessions
      WHERE id = branch_options.session_id
      AND user_id = auth.uid()
      AND deleted_at IS NULL
    )
  );

-- Users can delete branches in their own sessions
CREATE POLICY "Users can delete own branches"
  ON public.branch_options
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.dialog_sessions
      WHERE id = branch_options.session_id
      AND user_id = auth.uid()
    )
  );

-- Service role has full access
CREATE POLICY "Service role has full access to branches"
  ON public.branch_options
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- RLS POLICIES - NODE_PATHS
-- ============================================================================

-- Users can view paths for nodes in their own sessions
CREATE POLICY "Users can view own node paths"
  ON public.node_paths
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_nodes
      WHERE id = node_paths.descendant_id
      AND user_id = auth.uid()
      AND deleted_at IS NULL
    )
  );

-- Service role has full access
CREATE POLICY "Service role has full access to node paths"
  ON public.node_paths
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for active conversation paths (useful for displaying conversation history)
CREATE OR REPLACE VIEW active_conversation_paths AS
SELECT 
  cn.id,
  cn.session_id,
  cn.user_id,
  cn.parent_id,
  cn.role,
  cn.content,
  cn.depth,
  cn.sequence_order,
  cn.model_name,
  cn.is_streaming,
  cn.streaming_complete,
  cn.created_at,
  ds.title as session_title,
  ARRAY_AGG(np.ancestor_id ORDER BY np.depth DESC) as ancestor_path
FROM public.conversation_nodes cn
JOIN public.dialog_sessions ds ON cn.session_id = ds.id
LEFT JOIN public.node_paths np ON cn.id = np.descendant_id
WHERE cn.deleted_at IS NULL AND ds.deleted_at IS NULL
GROUP BY cn.id, cn.session_id, cn.user_id, cn.parent_id, cn.role, 
         cn.content, cn.depth, cn.sequence_order, cn.model_name, 
         cn.is_streaming, cn.streaming_complete, cn.created_at, ds.title;

-- View for session statistics
CREATE OR REPLACE VIEW session_statistics AS
SELECT 
  ds.id as session_id,
  ds.user_id,
  ds.title,
  ds.last_activity_at,
  ds.created_at,
  COUNT(DISTINCT cn.id) as total_nodes,
  COUNT(DISTINCT cn.id) FILTER (WHERE cn.role = 'user') as user_messages,
  COUNT(DISTINCT cn.id) FILTER (WHERE cn.role = 'assistant') as assistant_messages,
  SUM(cn.total_tokens) as total_tokens_used,
  MAX(cn.depth) as max_depth,
  COUNT(DISTINCT cn.parent_id) as branch_points
FROM public.dialog_sessions ds
LEFT JOIN public.conversation_nodes cn ON ds.id = cn.session_id AND cn.deleted_at IS NULL
WHERE ds.deleted_at IS NULL
GROUP BY ds.id, ds.user_id, ds.title, ds.last_activity_at, ds.created_at;

-- ============================================================================
-- ENABLE REALTIME
-- ============================================================================

-- Enable realtime for conversation updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_nodes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dialog_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.branch_options;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE public.dialog_sessions IS 'Chat sessions with metadata and configuration';
COMMENT ON TABLE public.conversation_nodes IS 'Individual messages/nodes in the conversation tree';
COMMENT ON TABLE public.branch_options IS 'Branch metadata for conversation paths';
COMMENT ON TABLE public.node_paths IS 'Materialized paths for efficient tree traversal';

COMMENT ON COLUMN public.conversation_nodes.depth IS 'Depth in the conversation tree (0 = root)';
COMMENT ON COLUMN public.conversation_nodes.sequence_order IS 'Order among sibling nodes';
COMMENT ON COLUMN public.conversation_nodes.is_streaming IS 'Whether the node is currently being streamed';
COMMENT ON COLUMN public.conversation_nodes.streaming_complete IS 'Whether streaming has completed successfully';
