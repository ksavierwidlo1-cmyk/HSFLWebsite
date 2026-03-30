"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MessageSquare, Pin, Trash2, Crown, Hammer } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TeamWallProps {
  teamId: string;
}

export default function TeamWall({ teamId }: TeamWallProps) {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [canPost, setCanPost] = useState(false);
  const [isFranchiseOwner, setIsFranchiseOwner] = useState(false);

  useEffect(() => {
    fetchPosts();
    checkPermissions();
  }, [teamId, session]);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`/api/teams/${teamId}/wall`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Error fetching wall posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkPermissions = async () => {
    if (!session?.user?.playerId) {
      setCanPost(false);
      setIsFranchiseOwner(false);
      return;
    }

    // Check if user is on this team
    try {
      const res = await fetch(`/api/players/${session.user.playerId}`);
      if (res.ok) {
        const player = await res.json();
        setCanPost(player.teamId === teamId);
        setIsFranchiseOwner(player.roles?.includes("Franchise Owner") && player.teamId === teamId);
      }
    } catch (error) {
      console.error("Error checking permissions:", error);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !canPost) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/wall`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPost }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(prev => [data, ...prev]);
        setNewPost("");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to post");
      }
    } catch (error) {
      console.error("Error posting:", error);
      alert("Failed to post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePin = async (postId: string, currentPinned: boolean) => {
    if (!isFranchiseOwner) return;

    try {
      const res = await fetch(`/api/teams/${teamId}/wall`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, isPinned: !currentPinned }),
      });

      if (res.ok) {
        setPosts(prev =>
          prev.map(post =>
            post.id === postId ? { ...post, is_pinned: !currentPinned } : post
          ).sort((a, b) => {
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          })
        );
      }
    } catch (error) {
      console.error("Error toggling pin:", error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Delete this post?")) return;

    try {
      const res = await fetch(`/api/teams/${teamId}/wall?postId=${postId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPosts(prev => prev.filter(post => post.id !== postId));
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-6 h-6 text-eba-blue" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team Wall</h2>
      </div>

      {/* Post Form */}
      {canPost && (
        <form onSubmit={handlePostSubmit} className="mb-6">
          <div className="flex gap-3">
            {session?.user?.profilePicture && (
              <img
                src={session.user.profilePicture}
                alt="Your avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Post to your team wall..."
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-eba-blue text-gray-900 dark:text-white resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">{newPost.length}/500</span>
                <button
                  type="submit"
                  disabled={submitting || !newPost.trim()}
                  className="px-4 py-2 bg-eba-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {!canPost && session?.user?.playerId && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            Only team members can post on the team wall.
          </p>
        </div>
      )}

      {/* Posts List */}
      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">Loading posts...</div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`flex gap-3 p-4 rounded-lg ${
                post.is_pinned
                  ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-eba-blue"
                  : "bg-gray-50 dark:bg-gray-700"
              }`}
            >
              {post.players?.profile_picture && (
                <img
                  src={post.players.profile_picture}
                  alt={post.players.display_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {post.players?.display_name}
                      </span>
                      {post.players?.roles?.includes("Franchise Owner") && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                      {post.players?.roles?.includes("Staff") && (
                        <Hammer className="w-4 h-4 text-eba-blue" />
                      )}
                      {post.is_pinned && (
                        <Pin className="w-4 h-4 text-eba-blue" />
                      )}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      @{post.players?.roblox_username} •{" "}
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {isFranchiseOwner && (
                      <button
                        onClick={() => handleTogglePin(post.id, post.is_pinned)}
                        className={`p-1 rounded ${
                          post.is_pinned
                            ? "text-eba-blue hover:text-blue-700"
                            : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        }`}
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                    )}
                    {(session?.user?.playerId === post.player_id || isFranchiseOwner) && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No posts yet. {canPost && "Be the first to post!"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
