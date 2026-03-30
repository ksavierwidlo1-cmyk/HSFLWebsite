"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Heart, MessageCircle, Trash2, Hammer } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ArticleSocialProps {
  articleId: string;
}

export default function ArticleSocial({ articleId }: ArticleSocialProps) {
  const { data: session, status } = useSession();
  const [likes, setLikes] = useState<any[]>([]);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentLikes, setCommentLikes] = useState<Record<string, { count: number; isLiked: boolean }>>({});
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLikes();
    fetchComments();
  }, [articleId]);

  useEffect(() => {
    if (session?.user?.playerId && likes.length > 0) {
      setIsLiked(likes.some(like => like.player_id === session.user.playerId));
    }
  }, [likes, session]);

  const fetchLikes = async () => {
    try {
      const res = await fetch(`/api/articles/${articleId}/likes`);
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes || []);
        setLikeCount(data.likeCount || 0);
      }
    } catch (error) {
      console.error("Error fetching likes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`);
      if (res.ok) {
        const data = await res.json();
        const fetchedComments = data.comments || [];
        setComments(fetchedComments);
        
        // Fetch likes for each comment
        for (const comment of fetchedComments) {
          fetchCommentLikes(comment.id);
        }
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const fetchCommentLikes = async (commentId: string) => {
    try {
      const res = await fetch(`/api/articles/${articleId}/comments/${commentId}/likes`);
      if (res.ok) {
        const data = await res.json();
        const isLiked = session?.user?.playerId 
          ? data.likes?.some((like: any) => like.player_id === session.user.playerId)
          : false;
        
        setCommentLikes(prev => ({
          ...prev,
          [commentId]: { count: data.likeCount || 0, isLiked }
        }));
      }
    } catch (error) {
      console.error("Error fetching comment likes:", error);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!session?.user?.playerId) {
      alert("Please log in to like comments");
      return;
    }

    const currentState = commentLikes[commentId] || { count: 0, isLiked: false };
    
    try {
      if (currentState.isLiked) {
        const res = await fetch(`/api/articles/${articleId}/comments/${commentId}/likes`, {
          method: "DELETE",
        });
        if (res.ok) {
          setCommentLikes(prev => ({
            ...prev,
            [commentId]: { count: currentState.count - 1, isLiked: false }
          }));
        }
      } else {
        const res = await fetch(`/api/articles/${articleId}/comments/${commentId}/likes`, {
          method: "POST",
        });
        if (res.ok) {
          setCommentLikes(prev => ({
            ...prev,
            [commentId]: { count: currentState.count + 1, isLiked: true }
          }));
        }
      }
    } catch (error) {
      console.error("Error toggling comment like:", error);
    }
  };

  const handleLike = async () => {
    if (!session?.user?.playerId) {
      alert("Please log in to like articles");
      return;
    }

    try {
      if (isLiked) {
        const res = await fetch(`/api/articles/${articleId}/likes`, {
          method: "DELETE",
        });
        if (res.ok) {
          setIsLiked(false);
          setLikeCount(prev => prev - 1);
          setLikes(prev => prev.filter(like => like.player_id !== session.user.playerId));
        }
      } else {
        const res = await fetch(`/api/articles/${articleId}/likes`, {
          method: "POST",
        });
        if (res.ok) {
          const data = await res.json();
          setIsLiked(true);
          setLikeCount(prev => prev + 1);
          setLikes(prev => [...prev, data]);
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.playerId) {
      alert("Please log in to comment");
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments(prev => [data, ...prev]);
        setNewComment("");
        // Fetch likes for the new comment
        fetchCommentLikes(data.id);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;

    try {
      const res = await fetch(`/api/articles/${articleId}/comments?commentId=${commentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
      {/* Like and Comment Buttons */}
      <div className="flex items-center gap-6 mb-6">
        <button
          onClick={handleLike}
          disabled={status === "loading"}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isLiked
              ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
          <span className="font-medium">{likeCount}</span>
          <span>{isLiked ? "Liked" : "Like"}</span>
        </button>

        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <MessageCircle className="w-5 h-5" />
          <span>{comments.length} Comments</span>
        </div>
      </div>

      {/* Comment Form */}
      {session?.user?.playerId && (
        <form onSubmit={handlePostComment} className="mb-6">
          <div className="flex gap-3">
            {session.user.profilePicture && (
              <img
                src={session.user.profilePicture}
                alt="Your avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-eba-blue text-gray-900 dark:text-white resize-none"
                rows={3}
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">{newComment.length}/1000</span>
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="px-4 py-2 bg-eba-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            {comment.players?.profile_picture && (
              <img
                src={comment.players.profile_picture}
                alt={comment.players.display_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {comment.players?.display_name}
                    </span>
                    {comment.players?.roles?.includes('Staff') && (
                      <Hammer className="w-4 h-4 text-eba-blue" />
                    )}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    @{comment.players?.roblox_username}
                  </span>
                  <span className="text-sm text-gray-400 dark:text-gray-500 ml-2">
                    • {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                {session?.user?.playerId === comment.player_id && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="mt-2 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {comment.content}
              </p>
              
              {/* Comment Like Button */}
              <div className="mt-3 flex items-center gap-4">
                <button
                  onClick={() => handleCommentLike(comment.id)}
                  disabled={status === "loading"}
                  className={`flex items-center gap-1 text-sm transition-colors ${
                    commentLikes[comment.id]?.isLiked
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${commentLikes[comment.id]?.isLiked ? "fill-current" : ""}`} />
                  <span>{commentLikes[comment.id]?.count || 0}</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
}
