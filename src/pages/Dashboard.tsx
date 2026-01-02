import { useEffect, useState } from 'react';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { FolderKanban, FileCheck, Users, TrendingUp } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const Dashboard = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/analytics');
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 p-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-48" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-[400px]" />
                    <Skeleton className="h-[400px]" />
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Failed to load analytics data.</p>
            </div>
        );
    }

    const statusColors: Record<string, string> = {
        'Pass': 'rgba(34, 197, 94, 0.8)', // Green
        'Fail': 'rgba(239, 68, 68, 0.8)', // Red
        'Blocked': 'rgba(245, 158, 11, 0.8)', // Amber
        'Skipped': 'rgba(168, 85, 247, 0.8)', // Purple
        'Pending': 'rgba(59, 130, 246, 0.8)', // Blue
    };

    const statusBorderColors: Record<string, string> = {
        'Pass': 'rgba(34, 197, 94, 1)',
        'Fail': 'rgba(239, 68, 68, 1)',
        'Blocked': 'rgba(245, 158, 11, 1)',
        'Skipped': 'rgba(168, 85, 247, 1)',
        'Pending': 'rgba(59, 130, 246, 1)',
    };

    const executionChartData = {
        labels: data.executionStats.map((s: any) => s.status),
        datasets: [
            {
                label: 'Test Executions',
                data: data.executionStats.map((s: any) => s.count),
                backgroundColor: data.executionStats.map((s: any) => statusColors[s.status] || 'rgba(200, 200, 200, 0.8)'),
                borderColor: data.executionStats.map((s: any) => statusBorderColors[s.status] || 'rgba(200, 200, 200, 1)'),
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    const priorityChartData = {
        labels: data.priorityStats.map((s: any) => s.priority),
        datasets: [
            {
                label: 'Test Cases',
                data: data.priorityStats.map((s: any) => s.count),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(249, 115, 22, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(251, 191, 36, 1)',
                    'rgba(249, 115, 22, 1)',
                    'rgba(239, 68, 68, 1)',
                ],
                borderWidth: 2,
            },
        ],
    };

    const statCards = [
        {
            title: 'Total Projects',
            value: data?.counts?.projects || 0,
            icon: FolderKanban,
            bgColor: 'bg-blue-100',
            iconColor: 'text-blue-600',
            gradient: 'from-blue-500 to-cyan-500',
            bgGradient: 'from-blue-50 to-cyan-50'
        },
        {
            title: 'Total Test Cases',
            value: data?.counts?.testCases || 0,
            icon: FileCheck,
            bgColor: 'bg-purple-100',
            iconColor: 'text-purple-600',
            gradient: 'from-purple-500 to-pink-500',
            bgGradient: 'from-purple-50 to-pink-50'
        },
        {
            title: 'Total Users',
            value: data?.counts?.users || 0,
            icon: Users,
            bgColor: 'bg-green-100',
            iconColor: 'text-green-600',
            gradient: 'from-green-500 to-emerald-500',
            bgGradient: 'from-green-50 to-emerald-50'
        }
    ];

    return (
        <div className="space-y-6 p-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Dashboard
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Overview of your test management metrics
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>Real-time data</span>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {statCards.map((stat, index) => (
                    <Card key={index} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                                    <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <div className={`p-4 rounded-full ${stat.bgColor}`}>
                                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-lg border-0 overflow-hidden animate-slide-up" style={{ animationDelay: '300ms' }}>
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                        <CardTitle className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                            Test Execution Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[300px] w-full">
                            <Bar
                                data={executionChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: false,
                                        },
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            grid: {
                                                color: 'rgba(0, 0, 0, 0.05)',
                                            },
                                        },
                                        x: {
                                            grid: {
                                                display: false,
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-0 overflow-hidden animate-slide-up" style={{ animationDelay: '400ms' }}>
                    <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                        <CardTitle className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>
                            Priority Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[300px] w-full flex justify-center items-center">
                            <Pie
                                data={priorityChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                        },
                                    },
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;

