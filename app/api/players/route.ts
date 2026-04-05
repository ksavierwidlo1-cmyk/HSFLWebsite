import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// Helper function to fetch fresh avatar URLs from Roblox
async function fetchAvatarUrls(userIds: string[]): Promise<Map<string, string>> {
  const avatarMap = new Map<string, string>();
  
  if (userIds.length === 0) return avatarMap;
  
  try {
    // Roblox API supports up to 100 user IDs per request
    const chunks = [];
    for (let i = 0; i < userIds.length; i += 100) {
      chunks.push(userIds.slice(i, i + 100));
    }
    
    for (const chunk of chunks) {
      const response = await fetch(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${chunk.join(',')}&size=150x150&format=Png&isCircular=false`
      );
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        for (const item of data.data) {
          if (item.targetId && item.imageUrl) {
            avatarMap.set(item.targetId.toString(), item.imageUrl);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching avatars:', error);
  }
  
  return avatarMap;
}

export async function GET() {
  const { data: players, error } = await supabaseAdmin
    .from('players')
    .select('*, game_stats(*)')
    .order('display_name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch fresh avatar URLs for all players
  const userIds = players?.filter(p => p.roblox_user_id).map(p => p.roblox_user_id) || [];
  const avatarUrls = await fetchAvatarUrls(userIds);

  // Transform snake_case to camelCase
  const formattedPlayers = players?.map(player => ({
    id: player.id,
    displayName: player.display_name,
    robloxUsername: player.roblox_username,
    robloxUserId: player.roblox_user_id,
    profilePicture: player.roblox_user_id ? (avatarUrls.get(player.roblox_user_id) || player.profile_picture) : player.profile_picture,
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
    },
    jerseyNumber: player.jersey_number ?? null,
    positions: player.positions ?? [],
    starRating: player.star_rating ?? 0,
    gameStats: player.game_stats?.map((gs: any) => ({
      id: gs.id,
      playerId: gs.player_id,
      gameId: gs.game_id,
      date: gs.date,
      opponent: gs.opponent,
      result: gs.result,
      completions: gs.completions || 0,
      passAttempts: gs.pass_attempts || 0,
      passingYards: gs.passing_yards || 0,
      passingTDs: gs.passing_tds || 0,
      interceptions: gs.interceptions || 0,
      passeFumbles: gs.passe_fumbles || 0,
      sacksTaken: gs.sacks_taken || 0,
      rushAttempts: gs.rush_attempts || 0,
      rushingYards: gs.rushing_yards || 0,
      rushingTDs: gs.rushing_tds || 0,
      rushFumbles: gs.rush_fumbles || 0,
      receptions: gs.receptions || 0,
      targets: gs.targets || 0,
      receivingYards: gs.receiving_yards || 0,
      receivingTDs: gs.receiving_tds || 0,
      recFumbles: gs.rec_fumbles || 0,
      snaps: gs.snaps || 0,
      sacksAllowed: gs.sacks_allowed || 0,
      tackles: gs.tackles || 0,
      tacklesForLoss: gs.tackles_for_loss || 0,
      defensiveSacks: gs.defensive_sacks || 0,
      hurries: gs.hurries || 0,
      safeties: gs.safeties || 0,
      defInterceptions: gs.def_interceptions || 0,
      passBreakups: gs.pass_breakups || 0,
      receptionsAllowed: gs.receptions_allowed || 0,
      targetsDefended: gs.targets_defended || 0,
      yardsAllowed: gs.yards_allowed || 0,
      touchdownsAllowed: gs.touchdowns_allowed || 0,
      defensiveTDs: gs.defensive_tds || 0,
      forcedFumbles: gs.forced_fumbles || 0,
      fumbleRecoveries: gs.fumble_recoveries || 0,
      fieldGoalsMade: gs.field_goals_made || 0,
      fieldGoalsAttempted: gs.field_goals_attempted || 0,
      extraPointsMade: gs.extra_points_made || 0,
      extraPointsAttempted: gs.extra_points_attempted || 0,
      returns: gs.returns || 0,
      returnYards: gs.return_yards || 0,
      returnTDs: gs.return_tds || 0,
      returnFumbles: gs.return_fumbles || 0,
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
    try {
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

      // Fetch profile picture from Roblox thumbnails API
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
        .from('players')
        .insert({
          display_name: displayName,
          roblox_username: body.robloxUsername,
          roblox_user_id: userId.toString(),
          profile_picture: profilePicture,
          description: description,
          discord_username: body.discordUsername || '',
          team_id: body.teamId || null,
          roles: body.roles || ['Player'],
          jersey_number: body.jerseyNumber != null ? body.jerseyNumber : null,
          positions: body.positions || [],
          star_rating: body.starRating ?? 0,
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
        message: 'Player imported successfully',
        player: {
          id: data.id,
          displayName: data.display_name,
          robloxUsername: data.roblox_username,
        }
      });
    } catch (error) {
      console.error('Roblox API error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch Roblox user data' },
        { status: 500 }
      );
    }
  } catch (error) {
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
    if (updates.teamId !== undefined) updateData.team_id = updates.teamId || null;
    if (updates.discordUsername !== undefined) updateData.discord_username = updates.discordUsername;
    if (updates.roles !== undefined) updateData.roles = updates.roles;
    if (updates.jerseyNumber !== undefined) updateData.jersey_number = updates.jerseyNumber;
    if (updates.positions !== undefined) updateData.positions = updates.positions;
    if (updates.starRating !== undefined) updateData.star_rating = updates.starRating;
    
    if (updates.stats) {
      const stats = updates.stats;
      if (stats.gamesPlayed !== undefined) updateData.games_played = stats.gamesPlayed;
      if (stats.points !== undefined) updateData.points = stats.points;
      if (stats.rebounds !== undefined) updateData.rebounds = stats.rebounds;
      if (stats.assists !== undefined) updateData.assists = stats.assists;
      if (stats.steals !== undefined) updateData.steals = stats.steals;
      if (stats.blocks !== undefined) updateData.blocks = stats.blocks;
      if (stats.turnovers !== undefined) updateData.turnovers = stats.turnovers;
      if (stats.fieldGoalsMade !== undefined) updateData.field_goals_made = stats.fieldGoalsMade;
      if (stats.fieldGoalsAttempted !== undefined) updateData.field_goals_attempted = stats.fieldGoalsAttempted;
      if (stats.fieldGoalPercentage !== undefined) updateData.field_goal_percentage = stats.fieldGoalPercentage;
      if (stats.threePointersMade !== undefined) updateData.three_pointers_made = stats.threePointersMade;
      if (stats.threePointersAttempted !== undefined) updateData.three_pointers_attempted = stats.threePointersAttempted;
      if (stats.threePointPercentage !== undefined) updateData.three_point_percentage = stats.threePointPercentage;
      if (stats.freeThrowsMade !== undefined) updateData.free_throws_made = stats.freeThrowsMade;
      if (stats.freeThrowsAttempted !== undefined) updateData.free_throws_attempted = stats.freeThrowsAttempted;
      if (stats.freeThrowPercentage !== undefined) updateData.free_throw_percentage = stats.freeThrowPercentage;
      if (stats.fouls !== undefined) updateData.fouls = stats.fouls;
      if (stats.assistTurnoverRatio !== undefined) updateData.assist_turnover_ratio = stats.assistTurnoverRatio;
      if (stats.assistPercentage !== undefined) updateData.assist_percentage = stats.assistPercentage;
      if (stats.efficiency !== undefined) updateData.efficiency = stats.efficiency;
    }

    const { data, error } = await supabaseAdmin
      .from('players')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Player updated successfully',
      player: { id: data.id }
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
      .from('players')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
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
