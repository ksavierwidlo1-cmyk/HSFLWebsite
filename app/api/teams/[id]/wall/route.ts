import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// Helper function to fetch fresh avatar URL from Roblox
async function fetchAvatarUrl(userId: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`
    );
    const data = await response.json();
    
    if (data.data && data.data.length > 0 && data.data[0].imageUrl) {
      return data.data[0].imageUrl;
    }
  } catch (error) {
    console.error('Error fetching avatar:', error);
  }
  return null;
}

// GET - Get wall posts for a team
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: posts, error } = await supabaseAdmin
      .from('team_wall_posts')
      .select(`
        id,
        content,
        is_pinned,
        created_at,
        player_id,
        players:player_id (
          id,
          display_name,
          roblox_username,
          roblox_user_id,
          profile_picture,
          roles
        )
      `)
      .eq('team_id', params.id)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wall posts:', error);
      return NextResponse.json({ error: 'Failed to fetch wall posts' }, { status: 500 });
    }

    // Fetch fresh avatar URLs for all players in posts
    if (posts && posts.length > 0) {
      const postsWithFreshAvatars = await Promise.all(
        posts.map(async (post) => {
          if (post.players?.roblox_user_id) {
            const freshAvatar = await fetchAvatarUrl(post.players.roblox_user_id);
            if (freshAvatar) {
              return {
                ...post,
                players: {
                  ...post.players,
                  profile_picture: freshAvatar,
                },
              };
            }
          }
          return post;
        })
      );
      return NextResponse.json({ posts: postsWithFreshAvatars });
    }

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error in GET /api/teams/[id]/wall:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a wall post
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.playerId) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
    }

    // Check if user is on this team
    const { data: player } = await supabaseAdmin
      .from('players')
      .select('team_id')
      .eq('id', session.user.playerId)
      .single();

    if (!player || player.team_id !== params.id) {
      return NextResponse.json({ error: 'Forbidden - You must be on this team to post' }, { status: 403 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Post content is required' }, { status: 400 });
    }

    if (content.length > 500) {
      return NextResponse.json({ error: 'Post is too long (max 500 characters)' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('team_wall_posts')
      .insert({
        team_id: params.id,
        player_id: session.user.playerId,
        content: content.trim(),
        is_pinned: false,
      })
      .select(`
        id,
        content,
        is_pinned,
        created_at,
        player_id,
        players:player_id (
          id,
          display_name,
          roblox_username,
          roblox_user_id,
          profile_picture,
          roles
        )
      `)
      .single();

    if (error) {
      console.error('Error creating wall post:', error);
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }

    // Fetch fresh avatar URL for the post author
    if (data.players?.roblox_user_id) {
      const freshAvatar = await fetchAvatarUrl(data.players.roblox_user_id);
      if (freshAvatar) {
        data.players.profile_picture = freshAvatar;
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/teams/[id]/wall:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Pin/unpin a post (franchise owners only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.playerId) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
    }

    const body = await request.json();
    const { postId, isPinned } = body;

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Check if user is a franchise owner of this team
    const { data: player } = await supabaseAdmin
      .from('players')
      .select('team_id, roles')
      .eq('id', session.user.playerId)
      .single();

    if (!player || player.team_id !== params.id || !player.roles.includes('Franchise Owner')) {
      return NextResponse.json({ error: 'Forbidden - Only franchise owners can pin posts' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('team_wall_posts')
      .update({ is_pinned: isPinned })
      .eq('id', postId)
      .eq('team_id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating post:', error);
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH /api/teams/[id]/wall:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a post (own posts or franchise owners)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.playerId) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Check if user is a franchise owner or post owner
    const { data: player } = await supabaseAdmin
      .from('players')
      .select('team_id, roles')
      .eq('id', session.user.playerId)
      .single();

    const { data: post } = await supabaseAdmin
      .from('team_wall_posts')
      .select('player_id')
      .eq('id', postId)
      .single();

    const isFranchiseOwner = player?.team_id === params.id && player?.roles.includes('Franchise Owner');
    const isPostOwner = post?.player_id === session.user.playerId;

    if (!isFranchiseOwner && !isPostOwner) {
      return NextResponse.json({ error: 'Forbidden - You can only delete your own posts' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('team_wall_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Error deleting post:', error);
      return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/teams/[id]/wall:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
