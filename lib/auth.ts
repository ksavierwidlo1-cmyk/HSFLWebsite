import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { supabaseAdmin } from "./supabase";

// List of Discord user IDs that have admin access
const ADMIN_DISCORD_IDS = (process.env.ADMIN_DISCORD_IDS || "")
  .split(",")
  .map(id => id.trim())
  .filter(Boolean);

// Debug: Log environment variables (remove this after debugging)
console.log("Discord Client ID:", process.env.DISCORD_CLIENT_ID);
console.log("Admin IDs:", ADMIN_DISCORD_IDS);
console.log("Raw Admin IDs env:", process.env.ADMIN_DISCORD_IDS);

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
    }),
    {
      id: "roblox",
      name: "Roblox",
      type: "oauth",
      clientId: process.env.ROBLOX_CLIENT_ID || "",
      clientSecret: process.env.ROBLOX_CLIENT_SECRET || "",
      authorization: {
        url: "https://apis.roblox.com/oauth/v1/authorize",
        params: {
          scope: "openid profile",
          response_type: "code",
        },
      },
      token: {
        url: "https://apis.roblox.com/oauth/v1/token",
        async request({ client, params, checks, provider }) {
          const tokenUrl = "https://apis.roblox.com/oauth/v1/token";
          const response = await fetch(tokenUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              code: params.code as string,
              redirect_uri: params.redirect_uri as string,
              client_id: provider.clientId as string,
              client_secret: provider.clientSecret as string,
            }),
          });

          const tokens = await response.json();
          
          if (!response.ok) {
            console.error("[ROBLOX TOKEN ERROR]", tokens);
            throw new Error(`Token exchange failed: ${JSON.stringify(tokens)}`);
          }
          
          console.log("[ROBLOX TOKEN SUCCESS]", { access_token: tokens.access_token ? "present" : "missing" });
          return { tokens };
        },
      },
      userinfo: "https://apis.roblox.com/oauth/v1/userinfo",
      profile(profile: any) {
        return {
          id: profile.sub,
          name: profile.preferred_username || profile.name,
          email: null,
          image: profile.picture,
        };
      },
    },
  ],
  debug: true,
  callbacks: {
    async signIn({ user, account, profile }) {
      // Discord admin authentication
      if (account?.provider === "discord") {
        const discordId = account.providerAccountId;
        console.log("Attempting sign in with Discord ID:", discordId);
        console.log("Is admin?", ADMIN_DISCORD_IDS.includes(discordId));
        return ADMIN_DISCORD_IDS.includes(discordId);
      }
      
      // Roblox player authentication
      if (account?.provider === "roblox" && profile) {
        const robloxUsername = (profile as any).preferred_username || (profile as any).name;
        const robloxId = (profile as any).sub;

        console.log("[ROBLOX AUTH] Starting sign in:", { robloxUsername, robloxId, userId: user.id });

        // Fetch fresh profile picture from Roblox Thumbnails API (more reliable than OAuth picture)
        let robloxAvatar = '';
        try {
          const thumbResponse = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxId}&size=150x150&format=Png&isCircular=false`);
          const thumbData = await thumbResponse.json();
          if (thumbData.data && thumbData.data.length > 0) {
            robloxAvatar = thumbData.data[0].imageUrl;
            console.log("[ROBLOX AUTH] Fetched profile picture from Thumbnails API");
          }
        } catch (err) {
          console.error("[ROBLOX AUTH] Failed to fetch profile picture:", err);
        }

        try {
          // Check if player exists with this Roblox User ID (not username, in case they changed their username)
          const { data: existingPlayer } = await supabaseAdmin
            .from("players")
            .select("id, user_id, roblox_username")
            .eq("roblox_user_id", robloxId)
            .single();

          if (existingPlayer) {
            console.log("[ROBLOX AUTH] Found existing player:", existingPlayer.id);
            
            // Update username and profile picture in case they changed
            const updates: any = {};
            
            // Always update profile picture to ensure fresh URL
            if (robloxAvatar) {
              updates.profile_picture = robloxAvatar;
            }
            
            // Update username if it changed
            if (existingPlayer.roblox_username !== robloxUsername) {
              console.log("[ROBLOX AUTH] Username changed from", existingPlayer.roblox_username, "to", robloxUsername);
              updates.roblox_username = robloxUsername;
            }
            
            // Link user to existing player if not already linked
            if (!existingPlayer.user_id) {
              console.log("[ROBLOX AUTH] Linking user to existing player");
              updates.user_id = user.id;
            } else {
              console.log("[ROBLOX AUTH] Player already linked to user:", existingPlayer.user_id);
            }
            
            // Apply updates only if there are any
            if (Object.keys(updates).length > 0) {
              await supabaseAdmin
                .from("players")
                .update(updates)
                .eq("id", existingPlayer.id);
            }
          } else {
            console.log("[ROBLOX AUTH] Creating new Free Agent player");
            
            // Fetch Roblox profile description
            let robloxDescription = "";
            try {
              const descResponse = await fetch(`https://users.roblox.com/v1/users/${robloxId}`);
              if (descResponse.ok) {
                const userData = await descResponse.json();
                robloxDescription = userData.description || "";
              }
            } catch (err) {
              console.error("[ROBLOX AUTH] Failed to fetch profile description:", err);
            }
            
            // Create new player as Free Agent
            const { data: newPlayer, error: insertError } = await supabaseAdmin.from("players").insert({
              display_name: robloxUsername,
              roblox_username: robloxUsername,
              roblox_user_id: robloxId,
              user_id: user.id,
              team_id: null, // Free Agent - not on a team
              roles: ["Player"],
              profile_picture: robloxAvatar,
              description: robloxDescription,
            }).select().single();
            
            if (insertError) {
              console.error("[ROBLOX AUTH] Error creating player:", insertError);
              console.error("[ROBLOX AUTH] Full insert error:", JSON.stringify(insertError));
              // Still allow sign in even if player creation fails
              return true;
            } else {
              console.log("[ROBLOX AUTH] Created new player:", newPlayer?.id);
            }
          }
          return true;
        } catch (error) {
          console.error("Error in Roblox signIn callback:", error);
          return false;
        }
      }
      
      return false;
    },
    async session({ session, token }) {
      // Add Discord ID to session for admins
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.discordId) {
        session.user.discordId = token.discordId as string;
        session.user.isAdmin = true;
      }
      
      // Add player data to session for Roblox users
      if (token.playerId) {
        session.user.playerId = token.playerId as string;
        session.user.teamId = token.teamId as string | null;
        session.user.playerName = token.playerName as string;
        session.user.profilePicture = token.profilePicture as string;
        console.log("[SESSION] Player session:", { playerId: token.playerId, playerName: token.playerName });
      } else {
        console.log("[SESSION] No player ID in token");
      }
      
      return session;
    },
    async jwt({ token, account, user, trigger }) {
      console.log("[JWT] Called with:", { provider: account?.provider, userId: user?.id, tokenSub: token.sub, trigger, hasPlayerId: !!token.playerId, hasDiscordId: !!token.discordId });
      
      // Store Discord ID in token
      if (account?.provider === "discord") {
        token.discordId = account.providerAccountId;
        
        // For Discord admins, also try to find if they have a linked player account
        // This allows admins to have both admin access AND a player profile
        if (!token.playerId && ADMIN_DISCORD_IDS.includes(account.providerAccountId)) {
          try {
            const { data: player } = await supabaseAdmin
              .from("players")
              .select("id, display_name, team_id, profile_picture")
              .eq("discord_username", user?.name || "")
              .single();
            
            if (player) {
              console.log("[JWT] Discord admin has linked player:", player.id);
              token.playerId = player.id;
              token.teamId = player.team_id;
              token.playerName = player.display_name;
              token.profilePicture = player.profile_picture;
            }
          } catch (error) {
            // No linked player, that's okay
          }
        }
      }
      
      // For Roblox users, fetch player data if we don't have it yet
      // Use token.sub (the user ID) which persists across JWT calls
      if (account?.provider === "roblox" && !token.playerId) {
        const userId = user?.id || token.sub;
        console.log("[JWT] Fetching player data for user:", userId);
        
        try {
          const { data: player, error: playerError } = await supabaseAdmin
            .from("players")
            .select("id, display_name, team_id, profile_picture")
            .eq("user_id", userId)
            .single();

          if (playerError) {
            console.error("[JWT] Error fetching player:", playerError);
            console.error("[JWT] Error details:", JSON.stringify(playerError));
          } else if (player) {
            console.log("[JWT] Found player:", player.id, player.display_name);
            token.playerId = player.id;
            token.teamId = player.team_id;
            token.playerName = player.display_name;
            token.profilePicture = player.profile_picture;
          } else {
            console.log("[JWT] No player found for user:", userId);
          }
        } catch (error) {
          console.error("[JWT] Exception fetching player data:", error);
        }
      } else if (token.playerId) {
        console.log("[JWT] Player data already in token:", token.playerId);
      }
      
      return token;
    },
  },
};

// Helper function to check if a Discord ID has admin access
export function isAdminDiscordId(discordId: string): boolean {
  return ADMIN_DISCORD_IDS.includes(discordId);
}
