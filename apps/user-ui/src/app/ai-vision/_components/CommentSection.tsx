'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useUser from '@/hooks/useUser';
import { toast } from 'sonner';

interface Comment {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    createdAt: string;
}

interface CommentSectionProps {
    conceptId: string;
}

export default function CommentSection({ conceptId }: CommentSectionProps) {
    const { user } = useUser();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error('Please sign in to comment');
            return;
        }

        if (!newComment.trim()) {
            return;
        }

        try {
            setLoading(true);
            // TODO: Implement API call to save comment
            // For now, add it locally
            const comment: Comment = {
                id: Date.now().toString(),
                userId: user.id,
                userName: user.user_metadata?.full_name || user.email || 'Anonymous',
                userAvatar: user.user_metadata?.avatar_url,
                content: newComment,
                createdAt: new Date().toISOString(),
            };

            setComments([comment, ...comments]);
            setNewComment('');
            toast.success('Comment posted!');
        } catch (error) {
            console.error('Failed to post comment:', error);
            toast.error('Failed to post comment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]" />
                <h3 className="text-xl font-semibold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                    Comments ({comments.length})
                </h3>
            </div>

            {/* Comment Form */}
            {user ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                    <Textarea
                        placeholder="Share your thoughts..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[100px] resize-none"
                    />
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={loading || !newComment.trim()}
                            className="bg-[var(--ac-gold)] hover:bg-[var(--ac-gold)]/90 text-white"
                        >
                            <Send className="mr-2 h-4 w-4" />
                            Post Comment
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="p-4 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] rounded-lg text-center">
                    <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
                        Please sign in to leave a comment
                    </p>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <div className="text-center py-8">
                        <MessageCircle className="h-12 w-12 text-[var(--ac-linen)] dark:text-[var(--ac-slate)] mx-auto mb-3" />
                        <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
                            No comments yet. Be the first to share your thoughts!
                        </p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                                <AvatarFallback>
                                    {comment.userName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                        {comment.userName}
                                    </span>
                                    <span className="text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
