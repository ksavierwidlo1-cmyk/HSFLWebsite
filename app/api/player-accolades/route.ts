import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch player accolades (optionally filtered by player ID)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');

    let query = supabase
      .from('player_accolades')
      .select(`
        *,
        accolade:accolades(name, abbreviation, description),
        player:players(id, display_name, roblox_username)
      `)
      .order('awarded_date', { ascending: false });

    if (playerId) {
      query = query.eq('player_id', playerId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching player accolades:', error);
    return NextResponse.json({ error: 'Failed to fetch player accolades' }, { status: 500 });
  }
}

// POST - Assign accolade to player
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId, accoladeId, seasonId, seasonName } = body;

    if (!playerId || !accoladeId || !seasonName) {
      return NextResponse.json(
        { error: 'Player ID, Accolade ID, and Season Name are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('player_accolades')
      .insert([
        {
          player_id: playerId,
          accolade_id: accoladeId,
          season_id: seasonId || null,
          season_name: seasonName,
        },
      ])
      .select(`
        *,
        accolade:accolades(name, abbreviation, description),
        player:players(id, display_name, roblox_username)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, playerAccolade: data });
  } catch (error: any) {
    console.error('Error assigning accolade:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to assign accolade' },
      { status: 500 }
    );
  }
}

// DELETE - Remove accolade from player
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Player Accolade ID is required' }, { status: 400 });
    }

    const { error } = await supabase.from('player_accolades').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error removing player accolade:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove accolade' },
      { status: 500 }
    );
  }
}
