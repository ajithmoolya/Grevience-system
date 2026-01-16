import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { Search, Filter, Activity, User, AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

const Logs = () => {
    const API_BASE = process.env.REACT_APP_API_BASE;
    
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ total: 0, success: 0, warning: 0, error: 0, info: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await Axios.get(`${API_BASE}/superadmin/logs`, {
                params: { type: typeFilter !== 'all' ? typeFilter : undefined, limit: 100 }
            });
            
            if (res.data.success) {
                setLogs(res.data.logs || []);
                setStats(res.data.stats || { total: 0, success: 0, warning: 0, error: 0, info: 0 });
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [typeFilter]);

    const filteredLogs = logs.filter(log => {
        const matchesSearch = 
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesSearch;
    });

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'Unknown';
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTypeConfig = (type) => {
        const configs = {
            success: { 
                bg: 'bg-green-50', 
                icon: CheckCircle, 
                iconColor: 'text-green-500',
                badge: 'badge-success'
            },
            error: { 
                bg: 'bg-red-50', 
                icon: XCircle, 
                iconColor: 'text-red-500',
                badge: 'badge-danger'
            },
            warning: { 
                bg: 'bg-amber-50', 
                icon: AlertTriangle, 
                iconColor: 'text-amber-500',
                badge: 'badge-warning'
            },
            info: { 
                bg: 'bg-blue-50', 
                icon: Activity, 
                iconColor: 'text-blue-500',
                badge: 'badge-info'
            }
        };
        return configs[type] || configs.info;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Activity Logs</h1>
                    <p className="text-gray-500 text-sm mt-1">Track grievance activities and status changes</p>
                </div>
                <button 
                    onClick={fetchLogs}
                    className="btn btn-secondary flex items-center gap-2"
                    disabled={loading}
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="stat-card">
                    <div className="stat-icon bg-blue-50">
                        <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="stat-value">{stats.total}</p>
                        <p className="stat-label">Total Logs</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bg-green-50">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                        <p className="stat-value">{stats.success}</p>
                        <p className="stat-label">Success</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bg-blue-50">
                        <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="stat-value">{stats.info}</p>
                        <p className="stat-label">Info</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bg-amber-50">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="stat-value">{stats.warning}</p>
                        <p className="stat-label">Warnings</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bg-red-50">
                        <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <p className="stat-value">{stats.error}</p>
                        <p className="stat-label">Errors</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            className="form-input pl-10"
                            placeholder="Search logs by action, user, or details..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Type Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-gray-400" />
                        <select
                            className="form-select w-40"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="success">Success</option>
                            <option value="info">Info</option>
                            <option value="warning">Warning</option>
                            <option value="error">Error</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
            /* Logs List */
            <div className="card p-0 overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {filteredLogs.length === 0 ? (
                        <div className="empty-state py-12">
                            <Activity className="empty-state-icon" />
                            <p className="empty-state-title">No logs found</p>
                            <p className="empty-state-text">Try adjusting your search or filter</p>
                        </div>
                    ) : (
                        filteredLogs.map((log) => {
                            const config = getTypeConfig(log.type);
                            const Icon = config.icon;
                            
                            return (
                                <div key={log.id} className={`p-4 hover:bg-gray-50 transition-colors`}>
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                                            <Icon className={`h-5 w-5 ${config.iconColor}`} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-medium text-gray-800">{log.action}</h4>
                                                <span className={`badge ${config.badge} text-xs`}>
                                                    {log.type}
                                                </span>
                                                {log.grievanceId && (
                                                    <span className="badge badge-secondary text-xs">
                                                        {log.grievanceId}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {log.user}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatTimestamp(log.timestamp)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            )}

            {/* Showing count */}
            {!loading && (
                <div className="text-sm text-gray-500">
                    Showing {filteredLogs.length} of {logs.length} activity logs
                </div>
            )}
        </div>
    );
};

export default Logs;
