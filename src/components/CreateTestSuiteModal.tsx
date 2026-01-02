import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface CreateTestSuiteModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
    onSuiteCreated: () => void;
}

const CreateTestSuiteModal = ({ open, onOpenChange, projectId, onSuiteCreated }: CreateTestSuiteModalProps) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const loadingToast = toast.loading('Creating test suite...');

        try {
            await api.post('/test-suites', { project_id: Number(projectId), name, description });
            toast.success('Test suite created! 🎉', { id: loadingToast });
            setName('');
            setDescription('');
            onOpenChange(false);
            onSuiteCreated();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create test suite', { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Test Suite</DialogTitle>
                    <DialogDescription>
                        Organize your test cases into logical groups.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Suite Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Login Tests"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Brief description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isLoading}
                                rows={3}
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
                                'Create Suite'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateTestSuiteModal;
