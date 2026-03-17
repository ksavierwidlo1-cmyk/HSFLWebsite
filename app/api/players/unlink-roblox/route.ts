import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.playerId) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
    }

    // Unlink Roblox account by clearing roblox-related fields
    const { error } = await supabaseAdmin
      .from('players')
      .update({
        roblox_user_id: null,
        roblox_username: null,
        profile_picture: null,
      })
      .eq('id', session.user.playerId);

    if (error) {
      console.error('Error unlinking Roblox account:', error);
      return NextResponse.json({ error: 'Failed to unlink Roblox account' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Roblox account unlinked successfully' 
    });
  } catch (error) {
    console.error('Error in POST /api/players/unlink-roblox:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
