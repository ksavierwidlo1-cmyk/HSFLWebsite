import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const { data: teams, error } = await supabaseAdmin
    .from('elevate302_teams')
    .select('*')
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform snake_case to camelCase
  const formattedTeams = teams?.map(team => ({
    id: team.id,
    name: team.name,
    abbreviation: team.name.substring(0, 3).toUpperCase(),
    logo: team.logo,
    owner: team.owner,
    generalManager: team.general_manager,
    headCoach: team.head_coach,
    assistantCoaches: team.assistant_coaches,
    conference: team.conference,
    primaryColor: team.primary_color,
    secondaryColor: team.secondary_color,
    colors: {
      primary: team.primary_color,
      secondary: team.secondary_color,
    },
  })) || [];

  return NextResponse.json(formattedTeams);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.name) {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('elevate302_teams')
      .insert({
        name: body.name,
        logo: body.logo || null,
        owner: body.owner || '',
        general_manager: body.generalManager || '',
        head_coach: body.headCoach || '',
        assistant_coaches: body.assistantCoaches || [],
        conference: body.conference || 'Eastern',
        primary_color: body.primaryColor || '#8cd2fe',
        secondary_color: body.secondaryColor || '#0A0E27',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedTeam = {
      id: data.id,
      name: data.name,
      logo: data.logo,
      owner: data.owner,
      generalManager: data.general_manager,
      headCoach: data.head_coach,
      assistantCoaches: data.assistant_coaches,
      conference: data.conference,
      colors: {
        primary: data.primary_color,
        secondary: data.secondary_color,
      },
    };

    return NextResponse.json({ 
      success: true, 
      message: 'Team created successfully',
      team: formattedTeam 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create team' },
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
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.logo !== undefined) updateData.logo = updates.logo;
    if (updates.owner !== undefined) updateData.owner = updates.owner;
    if (updates.generalManager !== undefined) updateData.general_manager = updates.generalManager;
    if (updates.headCoach !== undefined) updateData.head_coach = updates.headCoach;
    if (updates.assistantCoaches !== undefined) updateData.assistant_coaches = updates.assistantCoaches;
    if (updates.conference !== undefined) updateData.conference = updates.conference;
    if (updates.primaryColor !== undefined) updateData.primary_color = updates.primaryColor;
    if (updates.secondaryColor !== undefined) updateData.secondary_color = updates.secondaryColor;

    const { data, error } = await supabaseAdmin
      .from('elevate302_teams')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Team updated successfully',
      team: data 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update team' },
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
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('elevate302_teams')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Team deleted successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete team' },
      { status: 500 }
    );
  }
}
