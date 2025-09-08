import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToggleLike } from "@/hooks/use-confessions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Confession, Comment } from "@shared/schema";

interface ConfessionCardProps {
  confession: Confession;
  featured?: boolean;
}

export function ConfessionCard({ confession, featured = false }: ConfessionCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentNickname, setCommentNickname] = useState("");
  
  const toggleLike = useToggleLike(confession.id);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: comments = [] } = useQuery({
    queryKey: ["/api/confessions", confession.id, "comments"],
    queryFn: async () => {
      const response = await fetch(`/api/confessions/${confession.id}/comments`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json() as Promise<Comment[]>;
    },
    enabled: showComments,
  });

  const addComment = useMutation({
    mutationFn: async (commentData: { content: string; nickname?: string }) => {
      const response = await apiRequest("POST", `/api/confessions/${confession.id}/comments`, commentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/confessions", confession.id, "comments"] });
      setNewComment("");
      setCommentNickname("");
      toast({
        title: "Comment submitted!",
        description: "Your comment is being reviewed by moderators.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to submit comment",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    toggleLike.mutate();
  };

  const handleComment = () => {
    if (!newComment.trim()) return;
    
    addComment.mutate({
      content: newComment,
      nickname: commentNickname || undefined,
    });
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      crush: "💕",
      funny: "😂",
      secrets: "🤫",
      rants: "😤",
      advice: "💡",
      academic: "📚",
    };
    return emojis[category] || "📝";
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      crush: 'bg-pink-500',
      funny: 'bg-yellow-500',
      secrets: 'bg-green-500',
      rants: 'bg-red-500',
      advice: 'bg-blue-500',
      academic: 'bg-indigo-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className={`bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all duration-200 ${featured ? 'ring-2 ring-purple-500/50' : ''}`} data-testid={`card-confession-${confession.id}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Badge className={`${getCategoryColor(confession.category)} text-white text-xs px-2 py-1`} data-testid={`badge-category-${confession.category}`}>
            {getCategoryEmoji(confession.category)} {confession.category.charAt(0).toUpperCase() + confession.category.slice(1)}
          </Badge>
          <span className="text-sm text-gray-400" data-testid={`text-author-${confession.id}`}>
            {confession.nickname || "Anonymous User"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400" data-testid={`text-time-${confession.id}`}>
            {formatTime(confession.createdAt.toString())}
          </span>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1">
            <i className="fas fa-flag"></i>
          </Button>
        </div>
      </div>
      
      <p className="text-white mb-4 leading-relaxed" data-testid={`text-content-${confession.id}`}>
        {confession.content}
      </p>
        
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-400">
          {new Date(confession.createdAt).toLocaleString()} • {confession.likes} points • {confession.commentCount} comments
        </span>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={toggleLike.isPending}
            className="text-gray-400 hover:text-pink-400 bg-gray-700 px-3 py-1 rounded-full"
            data-testid={`button-like-${confession.id}`}
          >
            <i className={`far fa-heart mr-1 ${toggleLike.isPending ? 'animate-pulse' : ''}`}></i>
            {confession.likes}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="text-gray-400 hover:text-blue-400 bg-gray-700 px-3 py-1 rounded-full"
            data-testid={`button-comments-${confession.id}`}
          >
            <i className="far fa-comment mr-1"></i>
            {confession.commentCount}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-purple-400 bg-gray-700 px-3 py-1 rounded-full"
            data-testid={`button-share-${confession.id}`}
          >
            <i className="far fa-paper-plane mr-1"></i>
            {showComments ? '1' : '2'}
          </Button>
        </div>
      </div>

      {showComments && (
        <div className="mt-4 space-y-4 border-t border-gray-700 pt-4" data-testid={`container-comments-${confession.id}`}>
          {/* Existing Comments */}
          {comments.length > 0 && (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-700 rounded-lg p-3" data-testid={`comment-${comment.id}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white" data-testid={`text-comment-author-${comment.id}`}>
                      {comment.nickname || "Anonymous User"}
                    </span>
                    <span className="text-xs text-gray-400" data-testid={`text-comment-time-${comment.id}`}>
                      {formatTime(comment.createdAt.toString())}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300" data-testid={`text-comment-content-${comment.id}`}>
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Nickname (optional)"
                value={commentNickname}
                onChange={(e) => setCommentNickname(e.target.value)}
                className="w-32 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                data-testid={`input-comment-nickname-${confession.id}`}
              />
            </div>
            
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                data-testid={`textarea-comment-${confession.id}`}
              />
                <Button
                  onClick={handleComment}
                  disabled={!newComment.trim() || addComment.isPending}
                  size="sm"
                  data-testid={`button-submit-comment-${confession.id}`}
                >
                  {addComment.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <i className="fas fa-paper-plane"></i>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
