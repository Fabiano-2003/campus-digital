
-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- Add RLS policies
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their friendships" ON friendships;
DROP POLICY IF EXISTS "Users can create friendship requests" ON friendships;
DROP POLICY IF EXISTS "Users can update their friendship requests" ON friendships;
DROP POLICY IF EXISTS "Users can delete friendship requests" ON friendships;

-- Users can see their own friendship requests
CREATE POLICY "Users can view their friendships" ON friendships
FOR SELECT USING (
  auth.uid() = requester_id OR auth.uid() = addressee_id
);

-- Users can create friendship requests
CREATE POLICY "Users can create friendship requests" ON friendships
FOR INSERT WITH CHECK (
  auth.uid() = requester_id
);

-- Users can update friendship status (accept/reject)
CREATE POLICY "Users can update their friendship requests" ON friendships
FOR UPDATE USING (
  auth.uid() = addressee_id AND status = 'pending'
);

-- Users can delete their friendship requests
CREATE POLICY "Users can delete friendship requests" ON friendships
FOR DELETE USING (
  auth.uid() = requester_id OR auth.uid() = addressee_id
);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_friendships_updated_at ON friendships;
CREATE TRIGGER update_friendships_updated_at
    BEFORE UPDATE ON friendships
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Create conversations table for private messages
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant_1, participant_2)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON conversations(participant_1);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON conversations(participant_2);

-- Add RLS policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

CREATE POLICY "Users can view their conversations" ON conversations
FOR SELECT USING (
  auth.uid() = participant_1 OR auth.uid() = participant_2
);

CREATE POLICY "Users can create conversations" ON conversations
FOR INSERT WITH CHECK (
  auth.uid() = participant_1 OR auth.uid() = participant_2
);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Create private_messages table
CREATE TABLE IF NOT EXISTS private_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_private_messages_conversation ON private_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_sender ON private_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_created_at ON private_messages(created_at);

-- Add RLS policies
ALTER TABLE private_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON private_messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON private_messages;

CREATE POLICY "Users can view messages in their conversations" ON private_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = conversation_id 
    AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their conversations" ON private_messages
FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = conversation_id 
    AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
  )
);

-- Function to get friendship status between two users
CREATE OR REPLACE FUNCTION get_friendship_status(user1_id UUID, user2_id UUID)
RETURNS TABLE(status TEXT, is_requester BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.status,
    (f.requester_id = user1_id) as is_requester
  FROM friendships f
  WHERE 
    (f.requester_id = user1_id AND f.addressee_id = user2_id) OR
    (f.requester_id = user2_id AND f.addressee_id = user1_id)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
