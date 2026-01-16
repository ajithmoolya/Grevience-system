import React, { useEffect, useState } from "react";
import axios from "axios";
import { FileText, Clock, CheckCircle, AlertCircle, Users, Search, Filter } from "lucide-react";

const Grievances = () => {
    const API_BASE = process.env.REACT_APP_API_BASE;
    const [grievances, setGrievances] = useState([]);
    const [filteredGrievances, setFilteredGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        resolved: 0,
        assigned: 0
    });

    const fetchData = async () => {
        try {
            const res = await axios.get(`${API_BASE}/superadmin/grievances`);
            setGrievances(res.data.all || []);
            setFilteredGrievances(res.data.all || []);
            setStats({
                total: res.data.total || 0,
                pending: res.data.total_pending || 0,
                resolved: res.data.total_resolved || 0,
                assigned: res.data.total_assigned || 0
            });
        } catch (err) {
            console.error("Error fetching grievances:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        let filtered = [...grievances];

        // Apply status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(g => g.status?.toLowerCase() === statusFilter.toLowerCase());
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(g =>
                g.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                g.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                g.grievanceID?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredGrievances(filtered);
    }, [searchTerm, statusFilter, grievances]);

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Resolved': { class: 'badge-success', icon: CheckCircle },
            'Pending': { class: 'badge-warning', icon: Clock },
            'Rejected': { class: 'badge-danger', icon: AlertCircle },
            'Submited': { class: 'badge-info', icon: FileText },
            'Assigned': { class: 'badge-purple', icon: Users },
            'In Review': { class: 'badge-warning', icon: Clock }
        };

        const config = statusConfig[status] || { class: 'badge-gray', icon: FileText };
        const Icon = config.icon;

        return (
            <span className={`badge ${config.class} flex items-center gap-1`}>
                <Icon size={12} />
                {status}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Manage Grievances</h1>
                    <p className="text-gray-500 text-sm mt-1">View and manage all grievance submissions</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat-card">
                    <div className="stat-icon bg-blue-50">
                        <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="stat-value">{stats.total}</p>
                        <p className="stat-label">Total</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bg-amber-50">
                        <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="stat-value">{stats.pending}</p>
                        <p className="stat-label">Pending</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bg-purple-50">
                        <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <p className="stat-value">{stats.assigned}</p>
                        <p className="stat-label">Assigned</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bg-green-50">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                        <p className="stat-value">{stats.resolved}</p>
                        <p className="stat-label">Resolved</p>
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
                            placeholder="Search by title, category, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-gray-400" />
                        <select
                            className="form-select w-40"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="Submited">Submitted</option>
                            <option value="Assigned">Assigned</option>
                            <option value="In Review">In Review</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Grievances Table */}
            <div className="table-container">
                <table className="table">
                    <thead className="table-header">
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Assigned To</th>
                        </tr>
                    </thead>
                    <tbody className="table-body">
                        {filteredGrievances.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-8">
                                    <div className="empty-state">
                                        <FileText className="empty-state-icon" />
                                        <p className="empty-state-title">No grievances found</p>
                                        <p className="empty-state-text">Try adjusting your search or filter</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredGrievances.map((g) => (
                                <tr key={g._id}>
                                    <td>
                                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                            {g.grievanceID || '—'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="max-w-xs truncate font-medium text-gray-800">
                                            {g.title}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge badge-gray">{g.category || '—'}</span>
                                    </td>
                                    <td>{getStatusBadge(g.status)}</td>
                                    <td className="text-gray-500 text-sm">{formatDate(g.createdAt)}</td>
                                    <td>
                                        {g.status === "Submited" ? (
                                            <span className="text-gray-400">Not assigned</span>
                                        ) : (
                                            <span className="text-gray-700">{g.assignedTo || '—'}</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Showing count */}
            <div className="text-sm text-gray-500">
                Showing {filteredGrievances.length} of {grievances.length} grievances
            </div>
        </div>
    );
};

export default Grievances;
