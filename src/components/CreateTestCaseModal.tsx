import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface CreateTestCaseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
    suiteId?: number | null;
    onTestCaseCreated: () => void;
}

const CreateTestCaseModal = ({ open, onOpenChange, projectId, suiteId, onTestCaseCreated }: CreateTestCaseModalProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [type, setType] = useState('Functional');
    const [preConditions, setPreConditions] = useState('');
    const [postConditions, setPostConditions] = useState('');
    const [assignedTo, setAssignedTo] = useState<number | null>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchUsers();
        }
    }, [open]);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const loadingToast = toast.loading('Creating test case...');

        try {
            await api.post('/test-cases', {
                project_id: Number(projectId),
                suite_id: suiteId,
                title,
                description,
                priority,
                type,
                pre_conditions: preConditions,
                post_conditions: postConditions,
                assigned_to: assignedTo,
                steps: [] // Can add steps later
            });
            toast.success('Test case created! 🎉', { id: loadingToast });
            // Reset form
            setTitle('');
            setDescription('');
            setPriority('Medium');
            setType('Functional');
            setPreConditions('');
            setPostConditions('');
            setAssignedTo(null);
            onOpenChange(false);
            onTestCaseCreated();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create test case', { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Test Case</DialogTitle>
                    <DialogDescription>
                        Add a new test case to your project.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Test Case Title *</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Verify user can login with valid credentials"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority *</Label>
                                <select
                                    id="priority"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    disabled={isLoading}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Type *</Label>
                                <select
                                    id="type"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    disabled={isLoading}
                                >
                                    <option value="Functional">Functional</option>
                                    <option value="Integration">Integration</option>
                                    <option value="Regression">Regression</option>
                                    <option value="Smoke">Smoke</option>
                                    <option value="UI">UI</option>
                                    <option value="API">API</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="assignedTo">Assign To</Label>
                            <select
                                id="assignedTo"
                                value={assignedTo || ''}
                                onChange={(e) => setAssignedTo(e.target.value ? Number(e.target.value) : null)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                disabled={isLoading}
                            >
                                <option value="">Unassigned</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.username} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Detailed description of the test case..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isLoading}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="preConditions">Pre-conditions</Label>
                            <Textarea
                                id="preConditions"
                                placeholder="e.g., User must be logged out"
                                value={preConditions}
                                onChange={(e) => setPreConditions(e.target.value)}
                                disabled={isLoading}
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="postConditions">Post-conditions</Label>
                            <Textarea
                                id="postConditions"
                                placeholder="e.g., User is logged in and redirected to dashboard"
                                value={postConditions}
                                onChange={(e) => setPostConditions(e.target.value)}
                                disabled={isLoading}
                                rows={2}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Test Case'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateTestCaseModal;
