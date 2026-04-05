// Run this script to seed your Supabase database with initial data
// Usage: npx tsx scripts/seed-supabase.ts

import { createClient } from '@supabase/supabase-js';
import { teams, players, games, articles } from '../lib/mockData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedDatabase() {
  console.log('🌱 Starting database seed...\n');

  try {
    // 1. Seed Teams
    console.log('📋 Seeding teams...');
    const teamIdMap = new Map<string, string>(); // old ID -> new UUID
    
    for (const team of teams) {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          name: team.name,
          logo: team.logo,
          owner: team.owner,
          general_manager: team.generalManager,
          head_coach: team.headCoach,
          assistant_coaches: team.assistantCoaches,
          conference: team.conference,
          primary_color: team.colors.primary,
          secondary_color: team.colors.secondary,
        })
        .select()
        .single();

      if (error) {
        console.error(`  ❌ Error creating team ${team.name}:`, error.message);
      } else {
        teamIdMap.set(team.id, data.id);
        console.log(`  ✅ Created team: ${team.name}`);
      }
    }

    // 2. Seed Players
    console.log('\n👥 Seeding players...');
    const playerIdMap = new Map<string, string>(); // old ID -> new UUID

    for (const player of players) {
      const newTeamId = player.teamId ? teamIdMap.get(player.teamId) : null;
      
      const { data, error } = await supabase
        .from('players')
        .insert({
          display_name: player.displayName,
          roblox_username: player.robloxUsername,
          roblox_user_id: player.robloxUserId,
          profile_picture: player.profilePicture,
          description: player.description,
          discord_username: player.discordUsername,
          team_id: newTeamId,
          roles: player.roles,
          games_played: player.stats.gamesPlayed,
        })
        .select()
        .single();

      if (error) {
        console.error(`  ❌ Error creating player ${player.displayName}:`, error.message);
      } else {
        playerIdMap.set(player.id, data.id);
        console.log(`  ✅ Created player: ${player.displayName}`);
      }
    }

    // 3. Seed Games
    console.log('\n🏀 Seeding games...');

    for (const game of games) {
      const newHomeTeamId = teamIdMap.get(game.homeTeamId);
      const newAwayTeamId = teamIdMap.get(game.awayTeamId);

      if (!newHomeTeamId || !newAwayTeamId) {
        console.log(`  ⚠️  Skipping game (team not found)`);
        continue;
      }

      const { error } = await supabase
        .from('games')
        .insert({
          home_team_id: newHomeTeamId,
          away_team_id: newAwayTeamId,
          home_score: game.homeScore,
          away_score: game.awayScore,
          scheduled_date: game.scheduledDate,
          status: game.status,
          season: game.season,
        });

      if (error) {
        console.error(`  ❌ Error creating game:`, error.message);
      } else {
        console.log(`  ✅ Created game: ${game.status}`);
      }
    }

    // 4. Seed Articles
    console.log('\n📰 Seeding articles...');

    for (const article of articles) {
      const { error } = await supabase
        .from('articles')
        .insert({
          title: article.title,
          content: article.content,
          author: article.author,
          published_date: article.publishedDate,
          cover_image: article.coverImage,
          excerpt: article.excerpt,
        });

      if (error) {
        console.error(`  ❌ Error creating article ${article.title}:`, error.message);
      } else {
        console.log(`  ✅ Created article: ${article.title}`);
      }
    }

    console.log('\n✨ Database seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  Teams: ${teamIdMap.size}`);
    console.log(`  Players: ${playerIdMap.size}`);
    console.log(`  Games: ${games.length}`);
    console.log(`  Articles: ${articles.length}`);

  } catch (error) {
    console.error('\n❌ Fatal error during seeding:', error);
    process.exit(1);
  }
}

seedDatabase();
