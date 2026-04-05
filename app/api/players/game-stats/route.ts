import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET all game stats
export async function GET(request: NextRequest) {
  try {
    const { data: gameStats, error } = await supabaseAdmin
      .from('game_stats')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // Convert snake_case to camelCase (football fields)
    const formattedStats = gameStats?.map(mapStatRow) || [];

    return NextResponse.json(formattedStats);
  } catch (error) {
    console.error('Error fetching game stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch game stats' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const gameStats = await request.json();
    
    // Insert the game stats
    const { data: newGameStats, error: insertError } = await supabaseAdmin
      .from('game_stats')
      .insert(buildStatRow(gameStats))
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { success: false, message: insertError.message },
        { status: 500 }
      );
    }

    // Get all game stats for this player to recalculate averages
    const { data: allGameStats, error: fetchError } = await supabaseAdmin
      .from('game_stats')
      .select('*')
      .eq('player_id', gameStats.playerId);

    if (fetchError || !allGameStats) {
      return NextResponse.json({
        success: true,
        message: 'Game stats added but could not update averages',
      });
    }

    // Recalculate overall stats
    const totalGames = allGameStats.length;
    const updatedStats = {
      games_played: totalGames,
      points: allGameStats.reduce((sum, g) => sum + g.points, 0) / totalGames,
      rebounds: allGameStats.reduce((sum, g) => sum + g.rebounds, 0) / totalGames,
      assists: allGameStats.reduce((sum, g) => sum + g.assists, 0) / totalGames,
      steals: allGameStats.reduce((sum, g) => sum + g.steals, 0) / totalGames,
      blocks: allGameStats.reduce((sum, g) => sum + g.blocks, 0) / totalGames,
      turnovers: allGameStats.reduce((sum, g) => sum + g.turnovers, 0) / totalGames,
      field_goals_made: Math.round(allGameStats.reduce((sum, g) => sum + g.field_goals_made, 0) / totalGames),
      field_goals_attempted: Math.round(allGameStats.reduce((sum, g) => sum + g.field_goals_attempted, 0) / totalGames),
      field_goal_percentage: calculatePercentage(
        allGameStats.reduce((sum, g) => sum + g.field_goals_made, 0),
        allGameStats.reduce((sum, g) => sum + g.field_goals_attempted, 0)
      ),
      three_pointers_made: Math.round(allGameStats.reduce((sum, g) => sum + g.three_pointers_made, 0) / totalGames),
      three_pointers_attempted: Math.round(allGameStats.reduce((sum, g) => sum + g.three_pointers_attempted, 0) / totalGames),
      three_point_percentage: calculatePercentage(
        allGameStats.reduce((sum, g) => sum + g.three_pointers_made, 0),
        allGameStats.reduce((sum, g) => sum + g.three_pointers_attempted, 0)
      ),
      free_throws_made: Math.round(allGameStats.reduce((sum, g) => sum + g.free_throws_made, 0) / totalGames),
      free_throws_attempted: Math.round(allGameStats.reduce((sum, g) => sum + g.free_throws_attempted, 0) / totalGames),
      free_throw_percentage: calculatePercentage(
        allGameStats.reduce((sum, g) => sum + g.free_throws_made, 0),
        allGameStats.reduce((sum, g) => sum + g.free_throws_attempted, 0)
      ),
      fouls: Math.round(allGameStats.reduce((sum, g) => sum + g.fouls, 0) / totalGames),
      assist_turnover_ratio: calculateRatio(
        allGameStats.reduce((sum, g) => sum + g.assists, 0),
        allGameStats.reduce((sum, g) => sum + g.turnovers, 0)
      ),
    };

    // Update player stats
    const { error: updateError } = await supabaseAdmin
      .from('players')
      .update(updatedStats)
      .eq('id', gameStats.playerId);

    if (updateError) {
      console.error('Error updating player stats:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: 'Game stats added successfully',
    });
  } catch (error) {
    console.error('Error adding game stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add game stats' },
      { status: 500 }
    );
  }
}

// Map a DB row to camelCase football stat object
function mapStatRow(stat: any) {
  return {
    id: stat.id,
    playerId: stat.player_id,
    gameId: stat.game_id,
    date: stat.date,
    opponent: stat.opponent,
    result: stat.result,
    // Football passing
    completions: stat.completions || 0,
    passAttempts: stat.pass_attempts || 0,
    passingYards: stat.passing_yards || 0,
    passingTDs: stat.passing_tds || 0,
    interceptions: stat.interceptions || 0,
    passeFumbles: stat.passe_fumbles || 0,
    sacksTaken: stat.sacks_taken || 0,
    // Football rushing
    rushAttempts: stat.rush_attempts || 0,
    rushingYards: stat.rushing_yards || 0,
    rushingTDs: stat.rushing_tds || 0,
    rushFumbles: stat.rush_fumbles || 0,
    // Football receiving
    receptions: stat.receptions || 0,
    targets: stat.targets || 0,
    receivingYards: stat.receiving_yards || 0,
    receivingTDs: stat.receiving_tds || 0,
    recFumbles: stat.rec_fumbles || 0,
    // Blocking
    snaps: stat.snaps || 0,
    sacksAllowed: stat.sacks_allowed || 0,
    // Defense
    tackles: stat.tackles || 0,
    tacklesForLoss: stat.tackles_for_loss || 0,
    defensiveSacks: stat.defensive_sacks || 0,
    hurries: stat.hurries || 0,
    safeties: stat.safeties || 0,
    defInterceptions: stat.def_interceptions || 0,
    passBreakups: stat.pass_breakups || 0,
    receptionsAllowed: stat.receptions_allowed || 0,
    targetsDefended: stat.targets_defended || 0,
    yardsAllowed: stat.yards_allowed || 0,
    touchdownsAllowed: stat.touchdowns_allowed || 0,
    defensiveTDs: stat.defensive_tds || 0,
    forcedFumbles: stat.forced_fumbles || 0,
    fumbleRecoveries: stat.fumble_recoveries || 0,
    // Kicking
    fieldGoalsMade: stat.field_goals_made || 0,
    fieldGoalsAttempted: stat.field_goals_attempted || 0,
    extraPointsMade: stat.extra_points_made || 0,
    extraPointsAttempted: stat.extra_points_attempted || 0,
    // Returning
    returns: stat.returns || 0,
    returnYards: stat.return_yards || 0,
    returnTDs: stat.return_tds || 0,
    returnFumbles: stat.return_fumbles || 0,
  };
}

// Build a DB row from camelCase football stat object
function buildStatRow(gs: any) {
  return {
    player_id: gs.playerId,
    game_id: gs.gameId,
    date: gs.date,
    opponent: gs.opponent,
    result: gs.result,
    completions: gs.completions || 0,
    pass_attempts: gs.passAttempts || 0,
    passing_yards: gs.passingYards || 0,
    passing_tds: gs.passingTDs || 0,
    interceptions: gs.interceptions || 0,
    passe_fumbles: gs.passeFumbles || 0,
    sacks_taken: gs.sacksTaken || 0,
    rush_attempts: gs.rushAttempts || 0,
    rushing_yards: gs.rushingYards || 0,
    rushing_tds: gs.rushingTDs || 0,
    rush_fumbles: gs.rushFumbles || 0,
    receptions: gs.receptions || 0,
    targets: gs.targets || 0,
    receiving_yards: gs.receivingYards || 0,
    receiving_tds: gs.receivingTDs || 0,
    rec_fumbles: gs.recFumbles || 0,
    snaps: gs.snaps || 0,
    sacks_allowed: gs.sacksAllowed || 0,
    tackles: gs.tackles || 0,
    tackles_for_loss: gs.tacklesForLoss || 0,
    defensive_sacks: gs.defensiveSacks || 0,
    hurries: gs.hurries || 0,
    safeties: gs.safeties || 0,
    def_interceptions: gs.defInterceptions || 0,
    pass_breakups: gs.passBreakups || 0,
    receptions_allowed: gs.receptionsAllowed || 0,
    targets_defended: gs.targetsDefended || 0,
    yards_allowed: gs.yardsAllowed || 0,
    touchdowns_allowed: gs.touchdownsAllowed || 0,
    defensive_tds: gs.defensiveTDs || 0,
    forced_fumbles: gs.forcedFumbles || 0,
    fumble_recoveries: gs.fumbleRecoveries || 0,
    field_goals_made: gs.fieldGoalsMade || 0,
    field_goals_attempted: gs.fieldGoalsAttempted || 0,
    extra_points_made: gs.extraPointsMade || 0,
    extra_points_attempted: gs.extraPointsAttempted || 0,
    returns: gs.returns || 0,
    return_yards: gs.returnYards || 0,
    return_tds: gs.returnTDs || 0,
    return_fumbles: gs.returnFumbles || 0,
  };
}

function calculatePercentage(made: number, attempted: number): number {
  if (attempted === 0) return 0;
  return (made / attempted) * 100;
}

function calculateRatio(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return numerator / denominator;
}

// Helper function to recalculate player stats
async function recalculatePlayerStats(playerId: string) {
  const { data: allGameStats, error: fetchError } = await supabaseAdmin
    .from('game_stats')
    .select('*')
    .eq('player_id', playerId);

  if (fetchError || !allGameStats || allGameStats.length === 0) {
    // No game stats, reset player stats
    await supabaseAdmin
      .from('players')
      .update({
        games_played: 0,
        points: 0,
        rebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        turnovers: 0,
        field_goals_made: 0,
        field_goals_attempted: 0,
        field_goal_percentage: 0,
        three_pointers_made: 0,
        three_pointers_attempted: 0,
        three_point_percentage: 0,
        free_throws_made: 0,
        free_throws_attempted: 0,
        free_throw_percentage: 0,
        fouls: 0,
      })
      .eq('id', playerId);
    return;
  }

  const totalGames = allGameStats.length;
  const updatedStats = {
    games_played: totalGames,
    points: allGameStats.reduce((sum, g) => sum + g.points, 0) / totalGames,
    rebounds: allGameStats.reduce((sum, g) => sum + g.rebounds, 0) / totalGames,
    assists: allGameStats.reduce((sum, g) => sum + g.assists, 0) / totalGames,
    steals: allGameStats.reduce((sum, g) => sum + g.steals, 0) / totalGames,
    blocks: allGameStats.reduce((sum, g) => sum + g.blocks, 0) / totalGames,
    turnovers: allGameStats.reduce((sum, g) => sum + g.turnovers, 0) / totalGames,
    field_goals_made: Math.round(allGameStats.reduce((sum, g) => sum + g.field_goals_made, 0) / totalGames),
    field_goals_attempted: Math.round(allGameStats.reduce((sum, g) => sum + g.field_goals_attempted, 0) / totalGames),
    field_goal_percentage: calculatePercentage(
      allGameStats.reduce((sum, g) => sum + g.field_goals_made, 0),
      allGameStats.reduce((sum, g) => sum + g.field_goals_attempted, 0)
    ),
    three_pointers_made: Math.round(allGameStats.reduce((sum, g) => sum + g.three_pointers_made, 0) / totalGames),
    three_pointers_attempted: Math.round(allGameStats.reduce((sum, g) => sum + g.three_pointers_attempted, 0) / totalGames),
    three_point_percentage: calculatePercentage(
      allGameStats.reduce((sum, g) => sum + g.three_pointers_made, 0),
      allGameStats.reduce((sum, g) => sum + g.three_pointers_attempted, 0)
    ),
    free_throws_made: Math.round(allGameStats.reduce((sum, g) => sum + g.free_throws_made, 0) / totalGames),
    free_throws_attempted: Math.round(allGameStats.reduce((sum, g) => sum + g.free_throws_attempted, 0) / totalGames),
    free_throw_percentage: calculatePercentage(
      allGameStats.reduce((sum, g) => sum + g.free_throws_made, 0),
      allGameStats.reduce((sum, g) => sum + g.free_throws_attempted, 0)
    ),
    fouls: Math.round(allGameStats.reduce((sum, g) => sum + g.fouls, 0) / totalGames),
    assist_turnover_ratio: calculateRatio(
      allGameStats.reduce((sum, g) => sum + g.assists, 0),
      allGameStats.reduce((sum, g) => sum + g.turnovers, 0)
    ),
  };

  await supabaseAdmin
    .from('players')
    .update(updatedStats)
    .eq('id', playerId);
}

// PUT - Update existing game stats
export async function PUT(request: NextRequest) {
  try {
    const gameStats = await request.json();
    
    if (!gameStats.id) {
      return NextResponse.json(
        { success: false, message: 'Game stats ID is required' },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from('game_stats')
      .update(buildStatRow(gameStats))
      .eq('id', gameStats.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, message: updateError.message },
        { status: 500 }
      );
    }

    // Recalculate player stats
    await recalculatePlayerStats(gameStats.playerId);

    return NextResponse.json({
      success: true,
      message: 'Game stats updated successfully',
    });
  } catch (error) {
    console.error('Error updating game stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update game stats' },
      { status: 500 }
    );
  }
}

// DELETE - Remove game stats
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Game stats ID is required' },
        { status: 400 }
      );
    }

    // Get the player ID before deleting
    const { data: stat } = await supabaseAdmin
      .from('game_stats')
      .select('player_id')
      .eq('id', id)
      .single();

    if (!stat) {
      return NextResponse.json(
        { success: false, message: 'Game stats not found' },
        { status: 404 }
      );
    }

    const playerId = stat.player_id;

    // Delete the game stats
    const { error: deleteError } = await supabaseAdmin
      .from('game_stats')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json(
        { success: false, message: deleteError.message },
        { status: 500 }
      );
    }

    // Recalculate player stats
    await recalculatePlayerStats(playerId);

    return NextResponse.json({
      success: true,
      message: 'Game stats deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting game stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete game stats' },
      { status: 500 }
    );
  }
}
