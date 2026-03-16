import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Utility endpoint to refresh all player profile pictures
 * This fetches fresh URLs from Roblox Thumbnails API
 * Call this to fix broken/expired avatar URLs
 */
export async function POST() {
  try {
    // Get all players with Roblox User IDs
    const { data: players, error } = await supabaseAdmin
      .from('players')
      .select('id, roblox_user_id, display_name')
      .not('roblox_user_id', 'is', null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    // Process players in batches to avoid rate limits
    for (const player of players || []) {
      try {
        // Fetch fresh profile picture from Roblox Thumbnails API
        const thumbResponse = await fetch(
          `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${player.roblox_user_id}&size=150x150&format=Png&isCircular=false`
        );
        
        if (!thumbResponse.ok) {
          throw new Error(`Thumbnails API returned ${thumbResponse.status}`);
        }

        const thumbData = await thumbResponse.json();
        
        if (thumbData.data && thumbData.data.length > 0) {
          const newProfilePicture = thumbData.data[0].imageUrl;
          
          // Update player with fresh URL
          const { error: updateError } = await supabaseAdmin
            .from('players')
            .update({ profile_picture: newProfilePicture })
            .eq('id', player.id);

          if (updateError) {
            throw updateError;
          }

          successCount++;
          console.log(`✓ Updated ${player.display_name} (${player.roblox_user_id})`);
        } else {
          throw new Error('No thumbnail data returned');
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err: any) {
        failCount++;
        const errorMsg = `Failed for ${player.display_name}: ${err.message}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile picture refresh completed',
      stats: {
        total: players?.length || 0,
        successful: successCount,
        failed: failCount,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error refreshing avatars:', error);
    return NextResponse.json(
      { error: 'Failed to refresh avatars', details: error.message },
      { status: 500 }
    );
  }
}
