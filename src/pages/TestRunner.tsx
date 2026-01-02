import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, PlayCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TestStep {
    step_number: number;
    action: string;
    expected_result: string;
}

interface TestCase {
    id: number;
    title: string;
    description: string;
    pre_conditions: string;
    post_conditions: string;
    priority: string;
    status?: string;
    steps?: TestStep[];
}

const TestRunner = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [testCase, setTestCase] = useState<TestCase | null>(null);
    const [status, setStatus] = useState('Pass');
    const [actualResult, setActualResult] = useState('');
    const [comments, setComments] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [hasPermission, setHasPermission] = useState(false);
    const [permissionChecked, setPermissionChecked] = useState(false);

    useEffect(() => {
        const fetchTestCase = async () => {
            try {
                const res = await api.get(`/test-cases/${id}`);
                setTestCase(res.data);

                // Check if test case is closed
                if (res.data.status === 'closed' && user?.role !== 'admin') {
                    toast.error('This test case is closed (passed). Only admins can reopen it.');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load test case');
                toast.error('Failed to load test case');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchTestCase();
        }
    }, [id, user]); // Added user to dependency array

    // Check execution permission
    useEffect(() => {
        const checkPermission = async () => {
            try {
                const res = await api.get('/execution-permissions/check');
                setHasPermission(res.data.hasPermission);
                setPermissionChecked(true);
            } catch (err) {
                console.error('Permission check failed:', err);
                setHasPermission(false);
                setPermissionChecked(true);
            }
        };

        if (user) {
            checkPermission();
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check execution permission
        if (!hasPermission) {
            toast.error('You do not have permission to execute tests. Please contact an admin.');
            return;
        }

        // Check if test case is closed
        if (testCase?.status === 'closed' && user?.role !== 'admin') {
            toast.error('This test case is closed. Only admins can reopen and re-test it.');
            return;
        }

        setSubmitting(true);
        const loadingToast = toast.loading('Submitting test execution...');

        try {
            await api.post('/test-executions', {
                test_case_id: Number(id),
                status,
                actual_result: actualResult,
                comments
            });

            if (status === 'Pass') {
                toast.success('Test passed! ✅ Test case is now closed.', { id: loadingToast });
            } else {
                toast.success('Test execution recorded!', { id: loadingToast });
            }

            // Reset form
            setStatus('Pass');
            setActualResult('');
            setComments('');

            // Refresh test case to get updated status
            const res = await api.get(`/test-cases/${id}`);
            setTestCase(res.data);
        } catch (err: any) {
            if (err.response?.data?.testCaseStatus === 'closed') {
                toast.error(err.response.data.message, { id: loadingToast });
            } else {
                toast.error(err.response?.data?.message || 'Failed to submit execution', { id: loadingToast });
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6 animate-fade-in">
                <Skeleton className="h-10 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-[400px]" />
                    <Skeleton className="h-[400px]" />
                </div>
            </div>
        );
    }

    if (error || !testCase) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <p className="text-muted-foreground">{error || 'Test case not found'}</p>
                    <Button onClick={() => navigate(-1)} className="mt-4">
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    const statusOptions = [
        { value: 'Pass', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
        { value: 'Fail', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
        { value: 'Blocked', icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { value: 'Skipped', icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-50' },
    ];

    const selectedStatus = statusOptions.find(opt => opt.value === status);

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            <Toaster position="top-center" />

            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Execute Test
                    </h1>
                    <p className="text-muted-foreground mt-1">{testCase.title}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Test Details */}
                <div className="space-y-6">
                    <Card className="shadow-lg border-0 overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                            <div className="flex items-center justify-between">
                                <CardTitle>Test Details</CardTitle>
                                <Badge variant={testCase.priority === 'Critical' ? 'destructive' : 'secondary'}>
                                    {testCase.priority}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <Label className="font-bold text-sm">Description</Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {testCase.description || 'No description'}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="font-bold text-sm">Pre-Conditions</Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {testCase.pre_conditions || 'None'}
                                    </p>
                                </div>
                                <div>
                                    <Label className="font-bold text-sm">Post-Conditions</Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {testCase.post_conditions || 'None'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                            <CardTitle className="flex items-center gap-2">
                                <PlayCircle className="h-5 w-5" />
                                Test Steps
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {testCase.steps && testCase.steps.length > 0 ? (
                                <ol className="space-y-4">
                                    {testCase.steps.map((step) => (
                                        <li key={step.step_number} className="flex gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center font-bold text-sm">
                                                {step.step_number}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{step.action}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    <span className="font-semibold">Expected:</span> {step.expected_result}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            ) : (
                                <p className="text-muted-foreground text-center py-8">No steps defined.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Execution Form */}
                <div>
                    <Card className="shadow-lg border-0 sticky top-6">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                            <CardTitle>Record Result</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="status" className="text-sm font-medium">Test Status</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {statusOptions.map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setStatus(opt.value)}
                                                className={`p-3 rounded-lg border-2 transition-all ${status === opt.value
                                                    ? `${opt.bg} border-current ${opt.color} shadow-md`
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <opt.icon className={`h-5 w-5 mx-auto mb-1 ${status === opt.value ? opt.color : 'text-gray-400'}`} />
                                                <span className={`text-sm font-medium ${status === opt.value ? opt.color : 'text-gray-600'}`}>
                                                    {opt.value}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="actualResult" className="text-sm font-medium">Actual Result</Label>
                                    <Input
                                        id="actualResult"
                                        value={actualResult}
                                        onChange={(e) => setActualResult(e.target.value)}
                                        placeholder="What actually happened?"
                                        disabled={submitting}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="comments" className="text-sm font-medium">Comments</Label>
                                    <Textarea
                                        id="comments"
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        placeholder="Any additional notes or observations..."
                                        disabled={submitting}
                                        rows={4}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full gradient-primary text-white shadow-lg hover:shadow-xl transition-all"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Result'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TestRunner;
