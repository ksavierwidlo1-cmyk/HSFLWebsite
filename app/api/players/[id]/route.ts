import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch from Supabase database instead of mock data
    const { data: player, error } = await supabaseAdmin
      .from('players')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(player);
  } catch (error) {
    console.error('Error fetching player:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player' },
      { status: 500 }
    );
  }
}

// Player self-editing endpoint
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.playerId) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
    }

    // Ensure user can only edit their own profile
    if (session.user.playerId !== params.id) {
      return NextResponse.json({ error: 'Forbidden - You can only edit your own profile' }, { status: 403 });
    }

    const body = await request.json();
    
    // Only allow editing description field
    const allowedFields = ['description'];
    const updates: any = {};
    
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('players')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating player:', error);
      return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH /api/players/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  
  // In production, this would update the database
  return NextResponse.json({ 
    success: true, 
    message: 'Player updated successfully',
    player: body 
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // In production, this would delete from database
  return NextResponse.json({ 
    success: true, 
    message: 'Player deleted successfully' 
  });
}
