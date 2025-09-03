
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Get or create conversation between two users
router.post('/create', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { participantId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (userId === participantId) {
      return res.status(400).json({ error: 'Cannot create conversation with yourself' });
    }

    // Check if conversation already exists
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(participant_1.eq.${userId},participant_2.eq.${participantId}),and(participant_1.eq.${participantId},participant_2.eq.${userId})`)
      .single();

    if (existingConversation) {
      return res.json(existingConversation);
    }

    // Create new conversation
    const participant1 = userId < participantId ? userId : participantId;
    const participant2 = userId < participantId ? participantId : userId;

    const { data, error } = await supabase
      .from('conversations')
      .insert([{
        participant_1: participant1,
        participant_2: participant2
      }])
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get user's conversations
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant_1_profile:profiles!conversations_participant_1_fkey(
          id,
          full_name,
          avatar_url
        ),
        participant_2_profile:profiles!conversations_participant_2_fkey(
          id,
          full_name,
          avatar_url
        ),
        last_message:private_messages(
          content,
          created_at
        )
      `)
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Transform data to include the other participant's info
    const conversations = (data || []).map((conv: any) => {
      const otherParticipant = conv.participant_1 === userId 
        ? conv.participant_2_profile 
        : conv.participant_1_profile;
      
      return {
        ...conv,
        other_participant: otherParticipant,
        last_message: conv.last_message?.[0] || null
      };
    });

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Get messages for a conversation
router.get('/:conversationId/messages', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify user is part of the conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .single();

    if (!conversation) {
      return res.status(403).json({ error: 'Access denied to this conversation' });
    }

    const { data, error } = await supabase
      .from('private_messages')
      .select(`
        *,
        sender:profiles!private_messages_sender_id_fkey(
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) throw error;

    res.json((data || []).reverse());
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Send message
router.post('/:conversationId/messages', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { conversationId } = req.params;
    const { content, message_type = 'text' } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Verify user is part of the conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .single();

    if (!conversation) {
      return res.status(403).json({ error: 'Access denied to this conversation' });
    }

    const { data, error } = await supabase
      .from('private_messages')
      .insert([{
        conversation_id: conversationId,
        sender_id: userId,
        content: content.trim(),
        message_type
      }])
      .select(`
        *,
        sender:profiles!private_messages_sender_id_fkey(
          id,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;

    // Update conversation's updated_at timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    res.json(data);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
