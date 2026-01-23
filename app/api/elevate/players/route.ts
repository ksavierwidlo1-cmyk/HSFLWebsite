import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const { data: players, error } = await supabaseAdmin
    .from('elevate302_players')
    .select('*, game_stats:elevate302_game_stats(*)')
    .order('display_name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform snake_case to camelCase
  const formattedPlayers = players?.map(player => ({
    id: player.id,
    displayName: player.display_name,
    robloxUsername: player.roblox_username,
    robloxUserId: player.roblox_user_id,
    profilePicture: player.profile_picture,
    description: player.description,
    discordUsername: player.discord_username,
    teamId: player.team_id,
    roles: player.roles,
    stats: {
      gamesPlayed: player.games_played,
      points: parseFloat(player.points),
      rebounds: parseFloat(player.rebounds),
      assists: parseFloat(player.assists),
      steals: parseFloat(player.steals),
      blocks: parseFloat(player.blocks),
      turnovers: parseFloat(player.turnovers),
      fieldGoalsMade: player.field_goals_made,
      fieldGoalsAttempted: player.field_goals_attempted,
      fieldGoalPercentage: parseFloat(player.field_goal_percentage),
      threePointersMade: player.three_pointers_made,
      threePointersAttempted: player.three_pointers_attempted,
      threePointPercentage: parseFloat(player.three_point_percentage),
      freeThrowsMade: player.free_throws_made,
      freeThrowsAttempted: player.free_throws_attempted,
      freeThrowPercentage: parseFloat(player.free_throw_percentage),
      fouls: player.fouls,
      assistTurnoverRatio: parseFloat(player.assist_turnover_ratio),
      assistPercentage: parseFloat(player.assist_percentage),
      efficiency: parseFloat(player.efficiency),
      minutesPlayed: 0,
    },
    gameStats: player.game_stats?.map((gs: any) => ({
      id: gs.id,
      playerId: gs.player_id,
      gameId: gs.game_id,
      date: gs.date,
      opponent: gs.opponent,
      points: gs.points,
      rebounds: gs.rebounds,
      assists: gs.assists,
      steals: gs.steals,
      blocks: gs.blocks,
      turnovers: gs.turnovers,
      fieldGoalsMade: gs.field_goals_made,
      fieldGoalsAttempted: gs.field_goals_attempted,
      threePointersMade: gs.three_pointers_made,
      threePointersAttempted: gs.three_pointers_attempted,
      freeThrowsMade: gs.free_throws_made,
      freeThrowsAttempted: gs.free_throws_attempted,
      fouls: gs.fouls,
      minutesPlayed: gs.minutes_played,
      result: gs.result,
    })) || [],
  })) || [];

  return NextResponse.json(formattedPlayers);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.robloxUsername) {
      return NextResponse.json(
        { error: 'Roblox username is required' },
        { status: 400 }
      );
    }

    // Fetch Roblox user data
    const userResponse = await fetch(`https://users.roblox.com/v1/usernames/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernames: [body.robloxUsername],
        excludeBannedUsers: true
      })
    });

    const userData = await userResponse.json();
    
    if (!userData.data || userData.data.length === 0) {
      return NextResponse.json(
        { error: 'Roblox user not found' },
        { status: 404 }
      );
    }

    const robloxUser = userData.data[0];
    const userId = robloxUser.id;
    const displayName = robloxUser.displayName;

    let description = '';
    try {
      const descResponse = await fetch(`https://users.roblox.com/v1/users/${userId}`);
      const descData = await descResponse.json();
      description = descData.description || '';
    } catch (e) {
      console.log('Could not fetch description');
    }

    // Fetch profile picture
    let profilePicture = '';
    try {
      const thumbResponse = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`);
      const thumbData = await thumbResponse.json();
      if (thumbData.data && thumbData.data.length > 0) {
        profilePicture = thumbData.data[0].imageUrl;
      }
    } catch (e) {
      console.log('Could not fetch profile picture');
    }

    const stats = body.stats || {};
    const { data, error } = await supabaseAdmin
      .from('elevate302_players')
      .insert({
        display_name: displayName,
        roblox_username: body.robloxUsername,
        roblox_user_id: userId.toString(),
        profile_picture: profilePicture,
        description: description,
        discord_username: body.discordUsername || '',
        team_id: body.teamId || null,
        roles: body.roles || ['Player'],
        games_played: stats.gamesPlayed || 0,
        points: stats.points || 0,
        rebounds: stats.rebounds || 0,
        assists: stats.assists || 0,
        steals: stats.steals || 0,
        blocks: stats.blocks || 0,
        turnovers: stats.turnovers || 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Player created successfully',
      player: data 
    });
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { error: 'Failed to create player' },
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
        { error: 'Player ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (updates.displayName !== undefined) updateData.display_name = updates.displayName;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.discordUsername !== undefined) updateData.discord_username = updates.discordUsername;
    if (updates.teamId !== undefined) updateData.team_id = updates.teamId;
    if (updates.roles !== undefined) updateData.roles = updates.roles;

    const { data, error } = await supabaseAdmin
      .from('elevate302_players')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Player updated successfully',
      player: data 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update player' },
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
        { error: 'Player ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('elevate302_players')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Player deleted successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete player' },
      { status: 500 }
    );
  }
}
