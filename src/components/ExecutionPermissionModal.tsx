import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Trash2, UserPlus, Shield } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface PermittedUser {
    id: number;
    username: string;
    email: string;
    role: string;
    granted_at: string;
    granted_by_username: string;
}

interface ExecutionPermissionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ExecutionPermissionModal = ({ open, onOpenChange }: ExecutionPermissionModalProps) => {
    const [email, setEmail] = useState('');
    const [permittedUsers, setPermittedUsers] = useState<PermittedUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchPermittedUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/execution-permissions');
            setPermittedUsers(res.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load permitted users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchPermittedUsers();
        }
    }, [open]);

    const handleGrantPermission = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error('Please enter an email address');
            return;
        }

        setSubmitting(true);
        const loadingToast = toast.loading('Granting permission...');

        try {
            await api.post('/execution-permissions/grant', { email: email.trim() });
            toast.success('Permission granted successfully!', { id: loadingToast });
            setEmail('');
            await fetchPermittedUsers();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to grant permission', { id: loadingToast });
        } finally {
            setSubmitting(false);
        }
    };

    const handleRevokePermission = async (userId: number, username: string) => {
        const loadingToast = toast.loading(`Revoking permission from ${username}...`);

        try {
            await api.delete(`/execution-permissions/revoke/${userId}`);
            toast.success('Permission revoked successfully!', { id: loadingToast });
            await fetchPermittedUsers();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to revoke permission', { id: loadingToast });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-purple-600" />
                        Test Execution Permissions
                    </DialogTitle>
                    <DialogDescription>
                        Manage which users can execute test cases. Admins always have permission.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Grant Permission Form */}
                    <Card>
                        <CardContent className="pt-6">
                            <form onSubmit={handleGrantPermission} className="space-y-4">
                                <div>
                                    <Label htmlFor="email">Grant Permission by Email</Label>
                                    <div className="flex gap-2 mt-2">
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="user@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={submitting}
                                        />
                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            className="gradient-primary text-white"
                                        >
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Grant
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Permitted Users List */}
                    <div>
                        <h3 className="text-sm font-semibold mb-3">
                            Users with Execution Permission ({permittedUsers.length})
                        </h3>

                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Loading...
                            </div>
                        ) : permittedUsers.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="py-8 text-center text-muted-foreground">
                                    No users have been granted execution permission yet.
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-2">
                                {permittedUsers.map((user) => (
                                    <Card key={user.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{user.username}</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {user.role}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Granted by {user.granted_by_username} on{' '}
                                                        {new Date(user.granted_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRevokePermission(user.id, user.username)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ExecutionPermissionModal;
