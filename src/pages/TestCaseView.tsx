import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Play } from 'lucide-react';
import CommentsSection from '../components/CommentsSection';

const TestCaseView = () => {
    const { id } = useParams<{ id: string }>();
    const [testCase, setTestCase] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestCase = async () => {
            try {
                const res = await api.get(`/test-cases/${id}`);
                setTestCase(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTestCase();
    }, [id]);

    if (loading) return <div className="p-6">Loading test case...</div>;
    if (!testCase) return <div className="p-6">Test case not found.</div>;

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link to={`/projects/${testCase.project_id}`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Project
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold">{testCase.title}</h2>
                        <p className="text-sm text-muted-foreground">Test Case ID: {testCase.id}</p>
                    </div>
                </div>
                <Button asChild>
                    <Link to={`/execute/${testCase.id}`}>
                        <Play className="h-4 w-4 mr-2" />
                        Execute Test
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Priority</p>
                                <Badge className={
                                    testCase.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                                        testCase.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                                            testCase.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-blue-100 text-blue-800'
                                }>
                                    {testCase.priority}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Type</p>
                                <Badge>{testCase.type}</Badge>
                            </div>
                        </div>

                        {testCase.description && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                                <p className="text-sm">{testCase.description}</p>
                            </div>
                        )}

                        {testCase.pre_conditions && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Pre-conditions</p>
                                <p className="text-sm">{testCase.pre_conditions}</p>
                            </div>
                        )}

                        {testCase.post_conditions && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Post-conditions</p>
                                <p className="text-sm">{testCase.post_conditions}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {testCase.steps && testCase.steps.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Test Steps</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {testCase.steps.map((step: any, index: number) => (
                                    <div key={step.id} className="border rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground">Action</p>
                                                    <p className="text-sm">{step.action}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground">Expected Result</p>
                                                    <p className="text-sm">{step.expected_result}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                )}

                <CommentsSection testCaseId={Number(id)} />
            </div>
        </div>
    );
};

export default TestCaseView;
