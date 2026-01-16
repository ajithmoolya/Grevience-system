import React, { useEffect, useState } from "react";
import Axios from "axios";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from "recharts";
import { FileText, CheckCircle, Clock, AlertCircle, Users, TrendingUp, RefreshCw } from "lucide-react";

const Dashboard = () => {
    const API_BASE = process.env.REACT_APP_API_BASE;

    const [total, setTotal] = useState(0);
    const [pending, setPending] = useState(0);
    const [resolved, setResolved] = useState(0);
    const [assigned, setAssigned] = useState(0);
    const [escalated, setEscalated] = useState(0);
    const [loading, setLoading] = useState(true);
    
    // Chart data from backend
    const [monthlyData, setMonthlyData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [avgResolutionTime, setAvgResolutionTime] = useState(0);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch basic stats
            const res = await Axios.get(`${API_BASE}/superadmin/grievances`);
            setTotal(res.data.total || 0);
            setPending(res.data.total_pending || 0);
            setResolved(res.data.total_resolved || 0);
            setAssigned(res.data.total_assigned || 0);
            setEscalated(res.data.total_escalated || 0);
            
            // Fetch enhanced dashboard stats
            const statsRes = await Axios.get(`${API_BASE}/superadmin/dashboard/stats`);
            if (statsRes.data.success) {
                setMonthlyData(statsRes.data.monthlyData || []);
                setCategoryData(statsRes.data.categoryData || []);
                setAvgResolutionTime(statsRes.data.avgResolutionTime || 0);
            }
            
        } catch (error) {
            console.log("Error fetching dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

    const statCards = [
        { 
            label: "Total Grievances", 
            value: total, 
            icon: FileText, 
            bgColor: "bg-blue-50", 
            iconColor: "text-blue-600"
        },
        { 
            label: "Pending", 
            value: pending, 
            icon: Clock, 
            bgColor: "bg-amber-50", 
            iconColor: "text-amber-600"
        },
        { 
            label: "Resolved", 
            value: resolved, 
            icon: CheckCircle, 
            bgColor: "bg-green-50", 
            iconColor: "text-green-600"
        },
        { 
            label: "Assigned", 
            value: assigned, 
            icon: Users, 
            bgColor: "bg-purple-50", 
            iconColor: "text-purple-600"
        },
        { 
            label: "Escalated", 
            value: escalated, 
            icon: AlertCircle, 
            bgColor: "bg-red-50", 
            iconColor: "text-red-600"
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard Overview</h1>
                    <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
                </div>
                <button 
                    onClick={fetchData}
                    className="btn btn-secondary flex items-center gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {statCards.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className={`stat-icon ${stat.bgColor}`}>
                            <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                        </div>
                        <div className="flex-1">
                            <p className="stat-label">{stat.label}</p>
                            <p className="stat-value">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Grievance Trends</h3>
                        <span className="badge badge-info">Last 6 Months</span>
                    </div>
                    <div className="h-80">
                        {monthlyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData} barGap={8}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            borderRadius: '12px', 
                                            border: 'none', 
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                                        }} 
                                    />
                                    <Legend />
                                    <Bar dataKey="pending" name="Pending" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="resolved" name="Resolved" fill="#10B981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                No data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Category Distribution</h3>
                        <span className="badge badge-purple">All Time</span>
                    </div>
                    <div className="h-80">
                        {categoryData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height="85%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ 
                                                borderRadius: '12px', 
                                                border: 'none', 
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                                            }} 
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Legend */}
                                <div className="flex flex-wrap justify-center gap-4 mt-2">
                                    {categoryData.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div 
                                                className="w-3 h-3 rounded-full" 
                                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                            />
                                            <span className="text-sm text-gray-600">{item.name} ({item.value})</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                No category data available
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Performance Metrics</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                        <p className="text-3xl font-bold text-green-600">
                            {total > 0 ? Math.round((resolved / total) * 100) : 0}%
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Resolution Rate</p>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-xl">
                        <p className="text-3xl font-bold text-amber-600">
                            {total > 0 ? Math.round((pending / total) * 100) : 0}%
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Pending Rate</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <p className="text-3xl font-bold text-blue-600">
                            {avgResolutionTime > 0 ? `${avgResolutionTime} days` : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Avg. Resolution Time</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-xl">
                        <p className="text-3xl font-bold text-red-600">
                            {total > 0 ? Math.round((escalated / total) * 100) : 0}%
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Escalation Rate</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
