import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const { data: staff, error } = await supabaseAdmin
    .from('elevate302_staff')
    .select('*')
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formattedStaff = staff?.map(member => ({
    id: member.id,
    name: member.name,
    role: member.role,
    teamId: member.team_id,
    bio: member.bio,
    profilePicture: member.profile_picture,
  })) || [];

  return NextResponse.json(formattedStaff);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('elevate302_staff')
      .insert({
        name: body.name,
        role: body.role,
        team_id: body.teamId || null,
        bio: body.bio || '',
        profile_picture: body.profilePicture || '',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Staff member created successfully',
      staff: data 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create staff member' },
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
        { error: 'Staff ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.teamId !== undefined) updateData.team_id = updates.teamId;
    if (updates.bio !== undefined) updateData.bio = updates.bio;
    if (updates.profilePicture !== undefined) updateData.profile_picture = updates.profilePicture;

    const { data, error } = await supabaseAdmin
      .from('elevate302_staff')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Staff member updated successfully',
      staff: data 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update staff member' },
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
        { error: 'Staff ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('elevate302_staff')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Staff member deleted successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete staff member' },
      { status: 500 }
    );
  }
}
