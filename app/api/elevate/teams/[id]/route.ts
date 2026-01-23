import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: team, error } = await supabaseAdmin
      .from('elevate302_teams')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const formattedTeam = {
      id: team.id,
      name: team.name,
      logo: team.logo,
      owner: team.owner,
      generalManager: team.general_manager,
      headCoach: team.head_coach,
      assistantCoaches: team.assistant_coaches,
      conference: team.conference,
      colors: {
        primary: team.primary_color,
        secondary: team.secondary_color,
      },
    };

    return NextResponse.json(formattedTeam);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}
