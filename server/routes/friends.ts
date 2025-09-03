
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Send friend request
router.post('/request', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { targetUserId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (userId === targetUserId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    // Check if friendship already exists
    const { data: existingFriendship } = await supabase
      .from('friendships')
      .select('*')
      .or(`and(requester_id.eq.${userId},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${userId})`)
      .single();

    if (existingFriendship) {
      return res.status(400).json({ error: 'Friendship request already exists' });
    }

    const { data, error } = await supabase
      .from('friendships')
      .insert([{
        requester_id: userId,
        addressee_id: targetUserId,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

// Accept friend request
router.post('/accept/:friendshipId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { friendshipId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { data, error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId)
      .eq('addressee_id', userId)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ error: 'Failed to accept friend request' });
  }
});

// Reject friend request
router.post('/reject/:friendshipId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { friendshipId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId)
      .eq('addressee_id', userId)
      .eq('status', 'pending');

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ error: 'Failed to reject friend request' });
  }
});

// Get friend requests
router.get('/requests', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        requester:profiles!friendships_requester_id_fkey(
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('addressee_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ error: 'Failed to get friend requests' });
  }
});

// Get friends list
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { search } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    let query = supabase
      .from('friendships')
      .select(`
        *,
        requester:profiles!friendships_requester_id_fkey(
          id,
          full_name,
          avatar_url
        ),
        addressee:profiles!friendships_addressee_id_fkey(
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('status', 'accepted')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    const { data, error } = await query;

    if (error) throw error;

    // Transform data to return friend profiles
    const friends = (data || []).map((friendship: any) => {
      const friend = friendship.requester_id === userId 
        ? friendship.addressee 
        : friendship.requester;
      return friend;
    });

    // Apply search filter if provided
    let filteredFriends = friends;
    if (search) {
      const searchTerm = search.toString().toLowerCase();
      filteredFriends = friends.filter((friend: any) =>
        friend.full_name?.toLowerCase().includes(searchTerm)
      );
    }

    res.json(filteredFriends);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Failed to get friends' });
  }
});

// Search users
router.get('/search', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { q } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!q || typeof q !== 'string' || q.length < 2) {
      return res.json([]);
    }

    const searchTerm = q.toLowerCase();

    // Search for users excluding current user
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, bio, institution')
      .neq('id', userId)
      .ilike('full_name', `%${searchTerm}%`)
      .limit(10);

    if (error) throw error;

    // Get friendship status for each user
    const usersWithStatus = await Promise.all(
      (users || []).map(async (user: any) => {
        const { data: friendship } = await supabase
          .from('friendships')
          .select('status, requester_id')
          .or(`and(requester_id.eq.${userId},addressee_id.eq.${user.id}),and(requester_id.eq.${user.id},addressee_id.eq.${userId})`)
          .single();

        return {
          ...user,
          friendship_status: friendship?.status || null,
          is_requester: friendship?.requester_id === userId
        };
      })
    );

    res.json(usersWithStatus);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

export default router;
