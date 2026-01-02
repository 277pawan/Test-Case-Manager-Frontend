import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { FolderKanban, Plus, Calendar, User, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import CreateProjectModal from '../components/CreateProjectModal';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useAuth();

    const canCreateProject = user?.role === 'admin' || user?.role === 'test-lead';

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            setProjects(res.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 p-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="overflow-hidden">
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-20 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6 animate-fade-in">
            <CreateProjectModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onProjectCreated={fetchProjects}
            />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Projects
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Manage your test projects and test suites
                    </p>
                </div>
                {canCreateProject && (
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="gradient-primary text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Project
                    </Button>
                )}
            </div>

            {projects.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2">
                    <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    {canCreateProject ? (
                        <>
                            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                            <p className="text-muted-foreground mb-4">Get started by creating your first project</p>
                            <Button onClick={() => setIsModalOpen(true)} className="gradient-primary text-white">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Project
                            </Button>
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
                            <p className="text-muted-foreground mb-4">
                                You are not currently added to any test cases in any project.
                                <br />
                                Please contact your administrator to be assigned to a project.
                            </p>
                        </>
                    )}
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project, index) => (
                        <Card
                            key={project.id}
                            className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] animate-slide-up bg-gradient-to-br from-white to-purple-50/30"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                                        <FolderKanban className="h-5 w-5 text-white" />
                                    </div>
                                    <Badge className="text-xs">
                                        Active
                                    </Badge>
                                </div>
                                <CardTitle className="text-xl group-hover:text-purple-600 transition-colors">
                                    {project.name}
                                </CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {project.description || 'No description provided'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(project.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <User className="h-4 w-4" />
                                        <span>Team</span>
                                    </div>
                                </div>
                                <Button
                                    className="w-full group-hover:bg-purple-500 group-hover:text-white group-hover:border-purple-500 transition-all"
                                    asChild
                                >
                                    <Link to={`/projects/${project.id}`}>
                                        View Details
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Projects;
