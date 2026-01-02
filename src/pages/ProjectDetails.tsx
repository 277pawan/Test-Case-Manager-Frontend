import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Plus, Play, RotateCcw, Shield } from 'lucide-react';
import CreateTestCaseModal from '../components/CreateTestCaseModal';
import CreateTestSuiteModal from '../components/CreateTestSuiteModal';
import ExecutionPermissionModal from '../components/ExecutionPermissionModal';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

const ProjectDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<any>(null);
    const [testSuites, setTestSuites] = useState<any[]>([]);
    const [testCases, setTestCases] = useState<any[]>([]);
    const [passedTestCases, setPassedTestCases] = useState<any[]>([]);
    const [activeSuite, setActiveSuite] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSuiteModalOpen, setIsSuiteModalOpen] = useState(false);
    const [isTestCaseModalOpen, setIsTestCaseModalOpen] = useState(false);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const { user } = useAuth();

    const canCreateTests = user?.role === 'admin' || user?.role === 'test-lead';
    const isAdmin = user?.role === 'admin';

    const fetchData = async () => {
        try {
            // Fetch project first
            const projRes = await api.get(`/projects/${id}`);
            setProject(projRes.data);

            // Fetch other data in parallel, with individual error handling
            const [suitesRes, casesRes, passedRes] = await Promise.allSettled([
                api.get(`/test-suites/project/${id}`),
                api.get(`/test-cases?projectId=${id}`),
                api.get(`/test-cases/passed?projectId=${id}`)
            ]);

            // Handle test suites
            if (suitesRes.status === 'fulfilled') {
                setTestSuites(suitesRes.value.data);
            } else {
                console.error('Failed to load test suites:', suitesRes.reason);
                setTestSuites([]);
            }

            // Handle test cases
            if (casesRes.status === 'fulfilled') {
                setTestCases(casesRes.value.data);
            } else {
                console.error('Failed to load test cases:', casesRes.reason);
                setTestCases([]);
            }

            // Handle passed test cases
            if (passedRes.status === 'fulfilled') {
                setPassedTestCases(passedRes.value.data);
            } else {
                console.error('Failed to load passed test cases:', passedRes.reason);
                setPassedTestCases([]);
            }
        } catch (err) {
            console.error('Failed to load project:', err);
            toast.error('Failed to load project details');
        } finally {
            setLoading(false);
        }
    };

    const handleReopen = async (testCaseId: number) => {
        const loadingToast = toast.loading('Reopening test case...');
        try {
            await api.patch(`/test-case-status/${testCaseId}/reopen`);
            toast.success('Test case reopened successfully!', { id: loadingToast });
            // Refresh data to update the lists
            await fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to reopen test case', { id: loadingToast });
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const filteredTestCases = activeSuite
        ? testCases.filter(tc => tc.suite_id === activeSuite && tc.status !== 'closed')
        : testCases.filter(tc => tc.status !== 'closed');

    if (loading) return <div className="p-6">Loading project details...</div>;
    if (!project) return <div className="p-6">Project not found.</div>;

    return (
        <div className="space-y-6 p-6">
            <Toaster position="top-center" />
            <CreateTestSuiteModal
                open={isSuiteModalOpen}
                onOpenChange={setIsSuiteModalOpen}
                projectId={id!}
                onSuiteCreated={fetchData}
            />
            <CreateTestCaseModal
                open={isTestCaseModalOpen}
                onOpenChange={setIsTestCaseModalOpen}
                projectId={id!}
                suiteId={activeSuite}
                onTestCaseCreated={fetchData}
            />
            <ExecutionPermissionModal
                open={isPermissionModalOpen}
                onOpenChange={setIsPermissionModalOpen}
            />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{project.name}</h2>
                    <p className="text-muted-foreground">{project.description}</p>
                </div>
                {canCreateTests && (
                    <div className="flex gap-2">
                        {isAdmin && (
                            <Button
                                onClick={() => setIsPermissionModalOpen(true)}
                                variant="outline"
                                className="border-purple-200 text-purple-600 hover:bg-purple-50"
                            >
                                <Shield className="mr-2 h-4 w-4" />
                                Manage Permissions
                            </Button>
                        )}
                        <Button onClick={() => setIsSuiteModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> New Suite
                        </Button>
                        <Button onClick={() => setIsTestCaseModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> New Test Case
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-3 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Test Suites</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                className="w-full justify-start"
                                onClick={() => setActiveSuite(null)}
                            >
                                All Test Cases
                            </Button>
                            {testSuites.map(suite => (
                                <Button
                                    key={suite.id}
                                    className="w-full justify-start"
                                    onClick={() => setActiveSuite(suite.id)}
                                >
                                    {suite.name}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="col-span-9 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Test Cases ({filteredTestCases.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {filteredTestCases.map(tc => (
                                    <div key={tc.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors">
                                        <div>
                                            <div className="font-medium flex items-center gap-2">
                                                {tc.title}
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${tc.priority === 'Critical' ? 'bg-red-100 border-red-200 text-red-800' :
                                                    tc.priority === 'High' ? 'bg-orange-100 border-orange-200 text-orange-800' :
                                                        'bg-blue-100 border-blue-200 text-blue-800'
                                                    }`}>
                                                    {tc.priority}
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                ID: {tc.id} • Type: {tc.type}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" asChild>
                                                <Link to={`/test-cases/${tc.id}`}>View</Link>
                                            </Button>
                                            <Button size="sm" asChild>
                                                <Link to={`/execute/${tc.id}`}>
                                                    <Play className="h-3 w-3 mr-1" /> Run
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {filteredTestCases.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No test cases found.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Passed Test Cases Section */}
                    {passedTestCases.length > 0 && (
                        <Card className="shadow-lg border-0">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                                <CardTitle className="flex items-center gap-2">
                                    Passed Test Cases ({passedTestCases.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    {passedTestCases.map(tc => (
                                        <div key={tc.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors bg-green-50/50">
                                            <div>
                                                <div className="font-medium flex items-center gap-2">
                                                    {tc.title}
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full border bg-green-100 border-green-200 text-green-800">
                                                        Passed
                                                    </span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${tc.priority === 'Critical' ? 'bg-red-100 border-red-200 text-red-800' :
                                                        tc.priority === 'High' ? 'bg-orange-100 border-orange-200 text-orange-800' :
                                                            'bg-blue-100 border-blue-200 text-blue-800'
                                                        }`}>
                                                        {tc.priority}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    ID: {tc.id} • Type: {tc.type}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" asChild>
                                                    <Link to={`/test-cases/${tc.id}`}>View</Link>
                                                </Button>
                                                {isAdmin && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleReopen(tc.id)}
                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    >
                                                        <RotateCcw className="h-3 w-3 mr-1" />
                                                        Reopen
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectDetails;
