import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import axios from 'axios';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const Admins = () => {
    const [admins, setAdmins] = useState([]);
    const [allAdmins, setAllAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editAdmin, setEditAdmin] = useState(null);
    const [addAdmin, setAddAdmin] = useState(false);

    const fixedPermissions = [
        "add staff",
        "add admin",
        "assign staff",
        "add category"
    ];

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);

    const [filterState, setFilterState] = useState("");
    const [filterType, setFilterType] = useState("all");

    const [newAdminData, setNewAdminData] = useState({
        name: "",
        email: "",
        password: "",
        mobile: "",
        Permissions: [],
        createdby: "",
        state: "",
        district: "",
        active: true
    });

    const API_BASE = process.env.REACT_APP_API_BASE;

    useEffect(() => {
        fetchAdmins();
        fetchStates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        applyFilters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allAdmins, filterType, filterState]);

    const fetchAdmins = async () => {
        try {
            const response = await axios.get(`${API_BASE}/superadmin/alladminlst`);
            setAllAdmins(response.data.admin || []);
            setAdmins(response.data.admin || []);
        } catch (error) {
            console.error("Error fetching admins:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStates = async () => {
        try {
            const res = await axios.get(`${API_BASE}/state`);
            setStates(res.data);
        } catch (error) {
            console.error("Error fetching states:", error);
        }
    };

    const fetchDistricts = async (stateCode) => {
        try {
            const res = await axios.get(`${API_BASE}/districts/${stateCode}`);
            setDistricts(res.data);
        } catch (error) {
            console.error("Error fetching districts:", error);
        }
    };

    const normalizeRole = (admin) => {
        let val = "";
        if (!admin) return "";
        if (typeof admin.role === "string") {
            val = admin.role;
        } else if (Array.isArray(admin.roles) && admin.roles.length) {
            val = admin.roles.join(" ");
        } else if (admin.role && typeof admin.role === "object" && admin.role.name) {
            val = admin.role.name;
        } else if (admin.roles && typeof admin.roles === "string") {
            val = admin.roles;
        }
        return val.toString().toLowerCase().replace(/\s+/g, '');
    };

    const applyFilters = () => {
        let filtered = Array.isArray(allAdmins) ? [...allAdmins] : [];

        if (filterType === "district") {
            filtered = filtered.filter((a) => {
                const roleVal = normalizeRole(a);
                return roleVal.includes("district");
            });
        }

        if (filterState && filterState !== "") {
            filtered = filtered.filter((a) => {
                const stateVal = (a.state || "").toString();
                return stateVal === filterState;
            });
        }

        setAdmins(filtered);
    };

    const handleStateFilter = (value) => {
        setFilterState(value);
    };

    const handleAdminTypeFilter = (value) => {
        setFilterType(value);
    };

    const handleCreate = async () => {
        try {
            await axios.post(`${API_BASE}/superadmin/adminregister`, {
                ...newAdminData,
                role: "DistrictAdmin",
            });

            alert("Admin created successfully!");
            setAddAdmin(false);

            setNewAdminData({
                name: "",
                email: "",
                password: "",
                mobile: "",
                Permissions: [],
                createdby: "",
                state: "",
                district: "",
                active: true
            });

            fetchAdmins();
        } catch (error) {
            console.error("Create error:", error);
            alert("Failed to create admin");
        }
    };

    const handleUpdate = async () => {
        if (!editAdmin) return;

        try {
            await axios.put(`${API_BASE}/superadmin/admin/${editAdmin._id}`, {
                name: editAdmin.name,
                email: editAdmin.email,
                Permissions: editAdmin.Permissions,
            });

            alert("Admin updated successfully!");
            setEditAdmin(null);
            fetchAdmins();
        } catch (error) {
            console.error("Update error:", error);
            alert("Update failed");
        }
    };

    const handleDelete = async (row) => {
        if (!window.confirm(`Delete admin ${row.name}?`)) return;

        try {
            await axios.delete(`${API_BASE}/superadmin/admin/${row._id}`);
            alert("Admin deleted");
            fetchAdmins();
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete admin");
        }
    };

    const columns = [
        { header: "Name", accessor: "name" },
        { header: "Email", accessor: "email" },
        { 
            header: "Role", 
            accessor: "role",
            render: (row) => (
                <span className="badge badge-purple">{row.role}</span>
            )
        },
        { header: "State", accessor: "state" },
        { header: "District", accessor: "district" },
        {
            header: "Permissions",
            accessor: "Permissions",
            render: (row) => (
                <div className="flex flex-wrap gap-1">
                    {row.Permissions?.length ? 
                        row.Permissions.slice(0, 2).map((p, i) => (
                            <span key={i} className="badge badge-info text-xs">{p}</span>
                        ))
                    : <span className="text-gray-400">—</span>}
                    {row.Permissions?.length > 2 && (
                        <span className="badge badge-gray text-xs">+{row.Permissions.length - 2}</span>
                    )}
                </div>
            )
        },
        {
            header: "Actions",
            accessor: "actions",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setEditAdmin(row)} 
                        className="action-btn action-btn-edit"
                        title="Edit"
                    >
                        <Pencil size={18} />
                    </button>
                    <button 
                        onClick={() => handleDelete(row)} 
                        className="action-btn action-btn-delete"
                        title="Delete"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )
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
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Manage Admins</h1>
                    <p className="text-gray-500 text-sm mt-1">Add and manage district administrators</p>
                </div>
                <button className="btn btn-primary" onClick={() => setAddAdmin(true)}>
                    <Plus size={18} className="mr-2" /> Add Admin
                </button>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="filter-bar">
                    <select
                        className="form-select w-48"
                        value={filterType}
                        onChange={(e) => handleAdminTypeFilter(e.target.value)}
                    >
                        <option value="all">All Admins</option>
                        <option value="district">District Admins</option>
                    </select>

                    <select
                        className="form-select w-56"
                        value={filterState}
                        onChange={(e) => handleStateFilter(e.target.value)}
                    >
                        <option value="">All States</option>
                        {states.map((s) => (
                            <option key={s["State Code"]} value={s["State Name"]}>
                                {s["State Name"]}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <Table columns={columns} data={admins} />

            {/* Add Admin Modal */}
            {addAdmin && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Add New District Admin</h3>
                            <button onClick={() => setAddAdmin(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div>
                                <label className="form-label">Name</label>
                                <input 
                                    className="form-input" 
                                    placeholder="Enter name"
                                    value={newAdminData.name}
                                    onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="form-label">Email</label>
                                <input 
                                    className="form-input" 
                                    placeholder="Enter email"
                                    type="email"
                                    value={newAdminData.email}
                                    onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="form-label">Password</label>
                                <input 
                                    className="form-input" 
                                    type="password" 
                                    placeholder="Enter password"
                                    value={newAdminData.password}
                                    onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="form-label">Mobile</label>
                                <input 
                                    className="form-input" 
                                    placeholder="Enter mobile number"
                                    value={newAdminData.mobile}
                                    onChange={(e) => setNewAdminData({ ...newAdminData, mobile: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="form-label">Permissions</label>
                                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                                    {fixedPermissions.map((perm, index) => (
                                        <label key={index} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                checked={newAdminData.Permissions.includes(perm)}
                                                onChange={(e) => {
                                                    const updated = e.target.checked
                                                        ? [...newAdminData.Permissions, perm]
                                                        : newAdminData.Permissions.filter(p => p !== perm);
                                                    setNewAdminData({ ...newAdminData, Permissions: updated });
                                                }}
                                            />
                                            <span className="text-sm text-gray-700 capitalize">{perm}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="form-label">State</label>
                                <select
                                    className="form-select"
                                    value={newAdminData.state}
                                    onChange={(e) => {
                                        const selectedName = e.target.value;
                                        const stateObj = states.find(s => s["State Name"] === selectedName);
                                        setNewAdminData({ ...newAdminData, state: selectedName, district: "" });
                                        if (stateObj && stateObj["State Code"]) fetchDistricts(stateObj["State Code"]);
                                    }}
                                >
                                    <option value="">Select State</option>
                                    {states.map((s) => (
                                        <option key={s["State Code"]} value={s["State Name"]}>
                                            {s["State Name"]}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="form-label">District</label>
                                <select
                                    className="form-select"
                                    value={newAdminData.district}
                                    onChange={(e) =>
                                        setNewAdminData({ ...newAdminData, district: e.target.value })
                                    }
                                >
                                    <option value="">Select District</option>
                                    {districts.map((d) => (
                                        <option key={d["District Code"]} value={d["District Name"]}>
                                            {d["District Name"]}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setAddAdmin(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleCreate}>
                                Create Admin
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Admin Modal */}
            {editAdmin && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Edit Admin</h3>
                            <button onClick={() => setEditAdmin(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div>
                                <label className="form-label">Name</label>
                                <input
                                    className="form-input"
                                    value={editAdmin.name}
                                    onChange={(e) =>
                                        setEditAdmin({ ...editAdmin, name: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="form-label">Email</label>
                                <input
                                    className="form-input"
                                    value={editAdmin.email}
                                    onChange={(e) =>
                                        setEditAdmin({ ...editAdmin, email: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="form-label">Permissions</label>
                                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                                    {fixedPermissions.map((perm, index) => (
                                        <label key={index} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                checked={editAdmin.Permissions?.includes(perm)}
                                                onChange={(e) => {
                                                    const updated = e.target.checked
                                                        ? [...(editAdmin.Permissions || []), perm]
                                                        : editAdmin.Permissions.filter(p => p !== perm);
                                                    setEditAdmin({ ...editAdmin, Permissions: updated });
                                                }}
                                            />
                                            <span className="text-sm text-gray-700 capitalize">{perm}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setEditAdmin(null)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleUpdate}>
                                Update Admin
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admins;
