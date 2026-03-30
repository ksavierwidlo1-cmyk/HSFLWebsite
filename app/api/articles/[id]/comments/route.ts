import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Get comments for an article
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: comments, error } = await supabaseAdmin
      .from('article_comments')
      .select(`
        id,
        content,
        created_at,
        player_id,
        players:player_id (
          id,
          display_name,
          roblox_username,
          profile_picture,
          roles
        )
      `)
      .eq('article_id', params.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error in GET /api/articles/[id]/comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add a comment to an article
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.playerId) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: 'Comment is too long (max 1000 characters)' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('article_comments')
      .insert({
        article_id: params.id,
        player_id: session.user.playerId,
        content: content.trim(),
      })
      .select(`
        id,
        content,
        created_at,
        player_id,
        players:player_id (
          id,
          display_name,
          roblox_username,
          profile_picture
        )
      `)
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/articles/[id]/comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a comment (only your own)
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
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    // Only allow deleting your own comments
    const { error } = await supabaseAdmin
      .from('article_comments')
      .delete()
      .eq('id', commentId)
      .eq('player_id', session.user.playerId);

    if (error) {
      console.error('Error deleting comment:', error);
      return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/articles/[id]/comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
