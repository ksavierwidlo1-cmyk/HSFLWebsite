import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const { data: games, error } = await supabaseAdmin
    .from('elevate302_games')
    .select('*')
    .order('scheduled_date', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formattedGames = games?.map(game => ({
    id: game.id,
    homeTeamId: game.home_team_id,
    awayTeamId: game.away_team_id,
    homeScore: game.home_score,
    awayScore: game.away_score,
    scheduledDate: game.scheduled_date,
    status: game.status,
    season: game.season,
  })) || [];

  return NextResponse.json(formattedGames);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('elevate302_games')
      .insert({
        home_team_id: body.homeTeamId,
        away_team_id: body.awayTeamId,
        home_score: body.homeScore || null,
        away_score: body.awayScore || null,
        scheduled_date: body.scheduledDate,
        status: body.status || 'scheduled',
        season: body.season || 'Preseason 1',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Game created successfully',
      game: data 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (updates.homeScore !== undefined) updateData.home_score = updates.homeScore;
    if (updates.awayScore !== undefined) updateData.away_score = updates.awayScore;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.scheduledDate !== undefined) updateData.scheduled_date = updates.scheduledDate;

    const { data, error } = await supabaseAdmin
      .from('elevate302_games')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Game updated successfully',
      game: data 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update game' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('elevate302_games')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Game deleted successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete game' },
      { status: 500 }
    );
  }
}
