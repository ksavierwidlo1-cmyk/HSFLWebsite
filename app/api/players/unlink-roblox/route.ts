import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.playerId) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
    }

    // Unlinking Roblox just means ending the session
    // The actual logout happens on the client side with signOut()
    return NextResponse.json({ 
      success: true, 
      message: 'Ready to unlink - logging out...' 
    });
  } catch (error) {
    console.error('Error in POST /api/players/unlink-roblox:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
