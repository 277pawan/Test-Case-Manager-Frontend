import { useState, useEffect } from 'react';
import api from '../services/api';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'; // Assuming you have these or use a placeholder
import { formatDistanceToNow } from 'date-fns'; // You might need to install date-fns or use native Intl.RelativeTimeFormat
import toast from 'react-hot-toast';
import { Trash2, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface Comment {
    id: number;
    content: string;
    username: string;
    created_at: string;
    user_id: number;
}

interface CommentsSectionProps {
    testCaseId: number;
}

const CommentsSection = ({ testCaseId }: CommentsSectionProps) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    // You might want to get current user from context to show delete button, 
    // but the backend handles permission check anyway. 
    // For UI, we can decode token or use a user context. 
    // For now, fail gracefully on delete if not authorized.

    useEffect(() => {
        fetchComments();
    }, [testCaseId]);

    const fetchComments = async () => {
        try {
            const res = await api.get(`/test-cases/${testCaseId}/comments`);
            setComments(res.data);
        } catch (err) {
            console.error('Failed to fetch comments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const res = await api.post(`/test-cases/${testCaseId}/comments`, { content: newComment });
            setComments([res.data, ...comments]);
            setNewComment('');
            toast.success('Comment added');
        } catch (err) {
            console.error(err);
            toast.error('Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId: number) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        try {
            await api.delete(`/test-cases/${testCaseId}/comments/${commentId}`); // or /api/comments/${commentId} checking routes...
            // Per my backend routes: router.use('/:testCaseId/comments', commentRoutes) which mounts commentRoutes.
            // commentRoutes has DELETE /:id.
            // So url is /test-cases/:testCaseId/comments/:id.

            setComments(comments.filter(c => c.id !== commentId));
            toast.success('Comment deleted');
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to delete comment');
        }
    };

    if (loading) return <div className="text-muted-foreground p-4">Loading comments...</div>;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <CardTitle>Comments ({comments.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-2">
                    <Textarea
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={submitting}
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={submitting || !newComment.trim()}>
                            {submitting ? 'Posting...' : 'Post Comment'}
                        </Button>
                    </div>
                </form>

                <div className="space-y-4">
                    {comments.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">No comments yet.</p>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.id} className="flex gap-4 p-4 border rounded-lg bg-card/50">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{comment.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">{comment.username}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">
                                                {/* Requires date-fns, if not available use native */}
                                                {new Date(comment.created_at).toLocaleDateString()} {new Date(comment.created_at).toLocaleTimeString()}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                onClick={() => handleDelete(comment.id)}
                                            // Ideally only show if user owns it. 
                                            // Since I don't have user context easily here without changing more files,
                                            // I'll show it and let backend reject if unauthorized.
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default CommentsSection;
