import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface CreateProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onProjectCreated: () => void;
}

const CreateProjectModal = ({ open, onOpenChange, onProjectCreated }: CreateProjectModalProps) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [version, setVersion] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const loadingToast = toast.loading('Creating project...');

        try {
            await api.post('/projects', { name, description, version });
            toast.success('Project created successfully! 🎉', { id: loadingToast });
            setName('');
            setDescription('');
            setVersion('');
            onOpenChange(false);
            onProjectCreated();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create project', { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Create New Project
                    </DialogTitle>
                    <DialogDescription>
                        Add a new test project to organize your test cases and suites.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Project Name *</Label>
                            <Input
                                id="name"
                                placeholder="My Awesome Project"
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
                                placeholder="Brief description of the project..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isLoading}
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="version">Version</Label>
                            <Input
                                id="version"
                                placeholder="1.0.0"
                                value={version}
                                onChange={(e) => setVersion(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="gradient-primary text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Project'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateProjectModal;
